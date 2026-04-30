import { useState, useCallback, useRef } from 'react'

export interface Heading {
  id: string
  level: number
  text: string
}

export interface Tab {
  id: string
  filePath: string | null
  content: string
  baseline: string
  isModified: boolean
  headings: Heading[]
}

const WELCOME_CONTENT = '# Welcome to MDViewer\n\nStart writing Markdown here...\n'

function generateTabId(): string {
  return `tab-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function extractHeadings(content: string): Heading[] {
  const extracted: Heading[] = []
  const lines = content.split('\n')
  let counter = 0
  for (const line of lines) {
    const match = line.match(/^(#{1,6})\s+(.+)/)
    if (match) {
      counter++
      extracted.push({
        id: `heading-${counter}`,
        level: match[1].length,
        text: match[2].replace(/[*_`~\[\]]/g, '')
      })
    }
  }
  return extracted
}

export function useTabsState() {
  const [tabs, setTabs] = useState<Tab[]>(() => [
    {
      id: generateTabId(),
      filePath: null,
      content: WELCOME_CONTENT,
      baseline: WELCOME_CONTENT,
      isModified: false,
      headings: extractHeadings(WELCOME_CONTENT)
    }
  ])
  const [activeTabId, setActiveTabId] = useState<string>(() => tabs[0].id)
  const saveTimeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  const activeTab = tabs.find(t => t.id === activeTabId) ?? tabs[0]

  const updateTab = useCallback((id: string, patch: Partial<Tab>) => {
    setTabs(prev => prev.map(t => (t.id === id ? { ...t, ...patch } : t)))
  }, [])

  const setContent = useCallback((newContent: string) => {
    const id = activeTabId
    setTabs(prev => prev.map(t => {
      if (t.id !== id) return t
      return {
        ...t,
        content: newContent,
        isModified: newContent !== t.baseline,
        headings: extractHeadings(newContent)
      }
    }))

    const existingTimeout = saveTimeoutsRef.current.get(id)
    if (existingTimeout) clearTimeout(existingTimeout)
    const timeout = setTimeout(() => {
      const target = tabsRef.current.find(t => t.id === id)
      if (target?.filePath) {
        window.api.saveFile(target.filePath, newContent).then(ok => {
          if (ok) {
            setTabs(prev => prev.map(t => t.id === id
              ? { ...t, baseline: newContent, isModified: false }
              : t))
          }
        }).catch(() => {})
      }
    }, 2000)
    saveTimeoutsRef.current.set(id, timeout)
  }, [activeTabId])

  const tabsRef = useRef<Tab[]>(tabs)
  tabsRef.current = tabs

  const setFilePath = useCallback((filePath: string | null) => {
    updateTab(activeTabId, { filePath })
  }, [activeTabId, updateTab])

  const markSaved = useCallback(() => {
    setTabs(prev => prev.map(t => t.id === activeTabId
      ? { ...t, baseline: t.content, isModified: false }
      : t))
  }, [activeTabId])

  const setBaseline = useCallback((baseline: string) => {
    setTabs(prev => prev.map(t => t.id === activeTabId
      ? { ...t, baseline, isModified: t.content !== baseline }
      : t))
  }, [activeTabId])

  const openNewTab = useCallback((initial?: Partial<Pick<Tab, 'filePath' | 'content'>>) => {
    const content = initial?.content ?? ''
    const newTab: Tab = {
      id: generateTabId(),
      filePath: initial?.filePath ?? null,
      content,
      baseline: content,
      isModified: false,
      headings: extractHeadings(content)
    }
    setTabs(prev => [...prev, newTab])
    setActiveTabId(newTab.id)
    return newTab.id
  }, [])

  const findTabByPath = useCallback((path: string): Tab | undefined => {
    return tabsRef.current.find(t => t.filePath === path)
  }, [])

  const closeTab = useCallback((id: string) => {
    const timeout = saveTimeoutsRef.current.get(id)
    if (timeout) {
      clearTimeout(timeout)
      saveTimeoutsRef.current.delete(id)
    }
    setTabs(prev => {
      const idx = prev.findIndex(t => t.id === id)
      if (idx < 0) return prev
      const next = prev.filter(t => t.id !== id)
      if (next.length === 0) {
        const fresh: Tab = {
          id: generateTabId(),
          filePath: null,
          content: '',
          baseline: '',
          isModified: false,
          headings: []
        }
        setActiveTabId(fresh.id)
        return [fresh]
      }
      if (id === activeTabId) {
        const newActive = next[Math.min(idx, next.length - 1)]
        setActiveTabId(newActive.id)
      }
      return next
    })
  }, [activeTabId])

  const activateTab = useCallback((id: string) => {
    setActiveTabId(id)
  }, [])

  return {
    tabs,
    activeTab,
    activeTabId,
    setContent,
    setFilePath,
    markSaved,
    setBaseline,
    openNewTab,
    closeTab,
    activateTab,
    findTabByPath
  }
}
