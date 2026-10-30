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
        <TeamCard key={team.id} team={team} />
      ))}

      {/* Match Schedule with GK rotation */}
      {generated && matches.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h3 className="font-bold text-gray-800 mb-4">סדר משחקים + שוערים</h3>
          <div className="space-y-3">
            {matches.map((match, i) => {
              const sittingTeam = teams.find(t => t.id !== match.home.id && t.id !== match.away.id)

              // GK rotation per team: sort outfield by skill ASC (weakest first), rotate by match index
              const homeGK = getRotatingGK(match.home, i)
              const awayGK = getRotatingGK(match.away, i)

              return (
                <div key={i} className="border border-gray-100 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
                      {i + 1}
                    </span>
                    <div className={`w-3 h-3 rounded-full ${match.home.color.badge}`} />
                    <span className="font-bold text-sm">{match.home.name}</span>
                    <span className="text-gray-400 text-sm">vs</span>
                    <div className={`w-3 h-3 rounded-full ${match.away.color.badge}`} />
                    <span className="font-bold text-sm">{match.away.name}</span>
                    {sittingTeam && (
                      <span className="mr-auto text-xs text-gray-400">ממתינה: {sittingTeam.name}</span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-orange-50 rounded-lg px-2 py-1.5">
                      <span className="text-gray-400">{match.home.name} 🧤</span>
                      <p className="font-bold text-orange-700">{homeGK?.name || '—'}</p>
                      <p className="text-orange-400">שוער {match.home.id} · רמה {homeGK?.skill_level}</p>
                    </div>
                    <div className="bg-orange-50 rounded-lg px-2 py-1.5">
                      <span className="text-gray-400">{match.away.name} 🧤</span>
                      <p className="font-bold text-orange-700">{awayGK?.name || '—'}</p>
                      <p className="text-orange-400">שוער {match.away.id} · רמה {awayGK?.skill_level}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          <p className="text-xs text-gray-400 mt-3 text-center">
            * הסבב מתחיל מהשחקן הכי פחות טוב ועולה בכל משחק
          </p>
        </div>
      )}
    </div>
  )
}

// GK rotation: if team has dedicated GK use them, otherwise rotate outfield from weakest to strongest
function getRotatingGK(team, matchIndex) {
  if (team.goalkeeper && !team.goalkeeper._subKeeper) {
    return team.goalkeeper // dedicated keeper always plays
  }
  // Sort non-dedicated outfield players by skill ASC (weakest first)
  const outfield = team.players
    .filter(p => !p.is_goalkeeper)
    .sort((a, b) => (a.skill_level || 3) - (b.skill_level || 3))
  if (outfield.length === 0) return team.goalkeeper
  return outfield[matchIndex % outfield.length]
}

function TeamCard({ team }) {
  const stats = getTeamStats(team)
  const gk = team.goalkeeper

  return (
    <div className={`bg-white rounded-2xl shadow-sm border-2 ${team.color.border} overflow-hidden`}>
      <div className={`${team.color.bg} px-5 py-3 flex items-center justify-between`}>
        <h3 className={`font-bold text-lg ${team.color.text}`}>{team.name}</h3>
        <div className="flex items-center gap-3 text-sm">
          <span className={`${team.color.text} opacity-75`}>
            <Users className="w-3 h-3 inline ml-1" />{team.players.length}
          </span>
          <span className={`${team.color.text} opacity-75`}>⚖️ {stats.totalWeight}</span>
        </div>
      </div>

      {/* Goalkeeper highlight */}
      {gk && (
        <div className="px-4 pt-3 pb-1">
          <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-xl px-3 py-2">
            <span className="text-xl">🧤</span>
            <div className="flex-1">
              <p className="text-sm font-bold text-orange-800">{gk.name}</p>
              <p className="text-xs text-orange-500">
                שוער {team.id}{gk._subKeeper ? ' (תורנות)' : ''}
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs text-orange-400">
              <Star className="w-3 h-3" />{gk.skill_level}
            </div>
          </div>
        </div>
      )}

      {/* Outfield players */}
      <div className="p-4 space-y-1">
        {team.players
          .filter(p => p.id !== gk?.id)
          .map(player => (
            <div key={player.id} className="flex items-center gap-2 py-1.5 border-b border-gray-50 last:border-0">
              <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-sm font-bold">
                {player.name[0]}
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
