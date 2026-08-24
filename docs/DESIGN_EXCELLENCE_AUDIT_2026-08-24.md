# Regreenity — Design Excellence Audit & Rebuild

Date: 24 August 2026
Scope: public marketing website and conversion journey. The Regreenity Cruise v13 simulator remains functionally separate and is not visually re-platformed by this pass.

## Governing standard

This rebuild applies the attached Website Build Pro Design Excellence framework as a production discipline: clarity, restraint, hierarchy, cognitive ease, brand distinctiveness, usability, responsiveness, accessibility, interaction quality and technical execution.

The design is not intended to imitate award-site trends. Business comprehension, trust, conversion and accessibility take priority over spectacle.

## Source-level audit before rebuild

The pre-rebuild branch had three overlapping presentation layers:

1. `public/marketing.css` — original marketing system.
2. `public/recovery.css` — later visual recovery overrides.
3. generated Tisonik-era HTML post-processed into Regreenity through branding and recovery scripts.

This produced avoidable architectural and visual risk: multiple token systems, duplicate component definitions, override-driven geometry, repetitive page templates and a homepage carrying too many simultaneous concepts.

### Design Excellence scorecard — before rebuild

| Dimension | Score | Audit finding | Rebuild action |
|---|---:|---|---|
| Visual hierarchy | 7.2 | Hero was strong but too many equal-weight concepts followed immediately. | One dominant value proposition, one primary CTA, staged narrative. |
| Whitespace / cognitive relief | 6.8 | Many sections used cards and dense UI clusters rather than editorial separation. | 8px-based macro/micro spacing, fewer containers, stronger section rhythm. |
| Typography | 7.1 | Scale was visually bold but oversized in places and not fully role-based. | Deliberate display/section/body/metadata hierarchy and readable measures. |
| Grid / geometry | 6.4 | Multiple CSS layers could produce competing radii, widths and breakpoints. | One shared grid, one radius system, one breakpoint hierarchy. |
| Color discipline | 7.3 | Teal worked, but multiple legacy accent/neutral variables remained. | Neutral foundation + deep ink + one teal action accent + semantic status colors. |
| Brand distinctiveness | 7.1 | Human imagery helped, but the underlying template remained generic SaaS. | Editorial hospitality storytelling + constrained product diagrams. |
| Interaction quality | 5.8 | Basic hover/menu behavior; limited keyboard state handling. | Explicit focus states, Escape/outside-click menu close, immediate feedback, reduced-motion support. |
| UX clarity | 7.0 | Product breadth was visible but required too much interpretation. | Engage / Recover / Grow becomes the primary mental model. |
| Conversion clarity | 7.1 | Request-a-pilot was present but competed with broad feature explanation. | Primary CTA repeated only at meaningful decision points; bounded-pilot framing strengthened. |
| Responsiveness | 6.8 | Responsive rules existed in both base and override CSS. | One responsive geometry system for desktop/tablet/mobile/narrow mobile. |
| Accessibility | 5.9 | Focus and menu behavior were incomplete; no explicit skip-link system. | Skip link, focus-visible, semantic navigation state, reduced motion, accessible form feedback. |
| Performance integrity | 7.4 | Static architecture is efficient, but duplicate CSS increased payload and maintenance cost. | Remove recovery stylesheet from output; one CSS system; no scroll-animation dependency. |
| Visual consistency | 5.9 | Base CSS + recovery CSS + post-processing created inconsistencies. | Single design system and compiler. |
| Innovation appropriateness | 6.5 | Visual storytelling existed but some UI simulation was ornamental. | Product diagrams retained only when they explain routing, measurement or integration. |
| Perceived trust / polish | 6.7 | Human imagery improved trust, while illustrative numeric UI risked reading as unsupported proof. | Remove fake performance metrics; use explicit pilot KPI labels instead. |

**Pre-rebuild verdict: BELOW STANDARD / PASS WITH DESIGN RISKS.**

## Rebuild decisions

### 1. One design system

`public/marketing.css` becomes the sole public marketing design system. The recovery stylesheet is removed from generated page output.

Tokens are organized around:

- deep ink neutral
- paper / surface / soft / warm neutral backgrounds
- one teal action accent
- semantic success / warning / error / information colors
- 4px / 8px spacing increments
- restrained radii and two shadow levels

### 2. Homepage hierarchy

The homepage now follows this decision sequence:

1. Category + value proposition + primary action
2. Four operating principles
3. Engage / Recover / Grow mental model
4. Recognition story
5. Service recovery story
6. Cruise positive-connection story
7. Participation / revenue story
8. Signal → context → action model
9. Pilot scorecard
10. Integration model
11. Cruise / Hotels & Resorts paths
12. Pilot CTA

No text is placed over the human photography.

### 3. No unsupported proof

Illustrative result numbers are removed from the marketing homepage. The site now presents the metrics a pilot should measure rather than implying outcomes that have not been independently proven.

### 4. Internal page differentiation

Public pages are assigned one of these intent patterns:

- Overview
- Vertical
- Solution
- SEO / intent
- Conversion
- Legal

They share the same design system but use different hero geometry, imagery rhythm and section treatment. This reduces template sameness without sacrificing navigational consistency.

### 5. Card restraint

Cards are retained only where grouping is semantically useful:

- pilot form
- bounded system nodes
- high-level vertical paths

Problem lists, outcomes, FAQs and workflows use borders, whitespace and editorial alignment rather than nested card stacks.

### 6. Accessibility and interaction

The rebuild includes:

- skip-to-content link
- visible `:focus-visible` treatment
- 44px minimum primary control height
- keyboard Escape behavior for the mobile menu
- outside-click close behavior
- `aria-current` navigation state
- `aria-expanded` menu state
- live form submission feedback
- reduced-motion support

### 7. Motion restraint

No scroll-driven narrative animation is required for comprehension. Hover and control feedback are short and functional. `prefers-reduced-motion` disables transitions that are not necessary.

## Target Design Excellence scorecard

These are implementation targets, not a claim of final browser-verified readiness.

| Dimension | Target |
|---|---:|
| Visual hierarchy | 9.0 |
| Whitespace / cognitive relief | 9.0 |
| Typography | 8.8 |
| Grid / geometry | 9.0 |
| Color discipline | 9.2 |
| Brand distinctiveness | 8.7 |
| Interaction quality | 8.5 |
| UX clarity | 9.1 |
| Conversion clarity | 9.0 |
| Responsiveness | 8.8 |
| Accessibility | 8.6 |
| Performance integrity | 9.0 |
| Visual consistency | 9.2 |
| Innovation appropriateness | 8.4 |
| Perceived trust / polish | 9.0 |

## Flawless Execution Gate

The source/build gate verifies:

- Regreenity-native public output
- no public Tisonik HTML
- one marketing stylesheet
- homepage value proposition and primary CTA
- all five approved image assets present
- focus-visible styling
- reduced-motion styling
- skip link
- key marketing routes
- pilot simulator
- sitemap
- live cruise backend health
- request-pilot CORS

### Still required before calling the site DESIGN EXCELLENCE READY

The framework correctly separates technical readiness from visual production readiness. A final browser QA pass is still required across:

- large desktop
- desktop
- tablet
- mobile
- narrow mobile
- keyboard-only navigation
- high zoom / text scaling
- slow network / image-loading states
- real request-pilot submission

Until that pass is completed, the correct verdict is **PASS WITH DESIGN RISKS — rebuilt source ready for visual QA**, not “Design Excellence Ready.”
