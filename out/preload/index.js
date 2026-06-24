"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("api", {
  // Panel calls this to push a lineup selection to the overlay
  setLineup: (data) => electron.ipcRenderer.send("set-lineup", data),
  // Overlay calls this to listen for lineup selections from the panel
  onRenderLineup: (callback) => electron.ipcRenderer.on("render-lineup", (_, data) => callback(data))
});
