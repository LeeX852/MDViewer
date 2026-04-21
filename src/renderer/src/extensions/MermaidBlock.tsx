import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react'
import mermaid from 'mermaid'
import { useEffect, useRef, useState } from 'react'

mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'strict'
})

function MermaidBlockComponent({ node, updateAttributes }: any) {
  const [editing, setEditing] = useState(false)
  const [code, setCode] = useState(node.attrs.code)
  const containerRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [editing])

  useEffect(() => {
    if (!editing && containerRef.current && code) {
      const id = `mermaid-${Math.random().toString(36).slice(2, 9)}`
      mermaid.render(id, code).then(({ svg }) => {
        if (containerRef.current) {
          containerRef.current.innerHTML = svg
        }
      }).catch(() => {
        if (containerRef.current) {
          containerRef.current.innerHTML = '<p class="mermaid-error">Invalid diagram syntax</p>'
        }
      })
    }
  }, [code, editing])

  if (editing) {
    return (
      <NodeViewWrapper className="mermaid-block-edit">
        <textarea
          ref={textareaRef}
          value={code}
          onChange={e => setCode(e.target.value)}
          onBlur={() => {
            updateAttributes({ code })
            setEditing(false)
          }}
          onKeyDown={e => {
            if (e.key === 'Escape') {
              updateAttributes({ code })
              setEditing(false)
            }
          }}
          className="mermaid-textarea"
          rows={8}
        />
      </NodeViewWrapper>
    )
  }

  return (
    <NodeViewWrapper className="mermaid-block">
      <div
        ref={containerRef}
        className="mermaid-render"
        onClick={() => setEditing(true)}
      />
    </NodeViewWrapper>
  )
}

export const MermaidBlock = Node.create({
  name: 'mermaidBlock',
  group: 'block',
  atom: true,

  addAttributes() {
    return { code: { default: '' } }
  },

  parseHTML() {
    return [{ tag: 'div[data-mermaid-block]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-mermaid-block': '' })]
  },

  addNodeView() {
    return ReactNodeViewRenderer(MermaidBlockComponent)
  }
})
