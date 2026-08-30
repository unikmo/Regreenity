export const MINIMUM_REPORTING_GROUP = 20

type CountCell = { bucket: string; count: number }

export type AggregateVocabulary = {
  recognitionReasons: ReadonlySet<string>
  departments: ReadonlySet<string>
  eventResponses: ReadonlySet<string>
  recoveryCategories: ReadonlySet<string>
  productCategories: ReadonlySet<string>
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
  }
}

const forbiddenIdentityKeys = new Set([
  'name', 'firstname', 'lastname', 'email', 'guestid', 'crewid', 'crewmemberid',
  'passengerid', 'bookingreference', 'attributionref', 'cabin', 'stateroom',
  'phone', 'payment', 'card', 'photo', 'image', 'selfie', 'face', 'freetext',
  'comment', 'message', 'exacttimestamp', 'ipaddress', 'deviceid',
])

const normalizedKey = (key: string) => key.toLowerCase().replace(/[^a-z0-9]/g, '')

export function assertAggregateSafe(payload: unknown, path = 'report'): void {
  if (Array.isArray(payload)) {
    payload.forEach((value, index) => assertAggregateSafe(value, `${path}[${index}]`))
    return
  }
  if (!payload || typeof payload !== 'object') return
  for (const [key, value] of Object.entries(payload as Record<string, unknown>)) {
    if (forbiddenIdentityKeys.has(normalizedKey(key))) {
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

/** The only analytics payload Regreenity accepts by default. */
export function validateCruiseAggregateReport(report: CruiseAggregateReport, vocabulary: AggregateVocabulary): CruiseAggregateReport {
  assertAggregateSafe(report)
  if (report.schemaVersion !== '1.0') throw new Error('Unsupported aggregate report schema')
  if (report.minimumReportingGroup < MINIMUM_REPORTING_GROUP) {
    throw new Error(`minimumReportingGroup must be at least ${MINIMUM_REPORTING_GROUP}`)
  }

  const { activation, recognition, eventFeedback, recovery, commerce } = report.metrics
  const values: Array<[string, number]> = [
    ['activation.eligibleGuests', activation.eligibleGuests],
    ['activation.activatedGuests', activation.activatedGuests],
    ['activation.positiveActions', activation.positiveActions],
    ['recognition.recognitionsTotal', recognition.recognitionsTotal],
    ['recognition.recognizingGuestsTotal', recognition.recognizingGuestsTotal],
    ['recognition.recognizedCrewTotal', recognition.recognizedCrewTotal],
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
  ]
  values.forEach(([label, value]) => assertNonNegative(value, label))
  eventFeedback.ratingCounts.forEach((count, index) => assertNonNegative(count, `eventFeedback.ratingCounts[${index}]`))
  assertSuppressedCells(recognition.reasonCounts, report.minimumReportingGroup, 'recognition.reasonCounts', vocabulary.recognitionReasons)
  assertSuppressedCells(recognition.departmentCounts, report.minimumReportingGroup, 'recognition.departmentCounts', vocabulary.departments)
  assertSuppressedCells(eventFeedback.preparedResponseCounts, report.minimumReportingGroup, 'eventFeedback.preparedResponseCounts', vocabulary.eventResponses)
  assertSuppressedCells(recovery.categoryCounts, report.minimumReportingGroup, 'recovery.categoryCounts', vocabulary.recoveryCategories)
  assertSuppressedCells(commerce.productCategoryCounts, report.minimumReportingGroup, 'commerce.productCategoryCounts', vocabulary.productCategories)
  return report
}
