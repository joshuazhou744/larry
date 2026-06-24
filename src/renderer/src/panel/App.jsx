export default function App() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-base)' }}>

      {/* Titlebar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 38,
        padding: '0 12px',
        background: 'var(--bg-titlebar)',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
        WebkitAppRegion: 'drag',
      }}>
        <h1 style={{ fontSize: 13, letterSpacing: '0.15em', color: 'var(--accent-red)', userSelect: 'none' }}>
          LARRY
        </h1>
        <CloseButton />
      </div>

      {/* Body */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>

        {/* Map canvas area */}
        <div className="dot-grid" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', color: 'var(--text-dim)' }}>
            <div style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 4 }}>Map Canvas</div>
            <div style={{ fontSize: 11 }}>placeholder</div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="sidebar" style={{ width: 200, display: 'flex', flexDirection: 'column', gap: 20, padding: 16 }}>
          <Section label="Map">Lorem ipsum dolor</Section>
          <Section label="Agent">Lorem ipsum dolor</Section>
          <Section label="Lineups">
            {['Lorem ipsum 1', 'Lorem ipsum 2', 'Lorem ipsum 3'].map(t => (
              <Item key={t}>{t}</Item>
            ))}
          </Section>
        </div>

      </div>
    </div>
  )
}

function CloseButton() {
  return (
    <button
      onClick={() => window.api.hide()}
      title="Close (Alt+L)"
      style={{
        WebkitAppRegion: 'no-drag',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        color: 'var(--text-muted)',
        width: 28,
        height: 28,
        borderRadius: 4,
        fontSize: 14,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background 0.15s, color 0.15s',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = 'hsl(354 100% 63% / 0.15)'; e.currentTarget.style.color = 'var(--accent-red)' }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)' }}
    >
      &#x2715;
    </button>
  )
}

function Section({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'Oswald, sans-serif' }}>
        {label}
      </div>
      {children}
    </div>
  )
}

function Item({ children }) {
  return (
    <div style={{ background: 'var(--bg-item)', borderRadius: 4, padding: '6px 10px', fontSize: 12, color: 'var(--text-muted)' }}>
      {children}
    </div>
  )
}
