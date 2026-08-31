import { createHash, randomUUID } from 'node:crypto'

const hash = value => createHash('sha256').update(`${process.env.CRUISECONNECT_EDGE_HASH_SALT || 'synthetic-edge-salt-change-me'}:${value}`).digest('hex')
const addMinutes = (date, minutes) => new Date(date.getTime() + minutes * 60_000).toISOString()
const addDays = (date, days) => new Date(date.getTime() + days * 86_400_000).toISOString()

export class OperatorEdgeService {
  constructor(database, adapter) { this.database = database; this.adapter = adapter; this.metrics = new Map() }

  increment(name) { this.metrics.set(name, (this.metrics.get(name) || 0) + 1) }
  sailingDay(timeZone, date = new Date()) {
    const parts = new Intl.DateTimeFormat('en', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date)
    const value = Object.fromEntries(parts.map(part => [part.type, part.value]))
    return `${value.year}-${value.month}-${value.day}`
  }

  receiver(token, claims) {
    const row = this.database.db.prepare('select * from receiver_tokens where token=?').get(token)
    if (!row || row.sailing_ref !== claims.sailingRef || row.age_band !== 'adult' || new Date(row.expires_at) <= new Date()) throw new EdgeError('receiver_unavailable', 422)
    if (row.guest_ref === claims.guestRef) throw new EdgeError('self_interaction_disallowed', 422)
    if (row.household_ref && claims.householdRef && row.household_ref === claims.householdRef) throw new EdgeError('household_excluded', 422)
    const blocked = this.database.db.prepare('select 1 from passenger_blocks where sailing_ref=? and ((blocker_ref=? and blocked_ref=?) or (blocker_ref=? and blocked_ref=?))')
      .get(claims.sailingRef, claims.guestRef, row.guest_ref, row.guest_ref, claims.guestRef)
    if (blocked) throw new EdgeError('interaction_unavailable', 422)
    return row
  }

  counter(claims, day) {
    const guestHash = hash(`${claims.sailingRef}:${claims.guestRef}`)
    this.database.db.prepare('insert or ignore into daily_counters(sailing_ref,sailing_day,guest_hash) values(?,?,?)').run(claims.sailingRef, day, guestHash)
    return { guestHash, row: this.database.db.prepare('select * from daily_counters where sailing_ref=? and sailing_day=? and guest_hash=?').get(claims.sailingRef, day, guestHash) }
  }

  handleAction(claims, envelope) {
    this.validateEnvelope(claims, envelope)
    const prior = this.database.db.prepare('select status,response_json from idempotency where key=?').get(envelope.idempotencyKey)
    if (prior) return { status: prior.status, body: { ...JSON.parse(prior.response_json), duplicate: true } }
    const config = this.database.config(), now = new Date(), day = this.sailingDay(config.sailingTimezone, now)
    const { guestHash, row: counter } = this.counter(claims, day)
    let result
    this.database.db.exec('begin immediate')
    try {
      switch (envelope.action.type) {
        case 'vibe.sent': result = this.sendVibe(claims, envelope.action, counter, config, guestHash, now); break
        case 'vconnect.requested': result = this.requestVConnect(claims, envelope.action, counter, config, guestHash, now); break
        case 'vconnect.responded': result = this.respondVConnect(claims, envelope.action, guestHash, now); break
        case 'vconnect.plan.proposed': result = this.proposePlan(claims, envelope.action, config, guestHash, now); break
        default: result = this.recordGenericAction(claims, envelope.action, guestHash, now)
      }
      this.database.db.prepare('insert into idempotency(key,status,response_json,created_at) values(?,?,?,?)').run(envelope.idempotencyKey, result.status, JSON.stringify(result.body), now.toISOString())
      this.database.db.exec('commit')
    } catch (error) { this.database.db.exec('rollback'); throw error }
    return result
  }

  validateEnvelope(claims, envelope) {
    if (!envelope || envelope.schemaVersion !== 1 || typeof envelope.idempotencyKey !== 'string' || envelope.idempotencyKey.length < 8 || !envelope.action?.type) throw new EdgeError('invalid_action_envelope', 400)
    if (envelope.sailingRef !== claims.sailingRef || envelope.guestRef !== claims.guestRef) throw new EdgeError('session_scope_mismatch', 403)
    if (new Date(envelope.expiresAt) <= new Date()) throw new EdgeError('action_expired', 410)
  }

  sendVibe(claims, action, counter, config, guestHash, now) {
    if (claims.ageBand !== 'adult') throw new EdgeError('minors_excluded', 403)
    if (counter.vibe_count >= config.maximumVibesPerDay) throw new EdgeError('daily_vibe_limit', 429)
    const receiver = this.receiver(action.receiverToken, claims)
    if (!['made-my-day','great-energy','kind','made-us-laugh','cruise-spirit'].includes(action.vibeId)) throw new EdgeError('invalid_vibe_option', 422)
    this.database.db.prepare('update daily_counters set vibe_count=vibe_count+1 where sailing_ref=? and sailing_day=? and guest_hash=?').run(claims.sailingRef, this.sailingDay(config.sailingTimezone, now), guestHash)
    this.database.db.prepare('insert into vibes(id,sailing_ref,receiver_ref,vibe_option_id,deliver_after,created_at) values(?,?,?,?,?,?)')
      .run(randomUUID(), claims.sailingRef, receiver.guest_ref, action.vibeId, addMinutes(now, config.vibeDelayMinutes), now.toISOString())
    this.recordAction(claims, guestHash, 'vibe.sent', now)
    this.database.audit('vibe.sent', 'accepted', guestHash, { sailingRef: claims.sailingRef })
    this.increment('vibes_accepted_total')
    return { status: 202, body: { accepted: true } }
  }

  requestVConnect(claims, action, counter, config, guestHash, now) {
    if (claims.ageBand !== 'adult') throw new EdgeError('minors_excluded', 403)
    if (counter.vconnect_count >= config.maximumVConnectRequestsPerDay) throw new EdgeError('daily_vconnect_limit', 429)
    if (!config.requestOptions.includes(action.requestOptionId)) throw new EdgeError('invalid_request_option', 422)
    const receiver = this.receiver(action.receiverToken, claims)
    const id = randomUUID(), requestToken = randomUUID()
    this.database.db.prepare('update daily_counters set vconnect_count=vconnect_count+1 where sailing_ref=? and sailing_day=? and guest_hash=?').run(claims.sailingRef, this.sailingDay(config.sailingTimezone, now), guestHash)
    this.database.db.prepare('insert into vconnect_requests(id,request_token,sailing_ref,requester_ref,requester_display_name,recipient_ref,request_option_id,status,created_at,expires_at) values(?,?,?,?,?,?,?,?,?,?)')
      .run(id, requestToken, claims.sailingRef, claims.guestRef, claims.displayName || 'Passenger', receiver.guest_ref, action.requestOptionId, 'pending', now.toISOString(), addDays(now, 1))
    this.recordAction(claims, guestHash, 'vconnect.requested', now)
    this.database.audit('vconnect.requested', 'accepted', guestHash, { sailingRef: claims.sailingRef })
    this.increment('vconnect_requests_total')
    return { status: 202, body: { accepted: true, requestId: id } }
  }

  respondVConnect(claims, action, guestHash, now) {
    if (!['accepted','declined','blocked','reported'].includes(action.response)) throw new EdgeError('invalid_vconnect_response', 422)
    const request = this.database.db.prepare('select * from vconnect_requests where request_token=?').get(action.requestToken)
    if (!request || request.sailing_ref !== claims.sailingRef || request.recipient_ref !== claims.guestRef || request.status !== 'pending') throw new EdgeError('request_unavailable', 404)
    const connectionToken = action.response === 'accepted' ? randomUUID() : null
    this.database.db.prepare('update vconnect_requests set status=?,connection_token=?,responded_at=? where id=?').run(action.response, connectionToken, now.toISOString(), request.id)
    if (['blocked','reported'].includes(action.response)) this.database.db.prepare('insert or ignore into passenger_blocks(sailing_ref,blocker_ref,blocked_ref,created_at) values(?,?,?,?)').run(claims.sailingRef, claims.guestRef, request.requester_ref, now.toISOString())
    this.recordAction(claims, guestHash, 'vconnect.responded', now)
    this.database.audit('vconnect.responded', action.response, guestHash, { sailingRef: claims.sailingRef })
    this.increment(`vconnect_${action.response}_total`)
    return { status: 202, body: { accepted: true, response: action.response } }
  }

  proposePlan(claims, action, config, guestHash, now) {
    if (!config.venueOptions.includes(action.venueOptionId) || !config.timeOptions.includes(action.timeOptionId)) throw new EdgeError('invalid_plan_option', 422)
    const request = this.database.db.prepare("select * from vconnect_requests where connection_token=? and status='accepted'").get(action.connectionToken)
    if (!request || request.sailing_ref !== claims.sailingRef || ![request.requester_ref, request.recipient_ref].includes(claims.guestRef)) throw new EdgeError('connection_unavailable', 404)
    const id = randomUUID()
    this.database.db.prepare('insert into vconnect_plans(id,connection_token,proposer_ref,venue_option_id,time_option_id,created_at) values(?,?,?,?,?,?)').run(id, action.connectionToken, claims.guestRef, action.venueOptionId, action.timeOptionId, now.toISOString())
    this.recordAction(claims, guestHash, 'vconnect.plan.proposed', now)
    this.database.audit('vconnect.plan.proposed', 'accepted', guestHash, { sailingRef: claims.sailingRef })
    return { status: 202, body: { accepted: true, planId: id } }
  }

  recordGenericAction(claims, action, guestHash, now) {
    const allowed = new Set(['interests.updated','meetup.joined','meetup.left','crew.recognized','event.feedback','notification.preference','purchase.outcome'])
    if (!allowed.has(action.type)) throw new EdgeError('unsupported_action', 422)
    this.recordAction(claims, guestHash, action.type, now)
    this.database.audit(action.type, 'accepted', guestHash, { sailingRef: claims.sailingRef })
    this.increment('generic_actions_total')
    return { status: 202, body: { accepted: true } }
  }

  recordAction(claims, guestHash, type, now) {
    this.database.db.prepare('insert into action_log(id,sailing_ref,guest_hash,action_type,created_at) values(?,?,?,?,?)').run(randomUUID(), claims.sailingRef, guestHash, type, now.toISOString())
  }

  inbox(claims) {
    if (claims.ageBand !== 'adult') return []
    return this.database.db.prepare("select request_token as requestToken,requester_display_name as requesterDisplayName,request_option_id as requestOptionId,created_at as createdAt,expires_at as expiresAt from vconnect_requests where sailing_ref=? and recipient_ref=? and status='pending' and expires_at>? order by created_at desc")
      .all(claims.sailingRef, claims.guestRef, new Date().toISOString())
  }

  acceptedUpdates(claims) {
    return this.database.db.prepare("select id as requestId,connection_token as connectionToken,request_option_id as requestOptionId,responded_at as acceptedAt from vconnect_requests where sailing_ref=? and requester_ref=? and status='accepted' order by responded_at desc")
      .all(claims.sailingRef, claims.guestRef)
  }

  cleanup() {
    const config = this.database.config(), now = new Date(), vibeCutoff = addDays(now, -config.vibeRetentionDays), connectionCutoff = addDays(now, -config.vconnectRetentionDays)
    const vibes = this.database.db.prepare('delete from vibes where created_at<?').run(vibeCutoff).changes
    const connections = this.database.db.prepare("delete from vconnect_requests where created_at<? and status!='pending'").run(connectionCutoff).changes
    const expired = this.database.db.prepare("update vconnect_requests set status='expired',responded_at=? where status='pending' and expires_at<?").run(now.toISOString(), now.toISOString()).changes
    this.database.audit('retention.cleanup', 'complete', null, { vibes, connections, expired })
    return { vibes, connections, expired }
  }

  metricsText() {
    return ['# HELP cruiseconnect_edge_events_total Operator-edge events by type.', '# TYPE cruiseconnect_edge_events_total counter', ...[...this.metrics].map(([name,value]) => `cruiseconnect_edge_events_total{event="${name}"} ${value}`)].join('\n') + '\n'
  }
}

export class EdgeError extends Error {
  constructor(code, status = 400) { super(code); this.code = code; this.status = status }
}
