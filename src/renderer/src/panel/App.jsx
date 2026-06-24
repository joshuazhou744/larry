import { useState, useRef, useCallback } from 'react'
import { IconX, IconSettings } from '@tabler/icons-react'

const SIDEBAR_MIN = 160
const SIDEBAR_MAX = 480
const SIDEBAR_DEFAULT = 240

export default function App() {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(SIDEBAR_DEFAULT)
  const bodyRef = useRef(null)

  const onDividerMouseDown = useCallback((e) => {
    e.preventDefault()
    const onMove = (e) => {
      const rect = bodyRef.current.getBoundingClientRect()
      const next = rect.right - e.clientX
      setSidebarWidth(Math.max(SIDEBAR_MIN, Math.min(SIDEBAR_MAX, next)))
    }
    const onUp = () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }, [])

  return (
    <div className="flex flex-col h-screen bg-[var(--bg-base)]">

      {/* Titlebar */}
      <div
        className="flex items-center justify-between h-9 px-3 bg-[var(--bg-titlebar)] border-b border-[var(--border)] shrink-0"
        style={{ WebkitAppRegion: 'drag' }}
      >
        <h1 className="text-md tracking-widest uppercase text-[var(--accent-red)] select-none">
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
      <div ref={bodyRef} className="flex flex-1 min-h-0 relative">

        {/* Map canvas area */}
        <div className="dot-grid flex-1 flex items-center justify-center">
          hi
        </div>

        {/* Drag handler */}
        <div
          onMouseDown={onDividerMouseDown}
          className="w-0.5 shrink-0 cursor-col-resize bg-[var(--border)] hover:bg-[var(--accent-red-soft)] transition-colors"
        />

        {/* Sidebar */}
        <div
          className="sidebar flex flex-col gap-5 p-4 overflow-y-auto shrink-0"
          style={{ width: sidebarWidth }}
        >
          hi
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
