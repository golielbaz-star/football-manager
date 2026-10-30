import { useState, useEffect, useCallback } from 'react'
import { getUpcomingSession } from '../services/sessionService'
import { getRSVPs, upsertRSVP, markArrived } from '../services/rsvpService'

export function useGameSession(group, playerId) {
  const [session, setSession] = useState(null)
  const [rsvps, setRsvps] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!group?.id) return
    setLoading(true)
    try {
      const s = await getUpcomingSession(group.id)
      setSession(s)
      if (s) {
        const r = await getRSVPs(s.id)
        setRsvps(r)
      }
    } finally {
      setLoading(false)
    }
  }, [group?.id])

  useEffect(() => { refresh() }, [refresh])

  const myRsvp = rsvps.find(r => r.player_id === playerId)

  const submitRSVP = useCallback(async (attending) => {
    if (!session || !playerId) return
    await upsertRSVP({ sessionId: session.id, playerId, attending })
    await refresh()
  }, [session, playerId, refresh])

  const toggleArrived = useCallback(async (targetPlayerId, arrived) => {
    if (!session) return
    await markArrived({ sessionId: session.id, playerId: targetPlayerId, arrived })
    await refresh()
  }, [session, refresh])

  return { session, rsvps, myRsvp, loading, refresh, submitRSVP, toggleArrived }
}
