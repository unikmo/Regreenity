import { useEffect, useMemo, useState } from 'react'
import { CruiseConnectClient, MemoryQueueStore } from '../packages/sdk/src/index.ts'
import { ReferenceCruiseHost } from '../packages/reference-host/src/index.ts'
import './sandbox.css'

type Log={time:string;title:string;detail:string}
const featureCards=[
  ['interests','Interests','Select interests and form relevant onboard groups.'],['meetups','Meetups','Join a five-minute, host-facilitated introduction.'],
  ['vibes','Anonymous vibes','Resolve an eligible adult on-device and send an anonymous compliment.'],['crew','Crew recognition','Match against the operator roster and choose prepared reasons.'],
  ['feedback','Live feedback','Answer three structured questions while the event is happening.'],['commerce','Commerce','Open cruise-line checkout and confirm attributable revenue.'],
  ['offline','Offline queue','Keep working without public internet and synchronize later.'],['management','Management','Review immediate operational outcomes and privacy-safe totals.'],
]

export default function Sandbox(){
  const host=useMemo(()=>new ReferenceCruiseHost(),[]), sdk=useMemo(()=>new CruiseConnectClient(host,new MemoryQueueStore()),[host])
  const [ready,setReady]=useState(false),[active,setActive]=useState('interests'),[logs,setLogs]=useState<Log[]>([]),[queue,setQueue]=useState(0),[counts,setCounts]=useState({actions:0,notifications:0,purchases:0,revenue:0})
  const add=(title:string,detail:string)=>setLogs(v=>[{time:new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}),title,detail},...v].slice(0,10))
  const refresh=async()=>{setQueue(await sdk.queued());setCounts({actions:host.actions.length,notifications:host.notifications.length,purchases:host.purchases.length,revenue:host.actions.reduce((n,x)=>x.action.type==='purchase.outcome'&&x.action.outcome.status==='confirmed'?n+x.action.outcome.value:n,0)})}
  useEffect(()=>{sdk.initialize().then(()=>setReady(true))},[sdk])
  const run=async()=>{
    if(!ready)return
    if(active==='interests'){await sdk.updateInterests(['wine','photography','live music']);add('Interests saved','Only operator-local interest selections were updated.')}
    if(active==='meetups'){await sdk.joinMeetup('meet-wine',false);add('Meetup joined','Count increased; name and image remain hidden by default.')}
    if(active==='vibes'){const image=new Uint8Array([1,2,3,4,5]);const match=await sdk.identifyPassenger(image);if(match.receiverToken)await sdk.sendVibe(match.receiverToken,'made-my-day');add('Anonymous vibe sent','Adult eligibility confirmed; capture erased; sender never disclosed.')}
    if(active==='crew'){const image=new Uint8Array([1,2,3,4]);const match=await sdk.identifyCrew(image);if(match.receiverToken)await sdk.recognizeCrew(match.receiverToken,['warm-welcome','exceptional-care']);add('Crew member recognised','Prepared reasons saved in the operator environment.')}
    if(active==='feedback'){await sdk.submitEventFeedback({eventId:'evt-jazz',score:5,responseIds:['great-atmosphere','right-length','would-return']});add('Live feedback delivered','Three structured answers are available to onboard leaders immediately.')}
    if(active==='commerce'){const ref=await sdk.purchase('wine-tasting','food-beverage');await sdk.recordPurchase({attributionRef:ref,status:'confirmed',value:49,currency:'EUR'});add('Booking confirmed','Cruise-line checkout retained ownership; €49 attributed.')}
    if(active==='offline'){host.setOffline(true);await sdk.updateInterests(['jewellery']);add('Action queued','No internet required. Sailing-scoped action stored for retry.')}
    if(active==='management'){await sdk.setNotifications(true);await sdk.notify('follow-up','Your group is meeting','Four members joined. Would you like to come?','2026-09-01T17:00:00+02:00');add('Follow-up scheduled','Operator-controlled notification created from group intent.')}
    await refresh()
  }
  const reconnect=async()=>{host.setOffline(false);const result=await sdk.flush();add('Connection restored',`${result.sent} queued action synchronized; ${result.remaining} remaining.`);await refresh()}
  return <main className="sandbox-shell">
    <header><a href="/">Regreenity</a><div><span className={ready?'ready':''}/>{ready?'Reference host connected':'Connecting…'}</div><a href="/portal/">Operator portal</a></header>
    <section className="sandbox-intro"><p>CRUISECONNECT 1.0 · EXECUTABLE SANDBOX</p><h1>One sailing. Every journey. No passenger data in Regreenity cloud.</h1><span>This sandbox runs the same versioned SDK contract supplied to cruise-line app teams. Choose a module, execute it, then inspect the host-side result.</span></section>
    <section className="sandbox-grid">
      <nav aria-label="CruiseConnect modules">{featureCards.map(([id,title,note])=><button key={id} className={active===id?'active':''} onClick={()=>setActive(id)}><b>{title}</b><small>{note}</small></button>)}</nav>
      <article className="sandbox-phone"><div className="sandbox-phone-top"><span>9:41</span><b>Oceanic Aurora</b><span>●●●</span></div><div className="sandbox-phone-body"><p>CRUISECONNECT</p><h2>{featureCards.find(x=>x[0]===active)?.[1]}</h2><div className="sandbox-scenario-card"><span>Live sailing · Day 2</span><strong>{featureCards.find(x=>x[0]===active)?.[2]}</strong><small>Adult guest · feature entitled · operator-local identity</small></div>{active==='offline'&&queue>0?<button className="sandbox-primary" onClick={reconnect}>Restore connection & sync</button>:<button className="sandbox-primary" onClick={run}>Run this journey</button>}<small className="sandbox-privacy-note">Identity, captures and source actions remain inside this reference host.</small></div></article>
      <aside><div className="sandbox-kpis"><div><span>Host actions</span><b>{counts.actions}</b></div><div><span>Queued</span><b>{queue}</b></div><div><span>Notifications</span><b>{counts.notifications}</b></div><div><span>Revenue</span><b>€{counts.revenue}</b></div></div><h2>Operational event stream</h2>{logs.length?logs.map((x,i)=><div className="sandbox-log" key={`${x.time}-${i}`}><time>{x.time}</time><p><b>{x.title}</b><span>{x.detail}</span></p></div>):<p className="sandbox-empty">Run a journey to see idempotent host-side activity.</p>}</aside>
    </section>
  </main>
}
