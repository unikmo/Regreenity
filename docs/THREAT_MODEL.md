# CruiseConnect threat model

## Protected assets and boundary

Passenger and crew identity, images, biometric templates, bookings, payment and source actions belong to the cruise operator and must not enter Regreenity cloud. Regreenity protects aggregate reports, tenant configuration, pilot enquiries, release artifacts and non-identifying health telemetry.

## Principal threats and controls

- Forged sailing access: short-lived signed, sailing-scoped tokens; role and claim validation; deny-by-default endpoints.
- Cross-sailing or minor contact: server-enforced sailing, adulthood, household, self, block and daily-limit checks.
- Anonymous-vibe re-identification: no sender column in vibe storage, daily rotating sender hashes and randomized delivery.
- Rejection disclosure or coercion: only accepted VConnect responses reach the requester; decline, block, report and expiry remain private.
- Image or biometric leakage: bounded ephemeral buffers are overwritten after operator-side matching and excluded from aggregate schemas.
- Replay and duplicate side effects: idempotency keys, bounded encrypted offline queues and expiry validation.
- Unsafe meeting content: prepared request, public-venue and time identifiers; prohibited private-room/dating terms rejected server-side.
- Tenant or portal disclosure: Supabase RLS, admin-only enquiry access, noindex/no-store portal controls and minimum reporting groups.
- Supply-chain compromise: lockfile installs, dependency audit, CodeQL, Dependabot, SBOM, Trivy, provenance attestation and signed containers.
- Loss or corruption: WAL persistence, verified online backup, integrity check, restore test, bounded retention and rollback packages.

Residual production risks are customer-host compromise, inaccurate customer mappings and operational misuse. These require the operator’s security review, connector conformance and vessel rehearsal.
