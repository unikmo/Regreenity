# Regreenity aggregate-only measurement contract

## Default boundary

The cruise line retains passenger and crew identity, booking references, cabin data, payment data and detailed service records. Regreenity does not require a copy of the passenger database.

The default deployment places a privacy gateway inside the cruise-line or ship-local environment. Regreenity's analytics endpoint accepts only a signed `CruiseAggregateReport`; it rejects passenger IDs, crew IDs, names, badge images, selfies, cabin data, booking references, attribution references, exact event timestamps, free text and payment data. There is no raw-event endpoint in the default architecture.

Reports use sailing/day granularity. The default minimum reporting group is 20. Smaller cells must be suppressed or rolled into a larger category before transmission.

## Exact report sent to Regreenity

Each report contains only:

- operational envelope: schema version, operator, ship, sailing, reporting period, generation time, privacy-gateway version and applied threshold;
- activation: eligible guests, activated guests and positive-action totals;
- recognition: total recognitions, recognizing-guest total, recognized-crew total, prepared-reason counts and department counts;
- live-event feedback: response total, one-to-five rating distribution and prepared-response counts;
- recovery: issue, acknowledgement and resolution totals, median response times and prepared category counts;
- commerce: handoff, confirmed, cancelled and refunded totals, currency, net attributed value and product-category counts.

No row can identify a passenger or crew member. Every reason, department, response and product bucket must match a server-side vocabulary agreed during configuration; arbitrary bucket text is rejected. Individual recognition may remain available to authorized cruise-line leaders in their own system, but it is not transmitted to Regreenity.

## Instant crew recognition with a photo

1. The passenger opens crew recognition inside the cruise-line app.
2. The camera asks the passenger to frame the visible crew name badge. A selfie is acceptable only when the crew member voluntarily participates and the badge/name remains readable.
3. The host app reads the printed identifier or lets the passenger confirm a directory match. It does not perform facial recognition.
4. The passenger selects up to two prepared positive reasons and sends the recognition to the cruise line's service.
5. The image is discarded immediately after confirmation/send. It is not put in analytics, logs, queues or backups and never reaches Regreenity.
6. The cruise-line privacy gateway later contributes the interaction only to threshold-protected sailing/day/department totals.

The cruise line remains responsible for an appropriate lawful basis, transparent crew/passenger notice, staff policies, access controls and any deployment-specific impact assessment. A camera permission prompt is not, by itself, a GDPR lawful basis.

## Revenue attribution

The cruise line keeps the passenger, inventory, checkout and payment relationship. It resolves individual attribution locally, then sends confirmed, cancelled and refunded totals and net value by approved product category. Regreenity never receives the booking or attribution reference.

## Structured live-event feedback

The host service locally aggregates one-to-five ratings and up to five prepared response-block identifiers. There is no free-text field in the standard flow. Authorized cruise-line leaders can use their operational system immediately; only threshold-protected distributions reach Regreenity. The cruise line controls publication.

## Passive-guest recognition prompt

The host app evaluates whether a guest has taken a positive action during the current sailing day. Only an eligible passive guest may see the single prompt: “Did someone make your day today?” The status is not sent to Regreenity at person level.

## Shareable evidence

Regreenity may report activation, structured ratings, recognition, recovery, conversion and attributed revenue only as aggregated or irreversibly anonymized measures. Cross-customer benchmarks use ranges or percentiles and must combine at least five independently operated sailings and at least 100 qualifying responses, in addition to the per-cell minimum of 20. Customers may contractually opt out.

## Required production controls

- tenant and sailing separation;
- server-side validation of operator outcome events;
- signed connector requests and replay protection;
- strict report schema, recursive identity-field rejection and server-side bucket allow-lists;
- no raw-event endpoint;
- cruise-line-side deletion of temporary badge images;
- role-based dashboard access;
- deletion and aggregation schedules inside the cruise-line environment;
- audit logs without identity payloads;
- small-group suppression before sharing or publication;
- a controller/processor agreement and deployment-specific privacy notice.
