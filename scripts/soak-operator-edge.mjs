import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { EdgeDatabase } from '../packages/operator-edge/src/database.mjs'
import { OperatorEdgeService } from '../packages/operator-edge/src/service.mjs'
import { SyntheticCruiseAdapter } from '../packages/operator-edge/src/synthetic-adapter.mjs'

const actionCount = Number(process.env.CRUISECONNECT_SOAK_ACTIONS || 50_000)
const database = new EdgeDatabase(':memory:'), service = new OperatorEdgeService(database, new SyntheticCruiseAdapter(database))
const started = performance.now(), latencies = []
for (let index = 0; index < actionCount; index++) {
  const before = performance.now(), guestRef = `soak-${index % 500}`
  const result = service.handleAction({ tenantRef:'soak', sailingRef:'SOAK-1', shipRef:'SHIP-1', guestRef, householdRef:`h-${index % 500}`, ageBand:'adult', role:'passenger' }, {
    schemaVersion:1, idempotencyKey:randomUUID(), createdAt:new Date().toISOString(), expiresAt:new Date(Date.now()+3600000).toISOString(), sailingRef:'SOAK-1', guestRef,
    action:{ type:'event.feedback', eventId:`event-${index % 12}`, responseIds:['positive'], score:(index % 5)+1 },
  })
  assert.equal(result.status, 202); latencies.push(performance.now()-before)
}
latencies.sort((a,b)=>a-b)
const elapsed = performance.now()-started, p95 = latencies[Math.floor(latencies.length*.95)]
assert.ok(p95 < 50, `p95 action latency exceeded 50ms: ${p95.toFixed(2)}ms`)
assert.equal(database.db.prepare('pragma integrity_check').get().integrity_check, 'ok')
database.close()
console.log(JSON.stringify({ status:'passed', actions:actionCount, elapsedMs:Math.round(elapsed), actionsPerSecond:Math.round(actionCount/(elapsed/1000)), p95Ms:Number(p95.toFixed(2)) }))
