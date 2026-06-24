"use strict";
const electron = require("electron");
const path = require("path");
const utils = require("@electron-toolkit/utils");
let overlayWindow = null;
let panelWindow = null;
function createOverlay() {
  overlayWindow = new electron.BrowserWindow({
    transparent: true,
    // invisible window background
    frame: false,
    // no titlebar/borders
    skipTaskbar: true,
    // don't show in taskbar
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      sandbox: false
    }
  });
  overlayWindow.maximize();
  overlayWindow.setAlwaysOnTop(true, "screen-saver");
  overlayWindow.setIgnoreMouseEvents(true);
  if (utils.is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    overlayWindow.loadURL(process.env["ELECTRON_RENDERER_URL"] + "/overlay.html");
  } else {
    overlayWindow.loadFile(path.join(__dirname, "../renderer/overlay.html"));
  }
}
function createPanel() {
  panelWindow = new electron.BrowserWindow({
    width: 380,
    height: 580,
    show: false,
    // hidden until Alt+L
    alwaysOnTop: true,
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      sandbox: false
    }
  });
  if (utils.is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    panelWindow.loadURL(process.env["ELECTRON_RENDERER_URL"] + "/panel.html");
  } else {
    panelWindow.loadFile(path.join(__dirname, "../renderer/panel.html"));
  }
}
electron.app.whenReady().then(() => {
  createOverlay();
  createPanel();
  electron.globalShortcut.register("Alt+L", () => {
    if (panelWindow.isVisible()) {
      panelWindow.hide();
    } else {
      panelWindow.show();
      panelWindow.focus();
    }
  });
});
electron.app.on("will-quit", () => {
  electron.globalShortcut.unregisterAll();
});
electron.ipcMain.on("set-lineup", (_, data) => {
  overlayWindow.webContents.send("render-lineup", data);
});
