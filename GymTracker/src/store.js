import { supabase } from './supabase'
const K = (u, n) => `gt:${u}:${n}`
const read = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d } catch { return d } }
const write = (k, v) => localStorage.setItem(k, JSON.stringify(v))
export const getCache = u => read(K(u, 'data'), null)
export const setCache = (u, d) => write(K(u, 'data'), d)
export const pendingCount = u => read(K(u, 'q'), []).length

// Cola de cambios pendientes: se unifican las escrituras repetidas de la misma fila.
export function enqueue(u, ops) {
  let q = read(K(u, 'q'), [])
  for (const n of ops) {
    if (n.op === 'upsert' && n.row.id) q = q.filter(o => !(o.op === 'upsert' && o.table === n.table && o.row.id === n.row.id))
    q.push(n)
  }
  write(K(u, 'q'), q)
}

let busy = false
export async function flush(u) {
  if (busy || !navigator.onLine) return pendingCount(u)
  busy = true
  try {
    let q
    while ((q = read(K(u, 'q'), [])).length) {
      const o = q[0], t = supabase.from(o.table)
      const { error } = o.op === 'upsert' ? await t.upsert(o.row, o.conflict ? { onConflict: o.conflict } : undefined) : await t.delete().match(o.match)
      if (error && /fetch|network/i.test(error.message)) break // sin conexión: se reintenta luego
      if (error) console.error('Cambio rechazado por el servidor:', error.message, o)
      write(K(u, 'q'), read(K(u, 'q'), []).slice(1))
    }
  } catch (e) { console.error(e) }
  busy = false
  return pendingCount(u)
}

export async function loadAll(u) {
  await flush(u)
  if (navigator.onLine && pendingCount(u) === 0) {
    try {
      const [p, e, r, w] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', u).maybeSingle(),
        supabase.from('user_equipment').select('equipment_id').eq('user_id', u),
        supabase.from('routines').select('*').eq('user_id', u).order('created_at', { ascending: false }),
        supabase.from('workouts').select('*').eq('user_id', u).order('started_at', { ascending: false }),
      ])
      if (!(p.error || e.error || r.error || w.error)) {
        const d = { profile: p.data, equip: (e.data || []).map(x => x.equipment_id), routines: r.data || [], workouts: w.data || [] }
        setCache(u, d); return d
      }
    } catch {}
  }
  return getCache(u)
}
