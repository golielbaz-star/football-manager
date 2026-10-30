import { useState } from 'react'
import { MapPin, Calendar, Clock, Users, Search, Phone, Trophy } from 'lucide-react'
import { getGroupsByCity } from '../../services/groupService'

const DAY_HEBREW = { 'ראשון': 0, 'שני': 1, 'שלישי': 2, 'רביעי': 3, 'חמישי': 4, 'שישי': 5, 'שבת': 6 }

function daysUntilGame(gameDay) {
  const today = new Date().getDay() // 0=Sun
  const target = DAY_HEBREW[gameDay] ?? 0
  const diff = (target - today + 7) % 7
  return diff === 0 ? 7 : diff
}

export default function HomeScreen({ session, upcomingSession, rsvps, onNavigate }) {
  const { group, player } = session
  const attending = rsvps.filter(r => r.attending).length
  const daysLeft = daysUntilGame(group.game_day)

  return (
    <div className="px-4 pt-4 pb-24 space-y-4">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-green-600 to-green-800 rounded-2xl p-5 text-white">
        <p className="text-green-200 text-sm">שלום,</p>
        <h2 className="text-2xl font-bold">{player.name} 👋</h2>
        <div className="mt-3 flex items-center gap-2 text-green-100 text-sm">
          <MapPin className="w-4 h-4" />
          <span>{group.location_name}, {group.city}</span>
        </div>
      </div>

      {/* Next Game */}
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800 text-lg">המשחק הקרוב</h3>
          <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">
            בעוד {daysLeft} ימים
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="w-4 h-4 text-green-600" />
            <span className="text-sm">יום {group.game_day}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="w-4 h-4 text-green-600" />
            <span className="text-sm">{group.game_time}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Users className="w-4 h-4 text-green-600" />
            <span className="text-sm">{attending} מגיעים</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Trophy className="w-4 h-4 text-green-600" />
            <span className="text-sm">{group.players_per_team} לכל צד</span>
          </div>
        </div>

        <button
          onClick={() => onNavigate('rsvp')}
          className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-colors"
        >
          אישור הגעה
        </button>
      </div>

      {/* City Search */}
      <CitySearch defaultCity={group.city} />
    </div>
  )
}

function CitySearch({ defaultCity }) {
  const [city, setCity] = useState(defaultCity || '')
  const [groups, setGroups] = useState([])
  const [searched, setSearched] = useState(false)
  const [loading, setLoading] = useState(false)

  const search = async () => {
    if (!city.trim()) return
    setLoading(true)
    try {
      const data = await getGroupsByCity(city)
      setGroups(data)
      setSearched(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5">
      <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
        <Search className="w-4 h-4 text-green-600" />
        קבוצות בעיר שלי
      </h3>
      <div className="flex gap-2">
        <input
          type="text"
          value={city}
          onChange={e => setCity(e.target.value)}
          placeholder="שם עיר..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
          onKeyDown={e => e.key === 'Enter' && search()}
        />
        <button
          onClick={search}
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
        >
          {loading ? '...' : 'חפש'}
        </button>
      </div>

      {searched && (
        <div className="mt-3 space-y-2">
          {groups.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-2">לא נמצאו קבוצות בעיר זו</p>
          ) : (
            groups.map(g => (
              <div key={g.id} className="border border-gray-100 rounded-xl p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-800 text-sm">{g.admin_name}</p>
                    <p className="text-xs text-gray-500">{g.location_name} · {g.game_day} {g.game_time}</p>
                  </div>
                  <a
                    href={`tel:${g.admin_phone}`}
                    className="flex items-center gap-1 bg-green-50 text-green-700 px-3 py-1.5 rounded-lg text-xs font-medium"
                  >
                    <Phone className="w-3 h-3" />
                    צור קשר
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
