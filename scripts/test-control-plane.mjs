import assert from 'node:assert/strict'
import { reportSchema } from '../api/v1/aggregates.mjs'
import { enquirySchema } from '../api/pilot-requests.mjs'

const report = {
  schemaVersion: 1, externalReportId: 'report-2026-08-30-001', sailingRef: 'CC-2026-001',
  periodStart: '2026-08-23', periodEnd: '2026-08-30', generatedAt: '2026-08-30T12:00:00+00:00',
  minimumGroupApplied: 20, privacyGatewayVersion: '1.0.0',
  metrics: [{ metric: 'activated_guests', dimension: 'overall', dimensionValue: 'all', countValue: 220 }],
}
assert.equal(reportSchema.safeParse(report).success, true)
assert.equal(reportSchema.safeParse({ ...report, passengerName: 'Not allowed' }).success, false)
assert.equal(reportSchema.safeParse({ ...report, metrics: [{ ...report.metrics[0], countValue: 8 }] }).success, false)
assert.equal(reportSchema.safeParse({ ...report, metrics: [{ ...report.metrics[0], dimensionValue: 'passenger-name' }] }).success, false)
assert.equal(reportSchema.safeParse({ ...report, metrics: [...report.metrics, report.metrics[0]] }).success, false)
assert.equal(reportSchema.safeParse({ ...report, metrics: [{ metric: 'attributed_net_value', numericValue: 18420, currency: 'USD' }] }).success, true)

const enquiry = { name: 'Alex Morgan', workEmail: 'alex@example.com', company: 'Example Cruise', roleTitle: 'Digital', message: 'We would like to discuss a complete pilot.', privacyConsent: true, website: '' }
assert.equal(enquirySchema.safeParse(enquiry).success, true)
assert.equal(enquirySchema.safeParse({ ...enquiry, privacyConsent: false }).success, false)
assert.equal(enquirySchema.safeParse({ ...enquiry, passengerId: 'forbidden' }).success, false)
console.log('Control-plane privacy contract tests passed.')
