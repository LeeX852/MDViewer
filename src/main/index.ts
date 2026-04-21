import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { readFile, writeFile, readdir } from 'fs/promises'

let mainWindow: BrowserWindow | null = null

function createWindow(): void {
  const preloadPath = app.isPackaged
    ? join(process.resourcesPath, 'app.asar', 'out', 'preload', 'index.js')
    : join(__dirname, '../preload/index.js')

  console.log('[Main] Preload path:', preloadPath)
  console.log('[Main] Is packaged:', app.isPackaged)
  console.log('[Main] Resources path:', process.resourcesPath)

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    show: false,
    title: 'MDViewer',
    frame: false,
    resizable: true,
    maximizable: true,
    minimizable: true,
    thickFrame: true,
    webPreferences: {
      preload: preloadPath,
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow!.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

function registerIpcHandlers(): void {
  ipcMain.handle('file:new', async () => {
    return true
  })

  ipcMain.handle('file:open', async () => {
    try {
      const options: Electron.OpenDialogOptions = {
        properties: ['openFile'],
        filters: [{ name: 'Markdown', extensions: ['md', 'markdown', 'txt'] }]
      }
      const result = mainWindow
        ? await dialog.showOpenDialog(mainWindow, options)
        : await dialog.showOpenDialog(options)
      if (result.canceled || result.filePaths.length === 0) return null

      const filePath = result.filePaths[0]
      const content = await readFile(filePath, 'utf-8')
      return { filePath, content }
    } catch (err) {
      console.error('file:open error:', err)
      return null
    }
  })

  ipcMain.handle('file:save', async (_event, filePath: string, content: string) => {
    try {
      await writeFile(filePath, content, 'utf-8')
      return true
    } catch (err) {
      console.error('file:save error:', err)
      return false
    }
  })

  ipcMain.handle('file:save-as', async (_event, content: string) => {
    try {
      const options: Electron.SaveDialogOptions = {
        filters: [{ name: 'Markdown', extensions: ['md'] }]
      }
      const result = mainWindow
        ? await dialog.showSaveDialog(mainWindow, options)
        : await dialog.showSaveDialog(options)
      if (result.canceled || !result.filePath) return null

      await writeFile(result.filePath, content, 'utf-8')
      return result.filePath
    } catch (err) {
      console.error('file:save-as error:', err)
      return null
    }
  })

  ipcMain.handle('file:read', async (_event, filePath: string) => {
    try {
      const content = await readFile(filePath, 'utf-8')
      return content
    } catch (err) {
      console.error('file:read error:', err)
      return null
    }
  })

  ipcMain.handle('dir:open-folder', async () => {
    try {
      const options: Electron.OpenDialogOptions = {
        properties: ['openDirectory']
      }
      const result = mainWindow
        ? await dialog.showOpenDialog(mainWindow, options)
        : await dialog.showOpenDialog(options)
      if (result.canceled || result.filePaths.length === 0) return null
      return result.filePaths[0]
    } catch (err) {
      console.error('dir:open-folder error:', err)
      return null
    }
  })

  ipcMain.handle('dir:read-tree', async (_event, dirPath: string) => {
    async function readTree(dirPath: string, depth: number = 0): Promise<any[]> {
      if (depth > 3) return []
      const entries = await readdir(dirPath, { withFileTypes: true })
      const result = []
      for (const entry of entries) {
        if (entry.name.startsWith('.')) continue
        const fullPath = join(dirPath, entry.name)
        if (entry.isDirectory()) {
          const children = await readTree(fullPath, depth + 1)
          result.push({ name: entry.name, path: fullPath, type: 'directory', children })
        } else if (/\.(md|markdown|txt)$/.test(entry.name)) {
          result.push({ name: entry.name, path: fullPath, type: 'file', children: [] })
        }
      }
      result.sort((a, b) => {
        if (a.type !== b.type) return a.type === 'directory' ? -1 : 1
        return a.name.localeCompare(b.name)
      })
      return result
    }

    try {
      return await readTree(dirPath)
    } catch (err) {
      console.error('dir:read-tree error:', err)
      return []
    }
  })

  ipcMain.handle('window:minimize', () => {
    if (mainWindow) {
      mainWindow.minimize()
    }
    return true
  })
  
  ipcMain.handle('window:maximize', () => {
    if (mainWindow) {
      if (mainWindow.isMaximized()) {
        mainWindow.unmaximize()
      } else {
        mainWindow.maximize()
      }
    }
    return true
  })
  
  ipcMain.handle('window:close', () => {
    if (mainWindow) {
      mainWindow.close()
    }
    return true
  })
  
  ipcMain.handle('window:is-maximized', () => {
    return mainWindow ? mainWindow.isMaximized() : false
  })

  ipcMain.handle('dialog:about', async () => {
    const version = app.getVersion()
    const electronVersion = process.versions.electron
    const nodeVersion = process.versions.node
    const chromeVersion = process.versions.chrome
    
    const detailLines = [
      `Version: ${version}`,
      '',
      'A Typora-like Markdown editor',
      'Built with Electron + React + Tiptap',
      '',
      'Technical Info:',
      `  Electron: ${electronVersion}`,
      `  Chrome: ${chromeVersion}`,
      `  Node.js: ${nodeVersion}`,
      '',
      'Author: MDViewer Team',
      '',
      '© 2026 MDViewer',
      'All rights reserved.'
    ]
    
    const options: Electron.MessageBoxOptions = {
      type: 'info',
      title: 'About MDViewer',
      message: 'MDViewer',
      detail: detailLines.join('\n'),
      buttons: ['OK'],
      defaultId: 0
    }
    
    if (mainWindow) {
      await dialog.showMessageBox(mainWindow, options)
    } else {
      await dialog.showMessageBox(options)
    }
    return true
  })
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.mdviewer.app')

  registerIpcHandlers()

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
