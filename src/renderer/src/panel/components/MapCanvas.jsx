import { useRef } from 'react'

function clamp01(v) { return Math.max(0, Math.min(1, v)) }

export default function MapCanvas({ map, lineups = [], selectedId, rotation, onSelect, onDeselect }) {
  const squareRef = useRef(null)

  if (!map) return (
    <div className="dot-grid flex-1 flex items-center justify-center">
      <span className="text-xs tracking-widest uppercase text-[var(--text-dim)]">No map selected</span>
    </div>
  )

  return (
    <div className="dot-grid flex-1 min-h-0 relative" style={{ containerType: 'size' }}>
      <div className="grid h-full w-full place-items-center p-4" onClick={onDeselect}>
        <div
          ref={squareRef}
          className="relative select-none overflow-hidden cursor-default"
          style={{
            width: 'min(calc(100cqw - 2rem), calc(100cqh - 2rem))',
            height: 'min(calc(100cqw - 2rem), calc(100cqh - 2rem))',
          }}
        >
          <img
            src={map.minimap}
            alt={`${map.name} minimap`}
            draggable={false}
            className="minimap-tint pointer-events-none absolute inset-0 h-full w-full object-contain p-3 transition-transform duration-300"
            style={{ transform: `rotate(${rotation}deg)` }}
          />

          {/* SVG lines */}
          <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <marker id="arrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 z" fill="context-stroke" />
              </marker>
            </defs>
            {lineups.map((l) => {
              const active = l.id === selectedId
              return (
                <line
                  key={l.id}
                  x1={l.stand.x * 100} y1={l.stand.y * 100}
                  x2={l.land.x * 100}  y2={l.land.y * 100}
                  stroke={l.color}
                  strokeWidth={active ? 2.4 : 1.6}
                  strokeOpacity={active ? 0.95 : 0.6}
                  strokeDasharray={active ? '0' : '3 2.5'}
                  vectorEffect="non-scaling-stroke"
                  markerEnd="url(#arrow)"
                  style={{ transition: 'stroke-opacity .15s' }}
                />
              )
            })}
          </svg>

          {/* Markers */}
          {lineups.map((l) => {
            const active = l.id === selectedId
            return (
              <div key={l.id} className="absolute inset-0">
                {/* LAND */}
                <div
                  className="absolute cursor-pointer"
                  onClick={(e) => { e.stopPropagation(); onSelect(l.id) }}
                  style={{ left: `${l.land.x * 100}%`, top: `${l.land.y * 100}%`, transform: 'translate(-50%, -50%)', zIndex: active ? 30 : 12 }}
                >
                  <span
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                    style={{ width: 54, height: 54, background: `${l.color}26`, border: `1.5px solid ${l.color}`, boxShadow: active ? `0 0 18px ${l.color}88` : 'none' }}
                  />
                  <div
                    className="relative flex h-8 w-8 items-center justify-center rounded-md shadow-lg"
                    style={{ borderWidth: 1, borderStyle: 'solid', borderColor: l.color, background: 'hsl(218 26% 8%)' }}
                  >
                    <img src={l.abilityIcon} alt={l.abilityName} draggable={false} className="h-5 w-5 object-contain" />
                  </div>
                  {l.title && (
                    <div
                      className="clip-tag absolute left-1/2 top-[calc(100%+10px)] w-max max-w-[180px] -translate-x-1/2 px-2.5 py-1 text-center text-xs font-medium leading-tight shadow-lg"
                      style={{ background: 'hsl(218 26% 8% / 0.95)', color: 'var(--text-primary)', borderLeft: `3px solid ${l.color}`, fontFamily: 'Rajdhani, sans-serif' }}
                    >
                      {l.title}
                    </div>
                  )}
                </div>

                {/* STAND */}
                <div
                  className="absolute flex items-center justify-center rounded-md cursor-pointer shadow-lg"
                  onClick={(e) => { e.stopPropagation(); onSelect(l.id) }}
                  style={{ left: `${l.stand.x * 100}%`, top: `${l.stand.y * 100}%`, transform: 'translate(-50%, -50%)', width: 34, height: 34, borderWidth: 2, borderStyle: 'solid', borderColor: active ? l.color : 'hsl(218 26% 8%)', background: 'hsl(218 26% 8%)', zIndex: active ? 31 : 13 }}
                >
                  <img src={l.agentIcon} alt={l.agentName} draggable={false} className="h-full w-full rounded-[3px] object-cover" />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
