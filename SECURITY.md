# Security policy

Report suspected vulnerabilities privately to `info@regreenity.com`. Do not include passenger, crew, booking, biometric or payment data in a report. Regreenity will acknowledge a report, triage severity, coordinate remediation and publish a release only after the fix and regression tests pass.

The supported release line is 1.1.x. Every merge runs contract, privacy, security, recovery, native-build, accessibility, load, dependency, container and static-analysis gates. Tagged packages and container images receive GitHub OIDC build-provenance attestations; container images are additionally signed keylessly with Sigstore.
