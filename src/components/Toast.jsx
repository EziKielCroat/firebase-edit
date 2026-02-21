import { useEffect } from 'react'

export function Toast({ message, type = 'success', onClose, duration = 3000 }) {
  useEffect(() => {
    const t = setTimeout(onClose, duration)
    return () => clearTimeout(t)
  }, [onClose, duration])

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        padding: '12px 20px',
        borderRadius: 8,
        background: type === 'error' ? 'rgba(224,108,117,0.2)' : 'rgba(152,195,121,0.2)',
        border: `1px solid ${type === 'error' ? '#e06c75' : '#98c379'}`,
        color: type === 'error' ? '#e06c75' : '#98c379',
        fontSize: 14,
        zIndex: 1000,
        animation: 'fadeIn 0.3s ease',
      }}
    >
      {message}
    </div>
  )
}
