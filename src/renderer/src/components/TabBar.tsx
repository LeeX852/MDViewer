import type { Tab } from '../hooks/useTabsState'

interface TabBarProps {
  tabs: Tab[]
  activeTabId: string
  onActivate: (id: string) => void
  onClose: (id: string) => void
  onNewTab: () => void
}

function getTabTitle(tab: Tab): string {
  if (tab.filePath) {
    return tab.filePath.split(/[/\\]/).pop() ?? '未命名'
  }
  return '未命名'
}

export default function TabBar({ tabs, activeTabId, onActivate, onClose, onNewTab }: TabBarProps) {
  const handleClose = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    onClose(id)
  }

  const handleMiddleClick = (e: React.MouseEvent, id: string) => {
    if (e.button === 1) {
      e.preventDefault()
      onClose(id)
    }
  }

  return (
    <div className="tab-bar">
      <div className="tab-bar-list">
        {tabs.map(tab => {
          const title = getTabTitle(tab)
          const isActive = tab.id === activeTabId
          return (
            <div
              key={tab.id}
              className={`tab-item ${isActive ? 'active' : ''}`}
              onClick={() => onActivate(tab.id)}
              onMouseDown={(e) => handleMiddleClick(e, tab.id)}
              title={tab.filePath ?? title}
            >
              <span className="tab-dirty-dot" aria-hidden={!tab.isModified}>
                {tab.isModified ? '●' : ''}
              </span>
              <span className="tab-title">{title}</span>
              <button
                className="tab-close-btn"
                onClick={(e) => handleClose(e, tab.id)}
                title="关闭标签页"
                aria-label="关闭标签页"
              >
                ✕
              </button>
            </div>
          )
        })}
      </div>
      <button
        className="tab-new-btn"
        onClick={onNewTab}
        title="新建标签页"
        aria-label="新建标签页"
      >
        +
      </button>
    </div>
  )
}
