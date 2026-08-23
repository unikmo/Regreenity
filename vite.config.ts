import { defineConfig } from 'vite'
import { resolve } from 'node:path'

const pages = [
  'guest-engagement-platform','cruise','cruise-guest-engagement','cruise-mobile-app-engagement','cruise-service-recovery','cruise-guest-feedback','cruise-onboard-revenue','hotels-resorts','hotel-guest-experience-software','hotel-guest-app','hospitality-mobile-app','resort-app','hotel-upselling-software','hotel-ancillary-revenue','solutions','guest-participation','service-recovery','crew-and-staff-recognition','guest-feedback','ancillary-revenue','promotions-and-rewards','digital-raffles-and-campaigns','request-pilot','imprint','privacy','terms','cookies'
]

const input = Object.fromEntries([
  ['home', resolve(process.cwd(), 'index.html')],
  ...pages.map(slug => [slug, resolve(process.cwd(), slug, 'index.html')]),
  ['pilot-simulator', resolve(process.cwd(), 'pilot-simulator/index.html')],
])

export default defineConfig({
  publicDir: 'public',
  build: {
    rollupOptions: { input },
  },
})
