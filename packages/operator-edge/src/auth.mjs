import { createHmac, timingSafeEqual } from 'node:crypto'

const encode = value => Buffer.from(typeof value === 'string' ? value : JSON.stringify(value)).toString('base64url')
const decodeJson = value => JSON.parse(Buffer.from(value, 'base64url').toString('utf8'))

export function issueSailingToken(claims, secret, lifetimeSeconds = 900) {
  if (!secret || secret.length < 32) throw new Error('jwt_secret_too_short')
  const now = Math.floor(Date.now() / 1000)
  const header = encode({ alg: 'HS256', typ: 'JWT' })
  const payload = encode({ ...claims, iat: now, exp: claims.exp || now + lifetimeSeconds })
  const signature = createHmac('sha256', secret).update(`${header}.${payload}`).digest('base64url')
  return `${header}.${payload}.${signature}`
}

export function verifySailingToken(token, secret, requiredRole = null) {
  if (!secret || secret.length < 32) throw new EdgeAuthError('server_auth_not_configured', 503)
  const parts = String(token || '').split('.')
  if (parts.length !== 3) throw new EdgeAuthError('invalid_token')
  const expected = createHmac('sha256', secret).update(`${parts[0]}.${parts[1]}`).digest()
  const supplied = Buffer.from(parts[2], 'base64url')
  if (expected.length !== supplied.length || !timingSafeEqual(expected, supplied)) throw new EdgeAuthError('invalid_token')
  let header, claims
  try { header = decodeJson(parts[0]); claims = decodeJson(parts[1]) } catch { throw new EdgeAuthError('invalid_token') }
  if (header.alg !== 'HS256' || header.typ !== 'JWT') throw new EdgeAuthError('invalid_token')
  const now = Math.floor(Date.now() / 1000)
  if (!Number.isInteger(claims.exp) || claims.exp <= now) throw new EdgeAuthError('token_expired')
  if (!claims.tenantRef || !claims.sailingRef || !claims.shipRef || !claims.guestRef || !['adult', 'minor'].includes(claims.ageBand)) throw new EdgeAuthError('invalid_claims')
  if (requiredRole && claims.role !== requiredRole) throw new EdgeAuthError('insufficient_role', 403)
  return claims
}

export function bearerToken(headers) {
  const value = headers.authorization || ''
  if (!value.startsWith('Bearer ')) throw new EdgeAuthError('missing_token')
  return value.slice(7)
}

export class EdgeAuthError extends Error {
  constructor(code, status = 401) { super(code); this.code = code; this.status = status }
}
