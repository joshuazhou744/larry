import { IconX, IconSettings } from '@tabler/icons-react'
import TitlebarButton from './TitlebarButton'

export default function Titlebar({ onSettingsOpen }) {
  return (
    <div
      className="flex items-center justify-between h-9 px-3 bg-[var(--bg-titlebar)] border-b border-[var(--border)] shrink-0"
      style={{ WebkitAppRegion: 'drag' }}
    >
      <h1 className="text-md tracking-widest uppercase text-[var(--accent-red)] select-none">
        Larry
      </h1>
      <div className="flex items-center gap-1" style={{ WebkitAppRegion: 'no-drag' }}>
        <TitlebarButton title="Settings" onClick={onSettingsOpen}>
          <IconSettings size={14} stroke={1.5} />
        </TitlebarButton>
        <TitlebarButton title="Close (Alt+L)" onClick={() => window.api.hide()}>
          <IconX size={14} stroke={1.5} />
        </TitlebarButton>
      </div>
    </div>
  )
}
