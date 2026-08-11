export type View = 'overview' | 'passenger' | 'crew' | 'recovery' | 'commerce' | 'dashboard' | 'integration' | 'pilot' | 'imprint' | 'privacy' | 'terms' | 'cookies'

export type Affirmation = {
  label: string
  count: number
  tone: 'aqua' | 'sand' | 'coral' | 'blue'
}

export type Kpi = {
  label: string
  value: string
  detail: string
  trend?: string
}
