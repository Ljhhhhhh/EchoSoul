# EchoSoul 测试指南

## 🧪 测试框架

EchoSoul 使用 [Vitest](https://vitest.dev/) 作为测试框架，它是一个基于 Vite 的快速单元测试框架。

## 📁 测试文件结构

```
src/
├── main/
│   ├── __tests__/          # 主进程测试
│   │   ├── services/       # 服务层测试
│   │   └── utils/          # 工具函数测试
├── renderer/
│   ├── src/
│   │   ├── __tests__/      # 渲染进程测试
│   │   ├── components/     # 组件测试
│   │   └── views/          # 页面测试
└── types/
    └── __tests__/          # 类型测试
```

## 🚀 运行测试

### 基本命令

```bash
# 运行所有测试
pnpm test

# 运行测试并生成覆盖率报告
pnpm test:coverage

# 运行测试 UI 界面
pnpm test:ui

# 运行单次测试（不监听文件变化）
npx vitest run
```

### 测试特定文件

```bash
# 测试特定文件
npx vitest src/main/services/ConfigService.test.ts

# 测试特定目录
npx vitest src/main/__tests__/

# 使用模式匹配
npx vitest --reporter=verbose --run "service"
```

## 📝 编写测试

### 基本测试示例

```typescript
// src/main/__tests__/utils/logger.test.ts
import { describe, it, expect, vi } from 'vitest'
import { createLogger } from '../utils/logger'

describe('Logger Utils', () => {
  it('should create logger with correct name', () => {
    const logger = createLogger('TestLogger')
    expect(logger).toBeDefined()
  })

  it('should log messages correctly', () => {
    const consoleSpy = vi.spyOn(console, 'log')
    const logger = createLogger('TestLogger')

    logger.info('Test message')

    expect(consoleSpy).toHaveBeenCalled()
    consoleSpy.mockRestore()
  })
})
```

### 服务层测试示例

```typescript
// src/main/__tests__/services/ConfigService.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { ConfigService } from '../../services/ConfigService'

describe('ConfigService', () => {
  let configService: ConfigService

  beforeEach(() => {
    configService = new ConfigService()
  })

  afterEach(async () => {
    await configService.cleanup()
  })

  it('should initialize successfully', async () => {
    await expect(configService.initialize()).resolves.not.toThrow()
  })

  it('should store and retrieve configuration', async () => {
    await configService.initialize()

    await configService.set('testKey', 'testValue')
    const value = await configService.get('testKey')

    expect(value).toBe('testValue')
  })
})
```

### Vue 组件测试示例

```typescript
// src/renderer/src/__tests__/components/Button.test.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Button from '../components/ui/button.vue'

describe('Button Component', () => {
  it('should render correctly', () => {
    const wrapper = mount(Button, {
      props: {
        variant: 'default'
      },
      slots: {
        default: 'Click me'
      }
    })

    expect(wrapper.text()).toBe('Click me')
    expect(wrapper.classes()).toContain('btn-default')
  })

  it('should emit click event', async () => {
    const wrapper = mount(Button)

    await wrapper.trigger('click')

    expect(wrapper.emitted('click')).toBeTruthy()
  })
})
```

## 🔧 配置说明

### vitest.config.ts

```typescript
import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    environment: 'node', // 测试环境
    globals: true, // 全局测试函数
    coverage: {
      provider: 'v8', // 覆盖率提供者
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'out/',
        'dist/',
        '**/*.d.ts',
        'src/preload/',
        'src/renderer/src/main.ts'
      ]
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src/renderer/src'),
      '@main': resolve(__dirname, 'src/main'),
      '@types': resolve(__dirname, 'src/types')
    }
  }
})
```

## 📊 覆盖率报告

测试覆盖率报告会生成在 `coverage/` 目录中：

- `coverage/index.html` - HTML 格式的详细报告
- `coverage/coverage-final.json` - JSON 格式的覆盖率数据
- 控制台会显示文本格式的覆盖率摘要

### 覆盖率目标

- **语句覆盖率**: > 80%
- **分支覆盖率**: > 75%
- **函数覆盖率**: > 85%
- **行覆盖率**: > 80%

## 🎯 测试最佳实践

### 1. 测试命名

```typescript
// ✅ 好的测试命名
describe('ConfigService', () => {
  it('should throw error when API key is invalid', () => {
    // ...
  })
})

// ❌ 不好的测试命名
describe('Config', () => {
  it('test1', () => {
    // ...
  })
})
```

### 2. 测试结构

使用 AAA 模式（Arrange, Act, Assert）：

```typescript
it('should calculate total correctly', () => {
  // Arrange - 准备测试数据
  const items = [{ price: 10 }, { price: 20 }]

  // Act - 执行被测试的操作
  const total = calculateTotal(items)

  // Assert - 验证结果
  expect(total).toBe(30)
})
```

### 3. Mock 和 Spy

```typescript
import { vi } from 'vitest'

// Mock 整个模块
vi.mock('../services/DatabaseService')

// Spy 特定方法
const logSpy = vi.spyOn(console, 'log')

// 清理 Mock
afterEach(() => {
  vi.clearAllMocks()
})
```

### 4. 异步测试

```typescript
// Promise 测试
it('should handle async operations', async () => {
  await expect(asyncFunction()).resolves.toBe('expected')
})

// 错误处理测试
it('should handle errors correctly', async () => {
  await expect(failingFunction()).rejects.toThrow('Error message')
})
```

## 🚨 常见问题

### 1. 模块找不到

确保在 `vitest.config.ts` 中正确配置了路径别名。

### 2. TypeScript 错误

确保测试文件包含正确的类型导入：

```typescript
import { describe, it, expect } from 'vitest'
```

### 3. Electron 相关测试

对于 Electron 特定的 API，需要进行 Mock：

```typescript
vi.mock('electron', () => ({
  app: {
    getPath: vi.fn(() => '/mock/path')
  }
}))
```

这个测试指南将帮助团队编写高质量的测试，确保 EchoSoul 的代码质量和稳定性。
