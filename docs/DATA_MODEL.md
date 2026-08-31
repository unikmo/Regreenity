# Cruise Connection — Proposed Domain Model

The current product is a front-end pilot/demo. A production pilot should keep cruise identity, interaction, operations and attribution data separated so security, retention and enterprise integrations can evolve independently.

## Primary entities

### Sailing
- id
- cruise_line_id
- ship_id
- sailing_number
- departure_at
- arrival_at
- operating_timezone
- status

### Passenger
- id
- sailing_id
- reservation_reference_hash
- display_name
- age_band / minor guardrails
- interaction_preferences
- shared_interest_preferences
- nearby_visibility_state
- activation_status

### CrewMember
- id
- ship_id
- employee_reference
- display_name
- department
- badge_identifier

### Venue
- id
- ship_id
- name
- category
- deck

### PositiveSignal
- id
- sailing_id
- sender_passenger_id
- recipient_passenger_id
- predefined_signal_id
- context_type
- context_id
- service_date_local
- created_at
- acknowledged_at

No unrestricted message-body field exists.

Recommended positive-signal rate limit:

`UNIQUE (sailing_id, sender_passenger_id, recipient_passenger_id, service_date_local)`

In addition, an authenticated passenger may send no more than eight positive signals in one sailing-local day. The ninth attempt pauses sending until the next sailing day. This limit is enforced in the cruise line's operator environment before an interaction is accepted.

For shareable passenger summaries, each sender should contribute at most one count to a given affirmation label across the sailing. This prevents repeated signals from one person inflating the recipient's public summary. Activity invitations should be deduplicated separately by activity/context.

### CrewRecognition
- id
- sailing_id
- passenger_id
- crew_member_id
- predefined_reason_ids (1–2 values)
- venue_id
- badge_capture_reference
- service_date_local
- created_at

#### Recognition anti-gaming constraint

A passenger may create **one recognition event for the same crew member per local sailing day**. A recognition event may contain **up to two predefined positive reasons**.

Recommended database uniqueness constraint:

`UNIQUE (sailing_id, passenger_id, crew_member_id, service_date_local)`

This allows genuine repeat recognition across a multi-day voyage while preventing repeated voting during the same day.

Crew reporting should separately expose:
- total recognition events
- unique recognizing guests
- recognition-reason counts
- number of sailing days on which recognition occurred
- ship / sailing number / sailing dates

These metrics should not be used to create public crew leaderboards.

### ServiceIssue
- id
- sailing_id
- passenger_id
- category
- venue_id
- status
- assigned_team
- opened_at
- acknowledged_at
- resolved_at
- passenger_close_loop_at

Service issues are private operational records and never enter the public recognition stream.

### ActivityInterest
- passenger_id
- sailing_id
- inventory_item_id
- interest_type
- created_at

### CommerceAttribution
- sailing_id
- passenger_id
- group_context_id
- inventory_item_id
- recommendation_event_id
- booking_reference
- gross_value
- attribution_method
- experiment_group / control_reference where applicable

### Summary
- owner_type (passenger | crew)
- owner_id
- sailing_id
- aggregated_positive_counts
- unique_sender_count where applicable
- active_recognition_days where applicable
- share_token
- generated_at

## Safety and privacy constraints

- Same-sailing passenger interaction only.
- No unrestricted passenger message body.
- No dating preference or dating mode.
- Public sharing excludes private sender identity by default.
- Service issues are private operational records.
- Crew capture must show the crew member's face and visible name badge. Operator-side face matching resolves the crew roster record; badge text is a supporting check and is not used alone.
- Crew images and biometric match artefacts remain operator-side and should be discarded under the cruise line's documented retention policy after identity resolution.
- Block/report controls remain available for passenger interaction.

### PassengerDiscoveryPreference
- passenger_id
- sailing_id
- nearby_visibility (`off` | `while_using` | `bounded_window`)
- shared_activity_visibility
- shared_interest_visibility
- profile_visibility fields allowed by cruise-line policy
- updated_at

There is no default ship-wide passenger directory.

### PassengerInterest
- passenger_id
- sailing_id
- interest_id
- discoverable
- commerce_personalization_allowed
- created_at / updated_at

Interests are voluntarily selected and cruise-relevant (food, shopping, fitness, wellness, excursion style, culture, etc.). A passenger may allow an interest to support recommendations without necessarily exposing it to other passengers.

### ProximityPresence
- sailing_id
- passenger_id
- rotating_proximity_id_hash
- visibility_window_started_at
- visibility_window_expires_at
- native_capability_reference
- last_ship_local_seen_at

Proximity is resolved by the native host/SDK. The passenger UI receives a coarse `nearby` result, never exact distance or a live map coordinate. Rotating identifiers must not be usable as stable tracking identifiers.

### SharedActivityParticipant
- sailing_id
- activity_id
- passenger_id
- attendance_verified_at
- discoverable_in_context

### PositiveSignalResponse
- positive_signal_id
- recipient_passenger_id
- response (`acknowledged` | `ignored`)
- responded_at

An ignored signal terminates the interaction. A public meeting/activity proposal cannot be created unless the underlying positive signal has been acknowledged.

### PublicMeetProposal
- id
- sailing_id
- sender_passenger_id
- recipient_passenger_id
- positive_signal_id
- venue_or_activity_type
- inventory_item_id (optional)
- status
- created_at

Allowed types are configured from approved public onboard venues/activities (coffee, bar, restaurant, game, spa/wellness, shopping, fitness, show, excursion, etc.). Cabins/staterooms are explicitly excluded from the allowed enum/configuration.

### VConnectRequest

- id
- sailing_id
- requester_passenger_id
- recipient_passenger_id
- predefined_request_option_id
- service_date_local
- status (`pending` | `accepted` | `declined` | `blocked` | `expired`)
- created_at / responded_at / expires_at

Only one request may be created by a passenger per sailing-local day. The requester receives a status event only for `accepted`; all other terminal states remain undisclosed. An accepted request produces a sailing-scoped connection token that permits prepared public-venue/activity and time proposals. It never enables free text, cabin or room-number exchange, exact live location, or dating-oriented templates.

### OfflineAction
- idempotency_key
- sailing_id
- passenger_id
- action_type
- encrypted_payload_reference
- service_date_local
- device_created_at
- sync_status
- synced_at

The browser demo uses local storage only. Production should place queued records in the host application's approved secure local storage, with replay protection, sailing-scoped retention and idempotent server processing.

### ExperiencePulse
- id
- sailing_id
- passenger_id
- department
- score (1–5)
- context_type
- context_id
- service_date_local
- related_service_issue_id (optional)
- created_at

Recommended uniqueness constraint:

`UNIQUE (sailing_id, passenger_id, department, service_date_local)`

Low scores can offer private recovery. A post-resolution pulse may be linked to the related ServiceIssue so the cruise line can measure satisfaction uplift rather than only closure time.

### IntegrationSession
- id
- cruise_line_id
- sailing_id
- passenger_id (pseudonymous platform reference)
- host_session_reference
- feature_entitlements
- age_band
- locale
- issued_at
- expires_at

Production sessions must originate from a server-validated, short-lived signed launch token. Browser query parameters and `postMessage` events are transport mechanisms only and never identity proof.
