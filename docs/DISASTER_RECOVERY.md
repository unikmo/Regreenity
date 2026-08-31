# Disaster recovery

The operator edge stores its transaction database on a persistent encrypted volume. Run `npm run edge:backup -- <destination>` from a controlled scheduler; the command performs an online SQLite backup, verifies `pragma integrity_check` on both source and destination, and atomically publishes only a valid backup.

Copy verified backups to the operator-approved encrypted object store with immutable retention. Never place backups in the container image or public artifacts. Restore into a new volume, run `npm run test:recovery`, start with the release channel paused, pass `/ready` and conformance, then enable one test sailing before wider promotion.

Target engineering objectives for staging are RPO 24 hours and RTO 4 hours. A cruise operator may require tighter objectives. Quarterly restoration evidence and annual incident exercises should be retained in the customer’s operational system.
