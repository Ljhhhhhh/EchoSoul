# EchoSoul AI 服务配置与管理系统

## 概述

EchoSoul 的 AI 服务配置与管理系统提供了完整的多 LLM 提供商支持，包括 OpenAI、Anthropic Claude、Google Gemini、OpenRouter、DeepSeek 等。系统具备安全的 API 密钥管理、服务健康监控、使用统计跟踪等功能。

## 核心组件

### 1. 类型定义 (`src/types/types.ts`)

- `AIProvider`: 支持的 AI 提供商枚举
- `AIServiceConfig`: AI 服务配置接口
- `AIServiceStatus`: 服务状态接口
- `AIServiceTestResult`: 连接测试结果
- `AIUsageStats`: 使用统计接口

### 2. 配置服务 (`src/main/services/ConfigService.ts`)

- 用户设置和 AI 服务配置管理
- 基于 electron-store 的持久化存储
- 配置验证和默认值管理

### 3. AI 提供商适配器 (`src/main/services/ai/`)

- `AIProviderAdapter`: 统一的适配器接口
- `OpenAIAdapter`: OpenAI API 适配器
- `AnthropicAdapter`: Anthropic Claude API 适配器
- `AIProviderFactory`: 适配器工厂类

### 4. AI 服务管理器 (`src/main/services/AIServiceManager.ts`)

- 多服务配置管理
- 服务状态监控
- 使用统计跟踪
- 事件驱动架构

### 5. 健康检查服务 (`src/main/services/AIHealthCheckService.ts`)

- 定期健康检查
- 延迟监控
- 配额检查
- 趋势分析

## 使用方法

### 在渲染进程中使用

```typescript
// 获取所有 AI 服务
const services = await window.electronAPI.invoke('ai:get-services')

// 添加新的 AI 服务
const newService: AIServiceConfig = {
  id: 'openai-gpt4',
  provider: 'openai',
  name: 'OpenAI GPT-4',
  description: 'OpenAI GPT-4 服务',
  apiKey: 'your-api-key',
  model: 'gpt-4o',
  settings: {
    temperature: 0.7,
    maxTokens: 4096,
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000
  },
  isEnabled: true,
  isPrimary: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}

await window.electronAPI.invoke('ai:add-service', newService)

// 测试服务连接
const testResult = await window.electronAPI.invoke('ai:test-service', 'openai-gpt4')
console.log('连接测试结果:', testResult)

// 发送聊天请求
const response = await window.electronAPI.invoke(
  'ai:send-chat-request',
  'openai-gpt4',
  [{ role: 'user', content: 'Hello, how are you?' }],
  {
    temperature: 0.8,
    maxTokens: 100
  }
)

console.log('AI 响应:', response.content)
```

### 在主进程中使用

```typescript
// 通过 AppServices 访问 AI 服务管理器
const aiService = appServices.aiService

// 添加服务配置
await aiService.addOrUpdateService(serviceConfig)

// 获取主要服务
const primaryService = aiService.getPrimaryService()

// 发送聊天请求
if (primaryService) {
  const response = await aiService.sendChatRequest(primaryService.id, [
    { role: 'user', content: 'Hello' }
  ])
}

// 监听服务事件
aiService.on('service:status-changed', (serviceId, status) => {
  console.log(`服务 ${serviceId} 状态变更:`, status)
})

aiService.on('service:usage-updated', (serviceId, usage) => {
  console.log(`服务 ${serviceId} 使用统计更新:`, usage)
})
```

## 支持的 AI 提供商

### OpenAI

- 模型: GPT-4o, GPT-4o-mini, GPT-4-turbo, GPT-3.5-turbo
- 支持自定义 Base URL
- 完整的参数支持 (temperature, top_p, frequency_penalty 等)

### Anthropic Claude

- 模型: Claude-3.5 Sonnet, Claude-3 Opus, Claude-3 Haiku
- 原生 API 支持
- 系统消息处理

### Google Gemini

- 模型: Gemini Pro, Gemini Pro Vision
- Google AI API 集成

### OpenRouter

- 统一多模型访问
- 基于 OpenAI 兼容接口
- 支持多种第三方模型

### DeepSeek

- DeepSeek Chat, DeepSeek Coder
- 基于 OpenAI 兼容接口

### 本地模型

- Ollama 集成
- 本地 LLM 支持
- 无需 API 密钥

## 安全特性

1. **配置验证**: 所有配置数据通过 Zod 模式验证
2. **类型安全**: TypeScript 类型系统确保数据一致性
3. **错误处理**: 完善的错误处理和日志记录
4. **验证机制**: API 密钥有效性验证

## 监控与统计

1. **健康检查**: 定期检查服务可用性和响应时间
2. **使用统计**: 跟踪请求数量、Token 使用量、成本等
3. **错误监控**: 记录和分析服务错误
4. **性能监控**: 延迟趋势分析

## 配置示例

```typescript
// 完整的服务配置示例
const serviceConfig: AIServiceConfig = {
  id: 'claude-3-5-sonnet',
  provider: 'anthropic',
  name: 'Claude 3.5 Sonnet',
  description: 'Anthropic Claude 3.5 Sonnet 模型',
  apiKey: 'sk-ant-api03-...',
  model: 'claude-3-5-sonnet-20241022',
  settings: {
    temperature: 0.7,
    maxTokens: 4096,
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000
  },
  isEnabled: true,
  isPrimary: true,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z'
}
```

## 事件系统

AI 服务管理器提供了丰富的事件系统：

- `service:added`: 服务添加
- `service:removed`: 服务删除
- `service:status-changed`: 状态变更
- `service:usage-updated`: 使用统计更新
- `service:error`: 服务错误
- `service:event`: 通用服务事件

## 最佳实践

1. **服务配置**: 为不同用途配置多个服务实例
2. **主服务设置**: 设置一个主要服务作为默认选择
3. **健康监控**: 启用健康检查以确保服务可用性
4. **错误处理**: 实现适当的错误处理和重试机制
5. **使用统计**: 监控使用情况以优化成本和性能

## 故障排除

1. **连接失败**: 检查 API 密钥和网络连接
2. **认证错误**: 验证 API 密钥有效性
3. **配额超限**: 检查 API 配额和使用统计
4. **响应超时**: 调整超时设置和重试参数

这个 AI 服务配置与管理系统为 EchoSoul 提供了强大而灵活的 AI 集成能力，支持多种 LLM 提供商，确保了安全性、可靠性和可扩展性。
