import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = process.cwd()
const parts = [1,2,3,4,5].map(n => resolve(root, `v13_parts/PilotSimulator.${String(n).padStart(3,'0')}`))
let source = parts.map(path => readFileSync(path, 'utf8')).join('')
source = source
  .replaceAll('Cruise Connection', 'Regreenity Cruise')
  .replaceAll('CRUISE CONNECTION', 'REGREENITY CRUISE')
  .replaceAll('Tisonik Cruise', 'Regreenity Cruise')
  .replaceAll('TISONIK CRUISE', 'REGREENITY CRUISE')
writeFileSync(resolve(root, 'src/PilotSimulator.tsx'), source, 'utf8')
console.log(`Assembled src/PilotSimulator.tsx (${source.length} chars) with Regreenity Cruise branding`)
