import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = process.cwd()
const pages = [
  '', 'guest-engagement-platform','cruise','cruise-guest-engagement','cruise-mobile-app-engagement','cruise-service-recovery','cruise-guest-feedback','cruise-onboard-revenue','hotels-resorts','hotel-guest-experience-software','hotel-guest-app','hospitality-mobile-app','resort-app','hotel-upselling-software','hotel-ancillary-revenue','solutions','guest-participation','service-recovery','crew-and-staff-recognition','guest-feedback','ancillary-revenue','promotions-and-rewards','digital-raffles-and-campaigns','request-pilot','imprint','privacy','terms','cookies','pilot-simulator'
]

const files = [
  ...pages.map(slug => resolve(root, slug, 'index.html')),
  resolve(root, 'public', 'sitemap.xml'),
  resolve(root, 'public', 'robots.txt'),
  resolve(root, 'public', 'site.webmanifest'),
  resolve(root, 'public', 'marketing.js'),
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

for (const file of files) {
  if (!existsSync(file)) continue
  let source = readFileSync(file, 'utf8')
  for (const [from, to] of replacements) source = source.replaceAll(from, to)
  writeFileSync(file, source, 'utf8')
}

console.log('Applied Regreenity branding and regreenity.com canonicals to generated site output.')
