import { useState } from 'react'

interface SettingsPanelProps {
  theme: 'dark' | 'light'
  onThemeChange: (theme: 'dark' | 'light') => void
  onClose: () => void
}

type SettingsCategory = 'general' | 'appearance' | 'editor' | 'shortcuts' | 'about'

interface ShortcutItem {
  category: string
  items: { action: string; key: string }[]
}

const shortcutsData: ShortcutItem[] = [
  {
    category: '文件操作',
    items: [
      { action: '新建文件', key: 'Ctrl+N' },
      { action: '打开文件', key: 'Ctrl+O' },
      { action: '保存文件', key: 'Ctrl+S' },
      { action: '另存为', key: 'Ctrl+Shift+S' },
    ],
  },
  {
    category: '编辑操作',
    items: [
      { action: '撤销', key: 'Ctrl+Z' },
      { action: '重做', key: 'Ctrl+Shift+Z' },
      { action: '剪切', key: 'Ctrl+X' },
      { action: '复制', key: 'Ctrl+C' },
      { action: '粘贴', key: 'Ctrl+V' },
      { action: '全选', key: 'Ctrl+A' },
    ],
  },
  {
    category: '格式设置',
    items: [
      { action: '加粗', key: 'Ctrl+B' },
      { action: '斜体', key: 'Ctrl+I' },
      { action: '下划线', key: 'Ctrl+U' },
      { action: '删除线', key: 'Ctrl+Shift+D' },
      { action: '行内代码', key: 'Ctrl+`' },
      { action: '插入链接', key: 'Ctrl+K' },
      { action: '插入行内公式', key: 'Ctrl+M' },
    ],
  },
  {
    category: '段落样式',
    items: [
      { action: '标题 1', key: 'Ctrl+1' },
      { action: '标题 2', key: 'Ctrl+2' },
      { action: '标题 3', key: 'Ctrl+3' },
      { action: '标题 4', key: 'Ctrl+4' },
      { action: '标题 5', key: 'Ctrl+5' },
      { action: '标题 6', key: 'Ctrl+6' },
      { action: '正文', key: 'Ctrl+0' },
    ],
  },
  {
    category: '视图切换',
    items: [
      { action: '切换侧边栏', key: 'Ctrl+\\' },
      { action: '切换源码模式', key: 'Ctrl+/' },
      { action: '切换聚焦模式', key: 'F8' },
      { action: '切换打字机模式', key: 'F9' },
    ],
  },
]

// SVG Icons
const Icons = {
  gear: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v6m0 6v6m4.22-10.22l4.24-4.24M6.34 17.66l-4.24 4.24M23 12h-6m-6 0H1m20.24 4.24l-4.24-4.24M6.34 6.34L2.1 2.1" />
    </svg>
  ),
  palette: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a7 7 0 1 0 10 10" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  code: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  ),
  keyboard: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M8 12h.01M12 12h.01M16 12h.01M7 16h10" />
    </svg>
  ),
  info: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  ),
  close: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  arrowLeft: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  ),
  search: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  ),
  edit: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
  check: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  chevronDown: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  ),
}

export default function SettingsPanel({ theme, onThemeChange, onClose }: SettingsPanelProps) {
  const [activeCategory, setActiveCategory] = useState<SettingsCategory>('general')

  // General settings state
  const [language, setLanguage] = useState('zh-CN')
  const [encoding, setEncoding] = useState('UTF-8')
  const [autoSave, setAutoSave] = useState(true)
  const [startupMode, setStartupMode] = useState<'welcome' | 'lastFile' | 'blank'>('welcome')
  const [fileAssociation, setFileAssociation] = useState(true)

  // Appearance settings state
  const [fontFamily, setFontFamily] = useState('system')
  const [editorFontSize, setEditorFontSize] = useState(14)
  const [uiFontSize, setUiFontSize] = useState(14)
  const [lineHeight, setLineHeight] = useState(1.6)
  const [sidebarPosition, setSidebarPosition] = useState<'left' | 'right'>('left')

  // Editor settings state
  const [tabSize, setTabSize] = useState<2 | 4>(2)
  const [wordWrap, setWordWrap] = useState(true)
  const [showLineNumbers, setShowLineNumbers] = useState(true)
  const [indentGuides, setIndentGuides] = useState(true)
  const [spellCheck, setSpellCheck] = useState(false)
  const [syntaxHighlight, setSyntaxHighlight] = useState(true)

  const [shortcutSearch, setShortcutSearch] = useState('')

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value
    setLanguage(newLang)
    console.log(`[Settings] Language changed to ${newLang}. Restart required to apply changes.`)
    alert('语言设置已更改，重启应用后生效')
  }

  const handleSaveSettings = () => {
    const settings = {
      language,
      encoding,
      autoSave,
      startupMode,
      fileAssociation,
      fontFamily,
      editorFontSize,
      uiFontSize,
      lineHeight,
      sidebarPosition,
      tabSize,
      wordWrap,
      showLineNumbers,
      indentGuides,
      spellCheck,
      syntaxHighlight,
      theme,
    }
    console.log('[Settings] Saving settings:', settings)
    alert('设置已保存（控制台查看详情）')
  }

  const categories = [
    { id: 'general' as SettingsCategory, label: '通用', icon: Icons.gear },
    { id: 'appearance' as SettingsCategory, label: '外观', icon: Icons.palette },
    { id: 'editor' as SettingsCategory, label: '编辑器', icon: Icons.code },
    { id: 'shortcuts' as SettingsCategory, label: '快捷键', icon: Icons.keyboard },
    { id: 'about' as SettingsCategory, label: '关于', icon: Icons.info },
  ]

  const filteredShortcuts = shortcutSearch
    ? shortcutsData.map(group => ({
        category: group.category,
        items: group.items.filter(item =>
          item.action.toLowerCase().includes(shortcutSearch.toLowerCase()) ||
          item.key.toLowerCase().includes(shortcutSearch.toLowerCase())
        ),
      })).filter(group => group.items.length > 0)
    : shortcutsData

  const renderGeneralSettings = () => (
    <div className="settings-section">
      <h2 className="settings-section-title">通用设置</h2>

      <div className="settings-group">
        <label className="settings-label">语言</label>
        <div className="settings-select-wrapper">
          <select
            className="settings-select"
            value={language}
            onChange={handleLanguageChange}
          >
            <option value="zh-CN">简体中文</option>
            <option value="en">English</option>
          </select>
          <span className="settings-select-icon">{Icons.chevronDown}</span>
        </div>
      </div>

      <div className="settings-group">
        <label className="settings-label">默认文件编码</label>
        <div className="settings-select-wrapper">
          <select
            className="settings-select"
            value={encoding}
            onChange={(e) => setEncoding(e.target.value)}
          >
            <option value="UTF-8">UTF-8</option>
            <option value="UTF-8-BOM">UTF-8 with BOM</option>
            <option value="GBK">GBK</option>
            <option value="GB2312">GB2312</option>
          </select>
          <span className="settings-select-icon">{Icons.chevronDown}</span>
        </div>
      </div>

      <div className="settings-group">
        <div className="settings-row">
          <label className="settings-label">自动保存</label>
          <button
            className={`settings-toggle ${autoSave ? 'active' : ''}`}
            onClick={() => setAutoSave(!autoSave)}
          >
            <span className="settings-toggle-thumb" />
          </button>
        </div>
        <span className="settings-description">每 5 秒自动保存</span>
      </div>

      <div className="settings-group">
        <label className="settings-label">启动时</label>
        <div className="settings-radio-group">
          <button
            className={`settings-radio ${startupMode === 'welcome' ? 'active' : ''}`}
            onClick={() => setStartupMode('welcome')}
          >
            <span className="settings-radio-dot" />
            <span className="settings-radio-label">打开欢迎页</span>
          </button>
          <button
            className={`settings-radio ${startupMode === 'lastFile' ? 'active' : ''}`}
            onClick={() => setStartupMode('lastFile')}
          >
            <span className="settings-radio-dot" />
            <span className="settings-radio-label">打开上次文件</span>
          </button>
          <button
            className={`settings-radio ${startupMode === 'blank' ? 'active' : ''}`}
            onClick={() => setStartupMode('blank')}
          >
            <span className="settings-radio-dot" />
            <span className="settings-radio-label">空白页</span>
          </button>
        </div>
      </div>

      <div className="settings-group">
        <div className="settings-row">
          <label className="settings-label">文件关联</label>
          <button
            className={`settings-toggle ${fileAssociation ? 'active' : ''}`}
            onClick={() => setFileAssociation(!fileAssociation)}
          >
            <span className="settings-toggle-thumb" />
          </button>
        </div>
        <span className="settings-description">关联 .md 文件</span>
      </div>
    </div>
  )

  const renderAppearanceSettings = () => (
    <div className="settings-section">
      <h2 className="settings-section-title">外观设置</h2>

      <div className="settings-group">
        <label className="settings-label">主题</label>
        <div className="settings-theme-toggle">
          <button
            className={`settings-theme-btn ${theme === 'dark' ? 'active' : ''}`}
            onClick={() => onThemeChange('dark')}
          >
            暗色
          </button>
          <button
            className={`settings-theme-btn ${theme === 'light' ? 'active' : ''}`}
            onClick={() => onThemeChange('light')}
          >
            亮色
          </button>
        </div>
      </div>

      <div className="settings-group">
        <label className="settings-label">字体</label>
        <div className="settings-select-wrapper">
          <select
            className="settings-select"
            value={fontFamily}
            onChange={(e) => setFontFamily(e.target.value)}
          >
            <option value="system">系统默认</option>
            <option value="serif">衬线字体</option>
            <option value="sans">无衬线字体</option>
            <option value="mono">等宽字体</option>
          </select>
          <span className="settings-select-icon">{Icons.chevronDown}</span>
        </div>
      </div>

      <div className="settings-group">
        <div className="settings-row">
          <label className="settings-label">编辑器字号</label>
          <span className="settings-value">{editorFontSize}px</span>
        </div>
        <div className="settings-slider">
          <input
            type="range"
            min={12}
            max={24}
            value={editorFontSize}
            onChange={(e) => setEditorFontSize(Number(e.target.value))}
          />
          <div className="settings-slider-track">
            <div
              className="settings-slider-fill"
              style={{ width: `${((editorFontSize - 12) / (24 - 12)) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="settings-group">
        <div className="settings-row">
          <label className="settings-label">界面字号</label>
          <span className="settings-value">{uiFontSize}px</span>
        </div>
        <div className="settings-slider">
          <input
            type="range"
            min={12}
            max={18}
            value={uiFontSize}
            onChange={(e) => setUiFontSize(Number(e.target.value))}
          />
          <div className="settings-slider-track">
            <div
              className="settings-slider-fill"
              style={{ width: `${((uiFontSize - 12) / (18 - 12)) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="settings-group">
        <div className="settings-row">
          <label className="settings-label">行高</label>
          <span className="settings-value">{lineHeight.toFixed(1)}</span>
        </div>
        <div className="settings-slider">
          <input
            type="range"
            min={1.2}
            max={2.0}
            step={0.1}
            value={lineHeight}
            onChange={(e) => setLineHeight(Number(e.target.value))}
          />
          <div className="settings-slider-track">
            <div
              className="settings-slider-fill"
              style={{ width: `${((lineHeight - 1.2) / (2.0 - 1.2)) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="settings-group">
        <label className="settings-label">侧边栏位置</label>
        <div className="settings-radio-group horizontal">
          <button
            className={`settings-radio ${sidebarPosition === 'left' ? 'active' : ''}`}
            onClick={() => setSidebarPosition('left')}
          >
            <span className="settings-radio-dot" />
            <span className="settings-radio-label">左侧</span>
          </button>
          <button
            className={`settings-radio ${sidebarPosition === 'right' ? 'active' : ''}`}
            onClick={() => setSidebarPosition('right')}
          >
            <span className="settings-radio-dot" />
            <span className="settings-radio-label">右侧</span>
          </button>
        </div>
      </div>
    </div>
  )

  const renderEditorSettings = () => (
    <div className="settings-section">
      <h2 className="settings-section-title">编辑器设置</h2>

      <div className="settings-group">
        <label className="settings-label">Tab 大小</label>
        <div className="settings-radio-group horizontal">
          <button
            className={`settings-radio ${tabSize === 2 ? 'active' : ''}`}
            onClick={() => setTabSize(2)}
          >
            <span className="settings-radio-dot" />
            <span className="settings-radio-label">2 空格</span>
          </button>
          <button
            className={`settings-radio ${tabSize === 4 ? 'active' : ''}`}
            onClick={() => setTabSize(4)}
          >
            <span className="settings-radio-dot" />
            <span className="settings-radio-label">4 空格</span>
          </button>
        </div>
      </div>

      <div className="settings-group">
        <div className="settings-row">
          <label className="settings-label">自动换行</label>
          <button
            className={`settings-toggle ${wordWrap ? 'active' : ''}`}
            onClick={() => setWordWrap(!wordWrap)}
          >
            <span className="settings-toggle-thumb" />
          </button>
        </div>
      </div>

      <div className="settings-group">
        <div className="settings-row">
          <label className="settings-label">显示行号</label>
          <button
            className={`settings-toggle ${showLineNumbers ? 'active' : ''}`}
            onClick={() => setShowLineNumbers(!showLineNumbers)}
          >
            <span className="settings-toggle-thumb" />
          </button>
        </div>
      </div>

      <div className="settings-group">
        <div className="settings-row">
          <label className="settings-label">缩进参考线</label>
          <button
            className={`settings-toggle ${indentGuides ? 'active' : ''}`}
            onClick={() => setIndentGuides(!indentGuides)}
          >
            <span className="settings-toggle-thumb" />
          </button>
        </div>
      </div>

      <div className="settings-group">
        <div className="settings-row">
          <label className="settings-label">拼写检查</label>
          <button
            className={`settings-toggle ${spellCheck ? 'active' : ''}`}
            onClick={() => setSpellCheck(!spellCheck)}
          >
            <span className="settings-toggle-thumb" />
          </button>
        </div>
      </div>

      <div className="settings-group">
        <div className="settings-row">
          <label className="settings-label">Markdown 语法高亮</label>
          <button
            className={`settings-toggle ${syntaxHighlight ? 'active' : ''}`}
            onClick={() => setSyntaxHighlight(!syntaxHighlight)}
          >
            <span className="settings-toggle-thumb" />
          </button>
        </div>
      </div>
    </div>
  )

  const renderShortcutsSettings = () => (
    <div className="settings-section">
      <h2 className="settings-section-title">快捷键</h2>

      <div className="settings-search">
        <span className="settings-search-icon">{Icons.search}</span>
        <input
          type="text"
          className="settings-search-input"
          placeholder="搜索快捷键..."
          value={shortcutSearch}
          onChange={(e) => setShortcutSearch(e.target.value)}
        />
      </div>

      <div className="settings-shortcuts-list">
        {filteredShortcuts.map((group) => (
          <div key={group.category} className="settings-shortcuts-group">
            <h3 className="settings-shortcuts-category">{group.category}</h3>
            <div className="settings-shortcuts-items">
              {group.items.map((item) => (
                <div key={item.action} className="settings-shortcut-item">
                  <span className="settings-shortcut-action">{item.action}</span>
                  <div className="settings-shortcut-right">
                    <kbd className="settings-shortcut-key">{item.key}</kbd>
                    <button className="settings-shortcut-edit" title="编辑快捷键">
                      {Icons.edit}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderAboutSettings = () => (
    <div className="settings-section">
      <div className="settings-about">
        <div className="settings-about-logo">
          <svg viewBox="0 0 64 64" fill="none">
            <circle cx="32" cy="32" r="30" fill="#1e66f5" />
            <text
              x="32"
              y="44"
              textAnchor="middle"
              fill="white"
              fontSize="28"
              fontWeight="600"
              fontFamily="system-ui"
            >
              M
            </text>
          </svg>
        </div>
        <h3 className="settings-about-title">MDViewer</h3>
        <span className="settings-about-version">版本 0.1.0</span>
        <p className="settings-about-description">
          一款类 Typora 风格的 Markdown 编辑器，基于 Electron + React + Tiptap 构建。
          简洁优雅的写作体验，让 Markdown 编辑更加高效愉悦。
        </p>

        <div className="settings-about-links">
          <button className="settings-about-link">检查更新</button>
          <button className="settings-about-link">更新日志</button>
          <button className="settings-about-link">报告问题</button>
        </div>

        <div className="settings-about-system">
          <div className="settings-about-info">
            <span className="settings-about-info-label">Electron</span>
            <span className="settings-about-info-value">35.x</span>
          </div>
          <div className="settings-about-info">
            <span className="settings-about-info-label">Chrome</span>
            <span className="settings-about-info-value">132.x</span>
          </div>
          <div className="settings-about-info">
            <span className="settings-about-info-label">Node.js</span>
            <span className="settings-about-info-value">22.x</span>
          </div>
        </div>
      </div>
    </div>
  )

  const renderContent = () => {
    switch (activeCategory) {
      case 'general':
        return renderGeneralSettings()
      case 'appearance':
        return renderAppearanceSettings()
      case 'editor':
        return renderEditorSettings()
      case 'shortcuts':
        return renderShortcutsSettings()
      case 'about':
        return renderAboutSettings()
      default:
        return null
    }
  }

  const showSaveButton = activeCategory === 'general' || activeCategory === 'appearance' || activeCategory === 'editor'

  return (
    <div className="settings-panel">
      <div className="settings-sidebar">
        <div className="settings-sidebar-header">
          <button className="settings-back-btn" onClick={onClose}>
            {Icons.arrowLeft}
            <span>返回</span>
          </button>
        </div>
        <nav className="settings-nav">
          {categories.map((category) => (
            <button
              key={category.id}
              className={`settings-nav-item ${activeCategory === category.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(category.id)}
            >
              <span className="settings-nav-icon">{category.icon}</span>
              <span className="settings-nav-label">{category.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="settings-content">
        <div className="settings-content-header">
          <h1 className="settings-content-title">
            {categories.find((c) => c.id === activeCategory)?.label}
          </h1>
          <button className="settings-close-btn" onClick={onClose} title="关闭">
            {Icons.close}
          </button>
        </div>
        <div className="settings-content-body">
          {renderContent()}
        </div>
      </div>

      {showSaveButton && (
        <button className="settings-save-fab" onClick={handleSaveSettings} title="保存设置">
          {Icons.check}
        </button>
      )}
    </div>
  )
}
