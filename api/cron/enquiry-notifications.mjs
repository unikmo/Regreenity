import { timingSafeEqual } from 'node:crypto'
import { deliverEnquiryNotification, notificationConfigured } from '../_lib/enquiry-notification.mjs'
import { sendJson } from '../_lib/http.mjs'
import { adminDatabase } from '../_lib/supabase.mjs'

const authorised = request => {
  const expected=`Bearer ${process.env.CRON_SECRET||''}`, supplied=String(request.headers.authorization||'')
  const a=Buffer.from(expected), b=Buffer.from(supplied)
  return Boolean(process.env.CRON_SECRET) && a.length===b.length && timingSafeEqual(a,b)
}

export default async function handler(request,response){
  if(request.method!=='GET')return sendJson(response,405,{error:'method_not_allowed'})
  if(!authorised(request))return sendJson(response,401,{error:'unauthorised'})
  if(!notificationConfigured())return sendJson(response,503,{error:'notification_not_configured'})
  const database=adminDatabase(), now=new Date().toISOString()
  const {data,error}=await database.from('pilot_request_notifications').select('pilot_request_id,attempts').in('status',['queued','failed']).lte('next_attempt_at',now).lt('attempts',10).order('created_at').limit(20)
  if(error)return sendJson(response,503,{error:'outbox_unavailable'})
  let sent=0
  for(const row of data||[]){const result=await deliverEnquiryNotification(database,row.pilot_request_id);if(result.sent)sent++}
  return sendJson(response,200,{processed:(data||[]).length,sent})
}
