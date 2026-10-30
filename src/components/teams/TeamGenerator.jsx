import { useState } from 'react'
import { Shuffle, Star, Zap, Users } from 'lucide-react'
import { generateTeams, getTeamStats, generateMatchSchedule } from '../../utils/teamBalancer'

export default function TeamGenerator({ session, group, rsvps }) {
  const [teams, setTeams] = useState([])
  const [generated, setGenerated] = useState(false)
  const [loading, setLoading] = useState(false)

  const arrivedPlayers = rsvps.filter(r => r.arrived).map(r => r.players).filter(Boolean)
  const playersPerTeam = group.players_per_team || 5
  const maxTeams = group.max_teams || 4
  const numTeams = Math.min(maxTeams, Math.max(2, Math.ceil(arrivedPlayers.length / playersPerTeam)))

  const handleGenerate = () => {
    if (arrivedPlayers.length < 2) return
    setLoading(true)
    setTimeout(() => {
      const result = generateTeams(arrivedPlayers, numTeams)
      setTeams(result)
      setGenerated(true)
      setLoading(false)
    }, 600)
  }

  if (!session) {
    return (
      <div className="px-4 pt-8 pb-24 text-center">
        <div className="text-5xl mb-4">🏆</div>
        <h2 className="text-xl font-bold text-gray-700">אין משחק פעיל</h2>
        <p className="text-gray-500 mt-2 text-sm">פתח משחק כדי לחלק קבוצות</p>
      </div>
    )
  }

  const matches = generated ? generateMatchSchedule(teams) : []

  // Build GK rotation per team across all matches they play in
  const teamMatchesMap = {} // teamId → [matchIndex, ...]
  if (generated) {
    matches.forEach((match, i) => {
      if (!teamMatchesMap[match.home.id]) teamMatchesMap[match.home.id] = []
      if (!teamMatchesMap[match.away.id]) teamMatchesMap[match.away.id] = []
      teamMatchesMap[match.home.id].push(i)
      teamMatchesMap[match.away.id].push(i)
    })
  }

  return (
    <div className="px-4 pt-4 pb-24 space-y-4">

      {/* Stats */}
      <div className="bg-white rounded-2xl shadow-sm p-4 flex items-center justify-between">
        <div className="text-center">
          <p className="text-2xl font-bold text-green-600">{arrivedPlayers.length}</p>
          <p className="text-xs text-gray-500">הגיעו</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-600">{numTeams}</p>
          <p className="text-xs text-gray-500">קבוצות</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-orange-600">
            {arrivedPlayers.filter(p => p.is_goalkeeper).length}
          </p>
          <p className="text-xs text-gray-500">שוערים</p>
        </div>
      </div>

      {/* Generate */}
      <button
        onClick={handleGenerate}
        disabled={loading || arrivedPlayers.length < 2}
        className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:opacity-50 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 text-lg transition-all shadow-md active:scale-95"
      >
        {loading ? (
          <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />מחלק...</>
        ) : (
          <><Shuffle className="w-5 h-5" />{generated ? 'ערבב מחדש' : 'חלק לקבוצות'}</>
        )}
      </button>

      {arrivedPlayers.length < 2 && (
        <p className="text-center text-gray-500 text-sm">יש לסמן לפחות 2 שחקנים כ"הגיע"</p>
      )}

      {/* Team Cards */}
      {generated && teams.map(team => (
        <TeamCard
          key={team.id}
          team={team}
          matchIndices={teamMatchesMap[team.id] || []}
        />
      ))}

      {/* Match Schedule */}
      {generated && matches.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h3 className="font-bold text-gray-800 mb-4">🏆 סדר משחקים</h3>
          <div className="space-y-4">
            {matches.map((match, i) => {
              const sittingTeam = teams.find(t => t.id !== match.home.id && t.id !== match.away.id)
              const homeMatchIdx = teamMatchesMap[match.home.id]?.indexOf(i) ?? i
              const awayMatchIdx = teamMatchesMap[match.away.id]?.indexOf(i) ?? i
              const homeGK = getRotatingGK(match.home, homeMatchIdx)
              const awayGK = getRotatingGK(match.away, awayMatchIdx)

              return (
                <div key={i} className="border-2 border-gray-100 rounded-2xl overflow-hidden">
                  {/* Match header */}
                  <div className="bg-gray-800 px-4 py-2 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-white text-gray-800 flex items-center justify-center text-xs font-bold">
                      {i + 1}
                    </span>
                    <div className={`w-3 h-3 rounded-full ${match.home.color.badge}`} />
                    <span className="font-bold text-white text-sm">{match.home.name}</span>
                    <span className="text-gray-400 text-sm mx-1">מול</span>
                    <div className={`w-3 h-3 rounded-full ${match.away.color.badge}`} />
                    <span className="font-bold text-white text-sm">{match.away.name}</span>
                    {sittingTeam && (
                      <span className="mr-auto text-xs text-gray-400 bg-gray-700 px-2 py-0.5 rounded-full">
                        ממתינה: {sittingTeam.name}
                      </span>
                    )}
                  </div>
                  {/* GK row */}
                  <div className="grid grid-cols-2 divide-x divide-x-reverse divide-gray-100">
                    <div className="px-3 py-2.5">
                      <p className={`text-xs font-medium mb-0.5 ${match.home.color.text}`}>{match.home.name}</p>
                      <p className="text-sm font-bold text-gray-800">🧤 {homeGK?.name || '—'}</p>
                      <p className="text-xs text-gray-400">שוער {homeMatchIdx + 1} בסבב · רמה {homeGK?.skill_level}</p>
                    </div>
                    <div className="px-3 py-2.5">
                      <p className={`text-xs font-medium mb-0.5 ${match.away.color.text}`}>{match.away.name}</p>
                      <p className="text-sm font-bold text-gray-800">🧤 {awayGK?.name || '—'}</p>
                      <p className="text-xs text-gray-400">שוער {awayMatchIdx + 1} בסבב · רמה {awayGK?.skill_level}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// GK rotation: dedicated keeper always plays; otherwise rotate weakest→strongest
function getRotatingGK(team, matchIndexForThisTeam) {
  if (team.goalkeeper && !team.goalkeeper._subKeeper) {
    return team.goalkeeper
  }
  const outfield = team.players
    .filter(p => !p.is_goalkeeper)
    .sort((a, b) => (a.skill_level || 3) - (b.skill_level || 3))
  if (outfield.length === 0) return team.goalkeeper
  return outfield[matchIndexForThisTeam % outfield.length]
}

function TeamCard({ team, matchIndices }) {
  const stats = getTeamStats(team)

  // Build GK rotation list for this team
  const gkRotation = matchIndices.map((_, idx) => getRotatingGK(team, idx))

  return (
    <div className={`bg-white rounded-2xl shadow-sm border-2 ${team.color.border} overflow-hidden`}>
      {/* Header */}
      <div className={`${team.color.bg} px-5 py-3 flex items-center justify-between`}>
        <h3 className={`font-bold text-lg ${team.color.text}`}>{team.name}</h3>
        <div className="flex items-center gap-3 text-sm">
          <span className={`${team.color.text} opacity-75`}>
            <Users className="w-3 h-3 inline ml-1" />{team.players.length}
          </span>
          <span className={`${team.color.text} opacity-75`}>⚖️ {stats.totalWeight}</span>
        </div>
      </div>

      {/* GK Rotation List */}
      {gkRotation.length > 0 && (
        <div className="px-4 pt-3 pb-1">
          <p className="text-xs font-bold text-gray-500 mb-2">🧤 סדר שוערים</p>
          <div className="space-y-1">
            {gkRotation.map((gk, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-orange-50 rounded-lg px-3 py-1.5">
                <span className="w-5 h-5 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center">
                  {idx + 1}
                </span>
                <span className="text-sm font-medium text-orange-800 flex-1">{gk?.name}</span>
                <span className="text-xs text-orange-400">רמה {gk?.skill_level}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Players */}
      <div className="p-4 pt-3 space-y-1">
        <p className="text-xs font-bold text-gray-500 mb-2">שחקנים</p>
        {team.players.map(player => (
          <div key={player.id} className="flex items-center gap-2 py-1.5 border-b border-gray-50 last:border-0">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              player.is_goalkeeper ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'
            }`}>
              {player.is_goalkeeper ? '🧤' : player.name[0]}
            </div>
            <span className="flex-1 text-sm font-medium text-gray-800">{player.name}</span>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Star className="w-3 h-3 text-yellow-500" />{player.skill_level}
              <Zap className="w-3 h-3 text-blue-400 mr-1" />{player.fitness_level}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
