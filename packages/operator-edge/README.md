# CruiseConnect operator edge 1.1

Deployable operator-controlled service for sailing sessions, synthetic connector adapters, ephemeral passenger/crew matching, action persistence, five-vibe and one-VConnect daily limits, VConnect consent state, notifications, purchase handoffs, retention, audit and Prometheus metrics.

The included adapter is synthetic. A cruise line replaces it with mappings to its identity, roster, sailing, event, notification and commerce systems while keeping this API and safety contract.

Set unique 32+ character values for `CRUISECONNECT_EDGE_JWT_SECRET` and `CRUISECONNECT_EDGE_HASH_SALT`, then run `docker compose -f packages/operator-edge/compose.yaml up --build`.

The persistent SQLite database is stored in the named container volume with WAL, foreign keys and bounded retention. A multi-instance cruise deployment should replace `EdgeDatabase` with the operator's managed transactional store while preserving the conformance suite.

Health endpoints are `/health` and `/ready`; Prometheus metrics are exposed at `/metrics` without passenger identifiers. Administrative configuration, audit, blocks and cleanup require an `operator_admin` sailing token.
