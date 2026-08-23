import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = process.cwd()
const pages = [
  '', 'guest-engagement-platform','cruise','cruise-guest-engagement','cruise-mobile-app-engagement','cruise-service-recovery','cruise-guest-feedback','cruise-onboard-revenue','hotels-resorts','hotel-guest-experience-software','hotel-guest-app','hospitality-mobile-app','resort-app','hotel-upselling-software','hotel-ancillary-revenue','solutions','guest-participation','service-recovery','crew-and-staff-recognition','guest-feedback','ancillary-revenue','promotions-and-rewards','digital-raffles-and-campaigns','request-pilot','imprint','privacy','terms','cookies','pilot-simulator'
]

const replacements = [
  ['https://www.tisonik.com', 'https://www.regreenity.com'],
  ['https://tisonik.com', 'https://regreenity.com'],
  ['tisonik-pilot-request', 'regreenity-pilot-request'],
  ['TISONIK CRUISE', 'REGREENITY CRUISE'],
  ['Tisonik Cruise', 'Regreenity Cruise'],
  ['Tisonik Hotels & Resorts', 'Regreenity Hotels & Resorts'],
  ['Tisonik', 'Regreenity'],
  ['tisonik-platform', 'regreenity-platform'],
]

const heroVisual = `<div class="hero-photo-wrap" aria-label="Guests enjoying an onboard experience"><div class="hero-photo-frame"><img src="/media/hero-deck.jpg" alt="Guests enjoying life on a cruise ship deck" width="1600" height="1067" fetchpriority="high"><div class="hero-photo-shade"></div><div class="hero-photo-caption"><span>Regreenity Cruise</span><strong>Guest moments become signals teams can act on.</strong></div></div><div class="hero-float-card"><small>LIVE GUEST SIGNAL</small><b>Participation · Recovery · Revenue</b><span>Connected inside one guest journey</span></div></div>`

const storySection = `<section class="section recovered-stories"><div class="shell"><div class="section-head"><div><div class="eyebrow">The guest experience, in context</div><h2>Built around real moments — not another feature grid.</h2></div><p>The original Regreenity experience was designed visually around the interactions the platform is meant to improve: recognition, connection, recovery, participation and relevant commercial moments.</p></div><div class="story-grid"><article class="story-card story-card-large"><img src="/media/crew-recognition.jpg" alt="Guest recognizing a crew member for excellent service" loading="lazy"><div class="story-overlay"><span>Engage</span><h3>Make great service visible.</h3><p>Capture positive guest-to-crew and guest-to-staff recognition while the moment is still fresh.</p><a href="/crew-and-staff-recognition/">Crew & staff recognition →</a></div></article><article class="story-card"><img src="/media/passenger-connection.jpg" alt="Passengers sharing a positive onboard moment" loading="lazy"><div class="story-overlay"><span>Engage</span><h3>Create better guest connection.</h3><p>Structured participation gives guests useful reasons to interact without turning the platform into unrestricted social media.</p><a href="/guest-participation/">Guest participation →</a></div></article><article class="story-card"><img src="/media/service-recovery.jpg" alt="Hospitality staff helping a guest resolve a service issue" loading="lazy"><div class="story-overlay"><span>Recover</span><h3>Act before the guest leaves.</h3><p>Private signals become acknowledged, assigned and measurable service recovery.</p><a href="/service-recovery/">Service recovery →</a></div></article></div><div class="story-wide-grid"><article class="story-wide"><img src="/media/social-commerce.jpg" alt="Guests discovering a relevant onboard experience" loading="lazy"><div><span>Grow</span><h3>Revenue follows relevance.</h3><p>Use voluntary interests and participation context to surface the right operator-owned opportunity at the right moment.</p><a href="/ancillary-revenue/">Ancillary revenue →</a></div></article><article class="story-wide"><img src="/media/shareable-memory.jpg" alt="Guests preserving and sharing a positive travel memory" loading="lazy"><div><span>Remember</span><h3>End on a positive memory.</h3><p>Recognition and participation can become a meaningful summary of the experience rather than another generic post-stay message.</p><a href="/guest-feedback/">Guest feedback →</a></div></article></div></div></section>`

const visualBySlug = {
  'cruise': ['/media/hero-deck.jpg', 'Guests enjoying life on a cruise ship deck'],
  'cruise-guest-engagement': ['/media/passenger-connection.jpg', 'Passengers sharing a positive onboard moment'],
  'cruise-service-recovery': ['/media/service-recovery.jpg', 'Hospitality staff helping a guest resolve a service issue'],
  'service-recovery': ['/media/service-recovery.jpg', 'Hospitality staff supporting a guest during service recovery'],
  'crew-and-staff-recognition': ['/media/crew-recognition.jpg', 'Guest recognizing a crew member for excellent service'],
  'cruise-onboard-revenue': ['/media/social-commerce.jpg', 'Guests discovering relevant onboard experiences'],
  'ancillary-revenue': ['/media/social-commerce.jpg', 'Guests discovering a relevant ancillary experience'],
  'guest-feedback': ['/media/shareable-memory.jpg', 'Guests sharing a positive travel memory'],
  'guest-participation': ['/media/onboard-life.jpg', 'Guests participating in onboard life'],
  'digital-raffles-and-campaigns': ['/media/onboard-life.jpg', 'Guests taking part in a live onboard activity'],
}

function applyBrand(source) {
  for (const [from, to] of replacements) source = source.replaceAll(from, to)
  if (!source.includes('/recovery.css')) {
    source = source.replace('<link rel="stylesheet" href="/marketing.css">', '<link rel="stylesheet" href="/marketing.css"><link rel="stylesheet" href="/recovery.css">')
  }
  return source
}

function recoverHomepage(source) {
  source = source.replace(/<div class="hero-visual" aria-label="Illustrative Regreenity dashboard">[\s\S]*?<\/div><\/div><\/section><section class="section section-dark">/, `${heroVisual}</div></section><section class="section section-dark">`)
  const verticalMarker = '<section class="section"><div class="shell"><div class="section-head"><div><div class="eyebrow">Two verticals</div>'
  if (!source.includes('recovered-stories') && source.includes(verticalMarker)) source = source.replace(verticalMarker, `${storySection}${verticalMarker}`)
  source = source.replace('<a class="vertical-card cruise" href="/cruise/">', '<a class="vertical-card cruise" href="/cruise/"><img class="vertical-bg" src="/media/onboard-life.jpg" alt="Life onboard a cruise ship" loading="lazy"><i class="vertical-scrim" aria-hidden="true"></i>')
  return source
}

function recoverPageVisual(source, slug) {
  const visual = visualBySlug[slug]
  if (!visual || source.includes('page-hero-photo')) return source
  const [src, alt] = visual
  const marker = '</div></section><section class="section"><div class="shell content-grid">'
  if (!source.includes(marker)) return source
  return source.replace(marker, `<figure class="page-hero-photo"><img src="${src}" alt="${alt}" loading="eager"><span class="page-photo-kicker">Regreenity · ${slug.startsWith('cruise') ? 'Cruise' : 'Guest engagement'}</span></figure></div></section><section class="section"><div class="shell content-grid">`)
}

for (const slug of pages) {
  const file = resolve(root, slug, 'index.html')
  if (!existsSync(file)) continue
  let source = applyBrand(readFileSync(file, 'utf8'))
  if (slug === '') source = recoverHomepage(source)
  else source = recoverPageVisual(source, slug)
  writeFileSync(file, source, 'utf8')
}

for (const path of ['sitemap.xml','robots.txt','site.webmanifest','marketing.js']) {
  const file = resolve(root, 'public', path)
  if (!existsSync(file)) continue
  writeFileSync(file, applyBrand(readFileSync(file, 'utf8')), 'utf8')
}

console.log('Applied Regreenity branding, restored approved imagery, and recovered the premium visual frontend.')
