export default function Notification({ message, onDone }) {
  return (
    <div
      className="toast inline-flex px-8 py-4 text-md tracking-wide whitespace-nowrap"
      style={{
        fontFamily: 'Oswald, sans-serif',
        background: 'var(--bg-surface)',
        borderLeft: '3px solid var(--accent-red)',
        color: 'var(--text-primary)',
      }}
      onAnimationEnd={onDone}
    >
      {message}
    </div>
  )
}
