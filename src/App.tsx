import { useMemo, useState } from 'react'
import { affirmations, kpis, passengerSignals, recognitionReasons } from './data'
import type { View } from './types'

const Icon = ({ name, size = 20 }: { name: string; size?: number }) => {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  const paths: Record<string, JSX.Element> = {
    spark: <><path d="M12 3l1.7 4.3L18 9l-4.3 1.7L12 15l-1.7-4.3L6 9l4.3-1.7L12 3Z"/><path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15Z"/></>,
    crew: <><circle cx="12" cy="8" r="3.2"/><path d="M5.5 20c.6-4 3-6 6.5-6s5.9 2 6.5 6"/><path d="M8 4.8h8"/></>,
    heart: <path d="M20.8 4.7a5.5 5.5 0 0 0-7.8 0L12 5.8l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.5 1-1a5.5 5.5 0 0 0 0-7.8Z"/>,
    help: <><circle cx="12" cy="12" r="9"/><path d="M9.7 9a2.5 2.5 0 1 1 3.7 2.2c-.9.5-1.4 1.1-1.4 2.3"/><path d="M12 17h.01"/></>,
    people: <><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.2"/><path d="M3 20c.6-4.1 2.8-6.2 6-6.2s5.4 2.1 6 6.2"/><path d="M15 14.4c2.8 0 4.7 1.7 5.2 4.8"/></>,
    cart: <><path d="M3 4h2l2 11h10l2-7H7"/><circle cx="9" cy="19" r="1"/><circle cx="17" cy="19" r="1"/></>,
    share: <><circle cx="18" cy="5" r="2"/><circle cx="6" cy="12" r="2"/><circle cx="18" cy="19" r="2"/><path d="M8 11l8-5M8 13l8 5"/></>,
    chart: <><path d="M4 19V9"/><path d="M10 19V5"/><path d="M16 19v-7"/><path d="M22 19V3"/></>,
    arrow: <path d="M5 12h14M14 7l5 5-5 5"/>,
    check: <path d="m5 12 4 4L19 6"/>,
    shield: <><path d="M12 3 5 6v5c0 4.7 2.8 8.1 7 10 4.2-1.9 7-5.3 7-10V6l-7-3Z"/><path d="m9 12 2 2 4-4"/></>,
    camera: <><path d="M4 8h3l1.5-2h7L17 8h3v10H4V8Z"/><circle cx="12" cy="13" r="3"/></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 7h18s-3 0-3-7"/><path d="M10 19h4"/></>,
    ship: <><path d="M4 17h16l-2 3H6l-2-3Z"/><path d="M8 17V8h8v9"/><path d="M10 8V4h4v4"/><path d="M3 13h18"/></>,
  }
  return <svg aria-hidden="true" {...common}>{paths[name]}</svg>
}

const navItems: { key: View; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'passenger', label: 'Passenger module' },
  { key: 'crew', label: 'Crew & recovery' },
  { key: 'commerce', label: 'Participation & commerce' },
  { key: 'dashboard', label: 'Cruise dashboard' },
]

const Flywheel = () => {
  const steps = [
    ['G', 'Great interaction'],
    ['A', 'Affirmation'],
    ['M', 'More participation & interaction'],
    ['M', 'More activity & commerce'],
    ['E', 'End-of-cruise summary'],
    ['S', 'Social sharing'],
    ['O', 'Organic exposure'],
  ]
  return (
    <div className="flywheel">
      {steps.map(([letter, label], i) => (
        <div className="fly-step" key={label}>
          <div className="fly-badge">{letter}</div>
          <div>
            <strong>{label}</strong>
            <span>{i < steps.length - 1 ? 'Feeds the next positive moment' : 'Brings the story beyond the ship'}</span>
          </div>
          {i < steps.length - 1 && <div className="fly-arrow"><Icon name="arrow" size={18}/></div>}
        </div>
      ))}
    </div>
  )
}

const PhoneShell = ({ children, label = 'Guest module' }: { children: React.ReactNode; label?: string }) => (
  <div className="phone-wrap">
    <div className="phone-label"><span className="live-dot" /> {label}</div>
    <div className="phone">
      <div className="phone-top"><span>9:41</span><div className="island"/><span>5G ▰</span></div>
      {children}
    </div>
  </div>
)

function Overview({ setView }: { setView: (v: View) => void }) {
  return (
    <main>
      <section className="hero section-shell">
        <div className="hero-copy">
          <div className="eyebrow"><Icon name="ship" size={16}/> White-label add-to-app module</div>
          <h1>Turn positive onboard interactions into <span>recognition, recovery, participation and revenue.</span></h1>
          <p className="lead">Cruise Connection gives guests a safe way to recognize crew, exchange predefined positive signals, join activities, resolve service issues privately, and carry their best cruise moments home.</p>
          <div className="hero-actions">
            <button className="btn primary" onClick={() => setView('passenger')}>Explore passenger module <Icon name="arrow" size={18}/></button>
            <button className="btn ghost" onClick={() => setView('dashboard')}>View cruise dashboard</button>
          </div>
          <div className="trust-row">
            <span><Icon name="check" size={15}/> No open chat</span>
            <span><Icon name="check" size={15}/> No dating</span>
            <span><Icon name="check" size={15}/> No public ratings</span>
            <span><Icon name="check" size={15}/> Private recovery route</span>
          </div>
        </div>
        <PhoneShell label="White-label passenger preview">
          <div className="mobile-head">
            <div><small>Day 4 of 7</small><strong>Mediterranean Escape</strong></div>
            <div className="avatar">MA</div>
          </div>
          <div className="sun-card">
            <small>GOOD AFTERNOON, MARIA</small>
            <h3>Who made your day better?</h3>
            <p>A quick positive note takes seconds.</p>
            <button onClick={() => setView('crew')}>Recognize someone <Icon name="arrow" size={16}/></button>
          </div>
          <div className="quick-grid">
            <button onClick={() => setView('crew')}><span><Icon name="crew"/></span><b>Recognize crew</b><small>Say thank you now</small></button>
            <button onClick={() => setView('crew')}><span><Icon name="help"/></span><b>Need help?</b><small>Private service route</small></button>
            <button onClick={() => setView('passenger')}><span><Icon name="people"/></span><b>Positive moments</b><small>Affirm & invite</small></button>
            <button onClick={() => setView('commerce')}><span><Icon name="cart"/></span><b>Join together</b><small>Activities you share</small></button>
          </div>
          <div className="moment-strip">
            <div><Icon name="spark" size={18}/><span><b>12</b> positive moments</span></div>
            <small>Your cruise story is growing.</small>
          </div>
        </PhoneShell>
      </section>

      <section className="section-shell value-section">
        <div className="section-kicker">ONE MODULE · MULTIPLE CRUISE-LINE OUTCOMES</div>
        <div className="value-grid">
          <article><div className="iconbox"><Icon name="crew"/></div><h3>Crew recognition</h3><p>Capture named, contextual recognition while the moment is still fresh.</p></article>
          <article><div className="iconbox"><Icon name="help"/></div><h3>Service recovery</h3><p>Route problems privately while the guest is still onboard and they can still be fixed.</p></article>
          <article><div className="iconbox"><Icon name="people"/></div><h3>Positive connection</h3><p>Predefined affirmations and invitations create first contact without open messaging.</p></article>
          <article><div className="iconbox"><Icon name="cart"/></div><h3>Participation & commerce</h3><p>Turn shared interest into real activities and measurable incremental spend.</p></article>
          <article><div className="iconbox"><Icon name="share"/></div><h3>Shareable memories</h3><p>Give guests and crew a personal end-of-cruise summary built for organic sharing.</p></article>
        </div>
      </section>

      <section className="section-shell gamme-section">
        <div className="gamme-copy">
          <div className="section-kicker light">THE OPERATING FLYWHEEL</div>
          <h2>GAMMESO turns one good moment into the next.</h2>
          <p>The product is designed to amplify the positive human interactions already happening onboard—not create a parallel social network.</p>
        </div>
        <Flywheel />
      </section>

      <section className="section-shell split-section">
        <div>
          <div className="section-kicker">BUILT TO FIT THE APP YOU ALREADY HAVE</div>
          <h2>An engagement layer, not another cruise app.</h2>
          <p className="body-large">Cruise Connection can sit inside the cruise line's existing passenger experience as a branded module. The operator keeps its identity, inventory, payments and customer relationship.</p>
          <div className="bullet-stack">
            <div><Icon name="check"/><span><b>White-label by design</b><small>Ship, sailing and brand context remain native to the cruise line.</small></span></div>
            <div><Icon name="shield"/><span><b>Constrained interaction</b><small>No unrestricted chat, no dating layer, no public popularity scores.</small></span></div>
            <div><Icon name="chart"/><span><b>Measurable outcomes</b><small>Recognition, recovery, participation, conversion and sharing in one dashboard.</small></span></div>
          </div>
        </div>
        <div className="integration-card">
          <div className="integration-top"><span>CRUISE-LINE APP</span><span>+</span><b>CRUISE CONNECTION</b></div>
          <div className="integration-flow">
            <div>Guest identity</div><Icon name="arrow"/><div>Positive interaction layer</div><Icon name="arrow"/><div>Existing booking & inventory</div>
          </div>
          <div className="integration-note">API · embedded mobile web · SDK</div>
        </div>
      </section>
    </main>
  )
}

function PassengerModule() {
  const [sent, setSent] = useState<string | null>(null)
  return (
    <main className="page section-shell">
      <div className="page-head"><div><div className="section-kicker">PASSENGER MODULE</div><h1>Positive first contact. Nothing more is required.</h1><p>Guests can affirm, invite and then meet in the real world. If they want to continue communicating, they can use the ship's own chat or exchange contact details in person.</p></div><div className="pill">Verified same-sailing guests only</div></div>
      <div className="demo-grid">
        <PhoneShell>
          <div className="mobile-head"><div><small>Positive moments</small><strong>People from your sailing</strong></div><div className="avatar">MA</div></div>
          <div className="person-card"><div className="person-avatar">JL</div><div><strong>Jonas</strong><small>Trivia · Deck 6</small></div><span>Same sailing</span></div>
          <p className="mobile-prompt">Send a predefined positive note</p>
          <div className="signal-list">
            {passengerSignals.map(signal => <button className={sent === signal ? 'selected' : ''} key={signal} onClick={() => setSent(signal)}><Icon name="heart" size={16}/>{signal}{sent === signal && <span>Sent</span>}</button>)}
          </div>
          <div className="divider"><span>or invite them</span></div>
          <div className="invite-row"><button>Join our trivia team</button><button>Dinner tonight?</button><button>Shore excursion?</button></div>
          <div className="safety-note"><Icon name="shield" size={16}/><span>No free-text messages. No dating mode. Ignore, block and report are always available.</span></div>
        </PhoneShell>
        <div className="explain-stack">
          <article className="feature-large"><div className="number">01</div><div><h3>Affirm</h3><p>A constrained vocabulary makes the first interaction positive, lightweight and enterprise-safe.</p></div></article>
          <article className="feature-large"><div className="number">02</div><div><h3>Invite</h3><p>Structured invitations give guests a reason to meet around an actual onboard moment.</p></div></article>
          <article className="feature-large"><div className="number">03</div><div><h3>Meet</h3><p>The ship itself is the social environment. Cruise Connection does not need to host the relationship.</p></div></article>
          <article className="feature-large accent"><div className="number">04</div><div><h3>Remember</h3><p>Every positive signal can become part of the guest's end-of-cruise summary and shareable memory.</p></div></article>
        </div>
      </div>
      <section className="summary-preview">
        <div><div className="section-kicker light">END-OF-CRUISE MEMORY</div><h2>A positive artifact guests actually want to share.</h2><p>Public sharing contains the recipient's affirmations—not the private identities of the people who sent them.</p></div>
        <div className="share-card"><small>MEDITERRANEAN ESCAPE · AUGUST 2026</small><h3>Your Cruise Connection</h3><p>The positive moments you collected at sea.</p><div className="affirm-grid">{affirmations.map(a => <div key={a.label} className={`affirm ${a.tone}`}><b>{a.count}</b><span>{a.label}</span></div>)}</div><div className="share-footer"><span>Powered by Cruise Connection</span><button><Icon name="share" size={16}/> Share</button></div></div>
      </section>
    </main>
  )
}

function CrewRecovery() {
  const [reason, setReason] = useState('Made us feel welcome')
  const [issue, setIssue] = useState('Excursion issue')
  return (
    <main className="page section-shell">
      <div className="page-head"><div><div className="section-kicker">CREW RECOGNITION + SERVICE RECOVERY</div><h1>Recognize the good. Recover the bad. While the guest is still onboard.</h1><p>Positive crew recognition and private problem resolution are deliberately separate flows.</p></div></div>
      <div className="dual-demo">
        <PhoneShell label="Recognition flow">
          <div className="mobile-head"><div><small>Crew recognition</small><strong>Say thank you now</strong></div><div className="avatar"><Icon name="crew" size={18}/></div></div>
          <div className="badge-capture"><div className="camera-ring"><Icon name="camera" size={28}/></div><h3>Photograph the crew badge</h3><p>Capture the visible employee identifier. No facial recognition.</p><button>Open camera</button></div>
          <div className="identified"><span className="crew-photo">AN</span><div><small>IDENTIFIED CREW MEMBER</small><strong>Ana · Dining team</strong><span>Meridian Restaurant · 8:14 PM</span></div><Icon name="check"/></div>
          <p className="mobile-prompt">What would you like to recognize?</p>
          <div className="recognition-chips">{recognitionReasons.map(r => <button onClick={() => setReason(r)} className={reason === r ? 'active' : ''} key={r}>{r}</button>)}</div>
          <button className="mobile-primary">Send recognition</button>
        </PhoneShell>
        <PhoneShell label="Private service recovery">
          <div className="mobile-head"><div><small>Need help?</small><strong>Let's fix it onboard</strong></div><div className="avatar"><Icon name="help" size={18}/></div></div>
          <div className="help-intro"><div className="help-icon"><Icon name="bell"/></div><h3>Tell the right team now</h3><p>This is a private service route—not a public review.</p></div>
          <p className="mobile-prompt">What do you need help with?</p>
          <div className="issue-list">{['Cabin issue','Dining problem','Excursion issue','Billing question','Accessibility need','Lost item'].map(x => <button key={x} className={issue===x?'active':''} onClick={()=>setIssue(x)}>{x}<span>›</span></button>)}</div>
          <button className="mobile-primary warning">Send to service team</button>
          <div className="recovery-status"><span className="status-dot"/><div><b>Typical pilot flow</b><small>Acknowledge → assign → resolve → close loop with guest</small></div></div>
        </PhoneShell>
      </div>
      <section className="crew-summary-band">
        <div><div className="section-kicker light">CREW EXPERIENCE</div><h2>Recognition becomes a meaningful record—not a popularity contest.</h2><p>Crew can receive a personal recognition summary. Management can view structured operational trends without creating public rankings.</p></div>
        <div className="crew-score-card"><div className="crew-score-head"><span className="crew-photo big">AN</span><div><small>THIS SAILING</small><h3>Ana's recognition</h3></div></div><div className="score-row"><b>18</b><span>Made us feel welcome</span></div><div className="score-row"><b>12</b><span>Went above and beyond</span></div><div className="score-row"><b>9</b><span>Exceptional service</span></div><div className="score-row"><b>7</b><span>Made our trip memorable</span></div></div>
      </section>
    </main>
  )
}

function Commerce() {
  return (
    <main className="page section-shell">
      <div className="page-head"><div><div className="section-kicker">PARTICIPATION & COMMERCE</div><h1>Use shared interest to fill real experiences—not push generic ads.</h1><p>Cruise Connection detects when positive interaction creates a natural reason to participate together, then routes the booking back into the cruise line's own commerce environment.</p></div><div className="pill coral">Attribution-ready</div></div>
      <div className="commerce-grid">
        <div className="intent-panel">
          <div className="panel-head"><div><small>GROUP INTENT SIGNAL</small><h3>Tonight's Mediterranean tasting</h3></div><span className="occupancy">9 seats left</span></div>
          <div className="group-avatars"><span>MA</span><span>JL</span><span>SK</span><span>+2</span></div>
          <p><b>3 people you've positively connected with</b> have shown interest in this experience.</p>
          <div className="experience-meta"><span>8:30 PM</span><span>Deck 7</span><span>$49 pp</span></div>
          <button className="btn primary">View in cruise-line booking <Icon name="arrow" size={17}/></button>
          <small className="fine">Inventory, price and payment remain with the cruise line.</small>
        </div>
        <div className="commerce-logic">
          <div className="logic-line"><span>1</span><div><b>Positive connection</b><small>Guests interact around a real onboard moment.</small></div></div>
          <div className="logic-line"><span>2</span><div><b>Shared interest</b><small>The group expresses interest in the same activity or inventory.</small></div></div>
          <div className="logic-line"><span>3</span><div><b>Timely recommendation</b><small>Relevant availability is surfaced without becoming an ad feed.</small></div></div>
          <div className="logic-line"><span>4</span><div><b>Attributed conversion</b><small>Booking is measured against a control or agreed attribution logic.</small></div></div>
        </div>
      </div>
      <section className="inventory-section">
        <div><div className="section-kicker">PERISHABLE INVENTORY</div><h2>A smarter way to surface what still has capacity.</h2></div>
        <div className="inventory-table"><div className="table-head"><span>Experience</span><span>Availability</span><span>Relevant groups</span><span>Signal</span></div>{[
          ['Chef’s table','8 seats','6 groups','High'],['Sunset spa circuit','11 spots','4 groups','Medium'],['Coastal excursion','14 seats','9 groups','High'],['Late show upgrade','21 seats','7 groups','Medium']
        ].map(row => <div className="table-row" key={row[0]}>{row.map((x,i)=><span key={x} className={i===3?`signal ${x.toLowerCase()}`:''}>{x}</span>)}</div>)}</div>
      </section>
    </main>
  )
}

function Dashboard() {
  const bars = useMemo(() => [54, 70, 61, 82, 76, 92, 88], [])
  return (
    <main className="page section-shell dashboard-page">
      <div className="dash-top"><div><div className="section-kicker">CRUISE-LINE DASHBOARD</div><h1>Mediterranean Escape · Sailing 0826</h1><p>White-label pilot performance · Day 4 of 7</p></div><div className="dash-actions"><button className="btn ghost">Export pilot report</button><button className="btn primary">View live issues</button></div></div>
      <div className="kpi-grid">{kpis.map(k => <article key={k.label}><div className="kpi-top"><span>{k.label}</span><b>{k.trend}</b></div><strong>{k.value}</strong><small>{k.detail}</small></article>)}</div>
      <div className="dash-grid">
        <section className="chart-card"><div className="card-head"><div><small>POSITIVE INTERACTION</small><h3>Recognition & affirmation volume</h3></div><span>7-day sailing</span></div><div className="bar-chart">{bars.map((b,i)=><div className="bar-col" key={i}><div className="bar" style={{height:`${b}%`}}><span>{120+i*17}</span></div><small>D{i+1}</small></div>)}</div></section>
        <section className="recovery-card"><div className="card-head"><div><small>SERVICE RECOVERY</small><h3>Open issues</h3></div><span className="badge-green">93% resolved onboard</span></div><div className="issue-metric"><strong>7</strong><span>currently open</span></div><div className="recovery-bars"><div><span>Under 15 min</span><div><i style={{width:'68%'}}/></div><b>68%</b></div><div><span>15–30 min</span><div><i style={{width:'23%'}}/></div><b>23%</b></div><div><span>30+ min</span><div><i style={{width:'9%'}}/></div><b>9%</b></div></div></section>
        <section className="recognition-card"><div className="card-head"><div><small>CREW RECOGNITION</small><h3>What guests are recognizing</h3></div><span>812 total</span></div><div className="donut-area"><div className="donut"><div>812<small>moments</small></div></div><div className="legend"><span><i className="l1"/>Made us feel welcome <b>31%</b></span><span><i className="l2"/>Went above and beyond <b>24%</b></span><span><i className="l3"/>Exceptional service <b>19%</b></span><span><i className="l4"/>Other positive reasons <b>26%</b></span></div></div></section>
        <section className="revenue-card"><div className="card-head"><div><small>COMMERCE ATTRIBUTION</small><h3>Social-intent conversion</h3></div><span>Pilot estimate</span></div><div className="revenue-big"><strong>$18,420</strong><small>attributed gross booking value</small></div><div className="revenue-lines"><div><span>Specialty dining</span><b>$6,820</b></div><div><span>Excursions</span><b>$5,970</b></div><div><span>Activities & spa</span><b>$3,880</b></div><div><span>Other experiences</span><b>$1,750</b></div></div><div className="control-note"><Icon name="chart" size={17}/><span>Final pilot should validate incrementality using treatment/control measurement where feasible.</span></div></section>
      </div>
      <section className="gamme-dash"><div><div className="section-kicker light">GAMMESO HEALTH</div><h2>One operational view of the entire positive-interaction loop.</h2></div><div className="gamme-metrics">{[['G','1,406','Great interactions'],['A','1,118','Affirmations'],['M','428','Joined activities'],['M','$18.4K','Activity commerce'],['E','322','Summaries ready'],['S','127','Shares initiated'],['O','39.4%','Share rate']].map(([l,v,t])=><div key={t}><span>{l}</span><b>{v}</b><small>{t}</small></div>)}</div></section>
    </main>
  )
}

export default function App() {
  const [view, setView] = useState<View>('overview')
  return (
    <div className="app">
      <header className="topbar">
        <button className="brand" onClick={() => setView('overview')} aria-label="Cruise Connection home"><span className="brand-mark"><Icon name="spark" size={19}/></span><span>Cruise <b>Connection</b></span></button>
        <nav>{navItems.map(item => <button key={item.key} onClick={()=>setView(item.key)} className={view===item.key?'active':''}>{item.label}</button>)}</nav>
        <div className="demo-badge">PILOT DEMO</div>
      </header>
      {view === 'overview' && <Overview setView={setView}/>} 
      {view === 'passenger' && <PassengerModule/>}
      {view === 'crew' && <CrewRecovery/>}
      {view === 'commerce' && <Commerce/>}
      {view === 'dashboard' && <Dashboard/>}
      <footer><div className="footer-brand"><span className="brand-mark"><Icon name="spark" size={17}/></span><span>Cruise Connection</span></div><p>White-label positive interaction infrastructure for cruise lines.</p><span>Demo data only · No cruise-line affiliation implied</span></footer>
    </div>
  )
}
