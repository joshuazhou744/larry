import { useState, useEffect } from 'react'

export default function App() {
  const [markers, setMarkers] = useState([])

  useEffect(() => {
    window.api.onRenderLineup((data) => {
      setMarkers(data.markers)
    })
  }, [])

  return (
    <div className="w-screen h-screen relative pointer-events-none">
      {/* Test crosshair in center, remove once real lineups are wired up */}
      {/* <div
        className="absolute w-6 h-6 rounded-full border-2 border-red-500"
        style={{
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          opacity: 0.85
        }}
      /> */}

      {markers.map((marker, i) => (
        <div
          key={i}
          className="absolute"
          style={{ left: `${marker.x * 100}%`, top: `${marker.y * 100}%`, transform: 'translate(-50%, -50%)' }}
        >
          <div className="w-5 h-5 rounded-full border-2 border-yellow-400" style={{ opacity: 0.9 }} />
          {marker.label && (
            <span className="absolute top-6 left-1/2 -translate-x-1/2 text-yellow-300 text-xs whitespace-nowrap">
              {marker.label}
            </span>
          )}
        </div>
      ))}
    </div>
  )
}
