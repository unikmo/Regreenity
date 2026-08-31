# CruiseConnect — Cruise-App + Offline-First Integration Contract

The repository contains a front-end demonstration contract. It is not an authentication backend or production proximity implementation.

## Design objective

Cruise Connection should continue to provide its core onboard experience when a passenger has **no public internet connection**.

The production system should distinguish:

1. **Device/native app capability**
2. **Ship-local network capability**
3. **External internet/cloud capability**

The passenger should not have to understand which transport is currently being used.

## Production launch route

1. Cruise-line app pre-bundles/pre-caches the Cruise Connection shell during install/pre-sailing sync, or makes it available from the ship-local network.
2. Cruise-line app opens Cruise Connection.
3. Host obtains/refreshes a short-lived signed sailing entitlement while it has trusted backend connectivity.
4. The operator validates the entitlement and binds it to the guest and sailing inside its own identity environment.
5. The host app can retain an approved offline entitlement for the active sailing.
6. Embedded UI receives only the minimum session context.
7. Native host bridge provides device-only capabilities such as nearby discovery and local notifications.
8. Actions are delivered through ship-local APIs when available or queued securely for later synchronization.
9. Commerce actions return to the cruise line's own booking route.
10. External cloud analytics/social sharing can synchronize when internet connectivity returns.

## Native proximity bridge

Nearby passenger discovery should be implemented in the native cruise-line app/SDK rather than relying on browser scanning.

Recommended characteristics:

- opt-in only
- same-sailing only
- rotating pseudonymous proximity identifier
- coarse "nearby" presentation rather than exact distance
- no live passenger map
- no cabin/stateroom exposure
- operator-side face matching against the cruise line's crew roster, using the visible badge name as a supporting check; approved QR/NFC/manual fallback where needed
- minors excluded by default
- native platform permissions respected

The host should resolve a rotating proximity identifier to a limited passenger discovery profile only after verifying both guests are entitled to the same sailing and have opted in. Rotating or hashed person-level identifiers stay operator-side and are not Regreenity analytics inputs.

The operator edge must enforce passenger-to-passenger limits against authenticated sailing-local identity: no more than eight Anonymous Vibes sent per passenger per sailing-local day and no more than one VConnect request per passenger per sailing-local day. A ninth vibe attempt is rejected and the sender remains paused until the next sailing day. VConnect accepts only configured request, public-venue/activity and time option identifiers. A requester-facing status is emitted only after the recipient accepts; declines, ignores, blocks and reports are not disclosed to the requester.

## Crew identity boundary

Crew face matching belongs in the cruise line's identity zone—not Regreenity cloud. The in-app capture must show the crew member's face and visible name badge; badge text alone is not used to resolve identity. The capture image and biometric template may be processed on-device, ship-local or in the operator's own service. The host returns the selected internal crew record to its own recognition workflow; the Regreenity bridge receives no image, template, candidate list or match score. A non-biometric operator-issued QR/NFC or staff-assisted manual route remains required for deployments where biometric processing is not approved or a match is uncertain.

## Regreenity cloud boundary

Regreenity cloud receives only the allow-listed aggregate report and non-identifying operational health totals: uptime, latency buckets, sync success/failure counts, deployed version and error counts. It does not receive passenger/crew source events, device IDs, randomized person IDs, biometric data or exact event timestamps.

## Demo bridge events

`src/bridge.ts` currently demonstrates:

- `READY`
- `START_NEARBY_DISCOVERY`
- `STOP_NEARBY_DISCOVERY`
- `UPDATE_INTERESTS`
- `PASSENGER_AFFIRMATION`
- `PUBLIC_MEET_PROPOSAL`
- `CREW_RECOGNITION`
- `SERVICE_ISSUE`
- `EXPERIENCE_PULSE`
- `OPEN_BOOKING`

These are transport/event shapes only. Production schemas need versioning, replay protection, authorization and server-side validation.

## Offline shell and queue

The demo includes:

- `public/sw.js` for same-origin application-shell caching
- `src/offline.ts` for a simple browser-local action queue

This makes the demo genuinely usable after the shell has been loaded once, but it is **not the production security design**.

Production requirements:

- host-approved secure local storage
- encryption at rest where required
- sailing-scoped retention
- idempotency keys
- replay protection
- queue size limits
- conflict resolution
- deterministic service-date handling in the sailing timezone
- explicit sync state / retry policy

Urgent service-recovery requests should prefer the ship-local operational path when available instead of waiting for external cloud sync.

## Data minimization

Cruise Connection should not require a cabin number, raw reservation locator, passenger phone number or full date of birth for core passenger interaction.

Minimum useful context:

- cruise-line/tenant reference
- operator-local guest ID (never a Regreenity analytics field)
- ship
- sailing
- age band / family entitlement
- locale
- feature entitlements

## Commerce handoff

Cruise Connection can create the intent/recommendation context, but the host cruise app should retain:

- inventory
- availability
- price
- checkout
- payment
- order ownership

The host returns only the agreed attribution/event data needed for pilot measurement.
