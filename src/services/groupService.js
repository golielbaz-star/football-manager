import { supabase } from './supabase'

export async function getGroupByAdminPhone(adminPhone) {
  const { data, error } = await supabase
    .from('groups')
    .select('*')
    .eq('admin_phone', adminPhone)
    .single()
  if (error) throw error
  return data
}

export async function getGroupsByCity(city) {
  const { data, error } = await supabase
    .from('groups')
    .select('*, game_sessions(id, date, status), players(id)')
    .ilike('city', `%${city}%`)
  if (error) throw error

  const today = new Date().toISOString().split('T')[0]

  return (data || []).map(group => {
    const sessions = group.game_sessions || []
    const lastSession = sessions
      .filter(s => s.date < today)
      .sort((a, b) => b.date.localeCompare(a.date))[0] || null
    const nextSession = sessions
      .filter(s => s.date >= today && ['upcoming', 'active'].includes(s.status))
      .sort((a, b) => a.date.localeCompare(b.date))[0] || null
    const playerCount = (group.players || []).filter(p => !p.is_guest).length
    return { ...group, lastSession, nextSession, playerCount }
  })
}

export async function updateGroupRules(groupId, game_rules) {
  const { error } = await supabase
    .from('groups')
    .update({ game_rules })
    .eq('id', groupId)
  if (error) throw error
}

export async function createGroup(groupData) {
  const { data, error } = await supabase
    .from('groups')
    .insert(groupData)
    .select()
    .single()
  if (error) throw error
  return data
}
