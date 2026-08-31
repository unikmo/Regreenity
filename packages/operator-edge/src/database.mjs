import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { DatabaseSync } from 'node:sqlite'

const DEFAULT_CONFIG = {
  sailingTimezone: 'Europe/Rome',
  maximumVibesPerDay: 5,
  maximumVConnectRequestsPerDay: 1,
  vibeDelayMinutes: 60,
  vibeRetentionDays: 14,
  vconnectRetentionDays: 30,
  requestOptions: ['coffee-in-atrium', 'join-trivia', 'before-show'],
  venueOptions: ['atrium-cafe', 'trivia-lounge', 'theatre-entrance', 'promenade'],
  timeOptions: ['today-afternoon', 'today-evening', 'tomorrow-morning', 'tomorrow-afternoon'],
}

export class EdgeDatabase {
  constructor(path = process.env.CRUISECONNECT_EDGE_DB || './data/cruiseconnect-edge.sqlite') {
    if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true })
    this.db = new DatabaseSync(path)
    this.db.exec('PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;')
    this.migrate()
    this.seed()
  }

  migrate() {
    this.db.exec(`
      create table if not exists edge_config (key text primary key, value_json text not null, updated_at text not null);
      create table if not exists receiver_tokens (
        token text primary key, sailing_ref text not null, guest_ref text not null, household_ref text,
        age_band text not null check(age_band in ('adult','minor')), display_name text not null,
        expires_at text not null
      );
      create table if not exists idempotency (
        key text primary key, status integer not null, response_json text not null, created_at text not null
      );
      create table if not exists daily_counters (
        sailing_ref text not null, sailing_day text not null, guest_hash text not null,
        vibe_count integer not null default 0, vconnect_count integer not null default 0,
        primary key(sailing_ref,sailing_day,guest_hash)
      );
      create table if not exists vibes (
        id text primary key, sailing_ref text not null, receiver_ref text not null, vibe_option_id text not null,
        deliver_after text not null, status text not null default 'queued', created_at text not null
      );
      create table if not exists vconnect_requests (
        id text primary key, request_token text not null unique, connection_token text unique,
        sailing_ref text not null, requester_ref text not null, requester_display_name text not null, recipient_ref text not null,
        request_option_id text not null, status text not null check(status in ('pending','accepted','declined','blocked','reported','expired')),
        created_at text not null, responded_at text, expires_at text not null
      );
      create table if not exists vconnect_plans (
        id text primary key, connection_token text not null, proposer_ref text not null,
        venue_option_id text not null, time_option_id text not null,
        status text not null default 'pending' check(status in ('pending','confirmed','declined','cancelled')),
        created_at text not null
      );
      create table if not exists passenger_blocks (
        sailing_ref text not null, blocker_ref text not null, blocked_ref text not null,
        created_at text not null, primary key(sailing_ref,blocker_ref,blocked_ref)
      );
      create table if not exists notifications (
        id text primary key, sailing_ref text not null, guest_ref text not null, title text not null,
        body text not null, deliver_at text not null, status text not null default 'scheduled', created_at text not null
      );
      create table if not exists purchase_intents (
        attribution_ref text primary key, sailing_ref text not null, guest_ref text not null,
        product_id text not null, category text not null, status text not null default 'opened', created_at text not null
      );
      create table if not exists action_log (
        id text primary key, sailing_ref text not null, guest_hash text not null,
        action_type text not null, created_at text not null
      );
      create table if not exists audit_log (
        id integer primary key autoincrement, created_at text not null, actor_hash text,
        action text not null, outcome text not null, metadata_json text not null default '{}'
      );
      create index if not exists vibes_delivery_idx on vibes(status,deliver_after);
      create index if not exists vconnect_recipient_idx on vconnect_requests(sailing_ref,recipient_ref,status);
      create index if not exists vconnect_requester_idx on vconnect_requests(sailing_ref,requester_ref,status);
      create index if not exists audit_created_idx on audit_log(created_at desc);
    `)
  }

  seed() {
    const now = new Date().toISOString()
    const insertConfig = this.db.prepare('insert or ignore into edge_config(key,value_json,updated_at) values(?,?,?)')
    for (const [key, value] of Object.entries(DEFAULT_CONFIG)) insertConfig.run(key, JSON.stringify(value), now)
    const insertReceiver = this.db.prepare('insert or ignore into receiver_tokens(token,sailing_ref,guest_ref,household_ref,age_band,display_name,expires_at) values(?,?,?,?,?,?,?)')
    const expiry = '2099-01-01T00:00:00.000Z'
    insertReceiver.run('adult-same-sailing-token', 'OC-2026-104', 'G-208', 'H-302', 'adult', 'Daniel', expiry)
    insertReceiver.run('adult-second-token', 'OC-2026-104', 'G-311', 'H-410', 'adult', 'Sofia', expiry)
    insertReceiver.run('same-household', 'OC-2026-104', 'G-1043', 'H-301', 'adult', 'Alex', expiry)
    insertReceiver.run('minor-token', 'OC-2026-104', 'G-512', 'H-512', 'minor', 'Unavailable', expiry)
  }

  config() {
    const rows = this.db.prepare('select key,value_json from edge_config').all()
    return Object.fromEntries(rows.map(row => [row.key, JSON.parse(row.value_json)]))
  }

  updateConfig(patch) {
    const allowed = new Set(Object.keys(DEFAULT_CONFIG))
    const statement = this.db.prepare('insert into edge_config(key,value_json,updated_at) values(?,?,?) on conflict(key) do update set value_json=excluded.value_json,updated_at=excluded.updated_at')
    const now = new Date().toISOString()
    this.db.exec('begin immediate')
    try {
      for (const [key, value] of Object.entries(patch)) {
        if (!allowed.has(key)) throw new Error(`unknown_config:${key}`)
        statement.run(key, JSON.stringify(value), now)
      }
      this.db.exec('commit')
    } catch (error) { this.db.exec('rollback'); throw error }
    return this.config()
  }

  audit(action, outcome, actorHash = null, metadata = {}) {
    this.db.prepare('insert into audit_log(created_at,actor_hash,action,outcome,metadata_json) values(?,?,?,?,?)')
      .run(new Date().toISOString(), actorHash, action, outcome, JSON.stringify(metadata))
  }

  close() { this.db.close() }
}

export { DEFAULT_CONFIG }
