import { useState } from 'react'
import type { DirNode } from '../../../preload/index.d'

interface SidebarProps {
  dirTree: DirNode[]
  rootDir: string | null
  onOpenFolder: () => void
  onFileSelect: (path: string) => void
  currentFilePath: string | null
  width: number
}

function TreeNode({ node, onSelect, currentPath }: {
  node: DirNode
  onSelect: (path: string) => void
  currentPath: string | null
}) {
  const [expanded, setExpanded] = useState(true)

  if (node.type === 'file') {
    const isActive = node.path === currentPath
    return (
      <div
        className={`tree-item file-item ${isActive ? 'active' : ''}`}
        onClick={() => onSelect(node.path)}
      >
        <span className="file-icon">📄</span>
        <span className="file-name">{node.name}</span>
      </div>
    )
  }

  return (
    <div className="tree-item directory-item">
      <div className="dir-header" onClick={() => setExpanded(v => !v)}>
        <span className="dir-icon">{expanded ? '📂' : '📁'}</span>
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
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function Sidebar({ dirTree, rootDir, onOpenFolder, onFileSelect, currentFilePath, width }: SidebarProps) {
  return (
    <div className="sidebar" style={{ width, minWidth: width }}>
      <div className="sidebar-header">
        <span className="sidebar-title">Explorer</span>
        <button className="sidebar-action" onClick={onOpenFolder} title="Open Folder">
          📂
        </button>
      </div>
      {rootDir && (
        <div className="sidebar-root">{rootDir.split(/[/\\]/).pop()}</div>
      )}
      <div className="sidebar-tree">
        {dirTree.map(node => (
          <TreeNode
            key={node.path}
            node={node}
            onSelect={onFileSelect}
            currentPath={currentFilePath}
          />
        ))}
        {dirTree.length === 0 && !rootDir && (
          <div className="sidebar-empty">
            <p>No folder opened</p>
            <button className="open-folder-btn" onClick={onOpenFolder}>
              Open Folder
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
