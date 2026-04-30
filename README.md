# MDViewer

一款类 Typora 风格的 Markdown 编辑器，基于 Electron + React + Tiptap 构建。

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)
![Electron](https://img.shields.io/badge/electron-35.x-blue.svg)

## 功能特性

### 核心编辑功能
- 📝 **实时预览编辑** - 类似 Typora 的无缝编辑体验
- 🎨 **语法高亮** - 支持代码块语法高亮
- 📊 **表格支持** - 可调整大小的表格
- ✅ **任务列表** - 支持嵌套任务列表
- 📐 **文本对齐** - 左对齐、居中、右对齐
- 🖼️ **图片插入** - 支持本地和网络图片，支持粘贴/拖拽上传
- 🔗 **链接插入** - 支持超链接
- 📊 **Mermaid 图表** - 支持流程图、时序图等
- 📐 **数学公式** - 支持 LaTeX 数学公式（行内和块级）

### 多标签页
- 📑 **多标签页编辑** - 同时打开多个文件，自由切换
- 🔄 **标签复用** - 打开已有文件自动切换到对应标签
- ❌ **安全关闭** - 关闭未保存标签时弹出确认对话框

### 视图模式
- 🌙 **暗色/亮色主题** - 一键切换主题
- 🎯 **聚焦模式** - 隐藏侧边栏和标签页，专注写作
- ⌨️ **打字机模式** - 光标始终保持在屏幕中央
- 💻 **源码模式** - 查看和编辑原始 Markdown
- 📖 **分屏模式** - 左侧源码右侧预览

### 文件管理
- 📂 **打开文件** - 支持 .md, .markdown, .txt 文件
- 📁 **打开文件夹** - 侧边栏显示目录结构（支持搜索过滤）
- 💾 **保存/另存为** - 快捷键 Ctrl+S / Ctrl+Shift+S
- 🆕 **新建文件** - 快捷键 Ctrl+N
- 📤 **导出 PDF** - 导出当前文档为 PDF 格式
- 📄 **导出 HTML** - 导出为带样式的 HTML 文件

### 版本管理
- 📸 **版本快照** - 为当前文件创建历史版本快照
- 🕐 **历史记录** - 按时间倒序浏览所有版本
- ↩️ **一键恢复** - 随时恢复到任意历史版本
- 💬 **自定义标记** - 为每个快照添加描述标签

### 回收站
- 🗑️ **文件回收站** - 删除的文件可恢复
- 🔍 **搜索/排序** - 按时间或名称排序，支持搜索
- ♻️ **一键恢复** - 从回收站恢复文件到原路径
- 🧹 **清空回收站** - 永久删除所有已回收文件

### 搜索与替换
- 🔍 **全文搜索** - Ctrl+F 快速打开搜索面板
- 🔤 **正则表达式** - 支持正则搜索
- 📝 **大小写/全词匹配** - 精确控制搜索范围
- 🔄 **全部替换** - 批量替换匹配内容
- 📍 **点击跳转** - 搜索结果点击直接跳转到对应位置

### 设置面板
- ⚙️ **持久化设置** - 所有设置自动保存到本地
- 🔤 **字体配置** - 自定义编辑器字体、字号、行高
- 📏 **界面字号** - 独立调节 UI 和编辑器字号
- 🎨 **主题切换** - 在设置中切换暗色/亮色主题
- ⌨️ **快捷键查看** - 集成快捷键列表与搜索

### 界面特性
- 🎛️ **自定义标题栏** - 无边框窗口设计
- 📐 **可调整面板** - 侧边栏可拖拽调整宽度
- ⌨️ **快捷键支持** - 完整的快捷键体系
- 📱 **响应式布局** - 适配不同屏幕尺寸
- 🛡️ **未保存提醒** - 关闭窗口/切换文件前自动提示保存

## 快捷键

### 文件操作
| 快捷键 | 功能 |
|--------|------|
| Ctrl+N | 新建标签页 |
| Ctrl+O | 打开文件 |
| Ctrl+S | 保存文件 |
| Ctrl+Shift+S | 另存为 |

### 编辑操作
| 快捷键 | 功能 |
|--------|------|
| Ctrl+Z | 撤销 |
| Ctrl+Shift+Z | 重做 |
| Ctrl+X | 剪切 |
| Ctrl+C | 复制 |
| Ctrl+V | 粘贴 |
| Ctrl+A | 全选 |
| Ctrl+F | 查找 |

### 格式设置
| 快捷键 | 功能 |
|--------|------|
| Ctrl+B | 加粗 |
| Ctrl+I | 斜体 |
| Ctrl+U | 下划线 |
| Ctrl+Shift+D | 删除线 |
| Ctrl+` | 行内代码 |
| Ctrl+K | 插入链接 |
| Ctrl+M | 插入行内公式 |

### 段落样式
| 快捷键 | 功能 |
|--------|------|
| Ctrl+1~6 | 标题 1-6 |
| Ctrl+0 | 正文 |

### 视图切换
| 快捷键 | 功能 |
|--------|------|
| Ctrl+\ | 切换侧边栏 |
| Ctrl+/ | 切换源码模式 |
| F8 | 切换聚焦模式 |
| F9 | 切换打字机模式 |

## 安装说明

### 系统要求
- Windows 10/11 (64位)
- macOS 10.14+
- Linux (测试阶段)

### 安装方法

#### 方法1：下载安装包
1. 从 [Releases](https://github.com/LeeX852/MDViewer/releases) 页面下载最新版本
2. 运行 `MDViewer Setup 1.0.0.exe` 安装程序
3. 按提示完成安装

#### 方法2：运行免安装版
1. 下载 `win-unpacked` 文件夹
2. 直接运行 `MDViewer.exe`

#### 方法3：从源码构建

```bash
# 克隆仓库
git clone https://github.com/LeeX852/MDViewer.git
cd MDViewer

# 安装依赖
npm install

# 开发模式运行
npm run dev

# 构建生产版本
npm run build

# 打包可执行程序
npm run dist
```

## 项目结构

```
MDViewer/
├── src/
│   ├── main/                 # Electron 主进程
│   │   └── index.ts         # 主进程入口（IPC handlers）
│   ├── preload/             # 预加载脚本
│   │   ├── index.ts         # IPC 通信桥接
│   │   └── index.d.ts       # 类型定义
│   └── renderer/            # 渲染进程 (React)
│       ├── src/
│       │   ├── components/  # React 组件
│       │   │   ├── Editor.tsx        # Tiptap 编辑器
│       │   │   ├── MenuBar.tsx       # 菜单栏
│       │   │   ├── TabBar.tsx        # 多标签页
│       │   │   ├── Sidebar.tsx       # 文件侧边栏
│       │   │   ├── SearchPanel.tsx   # 搜索面板
│       │   │   ├── GitPanel.tsx      # 版本管理
│       │   │   ├── TrashPanel.tsx    # 回收站
│       │   │   ├── SettingsPanel.tsx # 设置面板
│       │   │   ├── IconRail.tsx      # 侧边图标栏
│       │   │   ├── StatusBar.tsx     # 状态栏
│       │   │   ├── SourceEditor.tsx  # 源码编辑器
│       │   │   └── ResizeHandle.tsx  # 拖拽调整器
│       │   ├── extensions/  # Tiptap 扩展
│       │   │   ├── MathBlock.tsx     # 块级数学公式
│       │   │   ├── MathInline.tsx    # 行内数学公式
│       │   │   └── MermaidBlock.tsx  # Mermaid 图表
│       │   ├── hooks/       # 自定义 Hooks
│       │   │   ├── useTabsState.ts   # 多标签页状态管理
│       │   │   ├── useEditorState.ts # 编辑器状态
│       │   │   └── useEditorContext.ts
│       │   ├── styles/      # CSS 样式
│       │   └── utils/       # 工具函数
│       └── index.html
├── out/                     # 构建输出目录
├── dist/                    # 打包输出目录
└── package.json
```

## 技术栈

- **Electron 35** - 跨平台桌面应用框架
- **React 19** - UI 组件库
- **Tiptap 2** - 富文本编辑器（ProseMirror）
- **TypeScript 5** - 类型安全
- **Vite 6** - 构建工具
- **KaTeX** - LaTeX 数学公式渲染
- **Mermaid** - 图表渲染
- **lowlight** - 代码语法高亮
- **electron-builder** - 应用打包

## 开发计划

- [x] 基础 Markdown 编辑
- [x] 实时预览
- [x] 暗色/亮色主题
- [x] 文件管理
- [x] 快捷键支持
- [x] 数学公式支持
- [x] Mermaid 图表
- [x] 版本管理（本地快照）
- [x] 图片粘贴上传
- [x] 多标签页支持
- [x] 导出 PDF/HTML
- [x] 搜索与替换
- [x] 回收站
- [x] 设置持久化
- [x] 未保存文件保护
- [ ] 插件系统
- [ ] 云同步
- [ ] 自定义主题

## 问题反馈

如果你在使用过程中遇到任何问题，欢迎提交 [Issue](https://github.com/LeeX852/MDViewer/issues)。

## 贡献指南

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的修改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开一个 Pull Request

## 许可证

本项目基于 [MIT](LICENSE) 许可证开源。

## 致谢

- [Electron](https://www.electronjs.org/)
- [React](https://reactjs.org/)
- [Tiptap](https://tiptap.dev/)
- [KaTeX](https://katex.org/)
- [Mermaid](https://mermaid.js.org/)
- [Typora](https://typora.io/) - 灵感来源

---

**作者**: LeeX  
**版权**: © 2026 LeeX. All rights reserved.
