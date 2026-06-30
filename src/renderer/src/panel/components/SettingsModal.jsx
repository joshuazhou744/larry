import { useState, useRef } from 'react'
import { IconX } from '@tabler/icons-react'
import TitlebarButton from './TitlebarButton'

export default function SettingsModal({ onClose, screenshotOpacity, onOpacityChange }) {
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

          <SettingsSection label="Keybinds (must start with Alt)">
            <SettingRow label="Toggle Larry">
              <HotkeyInput defaultKey="Alt+L" onCommit={(k) => window.api.setHotkey(k)} />
            </SettingRow>
            <SettingRow label="Cycle overlay">
              <HotkeyInput defaultKey="Alt+N" onCommit={(k) => window.api.setCycleHotkey(k)} />
            </SettingRow>
            <SettingRow label="Exit overlay mode">
              <HotkeyInput defaultKey="Alt+X" onCommit={(k) => window.api.setExitHotkey(k)} />
            </SettingRow>
            <SettingRow label="Decrease overlay opacity">
              <HotkeyInput defaultKey="Alt+J" onCommit={(k) => window.api.setDecreaseOpacityHotkey(k)} />
            </SettingRow>
            <SettingRow label="Increase overlay opacity">
              <HotkeyInput defaultKey="Alt+K" onCommit={(k) => window.api.setIncreaseOpacityHotkey(k)} />
            </SettingRow>
            <SettingRow label="Minimum overlay opacity">
              <HotkeyInput defaultKey="Alt+O" onCommit={(k) => window.api.setMinOpacityHotkey(k)} />
            </SettingRow>
            <SettingRow label="Maximum overlay opacity">
              <HotkeyInput defaultKey="Alt+P" onCommit={(k) => window.api.setMaxOpacityHotkey(k)} />
            </SettingRow>
            <SettingRow label="Toggle box mode">
              <HotkeyInput defaultKey="Alt+B" onCommit={(k) => window.api.setBoxModeHotkey(k)} />
            </SettingRow>
          </SettingsSection>

          <SettingsSection label="Overlay">
            <SettingRow label={`Opacity — ${Math.round(screenshotOpacity * 100)}%`}>
              <input
                type="range"
                min={0.1} max={1} step={0.05}
                value={screenshotOpacity}
                onChange={(e) => onOpacityChange(parseFloat(e.target.value))}
                className="w-32 accent-[var(--accent-red)] cursor-pointer"
              />
            </SettingRow>
          </SettingsSection>

          <SettingsSection label="Medal Clipping">
            <SettingRow label="Clip medal">
              <HotkeyInput defaultKey="Alt+M" onCommit={(k) => window.api.setClipMedalHotkey(k)} />
            </SettingRow>
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

function HotkeyInput({ defaultKey, onCommit }) {
  const [hotkey, setHotkey] = useState(defaultKey)
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
    onCommit(combo)
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
