import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react'
import katex from 'katex'
import { useState, useRef, useEffect } from 'react'

function MathInlineComponent({ node, updateAttributes }: any) {
  const [editing, setEditing] = useState(false)
  const [latex, setLatex] = useState(node.attrs.latex)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
    }
  }, [editing])

  const rendered = (() => {
    try {
      return katex.renderToString(latex, { throwOnError: false, displayMode: false })
    } catch {
      return `<span class="math-error">${latex}</span>`
    }
  })()

  if (editing) {
    return (
      <NodeViewWrapper as="span" className="math-inline-edit">
        <input
          ref={inputRef}
          value={latex}
          onChange={e => setLatex(e.target.value)}
          onBlur={() => {
            updateAttributes({ latex })
            setEditing(false)
          }}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              updateAttributes({ latex })
              setEditing(false)
            }
          }}
          className="math-inline-input"
        />
      </NodeViewWrapper>
    )
  }

  return (
    <NodeViewWrapper as="span" className="math-inline">
      <span
        dangerouslySetInnerHTML={{ __html: rendered }}
        onClick={() => setEditing(true)}
      />
    </NodeViewWrapper>
  )
}

export const MathInline = Node.create({
  name: 'mathInline',
  group: 'inline',
  inline: true,
  atom: true,

  addAttributes() {
    return { latex: { default: '' } }
  },

  parseHTML() {
    return [{ tag: 'span[data-math-inline]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes, { 'data-math-inline': '' })]
  },

  addNodeView() {
    return ReactNodeViewRenderer(MathInlineComponent)
  }
})
