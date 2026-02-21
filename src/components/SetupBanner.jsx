export function SetupBanner({ message, compact }) {
  return (
    <div
      style={{
        padding: compact ? 12 : 20,
        background: 'rgba(224, 108, 117, 0.15)',
        border: '1px solid rgba(224, 108, 117, 0.4)',
        borderRadius: 8,
        color: '#e06c75',
        fontSize: 14,
        marginBottom: 16,
      }}
    >
      <strong>Setup potreban:</strong> {message}
      <br />
      <span style={{ opacity: 0.9, fontSize: 12 }}>
        Firebase Console → Authentication → Get started → Email/Password
      </span>
    </div>
  )
}
