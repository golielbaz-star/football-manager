import { useState } from 'react'
import { Phone, Shield, ChevronLeft, Search, MapPin, Users } from 'lucide-react'
import { getGroupsByCity } from '../../services/groupService'

export default function LoginForm({ onLogin, loading, error, onCreateGroup }) {
  const [phone, setPhone] = useState('')
  const [adminPhone, setAdminPhone] = useState('')
  const [mode, setMode] = useState('login') // 'login' | 'search'
  const [cityQuery, setCityQuery] = useState('')
  const [groups, setGroups] = useState([])
  const [searching, setSearching] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!phone.trim() || !adminPhone.trim()) return
    onLogin({ phone: phone.trim(), adminPhone: adminPhone.trim() })
  }

  const handleSearch = async () => {
    if (!cityQuery.trim()) return
    setSearching(true)
    setSearched(false)
    try {
      const result = await getGroupsByCity(cityQuery.trim())
      setGroups(result)
      setSearched(true)
    } finally {
      setSearching(false)
    }
  }

  const handleSelectGroup = (group) => {
    setAdminPhone(group.admin_phone)
    setMode('login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-700 to-green-900 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">⚽</div>
          <h1 className="text-3xl font-bold text-white">כדורגל שכונתי</h1>
          <p className="text-green-200 mt-1">ניהול חכם של המשחק שלכם</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${mode === 'login' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-400'}`}
            >
              כניסה
            </button>
            <button
              onClick={() => setMode('search')}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${mode === 'search' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-400'}`}
            >
              <Search className="w-3.5 h-3.5 inline ml-1" />
              חפש קבוצה בעיר
            </button>
          </div>

          <div className="p-6">
            {mode === 'login' ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">הטלפון שלך</label>
                  <div className="relative">
                    <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="05X-XXXXXXX"
                      className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-right"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    טלפון המנהל / הארגנייזר
                  </label>
                  <div className="relative">
                    <Shield className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      value={adminPhone}
                      onChange={e => setAdminPhone(e.target.value)}
                      placeholder="05X-XXXXXXX"
                      className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-right"
                      dir="ltr"
                    />
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-gray-500">קיבלת אותו מהמנהל של הקבוצה שלך</p>
                    <button
                      type="button"
                      onClick={() => setMode('search')}
                      className="text-xs text-green-600 font-medium hover:underline"
                    >
                      חפש לפי עיר
                    </button>
                  </div>
                </div>

                {adminPhone && (
                  <div className="bg-green-50 border border-green-200 rounded-xl px-3 py-2 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-green-600 shrink-0" />
                    <span className="text-sm text-green-700 font-medium">{adminPhone}</span>
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !phone || !adminPhone}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>כניסה</span>
                      <ChevronLeft className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="border-t border-gray-100 pt-4">
                  <button
                    type="button"
                    onClick={onCreateGroup}
                    className="w-full bg-gray-50 hover:bg-green-50 border border-gray-200 hover:border-green-400 text-gray-600 hover:text-green-700 font-medium py-3 rounded-xl transition-colors text-sm"
                  >
                    🏟️ אין לך קבוצה? פתח קבוצה חדשה
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={cityQuery}
                      onChange={e => setCityQuery(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSearch()}
                      placeholder="שם עיר..."
                      className="w-full pr-10 pl-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-right"
                    />
                  </div>
                  <button
                    onClick={handleSearch}
                    disabled={searching || !cityQuery.trim()}
                    className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-3 rounded-xl font-medium text-sm"
                  >
                    {searching ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      'חפש'
                    )}
                  </button>
                </div>

                {searched && groups.length === 0 && (
                  <div className="text-center py-6 text-gray-400">
                    <p className="text-3xl mb-2">🔍</p>
                    <p className="text-sm">לא נמצאו קבוצות בעיר זו</p>
                  </div>
                )}

                {groups.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-500 font-medium">נמצאו {groups.length} קבוצות:</p>
                    {groups.map(group => (
                      <button
                        key={group.id}
                        onClick={() => handleSelectGroup(group)}
                        className="w-full bg-gray-50 hover:bg-green-50 border border-gray-200 hover:border-green-400 rounded-xl p-3 text-right transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-lg shrink-0">
                            ⚽
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-gray-800 text-sm">{group.admin_name}</p>
                            <p className="text-xs text-gray-500">
                              <MapPin className="w-3 h-3 inline ml-0.5" />
                              {group.location_name}, {group.city}
                            </p>
                            <p className="text-xs text-gray-400">
                              יום {group.game_day} · {group.game_time}
                            </p>
                          </div>
                          <div className="text-xs text-green-600 font-medium shrink-0">
                            הצטרף
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="w-full text-gray-500 text-sm py-2 hover:text-gray-700"
                >
                  חזרה לכניסה
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
