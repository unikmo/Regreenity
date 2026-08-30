import { sendJson } from './_lib/http.mjs'

export default function handler(request, response) {
  if (request.method !== 'GET') return sendJson(response, 405, { error: 'method_not_allowed' })
  return sendJson(response, 200, {
    status: 'ok',
    service: 'regreenity-control-plane',
    version: process.env.VERCEL_GIT_COMMIT_SHA || 'local',
  })
}
