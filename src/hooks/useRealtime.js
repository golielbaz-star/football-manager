import { useEffect } from 'react'
import { supabase } from '../services/supabase'

export function useRealtime(table, filter, onUpdate) {
  useEffect(() => {
    const channel = supabase
      .channel(`realtime:${table}:${JSON.stringify(filter)}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table, filter },
        (payload) => onUpdate(payload)
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [table, JSON.stringify(filter)])
}
