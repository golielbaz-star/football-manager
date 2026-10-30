import { useState, useEffect } from 'react'
import { Users, Plus, Calendar, Star, Zap, Trash2, Edit2, Check, X, MapPin } from 'lucide-react'
import { getPlayersByGroup } from '../../services/playerService'
import { createSession, updateSessionDate, deleteSession } from '../../services/sessionService'
import { getRSVPs, markArrived } from '../../services/rsvpService'

export default function AdminScreen({ group, gameSession, onSessionCreated }) {
  const [players, setPlayers] = useState([])
  const [rsvps, setRsvps] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [editingDate, setEditingDate] = useState(false)
  const [newDate, setNewDate] = useState('')
  const [savingDate, setSavingDate] = useState(false)
  const [tab, setTab] = useState('attendance') // 'attendance' | 'players'

  useEffect(() => {
    if (!group?.admin_phone) return
    getPlayersByGroup(group.admin_phone).then(p => {
      setPlayers(p)
      setLoading(false)
    })
  }, [group?.admin_phone])

  useEffect(() => {
    if (!gameSession?.id) return
    getRSVPs(gameSession.id).then(setRsvps)
  }, [gameSession?.id])

  const attending = rsvps.filter(r => r.attending !== false)
  const arrived = rsvps.filter(r => r.arrived)

  const handleToggleArrived = async (playerId, currentArrived) => {
    await markArrived({ sessionId: gameSession.id, playerId, arrived: !currentArrived })
    const updated = await getRSVPs(gameSession.id)
    setRsvps(updated)
  }

  const handleCreateSession = async () => {
    setCreating(true)
    try {
      const today = new Date().toISOString().split('T')[0]
      await createSession(group.id, today)
      onSessionCreated()
    } catch (e) {
      alert('שגיאה ביצירת המשחק: ' + e.message)
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteSession = async () => {
    if (!confirm('למחוק את המשחק הנוכחי?')) return
    try {
      await deleteSession(gameSession.id)
      onSessionCreated()
    } catch (e) {
      alert('שגיאה במחיקה: ' + e.message)
    }
  }

  const handleSaveDate = async () => {
    if (!newDate) return
    setSavingDate(true)
    try {
      await updateSessionDate(gameSession.id, newDate)
      setEditingDate(false)
      onSessionCreated()
    } catch (e) {
      alert('שגיאה בשמירה: ' + e.message)
    } finally {
      setSavingDate(false)
    }
  }

  return (
    <div className="px-4 pt-4 pb-24 space-y-4">

      {/* Game Session Control */}
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-green-600" />
          ניהול משחק
        </h3>

        {gameSession ? (
          <div className="space-y-3">
            <div className="bg-green-50 border border-green-200 rounded-xl p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-green-800">משחק פתוח</p>
                  {editingDate ? (
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="date"
                        value={newDate}
                        onChange={e => setNewDate(e.target.value)}
                        className="text-sm border border-green-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      <button onClick={handleSaveDate} disabled={savingDate} className="text-green-600 hover:text-green-800">
                        <Check className="w-4 h-4" />
                      </button>
                      <button onClick={() => setEditingDate(false)} className="text-gray-400 hover:text-gray-600">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm text-green-600">
                      {new Date(gameSession.date).toLocaleDateString('he-IL', {
                        weekday: 'long', day: 'numeric', month: 'long'
                      })} · {group.game_time}
                    </p>
                  )}
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-700">{attending.length}</p>
                  <p className="text-xs text-green-600">נרשמו</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => { setNewDate(gameSession.date); setEditingDate(true) }}
                className="flex-1 flex items-center justify-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 rounded-xl text-sm transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
                שנה תאריך
              </button>
              <button
                onClick={handleDeleteSession}
                className="flex-1 flex items-center justify-center gap-1 bg-red-50 hover:bg-red-100 text-red-600 font-medium py-2 rounded-xl text-sm transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                מחק משחק
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-sm text-gray-500 mb-3">אין משחק פתוח</p>
            <button
              onClick={handleCreateSession}
              disabled={creating}
              className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              {creating ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Plus className="w-4 h-4" />}
              פתח משחק
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      {gameSession && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="flex border-b border-gray-100">
            <button
              onClick={() => setTab('attendance')}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${tab === 'attendance' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-400'}`}
            >
              <MapPin className="w-4 h-4 inline ml-1" />
              נוכחות במגרש ({arrived.length})
            </button>
            <button
              onClick={() => setTab('players')}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${tab === 'players' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-400'}`}
            >
              <Users className="w-4 h-4 inline ml-1" />
              שחקנים ({players.length})
            </button>
          </div>

          <div className="p-4">
            {tab === 'attendance' ? (
              <div className="space-y-2">
                {attending.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-4">אף אחד לא אישר הגעה עדיין</p>
                ) : (
                  attending.map(rsvp => {
                    const p = rsvp.players
                    if (!p) return null
                    return (
                      <div key={rsvp.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${
                          rsvp.arrived ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {p.name[0]}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800">{p.name}</p>
                          {p.is_goalkeeper && <span className="text-xs text-orange-500">🧤 שוער</span>}
                        </div>
                        <button
                          onClick={() => handleToggleArrived(rsvp.player_id, rsvp.arrived)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                            rsvp.arrived
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-500 hover:bg-green-50 hover:text-green-600'
                          }`}
                        >
                          {rsvp.arrived ? '✓ הגיע' : 'סמן הגעה'}
                        </button>
                      </div>
                    )
                  })
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {loading ? (
                  <div className="text-center py-4">
                    <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  </div>
                ) : players.map(p => (
                  <div key={p.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${
                      p.is_goalkeeper ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {p.is_goalkeeper ? '🧤' : p.name[0]}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">{p.name}</p>
                      <p className="text-xs text-gray-400">גיל {p.age} · {p.phone}</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span className="flex items-center gap-0.5"><Star className="w-3 h-3 text-yellow-500" />{p.skill_level}</span>
                      <span className="flex items-center gap-0.5"><Zap className="w-3 h-3 text-blue-500" />{p.fitness_level}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Share Code */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
        <p className="text-sm font-medium text-blue-800 mb-1">קוד הצטרפות לקבוצה</p>
        <p className="text-xs text-blue-600 mb-2">שלח לשחקנים את הטלפון שלך:</p>
        <div className="bg-white rounded-lg px-3 py-2 text-center font-bold text-blue-700 text-lg tracking-wider border border-blue-200">
          {group.admin_phone}
        </div>
      </div>
    </div>
  )
}
