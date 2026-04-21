import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { readFile, writeFile, readdir } from 'fs/promises'

let mainWindow: BrowserWindow | null = null

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    show: false,
    title: 'MDViewer',
    frame: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
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

ipcMain.handle('file:new', async () => {
  return true
})

ipcMain.handle('file:open', async () => {
  try {
    const win = mainWindow || undefined
    const result = await dialog.showOpenDialog(win, {
      properties: ['openFile'],
      filters: [{ name: 'Markdown', extensions: ['md', 'markdown', 'txt'] }]
    })
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
    const win = mainWindow || undefined
    const result = await dialog.showSaveDialog(win, {
      filters: [{ name: 'Markdown', extensions: ['md'] }]
    })
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
    const win = mainWindow || undefined
    const result = await dialog.showOpenDialog(win, {
      properties: ['openDirectory']
    })
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

ipcMain.handle('window:minimize', () => mainWindow?.minimize())
ipcMain.handle('window:maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize()
  } else {
    mainWindow?.maximize()
  }
})
ipcMain.handle('window:close', () => mainWindow?.close())
ipcMain.handle('window:is-maximized', () => mainWindow?.isMaximized())

ipcMain.handle('dialog:about', async () => {
  const win = mainWindow || undefined
  await dialog.showMessageBox(win, {
    type: 'info',
    title: 'About MDViewer',
    message: 'MDViewer v0.1.0',
    detail: 'A Typora-like Markdown editor\nBuilt with Electron + React + Tiptap\n\n© 2026 MDViewer'
  })
})

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.mdviewer.app')

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
