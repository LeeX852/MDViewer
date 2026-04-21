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
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: WindowAPI
  }
}

export type { DirNode, FileResult, WindowAPI }
