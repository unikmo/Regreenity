import type { Affirmation, Kpi } from './types'

export const affirmations: Affirmation[] = [
  { label: 'You made us laugh', count: 7, tone: 'coral' },
  { label: 'Great trivia teammate', count: 5, tone: 'aqua' },
  { label: 'Enjoyed meeting you', count: 4, tone: 'sand' },
  { label: 'Great travel companion', count: 3, tone: 'blue' },
]

export const kpis: Kpi[] = [
  { label: 'Passenger activation', value: '48%', detail: 'of eligible guests', trend: '+7.4 pts' },
  { label: 'Crew recognitions', value: '812', detail: 'this sailing', trend: '+22%' },
  { label: 'Resolved onboard', value: '93%', detail: 'of help requests', trend: '14m median' },
  { label: 'Attributed revenue', value: '$18.4K', detail: 'pilot estimate', trend: '+11.8%' },
]

export const recognitionReasons = [
  'Made us feel welcome',
  'Went above and beyond',
  'Exceptional service',
  'Solved a problem',
  'Great with our family',
  'Made our trip memorable',
]
