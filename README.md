# MDViewer

一款类 Typora 风格的 Markdown 编辑器，基于 Electron + React + Tiptap 构建。

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-0.1.0-green.svg)
![Electron](https://img.shields.io/badge/electron-35.x-blue.svg)

## 功能特性

### 核心编辑功能
- 📝 **实时预览编辑** - 类似 Typora 的无缝编辑体验
- 🎨 **语法高亮** - 支持代码块语法高亮
- 📊 **表格支持** - 可调整大小的表格
- ✅ **任务列表** - 支持嵌套任务列表
- 📐 **文本对齐** - 左对齐、居中、右对齐
- 🖼️ **图片插入** - 支持本地和网络图片
- 🔗 **链接插入** - 支持超链接
- 📊 **Mermaid 图表** - 支持流程图、时序图等
- 📐 **数学公式** - 支持 LaTeX 数学公式（行内和块级）

### 视图模式
- 🌙 **暗色/亮色主题** - 一键切换主题
- 🎯 **聚焦模式** - 隐藏侧边栏，专注写作
- ⌨️ **打字机模式** - 光标始终保持在屏幕中央
- 💻 **源码模式** - 查看和编辑原始 Markdown

### 文件管理
- 📂 **打开文件** - 支持 .md, .markdown, .txt 文件
- 📁 **打开文件夹** - 侧边栏显示目录结构
- 💾 **保存/另存为** - 快捷键 Ctrl+S / Ctrl+Shift+S
- 🆕 **新建文件** - 快捷键 Ctrl+N

### 界面特性
- 🎛️ **自定义标题栏** - 无边框窗口设计
- 📐 **可调整面板** - 侧边栏和大纲面板可拖拽调整宽度
- ⌨️ **快捷键支持** - 完整的快捷键体系
- 📱 **响应式布局** - 适配不同屏幕尺寸

## 快捷键

### 文件操作
| 快捷键 | 功能 |
|--------|------|
| Ctrl+N | 新建文件 |
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
2. 运行 `MDViewer Setup 0.1.0.exe` 安装程序
3. 按提示完成安装

#### 方法2：运行免安装版
1. 下载 `win-unpacked` 文件夹
2. 直接运行 `MDViewer.exe`

#### 方法3：从源码构建

```bash
# 克隆仓库
git clone https://github.com/LeeX/mdviewer.git
cd mdviewer

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
mdviewer/
├── src/
│   ├── main/                 # Electron 主进程
│   │   └── index.ts         # 主进程入口
│   ├── preload/             # 预加载脚本
│   │   └── index.ts         # IPC 通信定义
│   └── renderer/            # 渲染进程 (React)
│       ├── src/
│       │   ├── components/  # React 组件
│       │   ├── extensions/  # Tiptap 扩展
│       │   ├── hooks/       # 自定义 Hooks
│       │   ├── styles/      # CSS 样式
│       │   └── utils/       # 工具函数
│       └── index.html
├── dist/                    # 打包输出目录
├── out/                     # 构建输出目录
└── package.json
```

## 技术栈

- **Electron** - 跨平台桌面应用框架
- **React** - UI 组件库
- **Tiptap** - 富文本编辑器
- **TypeScript** - 类型安全
- **Vite** - 构建工具
- **electron-builder** - 应用打包

## 开发计划

- [x] 础 Markdown 编辑
- [x] 实时预览
- [x] 暗色/亮色主题
- [x] 文件管理
- [x] 快捷键支持
- [x] 数学公式支持
- [x] Mermaid 图图
- [ ] 图片粘贴上传
- [ ] 多标签页支持
- [ ] 导出 PDF/HTML
- [ ] 插件系统
- [ ] 云同步

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
- [Typora](https://typora.io/) - 灵感来源

---

**作者**: LeeX  
**版权**: © 2026 LeeX. All rights reserved.