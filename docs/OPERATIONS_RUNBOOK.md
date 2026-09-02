# CruiseConnect operations runbook

## Controlled deployment

Build and test from a clean commit. Pack the SDK, generate the Ed25519 manifest, and verify it before promoting the exact digest to a staging ship environment. Release configuration starts disabled and is enabled by sailing and feature only after identity, safety, offline and rollback checks pass.

Tagged public releases additionally use GitHub OIDC provenance and SBOM attestations; GHCR operator-edge images are signed keylessly with Sigstore. The persistent staging blueprint is `render.yaml` and starts with automatic deployment disabled, generated secrets, managed TLS, a health check and a 10 GB persistent disk.

## Health and monitoring

Use `/health` for process liveness, `/ready` for database readiness and `/metrics` for identifier-free Prometheus counters. Alert on readiness failures, sustained 5xx responses, queue backlog, rejected authentication and retention cleanup failure. Never place passenger, crew, booking, cabin or image identifiers in metrics or logs.

## Rollback

Disable the affected feature flag first. Verify the prior signed package, prepare it with `npm run release:rollback -- releases/<package>.tgz`, deploy through the operator's controlled release system, run conformance, then re-enable by sailing. Database migrations must be backwards compatible for one supported release.

## Incident and privacy response

Block the affected sailing token or participant at the operator edge, preserve the non-PII audit trail, purge expired identity material, and notify the cruise-line security contact under the agreed incident schedule. Tisonik should receive aggregates and service health only; operator-side identity incidents remain in the operator environment.

## Customer integration boundary

The bundled adapter is synthetic. Before production, the cruise line supplies approved mappings for identity/roster, bookings/sailings, events, commerce, notifications and ship connectivity; passes the conformance suite; supplies its mobile signing identities; and approves data residency, retention and operational ownership.
