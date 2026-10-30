import { supabase } from './supabase'

export async function loginOrRegister({ phone, adminPhone }) {
  // Find the group by admin phone
  const { data: group, error: groupErr } = await supabase
    .from('groups')
    .select('*')
    .eq('admin_phone', adminPhone)
    .single()

  if (groupErr || !group) {
    throw new Error('לא נמצאה קבוצה עם מספר המנהל הזה')
  }

  // Check if player exists
  const { data: player } = await supabase
    .from('players')
    .select('*')
    .eq('phone', phone)
    .eq('admin_phone', adminPhone)
    .single()

  return { group, player, isNew: !player }
}

export async function registerPlayer({ phone, adminPhone, name, age, fitness_level, skill_level, is_goalkeeper }) {
  const { data, error } = await supabase
    .from('players')
    .insert({ phone, admin_phone: adminPhone, name, age, fitness_level, skill_level, is_goalkeeper })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function isAdmin(phone) {
  const { data } = await supabase
    .from('groups')
    .select('id')
    .eq('admin_phone', phone)
    .single()
  return !!data
}
