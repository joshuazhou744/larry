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
    </div>
  )
}
