# EchoSoul 设计系统使用指南

## 📋 概述

EchoSoul 设计系统基于 Material Design 3 规范，使用 Tailwind CSS + shadcn/vue 实现，提供了完整的设计令牌、组件库和工具函数。

## 📝 排版系统使用

### Material Design 字体层级

```vue
<template>
  <!-- Display 级别 - 用于大标题 -->
  <h1 class="text-display-large">Display Large</h1>
  <h2 class="text-display-medium">Display Medium</h2>

  <!-- Headline 级别 - 用于页面标题 -->
  <h3 class="text-headline-large">Headline Large</h3>
  <h4 class="text-headline-medium">Headline Medium</h4>

  <!-- Title 级别 - 用于组件标题 -->
  <h5 class="text-title-large">Title Large</h5>
  <h6 class="text-title-medium">Title Medium</h6>

  <!-- Body 级别 - 用于正文 -->
  <p class="text-body-large">Body Large</p>
  <p class="text-body-medium">Body Medium</p>

  <!-- Label 级别 - 用于标签 -->
  <span class="text-label-large">Label Large</span>
  <span class="text-label-medium">Label Medium</span>
</template>
```

## 🧩 组件使用

### 按钮组件

```vue
<template>
  <!-- 基础按钮 -->
  <Button variant="primary" size="md">主要按钮</Button>
  <Button variant="secondary" size="md">次要按钮</Button>
  <Button variant="text" size="md">文字按钮</Button>

  <!-- 带图标的按钮 -->
  <Button variant="primary" icon="plus" icon-position="left"> 添加项目 </Button>

  <!-- 加载状态按钮 -->
  <Button variant="primary" :loading="true"> 加载中... </Button>

  <!-- 不同尺寸 -->
  <Button variant="primary" size="sm">小按钮</Button>
  <Button variant="primary" size="md">中按钮</Button>
  <Button variant="primary" size="lg">大按钮</Button>
</template>

<script setup>
import Button from '@/components/design-system/Button.vue'
</script>
```

### 图标组件

```vue
<template>
  <!-- 基础图标 -->
  <Icon name="home" :size="24" />
  <Icon name="settings" :size="20" />

  <!-- 不同尺寸 -->
  <Icon name="user" size="sm" />
  <Icon name="user" size="md" />
  <Icon name="user" size="lg" />

  <!-- 带颜色的图标 -->
  <Icon name="check-circle" color="success" />
  <Icon name="alert-triangle" color="warning" />

  <!-- 动画图标 -->
  <Icon name="loader-2" class="animate-spin" />
</template>

<script setup>
import Icon from '@/components/design-system/Icon.vue'
</script>
```

## 📐 布局系统使用

### 间距系统

```vue
<template>
  <!-- 内边距 -->
  <div class="p-4">标准内边距</div>
  <div class="px-6 py-4">水平和垂直内边距</div>

  <!-- 外边距 -->
  <div class="m-4">标准外边距</div>
  <div class="mb-6">底部外边距</div>

  <!-- 间隙 -->
  <div class="flex gap-4">
    <div>项目1</div>
    <div>项目2</div>
  </div>
</template>
```

### 网格布局

```vue
<template>
  <!-- 响应式网格 -->
  <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
    <div class="p-6 card-elevated">卡片1</div>
    <div class="p-6 card-elevated">卡片2</div>
    <div class="p-6 card-elevated">卡片3</div>
  </div>
</template>
```

### Flexbox 布局

```vue
<template>
  <!-- 水平布局 -->
  <div class="flex items-center justify-between gap-4">
    <div>左侧内容</div>
    <div>右侧内容</div>
  </div>

  <!-- 垂直布局 -->
  <div class="flex flex-col gap-4">
    <div>顶部内容</div>
    <div>底部内容</div>
  </div>
</template>
```

## 🎯 卡片系统使用

### 卡片变体

```vue
<template>
  <!-- 浮起卡片 -->
  <div class="p-6 card-elevated">
    <h3 class="mb-4 text-title-large">卡片标题</h3>
    <p class="text-body-medium">卡片内容</p>
  </div>

  <!-- 边框卡片 -->
  <div class="p-6 card-outlined">
    <h3 class="mb-4 text-title-large">边框卡片</h3>
    <p class="text-body-medium">卡片内容</p>
  </div>

  <!-- 填充卡片 -->
  <div class="p-6 card-filled">
    <h3 class="mb-4 text-title-large">填充卡片</h3>
    <p class="text-body-medium">卡片内容</p>
  </div>
</template>
```

## ⚡ 动效使用

### 过渡动画

```vue
<template>
  <!-- 基础过渡 -->
  <div class="transition-all duration-medium ease-material-standard">悬停我看效果</div>

  <!-- 进入动画 -->
  <div class="animate-fade-in">淡入动画</div>
  <div class="animate-slide-up">滑入动画</div>
  <div class="animate-scale-in">缩放动画</div>
</template>
```

### 阴影系统

```vue
<template>
  <!-- 不同层级的阴影 -->
  <div class="p-4 elevation-1">层级1阴影</div>
  <div class="p-4 elevation-2">层级2阴影</div>
  <div class="p-4 elevation-3">层级3阴影</div>
  <div class="p-4 elevation-4">层级4阴影</div>
  <div class="p-4 elevation-5">层级5阴影</div>
</template>
```

## 🛠️ 工具函数使用

### 在 Vue 组件中使用

```vue
<script setup>
import { cn, getPrimaryColor, getSpacing, getElevation } from '@/utils/design-system'

// 合并类名
const buttonClasses = cn(
  'px-4 py-2 rounded-sm',
  getPrimaryColor('500'),
  getElevation('2'),
  'hover:' + getElevation('4')
)

```

## 🌙 深色模式使用

### 自动适配深色模式

```vue
<template>
  <!-- 自动适配的颜色 -->
  <div class="bg-background text-foreground">自动适配背景和文字颜色</div>

  <!-- 手动指定深色模式样式 -->
  <div class="text-black bg-white dark:bg-gray-900 dark:text-white">手动指定深色模式样式</div>
</template>
```

## 🎨 自定义主题

### 修改 CSS 变量

```css
:root {
  /* 自定义主色 */
  --primary-500: 220 100% 50%;

  /* 自定义圆角 */
  --radius: 16px;

  /* 自定义字体 */
  --font-family-sans: 'Custom Font', sans-serif;
}
```

## 📋 最佳实践

1. **一致性**: 始终使用设计系统提供的令牌和组件
2. **语义化**: 使用语义化的类名和组件名
3. **可访问性**: 确保足够的色彩对比度和键盘导航
4. **性能**: 合理使用动画，避免过度装饰

## 🔧 开发工具

### VS Code 扩展推荐

- Tailwind CSS IntelliSense
- Vue Language Features (Volar)
- PostCSS Language Support

### 调试技巧

- 使用浏览器开发者工具查看 CSS 变量
- 使用 Tailwind CSS 的 JIT 模式进行快速开发
- 利用设计令牌文件进行统一管理

这套设计系统将确保 EchoSoul 在视觉呈现和用户体验方面达到国内一流水平！
