import assert from 'node:assert/strict'
import { mkdtemp, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { randomUUID } from 'node:crypto'
import { createOperatorEdge } from '../packages/operator-edge/src/server.mjs'
import { issueSailingToken } from '../packages/operator-edge/src/auth.mjs'
import { EdgeDatabase } from '../packages/operator-edge/src/database.mjs'

const secret='operator-edge-test-secret-with-at-least-32-characters'
const temp=await mkdtemp(join(tmpdir(),'cruiseconnect-edge-'))
const dbPath=join(temp,'edge.sqlite')
const edge=createOperatorEdge({databasePath:dbPath,jwtSecret:secret,allowedOrigins:'https://app.cruiseline.example'})
await new Promise(resolve=>edge.server.listen(0,'127.0.0.1',resolve))
const base=`http://127.0.0.1:${edge.server.address().port}`
const claims=(guestRef,householdRef,extra={})=>({tenantRef:'oceanic',sailingRef:'OC-2026-104',shipRef:'OCEANIC-AURORA',guestRef,householdRef,ageBand:'adult',displayName:guestRef==='G-1042'?'Maria':'Passenger',features:['vibes','vconnect'],...extra})
const token=value=>issueSailingToken(value,secret)
const senderToken=token(claims('G-1042','H-301'))
const secondSenderToken=token(claims('G-900','H-900'))
const recipientToken=token(claims('G-208','H-302',{displayName:'Daniel'}))
const adminToken=token(claims('ADMIN','ADMIN',{role:'operator_admin'}))

const request=async(path,{auth=senderToken,method='GET',body,headers={}}={})=>{
  const response=await fetch(`${base}${path}`,{method,headers:{...(auth?{Authorization:`Bearer ${auth}`}:{ }),...(body&&!Buffer.isBuffer(body)?{'Content-Type':'application/json'}:{}),...headers},body:body===undefined?undefined:Buffer.isBuffer(body)?body:JSON.stringify(body)})
  const text=await response.text();return {status:response.status,body:text?JSON.parse(text):null,headers:response.headers}
}
const envelope=(guestRef,action)=>({schemaVersion:1,idempotencyKey:randomUUID(),createdAt:new Date().toISOString(),expiresAt:new Date(Date.now()+3600000).toISOString(),sailingRef:'OC-2026-104',guestRef,action})

assert.equal((await request('/health',{auth:null})).status,200)
assert.equal((await request('/v1/session')).body.guestRef,'G-1042')
assert.equal((await request('/v1/session',{auth:null})).status,401)
const match=await request('/v1/recognition/passenger-match',{method:'POST',body:Buffer.from([1,2,3,4])})
assert.equal(match.body.receiverToken,'adult-same-sailing-token')

for(let index=0;index<5;index++)assert.equal((await request('/v1/actions',{method:'POST',body:envelope('G-1042',{type:'vibe.sent',receiverToken:'adult-same-sailing-token',vibeId:'made-my-day'})})).status,202)
assert.deepEqual((await request('/v1/actions',{method:'POST',body:envelope('G-1042',{type:'vibe.sent',receiverToken:'adult-same-sailing-token',vibeId:'made-my-day'})})).body.error,'daily_vibe_limit')
assert.equal(edge.database.db.prepare('select count(*) as count from vibes').get().count,5)
assert.equal(edge.database.db.prepare('select count(*) as count from vibes where receiver_ref=?').get('G-208').count,5)
assert.equal(edge.database.db.prepare("select count(*) as count from pragma_table_info('vibes') where name like '%sender%'").get().count,0)

const firstRequest=await request('/v1/actions',{method:'POST',body:envelope('G-1042',{type:'vconnect.requested',receiverToken:'adult-same-sailing-token',requestOptionId:'coffee-in-atrium'})})
assert.equal(firstRequest.status,202)
assert.equal((await request('/v1/actions',{method:'POST',body:envelope('G-1042',{type:'vconnect.requested',receiverToken:'adult-same-sailing-token',requestOptionId:'join-trivia'})})).body.error,'daily_vconnect_limit')
const inbox=(await request('/v1/vconnect/inbox',{auth:recipientToken})).body
assert.equal(inbox.length,1);assert.equal(inbox[0].requesterDisplayName,'Maria')
assert.equal((await request('/v1/actions',{auth:recipientToken,method:'POST',body:envelope('G-208',{type:'vconnect.responded',requestToken:inbox[0].requestToken,response:'accepted'})})).status,202)
const accepted=(await request('/v1/vconnect/updates')).body
assert.equal(accepted.length,1);assert.ok(accepted[0].connectionToken)
assert.equal((await request('/v1/actions',{method:'POST',body:envelope('G-1042',{type:'vconnect.plan.proposed',connectionToken:accepted[0].connectionToken,venueOptionId:'atrium-cafe',timeOptionId:'tomorrow-afternoon'})})).status,202)

await request('/v1/actions',{auth:secondSenderToken,method:'POST',body:envelope('G-900',{type:'vconnect.requested',receiverToken:'adult-same-sailing-token',requestOptionId:'join-trivia'})})
const secondInbox=(await request('/v1/vconnect/inbox',{auth:recipientToken})).body
const pending=secondInbox.find(item=>item.requesterDisplayName==='Passenger')
await request('/v1/actions',{auth:recipientToken,method:'POST',body:envelope('G-208',{type:'vconnect.responded',requestToken:pending.requestToken,response:'declined'})})
assert.deepEqual((await request('/v1/vconnect/updates',{auth:secondSenderToken})).body,[])

assert.equal((await request('/v1/admin/config',{auth:adminToken})).body.maximumVibesPerDay,5)
assert.equal((await request('/v1/admin/config',{auth:adminToken,method:'PUT',body:{maximumVibesPerDay:6}})).status,422)
assert.equal((await request('/v1/admin/config',{auth:adminToken,method:'PUT',body:{venueOptions:['cabin-1204']}})).status,422)
assert.ok((await request('/v1/admin/audit',{auth:adminToken})).body.length>0)
assert.match(await fetch(`${base}/metrics`).then(value=>value.text()),/vibes_accepted_total/)

await edge.close()
const reopened=new EdgeDatabase(dbPath)
assert.equal(reopened.db.prepare('select count(*) as count from vibes').get().count,5)
assert.equal(reopened.db.prepare("select count(*) as count from vconnect_requests where status='accepted'").get().count,1)
reopened.close()
await rm(temp,{recursive:true,force:true})
console.log('Operator-edge persistence, safety, VConnect privacy, admin and observability contracts passed.')
