import { useState, useRef, useEffect, useCallback } from 'react'
import type { Editor } from '@tiptap/react'

type ThemeMode = 'dark' | 'light'

interface MenuItemDef {
  label: string
  shortcut?: string
  action?: () => void
  separator?: boolean
  disabled?: boolean
  checked?: boolean
}

interface MenuDef {
  label: string
  items: MenuItemDef[]
}

interface MenuBarProps {
  title: string
  editor: Editor | null
  theme: ThemeMode
  focusMode: boolean
  typewriterMode: boolean
  sourceMode: boolean
  sidebarVisible: boolean
  outlineVisible: boolean
  onOpenFile: () => void
  onNewFile: () => void
  onOpenFolder: () => void
  onSave: () => void
  onSaveAs: () => void
  onToggleSidebar: () => void
  onToggleOutline: () => void
  onToggleTheme: () => void
  onToggleFocusMode: () => void
  onToggleTypewriterMode: () => void
  onToggleSourceMode: () => void
}

export default function MenuBar({
  title,
  editor,
  theme,
  focusMode,
  typewriterMode,
  sourceMode,
  sidebarVisible,
  outlineVisible,
  onOpenFile,
  onNewFile,
  onOpenFolder,
  onSave,
  onSaveAs,
  onToggleSidebar,
  onToggleOutline,
  onToggleTheme,
  onToggleFocusMode,
  onToggleTypewriterMode,
  onToggleSourceMode
}: MenuBarProps) {
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const menuBarRef = useRef<HTMLDivElement>(null)

  const closeMenu = useCallback(() => setOpenMenu(null), [])

  useEffect(() => {
    if (!openMenu) return
    const handleClickOutside = (e: MouseEvent) => {
      if (menuBarRef.current && !menuBarRef.current.contains(e.target as Node)) {
        closeMenu()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [openMenu, closeMenu])

  const toggleMenu = (menuLabel: string) => {
    setOpenMenu(prev => prev === menuLabel ? null : menuLabel)
  }

  const handleItemAction = (action?: () => void) => {
    closeMenu()
    action?.()
  }

  const insertHeading = (level: number) => {
    editor?.chain().focus().toggleHeading({ level: level as 1|2|3|4|5|6 }).run()
  }

  const menus: MenuDef[] = [
    {
      label: '文件',
      items: [
        { label: '新建', shortcut: 'Ctrl+N', action: onNewFile },
        { label: '打开...', shortcut: 'Ctrl+O', action: onOpenFile },
        { label: '打开文件夹...', action: onOpenFolder },
        { label: '', separator: true },
        { label: '保存', shortcut: 'Ctrl+S', action: onSave },
        { label: '另存为...', shortcut: 'Ctrl+Shift+S', action: onSaveAs },
      ]
    },
    {
      label: '编辑',
      items: [
        { label: '撤销', shortcut: 'Ctrl+Z', action: () => editor?.chain().focus().undo().run(), disabled: !editor?.can().undo() },
        { label: '重做', shortcut: 'Ctrl+Shift+Z', action: () => editor?.chain().focus().redo().run(), disabled: !editor?.can().redo() },
        { label: '', separator: true },
        { label: '剪切', shortcut: 'Ctrl+X', action: () => { document.execCommand('cut') } },
        { label: '复制', shortcut: 'Ctrl+C', action: () => { document.execCommand('copy') } },
        { label: '粘贴', shortcut: 'Ctrl+V', action: () => { editor?.chain().focus().run() } },
        { label: '', separator: true },
        { label: '全选', shortcut: 'Ctrl+A', action: () => editor?.chain().focus().selectAll().run() },
        { label: '', separator: true },
        { label: '查找', shortcut: 'Ctrl+F', disabled: true },
      ]
    },
    {
      label: '段落',
      items: [
        { label: '标题 1', shortcut: 'Ctrl+1', action: () => insertHeading(1), checked: editor?.isActive('heading', { level: 1 }) },
        { label: '标题 2', shortcut: 'Ctrl+2', action: () => insertHeading(2), checked: editor?.isActive('heading', { level: 2 }) },
        { label: '标题 3', shortcut: 'Ctrl+3', action: () => insertHeading(3), checked: editor?.isActive('heading', { level: 3 }) },
        { label: '标题 4', shortcut: 'Ctrl+4', action: () => insertHeading(4), checked: editor?.isActive('heading', { level: 4 }) },
        { label: '标题 5', shortcut: 'Ctrl+5', action: () => insertHeading(5), checked: editor?.isActive('heading', { level: 5 }) },
        { label: '标题 6', shortcut: 'Ctrl+6', action: () => insertHeading(6), checked: editor?.isActive('heading', { level: 6 }) },
        { label: '', separator: true },
        { label: '正文', shortcut: 'Ctrl+0', action: () => editor?.chain().focus().setParagraph().run(), checked: editor?.isActive('paragraph') && !editor?.isActive('heading') },
        { label: '', separator: true },
        { label: '引用', action: () => editor?.chain().focus().toggleBlockquote().run(), checked: editor?.isActive('blockquote') },
        { label: '有序列表', action: () => editor?.chain().focus().toggleOrderedList().run(), checked: editor?.isActive('orderedList') },
        { label: '无序列表', action: () => editor?.chain().focus().toggleBulletList().run(), checked: editor?.isActive('bulletList') },
        { label: '任务列表', action: () => editor?.chain().focus().toggleTaskList().run(), checked: editor?.isActive('taskList') },
        { label: '', separator: true },
        { label: '代码块', action: () => editor?.chain().focus().toggleCodeBlock().run(), checked: editor?.isActive('codeBlock') },
        { label: '表格', action: () => editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run() },
        { label: '分隔线', action: () => editor?.chain().focus().setHorizontalRule().run() },
        { label: '数学公式块', action: () => editor?.chain().focus().insertContent({ type: 'mathBlock', attrs: { latex: 'E = mc^2' } }).run() },
        { label: 'Mermaid 图表', action: () => editor?.chain().focus().insertContent({ type: 'mermaidBlock', attrs: { code: 'graph TD\n  A --> B' } }).run() },
      ]
    },
    {
      label: '格式',
      items: [
        { label: '加粗', shortcut: 'Ctrl+B', action: () => editor?.chain().focus().toggleBold().run(), checked: editor?.isActive('bold') },
        { label: '斜体', shortcut: 'Ctrl+I', action: () => editor?.chain().focus().toggleItalic().run(), checked: editor?.isActive('italic') },
        { label: '下划线', shortcut: 'Ctrl+U', action: () => editor?.chain().focus().toggleUnderline().run(), checked: editor?.isActive('underline') },
        { label: '删除线', shortcut: 'Ctrl+Shift+D', action: () => editor?.chain().focus().toggleStrike().run(), checked: editor?.isActive('strike') },
        { label: '行内代码', shortcut: 'Ctrl+`', action: () => editor?.chain().focus().toggleCode().run(), checked: editor?.isActive('code') },
        { label: '', separator: true },
        { label: '高亮', action: () => editor?.chain().focus().toggleHighlight().run(), checked: editor?.isActive('highlight') },
        { label: '', separator: true },
        { label: '行内公式', shortcut: 'Ctrl+M', action: () => editor?.chain().focus().insertContent({ type: 'mathInline', attrs: { latex: 'x^2' } }).run() },
        { label: '', separator: true },
        { label: '左对齐', action: () => editor?.chain().focus().setTextAlign('left').run() },
        { label: '居中', action: () => editor?.chain().focus().setTextAlign('center').run() },
        { label: '右对齐', action: () => editor?.chain().focus().setTextAlign('right').run() },
        { label: '', separator: true },
        { label: '插入图片', action: () => {
          const url = prompt('图片 URL:')
          if (url) editor?.chain().focus().setImage({ src: url }).run()
        }},
        { label: '插入链接', shortcut: 'Ctrl+K', action: () => {
          const url = prompt('链接 URL:')
          if (url) editor?.chain().focus().setLink({ href: url }).run()
        }},
        { label: '取消链接', action: () => editor?.chain().focus().unsetLink().run(), disabled: !editor?.isActive('link') },
      ]
    },
    {
      label: '视图',
      items: [
        { label: '侧边栏', shortcut: 'Ctrl+\\', action: onToggleSidebar, checked: sidebarVisible },
        { label: '大纲', action: onToggleOutline, checked: outlineVisible },
        { label: '', separator: true },
        { label: '聚焦模式', shortcut: 'F8', action: onToggleFocusMode, checked: focusMode },
        { label: '打字机模式', shortcut: 'F9', action: onToggleTypewriterMode, checked: typewriterMode },
        { label: '', separator: true },
        { label: '源码模式', shortcut: 'Ctrl+/', action: onToggleSourceMode, checked: sourceMode },
      ]
    },
    {
      label: '主题',
      items: [
        { label: '暗色主题', action: () => { if (theme !== 'dark') onToggleTheme() }, checked: theme === 'dark' },
        { label: '亮色主题', action: () => { if (theme !== 'light') onToggleTheme() }, checked: theme === 'light' },
      ]
    },
    {
      label: '帮助',
      items: [
        { label: '快捷键', action: () => window.open('https://github.com/mdviewer/app#shortcuts', '_blank') },
        { label: '关于 MDViewer', action: () => window.api.showAbout() },
      ]
    }
  ]

  return (
    <div className="menubar" ref={menuBarRef}>
      <div className="menubar-left">
        {menus.map(menu => (
          <div key={menu.label} className="menu-item-container">
            <button
              className={`menu-trigger ${openMenu === menu.label ? 'active' : ''}`}
              onClick={() => toggleMenu(menu.label)}
              onMouseEnter={() => openMenu && setOpenMenu(menu.label)}
            >
              {menu.label}
            </button>
            {openMenu === menu.label && (
              <div className="menu-dropdown">
                {menu.items.map((item, i) =>
                  item.separator ? (
                    <div key={i} className="menu-separator" />
                  ) : (
                    <button
                      key={i}
                      className={`menu-dropdown-item ${item.disabled ? 'disabled' : ''}`}
                      onClick={() => !item.disabled && handleItemAction(item.action)}
                    >
                      <span className="menu-item-label">
                        <span className="menu-check">{item.checked ? '✓' : item.checked === false ? '' : ''}</span>
                        {item.label}
                      </span>
                      {item.shortcut && <span className="menu-shortcut">{item.shortcut}</span>}
                    </button>
                  )
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="menubar-center">{title}</div>
      <div className="menubar-right">
        <button className="window-btn minimize" onClick={() => window.api.minimizeWindow()}>
          ─
        </button>
        <button className="window-btn maximize" onClick={() => window.api.maximizeWindow()}>
          □
        </button>
        <button className="window-btn close" onClick={() => window.api.closeWindow()}>
          ✕
        </button>
      </div>
    </div>
  )
}
