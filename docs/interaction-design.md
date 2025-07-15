# EchoSoul 高级交互设计指南

## 🌟 核心交互原则

### 1. 引导式体验

EchoSoul 的交互设计应遵循"引导式体验"原则，将复杂的数据分析过程转化为清晰、直观的用户旅程。每个页面和功能都应该有明确的下一步指引，减少用户的认知负担。

```
设计准则：
- 每个页面都应有明确的主要行动点
- 使用视觉层次引导用户注意力
- 复杂流程拆分为可管理的步骤
- 提供上下文帮助和提示
- 避免同时呈现过多选项
```

### 2. 即时反馈

用户的每个操作都应获得即时、明确的反馈，增强操作的确定性和可预测性。

```
反馈类型：
- 视觉反馈：状态变化、动画过渡
- 功能反馈：操作结果、成功/失败提示
- 进度反馈：加载状态、处理进度
- 确认反馈：重要操作的确认机制
- 引导反馈：下一步建议
```

### 3. 渐进式复杂度

界面应遵循"渐进式复杂度"原则，基础功能简单直观，高级功能逐层展开。

```
复杂度层级：
- 第一层：核心功能，所有用户都能轻松理解
- 第二层：进阶功能，通过明确入口进入
- 第三层：专家功能，针对高级用户的深度选项
```

### 4. 一致性体验

整个应用的交互模式应保持一致，降低学习成本，提高使用效率。

```
一致性要素：
- 视觉一致性：色彩、排版、图标系统
- 交互一致性：操作方式、反馈机制
- 语言一致性：术语、提示文案、错误信息
- 结构一致性：布局模式、导航系统
```

## 🚶‍♂️ 用户旅程设计

### 初始化流程

初始化是用户的第一印象，应设计成仪式感强、信任感高的体验。

```
初始化体验设计：

1. 欢迎屏幕
   - 简洁的品牌展示
   - 温暖的欢迎文案
   - 明确的开始按钮

2. 环境检测
   - 自动检测系统环境
   - 可视化检测进度
   - 问题诊断和解决建议

3. 数据源配置
   - 分步引导选择数据目录
   - 预览可用数据
   - 权限说明和隐私承诺

4. AI服务设置
   - 简化的服务选择界面
   - 安全的API Key输入
   - 测试连接的即时反馈

5. 完成设置
   - 成功动画庆祝
   - 功能概览介绍
   - 引导进入主界面
```

### 日常使用流程

日常使用是核心体验，应设计成高效、愉悦的过程。

```
日常使用体验设计：

1. 启动体验
   - 快速加载动画
   - 记住上次状态
   - 新内容提示

2. 报告浏览
   - 最新报告优先展示
   - 直观的数据可视化
   - 平滑的滚动和翻页

3. 深度阅读
   - 沉浸式阅读模式
   - 智能章节导航
   - 交互式数据探索

4. 自定义报告
   - 引导式表单设计
   - 实时预览选择结果
   - 处理过程透明化

5. 设置调整
   - 分类清晰的设置项
   - 即时应用的设置变更
   - 设置搜索功能
```

## 🎭 微交互设计

### 状态转换动画

状态变化应通过精心设计的动画传达，增强用户对系统状态的理解。

```css
/* 加载状态转换 */
.loading-transition {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}

.loading-enter-from,
.loading-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

/* 成功状态动画 */
@keyframes success-pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

.success-animation {
  animation: success-pulse 0.6s ease-in-out;
}

/* 错误状态动画 */
@keyframes error-shake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-5px);
  }
  75% {
    transform: translateX(5px);
  }
}

.error-animation {
  animation: error-shake 0.5s ease-in-out;
}
```

### 按钮交互设计

按钮是最常用的交互元素，应设计丰富的状态反馈。

```
按钮交互状态：

1. 默认状态
   - 清晰的视觉层次
   - 符合品牌的色彩

2. 悬停状态
   - 微妙的色彩变化
   - 轻微的阴影增强

3. 点击状态
   - 按下的视觉反馈
   - 涟漪效果扩散

4. 加载状态
   - 内联进度指示器
   - 禁用但保持视觉连续性

5. 成功/失败状态
   - 状态图标转换
   - 颜色变化反馈
```

### 表单交互设计

表单应提供即时验证和智能辅助，减少用户输入负担。

```
表单交互增强：

1. 输入增强
   - 实时输入验证
   - 智能默认值
   - 自动完成建议

2. 错误处理
   - 即时内联错误提示
   - 具体的错误原因
   - 修复建议

3. 进度指示
   - 多步骤进度条
   - 保存状态指示器
   - 自动保存动画

4. 辅助功能
   - 上下文帮助提示
   - 输入格式示例
   - 键盘快捷键
```

### 数据可视化交互

数据可视化应支持探索式交互，让用户能深入理解数据。

```
可视化交互模式：

1. 基础交互
   - 悬停显示详情
   - 点击突出显示
   - 简单筛选排序

2. 探索交互
   - 缩放和平移
   - 数据范围调整
   - 视图切换

3. 分析交互
   - 比较模式
   - 趋势线显示
   - 异常值标记

4. 分享交互
   - 视图状态保存
   - 选定数据导出
   - 图表图像生成
```

## 🎯 关键页面交互流程

### 初始化页面交互流程

```
初始化页面交互序列：

1. 页面加载
   - 渐入动画显示欢迎信息
   - 自动开始环境检测
   - 显示总进度条和步骤列表

2. 步骤进行中
   - 当前步骤高亮显示
   - 进度条平滑更新
   - 步骤内详细状态更新

3. 用户输入请求
   - 步骤卡片轻微放大
   - 输入控件滑入显示
   - 焦点自动聚焦到输入区

4. 步骤完成
   - 成功图标动画显示
   - 步骤卡片状态更新
   - 自动进入下一步骤

5. 全部完成
   - 整体完成动画
   - 成功消息显示
   - 短暂停留后自动跳转
```

### 报告中心交互流程

```
报告中心交互序列：

1. 页面加载
   - 骨架屏先行显示
   - 内容分区逐步加载
   - 最新报告优先显示

2. 报告卡片交互
   - 悬停时轻微上浮
   - 点击时展开预览
   - 长按显示快捷操作

3. 报告列表交互
   - 滚动加载更多
   - 筛选条件动态更新
   - 排序切换动画

4. 生成新报告
   - 点击按钮弹出选项
   - 快速/高级模式选择
   - 表单平滑展开
```

### 报告详情交互流程

```
报告详情交互序列：

1. 打开报告
   - 平滑过渡动画
   - 内容分段加载
   - 导航自动生成

2. 内容浏览
   - 滚动时导航同步高亮
   - 图表随视图进入动画展示
   - 章节间平滑过渡

3. 数据探索
   - 图表交互响应
   - 数据点详情浮层
   - 相关数据联动高亮

4. 分享操作
   - 分享选项平滑展开
   - 导出进度可视化
   - 成功反馈动画
```

## 📱 响应式交互设计

### 不同设备的交互适配

```
设备适配交互策略：

1. 桌面端 (>1024px)
   - 多列布局充分利用空间
   - 悬停状态丰富
   - 键盘快捷键支持

2. 平板端 (768px-1024px)
   - 双列布局为主
   - 侧边栏可折叠
   - 触摸优化的控件尺寸

3. 移动端 (<768px)
   - 单列垂直布局
   - 底部导航栏
   - 手势操作增强
```

### 窗口尺寸变化交互

```
窗口调整响应：

1. 布局转换
   - 平滑的栅格重排
   - 元素大小比例调整
   - 内容优先级重组

2. 导航适应
   - 宽屏：水平导航
   - 窄屏：汉堡菜单
   - 过渡状态：图标+文字→纯图标

3. 内容调整
   - 数据可视化自适应
   - 表格响应式展示
   - 图片智能裁剪
```

## 🌙 深色模式交互

### 模式切换体验

```
深色模式切换设计：

1. 切换动画
   - 颜色平滑过渡 (0.3s)
   - 考虑减少闪烁的策略
   - 记住用户偏好设置

2. 深色模式特殊交互
   - 降低对比度的悬停状态
   - 柔和的焦点指示器
   - 适应夜间使用的亮度
```

## 🔄 错误处理与恢复交互

### 错误状态交互设计

```
错误处理交互策略：

1. 轻微错误
   - 内联提示，不中断流程
   - 自动恢复建议
   - 不显眼但清晰可见

2. 中度错误
   - 警告通知，需要注意
   - 提供多种解决方案
   - 可暂时跳过继续操作

3. 严重错误
   - 模态对话框阻断操作
   - 详细的错误说明
   - 明确的恢复步骤
   - 诊断信息收集选项
```

# EchoSoul 完整页面架构与功能设计

## 📋 页面列表与层级结构

### 应用架构总览

```
EchoSoul 应用架构 (MVP版本)
├── 🚀 InitializationPage (/)                    [首次启动/重新初始化]
│   ├── 环境检测步骤
│   ├── AI服务配置步骤
│   ├── 数据导入步骤
│   └── 完成引导步骤
│
└── 🏠 MainApp (/main)                           [主应用框架]
    ├── 📊 ReportCenter (默认页面)               [报告中心]
    ├── 📄 ReportDetail (/main/report/:id)       [报告详情]
    ├── ⚙️ CustomReport (/main/create)           [自定义报告生成]
    ├── 📚 ReportHistory (/main/history)         [历史报告管理]
    └── 🔧 Settings (/main/settings)             [设置页面]
        ├── AI服务配置
        ├── 报告偏好设置
        ├── 数据管理
        └── 系统设置
```

### 页面优先级与开发顺序

```
开发优先级 (基于用户价值和技术复杂度):

P0 (核心体验):
├── InitializationPage     - 用户第一印象，必须完美
└── ReportCenter          - 核心功能，日常使用频率最高

P1 (主要功能):
├── ReportDetail          - 深度阅读体验，用户留存关键
└── CustomReport          - 个性化需求，差异化竞争优势

P2 (支撑功能):
├── Settings              - 系统配置，影响整体体验
└── ReportHistory         - 数据管理，长期用户价值
```

## 🚀 InitializationPage 详细设计

### 页面职责与目标

- **核心目标**: 5分钟内完成环境配置，让用户看到第一份报告
- **用户情绪**: 从期待 → 信任 → 惊喜 → 满意
- **技术目标**: 自动化程度95%，用户操作最小化

### 页面结构与元素

```
InitializationPage 布局结构:
┌─────────────────────────────────────────────────────────────┐
│  🎨 渐变背景 (from-blue-50 to-indigo-100)                   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  📋 初始化卡片 (max-w-2xl, 居中)                    │    │
│  │                                                     │    │
│  │  🏷️ 标题区域                                        │    │
│  │  ├── "EchoSoul 初始化" (text-3xl)                   │    │
│  │  └── 副标题说明                                     │    │
│  │                                                     │    │
│  │  📊 总进度区域                                      │    │
│  │  ├── 进度百分比显示                                 │    │
│  │  └── 进度条 (h-3, 品牌色渐变)                       │    │
│  │                                                     │    │
│  │  📝 步骤列表区域                                    │    │
│  │  ├── 步骤1: 环境设置 (chatlog检测)                  │    │
│  │  ├── 步骤2: AI配置 (API Key设置)                    │    │
│  │  ├── 步骤3: 数据导入 (首次分析)                     │    │
│  │  └── 步骤4: 完成设置                               │    │
│  │                                                     │    │
│  │  ⚠️ 重要提示区域                                     │    │
│  │  └── 黄色警告卡片                                   │    │
│  │                                                     │    │
│  │  🔧 页脚操作区域                                    │    │
│  │  ├── 诊断信息按钮 (左侧)                            │    │
│  │  └── 完成状态显示 (右侧)                            │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### 核心功能元素

#### 1. 步骤状态管理

```typescript
interface StepStatus {
  id: string
  title: string
  description: string
  status: 'waiting' | 'in_progress' | 'success' | 'error' | 'waiting_user_input'
  progress?: number
  errorMessage?: string
  userAction?: {
    type: 'select_directory' | 'input_api_key' | 'retry'
    label: string
    handler: () => void
  }
}

// 步骤配置
const initializationSteps: StepStatus[] = [
  {
    id: 'environment_setup',
    title: '环境设置',
    description: '检测chatlog服务状态并建立连接',
    status: 'waiting'
  },
  {
    id: 'ai_configuration',
    title: 'AI服务配置',
    description: '设置AI服务提供商和API密钥',
    status: 'waiting'
  },
  {
    id: 'data_import',
    title: '数据导入分析',
    description: '导入聊天数据并生成首份报告',
    status: 'waiting'
  },
  {
    id: 'completion',
    title: '完成设置',
    description: '验证功能并准备进入主应用',
    status: 'waiting'
  }
]
```

#### 2. 交互元素设计

```vue
<!-- 步骤卡片组件 -->
<div
  v-for="step in steps"
  :key="step.id"
  class="step-card"
  :class="getStepClasses(step.status)"
>
  <div class="step-header">
    <div class="step-icon">{{ getStepIcon(step.status) }}</div>
    <div class="step-info">
      <h3 class="step-title">{{ step.title }}</h3>
      <p class="step-description">{{ step.description }}</p>
    </div>
    <div class="step-status">
      <span class="status-text">{{ getStatusText(step.status) }}</span>
      <div v-if="step.progress" class="progress-mini">{{ step.progress }}%</div>
    </div>
  </div>

  <!-- 用户操作区域 -->
  <div v-if="step.userAction" class="step-action">
    <Button
      @click="step.userAction.handler"
      :variant="step.status === 'error' ? 'destructive' : 'default'"
    >
      {{ step.userAction.label }}
    </Button>
  </div>

  <!-- 错误信息显示 -->
  <div v-if="step.errorMessage" class="step-error">
    <AlertTriangle class="error-icon" />
    <span>{{ step.errorMessage }}</span>
  </div>
</div>
```

### 页面跳转逻辑

```typescript
// 初始化完成后的跳转逻辑
const handleInitializationComplete = () => {
  // 显示完成动画 (2秒)
  showCompletionAnimation()

  // 延迟跳转，让用户感受成功
  setTimeout(() => {
    router.push('/main')
  }, 2000)
}

// 错误处理跳转
const handleCriticalError = (error: Error) => {
  // 显示错误对话框
  showErrorDialog({
    title: '初始化失败',
    message: error.message,
    actions: [
      { label: '重试', handler: () => retryInitialization() },
      { label: '查看日志', handler: () => showDiagnostics() },
      { label: '退出', handler: () => app.quit() }
    ]
  })
}
```

## 🏠 MainApp 框架设计

### 整体布局架构

```
MainApp 布局结构:
┌─────────────────────────────────────────────────────────────┐
│  🎯 Header (固定顶部, h-16)                                  │
│  ├── 左侧: EchoSoul Logo + 副标题                            │
│  ├── 中间: 面包屑导航 (可选)                                 │
│  └── 右侧: 通知 + 设置 + 用户状态                            │
├─────────────────────────────────────────────────────────────┤
│  📱 Main Content (动态内容区域)                              │
│  ├── ReportCenter (默认)                                    │
│  ├── ReportDetail                                           │
│  ├── CustomReport                                           │
│  ├── ReportHistory                                          │
│  └── Settings                                               │
└─────────────────────────────────────────────────────────────┘
```

### Header 导航栏详细设计

```vue
<header class="main-header">
  <div class="header-container">
    <!-- 左侧品牌区 -->
    <div class="brand-section">
      <div class="logo-area">
        <h1 class="app-title">EchoSoul</h1>
        <span class="app-subtitle">聊天记录分析</span>
      </div>
    </div>

    <!-- 中间导航区 (可选) -->
    <div class="navigation-section">
      <Breadcrumb v-if="showBreadcrumb" :items="breadcrumbItems" />
    </div>

    <!-- 右侧功能区 -->
    <div class="actions-section">
      <!-- 通知中心 -->
      <NotificationBell
        :count="notificationCount"
        @click="toggleNotifications"
      />

      <!-- 系统状态指示器 -->
      <StatusIndicator
        :chatlog-status="chatlogStatus"
        :ai-status="aiStatus"
      />

      <!-- 设置按钮 -->
      <Button
        variant="ghost"
        size="icon"
        @click="navigateToSettings"
      >
        <Settings class="w-5 h-5" />
      </Button>
    </div>
  </div>
</header>
```

### 路由配置与导航逻辑

```typescript
// 扩展的路由配置
const routes = [
  {
    path: '/',
    name: 'initialization',
    component: InitializationPage,
    meta: { requiresAuth: false }
  },
  {
    path: '/main',
    name: 'main',
    component: MainApp,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'report-center',
        component: ReportCenter,
        meta: { title: '报告中心' }
      },
      {
        path: 'report/:id',
        name: 'report-detail',
        component: ReportDetail,
        meta: { title: '报告详情' },
        props: true
      },
      {
        path: 'create',
        name: 'custom-report',
        component: CustomReport,
        meta: { title: '生成自定义报告' }
      },
      {
        path: 'history',
        name: 'report-history',
        component: ReportHistory,
        meta: { title: '历史报告' }
      },
      {
        path: 'settings',
        name: 'settings',
        component: Settings,
        meta: { title: '设置' },
        children: [
          {
            path: 'ai',
            name: 'ai-settings',
            component: AISettings,
            meta: { title: 'AI服务配置' }
          },
          {
            path: 'reports',
            name: 'report-settings',
            component: ReportSettings,
            meta: { title: '报告偏好' }
          },
          {
            path: 'data',
            name: 'data-settings',
            component: DataSettings,
            meta: { title: '数据管理' }
          },
          {
            path: 'system',
            name: 'system-settings',
            component: SystemSettings,
            meta: { title: '系统设置' }
          }
        ]
      }
    ]
  }
]

// 导航守卫
router.beforeEach((to, from, next) => {
  // 检查初始化状态
  if (to.meta.requiresAuth && !isInitialized()) {
    next('/')
    return
  }

  // 更新面包屑
  updateBreadcrumb(to)

  next()
})
```

## 📊 ReportCenter 页面设计

### 页面职责与目标

- **核心目标**: 让用户快速了解最新洞察，激发深度探索兴趣
- **用户场景**: 每日晨间查看、周期性回顾、寻找特定报告
- **成功指标**: 报告查看率>80%，平均停留时间>2分钟

### 页面布局与功能区域

```
ReportCenter 布局结构:
┌─────────────────────────────────────────────────────────────┐
│  🎉 欢迎横幅 (可收起)                                        │
│  └── 初始化完成庆祝 + 功能介绍                               │
├─────────────────────────────────────────────────────────────┤
│  ⭐ 今日报告卡片 (突出显示)                                  │
│  ├── 报告标题 + 生成时间                                     │
│  ├── 关键洞察摘要 (4-6个关键指标)                            │
│  ├── 情绪状态可视化                                         │
│  └── 快速操作: [查看详情] [分享] [重新生成]                   │
├─────────────────────────────────────────────────────────────┤
│  📈 快速统计面板                                            │
│  ├── 本周消息总数 | 活跃联系人 | 情绪指数 | 话题多样性        │
│  └── 趋势指示器 (↑↓ 与上周对比)                              │
├─────────────────────────────────────────────────────────────┤
│  📚 历史报告列表                                            │
│  ├── 筛选器: [时间范围] [报告类型] [关键词搜索]               │
│  ├── 排序选项: [时间] [相关性] [完整度]                       │
│  └── 报告卡片列表 (分页或无限滚动)                           │
├─────────────────────────────────────────────────────────────┤
│  🚀 快速操作区域                                            │
│  ├── [生成自定义报告] (主要CTA)                              │
│  ├── [导出数据] [系统设置]                                   │
│  └── 系统状态指示器                                         │
└─────────────────────────────────────────────────────────────┘
```

### 核心组件设计

#### 1. 今日报告卡片

```vue
<Card class="today-report-card">
  <CardHeader class="report-header">
    <div class="header-main">
      <CardTitle class="report-title">
        {{ todayReport.title }}
        <Badge variant="secondary">{{ todayReport.type }}</Badge>
      </CardTitle>
      <div class="report-meta">
        <Clock class="meta-icon" />
        <span>{{ formatDate(todayReport.createdAt) }}</span>
        <Separator orientation="vertical" />
        <span>{{ todayReport.messageCount }}条消息</span>
      </div>
    </div>
    <div class="header-actions">
      <Button variant="ghost" size="sm" @click="shareReport">
        <Share2 class="w-4 h-4" />
      </Button>
      <Button variant="ghost" size="sm" @click="regenerateReport">
        <RefreshCw class="w-4 h-4" />
      </Button>
    </div>
  </CardHeader>

  <CardContent class="report-content">
    <!-- 关键洞察网格 -->
    <div class="insights-grid">
      <div class="insight-item" v-for="insight in todayReport.keyInsights" :key="insight.id">
        <div class="insight-icon">{{ insight.icon }}</div>
        <div class="insight-content">
          <div class="insight-label">{{ insight.label }}</div>
          <div class="insight-value">{{ insight.value }}</div>
          <div class="insight-trend" :class="insight.trendClass">
            {{ insight.trend }}
          </div>
        </div>
      </div>
    </div>

    <!-- 情绪状态可视化 -->
    <div class="emotion-visualization">
      <h4 class="viz-title">情绪状态分布</h4>
      <EmotionChart :data="todayReport.emotionData" />
    </div>

    <!-- 主要话题标签云 -->
    <div class="topics-section">
      <h4 class="section-title">主要话题</h4>
      <div class="topic-tags">
        <Badge
          v-for="topic in todayReport.mainTopics"
          :key="topic.name"
          variant="outline"
          :style="{ fontSize: `${topic.weight}rem` }"
        >
          {{ topic.name }}
        </Badge>
      </div>
    </div>
  </CardContent>

  <CardFooter class="report-actions">
    <Button @click="viewReportDetail(todayReport.id)" class="primary-action">
      查看完整报告
      <ArrowRight class="w-4 h-4 ml-2" />
    </Button>
    <Button variant="outline" @click="createSimilarReport">
      生成类似报告
    </Button>
  </CardFooter>
</Card>
```

#### 2. 快速统计面板

```vue
<div class="stats-panel">
  <div class="stats-grid">
    <StatCard
      v-for="stat in weeklyStats"
      :key="stat.id"
      :icon="stat.icon"
      :label="stat.label"
      :value="stat.value"
      :trend="stat.trend"
      :comparison="stat.comparison"
      @click="drillDownStat(stat.id)"
    />
  </div>
</div>

<!-- StatCard 组件 -->
<Card class="stat-card" :class="{ 'clickable': clickable }">
  <CardContent class="stat-content">
    <div class="stat-header">
      <div class="stat-icon">
        <component :is="icon" class="w-6 h-6" />
      </div>
      <div class="stat-trend" :class="trendClass">
        <TrendingUp v-if="trend > 0" class="w-4 h-4" />
        <TrendingDown v-else-if="trend < 0" class="w-4 h-4" />
        <Minus v-else class="w-4 h-4" />
      </div>
    </div>

    <div class="stat-main">
      <div class="stat-value">{{ value }}</div>
      <div class="stat-label">{{ label }}</div>
    </div>

    <div class="stat-comparison">
      <span class="comparison-text">{{ comparison }}</span>
    </div>
  </CardContent>
</Card>
```

#### 3. 历史报告列表

```vue
<div class="history-section">
  <!-- 筛选和搜索栏 -->
  <div class="filters-bar">
    <div class="search-input">
      <Search class="search-icon" />
      <Input
        v-model="searchQuery"
        placeholder="搜索报告内容..."
        class="search-field"
      />
    </div>

    <div class="filter-controls">
      <Select v-model="timeFilter">
        <SelectTrigger>
          <SelectValue placeholder="时间范围" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="week">最近一周</SelectItem>
          <SelectItem value="month">最近一月</SelectItem>
          <SelectItem value="quarter">最近三月</SelectItem>
          <SelectItem value="all">全部时间</SelectItem>
        </SelectContent>
      </Select>

      <Select v-model="typeFilter">
        <SelectTrigger>
          <SelectValue placeholder="报告类型" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="auto">自动报告</SelectItem>
          <SelectItem value="custom">自定义报告</SelectItem>
          <SelectItem value="all">全部类型</SelectItem>
        </SelectContent>
      </Select>

      <Button variant="outline" @click="resetFilters">
        <X class="w-4 h-4 mr-2" />
        清除筛选
      </Button>
    </div>
  </div>

  <!-- 报告列表 -->
  <div class="reports-list">
    <ReportCard
      v-for="report in filteredReports"
      :key="report.id"
      :report="report"
      @click="viewReport(report.id)"
      @delete="deleteReport(report.id)"
      @duplicate="duplicateReport(report.id)"
    />

    <!-- 加载更多 -->
    <div v-if="hasMoreReports" class="load-more">
      <Button
        variant="outline"
        @click="loadMoreReports"
        :loading="loadingMore"
      >
        加载更多报告
      </Button>
    </div>
  </div>
</div>
```

### 页面状态管理

```typescript
// ReportCenter 状态接口
interface ReportCenterState {
  todayReport: Report | null
  weeklyStats: StatItem[]
  recentReports: Report[]
  searchQuery: string
  filters: {
    timeRange: string
    reportType: string
  }
  loading: {
    todayReport: boolean
    stats: boolean
    reports: boolean
  }
  pagination: {
    currentPage: number
    hasMore: boolean
  }
}

// 页面操作方法
const reportCenterActions = {
  // 加载今日报告
  async loadTodayReport() {
    state.loading.todayReport = true
    try {
      state.todayReport = await reportService.getTodayReport()
    } catch (error) {
      handleError('加载今日报告失败', error)
    } finally {
      state.loading.todayReport = false
    }
  },

  // 生成新报告
  async generateNewReport(type: 'auto' | 'custom') {
    if (type === 'custom') {
      router.push('/main/create')
    } else {
      const result = await reportService.generateAutoReport()
      if (result.success) {
        await this.loadTodayReport()
        showSuccessToast('报告生成成功')
      }
    }
  },

  // 查看报告详情
  viewReportDetail(reportId: string) {
    router.push(`/main/report/${reportId}`)
  },

  // 搜索和筛选
  async applyFilters() {
    state.loading.reports = true
    try {
      const params = {
        search: state.searchQuery,
        timeRange: state.filters.timeRange,
        type: state.filters.reportType,
        page: 1
      }
      state.recentReports = await reportService.searchReports(params)
      state.pagination.currentPage = 1
    } catch (error) {
      handleError('搜索报告失败', error)
    } finally {
      state.loading.reports = false
    }
  }
}
```

## 📄 ReportDetail 页面设计

### 页面职责与目标

- **核心目标**: 提供沉浸式的报告阅读体验，让用户深度理解分析结果
- **用户场景**: 深度阅读、数据探索、洞察发现、分享讨论
- **成功指标**: 平均阅读时长>5分钟，章节完成率>70%

### 页面布局与功能区域

```
ReportDetail 布局结构:
┌─────────────────────────────────────────────────────────────┐
│  🧭 导航栏                                                  │
│  ├── 面包屑: 报告中心 > 报告详情                             │
│  └── 操作按钮: [分享] [导出] [编辑] [删除]                    │
├─────────────────────────────────────────────────────────────┤
│  📋 报告头部                                                │
│  ├── 报告标题 + 类型标签                                     │
│  ├── 生成时间 + 数据范围 + 分析维度                          │
│  └── 关键指标概览卡片                                       │
├─────────────────────────────────────────────────────────────┤
│  📖 主内容区域 (左右分栏)                                    │
│  ├── 左侧: 章节导航 (固定侧边栏)                             │
│  │   ├── 执行摘要                                           │
│  │   ├── 基础数据统计                                       │
│  │   ├── 情绪分析                                           │
│  │   ├── 话题分析                                           │
│  │   ├── 社交模式                                           │
│  │   └── 个性化洞察                                         │
│  │                                                         │
│  └── 右侧: 报告内容 (可滚动)                                 │
│      ├── 章节内容 + 数据可视化                               │
│      ├── 交互式图表                                         │
│      └── 相关建议                                           │
└─────────────────────────────────────────────────────────────┘
```

### 核心组件设计

#### 1. 报告头部组件

```vue
<div class="report-header">
  <div class="header-main">
    <div class="title-section">
      <h1 class="report-title">{{ report.title }}</h1>
      <div class="title-meta">
        <Badge :variant="getTypeVariant(report.type)">
          {{ getTypeLabel(report.type) }}
        </Badge>
        <Separator orientation="vertical" />
        <span class="generation-time">
          {{ formatDateTime(report.createdAt) }}
        </span>
      </div>
    </div>

    <div class="header-actions">
      <Button variant="outline" size="sm" @click="shareReport">
        <Share2 class="w-4 h-4 mr-2" />
        分享
      </Button>
      <Button variant="outline" size="sm" @click="exportReport">
        <Download class="w-4 h-4 mr-2" />
        导出
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreHorizontal class="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem @click="duplicateReport">
            <Copy class="w-4 h-4 mr-2" />
            复制报告
          </DropdownMenuItem>
          <DropdownMenuItem @click="editReport">
            <Edit class="w-4 h-4 mr-2" />
            编辑设置
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem @click="deleteReport" class="text-destructive">
            <Trash2 class="w-4 h-4 mr-2" />
            删除报告
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </div>

  <!-- 数据范围和分析维度 -->
  <div class="header-meta">
    <div class="data-range">
      <Calendar class="meta-icon" />
      <span>数据范围: {{ formatDateRange(report.dateRange) }}</span>
    </div>
    <div class="analysis-scope">
      <Users class="meta-icon" />
      <span>分析对象: {{ report.analysisScope }}</span>
    </div>
    <div class="message-count">
      <MessageSquare class="meta-icon" />
      <span>消息总数: {{ report.messageCount }}条</span>
    </div>
  </div>

  <!-- 关键指标概览 -->
  <div class="key-metrics">
    <div class="metrics-grid">
      <div
        v-for="metric in report.keyMetrics"
        :key="metric.id"
        class="metric-card"
      >
        <div class="metric-icon">{{ metric.icon }}</div>
        <div class="metric-content">
          <div class="metric-value">{{ metric.value }}</div>
          <div class="metric-label">{{ metric.label }}</div>
        </div>
        <div class="metric-trend" :class="metric.trendClass">
          {{ metric.trend }}
        </div>
      </div>
    </div>
  </div>
</div>
```

#### 2. 章节导航组件

```vue
<nav class="chapter-navigation">
  <div class="nav-header">
    <h3 class="nav-title">报告章节</h3>
    <div class="reading-progress">
      <Progress :value="readingProgress" class="progress-bar" />
      <span class="progress-text">{{ readingProgress }}%</span>
    </div>
  </div>

  <div class="nav-content">
    <div
      v-for="chapter in chapters"
      :key="chapter.id"
      class="nav-item"
      :class="{
        'active': activeChapter === chapter.id,
        'completed': completedChapters.includes(chapter.id)
      }"
      @click="scrollToChapter(chapter.id)"
    >
      <div class="nav-item-icon">
        <CheckCircle v-if="completedChapters.includes(chapter.id)" class="completed-icon" />
        <Circle v-else class="pending-icon" />
      </div>
      <div class="nav-item-content">
        <div class="nav-item-title">{{ chapter.title }}</div>
        <div class="nav-item-subtitle">{{ chapter.subtitle }}</div>
      </div>
      <div class="nav-item-indicator">
        <ChevronRight class="indicator-icon" />
      </div>
    </div>
  </div>

  <!-- 阅读统计 -->
  <div class="reading-stats">
    <div class="stat-item">
      <Clock class="stat-icon" />
      <span>预计阅读: {{ estimatedReadingTime }}分钟</span>
    </div>
    <div class="stat-item">
      <Eye class="stat-icon" />
      <span>已阅读: {{ readChapters }}/{{ totalChapters }}章</span>
    </div>
  </div>
</nav>
```

#### 3. 报告内容组件

```vue
<div class="report-content">
  <div
    v-for="chapter in report.chapters"
    :key="chapter.id"
    :id="`chapter-${chapter.id}`"
    class="chapter-section"
    v-intersection-observer="onChapterVisible"
  >
    <!-- 章节标题 -->
    <div class="chapter-header">
      <h2 class="chapter-title">{{ chapter.title }}</h2>
      <p class="chapter-description">{{ chapter.description }}</p>
    </div>

    <!-- 章节内容 -->
    <div class="chapter-body">
      <!-- 文本内容 -->
      <div v-if="chapter.content" class="chapter-text">
        <div v-html="renderMarkdown(chapter.content)"></div>
      </div>

      <!-- 数据可视化 -->
      <div v-if="chapter.visualizations" class="chapter-visualizations">
        <div
          v-for="viz in chapter.visualizations"
          :key="viz.id"
          class="visualization-container"
        >
          <div class="viz-header">
            <h4 class="viz-title">{{ viz.title }}</h4>
            <div class="viz-actions">
              <Button variant="ghost" size="sm" @click="expandVisualization(viz.id)">
                <Maximize2 class="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" @click="exportVisualization(viz.id)">
                <Download class="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div class="viz-content">
            <component
              :is="getVisualizationComponent(viz.type)"
              :data="viz.data"
              :config="viz.config"
              @interaction="handleVizInteraction"
            />
          </div>

          <div v-if="viz.insights" class="viz-insights">
            <h5 class="insights-title">关键洞察</h5>
            <ul class="insights-list">
              <li v-for="insight in viz.insights" :key="insight.id">
                {{ insight.text }}
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- 数据表格 -->
      <div v-if="chapter.tables" class="chapter-tables">
        <div
          v-for="table in chapter.tables"
          :key="table.id"
          class="table-container"
        >
          <div class="table-header">
            <h4 class="table-title">{{ table.title }}</h4>
            <div class="table-actions">
              <Button variant="ghost" size="sm" @click="sortTable(table.id)">
                <ArrowUpDown class="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" @click="exportTable(table.id)">
                <Download class="w-4 h-4" />
              </Button>
            </div>
          </div>

          <DataTable
            :data="table.data"
            :columns="table.columns"
            :sortable="true"
            :filterable="true"
          />
        </div>
      </div>

      <!-- 关键洞察卡片 -->
      <div v-if="chapter.keyInsights" class="chapter-insights">
        <h4 class="insights-section-title">本章关键洞察</h4>
        <div class="insights-grid">
          <Card
            v-for="insight in chapter.keyInsights"
            :key="insight.id"
            class="insight-card"
          >
            <CardContent class="insight-content">
              <div class="insight-icon">{{ insight.icon }}</div>
              <div class="insight-text">{{ insight.text }}</div>
              <div class="insight-confidence">
                可信度: {{ insight.confidence }}%
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>

    <!-- 章节导航 -->
    <div class="chapter-navigation-footer">
      <Button
        v-if="getPreviousChapter(chapter.id)"
        variant="outline"
        @click="navigateToChapter(getPreviousChapter(chapter.id))"
      >
        <ChevronLeft class="w-4 h-4 mr-2" />
        上一章
      </Button>

      <Button
        v-if="getNextChapter(chapter.id)"
        @click="navigateToChapter(getNextChapter(chapter.id))"
      >
        下一章
        <ChevronRight class="w-4 h-4 ml-2" />
      </Button>
    </div>
  </div>
</div>
```

### 页面交互逻辑

```typescript
// ReportDetail 页面状态管理
interface ReportDetailState {
  report: Report | null
  activeChapter: string
  completedChapters: string[]
  readingProgress: number
  expandedVisualizations: string[]
  loading: boolean
  error: string | null
}

// 页面交互方法
const reportDetailActions = {
  // 章节导航
  scrollToChapter(chapterId: string) {
    const element = document.getElementById(`chapter-${chapterId}`)
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
      state.activeChapter = chapterId
    }
  },

  // 阅读进度跟踪
  onChapterVisible(entries: IntersectionObserverEntry[]) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const chapterId = entry.target.id.replace('chapter-', '')
        state.activeChapter = chapterId

        // 标记为已读
        if (!state.completedChapters.includes(chapterId)) {
          state.completedChapters.push(chapterId)
        }

        // 更新阅读进度
        state.readingProgress = Math.round(
          (state.completedChapters.length / state.report.chapters.length) * 100
        )
      }
    })
  },

  // 可视化交互
  handleVizInteraction(vizId: string, interaction: any) {
    // 处理图表交互事件
    switch (interaction.type) {
      case 'hover':
        showDataTooltip(interaction.data)
        break
      case 'click':
        drillDownData(vizId, interaction.data)
        break
      case 'select':
        highlightRelatedData(interaction.selection)
        break
    }
  },

  // 报告操作
  async shareReport() {
    const shareData = {
      title: state.report.title,
      text: `查看我的聊天分析报告：${state.report.title}`,
      url: window.location.href
    }

    if (navigator.share) {
      await navigator.share(shareData)
    } else {
      await navigator.clipboard.writeText(shareData.url)
      showSuccessToast('链接已复制到剪贴板')
    }
  },

  async exportReport(format: 'pdf' | 'markdown' | 'json' = 'pdf') {
    try {
      const result = await reportService.exportReport(state.report.id, format)
      if (result.success) {
        // 触发下载
        const link = document.createElement('a')
        link.href = result.downloadUrl
        link.download = `${state.report.title}.${format}`
        link.click()

        showSuccessToast('报告导出成功')
      }
    } catch (error) {
      handleError('导出报告失败', error)
    }
  }
}
```

## ⚙️ CustomReport 页面设计

### 页面职责与目标

- **核心目标**: 引导用户轻松创建个性化分析报告
- **用户场景**: 特定时间段分析、特定联系人分析、主题深度分析
- **成功指标**: 报告生成成功率>90%，用户满意度>4.5分

### 页面布局与功能区域

```
CustomReport 布局结构:
┌─────────────────────────────────────────────────────────────┐
│  🎯 页面标题 + 进度指示器                                    │
│  └── 步骤: 1.选择范围 → 2.配置分析 → 3.预览生成              │
├─────────────────────────────────────────────────────────────┤
│  📋 表单区域 (分步骤)                                        │
│  │                                                         │
│  ├── 步骤1: 数据范围选择                                     │
│  │   ├── 时间范围选择器 (日历组件)                           │
│  │   ├── 分析对象选择 (联系人/群聊列表)                      │
│  │   └── 数据预览 (消息数量、时间分布)                       │
│  │                                                         │
│  ├── 步骤2: 分析配置                                        │
│  │   ├── 分析维度选择 (多选框)                               │
│  │   ├── 详细程度设置 (滑块)                                │
│  │   └── 特殊选项 (情绪分析、话题提取等)                     │
│  │                                                         │
│  └── 步骤3: 预览与生成                                      │
│      ├── 配置摘要展示                                       │
│      ├── 预估生成时间和成本                                 │
│      └── 生成按钮 + 进度显示                                │
├─────────────────────────────────────────────────────────────┤
│  📊 实时预览区域 (右侧边栏)                                  │
│  ├── 数据范围可视化                                         │
│  ├── 选择统计信息                                           │
│  └── 配置预览                                               │
└─────────────────────────────────────────────────────────────┘
```

这套完整的页面架构设计将确保 EchoSoul 在每个页面都提供卓越的用户体验，从初始化的引导式体验到报告详情的沉浸式阅读，再到自定义报告的智能化配置，每个环节都经过精心设计，体现了产品"每天了解真实的自己"的核心价值。
