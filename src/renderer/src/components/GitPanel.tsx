import { useState } from 'react'

interface GitPanelProps {
  width: number
  onFileSelect?: (path: string) => void
}

interface GitFile {
  id: string
  name: string
  path: string
  status: 'modified' | 'added' | 'deleted' | 'untracked'
}

const statusConfig = {
  modified: { letter: 'M', color: '#f9e2af', label: '已修改' },
  added: { letter: 'A', color: '#a6e3a1', label: '已添加' },
  deleted: { letter: 'D', color: '#f38ba8', label: '已删除' },
  untracked: { letter: 'U', color: '#6c7086', label: '未跟踪' },
}

// Mock data for demonstration
const mockChangedFiles: GitFile[] = [
  { id: '1', name: 'App.tsx', path: 'src/components/App.tsx', status: 'modified' },
  { id: '2', name: 'utils.ts', path: 'src/utils.ts', status: 'modified' },
  { id: '3', name: 'styles.css', path: 'src/styles/styles.css', status: 'modified' },
  { id: '4', name: 'new-feature.tsx', path: 'src/features/new-feature.tsx', status: 'added' },
  { id: '5', name: 'old-file.js', path: 'src/old-file.js', status: 'deleted' },
  { id: '6', name: 'config.json', path: 'config.json', status: 'untracked' },
]

const mockStagedFiles: GitFile[] = [
  { id: '7', name: 'README.md', path: 'README.md', status: 'modified' },
]

// SVG Icons
const GitBranchIcon = () => (
  <svg className="git-panel-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <line x1="6" y1="3" x2="6" y2="15" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="6" cy="6" r="3" />
    <path d="M18 9a3 3 0 0 0-3-3h-3a3 3 0 0 0-3 3v3" />
    <circle cx="18" cy="18" r="3" />
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

const MoreIcon = () => (
  <svg className="git-panel-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="12" cy="12" r="1" fill="currentColor" />
    <circle cx="19" cy="12" r="1" fill="currentColor" />
    <circle cx="5" cy="12" r="1" fill="currentColor" />
  </svg>
)

const ChevronDownIcon = ({ className = '' }: { className?: string }) => (
  <svg className={`git-panel-icon ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="6 9 12 15 18 9" />
  </svg>
)

const ChevronRightIcon = ({ className = '' }: { className?: string }) => (
  <svg className={`git-panel-icon ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="9 18 15 12 9 6" />
  </svg>
)

const PlusIcon = () => (
  <svg className="git-panel-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)

const MinusIcon = () => (
  <svg className="git-panel-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)

const DiscardIcon = () => (
  <svg className="git-panel-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
)

const DownloadIcon = () => (
  <svg className="git-panel-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
)

const UploadIcon = () => (
  <svg className="git-panel-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
)

const FileIcon = () => (
  <svg className="git-panel-file-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
)

export default function GitPanel({ width, onFileSelect }: GitPanelProps) {
  const [commitMessage, setCommitMessage] = useState('')
  const [isChangesExpanded, setIsChangesExpanded] = useState(true)
  const [isStagedExpanded, setIsStagedExpanded] = useState(true)
  const [hoveredFile, setHoveredFile] = useState<string | null>(null)
  const [changedFiles] = useState<GitFile[]>(mockChangedFiles)
  const [stagedFiles] = useState<GitFile[]>(mockStagedFiles)

  const handleCommit = () => {
    if (commitMessage.trim()) {
      // Mock commit action
      console.log('Commit:', commitMessage)
      setCommitMessage('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.key === 'Enter') {
      handleCommit()
    }
  }

  const groupedChanges = {
    modified: changedFiles.filter(f => f.status === 'modified'),
    added: changedFiles.filter(f => f.status === 'added'),
    deleted: changedFiles.filter(f => f.status === 'deleted'),
    untracked: changedFiles.filter(f => f.status === 'untracked'),
  }

  const totalChanges = changedFiles.length
  const totalStaged = stagedFiles.length

  return (
    <div className="git-panel" style={{ width, minWidth: width }}>
      {/* Placeholder Banner */}
      <div
        className="git-panel-placeholder-banner"
        style={{
          padding: '12px 16px',
          background: 'linear-gradient(135deg, rgba(249, 226, 175, 0.15) 0%, rgba(166, 227, 161, 0.1) 100%)',
          borderBottom: '1px solid rgba(249, 226, 175, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '13px',
          color: '#f9e2af',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="6" y1="3" x2="6" y2="15" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="6" cy="6" r="3" />
          <path d="M18 9a3 3 0 0 0-3-3h-3a3 3 0 0 0-3 3v3" />
          <circle cx="18" cy="18" r="3" />
        </svg>
        <span>源代码管理功能开发中 - 将支持 Git 版本控制</span>
      </div>

      {/* Header */}
      <div className="git-panel-header">
        <div className="git-panel-header-title">
          <GitBranchIcon />
          <span>源代码管理</span>
        </div>
        <div className="git-panel-header-actions">
          <button className="git-panel-btn" title="刷新">
            <RefreshIcon />
          </button>
          <button className="git-panel-btn" title="更多操作">
            <MoreIcon />
          </button>
        </div>
      </div>

      {/* Branch Selector */}
      <div className="git-panel-branch">
        <button className="git-panel-branch-btn">
          <GitBranchIcon />
          <span className="git-panel-branch-name">main</span>
          <ChevronDownIcon className="git-panel-branch-chevron" />
        </button>
      </div>

      {/* Commit Message */}
      <div className="git-panel-commit">
        <textarea
          className="git-panel-commit-input"
          placeholder="提交信息 (Ctrl+Enter 提交)"
          value={commitMessage}
          onChange={(e) => setCommitMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={3}
        />
        <div className="git-panel-commit-actions">
          <button
            className="git-panel-commit-btn"
            onClick={handleCommit}
            disabled={!commitMessage.trim() || totalStaged === 0}
          >
            提交
          </button>
          <button className="git-panel-commit-dropdown" title="提交选项">
            <ChevronDownIcon />
          </button>
        </div>
      </div>

      {/* Changes Section */}
      <div className="git-panel-section">
        <div
          className="git-panel-section-header"
          onClick={() => setIsChangesExpanded(!isChangesExpanded)}
        >
          <div className="git-panel-section-title">
            {isChangesExpanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
            <span>更改</span>
            <span className="git-panel-count">({totalChanges})</span>
          </div>
          <div className="git-panel-section-actions">
            <button className="git-panel-btn" title="暂存所有更改">
              <PlusIcon />
            </button>
            <button className="git-panel-btn" title="放弃所有更改">
              <DiscardIcon />
            </button>
          </div>
        </div>

        {isChangesExpanded && (
          <div className="git-panel-file-list">
            {/* Modified Files */}
            {groupedChanges.modified.map((file) => (
              <div
                key={file.id}
                className="git-panel-file-item"
                onMouseEnter={() => setHoveredFile(file.id)}
                onMouseLeave={() => setHoveredFile(null)}
                onClick={() => onFileSelect?.(file.path)}
              >
                <div className="git-panel-file-status" style={{ color: statusConfig.modified.color }}>
                  {statusConfig.modified.letter}
                </div>
                <FileIcon />
                <div className="git-panel-file-info">
                  <span className="git-panel-file-name">{file.name}</span>
                  <span className="git-panel-file-path">{file.path}</span>
                </div>
                {hoveredFile === file.id && (
                  <div className="git-panel-file-actions">
                    <button className="git-panel-btn" title="暂存">
                      <PlusIcon />
                    </button>
                    <button className="git-panel-btn" title="放弃更改">
                      <DiscardIcon />
                    </button>
                  </div>
                )}
              </div>
            ))}

            {/* Added Files */}
            {groupedChanges.added.map((file) => (
              <div
                key={file.id}
                className="git-panel-file-item"
                onMouseEnter={() => setHoveredFile(file.id)}
                onMouseLeave={() => setHoveredFile(null)}
                onClick={() => onFileSelect?.(file.path)}
              >
                <div className="git-panel-file-status" style={{ color: statusConfig.added.color }}>
                  {statusConfig.added.letter}
                </div>
                <FileIcon />
                <div className="git-panel-file-info">
                  <span className="git-panel-file-name">{file.name}</span>
                  <span className="git-panel-file-path">{file.path}</span>
                </div>
                {hoveredFile === file.id && (
                  <div className="git-panel-file-actions">
                    <button className="git-panel-btn" title="暂存">
                      <PlusIcon />
                    </button>
                    <button className="git-panel-btn" title="放弃更改">
                      <DiscardIcon />
                    </button>
                  </div>
                )}
              </div>
            ))}

            {/* Deleted Files */}
            {groupedChanges.deleted.map((file) => (
              <div
                key={file.id}
                className="git-panel-file-item"
                onMouseEnter={() => setHoveredFile(file.id)}
                onMouseLeave={() => setHoveredFile(null)}
              >
                <div className="git-panel-file-status" style={{ color: statusConfig.deleted.color }}>
                  {statusConfig.deleted.letter}
                </div>
                <FileIcon />
                <div className="git-panel-file-info">
                  <span className="git-panel-file-name">{file.name}</span>
                  <span className="git-panel-file-path">{file.path}</span>
                </div>
                {hoveredFile === file.id && (
                  <div className="git-panel-file-actions">
                    <button className="git-panel-btn" title="暂存">
                      <PlusIcon />
                    </button>
                    <button className="git-panel-btn" title="放弃更改">
                      <DiscardIcon />
                    </button>
                  </div>
                )}
              </div>
            ))}

            {/* Untracked Files */}
            {groupedChanges.untracked.map((file) => (
              <div
                key={file.id}
                className="git-panel-file-item"
                onMouseEnter={() => setHoveredFile(file.id)}
                onMouseLeave={() => setHoveredFile(null)}
              >
                <div className="git-panel-file-status" style={{ color: statusConfig.untracked.color }}>
                  {statusConfig.untracked.letter}
                </div>
                <FileIcon />
                <div className="git-panel-file-info">
                  <span className="git-panel-file-name">{file.name}</span>
                  <span className="git-panel-file-path">{file.path}</span>
                </div>
                {hoveredFile === file.id && (
                  <div className="git-panel-file-actions">
                    <button className="git-panel-btn" title="暂存">
                      <PlusIcon />
                    </button>
                    <button className="git-panel-btn" title="放弃更改">
                      <DiscardIcon />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Staged Changes Section */}
      <div className="git-panel-section">
        <div
          className="git-panel-section-header"
          onClick={() => setIsStagedExpanded(!isStagedExpanded)}
        >
          <div className="git-panel-section-title">
            {isStagedExpanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
            <span>暂存的更改</span>
            <span className="git-panel-count">({totalStaged})</span>
          </div>
          <div className="git-panel-section-actions">
            <button className="git-panel-btn" title="取消暂存所有">
              <MinusIcon />
            </button>
          </div>
        </div>

        {isStagedExpanded && (
          <div className="git-panel-file-list">
            {stagedFiles.map((file) => (
              <div
                key={file.id}
                className="git-panel-file-item staged"
                onMouseEnter={() => setHoveredFile(`staged-${file.id}`)}
                onMouseLeave={() => setHoveredFile(null)}
                onClick={() => onFileSelect?.(file.path)}
              >
                <div className="git-panel-file-status" style={{ color: statusConfig[file.status].color }}>
                  {statusConfig[file.status].letter}
                </div>
                <FileIcon />
                <div className="git-panel-file-info">
                  <span className="git-panel-file-name">{file.name}</span>
                  <span className="git-panel-file-path">{file.path}</span>
                </div>
                {hoveredFile === `staged-${file.id}` && (
                  <div className="git-panel-file-actions">
                    <button className="git-panel-btn" title="取消暂存">
                      <MinusIcon />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sync Widget */}
      <div className="git-panel-sync">
        <div className="git-panel-sync-header">
          <div className="git-panel-sync-stats">
            <span className="git-panel-sync-item">
              <DownloadIcon />
              <span>1</span>
            </span>
            <span className="git-panel-sync-item">
              <UploadIcon />
              <span>0</span>
            </span>
          </div>
          <span className="git-panel-sync-time">上次同步: 2分钟前</span>
        </div>
      </div>
    </div>
  )
}
