import { useMemo, useState } from 'react'
import { exById } from '../data'
export default function History({ workouts }) {
  const used = useMemo(() => [...new Set(workouts.flatMap(w => w.sets.map(s => s.ex)))], [workouts])
  const [sel, setSel] = useState('')
  const exId = sel || used[0]
  const pts = workouts.slice().reverse().map(w => ({ d: new Date(w.started_at), m: Math.max(0, ...w.sets.filter(s => s.ex === exId).map(s => s.weight)) })).filter(p => p.m > 0)
  const weeks = [...Array(8)].map((_, i) => { const end = Date.now() - i * 6048e5; return workouts.filter(w => { const t = +new Date(w.started_at); return t <= end && t > end - 6048e5 }).length }).reverse()
  const W = 320, H = 140, max = Math.max(1, ...pts.map(p => p.m)), mw = Math.max(1, ...weeks)
  const xy = (p, i) => `${pts.length > 1 ? 10 + i * (W - 20) / (pts.length - 1) : W / 2},${H - 10 - (p.m / max) * (H - 30)}`
  return (
    <div>
      <h2>Historial y progreso</h2>
      {workouts.length === 0 && <p className="muted">Aún no hay sesiones. Tu progreso aparecerá aquí al terminar un entrenamiento.</p>}
      {used.length > 0 && <div className="card">
        <label>Evolución de carga máxima
          <select value={exId} onChange={e => setSel(e.target.value)}>{used.map(i => <option key={i} value={i}>{exById[i]?.name}</option>)}</select></label>
        <svg viewBox={`0 0 ${W} ${H}`} className="chart"><polyline fill="none" stroke="var(--accent)" strokeWidth="2.5" points={pts.map(xy).join(' ')} />
          {pts.map((p, i) => <circle key={i} r="4" fill="var(--accent)" cx={xy(p, i).split(',')[0]} cy={xy(p, i).split(',')[1]} />)}</svg>
        <p className="muted">Máximo: {max} kg · {pts.length} sesiones con este ejercicio</p>
      </div>}
      <div className="card"><b>Frecuencia: sesiones por semana (últimas 8)</b>
        <svg viewBox={`0 0 ${W} 90`} className="chart">{weeks.map((n, i) => <rect key={i} x={10 + i * 38} y={80 - (n / mw) * 60} width="28" height={(n / mw) * 60} fill="var(--accent2)" rx="3" />)}</svg>
        <p className="muted">{weeks.join(' · ')}</p></div>
      {workouts.map(w => (
        <div className="card" key={w.id}><b>{w.routine_name}</b> <span className="muted">{new Date(w.started_at).toLocaleDateString('es')}</span>
          {Object.entries(w.sets.reduce((a, s) => ((a[s.ex] = a[s.ex] || []).push(s), a), {})).map(([k, v]) =>
            <p key={k} className="muted">{exById[k]?.name}: {v.map(s => `${s.weight}kg×${s.reps}`).join(', ')}</p>)}
        </div>))}
    </div>
  )
}
