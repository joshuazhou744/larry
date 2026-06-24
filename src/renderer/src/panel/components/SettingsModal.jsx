import { useState, useRef } from 'react'
import { IconX } from '@tabler/icons-react'
import TitlebarButton from './TitlebarButton'

export default function SettingsModal({ onClose }) {
  return (
    <div className="absolute inset-0 bg-[var(--bg-overlay)] flex items-center justify-center z-50">
      <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg w-full max-w-md mx-4 flex flex-col">

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

function SettingRow({ label, children }) {
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
      className={`border rounded px-3 py-1 text-xs text-center cursor-pointer select-none outline-none transition-colors min-w-24 shrink-0 ${recording ? 'bg-[var(--accent-red-dim)] text-[var(--accent-red)] border-[var(--accent-red)]' : 'bg-[var(--bg-item)] text-[var(--text-primary)] border-[var(--border)] hover:bg-[var(--accent-red-soft)]'}`}
    >
      {recording ? 'Press keys…' : hotkey}
    </div>
  )
}
