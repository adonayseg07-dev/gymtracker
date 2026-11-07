import { exById } from '../data'
export default function Dashboard({ profile, routines, workouts, go }) {
  const week = workouts.filter(w => Date.now() - new Date(w.started_at) < 6048e5).length
  const vol = workouts.reduce((a, w) => a + w.sets.reduce((b, s) => b + s.weight * s.reps, 0), 0)
  const today = routines.length ? routines[workouts.length % routines.length] : null
  const nextR = routines.length ? routines[(workouts.length + 1) % routines.length] : null
  return (
    <div>
      <h1>Hola, {profile.name}</h1>
      <p className="muted">Objetivo: {profile.goal} · {profile.days} días/semana · {profile.minutes} min</p>
      <div className="stats">
        <div className="card"><b>{workouts.length}</b><span>sesiones</span></div>
        <div className="card"><b>{week}/{profile.days}</b><span>esta semana</span></div>
        <div className="card"><b>{Math.round(vol).toLocaleString('es')}</b><span>kg movidos</span></div>
      </div>
      <div className="card"><h3>Rutina de hoy</h3>
        {today ? <><b>{today.name}</b><p className="muted">{today.items.map(i => exById[i.id]?.name).join(' · ')}</p>
          {nextR && nextR.id !== today.id && <p className="muted">Siguiente: {nextR.name}</p>}
          <button className="btn" onClick={() => go('train')}>Entrenar ahora</button></>
          : <><p className="muted">Aún no tienes rutinas.</p><button className="btn" onClick={() => go('routines')}>Crear rutina</button></>}
      </div>
      <div className="card"><h3>Últimas sesiones</h3>
        {workouts.slice(0, 3).map(w => <p key={w.id}>{w.routine_name} <span className="muted">{new Date(w.started_at).toLocaleDateString('es')} · {w.sets.length} series</span></p>)}
        {!workouts.length && <p className="muted">Todavía no has entrenado.</p>}</div>
      <div className="row"><button className="btn alt" onClick={() => go('equip')}>Mi equipo</button><button className="btn alt" onClick={() => go('exercises')}>Ejercicios</button><button className="btn alt" onClick={() => go('history')}>Progreso</button></div>
    </div>
  )
}
