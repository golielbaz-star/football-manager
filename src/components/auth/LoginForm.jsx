import { useState } from 'react'
import { Phone, Shield, ChevronLeft } from 'lucide-react'

export default function LoginForm({ onLogin, loading, error, onCreateGroup }) {
  const [phone, setPhone] = useState('')
  const [adminPhone, setAdminPhone] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!phone.trim() || !adminPhone.trim()) return
    onLogin({ phone: phone.trim(), adminPhone: adminPhone.trim() })
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

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-5 text-center">כניסה לאפליקציה</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                הטלפון שלך
              </label>
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
              <p className="text-xs text-gray-500 mt-1">קיבלת אותו מהמנהל של הקבוצה שלך</p>
            </div>

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
        </div>
      </div>
    </div>
  )
}
