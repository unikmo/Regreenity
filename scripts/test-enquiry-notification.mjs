import assert from 'node:assert/strict'

process.env.RESEND_API_KEY='test-key';process.env.TISONIK_ENQUIRY_TO='info@tisonik.com';process.env.TISONIK_ENQUIRY_FROM='Tisonik <notifications@tisonik.com>'
let requestBody, update
globalThis.fetch=async(_url,options)=>{requestBody=JSON.parse(options.body);return {ok:true}}
const database={from:()=>({update:value=>{update=value;return {eq:async()=>({error:null})}}})}
const {deliverEnquiryNotification}=await import('../api/_lib/enquiry-notification.mjs')
const result=await deliverEnquiryNotification(database,'11111111-1111-1111-1111-111111111111')
assert.deepEqual(result,{configured:true,sent:true});assert.equal(update.status,'sent')
assert.equal(requestBody.to[0],'info@tisonik.com');assert.match(requestBody.text,/access-controlled Tisonik portal/)
for(const prohibited of ['qa@example.com','work email:','company name:','enquiry message:'])assert.ok(!requestBody.text.toLowerCase().includes(prohibited),`notification leaks ${prohibited}`)
console.log('First-party enquiry notification minimisation contract passed.')
