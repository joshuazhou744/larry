import { contextBridge, ipcRenderer } from 'electron'

// Expose safe IPC methods to renderer processes via window.api
contextBridge.exposeInMainWorld('api', {
  // Panel calls this to push a lineup selection to the overlay
  setLineup: (data) => ipcRenderer.send('set-lineup', data),

  // Overlay calls this to listen for lineup selections from the panel
  onRenderLineup: (callback) => ipcRenderer.on('render-lineup', (_, data) => callback(data))
})
