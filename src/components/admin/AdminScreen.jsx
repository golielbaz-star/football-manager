import { useState, useEffect } from 'react'
import { Users, Plus, Calendar, Star, Zap, Trash2, Edit2, Check, X, MapPin, Shuffle, UserPlus } from 'lucide-react'
import { getPlayersByGroup, addGuestPlayer, deletePlayer, removeInactivePlayers } from '../../services/playerService'
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
  const [showGuestForm, setShowGuestForm] = useState(false)
  const [guestName, setGuestName] = useState('')
  const [guestSkill, setGuestSkill] = useState(3)
  const [addingGuest, setAddingGuest] = useState(false)
  const [tab, setTab] = useState('field')
  const [removedPlayers, setRemovedPlayers] = useState([])

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

  useEffect(() => {
    if (!group?.admin_phone || !group?.id) return
    removeInactivePlayers({ adminPhone: group.admin_phone, groupId: group.id })
      .then(removed => {
        if (removed.length > 0) {
          setRemovedPlayers(removed)
          loadData()
        }
      })
      .catch(() => {}) // silent fail
  }, [group?.id])

  useEffect(() => { loadData() }, [group?.admin_phone, gameSession?.id])

  const arrivedIds = new Set(rsvps.filter(r => r.arrived).map(r => r.player_id))
  const arrivedCount = arrivedIds.size
  const notArrivedPlayers = players.filter(p => !arrivedIds.has(p.id))

  const handleToggleArrived = async (playerId, currentArrived) => {
    await markArrived({ sessionId: gameSession.id, playerId, arrived: !currentArrived })
    if (!currentArrived) await upsertRSVP({ sessionId: gameSession.id, playerId, attending: true })
    await loadData()
  }

  const handleQuickAdd = async (playerId) => {
    await upsertRSVP({ sessionId: gameSession.id, playerId, attending: true })
    await markArrived({ sessionId: gameSession.id, playerId, arrived: true })
    await loadData()
    setShowAddPlayer(false)
  }

  const handleAddGuest = async () => {
    if (!guestName.trim()) return
    setAddingGuest(true)
    try {
      const guest = await addGuestPlayer({ adminPhone: group.admin_phone, name: guestName.trim(), skill_level: guestSkill })
      if (gameSession) {
        await upsertRSVP({ sessionId: gameSession.id, playerId: guest.id, attending: true })
        await markArrived({ sessionId: gameSession.id, playerId: guest.id, arrived: true })
      }
      setGuestName('')
      setGuestSkill(3)
      setShowGuestForm(false)
      await loadData()
    } catch (e) {
      alert('שגיאה: ' + e.message)
    } finally {
      setAddingGuest(false)
    }
  }

  const handleDeletePlayer = async (playerId, name) => {
    if (!confirm(`למחוק את ${name} מהקבוצה?`)) return
    try {
      await deletePlayer(playerId)
      await loadData()
    } catch (e) {
      alert('שגיאה במחיקה: ' + e.message)
    }
  }

  const handleCreateSession = async () => {
    setCreating(true)
    try {
      const today = new Date().toISOString().split('T')[0]
      await createSession(group.id, today)
      onSessionCreated()
    } catch (e) {
      alert('שגיאה: ' + e.message)
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

      {/* Inactive players removed notice */}
      {removedPlayers.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex items-start gap-3">
          <span className="text-xl shrink-0">⚠️</span>
          <div className="flex-1">
            <p className="text-sm font-bold text-orange-800">
              {removedPlayers.length} שחקנים הוסרו אוטומטית
            </p>
            <p className="text-xs text-orange-600 mt-0.5">
              לא הגיעו פיזית ב-3 השבועות האחרונים: {removedPlayers.map(p => p.name).join(', ')}
            </p>
            <p className="text-xs text-orange-500 mt-1">יצטרכו להירשם מחדש דרך האפליקציה.</p>
          </div>
          <button onClick={() => setRemovedPlayers([])} className="text-orange-400 hover:text-orange-600 shrink-0">✕</button>
        </div>
      )}

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

      {/* Tabs */}
      {gameSession && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="flex border-b border-gray-100">
            <button onClick={() => setTab('field')}
              className={`flex-1 py-3 text-xs font-medium transition-colors ${tab === 'field' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-400'}`}>
              <MapPin className="w-3.5 h-3.5 inline ml-1" />במגרש ({arrivedCount})
            </button>
            <button onClick={() => setTab('players')}
              className={`flex-1 py-3 text-xs font-medium transition-colors ${tab === 'players' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-400'}`}>
              <Users className="w-3.5 h-3.5 inline ml-1" />קבוצה ({players.length})
            </button>
          </div>

          <div className="p-4">
            {tab === 'field' ? (
              <div className="space-y-3">
                {/* Arrived */}
                {players.filter(p => arrivedIds.has(p.id)).length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-2">הוסף שחקנים שהגיעו למגרש</p>
                ) : (
                  <div className="space-y-1">
                    {players.filter(p => arrivedIds.has(p.id)).map(p => (
                      <div key={p.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                        <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-bold">
                          {p.is_goalkeeper ? '🧤' : p.name[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{p.name}</p>
                          {p.is_guest && <span className="text-xs text-blue-500">אורח</span>}
                        </div>
                        <button onClick={() => handleToggleArrived(p.id, true)}
                          className="px-2 py-1 rounded-lg text-xs font-bold bg-green-100 text-green-700 hover:bg-red-50 hover:text-red-500 whitespace-nowrap">
                          ✓ הגיע
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add from group */}
                <button onClick={() => { setShowAddPlayer(!showAddPlayer); setShowGuestForm(false) }}
                  className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-green-300 text-green-600 py-2.5 rounded-xl text-sm font-medium hover:bg-green-50">
                  <UserPlus className="w-4 h-4" />
                  הוסף שחקן מהקבוצה
                </button>

                {showAddPlayer && (
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    {notArrivedPlayers.length === 0 ? (
                      <p className="text-gray-400 text-sm text-center py-4">כל השחקנים סומנו</p>
                    ) : notArrivedPlayers.map(p => (
                      <button key={p.id} onClick={() => handleQuickAdd(p.id)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-green-50 border-b border-gray-50 last:border-0 text-right">
                        <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-sm font-bold">
                          {p.is_goalkeeper ? '🧤' : p.name[0]}
                        </div>
                        <span className="flex-1 text-sm text-gray-800">{p.name}</span>
                        <Plus className="w-4 h-4 text-green-500" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Add guest */}
                <button onClick={() => { setShowGuestForm(!showGuestForm); setShowAddPlayer(false) }}
                  className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-blue-300 text-blue-600 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-50">
                  <Plus className="w-4 h-4" />
                  הוסף אורח (לא במערכת)
                </button>

                {showGuestForm && (
                  <div className="border border-blue-200 rounded-xl p-4 bg-blue-50 space-y-3">
                    <p className="text-sm font-medium text-blue-800">שחקן אורח</p>
                    <input
                      type="text"
                      value={guestName}
                      onChange={e => setGuestName(e.target.value)}
                      placeholder="שם השחקן"
                      className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div>
                      <p className="text-xs text-blue-700 mb-1">רמת משחק</p>
                      <div className="flex gap-1">
                        {[1,2,3,4,5].map(n => (
                          <button key={n} onClick={() => setGuestSkill(n)}
                            className={`flex-1 py-1.5 rounded-lg text-sm font-bold transition-colors ${guestSkill === n ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 border border-blue-200'}`}>
                            {n}
                          </button>
                        ))}
                      </div>
                    </div>
                    <button onClick={handleAddGuest} disabled={addingGuest || !guestName.trim()}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-2 rounded-xl text-sm">
                      {addingGuest ? 'מוסיף...' : 'הוסף אורח למגרש'}
                    </button>
                  </div>
                )}

                {arrivedCount >= 2 && (
                  <button onClick={onNavigateToTeams}
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 text-base shadow-md active:scale-95">
                    <Shuffle className="w-5 h-5" />
                    חלק לקבוצות ({arrivedCount} שחקנים)
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-1">
                {loading ? (
                  <div className="text-center py-4"><div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto" /></div>
                ) : players.map(p => (
                  <div key={p.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${p.is_goalkeeper ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                      {p.is_goalkeeper ? '🧤' : p.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{p.name}</p>
                      <p className="text-xs text-gray-400">{p.is_guest ? 'אורח' : `גיל ${p.age}`}</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-400 shrink-0">
                      <Star className="w-3 h-3 text-yellow-500" />{p.skill_level}
                    </div>
                    <button onClick={() => handleDeletePlayer(p.id, p.name)}
                      className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </button>
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
