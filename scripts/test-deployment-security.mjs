import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const config=JSON.parse(await readFile(new URL('../vercel.json',import.meta.url),'utf8'))
const global=config.headers.find(entry=>entry.source==='/(.*)').headers
assert.ok(global.some(header=>header.key==='Strict-Transport-Security'&&header.value.includes('31536000')))
for(const route of ['/portal/(.*)','/sandbox/(.*)']){
  const headers=config.headers.find(entry=>entry.source===route)?.headers||[]
  assert.ok(headers.some(header=>header.key==='Content-Security-Policy'&&header.value.includes("frame-ancestors 'none'")),`${route} requires frame-ancestors none`)
}
const sdk=await readFile(new URL('../packages/sdk/src/index.ts',import.meta.url),'utf8')
assert.doesNotMatch(sdk,/class LocalStorageQueueStore/)
assert.match(sdk,/AES-GCM/)
assert.match(sdk,/operator_api_requires_https/)
console.log('Deployment headers and encrypted persistence contracts passed.')
