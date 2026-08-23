import { crewMembers, departments, pilotAccounts, pilotSailing, seededPulseResponses, type PilotAccount, type PilotRole } from './pilotData'

export type PilotSession = {
  token: string
  accountId: string
  role: PilotRole
  sailingId: string
  expiresAt: number
}

export type PrizeConfig = {
  winnerCount: 1 | 3
  adultPrize: string
  alternatePrize: string
}

export type PilotState = {
  version: 1
  finalPulseActive: boolean
  finalPulseLaunchedAt?: string
  finalPulseMessage?: string
  pulseResponses: Record<string, Record<string, number>>
  crewRecognitions: Array<{ id: string; passengerId: string; crewId: string; reasons: string[]; createdAt: string }>
  affirmations: Array<{ id: string; fromId: string; toId: string; label: string; status: 'pending'|'acknowledged'|'ignored'; createdAt: string }>
  meetingProposals: Array<{ id: string; fromId: string; toId: string; place: string; createdAt: string }>
  prize: PrizeConfig
  winners: Array<{ passengerId: string; prize: string; drawnAt: string }>
  audit: Array<{ at: string; type: string; actorId: string; detail: string }>
}

const STATE_KEY = 'cruise-connection-pilot-state-v1'
const SESSION_KEY = 'cruise-connection-pilot-session-v1'

const initialState = (): PilotState => ({
  version: 1,
  finalPulseActive: false,
  pulseResponses: structuredClone(seededPulseResponses),
  crewRecognitions: [
    { id: 'REC-SEED-1', passengerId: 'PAX-1002', crewId: 'CREW-101', reasons: ['Made us feel welcome'], createdAt: '2026-08-08T19:10:00Z' },
    { id: 'REC-SEED-2', passengerId: 'PAX-1005', crewId: 'CREW-101', reasons: ['Exceptional service','Made our trip memorable'], createdAt: '2026-08-08T20:40:00Z' },
  ],
  affirmations: [
    { id: 'AFF-SEED-1', fromId: 'PAX-1002', toId: 'PAX-1001', label: 'Great trivia teammate', status: 'pending', createdAt: '2026-08-09T15:30:00Z' },
  ],
  meetingProposals: [],
  prize: {
    winnerCount: 3,
    adultPrize: 'Champagne + $150 future-cruise voucher',
    alternatePrize: 'Premium non-alcoholic celebration + $150 future-cruise voucher',
  },
  winners: [],
  audit: [],
})

export const loadPilotState = (): PilotState => {
  try {
    const raw = localStorage.getItem(STATE_KEY)
    if (raw) return JSON.parse(raw) as PilotState
  } catch { /* reset below */ }
  const state = initialState()
  localStorage.setItem(STATE_KEY, JSON.stringify(state))
  return state
}

export const savePilotState = (state: PilotState) => {
  localStorage.setItem(STATE_KEY, JSON.stringify(state))
  window.dispatchEvent(new CustomEvent('cruise-connection-pilot-state'))
}

export const resetPilotState = () => {
  const state = initialState()
  savePilotState(state)
  sessionStorage.removeItem(SESSION_KEY)
  return state
}

const audit = (state: PilotState, actorId: string, type: string, detail: string) => {
  state.audit.unshift({ at: new Date().toISOString(), actorId, type, detail })
  state.audit = state.audit.slice(0, 100)
}

export const authenticatePilot = (accountId: string, pin: string): PilotSession | null => {
  const account = pilotAccounts.find(a => a.id === accountId && a.pin === pin)
  if (!account) return null
  const session: PilotSession = {
    token: `sim_${crypto.randomUUID()}`,
    accountId: account.id,
    role: account.role,
    sailingId: account.sailingId,
    expiresAt: Date.now() + 8 * 60 * 60 * 1000,
  }
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
  const state = loadPilotState()
  audit(state, account.id, 'AUTH_LOGIN', `Simulation session issued for ${account.role}`)
  savePilotState(state)
  return session
}

export const getPilotSession = (): PilotSession | null => {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const session = JSON.parse(raw) as PilotSession
    if (session.expiresAt < Date.now()) {
      sessionStorage.removeItem(SESSION_KEY)
      return null
    }
    return session
  } catch { return null }
}

export const logoutPilot = () => sessionStorage.removeItem(SESSION_KEY)
export const getAccount = (id: string) => pilotAccounts.find(a => a.id === id)
export const getSessionAccount = () => { const s = getPilotSession(); return s ? getAccount(s.accountId) : undefined }

export const launchFinalPulse = (actorId: string) => {
  const state = loadPilotState()
  state.finalPulseActive = true
  state.finalPulseLaunchedAt = new Date().toISOString()
  state.finalPulseMessage = 'Final-night Experience Pulse is live. Rate each department 1–5 in under two minutes. No writing required.'
  audit(state, actorId, 'FINAL_PULSE_LAUNCHED', 'Director push + stage announcement activated')
  savePilotState(state)
  return state
}

export const submitPulse = (passengerId: string, ratings: Record<string, number>) => {
  if (departments.some(d => !ratings[d.id] || ratings[d.id] < 1 || ratings[d.id] > 5)) throw new Error('All department ratings are required')
  const state = loadPilotState()
  state.pulseResponses[passengerId] = ratings
  audit(state, passengerId, 'FINAL_PULSE_COMPLETED', 'Completed all department 1–5 ratings')
  savePilotState(state)
  return state
}

export const recognizeCrew = (passengerId: string, crewId: string, reasons: string[]) => {
  const state = loadPilotState()
  const dayKey = new Date().toISOString().slice(0,10)
  const already = state.crewRecognitions.some(r => r.passengerId === passengerId && r.crewId === crewId && r.createdAt.slice(0,10) === dayKey)
  if (already) throw new Error('You already recognized this crew member today.')
  if (!reasons.length || reasons.length > 2) throw new Error('Choose one or two recognition reasons.')
  state.crewRecognitions.unshift({ id: crypto.randomUUID(), passengerId, crewId, reasons, createdAt: new Date().toISOString() })
  audit(state, passengerId, 'CREW_RECOGNITION', `${crewId}: ${reasons.join(', ')}`)
  savePilotState(state)
  return state
}

export const sendAffirmation = (fromId: string, toId: string, label: string) => {
  const state = loadPilotState()
  const dayKey = new Date().toISOString().slice(0,10)
  const duplicate = state.affirmations.some(a => a.fromId === fromId && a.toId === toId && a.createdAt.slice(0,10) === dayKey)
  if (duplicate) throw new Error('One affirmation per passenger per sailing day.')
  state.affirmations.unshift({ id: crypto.randomUUID(), fromId, toId, label, status: 'pending', createdAt: new Date().toISOString() })
  audit(state, fromId, 'PASSENGER_AFFIRMATION', `${toId}: ${label}`)
  savePilotState(state)
  return state
}

export const respondAffirmation = (affirmationId: string, recipientId: string, status: 'acknowledged'|'ignored') => {
  const state = loadPilotState()
  const item = state.affirmations.find(a => a.id === affirmationId && a.toId === recipientId)
  if (!item) throw new Error('Affirmation not found')
  item.status = status
  audit(state, recipientId, 'AFFIRMATION_RESPONSE', `${affirmationId}: ${status}`)
  savePilotState(state)
  return state
}

export const proposeMeeting = (fromId: string, toId: string, place: string) => {
  const allowed = ['Coffee / café','Bar / lounge','Restaurant','Trivia / game','Spa / wellness','Shopping','Fitness activity','Show','Excursion']
  if (!allowed.includes(place)) throw new Error('Only approved public venues and activities can be proposed.')
  const state = loadPilotState()
  const accepted = state.affirmations.some(a => ((a.fromId === fromId && a.toId === toId) || (a.fromId === toId && a.toId === fromId)) && a.status === 'acknowledged')
  if (!accepted) throw new Error('The recipient must acknowledge the affirmation first.')
  state.meetingProposals.unshift({ id: crypto.randomUUID(), fromId, toId, place, createdAt: new Date().toISOString() })
  audit(state, fromId, 'PUBLIC_MEETING_PROPOSAL', `${toId}: ${place}`)
  savePilotState(state)
  return state
}

export const updatePrize = (actorId: string, prize: PrizeConfig) => {
  const state = loadPilotState()
  state.prize = prize
  audit(state, actorId, 'PRIZE_CONFIG_UPDATED', `${prize.winnerCount} winner(s)`) 
  savePilotState(state)
  return state
}

const secureShuffle = <T,>(items: T[]): T[] => {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const arr = new Uint32Array(1)
    crypto.getRandomValues(arr)
    const j = arr[0] % (i + 1)
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export const drawPulseWinners = (actorId: string) => {
  const state = loadPilotState()
  const eligible = Object.keys(state.pulseResponses).filter(id => pilotAccounts.some(a => a.id === id && a.role === 'passenger'))
  const chosen = secureShuffle(eligible).slice(0, Math.min(state.prize.winnerCount, eligible.length))
  state.winners = chosen.map(passengerId => {
    const account = getAccount(passengerId)!
    const prize = account.ageBand === '21+' ? state.prize.adultPrize : state.prize.alternatePrize
    return { passengerId, prize, drawnAt: new Date().toISOString() }
  })
  audit(state, actorId, 'PRIZE_DRAW', `${state.winners.length} winner(s) drawn from ${eligible.length} completed responses`)
  savePilotState(state)
  return state
}

export const pilotDirectory = {
  sailing: pilotSailing,
  accounts: pilotAccounts,
  crew: crewMembers,
  departments,
}

export type PilotBackendAdapter = {
  authenticate: (credential: { accountId: string; pin?: string; launchToken?: string }) => Promise<PilotSession>
  loadState: () => Promise<PilotState>
  submitDepartmentPulse: (passengerId: string, ratings: Record<string, number>) => Promise<PilotState>
}

// Production boundary: replace this adapter with signed cruise-line launch token validation + API persistence.
export const simulationBackend: PilotBackendAdapter = {
  authenticate: async ({ accountId, pin = '' }) => {
    const session = authenticatePilot(accountId, pin)
    if (!session) throw new Error('Invalid simulation credentials')
    return session
  },
  loadState: async () => loadPilotState(),
  submitDepartmentPulse: async (passengerId, ratings) => submitPulse(passengerId, ratings),
}
