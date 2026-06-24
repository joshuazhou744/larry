import { useState, useRef, useCallback } from 'react'
import Titlebar from './components/Titlebar'
import SettingsModal from './components/SettingsModal'
import Sidebar from './components/Sidebar'
import MapCanvas from './components/MapCanvas'

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
      const maxHalf = rect.width / 2
      setSidebarWidth(Math.max(SIDEBAR_MIN, Math.min(SIDEBAR_MAX, maxHalf, next)))
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
      <Titlebar onSettingsOpen={() => setSettingsOpen(true)} />
      <div ref={bodyRef} className="flex flex-1 min-h-0 relative">
        <MapCanvas />
        <div
          onMouseDown={onDividerMouseDown}
          className="w-0.5 shrink-0 cursor-col-resize bg-[var(--border)] hover:bg-[var(--accent-red-soft)] transition-colors"
        />
        <Sidebar width={sidebarWidth} />
        {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
      </div>
    </div>
  )
}
