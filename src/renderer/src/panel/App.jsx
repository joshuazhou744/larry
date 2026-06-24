import { useState, useRef } from 'react'
import { IconX, IconSettings } from '@tabler/icons-react'

export default function App() {
  const [settingsOpen, setSettingsOpen] = useState(false)

  return (
    <div className="flex flex-col h-screen bg-[var(--bg-base)]">

      {/* Titlebar */}
      <div
        className="flex items-center justify-between h-9 px-3 bg-[var(--bg-titlebar)] border-b border-[var(--border)] shrink-0"
        style={{ WebkitAppRegion: 'drag' }}
      >
        <h1 className="text-sm tracking-widest uppercase text-[var(--accent-red)] select-none">
          Lineup Larry
        </h1>
        <div className="flex items-center gap-1" style={{ WebkitAppRegion: 'no-drag' }}>
          <TitlebarButton title="Settings" onClick={() => setSettingsOpen(true)}>
            <IconSettings size={14} stroke={1.5} />
          </TitlebarButton>
          <TitlebarButton title="Close (Alt+L)" onClick={() => window.api.hide()}>
            <IconX size={14} stroke={1.5} />
          </TitlebarButton>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 min-h-0 relative">

        {/* Map canvas area */}
        <div className="dot-grid flex-1 flex items-center justify-center">
          <div className="text-center text-[var(--text-dim)]">
            <div className="text-xs tracking-widest uppercase mb-1">Map Canvas</div>
            <div className="text-xs">placeholder</div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="sidebar w-48 flex flex-col gap-5 p-4 overflow-y-auto">
          <Section label="Map"><Item>Lorem ipsum dolor</Item></Section>
          <Section label="Agent"><Item>Lorem ipsum dolor</Item></Section>
          <Section label="Lineups"></Section>
        </div>

        {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
      </div>

    </div>
  )
}

function SettingsModal({ onClose }) {
  return (
    <div className="absolute inset-0 bg-[var(--bg-overlay)] flex items-center justify-center z-50">
      <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg w-full max-w-md mx-4 flex flex-col">

        {/* Modal header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
          <span className="text-xs tracking-widest uppercase text-[var(--text-primary)] font-[Oswald,sans-serif]">
            Settings
          </span>
          <TitlebarButton title="Close" onClick={onClose}>
            <IconX size={14} stroke={1.5} />
          </TitlebarButton>
        </div>

        <div className="p-4 flex flex-col gap-6">
          <SettingsSection label="Keybinds">
            <div className="flex flex-col gap-1">
              <SettingRow label="Toggle overlay (must start with Alt)">
                <HotkeyInput />
              </SettingRow>
            </div>
          </SettingsSection>
        </div>

      </div>
    </div>
  )
}

function SettingsSection({ label, children }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="text-xs tracking-widest uppercase text-[var(--text-muted)] font-[Oswald,sans-serif]">
        {label}
      </div>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  )
}

function SettingRow({ label, description, children }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-xs text-[var(--text-muted)]">{label}</span>
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
    if (!e.altKey) return
    if (parts.length < 2) return
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
      className="rounded px-3 py-1 text-xs text-center cursor-pointer select-none outline-none transition-colors min-w-24 shrink-0"
      style={{
        background: recording ? 'var(--accent-red-dim)' : 'var(--bg-item)',
        border: `1px solid ${recording ? 'var(--accent-red)' : 'var(--border)'}`,
        color: recording ? 'var(--accent-red)' : 'var(--text-primary)',
      }}
    >
      {recording ? 'Press keys…' : hotkey}
    </div>
  )
}

function TitlebarButton({ title, onClick, children }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="w-7 h-7 flex items-center justify-center rounded border-none cursor-pointer bg-transparent text-[var(--text-muted)] hover:bg-[var(--accent-red-hover)] hover:text-[var(--accent-red)] transition-colors"
    >
      {children}
    </button>
  )
}

function Section({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="text-xs tracking-widest uppercase text-[var(--text-muted)] font-[Oswald,sans-serif]">
        {label}
      </div>
      {children}
    </div>
  )
}

function Item({ children }) {
  return (
    <div className="bg-[var(--bg-item)] rounded px-2.5 py-1.5 text-xs text-[var(--text-muted)]">
      {children}
    </div>
  )
}
