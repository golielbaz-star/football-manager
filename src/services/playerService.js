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
