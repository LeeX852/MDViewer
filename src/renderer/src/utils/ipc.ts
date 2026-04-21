import type { DirNode, FileResult } from '../../../preload/index.d'

class IPCError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'IPCError'
  }
}

function ensureAPI(): typeof window.api {
  if (!window.api) {
    throw new IPCError('Electron API not available. Make sure the app is running in Electron.')
  }
  return window.api
}

export const ipc = {
  async openFile(): Promise<FileResult | null> {
    try {
      return await ensureAPI().openFile()
    } catch (error) {
      console.error('[IPC] openFile failed:', error)
      throw error
    }
  },

  async newFile(): Promise<boolean> {
    try {
      return await ensureAPI().newFile()
    } catch (error) {
      console.error('[IPC] newFile failed:', error)
      throw error
    }
  },

  async saveFile(filePath: string, content: string): Promise<boolean> {
    try {
      return await ensureAPI().saveFile(filePath, content)
    } catch (error) {
      console.error('[IPC] saveFile failed:', error)
      throw error
    }
  },

  async saveFileAs(content: string): Promise<string | null> {
    try {
      return await ensureAPI().saveFileAs(content)
    } catch (error) {
      console.error('[IPC] saveFileAs failed:', error)
      throw error
    }
  },

  async readFile(filePath: string): Promise<string | null> {
    try {
      return await ensureAPI().readFile(filePath)
    } catch (error) {
      console.error('[IPC] readFile failed:', error)
      throw error
    }
  },

  async readDirTree(dirPath: string): Promise<DirNode[]> {
    try {
      return await ensureAPI().readDirTree(dirPath)
    } catch (error) {
      console.error('[IPC] readDirTree failed:', error)
      throw error
    }
  },

  async openFolder(): Promise<string | null> {
    try {
      return await ensureAPI().openFolder()
    } catch (error) {
      console.error('[IPC] openFolder failed:', error)
      throw error
    }
  },

  async minimizeWindow(): Promise<boolean> {
    try {
      return await ensureAPI().minimizeWindow()
    } catch (error) {
      console.error('[IPC] minimizeWindow failed:', error)
      throw error
    }
  },

  async maximizeWindow(): Promise<boolean> {
    try {
      return await ensureAPI().maximizeWindow()
    } catch (error) {
      console.error('[IPC] maximizeWindow failed:', error)
      throw error
    }
  },

  async closeWindow(): Promise<boolean> {
    try {
      return await ensureAPI().closeWindow()
    } catch (error) {
      console.error('[IPC] closeWindow failed:', error)
      throw error
    }
  },

  async isMaximized(): Promise<boolean> {
    try {
      return await ensureAPI().isMaximized()
    } catch (error) {
      console.error('[IPC] isMaximized failed:', error)
      throw error
    }
  },

  async showAbout(): Promise<boolean> {
    try {
      return await ensureAPI().showAbout()
    } catch (error) {
      console.error('[IPC] showAbout failed:', error)
      throw error
    }
  }
}
