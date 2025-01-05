import { app, BrowserWindow } from 'electron'
import started from 'electron-squirrel-startup'
import path from 'path'
import compatible from './main/compatible'
import { expose } from './main/handles'

if (started) {
  app.quit()
}

const isDev = process.env.NODE_ENV === 'development'

let mainWindow: BrowserWindow = null!

const createWindow = () => {
  compatible()
  mainWindow = new BrowserWindow({
    height: 800,
    width: 1200,
    autoHideMenuBar: !isDev,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  })
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL)
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    )
  }
  mainWindow.maximize()
  isDev && mainWindow.webContents.openDevTools()
}

const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (event) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })

  app.on('ready', () => {
    createWindow()
    const { Menu } = require('electron')
    Menu.setApplicationMenu(null)
  })
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

expose(app)
