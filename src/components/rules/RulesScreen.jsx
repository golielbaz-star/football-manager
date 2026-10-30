import { useState } from 'react'
import { BookOpen, Edit2, Check, X, Plus, Trash2 } from 'lucide-react'
import { updateGroupRules } from '../../services/groupService'

export default function RulesScreen({ group, isAdmin, onGroupUpdated }) {
  const rules = parseRules(group.game_rules || '')
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(rules)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const text = draft.filter(r => r.trim()).join('\n')
      await updateGroupRules(group.id, text)
      onGroupUpdated({ ...group, game_rules: text })
      setEditing(false)
    } catch (e) {
      alert('שגיאה בשמירה')
    } finally {
      setSaving(false)
    }
  }

  const addRule = () => setDraft(d => [...d, ''])
  const updateRule = (i, val) => setDraft(d => d.map((r, idx) => idx === i ? val : r))
  const removeRule = (i) => setDraft(d => d.filter((_, idx) => idx !== i))

  return (
    <div className="px-4 pt-4 pb-24 space-y-4">

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-green-700 to-green-900 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <BookOpen className="w-5 h-5" />
            <h2 className="font-bold text-lg">חוקי המשחק</h2>
          </div>
          {isAdmin && !editing && (
            <button
              onClick={() => { setDraft(rules.length ? rules : ['']); setEditing(true) }}
              className="flex items-center gap-1 bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-3 py-1.5 rounded-lg text-sm transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
              ערוך
            </button>
          )}
          {isAdmin && editing && (
            <div className="flex gap-2">
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-1 bg-white text-green-700 px-3 py-1.5 rounded-lg text-sm font-bold">
                <Check className="w-3.5 h-3.5" />
                {saving ? 'שומר...' : 'שמור'}
              </button>
              <button onClick={() => setEditing(false)}
                className="bg-white bg-opacity-20 text-white p-1.5 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        <div className="p-5">
          {editing ? (
            <div className="space-y-2">
              {draft.map((rule, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <span className="w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <input
                    type="text"
                    value={rule}
                    onChange={e => updateRule(i, e.target.value)}
                    placeholder={`חוק מספר ${i + 1}...`}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <button onClick={() => removeRule(i)} className="text-red-400 hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={addRule}
                className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-green-300 text-green-600 py-2.5 rounded-xl text-sm font-medium hover:bg-green-50 transition-colors mt-2"
              >
                <Plus className="w-4 h-4" />
                הוסף חוק
              </button>
            </div>
          ) : rules.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-4xl mb-3">📋</p>
              <p className="text-gray-500 text-sm">
                {isAdmin ? 'לחץ "ערוך" כדי להוסיף חוקי משחק' : 'המנהל עדיין לא הוסיף חוקים'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {rules.map((rule, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <span className="w-7 h-7 rounded-full bg-green-600 text-white text-sm font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-gray-800 text-sm leading-relaxed pt-1">{rule}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Group info */}
      <div className="bg-white rounded-2xl shadow-sm p-4 text-sm text-gray-500 space-y-1">
        <p>📍 {group.location_name}, {group.city}</p>
        <p>📅 יום {group.game_day} בשעה {group.game_time}</p>
        <p>👤 מנהל: {group.admin_name}</p>
      </div>
    </div>
  )
}

function parseRules(text) {
  if (!text) return []
  return text.split('\n').filter(r => r.trim())
}
