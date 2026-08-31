import { createHash, createPrivateKey, createPublicKey, generateKeyPairSync, sign } from 'node:crypto'
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { execFileSync } from 'node:child_process'

const root=resolve(new URL('..',import.meta.url).pathname.replace(/^\/(.:)/,'$1'))
const releases=resolve(root,'releases'), secrets=resolve(root,'.release-secrets')
await mkdir(releases,{recursive:true});await mkdir(secrets,{recursive:true})
const privatePath=resolve(secrets,'release-ed25519-private.pem'), publicPath=resolve(root,'release-ed25519-public.pem')
let privatePem=process.env.RELEASE_SIGNING_PRIVATE_KEY_B64?Buffer.from(process.env.RELEASE_SIGNING_PRIVATE_KEY_B64,'base64').toString('utf8'):process.env.RELEASE_SIGNING_PRIVATE_KEY_PEM
if(!privatePem)try{privatePem=await readFile(privatePath,'utf8')}catch{
  const pair=generateKeyPairSync('ed25519',{privateKeyEncoding:{type:'pkcs8',format:'pem'},publicKeyEncoding:{type:'spki',format:'pem'}})
  privatePem=pair.privateKey
  await writeFile(privatePath,privatePem,{mode:0o600})
  await writeFile(publicPath,pair.publicKey)
}
createPrivateKey(privatePem)
try{await readFile(publicPath)}catch{await writeFile(publicPath,createPublicKey(createPrivateKey(privatePem)).export({type:'spki',format:'pem'}))}
const names=(await readdir(releases)).filter(name=>name.endsWith('.tgz')).sort()
const files=[]
for(const name of names){const bytes=await readFile(resolve(releases,name));files.push({name,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')})}
const manifest={schemaVersion:1,generatedAt:new Date().toISOString(),gitCommit:execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),files}
const payload=Buffer.from(JSON.stringify(manifest,null,2)+'\n')
await writeFile(resolve(releases,'manifest.json'),payload)
await writeFile(resolve(releases,'manifest.sig'),sign(null,payload,createPrivateKey(privatePem)).toString('base64')+'\n')
console.log(`Signed ${files.length} release package(s) with Ed25519. Private key remains git-ignored; public key is release-ed25519-public.pem.`)
