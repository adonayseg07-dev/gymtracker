import { EQUIPMENT } from '../data'
export default function Equipment({ user, equip, have, commit }) {
  const toggle = id => {
    const on = have.has(id), row = { user_id: user.id, equipment_id: id }
    commit({ equip: on ? equip.filter(x => x !== id) : [...equip, id] },
      [on ? { op: 'delete', table: 'user_equipment', match: row } : { op: 'upsert', table: 'user_equipment', row, conflict: 'user_id,equipment_id' }])
  }
  const cats = [...new Set(EQUIPMENT.map(x => x.cat))]
  return (
    <div>
      <h2>Equipo de tu gimnasio</h2>
      <p className="muted">Marca lo que tienes. Las rutinas solo usan ejercicios que puedas hacer con este equipo. ({equip.length} seleccionados)</p>
      {cats.map(c => (
        <section key={c}><h3>{c}</h3>
          <div className="chips">{EQUIPMENT.filter(x => x.cat === c).map(x => <button key={x.id} className={have.has(x.id) ? 'chip on' : 'chip'} onClick={() => toggle(x.id)}>{x.n}</button>)}</div>
        </section>
      ))}
    </div>
  )
}
