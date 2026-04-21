import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react'
import katex from 'katex'
import { useState, useRef, useEffect } from 'react'

function MathBlockComponent({ node, updateAttributes }: any) {
  const [editing, setEditing] = useState(false)
  const [latex, setLatex] = useState(node.attrs.latex)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [editing])

  const rendered = (() => {
    try {
      return katex.renderToString(latex, { throwOnError: false, displayMode: true })
    } catch {
      return `<span class="math-error">${latex}</span>`
    }
  })()

  if (editing) {
    return (
      <NodeViewWrapper className="math-block-edit">
        <textarea
          ref={textareaRef}
          value={latex}
          onChange={e => setLatex(e.target.value)}
          onBlur={() => {
            updateAttributes({ latex })
            setEditing(false)
          }}
          onKeyDown={e => {
            if (e.key === 'Escape') {
              updateAttributes({ latex })
              setEditing(false)
            }
          }}
          className="math-block-textarea"
          rows={3}
        />
      </NodeViewWrapper>
    )
  }

  return (
    <NodeViewWrapper className="math-block">
      <div
        dangerouslySetInnerHTML={{ __html: rendered }}
        onClick={() => setEditing(true)}
      />
    </NodeViewWrapper>
  )
}

export const MathBlock = Node.create({
  name: 'mathBlock',
  group: 'block',
  atom: true,

  addAttributes() {
    return { latex: { default: '' } }
  },

  parseHTML() {
    return [{ tag: 'div[data-math-block]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-math-block': '' })]
  },

  addNodeView() {
    return ReactNodeViewRenderer(MathBlockComponent)
  }
})
