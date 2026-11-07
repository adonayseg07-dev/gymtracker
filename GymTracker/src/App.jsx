import { useEffect, useRef, useState, useCallback } from 'react'
import { supabase, configured } from './supabase'
import { loadAll, flush, enqueue, setCache, pendingCount } from './store'
import Auth from './components/Auth.jsx'
import Profile from './components/Profile.jsx'
import Dashboard from './components/Dashboard.jsx'
import Equipment from './components/Equipment.jsx'
import Exercises from './components/Exercises.jsx'
import Routines from './components/Routines.jsx'
import Train from './components/Train.jsx'
import History from './components/History.jsx'

const TABS = [['dash','Inicio'],['train','Entrenar'],['routines','Rutinas'],['history','Progreso'],['exercises','Ejercicios'],['equip','Equipo'],['profile','Perfil']]
const EMPTY = { profile: null, equip: [], routines: [], workouts: [] }

export default function App() {
  const [session, setSession] = useState(null)
  const [ready, setReady] = useState(false)
  const [data, setData] = useState(EMPTY)
  const [loaded, setLoaded] = useState(false)
  const [noData, setNoData] = useState(false)
  const [online, setOnline] = useState(navigator.onLine)
  const [pending, setPending] = useState(0)
  const [tab, setTab] = useState('dash')
  const ref = useRef(EMPTY)
  const user = session?.user

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setReady(true) }).catch(() => setReady(true))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!user) return
    setLoaded(false)
    loadAll(user.id).then(d => {
      if (d) { ref.current = d; setData(d); setNoData(false) } else setNoData(true)
      setPending(pendingCount(user.id)); setLoaded(true)
    })
    const on = () => { setOnline(true); flush(user.id).then(setPending) }
    const off = () => setOnline(false)
    addEventListener('online', on); addEventListener('offline', off)
    return () => { removeEventListener('online', on); removeEventListener('offline', off) }
  }, [user?.id])

  // Aplica el cambio al instante, lo guarda en el dispositivo y lo sincroniza cuando hay conexión.
  const commit = useCallback((patch, ops = []) => {
    const p = typeof patch === 'function' ? patch(ref.current) : patch
    const n = { ...ref.current, ...p }
    ref.current = n; setData(n); setCache(user.id, n)
    enqueue(user.id, ops); setPending(pendingCount(user.id))
    flush(user.id).then(setPending)
  }, [user?.id])

  if (!configured) return <div className="center card"><h1>GymTracker</h1><p>Faltan las variables <code>VITE_SUPABASE_URL</code> y <code>VITE_SUPABASE_ANON_KEY</code>. Agrégalas en Secrets de Replit (ver README).</p></div>
  if (!ready) return <div className="center">Cargando…</div>
  if (!user) return <Auth />
  if (!loaded) return <div className="center">Cargando tus datos…</div>
  if (noData) return <div className="center card">Sin conexión y sin datos guardados en este dispositivo. Conéctate a internet una vez para descargar tus datos.</div>
  if (!data.profile) return <Profile user={user} profile={null} commit={commit} first />

  const have = new Set(data.equip)
  const ctx = { user, ...data, have, commit, go: setTab }
  return (
    <div className="shell">
      <nav className="nav">
        <div className="brand">Gym<b>Tracker</b></div>
        {TABS.map(([k, l]) => <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{l}</button>)}
        <button className="out" onClick={() => supabase.auth.signOut()}>Salir</button>
      </nav>
      <main>
        {(!online || pending > 0) && <div className="banner">{online ? `Sincronizando ${pending} cambio(s)…` : `Sin conexión: tus cambios se guardan en el dispositivo${pending ? ` (${pending} pendientes)` : ''} y se enviarán al reconectar.`}</div>}
        {tab === 'dash' && <Dashboard {...ctx} />}
        {tab === 'train' && <Train {...ctx} />}
        {tab === 'routines' && <Routines {...ctx} />}
        {tab === 'history' && <History {...ctx} />}
        {tab === 'exercises' && <Exercises {...ctx} />}
        {tab === 'equip' && <Equipment {...ctx} />}
        {tab === 'profile' && <Profile user={user} profile={data.profile} commit={commit} onSaved={() => setTab('dash')} />}
      </main>
    </div>
  )
}
