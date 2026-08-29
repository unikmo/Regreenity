import { useEffect, useState, type ReactNode } from 'react'
import { Icon } from './App'

type DemoStep = {
  phase: 'Overview' | 'Cruise app' | 'Passenger' | 'Management' | 'Integration' | 'Pilot'
  title: string
  description: string
  benefit: string
}

const steps: DemoStep[] = [
  { phase: 'Overview', title: 'One connected experience layer—not another guest app.', description: 'Regreenity supplies the product and connector layer. The cruise line keeps its app, identity, brand, inventory, checkout and operating systems.', benefit: 'Faster path to richer guest engagement without replacing the existing digital estate.' },
  { phase: 'Cruise app', title: 'CruiseConnect appears inside the app guests already use.', description: 'CruiseConnect is the default feature label in this walkthrough. Every operator can rename, reposition and co-brand the tile while Regreenity powers the underlying experience.', benefit: 'No new download, login or competing destination for passengers.' },
  { phase: 'Passenger', title: 'A calm home for the complete passenger experience.', description: 'The passenger opens one feature and chooses what they need: connect, recognise crew, get private help or discover an experience.', benefit: 'One coherent entry point instead of unrelated modules scattered through the app.' },
  { phase: 'Passenger', title: 'Safe passenger connection with consent at every step.', description: 'Opted-in guests can discover shared context, send a predefined positive affirmation and propose a public onboard activity only after acknowledgement.', benefit: 'More natural interaction without unrestricted stranger messaging or precise location exposure.' },
  { phase: 'Passenger', title: 'Crew recognition captured while the moment is fresh.', description: 'A guest identifies a crew member, selects up to two reasons and sends contextual recognition tied to the sailing and service moment.', benefit: 'Useful, credible evidence of service excellence—not a public popularity ranking.' },
  { phase: 'Passenger', title: 'Private recovery before the guest disembarks.', description: 'A passenger selects the issue and sends it to the appropriate onboard team. The guest sees acknowledgement and the operator can close the loop.', benefit: 'Recover service while there is still time to change the experience.' },
  { phase: 'Passenger', title: 'Shared interest becomes relevant onboard participation.', description: 'CruiseConnect can surface activities with remaining capacity, then hand the passenger into the cruise line’s existing booking and payment flow.', benefit: 'Higher participation and measurable ancillary opportunity without becoming the merchant.' },
  { phase: 'Management', title: 'Management sees the connected operational picture.', description: 'Teams move between activation, crew recognition, recovery and attributed activity performance from one operator view.', benefit: 'A pilot can be managed day by day and evaluated against agreed outcomes.' },
  { phase: 'Integration', title: 'Connectors fit CruiseConnect into the existing stack.', description: 'The host app supplies sailing-scoped identity and native capabilities. CruiseConnect exchanges approved events with ship-local services and hands bookings, operations and analytics to existing systems.', benefit: 'The operator retains control of identity, security, operations, commerce and data policy.' },
  { phase: 'Pilot', title: 'Pilot the complete product on one ship.', description: 'Configure the label and branding, connect the host systems, activate the full passenger and management experience, promote it and measure the agreed outcomes.', benefit: 'A bounded executive decision: prove value on selected sailings before fleet scale.' },
]

const readStep = () => Math.min(steps.length - 1, Math.max(0, Number(new URLSearchParams(window.location.search).get('step')) || 0))

const passengerFeatures = [
  { step: 3, icon: 'people', title: 'Connect onboard', note: 'Positive, reciprocal interaction' },
  { step: 4, icon: 'crew', title: 'Recognise crew', note: 'Contextual service recognition' },
  { step: 5, icon: 'help', title: 'Get private help', note: 'Closed-loop service recovery' },
  { step: 6, icon: 'cart', title: 'Discover together', note: 'Activities and cruise commerce' },
]

const DemoPhone = ({ children, label = 'Oceanic Voyages app' }: { children: ReactNode; label?: string }) => <div className="exec-phone-shell"><div className="exec-phone-label">{label}</div><div className="exec-phone"><div className="exec-phone-status"><span>9:41</span><i/><span>5G ▰</span></div>{children}</div></div>

const HostAppScreen = ({ openFeature }: { openFeature: () => void }) => <DemoPhone><div className="host-app-head"><div><small>DAY 4 · MEDITERRANEAN ESCAPE</small><b>Good afternoon, Maria</b></div><span>MA</span></div><div className="host-app-hero"><small>TODAY ONBOARD</small><strong>Make the most of your day at sea.</strong><p>Your itinerary, bookings and onboard services in one place.</p></div><div className="host-app-grid"><button><Icon name="calendar"/><b>My day</b><small>Itinerary & bookings</small></button><button><Icon name="cart"/><b>Dining</b><small>Tables & tastings</small></button><button className="cruiseconnect-tile" onClick={openFeature}><span className="cc-mark"><Icon name="spark"/></span><b>CruiseConnect</b><small>People · crew · help · experiences</small><em>OPEN FEATURE →</em></button><button><Icon name="ship"/><b>Excursions</b><small>Explore ashore</small></button></div><p className="host-app-note">Feature name, icon, position and colours are configurable by the cruise line.</p></DemoPhone>

const FeatureHub = ({ go }: { go: (step: number) => void }) => <DemoPhone label="CruiseConnect · passenger view"><div className="cc-app-head"><button aria-label="Back to cruise app" onClick={()=>go(1)}>‹</button><div><small>OCEANIC VOYAGES</small><b>CruiseConnect</b></div><span>MA</span></div><div className="cc-welcome"><small>POWERED BY REGREENITY</small><h3>What would make today better?</h3><p>Choose a feature to see the passenger journey.</p></div><div className="cc-feature-grid">{passengerFeatures.map(feature=><button key={feature.step} onClick={()=>go(feature.step)}><span><Icon name={feature.icon}/></span><b>{feature.title}</b><small>{feature.note}</small><em>View →</em></button>)}</div><div className="cc-memory-strip"><Icon name="spark"/><span><b>12 positive moments</b><small>Your cruise memory is growing.</small></span></div></DemoPhone>

const ConnectionsScreen = () => <DemoPhone label="CruiseConnect · passenger view"><div className="cc-app-head"><span className="cc-small-mark"><Icon name="people"/></span><div><small>PASSENGER CONNECTION</small><b>Connect onboard</b></div><span>MA</span></div><div className="exec-context-tabs"><b>Nearby</b><span>Shared activity</span><span>Interests</span></div><div className="exec-person"><span>SK</span><div><b>Sofia</b><small>Nearby · Fitness · Wellness</small></div><em>Opted in</em></div><p className="exec-prompt">Send a positive first message</p><div className="exec-choice-list"><button>Great energy</button><button>That was kind of you</button><button>You seemed friendly</button></div><div className="exec-safety"><Icon name="shield"/><span>Predefined first contact · acknowledgement required · public places only</span></div></DemoPhone>

const CrewScreen = () => <DemoPhone label="CruiseConnect · passenger view"><div className="cc-app-head"><span className="cc-small-mark"><Icon name="crew"/></span><div><small>CREW RECOGNITION</small><b>Say thank you now</b></div><span>MA</span></div><div className="exec-badge"><span>AN</span><div><small>BADGE IDENTIFIED</small><b>Ana Rodrigues</b><em>Dining · Meridian Restaurant</em></div><Icon name="check"/></div><p className="exec-prompt">Choose up to two reasons</p><div className="exec-reason-grid"><button className="selected">Made us feel welcome</button><button>Exceptional service</button><button>Went above and beyond</button><button>Solved a problem</button></div><button className="exec-primary">Send recognition</button><small className="exec-rule">One recognition per guest → crew member → sailing day</small></DemoPhone>

const RecoveryScreen = () => <DemoPhone label="CruiseConnect · passenger view"><div className="cc-app-head"><span className="cc-small-mark warm"><Icon name="help"/></span><div><small>PRIVATE SERVICE RECOVERY</small><b>Let’s fix it onboard</b></div><span>MA</span></div><p className="exec-prompt">What do you need help with?</p><div className="exec-issue-list"><button>Cabin issue <span>›</span></button><button className="selected">Excursion issue <span>›</span></button><button>Dining problem <span>›</span></button><button>Accessibility need <span>›</span></button></div><button className="exec-primary warm">Send to service team</button><div className="exec-ack"><Icon name="check"/><span><b>Issue acknowledged</b><small>Assigned to Shore Experiences · 2 min ago</small></span></div></DemoPhone>

const CommerceScreen = () => <DemoPhone label="CruiseConnect · passenger view"><div className="cc-app-head"><span className="cc-small-mark gold"><Icon name="cart"/></span><div><small>SHARED INTEREST</small><b>Discover together</b></div><span>MA</span></div><div className="exec-commerce-photo"><img src="/media/cruise-family-experience.jpg" alt="Passengers choosing an onboard experience"/><span>9 seats left</span></div><div className="exec-offer"><small>FOOD EXPERIENCE · TONIGHT</small><h3>Mediterranean tasting</h3><p>7 passengers with your food interest are considering this experience. Three are positive connections.</p><div><b>8:30 PM</b><b>Deck 7</b><b>$49 pp</b></div><button>Continue in Oceanic booking →</button></div><small className="exec-rule">Inventory, price, checkout and payment remain with Oceanic Voyages.</small></DemoPhone>

const ManagementScreen = () => {
  const [tab, setTab] = useState<'Today'|'Crew'|'Recovery'|'Revenue'>('Today')
  const panels = {
    Today: { value: '48%', label: 'Passenger activation', detail: '812 recognitions · 93% resolved onboard' },
    Crew: { value: '812', label: 'Crew recognitions', detail: '536 unique guests · 6 of 7 sailing days' },
    Recovery: { value: '93%', label: 'Resolved onboard', detail: '2m median acknowledgement · 14m resolution' },
    Revenue: { value: '$18.4K', label: 'Attributed booking value', detail: 'Illustrative pilot measurement' },
  }
  const panel = panels[tab]
  return <div className="exec-dashboard"><div className="exec-dash-bar"><div><span className="cc-mark"><Icon name="spark"/></span><b>CruiseConnect</b><small>Management</small></div><span>Mediterranean Escape · Day 4</span></div><div className="exec-dash-tabs">{(Object.keys(panels) as Array<keyof typeof panels>).map(item=><button key={item} className={tab===item?'active':''} onClick={()=>setTab(item)}>{item}</button>)}</div><div className="exec-dash-main"><section><small>{tab.toUpperCase()} · ILLUSTRATIVE PILOT DATA</small><strong>{panel.value}</strong><h3>{panel.label}</h3><p>{panel.detail}</p></section><div className="exec-mini-kpis"><article><span>ACTIVE GUESTS</span><b>4,286</b><em>+7.4 pts</em></article><article><span>OPEN ISSUES</span><b>7</b><em>Prioritised</em></article><article><span>PULSE TODAY</span><b>4.6</b><em>Private</em></article></div><div className="exec-chart"><span style={{height:'38%'}}/><span style={{height:'49%'}}/><span style={{height:'57%'}}/><span style={{height:'68%'}}/><span style={{height:'76%'}}/><span style={{height:'85%'}}/><span style={{height:'94%'}}/></div><div className="exec-action-list"><article><i className="urgent">URGENT</i><span>Accessibility support · Deck 5</span><b>Open →</b></article><article><i>IN PROGRESS</i><span>Excursion meeting-point clarification</span><b>Review →</b></article></div></div><p className="exec-manager-help"><Icon name="chart"/> Managers select a workstream, review live signals, open priority items and export the agreed pilot report.</p></div>
}

const IntegrationScreen = () => <div className="exec-integration"><div className="exec-integration-head"><small>CONNECTOR MODEL</small><h3>Regreenity fits between the cruise app and systems already in place.</h3></div><div className="exec-system-flow"><article className="host"><Icon name="ship"/><b>Existing cruise app</b><span>Brand · navigation · identity</span></article><div className="exec-flow-arrow">→<small>signed launch context</small></div><article className="core"><span className="cc-mark"><Icon name="spark"/></span><b>CruiseConnect</b><span>Regreenity experience layer</span></article><div className="exec-flow-arrow">→<small>approved events</small></div><article className="systems"><Icon name="layers"/><b>Existing systems</b><span>Ship APIs · CRM · booking · BI</span></article></div><div className="exec-connector-grid"><article><Icon name="lock"/><b>Identity connector</b><p>Sailing-scoped guest and crew context from the trusted host.</p></article><article><Icon name="people"/><b>Native capability bridge</b><p>Approved proximity, notification and onboard-device functions.</p></article><article><Icon name="help"/><b>Operations connector</b><p>Routes private service issues to existing onboard teams.</p></article><article><Icon name="cart"/><b>Commerce handoff</b><p>Returns eligible intent to current inventory and checkout.</p></article></div><div className="exec-config-note"><Icon name="check"/><div><b>Configurable at pilot setup</b><span>Feature name · cruise-line logo · colours · app placement · venues · departments · inventory mappings · reporting KPIs</span></div></div></div>

const OverviewScreen = ({ start }: { start: () => void }) => <div className="exec-overview-screen"><div className="exec-overview-brand"><span className="cc-mark"><Icon name="spark"/></span><div><small>REGREENITY PRODUCT EXPERIENCE</small><b>CruiseConnect</b></div></div><h3>Connect the moments that shape a sailing.</h3><p>A complete passenger and management layer embedded in the cruise line’s existing app.</p><div className="exec-value-grid"><article><Icon name="people"/><b>Passenger connection</b></article><article><Icon name="crew"/><b>Crew recognition</b></article><article><Icon name="help"/><b>Service recovery</b></article><article><Icon name="cart"/><b>Participation & commerce</b></article><article><Icon name="chart"/><b>Management insight</b></article><article><Icon name="layers"/><b>Host-system connectors</b></article></div><button onClick={start}>Start the product tour <Icon name="arrow"/></button></div>

const PilotScreen = () => <div className="exec-pilot-screen"><small>COMPLETE ONE-SHIP PILOT</small><h3>Configure. Connect. Activate. Measure.</h3><div className="exec-pilot-steps"><article><span>01</span><b>Configure</b><p>Rename and co-brand CruiseConnect for the operator.</p></article><article><span>02</span><b>Connect</b><p>Integrate identity, ship operations, booking and reporting.</p></article><article><span>03</span><b>Activate</b><p>Deploy every passenger and management workflow.</p></article><article><span>04</span><b>Measure</b><p>Track agreed activation, recovery, recognition and commercial outcomes.</p></article></div><a href="/pilot/#contact">Request a pilot conversation <Icon name="arrow"/></a><p>No isolated-module pilot. The complete connected experience is deployed and evaluated together.</p></div>

const StepVisual = ({ step, go }: { step: number; go: (step: number) => void }) => {
  if (step === 0) return <OverviewScreen start={()=>go(1)}/>
  if (step === 1) return <HostAppScreen openFeature={()=>go(2)}/>
  if (step === 2) return <FeatureHub go={go}/>
  if (step === 3) return <ConnectionsScreen/>
  if (step === 4) return <CrewScreen/>
  if (step === 5) return <RecoveryScreen/>
  if (step === 6) return <CommerceScreen/>
  if (step === 7) return <ManagementScreen/>
  if (step === 8) return <IntegrationScreen/>
  return <PilotScreen/>
}

export default function ExecutiveWalkthrough() {
  const [step, setStep] = useState(readStep)
  const current = steps[step]
  const go = (next: number) => {
    const safe = Math.min(steps.length - 1, Math.max(0, next))
    const url = new URL(window.location.href)
    url.searchParams.delete('view')
    if (safe === 0) url.searchParams.delete('step')
    else url.searchParams.set('step', String(safe))
    window.history.pushState({}, '', `${url.pathname}${url.search}`)
    setStep(safe)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  useEffect(() => {
    const onPop = () => setStep(readStep())
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])
  const phaseTargets = [{label:'Overview',step:0},{label:'Cruise app',step:1},{label:'Passenger',step:2},{label:'Management',step:7},{label:'Integration',step:8},{label:'Pilot',step:9}]
  return <div className="exec-demo"><header className="exec-header"><a href="/" className="exec-brand"><span className="cc-mark"><Icon name="spark"/></span><span><b>Regreenity</b><small>Executive product tour</small></span></a><nav aria-label="Tour phases">{phaseTargets.map(item=><button key={item.label} className={current.phase===item.label?'active':''} onClick={()=>go(item.step)}>{item.label}</button>)}</nav><a href="/pilot/#contact" className="exec-header-cta">Request a pilot <Icon name="arrow"/></a></header><main className="exec-stage"><aside className="exec-story"><div><span className="exec-step-count">{String(step+1).padStart(2,'0')} / {String(steps.length).padStart(2,'0')}</span><small>{current.phase}</small></div><h1>{current.title}</h1><p>{current.description}</p><div className="exec-benefit"><Icon name="check"/><span><b>Executive benefit</b>{current.benefit}</span></div>{step===1&&<p className="exec-naming-note"><b>Can “CruiseConnect” be changed?</b> Yes. It is the default demonstration label; the operator can rename and co-brand it without changing the underlying product.</p>}{step>=2&&step<=6&&<div className="exec-feature-shortcuts" aria-label="Passenger features">{passengerFeatures.map(feature=><button key={feature.step} className={step===feature.step?'active':''} onClick={()=>go(feature.step)}><Icon name={feature.icon}/><span>{feature.title}</span></button>)}</div>}</aside><section className="exec-visual" aria-live="polite"><StepVisual step={step} go={go}/></section></main><footer className="exec-controls"><button onClick={()=>go(step-1)} disabled={step===0}>← Back</button><div role="tablist" aria-label="Product tour steps">{steps.map((item,index)=><button key={`${item.phase}-${index}`} role="tab" aria-selected={step===index} aria-label={`Go to step ${index+1}: ${item.title}`} className={step===index?'active':''} onClick={()=>go(index)}><span/></button>)}</div>{step<steps.length-1?<button className="next" onClick={()=>go(step+1)}>Next <Icon name="arrow"/></button>:<a className="next" href="/pilot/#contact">Request a pilot <Icon name="arrow"/></a>}</footer></div>
}
