import type { ReactNode } from 'react'

const Arrow = () => <span aria-hidden="true">→</span>
const resortPilotHref = 'mailto:info@tisonik.com?subject=Tisonik%20all-inclusive%20resort%20pilot'

const Footer = () => (
  <footer className="site-footer resort-footer">
    <div><strong>TISONIK</strong><span>A PlanetHike project</span></div>
    <p>Guest experience, participation, staff recognition, service recovery and premium-experience discovery for all-inclusive resorts.</p>
    <nav className="footer-links" aria-label="Footer navigation">
      <a href="/">Cruise</a>
      <a href="/all-inclusive-resorts/" aria-current="page">All-Inclusive Resorts</a>
      <a href="/imprint/">Imprint</a>
      <a href="/privacy/">Privacy</a>
    </nav>
  </footer>
)

const Moment = ({ number, eyebrow, title, children }: { number: string; eyebrow: string; title: string; children: ReactNode }) => (
  <article className="resort-moment">
    <span className="resort-moment-number">{number}</span>
    <p className="eyebrow">{eyebrow}</p>
    <h3>{title}</h3>
    <div>{children}</div>
  </article>
)

const Metric = ({ label, value }: { label: string; value: string }) => (
  <div className="resort-metric"><span>{label}</span><strong>{value}</strong></div>
)

export default function ResortSite() {
  return <div className="tisonik-site resort-site">
    <header className="site-header resort-header">
      <a className="brand" href="/" aria-label="Tisonik home">TISONIK</a>
      <nav className="resort-header-nav" aria-label="Resort page navigation">
        <a href="#experience">Guest Experience</a>
        <a href="#recovery">Service Recovery</a>
        <a href="#premium">Premium Experiences</a>
      </nav>
      <a className="menu-link" href="/">For cruise lines <Arrow /></a>
    </header>

    <main>
      <section className="resort-hero">
        <div className="resort-hero-copy">
          <p className="eyebrow">TISONIK · ALL-INCLUSIVE RESORTS</p>
          <h1>Help guests get more from <span>every day of their stay.</span></h1>
          <p>Tisonik adds a lightweight guest-experience layer to the resort's existing digital journey—helping guests discover more, join more, recognize great service, recover poor moments and find relevant premium experiences.</p>
          <a className="resort-text-link" href="#experience">See the resort experience <Arrow /></a>
        </div>
        <figure className="resort-hero-visual" role="img" aria-label="Guests enjoying a tropical all-inclusive resort" />
      </section>

      <section className="resort-value-strip" aria-label="Tisonik all-inclusive resort outcomes">
        <div><span>01</span><strong>Use more of what is included.</strong></div>
        <div><span>02</span><strong>Fix friction before checkout.</strong></div>
        <div><span>03</span><strong>Recognize the people who make the stay.</strong></div>
        <div><span>04</span><strong>Grow relevant premium revenue.</strong></div>
      </section>

      <section id="experience" className="resort-section resort-section--intro">
        <p className="eyebrow">THE ALL-INCLUSIVE OPPORTUNITY</p>
        <h2>The resort already offers more. Tisonik helps the guest actually experience it.</h2>
        <p className="resort-lede">A week-long resort stay is full of included activities, entertainment, dining choices and services. Tisonik makes those moments easier to discover without turning the guest journey into another catalogue.</p>

        <div className="resort-dual">
          <article className="resort-dual-card resort-dual-card--included">
            <p className="eyebrow">INCLUDED IN YOUR STAY</p>
            <h3>Make prepaid value visible at the right moment.</h3>
            <div className="resort-example">
              <span>Today · 16:00</span>
              <strong>Caribbean cooking class</strong>
              <p>Beach Kitchen · 6 places remaining</p>
              <b>Included in your stay</b>
            </div>
          </article>
          <article className="resort-dual-card resort-dual-card--premium">
            <p className="eyebrow">WORTH ADDING TO YOUR STAY</p>
            <h3>Surface premium extras when they genuinely fit.</h3>
            <div className="resort-example">
              <span>Tomorrow · 09:00</span>
              <strong>Coastal villages & market</strong>
              <p>Half-day resort excursion</p>
              <b>€79 per guest</b>
            </div>
          </article>
        </div>
      </section>

      <section className="resort-moments-grid" aria-label="Tisonik all-inclusive resort product pillars">
        <Moment number="01" eyebrow="DISCOVER" title="Make everything included easier to find.">
          <p>Surface relevant activities, entertainment, kids programming, dining options and resort moments based on time, context and voluntarily shared interests.</p>
        </Moment>
        <Moment number="02" eyebrow="PARTICIPATE" title="Turn resort programming into experiences guests actually join.">
          <p>Use timely prompts and simple interest signals to help guests move from “I didn't know that was happening” to “we should do that today.”</p>
        </Moment>
        <Moment number="03" eyebrow="RECOGNIZE" title="Let exceptional hospitality be seen.">
          <p>Capture structured recognition for the bartender, housekeeper, kids-club host, waiter or activity team member who made the stay better—without public employee rankings.</p>
        </Moment>
        <Moment number="04" eyebrow="RECOVER" title="Fix the moment before it becomes the review.">
          <p>Give guests a private in-stay route to flag room, dining, service or activity friction, then track acknowledgement, resolution and the follow-up experience.</p>
        </Moment>
        <Moment number="05" eyebrow="PREMIUM" title="Turn relevance into incremental revenue.">
          <p>Surface speciality restaurants, excursions, spa, car rental, private transfers, diving, cabanas, upgrades and other paid experiences while the resort keeps inventory, pricing, checkout and payment.</p>
        </Moment>
        <Moment number="06" eyebrow="REMEMBER" title="Finish the stay on the right emotion.">
          <p>Close with a positive recap of experiences, staff recognition and favourite moments, then hand the guest naturally into loyalty or another resort stay.</p>
        </Moment>
      </section>

      <section id="recovery" className="resort-recovery">
        <div className="resort-recovery-copy">
          <p className="eyebrow">SERVICE RECOVERY</p>
          <h2>Don't wait for the post-stay review to discover the problem.</h2>
          <p>Small frustrations compound over a multi-day stay. Tisonik gives the resort a structured private signal while the team can still change the outcome.</p>
        </div>
        <div className="resort-recovery-flow" aria-label="Example service recovery flow">
          <div><span>19:42</span><strong>How was dinner tonight?</strong><p>Guest selects: “Not quite right.”</p></div>
          <i aria-hidden="true">→</i>
          <div><span>19:43</span><strong>What could we improve?</strong><p>Prepared reasons route the issue to the right team.</p></div>
          <i aria-hidden="true">→</i>
          <div><span>21:10</span><strong>Has this been resolved?</strong><p>The resort closes the loop before the night ends.</p></div>
        </div>
      </section>

      <section id="premium" className="resort-premium">
        <div className="resort-premium-head">
          <div><p className="eyebrow">PREMIUM EXPERIENCES</p><h2>All-inclusive still has meaningful revenue moments.</h2></div>
          <p>The guest should feel helped, not advertised to. Tisonik uses context to surface a relevant extra, then hands the transaction back to the resort's existing booking or commerce system.</p>
        </div>
        <div className="resort-premium-list">
          <span>Speciality dining</span><span>Excursions</span><span>Car rental</span><span>Spa</span><span>Room upgrades</span><span>Private transfers</span><span>Cabanas</span><span>Diving & watersports</span><span>Celebrations</span><span>Premium drinks</span>
        </div>
      </section>

      <section className="resort-social">
        <div>
          <p className="eyebrow">RESORT PARTICIPATION</p>
          <h2>Make it easier to join in—without turning the resort into a social network.</h2>
        </div>
        <div className="resort-social-cards">
          <article><span>PADEL · 17:00</span><strong>Looking for another pair?</strong><p>Guests can signal interest around a specific public resort activity.</p></article>
          <article><span>FAMILY ACTIVITY · 15:30</span><strong>Beach games starting soon.</strong><p>Context-led participation, not a browse-all-guests directory.</p></article>
          <article><span>EXCURSION · TOMORROW</span><strong>Interest is building.</strong><p>Aggregated interest can provide social proof without exposing guest identities.</p></article>
        </div>
      </section>

      <section className="resort-dashboard">
        <div className="resort-dashboard-copy">
          <p className="eyebrow">ONE PILOT VIEW</p>
          <h2>Measure guest value and commercial value separately.</h2>
          <p>No invented performance claims. A pilot should agree the measures first, then show whether Tisonik improves participation, recovery, recognition and attributable premium conversion at the property.</p>
        </div>
        <div className="resort-dashboard-card" aria-label="Illustrative resort pilot metrics">
          <p>Illustrative pilot view</p>
          <Metric label="Included-experience participation" value="Measure change" />
          <Metric label="Service issues recovered in-stay" value="Measure rate" />
          <Metric label="Staff recognition" value="Measure frequency" />
          <Metric label="Premium-experience conversion" value="Measure lift" />
          <Metric label="Attributed ancillary revenue" value="Measure value" />
        </div>
      </section>

      <section className="resort-pilot">
        <p className="eyebrow">START WITH ONE PROPERTY</p>
        <h2>Test Tisonik where the guest journey is dense enough to matter.</h2>
        <p>Start with one all-inclusive resort, a defined set of included and premium experiences, clear recovery workflows and agreed pilot measures.</p>
        <a className="pilot-button" href={resortPilotHref}>Discuss a resort pilot <Arrow /></a>
        <small>This page is an experimental Tisonik vertical and is not yet part of the primary navigation.</small>
      </section>
    </main>

    <Footer />
  </div>
}
