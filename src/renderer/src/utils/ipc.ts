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
    console.log('[IPC] openFile called')
    console.log('[IPC] window.api available:', !!window.api)
    try {
      console.log('[IPC] calling window.api.openFile()...')
      const result = await ensureAPI().openFile()
      console.log('[IPC] window.api.openFile() result:', result)
      return result
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
    console.log('[IPC] saveFile called, filePath:', filePath)
    console.log('[IPC] window.api available:', !!window.api)
    try {
      console.log('[IPC] calling window.api.saveFile()...')
      const result = await ensureAPI().saveFile(filePath, content)
      console.log('[IPC] window.api.saveFile() result:', result)
      return result
    } catch (error) {
      console.error('[IPC] saveFile failed:', error)
      throw error
    }
  },

  async saveFileAs(content: string): Promise<string | null> {
    console.log('[IPC] saveFileAs called')
    console.log('[IPC] window.api available:', !!window.api)
    try {
      console.log('[IPC] calling window.api.saveFileAs()...')
      const result = await ensureAPI().saveFileAs(content)
      console.log('[IPC] window.api.saveFileAs() result:', result)
      return result
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
  },

  snapshot: {
    async save(filePath: string, content: string, label?: string) {
      try {
        return await ensureAPI().snapshot.save(filePath, content, label)
      } catch (error) {
        console.error('[IPC] snapshot.save failed:', error)
        throw error
      }
    },
    async list(filePath: string) {
      try {
        return await ensureAPI().snapshot.list(filePath)
      } catch (error) {
        console.error('[IPC] snapshot.list failed:', error)
        throw error
      }
    },
    async get(filePath: string, snapshotId: string) {
      try {
        return await ensureAPI().snapshot.get(filePath, snapshotId)
      } catch (error) {
        console.error('[IPC] snapshot.get failed:', error)
        throw error
      }
    },
    async delete(filePath: string, snapshotId: string) {
      try {
        return await ensureAPI().snapshot.delete(filePath, snapshotId)
      } catch (error) {
        console.error('[IPC] snapshot.delete failed:', error)
        throw error
      }
    }
  }
}
