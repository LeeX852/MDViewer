import { contextBridge, ipcRenderer } from 'electron'

const api = {
  openFile: (): Promise<{ filePath: string; content: string } | null> =>
    ipcRenderer.invoke('file:open'),
  newFile: (): Promise<boolean> =>
    ipcRenderer.invoke('file:new'),
  saveFile: (filePath: string, content: string): Promise<boolean> =>
    ipcRenderer.invoke('file:save', filePath, content),
  saveFileAs: (content: string): Promise<string | null> =>
    ipcRenderer.invoke('file:save-as', content),
  readFile: (filePath: string): Promise<string | null> =>
    ipcRenderer.invoke('file:read', filePath),
  readDirTree: (dirPath: string): Promise<any[]> =>
    ipcRenderer.invoke('dir:read-tree', dirPath),
  openFolder: (): Promise<string | null> =>
    ipcRenderer.invoke('dir:open-folder'),
  minimizeWindow: (): Promise<boolean> => ipcRenderer.invoke('window:minimize'),
  maximizeWindow: (): Promise<boolean> => ipcRenderer.invoke('window:maximize'),
  closeWindow: (): Promise<boolean> => ipcRenderer.invoke('window:close'),
  isMaximized: (): Promise<boolean> => ipcRenderer.invoke('window:is-maximized'),
  showAbout: (): Promise<boolean> => ipcRenderer.invoke('dialog:about')
}

try {
  contextBridge.exposeInMainWorld('api', api)
  console.log('[Preload] API exposed via contextBridge')
} catch (error) {
  console.error('[Preload] Failed to expose API:', error)
  throw error
}
