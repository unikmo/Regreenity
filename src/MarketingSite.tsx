import { useState, type FormEvent, type ReactNode } from 'react'

const Arrow = () => <span aria-hidden="true">→</span>
const contactHref = '/pilot/#contact'
const demoHref = '/product-app/'

type StoryCrop = 'passenger' | 'crew' | 'recovery' | 'engagement' | 'revenue'
type PageKey = 'home' | 'passenger' | 'crew' | 'recovery' | 'engagement' | 'revenue' | 'dashboard' | 'integration' | 'pilot'

type Detail = {
  eyebrow: string
  title: string
  intro: string
  crop: StoryCrop
  alt: string
  facts: { title: string; body: string }[]
  note?: string
}

const details: Record<Exclude<PageKey, 'home'>, Detail> = {
  passenger: {
    eyebrow: 'PASSENGER EXPERIENCE',
    title: 'Turn a good passenger moment into an anonymous vibe.',
    intro: 'An adult passenger photographs another adult inside the cruise-line app. The operator privately confirms recognised or unavailable; the sender chooses a prepared compliment and the receiver never learns who sent it.',
    crop: 'passenger',
    alt: 'Multicultural cruise passengers of different ages relaxing together',
    facts: [
      { title: 'No passenger directory', body: 'The sender sees no receiver name, profile, candidate list or confidence score. The capture is discarded after operator-side matching.' },
      { title: 'Anonymous delivery', body: 'The stored vibe has no sender identity and is delivered after randomized delay or in a batch so timing cannot reveal the sender.' },
      { title: 'Adult-only safeguards', body: 'Children are excluded. The operator also blocks same-cabin or booking-group compliments, duplicate attempts and abusive use.' },
      { title: 'Private Top Five card', body: 'Dense ranking gives tied passengers the same position. The passenger—not the cruise line—decides whether to share their own Vibe Card.' },
    ],
  },
  crew: {
    eyebrow: 'CREW RECOGNITION',
    title: 'Let great service be seen while it is happening.',
    intro: 'A passenger frames the visible crew name badge, confirms the match and sends instant recognition while the service moment is still fresh.',
    crop: 'crew',
    alt: 'Diverse cruise crew members sharing a candid end-of-shift moment',
    facts: [
      { title: 'Reliable identification', body: 'Take a badge photo—or a voluntary selfie with the crew member. When names are duplicated, an operator-controlled face match can resolve the correct crew record.' },
      { title: 'Biometrics stay operator-side', body: 'The image, face template and match score remain on-device, ship-local or in the cruise line’s own identity service. Regreenity never receives them.' },
      { title: 'Recognition, not ranking', body: 'Passengers choose up to two prepared positive reasons. Public crew leaderboards and passenger-facing star ratings are excluded.' },
      { title: 'Aggregate evidence', body: 'Regreenity receives only threshold-protected sailing, reason and department totals; individual records remain with the operator.' },
    ],
  },
  recovery: {
    eyebrow: 'SERVICE RECOVERY',
    title: 'Resolve the moment while it still matters.',
    intro: 'Regreenity gives guests a private route to signal friction during the journey so the operator has a chance to respond before the sailing ends.',
    crop: 'recovery',
    alt: 'Cruise crew member returning a child’s toy beside their parent',
    facts: [
      { title: 'Private by design', body: 'Service issues are separated from positive recognition and passenger interaction.' },
      { title: 'Closed-loop intent', body: 'The workflow is designed around capture, routing, acknowledgement, resolution and a follow-up signal.' },
      { title: 'Experience Pulse', body: 'A lightweight private pulse can help the operator understand department-level experience without creating a public rating system.' },
    ],
  },
  engagement: {
    eyebrow: 'ENGAGEMENT',
    title: 'Make participation—and feedback—feel effortless.',
    intro: 'Regreenity helps guests discover relevant onboard moments and gives leaders immediate structured feedback after live events through three to five quick questions without free text.',
    crop: 'engagement',
    alt: 'Multigenerational passengers enjoying an inclusive deck activity',
    facts: [
      { title: 'Interest-led', body: 'Guests can voluntarily share cruise-relevant interests that help shape discovery and participation.' },
      { title: 'Context-aware', body: 'Activity and sailing context can make recommendations feel more relevant than a generic feed.' },
      { title: 'Positive interaction', body: 'The interaction model is designed around structured, positive steps rather than unrestricted stranger messaging.' },
      { title: 'Immediate event feedback', body: 'Guests rate live events with a small set of prepared questions. Leaders see results immediately, while the cruise line controls whether aggregated ratings are published.' },
    ],
  },
  revenue: {
    eyebrow: 'ANCILLARY REVENUE',
    title: 'Make relevance commercial without turning the journey into a catalogue.',
    intro: 'Regreenity can create recommendation and intent context around relevant onboard experiences while leaving inventory, price, checkout and payment with the cruise line.',
    crop: 'revenue',
    alt: 'A multicultural family choosing an onboard experience together',
    facts: [
      { title: 'Context before offer', body: 'Commercial relevance can come from expressed interests, onboard participation and timing rather than a generic advertising feed.' },
      { title: 'Host-owned commerce', body: 'Regreenity does not need to own inventory, pricing, checkout or payment; those remain in the cruise line’s commerce environment.' },
      { title: 'Pilot-measurable', body: 'A pilot can define attribution or treatment/control logic before any performance claim is made.' },
    ],
  },
  dashboard: {
    eyebrow: 'PILOT MEASUREMENT',
    title: 'Measure the signals that matter to the pilot.',
    intro: 'Regreenity combines passenger participation, crew recognition, live-event feedback, service recovery and privacy-safe attributed revenue into an operator-facing pilot view.',
    crop: 'crew',
    alt: 'Cruise hospitality team members in a service environment',
    facts: [
      { title: 'Outcome-led', body: 'A pilot should measure agreed behavior and operational outcomes, not just page opens or feature taps.' },
      { title: 'No invented proof', body: 'Public performance claims should follow real pilot evidence rather than demo data.' },
      { title: 'Management context', body: 'Signals can be grouped by sailing, team, experience area and defined pilot KPI.' },
      { title: 'Revenue without passenger identity', body: 'Opaque handoff references can connect CruiseConnect activity to confirmed booking value without giving Regreenity passenger names, payment data or booking references.' },
    ],
  },
  integration: {
    eyebrow: 'HOW IT INTEGRATES',
    title: 'Designed to fit the cruise app you already have.',
    intro: 'The passenger experience sits inside the cruise line’s existing app. Identity and real-time source records stay in the operator environment; Regreenity cloud receives aggregate outcomes and non-identifying service-health telemetry.',
    crop: 'passenger',
    alt: 'Guest experience in a modern hospitality setting',
    facts: [
      { title: 'Inside the cruise app', body: 'A white-label SDK or embedded web module provides the passenger interface; it can be pre-bundled or cached for the sailing.' },
      { title: 'Operator identity zone', body: 'Passenger/crew identity, badge photos, face templates, source actions and payments stay on-device, ship-local or in cruise-line systems.' },
      { title: 'Regreenity aggregate cloud', body: 'Regreenity receives threshold-protected KPI reports plus uptime, latency, version, sync-success and error-count telemetry—with no person-level identifier.' },
      { title: 'Offline and ship-local', body: 'Core actions use host-approved device storage and ship-local APIs, then aggregate reporting synchronizes when approved connectivity is available.' },
    ],
    note: 'Architecture direction, not a claim of production deployment. Native proximity and host-system integrations require cruise-line implementation.'
  },
  pilot: {
    eyebrow: 'PILOT REGREENITY',
    title: 'Pilot the complete Regreenity experience on one ship.',
    intro: 'Deploy the integrated product experience inside the cruise-line app—passenger interaction, crew recognition, private recovery, engagement, ancillary discovery and operator measurement—then validate it end to end.',
    crop: 'engagement',
    alt: 'Guests participating in a premium hospitality experience',
    facts: [
      { title: 'One complete product', body: 'The pilot includes the connected Regreenity experience rather than asking the operator to choose isolated modules.' },
      { title: 'Inside the existing app', body: 'Regreenity is an add-on interaction layer. It does not ask guests to download or learn another app.' },
      { title: 'Evidence across the journey', body: 'Agree activation, recognition, recovery, engagement, commercial and operational measures before launch.' },
    ],
  },
}

const pageFromPath = (path: string): PageKey => {
  const normalized = path.replace(/\/+$/, '') || '/'
  if (normalized === '/') return 'home'
  if (normalized === '/passenger-experience') return 'passenger'
  if (normalized === '/crew-recognition') return 'crew'
  if (normalized === '/service-recovery') return 'recovery'
  if (normalized === '/engagement') return 'engagement'
  if (normalized === '/ancillary-revenue' || normalized === '/social-commerce') return 'revenue'
  if (normalized === '/cruise-dashboard') return 'dashboard'
  if (normalized === '/integration') return 'integration'
  if (normalized === '/pilot') return 'pilot'
  return 'home'
}

const Header = ({ page }: { page: PageKey }) => (
  <header className="site-header">
    <a className="brand" href="/" aria-label="Regreenity home">REGREENITY</a>
    <nav className="desktop-nav" aria-label="Primary navigation">
      <a href="/passenger-experience/">Passenger Experience</a>
      <a href="/crew-recognition/">Crew Recognition</a>
      <a href="/service-recovery/">Service Recovery</a>
      <a href="/engagement/">Engagement</a>
      <a href="/ancillary-revenue/">Ancillary Revenue</a>
    </nav>
    <div className="header-actions"><a className="header-cta" href={page === 'pilot' ? contactHref : demoHref}>{page === 'pilot' ? 'Request a pilot' : 'View product demo'} <Arrow /></a><a className="menu-link" href="/integration/">How it integrates <span className="menu-lines" aria-hidden="true"><i/><i/><i/></span></a></div>
  </header>
)

const Footer = () => (
  <footer className="site-footer">
    <div><strong>REGREENITY</strong><span>A PlanetHike project</span></div>
    <p>Passenger experience, crew recognition, service recovery, engagement and ancillary-revenue discovery for cruise lines.</p>
    <nav className="footer-links" aria-label="Footer navigation"><a href={contactHref}>Contact</a><a href="/imprint/">Imprint</a><a href="/privacy/">Privacy</a><a href="/terms/">Terms</a><a href="/cookies/">Cookies</a></nav>
  </footer>
)

const Section = ({ id, eyebrow, title, children, crop, reverse = false, alt }: { id: string; eyebrow: string; title: string; children: ReactNode; crop: StoryCrop; reverse?: boolean; alt: string }) => (
  <section id={id} className={`story-section ${reverse ? 'story-section--reverse' : ''}`}>
    <div className="story-copy"><p className="eyebrow">{eyebrow}</p><h2>{title}</h2><div className="story-body">{children}</div></div>
    <figure className={`story-visual story-visual--${crop}`} role="img" aria-label={alt} />
  </section>
)

const EntityDefinition = () => (
  <section className="entity-definition" aria-labelledby="what-is-regreenity">
    <p className="eyebrow">WHAT REGREENITY IS</p>
    <h2 id="what-is-regreenity">Not another app. One add-on inside the app guests already use.</h2>
    <p>Regreenity is a white-label guest-experience interaction layer that integrates with the cruise line’s existing app. There is no separate guest download and no replacement of the operator’s booking or commerce stack. The cruise line retains control of its brand, app, inventory, pricing, checkout and payment.</p>
    <div className="entity-links" aria-label="Regreenity product areas">
      <a href="/passenger-experience/">Passenger experience</a><a href="/crew-recognition/">Crew recognition</a><a href="/service-recovery/">Service recovery</a><a href="/engagement/">Engagement</a><a href="/ancillary-revenue/">Ancillary revenue</a><a href="/integration/">Integration</a>
    </div>
  </section>
)

const buyerFaqs = [
  ['Where does Regreenity run?', 'The passenger experience runs inside the cruise line’s existing app as a white-label SDK or embedded module. Identity resolution and source actions run on-device, ship-local or in the operator’s systems. Regreenity cloud receives only aggregate KPI reports and non-identifying service-health telemetry.'],
  ['How do passenger privacy and data residency work?', 'Passenger and crew source records remain in the operator-controlled environment and residency region. Regreenity receives no names, photos, biometric templates, face-match scores or person-level identifiers; cells below 20 are suppressed.'],
  ['How much IT integration is required?', 'One embedded feature connects to scoped host interfaces for launch context, operator-side identity, ship operations, booking outcomes and aggregate reporting. The pilot defines each interface before deployment.'],
  ['What happens when ship connectivity is limited?', 'The interface is cacheable and core actions can use device and ship-local services. Public internet is not required for every interaction; approved aggregate reports synchronize later.'],
  ['How does Regreenity pass cybersecurity and vendor review?', 'The production requirements include signed requests, tenant separation, role-based access, replay protection, allow-listed aggregate schemas, body-free analytics logs and independent security testing.'],
  ['How are anonymous passenger vibes, safety and minors handled?', 'Anonymous Vibes are adult-only. The operator resolves a photographed receiver inside its identity zone, returns no name, rejects same-cabin/booking-group and duplicate attempts, discards the capture after matching and delivers prepared compliments without sender identity or exact timing. Children cannot send, receive or be matched for passenger vibes.'],
  ['Does Anonymous Vibe require a second consent screen?', 'No. The cruise line can include CruiseConnect recognition as a clearly stated purpose in its adult boarding imaging enrolment. Adults who accept are enrolled once for that sailing and are not interrupted again when using Anonymous Vibe; those who decline or opt out are excluded from matching.'],
  ['Can the cruise line publish passenger rankings or identities?', 'No. Top Five uses dense score positions and the result is private. Only the passenger can choose to share their own Vibe Card. Event RSVPs show a count by default; chosen name/image visibility is a separate passenger choice limited to confirmed attendees.'],
  ['Does crew recognition become employee ranking?', 'No public leaderboard or passenger-facing crew rating is created. Identity verification stays operator-side, recognition uses prepared positive reasons, and employment decisions remain solely with the cruise line.'],
  ['Will this create additional operational workload?', 'Prepared response blocks, routing rules and priority states turn activity into structured operational signals instead of another free-text inbox.'],
  ['Can the revenue attribution be trusted?', 'The operator resolves bookings locally and sends signed confirmed, cancelled, refunded and net-value totals. Regreenity does not rely on self-reported clicks or receive booking references.'],
  ['Who controls the brand and published ratings?', 'The cruise line controls the feature name, co-branding, placement and whether any aggregate event rating is published.'],
  ['Does the cruise line retain ownership and avoid lock-in?', 'Yes. The operator keeps identity, commerce and all source records. Regreenity can be removed without migrating a passenger or biometric database from us.'],
]

const faqStructuredData = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: buyerFaqs.map(([question, answer]) => ({ '@type': 'Question', name: question, acceptedAnswer: { '@type': 'Answer', text: answer } })),
})

const BuyerReadiness = () => <section className="buyer-readiness" aria-labelledby="buyer-readiness-title"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: faqStructuredData }}/><p className="eyebrow">BUYER FAQ</p><h2 id="buyer-readiness-title">The questions cruise-line executives will ask—answered upfront.</h2><div className="buyer-readiness-grid">{buyerFaqs.map(([question,answer],index)=><details key={question} open={index===0}><summary><span>{String(index+1).padStart(2,'0')}</span><h3>{question}</h3><i aria-hidden="true">+</i></summary><p>{answer}</p></details>)}</div></section>

const Home = () => (
  <>
    <section id="top" className="hero">
      <p className="eyebrow hero-eyebrow">DESIGNED FOR CRUISE LINES</p>
      <h1>Turn more onboard moments into <span>unforgettable experiences.</span></h1>
      <p className="hero-positioning">A white-label add-on inside your existing cruise app—not another app for guests to download.</p>
      <figure className="hero-visual"><img src="/media/hero-centered-black-crew-amara.jpg" alt="Black cruise crew member welcoming guests onboard" fetchPriority="high" /></figure>
    </section>
    <section className="hero-after" aria-labelledby="hero-after-title">
      <p id="hero-after-title" className="hero-after-copy">Regreenity helps your team personalise interactions, recognise excellence and create more timely opportunities to improve the guest journey.</p>
      <a className="pilot-link" href={demoHref}>VIEW PRODUCT DEMO <Arrow /></a>
    </section>
    <section className="manifesto" aria-label="Regreenity promise"><p className="eyebrow">FOR THE CRUISE JOURNEY</p><h2>Built to feel natural onboard.</h2><p className="manifesto-copy">A quieter interaction layer for guests, crew and the moments between the itinerary.</p></section>
    <Section id="passenger-experience" eyebrow="PASSENGER EXPERIENCE" title="Make the app feel more alive." crop="passenger" alt="Multicultural cruise passengers of different ages relaxing together"><p>Give guests more relevant reasons to interact throughout the sailing—without making the experience feel busy, intrusive or transactional.</p></Section>
    <Section id="crew-recognition" eyebrow="CREW RECOGNITION" title="Let great service be seen." crop="crew" alt="Diverse cruise crew members sharing a candid end-of-shift moment" reverse><p>A simple moment of recognition becomes visible, measurable and memorable—for the guest, the crew member and the operator.</p></Section>
    <Section id="service-recovery" eyebrow="SERVICE RECOVERY" title="Resolve the moment while it still matters." crop="recovery" alt="Cruise crew member returning a child’s toy beside their parent"><p>Give guests a discreet way to signal friction during the journey, creating the opportunity to respond before the experience is over.</p></Section>
    <Section id="engagement" eyebrow="LIVE EXPERIENCE FEEDBACK" title="Improve events while the sailing is still underway." crop="engagement" alt="Multigenerational passengers enjoying an inclusive deck activity" reverse><p>After a live event, ask three to five structured questions with prepared response blocks. Leaders see feedback immediately; the cruise line decides which aggregated ratings to publish.</p></Section>
    <Section id="ancillary-revenue" eyebrow="ANCILLARY REVENUE" title="Make relevance commercial." crop="revenue" alt="A multicultural family choosing an onboard experience together"><p>When the guest is already engaged, relevant experiences and offers can appear naturally—while checkout, pricing and payment stay with the cruise line.</p></Section>
    <EntityDefinition />
    <section className="quiet-proof"><p className="eyebrow">BUILT TO FIT THE CRUISE JOURNEY</p><div className="proof-grid"><article><strong>Inside the existing app</strong><span>No competing destination for the guest.</span></article><article><strong>Immediate operational feedback</strong><span>Structured event ratings reach leaders while they can still act.</span></article><article><strong>Revenue evidence without identity</strong><span>Confirmed booking value is attributed through opaque references and aggregated outcomes.</span></article></div></section>
    <BuyerReadiness />
    <section id="pilot" className="pilot-section"><p className="eyebrow">ONE SHIP. THE COMPLETE EXPERIENCE.</p><h2>See the product, then pilot it inside the cruise app guests already use.</h2><p>Walk through the connected passenger and management experience, then request a complete one-ship pilot.</p><div className="pilot-actions"><a className="pilot-button" href={demoHref}>View product demo <Arrow /></a><a className="pilot-button pilot-button--secondary" href={contactHref}>Request a pilot <Arrow /></a></div></section>
  </>
)

const PilotContactForm = () => {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const submitEnquiry = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatus('sending')
    const form = new FormData(event.currentTarget)
    try {
      const response = await fetch('/api/pilot-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workEmail: form.get('email'),
          name: form.get('name'),
          roleTitle: form.get('role') || '',
          company: form.get('company'),
          message: form.get('message'),
          privacyConsent: form.get('privacy_consent') === 'yes',
          website: form.get('website') || '',
        }),
      })
      if (!response.ok) throw new Error('request_failed')
      event.currentTarget.reset()
      setStatus('sent')
    } catch {
      setStatus('error')
    }
  }
  return <section id="contact" className="contact-form-section" aria-labelledby="pilot-contact-title">
    <div className="contact-form-copy"><p className="eyebrow">REQUEST A PILOT</p><h1 id="pilot-contact-title">Plan a complete one-ship Regreenity pilot.</h1><p>You have seen the product. Tell us about your existing app, target ship and timing, and we’ll respond personally about a complete one-ship pilot.</p><div className="contact-confidence"><span>One short form</span><span>Direct response from PlanetHike</span><span>No mailing list</span></div><a href="mailto:info@regreenity.com">info@regreenity.com <Arrow /></a></div>
    <form className="pilot-contact-form" onSubmit={submitEnquiry}>
      <input className="form-honeypot" type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      {status === 'sent' && <p className="form-success" role="status">Thank you. Your Regreenity enquiry is safely recorded. We’ll reply personally.</p>}
      {status === 'error' && <p className="form-error" role="alert">The secure form is temporarily unavailable. Please email <a href="mailto:info@regreenity.com">info@regreenity.com</a>.</p>}
      <label>Work email<input required name="email" type="email" autoComplete="email" placeholder="name@cruiseline.com" /></label>
      <div className="contact-form-row"><label>Name<input required name="name" autoComplete="name" placeholder="Your name" /></label><label>Role<input name="role" autoComplete="organization-title" placeholder="Guest Experience, Digital…" /></label></div>
      <label>Cruise line or company<input required name="company" autoComplete="organization" placeholder="Organisation" /></label>
      <label>What should we know about your current app or pilot?<textarea required name="message" rows={5} placeholder="Current cruise app, target ship or sailing, integration priorities, timing…" /></label>
      <label className="form-consent"><input required type="checkbox" name="privacy_consent" value="yes" /><span>I agree that PlanetHike may use these details to respond to my enquiry, as described in the <a href="/privacy/">privacy policy</a>.</span></label>
      <button className="pilot-button contact-submit" type="submit" disabled={status === 'sending'}>{status === 'sending' ? 'Sending securely…' : <>Request a pilot conversation <Arrow /></>}</button>
    </form>
  </section>
}

const DetailPage = ({ page }: { page: Exclude<PageKey, 'home'> }) => {
  const detail = details[page]
  if (page === 'pilot') return <PilotContactForm />
  return <>
    <section className="detail-hero"><p className="eyebrow">{detail.eyebrow}</p><h1>{detail.title}</h1><p className="detail-intro">{detail.intro}</p><figure className={`detail-visual story-visual--${detail.crop}`} role="img" aria-label={detail.alt} /></section>
    <section className="detail-facts" id="details">{detail.facts.map((fact,index)=><article key={fact.title}><span>0{index+1}</span><h2>{fact.title}</h2><p>{fact.body}</p></article>)}</section>
    {detail.note && <p className="architecture-note">{detail.note}</p>}
    <EntityDefinition />
    {page === 'integration' && <BuyerReadiness />}
    <section className="detail-next"><p className="eyebrow">THE CONNECTED PRODUCT</p><h2>See how this fits into the complete Regreenity experience.</h2><a className="pilot-button" href={demoHref}>View product demo <Arrow /></a></section>
  </>
}

export default function MarketingSite() {
  const page = pageFromPath(window.location.pathname)
  return <div className="regreenity-site" data-page={page}><Header page={page} /><main>{page === 'home' ? <Home /> : <DetailPage page={page} />}</main><Footer /></div>
}
