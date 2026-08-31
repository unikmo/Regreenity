# Mobile release readiness

CruiseConnect declares no advertising identifier, tracking domain, analytics SDK, location permission, contacts permission or unrestricted network security exception. Its encrypted offline queue uses Keychain `ThisDeviceOnly` protection on iOS and Android Keystore plus `noBackupFilesDir` on Android.

The CI matrix compiles the Swift package on macOS and the Android library with API 35/minimum API 26, runs tests and Android lint, and blocks merges when either platform fails. The iOS privacy manifest declares no SDK-side collection or tracking. The host cruise line remains responsible for its own app privacy labels, camera purpose text, signing identities, accessibility acceptance and store submission because those describe the complete host app rather than this library alone.

Before publishing a customer build, record the SDK and operator-edge package digests, mobile build number, host-app commit, enabled feature flags, data residency, retention, rollback version and conformance result in the release ticket.
