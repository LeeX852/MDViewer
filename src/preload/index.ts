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
  readDirTree: (dirPath: string): Promise<DirNode[]> =>
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
  forceCloseWindow: (): Promise<boolean> => ipcRenderer.invoke('window:force-close'),
  isMaximized: (): Promise<boolean> => ipcRenderer.invoke('window:is-maximized'),
  confirmUnsaved: (fileName?: string): Promise<'save' | 'discard' | 'cancel'> =>
    ipcRenderer.invoke('dialog:confirm-unsaved', fileName),
  onRequestClose: (callback: () => void) => {
    ipcRenderer.on('app:request-close', callback)
    return () => ipcRenderer.removeListener('app:request-close', callback)
  },
  showAbout: (): Promise<boolean> => ipcRenderer.invoke('dialog:about'),
  saveImage: (data: Uint8Array, extension: string, currentFilePath: string | null) =>
    ipcRenderer.invoke('image:save', { data: Array.from(data), extension, currentFilePath }),
  exportPDF: (filePath: string | null): Promise<string | null> =>
    ipcRenderer.invoke('export:pdf', filePath),
  exportHTML: (html: string, filePath: string | null): Promise<string | null> =>
    ipcRenderer.invoke('export:html', { html, filePath }),
  settings: {
    load: () => ipcRenderer.invoke('settings:load'),
    save: (settings: Record<string, unknown>) => ipcRenderer.invoke('settings:save', settings)
  },
  trash: {
    list: () => ipcRenderer.invoke('trash:list'),
    moveToTrash: (filePath: string) => ipcRenderer.invoke('trash:move-to-trash', filePath),
    restore: (id: string) => ipcRenderer.invoke('trash:restore', id),
    permanentDelete: (id: string) => ipcRenderer.invoke('trash:permanent-delete', id),
    empty: () => ipcRenderer.invoke('trash:empty')
  },
  snapshot: {
    save: (filePath: string, content: string, label?: string) =>
      ipcRenderer.invoke('snapshot:save', filePath, content, label),
    list: (filePath: string) =>
      ipcRenderer.invoke('snapshot:list', filePath),
    get: (filePath: string, snapshotId: string) =>
      ipcRenderer.invoke('snapshot:get', filePath, snapshotId),
    delete: (filePath: string, snapshotId: string) =>
      ipcRenderer.invoke('snapshot:delete', filePath, snapshotId)
  }
}

console.log('[Preload] API object created')

try {
  contextBridge.exposeInMainWorld('api', api)
  console.log('[Preload] API exposed via contextBridge SUCCESS')
} catch (error) {
  console.error('[Preload] Failed to expose API:', error)
  throw error
}
