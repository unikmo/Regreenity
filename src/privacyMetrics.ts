export const MINIMUM_REPORTING_GROUP = 20

type CountCell = { bucket: string; count: number }

export type AggregateVocabulary = {
  recognitionReasons: ReadonlySet<string>
  passengerVibeReasons: ReadonlySet<string>
  passengerVibeRanks: ReadonlySet<string>
  departments: ReadonlySet<string>
  eventResponses: ReadonlySet<string>
  recoveryCategories: ReadonlySet<string>
  productCategories: ReadonlySet<string>
  healthErrorCodes: ReadonlySet<string>
  latencyBuckets: ReadonlySet<string>
}

export type CruiseAggregateReport = {
  schemaVersion: '1.0'
  operatorId: string
  shipId: string
  sailingId: string
  periodStart: string
  periodEnd: string
  generatedAt: string
  privacyGatewayVersion: string
  minimumReportingGroup: number
  metrics: {
    activation: { eligibleGuests: number; activatedGuests: number; positiveActions: number }
    recognition: {
      recognitionsTotal: number
      recognizingGuestsTotal: number
      recognizedCrewTotal: number
      reasonCounts: CountCell[]
      departmentCounts: CountCell[]
    }
    passengerVibes: {
      validVibesTotal: number
      receivingAdultsTotal: number
      suppressedSameCabinTotal: number
      suppressedMinorTotal: number
      reasonCounts: CountCell[]
      denseRankPositionCounts: CountCell[]
    }
    eventFeedback: {
      responsesTotal: number
      ratingCounts: [number, number, number, number, number]
      preparedResponseCounts: CountCell[]
    }
    recovery: {
      issuesTotal: number
      acknowledgedTotal: number
      resolvedTotal: number
      medianAcknowledgementMinutes: number
      medianResolutionMinutes: number
      categoryCounts: CountCell[]
    }
    commerce: {
      handoffsTotal: number
      confirmedTotal: number
      cancelledTotal: number
      refundedTotal: number
      netAttributedValue: number
      currency: string
      productCategoryCounts: CountCell[]
    }
    serviceHealth: {
      measurementMinutes: number
      availableMinutes: number
      syncAttempts: number
      syncSuccesses: number
      deployedVersion: string
      errorCounts: CountCell[]
      latencyCounts: CountCell[]
    }
  }
}

const forbiddenIdentityKeys = new Set([
  'name', 'firstname', 'lastname', 'email', 'guestid', 'crewid', 'crewmemberid',
  'passengerid', 'bookingreference', 'attributionref', 'cabin', 'stateroom',
  'phone', 'payment', 'card', 'photo', 'image', 'selfie', 'face', 'freetext',
  'comment', 'message', 'exacttimestamp', 'ipaddress', 'deviceid', 'biometric',
  'biometrictemplate', 'facetemplate', 'faceembedding', 'facematchscore', 'matchscore',
  'randomizedid', 'hashedid', 'pseudonymousid', 'sessionid', 'errormessage', 'stacktrace',
])

const normalizedKey = (key: string) => key.toLowerCase().replace(/[^a-z0-9]/g, '')

const isForbiddenIdentityKey = (key: string) => {
  const normalized = normalizedKey(key)
  return forbiddenIdentityKeys.has(normalized)
    || /(?:randomized|hashed|pseudonymous).*(?:guest|passenger|crew|person|user|device).*id/.test(normalized)
    || /(?:biometric|facetemplate|faceembedding|facematchscore)/.test(normalized)
}

export function assertAggregateSafe(payload: unknown, path = 'report'): void {
  if (Array.isArray(payload)) {
    payload.forEach((value, index) => assertAggregateSafe(value, `${path}[${index}]`))
    return
  }
  if (!payload || typeof payload !== 'object') return
  for (const [key, value] of Object.entries(payload as Record<string, unknown>)) {
    if (isForbiddenIdentityKey(key)) {
      throw new Error(`Identity-bearing field is not permitted in aggregate telemetry: ${path}.${key}`)
    }
    assertAggregateSafe(value, `${path}.${key}`)
  }
}

function assertNonNegative(value: number, label: string) {
  if (!Number.isFinite(value) || value < 0) throw new Error(`${label} must be a finite non-negative number`)
}

function assertSuppressedCells(cells: CountCell[], threshold: number, label: string, allowedBuckets: ReadonlySet<string>) {
  cells.forEach((cell, index) => {
    if (!cell.bucket.trim()) throw new Error(`${label}[${index}].bucket is required`)
    if (!allowedBuckets.has(cell.bucket)) throw new Error(`${label}[${index}].bucket is not in the operator's approved vocabulary`)
    assertNonNegative(cell.count, `${label}[${index}].count`)
    if (cell.count > 0 && cell.count < threshold) {
      throw new Error(`${label}[${index}] is below the minimum reporting group and must be suppressed or rolled up`)
    }
  })
}

function assertOperationalCells(cells: CountCell[], label: string, allowedBuckets: ReadonlySet<string>) {
  cells.forEach((cell, index) => {
    if (!allowedBuckets.has(cell.bucket)) throw new Error(`${label}[${index}].bucket is not in the approved operational vocabulary`)
    assertNonNegative(cell.count, `${label}[${index}].count`)
  })
}

/** The only analytics payload Regreenity accepts by default. */
export function validateCruiseAggregateReport(report: CruiseAggregateReport, vocabulary: AggregateVocabulary): CruiseAggregateReport {
  assertAggregateSafe(report)
  if (report.schemaVersion !== '1.0') throw new Error('Unsupported aggregate report schema')
  if (report.minimumReportingGroup < MINIMUM_REPORTING_GROUP) {
    throw new Error(`minimumReportingGroup must be at least ${MINIMUM_REPORTING_GROUP}`)
  }

  const { activation, recognition, passengerVibes, eventFeedback, recovery, commerce, serviceHealth } = report.metrics
  const values: Array<[string, number]> = [
    ['activation.eligibleGuests', activation.eligibleGuests],
    ['activation.activatedGuests', activation.activatedGuests],
    ['activation.positiveActions', activation.positiveActions],
    ['recognition.recognitionsTotal', recognition.recognitionsTotal],
    ['recognition.recognizingGuestsTotal', recognition.recognizingGuestsTotal],
    ['recognition.recognizedCrewTotal', recognition.recognizedCrewTotal],
    ['passengerVibes.validVibesTotal', passengerVibes.validVibesTotal],
    ['passengerVibes.receivingAdultsTotal', passengerVibes.receivingAdultsTotal],
    ['passengerVibes.suppressedSameCabinTotal', passengerVibes.suppressedSameCabinTotal],
    ['passengerVibes.suppressedMinorTotal', passengerVibes.suppressedMinorTotal],
    ['eventFeedback.responsesTotal', eventFeedback.responsesTotal],
    ['recovery.issuesTotal', recovery.issuesTotal],
    ['recovery.acknowledgedTotal', recovery.acknowledgedTotal],
    ['recovery.resolvedTotal', recovery.resolvedTotal],
    ['recovery.medianAcknowledgementMinutes', recovery.medianAcknowledgementMinutes],
    ['recovery.medianResolutionMinutes', recovery.medianResolutionMinutes],
    ['commerce.handoffsTotal', commerce.handoffsTotal],
    ['commerce.confirmedTotal', commerce.confirmedTotal],
    ['commerce.cancelledTotal', commerce.cancelledTotal],
    ['commerce.refundedTotal', commerce.refundedTotal],
    ['commerce.netAttributedValue', commerce.netAttributedValue],
    ['serviceHealth.measurementMinutes', serviceHealth.measurementMinutes],
    ['serviceHealth.availableMinutes', serviceHealth.availableMinutes],
    ['serviceHealth.syncAttempts', serviceHealth.syncAttempts],
    ['serviceHealth.syncSuccesses', serviceHealth.syncSuccesses],
  ]
  values.forEach(([label, value]) => assertNonNegative(value, label))
  eventFeedback.ratingCounts.forEach((count, index) => assertNonNegative(count, `eventFeedback.ratingCounts[${index}]`))
  assertSuppressedCells(recognition.reasonCounts, report.minimumReportingGroup, 'recognition.reasonCounts', vocabulary.recognitionReasons)
  assertSuppressedCells(recognition.departmentCounts, report.minimumReportingGroup, 'recognition.departmentCounts', vocabulary.departments)
  assertSuppressedCells(passengerVibes.reasonCounts, report.minimumReportingGroup, 'passengerVibes.reasonCounts', vocabulary.passengerVibeReasons)
  assertSuppressedCells(passengerVibes.denseRankPositionCounts, report.minimumReportingGroup, 'passengerVibes.denseRankPositionCounts', vocabulary.passengerVibeRanks)
  assertSuppressedCells(eventFeedback.preparedResponseCounts, report.minimumReportingGroup, 'eventFeedback.preparedResponseCounts', vocabulary.eventResponses)
  assertSuppressedCells(recovery.categoryCounts, report.minimumReportingGroup, 'recovery.categoryCounts', vocabulary.recoveryCategories)
  assertSuppressedCells(commerce.productCategoryCounts, report.minimumReportingGroup, 'commerce.productCategoryCounts', vocabulary.productCategories)
  assertOperationalCells(serviceHealth.errorCounts, 'serviceHealth.errorCounts', vocabulary.healthErrorCodes)
  assertOperationalCells(serviceHealth.latencyCounts, 'serviceHealth.latencyCounts', vocabulary.latencyBuckets)
  return report
}
