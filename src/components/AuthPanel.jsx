import { useState } from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { SetupBanner } from './SetupBanner'

export function AuthPanel({ auth, onAuthChange, onRegister, onLogin, onLogout }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  if (!auth) {
    return (
      <SetupBanner message="Firebase Auth nije dostupan. Provjeri konfiguraciju i uključi Email/Password u Firebase konzoli." />
    )
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email, password)
      onLogin?.()
    } catch (err) {
      const msg =
        err.code === 'auth/configuration-not-found'
          ? 'Auth nije uključen u Firebase konzoli: Authentication → Get started → Email/Password'
          : err.code === 'auth/invalid-credential'
            ? 'Krivi email ili lozinka'
            : err.message
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await createUserWithEmailAndPassword(auth, regEmail, regPassword)
      onRegister?.()
    } catch (err) {
      const msg =
        err.code === 'auth/configuration-not-found'
          ? 'Auth nije uključen u Firebase konzoli: Authentication → Get started → Email/Password'
          : err.code === 'auth/email-already-in-use'
            ? 'Email je već registriran'
            : err.code === 'auth/weak-password'
              ? 'Lozinka mora imati najmanje 6 znakova'
              : err.message
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    setError(null)
    setLoading(true)
    try {
      await signOut(auth)
      onLogout?.()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <form onSubmit={handleLogin} style={styles.form}>
        <h3 style={styles.title}>Prijava</h3>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
          required
        />
        <input
          type="password"
          placeholder="Lozinka"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
          required
        />
        <button type="submit" disabled={loading} style={styles.btn}>
          {loading ? '...' : 'Prijavi se'}
        </button>
      </form>

      <form onSubmit={handleRegister} style={styles.form}>
        <h3 style={styles.title}>Registracija</h3>
        <input
          type="email"
          placeholder="Email"
          value={regEmail}
          onChange={(e) => setRegEmail(e.target.value)}
          style={styles.input}
          required
        />
        <input
          type="password"
          placeholder="Lozinka (min 6 znakova)"
          value={regPassword}
          onChange={(e) => setRegPassword(e.target.value)}
          style={styles.input}
          required
          minLength={6}
        />
        <button type="submit" disabled={loading} style={styles.btn}>
          {loading ? '...' : 'Registriraj se'}
        </button>
      </form>

      {error && (
        <div style={styles.error}>
          {error}
        </div>
      )}

      {onAuthChange?.user && (
        <div style={styles.loggedIn}>
          <p>Pozdrav, {onAuthChange.user.email}</p>
          <button onClick={handleLogout} disabled={loading} style={styles.btnOut}>
            Odjavi se
          </button>
        </div>
      )}
    </div>
  )
}

const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: 20 },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    padding: 20,
    background: 'var(--card)',
    borderRadius: 8,
    border: '1px solid rgba(255,255,255,0.05)',
  },
  title: { margin: '0 0 8px 0', fontSize: 16 },
  input: {
    padding: 10,
    borderRadius: 6,
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(0,0,0,0.2)',
    color: 'inherit',
  },
  btn: {
    padding: 10,
    background: 'var(--accent)',
    border: 'none',
    borderRadius: 6,
    color: '#000',
    fontWeight: 600,
  },
  btnOut: {
    padding: 8,
    background: 'transparent',
    border: '1px solid var(--text-muted)',
    borderRadius: 6,
    color: 'var(--text-muted)',
  },
  error: {
    padding: 12,
    background: 'rgba(224,108,117,0.15)',
    borderRadius: 6,
    color: '#e06c75',
    fontSize: 14,
  },
  loggedIn: { padding: 16, background: 'var(--card)', borderRadius: 8 },
}
