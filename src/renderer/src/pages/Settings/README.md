# Settings 页面模块化结构

本目录包含了重构后的 Settings 页面，采用模块化设计，提高了代码的可维护性和可复用性。

## 目录结构

```
Settings/
├── index.tsx                 # 主入口文件，组合各个组件
├── types.ts                  # TypeScript 类型定义
├── constants.ts              # 常量定义（如 AI 提供商模板）
├── README.md                 # 本说明文件
├── components/               # UI 组件
│   ├── EnvironmentTab.tsx    # 环境配置标签页
│   ├── AiServiceTab.tsx      # AI 服务配置标签页
│   ├── PrivacyTab.tsx        # 隐私安全标签页
│   ├── GeneralTab.tsx        # 通用设置标签页
│   ├── AiConfigCard.tsx      # AI 配置卡片组件
│   └── AddAiConfigForm.tsx   # 添加 AI 配置表单
├── hooks/                    # 自定义 React Hooks
│   ├── useSettings.ts        # 设置状态管理
│   ├── useAiConfig.ts        # AI 配置逻辑
│   └── useToastNotifications.ts # 通知消息管理
└── utils/                    # 工具函数
    └── settingsUtils.ts      # 设置相关工具函数
```

## 设计原则

### 1. 单一职责原则
- 每个文件和组件都有明确的职责
- 类型定义、常量、组件、逻辑分离

### 2. 可复用性
- 组件设计为可复用的独立单元
- 通过 props 传递数据和回调函数

### 3. 状态管理
- 使用自定义 hooks 管理复杂状态逻辑
- 状态提升到合适的层级

### 4. 类型安全
- 完整的 TypeScript 类型定义
- 接口和类型的统一管理

## 主要组件说明

### index.tsx
主入口文件，负责：
- 组合各个标签页组件
- 管理全局状态
- 处理保存操作

### 标签页组件
- **EnvironmentTab**: 环境配置（Chatlog 数据目录）
- **AiServiceTab**: AI 服务配置（多模型管理）
- **PrivacyTab**: 隐私安全设置
- **GeneralTab**: 通用设置（主题、通知等）

### AI 配置组件
- **AiConfigCard**: 单个 AI 配置的展示和编辑
- **AddAiConfigForm**: 添加新 AI 配置的表单

### 自定义 Hooks
- **useSettings**: 管理所有设置状态
- **useAiConfig**: 处理 AI 配置的增删改查逻辑
- **useToastNotifications**: 统一管理通知消息

## 使用方式

```tsx
import Settings from '@/pages/Settings'

// 在路由中使用
<Route path="/settings" element={<Settings />} />
```

## 扩展指南

### 添加新的设置项
1. 在 `types.ts` 中添加类型定义
2. 在 `constants.ts` 中添加默认值
3. 在相应的标签页组件中添加 UI
4. 在 `useSettings` hook 中添加状态管理逻辑

### 添加新的标签页
1. 创建新的标签页组件
2. 在 `index.tsx` 中导入并使用
3. 更新 TabsList 添加新的 TabsTrigger

### 添加新的工具函数
在 `utils/settingsUtils.ts` 中添加相关的工具函数

## 重构收益

1. **代码可读性**: 从 664 行的单文件拆分为多个小文件
2. **可维护性**: 每个模块职责清晰，便于修改和调试
3. **可测试性**: 组件和逻辑分离，便于单元测试
4. **可复用性**: 组件可以在其他地方复用
5. **团队协作**: 多人可以同时开发不同的模块
