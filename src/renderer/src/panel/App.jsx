import { useState } from 'react'

const TEST_LINEUP = {
  name: 'Test Lineup',
  markers: [
    { x: 0.5,  y: 0.5,  label: 'Stand here' },
    { x: 0.52, y: 0.38, label: 'Aim here' },
  ]
}

export default function App() {
  const [active, setActive] = useState(false)

  function sendLineup() {
    window.api.setLineup(TEST_LINEUP)
    setActive(true)
  }

  function clearLineup() {
    window.api.setLineup({ markers: [] })
    setActive(false)
  }

  return (
    <div className="bg-gray-950 text-white min-h-screen p-5 flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-bold tracking-wide">Larry</h1>
        <p className="text-gray-500 text-xs mt-1">Alt+L to toggle this panel</p>
      </div>

      <hr className="border-gray-800" />

      <div className="flex flex-col gap-2">
        <p className="text-gray-400 text-sm">Map / Agent / Lineup selectors go here</p>
        <button
          onClick={sendLineup}
          className="bg-red-600 hover:bg-red-500 text-white text-sm font-medium py-2 px-4 rounded"
        >
          Send test lineup to overlay
        </button>
        <button
          onClick={clearLineup}
          className="bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium py-2 px-4 rounded"
        >
          Clear overlay
        </button>
        {active && <p className="text-green-400 text-xs">Lineup active on overlay</p>}
      </div>
    </div>
  )
}
