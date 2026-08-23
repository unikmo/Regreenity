export type PilotRole = 'passenger' | 'crew' | 'director' | 'admin' | 'guest_services' | 'marketing' | 'sales' | 'crew_lead' | 'activities'
export type AgeBand = 'minor' | '18-20' | '21+'

export type PilotAccount = {
  id: string
  role: PilotRole
  pin: string
  firstName: string
  lastName: string
  ageBand: AgeBand
  sailingId: string
  crewId?: string
  department?: string
  interests?: string[]
  nearbyVisible?: boolean
}

export type CrewMember = {
  id: string
  firstName: string
  lastName: string
  department: string
  badgeId: string
  recognitions: number
  uniqueGuests: number
}

export type Department = {
  id: string
  name: string
  icon: string
}

export type PilotSailing = {
  id: string
  number: string
  shipId: string
  shipName: string
  title: string
  startDate: string
  endDate: string
  day: number
  days: number
}

export const pilotSailing: PilotSailing = {
  id: 'SAIL-CC-0826-17',
  number: 'CC-0826-17',
  shipId: 'SHIP-AURORA',
  shipName: 'MV Aurora',
  title: 'Mediterranean Escape',
  startDate: '2026-08-02',
  endDate: '2026-08-09',
  day: 7,
  days: 7,
}

export const departments: Department[] = [
  { id: 'dining', name: 'Dining', icon: '🍽' },
  { id: 'stateroom', name: 'Stateroom', icon: '🛏' },
  { id: 'pool', name: 'Pool & Deck', icon: '☀' },
  { id: 'entertainment', name: 'Entertainment', icon: '🎭' },
  { id: 'excursions', name: 'Excursions', icon: '🧭' },
  { id: 'guest-services', name: 'Guest Services', icon: '◉' },
]

export const crewMembers: CrewMember[] = [
  { id: 'CREW-101', firstName: 'Ana', lastName: 'Rodrigues', department: 'Dining', badgeId: 'AN-4821', recognitions: 84, uniqueGuests: 61 },
  { id: 'CREW-102', firstName: 'Mila', lastName: 'Santos', department: 'Guest Services', badgeId: 'MS-3104', recognitions: 57, uniqueGuests: 43 },
  { id: 'CREW-103', firstName: 'Daniel', lastName: 'Kim', department: 'Entertainment', badgeId: 'DK-6632', recognitions: 46, uniqueGuests: 38 },
  { id: 'CREW-104', firstName: 'Luca', lastName: 'Bianchi', department: 'Dining', badgeId: 'LB-1180', recognitions: 39, uniqueGuests: 33 },
  { id: 'CREW-105', firstName: 'Nia', lastName: 'Okafor', department: 'Pool & Deck', badgeId: 'NO-9042', recognitions: 35, uniqueGuests: 29 },
  { id: 'CREW-106', firstName: 'Mateo', lastName: 'Silva', department: 'Excursions', badgeId: 'MS-4471', recognitions: 31, uniqueGuests: 28 },
  { id: 'CREW-107', firstName: 'Sofia', lastName: 'Petrov', department: 'Stateroom', badgeId: 'SP-2254', recognitions: 27, uniqueGuests: 24 },
  { id: 'CREW-108', firstName: 'Alex', lastName: 'Morgan', department: 'Fitness', badgeId: 'AM-7720', recognitions: 22, uniqueGuests: 19 },
]

export const pilotAccounts: PilotAccount[] = [
  { id: 'PAX-1001', role: 'passenger', pin: '2468', firstName: 'Maria', lastName: 'Alvarez', ageBand: '21+', sailingId: pilotSailing.id, interests: ['Food experiences','Shopping','Fitness'], nearbyVisible: true },
  { id: 'PAX-1002', role: 'passenger', pin: '2468', firstName: 'Daniel', lastName: 'Brooks', ageBand: '21+', sailingId: pilotSailing.id, interests: ['Trivia & games','Food experiences','Live music'], nearbyVisible: true },
  { id: 'PAX-1003', role: 'passenger', pin: '2468', firstName: 'Jade', lastName: 'Wilson', ageBand: '18-20', sailingId: pilotSailing.id, interests: ['Shopping','Live music','Wellness'], nearbyVisible: true },
  { id: 'PAX-1004', role: 'passenger', pin: '2468', firstName: 'Noah', lastName: 'Meyer', ageBand: 'minor', sailingId: pilotSailing.id, interests: ['Games','Family activities'], nearbyVisible: false },
  { id: 'PAX-1005', role: 'passenger', pin: '2468', firstName: 'Sophie', lastName: 'Chen', ageBand: '21+', sailingId: pilotSailing.id, interests: ['Adventure excursions','Fitness','Food experiences'], nearbyVisible: true },
  { id: 'PAX-1006', role: 'passenger', pin: '2468', firstName: 'Elias', lastName: 'Martin', ageBand: '21+', sailingId: pilotSailing.id, interests: ['Culture','Food experiences','Shopping'], nearbyVisible: true },
  { id: 'CREW-LOGIN-101', role: 'crew', pin: '1357', firstName: 'Ana', lastName: 'Rodrigues', ageBand: '21+', sailingId: pilotSailing.id, crewId: 'CREW-101', department: 'Dining' },
  { id: 'DIRECTOR-01', role: 'director', pin: '2026', firstName: 'Jordan', lastName: 'Lee', ageBand: '21+', sailingId: pilotSailing.id, department: 'Cruise Director' },
  { id: 'ADMIN-01', role: 'admin', pin: '9090', firstName: 'Taylor', lastName: 'Reed', ageBand: '21+', sailingId: pilotSailing.id, department: 'Digital Product' },
  { id: 'GUESTSERVICES-01', role: 'guest_services', pin: '3131', firstName: 'Maya', lastName: 'Chen', ageBand: '21+', sailingId: pilotSailing.id, department: 'Guest Services' },
  { id: 'MARKETING-01', role: 'marketing', pin: '4545', firstName: 'Avery', lastName: 'Morgan', ageBand: '21+', sailingId: pilotSailing.id, department: 'Onboard Marketing' },
  { id: 'SALES-01', role: 'sales', pin: '6262', firstName: 'Chris', lastName: 'Patel', ageBand: '21+', sailingId: pilotSailing.id, department: 'Revenue & Sales' },
  { id: 'CREWLEAD-01', role: 'crew_lead', pin: '5151', firstName: 'Nadia', lastName: 'Costa', ageBand: '21+', sailingId: pilotSailing.id, department: 'Hotel Operations' },
  { id: 'ACTIVITIES-01', role: 'activities', pin: '7373', firstName: 'Jamie', lastName: 'Torres', ageBand: '21+', sailingId: pilotSailing.id, department: 'Entertainment & Activities' },
]

export const seededPulseResponses: Record<string, Record<string, number>> = {
  'PAX-1002': { dining: 5, stateroom: 4, pool: 5, entertainment: 5, excursions: 4, 'guest-services': 5 },
  'PAX-1003': { dining: 4, stateroom: 4, pool: 4, entertainment: 5, excursions: 5, 'guest-services': 4 },
  'PAX-1005': { dining: 5, stateroom: 5, pool: 4, entertainment: 4, excursions: 5, 'guest-services': 5 },
  'PAX-1006': { dining: 4, stateroom: 5, pool: 4, entertainment: 4, excursions: 4, 'guest-services': 5 },
}
