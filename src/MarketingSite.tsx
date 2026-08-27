import type { ReactNode } from 'react'

const Arrow = () => <span aria-hidden="true">→</span>

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
    title: 'Make the cruise-line app feel more alive.',
    intro: 'Regreenity is designed to create more relevant reasons for guests to interact during the sailing without turning the experience into an unrestricted social network.',
    crop: 'passenger',
    alt: 'Guests and hospitality staff interacting in a premium cruise setting',
    facts: [
      { title: 'Structured first contact', body: 'Discovery can begin through opted-in nearby context, shared activities or shared interests, followed by predefined positive signals rather than open messaging.' },
      { title: 'Public-place progression', body: 'A next step is only available after reciprocity and is designed around approved public onboard places or activities.' },
      { title: 'Cruise-native context', body: 'The experience is designed to sit inside the existing cruise-line app and use sailing context supplied by the host.' },
    ],
  },
  crew: {
    eyebrow: 'CREW RECOGNITION',
    title: 'Let great service be seen while it is happening.',
    intro: 'Regreenity captures a recognition moment with the crew member, sailing context and reason while the experience is still fresh.',
    crop: 'crew',
    alt: 'Cruise hospitality team members at work',
    facts: [
      { title: 'Recognition, not ranking', body: 'The design supports contextual appreciation rather than public crew leaderboards or passenger-facing star ratings.' },
      { title: 'Useful context', body: 'Recognition can be tied to the ship, sailing, date and selected reason, giving operators more context than a raw compliment count.' },
      { title: 'Repeat excellence', body: 'The product can distinguish breadth, depth and consistency of recognition across a sailing.' },
    ],
  },
  recovery: {
    eyebrow: 'SERVICE RECOVERY',
    title: 'Resolve the moment while it still matters.',
    intro: 'Regreenity gives guests a private route to signal friction during the journey so the operator has a chance to respond before the sailing ends.',
    crop: 'recovery',
    alt: 'Cruise hospitality professional helping a guest',
    facts: [
      { title: 'Private by design', body: 'Service issues are separated from positive recognition and passenger interaction.' },
      { title: 'Closed-loop intent', body: 'The workflow is designed around capture, routing, acknowledgement, resolution and a follow-up signal.' },
      { title: 'Experience Pulse', body: 'A lightweight private pulse can help the operator understand department-level experience without creating a public rating system.' },
    ],
  },
  engagement: {
    eyebrow: 'ENGAGEMENT',
    title: 'Make participation feel effortless.',
    intro: 'Regreenity is designed to help guests discover activities, people and moments that feel relevant to the sailing while keeping the interface calm and intentional.',
    crop: 'engagement',
    alt: 'A diverse group of guests socialising in a premium hospitality setting',
    facts: [
      { title: 'Interest-led', body: 'Guests can voluntarily share cruise-relevant interests that help shape discovery and participation.' },
      { title: 'Context-aware', body: 'Activity and sailing context can make recommendations feel more relevant than a generic feed.' },
      { title: 'Positive interaction', body: 'The interaction model is designed around structured, positive steps rather than unrestricted stranger messaging.' },
    ],
  },
  revenue: {
    eyebrow: 'ANCILLARY REVENUE',
    title: 'Make relevance commercial without turning the journey into a catalogue.',
    intro: 'Regreenity can create recommendation and intent context around relevant onboard experiences while leaving inventory, price, checkout and payment with the cruise line.',
    crop: 'revenue',
    alt: 'Hospitality professional using a tablet in a premium setting',
    facts: [
      { title: 'Context before offer', body: 'Commercial relevance can come from expressed interests, onboard participation and timing rather than a generic advertising feed.' },
      { title: 'Host-owned commerce', body: 'Regreenity does not need to own inventory, pricing, checkout or payment; those remain in the cruise line’s commerce environment.' },
      { title: 'Pilot-measurable', body: 'A pilot can define attribution or treatment/control logic before any performance claim is made.' },
    ],
  },
  dashboard: {
    eyebrow: 'PILOT MEASUREMENT',
    title: 'Measure the signals that matter to the pilot.',
    intro: 'Regreenity is designed to combine passenger participation, crew recognition, service-recovery and commercial signals into an operator-facing pilot view.',
    crop: 'crew',
    alt: 'Cruise hospitality team members in a service environment',
    facts: [
      { title: 'Outcome-led', body: 'A pilot should measure agreed behavior and operational outcomes, not just page opens or feature taps.' },
      { title: 'No invented proof', body: 'Public performance claims should follow real pilot evidence rather than demo data.' },
      { title: 'Management context', body: 'Signals can be grouped by sailing, team, experience area and defined pilot KPI.' },
    ],
  },
  integration: {
    eyebrow: 'HOW IT INTEGRATES',
    title: 'Designed to fit the cruise app you already have.',
    intro: 'The architecture is designed as an interaction layer rather than a replacement for the cruise line’s existing app, booking stack or operational systems.',
    crop: 'passenger',
    alt: 'Guest experience in a modern hospitality setting',
    facts: [
      { title: 'Device', body: 'The architecture supports a cached interface, preferences and pending actions on-device.' },
      { title: 'Ship-local', body: 'Native proximity and onboard APIs require host integration and can operate through ship-local capabilities exposed by the operator.' },
      { title: 'Deferred cloud', body: 'Non-urgent analytics, replication and external sharing can complete when connectivity is available.' },
    ],
    note: 'Architecture direction, not a claim of production deployment. Native proximity and host-system integrations require cruise-line implementation.'
  },
  pilot: {
    eyebrow: 'PILOT REGREENITY',
    title: 'Test one focused interaction loop before scale.',
    intro: 'A Regreenity pilot is intended to let a cruise line test a bounded guest-experience use case, measure the agreed signals and decide what deserves to scale.',
    crop: 'engagement',
    alt: 'Guests participating in a premium hospitality experience',
    facts: [
      { title: 'Choose the loop', body: 'Start with a focused use case such as recognition, private recovery, engagement or contextual ancillary discovery.' },
      { title: 'Define the evidence', body: 'Agree the behaviors, operational signals and commercial measures that would make the test useful.' },
      { title: 'Scale only what works', body: 'Use the pilot to decide which workflows, integrations and surfaces deserve broader deployment.' },
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

const Header = () => (
  <header className="site-header">
    <a className="brand" href="/" aria-label="Regreenity home">REGREENITY</a>
    <nav className="desktop-nav" aria-label="Primary navigation">
      <a href="/passenger-experience/">Passenger Experience</a>
      <a href="/crew-recognition/">Crew Recognition</a>
      <a href="/service-recovery/">Service Recovery</a>
      <a href="/engagement/">Engagement</a>
      <a href="/ancillary-revenue/">Ancillary Revenue</a>
    </nav>
    <a className="menu-link" href="/integration/">Menu <span className="menu-lines" aria-hidden="true"><i/><i/><i/></span></a>
  </header>
)

const Footer = () => (
  <footer className="site-footer">
    <div><strong>REGREENITY</strong><span>A PlanetHike project</span></div>
    <p>Passenger experience, crew recognition, service recovery, engagement and ancillary-revenue discovery for cruise lines.</p>
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
    <h2 id="what-is-regreenity">A cruise-line guest-experience interaction layer.</h2>
    <p>Regreenity is designed to sit inside the cruise-line app and support passenger interaction, crew recognition, private service recovery, engagement and contextual ancillary-revenue discovery. The cruise line retains control of its app, inventory, pricing, checkout and payment.</p>
    <div className="entity-links" aria-label="Regreenity product areas">
      <a href="/passenger-experience/">Passenger experience</a><a href="/crew-recognition/">Crew recognition</a><a href="/service-recovery/">Service recovery</a><a href="/engagement/">Engagement</a><a href="/ancillary-revenue/">Ancillary revenue</a><a href="/integration/">Integration</a>
    </div>
  </section>
)

const Home = () => (
  <>
    <section id="top" className="hero">
      <p className="eyebrow hero-eyebrow">DESIGNED FOR CRUISE LINES</p>
      <h1>Turn more onboard moments into <span>unforgettable experiences.</span></h1>
      <figure className="hero-visual"><img src="/media/hero-crew-short-hair-v2.jpg" alt="Black cruise crew member welcoming guests onboard" fetchPriority="high" /></figure>
    </section>
    <section className="hero-after" aria-labelledby="hero-after-title">
      <p id="hero-after-title" className="hero-after-copy">Regreenity helps your team personalise interactions, recognise excellence and create more timely opportunities to improve the guest journey.</p>
      <a className="pilot-link" href="/pilot/">EXPLORE A PILOT <Arrow /></a>
    </section>
    <section className="manifesto" aria-label="Regreenity promise"><p className="eyebrow">FOR THE CRUISE JOURNEY</p><h2>Built to feel natural onboard.</h2><p className="manifesto-copy">A quieter interaction layer for guests, crew and the moments between the itinerary.</p></section>
    <Section id="passenger-experience" eyebrow="PASSENGER EXPERIENCE" title="Make the app feel more alive." crop="passenger" alt="Diverse guests and hospitality staff interacting"><p>Give guests more relevant reasons to interact throughout the sailing—without making the experience feel busy, intrusive or transactional.</p></Section>
    <Section id="crew-recognition" eyebrow="CREW RECOGNITION" title="Let great service be seen." crop="crew" alt="Cruise hospitality team members at work" reverse><p>A simple moment of recognition becomes visible, measurable and memorable—for the guest, the crew member and the operator.</p></Section>
    <Section id="service-recovery" eyebrow="SERVICE RECOVERY" title="Resolve the moment while it still matters." crop="recovery" alt="Hospitality professional helping a guest"><p>Give guests a discreet way to signal friction during the journey, creating the opportunity to respond before the experience is over.</p></Section>
    <Section id="engagement" eyebrow="ENGAGEMENT" title="Make participation feel effortless." crop="engagement" alt="A mixed group of guests socialising" reverse><p>Help guests discover moments, activities and interactions that feel personally relevant—while keeping the experience calm and intentional.</p></Section>
    <Section id="ancillary-revenue" eyebrow="ANCILLARY REVENUE" title="Make relevance commercial." crop="revenue" alt="Hospitality professional using a tablet"><p>When the guest is already engaged, relevant experiences and offers can appear naturally—while checkout, pricing and payment stay with the cruise line.</p></Section>
    <EntityDefinition />
    <section className="quiet-proof"><p className="eyebrow">BUILT TO FIT THE CRUISE JOURNEY</p><div className="proof-grid"><article><strong>Inside the existing app</strong><span>No competing destination for the guest.</span></article><article><strong>Designed for shipboard reality</strong><span>Offline-first architecture with host integration where required.</span></article><article><strong>Pilot before scale</strong><span>Validate behavior, recovery and commercial signals first.</span></article></div></section>
    <section id="pilot" className="pilot-section"><p className="eyebrow">START SMALL. LEARN FAST.</p><h2>Experience Regreenity on one cruise line.</h2><p>Start with a focused pilot. See how guests respond. Measure what matters. Decide what deserves to scale.</p><a className="pilot-button" href="/pilot/">Explore a pilot <Arrow /></a></section>
  </>
)

const DetailPage = ({ page }: { page: Exclude<PageKey, 'home'> }) => {
  const detail = details[page]
  return <>
    <section className="detail-hero"><p className="eyebrow">{detail.eyebrow}</p><h1>{detail.title}</h1><p className="detail-intro">{detail.intro}</p><figure className={`detail-visual story-visual--${detail.crop}`} role="img" aria-label={detail.alt} /></section>
    <section className="detail-facts" id="details">{detail.facts.map((fact,index)=><article key={fact.title}><span>0{index+1}</span><h2>{fact.title}</h2><p>{fact.body}</p></article>)}</section>
    {detail.note && <p className="architecture-note">{detail.note}</p>}
    <EntityDefinition />
    {page !== 'pilot' ? <section className="detail-next"><p className="eyebrow">PILOT BEFORE SCALE</p><h2>Test this as a focused Regreenity pilot.</h2><a className="pilot-button" href="/pilot/">Explore a pilot <Arrow /></a></section> : <section className="detail-next"><p className="eyebrow">NEXT</p><h2>Choose the first loop worth testing.</h2><div className="entity-links"><a href="/crew-recognition/">Crew recognition</a><a href="/service-recovery/">Service recovery</a><a href="/passenger-experience/">Passenger experience</a><a href="/ancillary-revenue/">Ancillary revenue</a></div></section>}
  </>
}

export default function MarketingSite() {
  const page = pageFromPath(window.location.pathname)
  return <div className="regreenity-site" data-page={page}><Header /><main>{page === 'home' ? <Home /> : <DetailPage page={page} />}</main><Footer /></div>
}
