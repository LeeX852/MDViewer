import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import MenuBar from './components/MenuBar'
import Sidebar from './components/Sidebar'
import IconRail from './components/IconRail'
import StatusBar from './components/StatusBar'
import SearchPanel from './components/SearchPanel'
import GitPanel from './components/GitPanel'
import TrashPanel from './components/TrashPanel'
import SettingsPanel from './components/SettingsPanel'
import Editor from './components/Editor'
import SourceEditor from './components/SourceEditor'
import ResizeHandle from './components/ResizeHandle'
import { EditorProvider } from './hooks/useEditorContext'
import { useEditorState } from './hooks/useEditorState'
import { ipc } from './utils/ipc'
import type { DirNode } from '../../preload/index.d'
import type { Editor as TiptapEditor } from '@tiptap/react'

type ThemeMode = 'dark' | 'light'
type SidebarView = 'files' | 'search' | 'git' | 'trash'

export default function App() {
  useEffect(() => {
    console.log('[App] Checking window.api availability...')
    console.log('[App] window.api exists:', !!window.api)
    if (window.api) {
      console.log('[App] window.api methods:', Object.keys(window.api))
    }
  }, [])

  const [editorInstance, setEditorInstance] = useState<TiptapEditor | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [viewMode, setViewMode] = useState<'edit' | 'split'>('edit')

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
  const [activeView, setActiveView] = useState<SidebarView>('files')
  const [dirTree, setDirTree] = useState<DirNode[]>([])
  const [rootDir, setRootDir] = useState<string | null>(null)
  const [theme, setTheme] = useState<ThemeMode>('dark')
  const [focusMode, setFocusMode] = useState(false)
  const [typewriterMode, setTypewriterMode] = useState(false)
  const [sourceMode, setSourceMode] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(250)
  const typewriterScrollRef = useRef(false)
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  useEffect(() => {
    if (focusMode) {
      setSidebarVisible(false)
    }
  }, [focusMode])

  useEffect(() => {
    if (!editorInstance) return

    const updateCursorPosition = () => {
      const { from } = editorInstance.state.selection
      const pos = editorInstance.state.doc.resolve(from)
      const lineIndex = pos.index(0)
      const line = lineIndex + 1
      const lineStart = pos.start(0)
      const column = from - lineStart + 1
      setCursorPosition({ line, column })
    }

    editorInstance.on('selectionUpdate', updateCursorPosition)
    editorInstance.on('update', updateCursorPosition)

    if (typewriterMode) {
      typewriterScrollRef.current = true
      const handleTypewriterScroll = () => {
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
      editorInstance.on('update', handleTypewriterScroll)
      editorInstance.on('selectionUpdate', handleTypewriterScroll)
      return () => {
        typewriterScrollRef.current = false
        editorInstance.off('update', updateCursorPosition)
        editorInstance.off('selectionUpdate', updateCursorPosition)
        editorInstance.off('update', handleTypewriterScroll)
        editorInstance.off('selectionUpdate', handleTypewriterScroll)
      }
    }

    return () => {
      editorInstance.off('update', updateCursorPosition)
      editorInstance.off('selectionUpdate', updateCursorPosition)
    }
  }, [editorInstance, typewriterMode])

  const handleNewFile = useCallback(() => {
    setContent('')
    setFilePath(null)
    markSaved()
  }, [setContent, setFilePath, markSaved])

  const handleOpenFile = useCallback(async () => {
    try {
      const result = await ipc.openFile()
      if (result) {
        setContent(result.content)
        setFilePath(result.filePath)
      }
    } catch (error) {
      console.error('[App] Failed to open file:', error)
    }
  }, [setContent, setFilePath])

  const handleSave = useCallback(async () => {
    try {
      if (filePath) {
        await ipc.saveFile(filePath, content)
        markSaved()
      } else {
        const savedPath = await ipc.saveFileAs(content)
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
    try {
      const savedPath = await ipc.saveFileAs(content)
      if (savedPath) {
        setFilePath(savedPath)
        markSaved()
      }
    } catch (error) {
      console.error('[App] Failed to save as:', error)
    }
  }, [content, markSaved, setFilePath])

  const handleOpenFolder = useCallback(async () => {
    const folder = await window.api.openFolder()
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

  const handleViewChange = useCallback((view: SidebarView) => {
    if (activeView === view && sidebarVisible) {
      setSidebarVisible(false)
    } else {
      setActiveView(view)
      setSidebarVisible(true)
    }
  }, [activeView, sidebarVisible])

  const fileName = filePath ? (filePath.split(/[/\\]/).pop() ?? '未命名') : '未命名'
  const showSidebar = sidebarVisible && !focusMode
  const showIconRail = !focusMode

  const wordCount = useMemo(() => {
    if (!content) return 0
    const chineseChars = (content.match(/[\u4e00-\u9fa5]/g) || []).length
    const englishWords = content
      .replace(/[\u4e00-\u9fa5]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 0 && /[a-zA-Z]/.test(w)).length
    return chineseChars + englishWords
  }, [content])

  const renderSidebarPanel = () => {
    switch (activeView) {
      case 'files':
        return (
          <Sidebar
            dirTree={dirTree}
            rootDir={rootDir}
            onOpenFolder={handleOpenFolder}
            onFileSelect={handleFileSelect}
            currentFilePath={filePath}
            width={sidebarWidth}
            headings={headings}
          />
        )
      case 'search':
        return (
          <SearchPanel
            width={sidebarWidth}
            content={content}
            onFileSelect={handleFileSelect}
            onReplace={(search, replacement) => {
              try {
                const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')
                setContent(content.replace(regex, replacement))
              } catch {
                setContent(content.split(search).join(replacement))
              }
            }}
          />
        )
      case 'git':
        return (
          <GitPanel
            width={sidebarWidth}
            filePath={filePath}
            content={content}
            onRestoreSnapshot={(restoredContent) => {
              setContent(restoredContent)
              markSaved()
            }}
            onFileSelect={handleFileSelect}
          />
        )
      case 'trash':
        return <TrashPanel width={sidebarWidth} />
      default:
        return null
    }
  }

  return (
    <EditorProvider value={editorInstance}>
      <div className="app-container">
        <MenuBar
          title={fileName}
          editor={editorInstance}
          theme={theme}
          focusMode={focusMode}
          typewriterMode={typewriterMode}
          sourceMode={sourceMode}
          sidebarVisible={sidebarVisible}
          viewMode={viewMode}
          onOpenFile={handleOpenFile}
          onNewFile={handleNewFile}
          onOpenFolder={handleOpenFolder}
          onSave={handleSave}
          onSaveAs={handleSaveAs}
          onToggleSidebar={() => setSidebarVisible(v => !v)}
          onToggleTheme={handleToggleTheme}
          onToggleFocusMode={() => setFocusMode(v => !v)}
          onToggleTypewriterMode={() => setTypewriterMode(v => !v)}
          onToggleSourceMode={() => setSourceMode(v => !v)}
          onViewModeChange={setViewMode}
        />
        <div className={`main-content ${focusMode ? 'focus-mode' : ''}`}>
          {showIconRail && (
            <IconRail
              activeView={activeView}
              onViewChange={handleViewChange}
              onOpenSettings={() => setShowSettings(true)}
              onOpenHelp={() => {}}
            />
          )}
          {showSidebar && (
            <>
              {renderSidebarPanel()}
              <ResizeHandle side="left" onResize={handleSidebarResize} />
            </>
          )}
          {showSettings ? (
            <SettingsPanel
              theme={theme}
              onThemeChange={handleToggleTheme}
              onClose={() => setShowSettings(false)}
            />
          ) : (
            <div className="editor-area">
              {sourceMode ? (
                <SourceEditor content={content} onChange={setContent} />
              ) : (
                <Editor
                  content={content}
                  onChange={setContent}
                  onSave={handleSave}
                  onEditorReady={setEditorInstance}
                  viewMode={viewMode}
                />
              )}
            </div>
          )}
        </div>
        <StatusBar
          cursorPosition={cursorPosition}
          wordCount={wordCount}
          filePath={filePath}
          isSynced={!isModified}
          syncTime={new Date().toLocaleTimeString('zh-CN', { hour12: false })}
        />
      </div>
    </EditorProvider>
  )
}
