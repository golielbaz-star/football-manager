import { useState } from 'react'
import { CheckCircle, XCircle, Users, UserCheck, Clock } from 'lucide-react'

export default function RSVPScreen({ session, rsvps, myRsvp, player, isAdmin, onRSVP, onToggleArrived, loading }) {
  const attending = rsvps.filter(r => r.attending !== false)
  const arrived = rsvps.filter(r => r.arrived)
  const notAttending = rsvps.filter(r => r.attending === false)

  if (!session) {
    return (
      <div className="px-4 pt-8 pb-24 text-center">
        <div className="text-5xl mb-4">📅</div>
        <h2 className="text-xl font-bold text-gray-700">אין משחק מתוכנן</h2>
        <p className="text-gray-500 mt-2 text-sm">המנהל טרם פתח משחק קרוב</p>
      </div>
    )
  }

  return (
    <div className="px-4 pt-4 pb-24 space-y-4">
      {/* Session header */}
      <div className="bg-gradient-to-r from-green-600 to-green-800 rounded-2xl p-5 text-white">
        <div className="flex items-center gap-2 mb-1">
          <Clock className="w-4 h-4 text-green-200" />
          <span className="text-green-200 text-sm">
            {new Date(session.date).toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })}
          </span>
        </div>
        <div className="flex justify-between items-end">
          <div>
            <p className="text-2xl font-bold">{arrived.length} הגיעו</p>
            <p className="text-green-200 text-sm">{attending.length} אישרו הגעה</p>
          </div>
          <StatusBadge status={session.status} />
        </div>
      </div>

      {/* My RSVP */}
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <h3 className="font-bold text-gray-800 mb-3">האם אתה מגיע?</h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onRSVP(true)}
            className={`py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors ${
              myRsvp?.attending === true
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-green-50'
            }`}
          >
            <CheckCircle className="w-5 h-5" />
            מגיע!
          </button>
          <button
            onClick={() => onRSVP(false)}
            className={`py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors ${
              myRsvp?.attending === false
                ? 'bg-red-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-red-50'
            }`}
          >
            <XCircle className="w-5 h-5" />
            לא מגיע
          </button>
        </div>
      </div>

      {/* Attending list */}
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
          <Users className="w-4 h-4 text-green-600" />
          מגיעים ({attending.length})
        </h3>
        <div className="space-y-2">
          {attending.length === 0 && (
            <p className="text-gray-400 text-sm text-center py-2">אף אחד עדיין לא אישר</p>
          )}
          {attending.map(rsvp => (
            <PlayerRow
              key={rsvp.id}
              rsvp={rsvp}
              isAdmin={isAdmin}
              currentPlayerId={player.id}
              onToggleArrived={onToggleArrived}
            />
          ))}
        </div>
      </div>

      {notAttending.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h3 className="font-bold text-gray-500 mb-3 text-sm flex items-center gap-2">
            <XCircle className="w-4 h-4" />
            לא מגיעים ({notAttending.length})
          </h3>
          <div className="space-y-1">
            {notAttending.map(rsvp => (
              <div key={rsvp.id} className="flex items-center gap-2 py-1">
                <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                  {rsvp.players?.name?.[0] || '?'}
                </div>
                <span className="text-gray-400 text-sm line-through">{rsvp.players?.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function PlayerRow({ rsvp, isAdmin, currentPlayerId, onToggleArrived }) {
  const name = rsvp.players?.name || 'שחקן'
  const isGoalkeeper = rsvp.players?.is_goalkeeper
  const canToggle = isAdmin || rsvp.player_id === currentPlayerId

  return (
    <div className="flex items-center gap-3 py-1">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
        rsvp.arrived ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600'
      }`}>
        {name[0]}
      </div>
      <div className="flex-1">
        <span className="text-sm font-medium text-gray-800">{name}</span>
        {isGoalkeeper && <span className="mr-1 text-xs text-orange-600">🧤</span>}
      </div>
      {canToggle ? (
        <button
          onClick={() => onToggleArrived(rsvp.player_id, !rsvp.arrived)}
          className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
            rsvp.arrived
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-500 hover:bg-green-50'
          }`}
        >
          {rsvp.arrived ? '✓ הגיע' : 'סמן'}
        </button>
      ) : (
        <span className={`text-xs ${rsvp.arrived ? 'text-green-600' : 'text-gray-300'}`}>
          {rsvp.arrived ? '✓' : '○'}
        </span>
      )}
    </div>
  )
}

function StatusBadge({ status }) {
  const map = {
    upcoming: { label: 'מתוכנן', cls: 'bg-blue-500' },
    active: { label: 'פעיל', cls: 'bg-green-500' },
    completed: { label: 'הסתיים', cls: 'bg-gray-500' },
  }
  const s = map[status] || map.upcoming
  return (
    <span className={`${s.cls} text-white text-xs font-bold px-2 py-1 rounded-full`}>
      {s.label}
    </span>
  )
}
