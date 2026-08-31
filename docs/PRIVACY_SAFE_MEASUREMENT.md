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
- anonymous passenger vibes: valid-vibe total, adult-receiver total, operator-side suppressed same-cabin/minor totals, prepared-reason counts and dense-rank position distributions;
- live-event feedback: response total, one-to-five rating distribution and prepared-response counts;
- recovery: issue, acknowledgement and resolution totals, median response times and prepared category counts;
- commerce: handoff, confirmed, cancelled and refunded totals, currency, net attributed value and product-category counts.
- service health: measurement/availability minutes, sync attempts/successes, deployed version, allow-listed error counts and latency buckets without device or person identifiers.

No row can identify a passenger or crew member. Every reason, department, response and product bucket must match a server-side vocabulary agreed during configuration; arbitrary bucket text is rejected. Individual recognition may remain available to authorized cruise-line leaders in their own system, but it is not transmitted to Regreenity.

## Instant crew recognition with a photo

1. The passenger opens crew recognition inside the cruise-line app.
2. The in-app camera asks the passenger to photograph the crew member with the crew member's face and visible name badge in frame. Guest selfies and badge-only captures are not part of the standard flow.
3. The cruise-line identity service matches the face against its own crew roster and uses the badge name as a supporting check. Where the operator has approved the necessary legal and security controls, that match resolves the correct crew record even when names are duplicated.
4. The passenger selects up to two prepared positive reasons and sends the recognition to the cruise line's service.
5. The image, biometric template, candidate list and match score remain on-device, ship-local or in the cruise line's own identity service. They never reach Regreenity and are retained or deleted under the operator's documented biometric policy.
6. The cruise-line privacy gateway later contributes the interaction only to threshold-protected sailing/day/department totals.

The cruise line remains responsible for an Article 6 lawful basis, an applicable Article 9 condition for biometric identification, transparent crew/passenger notice, staff policies, access controls, accuracy/challenge processes, a non-biometric fallback and any required impact assessment. A camera permission prompt is not, by itself, a GDPR lawful basis.

## Anonymous passenger-to-passenger vibe

1. The cruise line may include CruiseConnect passenger recognition as a clearly stated purpose in its adult boarding imaging enrolment. An adult who accepts that combined enrolment joins the sailing recognition pool once and receives no second in-app confirmation; adults who decline or later opt out are excluded.
2. The sender photographs the intended adult receiver inside the cruise-line app. The capture is encrypted to the operator identity zone and never enters Regreenity infrastructure.
3. The operator returns only an opaque one-time receiver token or a generic unavailable result. It does not return a name, profile, candidate list, age, reason for rejection or match score.
4. Before accepting the vibe, the operator verifies same sailing, adult eligibility, different cabin/booking group and duplicate/abuse limits. Each sender is capped at eight vibes per sailing-local day; a ninth attempt pauses sending until the next sailing day. Children cannot send, receive or be matched.
5. The sender chooses one prepared compliment. The stored compliment record contains no sender identity, and delivery is randomized or batched so the exact time cannot identify the sender.
6. The capture is destroyed immediately after the match transaction. The sailing-scoped opted-in reference template remains only under the operator's documented retention schedule and is deleted when no longer needed.
7. Regreenity receives only threshold-protected totals and dense-rank distributions. It receives no sender/receiver token, image, template or person-level rank.

Dense ranking assigns one position to each distinct valid-vibe total. If ten passengers tie at position four, all are position four and the next lower distinct score is position five. A Top Five badge therefore represents the first five score positions, not necessarily five passengers. It is private by default and may be shared only by the passenger who received it.

## VConnect mutual-consent request

VConnect is operationally separate from Anonymous Vibes. An eligible adult may send one predefined request per sailing-local day. The recipient sees a limited requester profile inside the cruise-line app and can accept, decline, block or report. Only acceptance is disclosed to the requester; an ignored, declined or reported request exposes no read receipt, reason or status. After acceptance, interaction remains limited to operator-approved public venues, activities and time windows. No free-text message, cabin, room number or exact live location is accepted. These person-level records remain inside the cruise line's environment and are not Regreenity analytics inputs.

Event reservations are count-only by default. A passenger may separately expose a chosen name/image to confirmed attendees. The cruise line must not publish passenger identity or rankings to social media.

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
- operator-controlled biometric processing, retention, accuracy testing and non-biometric fallback;
- role-based dashboard access;
- deletion and aggregation schedules inside the cruise-line environment;
- audit logs without identity payloads;
- small-group suppression before sharing or publication;
- a controller/processor agreement and deployment-specific privacy notice.
