import { useState, useEffect, useRef } from 'react'

export default function App() {
  const [markers, setMarkers] = useState([])
  const [screenshots, setScreenshots] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [opacity, setOpacity] = useState(0.85)
  const screenshotsRef = useRef([])
  screenshotsRef.current = screenshots

  useEffect(() => {
    window.api.onRenderLineup((data) => setMarkers(data.markers))

    window.api.onShowScreenshots(({ urls, opacity: op, index = 0 }) => {
      setScreenshots(urls)
      setCurrentIndex(index)
      setOpacity(op)
    })

    window.api.onNextScreenshot(() => {
      setCurrentIndex(i => {
        const next = (i + 1) % (screenshotsRef.current.length || 1)
        window.api.reportScreenshotIndex(next)
        return next
      })
    })
  }, [])

  const currentUrl = screenshots[currentIndex]

  return (
    <div className="w-screen h-screen relative pointer-events-none">
      {markers.map((m, i) => (
        <div
          key={i}
          className="absolute w-4 h-4 rounded-full border-2 border-yellow-400 bg-yellow-400/30"
          style={{ left: `${m.x * 100}%`, top: `${m.y * 100}%`, transform: 'translate(-50%, -50%)' }}
        />
      ))}

      {currentUrl && (
        <div className="absolute inset-0 flex items-center justify-center">
          <img
            src={currentUrl}
            style={{ opacity, maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
            draggable={false}
          />
          {screenshots.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5" style={{ opacity: 0.7 }}>
              {screenshots.map((_, i) => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: i === currentIndex ? '#fff' : 'rgba(255,255,255,0.35)' }}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
