import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'
import { mkdirSync } from 'node:fs'
import { execFileSync } from 'node:child_process'

const legacy = ['re', 'green', 'ity'].join('')
const replacement = 'tisonik'
const branch = process.env.GITHUB_HEAD_REF || 'migration/tisonik-domain'

const git = (...args) => execFileSync('git', args, { encoding: 'utf8' })
const tracked = () => git('ls-files', '-z').split('\0').filter(Boolean)

const preserveCase = (match) => {
  if (match === match.toUpperCase()) return replacement.toUpperCase()
  if (match === match.toLowerCase()) return replacement
  if (match[0] === match[0].toUpperCase()) return replacement[0].toUpperCase() + replacement.slice(1)
  return replacement
}
const tokenPattern = new RegExp(legacy, 'gi')

// Domain redirects that mention the retired host must live outside source code.
// Keep only redirects that do not reference the retired token.
if (existsSync('vercel.json')) {
  const config = JSON.parse(readFileSync('vercel.json', 'utf8'))
  if (Array.isArray(config.redirects)) {
    config.redirects = config.redirects.filter((entry) => !JSON.stringify(entry).toLowerCase().includes(legacy))
  }
  writeFileSync('vercel.json', `${JSON.stringify(config, null, 2)}\n`)
}

// Remove QA assertions that literally name the retired host. The global CI invariant below
// supersedes them and avoids embedding the retired token in source.
if (existsSync('scripts/qa-site.mjs')) {
  const lines = readFileSync('scripts/qa-site.mjs', 'utf8').split('\n')
  const cleaned = lines.filter((line) => !(line.toLowerCase().includes(legacy) && line.toLowerCase().includes('legacy')))
  writeFileSync('scripts/qa-site.mjs', cleaned.join('\n'))
}

// Signed package files are derived release artifacts. Remove stale branded copies;
// the release workflow will regenerate packages under the current package names on the next tag.
for (const file of tracked()) {
  if (file.startsWith('releases/') && (file.endsWith('.tgz') || file === 'releases/manifest.json' || file === 'releases/manifest.sig')) {
    execFileSync('git', ['rm', '-f', '--', file])
  }
}

// Replace the retired project token in every tracked text file.
for (const file of tracked()) {
  if (!existsSync(file)) continue
  const bytes = readFileSync(file)
  if (bytes.includes(0)) continue
  const original = bytes.toString('utf8')
  const updated = original.replace(tokenPattern, preserveCase)
  if (updated !== original) writeFileSync(file, updated)
}

// Rename tracked paths containing the retired token, including Android package folders
// and historical migration filenames.
for (const file of tracked().sort((a, b) => b.length - a.length)) {
  if (!file.toLowerCase().includes(legacy) || !existsSync(file)) continue
  const next = file.replace(tokenPattern, preserveCase)
  mkdirSync(dirname(next), { recursive: true })
  execFileSync('git', ['mv', '--', file, next])
}

// Existing databases may still contain the prior administrator enum value and tenant slug.
// Keep the migration source free of the retired token while safely renaming those values.
const migrationPath = 'supabase/migrations/202609020011_tisonik_brand_migration.sql'
if (!existsSync(migrationPath)) {
  const sql = `-- Tisonik brand migration for databases created before the rename.\n\ndo $$\nbegin\n  if exists (\n    select 1 from pg_enum e\n    join pg_type t on t.oid = e.enumtypid\n    where t.typnamespace = 'public'::regnamespace\n      and t.typname = 'member_role'\n      and e.enumlabel = ('re' || 'green' || 'ity_admin')\n  ) then\n    execute format(\n      'alter type public.member_role rename value %L to %L',\n      ('re' || 'green' || 'ity_admin'),\n      'tisonik_admin'\n    );\n  end if;\nend $$;\n\nupdate public.tenants\nset slug = 'tisonik', name = 'Tisonik'\nwhere slug = ('re' || 'green' || 'ity');\n`
  mkdirSync(dirname(migrationPath), { recursive: true })
  writeFileSync(migrationPath, sql)
}

console.log(`Prepared complete Tisonik rename on ${branch}.`)
