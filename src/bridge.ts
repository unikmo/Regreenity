export type CruiseLaunchContext = {
  source: 'demo' | 'host-app'
  sailingId: string
  shipId: string
  guestId: string
  ageBand: 'adult' | 'minor'
  locale: string
  hostApp: string
}

const DEMO_CONTEXT: CruiseLaunchContext = {
  source: 'demo',
  sailingId: 'CC-0826-17',
  shipId: 'MV-REGREENITY',
  guestId: 'GUEST-1042',
  ageBand: 'adult',
  locale: 'en',
  hostApp: 'Cruise-line app',
}

export function getLaunchContext(): CruiseLaunchContext {
  const params = new URLSearchParams(window.location.search)
  const sailingId = params.get('sailing')
  const guestId = params.get('guest')
  const shipId = params.get('ship')
  if (!sailingId || !guestId) return DEMO_CONTEXT

  return {
    source: 'host-app',
    sailingId,
    shipId: shipId || 'HOST-SHIP',
    guestId,
    ageBand: params.get('ageBand') === 'minor' ? 'minor' : 'adult',
    locale: params.get('locale') || 'en',
    hostApp: params.get('host') || 'Cruise-line app',
  }
}

export function notifyHost(type: string, payload: Record<string, unknown> = {}) {
  const message = { source: 'regreenity', type, payload }
  const params = new URLSearchParams(window.location.search)
  const hostOrigin = params.get('hostOrigin')

  if (window.parent !== window && hostOrigin) {
    window.parent.postMessage(message, hostOrigin)
    return true
  }

  window.dispatchEvent(new CustomEvent('regreenity-demo-event', { detail: message }))
  return false
}

export function openHostBooking(inventoryItemId: string) {
  const attributionRef = crypto.randomUUID()
  notifyHost('OPEN_BOOKING', { inventoryItemId, attributionRef })
  return attributionRef
}

export function notifyHostReady(context: CruiseLaunchContext) {
  return notifyHost('READY', {
    sailingId: context.sailingId,
    guestId: context.guestId,
  })
}


export function requestNearbyDiscovery() {
  return notifyHost('START_NEARBY_DISCOVERY', { mode: 'opt-in', precision: 'coarse' })
}

export function stopNearbyDiscovery() {
  return notifyHost('STOP_NEARBY_DISCOVERY')
}

export function publishPassengerInterest(interests: string[]) {
  return notifyHost('UPDATE_INTERESTS', { interests })
}

export function notifyAffirmation(recipientGuestId: string, affirmationId: string) {
  return notifyHost('PASSENGER_AFFIRMATION', { recipientGuestId, affirmationId })
}

export function notifyPublicMeetProposal(recipientGuestId: string, venueType: string) {
  return notifyHost('PUBLIC_MEET_PROPOSAL', { recipientGuestId, venueType })
}

export function notifyCrewRecognition(crewMemberId: string, reasonIds: string[]) {
  return notifyHost('CREW_RECOGNITION', { crewMemberId, reasonIds })
}

export function notifyServiceIssue(category: string) {
  return notifyHost('SERVICE_ISSUE', { category })
}

export function notifyExperiencePulse(department: string, score: number) {
  return notifyHost('EXPERIENCE_PULSE', { department, score })
}

export function notifyEventFeedback(eventId: string, score: number, responseIds: string[]) {
  const normalizedScore = Math.min(5, Math.max(1, Math.round(score)))
  return notifyHost('EVENT_FEEDBACK', {
    eventId,
    score: normalizedScore,
    responseIds: responseIds.slice(0, 5),
    format: 'structured-no-free-text',
  })
}

export type AttributedBookingOutcome = {
  attributionRef: string
  sailingId: string
  productCategory: string
  currency: string
  confirmedValue: number
  status: 'confirmed' | 'cancelled' | 'refunded'
}
