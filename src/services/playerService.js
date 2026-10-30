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
