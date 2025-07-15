# EchoSoul

**"每天了解真实的自己"**

EchoSoul 是一款基于聊天记录的个人行为分析工具，通过 AI 分析用户的日常聊天记录，生成深度的个人洞察报告，帮助用户更好地了解自己的沟通模式、情绪状态和社交行为。

## ✨ 核心功能

- 🤖 **智能分析**：基于 LangChain.js 的多 LLM 支持（OpenAI、Claude、Gemini、DeepSeek）
- 📊 **每日报告**：自动生成每日聊天行为分析报告
- 🎯 **自定义分析**：支持指定时间范围和分析对象的个性化报告
- 🔒 **隐私优先**：本地数据处理，保护用户隐私
- 💻 **跨平台**：支持 macOS、Windows、Linux

## 🛠️ 技术栈

- **桌面框架**：Electron 35+ with electron-vite
- **前端框架**：Vue 3 + TypeScript + Vite 6
- **UI 组件**：shadcn/vue + Tailwind CSS
- **AI 集成**：LangChain.js 0.3.x
- **数据存储**：SQLite + Markdown
- **任务调度**：node-cron

## 🚀 快速开始

### 环境要求

- Node.js 18+
- pnpm 8+

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
pnpm dev
```

### 构建应用

```bash
# Windows
pnpm build:win

# macOS
pnpm build:mac

# Linux
pnpm build:linux
```

## 📖 开发指南

### 推荐 IDE 配置

- [VSCode](https://code.visualstudio.com/)
- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
- [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar)

### 项目结构

```
src/
├── main/                    # Electron 主进程
│   ├── services/           # 核心业务服务
│   ├── ipc/               # IPC 通信处理
│   └── utils/             # 工具函数
├── renderer/              # Vue 渲染进程
│   ├── src/
│   │   ├── views/         # 页面组件
│   │   ├── components/    # 通用组件
│   │   └── router/        # 路由配置
└── preload/               # 预加载脚本
```

### 可用脚本

```bash
pnpm dev          # 开发模式
pnpm build        # 构建应用
pnpm test         # 运行测试
pnpm lint         # 代码检查
pnpm format       # 代码格式化
pnpm typecheck    # 类型检查
```

## 📚 文档

- [产品规格文档](./docs/product.md)
- [开发文档](./docs/development.md)
- [设计系统](./docs/design-system.md)
- [交互设计](./docs/interaction-design.md)
- [页面架构](./docs/page-architecture.md)

## 🤝 贡献指南

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [electron-vite](https://electron-vite.org/) - 优秀的 Electron 开发工具
- [shadcn/ui](https://ui.shadcn.com/) - 现代化的 UI 组件库
- [LangChain.js](https://js.langchain.com/) - 强大的 AI 应用开发框架
