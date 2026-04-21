import { contextBridge, ipcRenderer } from 'electron'

console.log('[Preload] Script loading...')
console.log('[Preload] ipcRenderer available:', !!ipcRenderer)
console.log('[Preload] contextBridge available:', !!contextBridge)

const api = {
  openFile: (): Promise<{ filePath: string; content: string } | null> => {
    console.log('[Preload] openFile called, invoking file:open')
    return ipcRenderer.invoke('file:open').then(result => {
      console.log('[Preload] openFile result:', result)
      return result
    }).catch(err => {
      console.error('[Preload] openFile error:', err)
      throw err
    })
  },
  newFile: (): Promise<boolean> => {
    console.log('[Preload] newFile called')
    return ipcRenderer.invoke('file:new')
  },
  saveFile: (filePath: string, content: string): Promise<boolean> => {
    console.log('[Preload] saveFile called, filePath:', filePath)
    return ipcRenderer.invoke('file:save', filePath, content)
  },
  saveFileAs: (content: string): Promise<string | null> => {
    console.log('[Preload] saveFileAs called')
    return ipcRenderer.invoke('file:save-as', content).then(result => {
      console.log('[Preload] saveFileAs result:', result)
      return result
    }).catch(err => {
      console.error('[Preload] saveFileAs error:', err)
      throw err
    })
  },
  readFile: (filePath: string): Promise<string | null> =>
    ipcRenderer.invoke('file:read', filePath),
  readDirTree: (dirPath: string): Promise<any[]> =>
    ipcRenderer.invoke('dir:read-tree', dirPath),
  openFolder: (): Promise<string | null> => {
    console.log('[Preload] openFolder called')
    return ipcRenderer.invoke('dir:open-folder').then(result => {
      console.log('[Preload] openFolder result:', result)
      return result
    }).catch(err => {
      console.error('[Preload] openFolder error:', err)
      throw err
    })
  },
  minimizeWindow: (): Promise<boolean> => ipcRenderer.invoke('window:minimize'),
  maximizeWindow: (): Promise<boolean> => ipcRenderer.invoke('window:maximize'),
  closeWindow: (): Promise<boolean> => ipcRenderer.invoke('window:close'),
  isMaximized: (): Promise<boolean> => ipcRenderer.invoke('window:is-maximized'),
  showAbout: (): Promise<boolean> => ipcRenderer.invoke('dialog:about')
}

console.log('[Preload] API object created')

try {
  contextBridge.exposeInMainWorld('api', api)
  console.log('[Preload] API exposed via contextBridge SUCCESS')
} catch (error) {
  console.error('[Preload] Failed to expose API:', error)
  throw error
}
