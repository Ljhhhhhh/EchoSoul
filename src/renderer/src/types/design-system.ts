/**
 * EchoSoul Design System Types
 * 设计系统的TypeScript类型定义
 */

// 色彩系统类型 - 简化为基础颜色
export type PrimaryColorScale = 'DEFAULT' | 'foreground'

export type SecondaryColorScale = 'DEFAULT' | 'foreground'

export type NeutralColorScale =
  | '0'
  | '50'
  | '100'
  | '200'
  | '300'
  | '400'
  | '500'
  | '600'
  | '700'
  | '800'
  | '900'

export type SemanticColors = 'success' | 'warning' | 'error' | 'info'

// 间距系统类型
export type SpacingScale =
  | '0'
  | '1'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '8'
  | '10'
  | '12'
  | '16'
  | '20'
  | '24'
  | '32'

// 字体系统类型
export type FontSizeScale =
  | 'display-large'
  | 'display-medium'
  | 'display-small'
  | 'headline-large'
  | 'headline-medium'
  | 'headline-small'
  | 'title-large'
  | 'title-medium'
  | 'title-small'
  | 'body-large'
  | 'body-medium'
  | 'body-small'
  | 'label-large'
  | 'label-medium'
  | 'label-small'

export type FontWeight = 'regular' | 'medium' | 'semibold' | 'bold'

export type FontFamily = 'sans' | 'mono'

// 圆角系统类型
export type BorderRadiusScale = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'

// 阴影系统类型
export type ElevationScale = '1' | '2' | '3' | '4' | '5'

// 动画系统类型
export type AnimationDuration = 'instant' | 'fast' | 'medium' | 'slow' | 'slower'

export type AnimationEasing = 'linear' | 'standard' | 'decelerate' | 'accelerate' | 'bounce'

// 断点系统类型
export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

// 组件尺寸类型
export type ComponentSize = 'sm' | 'md' | 'lg'

// 按钮变体类型
export type ButtonVariant = 'primary' | 'secondary' | 'text' | 'outlined'

// 卡片变体类型
export type CardVariant = 'elevated' | 'outlined' | 'filled'

// 输入框变体类型
export type InputVariant = 'outlined' | 'filled'

// 状态类型
export type ComponentState = 'default' | 'hover' | 'active' | 'disabled' | 'focus'

// 设计令牌接口
export interface DesignTokens {
  colors: {
    primary: Record<PrimaryColorScale, string>
    secondary: Record<SecondaryColorScale, string>
    neutral: Record<NeutralColorScale, string>
    semantic: Record<SemanticColors, string>
  }
  spacing: Record<SpacingScale, string>
  typography: {
    fontSize: Record<FontSizeScale, string>
    fontWeight: Record<FontWeight, string>
    fontFamily: Record<FontFamily, string>
  }
  borderRadius: Record<BorderRadiusScale, string>
  elevation: Record<ElevationScale, string>
  animation: {
    duration: Record<AnimationDuration, string>
    easing: Record<AnimationEasing, string>
  }
  breakpoints: Record<Breakpoint, string>
}

// 主题配置接口
export interface ThemeConfig {
  mode: 'light' | 'dark'
  primaryColor: string
  secondaryColor: string
  borderRadius: BorderRadiusScale
  fontFamily: FontFamily
}

// 组件属性接口
export interface ComponentProps {
  size?: ComponentSize
  variant?: string
  disabled?: boolean
  loading?: boolean
  className?: string
}

// 按钮组件属性
export interface ButtonProps extends ComponentProps {
  variant?: ButtonVariant
  type?: 'button' | 'submit' | 'reset'
  onClick?: () => void
}

// 卡片组件属性
export interface CardProps extends ComponentProps {
  variant?: CardVariant
  elevation?: ElevationScale
  padding?: SpacingScale
}

// 输入框组件属性
export interface InputProps extends ComponentProps {
  variant?: InputVariant
  type?: 'text' | 'email' | 'password' | 'number'
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
}

// 图标组件属性
export interface IconProps {
  name: string
  size?: number | ComponentSize
  color?: string
  className?: string
}

// 布局组件属性
export interface LayoutProps {
  children?: string | number | boolean | object | null | undefined // Vue 3 slot content
  className?: string
  padding?: SpacingScale
  margin?: SpacingScale
}

// 响应式属性类型
export type ResponsiveValue<T> = T | Partial<Record<Breakpoint, T>>

// 工具函数类型
export type ClassNameFunction = (...classes: (string | undefined | null | false)[]) => string

export type ThemeFunction = (tokens: DesignTokens) => any

// 设计系统上下文类型
export interface DesignSystemContext {
  theme: ThemeConfig
  tokens: DesignTokens
  updateTheme: (config: Partial<ThemeConfig>) => void
}

// 导出常量
export const DESIGN_SYSTEM_VERSION = '1.0.0'

export const DEFAULT_THEME: ThemeConfig = {
  mode: 'light',
  primaryColor: 'hsl(207 90% 61%)',
  secondaryColor: 'hsl(294 72% 52%)',
  borderRadius: 'md',
  fontFamily: 'sans'
}

// CSS变量映射
export const CSS_VARIABLES = {
  // 主色系
  PRIMARY_50: '--echosoul-primary-50',
  PRIMARY_500: '--echosoul-primary-500',
  PRIMARY_700: '--echosoul-primary-700',

  // 辅助色系
  SECONDARY_500: '--echosoul-secondary-500',
  SECONDARY_700: '--echosoul-secondary-700',

  // 间距
  SPACE_4: '--echosoul-space-4',
  SPACE_6: '--echosoul-space-6',
  SPACE_8: '--echosoul-space-8',

  // 圆角
  RADIUS_MD: '--echosoul-radius-md',
  RADIUS_LG: '--echosoul-radius-lg',

  // 阴影
  ELEVATION_2: '--echosoul-shadow-elevation-2',
  ELEVATION_4: '--echosoul-shadow-elevation-4',

  // 动画
  DURATION_FAST: '--echosoul-duration-fast',
  DURATION_MEDIUM: '--echosoul-duration-medium',
  EASING_STANDARD: '--echosoul-easing-standard'
} as const

// 工具类型
export type CSSVariable = (typeof CSS_VARIABLES)[keyof typeof CSS_VARIABLES]
