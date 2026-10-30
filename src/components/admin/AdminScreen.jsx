import { useState, useEffect } from 'react'
import { Users, Plus, Calendar, Star, Zap, Trash2, Edit2, Check, X, MapPin, Shuffle, UserPlus } from 'lucide-react'
import { getPlayersByGroup } from '../../services/playerService'
import { createSession, updateSessionDate, deleteSession } from '../../services/sessionService'
import { getRSVPs, markArrived, upsertRSVP } from '../../services/rsvpService'

export default function AdminScreen({ group, gameSession, onSessionCreated, onNavigateToTeams }) {
  const [players, setPlayers] = useState([])
  const [rsvps, setRsvps] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [editingDate, setEditingDate] = useState(false)
  const [newDate, setNewDate] = useState('')
  const [savingDate, setSavingDate] = useState(false)
  const [showAddPlayer, setShowAddPlayer] = useState(false)
  const [tab, setTab] = useState('field')

  const loadData = async () => {
    if (!group?.admin_phone) return
    const [p, r] = await Promise.all([
      getPlayersByGroup(group.admin_phone),
      gameSession?.id ? getRSVPs(gameSession.id) : Promise.resolve([])
    ])
    setPlayers(p)
    setRsvps(r)
    setLoading(false)
  }

  useEffect(() => { loadData() }, [group?.admin_phone, gameSession?.id])

  // Players who arrived
  const arrivedIds = new Set(rsvps.filter(r => r.arrived).map(r => r.player_id))
  // Players who RSVPed (attending)
  const rsvpMap = Object.fromEntries(rsvps.map(r => [r.player_id, r]))
  const arrivedCount = arrivedIds.size

  // Players NOT yet marked as arrived (to add manually)
  const notArrivedPlayers = players.filter(p => !arrivedIds.has(p.id))

  const handleToggleArrived = async (playerId, currentArrived) => {
    await markArrived({ sessionId: gameSession.id, playerId, arrived: !currentArrived })
    // also mark as attending if not already
    if (!currentArrived) {
      await upsertRSVP({ sessionId: gameSession.id, playerId, attending: true })
    }
    await loadData()
  }

  const handleQuickAdd = async (playerId) => {
    await upsertRSVP({ sessionId: gameSession.id, playerId, attending: true })
    await markArrived({ sessionId: gameSession.id, playerId, arrived: true })
    await loadData()
    setShowAddPlayer(false)
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
      alert('שגיאה: ' + e.message)
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
      alert('שגיאה: ' + e.message)
    } finally {
      setSavingDate(false)
    }
  }

  return (
    <div className="px-4 pt-4 pb-24 space-y-4">

      {/* Game Session */}
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
                      <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)}
                        className="text-sm border border-green-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-500" />
                      <button onClick={handleSaveDate} disabled={savingDate} className="text-green-600"><Check className="w-4 h-4" /></button>
                      <button onClick={() => setEditingDate(false)} className="text-gray-400"><X className="w-4 h-4" /></button>
                    </div>
                  ) : (
                    <p className="text-sm text-green-600">
                      {new Date(gameSession.date).toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })} · {group.game_time}
                    </p>
                  )}
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-700">{arrivedCount}</p>
                  <p className="text-xs text-green-600">הגיעו</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => { setNewDate(gameSession.date); setEditingDate(true) }}
                className="flex-1 flex items-center justify-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 rounded-xl text-sm">
                <Edit2 className="w-3.5 h-3.5" /> שנה תאריך
              </button>
              <button onClick={handleDeleteSession}
                className="flex-1 flex items-center justify-center gap-1 bg-red-50 hover:bg-red-100 text-red-600 font-medium py-2 rounded-xl text-sm">
                <Trash2 className="w-3.5 h-3.5" /> מחק משחק
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-sm text-gray-500 mb-3">אין משחק פתוח</p>
            <button onClick={handleCreateSession} disabled={creating}
              className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2">
              {creating ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Plus className="w-4 h-4" />}
              פתח משחק
            </button>
          </div>
        )}
      </div>

      {/* Field Attendance */}
      {gameSession && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="flex border-b border-gray-100">
            <button onClick={() => setTab('field')}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${tab === 'field' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-400'}`}>
              <MapPin className="w-4 h-4 inline ml-1" />
              במגרש ({arrivedCount})
            </button>
            <button onClick={() => setTab('players')}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${tab === 'players' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-400'}`}>
              <Users className="w-4 h-4 inline ml-1" />
              קבוצה ({players.length})
            </button>
          </div>

          <div className="p-4">
            {tab === 'field' ? (
              <div className="space-y-3">

                {/* Arrived Players */}
                {players.filter(p => arrivedIds.has(p.id)).length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-2">לחץ "הוסף שחקן" כדי לסמן מי הגיע</p>
                ) : (
                  <div className="space-y-2">
                    {players.filter(p => arrivedIds.has(p.id)).map(p => (
                      <div key={p.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                        <div className="w-9 h-9 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-bold">
                          {p.is_goalkeeper ? '🧤' : p.name[0]}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800">{p.name}</p>
                          {p.is_goalkeeper && <span className="text-xs text-orange-500">שוער</span>}
                        </div>
                        <button
                          onClick={() => handleToggleArrived(p.id, true)}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-green-100 text-green-700 hover:bg-red-50 hover:text-red-500 transition-colors"
                        >
                          ✓ הגיע
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Player Button */}
                <button
                  onClick={() => setShowAddPlayer(!showAddPlayer)}
                  className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-green-300 text-green-600 py-3 rounded-xl text-sm font-medium hover:bg-green-50 transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  הוסף שחקן שהגיע למגרש
                </button>

                {/* Player Picker */}
                {showAddPlayer && (
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    {notArrivedPlayers.length === 0 ? (
                      <p className="text-gray-400 text-sm text-center py-4">כל השחקנים כבר סומנו</p>
                    ) : (
                      notArrivedPlayers.map(p => (
                        <button
                          key={p.id}
                          onClick={() => handleQuickAdd(p.id)}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-green-50 border-b border-gray-50 last:border-0 transition-colors text-right"
                        >
                          <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-sm font-bold">
                            {p.is_goalkeeper ? '🧤' : p.name[0]}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-800">{p.name}</p>
                            <p className="text-xs text-gray-400">גיל {p.age}</p>
                          </div>
                          <Plus className="w-4 h-4 text-green-500" />
                        </button>
                      ))
                    )}
                  </div>
                )}

                {/* Go to Teams Button */}
                {arrivedCount >= 2 && (
                  <button
                    onClick={onNavigateToTeams}
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 text-base shadow-md active:scale-95 transition-all mt-2"
                  >
                    <Shuffle className="w-5 h-5" />
                    חלק לקבוצות ({arrivedCount} שחקנים)
                  </button>
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
        <div className="bg-white rounded-lg px-3 py-2 text-center font-bold text-blue-700 text-lg tracking-wider border border-blue-200">
          {group.admin_phone}
        </div>
      </div>
    </div>
  )
}
