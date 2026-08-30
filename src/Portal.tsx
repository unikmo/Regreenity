import { useEffect, useMemo, useState, type FormEvent } from 'react'
import type { Session } from '@supabase/supabase-js'
import { databaseConfigured, supabase } from './supabaseClient'
import './portal.css'

type Membership = { tenant_id: string; role: string; tenants: { name: string; minimum_reporting_group: number } | null }
type Report = { id: string; period_start: string; period_end: string; received_at: string; minimum_group_applied: number; privacy_gateway_version: string }
type Metric = { metric: string; dimension: string; count_value: number | null; numeric_value: number | null; currency: string | null }
type Enquiry = { id: string; name: string; work_email: string; company: string; role_title: string | null; message: string; status: string; created_at: string }
const labels: Record<string, string> = { activated_guests:'Activated guests', passenger_vibes:'Passenger vibes', crew_recognitions:'Crew recognitions', event_feedback_responses:'Live feedback', issues_resolved:'Issues resolved', commerce_confirmed:'Confirmed bookings', attributed_net_value:'Attributed net value', social_shares:'Passenger-led shares' }

export default function Portal() {
  const [session,setSession]=useState<Session|null>(null), [email,setEmail]=useState(''), [notice,setNotice]=useState(''), [error,setError]=useState('')
  const [memberships,setMemberships]=useState<Membership[]>([]), [reports,setReports]=useState<Report[]>([]), [metrics,setMetrics]=useState<Metric[]>([]), [enquiries,setEnquiries]=useState<Enquiry[]>([])
  useEffect(()=>{ if(!supabase)return; supabase.auth.getSession().then(({data})=>setSession(data.session)); const {data}=supabase.auth.onAuthStateChange((_e,s)=>setSession(s)); return()=>data.subscription.unsubscribe() },[])
  useEffect(()=>{ if(!supabase||!session)return; void (async()=>{
    setError('')
    const m=await supabase.from('memberships').select('tenant_id,role,tenants(name,minimum_reporting_group)')
    if(m.error){setError('Your account has not been assigned to an operator workspace.');return}
    const rows=(m.data||[]) as unknown as Membership[]; setMemberships(rows)
    const r=await supabase.from('aggregate_reports').select('id,period_start,period_end,received_at,minimum_group_applied,privacy_gateway_version').order('period_end',{ascending:false}).limit(24)
    const reportRows=(r.data||[]) as Report[]; setReports(reportRows)
    if(reportRows.length){const x=await supabase.from('aggregate_metrics').select('metric,dimension,count_value,numeric_value,currency').eq('report_id',reportRows[0].id);setMetrics((x.data||[]) as Metric[])}
    if(rows.some(v=>v.role==='regreenity_admin')){const q=await supabase.from('pilot_requests').select('id,name,work_email,company,role_title,message,status,created_at').order('created_at',{ascending:false}).limit(100);setEnquiries((q.data||[]) as Enquiry[])}
  })() },[session])
  const totals=useMemo(()=>metrics.reduce<Record<string,{value:number,currency?:string}>>((a,m)=>{if(m.dimension==='overall'){a[m.metric]={value:(a[m.metric]?.value||0)+Number(m.numeric_value??m.count_value??0),currency:m.currency||a[m.metric]?.currency}}return a},{}),[metrics])
  const signIn=async(e:FormEvent)=>{e.preventDefault();if(!supabase)return;setNotice('Sending secure link…');const {error:e2}=await supabase.auth.signInWithOtp({email,options:{emailRedirectTo:`${location.origin}/portal/`}});setNotice(e2?'Unable to send. Contact info@regreenity.com.':'Check your inbox for the secure sign-in link.')}
  if(!databaseConfigured)return <main className="portal-shell"><section className="portal-login"><h1>Portal configuration is being completed.</h1><p>No operational data is exposed.</p></section></main>
  if(!session)return <main className="portal-shell"><section className="portal-login"><a href="/" className="portal-brand">Regreenity</a><p className="portal-kicker">SECURE OPERATIONS PORTAL</p><h1>Sign in to your authorised workspace.</h1><p>Use the work email invited by Regreenity or your cruise-line administrator. Passenger data is not held here.</p><form onSubmit={signIn}><label>Work email<input required type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="name@cruiseline.com"/></label><button>Email me a secure link</button></form>{notice&&<p className="portal-status" role="status">{notice}</p>}</section></main>
  const admin=memberships.some(v=>v.role==='regreenity_admin')
  return <main className="portal-shell portal-authenticated"><header><div><a href="/" className="portal-brand">Regreenity</a><span>Aggregate operations portal</span></div><div><span>{session.user.email}</span><button onClick={()=>supabase?.auth.signOut()}>Sign out</button></div></header>
    <section className="portal-heading"><p className="portal-kicker">PRIVACY-SAFE PERFORMANCE</p><h1>{memberships[0]?.tenants?.name||'Authorised workspace'}</h1><p>Only thresholded aggregate KPIs and non-identifying health data are available. Passenger and crew source records remain with the cruise operator.</p></section>{error&&<p className="portal-error">{error}</p>}
    <section className="portal-kpis">{Object.entries(labels).map(([k,l])=><article key={k}><span>{l}</span><strong>{totals[k]?`${totals[k].currency||''}${totals[k].value.toLocaleString()}`:'—'}</strong><small>{reports.length?`Latest accepted period · ${reports[0].period_end}`:'Awaiting first report'}</small></article>)}</section>
    <section className="portal-panel"><h2>Accepted privacy-gateway reports</h2>{reports.length?<div className="portal-table"><div><b>Period</b><b>Threshold</b><b>Gateway</b><b>Received</b></div>{reports.map(r=><div key={r.id}><span>{r.period_start} → {r.period_end}</span><span>≥ {r.minimum_group_applied}</span><span>{r.privacy_gateway_version}</span><span>{new Date(r.received_at).toLocaleDateString()}</span></div>)}</div>:<p className="portal-empty">No reports received. This is an empty production workspace—not demo data.</p>}</section>
    {admin&&<section className="portal-panel"><h2>Pilot enquiries</h2>{enquiries.length?<div className="portal-requests">{enquiries.map(q=><article key={q.id}><div><strong>{q.company}</strong><span>{q.status}</span></div><p>{q.name}{q.role_title?` · ${q.role_title}`:''} · <a href={`mailto:${q.work_email}`}>{q.work_email}</a></p><blockquote>{q.message}</blockquote><small>{new Date(q.created_at).toLocaleString()}</small></article>)}</div>:<p className="portal-empty">No pilot enquiries yet.</p>}</section>}
  </main>
}
