import { createHash, createPublicKey, verify } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const root = resolve(new URL('..', import.meta.url).pathname.replace(/^\/(.:)/, '$1'))
const releases = resolve(root, 'releases')
const payload = await readFile(resolve(releases, 'manifest.json'))
const signature = Buffer.from((await readFile(resolve(releases, 'manifest.sig'), 'utf8')).trim(), 'base64')
const publicKey = createPublicKey(await readFile(resolve(root, 'release-ed25519-public.pem'), 'utf8'))
if (!verify(null, payload, publicKey, signature)) throw new Error('Release manifest signature is invalid')
const manifest = JSON.parse(payload)
for (const file of manifest.files) {
  const bytes = await readFile(resolve(releases, file.name))
  const hash = createHash('sha256').update(bytes).digest('hex')
  if (hash !== file.sha256 || bytes.length !== file.bytes) throw new Error(`Release package verification failed: ${file.name}`)
}
console.log(`Verified Ed25519 signature and ${manifest.files.length} release package(s).`)
