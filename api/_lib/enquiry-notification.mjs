import { createHash } from 'node:crypto'

const dashboardUrl = 'https://regreenity.com/portal/'
export const notificationConfigured = () => Boolean(process.env.RESEND_API_KEY && process.env.REGREENITY_ENQUIRY_TO && process.env.REGREENITY_ENQUIRY_FROM)

export async function deliverEnquiryNotification(database, pilotRequestId) {
  if (!notificationConfigured()) return { configured: false }
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.REGREENITY_ENQUIRY_FROM,
        to: [process.env.REGREENITY_ENQUIRY_TO],
        subject: 'New Regreenity pilot enquiry',
        text: `A new pilot enquiry is available in the access-controlled Regreenity portal.\n\nOpen: ${dashboardUrl}\n\nReference: ${pilotRequestId}\n\nNo passenger, crew or enquiry content is included in this notification.`,
      }),
    })
    if (!response.ok) throw new Error(`notification_provider_${response.status}`)
    await database.from('pilot_request_notifications').update({ status:'sent', attempts:1, sent_at:new Date().toISOString(), last_error_hash:null }).eq('pilot_request_id',pilotRequestId)
    return { configured:true, sent:true }
  } catch (error) {
    const hash=createHash('sha256').update(String(error?.message||'notification_failed')).digest('hex')
    await database.from('pilot_request_notifications').update({ status:'failed', attempts:1, next_attempt_at:new Date(Date.now()+15*60_000).toISOString(), last_error_hash:hash }).eq('pilot_request_id',pilotRequestId)
    return { configured:true, sent:false }
  }
}
