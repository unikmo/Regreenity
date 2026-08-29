# Regreenity privacy-safe measurement contract

## Default boundary

The cruise line retains passenger and crew identity, booking references, cabin data, payment data and detailed service records. Regreenity does not require a copy of the passenger database.

Regreenity receives only approved activity events, opaque sailing-scoped references and aggregated outcomes. Pseudonymous events are handled as personal data until they are irreversibly anonymized and aggregated.

## Revenue attribution

1. CruiseConnect creates a random `attributionRef` when a guest follows a recommendation into the cruise line's booking flow.
2. The cruise line keeps the passenger, inventory, checkout and payment relationship.
3. The cruise line returns the `attributionRef`, sailing, product category, currency, confirmed value and outcome status.
4. Regreenity calculates conversion and attributed revenue without receiving passenger identity, booking reference or payment details.
5. Cancelled or refunded outcomes update the attributed total.

## Structured live-event feedback

Each event-feedback submission contains an operator event reference, a one-to-five score, up to five prepared response-block identifiers and a time bucket. There is no free-text field in the standard flow.

Authorized cruise-line leaders receive feedback immediately. The cruise line controls whether any aggregated rating is published.

## Passive-guest recognition prompt

The host app evaluates whether a guest has taken a positive action during the current sailing day. Only an eligible passive guest may see the single prompt: “Did someone make your day today?” The prompt is removed after a positive action and is not used as a repeated notification campaign.

## Shareable evidence

Regreenity may report activation, structured ratings, recognition, recovery, conversion and attributed revenue as aggregated or irreversibly anonymized measures. Passenger-level records, identity fields and small-group breakdowns are excluded. Minimum reporting groups and retention periods are agreed per deployment and enforced before external benchmarking.

## Required production controls

- tenant and sailing separation;
- server-side validation of operator outcome events;
- signed connector requests and replay protection;
- role-based dashboard access;
- short retention for event-level records;
- deletion and aggregation schedules;
- audit logs without identity payloads;
- small-group suppression before sharing or publication;
- a controller/processor agreement and deployment-specific privacy notice.
