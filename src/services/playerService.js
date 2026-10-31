import { supabase } from './supabase'

export async function getPlayersByGroup(adminPhone) {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('admin_phone', adminPhone)
    .order('name')
  if (error) throw error
  return data || []
}

export async function addGuestPlayer({ adminPhone, name, skill_level = 3, fitness_level = 3, is_goalkeeper = false }) {
  const tempPhone = 'guest_' + Date.now()
  const { data, error } = await supabase
    .from('players')
    .insert({
      phone: tempPhone,
      admin_phone: adminPhone,
      name,
      age: 25,
      skill_level,
      fitness_level,
      is_goalkeeper,
      is_guest: true,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deletePlayer(playerId) {
  // First delete related RSVPs
  await supabase.from('rsvps').delete().eq('player_id', playerId)
  const { error } = await supabase.from('players').delete().eq('id', playerId)
  if (error) throw error
}

// Remove players who haven't physically arrived in the last 21 days.
// Only runs if there were sessions in that period (can't penalize for no games).
// Never removes the admin player.
export async function removeInactivePlayers({ adminPhone, groupId }) {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - 21)
  const cutoffDate = cutoff.toISOString().split('T')[0]

  // Were there any sessions in the last 21 days?
  const { data: recentSessions } = await supabase
    .from('game_sessions')
    .select('id')
    .eq('group_id', groupId)
    .gte('date', cutoffDate)

  const recentSessionIds = (recentSessions || []).map(s => s.id)
  if (recentSessionIds.length === 0) return [] // no sessions → nothing to do

  // Who actually showed up in those sessions?
  const { data: arrivals } = await supabase
    .from('rsvps')
    .select('player_id')
    .in('session_id', recentSessionIds)
    .eq('arrived', true)

  const activeIds = new Set((arrivals || []).map(r => r.player_id))

  // All registered (non-guest) players except the admin
  const { data: allPlayers } = await supabase
    .from('players')
    .select('id, name')
    .eq('admin_phone', adminPhone)
    .neq('phone', adminPhone)
    .eq('is_guest', false)

  const inactive = (allPlayers || []).filter(p => !activeIds.has(p.id))

  for (const player of inactive) {
    await supabase.from('rsvps').delete().eq('player_id', player.id)
    await supabase.from('players').delete().eq('id', player.id)
  }

  return inactive // returns list of removed players for display
}
