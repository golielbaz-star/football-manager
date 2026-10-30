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
    .select('*')
    .ilike('city', `%${city}%`)
  if (error) throw error
  return data || []
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
