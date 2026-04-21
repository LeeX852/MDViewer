import { useRef, useCallback, useEffect } from 'react'

interface SourceEditorProps {
  content: string
  onChange: (content: string) => void
}

export default function SourceEditor({ content, onChange }: SourceEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const tabSize = 2

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value)
  }, [onChange])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      const textarea = textareaRef.current
      if (!textarea) return
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const value = textarea.value
      const newValue = value.substring(0, start) + ' '.repeat(tabSize) + value.substring(end)
      onChange(newValue)
      requestAnimationFrame(() => {
        textarea.selectionStart = textarea.selectionEnd = start + tabSize
      })
    }
  }, [onChange])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.value = content
    }
  }, [content])

  return (
    <div className="source-editor-wrapper">
      <textarea
        ref={textareaRef}
        className="source-editor"
        value={content}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
      />
    </div>
  )
}
