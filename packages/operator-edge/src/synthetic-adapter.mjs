export class SyntheticCruiseAdapter {
  constructor(database) { this.database = database }

  session(claims) {
    return {
      sessionToken: 'host-managed', tenantRef: claims.tenantRef, sailingRef: claims.sailingRef,
      shipRef: claims.shipRef, guestRef: claims.guestRef, householdRef: claims.householdRef,
      ageBand: claims.ageBand, locale: claims.locale || 'en', expiresAt: new Date(claims.exp * 1000).toISOString(),
      features: claims.features || ['interests','meetups','vibes','vconnect','crew-recognition','event-feedback','notifications','commerce'],
    }
  }

  events(sailingRef) {
    return [
      { id: 'evt-wine', sailingRef, title: 'Mediterranean wine tasting', startsAt: '2026-09-01T17:30:00+02:00', venue: 'Vintages', category: 'wine', capacity: 24 },
      { id: 'evt-family', sailingRef, title: 'Family deck games', startsAt: '2026-09-01T15:00:00+02:00', venue: 'Sports deck', category: 'family', capacity: 40 },
      { id: 'evt-jazz', sailingRef, title: 'Sunset jazz session', startsAt: '2026-09-01T20:00:00+02:00', venue: 'Atrium', category: 'music', capacity: 80 },
    ]
  }

  meetups(sailingRef) {
    return [
      { id: 'meet-wine', sailingRef, interestId: 'wine', title: 'Wine lovers hello', startsAt: '2026-09-01T10:30:00+02:00', venue: 'Atrium café', visibleMembers: 6, joined: false },
      { id: 'meet-photo', sailingRef, interestId: 'photography', title: 'Golden-hour photographers', startsAt: '2026-09-01T18:15:00+02:00', venue: 'Deck 12 port side', visibleMembers: 4, joined: false },
    ]
  }

  matchPassenger(claims, bytes) {
    if (claims.ageBand === 'minor') return { status: 'ineligible', reason: 'minors_excluded' }
    if (bytes.length < 4) return { status: 'not-recognized', reason: 'image_quality' }
    const token = bytes[0] === 2 ? 'same-household' : bytes[0] === 3 ? 'minor-token' : bytes[0] === 4 ? 'adult-second-token' : 'adult-same-sailing-token'
    const row = this.database.db.prepare('select token,age_band,expires_at from receiver_tokens where token=? and sailing_ref=?').get(token, claims.sailingRef)
    if (!row || new Date(row.expires_at) <= new Date() || row.age_band !== 'adult') return { status: 'ineligible', reason: 'unavailable' }
    return { status: 'recognized', receiverToken: row.token }
  }

  matchCrew(_claims, bytes) {
    if (bytes.length < 4) return { status: 'not-recognized', reason: 'image_quality' }
    return { status: 'recognized', receiverToken: 'crew-roster-token-482' }
  }
}
