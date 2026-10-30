import { supabase } from './supabase'

export async function getRSVPs(sessionId) {
  const { data, error } = await supabase
    .from('rsvps')
    .select('*, players(*)')
    .eq('session_id', sessionId)
  if (error) throw error
  return data || []
}

export async function upsertRSVP({ sessionId, playerId, attending }) {
  const { data, error } = await supabase
    .from('rsvps')
    .upsert(
      { session_id: sessionId, player_id: playerId, attending },
      { onConflict: 'session_id,player_id' }
    )
    .select()
    .single()
  if (error) throw error
  return data
}

export async function markArrived({ sessionId, playerId, arrived }) {
  const { data, error } = await supabase
    .from('rsvps')
    .upsert(
      { session_id: sessionId, player_id: playerId, arrived },
      { onConflict: 'session_id,player_id' }
    )
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getArrivedPlayers(sessionId) {
  const { data, error } = await supabase
    .from('rsvps')
    .select('*, players(*)')
    .eq('session_id', sessionId)
    .eq('arrived', true)
  if (error) throw error
  return (data || []).map(r => r.players).filter(Boolean)
}
