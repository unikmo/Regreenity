export type VibeRankEntry = {
  id: string
  validVibes: number
}

export type RankedVibeEntry = VibeRankEntry & {
  rank: number
  topFive: boolean
}

/**
 * Dense ranking: equal valid-vibe totals share a position and the next
 * distinct total receives the next position (4, 4, 4, 5).
 */
export function rankPassengerVibes<T extends VibeRankEntry>(entries: T[]): Array<T & RankedVibeEntry> {
  const scores = [...new Set(entries.map(entry => entry.validVibes))].sort((a, b) => b - a)
  const rankByScore = new Map(scores.map((score, index) => [score, index + 1]))
  return entries.map(entry => {
    const rank = rankByScore.get(entry.validVibes) ?? scores.length + 1
    return { ...entry, rank, topFive: rank <= 5 }
  })
}
