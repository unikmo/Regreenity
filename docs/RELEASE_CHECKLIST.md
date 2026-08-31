# CruiseConnect customer release checklist

- [ ] Customer operator-edge API conforms to `operator-api.v1.yaml`.
- [ ] Sailing tokens expire and are bound to operator, ship, sailing and guest.
- [ ] Adult-only passenger recognition and minors exclusion verified.
- [ ] Same-household and duplicate-vibe rules verified operator-side.
- [ ] Eight-vibes-per-sailing-day hard cap rejects a ninth attempt until the next sailing-local day.
- [ ] One-VConnect-request-per-sailing-day cap is enforced operator-side.
- [ ] VConnect declines, ignores, blocks and reports emit no requester-facing status; acceptance alone opens prepared public-place/time options.
- [ ] Recognition captures are destroyed and never enter Regreenity telemetry.
- [ ] Offline queue encryption is provided by the host secure-storage layer.
- [ ] Ship-local routing, reconnect replay and urgent service paths rehearsed.
- [ ] Checkout remains in the cruise-line app and refund/cancellation outcomes reconcile.
- [ ] Feature/brand configuration reviewed by the operator administrator.
- [ ] Minimum aggregate group of 20 and forbidden-field rejection verified.
- [ ] iOS, Android, WebView, accessibility, load, security and recovery gates passed.
- [ ] Signed package versions and rollback version recorded for the sailing.
