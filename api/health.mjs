import { sendJson } from './_lib/http.mjs'
import { adminDatabase } from './_lib/supabase.mjs'

export default async function handler(request, response) {
  if (request.method !== 'GET') return sendJson(response, 405, { error: 'method_not_allowed' })
  const deep = new URL(request.url, 'https://tisonik.com').searchParams.get('deep') === '1'
  if (deep) {
    try {
      const { error } = await adminDatabase().from('tenants').select('id', { head: true, count: 'exact' })
      if (error) throw error
    } catch (error) {
      console.error('health-database-failed', error?.message || error)
      return sendJson(response, 503, { status: 'degraded', service: 'regreenity-control-plane', database: 'unavailable' })
    }
  }
  return sendJson(response, 200, {
    status: 'ok',
    service: 'regreenity-control-plane',
    ...(deep ? { database: 'connected' } : {}),
    version: process.env.VERCEL_GIT_COMMIT_SHA || 'local',
  })
}
