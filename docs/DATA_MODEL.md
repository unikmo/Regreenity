# Proposed Domain Model

The demo is front-end only. A production pilot should separate cruise-specific identity, interaction, operations and attribution data.

## Primary entities

### Sailing
- id
- cruise_line_id
- ship_id
- departure_at
- arrival_at
- status

### Passenger
- id
- sailing_id
- reservation_reference_hash
- display_name
- age_band / minor guardrails
- interaction_preferences
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
- created_at
- acknowledged_at

### CrewRecognition
- id
- sailing_id
- passenger_id
- crew_member_id
- predefined_reason_id
- venue_id
- badge_capture_reference
- created_at

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

### Summary
- owner_type (passenger | crew)
- owner_id
- sailing_id
- aggregated_positive_counts
- share_token
- generated_at

## Safety constraints

- No unrestricted message body exists in the passenger interaction model.
- No dating preference exists.
- Public sharing excludes private sender identity by default.
- Service issues are private operational records.
- Badge capture should be retained only as long as operationally necessary.
- Face recognition is outside the product model.
