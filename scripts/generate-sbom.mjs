import { execFileSync } from 'node:child_process'
import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const root = resolve(new URL('..', import.meta.url).pathname.replace(/^\/(.:)/, '$1'))
const command = process.platform === 'win32' ? process.env.ComSpec : 'npm'
const args = process.platform === 'win32' ? ['/d','/s','/c','npm sbom --sbom-format cyclonedx'] : ['sbom','--sbom-format','cyclonedx']
const output = execFileSync(command, args, { cwd: root, encoding: 'utf8', maxBuffer: 20_000_000 })
JSON.parse(output)
await mkdir(resolve(root, 'artifacts'), { recursive: true })
await writeFile(resolve(root, 'artifacts', 'sbom.cdx.json'), output)
console.log('CycloneDX SBOM generated at artifacts/sbom.cdx.json.')
