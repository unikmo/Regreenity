import type { ReactNode } from 'react'

const Arrow = () => <span aria-hidden="true">→</span>

const Section = ({ id, eyebrow, title, children, image, reverse = false }: { id: string; eyebrow: string; title: string; children: ReactNode; image: string; reverse?: boolean }) => (
  <section id={id} className={`story-section ${reverse ? 'story-section--reverse' : ''}`}>
    <div className="story-copy">
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      <div className="story-body">{children}</div>
    </div>
    <figure className="story-visual">
      <img src={image} alt="" loading="lazy" />
    </figure>
  </section>
)

export default function MarketingSite() {
  return (
    <div className="regreenity-site">
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Regreenity home">REGREENITY</a>
        <nav className="desktop-nav" aria-label="Primary navigation">
          <a href="#passenger-experience">Passenger Experience</a>
          <a href="#crew-recognition">Crew Recognition</a>
          <a href="#service-recovery">Service Recovery</a>
          <a href="#engagement">Engagement</a>
          <a href="#ancillary-revenue">Ancillary Revenue</a>
        </nav>
        <a className="menu-link" href="#pilot">Menu <span className="menu-lines" aria-hidden="true"><i/><i/><i/></span></a>
      </header>

      <main>
        <section id="top" className="hero">
          <p className="eyebrow hero-eyebrow">DESIGNED FOR CRUISE LINES</p>
          <h1>Turn more onboard moments into <em>unforgettable experiences.</em></h1>
          <figure className="hero-visual">
            <img src="/media/crew-recognition.jpg" alt="Cruise crew member welcoming guests onboard" />
          </figure>
        </section>

        <section className="hero-after" aria-labelledby="hero-after-title">
          <p id="hero-after-title" className="hero-after-copy">
            Regreenity adds a new interaction layer to the cruise-line app—helping guests recognise great service, surface issues earlier and discover more of their journey.
          </p>
          <a className="pilot-link" href="#pilot">EXPLORE A PILOT <Arrow /></a>
        </section>

        <section className="manifesto" aria-label="Regreenity promise">
          <p className="eyebrow">ONE JOURNEY. MORE MEANINGFUL MOMENTS.</p>
          <h2>Designed to feel natural to guests.<br/>Useful to your team.<br/>Valuable to the cruise line.</h2>
        </section>

        <Section
          id="passenger-experience"
          eyebrow="PASSENGER EXPERIENCE"
          title="Make the app feel more alive."
          image="/media/passenger-connection.jpg"
        >
          <p>Give guests more relevant reasons to interact throughout the sailing—without making the experience feel busy, intrusive or transactional.</p>
        </Section>

        <Section
          id="crew-recognition"
          eyebrow="CREW RECOGNITION"
          title="Let great service be seen."
          image="/media/crew-recognition.jpg"
          reverse
        >
          <p>A simple moment of recognition becomes visible, measurable and memorable—for the guest, the crew member and the operator.</p>
        </Section>

        <Section
          id="service-recovery"
          eyebrow="SERVICE RECOVERY"
          title="Surface the moment while it can still be changed."
          image="/media/service-recovery.jpg"
        >
          <p>Regreenity gives guests a discreet way to signal friction during the journey, creating the opportunity to respond before the experience is over.</p>
        </Section>

        <Section
          id="engagement"
          eyebrow="ENGAGEMENT"
          title="Turn passive passengers into active participants."
          image="/media/onboard-life.jpg"
          reverse
        >
          <p>Help guests discover moments, activities and interactions that feel personally relevant—while keeping the experience calm and intentional.</p>
        </Section>

        <Section
          id="ancillary-revenue"
          eyebrow="ANCILLARY REVENUE"
          title="Make relevance commercial."
          image="/media/social-commerce.jpg"
        >
          <p>When the guest is already engaged, relevant experiences and offers can appear naturally—supporting onboard value without turning the journey into a catalogue.</p>
        </Section>

        <section className="quiet-proof">
          <p className="eyebrow">BUILT TO FIT THE CRUISE JOURNEY</p>
          <div className="proof-grid">
            <article><strong>Inside the existing app</strong><span>No competing destination for the guest.</span></article>
            <article><strong>Designed for shipboard reality</strong><span>Built around the constraints of life onboard.</span></article>
            <article><strong>Pilot before scale</strong><span>Validate engagement, recovery and commercial signals first.</span></article>
          </div>
        </section>

        <section id="pilot" className="pilot-section">
          <p className="eyebrow">THE NEXT STEP IS NOT A CONTRACT.</p>
          <h2>Experience Regreenity<br/>on one cruise line.</h2>
          <p>Start with a focused pilot. See how guests respond. Measure what matters. Decide what deserves to scale.</p>
          <a className="pilot-button" href="/pilot/#pilot">Explore a pilot <Arrow /></a>
        </section>
      </main>

      <footer className="site-footer">
        <div><strong>REGREENITY</strong><span>A PlanetHike project</span></div>
        <p>Passenger experience, crew recognition, service recovery, engagement and ancillary revenue for cruise lines.</p>
      </footer>
    </div>
  )
}
