import assert from 'node:assert/strict'
import { CruiseConnectClient, EncryptedQueueStore, HttpHostAdapter, MemoryQueueStore, importQueueEncryptionKey } from '../packages/sdk/src/index.ts'
import { ReferenceCruiseHost } from '../packages/reference-host/src/index.ts'

const host=new ReferenceCruiseHost(), store=new MemoryQueueStore(), sdk=new CruiseConnectClient(host,store,3)
await sdk.initialize();host.setOffline(true)
await sdk.updateInterests(['one']);await sdk.updateInterests(['two']);await sdk.updateInterests(['three'])
await assert.rejects(()=>sdk.updateInterests(['four']),error=>(error as {code?:string}).code==='queue_full')
host.setOffline(false);assert.deepEqual(await sdk.flush(),{sent:3,remaining:0})

let captured:{url?:string;authorization?:string;idempotency?:string}={}
const originalFetch=globalThis.fetch
globalThis.fetch=async(input,init)=>{captured={url:String(input),authorization:new Headers(init?.headers).get('Authorization')||'',idempotency:new Headers(init?.headers).get('Idempotency-Key')||''};return new Response(JSON.stringify({accepted:true}),{status:200,headers:{'Content-Type':'application/json'}})}
const adapter=new HttpHostAdapter({baseUrl:'https://operator.example/v1/',tokenProvider:async()=> 'short-lived-token'})
await adapter.submitAction(await host.getSession(),{schemaVersion:1,idempotencyKey:'5d33eb22-525d-46e0-a741-a65f22356ac8',createdAt:new Date().toISOString(),expiresAt:new Date(Date.now()+10000).toISOString(),sailingRef:'OC-2026-104',guestRef:'G-1042',action:{type:'interests.updated',interests:['wine']}})
assert.equal(captured.url,'https://operator.example/v1/actions');assert.equal(captured.authorization,'Bearer short-lived-token');assert.equal(captured.idempotency,'5d33eb22-525d-46e0-a741-a65f22356ac8')
globalThis.fetch=originalFetch

let encryptedValue:string|null=null
const encryptionKey=await importQueueEncryptionKey(crypto.getRandomValues(new Uint8Array(32)))
const encryptedStore=new EncryptedQueueStore({read:async()=>encryptedValue,write:async value=>{encryptedValue=value}},async()=>encryptionKey)
const secretEnvelope={schemaVersion:1 as const,idempotencyKey:'4f8e8b28-a719-47bf-912d-ae0d530e7aa0',createdAt:new Date().toISOString(),expiresAt:new Date(Date.now()+10000).toISOString(),sailingRef:'OC-2026-104',guestRef:'G-1042',action:{type:'interests.updated' as const,interests:['private-wine-interest']}}
await encryptedStore.write([secretEnvelope])
assert.ok(encryptedValue&&!encryptedValue.includes('private-wine-interest')&&!encryptedValue.includes('G-1042'))
assert.deepEqual(await encryptedStore.read(),[secretEnvelope])
console.log('CruiseConnect SDK security and queue limits passed.')
