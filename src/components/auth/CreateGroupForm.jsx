import { useState } from 'react'
import { Phone, User, MapPin, Calendar, Clock, Users, ChevronLeft } from 'lucide-react'

const DAYS = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת']

export default function CreateGroupForm({ onBack, onCreate, loading, error }) {
  const [adminPhone, setAdminPhone] = useState('')
  const [adminName, setAdminName] = useState('')
  const [city, setCity] = useState('')
  const [locationName, setLocationName] = useState('')
  const [gameDay, setGameDay] = useState('חמישי')
  const [gameTime, setGameTime] = useState('19:00')
  const [playersPerTeam, setPlayersPerTeam] = useState(5)
  const [maxTeams, setMaxTeams] = useState(2)

  const handleSubmit = (e) => {
    e.preventDefault()
    onCreate({
      admin_phone: adminPhone,
      admin_name: adminName,
      city: city,
      location_name: locationName,
      game_day: gameDay,
      game_time: gameTime,
      players_per_team: playersPerTeam,
      max_teams: maxTeams,
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-700 to-green-900 flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">

        <div className="text-center mb-6">
          <div className="text-5xl mb-2">🏟️</div>
          <h1 className="text-2xl font-bold text-white">פתיחת קבוצה חדשה</h1>
          <p className="text-green-200 text-sm mt-1">מלא פרטים ותהיה מנהל הקבוצה</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                הטלפון שלך (קוד הצטרפות לקבוצה)
              </label>
              <div className="relative">
                <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  value={adminPhone}
                  onChange={e => setAdminPhone(e.target.value)}
                  placeholder="05X-XXXXXXX"
                  required
                  className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  dir="ltr"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">השחקנים יזינו מספר זה כדי להצטרף</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">שמך</label>
              <div className="relative">
                <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={adminName}
                  onChange={e => setAdminName(e.target.value)}
                  placeholder="שם מלא"
                  required
                  className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">עיר</label>
              <div className="relative">
                <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  placeholder="תל אביב"
                  required
                  className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">שם המגרש</label>
              <div className="relative">
                <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={locationName}
                  onChange={e => setLocationName(e.target.value)}
                  placeholder="מגרש השכונה"
                  required
                  className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">יום משחק</label>
              <div className="relative">
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  value={gameDay}
                  onChange={e => setGameDay(e.target.value)}
                  className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                >
                  {DAYS.map(d => (
                    <option key={d} value={d}>יום {d}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">שעת משחק</label>
              <div className="relative">
                <Clock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="time"
                  value={gameTime}
                  onChange={e => setGameTime(e.target.value)}
                  required
                  className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">שחקנים לצד</label>
                <select
                  value={playersPerTeam}
                  onChange={e => setPlayersPerTeam(parseInt(e.target.value))}
                  className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                >
                  {[4, 5, 6, 7, 8].map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">מס' קבוצות</label>
                <select
                  value={maxTeams}
                  onChange={e => setMaxTeams(parseInt(e.target.value))}
                  className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                >
                  {[2, 3, 4].map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>פתח קבוצה</span>
                  <ChevronLeft className="w-4 h-4" />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onBack}
              className="w-full text-gray-500 text-sm py-2 hover:text-gray-700 transition-colors"
            >
              חזור לכניסה
            </button>

          </form>
        </div>
      </div>
    </div>
  )
}
