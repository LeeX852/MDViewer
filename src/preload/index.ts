import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

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
  minimizeWindow: (): Promise<void> => ipcRenderer.invoke('window:minimize'),
  maximizeWindow: (): Promise<void> => ipcRenderer.invoke('window:maximize'),
  closeWindow: (): Promise<void> => ipcRenderer.invoke('window:close'),
  isMaximized: (): Promise<boolean> => ipcRenderer.invoke('window:is-maximized'),
  showAbout: (): Promise<void> => ipcRenderer.invoke('dialog:about')
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore - dev mode fallback
  window.electron = electronAPI
  // @ts-ignore
  window.api = api
}
