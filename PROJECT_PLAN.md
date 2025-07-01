# EchoSoul – 方案文档

最后更新：2025-07-01

---

“Let your conversations reflect your inner self.”

含义：  
• Echo——每天的聊天记录像回声一样被 AI 折射回来  
• Soul——专注自我洞察与反思

## 目录

1. 背景与目标
2. 技术栈与依赖
3. 顶层架构图
4. 目录结构（Monorepo）
5. 核心模块设计
6. 微信数据服务（chatlog）集成
7. 多 LLM Provider 与 API-Key 管理
8. LangChain Pipeline 设计
9. 开发与构建脚本
10. 安全与合规
11. 后续可扩展方向

---

## 1. 背景与目标

借助 `chatlog` 提供的微信数据库解析能力，结合多家大型语言模型（OpenAI、Claude、Gemini、DeepSeek、OpenRouter），为个人用户生成每日/每周微信聊天摘要和报告。目标：

- 一键运行的跨平台桌面应用（Electron）
- 用户自带 API-Key，无后端依赖
- 全程本地解析聊天数据，隐私友好
- 插件化模型路由，低成本快速换模型

---

## 2. 技术栈与依赖

| 领域        | 选型                                                                     |
| ----------- | ------------------------------------------------------------------------ |
| Shell       | Electron 28 (Chromium 126)                                               |
| 构建工具    | Vite 5 + esbuild                                                         |
| 语言        | TypeScript 5.x                                                           |
| UI 框架     | React 19 + TailwindCSS（或 Ant-Design）                                  |
| AI SDK      | langchain.js 0.2.x                                                       |
| LLM Drivers | @langchain/\* (openai, anthropic, google-vertexai, deepseek, openrouter) |
| 数据库      | SQLite (better-sqlite3) + Drizzle ORM                                    |
| 微信数据    | chatlog ⭢ HTTP API                                                       |
| IPC         | Electron contextBridge (+ tRPC 可选)                                     |
| 状态管理    | Zustand / Jotai                                                          |
| 密钥存储    | keytar（系统加密凭据）                                                   |
| 日志        | Pino（main）+ Sentry（renderer）                                         |
| 打包        | electron-builder                                                         |

---

## 3. 顶层架构图

```
┌─────────────┐           LLM Providers
│  Electron   │           (HTTPS)
│ (Main Proc) │───────────────▲
│             │               │
│ ┌─────────┐ │  IPC   HTTP   │
│ │SQLite DB│◄───────────────┘
│ └─────────┘ │
└──────┬──────┘
       ▼
┌───────────────────────────────┐
│ React + Vite (Renderer)       │
│                               │
│  UI ↔ Zustand ↔ Services ↔ LangChain│
└───────────────────────────────┘
```

---

## 4. 目录结构（Monorepo）

```
ai-actual/
├─ apps/
│  ├─ main/               # Electron 主进程
│  └─ renderer/           # React 前端
├─ packages/
│  ├─ wx-parser/          # chatlog 辅助工具（可选）
│  └─ ai-summarizer/      # LangChain pipelines & ProviderFactory
├─ resources/             # chatlog 二进制按平台放置
├─ electron-builder.yml
├─ drizzle.config.ts
├─ pnpm-workspace.yaml
└─ .nvmrc
```

---

## 5. 核心模块设计

### 5.1 微信解析 Service

- **chatlog** 二进制 → `chatlog server --port <p>`
- Electron 主进程 `ChatlogService` 负责：
  1. 首次运行 `chatlog key` / `chatlog decrypt`
  2. 启动 `chatlog server`
  3. 退出时优雅 `SIGTERM`
- 渲染层通过 IPC 调用统一 API 获取聊天记录。

### 5.2 ChatLog Service (renderer)

```ts
const chats = await window.wx.getChats('2025-07-01');
const summary = await window.wx.summarize('2025-07-01');
```

### 5.3 数据层 (Drizzle ORM)

```ts
chats(id, sender, ts, text, dayKey);
reports(dayKey, summary, createdAt, model, tokens);
```

---

## 6. 微信数据服务（chatlog）集成

1. **资源放置** `resources/<platform>/chatlog[.exe]`
2. **electron-builder.yml**

```yml
extraResources:
  - from: resources
    to: resources
```

3. **主进程管理代码摘要**

```ts
import { spawn, spawnSync } from 'node:child_process';
class ChatlogService {
  async start() {
    // 1) chatlog key  2) chatlog decrypt  3) chatlog server
  }
  async stop() {
    /* kill child */
  }
}
```

4. 动态端口 + 健康检查 (`waitForHttp`)

---

## 7. 多 LLM Provider 与 API-Key 管理

### 7.1 ProviderFactory

```ts
export type Provider =
  | 'openai'
  | 'anthropic'
  | 'gemini'
  | 'deepseek'
  | 'openrouter';
export async function getChatModel(p: Provider, key: string) {
  switch (p) {
    case 'openai':
      return new ChatOpenAI({ apiKey: key, modelName: 'gpt-4o-mini' });
    case 'anthropic':
      return new ChatAnthropic({
        apiKey: key,
        modelName: 'claude-3-sonnet-20240229',
      });
    case 'gemini':
      return new ChatVertexAI({ apiKey: key, model: 'gemini-1.5-flash' });
    case 'deepseek':
      return new ChatDeepSeek({ apiKey: key, modelName: 'deepseek-chat' });
    case 'openrouter':
      return new ChatOpenRouter({
        apiKey: key,
        modelName: 'openrouter/gpt-4o-mini',
      });
  }
}
```

### 7.2 Key 存储

- 使用 **keytar** 持久化：`
keytar.setPassword('ai-actual', provider, apiKey)`
- 渲染进程通过 IPC 请求临时 token，永不存明文。
- “账号中心” 页面：输入、测试并保存 Key。

### 7.3 路由策略

`routes.json`

```json
{
  "daily": { "provider": "openai", "model": "gpt-4o-mini" },
  "weekly": { "provider": "gemini", "model": "gemini-1.5-flash" },
  "deep": { "provider": "anthropic", "model": "claude-3-opus" }
}
```

---

## 8. LangChain Pipeline 设计

```ts
import { RunnableSequence } from '@langchain/core/runnables';
export async function buildDailySummaryChain(cfg) {
  const chatModel = await getChatModel(
    cfg.provider,
    await getToken(cfg.provider),
  );
  return RunnableSequence.from([formatMessages, chatModel, parseJSON]);
}
```

- 支持流式输出、Token 计费统计。

---

## 9. 开发与构建脚本

```json
"scripts": {
  "dev":    "vite dev & electron --inspect=5858 -r tsx apps/main/index.ts",
  "build":  "tsc -p . && vite build && electron-builder",
  "lint":   "eslint . --ext .ts,.tsx",
  "test":   "vitest",
  "release":"ts-node scripts/release.ts"
}
```

---

## 10. 安全与合规

1. 聊天数据仅在本地解析，绝不上传原文。
2. API Key 加密存储，渲染层无法读取。
3. LLM 调用前可选 PII 清洗（手机号 / OpenID → \*\*\*）。
4. 日志中任何密钥均脱敏（中间 8 位 `****`）。
5. 明示网络去向及大模型计费信息。

---

## 11. 后续可扩展方向

- **多模态**：截图 + OCR → 图片摘要
- **向量检索**：chromadb / pgvector 保存聊天嵌入，实现长记忆
- **语音**：接入微信语音转写 → 语音摘要
- **第三方日程**：同步 Outlook / Google Calendar → 会议纪要
- **团队分享**：飞书 / Slack Webhook 推送日报

---

> 如需根据本方案生成项目骨架或补充实现代码，请在终端告诉我！
