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
import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'
import { useEffect, useState, useRef, useCallback } from 'react'
import type { Editor as TiptapEditor } from '@tiptap/react'
import { MathInline } from '../extensions/MathInline'
import { MathBlock } from '../extensions/MathBlock'
import { MermaidBlock } from '../extensions/MermaidBlock'

const lowlight = createLowlight(common)

const HeadingIds = Extension.create({
  name: 'headingIds',
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('headingIds'),
        props: {
          decorations(state) {
            const decorations: Decoration[] = []
            let counter = 0
            state.doc.descendants((node, pos) => {
              if (node.type.name === 'heading') {
                counter++
                decorations.push(
                  Decoration.node(pos, pos + node.nodeSize, { id: `heading-${counter}` })
                )
              }
            })
            return DecorationSet.create(state.doc, decorations)
          }
        }
      })
    ]
  }
})

interface EditorProps {
  content: string
  onChange: (content: string) => void
  onSave: () => void
  onEditorReady?: (editor: TiptapEditor) => void
  viewMode: 'edit' | 'split'
  currentFilePath?: string | null
}

const IMAGE_MIME_EXT: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/bmp': 'bmp',
  'image/svg+xml': 'svg'
}

async function persistImageBlob(
  blob: Blob,
  currentFilePath: string | null
): Promise<string | null> {
  const ext = IMAGE_MIME_EXT[blob.type] || 'png'
  const buffer = new Uint8Array(await blob.arrayBuffer())
  const result = await window.api.saveImage(buffer, ext, currentFilePath)
  return result?.src ?? null
}

export default function Editor({ content, onChange, onSave, onEditorReady, viewMode, currentFilePath = null }: EditorProps) {
  const currentFilePathRef = useRef<string | null>(currentFilePath)
  useEffect(() => { currentFilePathRef.current = currentFilePath }, [currentFilePath])
  const [sourceContent, setSourceContent] = useState(content)
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 })
  const sourceRef = useRef<HTMLTextAreaElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const isScrollingRef = useRef(false)
  const lastEmittedRef = useRef<string>(content)

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
      MermaidBlock,
      HeadingIds
    ],
    content,
    onUpdate: ({ editor }) => {
      const markdown = editor.storage.markdown.getMarkdown()
      lastEmittedRef.current = markdown
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
      },
      handlePaste: (view, event) => {
        const items = event.clipboardData?.items
        if (!items) return false
        const imageItems = Array.from(items).filter(i => i.type.startsWith('image/'))
        if (imageItems.length === 0) return false
        event.preventDefault()
        imageItems.forEach(item => {
          const file = item.getAsFile()
          if (!file) return
          persistImageBlob(file, currentFilePathRef.current).then(src => {
            if (src) {
              editor?.chain().focus().setImage({ src }).run()
            }
          })
        })
        return true
      },
      handleDrop: (view, event) => {
        const files = event.dataTransfer?.files
        if (!files || files.length === 0) return false
        const images = Array.from(files).filter(f => f.type.startsWith('image/'))
        if (images.length === 0) return false
        event.preventDefault()
        images.forEach(file => {
          persistImageBlob(file, currentFilePathRef.current).then(src => {
            if (src) {
              editor?.chain().focus().setImage({ src }).run()
            }
          })
        })
        return true
      }
    }
  })

  useEffect(() => {
    if (editor && onEditorReady) {
      onEditorReady(editor)
    }
  }, [editor, onEditorReady])

  useEffect(() => {
    if (!editor) return
    if (content === lastEmittedRef.current) return
    const { from, to } = editor.state.selection
    editor.commands.setContent(content, false)
    lastEmittedRef.current = editor.storage.markdown.getMarkdown()
    setSourceContent(content)
    const docSize = editor.state.doc.content.size
    const safeFrom = Math.min(from, docSize)
    const safeTo = Math.min(to, docSize)
    try {
      editor.commands.setTextSelection({ from: safeFrom, to: safeTo })
    } catch {}
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
