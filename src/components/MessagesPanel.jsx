import { useState, useEffect } from 'react'
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore'
import { SetupBanner } from './SetupBanner'

function formatPermissionError(err) {
  return err.message?.toLowerCase().includes('permission')
    ? 'Prijavi se (tab Autentifikacija) da bi pristupio porukama.'
    : err.message
}

export function MessagesPanel({
  db,
  auth,
  mode,
  onSnapshotEvent,
  onAdd,
  onLoad,
  onUpdate,
  onDelete,
}) {
  const [text, setText] = useState('')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [editText, setEditText] = useState('')

  const col = db ? collection(db, 'poruke') : null

  useEffect(() => {
    if (!db || !col) return
    if (mode === 'realtime') {
      const q = query(col, orderBy('vrijeme', 'asc'))
      const unsub = onSnapshot(
        q,
        (snapshot) => {
          const list = snapshot.docs.map((d) => ({
            id: d.id,
            ...d.data(),
            vrijeme: d.data().vrijeme?.toDate?.() || d.data().vrijeme,
          }))
          setItems(list)
          setError(null)
          onSnapshotEvent?.()
        },
        (err) => setError(formatPermissionError(err))
      )
      return () => unsub()
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    getDocs(col)
      .then((snap) => {
        if (cancelled) return
        setItems(
          snap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
            vrijeme: d.data().vrijeme?.toDate?.() || d.data().vrijeme,
          }))
        )
        onLoad?.()
      })
      .catch((err) => {
        if (!cancelled) setError(formatPermissionError(err))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [mode, db])

  const loadItems = async () => {
    if (!col) return
    setLoading(true)
    setError(null)
    try {
      const snap = await getDocs(col)
      setItems(
        snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
          vrijeme: d.data().vrijeme?.toDate?.() || d.data().vrijeme,
        }))
      )
      onLoad?.()
    } catch (err) {
      setError(formatPermissionError(err))
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!text.trim() || !col) return
    setLoading(true)
    setError(null)
    try {
      await addDoc(col, {
        tekst: text.trim(),
        autorEmail: auth?.currentUser?.email || 'anon',
        vrijeme: serverTimestamp(),
      })
      setText('')
      onAdd?.()
      if (mode !== 'realtime') loadItems()
    } catch (err) {
      setError(formatPermissionError(err))
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async () => {
    if (!editingId || !editText.trim() || !db) return
    setLoading(true)
    setError(null)
    try {
      await updateDoc(doc(db, 'poruke', editingId), { tekst: editText.trim() })
      setEditingId(null)
      setEditText('')
      onUpdate?.()
      if (mode !== 'realtime') loadItems()
    } catch (err) {
      setError(formatPermissionError(err))
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!db) return
    setLoading(true)
    setError(null)
    try {
      await deleteDoc(doc(db, 'poruke', id))
      onDelete?.()
      if (mode !== 'realtime') loadItems()
    } catch (err) {
      setError(formatPermissionError(err))
    } finally {
      setLoading(false)
    }
  }

  const startEdit = (item) => {
    setEditingId(item.id)
    setEditText(item.tekst || '')
  }

  const formatTime = (v) => {
    if (!v) return ''
    const d = v instanceof Date ? v : v?.toDate?.() || new Date(v)
    return d.toLocaleTimeString('hr-HR', { hour: '2-digit', minute: '2-digit' })
  }

  if (!db || !col) {
    return (
      <SetupBanner message="Firestore nije dostupan. Provjeri Firebase konfiguraciju i kreiraj Firestore bazu u konzoli." />
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.formRow}>
        <form onSubmit={handleAdd} style={styles.form}>
          <input
            type="text"
            placeholder="Nova poruka..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={styles.input}
        />
          <button type="submit" disabled={loading} style={styles.btn}>
            {loading ? '...' : 'Pošalji'}
          </button>
        </form>
        {mode === 'crud' && (
          <button
            onClick={loadItems}
            disabled={loading}
            style={styles.refreshBtn}
            title="Osvježi listu"
          >
            ↻ Osvježi
          </button>
        )}
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {loading && items.length === 0 ? (
        <p style={styles.loading}>Učitavanje...</p>
      ) : items.length === 0 ? (
        <div style={styles.empty}>
          <p>Nema poruka. Dodaj prvu!</p>
          <p style={styles.emptyHint}>Poruke se spremaju u Firestore kolekciju "poruke".</p>
        </div>
      ) : (
        <ul style={styles.list}>
          {items.map((item) => (
            <li key={item.id} style={styles.item}>
              {editingId === item.id ? (
                <div style={styles.editRow}>
                  <input
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    style={styles.input}
                    autoFocus
                  />
                  <button onClick={handleUpdate} style={styles.btnSmall}>
                    Spremi
                  </button>
                  <button
                    onClick={() => {
                      setEditingId(null)
                      setEditText('')
                    }}
                    style={styles.btnCancel}
                  >
                    Odustani
                  </button>
                </div>
              ) : (
                <>
                  <div style={styles.msgBlock}>
                    <span style={styles.msg}>
                      <b>{item.autorEmail}:</b> {item.tekst}
                    </span>
                    {item.vrijeme && (
                      <span style={styles.time}>{formatTime(item.vrijeme)}</span>
                    )}
                  </div>
                  <div style={styles.actions}>
                    <button onClick={() => startEdit(item)} style={styles.btnSmall}>
                      Uredi
                    </button>
                    <button onClick={() => handleDelete(item.id)} style={styles.btnDel}>
                      Obriši
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: 16 },
  formRow: { display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' },
  form: { display: 'flex', gap: 10, flex: 1, minWidth: 200 },
  refreshBtn: {
    padding: '10px 14px',
    background: 'transparent',
    border: '1px solid var(--text-muted)',
    borderRadius: 6,
    color: 'var(--text-muted)',
    fontSize: 14,
    cursor: 'pointer',
  },
  input: {
    flex: 1,
    padding: 10,
    borderRadius: 6,
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(0,0,0,0.2)',
    color: 'inherit',
  },
  btn: {
    padding: '10px 16px',
    background: 'var(--accent)',
    border: 'none',
    borderRadius: 6,
    color: '#000',
    fontWeight: 600,
  },
  btnSmall: {
    padding: '4px 10px',
    fontSize: 12,
    background: 'var(--accent-dim)',
    border: 'none',
    borderRadius: 4,
    color: 'var(--accent)',
  },
  btnCancel: {
    padding: '4px 10px',
    fontSize: 12,
    background: 'transparent',
    border: '1px solid var(--text-muted)',
    borderRadius: 4,
    color: 'var(--text-muted)',
  },
  btnDel: {
    padding: '4px 10px',
    fontSize: 12,
    background: 'rgba(224,108,117,0.2)',
    border: 'none',
    borderRadius: 4,
    color: '#e06c75',
  },
  list: { listStyle: 'none', margin: 0, padding: 0 },
  item: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    background: 'var(--card)',
    borderRadius: 8,
    marginBottom: 8,
    border: '1px solid rgba(255,255,255,0.04)',
  },
  msgBlock: { flex: 1, display: 'flex', flexDirection: 'column', gap: 4 },
  msg: {},
  time: { fontSize: 11, color: 'var(--text-muted)' },
  actions: { display: 'flex', gap: 8 },
  loading: { color: 'var(--text-muted)' },
  empty: {
    padding: 24,
    textAlign: 'center',
    background: 'var(--card)',
    borderRadius: 8,
    color: 'var(--text-muted)',
  },
  emptyHint: { fontSize: 12, marginTop: 8, opacity: 0.8 },
  error: {
    padding: 12,
    background: 'rgba(224,108,117,0.15)',
    borderRadius: 6,
    color: '#e06c75',
    fontSize: 14,
  },
}
