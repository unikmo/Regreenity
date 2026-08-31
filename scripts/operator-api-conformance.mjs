import { randomUUID } from 'node:crypto'

const base=(process.env.OPERATOR_EDGE_URL||'').replace(/\/$/,'')
const token=process.env.OPERATOR_EDGE_TOKEN||''
if(!base||!token)throw new Error('Set OPERATOR_EDGE_URL (including /v1) and OPERATOR_EDGE_TOKEN for a dedicated test passenger.')
const parsed=new URL(base)
if(parsed.protocol!=='https:'&&!['localhost','127.0.0.1'].includes(parsed.hostname))throw new Error('Operator edge must use HTTPS outside localhost.')
const call=async(path,init={})=>{
  const response=await fetch(`${base}${path}`,{...init,headers:{Authorization:`Bearer ${token}`,...init.headers}})
  const text=await response.text(), body=text?JSON.parse(text):null
  if(!response.ok)throw new Error(`${path} returned ${response.status}: ${body?.error||text}`)
  return {response,body}
}
const session=(await call('/session')).body
for(const field of ['tenantRef','sailingRef','shipRef','guestRef','ageBand','expiresAt','features'])if(session[field]===undefined)throw new Error(`Session missing ${field}`)
if(!['adult','minor'].includes(session.ageBand)||!Array.isArray(session.features))throw new Error('Session entitlement shape is invalid.')
const events=(await call(`/sailings/${encodeURIComponent(session.sailingRef)}/events`)).body
const meetups=(await call(`/sailings/${encodeURIComponent(session.sailingRef)}/meetups`)).body
if(!Array.isArray(events)||!Array.isArray(meetups))throw new Error('Events and meetups must return arrays.')
const now=new Date().toISOString(), idempotencyKey=randomUUID()
const envelope={schemaVersion:1,idempotencyKey,createdAt:now,expiresAt:new Date(Date.now()+3600000).toISOString(),sailingRef:session.sailingRef,guestRef:session.guestRef,action:{type:'notification.preference',enabled:true}}
const first=(await call('/actions',{method:'POST',headers:{'Content-Type':'application/json','Idempotency-Key':idempotencyKey},body:JSON.stringify(envelope)})).body
const second=(await call('/actions',{method:'POST',headers:{'Content-Type':'application/json','Idempotency-Key':idempotencyKey},body:JSON.stringify(envelope)})).body
if(!first.accepted||!second.accepted||!second.duplicate)throw new Error('Action idempotency contract failed.')
const inbox=(await call('/vconnect/inbox')).body, updates=(await call('/vconnect/updates')).body
if(!Array.isArray(inbox)||!Array.isArray(updates))throw new Error('VConnect inbox/update endpoints must return arrays.')
console.log(JSON.stringify({status:'passed',session:{tenantRef:session.tenantRef,sailingRef:session.sailingRef,shipRef:session.shipRef,ageBand:session.ageBand},events:events.length,meetups:meetups.length,idempotency:true,vconnect:true},null,2))
