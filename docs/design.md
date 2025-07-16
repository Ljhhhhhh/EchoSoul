# EchoSoul 设计系统规范

**版本**: v1.0  
**最后更新**: 2025-07-16  
**设计师**: EchoSoul Design Team

---

## 🎨 设计哲学与原则

### 核心设计理念

**"深邃而温暖的智慧之美"** - 将深海的神秘智慧与紫罗兰的优雅洞察相结合，创造既有科技感又有艺术感的视觉体验

### 设计原则

1. **美观至上** - 创造令人印象深刻的视觉体验
2. **专业信任** - 通过精致的设计语言建立用户信任
3. **智慧洞察** - 让复杂的数据分析变得直观优雅
4. **温暖人文** - 在深邃的科技感中融入温暖关怀
5. **现代精致** - 符合高品质审美的现代设计

### 品牌性格升级

- **深邃专业** - 如深海般的专业深度和可信赖感
- **优雅智慧** - 如紫罗兰般的优雅洞察和高级感
- **温暖亲和** - 温润的中性色调带来舒适体验
- **现代美学** - 符合当代审美的精致设计

---

---

## 📝 排版系统

### 字体选择

```css
/* 中文字体 */
font-family:
  'Noto Sans CJK SC', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'WenQuanYi Micro Hei',
  sans-serif;

/* 英文字体 */
font-family: 'Roboto', 'Helvetica Neue', Arial, sans-serif;

/* 等宽字体(数据展示) */
font-family: 'Roboto Mono', 'SF Mono', 'Monaco', 'Consolas', monospace;
```

### 字体层级系统

```css
/* Display - 展示级标题 */
.display-large {
  font-size: 57px;
  line-height: 64px;
  font-weight: 400;
}
.display-medium {
  font-size: 45px;
  line-height: 52px;
  font-weight: 400;
}
.display-small {
  font-size: 36px;
  line-height: 44px;
  font-weight: 400;
}

/* Headline - 页面标题 */
.headline-large {
  font-size: 32px;
  line-height: 40px;
  font-weight: 500;
}
.headline-medium {
  font-size: 28px;
  line-height: 36px;
  font-weight: 500;
}
.headline-small {
  font-size: 24px;
  line-height: 32px;
  font-weight: 500;
}

/* Title - 组件标题 */
.title-large {
  font-size: 22px;
  line-height: 28px;
  font-weight: 500;
}
.title-medium {
  font-size: 16px;
  line-height: 24px;
  font-weight: 600;
}
.title-small {
  font-size: 14px;
  line-height: 20px;
  font-weight: 600;
}

/* Body - 正文内容 */
.body-large {
  font-size: 16px;
  line-height: 24px;
  font-weight: 400;
}
.body-medium {
  font-size: 14px;
  line-height: 20px;
  font-weight: 400;
}
.body-small {
  font-size: 12px;
  line-height: 16px;
  font-weight: 400;
}

/* Label - 标签文字 */
.label-large {
  font-size: 14px;
  line-height: 20px;
  font-weight: 500;
}
.label-medium {
  font-size: 12px;
  line-height: 16px;
  font-weight: 500;
}
.label-small {
  font-size: 11px;
  line-height: 16px;
  font-weight: 500;
}
```

---

## 📐 间距与布局系统

### 间距规范 (基于8px网格)

```css
--spacing-1: 4px; /* 极小间距 */
--spacing-2: 8px; /* 小间距 */
--spacing-3: 12px; /* 中小间距 */
--spacing-4: 16px; /* 中等间距 */
--spacing-5: 20px; /* 中大间距 */
--spacing-6: 24px; /* 大间距 */
--spacing-8: 32px; /* 超大间距 */
--spacing-12: 48px; /* 页面级间距 */
--spacing-16: 64px; /* 区块级间距 */
```

### 圆角系统

```css
--radius-xs: 4px; /* 小元素 */
--radius-sm: 8px; /* 按钮、标签 */
--radius-md: 12px; /* 卡片 */
--radius-lg: 16px; /* 大卡片 */
--radius-xl: 24px; /* 模态框 */
--radius-full: 9999px; /* 圆形元素 */
```

### 阴影系统

```css
--elevation-1: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
--elevation-2: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
--elevation-3: 0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23);
--elevation-4: 0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22);
--elevation-5: 0 19px 38px rgba(0, 0, 0, 0.3), 0 15px 12px rgba(0, 0, 0, 0.22);
```

---

## 🧩 核心组件设计规范

### 1. 报告卡片组件

```yaml
设计规范:
  尺寸: 最小宽度320px，高度自适应
  圆角: 12px
  阴影: elevation-2，悬停时elevation-4
  内边距: 24px

结构设计:
  头部区域:
    - 报告标题 (title-large)
    - 生成时间 (body-small, 次要色)
    - 状态标识 (彩色圆点 + 文字)

  内容区域:
    - 关键指标卡片网格
    - 数据可视化图表
    - 核心洞察文字

  操作区域:
    - 主要操作按钮 (查看详情)
    - 次要操作 (分享、导出)

交互状态:
  默认: elevation-2
  悬停: elevation-4 + transform: translateY(-2px)
  激活: elevation-1 + 轻微缩放
```

### 2. 数据可视化组件

```yaml
圆形进度条:
  颜色: 主色渐变 (primary-400 to primary-600)
  粗细: 8px
  动画: 2秒缓动进入
  中心文字: 大号数字 + 小号单位

柱状图:
  颜色: 辅助色系渐变
  圆角: 顶部4px圆角
  间距: 8px
  悬停: 高亮 + 数值提示

趋势线图:
  线条: 2px粗细，主色
  节点: 6px圆点，白色边框
  网格: 浅灰色虚线
  动画: 路径绘制动画
```

### 3. 导航系统

```yaml
顶部导航:
  高度: 64px
  背景: surface色 + elevation-1
  内容: Logo + 标题 + 用户操作区

侧边导航:
  宽度: 280px (展开) / 72px (收起)
  背景: surface色
  项目高度: 48px
  图标: 24px Material Icons

面包屑:
  分隔符: Material chevron_right图标
  颜色: 当前页面用主色，其他用次要色
  悬停: 下划线效果
```

---

## 📱 页面布局设计

### 1. 初始化页面

```yaml
布局结构:
  背景: 内省蓝到洞察紫的渐变
  主容器: 居中卡片，最大宽度600px

视觉元素:
  顶部: EchoSoul Logo + 欢迎标语
  中部: Material Stepper + 当前步骤内容
  底部: 操作按钮组

设计特色:
  - 渐变背景营造科技感
  - 白色卡片形成视觉焦点
  - 步骤指示器清晰展示进度
  - 微动效增强交互体验
```

### 2. 报告中心页面

```yaml
布局结构:
  顶部: 欢迎横幅 + 快速统计面板
  中部: 今日报告大卡片
  底部: 历史报告网格

交互设计:
  - 卡片悬停上浮效果
  - 无限滚动加载
  - 搜索实时过滤
  - 快速操作浮动按钮
```

### 3. 报告详情页面

```yaml
布局结构:
  左侧: 章节导航 (280px固定宽度)
  右侧: 报告内容区域 (自适应宽度)

导航设计:
  - 阅读进度条
  - 章节列表 + 当前位置高亮
  - 阅读时间估算

内容设计:
  - 优化的行高和字间距
  - 图文混排布局
  - 数据可视化嵌入
  - 章节间平滑滚动
```

---

## ⚡ 动效与交互设计

### 动效时长规范

```css
/* 快速交互 */
--duration-fast: 150ms;

/* 中等交互 */
--duration-medium: 300ms;

/* 慢速交互 */
--duration-slow: 500ms;

/* 缓动函数 */
--easing-standard: cubic-bezier(0.4, 0, 0.2, 1);
--easing-decelerate: cubic-bezier(0, 0, 0.2, 1);
--easing-accelerate: cubic-bezier(0.4, 0, 1, 1);
```

### 核心动效设计

1. **页面转场**: Shared Element Transition
2. **卡片交互**: 悬停上浮 + 阴影变化
3. **按钮反馈**: Material Ripple Effect
4. **数据更新**: 数字滚动 + 图表渐变
5. **加载状态**: 骨架屏 + 进度指示

---

## 🚀 实施建议

### 第一阶段：设计系统建立 (1-2周)

1. 更新Tailwind配置，集成色彩系统
2. 建立组件库基础架构
3. 实现核心UI组件

### 第二阶段：页面重构 (2-3周)

1. 重新设计初始化页面
2. 优化报告中心布局
3. 完善报告详情体验

### 第三阶段：交互优化 (1-2周)

1. 添加动效和微交互
2. 优化响应式体验
3. 完善无障碍支持

---

## 🎯 详细组件规范

### 按钮组件

```yaml
主要按钮 (Primary Button):
  背景: primary-500
  文字: white
  圆角: 8px
  高度: 40px
  内边距: 16px 24px
  悬停: primary-600 + elevation-2

次要按钮 (Secondary Button):
  背景: transparent
  边框: 1px solid primary-500
  文字: primary-500
  悬停: primary-50背景

文字按钮 (Text Button):
  背景: transparent
  文字: primary-500
  悬停: primary-50背景 + 8px圆角
```

### 输入框组件

```yaml
文本输入框:
  边框: 1px solid outline
  圆角: 8px
  高度: 48px
  内边距: 12px 16px
  聚焦: primary-500边框 + elevation-1

标签位置: 输入框上方，8px间距
错误状态: error色边框 + 错误提示文字
成功状态: success色边框 + 成功图标
```

### 卡片组件变体

```yaml
基础卡片:
  背景: surface
  圆角: 12px
  阴影: elevation-2
  内边距: 24px

紧凑卡片:
  内边距: 16px
  圆角: 8px
  阴影: elevation-1

强调卡片:
  边框: 2px solid primary-500
  背景: primary-50
  阴影: elevation-3
```

---

## 📊 数据可视化设计指南

### 图表色彩方案

```css
/* 主数据系列 */
--chart-primary: linear-gradient(135deg, #2196f3, #1976d2);

/* 辅助数据系列 */
--chart-secondary: linear-gradient(135deg, #9c27b0, #7b1fa2);

/* 多系列色彩 */
--chart-series-1: #2196f3;
--chart-series-2: #9c27b0;
--chart-series-3: #4caf50;
--chart-series-4: #ff9800;
--chart-series-5: #f44336;
--chart-series-6: #00bcd4;
```

### 图表设计原则

1. **数据优先**: 减少装饰性元素，突出数据本身
2. **色彩一致**: 使用统一的色彩系统
3. **交互友好**: 支持悬停、点击、缩放等交互

### 具体图表规范

```yaml
柱状图:
  柱子宽度: 24px (桌面)
  柱子间距: 8px
  圆角: 顶部4px
  悬停效果: 高亮 + 数值标签

饼图:
  内圆半径: 40% (环形图)
  扇区间距: 2px
  标签线: 1px, 主色
  悬停效果: 扇区外移 + 高亮

折线图:
  线条粗细: 3px
  节点大小: 6px
  网格线: 1px虚线, outline色
  填充区域: 渐变透明度
```

---

## 🌙 深色模式设计

### 深色模式色彩系统

```css
.dark {
  /* 主色调整 */
  --primary-500: #64b5f6;
  --primary-600: #42a5f5;
  --primary-700: #2196f3;

  /* 背景色系 */
  --background: #121212;
  --surface: #1e1e1e;
  --surface-variant: #2d2d2d;

  /* 文字色系 */
  --on-background: #ffffff;
  --on-surface: #ffffff;
  --on-surface-variant: #cccccc;

  /* 边框色系 */
  --outline: #404040;
  --outline-variant: #2d2d2d;
}
```

### 深色模式设计原则

1. **降低亮度**: 避免纯白色，使用柔和的灰色
2. **保持对比**: 确保文字可读性
3. **色彩调整**: 主色使用更亮的变体
4. **阴影处理**: 使用更明显的阴影区分层次

---

## 🔤 图标系统

### 图标规范

```yaml
图标库: Material Design Icons
尺寸规格:
  - 16px: 小图标 (状态指示)
  - 20px: 中小图标 (按钮内)
  - 24px: 标准图标 (导航、操作)
  - 32px: 大图标 (功能入口)
  - 48px: 超大图标 (空状态)

样式规范:
  线条粗细: 2px
  圆角: 2px
  填充: 根据语义选择线性或填充
```

### 常用图标映射

```yaml
导航类:
  - 首页: home
  - 报告: assessment
  - 设置: settings
  - 历史: history

操作类:
  - 添加: add
  - 编辑: edit
  - 删除: delete
  - 分享: share
  - 下载: download

状态类:
  - 成功: check_circle
  - 警告: warning
  - 错误: error
  - 信息: info
```

---

## 📝 文案设计规范

### 语言风格

1. **简洁明了**: 用最少的文字表达完整意思
2. **温暖友好**: 避免冰冷的技术术语
3. **积极正面**: 使用鼓励性的表达方式
4. **一致性**: 保持术语和表达的统一

### 常用文案模板

```yaml
按钮文案:
  - 主要操作: "生成报告"、"查看详情"、"开始分析"
  - 次要操作: "取消"、"返回"、"稍后"
  - 危险操作: "确认删除"、"清空数据"

状态文案:
  - 加载中: "正在分析您的聊天记录..."
  - 成功: "报告生成完成！"
  - 失败: "生成失败，请重试"

空状态文案:
  - 无数据: "还没有聊天记录，快去聊天吧！"
  - 无报告: "暂无报告，生成第一份分析报告"
```

---

## 🎨 品牌元素设计

### Logo设计规范

```yaml
Logo构成:
  - 图标: 抽象的对话气泡 + 心形元素
  - 字体: 现代无衬线字体
  - 色彩: 内省蓝主色

使用规范:
  - 最小尺寸: 24px高度
  - 安全距离: Logo高度的1/2
  - 背景要求: 确保足够对比度
```

### 插画风格

```yaml
风格特征:
  - 扁平化设计
  - 圆润的线条
  - 温暖的色彩
  - 简洁的构图

应用场景:
  - 空状态插画
  - 功能引导图
  - 错误页面插画
  - 加载动画
```

---

**这套完整的设计系统将确保EchoSoul在视觉呈现、用户体验和品牌一致性方面达到国内一流水平，为用户提供专业、温暖、现代的产品体验。**
