import { createHash, timingSafeEqual } from 'node:crypto'
import { adminDatabase } from './supabase.mjs'

const validKeyId = /^rg_[a-zA-Z0-9_-]{12,80}$/

export async function authenticateConnector(request) {
  const keyId = request.headers['x-tisonik-key-id']
  const authorization = request.headers.authorization || ''
  const secret = authorization.startsWith('Bearer ') ? authorization.slice(7) : ''
  if (typeof keyId !== 'string' || !validKeyId.test(keyId) || secret.length < 32 || secret.length > 256) return null

  const database = adminDatabase()
  const { data, error } = await database
    .from('connector_installations')
    .select('id, tenant_id, secret_digest, status')
    .eq('key_id', keyId)
    .maybeSingle()
  if (error || !data || data.status === 'disabled') return null

  const supplied = Buffer.from(createHash('sha256').update(secret).digest('hex'))
  const expected = Buffer.from(data.secret_digest)
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) return null
  return { database, connector: data }
}
