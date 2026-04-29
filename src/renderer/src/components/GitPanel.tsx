import { useState, useEffect, useCallback } from 'react'
import { ipc } from '../utils/ipc'

interface GitPanelProps {
  width: number
  filePath: string | null
  content: string
  onRestoreSnapshot: (content: string) => void
  onFileSelect?: (path: string) => void
}

interface SnapshotMeta {
  id: string
  timestamp: number
  label: string
}


const HistoryIcon = () => (
  <svg className="git-panel-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
)

const RefreshIcon = () => (
  <svg className="git-panel-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
    <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
    <path d="M16 21h5v-5" />
  </svg>
)

const PlusIcon = () => (
  <svg className="git-panel-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)

const RestoreIcon = () => (
  <svg className="git-panel-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
  </svg>
)

const ClockIcon = () => (
  <svg className="git-panel-file-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
)

const EmptyStateIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ opacity: 0.3 }}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
)

function formatTimestamp(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour

  if (diff < minute) {
    return '刚刚'
  } else if (diff < hour) {
    const minutes = Math.floor(diff / minute)
    return `${minutes}分钟前`
  } else if (diff < day) {
    const hours = Math.floor(diff / hour)
    return `${hours}小时前`
  } else {
    const date = new Date(timestamp)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
}

export default function GitPanel({ width, filePath, content, onRestoreSnapshot }: GitPanelProps) {
  const [snapshots, setSnapshots] = useState<SnapshotMeta[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [snapshotLabel, setSnapshotLabel] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const loadSnapshots = useCallback(async () => {
    if (!filePath) {
      setSnapshots([])
      return
    }

    setIsLoading(true)
    try {
      const result = await ipc.snapshot.list(filePath)
      const sorted = (result || []).sort((a: SnapshotMeta, b: SnapshotMeta) => b.timestamp - a.timestamp)
      setSnapshots(sorted)
    } catch (error) {
      console.error('Failed to load snapshots:', error)
      setSnapshots([])
    } finally {
      setIsLoading(false)
    }
  }, [filePath])

  useEffect(() => {
    loadSnapshots()
  }, [loadSnapshots])

  const handleCreateSnapshot = async () => {
    if (!filePath || !content) return

    setIsCreating(true)
    try {
      const label = snapshotLabel.trim() || `版本 ${snapshots.length + 1}`
      await ipc.snapshot.save(filePath, content, label)
      setSnapshotLabel('')
      await loadSnapshots()
    } catch (error) {
      console.error('Failed to create snapshot:', error)
    } finally {
      setIsCreating(false)
    }
  }

  const handleRestore = async (snapshotId: string) => {
    if (!filePath) return

    try {
      const entry = await ipc.snapshot.get(filePath, snapshotId)
      if (entry && entry.content) {
        onRestoreSnapshot(entry.content)
      }
    } catch (error) {
      console.error('Failed to restore snapshot:', error)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && filePath && !isCreating) {
      handleCreateSnapshot()
    }
  }

  return (
    <div className="git-panel" style={{ width, minWidth: width }}>
      <div className="git-panel-header">
        <div className="git-panel-header-title">
          <HistoryIcon />
          <span>版本历史</span>
        </div>
        <div className="git-panel-header-actions">
          <button
            className="git-panel-btn"
            title="刷新"
            onClick={loadSnapshots}
            disabled={isLoading || !filePath}
          >
            <RefreshIcon />
          </button>
        </div>
      </div>

      <div className="git-panel-commit">
        <input
          type="text"
          className="git-panel-commit-input"
          placeholder="快照描述（可选）"
          value={snapshotLabel}
          onChange={(e) => setSnapshotLabel(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={!filePath || isCreating}
        />
        <div className="git-panel-commit-actions">
          <button
            className="git-panel-commit-btn"
            onClick={handleCreateSnapshot}
            disabled={!filePath || isCreating || !content}
          >
            {isCreating ? '创建中...' : '创建快照'}
          </button>
        </div>
      </div>

      <div className="git-panel-section" style={{ flex: 1, overflow: 'auto' }}>
        <div className="git-panel-section-header" style={{ cursor: 'default' }}>
          <div className="git-panel-section-title">
            <span>历史版本</span>
            <span className="git-panel-count">({snapshots.length})</span>
          </div>
        </div>

        {isLoading ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
            加载中...
          </div>
        ) : snapshots.length === 0 ? (
          <div
            style={{
              padding: '48px 24px',
              textAlign: 'center',
              color: 'var(--text-muted)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px'
            }}
          >
            <EmptyStateIcon />
            <span>暂无版本历史</span>
            {filePath && (
              <span style={{ fontSize: '12px', opacity: 0.7 }}>
                创建第一个快照来保存当前版本
              </span>
            )}
          </div>
        ) : (
          <div className="git-panel-file-list">
            {snapshots.map((snapshot) => (
              <div
                key={snapshot.id}
                className="git-panel-file-item"
                style={{ marginBottom: '8px' }}
              >
                <ClockIcon />
                <div className="git-panel-file-info">
                  <span className="git-panel-file-name">{snapshot.label}</span>
                  <span className="git-panel-file-path">{formatTimestamp(snapshot.timestamp)}</span>
                </div>
                <div className="git-panel-file-actions">
                  <button
                    className="git-panel-btn"
                    title="恢复此版本"
                    onClick={() => handleRestore(snapshot.id)}
                  >
                    <RestoreIcon />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
