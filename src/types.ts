export type View = 'overview' | 'passenger' | 'crew' | 'commerce' | 'dashboard'

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
