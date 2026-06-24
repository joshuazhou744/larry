import { useState } from 'react'
import { IconChevronDown, IconRefresh } from '@tabler/icons-react'

export default function Sidebar({
  width,
  maps, agents, lineups,
  selectedMapId, side, selectedAgentId, selectedAbilitySlot, selectedLineupId,
  onSelectMap, onToggleSide, onSelectAgent, onSelectAbility, onSelectLineup,
}) {
  const [mapListOpen, setMapListOpen] = useState(false)
  const [iconSpinning, setIconSpinning] = useState(false)

  const currentMap = maps.find(m => m.uuid === selectedMapId)

  function handleToggleSide() {
    setIconSpinning(true)
    onToggleSide()
  }

  return (
    <div className="sidebar flex flex-col overflow-hidden shrink-0" style={{ width }}>

      {/* Map header + Attack/Defense toggle */}
      <div className="flex shrink-0 border-b border-[var(--border)]" style={{ height: 72 }}>
        <button
          onClick={() => setMapListOpen(o => !o)}
          className="relative flex flex-1 items-center overflow-hidden transition-all hover:brightness-110"
        >
          {currentMap?.splash && (
            <img src={currentMap.splash} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
          <div className="relative flex flex-1 items-center gap-2 px-4">
            <span className="font-[Oswald,sans-serif] text-xl font-bold uppercase tracking-widest text-white drop-shadow-lg">
              {currentMap?.name ?? 'Select Map'}
            </span>
            <IconChevronDown
              size={14}
              className={`text-white/60 transition-transform duration-200 ${mapListOpen ? 'rotate-180' : ''}`}
            />
          </div>
        </button>

        <button
          onClick={handleToggleSide}
          className={`flex w-16 shrink-0 flex-col items-center justify-center gap-1 border-l border-[var(--border)] transition hover:brightness-110 ${side === 'attack' ? 'bg-[var(--accent-red-dim)]' : 'bg-[var(--accent-teal)]/10'}`}
        >
          <IconRefresh
            size={14}
            className={`text-[var(--text-muted)] ${iconSpinning ? 'animate-spin-once' : ''}`}
            onAnimationEnd={() => setIconSpinning(false)}
          />
          <span className={`font-[Oswald,sans-serif] text-xs font-semibold uppercase tracking-wider ${side === 'attack' ? 'text-[var(--accent-red)]' : 'text-[var(--accent-teal)]'}`}>
            {side === 'attack' ? 'Atk' : 'Def'}
          </span>
        </button>
      </div>

      {/* Map dropdown — absolutely positioned so it overlays content below */}
      <div style={{
        position: 'absolute', top: 72, right: 0, left: 0, zIndex: 40,
        overflow: 'hidden',
        maxHeight: mapListOpen ? `${maps.length * 44}px` : '0px',
        opacity: mapListOpen ? 1 : 0,
        pointerEvents: mapListOpen ? 'auto' : 'none',
        transition: mapListOpen
          ? 'max-height 0.18s cubic-bezier(0.4,0,0.2,1), opacity 0.12s ease-out'
          : 'max-height 0.14s cubic-bezier(0.4,0,0.2,1), opacity 0.1s ease-in',
        background: 'linear-gradient(180deg, hsl(218 26% 9%), hsl(218 28% 7%))',
        borderBottom: '1px solid var(--border)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
      }}>
        {maps.map(m => (
          <button
            key={m.uuid}
            onClick={() => { onSelectMap(m.uuid); setMapListOpen(false) }}
            className={`relative flex w-full items-center overflow-hidden border-b border-[var(--border)]/30 last:border-0 transition-[filter] hover:brightness-110 ${m.uuid === selectedMapId ? 'ring-1 ring-inset ring-[var(--accent-red)]/50' : ''}`}
            style={{ height: 44 }}
          >
            {m.splash && <img src={m.splash} alt="" className="absolute inset-0 h-full w-full object-cover opacity-35" />}
            <div className="absolute inset-0 bg-gradient-to-r from-black/55 to-transparent" />
            <span className="relative px-4 font-[Oswald,sans-serif] text-base font-bold uppercase tracking-widest text-white drop-shadow">
              {m.name}
            </span>
            {m.uuid === selectedMapId && (
              <span className="relative ml-auto mr-4 h-2 w-2 rounded-full bg-[var(--accent-red)]" />
            )}
          </button>
        ))}
      </div>

      {/* Agent + ability list */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-3 pt-3 pb-3">
          <p className="mb-2 font-[Oswald,sans-serif] text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
            Select Lineup
          </p>
          <div className="flex flex-col gap-0.5">
            {agents.map(agent => {
              const isAgentSelected = agent.uuid === selectedAgentId
              return (
                <div key={agent.uuid}>
                  <button
                    onClick={() => onSelectAgent(agent.uuid)}
                    className={`w-full rounded px-3 py-2 text-left font-[Rajdhani,sans-serif] text-base font-semibold transition-all ${isAgentSelected ? 'bg-[var(--bg-item)] text-[var(--text-primary)]' : 'text-[var(--text-muted)] hover:bg-[var(--bg-item)]/60 hover:text-[var(--text-primary)]'}`}
                  >
                    {agent.name}
                  </button>

                  <div style={{
                    overflow: 'hidden',
                    maxHeight: isAgentSelected ? `${agent.abilities.length * 44}px` : '0px',
                    opacity: isAgentSelected ? 1 : 0,
                    transition: isAgentSelected
                      ? 'max-height 0.3s cubic-bezier(0.4,0,0.2,1), opacity 0.2s ease-out'
                      : 'max-height 0.2s cubic-bezier(0.4,0,0.2,1), opacity 0.1s ease-in',
                  }}>
                    <div className="ml-3 mt-0.5 mb-0.5 flex flex-col gap-0.5">
                      {agent.abilities.map(ab => {
                        const isAbilitySelected = isAgentSelected && ab.slot === selectedAbilitySlot
                        return (
                          <button
                            key={ab.slot}
                            onClick={() => onSelectAbility(agent.uuid, ab.slot)}
                            className={`flex w-full items-center gap-2 rounded px-3 py-2 text-left font-[Rajdhani,sans-serif] text-sm font-semibold transition-all ${isAbilitySelected ? 'bg-[var(--accent-teal)]/20 text-[var(--accent-teal)]' : 'text-[var(--text-muted)] hover:bg-[var(--bg-item)]/60 hover:text-[var(--text-primary)]'}`}
                          >
                            <img
                              src={ab.icon}
                              alt=""
                              className="h-4 w-4 shrink-0 object-contain"
                              style={{ filter: isAbilitySelected ? 'none' : 'brightness(0.55) invert(1)' }}
                            />
                            <span>{ab.name}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

    </div>
  )
}
