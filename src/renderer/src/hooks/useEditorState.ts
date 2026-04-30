import { useState, useCallback, useRef } from 'react'

interface Heading {
  id: string
  level: number
  text: string
}

export function useEditorState() {
  const [content, setContentInternal] = useState('# Welcome to MDViewer\n\nStart writing Markdown here...\n')
  const [filePath, setFilePath] = useState<string | null>(null)
  const [isModified, setIsModified] = useState(false)
  const [headings, setHeadings] = useState<Heading[]>([])
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastSavedContentRef = useRef<string>('')

  const setContent = useCallback((newContent: string) => {
    setContentInternal(newContent)
    setIsModified(newContent !== lastSavedContentRef.current)

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    saveTimeoutRef.current = setTimeout(() => {
      if (filePath) {
        window.api.saveFile(filePath, newContent).then((ok) => {
          if (ok) {
            lastSavedContentRef.current = newContent
            setIsModified(false)
          }
        }).catch(() => {})
      }
    }, 2000)

    const extracted: Heading[] = []
    const lines = newContent.split('\n')
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
    setHeadings(extracted)
  }, [filePath])

  const markSaved = useCallback(() => {
    lastSavedContentRef.current = content
    setIsModified(false)
  }, [content])

  const setBaseline = useCallback((baseline: string) => {
    lastSavedContentRef.current = baseline
    setIsModified(false)
  }, [])

  return {
    content,
    filePath,
    isModified,
    setContent,
    setFilePath,
    markSaved,
    setBaseline,
    headings
  }
}
