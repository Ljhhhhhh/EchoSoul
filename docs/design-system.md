# EchoSoul 高级设计系统 - 超一流UI/UX设计提示词

## 🎯 设计哲学与品牌定位

### 核心设计理念

**"内省之美，洞察之光"** - 通过精致的设计语言，将复杂的数据分析转化为温暖的自我发现之旅

#### 设计价值观

- **内省性**：设计应引导用户向内探索，而非向外炫耀
- **洞察力**：通过视觉层次和信息架构，让复杂数据变得清晰易懂
- **成长感**：每次交互都应传达积极的自我提升价值
- **信任感**：通过专业而温暖的设计建立用户对隐私保护的信心

#### 情感调性矩阵

```
专业 ←→ 温暖    (70% 专业, 30% 温暖)
简约 ←→ 丰富    (80% 简约, 20% 丰富)
静谧 ←→ 活跃    (75% 静谧, 25% 活跃)
理性 ←→ 感性    (65% 理性, 35% 感性)
```

## 🎨 高级色彩系统

### 主色调 - "内省蓝"

```css
/* 主色 - 深度思考的蓝色 */
--primary-50: #f0f7ff; /* 最浅背景 */
--primary-100: #e0efff; /* 浅色背景 */
--primary-200: #bae0ff; /* 次要元素 */
--primary-300: #7cc7ff; /* 辅助色 */
--primary-400: #36a9ff; /* 交互色 */
--primary-500: #0084ff; /* 主品牌色 */
--primary-600: #0066cc; /* 深色主色 */
--primary-700: #004d99; /* 更深主色 */
--primary-800: #003366; /* 深色背景 */
--primary-900: #001a33; /* 最深色 */
```

### 辅助色调 - "洞察紫"

```css
/* 辅助色 - 智慧与洞察的紫色 */
--secondary-50: #f7f3ff;
--secondary-100: #ede9fe;
--secondary-200: #ddd6fe;
--secondary-300: #c4b5fd;
--secondary-400: #a78bfa;
--secondary-500: #8b5cf6; /* 主辅助色 */
--secondary-600: #7c3aed;
--secondary-700: #6d28d9;
--secondary-800: #5b21b6;
--secondary-900: #4c1d95;
```

### 功能色彩

```css
/* 成功 - 成长绿 */
--success: #10b981;
--success-light: #d1fae5;
--success-dark: #047857;

/* 警告 - 温暖橙 */
--warning: #f59e0b;
--warning-light: #fef3c7;
--warning-dark: #d97706;

/* 错误 - 柔和红 */
--error: #ef4444;
--error-light: #fee2e2;
--error-dark: #dc2626;

/* 信息 - 天空蓝 */
--info: #06b6d4;
--info-light: #cffafe;
--info-dark: #0891b2;
```

### 中性色系 - "思考灰"

```css
/* 高级灰色系统 */
--neutral-50: #fafafa; /* 最浅背景 */
--neutral-100: #f5f5f5; /* 浅色背景 */
--neutral-200: #e5e5e5; /* 边框色 */
--neutral-300: #d4d4d4; /* 分割线 */
--neutral-400: #a3a3a3; /* 占位符 */
--neutral-500: #737373; /* 次要文字 */
--neutral-600: #525252; /* 主要文字 */
--neutral-700: #404040; /* 标题文字 */
--neutral-800: #262626; /* 深色文字 */
--neutral-900: #171717; /* 最深文字 */
```

## ✍️ 高级排版系统

### 字体选择策略

```css
/* 主字体 - 现代无衬线 */
font-family:
  'Inter',
  'SF Pro Display',
  -apple-system,
  BlinkMacSystemFont,
  'Segoe UI',
  'PingFang SC',
  'Hiragino Sans GB',
  'Microsoft YaHei',
  sans-serif;

/* 数据字体 - 等宽字体 */
font-family-mono: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Source Code Pro', monospace;
```

### 字号层级系统

```css
/* 标题层级 */
--text-xs: 0.75rem; /* 12px - 标签、说明 */
--text-sm: 0.875rem; /* 14px - 次要文字 */
--text-base: 1rem; /* 16px - 正文 */
--text-lg: 1.125rem; /* 18px - 重要文字 */
--text-xl: 1.25rem; /* 20px - 小标题 */
--text-2xl: 1.5rem; /* 24px - 中标题 */
--text-3xl: 1.875rem; /* 30px - 大标题 */
--text-4xl: 2.25rem; /* 36px - 主标题 */
--text-5xl: 3rem; /* 48px - 超大标题 */
```

### 行高与间距

```css
/* 行高系统 */
--leading-tight: 1.25; /* 紧密行高 - 标题 */
--leading-normal: 1.5; /* 正常行高 - 正文 */
--leading-relaxed: 1.625; /* 宽松行高 - 长文本 */

/* 间距系统 */
--spacing-xs: 0.25rem; /* 4px */
--spacing-sm: 0.5rem; /* 8px */
--spacing-md: 1rem; /* 16px */
--spacing-lg: 1.5rem; /* 24px */
--spacing-xl: 2rem; /* 32px */
--spacing-2xl: 3rem; /* 48px */
--spacing-3xl: 4rem; /* 64px */
```

## 🧩 核心组件设计规范

### 卡片组件 - 信息容器

```css
/* 基础卡片样式 */
.card-base {
  background: white;
  border-radius: 12px;
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.1),
    0 1px 2px rgba(0, 0, 0, 0.06);
  border: 1px solid var(--neutral-200);
  transition: all 0.2s ease;
}

/* 悬停效果 */
.card-hover:hover {
  box-shadow:
    0 4px 6px rgba(0, 0, 0, 0.07),
    0 2px 4px rgba(0, 0, 0, 0.06);
  transform: translateY(-1px);
}

/* 报告卡片特殊样式 */
.report-card {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-left: 4px solid var(--primary-500);
}
```

### 按钮系统 - 交互元素

```css
/* 主要按钮 */
.btn-primary {
  background: var(--primary-500);
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 132, 255, 0.2);
}

.btn-primary:hover {
  background: var(--primary-600);
  box-shadow: 0 4px 8px rgba(0, 132, 255, 0.3);
  transform: translateY(-1px);
}

/* 次要按钮 */
.btn-secondary {
  background: var(--neutral-100);
  color: var(--neutral-700);
  border: 1px solid var(--neutral-300);
}

/* 幽灵按钮 */
.btn-ghost {
  background: transparent;
  color: var(--primary-500);
  border: 1px solid var(--primary-200);
}
```

### 数据可视化组件

```css
/* 进度条样式 */
.progress-bar {
  height: 8px;
  background: var(--neutral-200);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary-400), var(--primary-500));
  border-radius: 4px;
  transition: width 0.8s ease;
}

/* 统计卡片 */
.stat-card {
  text-align: center;
  padding: 24px;
  background: white;
  border-radius: 12px;
  border: 1px solid var(--neutral-200);
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--primary-600);
  line-height: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--neutral-500);
  margin-top: 8px;
}
```

## 📊 数据可视化设计原则

### 图表色彩策略

```css
/* 数据可视化色板 */
--chart-primary: var(--primary-500);
--chart-secondary: var(--secondary-500);
--chart-accent-1: #10b981; /* 绿色 */
--chart-accent-2: #f59e0b; /* 橙色 */
--chart-accent-3: #ef4444; /* 红色 */
--chart-accent-4: #06b6d4; /* 青色 */
--chart-accent-5: #8b5cf6; /* 紫色 */

/* 渐变色 */
--gradient-primary: linear-gradient(135deg, var(--primary-400), var(--primary-600));
--gradient-success: linear-gradient(135deg, #34d399, #10b981);
--gradient-warning: linear-gradient(135deg, #fbbf24, #f59e0b);
```

### 图表设计规范

- **圆角设计**：所有图表元素使用 4px 圆角
- **阴影效果**：使用微妙的阴影增加层次感
- **动画过渡**：数据变化使用 0.6s 缓动动画
- **交互反馈**：悬停时显示详细数据提示
- **响应式**：图表在不同屏幕尺寸下自适应

## 🎭 微交互设计

### 加载状态

```css
/* 骨架屏动画 */
@keyframes shimmer {
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
}

.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200px 100%;
  animation: shimmer 1.5s infinite;
}

/* 脉冲动画 */
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

### 状态反馈

```css
/* 成功状态 */
.success-feedback {
  background: var(--success-light);
  color: var(--success-dark);
  border: 1px solid var(--success);
  animation: slideInRight 0.3s ease;
}

/* 错误状态 */
.error-feedback {
  background: var(--error-light);
  color: var(--error-dark);
  border: 1px solid var(--error);
  animation: shake 0.5s ease;
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes shake {
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
```

## 🌙 深色模式设计

### 深色主题色彩

```css
[data-theme='dark'] {
  --background: #0f172a;
  --foreground: #f8fafc;
  --card: #1e293b;
  --card-foreground: #f8fafc;
  --primary: #3b82f6;
  --primary-foreground: #f8fafc;
  --secondary: #475569;
  --secondary-foreground: #f8fafc;
  --muted: #1e293b;
  --muted-foreground: #94a3b8;
  --accent: #1e293b;
  --accent-foreground: #f8fafc;
  --destructive: #ef4444;
  --destructive-foreground: #f8fafc;
  --border: #334155;
  --input: #334155;
  --ring: #3b82f6;
}
```

## 📱 响应式设计策略

### 断点系统

```css
/* 移动设备优先的断点 */
--breakpoint-sm: 640px; /* 小屏幕 */
--breakpoint-md: 768px; /* 平板 */
--breakpoint-lg: 1024px; /* 桌面 */
--breakpoint-xl: 1280px; /* 大桌面 */
--breakpoint-2xl: 1536px; /* 超大屏幕 */
```

### 自适应布局

- **移动端**：单列布局，重点突出核心功能
- **平板端**：双列布局，侧边栏可折叠
- **桌面端**：三列布局，充分利用屏幕空间
- **大屏端**：固定最大宽度，居中显示

## ♿ 可访问性设计

### 对比度标准

- **正文文字**：至少 4.5:1 对比度
- **大文字**：至少 3:1 对比度
- **交互元素**：至少 3:1 对比度
- **图标元素**：至少 3:1 对比度

### 键盘导航

- 所有交互元素支持 Tab 键导航
- 焦点状态清晰可见
- 支持 Enter 和 Space 键激活
- 提供跳过链接功能

### 屏幕阅读器支持

- 使用语义化 HTML 标签
- 提供 alt 文本和 aria-label
- 使用 role 属性增强语义
- 提供状态变化的语音反馈

## 🎨 设计资产规范

### 图标设计原则

- **风格**：线性图标，2px 描边
- **尺寸**：16px, 20px, 24px, 32px
- **圆角**：2px 圆角
- **色彩**：使用主题色彩变量

### 插画风格

- **风格**：简约几何风格
- **色彩**：使用品牌色彩系统
- **主题**：内省、成长、洞察
- **应用**：空状态、引导页面、错误页面

## 🚀 高级实现指南

### Vue 3 + Tailwind CSS 实现策略

#### 1. 设计令牌系统

```javascript
// tailwind.config.js 扩展配置
module.exports = {
  theme: {
    extend: {
      colors: {
        // 主色系
        primary: {
          50: '#f0f7ff',
          100: '#e0efff',
          200: '#bae0ff',
          300: '#7cc7ff',
          400: '#36a9ff',
          500: '#0084ff',
          600: '#0066cc',
          700: '#004d99',
          800: '#003366',
          900: '#001a33'
        },
        // 辅助色系
        secondary: {
          50: '#f7f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95'
        },
        // 中性色系
        neutral: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717'
        }
      },
      fontFamily: {
        sans: ['Inter', 'SF Pro Display', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['SF Mono', 'Monaco', 'Inconsolata', 'monospace']
      },
      spacing: {
        18: '4.5rem',
        88: '22rem'
      },
      borderRadius: {
        xl: '12px',
        '2xl': '16px'
      },
      boxShadow: {
        soft: '0 2px 8px rgba(0, 0, 0, 0.06)',
        medium: '0 4px 16px rgba(0, 0, 0, 0.08)',
        strong: '0 8px 32px rgba(0, 0, 0, 0.12)'
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        }
      }
    }
  }
}
```

#### 2. Vue 组件设计模式

```vue
<!-- 高级报告卡片组件 -->
<template>
  <div class="report-card group">
    <div class="report-header">
      <div class="flex items-center justify-between">
        <h3 class="report-title">{{ title }}</h3>
        <div class="report-date">{{ formatDate(date) }}</div>
      </div>
      <div class="report-summary">{{ summary }}</div>
    </div>

    <div class="report-content">
      <div class="stats-grid">
        <div v-for="stat in stats" :key="stat.key" class="stat-item">
          <div class="stat-value">{{ stat.value }}</div>
          <div class="stat-label">{{ stat.label }}</div>
          <div class="stat-trend" :class="getTrendClass(stat.trend)">
            {{ stat.trend }}
          </div>
        </div>
      </div>

      <div class="insights-section">
        <h4 class="insights-title">主要洞察</h4>
        <ul class="insights-list">
          <li v-for="insight in insights" :key="insight.id" class="insight-item">
            <div class="insight-icon">{{ insight.icon }}</div>
            <div class="insight-text">{{ insight.text }}</div>
          </li>
        </ul>
      </div>
    </div>

    <div class="report-actions">
      <button class="btn-secondary">查看详情</button>
      <button class="btn-ghost">导出报告</button>
    </div>
  </div>
</template>

<style scoped>
.report-card {
  @apply bg-white rounded-xl border border-neutral-200 p-6 transition-all duration-300;
  @apply hover:shadow-medium hover:-translate-y-1;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-left: 4px solid theme('colors.primary.500');
}

.report-header {
  @apply mb-6;
}

.report-title {
  @apply text-xl font-semibold text-neutral-800;
}

.report-date {
  @apply text-sm text-neutral-500;
}

.report-summary {
  @apply text-neutral-600 mt-2;
}

.stats-grid {
  @apply grid grid-cols-2 md:grid-cols-4 gap-4 mb-6;
}

.stat-item {
  @apply text-center p-4 bg-white rounded-lg border border-neutral-100;
}

.stat-value {
  @apply text-2xl font-bold text-primary-600;
}

.stat-label {
  @apply text-sm text-neutral-500 mt-1;
}

.stat-trend {
  @apply text-xs mt-1 font-medium;
}

.stat-trend.positive {
  @apply text-green-600;
}

.stat-trend.negative {
  @apply text-red-600;
}

.insights-section {
  @apply bg-neutral-50 rounded-lg p-4;
}

.insights-title {
  @apply font-medium text-neutral-700 mb-3;
}

.insights-list {
  @apply space-y-2;
}

.insight-item {
  @apply flex items-start space-x-3;
}

.insight-icon {
  @apply text-lg;
}

.insight-text {
  @apply text-sm text-neutral-600 flex-1;
}

.report-actions {
  @apply flex justify-end space-x-3 mt-6 pt-4 border-t border-neutral-100;
}
</style>
```

#### 3. 数据可视化组件

```vue
<!-- 情绪趋势图表组件 -->
<template>
  <div class="emotion-chart">
    <div class="chart-header">
      <h4 class="chart-title">情绪趋势分析</h4>
      <div class="chart-legend">
        <div class="legend-item">
          <div class="legend-color bg-primary-500"></div>
          <span>积极情绪</span>
        </div>
        <div class="legend-item">
          <div class="legend-color bg-secondary-500"></div>
          <span>消极情绪</span>
        </div>
      </div>
    </div>

    <div class="chart-container">
      <svg class="chart-svg" :viewBox="`0 0 ${width} ${height}`">
        <!-- 网格线 -->
        <g class="grid-lines">
          <line
            v-for="i in 5"
            :key="`h-${i}`"
            :x1="0"
            :y1="(i * height) / 5"
            :x2="width"
            :y2="(i * height) / 5"
            class="grid-line"
          />
          <line
            v-for="i in 7"
            :key="`v-${i}`"
            :x1="(i * width) / 7"
            :y1="0"
            :x2="(i * width) / 7"
            :y2="height"
            class="grid-line"
          />
        </g>

        <!-- 数据线 -->
        <path :d="positivePath" class="emotion-line positive" />
        <path :d="negativePath" class="emotion-line negative" />

        <!-- 数据点 -->
        <circle
          v-for="(point, index) in positivePoints"
          :key="`pos-${index}`"
          :cx="point.x"
          :cy="point.y"
          r="4"
          class="data-point positive"
        />
        <circle
          v-for="(point, index) in negativePoints"
          :key="`neg-${index}`"
          :cx="point.x"
          :cy="point.y"
          r="4"
          class="data-point negative"
        />
      </svg>
    </div>

    <div class="chart-footer">
      <div class="time-labels">
        <span v-for="label in timeLabels" :key="label" class="time-label">
          {{ label }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.emotion-chart {
  @apply bg-white rounded-xl border border-neutral-200 p-6;
}

.chart-header {
  @apply flex justify-between items-center mb-4;
}

.chart-title {
  @apply text-lg font-semibold text-neutral-800;
}

.chart-legend {
  @apply flex space-x-4;
}

.legend-item {
  @apply flex items-center space-x-2 text-sm text-neutral-600;
}

.legend-color {
  @apply w-3 h-3 rounded-full;
}

.chart-container {
  @apply relative h-64 mb-4;
}

.chart-svg {
  @apply w-full h-full;
}

.grid-line {
  @apply stroke-neutral-200 stroke-1;
}

.emotion-line {
  @apply fill-none stroke-2;
}

.emotion-line.positive {
  @apply stroke-primary-500;
}

.emotion-line.negative {
  @apply stroke-secondary-500;
}

.data-point {
  @apply fill-white stroke-2 cursor-pointer transition-all duration-200;
}

.data-point:hover {
  @apply r-6;
}

.data-point.positive {
  @apply stroke-primary-500;
}

.data-point.negative {
  @apply stroke-secondary-500;
}

.chart-footer {
  @apply border-t border-neutral-100 pt-4;
}

.time-labels {
  @apply flex justify-between text-sm text-neutral-500;
}
</style>
```

## 🎨 高级动效设计

### 页面转场动画

```css
/* 路由转场动画 */
.page-enter-active,
.page-leave-active {
  transition: all 0.3s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.page-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* 模态框动画 */
.modal-enter-active {
  transition: all 0.3s ease;
}

.modal-leave-active {
  transition: all 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

/* 列表项动画 */
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.list-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.list-move {
  transition: transform 0.3s ease;
}
```

### 微交互动效

```css
/* 按钮点击反馈 */
.btn-feedback {
  position: relative;
  overflow: hidden;
}

.btn-feedback::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition:
    width 0.3s ease,
    height 0.3s ease;
}

.btn-feedback:active::before {
  width: 200px;
  height: 200px;
}

/* 卡片悬停效果 */
.card-interactive {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-interactive:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
}

/* 数据加载动画 */
@keyframes dataLoad {
  0% {
    width: 0%;
  }
  50% {
    width: 70%;
  }
  100% {
    width: 100%;
  }
}

.data-loading {
  animation: dataLoad 1.5s ease-in-out;
}
```

## 📐 布局设计原则

### 网格系统

```css
/* 12列网格系统 */
.grid-container {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

/* 响应式网格 */
@media (max-width: 768px) {
  .grid-container {
    grid-template-columns: 1fr;
    gap: 16px;
    padding: 0 16px;
  }
}

/* 常用布局类 */
.col-1 {
  grid-column: span 1;
}
.col-2 {
  grid-column: span 2;
}
.col-3 {
  grid-column: span 3;
}
.col-4 {
  grid-column: span 4;
}
.col-6 {
  grid-column: span 6;
}
.col-8 {
  grid-column: span 8;
}
.col-12 {
  grid-column: span 12;
}
```

### 黄金比例应用

```css
/* 基于黄金比例的间距系统 */
:root {
  --golden-ratio: 1.618;
  --space-unit: 16px;

  --space-xs: calc(var(--space-unit) / var(--golden-ratio) / var(--golden-ratio)); /* ~6px */
  --space-sm: calc(var(--space-unit) / var(--golden-ratio)); /* ~10px */
  --space-md: var(--space-unit); /* 16px */
  --space-lg: calc(var(--space-unit) * var(--golden-ratio)); /* ~26px */
  --space-xl: calc(var(--space-unit) * var(--golden-ratio) * var(--golden-ratio)); /* ~42px */
}
```

## 🔧 性能优化设计

### CSS 优化策略

```css
/* 使用 CSS 变量减少重复 */
:root {
  --transition-fast: 0.15s ease;
  --transition-normal: 0.3s ease;
  --transition-slow: 0.5s ease;

  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
}

/* 硬件加速 */
.gpu-accelerated {
  transform: translateZ(0);
  will-change: transform;
}

/* 避免重排重绘 */
.optimized-animation {
  transform: translateX(0);
  opacity: 1;
  transition:
    transform var(--transition-normal),
    opacity var(--transition-normal);
}
```

### 图片优化

```css
/* 响应式图片 */
.responsive-image {
  width: 100%;
  height: auto;
  object-fit: cover;
  border-radius: 8px;
}

/* 图片懒加载占位 */
.image-placeholder {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200px 100%;
  animation: shimmer 1.5s infinite;
}
```

## 🌍 国际化设计考虑

### 多语言布局适配

```css
/* RTL 语言支持 */
[dir='rtl'] .text-align-start {
  text-align: right;
}

[dir='ltr'] .text-align-start {
  text-align: left;
}

/* 可变宽度文本容器 */
.flexible-text {
  min-width: 0;
  word-wrap: break-word;
  hyphens: auto;
}

/* 不同语言的字体优化 */
:lang(zh) {
  font-family: 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
}

:lang(ja) {
  font-family: 'Hiragino Kaku Gothic ProN', 'Yu Gothic', sans-serif;
}

:lang(ko) {
  font-family: 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif;
}
```

这套完整的设计系统将帮助 EchoSoul 建立独特的品牌识别，提供卓越的用户体验，并确保产品在功能性和美学上都达到超一流水准。通过系统化的设计方法和现代化的技术实现，EchoSoul 将成为同类产品中的设计标杆。
