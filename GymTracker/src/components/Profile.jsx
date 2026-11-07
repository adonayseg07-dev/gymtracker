import { useState } from 'react'
import { LEVELS, TIMES, GOALS, GROUPS } from '../data'
export default function Profile({ user, profile, commit, onSaved, first }) {
  const [f, setF] = useState(profile || { name: '', age: '', weight: '', height: '', level: LEVELS[0], time_training: TIMES[0], goal: GOALS[0], days: 3, minutes: 60, priorities: [], limits: '' })
  const [msg, setMsg] = useState(''); const [busy, setBusy] = useState(false)
  const set = (k, v) => setF({ ...f, [k]: v })
  const toggle = g => set('priorities', f.priorities.includes(g) ? f.priorities.filter(x => x !== g) : [...f.priorities, g])
  const save = e => {
    e.preventDefault()
    const row = { ...f, id: user.id, age: +f.age, weight: +f.weight, height: +f.height, days: +f.days, minutes: +f.minutes, updated_at: new Date().toISOString() }
    commit({ profile: row }, [{ op: 'upsert', table: 'profiles', row, conflict: 'id' }])
    if (onSaved) onSaved()
  }
  const Sel = ({ k, opts }) => <select value={f[k]} onChange={e => set(k, e.target.value)}>{opts.map(o => <option key={o}>{o}</option>)}</select>
  return (
    <div className={first ? 'center' : ''}>
      <form className="card form" onSubmit={save}>
        <h2>{first ? 'Cuéntanos sobre ti' : 'Tu perfil'}</h2>
        {first && <p className="muted">Con estos datos prepararemos tus rutinas. Podrás cambiarlos cuando quieras.</p>}
        <div className="grid">
          <label>Nombre<input required value={f.name} onChange={e => set('name', e.target.value)} /></label>
          <label>Edad<input required type="number" min="12" max="100" value={f.age} onChange={e => set('age', e.target.value)} /></label>
          <label>Peso (kg)<input required type="number" min="30" max="300" step="0.1" value={f.weight} onChange={e => set('weight', e.target.value)} /></label>
          <label>Estatura (cm)<input required type="number" min="100" max="250" value={f.height} onChange={e => set('height', e.target.value)} /></label>
          <label>Nivel<Sel k="level" opts={LEVELS} /></label>
          <label>Tiempo entrenando<Sel k="time_training" opts={TIMES} /></label>
          <label>Objetivo<Sel k="goal" opts={GOALS} /></label>
          <label>Días por semana<select value={f.days} onChange={e => set('days', e.target.value)}>{[1,2,3,4,5,6,7].map(n => <option key={n}>{n}</option>)}</select></label>
          <label>Minutos por sesión<select value={f.minutes} onChange={e => set('minutes', e.target.value)}>{[30,45,60,75,90].map(n => <option key={n}>{n}</option>)}</select></label>
        </div>
        <fieldset><legend>Grupos musculares a priorizar</legend>
          <div className="chips">{GROUPS.map(g => <button type="button" key={g} className={f.priorities.includes(g) ? 'chip on' : 'chip'} onClick={() => toggle(g)}>{g}</button>)}</div>
        </fieldset>
        <label>Lesiones o ejercicios a evitar<textarea rows="2" value={f.limits} onChange={e => set('limits', e.target.value)} /></label>
        {msg && <p className="msg">{msg}</p>}
        <button className="btn" disabled={busy}>{first ? 'Empezar' : 'Guardar cambios'}</button>
      </form>
    </div>
  )
}
