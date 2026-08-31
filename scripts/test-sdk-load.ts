import assert from 'node:assert/strict'
import { CruiseConnectClient, MemoryQueueStore } from '../packages/sdk/src/index.ts'
import { ReferenceCruiseHost } from '../packages/reference-host/src/index.ts'

const host=new ReferenceCruiseHost(),sdk=new CruiseConnectClient(host,new MemoryQueueStore(),2500)
const loadBudgetMs=Number(process.env.CRUISECONNECT_LOAD_BUDGET_MS||30000)
await sdk.initialize();host.setOffline(true)
const started=performance.now()
for(let i=0;i<1000;i++)await sdk.updateInterests([`interest-${i%12}`])
assert.equal(await sdk.queued(),1000)
host.setOffline(false);const result=await sdk.flush()
assert.deepEqual(result,{sent:1000,remaining:0});assert.equal(host.actions.length,1000)
const elapsed=Math.round(performance.now()-started)
assert.ok(elapsed<loadBudgetMs,`reference load run exceeded ${loadBudgetMs}ms: ${elapsed}ms`)
console.log(`CruiseConnect offline/load contract passed: 1,000 actions in ${elapsed}ms.`)

const loadHost=new ReferenceCruiseHost(),loadSession=await loadHost.getSession(),concurrentStarted=performance.now()
const clients=100,actionsPerClient=200
await Promise.all(Array.from({length:clients},(_,client)=>Array.from({length:actionsPerClient},(_,sequence)=>loadHost.submitAction(loadSession,{
  schemaVersion:1,idempotencyKey:`client-${client.toString().padStart(3,'0')}-${sequence.toString().padStart(4,'0')}`,
  createdAt:new Date().toISOString(),expiresAt:new Date(Date.now()+3600000).toISOString(),sailingRef:loadSession.sailingRef,guestRef:`load-guest-${client}`,
  action:{type:'event.feedback',feedback:{eventId:'load-event',score:5,responseIds:['positive']}}
}))).flat())
const concurrentElapsed=Math.round(performance.now()-concurrentStarted)
assert.equal(loadHost.actions.length,clients*actionsPerClient)
assert.ok(concurrentElapsed<loadBudgetMs,`multi-client load run exceeded ${loadBudgetMs}ms: ${concurrentElapsed}ms`)
console.log(`CruiseConnect multi-client contract passed: ${clients*actionsPerClient} actions in ${concurrentElapsed}ms.`)
