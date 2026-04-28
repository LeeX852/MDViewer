interface CursorPosition {
  line: number
  column: number
}

interface StatusBarProps {
  cursorPosition: CursorPosition
  wordCount: number
  filePath: string | null
}

function getFileExtension(filePath: string | null): string {
  if (!filePath) return 'MD'
  const parts = filePath.split('.')
  if (parts.length < 2) return 'TXT'
  const ext = parts[parts.length - 1].toLowerCase()
  const extMap: Record<string, string> = {
    md: 'MD',
    markdown: 'MD',
    txt: 'TXT',
    js: 'JS',
    ts: 'TS',
    json: 'JSON',
    html: 'HTML',
    css: 'CSS',
  }
  return extMap[ext] || ext.toUpperCase()
}

export default function StatusBar({
  cursorPosition,
  wordCount,
  filePath,
}: StatusBarProps) {
  const fileType = getFileExtension(filePath)

  return (
    <div className="status-bar">
      <div className="status-bar-left">
        <div className="status-item">
          <span>行 {cursorPosition.line}, 列 {cursorPosition.column}</span>
        </div>
        <div className="status-item">
          <span>字数 {wordCount}</span>
        </div>
        <div className="status-item">
          <span>{fileType}</span>
        </div>
      </div>
      <div className="status-bar-right">
        <div className="status-item">
          <span>{new Date().toLocaleTimeString('zh-CN', { hour12: false })}</span>
        </div>
      </div>
    </div>
  )
}
