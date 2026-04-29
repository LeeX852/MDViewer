import { ElectronAPI } from '@electron-toolkit/preload'

interface FileResult {
  filePath: string
  content: string
}

interface DirNode {
  name: string
  path: string
  type: 'file' | 'directory'
  children: DirNode[]
}

interface SnapshotMeta {
  id: string
  timestamp: number
  label: string
}

interface SnapshotEntry extends SnapshotMeta {
  content: string
}

interface SnapshotSaveResult {
  id: string
  timestamp: number
  label: string
}

interface SnapshotAPI {
  save: (filePath: string, content: string, label?: string) => Promise<SnapshotSaveResult | null>
  list: (filePath: string) => Promise<SnapshotMeta[]>
  get: (filePath: string, snapshotId: string) => Promise<SnapshotEntry | null>
  delete: (filePath: string, snapshotId: string) => Promise<boolean>
}

interface WindowAPI {
  openFile: () => Promise<FileResult | null>
  newFile: () => Promise<boolean>
  saveFile: (filePath: string, content: string) => Promise<boolean>
  saveFileAs: (content: string) => Promise<string | null>
  readFile: (filePath: string) => Promise<string | null>
  readDirTree: (dirPath: string) => Promise<DirNode[]>
  openFolder: () => Promise<string | null>
  minimizeWindow: () => Promise<boolean>
  maximizeWindow: () => Promise<boolean>
  closeWindow: () => Promise<boolean>
  isMaximized: () => Promise<boolean>
  showAbout: () => Promise<boolean>
  snapshot: SnapshotAPI
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: WindowAPI
  }
}

export type { DirNode, FileResult, WindowAPI }
