const { app, BrowserWindow, ipcMain, shell } = require("electron");
const path = require("path");

const START_URL = process.env.NIHONGO_URL || "http://localhost:8080";

/** @type {BrowserWindow | null} */
let mainWindow = null;

function isAppUrl(url) {
  try {
    const parsed = new URL(url);
    if (parsed.protocol === "file:") return true;
    const host = parsed.hostname;
    const localHost = host === "localhost" || host === "127.0.0.1" || host === "auth.localhost";
    return localHost && (parsed.port === "8080" || parsed.port === "3000" || parsed.port === "");
  } catch {
    return false;
  }
}

function showOffline() {
  if (!mainWindow) return;
  mainWindow.loadFile(path.join(__dirname, "offline.html"));
}

function openApp() {
  if (!mainWindow) return;
  mainWindow.loadURL(START_URL);
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 840,
    minWidth: 960,
    minHeight: 640,
    title: "Nihongo",
    backgroundColor: "#0f1419",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (!isAppUrl(url)) shell.openExternal(url);
    return { action: "deny" };
  });

  mainWindow.webContents.on("will-navigate", (event, url) => {
    if (isAppUrl(url)) return;
    event.preventDefault();
    shell.openExternal(url);
  });

  mainWindow.webContents.on("did-fail-load", (_event, _code, _desc, _url, isMainFrame) => {
    if (isMainFrame) showOffline();
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  openApp();
}

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (!mainWindow) return;
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  });

  app.whenReady().then(() => {
    ipcMain.handle("nihongo:retry", () => {
      openApp();
    });
    createWindow();
    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });

  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
  });
}
