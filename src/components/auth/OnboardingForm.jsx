import { useState } from 'react'
import { User, Calendar, Zap, Star, Shield } from 'lucide-react'

export default function OnboardingForm({ phone, adminPhone, onComplete, loading }) {
  const [form, setForm] = useState({
    name: '',
    age: '',
    fitness_level: 3,
    skill_level: 3,
    is_goalkeeper: false,
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = (e) => {
    e.preventDefault()
    onComplete({
      phone,
      adminPhone,
      name: form.name,
      age: parseInt(form.age),
      fitness_level: form.fitness_level,
      skill_level: form.skill_level,
      is_goalkeeper: form.is_goalkeeper,
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-700 to-green-900 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="text-5xl mb-2">👤</div>
          <h1 className="text-2xl font-bold text-white">פרופיל שחקן</h1>
          <p className="text-green-200 text-sm mt-1">כניסה ראשונה – מלא פרטים קצרים</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">שם מלא</label>
              <div className="relative">
                <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                  placeholder="ישראל ישראלי"
                  required
                  className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">גיל</label>
              <div className="relative">
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  value={form.age}
                  onChange={e => set('age', e.target.value)}
                  placeholder="25"
                  min="10" max="70"
                  required
                  className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  dir="ltr"
                />
              </div>
            </div>

            <RatingInput
              label="רמת כושר"
              icon={<Zap className="w-4 h-4" />}
              value={form.fitness_level}
              onChange={v => set('fitness_level', v)}
            />

            <RatingInput
              label="רמת משחק"
              icon={<Star className="w-4 h-4" />}
              value={form.skill_level}
              onChange={v => set('skill_level', v)}
            />

            <div
              onClick={() => set('is_goalkeeper', !form.is_goalkeeper)}
              className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${
                form.is_goalkeeper
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <Shield className={`w-5 h-5 ${form.is_goalkeeper ? 'text-green-600' : 'text-gray-400'}`} />
              <div>
                <p className="font-medium text-gray-800 text-sm">אני שוער</p>
                <p className="text-xs text-gray-500">אני מוכן לשחק בשער</p>
              </div>
              <div className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                form.is_goalkeeper ? 'border-green-500 bg-green-500' : 'border-gray-300'
              }`}>
                {form.is_goalkeeper && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !form.name || !form.age}
              className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors"
            >
              {loading ? 'שומר...' : 'הצטרף לקבוצה'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

function RatingInput({ label, icon, value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
        {icon} {label}
      </label>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map(n => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${
              value === n
                ? 'bg-green-600 text-white'
                : value > n
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  )
}
