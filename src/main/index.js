import { app, BrowserWindow, globalShortcut, ipcMain } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'

let overlayWindow = null
let panelWindow = null

function createOverlay() {
  overlayWindow = new BrowserWindow({
    transparent: true,   // invisible window background
    frame: false,        // no titlebar/borders
    skipTaskbar: true,   // don't show in taskbar
    resizable: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  overlayWindow.maximize()
  overlayWindow.setAlwaysOnTop(true, 'screen-saver') // renders above game window
  overlayWindow.setIgnoreMouseEvents(true)            // fully click-through

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    overlayWindow.loadURL(process.env['ELECTRON_RENDERER_URL'] + '/overlay.html')
  } else {
    overlayWindow.loadFile(join(__dirname, '../renderer/overlay.html'))
  }
}

function createPanel() {
  panelWindow = new BrowserWindow({
    width: 380,
    height: 580,
    show: false,          // hidden until Alt+L
    alwaysOnTop: true,
    resizable: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    panelWindow.loadURL(process.env['ELECTRON_RENDERER_URL'] + '/panel.html')
  } else {
    panelWindow.loadFile(join(__dirname, '../renderer/panel.html'))
  }
}

app.whenReady().then(() => {
  createOverlay()
  createPanel()

  // Alt+L toggles the panel — works even when game is focused
  globalShortcut.register('Alt+L', () => {
    if (panelWindow.isVisible()) {
      panelWindow.hide()
    } else {
      panelWindow.show()
      panelWindow.focus()
    }
  })
})

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})

// Panel sends a lineup selection → relay it to the overlay
ipcMain.on('set-lineup', (_, data) => {
  overlayWindow.webContents.send('render-lineup', data)
})
