interface IconRailProps {
  activeView: 'files' | 'search' | 'git' | 'trash'
  onViewChange: (view: 'files' | 'search' | 'git' | 'trash') => void
  onOpenSettings: () => void
  onOpenHelp: () => void
}

export default function IconRail({
  activeView,
  onViewChange,
  onOpenSettings,
  onOpenHelp
}: IconRailProps) {
  const icons = [
    { id: 'files', icon: 'document', title: '文件' },
    { id: 'search', icon: 'search', title: '搜索' },
    { id: 'git', icon: 'git', title: '源代码管理' },
    { id: 'trash', icon: 'trash', title: '回收站' },
  ] as const

  return (
    <div className="icon-rail">
      <div className="icon-rail-top">
        {icons.map(({ id, icon, title }) => (
          <button
            key={id}
            className={`icon-rail-item ${activeView === id ? 'active' : ''}`}
            onClick={() => onViewChange(id as typeof activeView)}
            title={title}
          >
            <span className="icon-rail-indicator" />
            <svg className="icon-rail-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              {icon === 'document' && (
                <>
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </>
              )}
              {icon === 'search' && (
                <>
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </>
              )}
              {icon === 'git' && (
                <>
                  <line x1="6" y1="3" x2="6" y2="15" />
                  <circle cx="18" cy="6" r="3" />
                  <circle cx="6" cy="18" r="3" />
                  <path d="M18 9a9 9 0 0 1-9 9" />
                </>
              )}
              {icon === 'trash' && (
                <>
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  <line x1="10" y1="11" x2="10" y2="17" />
                  <line x1="14" y1="11" x2="14" y2="17" />
                </>
              )}
            </svg>
          </button>
        ))}
      </div>
      <div className="icon-rail-separator" />
      <div className="icon-rail-bottom">
        <button
          className="icon-rail-item"
          onClick={onOpenSettings}
          title="设置"
        >
          <span className="icon-rail-indicator" />
          <svg className="icon-rail-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
        <button
          className="icon-rail-item"
          onClick={onOpenHelp}
          title="帮助"
        >
          <span className="icon-rail-indicator" />
          <svg className="icon-rail-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </button>
      </div>
    </div>
  )
}
