# Regreenity privacy-safe measurement contract

## Default boundary

The cruise line retains passenger and crew identity, booking references, cabin data, payment data and detailed service records. Regreenity does not require a copy of the passenger database.

The preferred deployment places a privacy gateway inside the cruise-line or ship-local environment. That gateway validates passenger activity, updates minimum-size aggregate buckets and sends Regreenity only signed aggregate deltas. Passenger-scoped references do not cross into Regreenity systems.

If a deployment temporarily sends an opaque event to a Regreenity ingestion service, the service processes it in memory, updates an aggregate and destroys the source payload. Request bodies are excluded from application logs, queues and backups. A short-lived digest may be retained only for replay protection and cannot be used to reconstruct the source event.

## Revenue attribution

1. CruiseConnect creates a random `attributionRef` when a guest follows a recommendation into the cruise line's booking flow.
2. The cruise line keeps the passenger, inventory, checkout and payment relationship.
3. The cruise line resolves the reference and aggregates confirmed value, product category, currency and outcome status inside its privacy gateway.
4. Regreenity receives the signed aggregate delta, not the booking reference, passenger identity, payment details or individual attribution reference.
5. Cancelled or refunded aggregate deltas update the net attributed total.

## Structured live-event feedback

Each event-feedback submission contains an operator event reference, a one-to-five score, up to five prepared response-block identifiers and a time bucket. There is no free-text field in the standard flow. The privacy gateway converts submissions into count, distribution and trend buckets before transmission to Regreenity.

Authorized cruise-line leaders receive feedback immediately. The cruise line controls whether any aggregated rating is published.

## Passive-guest recognition prompt

The host app evaluates whether a guest has taken a positive action during the current sailing day. Only an eligible passive guest may see the single prompt: “Did someone make your day today?” The prompt is removed after a positive action and is not used as a repeated notification campaign.

## Shareable evidence

Regreenity may report activation, structured ratings, recognition, recovery, conversion and attributed revenue as aggregated or irreversibly anonymized measures. Passenger-level records, identity fields and small-group breakdowns are excluded. Minimum reporting groups and retention periods are agreed per deployment and enforced before external benchmarking.

## Required production controls

- tenant and sailing separation;
- server-side validation of operator outcome events;
- signed connector requests and replay protection;
- body-free ingestion logs and backups;
- in-memory aggregation with source-event destruction;
- role-based dashboard access;
- short retention for event-level records;
- deletion and aggregation schedules;
- audit logs without identity payloads;
- small-group suppression before sharing or publication;
- a controller/processor agreement and deployment-specific privacy notice.
