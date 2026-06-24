import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('api', {
  // Lineup overlay markers
  setLineup:      (data) => ipcRenderer.send('set-lineup', data),
  onRenderLineup: (cb)   => ipcRenderer.on('render-lineup', (_, data) => cb(data)),

  // Panel controls
  hide:       () => ipcRenderer.send('panel-hide'),
  setHotkey:  (key) => ipcRenderer.send('set-hotkey', key),

  // Screenshot overlay
  showLineupScreenshots: (urls, opacity) => ipcRenderer.send('show-lineup-screenshots', { urls, opacity }),
  setCycleHotkey: (key) => ipcRenderer.send('set-cycle-hotkey', key),
  setExitHotkey:  (key) => ipcRenderer.send('set-exit-hotkey', key),

  // Overlay → renderer
  onShowScreenshots:      (cb) => ipcRenderer.on('show-screenshots', (_, data) => cb(data)),
  onNextScreenshot:       (cb) => ipcRenderer.on('next-screenshot', () => cb()),
  reportScreenshotIndex:  (i)  => ipcRenderer.send('screenshot-index', i),
})
