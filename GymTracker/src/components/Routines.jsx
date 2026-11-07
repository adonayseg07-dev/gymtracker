import { useState } from 'react'
import { EXERCISES, exById } from '../data'
export default function Routines({ user, have, routines, commit }) {
  const [edit, setEdit] = useState(null) // {id?, name, items}
  const avail = EXERCISES.filter(x => x.eq.every(i => have.has(i)))
  const upd = (i, k, v) => setEdit({ ...edit, items: edit.items.map((it, j) => j === i ? { ...it, [k]: v } : it) })
  const save = () => {
    if (!edit.name.trim() || !edit.items.length) return alert('Pon un nombre y agrega al menos un ejercicio.')
    const row = { id: edit.id || crypto.randomUUID(), user_id: user.id, name: edit.name.trim(), items: edit.items }
    if (!edit.id) row.created_at = new Date().toISOString()
    commit(d => ({ routines: edit.id ? d.routines.map(r => r.id === row.id ? { ...r, ...row } : r) : [row, ...d.routines] }), [{ op: 'upsert', table: 'routines', row }])
    setEdit(null)
  }
  const del = id => { if (confirm('¿Eliminar esta rutina?')) commit(d => ({ routines: d.routines.filter(r => r.id !== id) }), [{ op: 'delete', table: 'routines', match: { id } }]) }
  if (edit) return (
    <div className="card form">
      <h2>{edit.id ? 'Editar rutina' : 'Nueva rutina'}</h2>
      <label>Nombre<input value={edit.name} onChange={e => setEdit({ ...edit, name: e.target.value })} /></label>
      {edit.items.map((it, i) => (
        <div className="row" key={i}>
          <b className="grow">{exById[it.id]?.name}</b>
          <label>Series<input type="number" min="1" value={it.sets} onChange={e => upd(i, 'sets', +e.target.value)} /></label>
          <label>Reps<input value={it.reps} onChange={e => upd(i, 'reps', e.target.value)} /></label>
          <label>Descanso (s)<input type="number" min="10" step="5" value={it.rest} onChange={e => upd(i, 'rest', +e.target.value)} /></label>
          <button className="link" onClick={() => setEdit({ ...edit, items: edit.items.filter((_, j) => j !== i) })}>Quitar</button>
        </div>
      ))}
      <label>Agregar ejercicio (solo con tu equipo)
        <select value="" onChange={e => e.target.value && setEdit({ ...edit, items: [...edit.items, { id: e.target.value, sets: 3, reps: '8-12', rest: 90 }] })}>
          <option value="">Elegir…</option>
          {avail.map(x => <option key={x.id} value={x.id}>{x.group} · {x.name}</option>)}
        </select>
      </label>
      <div className="row"><button className="btn" onClick={save}>Guardar rutina</button><button className="link" onClick={() => setEdit(null)}>Cancelar</button></div>
    </div>
  )
  return (
    <div>
      <div className="row"><h2 className="grow">Mis rutinas</h2><button className="btn" onClick={() => setEdit({ name: '', items: [] })}>Nueva rutina</button></div>
      {routines.length === 0 && <p className="muted">Aún no tienes rutinas. Crea la primera con el equipo que marcaste.</p>}
      {routines.map(r => (
        <div className="card" key={r.id}>
          <div className="row"><b className="grow">{r.name}</b>
            <button className="link" onClick={() => setEdit({ id: r.id, name: r.name, items: r.items })}>Editar</button>
            <button className="link" onClick={() => del(r.id)}>Eliminar</button></div>
          <p className="muted">{r.items.map(i => exById[i.id]?.name).filter(Boolean).join(' · ')}</p>
        </div>
      ))}
    </div>
  )
}
