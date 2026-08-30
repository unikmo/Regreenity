import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const fallbackDetails: Record<string, string[]> = {
  '/': ['Passenger interaction inside the existing cruise-line app', 'Operator-side crew identity and face matching when duplicate names require it', 'Aggregate-only Regreenity cloud reporting', 'Buyer FAQ covering privacy, IT, connectivity, security, safety, workload, revenue, brand and ownership'],
  '/passenger-experience/': ['Opt-in discovery through nearby, activity or interest context', 'Predefined positive first contact', 'Public-place progression only after acknowledgement'],
  '/crew-recognition/': ['Contextual recognition during the sailing', 'Recognition without public rankings', 'Signals grouped by sailing, team and experience area'],
  '/service-recovery/': ['A private route for guests to signal friction', 'Capture, route, acknowledge, resolve and follow up', 'Department-level Experience Pulse'],
  '/engagement/': ['Interest-led discovery', 'Cruise and activity context', 'Structured positive interaction'],
  '/ancillary-revenue/': ['Context before offer', 'Cruise-line-owned inventory and checkout', 'Pilot-defined attribution'],
  '/social-commerce/': ['Contextual recommendations', 'Cruise-line-owned commerce', 'Pilot-defined attribution'],
  '/cruise-dashboard/': ['Outcome-led pilot measurement', 'No invented proof', 'Signals grouped by sailing and experience area'],
  '/integration/': ['White-label experience inside the cruise-line app', 'Operator-side identity, biometrics and source records', 'Aggregate KPI and non-identifying health telemetry to Regreenity cloud', 'Buyer FAQ covering the ten common executive objections'],
  '/product-app/': ['Private interactive walkthrough with illustrative data', 'Public product information is available on the main Regreenity pages'],
  '/pilot/': ['Deploy the complete connected product experience', 'Integrate inside the cruise line’s existing app', 'Measure passenger, crew, recovery, engagement and commercial outcomes end to end'],
  '/imprint/': ['PlanetHike OÜ operator information', 'Regreenity contact details'],
  '/privacy/': ['Website and business enquiry privacy', 'Passenger and crew deployment roles', 'Contact and data-subject rights'],
  '/terms/': ['Website and demonstration terms', 'Positive-interaction rules', 'Pilot and deployment boundaries'],
  '/cookies/': ['Essential local storage', 'Offline application caching', 'No non-essential tracking in the current site'],
}

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!)

const staticSeoFallback = () => ({
  name: 'regreenity-static-seo-fallback',
  transformIndexHtml(html: string) {
    const title = html.match(/<title>(.*?)<\/title>/s)?.[1] || 'Regreenity'
    const description = html.match(/<meta name="description" content="(.*?)"\s*\/?>(?:\s*)/s)?.[1] || 'Cruise-line guest-experience interaction layer.'
    const canonical = html.match(/<link rel="canonical" href="(.*?)"/)?.[1] || 'https://regreenity.com/'
    const path = new URL(canonical, 'https://regreenity.com').pathname
    const details = fallbackDetails[path] || fallbackDetails['/']
    const contact = path === '/pilot/' ? '<section id="contact"><h2>Request a complete one-ship Regreenity pilot</h2><p>Regreenity is an add-on inside the cruise line’s existing app—not a separate guest app.</p><form action="https://formsubmit.co/info@regreenity.com" method="POST"><input type="hidden" name="_subject" value="Regreenity pilot enquiry"/><input type="hidden" name="_next" value="https://regreenity.com/pilot/?sent=1"/><p><label>Work email<br/><input required name="email" type="email"/></label></p><p><label>Name<br/><input required name="name"/></label></p><p><label>Cruise line or company<br/><input required name="company"/></label></p><p><label>What should we know about your current app or pilot?<br/><textarea required name="message" rows="5"></textarea></label></p><p><label><input required type="checkbox" name="privacy_consent" value="I agree to the privacy policy"/> I agree to the <a href="/privacy/">privacy policy</a>.</label></p><button type="submit">Request a pilot conversation</button></form><p>Or email <a href="mailto:info@regreenity.com">info@regreenity.com</a>.</p></section>' : ''
    const fallback = `<main class="seo-fallback" style="max-width:980px;margin:0 auto;padding:48px 24px 72px;font-family:Inter,Arial,sans-serif;color:#171715;background:#faf8f4"><nav aria-label="Primary"><a href="/">Regreenity</a> · <a href="/passenger-experience/">Passenger experience</a> · <a href="/crew-recognition/">Crew recognition</a> · <a href="/service-recovery/">Service recovery</a> · <a href="/engagement/">Engagement</a> · <a href="/ancillary-revenue/">Ancillary revenue</a> · <a href="/pilot/">Pilot</a></nav><article><p style="margin-top:64px;letter-spacing:.18em;font-size:12px;color:#8a613f">REGREENITY · A PLANETHIKE PROJECT</p><h1 style="max-width:850px;font-size:clamp(38px,6vw,72px);line-height:1.02;font-weight:400">${escapeHtml(title)}</h1><p style="max-width:760px;font-size:19px;line-height:1.65;color:#5f5a54">${escapeHtml(description)}</p><h2>What this page covers</h2><ul>${details.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>${contact}</article><footer style="margin-top:64px"><a href="mailto:info@regreenity.com">info@regreenity.com</a> · <a href="/privacy/">Privacy</a> · <a href="/imprint/">Imprint</a></footer></main>`
    const routedFallback = fallback
      .replace('href="/pilot/">Pilot</a>', 'href="/pilot/#contact">Contact</a>')
      .replace('https://regreenity.com/pilot/?sent=1"', 'https://regreenity.com/pilot/?sent=1#contact"')
    const socialTags = [
      html.includes('property="og:type"') ? '' : '<meta property="og:type" content="website"/>',
      html.includes('property="og:description"') ? '' : `<meta property="og:description" content="${escapeHtml(description)}"/>`,
      html.includes('name="twitter:card"') ? '' : '<meta name="twitter:card" content="summary_large_image"/>',
      html.includes('name="twitter:title"') ? '' : `<meta name="twitter:title" content="${escapeHtml(title)}"/>`,
      html.includes('name="twitter:description"') ? '' : `<meta name="twitter:description" content="${escapeHtml(description)}"/>`,
      html.includes('name="twitter:image"') ? '' : '<meta name="twitter:image" content="https://regreenity.com/og-card.png"/>',
    ].join('')
    return html.replace('</head>', `${socialTags}</head>`).replace('<div id="root"></div>', `<div id="root">${routedFallback}</div>`)
  },
})

export default defineConfig({
  plugins: [react(), staticSeoFallback()],
  build: {
    rollupOptions: {
      input: [
        'index.html',
        'passenger-experience/index.html',
        'crew-recognition/index.html',
        'service-recovery/index.html',
        'engagement/index.html',
        'ancillary-revenue/index.html',
        'social-commerce/index.html',
        'cruise-dashboard/index.html',
        'integration/index.html',
        'product-app/index.html',
        'pilot/index.html',
        'portal/index.html',
        'imprint/index.html',
        'privacy/index.html',
        'terms/index.html',
        'cookies/index.html',
      ],
    },
  },
})
