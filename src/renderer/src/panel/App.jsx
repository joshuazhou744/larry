import { useState, useRef, useCallback, useEffect } from 'react'
import { fetchAgents, fetchMaps, getMapRotation } from '../lib/valorant'
import { dbFetchLineups, fetchImages } from '../lib/lineups-db'
import Titlebar from './components/Titlebar'
import SettingsModal from './components/SettingsModal'
import Sidebar from './components/Sidebar'
import MapCanvas from './components/MapCanvas'

const SIDEBAR_MIN = 200
const SIDEBAR_MAX = 520
const SIDEBAR_DEFAULT = 320

export default function App() {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(SIDEBAR_DEFAULT)
  const bodyRef = useRef(null)

  const [agents, setAgents] = useState([])
  const [maps, setMaps] = useState([])
  const [lineups, setLineups] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [selectedMapId, setSelectedMapId] = useState('')
  const [side, setSide] = useState('attack')
  const [selectedAgentId, setSelectedAgentId] = useState(null)
  const [selectedAbilitySlot, setSelectedAbilitySlot] = useState(null)
  const [selectedLineupId, setSelectedLineupId] = useState(null)
  const [screenshotOpacity, setScreenshotOpacity] = useState(
    () => parseFloat(localStorage.getItem('screenshot-opacity') ?? '0.85')
  )

  useEffect(() => {
    window.api.onOpacityChanged((val) => {
      setScreenshotOpacity(val)
      localStorage.setItem('screenshot-opacity', val)
    })
  }, [])

  useEffect(() => {
    async function load() {
      try {
        const [[a, m], dbLineups] = await Promise.all([
          Promise.all([fetchAgents(), fetchMaps()]),
          dbFetchLineups(),
        ])
        setAgents(a)
        setMaps(m)
        setLineups(dbLineups)
        setSelectedMapId(m[0]?.uuid ?? '')
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const currentMap = maps.find(m => m.uuid === selectedMapId) ?? null
  const rotation = getMapRotation(currentMap?.name ?? '', side)

  const visibleLineups = lineups.filter(l =>
    l.mapId === selectedMapId &&
    l.side === side &&
    l.agentId === selectedAgentId &&
    (!selectedAbilitySlot || l.abilitySlot === selectedAbilitySlot)
  )

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

  async function handleLineupSelect(lineupId) {
    setSelectedLineupId(lineupId)
    if (!lineupId) return
    const lineup = lineups.find(l => l.id === lineupId)
    try {
      const images = await fetchImages(lineupId)
      if (images.length > 0) {
          window.api.showLineupScreenshots(
          images.map(img => ({ url: img.publicUrl, annotations: img.annotations ?? [] })),
          screenshotOpacity
        )
      }
    } catch (e) {
      console.error('fetchImages failed:', e)
    }
  }

  function handleOpacityChange(val) {
    setScreenshotOpacity(val)
    localStorage.setItem('screenshot-opacity', val)
  }

  function handleSelectAgent(agentId) {
    setSelectedAgentId(prev => prev === agentId ? null : agentId)
    setSelectedAbilitySlot(null)
    setSelectedLineupId(null)
  }

  function handleSelectAbility(agentId, slot) {
    const same = selectedAgentId === agentId && selectedAbilitySlot === slot
    setSelectedAgentId(agentId)
    setSelectedAbilitySlot(same ? null : slot)
    setSelectedLineupId(null)
  }

  if (loading) return (
    <div className="flex flex-col h-screen bg-[var(--bg-base)]">
      <Titlebar onSettingsOpen={() => setSettingsOpen(true)} />
      <div className="flex-1 flex items-center justify-center text-[var(--text-dim)] text-xs tracking-widest uppercase">
        Loading…
      </div>
      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
    </div>
  )

  if (error) return (
    <div className="flex flex-col h-screen bg-[var(--bg-base)]">
      <Titlebar onSettingsOpen={() => setSettingsOpen(true)} />
      <div className="flex-1 flex items-center justify-center text-[var(--accent-red)] text-xs">{error}</div>
      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
    </div>
  )

  return (
    <div className="flex flex-col h-screen bg-[var(--bg-base)]">
      <Titlebar onSettingsOpen={() => setSettingsOpen(true)} />

      <div ref={bodyRef} className="flex flex-1 min-h-0 relative">
        <MapCanvas
          map={currentMap}
          lineups={visibleLineups}
          selectedId={selectedLineupId}
          rotation={rotation}
          onSelect={handleLineupSelect}
          onDeselect={() => setSelectedLineupId(null)}
        />

        <div
          onMouseDown={onDividerMouseDown}
          className="w-0.5 shrink-0 cursor-col-resize bg-[var(--border)] hover:bg-[var(--accent-red-soft)] transition-colors"
        />

        <Sidebar
          width={sidebarWidth}
          maps={maps}
          agents={agents}
          lineups={visibleLineups}
          selectedMapId={selectedMapId}
          side={side}
          selectedAgentId={selectedAgentId}
          selectedAbilitySlot={selectedAbilitySlot}
          selectedLineupId={selectedLineupId}
          onSelectMap={(id) => { setSelectedMapId(id); setSelectedLineupId(null) }}
          onToggleSide={() => { setSide(prev => prev === 'attack' ? 'defense' : 'attack'); setSelectedLineupId(null) }}
          onSelectAgent={handleSelectAgent}
          onSelectAbility={handleSelectAbility}
          onSelectLineup={setSelectedLineupId}
        />

        {settingsOpen && (
          <SettingsModal
            onClose={() => setSettingsOpen(false)}
            screenshotOpacity={screenshotOpacity}
            onOpacityChange={handleOpacityChange}
          />
        )}
      </div>
    </div>
  )
}
