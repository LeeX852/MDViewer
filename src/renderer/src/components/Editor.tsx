import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Highlight from '@tiptap/extension-highlight'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import Placeholder from '@tiptap/extension-placeholder'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { common, createLowlight } from 'lowlight'
import { Markdown } from 'tiptap-markdown'
import { useEffect, useState, useRef, useCallback } from 'react'
import type { Editor as TiptapEditor } from '@tiptap/react'
import { MathInline } from '../extensions/MathInline'
import { MathBlock } from '../extensions/MathBlock'
import { MermaidBlock } from '../extensions/MermaidBlock'

const lowlight = createLowlight(common)

interface EditorProps {
  content: string
  onChange: (content: string) => void
  onSave: () => void
  onEditorReady?: (editor: TiptapEditor) => void
  viewMode: 'edit' | 'split'
}

export default function Editor({ content, onChange, onSave, onEditorReady, viewMode }: EditorProps) {
  const [sourceContent, setSourceContent] = useState(content)
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 })
  const sourceRef = useRef<HTMLTextAreaElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const isScrollingRef = useRef(false)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        heading: { levels: [1, 2, 3, 4, 5, 6] }
      }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Highlight.configure({ multicolor: true }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      Placeholder.configure({
        placeholder: 'Start writing Markdown...'
      }),
      Image.configure({ inline: true }),
      Link.configure({ openOnClick: true, autolink: true }),
      CodeBlockLowlight.configure({ lowlight }),
      Markdown.configure({
        html: true,
        transformPastedText: true,
        transformCopiedText: true
      }),
      MathInline,
      MathBlock,
      MermaidBlock
    ],
    content,
    onUpdate: ({ editor }) => {
      const markdown = editor.storage.markdown.getMarkdown()
      onChange(markdown)
      setSourceContent(markdown)
    },
    editorProps: {
      attributes: {
        class: 'prosemirror-editor'
      },
      handleKeyDown: (view, event) => {
        if ((event.ctrlKey || event.metaKey) && event.key === 's') {
          event.preventDefault()
          onSave()
          return true
        }
        return false
      }
    }
  })

  useEffect(() => {
    if (editor && onEditorReady) {
      onEditorReady(editor)
    }
  }, [editor, onEditorReady])

  useEffect(() => {
    if (editor) {
      const currentMarkdown = editor.storage.markdown.getMarkdown()
      if (currentMarkdown !== content) {
        editor.commands.setContent(content)
        setSourceContent(content)
      }
    }
  }, [content, editor])

  const handleSourceChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value
    setSourceContent(newContent)
    onChange(newContent)

    const cursorPos = e.target.selectionStart
    const lines = newContent.substring(0, cursorPos).split('\n')
    setCursorPosition({
      line: lines.length,
      column: lines[lines.length - 1].length + 1
    })
  }, [onChange])

  const handleSourceKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      const textarea = sourceRef.current
      if (!textarea) return
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const value = textarea.value
      const newValue = value.substring(0, start) + '  ' + value.substring(end)
      setSourceContent(newValue)
      onChange(newValue)
      requestAnimationFrame(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2
      })
    }
  }, [onChange])

  const handleSourceScroll = useCallback(() => {
    if (viewMode !== 'split' || isScrollingRef.current) return
    isScrollingRef.current = true
    const sourceEl = sourceRef.current
    const previewEl = previewRef.current
    if (sourceEl && previewEl) {
      const scrollPercent = sourceEl.scrollTop / (sourceEl.scrollHeight - sourceEl.clientHeight)
      previewEl.scrollTop = scrollPercent * (previewEl.scrollHeight - previewEl.clientHeight)
    }
    setTimeout(() => { isScrollingRef.current = false }, 50)
  }, [viewMode])

  const handlePreviewScroll = useCallback(() => {
    if (viewMode !== 'split' || isScrollingRef.current) return
    isScrollingRef.current = true
    const sourceEl = sourceRef.current
    const previewEl = previewRef.current
    if (sourceEl && previewEl) {
      const scrollPercent = previewEl.scrollTop / (previewEl.scrollHeight - previewEl.clientHeight)
      sourceEl.scrollTop = scrollPercent * (sourceEl.scrollHeight - sourceEl.clientHeight)
    }
    setTimeout(() => { isScrollingRef.current = false }, 50)
  }, [viewMode])

  const lineNumbers = sourceContent.split('\n').map((_, i) => i + 1)

  if (viewMode === 'edit') {
    return (
      <div className="editor-container edit-mode">
        <div className="editor-toolbar">
          <div className="editor-toolbar-right">
            <span className="editor-cursor-info">行 {cursorPosition.line}, 列 {cursorPosition.column}</span>
          </div>
        </div>
        <div className="editor-panels single">
          <div className="editor-preview-panel centered">
            <div className="editor-wrapper">
              <EditorContent editor={editor} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="editor-container split-mode">
      <div className="editor-toolbar">
        <div className="editor-toolbar-right">
          <span className="editor-cursor-info">行 {cursorPosition.line}, 列 {cursorPosition.column}</span>
        </div>
      </div>

      <div className="editor-panels split">
        <div className="editor-source-panel">
          <div className="line-numbers">
            {lineNumbers.map(num => (
              <div key={num} className="line-number">{num}</div>
            ))}
          </div>
          <textarea
            ref={sourceRef}
            className="source-editor"
            value={sourceContent}
            onChange={handleSourceChange}
            onKeyDown={handleSourceKeyDown}
            onScroll={handleSourceScroll}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
          />
        </div>

        <div
          ref={previewRef}
          className="editor-preview-panel"
          onScroll={handlePreviewScroll}
        >
          <div className="editor-wrapper">
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>
    </div>
  )
}
