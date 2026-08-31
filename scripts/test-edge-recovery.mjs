import assert from 'node:assert/strict'
import { backup } from 'node:sqlite'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import { EdgeDatabase } from '../packages/operator-edge/src/database.mjs'

const directory = await mkdtemp(resolve(tmpdir(), 'cruiseconnect-recovery-'))
const sourcePath = resolve(directory, 'edge.sqlite'), backupPath = resolve(directory, 'backup.sqlite')
try {
  const source = new EdgeDatabase(sourcePath)
  source.db.prepare("insert into audit_log(created_at,action,outcome,metadata_json) values(?,?,?,?)").run(new Date().toISOString(), 'recovery.fixture', 'accepted', '{}')
  await backup(source.db, backupPath)
  source.close()
  const recovered = new EdgeDatabase(backupPath)
  assert.equal(recovered.db.prepare("select count(*) as count from audit_log where action='recovery.fixture'").get().count, 1)
  assert.equal(recovered.db.prepare('pragma integrity_check').get().integrity_check, 'ok')
  recovered.close()
  console.log('Operator-edge backup, integrity and restore contract passed.')
} finally { await rm(directory, { recursive: true, force: true }) }
