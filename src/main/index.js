import { app, BrowserWindow, globalShortcut, ipcMain } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import koffi from 'koffi'

const user32 = koffi.load('user32.dll')
const GetForegroundWindow = user32.func('void * GetForegroundWindow()')
const SetForegroundWindow = user32.func('bool SetForegroundWindow(void *hwnd)')

let overlayWindow = null
let panelWindow = null
let savedForegroundHwnd = null

// 'hidden' | 'panel' | 'screenshot'
let appMode = 'hidden'
let lastMode = 'panel'
let lastScreenshotData = null

let toggleAppHotkey       = 'Alt+L'
let cycleHotkey           = 'Alt+N'
let exitHotkey            = 'Alt+X'
let decreaseOpacityHotkey = 'Alt+J'
let increaseOpacityHotkey = 'Alt+K'
let boxModeHotkey         = 'Alt+B'
let boxMode = false

// Shortcut handlers

function toggleApp() {
  if (panelWindow.isDestroyed()) return
  if (appMode === 'hidden') {
    if (lastMode === 'screenshot' && lastScreenshotData) {
      enterScreenshotMode(lastScreenshotData.images, lastScreenshotData.opacity, lastScreenshotData.index ?? 0, lastScreenshotData.boxMode ?? false)
    } else {
      showPanel()
    }
  } else if (appMode === 'panel') {
    lastMode = 'panel'
    hidePanel()
  } else { // screenshot
    lastMode = 'screenshot'
    overlayWindow.webContents.send('show-screenshots', { images: [] })
    appMode = 'hidden'
  }
}

function cycleOverlay() {
  if (appMode === 'screenshot') overlayWindow.webContents.send('next-screenshot')
}

function exitOverlay() {
  if (appMode === 'screenshot') exitScreenshotMode()
}

function toggleBoxMode() {
  if (appMode !== 'screenshot') return
  boxMode = !boxMode
  if (lastScreenshotData) lastScreenshotData.boxMode = boxMode
  overlayWindow.webContents.send('box-mode', boxMode)
}

function decreaseOpacity() {
  if (appMode !== 'screenshot' || !lastScreenshotData) return
  broadcastOpacity(Math.max(0.1, parseFloat((lastScreenshotData.opacity - 0.05).toFixed(2))))
}

function increaseOpacity() {
  if (appMode !== 'screenshot' || !lastScreenshotData) return
  broadcastOpacity(Math.min(1.0, parseFloat((lastScreenshotData.opacity + 0.05).toFixed(2))))
}

// Re-bind a global shortcut to a new key, reusing the same handler.
function rebind(oldKey, newKey, handler) {
  globalShortcut.unregister(oldKey)
  globalShortcut.register(newKey, handler)
}

function createOverlay() {
  overlayWindow = new BrowserWindow({
    transparent: true, frame: false, skipTaskbar: true, resizable: false,
    webPreferences: { preload: join(__dirname, '../preload/index.js'), sandbox: false }
  })
  overlayWindow.maximize()
  overlayWindow.setAlwaysOnTop(true, 'screen-saver')
  overlayWindow.setIgnoreMouseEvents(true)
  blockDevTools(overlayWindow)

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    overlayWindow.loadURL(process.env['ELECTRON_RENDERER_URL'] + '/overlay.html')
  } else {
    overlayWindow.loadFile(join(__dirname, '../renderer/overlay.html'))
  }
}

function createPanel() {
  panelWindow = new BrowserWindow({
    width: 900, height: 720, minWidth: 520, minHeight: 380,
    show: false, alwaysOnTop: true, resizable: true, frame: false,
    webPreferences: { preload: join(__dirname, '../preload/index.js'), sandbox: false }
  })
  panelWindow.on('close', (e) => { e.preventDefault(); hidePanel() })
  blockDevTools(panelWindow)

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    panelWindow.loadURL(process.env['ELECTRON_RENDERER_URL'] + '/panel.html')
  } else {
    panelWindow.loadFile(join(__dirname, '../renderer/panel.html'))
  }
}

function showPanel() {
  if (panelWindow.isDestroyed()) return
  savedForegroundHwnd = GetForegroundWindow()
  panelWindow.show()
  panelWindow.focus()
  appMode = 'panel'
}

function hidePanel() {
  panelWindow.hide()
  if (savedForegroundHwnd) { SetForegroundWindow(savedForegroundHwnd); savedForegroundHwnd = null }
  appMode = 'hidden'
}

// images: { url, annotations, boxes, note }[]
function enterScreenshotMode(images, opacity, index = 0, savedBoxMode = false) {
  boxMode = savedBoxMode
  panelWindow.hide()
  overlayWindow.webContents.send('show-screenshots', { images, opacity, index, boxMode })
  appMode = 'screenshot'
  lastScreenshotData = { images, opacity, index, boxMode }
}

function exitScreenshotMode() {
  overlayWindow.webContents.send('show-screenshots', { images: [] })
  showPanel()
}

function broadcastOpacity(next) {
  lastScreenshotData.opacity = next
  overlayWindow.webContents.send('set-opacity', next)
  panelWindow.webContents.send('opacity-changed', next)
}

function blockDevTools(win) {
  if (!is.dev) {
    win.webContents.on('before-input-event', (e, input) => {
      if (input.key === 'F12') e.preventDefault()
      if (input.control && input.shift && input.key === 'I') e.preventDefault()
    })
  }
}

app.whenReady().then(() => {
  createOverlay()
  createPanel()

  globalShortcut.register(toggleAppHotkey, toggleApp)
  globalShortcut.register(cycleHotkey, cycleOverlay)
  globalShortcut.register(exitHotkey, exitOverlay)
  globalShortcut.register(boxModeHotkey, toggleBoxMode)
  globalShortcut.register(decreaseOpacityHotkey, decreaseOpacity)
  globalShortcut.register(increaseOpacityHotkey, increaseOpacity)
})

app.on('will-quit', () => { globalShortcut.unregisterAll() })

ipcMain.on('set-lineup', (_, data) => { overlayWindow.webContents.send('render-lineup', data) })

ipcMain.on('panel-hide', () => hidePanel())

ipcMain.on('screenshot-index', (_, i) => {
  if (lastScreenshotData) lastScreenshotData.index = i
})

ipcMain.on('show-lineup-screenshots', (_, { images, opacity }) => {
  if (images.length > 0) enterScreenshotMode(images, opacity)
})

ipcMain.on('set-hotkey', (_, newKey) => {
  rebind(toggleAppHotkey, newKey, toggleApp)
  toggleAppHotkey = newKey
})

ipcMain.on('set-cycle-hotkey', (_, newKey) => {
  rebind(cycleHotkey, newKey, cycleOverlay)
  cycleHotkey = newKey
})

ipcMain.on('set-exit-hotkey', (_, newKey) => {
  rebind(exitHotkey, newKey, exitOverlay)
  exitHotkey = newKey
})

ipcMain.on('set-decrease-opacity-hotkey', (_, newKey) => {
  rebind(decreaseOpacityHotkey, newKey, decreaseOpacity)
  decreaseOpacityHotkey = newKey
})

ipcMain.on('set-increase-opacity-hotkey', (_, newKey) => {
  rebind(increaseOpacityHotkey, newKey, increaseOpacity)
  increaseOpacityHotkey = newKey
})

ipcMain.on('set-box-mode-hotkey', (_, newKey) => {
  rebind(boxModeHotkey, newKey, toggleBoxMode)
  boxModeHotkey = newKey
})
