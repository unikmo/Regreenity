import assert from 'node:assert/strict'
import { CruiseConnectClient, MemoryQueueStore } from '../packages/sdk/src/index.ts'
import { ReferenceCruiseHost } from '../packages/reference-host/src/index.ts'

const host=new ReferenceCruiseHost(),sdk=new CruiseConnectClient(host,new MemoryQueueStore(),2500)
await sdk.initialize();host.setOffline(true)
const started=performance.now()
for(let i=0;i<1000;i++)await sdk.updateInterests([`interest-${i%12}`])
assert.equal(await sdk.queued(),1000)
host.setOffline(false);const result=await sdk.flush()
assert.deepEqual(result,{sent:1000,remaining:0});assert.equal(host.actions.length,1000)
const elapsed=Math.round(performance.now()-started)
assert.ok(elapsed<15000,`reference load run exceeded 15s: ${elapsed}ms`)
console.log(`CruiseConnect offline/load contract passed: 1,000 actions in ${elapsed}ms.`)
