import { useState, useCallback, useEffect, useRef } from 'react'
import MenuBar from './components/MenuBar'
import Sidebar from './components/Sidebar'
import OutlinePanel from './components/OutlinePanel'
import Editor from './components/Editor'
import SourceEditor from './components/SourceEditor'
import ResizeHandle from './components/ResizeHandle'
import { EditorProvider } from './hooks/useEditorContext'
import { useEditorState } from './hooks/useEditorState'
import { ipc } from './utils/ipc'
import type { DirNode } from '../../preload/index.d'
import type { Editor as TiptapEditor } from '@tiptap/react'

type ThemeMode = 'dark' | 'light'

export default function App() {
  // 检查 preload API 是否可用
  useEffect(() => {
    console.log('[App] Checking window.api availability...')
    console.log('[App] window.api exists:', !!window.api)
    if (window.api) {
      console.log('[App] window.api methods:', Object.keys(window.api))
    }
  }, [])

  const [editorInstance, setEditorInstance] = useState<TiptapEditor | null>(null)

  const {
    content,
    filePath,
    isModified,
    setContent,
    setFilePath,
    markSaved,
    headings
  } = useEditorState()

  const [sidebarVisible, setSidebarVisible] = useState(true)
  const [outlineVisible, setOutlineVisible] = useState(true)
  const [dirTree, setDirTree] = useState<DirNode[]>([])
  const [rootDir, setRootDir] = useState<string | null>(null)
  const [theme, setTheme] = useState<ThemeMode>('dark')
  const [focusMode, setFocusMode] = useState(false)
  const [typewriterMode, setTypewriterMode] = useState(false)
  const [sourceMode, setSourceMode] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(250)
  const [outlineWidth, setOutlineWidth] = useState(220)
  const typewriterScrollRef = useRef(false)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  useEffect(() => {
    if (focusMode) {
      setSidebarVisible(false)
      setOutlineVisible(false)
    }
  }, [focusMode])

  useEffect(() => {
    if (!editorInstance) return
    if (typewriterMode) {
      typewriterScrollRef.current = true
      const handleUpdate = () => {
        requestAnimationFrame(() => {
          const { from } = editorInstance.state.selection
          const coords = editorInstance.view.coordsAtPos(from)
          const editorArea = document.querySelector('.editor-area')
          if (editorArea) {
            const rect = editorArea.getBoundingClientRect()
            const cursorY = coords.top - rect.top + editorArea.scrollTop
            editorArea.scrollTo({
              top: cursorY - rect.height / 2,
              behavior: 'smooth'
            })
          }
        })
      }
      editorInstance.on('update', handleUpdate)
      editorInstance.on('selectionUpdate', handleUpdate)
      return () => {
        typewriterScrollRef.current = false
        editorInstance.off('update', handleUpdate)
        editorInstance.off('selectionUpdate', handleUpdate)
      }
    }
  }, [editorInstance, typewriterMode])

  const handleNewFile = useCallback(() => {
    setContent('')
    setFilePath(null)
    markSaved()
  }, [setContent, setFilePath, markSaved])

  const handleOpenFile = useCallback(async () => {
    console.log('[App] handleOpenFile called')
    try {
      console.log('[App] calling ipc.openFile()...')
      const result = await ipc.openFile()
      console.log('[App] ipc.openFile() result:', result)
      if (result) {
        setContent(result.content)
        setFilePath(result.filePath)
      }
    } catch (error) {
      console.error('[App] Failed to open file:', error)
    }
  }, [setContent, setFilePath])

  const handleSave = useCallback(async () => {
    console.log('[App] handleSave called, filePath:', filePath)
    try {
      if (filePath) {
        console.log('[App] calling ipc.saveFile()...')
        await ipc.saveFile(filePath, content)
        markSaved()
      } else {
        console.log('[App] no filePath, calling ipc.saveFileAs()...')
        const savedPath = await ipc.saveFileAs(content)
        console.log('[App] saveFileAs result:', savedPath)
        if (savedPath) {
          setFilePath(savedPath)
          markSaved()
        }
      }
    } catch (error) {
      console.error('[App] Failed to save file:', error)
    }
  }, [filePath, content, markSaved, setFilePath])

  const handleSaveAs = useCallback(async () => {
    console.log('[App] handleSaveAs called')
    try {
      console.log('[App] calling ipc.saveFileAs()...')
      const savedPath = await ipc.saveFileAs(content)
      console.log('[App] saveFileAs result:', savedPath)
      if (savedPath) {
        setFilePath(savedPath)
        markSaved()
      }
    } catch (error) {
      console.error('[App] Failed to save as:', error)
    }
  }, [content, markSaved, setFilePath])

  const handleOpenFolder = useCallback(async () => {
    console.log('[App] handleOpenFolder called')
    console.log('[App] window.api available:', !!window.api)
    const folder = await window.api.openFolder()
    console.log('[App] openFolder result:', folder)
    if (folder) {
      setRootDir(folder)
      const tree = await window.api.readDirTree(folder)
      setDirTree(tree)
    }
  }, [])

  const handleFileSelect = useCallback(async (path: string) => {
    const fileContent = await window.api.readFile(path)
    if (fileContent !== null) {
      setContent(fileContent)
      setFilePath(path)
    }
  }, [setContent, setFilePath])

  const handleToggleTheme = useCallback(() => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark')
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'o' && !e.shiftKey) {
          e.preventDefault()
          handleOpenFile()
        } else if (e.key === 's' && !e.shiftKey) {
          e.preventDefault()
          handleSave()
        } else if (e.key === 'S') {
          e.preventDefault()
          handleSaveAs()
        } else if (e.key === 'n') {
          e.preventDefault()
          handleNewFile()
        } else if (e.key === '/') {
          e.preventDefault()
          setSourceMode(v => !v)
        } else if (e.key === '\\') {
          e.preventDefault()
          setSidebarVisible(v => !v)
        }
      }
      if (e.key === 'F8') {
        e.preventDefault()
        setFocusMode(v => !v)
      }
      if (e.key === 'F9') {
        e.preventDefault()
        setTypewriterMode(v => !v)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleOpenFile, handleSave, handleSaveAs, handleNewFile])

  const handleSidebarResize = useCallback((deltaX: number) => {
    setSidebarWidth(prev => Math.max(150, Math.min(500, prev + deltaX)))
  }, [])

  const handleOutlineResize = useCallback((deltaX: number) => {
    setOutlineWidth(prev => Math.max(150, Math.min(500, prev - deltaX)))
  }, [])

  const fileName = filePath ? filePath.split(/[/\\]/).pop() : 'Untitled'
  const showSidebar = sidebarVisible && !focusMode
  const showOutline = outlineVisible && !focusMode

  return (
    <EditorProvider value={editorInstance}>
      <div className="app-container">
        <MenuBar
          title={`${fileName}${isModified ? ' •' : ''} - MDViewer`}
          editor={editorInstance}
          theme={theme}
          focusMode={focusMode}
          typewriterMode={typewriterMode}
          sourceMode={sourceMode}
          sidebarVisible={sidebarVisible}
          outlineVisible={outlineVisible}
          onOpenFile={handleOpenFile}
          onNewFile={handleNewFile}
          onOpenFolder={handleOpenFolder}
          onSave={handleSave}
          onSaveAs={handleSaveAs}
          onToggleSidebar={() => setSidebarVisible(v => !v)}
          onToggleOutline={() => setOutlineVisible(v => !v)}
          onToggleTheme={handleToggleTheme}
          onToggleFocusMode={() => setFocusMode(v => !v)}
          onToggleTypewriterMode={() => setTypewriterMode(v => !v)}
          onToggleSourceMode={() => setSourceMode(v => !v)}
        />
        <div className={`main-content ${focusMode ? 'focus-mode' : ''}`}>
          {showSidebar && (
            <>
              <Sidebar
                dirTree={dirTree}
                rootDir={rootDir}
                onOpenFolder={handleOpenFolder}
                onFileSelect={handleFileSelect}
                currentFilePath={filePath}
                width={sidebarWidth}
              />
              <ResizeHandle side="left" onResize={handleSidebarResize} />
            </>
          )}
          <div className="editor-area">
            {sourceMode ? (
              <SourceEditor content={content} onChange={setContent} />
            ) : (
              <Editor
                content={content}
                onChange={setContent}
                onSave={handleSave}
                onEditorReady={setEditorInstance}
              />
            )}
          </div>
          {showOutline && (
            <>
              <ResizeHandle side="right" onResize={handleOutlineResize} />
              <OutlinePanel headings={headings} width={outlineWidth} />
            </>
          )}
        </div>
      </div>
    </EditorProvider>
  )
}
