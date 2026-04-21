interface Heading {
  id: string
  level: number
  text: string
}

interface OutlinePanelProps {
  headings: Heading[]
  width: number
}

export default function OutlinePanel({ headings, width }: OutlinePanelProps) {
  const scrollToHeading = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  return (
    <div className="outline-panel" style={{ width, minWidth: width }}>
      <div className="outline-header">Outline</div>
      <div className="outline-list">
        {headings.length === 0 && (
          <div className="outline-empty">No headings</div>
        )}
        {headings.map(heading => (
          <div
            key={heading.id}
            className={`outline-item level-${heading.level}`}
            onClick={() => scrollToHeading(heading.id)}
          >
            {heading.text}
          </div>
        ))}
      </div>
    </div>
  )
}
