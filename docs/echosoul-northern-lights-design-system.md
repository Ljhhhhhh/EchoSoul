# EchoSoul × Northern Lights 设计系统

## 🎨 设计理念融合

EchoSoul 的全新设计系统融合了 **Northern Lights 主题**的现代色彩科学与项目独有的**"深沉温暖的智慧之美"**设计哲学。

### 核心设计原则

1. **视觉美观优先** - 每个界面元素都追求精致美感
2. **现代色彩科学** - 使用 OKLCH 色彩空间，确保色彩感知的一致性
3. **温暖智慧** - 色彩传达专业、智能、温暖、现代的品牌个性
4. **无障碍设计** - 符合 WCAG 2.1 AA 标准

## 🌈 色彩系统

### 主色系 (Primary)

- **Light**: `oklch(0.6487 0.1538 150.3071)` - 智慧绿，象征成长与洞察
- **Dark**: `oklch(0.6487 0.1538 150.3071)` - 保持一致性

### 辅助色系 (Secondary)

- **Light**: `oklch(0.6746 0.1414 261.3380)` - 紫罗兰洞察，深邃而优雅
- **Dark**: `oklch(0.5880 0.0993 245.7394)` - 深色模式下的柔和紫调

### 强调色系 (Accent)

- **Light**: `oklch(0.8269 0.1080 211.9627)` - 天空蓝，清新而现代
- **Dark**: `oklch(0.6746 0.1414 261.3380)` - 深色模式下的紫罗兰

### 背景色系

- **Light**: `oklch(0.9824 0.0013 286.3757)` - 极简纯净白
- **Dark**: `oklch(0.2303 0.0125 264.2926)` - 深邃夜空蓝

### 数据可视化色彩

1. `oklch(0.6487 0.1538 150.3071)` - 智慧绿
2. `oklch(0.6746 0.1414 261.3380)` - 紫罗兰洞察
3. `oklch(0.8269 0.1080 211.9627)` - 天空蓝
4. `oklch(0.5880 0.0993 245.7394)` - 深紫调
5. `oklch(0.5905 0.1608 148.2409)` - 森林绿

## 🔤 字体系统

### 字体家族

- **Sans-serif**: Plus Jakarta Sans - 现代、友好、易读
- **Serif**: Source Serif 4 - 优雅、专业、适合长文本
- **Monospace**: JetBrains Mono - 清晰、技术感、代码显示

### 字体层级 (Material Design 3)

- **Display Large**: 57px/64px - 品牌标题
- **Headline Large**: 32px/40px - 页面主标题
- **Title Large**: 22px/28px - 卡片标题
- **Body Large**: 16px/24px - 主要正文
- **Label Medium**: 12px/16px - 辅助标签

## 🎭 阴影系统

使用精致的多层阴影，营造深度感：

- **Elevation 1**: `0 1px 3px 0px hsl(0 0% 0% / 0.1), 0 1px 2px -1px hsl(0 0% 0% / 0.1)`
- **Elevation 2**: `0 1px 3px 0px hsl(0 0% 0% / 0.1), 0 2px 4px -1px hsl(0 0% 0% / 0.1)`
- **Elevation 3**: `0 1px 3px 0px hsl(0 0% 0% / 0.1), 0 4px 6px -1px hsl(0 0% 0% / 0.1)`

## 🔄 圆角系统

- **Small**: `calc(0.5rem - 4px)` = 4px
- **Medium**: `calc(0.5rem - 2px)` = 6px
- **Large**: `0.5rem` = 8px
- **Extra Large**: `calc(0.5rem + 4px)` = 12px

## 📐 间距系统

基于 `0.25rem` (4px) 的倍数系统，确保视觉节奏的一致性。

## 🌙 深色模式

完整支持深色模式，所有色彩在深色环境下都经过精心调整，保持美观性和可读性。

## 🎯 应用指南

### 卡片设计

- 使用 `--color-card` 背景
- 应用 `--shadow-md` 阴影
- 圆角使用 `--radius-lg`

### 按钮设计

- 主要按钮使用 `--color-primary`
- 次要按钮使用 `--color-secondary`
- 强调按钮使用 `--color-accent`

### 导航设计

- 侧边栏使用 `--color-sidebar` 背景
- 活跃状态使用 `--color-sidebar-primary`
- 悬停状态使用 `--color-sidebar-accent`

---

_最后更新：2025-07-30_
_版本：EchoSoul × Northern Lights v1.0_
