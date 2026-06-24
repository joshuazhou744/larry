import { useState, useRef } from 'react'
import { IconX, IconSettings } from '@tabler/icons-react'

export default function App() {
  const [settingsOpen, setSettingsOpen] = useState(false)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-base)' }}>

      {/* Titlebar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 38, padding: '0 12px',
        background: 'var(--bg-titlebar)', borderBottom: '1px solid var(--border)',
        flexShrink: 0, WebkitAppRegion: 'drag',
      }}>
        <h1 style={{ fontSize: 15, letterSpacing: '0.15em', color: 'var(--accent-red)', userSelect: 'none' }}>
          Lineup Larry
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, WebkitAppRegion: 'no-drag' }}>
          <TitlebarButton title="Settings" onClick={() => setSettingsOpen(true)}>
            <IconSettings size={14} stroke={1.5} />
          </TitlebarButton>
          <TitlebarButton title="Close (Alt+L)" onClick={() => window.api.hide()}>
            <IconX size={14} stroke={1.5} />
          </TitlebarButton>
        </div>
      </div>

      {/* Body */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0, position: 'relative' }}>

        {/* Map canvas area */}
        <div className="dot-grid" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', color: 'var(--text-dim)' }}>
            <div style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 4 }}>Map Canvas</div>
            <div style={{ fontSize: 11 }}>placeholder</div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="sidebar" style={{ width: 200, display: 'flex', flexDirection: 'column', gap: 20, padding: 16 }}>
          <Section label="Map"><Item>Lorem ipsum dolor</Item></Section>
          <Section label="Agent"><Item>Lorem ipsum dolor</Item></Section>
          <Section label="Lineups">
            {['Lorem ipsum 1', 'Lorem ipsum 2', 'Lorem ipsum 3'].map(t => <Item key={t}>{t}</Item>)}
          </Section>
        </div>

        {/* Settings modal */}
        {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
      </div>

    </div>
  )
}

/* ── Settings modal ─────────────────────────────────────────── */
function SettingsModal({ onClose }) {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'var(--bg-overlay)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 100,
    }}>
      <div style={{
        background: 'var(--bg-surface)', border: '1px solid var(--border)',
        borderRadius: 8, width: 420, maxWidth: '90%',
        display: 'flex', flexDirection: 'column',
      }}>

        {/* Modal header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 16px', borderBottom: '1px solid var(--border)',
        }}>
          <span style={{ fontSize: 13, letterSpacing: '0.1em', fontFamily: 'Oswald, sans-serif', color: 'var(--text-primary)' }}>
            SETTINGS
          </span>
          <TitlebarButton title="Close" onClick={onClose}>
            <IconX size={14} stroke={1.5} />
          </TitlebarButton>
        </div>

        {/* Modal body */}
        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 24 }}>
          <SettingsSection label="Keybinds">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <SettingRow label="Toggle overlay">
                <HotkeyInput />
              </SettingRow>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                Must start with Alt — e.g. Alt+L, Alt+Shift+F
              </div>
            </div>
          </SettingsSection>
        </div>

      </div>
    </div>
  )
}

function SettingsSection({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'Oswald, sans-serif' }}>
        {label}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {children}
      </div>
    </div>
  )
}

function SettingRow({ label, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{label}</span>
      {children}
    </div>
  )
}

function HotkeyInput() {
  const [hotkey, setHotkey] = useState('Alt+L')
  const [recording, setRecording] = useState(false)
  const ref = useRef(null)

  function startRecording() {
    setRecording(true)
    ref.current?.focus()
  }

  function handleKeyDown(e) {
    e.preventDefault()
    const parts = []
    if (e.ctrlKey)  parts.push('Control')
    if (e.altKey)   parts.push('Alt')
    if (e.shiftKey) parts.push('Shift')
    const key = e.key.length === 1 ? e.key.toUpperCase() : e.key
    if (!['Control', 'Alt', 'Shift', 'Meta'].includes(e.key)) parts.push(key)
    if (!e.altKey) return          // must include Alt
    if (parts.length < 2) return  // require at least modifier + key
    const combo = parts.join('+')
    setHotkey(combo)
    setRecording(false)
    window.api.setHotkey(combo)
  }

  return (
    <div
      ref={ref}
      tabIndex={0}
      onClick={startRecording}
      onKeyDown={recording ? handleKeyDown : undefined}
      onBlur={() => setRecording(false)}
      style={{
        background: recording ? 'var(--accent-red-dim)' : 'var(--bg-item)',
        border: `1px solid ${recording ? 'var(--accent-red)' : 'var(--border)'}`,
        borderRadius: 4, padding: '4px 10px',
        fontSize: 12, color: recording ? 'var(--accent-red)' : 'var(--text-primary)',
        cursor: 'pointer', minWidth: 100, textAlign: 'center',
        outline: 'none', transition: 'border 0.15s, color 0.15s',
        userSelect: 'none',
      }}
    >
      {recording ? 'Press keys…' : hotkey}
    </div>
  )
}

/* ── Shared primitives ──────────────────────────────────────── */
function TitlebarButton({ title, onClick, children }) {
  return (
    <button onClick={onClick} title={title} style={{
      background: 'transparent', border: 'none', cursor: 'pointer',
      color: 'var(--text-muted)', width: 28, height: 28, borderRadius: 4,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'background 0.15s, color 0.15s',
    }}
      onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-red-hover)'; e.currentTarget.style.color = 'var(--accent-red)' }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)' }}
    >
      {children}
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
