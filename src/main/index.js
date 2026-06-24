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

let toggleHotkey = 'Alt+L'
let cycleHotkey  = 'Alt+N'
let exitHotkey   = 'Alt+X'

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

function enterScreenshotMode(urls, opacity, index = 0) {
  panelWindow.hide()
  overlayWindow.webContents.send('show-screenshots', { urls, opacity, index })
  appMode = 'screenshot'
  lastScreenshotData = { urls, opacity, index }
}

function exitScreenshotMode() {
  overlayWindow.webContents.send('show-screenshots', { urls: [], opacity: 1 })
  showPanel()
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

  globalShortcut.register(toggleHotkey, () => {
    if (panelWindow.isDestroyed()) return
    if (appMode === 'hidden') {
      if (lastMode === 'screenshot' && lastScreenshotData) {
        enterScreenshotMode(lastScreenshotData.urls, lastScreenshotData.opacity, lastScreenshotData.index ?? 0)
      } else {
        showPanel()
      }
    } else if (appMode === 'panel') {
      lastMode = 'panel'
      hidePanel()
    } else { // screenshot
      lastMode = 'screenshot'
      overlayWindow.webContents.send('show-screenshots', { urls: [], opacity: 1 })
      appMode = 'hidden'
    }
  })

  globalShortcut.register(cycleHotkey, () => {
    if (appMode === 'screenshot') overlayWindow.webContents.send('next-screenshot')
  })

  globalShortcut.register(exitHotkey, () => {
    if (appMode === 'screenshot') exitScreenshotMode()
  })
})

app.on('will-quit', () => { globalShortcut.unregisterAll() })

ipcMain.on('set-lineup', (_, data) => { overlayWindow.webContents.send('render-lineup', data) })

ipcMain.on('panel-hide', () => hidePanel())

ipcMain.on('screenshot-index', (_, i) => {
  if (lastScreenshotData) lastScreenshotData.index = i
})

ipcMain.on('show-lineup-screenshots', (_, { urls, opacity }) => {
  if (urls.length > 0) enterScreenshotMode(urls, opacity)
})

ipcMain.on('set-hotkey', (_, newKey) => {
  globalShortcut.unregister(toggleHotkey)
  toggleHotkey = newKey
  globalShortcut.register(toggleHotkey, () => {
    if (panelWindow.isDestroyed()) return
    if (appMode === 'hidden') {
      if (lastMode === 'screenshot' && lastScreenshotData) { enterScreenshotMode(lastScreenshotData.urls, lastScreenshotData.opacity) }
      else { showPanel() }
    } else if (appMode === 'panel') {
      lastMode = 'panel'; hidePanel()
    } else {
      lastMode = 'screenshot'; overlayWindow.webContents.send('show-screenshots', { urls: [], opacity: 1 }); appMode = 'hidden'
    }
  })
})

ipcMain.on('set-cycle-hotkey', (_, newKey) => {
  globalShortcut.unregister(cycleHotkey)
  cycleHotkey = newKey
  globalShortcut.register(cycleHotkey, () => {
    if (appMode === 'screenshot') overlayWindow.webContents.send('next-screenshot')
  })
})

ipcMain.on('set-exit-hotkey', (_, newKey) => {
  globalShortcut.unregister(exitHotkey)
  exitHotkey = newKey
  globalShortcut.register(exitHotkey, () => {
    if (appMode === 'screenshot') exitScreenshotMode()
  })
})
