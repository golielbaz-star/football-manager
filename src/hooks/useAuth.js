import { useState, useEffect, useCallback } from 'react'
import { loginOrRegister, registerPlayer } from '../services/authService'
import { getGroupByAdminPhone } from '../services/groupService'

const SESSION_KEY = 'football_session'

export function useAuth() {
  const [session, setSession] = useState(() => {
    try {
      const saved = localStorage.getItem(SESSION_KEY)
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const login = useCallback(async ({ phone, adminPhone }) => {
    setLoading(true)
    setError(null)
    try {
      const result = await loginOrRegister({ phone, adminPhone })
      if (!result.isNew) {
        const sess = { player: result.player, group: result.group, isAdmin: phone === adminPhone }
        localStorage.setItem(SESSION_KEY, JSON.stringify(sess))
        setSession(sess)
      }
      return result
    } catch (e) {
      setError(e.message)
      throw e
    } finally {
      setLoading(false)
    }
  }, [])

  const completeOnboarding = useCallback(async (playerData) => {
    setLoading(true)
    try {
      const player = await registerPlayer(playerData)
      const group = await getGroupByAdminPhone(playerData.adminPhone)
      const sess = { player, group, isAdmin: playerData.phone === playerData.adminPhone }
      localStorage.setItem(SESSION_KEY, JSON.stringify(sess))
      setSession(sess)
    } catch (e) {
      setError(e.message)
      throw e
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY)
    setSession(null)
  }, [])

  return { session, loading, error, login, completeOnboarding, logout }
}
