import { copyFile, mkdir, readFile } from 'node:fs/promises'
import { basename, resolve } from 'node:path'

const target = process.argv[2]
if (!target || !target.endsWith('.tgz')) throw new Error('Usage: npm run release:rollback -- releases/<verified-package>.tgz')
const root = resolve(new URL('..', import.meta.url).pathname.replace(/^\/(.:)/, '$1'))
const manifest = JSON.parse(await readFile(resolve(root, 'releases', 'manifest.json'), 'utf8'))
if (!manifest.files.some(file => file.name === basename(target))) throw new Error('Rollback target is not in the signed manifest')
const rollback = resolve(root, 'rollback')
await mkdir(rollback, { recursive: true })
await copyFile(resolve(root, target), resolve(rollback, basename(target)))
console.log(`Prepared verified rollback artifact at rollback/${basename(target)}. Operator deployment remains an explicit controlled action.`)
