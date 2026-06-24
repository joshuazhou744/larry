import { app, BrowserWindow, globalShortcut, ipcMain } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import koffi from 'koffi'

// Win32 — save/restore foreground window across panel toggle
const user32 = koffi.load('user32.dll')
const GetForegroundWindow = user32.func('void * GetForegroundWindow()')
const SetForegroundWindow = user32.func('bool SetForegroundWindow(void *hwnd)')

let overlayWindow = null
let panelWindow = null
let savedForegroundHwnd = null

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
  blockDevTools(overlayWindow)
}

function createPanel() {
  panelWindow = new BrowserWindow({
    width: 900,
    height: 720,
    minWidth: 520,
    minHeight: 380,
    show: false,          // hidden until Alt+L
    alwaysOnTop: true,
    resizable: true,
    frame: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  // Hide instead of destroy on close (Ctrl+W, close button, etc.)
  panelWindow.on('close', (e) => {
    e.preventDefault()
    hidePanel()
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    panelWindow.loadURL(process.env['ELECTRON_RENDERER_URL'] + '/panel.html')
  } else {
    panelWindow.loadFile(join(__dirname, '../renderer/panel.html'))
  }
  blockDevTools(panelWindow)
}

function blockDevTools(win) {
  if (!is.dev) {
    win.webContents.on('before-input-event', (e, input) => {
      if (input.key == 'F12') e.preventDefault()
      if (input.control && input.shift && input.key == 'I') e.preventDefault()
    })
  }
}

app.whenReady().then(() => {
  createOverlay()
  createPanel()


  // Alt+L toggles the panel — works even when game is focused
  globalShortcut.register('Alt+L', () => {
    if (panelWindow.isDestroyed()) return
    if (panelWindow.isVisible()) {
      hidePanel()
    } else {
      savedForegroundHwnd = GetForegroundWindow()  // save before stealing focus
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

// Custom titlebar window controls

ipcMain.on('panel-hide', () => hidePanel())

let currentHotkey = 'Alt+L'
ipcMain.on('set-hotkey', (_, newKey) => {
  globalShortcut.unregister(currentHotkey)
  currentHotkey = newKey
  globalShortcut.register(currentHotkey, () => {
    if (panelWindow.isDestroyed()) return
    if (panelWindow.isVisible()) {
      hidePanel()
    } else {
      savedForegroundHwnd = GetForegroundWindow()
      panelWindow.show()
      panelWindow.focus()
    }
  })
})

function hidePanel() {
  panelWindow.hide()
  if (savedForegroundHwnd) {
    SetForegroundWindow(savedForegroundHwnd)
    savedForegroundHwnd = null
  }
}
