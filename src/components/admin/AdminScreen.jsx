import { useState, useEffect } from 'react'
import { Users, Plus, Calendar, Star, Zap, Trash2, Edit2, Check, X } from 'lucide-react'
import { getPlayersByGroup } from '../../services/playerService'
import { createSession, updateSessionDate, deleteSession } from '../../services/sessionService'

export default function AdminScreen({ group, gameSession, onSessionCreated }) {
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [editingDate, setEditingDate] = useState(false)
  const [newDate, setNewDate] = useState('')
  const [savingDate, setSavingDate] = useState(false)

  useEffect(() => {
    if (!group?.admin_phone) return
    getPlayersByGroup(group.admin_phone).then(p => {
      setPlayers(p)
      setLoading(false)
    })
  }, [group?.admin_phone])

  const handleCreateSession = async () => {
    setCreating(true)
    try {
      const today = new Date().toISOString().split('T')[0]
      const session = await createSession(group.id, today)
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
                      })}
                    </p>
                  )}
                </div>
                <span className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  מתוכנן
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setNewDate(gameSession.date)
                  setEditingDate(true)
                }}
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
            <p className="text-sm text-gray-500 mb-3">אין משחק פתוח — פתח משחק כדי שהשחקנים יוכלו לאשר הגעה</p>
            <button
              onClick={handleCreateSession}
              disabled={creating}
              className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              {creating ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              פתח משחק
            </button>
          </div>
        )}
      </div>

      {/* Players List */}
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <Users className="w-4 h-4 text-green-600" />
            שחקני הקבוצה
          </h3>
          <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">
            {players.length} שחקנים
          </span>
        </div>

        {loading ? (
          <div className="text-center py-4">
            <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : players.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-4">אין שחקנים רשומים עדיין</p>
        ) : (
          <div className="space-y-2">
            {players.map(player => (
              <PlayerRow key={player.id} player={player} />
            ))}
          </div>
        )}
      </div>

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

function PlayerRow({ player }) {
  return (
    <div className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${
        player.is_goalkeeper ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
      }`}>
        {player.is_goalkeeper ? '🧤' : player.name[0]}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-800">{player.name}</p>
        <p className="text-xs text-gray-400">גיל {player.age} · {player.phone}</p>
      </div>
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <span className="flex items-center gap-0.5">
          <Star className="w-3 h-3 text-yellow-500" />{player.skill_level}
        </span>
        <span className="flex items-center gap-0.5">
          <Zap className="w-3 h-3 text-blue-500" />{player.fitness_level}
        </span>
      </div>
    </div>
  )
}
