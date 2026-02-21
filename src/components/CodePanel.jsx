import { useState } from 'react'

const TOKEN_COLORS = {
  keyword: '#c678dd',
  string: '#98c379',
  function: '#61afef',
  comment: '#5c6370',
  default: '#abb2bf',
}

function tokenize(line) {
  const keyword = /\b(import|from|const|let|var|async|await|function|return|try|catch|if|else)\b/g
  const fn = /\b(getAuth|getFirestore|collection|addDoc|getDocs|doc|updateDoc|deleteDoc|onSnapshot|query|orderBy|createUserWithEmailAndPassword|signInWithEmailAndPassword|signOut|onAuthStateChanged|initializeApp|serverTimestamp)\b/g
  const str = /['"`][^'"`]*['"`]/g
  const comment = /\/\/[^\n]*/g

  const matches = []
  const addMatch = (re, type) => {
    re.lastIndex = 0
    let m
    while ((m = re.exec(line)) !== null) matches.push({ i: m.index, end: m.index + m[0].length, text: m[0], type })
  }
  addMatch(keyword, 'keyword')
  addMatch(fn, 'function')
  addMatch(str, 'string')
  addMatch(comment, 'comment')
  matches.sort((a, b) => a.i - b.i)

  const tokens = []
  let pos = 0
  for (const m of matches) {
    if (m.i >= pos) {
      if (m.i > pos) tokens.push({ text: line.slice(pos, m.i), type: 'default' })
      tokens.push({ text: m.text, type: m.type })
      pos = m.end
    }
  }
  if (pos < line.length) tokens.push({ text: line.slice(pos), type: 'default' })
  return tokens.length ? tokens : [{ text: line || ' ', type: 'default' }]
}

export function CodePanel({ code, filename = 'app.js' }) {
  const [copied, setCopied] = useState(false)
  const lines = code.split('\n')
  const LINE_HEIGHT = 22

  const copy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.panel}>
        <div style={styles.header}>
          <div style={styles.dots}>
            <span style={{ ...styles.dot, background: '#ff5f56' }} />
            <span style={{ ...styles.dot, background: '#ffbd2e' }} />
            <span style={{ ...styles.dot, background: '#27c93f' }} />
          </div>
          <span style={styles.filename}>{filename}</span>
          <button style={styles.copyBtn} onClick={copy}>
            {copied ? '✓ Kopirano' : 'Kopiraj'}
          </button>
        </div>
        <div style={styles.codeWrapper}>
          <div style={styles.lineNumbers}>
            {lines.map((_, i) => (
              <div key={i} style={styles.lineNumRow}>
                {i + 1}
              </div>
            ))}
          </div>
          <div style={styles.codeArea}>
            {lines.map((line, i) => (
              <div key={i} style={styles.codeLine}>
                {tokenize(line || ' ').map((t, j) => (
                  <span
                    key={j}
                    style={{ color: TOKEN_COLORS[t.type] ?? TOKEN_COLORS.default }}
                  >
                    {t.text || '\u00A0'}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  wrapper: { width: '100%', minHeight: 200 },
  panel: {
    background: 'linear-gradient(180deg, rgba(20,25,40,0.95) 0%, rgba(12,16,28,0.98) 100%)',
    borderRadius: 12,
    overflow: 'hidden',
    border: '1px solid rgba(255,255,255,0.08)',
    boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '12px 16px',
    background: 'rgba(0,0,0,0.3)',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  },
  dots: { display: 'flex', gap: 6 },
  dot: { width: 10, height: 10, borderRadius: '50%' },
  filename: {
    color: 'var(--text-muted)',
    fontSize: 13,
    flex: 1,
    fontFamily: 'var(--font-mono)',
  },
  copyBtn: {
    background: 'var(--accent-dim)',
    border: 'none',
    color: 'var(--accent)',
    padding: '6px 12px',
    borderRadius: 6,
    fontSize: 12,
    cursor: 'pointer',
  },
  codeWrapper: {
    display: 'flex',
    overflow: 'auto',
    maxHeight: 420,
  },
  lineNumbers: {
    minWidth: 44,
    padding: '14px 12px 14px 16px',
    background: 'rgba(0,0,0,0.25)',
    color: 'var(--text-muted)',
    fontSize: 13,
    fontFamily: 'var(--font-mono)',
    userSelect: 'none',
    textAlign: 'right',
  },
  lineNumRow: {
    height: 22,
    lineHeight: '22px',
  },
  codeArea: {
    flex: 1,
    padding: '14px 16px',
    overflow: 'auto',
  },
  codeLine: {
    minHeight: 22,
    lineHeight: '22px',
    fontSize: 13,
    fontFamily: 'var(--font-mono)',
    whiteSpace: 'pre',
  },
}
