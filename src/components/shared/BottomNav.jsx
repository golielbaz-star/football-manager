import { Home, Calendar, Shuffle, LogOut, Shield, BookOpen } from 'lucide-react'

const tabs = [
  { id: 'home', label: 'בית', icon: Home },
  { id: 'rsvp', label: 'משחק', icon: Calendar },
  { id: 'teams', label: 'קבוצות', icon: Shuffle },
  { id: 'rules', label: 'חוקים', icon: BookOpen },
]

export default function BottomNav({ active, onNavigate, onLogout, isAdmin }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-bottom z-50">
      <div className="flex items-center justify-around px-2 pt-2 pb-safe">
        {tabs.map(tab => {
          const Icon = tab.icon
          const isActive = active === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors ${
                isActive ? 'text-green-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-2' : ''}`} />
              <span className="text-xs font-medium">{tab.label}</span>
              {isActive && <div className="w-1 h-1 rounded-full bg-green-600 mt-0.5" />}
            </button>
          )
        })}
        {isAdmin && (
          <button
            onClick={() => onNavigate('admin')}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors ${
              active === 'admin' ? 'text-green-600' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Shield className="w-5 h-5" />
            <span className="text-xs font-medium">ניהול</span>
            {active === 'admin' && <div className="w-1 h-1 rounded-full bg-green-600 mt-0.5" />}
          </button>
        )}
        <button
          onClick={onLogout}
          className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-gray-400 hover:text-red-500 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-xs font-medium">יציאה</span>
        </button>
      </div>
    </div>
  )
}
