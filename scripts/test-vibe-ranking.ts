import { rankPassengerVibes } from '../src/vibeRanking.ts'

const ranked = rankPassengerVibes([
  { id: 'a', validVibes: 20 },
  { id: 'b', validVibes: 18 },
  { id: 'c', validVibes: 12 },
  ...Array.from({ length: 10 }, (_, index) => ({ id: `tie-${index}`, validVibes: 9 })),
  { id: 'next', validVibes: 8 },
])

if (!ranked.filter(entry => entry.id.startsWith('tie-')).every(entry => entry.rank === 4 && entry.topFive)) {
  throw new Error('All passengers tied at position 4 must receive rank 4 and Top Five eligibility')
}
const next = ranked.find(entry => entry.id === 'next')
if (next?.rank !== 5 || !next.topFive) throw new Error('The next distinct valid-vibe total must receive rank 5')

console.log('Passenger vibe dense-ranking contract passed.')
