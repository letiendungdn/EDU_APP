const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("nihongoDesktop", {
  retry: () => ipcRenderer.invoke("nihongo:retry"),
});
