# Cruise Connection — Product Definition

Cruise Connection is a white-label **add-to-app module for cruise lines**. It turns positive onboard human interaction into measurable crew recognition, real-time service recovery, passenger participation, social commerce and shareable positive memories.

## Product rule

Cruise Connection facilitates a safe first connection; it does not try to become a social network.

Passenger journey:

**Discover → Affirm → Respond → Meet → Participate → Remember**

There is no unrestricted passenger chat and no dating functionality. Guests who mutually want further contact can meet physically onboard or move to the cruise line's own chat / another communication channel outside Cruise Connection.

## Passenger discovery

There is no default ship-wide passenger directory.

Discovery methods:

### 1. Nearby

A guest can opt into coarse nearby visibility while using Cruise Connection or for a bounded period. The native cruise-line app/SDK supplies rotating pseudonymous proximity identifiers for same-sailing opted-in passengers.

Display only what the passenger needs to recognize someone they can already see:

- chosen first name
- chosen profile image/avatar
- voluntarily shared interests
- "Nearby" context

Do not expose:

- exact distance
- live map location
- cabin/stateroom
- raw reservation reference
- phone number
- full sailing manifest

No facial recognition. A human selects another human from the opted-in nearby set.

### 2. Shared activity

Passengers can rediscover opted-in people from an activity both attended.

### 3. Shared interests

Guests can select practical sailing interests such as:

- food experiences
- shopping
- fitness
- wellness
- adventure excursions
- culture
- trivia & games
- live music
- family activities
- beach & nature

Only interests the guest chooses to share are used for passenger discovery/social proof.

Minor accounts are excluded from peer discovery by default and require cruise-line/guardian rules.

## Positive first contact and reciprocity

First contact is limited to predefined positive affirmations, for example:

- Great style
- That was kind of you
- You made us laugh
- Great energy
- You seemed friendly
- Great trivia teammate

The recipient can acknowledge or ignore the affirmation.

**No meeting invitation is available until the recipient responds positively.**

If acknowledged, Cruise Connection may allow predefined meeting/activity proposals only in public onboard contexts, for example:

- coffee
- bar
- restaurant
- trivia/game
- spa/wellness activity
- shopping
- fitness activity
- show
- excursion

Cabins/staterooms are never offered as meeting destinations.

### Passenger interaction anti-spam

Recommended pilot constraint:

`UNIQUE (sailing_id, sender_passenger_id, recipient_passenger_id, service_date_local)`

One sender can send at most one affirmation to the same recipient per sailing-local day. Meeting/activity proposals are separate and become available only after positive recipient acknowledgement.

For end-of-cruise public summary counts, each sender contributes at most one count to a given affirmation label across the sailing.

## Interest activation and social commerce

The cruise line should actively promote passenger activation because interest participation is what makes the social-commerce layer useful.

Recommended activation moments:

- pre-sailing app setup
- embarkation
- app home tile
- daily program
- after relevant activities
- contextual inventory prompts

The same passenger interest can support both natural connection and relevant commerce:

- Food → specialty dining, tastings, culinary excursions
- Shopping → onboard retail, shopping excursions, local markets
- Fitness → classes, active excursions, wellness
- Wellness → spa, yoga, recovery experiences
- Adventure → excursions, sports, outdoor activities
- Culture → museums, city tours, heritage/food experiences

The cruise line retains inventory, price, checkout and payment. Cruise Connection contributes the social/intent context and attribution event.

## Crew recognition

Crew recognition remains a central pillar.

One passenger may recognize the same crew member **once per sailing-local calendar day**, selecting **up to two predefined positive reasons**.

Crew summaries show:

- ship/sailing number
- sailing dates
- total recognitions
- unique recognizing guests
- recognition-reason counts
- days on which recognition occurred

No public crew rankings.

## Service recovery

Negative feedback uses a private route separate from positive recognition.

The cruise line can capture, route, acknowledge, resolve and re-check satisfaction while the passenger is still onboard.

## Experience Pulse

Experience Pulse is private operational feedback, not a public star-rating system.

Suggested departments:

- Dining
- Stateroom
- Pool & deck
- Entertainment
- Excursions
- Guest services

Rules:

- ask only about departments the guest actually used
- max one pulse per department/guest/sailing-local day
- low score can open private recovery
- high score can ask whether a crew member deserves recognition
- post-recovery pulse measures satisfaction uplift after intervention

## Offline-first at sea

Public internet is not a requirement for core interaction.

### Device layer

- pre-bundled/pre-cached app shell or ship-local shell delivery for first onboard open
- cached app shell
- selected interests/preferences
- pending action queue
- native proximity bridge
- approved sailing entitlement

### Ship-local layer

Where exposed by the cruise line:

- onboard passenger/crew resolution
- local event delivery
- service issue routing
- commerce inventory handoff
- local analytics

### External cloud layer

Can synchronize later:

- enterprise analytics
- cross-sailing aggregation
- CRM/BI feeds
- external social sharing

The demo service worker/offline queue illustrate the pattern. Production local records require approved secure storage, retention and encryption controls.

## GAMMESO™

**G**reat Interaction → **A**ffirmation → **M**ore Participation & Interaction → **M**ore Activity & Commerce → **E**nd-of-Cruise Positive Summary → **S**ocial Sharing → **O**rganic Cruise-Line Exposure

## Working commercial structure

- enterprise onboarding/integration fee
- ship activation/licensing fee
- $1 per eligible passenger working platform anchor
- 5% of agreed attributable incremental onboard revenue working performance anchor

Pilot economics may be discounted, but the underlying commercial model should be measured rather than assumed.
