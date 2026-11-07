import { useEffect, useRef, useState } from 'react'
import { exById } from '../data'
export default function Train({ user, routines, commit, go }) {
  const [r, setR] = useState(null); const [idx, setIdx] = useState(0); const [sets, setSets] = useState([])
  const [w, setW] = useState(''); const [reps, setReps] = useState(''); const [left, setLeft] = useState(0)
  const wid = useRef(null); const t0 = useRef(null)
  useEffect(() => { if (left <= 0) return; const t = setTimeout(() => setLeft(left - 1), 1000); return () => clearTimeout(t) }, [left])
  const persist = (arr, done) => {
    if (!wid.current) wid.current = crypto.randomUUID()
    if (!t0.current) t0.current = new Date().toISOString()
    const row = { id: wid.current, user_id: user.id, routine_name: r.name, started_at: t0.current, finished_at: done ? new Date().toISOString() : null, sets: arr }
    commit(d => ({ workouts: [row, ...d.workouts.filter(x => x.id !== row.id)] }), [{ op: 'upsert', table: 'workouts', row }])
  }
  if (!r) return (
    <div><h2>Entrenar</h2>
      {routines.length === 0 && <p className="muted">Primero crea una rutina en la sección Rutinas.</p>}
      {routines.map(x => <div className="card row" key={x.id}><b className="grow">{x.name}</b><button className="btn" onClick={() => { wid.current = null; t0.current = null; setSets([]); setIdx(0); setR(x) }}>Empezar</button></div>)}
    </div>)
  const it = r.items[idx]; const ex = exById[it.id]
  const done = sets.filter(s => s.ex === it.id)
  const log = async () => {
    if (!w || !reps) return
    const arr = [...sets, { ex: it.id, n: done.length + 1, weight: +w, reps: +reps }]
    setSets(arr); setReps(''); setLeft(it.rest); await persist(arr, false)
  }
  const next = async () => {
    if (idx + 1 < r.items.length) { setIdx(idx + 1); setLeft(0); setW(''); setReps('') }
    else { await persist(sets, true); setR(null); go('history') }
  }
  return (
    <div className="card">
      <p className="muted">{r.name} · ejercicio {idx + 1} de {r.items.length}</p>
      <h2>{ex.name}</h2>
      <p>{it.sets} series × {it.reps} reps · descanso {it.rest}s</p>
      <details><summary>Ver técnica</summary><p>{ex.tech}</p><p className="muted">{ex.safety}</p></details>
      <p><b>Series completadas: {done.length}/{it.sets}</b></p>
      {done.map(s => <p key={s.n} className="muted">Serie {s.n}: {s.weight} kg × {s.reps}</p>)}
      {left > 0 && <p className="timer">Descanso: {left}s <button className="link" onClick={() => setLeft(0)}>Omitir</button></p>}
      <div className="row">
        <label>Peso (kg)<input type="number" step="0.5" value={w} onChange={e => setW(e.target.value)} /></label>
        <label>Reps<input type="number" value={reps} onChange={e => setReps(e.target.value)} /></label>
        <button className="btn" onClick={log}>Registrar serie</button>
      </div>
      <div className="row"><button className="btn alt" onClick={next}>{idx + 1 < r.items.length ? 'Siguiente ejercicio' : 'Finalizar entrenamiento'}</button>
        <button className="link" onClick={async () => { if (sets.length) await persist(sets, true); setR(null) }}>Terminar ahora</button></div>
    </div>
  )
}
