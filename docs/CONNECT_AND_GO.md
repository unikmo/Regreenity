# CruiseConnect 1.0 — Connect-and-go deployment

## What ships

- `@regreenity/cruiseconnect-sdk`: versioned Web/TypeScript SDK with feature orchestration, entitlement checks, ephemeral recognition capture handling, idempotency and a bounded sailing-scoped offline queue.
- `packages/native-ios`: Swift Package bridge for a cruise-line `WKWebView`.
- `packages/native-android`: Android library bridge for a cruise-line `WebView`.
- `contracts/operator-api.v1.yaml`: standard operator-edge HTTP contract.
- `packages/reference-host`: executable synthetic cruise host used by the sandbox and tests.
- `/sandbox/`: reference app exercising every passenger and management journey.
- `/portal/`: tenant-isolated configuration, aggregate outcomes and operational health.

## Ten-minute Web integration

```ts
import { CruiseConnectClient, HttpHostAdapter, LocalStorageQueueStore } from '@regreenity/cruiseconnect-sdk'

const host = new HttpHostAdapter({
  baseUrl: 'https://ship-api.example/cruiseconnect/v1',
  tokenProvider: () => cruiseLineApp.getShortLivedSailingToken(),
})

export const cruiseConnect = new CruiseConnectClient(host, new LocalStorageQueueStore())
await cruiseConnect.initialize()
```

The host token binds the session to one operator, ship, sailing and guest. The feature list is an entitlement allowlist, not a client-side preference.

## Data boundary

Passenger and crew profiles, bookings, captures, recognition templates, source actions, purchases and notifications remain in the cruise line's application or ship-local environment. Recognition methods overwrite the supplied image buffer after a match response. Regreenity cloud receives only thresholded aggregates and non-identifying service health.

## Required operator adapters

1. Issue and validate a short-lived sailing token.
2. Map the session, events and meetups endpoints to existing operator services.
3. Implement passenger/crew match within the operator identity zone, with a QR/NFC fallback.
4. Route action envelopes to ship-local services and enforce same-sailing, adult-only, household exclusion and duplicate limits.
5. Keep checkout, payments and orders in the existing commerce system; return an attribution outcome.
6. Map notifications to local or push delivery.

## Release gates

Run `npm test`, `npm run build`, `npm run build:sdk`, then `npm run release:sdk`. A customer release must also pass operator API conformance, iOS/Android host-app builds, accessibility/device QA, penetration review and a ship-connectivity rehearsal using customer infrastructure.

## Deployment sequence

1. Create the operator tenant and invite operator administrators.
2. Select features and white-label settings in `/portal/`.
3. Deploy the operator-edge API against the OpenAPI contract.
4. Add the Web SDK and one native bridge to the existing app.
5. Run `/sandbox/` and the automated test suite against the operator adapter.
6. Complete a non-production sailing rehearsal, then promote the same versioned packages to the pilot.

## Privacy default

The minimum reporting group is 20. No small cell, person-level token, image, biometric, free text, device identifier, cabin, booking reference or exact source timestamp is accepted by the Regreenity aggregate API.
