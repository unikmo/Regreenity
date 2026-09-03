import type { ReactNode } from 'react'

const Arrow = () => <span aria-hidden="true">→</span>
const resortPilotHref = 'mailto:info@tisonik.com?subject=Tisonik%20all-inclusive%20hotel%20and%20resort%20pilot'

const Footer = () => (
  <footer className="site-footer resort-footer">
    <div><strong>TISONIK</strong><span>A PlanetHike project</span></div>
    <p>Guest experience, participation, staff recognition, service recovery and premium-experience discovery for all-inclusive hotels and resorts.</p>
    <nav className="footer-links" aria-label="Footer navigation">
      <a href="/">Cruise</a>
      <a href="/all-inclusive-resorts/" aria-current="page">All-Inclusive Hotels &amp; Resorts</a>
      <a href="/imprint/">Imprint</a>
      <a href="/privacy/">Privacy</a>
    </nav>
  </footer>
)

type ExperienceProps = { number:string; eyebrow:string; title:string; text:string; image:string; alt:string; reverse?:boolean }
const Experience = ({ number, eyebrow, title, text, image, alt, reverse=false }: ExperienceProps) => (
  <section className={`resort-experience ${reverse ? 'is-reverse' : ''}`}>
    <div className="resort-experience-copy">
      <span className="resort-number">{number}</span><p className="eyebrow">{eyebrow}</p><h2>{title}</h2><p>{text}</p>
    </div>
    <figure className="resort-experience-visual"><img src={image} alt={alt} /></figure>
  </section>
)

const Benefit = ({number,title,children}:{number:string;title:string;children:ReactNode}) => (
  <article><span>{number}</span><h3>{title}</h3><p>{children}</p></article>
)

export default function ResortSite() {
  return <div className="tisonik-site resort-site">
    <header className="site-header resort-header">
      <a className="brand" href="/" aria-label="Tisonik home">TISONIK</a>
      <nav className="resort-header-nav" aria-label="Resort navigation"><a href="#experience">Experience</a><a href="#recognition">Recognition</a><a href="#recovery">Recovery</a><a href="#premium">Premium</a></nav>
      <a className="resort-header-cta" href={resortPilotHref}>Explore a pilot <Arrow /></a>
    </header>

    <main>
      <section className="resort-hero">
        <div className="resort-hero-title"><p className="eyebrow">BUILT FOR ALL-INCLUSIVE HOTELS &amp; RESORTS</p><h1>Help guests get more from <span>every day of their stay.</span></h1></div>
        <figure className="resort-hero-visual"><img src="/media/resort-hero-waitress.jpg" alt="Waitress serving smiling guests at a beautiful all-inclusive resort" /></figure>
        <div className="resort-hero-after"><p>Tisonik adds a guest-experience layer to the resort&apos;s existing digital journey—helping guests discover more, participate more, recognize great service, recover poor moments and find premium experiences that fit their stay.</p><a className="pilot-button" href={resortPilotHref}>Explore a pilot <Arrow /></a></div>
      </section>

      <section className="resort-manifesto"><p className="eyebrow">THE ALL-INCLUSIVE OPPORTUNITY</p><h2>More of the stay experienced.<br/>More reasons to remember it.</h2><p>Guests have already chosen the resort. Tisonik helps every day feel fuller—through people, activities, service and experiences that are relevant in the moment.</p></section>

      <section className="resort-value-model">
        <article><p className="eyebrow">INCLUDED IN YOUR STAY</p><h2>Make prepaid value impossible to miss.</h2><p>Activities, entertainment, sports, kids programming and included dining become easier to discover at exactly the right time.</p><div className="resort-offer"><span>TODAY · 16:00</span><strong>Caribbean cooking class</strong><small>Beach Kitchen · 6 places remaining</small><b>Included in your stay</b></div></article>
        <article><p className="eyebrow">WORTH ADDING TO YOUR STAY</p><h2>Make premium experiences feel relevant.</h2><p>Speciality dining, excursions, spa, car rental and other extras appear because they fit the guest—not because there is another catalogue to browse.</p><div className="resort-offer"><span>TOMORROW · 09:00</span><strong>Coastal villages &amp; market</strong><small>Half-day resort excursion</small><b>€79 per guest</b></div></article>
      </section>

      <div id="experience" className="resort-experience-wrap">
        <Experience number="01" eyebrow="DISCOVER & PARTICIPATE" title="Make the resort feel alive." text="Help guests move naturally from poolside to activities, entertainment, dining and shared experiences. Fewer moments of ‘we didn't know that was happening’ and more moments guests actually join." image="/media/resort-participation.jpg" alt="Diverse resort guests laughing and enjoying a pool activity together" />
        <div id="recognition" />
        <Experience reverse number="02" eyebrow="STAFF RECOGNITION" title="Let exceptional hospitality be seen." text="The people behind the stay matter. Give guests a simple way to recognize the waiter, bartender, housekeeper, kids-club host, concierge or activity team member who made their day." image="/media/resort-recognition.jpg" alt="Guest warmly thanking a smiling resort employee" />
        <div id="recovery" />
        <Experience number="03" eyebrow="SERVICE RECOVERY" title="Fix the moment before it becomes the review." text="A disappointing dinner, room problem or poor activity experience should not quietly follow the guest home. Tisonik creates a private route to capture, route and resolve friction while there is still time to change the outcome." image="/media/resort-recovery-people.jpg" alt="Resort staff member warmly helping a guest during her stay" />
        <Experience reverse number="04" eyebrow="PREMIUM EXPERIENCES" title="Turn relevance into incremental revenue." text="A speciality dinner tonight. Tomorrow's island excursion. A spa opening. A rental car. A private transfer or celebration. Tisonik surfaces the right extra at the right moment while inventory, price, checkout and payment remain with the resort." image="/media/resort-premium-dining.jpg" alt="Couple enjoying a premium speciality restaurant experience at a resort" />
      </div>

      <section id="premium" className="resort-premium"><p className="eyebrow">MORE THAN THE PACKAGE</p><h2>All-inclusive still has meaningful premium revenue moments.</h2><div className="resort-premium-list"><span>Speciality dining</span><span>Excursions</span><span>Car rental</span><span>Spa</span><span>Room upgrades</span><span>Private transfers</span><span>Cabanas</span><span>Diving &amp; watersports</span><span>Celebrations</span><span>Premium drinks</span></div></section>

      <section className="resort-outcomes"><p className="eyebrow">ONE EXPERIENCE LAYER</p><h2>Guest value and commercial value in the same stay.</h2><div className="resort-outcomes-grid">
        <Benefit number="01" title="Discover">Help guests see more of what the resort already offers.</Benefit><Benefit number="02" title="Participate">Turn programming into experiences guests actually join.</Benefit><Benefit number="03" title="Recognize">Capture the people who make the stay exceptional.</Benefit><Benefit number="04" title="Recover">Resolve dissatisfaction while the guest is still there.</Benefit><Benefit number="05" title="Upgrade">Surface premium experiences when they genuinely fit.</Benefit><Benefit number="06" title="Remember">Finish the stay with a positive memory and loyalty bridge.</Benefit>
      </div></section>

      <section className="resort-pilot"><div><p className="eyebrow">START SMALL. LEARN FAST.</p><h2>Experience Tisonik on one all-inclusive property.</h2><p>Test participation, recognition, service recovery and premium-experience discovery in one resort before deciding on wider rollout.</p><a className="pilot-button" href={resortPilotHref}>Explore a pilot <Arrow /></a></div><figure><img src="/media/resort-pilot-couple.jpg" alt="Couple walking through a beautiful all-inclusive resort toward the sea" /></figure></section>
    </main>
    <Footer />
  </div>
}
