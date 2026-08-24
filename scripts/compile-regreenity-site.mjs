import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = process.cwd()
const pages = [
  '', 'guest-engagement-platform','cruise','cruise-guest-engagement','cruise-mobile-app-engagement','cruise-service-recovery','cruise-guest-feedback','cruise-onboard-revenue','hotels-resorts','hotel-guest-experience-software','hotel-guest-app','hospitality-mobile-app','resort-app','hotel-upselling-software','hotel-ancillary-revenue','solutions','guest-participation','service-recovery','crew-and-staff-recognition','guest-feedback','ancillary-revenue','promotions-and-rewards','digital-raffles-and-campaigns','request-pilot','imprint','privacy','terms','cookies','pilot-simulator'
]

const replacements = [
  ['https://www.tisonik.com','https://www.regreenity.com'],
  ['https://tisonik.com','https://regreenity.com'],
  ['tisonik-pilot-request','regreenity-pilot-request'],
  ['TISONIK CRUISE','REGREENITY CRUISE'],
  ['Tisonik Cruise','Regreenity Cruise'],
  ['Tisonik Hotels & Resorts','Regreenity Hotels & Resorts'],
  ['Tisonik','Regreenity'],
  ['tisonik-platform','regreenity-platform'],
]

const overview = new Set(['guest-engagement-platform','solutions'])
const vertical = new Set(['cruise','hotels-resorts'])
const solution = new Set(['guest-participation','service-recovery','crew-and-staff-recognition','guest-feedback','ancillary-revenue','promotions-and-rewards','digital-raffles-and-campaigns'])
const seo = new Set(['cruise-guest-engagement','cruise-mobile-app-engagement','cruise-service-recovery','cruise-guest-feedback','cruise-onboard-revenue','hotel-guest-experience-software','hotel-guest-app','hospitality-mobile-app','resort-app','hotel-upselling-software','hotel-ancillary-revenue'])
const legal = new Set(['imprint','privacy','terms','cookies'])

const visuals = {
  'guest-engagement-platform':['/media/hero-deck.jpg','Guests enjoying a shared travel experience'],
  'solutions':['/media/crew-recognition.jpg','Hospitality staff creating a positive guest moment'],
  'cruise':['/media/hero-deck.jpg','Guests enjoying life on a cruise ship deck'],
  'hotels-resorts':['/media/service-recovery.jpg','A hospitality professional helping a guest'],
  'cruise-guest-engagement':['/media/passenger-connection.jpg','Passengers enjoying a shared onboard activity'],
  'cruise-mobile-app-engagement':['/media/hero-deck.jpg','Guests using the cruise experience throughout the sailing'],
  'cruise-service-recovery':['/media/service-recovery.jpg','Guest services helping a passenger resolve an issue'],
  'cruise-guest-feedback':['/media/crew-recognition.jpg','A positive guest and crew interaction onboard'],
  'cruise-onboard-revenue':['/media/social-commerce.jpg','Guests enjoying a relevant onboard dining experience'],
  'hotel-guest-experience-software':['/media/crew-recognition.jpg','Hospitality staff creating a memorable guest experience'],
  'hotel-guest-app':['/media/service-recovery.jpg','A guest receiving responsive hospitality service'],
  'hospitality-mobile-app':['/media/crew-recognition.jpg','Hospitality staff engaging with a guest'],
  'resort-app':['/media/passenger-connection.jpg','Guests enjoying a shared social experience'],
  'hotel-upselling-software':['/media/social-commerce.jpg','Guests enjoying a premium dining experience'],
  'hotel-ancillary-revenue':['/media/social-commerce.jpg','Guests discovering a relevant hospitality experience'],
  'guest-participation':['/media/passenger-connection.jpg','Guests participating in a shared experience'],
  'service-recovery':['/media/service-recovery.jpg','Hospitality staff supporting a guest during service recovery'],
  'crew-and-staff-recognition':['/media/crew-recognition.jpg','A guest recognizing excellent hospitality service'],
  'guest-feedback':['/media/crew-recognition.jpg','A positive hospitality interaction worth remembering'],
  'ancillary-revenue':['/media/social-commerce.jpg','Guests enjoying a relevant ancillary experience'],
  'promotions-and-rewards':['/media/social-commerce.jpg','Guests discovering a timely experience offer'],
  'digital-raffles-and-campaigns':['/media/passenger-connection.jpg','Guests taking part in a live participation moment'],
}

const homeMain = `<main id="main-content" tabindex="-1" class="home">
<section class="home-hero"><div class="shell home-hero-grid"><div><div class="eyebrow">Guest engagement platform · Cruise lines, hotels & resorts</div><h1>Turn guest engagement into better experiences and <em>more revenue.</em></h1><p class="home-lead">Regreenity connects participation, recognition, real-time service recovery and relevant commercial opportunities inside one guest journey — while the operator keeps identity, inventory, checkout and fulfilment.</p><div class="hero-actions"><a class="btn btn-accent" href="/request-pilot/">Request a pilot</a><a class="btn btn-ghost" href="/guest-engagement-platform/">Explore the platform</a></div><div class="hero-trust"><span>White-label</span><span>Role-based operations</span><span>Private recovery</span><span>Operator-owned commerce</span></div></div><div class="hero-media"><figure class="hero-photo"><img src="/media/hero-deck.jpg" alt="Guests enjoying a sunset conversation on a cruise ship deck" width="1600" height="1067" fetchpriority="high"></figure><div class="hero-product-strip" aria-label="Core Regreenity workflows"><div><b>Recognize</b><span>Positive moments</span></div><div><b>Recover</b><span>Service issues</span></div><div><b>Participate</b><span>Live experiences</span></div><div><b>Grow</b><span>Relevant handoffs</span></div></div><p class="hero-caption">Cruise pilot shown. The commercial platform also serves hotels & resorts.</p></div></div></section>
<section class="home-proof"><div class="shell proof-grid"><div><small>ONE OPERATING LAYER</small><strong>Engage · Recover · Grow</strong></div><div><b>Low-friction guest actions</b><span>Short structured interactions rather than long forms.</span></div><div><b>Operational ownership</b><span>Signals route to a named role and next action.</span></div><div><b>Host-system control</b><span>Identity, pricing and payment stay with the operator.</span></div><div><b>Pilot-first measurement</b><span>Start bounded, measure, then expand.</span></div></div></section>
<section class="home-section soft"><div class="shell"><div class="section-intro"><div><div class="eyebrow">One platform, three outcomes</div><h2>The guest should not have to understand your operating silos.</h2></div><p>One interaction can mean very different things. Regreenity uses the guest's context to decide whether the next useful step is participation, service action or a relevant commercial handoff.</p></div><div class="outcome-grid"><article class="outcome-editorial"><span>01 · ENGAGE</span><h3>Give guests a reason to participate.</h3><p>Recognition, live campaigns, activities, structured feedback and bounded positive interaction create useful repeat engagement.</p></article><article class="outcome-editorial"><span>02 · RECOVER</span><h3>Act while recovery is still possible.</h3><p>Low signals move into acknowledged, assigned and measurable service workflows before the guest leaves.</p></article><article class="outcome-editorial"><span>03 · GROW</span><h3>Make commercial moments more relevant.</h3><p>Use voluntary interests and participation context to surface operator-owned experiences at the right moment.</p></article></div></div></section>
<section class="home-section dark"><div class="shell story-split"><div class="story-copy"><div class="eyebrow">Recognition · Real time, real context</div><h2>Recognize great service while it is happening.</h2><p>Guests can thank crew or staff in seconds using structured reasons. Positive service becomes visible to teams without turning people into a public popularity score.</p><div class="story-points"><div><b>Guest action</b><span>Select the person and a structured reason.</span></div><div><b>Team signal</b><span>Recognition is visible to the right operational role.</span></div><div><b>Pilot KPI</b><span>Participation and recognition adoption by sailing or property.</span></div></div><a class="text-link" href="/crew-and-staff-recognition/">Explore recognition →</a></div><figure class="story-media"><img src="/media/crew-recognition.jpg" alt="Crew member providing warm service to a guest in an elegant dining setting" width="1600" height="1067" loading="lazy"></figure></div></section>
<section class="home-section"><div class="shell story-split reverse"><figure class="story-media"><img src="/media/service-recovery.jpg" alt="Guest services professional helping a guest resolve an issue" width="1600" height="1067" loading="lazy"></figure><div class="story-copy"><div class="eyebrow">Service recovery · Before the moment is lost</div><h2>Recover the experience while the guest is still there.</h2><p>Feedback only creates value when somebody can act on it. Regreenity turns low experience signals into an owned recovery lifecycle and measures the guest's response after resolution.</p><div class="story-points"><div><b>Signal</b><span>Private issue or low Experience Pulse.</span></div><div><b>Ownership</b><span>Acknowledge, assign and resolve with clear status.</span></div><div><b>Proof</b><span>Post-recovery 1–5 pulse closes the loop.</span></div></div><a class="text-link" href="/service-recovery/">Explore service recovery →</a></div></div></section>
<section class="home-section dark"><div class="shell story-split"><div class="story-copy"><div class="eyebrow">Positive connection · Cruise workflow</div><h2>The ship is the social environment. Regreenity only makes the safe first move easier.</h2><p>Passengers can discover shared activities and interests through structured, opt-in interactions. No unrestricted chat. No dating layer. No private meetup mechanic.</p><div class="story-points"><div><b>Nearby</b><span>Only passengers who opt in are visible.</span></div><div><b>Shared activity</b><span>Connection is anchored to a public onboard moment.</span></div><div><b>Bounded interaction</b><span>Predefined signals keep first contact safe and simple.</span></div></div><a class="text-link" href="/cruise-guest-engagement/">Explore cruise engagement →</a></div><figure class="story-media"><img src="/media/passenger-connection.jpg" alt="Passengers socializing together in an elegant onboard lounge" width="1600" height="1067" loading="lazy"></figure></div></section>
<section class="home-section warm"><div class="shell story-split reverse"><figure class="story-media"><img src="/media/social-commerce.jpg" alt="Guests enjoying a premium dining experience with attentive hospitality service" width="1600" height="1067" loading="lazy"></figure><div class="story-copy"><div class="eyebrow">Participation & revenue · Relevant, timely, operator-owned</div><h2>Surface the right experience because people want to do it together.</h2><p>Participation creates useful context. Regreenity can connect that context to dining, excursions, spa, activities or upgrades while the cruise line, hotel or resort keeps inventory, pricing, payment and fulfilment.</p><div class="story-points"><div><b>Intent</b><span>Guest expresses interest or participates.</span></div><div><b>Relevance</b><span>Configured opportunity fits the moment.</span></div><div><b>Handoff</b><span>Booking continues in the operator's environment.</span></div></div><a class="text-link" href="/ancillary-revenue/">Explore ancillary revenue →</a></div></div></section>
<section class="home-section soft"><div class="shell"><div class="section-intro"><div><div class="eyebrow">Decision environment</div><h2>One signal. The right next action.</h2></div><p>The product is deliberately constrained: collect only enough context to decide the next useful step, then route it to the system or team that owns the outcome.</p></div><div class="signal-flow"><div class="signal-node"><small>01 · SIGNAL</small><b>Guest action</b><span>Recognition, participation, experience pulse, interest or issue.</span></div><div class="flow-arrow" aria-hidden="true">→</div><div class="signal-node active"><small>02 · CONTEXT</small><b>Regreenity</b><span>Guest state, role, sailing/stay and configured rules determine the route.</span></div><div class="flow-arrow" aria-hidden="true">→</div><div class="signal-node"><small>03 · ACTION</small><b>Operator outcome</b><span>Engage, recover, recognize or hand off to existing commerce.</span></div></div></div></section>
<section class="home-section"><div class="shell"><div class="section-intro"><div><div class="eyebrow">Pilot scorecard</div><h2>Measure operational change, not interface activity.</h2></div><p>A pilot should answer whether the workflow changed guest behavior or team performance. Page views and button taps are supporting signals, not the outcome.</p></div><div class="kpi-panel"><div><small>ENGAGE</small><b>Participation rate</b><span>Eligible guests who complete the intended action.</span></div><div><small>RECOVER</small><b>Time to acknowledge</b><span>How quickly a low signal receives ownership.</span></div><div><small>RECOVER</small><b>Post-recovery pulse</b><span>Whether the guest actually felt the issue was recovered.</span></div><div><small>GROW</small><b>Relevant handoff</b><span>Qualified guest actions that continue into operator commerce.</span></div></div></div></section>
<section class="home-section dark"><div class="shell"><div class="section-intro"><div><div class="eyebrow">Built to fit the app you already have</div><h2>An engagement layer — not another guest app.</h2></div><p>Regreenity is designed to sit inside or alongside the operator's existing digital journey. Systems of record remain systems of record.</p></div><div class="signal-flow"><div class="signal-node"><small>HOST</small><b>Operator identity</b><span>Guest, sailing or stay context.</span></div><div class="flow-arrow" aria-hidden="true">→</div><div class="signal-node active"><small>LAYER</small><b>Regreenity</b><span>Engage · Recover · Grow.</span></div><div class="flow-arrow" aria-hidden="true">→</div><div class="signal-node"><small>HOST</small><b>Existing systems</b><span>Inventory, payment, fulfilment and BI.</span></div></div></div></section>
<section class="home-section"><div class="shell"><div class="section-intro"><div><div class="eyebrow">Two verticals</div><h2>Built for high-dwell guest environments.</h2></div><p>Cruise lines, hotels and resorts share the same underlying problem: the guest is already inside the experience, while engagement, service response and commercial context remain fragmented.</p></div><div class="vertical-grid"><a class="vertical-path" href="/cruise/"><small>REGREENITY CRUISE</small><h3>Cruise lines</h3><p>Passenger participation, crew recognition, onboard recovery and relevant revenue in a sailing-scoped layer.</p><span>Explore Cruise →</span></a><a class="vertical-path" href="/hotels-resorts/"><small>REGREENITY HOTELS & RESORTS</small><h3>Hotels & Resorts</h3><p>In-stay participation, staff recognition, service intelligence and relevant ancillary opportunities across the property journey.</p><span>Explore Hotels & Resorts →</span></a></div></div></section>
<section class="final-cta"><div class="shell"><div><div class="eyebrow">Pilot-first</div><h2>Start with one bounded guest journey. Measure what changes.</h2><p>One sailing or property. Clear staff owners. Defined KPIs. Expand only when the workflow proves its value.</p></div><a class="btn btn-accent" href="/request-pilot/">Request a pilot</a></div></section>
</main>`

function applyBrand(source){
  for(const [from,to] of replacements) source=source.replaceAll(from,to)
  source=source.replaceAll('<link rel="stylesheet" href="/recovery.css">','')
  source=source.replaceAll('<meta name="twitter:card" content="summary">','<meta name="twitter:card" content="summary_large_image">')
  return source
}

function pageType(slug){
  if(slug==='') return 'home'
  if(overview.has(slug)) return 'overview'
  if(vertical.has(slug)) return 'vertical'
  if(solution.has(slug)) return 'solution'
  if(seo.has(slug)) return 'seo'
  if(slug==='request-pilot') return 'conversion'
  if(legal.has(slug)) return 'legal'
  return 'standard'
}

function addBodyClass(source,slug){
  const type=pageType(slug)
  const classes=slug?`page page--${type} page--${slug}`:'page page--home'
  source=source.replace(/<body(?:\s+class="[^"]*")?\s*>/,`<body class="${classes}">`)
  source=source.replace(/(<body[^>]*>)/,`$1<a class="skip-link" href="#main-content">Skip to main content</a>`)
  return source
}

function markNav(source,slug){
  let key=''
  if(slug==='guest-engagement-platform') key='/guest-engagement-platform/'
  else if(slug==='cruise'||slug.startsWith('cruise-')) key='/cruise/'
  else if(slug==='hotels-resorts'||slug.startsWith('hotel-')||slug==='hospitality-mobile-app'||slug==='resort-app') key='/hotels-resorts/'
  else if(slug==='solutions'||solution.has(slug)) key='/solutions/'
  if(key) source=source.replace(`<a href="${key}">`,`<a href="${key}" aria-current="page">`)
  if(slug==='request-pilot') source=source.replace('<a class="btn btn-primary" href="/request-pilot/">','<a class="btn btn-primary" href="/request-pilot/" aria-current="page">')
  return source
}

function improveMenu(source){
  return source.replace('<button class="menu-btn" aria-label="Open menu" aria-expanded="false">☰</button>','<button class="menu-btn" type="button" aria-label="Open navigation" aria-expanded="false"><span aria-hidden="true"></span><span aria-hidden="true"></span><span aria-hidden="true"></span><span class="sr-only">Menu</span></button>')
}

function addMainAnchor(source){
  if(source.includes('id="main-content"')) return source
  return source.replace('<main','<main id="main-content" tabindex="-1"')
}

function addPageVisual(source,slug){
  const visual=visuals[slug]
  if(!visual||source.includes('page-hero-photo')) return source
  const [src,alt]=visual
  const marker='</div></section><section class="section"><div class="shell content-grid">'
  if(!source.includes(marker)) return source
  const figure=`<figure class="page-hero-photo"><img src="${src}" alt="${alt}" width="1600" height="1067" loading="eager"><figcaption class="page-photo-kicker">Regreenity · ${slug.startsWith('cruise')||slug==='cruise'?'Cruise':slug.startsWith('hotel')||slug==='hotels-resorts'||slug==='hospitality-mobile-app'||slug==='resort-app'?'Hotels & Resorts':'Guest engagement'}</figcaption></figure>`
  return source.replace(marker,`${figure}</div></section><section class="section"><div class="shell content-grid">`)
}

function addSocialImage(source,slug){
  if(source.includes('property="og:image"')) return source
  const src=(visuals[slug]||visuals['guest-engagement-platform'])[0]
  return source.replace('</head>',`<meta property="og:image" content="https://regreenity.com${src}"><meta name="twitter:image" content="https://regreenity.com${src}"></head>`)
}

for(const slug of pages){
  const file=resolve(root,slug,'index.html')
  if(!existsSync(file)) continue
  let source=applyBrand(readFileSync(file,'utf8'))
  if(slug==='') source=source.replace(/<main[\s\S]*?<\/main>/,homeMain)
  source=addBodyClass(source,slug)
  source=improveMenu(source)
  source=markNav(source,slug)
  if(slug!=='') source=addMainAnchor(source)
  if(!legal.has(slug)&&slug!=='request-pilot'&&slug!=='pilot-simulator') source=addPageVisual(source,slug)
  if(slug!=='pilot-simulator') source=addSocialImage(source,slug)
  writeFileSync(file,source,'utf8')
}

for(const path of ['sitemap.xml','robots.txt','site.webmanifest']){
  const file=resolve(root,'public',path)
  if(!existsSync(file)) continue
  writeFileSync(file,applyBrand(readFileSync(file,'utf8')),'utf8')
}

console.log('Compiled Regreenity Design Excellence rebuild across all public marketing routes.')
