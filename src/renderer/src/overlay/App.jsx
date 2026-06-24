import { useState, useEffect, useLayoutEffect, useRef } from 'react'

export default function App() {
  const [images, setImages] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [opacity, setOpacity] = useState(0.85)
  const [imgSize, setImgSize] = useState({ w: 0, h: 0 })
  const [boxMode, setBoxMode] = useState(false)
  const imagesRef = useRef([])
  imagesRef.current = images
  const imgRef = useRef(null)

  useEffect(() => {
    window.api.onRenderLineup(() => {})

    window.api.onShowScreenshots(({ images: imgs = [], opacity: op, index = 0, boxMode: bm = false }) => {
      setImages(imgs)
      setCurrentIndex(index)
      setOpacity(op)
      setBoxMode(bm)
      setImgSize({ w: 0, h: 0 })
    })

    window.api.onSetOpacity((val) => setOpacity(val))

    window.api.onBoxMode((val) => setBoxMode(val))

    window.api.onNextScreenshot(() => {
      setCurrentIndex(i => {
        const next = (i + 1) % (imagesRef.current.length || 1)
        window.api.reportScreenshotIndex(next)
        return next
      })
    })
  }, [])

  useLayoutEffect(() => {
    if (!imgRef.current) return
    const obs = new ResizeObserver(() => {
      if (imgRef.current)
        setImgSize({ w: imgRef.current.clientWidth, h: imgRef.current.clientHeight })
    })
    obs.observe(imgRef.current)
    return () => obs.disconnect()
  }, [currentIndex, images.length])

  const currentImage = images[currentIndex]
  const boxes = currentImage?.boxes ?? []

  // In box mode, mask the image so only the box regions stay visible.
  let maskStyle = {}
  if (boxMode && boxes.length > 0 && imgSize.w > 0) {
    const layers = boxes.map(() => 'linear-gradient(#000 0 0)').join(',')
    const position = boxes.map(b => `${b.x * imgSize.w}px ${b.y * imgSize.h}px`).join(',')
    const size = boxes.map(b => `${b.w * imgSize.w}px ${b.h * imgSize.h}px`).join(',')
    maskStyle = {
      WebkitMaskImage: layers,
      WebkitMaskPosition: position,
      WebkitMaskSize: size,
      WebkitMaskRepeat: 'no-repeat',
      maskImage: layers,
      maskPosition: position,
      maskSize: size,
      maskRepeat: 'no-repeat',
    }
  }

  return (
    <div className="w-screen h-screen relative pointer-events-none">
      {currentImage && (
        <div className="absolute inset-0 flex flex-col items-start justify-start">
          <div className="relative select-none" style={{ width: '100%', opacity }}>

            {/* Image + annotations */}
            <div className="relative" style={{ width: '100%', ...maskStyle }}>
              <img
                ref={imgRef}
                src={currentImage.url}
                style={{ width: '100%', height: 'auto', display: 'block' }}
                draggable={false}
              />

              {imgSize.w > 0 && (
                <svg
                  className="absolute inset-0"
                  style={{ width: imgSize.w, height: imgSize.h, pointerEvents: 'none' }}
                >
                  {(currentImage.annotations ?? []).map((a, i) =>
                    a.type === 'stroke' ? (
                      <path
                        key={i}
                        d={a.points.map((p, j) => `${j === 0 ? 'M' : 'L'}${p.x * imgSize.w},${p.y * imgSize.h}`).join(' ')}
                        fill="none"
                        stroke={a.color}
                        strokeWidth={a.width}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    ) : a.type === 'circle' ? (
                      <circle
                        key={i}
                        cx={a.x * imgSize.w}
                        cy={a.y * imgSize.h}
                        r={a.r * imgSize.w}
                        fill="none"
                        stroke={a.color}
                        strokeWidth={a.width}
                      />
                    ) : null
                  )}
                </svg>
              )}
            </div>

            {/* Box borders */}
            {imgSize.w > 0 && boxes.map((box, i) => (
              <div
                key={box.id ?? i}
                style={{
                  position: 'absolute',
                  left: box.x * imgSize.w,
                  top: box.y * imgSize.h,
                  width: box.w * imgSize.w,
                  height: box.h * imgSize.h,
                  border: `2px solid ${box.color}`,
                  boxSizing: 'border-box',
                  pointerEvents: 'none',
                }}
              />
            ))}
          </div>

          <div className="absolute bottom-4 left-4 flex items-baseline gap-4 text-2xl text-white" style={{ fontFamily: 'Oswald, sans-serif' }}>
            {images.length > 1 && (
              <span style={{ opacity: 0.7 }}>{currentIndex + 1} / {images.length}</span>
            )}
            {currentImage?.note && <span>{currentImage.note}</span>}
          </div>
        </div>
      )}
    </div>
  )
}
