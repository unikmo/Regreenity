# Tisonik

**Guest Engagement Platform for Cruise Lines, Hotels & Resorts**

> Better guest moments. Faster recovery. More revenue.

Tisonik connects guest-facing participation with operational service intelligence and relevant ancillary revenue opportunities. The platform is deliberately focused on two verticals with similar high-dwell guest journeys: **cruise lines** and **hotels & resorts**.

## Positioning

- **Brand:** Tisonik
- **Category:** Guest Engagement Platform
- **Descriptor:** For cruise lines, hotels and resorts
- **Homepage:** Turn guest engagement into better experiences and more revenue
- **Primary CTA:** Request a pilot

## Platform model

### Engage
Guest participation, crew/staff recognition, real-time feedback, promotions, rewards and paperless live campaigns.

### Recover
Structured service recovery from signal → acknowledgement → assignment → resolution → post-recovery pulse.

### Grow
Relevant ancillary opportunities informed by voluntary guest context, while the operator keeps inventory, pricing, booking, payments and fulfilment.

## Vertical solutions

- **Tisonik Cruise** — sailing-scoped passenger engagement, crew recognition, service recovery, paperless participation and onboard revenue handoffs.
- **Tisonik Hotels & Resorts** — in-stay participation, staff recognition, service intelligence and property-owned ancillary opportunities.

## Public site architecture

Commercial/category pages include `/guest-engagement-platform/`, `/cruise/`, `/hotels-resorts/`, `/hotel-guest-experience-software/`, `/hotel-guest-app/`, `/hospitality-mobile-app/`, `/resort-app/`, `/hotel-upselling-software/` and `/hotel-ancillary-revenue/`.

Solution pages include `/guest-participation/`, `/service-recovery/`, `/crew-and-staff-recognition/`, `/guest-feedback/`, `/ancillary-revenue/`, `/promotions-and-rewards/` and `/digital-raffles-and-campaigns/`.

## Cruise pilot

The existing v13 cruise pilot remains available at `/pilot-simulator/`. The backend remains the live Supabase `cruiseconnect-api-v3`; public branding is now **Tisonik Cruise** while internal API/function names remain unchanged for migration safety.

Pilot roles include Passenger, Crew, Cruise Director, Guest Services, Marketing, Sales/Revenue, Crew Lead, Activities/Entertainment and Admin.

## Build

```bash
npm install
npm run build
```

The build:

1. assembles the v13 cruise simulator source;
2. applies Tisonik Cruise public branding;
3. generates the static SEO marketing site;
4. type-checks the application;
5. builds the marketing pages and pilot with Vite.

GitHub Actions then copies `dist/` to `pilot-static/`, which is the prebuilt artifact served by the connected Vercel project.

## Pilot requests

`/request-pilot/` submits to the Supabase Edge Function `tisonik-pilot-request`. Requests are stored server-side in `public.tisonik_pilot_requests`; direct anonymous table access is disabled.

## Current production boundary

The public site and cloud pilot are suitable for enterprise demonstration and pilot acquisition. Fleet/property production still requires customer-specific identity, PMS/manifest/roster/inventory adapters, production SSO/JWT/OIDC, ship/property network design where applicable, push/deep-link integration and customer security/privacy review.
