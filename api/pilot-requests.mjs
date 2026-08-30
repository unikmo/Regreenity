import { z } from 'zod'
import { allowPost, isSameSiteRequest, readJson, sendJson } from './_lib/http.mjs'
import { adminDatabase } from './_lib/supabase.mjs'

export const enquirySchema = z.object({
  name: z.string().trim().min(2).max(120),
  workEmail: z.string().trim().email().max(254),
  company: z.string().trim().min(2).max(160),
  roleTitle: z.string().trim().max(120).optional().default(''),
  message: z.string().trim().min(10).max(4000),
  privacyConsent: z.literal(true),
  website: z.string().max(200).optional().default(''),
}).strict()

export default async function handler(request, response) {
  if (!allowPost(request, response)) return
  if (!isSameSiteRequest(request)) return sendJson(response, 403, { error: 'origin_not_allowed' })

  try {
    const parsed = enquirySchema.safeParse(await readJson(request, 16_000))
    if (!parsed.success) return sendJson(response, 400, { error: 'invalid_enquiry' })
    const { website, privacyConsent, workEmail, roleTitle, ...rest } = parsed.data
    if (website) return sendJson(response, 202, { accepted: true })

    const database = adminDatabase()
    const { error } = await database.from('pilot_requests').insert({
      ...rest,
      work_email: workEmail.toLowerCase(),
      role_title: roleTitle || null,
      consented_at: new Date().toISOString(),
      source_path: '/pilot/',
    })
    if (error) throw error
    return sendJson(response, 201, { accepted: true })
  } catch (error) {
    if (error instanceof SyntaxError) return sendJson(response, 400, { error: 'invalid_json' })
    if (error?.message === 'PAYLOAD_TOO_LARGE') return sendJson(response, 413, { error: 'payload_too_large' })
    console.error('pilot-request-failed', error?.message || error)
    return sendJson(response, 503, { error: 'enquiry_temporarily_unavailable', email: 'info@regreenity.com' })
  }
}
