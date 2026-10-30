import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function FieldView({ teams, matches, teamMatchesMap }) {
  const [matchIdx, setMatchIdx] = useState(0)

  if (!matches.length) return null

  const match = matches[matchIdx]
  const homeMatchIdx = teamMatchesMap[match.home.id]?.indexOf(matchIdx) ?? matchIdx
  const awayMatchIdx = teamMatchesMap[match.away.id]?.indexOf(matchIdx) ?? matchIdx
  const gkHome = getRotatingGK(match.home, homeMatchIdx)
  const gkAway = getRotatingGK(match.away, awayMatchIdx)

  const homePositions = getPlayerPositions(match.home.players, gkHome, false)
  const awayPositions = getPlayerPositions(match.away.players, gkAway, true)

  const sittingTeam = teams.find(t => t.id !== match.home.id && t.id !== match.away.id)

  return (
    <div className="space-y-3">
      {/* Match nav */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <button
            onClick={() => setMatchIdx(i => Math.max(0, i - 1))}
            disabled={matchIdx === 0}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100 disabled:opacity-30"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <div className="text-center">
            <div className="flex items-center gap-2 justify-center">
              <span className={`text-sm font-bold ${match.home.color.text}`}>{match.home.name}</span>
              <span className="text-gray-400 text-xs">מול</span>
              <span className={`text-sm font-bold ${match.away.color.text}`}>{match.away.name}</span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">משחק {matchIdx + 1} מתוך {matches.length}</p>
          </div>
          <button
            onClick={() => setMatchIdx(i => Math.min(matches.length - 1, i + 1))}
            disabled={matchIdx === matches.length - 1}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100 disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Pitch */}
        <div className="px-3 py-3">
          <div
            className="relative w-full rounded-xl overflow-hidden bg-green-700"
            style={{ aspectRatio: '3/4' }}
          >
            <FieldMarkings />

            {/* Team labels */}
            <div className={`absolute top-1 left-2 text-xs font-bold px-2 py-0.5 rounded-full bg-black bg-opacity-30 text-white`}>
              {match.away.name}
            </div>
            <div className={`absolute bottom-1 left-2 text-xs font-bold px-2 py-0.5 rounded-full bg-black bg-opacity-30 text-white`}>
              {match.home.name}
            </div>

            {/* Away team (top) */}
            {awayPositions.map(({ player, x, y, isGK }) => (
              <PlayerDot
                key={player.id}
                player={player}
                x={x}
                y={y}
                isGK={isGK}
                badgeClass={match.away.color.badge}
              />
            ))}

            {/* Home team (bottom) */}
            {homePositions.map(({ player, x, y, isGK }) => (
              <PlayerDot
                key={player.id}
                player={player}
                x={x}
                y={y}
                isGK={isGK}
                badgeClass={match.home.color.badge}
              />
            ))}
          </div>
        </div>

        {/* Sitting team */}
        {sittingTeam && (
          <div className="mx-3 mb-3 px-3 py-2 bg-gray-50 rounded-xl text-center text-xs text-gray-500">
            ממתינה: <span className={`font-bold ${sittingTeam.color.text}`}>{sittingTeam.name}</span>
          </div>
        )}
      </div>

      {/* GK Rotation - both teams */}
      <div className="grid grid-cols-2 gap-3">
        <GKRotation team={match.home} currentGK={gkHome} />
        <GKRotation team={match.away} currentGK={gkAway} />
      </div>
    </div>
  )
}

function FieldMarkings() {
  return (
    <>
      {/* Center line */}
      <div
        className="absolute left-0 right-0"
        style={{ top: '50%', height: 1, background: 'rgba(255,255,255,0.35)' }}
      />
      {/* Center circle */}
      <div
        className="absolute rounded-full"
        style={{
          width: '24%',
          height: '16.5%',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%,-50%)',
          border: '1px solid rgba(255,255,255,0.35)',
        }}
      />
      {/* Center dot */}
      <div
        className="absolute rounded-full bg-white"
        style={{
          width: 5,
          height: 5,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%,-50%)',
          opacity: 0.45,
        }}
      />
      {/* Home penalty area (bottom) */}
      <div
        className="absolute"
        style={{
          width: '54%',
          height: '20%',
          bottom: 0,
          left: '23%',
          border: '1px solid rgba(255,255,255,0.35)',
          borderBottomWidth: 0,
        }}
      />
      {/* Home goal */}
      <div
        className="absolute"
        style={{
          width: '28%',
          height: '5%',
          bottom: 0,
          left: '36%',
          border: '2px solid rgba(255,255,255,0.6)',
          borderBottomWidth: 0,
          background: 'rgba(255,255,255,0.08)',
        }}
      />
      {/* Away penalty area (top) */}
      <div
        className="absolute"
        style={{
          width: '54%',
          height: '20%',
          top: 0,
          left: '23%',
          border: '1px solid rgba(255,255,255,0.35)',
          borderTopWidth: 0,
        }}
      />
      {/* Away goal */}
      <div
        className="absolute"
        style={{
          width: '28%',
          height: '5%',
          top: 0,
          left: '36%',
          border: '2px solid rgba(255,255,255,0.6)',
          borderTopWidth: 0,
          background: 'rgba(255,255,255,0.08)',
        }}
      />
    </>
  )
}

function PlayerDot({ player, x, y, isGK, badgeClass }) {
  const firstName = player.name?.split(' ')[0] || player.name || '?'
  return (
    <div
      className="absolute"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: 'translate(-50%, -50%)',
        zIndex: 10,
      }}
    >
      <div className="flex flex-col items-center">
        <div
          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-md border-2 border-white border-opacity-80 ${isGK ? 'bg-orange-500' : badgeClass}`}
          style={{ fontSize: 11 }}
        >
          {isGK ? '🧤' : firstName[0]?.toUpperCase()}
        </div>
        <span
          className="text-white font-semibold mt-0.5 text-center leading-tight"
          style={{
            fontSize: 8,
            textShadow: '0 1px 3px rgba(0,0,0,0.9)',
            maxWidth: 42,
            wordBreak: 'break-word',
          }}
        >
          {firstName}
        </span>
      </div>
    </div>
  )
}

function GKRotation({ team, currentGK }) {
  const rotation = getFullGKRotation(team)
  return (
    <div className={`${team.color.bg} rounded-2xl p-3`}>
      <p className={`text-xs font-bold ${team.color.text} mb-2`}>
        {team.name} · שוערים
      </p>
      <div className="space-y-1.5">
        {rotation.map((gk, idx) => {
          const isCurrent = gk?.id === currentGK?.id
          return (
            <div
              key={idx}
              className={`flex items-center gap-1.5 rounded-lg px-2 py-1 transition-colors ${isCurrent ? 'bg-orange-100' : ''}`}
            >
              <span
                className={`w-5 h-5 rounded-full text-white text-xs flex items-center justify-center font-bold shrink-0 ${isCurrent ? 'bg-orange-500' : 'bg-gray-300'}`}
              >
                {idx + 1}
              </span>
              <span className={`text-xs font-medium truncate ${isCurrent ? 'text-orange-800 font-bold' : team.color.text}`}>
                {gk?.name}
              </span>
              {isCurrent && <span className="text-xs shrink-0">🧤</span>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── helpers ──────────────────────────────────────────────────────────────────

function getFullGKRotation(team) {
  if (team.goalkeeper && !team.goalkeeper._subKeeper) {
    return [team.goalkeeper]
  }
  return team.players
    .filter(p => !p.is_goalkeeper)
    .sort((a, b) => (a.skill_level || 3) - (b.skill_level || 3))
}

function getRotatingGK(team, matchIndexForThisTeam) {
  if (team.goalkeeper && !team.goalkeeper._subKeeper) return team.goalkeeper
  const outfield = team.players
    .filter(p => !p.is_goalkeeper)
    .sort((a, b) => (a.skill_level || 3) - (b.skill_level || 3))
  if (outfield.length === 0) return team.goalkeeper
  return outfield[matchIndexForThisTeam % outfield.length]
}

function getPlayerPositions(players, gkPlayer, isTop) {
  const positions = []

  // GK
  const gkY = isTop ? 6 : 94
  positions.push({
    player: gkPlayer || { id: '_gk', name: '?', skill_level: 3 },
    x: 50,
    y: gkY,
    isGK: true,
  })

  // Outfield
  const outfield = players.filter(p => p.id !== gkPlayer?.id)
  const rows = []
  const copy = [...outfield]
  while (copy.length > 0) {
    rows.push(copy.splice(0, 2))
  }

  const rowCount = rows.length || 1
  const yStart = isTop ? 20 : 58
  const yEnd = isTop ? 46 : 84

  rows.forEach((row, rowIdx) => {
    const y =
      rowCount === 1
        ? (yStart + yEnd) / 2
        : yStart + ((yEnd - yStart) * rowIdx) / (rowCount - 1)

    const xPositions =
      row.length === 1
        ? [50]
        : row.length === 2
        ? [27, 73]
        : [18, 50, 82]

    row.forEach((player, pi) => {
      positions.push({ player, x: xPositions[pi] ?? 50, y, isGK: false })
    })
  })

  return positions
}
