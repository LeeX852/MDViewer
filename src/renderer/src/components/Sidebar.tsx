import { useState, useMemo } from 'react'
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
        <svg className="tree-file-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
          <path d="M14 2v4a1 1 0 0 0 1 1h3" />
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
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m9 18 6-6-6-6" />
        </svg>
        <svg className="tree-folder-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
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

function filterTree(nodes: DirNode[], query: string): DirNode[] {
  const q = query.toLowerCase()
  return nodes.reduce<DirNode[]>((acc, node) => {
    if (node.type === 'file') {
      if (node.name.toLowerCase().includes(q)) acc.push(node)
    } else {
      const filteredChildren = filterTree(node.children, query)
      if (filteredChildren.length > 0 || node.name.toLowerCase().includes(q)) {
        acc.push({ ...node, children: filteredChildren })
      }
    }
    return acc
  }, [])
}

export default function Sidebar({ dirTree, rootDir, onOpenFolder, onFileSelect, currentFilePath, width, headings }: SidebarProps) {
  const [activeTab, setActiveTab] = useState('explorer')
  const [searchQuery, setSearchQuery] = useState('')
  const [rootExpanded, setRootExpanded] = useState(true)

  const visibleTree = useMemo(() => {
    if (!searchQuery.trim()) return dirTree
    return filterTree(dirTree, searchQuery.trim())
  }, [dirTree, searchQuery])

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
            <svg className="sidebar-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
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
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                  <svg className="tree-folder-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
                  </svg>
                  <span className="dir-name">{rootDir.split(/[/\\]/).pop()}</span>
                </div>
                {rootExpanded && (
                  <div className="dir-children">
                    {visibleTree.map(node => (
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
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
                    <path d="M12 10v6" />
                    <path d="M9 13h6" />
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
