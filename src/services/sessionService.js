import { supabase } from './supabase'

export async function getUpcomingSession(groupId) {
  const { data, error } = await supabase
    .from('game_sessions')
    .select('*')
    .eq('group_id', groupId)
    .in('status', ['upcoming', 'active'])
    .order('date', { ascending: true })
    .limit(1)
    .single()
  if (error) return null
  return data
}

export async function createSession(groupId, date) {
  const { data, error } = await supabase
    .from('game_sessions')
    .insert({ group_id: groupId, date, status: 'upcoming' })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateSessionStatus(sessionId, status) {
  const { error } = await supabase
    .from('game_sessions')
    .update({ status })
    .eq('id', sessionId)
  if (error) throw error
}
