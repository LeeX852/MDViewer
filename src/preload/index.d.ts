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

interface AppSettings {
  language: string
  encoding: string
  autoSave: boolean
  autoSaveInterval: number
  startupMode: 'welcome' | 'lastFile' | 'blank'
  fileAssociation: boolean
  theme: 'dark' | 'light'
  fontFamily: string
  editorFontSize: number
  uiFontSize: number
  lineHeight: number
  sidebarPosition: 'left' | 'right'
  tabSize: 2 | 4
  wordWrap: boolean
  showLineNumbers: boolean
  spellCheck: boolean
  syntaxHighlight: boolean
}

interface SettingsAPI {
  load: () => Promise<AppSettings>
  save: (settings: AppSettings) => Promise<boolean>
}

interface TrashEntry {
  id: string
  name: string
  originalPath: string
  deletedAt: number
  size: number
}

interface TrashAPI {
  list: () => Promise<TrashEntry[]>
  moveToTrash: (filePath: string) => Promise<boolean>
  restore: (id: string) => Promise<boolean>
  permanentDelete: (id: string) => Promise<boolean>
  empty: () => Promise<boolean>
}

interface SnapshotAPI {
  save: (filePath: string, content: string, label?: string) => Promise<SnapshotSaveResult | null>
  list: (filePath: string) => Promise<SnapshotMeta[]>
  get: (filePath: string, snapshotId: string) => Promise<SnapshotEntry | null>
  delete: (filePath: string, snapshotId: string) => Promise<boolean>
}

type UnsavedChoice = 'save' | 'discard' | 'cancel'

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
  forceCloseWindow: () => Promise<boolean>
  isMaximized: () => Promise<boolean>
  confirmUnsaved: (fileName?: string) => Promise<UnsavedChoice>
  onRequestClose: (callback: () => void) => () => void
  showAbout: () => Promise<boolean>
  saveImage: (data: Uint8Array, extension: string, currentFilePath: string | null) =>
    Promise<{ src: string; fullPath: string } | null>
  exportPDF: (filePath: string | null) => Promise<string | null>
  exportHTML: (html: string, filePath: string | null) => Promise<string | null>
  settings: SettingsAPI
  trash: TrashAPI
  snapshot: SnapshotAPI
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: WindowAPI
  }
}

export type { DirNode, FileResult, WindowAPI, UnsavedChoice, AppSettings }
