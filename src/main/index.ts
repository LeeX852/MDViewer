import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join, dirname, basename, extname } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { readFile, writeFile, readdir, mkdir, unlink } from 'fs/promises'
import { existsSync, readdirSync, mkdirSync, writeFileSync, readFileSync } from 'fs'

// Simple ID generator (no dependency needed)
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 10)
}

let mainWindow: BrowserWindow | null = null

function createWindow(): void {
  const preloadPath = app.isPackaged
    ? join(process.resourcesPath, 'app.asar', 'out', 'preload', 'index.cjs')
    : join(__dirname, '../preload/index.cjs')

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
    console.log('[Main] ready-to-show event fired')
    mainWindow!.show()
    console.log('[Main] window shown, isVisible:', mainWindow!.isVisible())
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
    console.log('[Main] file:open handler called')
    try {
      const options: Electron.OpenDialogOptions = {
        title: '打开文件',
        properties: ['openFile'],
        filters: [{ name: 'Markdown', extensions: ['md', 'markdown', 'txt'] }]
      }
      console.log('[Main] calling dialog.showOpenDialog...')
      // 不附加到窗口，直接显示对话框（Windows兼容性更好）
      const result = await dialog.showOpenDialog(options)
      console.log('[Main] dialog.showOpenDialog result:', JSON.stringify(result))
      if (result.canceled || result.filePaths.length === 0) {
        console.log('[Main] dialog canceled or no files selected')
        return null
      }

      const filePath = result.filePaths[0]
      console.log('[Main] selected file:', filePath)
      const content = await readFile(filePath, 'utf-8')
      console.log('[Main] file content read successfully, length:', content.length)
      return { filePath, content }
    } catch (err) {
      console.error('[Main] file:open error:', err)
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
    console.log('[Main] file:save-as handler called')
    try {
      const options: Electron.SaveDialogOptions = {
        title: '另存为',
        filters: [{ name: 'Markdown', extensions: ['md'] }],
        defaultPath: 'untitled.md'
      }
      console.log('[Main] calling dialog.showSaveDialog...')
      // 不附加到窗口，直接显示对话框（Windows兼容性更好）
      const result = await dialog.showSaveDialog(options)
      console.log('[Main] dialog.showSaveDialog result:', JSON.stringify(result))
      if (result.canceled || !result.filePath) {
        console.log('[Main] dialog canceled or no path selected')
        return null
      }

      console.log('[Main] saving to:', result.filePath)
      await writeFile(result.filePath, content, 'utf-8')
      console.log('[Main] file saved successfully')
      return result.filePath
    } catch (err) {
      console.error('[Main] file:save-as error:', err)
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
    console.log('[Main] dir:open-folder handler called')
    try {
      const options: Electron.OpenDialogOptions = {
        title: '打开文件夹',
        properties: ['openDirectory']
      }
      console.log('[Main] calling dialog.showOpenDialog for folder...')
      // 不附加到窗口，直接显示对话框（Windows兼容性更好）
      const result = await dialog.showOpenDialog(options)
      console.log('[Main] dialog.showOpenDialog result:', JSON.stringify(result))
      if (result.canceled || result.filePaths.length === 0) {
        console.log('[Main] dialog canceled or no folder selected')
        return null
      }
      console.log('[Main] selected folder:', result.filePaths[0])
      return result.filePaths[0]
    } catch (err) {
      console.error('[Main] dir:open-folder error:', err)
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
    const win = BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0]
    if (win) {
      win.minimize()
    }
    return true
  })
  
  ipcMain.handle('window:maximize', () => {
    const win = BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0]
    if (win) {
      if (win.isMaximized()) {
        win.unmaximize()
      } else {
        win.maximize()
      }
    }
    return true
  })
  
  ipcMain.handle('window:close', () => {
    const win = BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0]
    if (win) {
      win.close()
    }
    return true
  })
  
  ipcMain.handle('window:is-maximized', () => {
    const win = BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0]
    return win ? win.isMaximized() : false
  })

  const SNAPSHOTS_DIR = join(app.getPath('userData'), 'snapshots')

  async function ensureSnapshotsDir(): Promise<string> {
    if (!existsSync(SNAPSHOTS_DIR)) {
      mkdirSync(SNAPSHOTS_DIR, { recursive: true })
    }
    return SNAPSHOTS_DIR
  }

  function getSnapshotFilePath(filePath: string): string {
    const safeFileName = filePath.replace(/[^a-zA-Z0-9_\-\\\/.]/g, '_').replace(/\\/g, '_').replace(/\//g, '_')
    return join(SNAPSHOTS_DIR, safeFileName + '.snapshots.json')
  }

  interface SnapshotEntry {
    id: string
    timestamp: number
    label: string
    content: string
  }

  function loadSnapshots(filePath: string): SnapshotEntry[] {
    const snapFile = getSnapshotFilePath(filePath)
    if (!existsSync(snapFile)) return []
    try {
      const data = readFileSync(snapFile, 'utf-8')
      return JSON.parse(data)
    } catch {
      return []
    }
  }

  function saveSnapshots(filePath: string, snapshots: SnapshotEntry[]): void {
    const snapFile = getSnapshotFilePath(filePath)
    const dir = dirname(snapFile)
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true })
    }
    writeFileSync(snapFile, JSON.stringify(snapshots, null, 2), 'utf-8')
  }

  ipcMain.handle('snapshot:save', async (_event, filePath: string, content: string, label?: string) => {
    try {
      await ensureSnapshotsDir()
      const snapshots = loadSnapshots(filePath)
      const entry: SnapshotEntry = {
        id: generateId(),
        timestamp: Date.now(),
        label: label || `版本 ${snapshots.length + 1}`,
        content
      }
      snapshots.push(entry)
      if (snapshots.length > 50) {
        snapshots.splice(0, snapshots.length - 50)
      }
      saveSnapshots(filePath, snapshots)
      return { id: entry.id, timestamp: entry.timestamp, label: entry.label }
    } catch (err) {
      console.error('snapshot:save error:', err)
      return null
    }
  })

  ipcMain.handle('snapshot:list', async (_event, filePath: string) => {
    try {
      await ensureSnapshotsDir()
      const snapshots = loadSnapshots(filePath)
      return snapshots.map(s => ({
        id: s.id,
        timestamp: s.timestamp,
        label: s.label
      }))
    } catch (err) {
      console.error('snapshot:list error:', err)
      return []
    }
  })

  ipcMain.handle('snapshot:get', async (_event, filePath: string, snapshotId: string) => {
    try {
      await ensureSnapshotsDir()
      const snapshots = loadSnapshots(filePath)
      const entry = snapshots.find(s => s.id === snapshotId)
      return entry || null
    } catch (err) {
      console.error('snapshot:get error:', err)
      return null
    }
  })

  ipcMain.handle('snapshot:delete', async (_event, filePath: string, snapshotId: string) => {
    try {
      await ensureSnapshotsDir()
      let snapshots = loadSnapshots(filePath)
      snapshots = snapshots.filter(s => s.id !== snapshotId)
      saveSnapshots(filePath, snapshots)
      return true
    } catch (err) {
      console.error('snapshot:delete error:', err)
      return false
    }
  })

  ipcMain.handle('dialog:about', async () => {
    const win = BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0]
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
    
    if (win) {
      await dialog.showMessageBox(win, options)
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
