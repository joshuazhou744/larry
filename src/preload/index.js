import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('api', {
  // Lineup overlay markers
  setLineup:      (data) => ipcRenderer.send('set-lineup', data),
  onRenderLineup: (cb)   => ipcRenderer.on('render-lineup', (_, data) => cb(data)),

  // Panel controls
  hide:       () => ipcRenderer.send('panel-hide'),
  setHotkey:  (key) => ipcRenderer.send('set-hotkey', key),

  // Screenshot overlay
  showLineupScreenshots: (images, opacity, notes) => ipcRenderer.send('show-lineup-screenshots', { images, opacity, notes }),
  setCycleHotkey: (key) => ipcRenderer.send('set-cycle-hotkey', key),
  setExitHotkey:  (key) => ipcRenderer.send('set-exit-hotkey', key),

  // Overlay → renderer
  onShowScreenshots:          (cb) => ipcRenderer.on('show-screenshots', (_, data) => cb(data)),
  onBoxMode:                  (cb) => ipcRenderer.on('box-mode', (_, val) => cb(val)),
  onNextScreenshot:           (cb) => ipcRenderer.on('next-screenshot', () => cb()),
  onSetOpacity:               (cb) => ipcRenderer.on('set-opacity', (_, val) => cb(val)),
  onOpacityChanged:           (cb) => ipcRenderer.on('opacity-changed', (_, val) => cb(val)),
  reportScreenshotIndex:      (i)  => ipcRenderer.send('screenshot-index', i),
  setDecreaseOpacityHotkey:   (k)  => ipcRenderer.send('set-decrease-opacity-hotkey', k),
  setIncreaseOpacityHotkey:   (k)  => ipcRenderer.send('set-increase-opacity-hotkey', k),
  setBoxModeHotkey:           (k)  => ipcRenderer.send('set-box-mode-hotkey', k),
})
