import { createServer } from 'node:http'
import { randomUUID } from 'node:crypto'
import { URL } from 'node:url'
import { bearerToken, verifySailingToken, EdgeAuthError } from './auth.mjs'
import { EdgeDatabase } from './database.mjs'
import { SyntheticCruiseAdapter } from './synthetic-adapter.mjs'
import { OperatorEdgeService, EdgeError } from './service.mjs'

const json = (response, status, body) => {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' })
  response.end(JSON.stringify(body))
}

const readBody = async (request, limit = 1_000_000) => {
  const chunks = []; let size = 0
  for await (const chunk of request) { size += chunk.length; if (size > limit) throw new EdgeError('payload_too_large', 413); chunks.push(chunk) }
  return Buffer.concat(chunks)
}

const readJson = async request => {
  const bytes = await readBody(request, 128_000)
  try { return bytes.length ? JSON.parse(bytes.toString('utf8')) : {} } catch { throw new EdgeError('invalid_json', 400) }
}

const validateConfigPatch = patch => {
  if (!patch || typeof patch !== 'object' || Array.isArray(patch)) throw new EdgeError('invalid_config', 400)
  if (patch.maximumVibesPerDay !== undefined && (!Number.isInteger(patch.maximumVibesPerDay) || patch.maximumVibesPerDay < 1 || patch.maximumVibesPerDay > 5)) throw new EdgeError('invalid_vibe_limit', 422)
  if (patch.maximumVConnectRequestsPerDay !== undefined && patch.maximumVConnectRequestsPerDay !== 1) throw new EdgeError('invalid_vconnect_limit', 422)
  for (const key of ['requestOptions','venueOptions','timeOptions']) if (patch[key] !== undefined) {
    if (!Array.isArray(patch[key]) || !patch[key].length || patch[key].length > 30 || patch[key].some(value => typeof value !== 'string' || !/^[a-z0-9-]{2,60}$/.test(value))) throw new EdgeError(`invalid_${key}`, 422)
    if (patch[key].some(value => /cabin|stateroom|room-number|dating|hookup|private-room/.test(value))) throw new EdgeError(`prohibited_${key}`, 422)
  }
  for (const key of ['vibeDelayMinutes','vibeRetentionDays','vconnectRetentionDays']) if (patch[key] !== undefined && (!Number.isInteger(patch[key]) || patch[key] < 0 || patch[key] > 365)) throw new EdgeError(`invalid_${key}`, 422)
  return patch
}

export function createOperatorEdge(options = {}) {
  const database = options.database || new EdgeDatabase(options.databasePath || ':memory:')
  const adapter = options.adapter || new SyntheticCruiseAdapter(database)
  const service = options.service || new OperatorEdgeService(database, adapter)
  const jwtSecret = options.jwtSecret || process.env.CRUISECONNECT_EDGE_JWT_SECRET || 'development-secret-must-be-at-least-32-characters'
  const allowedOrigins = new Set((options.allowedOrigins || process.env.CRUISECONNECT_EDGE_ALLOWED_ORIGINS || 'https://regreenity.com').split(',').map(value => value.trim()).filter(Boolean))

  const server = createServer(async (request, response) => {
    const requestId = request.headers['x-request-id'] || randomUUID()
    response.setHeader('X-Request-Id', requestId)
    response.setHeader('X-Content-Type-Options', 'nosniff')
    response.setHeader('Referrer-Policy', 'no-referrer')
    response.setHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'")
    const origin = request.headers.origin
    if (origin && allowedOrigins.has(origin)) { response.setHeader('Access-Control-Allow-Origin', origin); response.setHeader('Vary', 'Origin') }
    if (request.method === 'OPTIONS') {
      if (origin && !allowedOrigins.has(origin)) return json(response, 403, { error: 'origin_not_allowed', requestId })
      response.writeHead(204, { 'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS', 'Access-Control-Allow-Headers': 'Authorization,Content-Type,Idempotency-Key,X-Request-Id', 'Access-Control-Max-Age': '600' }); return response.end()
    }
    try {
      const url = new URL(request.url || '/', 'http://edge.local'), path = url.pathname
      if (path === '/health' && request.method === 'GET') return json(response, 200, { status: 'ok', version: '1.1.1' })
      if (path === '/ready' && request.method === 'GET') { database.db.prepare('select 1').get(); return json(response, 200, { status: 'ready' }) }
      if (path === '/metrics' && request.method === 'GET') { response.writeHead(200, { 'Content-Type': 'text/plain; version=0.0.4', 'Cache-Control': 'no-store' }); return response.end(service.metricsText()) }

      const adminRoute = path.startsWith('/v1/admin/')
      const claims = verifySailingToken(bearerToken(request.headers), jwtSecret, adminRoute ? 'operator_admin' : null)
      if (path === '/v1/session' && request.method === 'GET') return json(response, 200, adapter.session(claims))
      const events = path.match(/^\/v1\/sailings\/([^/]+)\/events$/)
      if (events && request.method === 'GET') { if (decodeURIComponent(events[1]) !== claims.sailingRef) throw new EdgeError('session_scope_mismatch', 403); return json(response, 200, adapter.events(claims.sailingRef)) }
      const meetups = path.match(/^\/v1\/sailings\/([^/]+)\/meetups$/)
      if (meetups && request.method === 'GET') { if (decodeURIComponent(meetups[1]) !== claims.sailingRef) throw new EdgeError('session_scope_mismatch', 403); return json(response, 200, adapter.meetups(claims.sailingRef)) }
      if (path === '/v1/recognition/passenger-match' && request.method === 'POST') { const bytes = await readBody(request, 2_000_000); try { return json(response, 200, adapter.matchPassenger(claims, bytes)) } finally { bytes.fill(0) } }
      if (path === '/v1/recognition/crew-match' && request.method === 'POST') { const bytes = await readBody(request, 2_000_000); try { return json(response, 200, adapter.matchCrew(claims, bytes)) } finally { bytes.fill(0) } }
      if (path === '/v1/actions' && request.method === 'POST') { const result = service.handleAction(claims, await readJson(request)); return json(response, result.status, result.body) }
      if (path === '/v1/vconnect/inbox' && request.method === 'GET') return json(response, 200, service.inbox(claims))
      if (path === '/v1/vconnect/updates' && request.method === 'GET') return json(response, 200, service.acceptedUpdates(claims))
      if (path === '/v1/notifications' && request.method === 'POST') {
        const input = await readJson(request); if (!input.id || !input.title || !input.body || !Number.isFinite(Date.parse(input.deliverAt))) throw new EdgeError('invalid_notification', 422)
        database.db.prepare('insert into notifications(id,sailing_ref,guest_ref,title,body,deliver_at,created_at) values(?,?,?,?,?,?,?)').run(input.id, claims.sailingRef, claims.guestRef, input.title.slice(0,120), input.body.slice(0,300), input.deliverAt, new Date().toISOString()); return json(response, 204, {})
      }
      if (path === '/v1/purchase-intents' && request.method === 'POST') {
        const input = await readJson(request); if (!input.attributionRef || !input.productId || !input.category) throw new EdgeError('invalid_purchase_intent', 422)
        database.db.prepare('insert into purchase_intents(attribution_ref,sailing_ref,guest_ref,product_id,category,created_at) values(?,?,?,?,?,?)').run(input.attributionRef, claims.sailingRef, claims.guestRef, input.productId, input.category, new Date().toISOString()); return json(response, 204, {})
      }
      if (path === '/v1/admin/config' && request.method === 'GET') return json(response, 200, database.config())
      if (path === '/v1/admin/config' && request.method === 'PUT') { const config = database.updateConfig(validateConfigPatch(await readJson(request))); database.audit('config.updated','accepted',null,{keys:Object.keys(config)}); return json(response, 200, config) }
      if (path === '/v1/admin/audit' && request.method === 'GET') return json(response, 200, database.db.prepare('select id,created_at as createdAt,action,outcome,metadata_json as metadata from audit_log order by id desc limit 200').all().map(row => ({ ...row, metadata: JSON.parse(row.metadata), actorHash: undefined })))
      if (path === '/v1/admin/blocks' && request.method === 'GET') return json(response, 200, database.db.prepare('select sailing_ref as sailingRef,blocker_ref as blockerRef,blocked_ref as blockedRef,created_at as createdAt from passenger_blocks order by created_at desc limit 200').all())
      if (path === '/v1/admin/cleanup' && request.method === 'POST') return json(response, 200, service.cleanup())
      throw new EdgeError('not_found', 404)
    } catch (error) {
      const known = error instanceof EdgeError || error instanceof EdgeAuthError
      const status = known ? error.status : 500, code = known ? error.code : 'internal_error'
      if (!known) console.error(JSON.stringify({ level: 'error', requestId, code, message: error?.message }))
      service.increment(`http_${status}_total`)
      return json(response, status, { error: code, requestId })
    }
  })
  return { server, database, adapter, service, close: () => new Promise(resolve => server.close(() => { database.close(); resolve() })) }
}
