import { useState } from 'react'
import { Shuffle, Shield, Star, Zap, Users } from 'lucide-react'
import { generateTeams, getTeamStats } from '../../utils/teamBalancer'
import { getArrivedPlayers } from '../../services/rsvpService'

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

  return (
    <div className="px-4 pt-4 pb-24 space-y-4">
      {/* Stats bar */}
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

      {/* Generate button */}
      <button
        onClick={handleGenerate}
        disabled={loading || arrivedPlayers.length < 2}
        className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:opacity-50 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 text-lg transition-all shadow-md active:scale-95"
      >
        {loading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            מחלק...
          </>
        ) : (
          <>
            <Shuffle className="w-5 h-5" />
            {generated ? 'ערבב מחדש' : 'חלק לקבוצות'}
          </>
        )}
      </button>

      {arrivedPlayers.length < 2 && (
        <p className="text-center text-gray-500 text-sm">
          יש לסמן לפחות 2 שחקנים כ"הגיע" כדי לחלק קבוצות
        </p>
      )}

      {/* Teams */}
      {generated && teams.map((team, idx) => (
        <TeamCard key={team.id} team={team} matchOrder={idx + 1} totalTeams={teams.length} />
      ))}

      {/* Game order */}
      {generated && teams.length >= 2 && (
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h3 className="font-bold text-gray-800 mb-3">סדר משחקים מוצע</h3>
          <div className="space-y-2">
            {generateMatchOrder(teams).map((match, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
                  {i + 1}
                </span>
                <div className={`w-3 h-3 rounded-full ${match[0].color.badge}`} />
                <span className="font-medium">{match[0].name}</span>
                <span className="text-gray-400 mx-1">vs</span>
                <div className={`w-3 h-3 rounded-full ${match[1].color.badge}`} />
                <span className="font-medium">{match[1].name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function TeamCard({ team, matchOrder, totalTeams }) {
  const stats = getTeamStats(team)
  return (
    <div className={`bg-white rounded-2xl shadow-sm border-2 ${team.color.border} overflow-hidden`}>
      <div className={`${team.color.bg} px-5 py-3 flex items-center justify-between`}>
        <h3 className={`font-bold text-lg ${team.color.text}`}>{team.name}</h3>
        <div className="flex items-center gap-3 text-sm">
          <span className={`${team.color.text} opacity-75`}>
            <Users className="w-3 h-3 inline ml-1" />{team.players.length}
          </span>
          <span className={`${team.color.text} opacity-75`}>
            ⚖️ {stats.totalWeight}
          </span>
        </div>
      </div>
      <div className="p-4 space-y-2">
        {team.players.map(player => (
          <PlayerChip key={player.id} player={player} isKeeper={player === team.goalkeeper} />
        ))}
      </div>
    </div>
  )
}

function PlayerChip({ player, isKeeper }) {
  return (
    <div className="flex items-center gap-2 py-1">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
        isKeeper ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'
      }`}>
        {isKeeper ? '🧤' : player.name[0]}
      </div>
      <div className="flex-1">
        <span className="text-sm font-medium text-gray-800">{player.name}</span>
        {player._subKeeper && <span className="text-xs text-orange-500 mr-1">(תורנות)</span>}
      </div>
      <div className="flex items-center gap-1 text-xs text-gray-400">
        <Star className="w-3 h-3" />{player.skill_level}
        <Zap className="w-3 h-3 mr-1" />{player.fitness_level}
      </div>
    </div>
  )
}

function generateMatchOrder(teams) {
  const matches = []
  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      matches.push([teams[i], teams[j]])
    }
  }
  return matches
}
