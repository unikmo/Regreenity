import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const ios=await readFile(new URL('../packages/native-ios/Sources/CruiseConnect/CruiseConnect.swift',import.meta.url),'utf8')
assert.match(ios,/trustedOrigin\.scheme == "https"/)
assert.match(ios,/message\.frameInfo\.isMainFrame/)
assert.match(ios,/securityOrigin/)
const android=await readFile(new URL('../packages/native-android/cruiseconnect/src/main/java/com/regreenity/cruiseconnect/CruiseConnectBridge.kt',import.meta.url),'utf8')
assert.match(android,/expected\.scheme == "https"/)
assert.match(android,/allowFileAccess = false/)
assert.match(android,/MIXED_CONTENT_NEVER_ALLOW/)
assert.match(android,/safeBrowsingEnabled = true/)
assert.match(android,/current\.host == expected\.host/)
console.log('Native bridge origin and WebView hardening contracts passed.')
