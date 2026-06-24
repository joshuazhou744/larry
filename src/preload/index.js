import { contextBridge, ipcRenderer } from 'electron'

// Expose safe IPC methods to renderer processes via window.api
contextBridge.exposeInMainWorld('api', {
  setLineup:      (data) => ipcRenderer.send('set-lineup', data),
  onRenderLineup: (callback) => ipcRenderer.on('render-lineup', (_, data) => callback(data)),

  // Custom titlebar controls
  hide:     () => ipcRenderer.send('panel-hide'),
})
