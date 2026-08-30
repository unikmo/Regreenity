export function sendJson(response, status, body) {
  response.statusCode = status
  response.setHeader('Content-Type', 'application/json; charset=utf-8')
  response.setHeader('Cache-Control', 'no-store')
  response.end(JSON.stringify(body))
}

export async function readJson(request, limit = 64_000) {
  const chunks = []
  let size = 0
  for await (const chunk of request) {
    size += chunk.length
    if (size > limit) throw new Error('PAYLOAD_TOO_LARGE')
    chunks.push(chunk)
  }
  if (!chunks.length) return {}
  return JSON.parse(Buffer.concat(chunks).toString('utf8'))
}

export function allowPost(request, response) {
  if (request.method === 'OPTIONS') {
    response.statusCode = 204
    response.setHeader('Allow', 'POST, OPTIONS')
    response.end()
    return false
  }
  if (request.method !== 'POST') {
    sendJson(response, 405, { error: 'method_not_allowed' })
    return false
  }
  return true
}

export function isSameSiteRequest(request) {
  const origin = request.headers.origin
  if (!origin) return true
  return origin === 'https://regreenity.com' || origin.endsWith('.vercel.app') || origin.startsWith('http://localhost:')
}
