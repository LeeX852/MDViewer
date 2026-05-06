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
            <svg className="icon-rail-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              {icon === 'document' && (
                <>
                  <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                  <path d="M14 2v4a1 1 0 0 0 1 1h3" />
                  <path d="M10 13h4" />
                  <path d="M10 17h4" />
                  <path d="M10 9h1" />
                </>
              )}
              {icon === 'search' && (
                <>
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </>
              )}
              {icon === 'git' && (
                <>
                  <circle cx="18" cy="18" r="3" />
                  <circle cx="6" cy="6" r="3" />
                  <path d="M6 21V9a9 9 0 0 0 9 9" />
                </>
              )}
              {icon === 'trash' && (
                <>
                  <path d="M3 6h18" />
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
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
          <svg className="icon-rail-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </button>
        <button
          className="icon-rail-item"
          onClick={onOpenHelp}
          title="帮助"
        >
          <span className="icon-rail-indicator" />
          <svg className="icon-rail-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <path d="M12 17h.01" />
          </svg>
        </button>
      </div>
    </div>
  )
}
