import { backup } from 'node:sqlite'
import { mkdir, rename, stat } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { EdgeDatabase } from './database.mjs'

const sourcePath = resolve(process.env.CRUISECONNECT_EDGE_DB || './data/cruiseconnect-edge.sqlite')
const destination = resolve(process.argv[2] || `./backups/cruiseconnect-edge-${new Date().toISOString().replace(/[:.]/g, '-')}.sqlite`)
await mkdir(dirname(destination), { recursive: true })
const temporary = `${destination}.partial`
const database = new EdgeDatabase(sourcePath)
try {
  const integrity = database.db.prepare('pragma integrity_check').get()
  if (integrity.integrity_check !== 'ok') throw new Error('Source database integrity check failed')
  await backup(database.db, temporary)
} finally { database.close() }
const verification = new EdgeDatabase(temporary)
try {
  if (verification.db.prepare('pragma integrity_check').get().integrity_check !== 'ok') throw new Error('Backup integrity check failed')
} finally { verification.close() }
await rename(temporary, destination)
const details = await stat(destination)
console.log(JSON.stringify({ status: 'verified', destination, bytes: details.size }))
