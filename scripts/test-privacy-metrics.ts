import { validateCruiseAggregateReport, type CruiseAggregateReport } from '../src/privacyMetrics.ts'

const vocabulary = {
  recognitionReasons: new Set(['welcome']),
  departments: new Set(['dining']),
  eventResponses: new Set(['great-performers']),
  recoveryCategories: new Set(['dining-service']),
  productCategories: new Set(['specialty-dining']),
  healthErrorCodes: new Set(['sync-timeout']),
  latencyBuckets: new Set(['under-250ms']),
}

const report: CruiseAggregateReport = {
  schemaVersion: '1.0', operatorId: 'oceanic', shipId: 'meridian', sailingId: '2026-08-30',
  periodStart: '2026-08-30', periodEnd: '2026-08-31', generatedAt: '2026-08-31T00:05:00Z',
  privacyGatewayVersion: '1.0.0', minimumReportingGroup: 20,
  metrics: {
    activation: { eligibleGuests: 1000, activatedGuests: 520, positiveActions: 188 },
    recognition: { recognitionsTotal: 84, recognizingGuestsTotal: 61, recognizedCrewTotal: 32, reasonCounts: [{ bucket: 'welcome', count: 31 }], departmentCounts: [{ bucket: 'dining', count: 42 }] },
    eventFeedback: { responsesTotal: 428, ratingCounts: [20, 24, 60, 120, 204], preparedResponseCounts: [{ bucket: 'great-performers', count: 212 }] },
    recovery: { issuesTotal: 80, acknowledgedTotal: 78, resolvedTotal: 74, medianAcknowledgementMinutes: 2, medianResolutionMinutes: 14, categoryCounts: [{ bucket: 'dining-service', count: 24 }] },
    commerce: { handoffsTotal: 200, confirmedTotal: 84, cancelledTotal: 21, refundedTotal: 7, netAttributedValue: 18400, currency: 'USD', productCategoryCounts: [{ bucket: 'specialty-dining', count: 42 }] },
    serviceHealth: { measurementMinutes: 1440, availableMinutes: 1438, syncAttempts: 230, syncSuccesses: 226, deployedVersion: '1.0.0', errorCounts: [{ bucket: 'sync-timeout', count: 4 }], latencyCounts: [{ bucket: 'under-250ms', count: 221 }] },
  },
}

validateCruiseAggregateReport(report, vocabulary)

const expectRejected = (mutate: (candidate: Record<string, unknown>) => void, label: string) => {
  const candidate = structuredClone(report) as unknown as Record<string, unknown>
  mutate(candidate)
  let rejected = false
  try { validateCruiseAggregateReport(candidate as unknown as CruiseAggregateReport, vocabulary) } catch { rejected = true }
  if (!rejected) throw new Error(`Expected rejection: ${label}`)
}

expectRejected(candidate => { candidate.photo = 'data:image/jpeg;base64,...' }, 'photo field')
expectRejected(candidate => { candidate.faceMatchScore = 0.991 }, 'biometric match score')
expectRejected(candidate => { candidate.randomizedPassengerId = 'random-123' }, 'randomized person identifier')
expectRejected(candidate => { ((candidate.metrics as CruiseAggregateReport['metrics']).recognition.reasonCounts[0].count) = 3 }, 'small cell')
expectRejected(candidate => { ((candidate.metrics as CruiseAggregateReport['metrics']).recognition.departmentCounts[0].bucket) = 'Ana Rodrigues' }, 'unapproved bucket text')

console.log('Privacy metric contract passed: safe aggregate accepted; photo, biometric, randomized-ID, small-cell and arbitrary-bucket leakage rejected.')
