import assert from 'node:assert/strict'
import { readFile, readdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import { parse } from 'yaml'

const root=resolve(new URL('..',import.meta.url).pathname.replace(/^\/(.:)/,'$1'))
const workflowDirectory=resolve(root,'.github','workflows')
for(const name of await readdir(workflowDirectory))if(name.endsWith('.yml')){
  const document=parse(await readFile(resolve(workflowDirectory,name),'utf8'))
  assert.ok(document?.jobs&&Object.keys(document.jobs).length,`${name} has no jobs`)
  assert.ok(document?.on,`${name} has no trigger`)
}
const render=parse(await readFile(resolve(root,'render.yaml'),'utf8'))
const service=render.services?.[0]
assert.equal(service?.healthCheckPath,'/ready')
assert.equal(service?.disk?.mountPath,'/data')
assert.ok(service?.envVars?.some(item=>item.key==='CRUISECONNECT_EDGE_JWT_SECRET'&&item.generateValue===true))
assert.ok(service?.envVars?.some(item=>item.key==='CRUISECONNECT_EDGE_ALLOWED_ORIGINS'&&item.sync===false))
console.log('CI, release, monitoring and persistent staging configuration contracts passed.')
