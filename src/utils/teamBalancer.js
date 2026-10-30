/**
 * Smart team balancing algorithm
 * 1. Assign dedicated goalkeepers first (is_goalkeeper=true)
 * 2. If missing, pick mid-level players (skill 2-3) as sub-keepers — NOT top players
 * 3. Balance ages evenly across teams
 * 4. Snake Draft on skill weight for balanced totals
 */

export function generateTeams(players, numTeams) {
  if (!players || players.length === 0) return []
  if (numTeams < 2) numTeams = 2

  const cloned = players.map(p => ({
    ...p,
    weight: (p.skill_level || 3) * 0.6 + (p.fitness_level || 3) * 0.4
  }))

  // Dedicated goalkeepers
  const keepers = cloned.filter(p => p.is_goalkeeper)
  const outfield = cloned.filter(p => !p.is_goalkeeper)

  const teams = Array.from({ length: numTeams }, (_, i) => ({
    id: i + 1,
    name: `קבוצה ${getTeamName(i)}`,
    color: TEAM_COLORS[i],
    players: [],
    goalkeeper: null,
  }))

  // Assign dedicated keepers (one per team)
  const sortedKeepers = [...keepers].sort((a, b) => b.weight - a.weight)
  for (let i = 0; i < numTeams; i++) {
    if (sortedKeepers[i]) {
      teams[i].goalkeeper = sortedKeepers[i]
      teams[i].players.push(sortedKeepers[i])
    }
  }
  const remainingKeepers = sortedKeepers.slice(numTeams)

  // For teams without a keeper: pick a mid-level outfield player (skill 2-3, NOT 4-5)
  // Sort outfield: prefer skill 2-3, avoid 4-5
  const midLevelFirst = [...outfield].sort((a, b) => {
    const scoreA = midLevelScore(a.skill_level)
    const scoreB = midLevelScore(b.skill_level)
    return scoreB - scoreA
  })

  for (let i = 0; i < numTeams; i++) {
    if (!teams[i].goalkeeper) {
      const idx = midLevelFirst.findIndex(p => !teams.some(t => t.players.includes(p)))
      if (idx !== -1) {
        const sub = midLevelFirst.splice(idx, 1)[0]
        // remove from outfield too
        const oIdx = outfield.indexOf(sub)
        if (oIdx !== -1) outfield.splice(oIdx, 1)
        teams[i].goalkeeper = { ...sub, _subKeeper: true }
        teams[i].players.push(teams[i].goalkeeper)
      }
    }
  }

  // All remaining players for snake draft
  const allOutfield = [...outfield, ...remainingKeepers]
    .filter(p => !teams.some(t => t.players.find(tp => tp.id === p.id)))

  // Sort by age-bucket then weight
  const sorted = allOutfield.sort((a, b) => {
    const ageBucketA = Math.floor((a.age || 25) / 10)
    const ageBucketB = Math.floor((b.age || 25) / 10)
    if (ageBucketA !== ageBucketB) return ageBucketB - ageBucketA
    return b.weight - a.weight
  })

  // Snake draft
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

// Score: prefer skill 2-3 for sub-keeper, penalize 4-5
function midLevelScore(skill) {
  if (skill === 2 || skill === 3) return 3
  if (skill === 1) return 1
  if (skill === 4) return 0
  if (skill === 5) return -1
  return 2 // default
}

function getTeamName(index) {
  return ['אדום', 'כחול', 'ירוק', 'צהוב'][index] || `${index + 1}`
}

export const TEAM_COLORS = [
  { bg: 'bg-red-100', border: 'border-red-400', text: 'text-red-700', badge: 'bg-red-500' },
  { bg: 'bg-blue-100', border: 'border-blue-400', text: 'text-blue-700', badge: 'bg-blue-500' },
  { bg: 'bg-green-100', border: 'border-green-400', text: 'text-green-700', badge: 'bg-green-500' },
  { bg: 'bg-yellow-100', border: 'border-yellow-400', text: 'text-yellow-700', badge: 'bg-yellow-500' },
]

export function getTeamStats(team) {
  if (!team.players.length) return { totalWeight: 0, avgAge: 0 }
  const totalWeight = team.players.reduce((s, p) => s + ((p.skill_level || 3) * 0.6 + (p.fitness_level || 3) * 0.4), 0)
  const avgAge = team.players.reduce((s, p) => s + (p.age || 25), 0) / team.players.length
  return {
    totalWeight: Math.round(totalWeight * 10) / 10,
    avgAge: Math.round(avgAge),
  }
}

// Generate round-robin match schedule with goalkeeper rotation notes
export function generateMatchSchedule(teams) {
  const matches = []
  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      matches.push({ home: teams[i], away: teams[j] })
    }
  }
  return matches
}
