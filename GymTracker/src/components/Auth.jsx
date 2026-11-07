import { useState } from 'react'
import { supabase } from '../supabase'
export default function Auth() {
  const [mode, setMode] = useState('in'); const [email, setEmail] = useState(''); const [pw, setPw] = useState('')
  const [msg, setMsg] = useState(''); const [busy, setBusy] = useState(false)
  const submit = async e => {
    e.preventDefault(); setMsg(''); setBusy(true)
    const { data, error } = mode === 'in'
      ? await supabase.auth.signInWithPassword({ email, password: pw })
      : await supabase.auth.signUp({ email, password: pw })
    setBusy(false)
    if (error) setMsg(error.message)
    else if (mode === 'up' && !data.session) setMsg('Cuenta creada. Confirma tu correo y luego inicia sesión.')
  }
  return (
    <div className="center">
      <form className="card auth" onSubmit={submit}>
        <h1 className="brand big">Gym<b>Tracker</b></h1>
        <p className="muted">{mode === 'in' ? 'Inicia sesión para continuar' : 'Crea tu cuenta para empezar'}</p>
        <label>Correo<input type="email" required value={email} onChange={e => setEmail(e.target.value)} /></label>
        <label>Contraseña<input type="password" required minLength={6} value={pw} onChange={e => setPw(e.target.value)} /></label>
        {msg && <p className="msg">{msg}</p>}
        <button className="btn" disabled={busy}>{mode === 'in' ? 'Entrar' : 'Crear cuenta'}</button>
        <button type="button" className="link" onClick={() => { setMode(mode === 'in' ? 'up' : 'in'); setMsg('') }}>
          {mode === 'in' ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
        </button>
      </form>
    </div>
  )
}
