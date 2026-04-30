import { useState, useMemo, useEffect, useCallback } from 'react'

interface TrashEntry {
  id: string
  name: string
  originalPath: string
  deletedAt: number
  size: number
}

interface TrashPanelProps {
  width: number
  onFileRestored?: (path: string) => void
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const weeks = Math.floor(days / 7)

  if (weeks > 0) return `${weeks} 周前`
  if (days > 0) return `${days} 天前`
  if (hours > 0) return `${hours} 小时前`
  if (minutes > 0) return `${minutes} 分钟前`
  return '刚刚'
}

function FileIcon({ name }: { name: string }): React.ReactElement {
  const ext = name.split('.').pop()?.toLowerCase()
  if (ext === 'md' || ext === 'markdown') {
    return (
      <svg className="trash-panel-file-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    )
  }
  return (
    <svg className="trash-panel-file-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  )
}

export default function TrashPanel({ width, onFileRestored }: TrashPanelProps): React.ReactElement {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'time' | 'name'>('time')
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const [entries, setEntries] = useState<TrashEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadEntries = useCallback(async () => {
    setIsLoading(true)
    try {
      const list = await window.api.trash.list()
      setEntries(list || [])
    } catch {
      setEntries([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { loadEntries() }, [loadEntries])

  const filteredFiles = useMemo(() => {
    let files = entries
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      files = files.filter(file =>
        file.name.toLowerCase().includes(query) ||
        file.originalPath.toLowerCase().includes(query)
      )
    }
    files = [...files].sort((a, b) => {
      if (sortBy === 'time') return b.deletedAt - a.deletedAt
      return a.name.localeCompare(b.name, 'zh-CN')
    })
    return files
  }, [entries, searchQuery, sortBy])

  const totalStats = useMemo(() => {
    const totalSize = filteredFiles.reduce((sum, file) => sum + file.size, 0)
    return { count: filteredFiles.length, size: formatFileSize(totalSize) }
  }, [filteredFiles])

  const handleRestore = async (entry: TrashEntry) => {
    const ok = await window.api.trash.restore(entry.id)
    if (ok) {
      setEntries(prev => prev.filter(e => e.id !== entry.id))
      onFileRestored?.(entry.originalPath)
    }
  }

  const handlePermanentDelete = async (entry: TrashEntry) => {
    const ok = await window.api.trash.permanentDelete(entry.id)
    if (ok) setEntries(prev => prev.filter(e => e.id !== entry.id))
  }

  const handleEmptyTrash = async () => {
    if (!window.confirm('确定要清空回收站吗？此操作不可撤销。')) return
    const ok = await window.api.trash.empty()
    if (ok) setEntries([])
  }

  const isEmpty = entries.length === 0

  return (
    <div className="trash-panel" style={{ width, minWidth: width }}>
      <div className="trash-panel-header">
        <div className="trash-panel-title">
          <svg className="trash-panel-title-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            <line x1="10" y1="11" x2="10" y2="17" />
            <line x1="14" y1="11" x2="14" y2="17" />
          </svg>
          <span>回收站</span>
        </div>
        {!isEmpty && (
          <button className="trash-panel-empty-btn" onClick={handleEmptyTrash} title="清空回收站">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            清空回收站
          </button>
        )}
      </div>

      <div className="trash-panel-search">
        <svg className="trash-panel-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="text"
          className="trash-panel-search-input"
          placeholder="搜索已删除文件..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="trash-panel-sort">
        <button className={`trash-panel-sort-btn ${sortBy === 'time' ? 'active' : ''}`} onClick={() => setSortBy('time')}>
          按删除时间
        </button>
        <button className={`trash-panel-sort-btn ${sortBy === 'name' ? 'active' : ''}`} onClick={() => setSortBy('name')}>
          按文件名
        </button>
      </div>

      <div className="trash-panel-list">
        {isLoading ? (
          <div className="trash-panel-empty">
            <div className="trash-panel-empty-title">加载中...</div>
          </div>
        ) : isEmpty ? (
          <div className="trash-panel-empty">
            <svg className="trash-panel-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              <line x1="10" y1="11" x2="10" y2="17" />
              <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
            <div className="trash-panel-empty-title">回收站为空</div>
            <div className="trash-panel-empty-desc">删除的文件将出现在这里</div>
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="trash-panel-no-results">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <span>未找到匹配的文件</span>
          </div>
        ) : (
          filteredFiles.map(file => (
            <div
              key={file.id}
              className="trash-panel-item"
              onMouseEnter={() => setHoveredItem(file.id)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <div className="trash-panel-item-content">
                <FileIcon name={file.name} />
                <div className="trash-panel-item-info">
                  <div className="trash-panel-item-name">{file.name}</div>
                  <div className="trash-panel-item-meta">
                    <span className="trash-panel-item-path">{file.originalPath}</span>
                    <span className="trash-panel-item-dot">·</span>
                    <span className="trash-panel-item-time">{formatRelativeTime(file.deletedAt)}</span>
                    <span className="trash-panel-item-dot">·</span>
                    <span className="trash-panel-item-size">{formatFileSize(file.size)}</span>
                  </div>
                </div>
              </div>
              {hoveredItem === file.id && (
                <div className="trash-panel-item-actions">
                  <button className="trash-panel-action-btn restore" onClick={() => handleRestore(file)} title="恢复">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                      <path d="M3 3v5h5" />
                    </svg>
                    恢复
                  </button>
                  <button className="trash-panel-action-btn delete" onClick={() => handlePermanentDelete(file)} title="永久删除">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                    永久删除
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {!isEmpty && (
        <div className="trash-panel-footer">
          <span>共 {totalStats.count} 个文件 · {totalStats.size}</span>
        </div>
      )}
    </div>
  )
}
