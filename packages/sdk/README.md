# CruiseConnect SDK

Versioned host-application SDK for CruiseConnect. The cruise line implements the operator-edge API; CruiseConnect supplies feature orchestration, entitlement checks, idempotency and offline delivery. Passenger and crew identity, images, source actions and purchases stay in the operator environment. See `docs/CONNECT_AND_GO.md`.

VConnect 1.1 adds typed actions for a predefined connection request, recipient acceptance/decline, and approved public-place/time proposals. The reference operator host enforces eight Anonymous Vibes and one VConnect request per authenticated passenger per sailing-local day. Production operators must apply the same limits server-side; client controls are not a security boundary.
