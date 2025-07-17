# EchoSoul MVP 开发文档

版本：v1.0
最后更新：2025-07-02

---

## 1. 项目总览

EchoSoul 是一款跨平台桌面应用（macOS / Windows / Linux），通过分析用户聊天记录，生成每日或自定义的个人行为洞察报告。所有数据与推理默认在本地完成，仅在需要时调用云端 LLM。

## 2. 架构设计原则

### 核心原则

- **简单优先**：移除过度抽象，专注核心功能实现
- **MVP 导向**：避免过度工程化，快速验证产品价值
- **本地优先**：95%功能本地处理，保护用户隐私
- **可扩展性**：为后续功能扩展留下清晰的架构基础

### 架构简化策略

```yaml
✅ Electron + Vue + Vite架构(基于 electron-vite https://electron-vite.org/)
✅ TypeScript类型安全
✅ LangChain.js AI集成
✅ SQLite + Markdown混合存储
```

## 3. 技术栈

| 层级     | 主要技术                                                        |
| -------- | --------------------------------------------------------------- |
| 桌面壳   | Electron 35+                                                    |
| 渲染进程 | Vue3 + Vite6 + TypeScript                                       |
| 主进程   | 轻量 Service 层 + TypeScript                                    |
| AI / NLP | LangChain.js 0.3.x，支持 OpenAI / Claude / Gemini / DeepSeek 等 |
| 存储     | SQLite（元数据）+ Markdown（报告内容）                          |
| 样式     | Tailwind CSS + shadcn/ui                                        |
| 任务调度 | node-cron + 简单内存队列                                        |
| 打包     | electron-builder                                                |
| 测试     | vitest • @testing-library/vue • Playwright                      |

## 4. 数据持久化方案

### 混合存储策略

```
~/EchoSoul/
 ├─ database.sqlite         # 元数据存储
 ├─ reports/               # Markdown 报告文件
 │   ├─ 2025-07-02-auto.md
 │   └─ 2025-07-02-custom-张三.md
 └─ cache/                 # 运行时临时文件，可清理
```

### 数据库设计

```sql
-- 报告元数据表
CREATE TABLE reports (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL, -- 'auto' | 'custom'
  date TEXT NOT NULL,
  title TEXT NOT NULL,
  file_path TEXT NOT NULL, -- 指向Markdown文件
  metadata TEXT, -- JSON格式的额外信息
  created_at TEXT NOT NULL
);

-- 配置表
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL -- 敏感信息加密存储
);

-- 任务状态表
CREATE TABLE task_status (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  status TEXT NOT NULL, -- 'pending' | 'running' | 'completed' | 'failed'
  progress INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

### 存储特点

- **SQLite**：存储结构化元数据，支持复杂查询和索引
- **Markdown**：存储报告内容，便于阅读和版本控制
- **加密存储**：API Key 使用 electron-store + 系统 keychain 双重保护
- **原子操作**：写入前使用临时文件，确保数据完整性

## 5. 系统架构

### 简化架构设计

```
┌─────────────────────┐
│   Vue Frontend    │ ← Tailwind + shadcn/ui + lucide-vue-next
└─────────────────────┘
          │ IPC
┌─────────────────────┐
│  Electron Main      │
│ ┌─────────────────┐ │
│ │ ConfigService   │ │ ← API Key安全存储
│ │ ChatlogService  │ │ ← chatlog API集成
│ │ AnalysisService │ │ ← 简化AI分析
│ │ ReportService   │ │ ← 报告生成存储
│ │ SchedulerService│ │ ← 定时任务
│ └─────────────────┘ │
└─────────────────────┘
          │
┌─────────────────────┐
│ SQLite + Markdown   │ ← 混合存储方案
└─────────────────────┘
```

### 架构特点

- **直接通信**：渲染进程通过 IPC 直接调用主进程服务
- **模块化**：每个 Service 职责单一，便于测试和维护
- **数据分离**：元数据用 SQLite，内容用 Markdown 文件

## 6. 服务层设计

### 核心服务类

```typescript
// 轻量级服务架构
export class AppServices {
  constructor(
    private config: ConfigService,
    private chatlog: ChatlogService,
    private analysis: AnalysisService,
    private report: ReportService,
    private scheduler: SchedulerService
  ) {}

  async initialize() {
    await this.config.load()
    await this.chatlog.checkConnection()
    await this.scheduler.start()
  }
}
```

### 服务职责分工

| 服务               | 职责                                     | 关键方法                                |
| ------------------ | ---------------------------------------- | --------------------------------------- |
| `ConfigService`    | 配置管理、API Key 安全存储、用户偏好设置 | `load()`, `save()`, `encrypt()`         |
| `ChatlogService`   | chatlog API 集成、连接检测、数据获取     | `checkStatus()`, `getMessages()`        |
| `AnalysisService`  | 简化 AI 分析、LangChain 调用、结构化输出 | `generateReport()`, `analyzeMessages()` |
| `ReportService`    | 报告生成、Markdown 渲染、文件存储        | `create()`, `save()`, `list()`          |
| `SchedulerService` | 定时任务、任务队列、进度跟踪             | `start()`, `scheduleDaily()`            |

## 7. 数据模型

### TypeScript 接口定义

```typescript
// 用户配置
interface UserSettings {
  llmProvider: 'openai' | 'anthropic' | 'gemini' | 'openrouter' | 'deepseek'
  apiKeyEncrypted: string
  cronTime: string // "02:00"
  reportPrefs: {
    autoGenerate: boolean
    includeEmotions: boolean
    includeTopics: boolean
    includeSocial: boolean
  }
}

// 聊天消息
interface ChatMessage {
  id: string
  sender: string
  recipient: string
  timestamp: string // ISO
  content: string
  type: 'text' | 'image' | 'voice' | 'video' | 'file'
  isGroupChat: boolean
  groupName?: string
}

// 报告元数据
interface ReportMeta {
  id: string
  type: 'auto' | 'custom'
  date: string
  title: string
  filePath: string
  metadata: {
    messageCount: number
    timeRange: { start: string; end: string }
    participants: string[]
    analysisConfig: AnalysisConfig
  }
  createdAt: string
}

// 分析配置
interface AnalysisConfig {
  timeRange: { start: string; end: string }
  participants?: string[]
  dimensions: ('emotion' | 'topic' | 'social' | 'personality')[]
  customPrompt?: string
}

// 任务状态
interface TaskStatus {
  id: string
  type: 'daily-report' | 'custom-report'
  status: 'pending' | 'running' | 'completed' | 'failed'
  progress: number // 0-100
  errorMessage?: string
  result?: {
    reportId: string
    filePath: string
  }
}
```

## 8. 核心流程

### 8.1 每日自动报告流程

```typescript
// 简化的调度器
class SchedulerService {
  private jobs = new Map<string, cron.ScheduledTask>()

  start() {
    // 每日报告任务
    const dailyTask = cron.schedule(
      '0 2 * * *',
      async () => {
        await this.generateDailyReport()
      },
      { scheduled: false }
    )

    this.jobs.set('daily-report', dailyTask)
    dailyTask.start()
  }

  private async generateDailyReport() {
    try {
      const yesterday = this.getYesterday()
      const messages = await this.chatlog.getMessages({
        startDate: yesterday,
        endDate: yesterday
      })

      const report = await this.analysis.generateReport(messages, {
        type: 'daily'
      })

      await this.report.save(report)

      // 发送系统通知
      this.sendNotification('每日报告已生成')
    } catch (error) {
      console.error('Daily report generation failed:', error)
    }
  }
}
```

### 8.2 自定义报告流程

```typescript
// 自定义报告生成
class ReportService {
  async generateCustomReport(config: AnalysisConfig): Promise<string> {
    // 1. 创建任务记录
    const taskId = this.createTask('custom-report')

    try {
      // 2. 获取聊天数据
      this.updateTaskProgress(taskId, 20, '获取聊天记录...')
      const messages = await this.chatlog.getMessages({
        startDate: config.timeRange.start,
        endDate: config.timeRange.end,
        participants: config.participants
      })

      // 3. AI分析
      this.updateTaskProgress(taskId, 60, '分析聊天内容...')
      const analysis = await this.analysis.analyzeMessages(messages, config)

      // 4. 生成报告
      this.updateTaskProgress(taskId, 80, '生成报告...')
      const report = await this.renderReport(analysis, config)

      // 5. 保存文件
      this.updateTaskProgress(taskId, 100, '保存完成')
      const filePath = await this.saveReport(report)

      return filePath
    } catch (error) {
      this.updateTaskProgress(taskId, -1, `生成失败: ${error.message}`)
      throw error
    }
  }
}
```

## 9. AI 分析 Pipeline

### 9.1 简化的分析流程

```typescript
// 简化的分析服务
class AnalysisService {
  async generateReport(messages: ChatMessage[], config: AnalysisConfig) {
    // 1. 基础统计
    const stats = this.calculateBasicStats(messages)

    // 2. 直接LLM分析（无需向量化）
    const analysis = await this.llmAnalyze(messages, stats)

    // 3. 结构化输出
    return this.formatReport(analysis, stats)
  }

  private async llmAnalyze(messages: ChatMessage[], stats: BasicStats) {
    const prompt = this.buildAnalysisPrompt(messages, stats)

    // 直接调用LangChain，无需复杂Pipeline
    const result = await this.llmChain.invoke({
      messages: this.sampleMessages(messages), // 智能采样
      context: stats
    })

    return this.validateOutput(result) // Zod校验
  }
}
```

### 9.2 LangChain 集成

```typescript
// 多Provider支持
class LLMService {
  private chains = new Map<string, any>()

  async initializeChain(provider: string, apiKey: string) {
    let llm

    switch (provider) {
      case 'openai':
        llm = new ChatOpenAI({
          openAIApiKey: apiKey,
          modelName: 'gpt-3.5-turbo',
          temperature: 0.3
        })
        break
      case 'anthropic':
        llm = new ChatAnthropic({
          anthropicApiKey: apiKey,
          modelName: 'claude-3-haiku-20240307',
          temperature: 0.3
        })
        break
      // ... 其他Provider
    }

    const chain = new LLMChain({
      llm,
      prompt: PromptTemplate.fromTemplate('{prompt}'),
      outputParser: new JsonOutputParser()
    })

    this.chains.set(provider, chain)
  }
}
```

## 10. IPC 接口设计

### 10.1 主要通信接口

```typescript
// IPC接口定义
interface IPCHandlers {
  // 配置管理
  'config:get': () => Promise<UserSettings>
  'config:set': (settings: Partial<UserSettings>) => Promise<void>
  'config:test-api': (provider: string, apiKey: string) => Promise<boolean>

  // chatlog服务
  'chatlog:status': () => Promise<'running' | 'not-running' | 'error'>
  'chatlog:start': () => Promise<boolean>
  'chatlog:get-contacts': () => Promise<Contact[]>

  // 报告管理
  'report:list': () => Promise<ReportMeta[]>
  'report:get': (id: string) => Promise<string> // Markdown内容
  'report:generate-custom': (config: AnalysisConfig) => Promise<string> // taskId

  // 任务状态
  'task:status': (taskId: string) => Promise<TaskStatus>
  'task:cancel': (taskId: string) => Promise<void>
}

// 事件推送（Main → Renderer）
interface IPCEvents {
  'task:progress': (taskId: string, progress: number, message: string) => void
  'report:generated': (reportId: string) => void
  notification: (title: string, message: string) => void
}
```

### 10.2 IPC 实现示例

```typescript
// 主进程IPC处理器
export function setupIpcHandlers(services: AppServices) {
  ipcMain.handle('config:get', async () => {
    return await services.config.get()
  })

  ipcMain.handle('report:generate-custom', async (_, config: AnalysisConfig) => {
    const taskId = generateId()

    // 异步执行，通过事件推送进度
    services.report
      .generateCustomReport(config, taskId)
      .then((reportId) => {
        mainWindow.webContents.send('report:generated', reportId)
      })
      .catch((error) => {
        mainWindow.webContents.send('task:progress', taskId, -1, error.message)
      })

    return taskId
  })
}

// 渲染进程API封装
export class ElectronAPI {
  async getReports(): Promise<ReportMeta[]> {
    return await window.electronAPI.invoke('report:list')
  }

  async generateCustomReport(config: AnalysisConfig): Promise<string> {
    return await window.electronAPI.invoke('report:generate-custom', config)
  }

  onTaskProgress(callback: (taskId: string, progress: number, message: string) => void) {
    window.electronAPI.on('task:progress', callback)
  }
}
```

## 10. 目录结构

```
EchoSoul/
 ├─ apps/
 │   ├─ electron/           # main.ts, preload.ts, nest bootstrap
 │   └─ renderer/           # React + Vite 源码
 ├─ packages/
 │   └─ common/             # DTO、LangChain util、类型共享
 ├─ docs/
 │   └─ development.md      # ← 当前文件
 ├─ scripts/
 │   └─ build.ts            # 一键打包脚本
 └─ pnpm-workspace.yaml
```

## 11. 构建 & 运行

```bash
# 安装依赖
pnpm i

# 开发模式（热重载）
pnpm dev      # 同时启动 Electron + Vite

# 生产打包
pnpm run make # electron-builder 生成 dmg / exe / AppImage
```

## 12. 测试策略

| 层级 | 工具                 | 覆盖                           |
| ---- | -------------------- | ------------------------------ |
| 单元 | vitest               | LangChain util、文件读写       |
| 组件 | @testing-library/vue | UI 组件交互                    |
| 集成 | Supertest            | IPC 控制器逻辑                 |
| E2E  | Playwright           | 启动打包后应用，走完整报告流程 |

目标覆盖率 ≥ 80%，LangChain 输出采用快照测试（允许 3% 漂移）。

## 13. 关键优化决策

- **TypeScript 严格模式**：确保类型安全
- **统一错误处理**：使用 Result 模式处理错误
- **清晰的日志策略**：使用 winston 进行结构化日志
- **代码规范**：使用 ESLint + Prettier 统一代码风格

## 14. 风险与缓解

| 风险                  | 影响程度 | 缓解措施                                       |
| --------------------- | -------- | ---------------------------------------------- |
| chatlog API 格式变动  | 中       | 设计 Adapter 层，接口变更仅改 Adapter          |
| LLM 费用或速率限制    | 高       | 智能缓存、用户限额设置、本地模型备选           |
| macOS 权限（SIP）问题 | 高       | 提供详细引导文档、视频教程、自动检测和修复建议 |
| 文件损坏/误删         | 中       | 原子写入、自动备份、用户数据恢复机制           |
| 开发进度延期          | 中       | 功能优先级明确、每日进度跟踪、及时调整范围     |
