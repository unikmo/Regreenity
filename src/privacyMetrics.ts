export type AggregateDelta = {
  tenantId: string
  sailingId: string
  metric: 'activation' | 'recognition' | 'event-rating' | 'recovery' | 'conversion' | 'attributed-revenue'
  bucket: string
  countDelta: number
  valueDelta?: number
  currency?: string
  generatedAt: string
}

export type SourceEvent = {
  tenantId: string
  sailingId: string
  metric: AggregateDelta['metric']
  bucket: string
  value?: number
  currency?: string
}

const forbiddenIdentityKeys = new Set([
  'name', 'email', 'guestid', 'crewid', 'passengerid', 'bookingreference',
  'cabin', 'stateroom', 'phone', 'payment', 'card', 'freetext', 'comment',
])

export function assertAggregateSafe(payload: Record<string, unknown>) {
  for (const key of Object.keys(payload)) {
    if (forbiddenIdentityKeys.has(key.toLowerCase().replace(/_/g, ''))) {
      throw new Error(`Identity-bearing field is not permitted in aggregate telemetry: ${key}`)
    }
  }
}

/**
 * Converts one validated source event into a non-person-level aggregate delta.
 * The caller must keep the source event memory-only and discard it immediately
 * after this function returns. Request bodies must never enter logs or backups.
 */
export function aggregateAndForget(event: SourceEvent): AggregateDelta {
  assertAggregateSafe(event as unknown as Record<string, unknown>)
  const delta: AggregateDelta = {
    tenantId: event.tenantId,
    sailingId: event.sailingId,
    metric: event.metric,
    bucket: event.bucket,
    countDelta: 1,
    generatedAt: new Date().toISOString(),
  }
  if (typeof event.value === 'number' && Number.isFinite(event.value)) delta.valueDelta = event.value
  if (event.currency) delta.currency = event.currency
  return delta
}
