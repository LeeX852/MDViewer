import { useState } from 'react'
import type { DirNode } from '../../../preload/index.d'

interface SidebarProps {
  dirTree: DirNode[]
  rootDir: string | null
  onOpenFolder: () => void
  onFileSelect: (path: string) => void
  currentFilePath: string | null
  width: number
  headings?: { id: string; level: number; text: string }[]
}

interface TreeNodeProps {
  node: DirNode
  onSelect: (path: string) => void
  currentPath: string | null
  level: number
}

function TreeNode({ node, onSelect, currentPath, level }: TreeNodeProps) {
  const [expanded, setExpanded] = useState(true)
  const isActive = node.path === currentPath
  const paddingLeft = 12 + level * 12

  if (node.type === 'file') {
    return (
      <div
        className={`tree-item file-item ${isActive ? 'active' : ''}`}
        onClick={() => onSelect(node.path)}
        style={{ paddingLeft }}
      >
        <svg className="tree-file-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
        <span className="file-name">{node.name}</span>
      </div>
    )
  }

  return (
    <div className="tree-item directory-item">
      <div
        className="dir-header"
        onClick={() => setExpanded(v => !v)}
        style={{ paddingLeft }}
      >
        <svg
          className={`tree-expand-icon ${expanded ? 'expanded' : ''}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
        <svg className="tree-folder-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        </svg>
        <span className="dir-name">{node.name}</span>
      </div>
      {expanded && node.children.length > 0 && (
        <div className="dir-children">
          {node.children.map(child => (
            <TreeNode
              key={child.path}
              node={child}
              onSelect={onSelect}
              currentPath={currentPath}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function Sidebar({ dirTree, rootDir, onOpenFolder, onFileSelect, currentFilePath, width, headings }: SidebarProps) {
  const [activeTab, setActiveTab] = useState('explorer')
  const [searchQuery, setSearchQuery] = useState('')
  const [rootExpanded, setRootExpanded] = useState(true)

  return (
    <div className="sidebar" style={{ width, minWidth: width }}>
      <div className="sidebar-tabs">
        <button
          className={`sidebar-tab ${activeTab === 'explorer' ? 'active' : ''}`}
          onClick={() => setActiveTab('explorer')}
        >
          Explorer
        </button>
        <button
          className={`sidebar-tab ${activeTab === 'outline' ? 'active' : ''}`}
          onClick={() => setActiveTab('outline')}
        >
          大纲
        </button>
      </div>

      {activeTab === 'explorer' && (
        <>
          <div className="sidebar-search">
            <svg className="sidebar-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              className="sidebar-search-input"
              placeholder="搜索文件..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="sidebar-tree">
            {rootDir ? (
              <div className="sidebar-root">
                <div
                  className="dir-header"
                  style={{ paddingLeft: 12 }}
                  onClick={() => setRootExpanded(v => !v)}
                >
                  <svg
                    className={`tree-expand-icon ${rootExpanded ? 'expanded' : ''}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                  <svg className="tree-folder-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                  </svg>
                  <span className="dir-name">{rootDir.split(/[/\\]/).pop()}</span>
                </div>
                {rootExpanded && (
                  <div className="dir-children">
                    {dirTree.map(node => (
                      <TreeNode
                        key={node.path}
                        node={node}
                        onSelect={onFileSelect}
                        currentPath={currentFilePath}
                        level={0}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="sidebar-empty">
                <button className="open-folder-btn" onClick={onOpenFolder}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                  </svg>
                  打开文件夹
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'outline' && (
        <div className="sidebar-tree">
          {headings && headings.length > 0 ? (
            headings.map(heading => (
              <div
                key={heading.id}
                className={`outline-item level-${heading.level}`}
                onClick={() => {
                  const el = document.getElementById(heading.id)
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
                }}
              >
                {heading.text}
              </div>
            ))
          ) : (
            <div className="sidebar-empty">
              <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>暂无标题</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
