import { useState } from 'react'
import { EXERCISES, GROUPS, eqName } from '../data'
export default function Exercises({ have }) {
  const [g, setG] = useState('Todos'); const [only, setOnly] = useState(false); const [open, setOpen] = useState(null)
  const list = EXERCISES.filter(x => (g === 'Todos' || x.group === g) && (!only || x.eq.every(i => have.has(i))))
  return (
    <div>
      <h2>Biblioteca de ejercicios</h2>
      <div className="chips">{['Todos', ...GROUPS].map(x => <button key={x} className={g === x ? 'chip on' : 'chip'} onClick={() => setG(x)}>{x}</button>)}</div>
      <label className="check"><input type="checkbox" checked={only} onChange={e => setOnly(e.target.checked)} /> Solo con mi equipo</label>
      {list.length === 0 && <p className="muted">No hay ejercicios con este filtro todavía.</p>}
      {list.map(x => (
        <div className="card ex" key={x.id}>
          <button className="exhead" onClick={() => setOpen(open === x.id ? null : x.id)}>
            <b>{x.name}</b><span className="muted">{x.group} · {x.lvl}</span>
          </button>
          {open === x.id && <div className="exbody">
            <p><b>Equipo:</b> {x.eq.length ? x.eq.map(i => eqName[i]).join(', ') : 'Sin equipo'}</p>
            <p><b>Secundarios:</b> {x.sec.join(', ') || '—'}</p>
            <b>Paso a paso</b><ol>{x.steps.map((s, i) => <li key={i}>{s}</li>)}</ol>
            <p><b>Técnica:</b> {x.tech}</p><p><b>Errores frecuentes:</b> {x.errors}</p><p><b>Seguridad:</b> {x.safety}</p>
          </div>}
        </div>
      ))}
    </div>
  )
}
