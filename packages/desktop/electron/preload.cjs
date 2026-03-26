const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  // Placeholder for future IPC methods
  // e.g., db operations, file dialogs, etc.
  platform: process.platform,
});
