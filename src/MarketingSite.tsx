import { type ReactNode } from 'react'

const Arrow = () => <span aria-hidden="true">→</span>
const contactHref = '/pilot/#contact'

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
    alt: 'Multicultural cruise passengers of different ages relaxing together',
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
    alt: 'Diverse cruise crew members sharing a candid end-of-shift moment',
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
    alt: 'Cruise crew member returning a child’s toy beside their parent',
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
    alt: 'Multigenerational passengers enjoying an inclusive deck activity',
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
    <div className="header-actions"><a className="header-cta" href={contactHref}>Request a demo <Arrow /></a><a className="menu-link" href="/integration/">How it integrates <span className="menu-lines" aria-hidden="true"><i/><i/><i/></span></a></div>
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
      <a className="pilot-link" href={contactHref}>REQUEST A DEMO <Arrow /></a>
    </section>
    <section className="manifesto" aria-label="Regreenity promise"><p className="eyebrow">FOR THE CRUISE JOURNEY</p><h2>Built to feel natural onboard.</h2><p className="manifesto-copy">A quieter interaction layer for guests, crew and the moments between the itinerary.</p></section>
    <Section id="passenger-experience" eyebrow="PASSENGER EXPERIENCE" title="Make the app feel more alive." crop="passenger" alt="Multicultural cruise passengers of different ages relaxing together"><p>Give guests more relevant reasons to interact throughout the sailing—without making the experience feel busy, intrusive or transactional.</p></Section>
    <Section id="crew-recognition" eyebrow="CREW RECOGNITION" title="Let great service be seen." crop="crew" alt="Diverse cruise crew members sharing a candid end-of-shift moment" reverse><p>A simple moment of recognition becomes visible, measurable and memorable—for the guest, the crew member and the operator.</p></Section>
    <Section id="service-recovery" eyebrow="SERVICE RECOVERY" title="Resolve the moment while it still matters." crop="recovery" alt="Cruise crew member returning a child’s toy beside their parent"><p>Give guests a discreet way to signal friction during the journey, creating the opportunity to respond before the experience is over.</p></Section>
    <Section id="engagement" eyebrow="ENGAGEMENT" title="Make participation feel effortless." crop="engagement" alt="Multigenerational passengers enjoying an inclusive deck activity" reverse><p>Help guests discover moments, activities and interactions that feel personally relevant—while keeping the experience calm and intentional.</p></Section>
    <Section id="ancillary-revenue" eyebrow="ANCILLARY REVENUE" title="Make relevance commercial." crop="revenue" alt="A multicultural family choosing an onboard experience together"><p>When the guest is already engaged, relevant experiences and offers can appear naturally—while checkout, pricing and payment stay with the cruise line.</p></Section>
    <EntityDefinition />
    <section className="quiet-proof"><p className="eyebrow">BUILT TO FIT THE CRUISE JOURNEY</p><div className="proof-grid"><article><strong>Inside the existing app</strong><span>No competing destination for the guest.</span></article><article><strong>Designed for shipboard reality</strong><span>Offline-first architecture with host integration where required.</span></article><article><strong>Pilot before scale</strong><span>Validate behavior, recovery and commercial signals first.</span></article></div></section>
    <section id="pilot" className="pilot-section"><p className="eyebrow">ONE SHIP. THE COMPLETE EXPERIENCE.</p><h2>Pilot Regreenity inside the cruise app guests already use.</h2><p>Deploy the connected product experience, measure the full guest journey and decide how to scale across the fleet.</p><a className="pilot-button" href={contactHref}>Request a demo <Arrow /></a></section>
  </>
)

const PilotContactForm = () => {
  const sent = new URLSearchParams(window.location.search).get('sent') === '1'
  return <section id="contact" className="contact-form-section" aria-labelledby="pilot-contact-title">
    <div className="contact-form-copy"><p className="eyebrow">REQUEST A DEMO</p><h1 id="pilot-contact-title">Let’s discuss Regreenity for your cruise line.</h1><p>You have seen the product. Tell us about your existing app, target ship and timing, and we’ll respond personally about a complete one-ship pilot.</p><div className="contact-confidence"><span>One short form</span><span>Direct response from PlanetHike</span><span>No mailing list</span></div><a href="mailto:hello@planethike.org">hello@planethike.org <Arrow /></a></div>
    <form className="pilot-contact-form" action="https://formsubmit.co/hello@planethike.org" method="POST" acceptCharset="UTF-8">
      <input type="hidden" name="_subject" value="Regreenity pilot enquiry" />
      <input type="hidden" name="_template" value="table" />
      <input type="hidden" name="_next" value="https://regreenity.com/pilot/?sent=1#contact" />
      <input className="form-honeypot" type="text" name="_honey" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      {sent && <p className="form-success" role="status">Thank you. Your Regreenity enquiry has been sent.</p>}
      <label>Work email<input required name="email" type="email" autoComplete="email" placeholder="name@cruiseline.com" /></label>
      <div className="contact-form-row"><label>Name<input required name="name" autoComplete="name" placeholder="Your name" /></label><label>Role<input name="role" autoComplete="organization-title" placeholder="Guest Experience, Digital…" /></label></div>
      <label>Cruise line or company<input required name="company" autoComplete="organization" placeholder="Organisation" /></label>
      <label>What should we know about your current app or pilot?<textarea required name="message" rows={5} placeholder="Current cruise app, target ship or sailing, integration priorities, timing…" /></label>
      <label className="form-consent"><input required type="checkbox" name="privacy_consent" value="I agree to the privacy policy" /><span>I agree that PlanetHike may use these details to respond to my enquiry, as described in the <a href="/privacy/">privacy policy</a>.</span></label>
      <button className="pilot-button contact-submit" type="submit">Request the complete demo <Arrow /></button>
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
    <section className="detail-next"><p className="eyebrow">ONE COMPLETE PILOT</p><h2>See how this connects to the full Regreenity experience.</h2><a className="pilot-button" href={contactHref}>Request a demo <Arrow /></a></section>
  </>
}

export default function MarketingSite() {
  const page = pageFromPath(window.location.pathname)
  return <div className="regreenity-site" data-page={page}><Header page={page} /><main>{page === 'home' ? <Home /> : <DetailPage page={page} />}</main><Footer /></div>
}
