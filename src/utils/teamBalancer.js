/**
 * Smart team balancing algorithm
 * 1. Distribute goalkeepers first
 * 2. Balance ages evenly
 * 3. Balance skill weights using Snake Draft
 */

export function generateTeams(players, numTeams) {
  if (!players || players.length === 0) return []
  if (numTeams < 2) numTeams = 2

  const cloned = players.map(p => ({
    ...p,
    weight: (p.skill_level || 3) * 0.6 + (p.fitness_level || 3) * 0.4
  }))

  // Separate goalkeepers
  const keepers = cloned.filter(p => p.is_goalkeeper)
  const outfield = cloned.filter(p => !p.is_goalkeeper)

  // Initialize teams
  const teams = Array.from({ length: numTeams }, (_, i) => ({
    id: i + 1,
    name: `קבוצה ${getTeamName(i)}`,
    color: TEAM_COLORS[i],
    players: [],
    goalkeeper: null,
  }))

  // Assign goalkeepers first (one per team)
  const sortedKeepers = [...keepers].sort((a, b) => b.weight - a.weight)
  for (let i = 0; i < numTeams; i++) {
    if (sortedKeepers[i]) {
      teams[i].goalkeeper = sortedKeepers[i]
      teams[i].players.push(sortedKeepers[i])
    }
  }

  // Remaining keepers become outfield
  const remainingKeepers = sortedKeepers.slice(numTeams)

  // If not enough keepers, pick best-fit outfield players as keepers
  for (let i = 0; i < numTeams; i++) {
    if (!teams[i].goalkeeper && outfield.length > 0) {
      // Pick a mid-level player as substitute keeper
      const midIdx = Math.floor(outfield.length / 2)
      const sub = outfield.splice(midIdx, 1)[0]
      teams[i].goalkeeper = { ...sub, _subKeeper: true }
      teams[i].players.push(teams[i].goalkeeper)
    }
  }

  // All remaining players to balance
  const allOutfield = [...outfield, ...remainingKeepers]

  // Sort by age-bucket then weight for balanced distribution
  const sorted = allOutfield.sort((a, b) => {
    const ageBucketA = Math.floor((a.age || 25) / 10)
    const ageBucketB = Math.floor((b.age || 25) / 10)
    if (ageBucketA !== ageBucketB) return ageBucketB - ageBucketA
    return b.weight - a.weight
  })

  // Snake draft: distribute players in snake order
  let direction = 1
  let teamIdx = 0
  for (const player of sorted) {
    teams[teamIdx].players.push(player)
    teamIdx += direction
    if (teamIdx >= numTeams) {
      teamIdx = numTeams - 1
      direction = -1
    } else if (teamIdx < 0) {
      teamIdx = 0
      direction = 1
    }
  }

  return teams
}

function getTeamName(index) {
  return ['אדום', 'כחול', 'ירוק', 'צהוב'][index] || `${index + 1}`
}

const TEAM_COLORS = [
  { bg: 'bg-red-100', border: 'border-red-400', text: 'text-red-700', badge: 'bg-red-500', hex: '#ef4444' },
  { bg: 'bg-blue-100', border: 'border-blue-400', text: 'text-blue-700', badge: 'bg-blue-500', hex: '#3b82f6' },
  { bg: 'bg-green-100', border: 'border-green-400', text: 'text-green-700', badge: 'bg-green-500', hex: '#22c55e' },
  { bg: 'bg-yellow-100', border: 'border-yellow-400', text: 'text-yellow-700', badge: 'bg-yellow-500', hex: '#eab308' },
]

export function getTeamStats(team) {
  if (!team.players.length) return { avgWeight: 0, totalWeight: 0, avgAge: 0 }
  const totalWeight = team.players.reduce((s, p) => s + ((p.skill_level || 3) * 0.6 + (p.fitness_level || 3) * 0.4), 0)
  const avgAge = team.players.reduce((s, p) => s + (p.age || 25), 0) / team.players.length
  return {
    totalWeight: Math.round(totalWeight * 10) / 10,
    avgWeight: Math.round((totalWeight / team.players.length) * 10) / 10,
    avgAge: Math.round(avgAge),
  }
}
