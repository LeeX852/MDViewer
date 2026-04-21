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
import { useEffect } from 'react'
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
}

export default function Editor({ content, onChange, onSave, onEditorReady }: EditorProps) {
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
    if (editor && !editor.isFocused) {
      const currentMarkdown = editor.storage.markdown.getMarkdown()
      if (currentMarkdown !== content) {
        editor.commands.setContent(content)
      }
    }
  }, [content, editor])

  return (
    <div className="editor-wrapper">
      <EditorContent editor={editor} />
    </div>
  )
}
