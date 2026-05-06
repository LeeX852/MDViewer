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
import TabBar from './components/TabBar'
import { EditorProvider } from './hooks/useEditorContext'
import { useTabsState } from './hooks/useTabsState'
import { ipc } from './utils/ipc'
import type { DirNode, AppSettings } from '../../preload/index.d'
import type { Editor as TiptapEditor } from '@tiptap/react'

type ThemeMode = 'dark' | 'light'
type SidebarView = 'files' | 'search' | 'git' | 'trash'

const DEFAULT_SETTINGS: AppSettings = {
  language: 'zh-CN',
  encoding: 'UTF-8',
  autoSave: true,
  autoSaveInterval: 2000,
  startupMode: 'welcome',
  fileAssociation: true,
  theme: 'dark',
  fontFamily: 'system',
  editorFontSize: 14,
  uiFontSize: 14,
  lineHeight: 1.6,
  sidebarPosition: 'left',
  tabSize: 2,
  wordWrap: true,
  showLineNumbers: true,
  spellCheck: false,
  syntaxHighlight: true
}

function applySettingsToCSS(s: AppSettings): void {
  const root = document.documentElement
  root.style.setProperty('--editor-font-size', `${s.editorFontSize}px`)
  root.style.setProperty('--ui-font-size', `${s.uiFontSize}px`)
  root.style.setProperty('--editor-line-height', String(s.lineHeight))
  const fontMap: Record<string, string> = {
    system: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    serif: '"Georgia", "Times New Roman", serif',
    sans: '"Helvetica Neue", "Arial", sans-serif',
    mono: '"SFMono-Regular", Consolas, "Courier New", monospace'
  }
  root.style.setProperty('--editor-font-family', fontMap[s.fontFamily] || fontMap.system)
}

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
  const [settingsCategory, setSettingsCategory] = useState<'general' | 'appearance' | 'editor' | 'shortcuts' | 'about'>('general')
  const [viewMode, setViewMode] = useState<'edit' | 'split'>('edit')
  const [appSettings, setAppSettings] = useState<AppSettings>(DEFAULT_SETTINGS)

  const {
    tabs,
    activeTab,
    activeTabId,
    setContent,
    setFilePath,
    markSaved,
    openNewTab,
    closeTab,
    activateTab,
    findTabByPath
  } = useTabsState()

  const content = activeTab.content
  const filePath = activeTab.filePath
  const isModified = activeTab.isModified
  const headings = activeTab.headings

  const contentRef = useRef(content)
  const filePathRef = useRef(filePath)
  useEffect(() => { contentRef.current = content }, [content])
  useEffect(() => { filePathRef.current = filePath }, [filePath])

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
    window.api.settings.load().then(s => {
      setAppSettings(s)
      setTheme(s.theme)
      applySettingsToCSS(s)
    }).catch(() => {})
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  useEffect(() => {
    if (focusMode) {
      setSidebarVisible(false)
      document.documentElement.style.setProperty('--tab-bar-height', '0px')
    } else {
      document.documentElement.style.setProperty('--tab-bar-height', '36px')
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

  const handleSave = useCallback(async (): Promise<boolean> => {
    try {
      const currentPath = filePathRef.current
      const currentContent = contentRef.current
      if (currentPath) {
        const ok = await ipc.saveFile(currentPath, currentContent)
        if (ok) {
          markSaved()
          return true
        }
        return false
      } else {
        const savedPath = await ipc.saveFileAs(currentContent)
        if (savedPath) {
          setFilePath(savedPath)
          markSaved()
          return true
        }
        return false
      }
    } catch (error) {
      console.error('[App] Failed to save file:', error)
      return false
    }
  }, [markSaved, setFilePath])

  const handleExportPDF = useCallback(async () => {
    try {
      await window.api.exportPDF(filePathRef.current)
    } catch (error) {
      console.error('[App] Export PDF failed:', error)
    }
  }, [])

  const handleExportHTML = useCallback(async () => {
    try {
      const bodyHTML = editorInstance?.getHTML() ?? ''
      const title = filePathRef.current
        ? (filePathRef.current.split(/[/\\]/).pop() ?? 'Document')
        : 'Document'
      const katexCSS = 'https://cdn.jsdelivr.net/npm/katex@0.16.21/dist/katex.min.css'
      const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<title>${title.replace(/</g, '&lt;')}</title>
<link rel="stylesheet" href="${katexCSS}">
<style>
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 860px; margin: 2em auto; padding: 0 1.5em; line-height: 1.7; color: #24292f; }
h1, h2, h3, h4, h5, h6 { margin-top: 1.6em; margin-bottom: 0.6em; font-weight: 600; }
h1 { border-bottom: 1px solid #d0d7de; padding-bottom: 0.3em; }
h2 { border-bottom: 1px solid #d0d7de; padding-bottom: 0.3em; }
code { background: #f6f8fa; padding: 0.2em 0.4em; border-radius: 3px; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 0.9em; }
pre { background: #f6f8fa; padding: 1em; border-radius: 6px; overflow-x: auto; }
pre code { background: transparent; padding: 0; }
blockquote { border-left: 0.25em solid #d0d7de; padding: 0 1em; color: #57606a; margin: 1em 0; }
table { border-collapse: collapse; margin: 1em 0; }
th, td { border: 1px solid #d0d7de; padding: 0.5em 0.8em; }
th { background: #f6f8fa; }
img { max-width: 100%; }
ul.task-list { list-style: none; padding-left: 1.2em; }
ul.task-list li { position: relative; }
hr { border: none; border-top: 1px solid #d0d7de; margin: 2em 0; }
a { color: #0969da; text-decoration: none; }
a:hover { text-decoration: underline; }
</style>
</head>
<body>
${bodyHTML}
</body>
</html>`
      await window.api.exportHTML(html, filePathRef.current)
    } catch (error) {
      console.error('[App] Export HTML failed:', error)
    }
  }, [editorInstance])

  const handleSaveAs = useCallback(async (): Promise<boolean> => {
    try {
      const savedPath = await ipc.saveFileAs(contentRef.current)
      if (savedPath) {
        setFilePath(savedPath)
        markSaved()
        return true
      }
      return false
    } catch (error) {
      console.error('[App] Failed to save as:', error)
      return false
    }
  }, [markSaved, setFilePath])

  const handleNewFile = useCallback(() => {
    openNewTab({ content: '', filePath: null })
  }, [openNewTab])

  const handleOpenFile = useCallback(async () => {
    try {
      const result = await ipc.openFile()
      if (!result) return
      const existing = findTabByPath(result.filePath)
      if (existing) {
        activateTab(existing.id)
        return
      }
      openNewTab({ content: result.content, filePath: result.filePath })
    } catch (error) {
      console.error('[App] Failed to open file:', error)
    }
  }, [openNewTab, findTabByPath, activateTab])

  const handleOpenFolder = useCallback(async () => {
    const folder = await window.api.openFolder()
    if (folder) {
      setRootDir(folder)
      const tree = await window.api.readDirTree(folder)
      setDirTree(tree)
    }
  }, [])

  const handleFileSelect = useCallback(async (path: string) => {
    const existing = findTabByPath(path)
    if (existing) {
      activateTab(existing.id)
      return
    }
    const fileContent = await window.api.readFile(path)
    if (fileContent !== null) {
      openNewTab({ content: fileContent, filePath: path })
    }
  }, [openNewTab, findTabByPath, activateTab])

  const handleRequestCloseTab = useCallback(async (id: string) => {
    const target = tabs.find(t => t.id === id)
    if (!target) return
    if (target.isModified) {
      const name = target.filePath
        ? (target.filePath.split(/[/\\]/).pop() ?? '未命名')
        : '未命名'
      const choice = await window.api.confirmUnsaved(name)
      if (choice === 'cancel') return
      if (choice === 'save') {
        // Save directly from target tab's data to avoid stale refs
        if (target.filePath) {
          const ok = await ipc.saveFile(target.filePath, target.content)
          if (!ok) return
        } else {
          const savedPath = await ipc.saveFileAs(target.content)
          if (!savedPath) return
        }
      }
    }
    closeTab(id)
  }, [tabs, closeTab])

  const handleToggleTheme = useCallback((theme?: 'dark' | 'light') => {
    setTheme(prev => {
      const next: 'dark' | 'light' = (theme === 'dark' || theme === 'light') ? theme : (prev === 'dark' ? 'light' : 'dark')
      setAppSettings(s => {
        const updated: AppSettings = { ...s, theme: next }
        window.api.settings.save(updated).catch(() => {})
        return updated
      })
      return next
    })
  }, [])

  const handleSettingsChange = useCallback((newSettings: AppSettings) => {
    setAppSettings(newSettings)
    setTheme(newSettings.theme)
    applySettingsToCSS(newSettings)
  }, [])

  const tabsRef = useRef(tabs)
  useEffect(() => { tabsRef.current = tabs }, [tabs])

  useEffect(() => {
    const off = window.api.onRequestClose(async () => {
      const dirty = tabsRef.current.filter(t => t.isModified)
      for (const t of dirty) {
        const name = t.filePath
          ? (t.filePath.split(/[/\\]/).pop() ?? '未命名')
          : '未命名'
        const choice = await window.api.confirmUnsaved(name)
        if (choice === 'cancel') return
        if (choice === 'save') {
          if (t.filePath) {
            const ok = await ipc.saveFile(t.filePath, t.content)
            if (!ok) return
          } else {
            const savedPath = await ipc.saveFileAs(t.content)
            if (!savedPath) return
          }
        }
      }
      window.api.forceCloseWindow()
    })
    return off
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
        } else if (e.key === 'f' && !e.shiftKey) {
          e.preventDefault()
          setActiveView('search')
          setSidebarVisible(true)
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
    const plain = content
      .replace(/^#{1,6}\s+/gm, '')
      .replace(/!\[.*?\]\(.*?\)/g, '')
      .replace(/\[([^\]]*)\]\(.*?\)/g, '$1')
      .replace(/(`{1,3})[^`]*\1/g, '')
      .replace(/```[\s\S]*?```/g, '')
      .replace(/[*_~`>|+\-]/g, '')
      .replace(/^\s*[-*+]\s+/gm, '')
      .replace(/^\s*\d+\.\s+/gm, '')
    const chineseChars = (plain.match(/[\u4e00-\u9fa5\u3000-\u303f\uff00-\uffef]/g) || []).length
    const englishWords = plain
      .replace(/[\u4e00-\u9fa5\u3000-\u303f\uff00-\uffef]/g, ' ')
      .split(/[\s\p{P}]+/u)
      .filter(w => w.length > 0 && /[a-zA-Z0-9]/.test(w)).length
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
            onReplace={(pattern, flags, replacement) => {
              try {
                const regex = new RegExp(pattern, flags)
                setContent(content.replace(regex, replacement))
              } catch {}
            }}
            onNavigateToLine={(lineNumber) => {
              if (!editorInstance) return
              const lines = content.split('\n')
              const offset = lines.slice(0, lineNumber - 1).join('\n').length + 1
              const docSize = editorInstance.state.doc.content.size
              const pos = Math.min(offset, docSize - 1)
              try {
                editorInstance.chain().setTextSelection(Math.max(1, pos)).scrollIntoView().run()
              } catch {}
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
          onExportPDF={handleExportPDF}
          onExportHTML={handleExportHTML}
          onFind={() => { setActiveView('search'); setSidebarVisible(true) }}
          onToggleSidebar={() => setSidebarVisible(v => !v)}
          onToggleTheme={handleToggleTheme}
          onToggleFocusMode={() => setFocusMode(v => !v)}
          onToggleTypewriterMode={() => setTypewriterMode(v => !v)}
          onToggleSourceMode={() => setSourceMode(v => !v)}
          onViewModeChange={setViewMode}
        />
        {!focusMode && (
          <TabBar
            tabs={tabs}
            activeTabId={activeTabId}
            onActivate={activateTab}
            onClose={handleRequestCloseTab}
            onNewTab={handleNewFile}
          />
        )}
        <div className={`main-content ${focusMode ? 'focus-mode' : ''}`}>
          {showIconRail && (
            <IconRail
              activeView={activeView}
              onViewChange={handleViewChange}
              onOpenSettings={() => {
                setSettingsCategory('general')
                setShowSettings(true)
              }}
              onOpenHelp={() => {
                setSettingsCategory('about')
                setShowSettings(true)
              }}
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
              settings={appSettings}
              onSettingsChange={handleSettingsChange}
              initialCategory={settingsCategory}
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
                  currentFilePath={filePath}
                />
              )}
            </div>
          )}
        </div>
        <StatusBar
          cursorPosition={cursorPosition}
          wordCount={wordCount}
          filePath={filePath}
        />
      </div>
    </EditorProvider>
  )
}
