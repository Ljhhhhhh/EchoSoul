/**
 * EchoSoul Design System Utilities
 * 设计系统工具函数
 */

import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type {
  PrimaryColorScale,
  SecondaryColorScale,
  SpacingScale,
  FontSizeScale,
  BorderRadiusScale,
  ElevationScale,
  ComponentSize,
  Breakpoint,
  ResponsiveValue
} from '../types/design-system'

/**
 * 合并 Tailwind CSS 类名
 * 基于 clsx 和 tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 获取主色系的 CSS 类名
 */
export function getPrimaryColor(scale: PrimaryColorScale = '500') {
  return `text-primary-${scale}` as const
}

/**
 * 获取主色系背景的 CSS 类名
 */
export function getPrimaryBg(scale: PrimaryColorScale = '500') {
  return `bg-primary-${scale}` as const
}

/**
 * 获取辅助色系的 CSS 类名
 */
export function getSecondaryColor(scale: SecondaryColorScale = '700') {
  return `text-secondary-${scale}` as const
}

/**
 * 获取辅助色系背景的 CSS 类名
 */
export function getSecondaryBg(scale: SecondaryColorScale = '700') {
  return `bg-secondary-${scale}` as const
}

/**
 * 获取间距的 CSS 类名
 */
export function getSpacing(
  scale: SpacingScale,
  type:
    | 'p'
    | 'm'
    | 'px'
    | 'py'
    | 'pt'
    | 'pb'
    | 'pl'
    | 'pr'
    | 'mx'
    | 'my'
    | 'mt'
    | 'mb'
    | 'ml'
    | 'mr' = 'p'
) {
  return `${type}-${scale}` as const
}

/**
 * 获取字体大小的 CSS 类名
 */
export function getFontSize(scale: FontSizeScale) {
  return `text-${scale}` as const
}

/**
 * 获取圆角的 CSS 类名
 */
export function getBorderRadius(scale: BorderRadiusScale = 'md') {
  return `rounded-${scale}` as const
}

/**
 * 获取阴影的 CSS 类名
 */
export function getElevation(scale: ElevationScale = '2') {
  return `shadow-elevation-${scale}` as const
}

/**
 * 根据组件尺寸获取对应的样式类
 */
export function getComponentSizeClasses(size: ComponentSize = 'md') {
  const sizeMap = {
    sm: {
      padding: 'px-3 py-1.5',
      fontSize: 'text-body-small',
      height: 'h-8'
    },
    md: {
      padding: 'px-4 py-2',
      fontSize: 'text-body-medium',
      height: 'h-10'
    },
    lg: {
      padding: 'px-6 py-3',
      fontSize: 'text-body-large',
      height: 'h-12'
    }
  }

  return sizeMap[size]
}

/**
 * 获取按钮变体的样式类
 */
export function getButtonVariantClasses(
  variant: 'primary' | 'secondary' | 'text' | 'outlined' = 'primary'
) {
  const variantMap = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    text: 'btn-text',
    outlined: 'btn-secondary'
  }

  return variantMap[variant]
}

/**
 * 获取卡片变体的样式类
 */
export function getCardVariantClasses(variant: 'elevated' | 'outlined' | 'filled' = 'elevated') {
  const variantMap = {
    elevated: 'card-elevated',
    outlined: 'card-outlined',
    filled: 'card-filled'
  }

  return variantMap[variant]
}

/**
 * 处理响应式值
 */
export function getResponsiveClasses<T extends string>(
  value: ResponsiveValue<T>,
  prefix: string = ''
): string {
  if (typeof value === 'string') {
    return prefix ? `${prefix}${value}` : value
  }

  const classes: string[] = []

  Object.entries(value).forEach(([breakpoint, val]) => {
    if (val) {
      const bp = breakpoint as Breakpoint
      const className = prefix ? `${prefix}${val}` : val

      if (bp === 'xs') {
        classes.push(className)
      } else {
        classes.push(`${bp}:${className}`)
      }
    }
  })

  return classes.join(' ')
}

/**
 * 获取断点前缀
 */
export function getBreakpointPrefix(breakpoint: Breakpoint): string {
  return breakpoint === 'xs' ? '' : `${breakpoint}:`
}

/**
 * 创建响应式类名
 */
export function createResponsiveClass(
  baseClass: string,
  breakpoints: Partial<Record<Breakpoint, string>>
): string {
  const classes = [baseClass]

  Object.entries(breakpoints).forEach(([bp, value]) => {
    if (value) {
      const prefix = getBreakpointPrefix(bp as Breakpoint)
      classes.push(`${prefix}${value}`)
    }
  })

  return classes.join(' ')
}

/**
 * 获取状态样式类
 */
export function getStateClasses(state: 'success' | 'warning' | 'error' | 'info') {
  const stateMap = {
    success: 'status-success',
    warning: 'status-warning',
    error: 'status-error',
    info: 'status-info'
  }

  return stateMap[state]
}

/**
 * 获取动画类名
 */
export function getAnimationClass(animation: 'fade-in' | 'slide-up' | 'scale-in') {
  return `animate-${animation}` as const
}

/**
 * 获取过渡类名
 */
export function getTransitionClass(
  duration: 'fast' | 'medium' | 'slow' = 'medium',
  easing: 'standard' | 'decelerate' | 'accelerate' = 'standard'
) {
  return `transition-all duration-${duration} ease-material-${easing}` as const
}

/**
 * 创建网格布局类名
 */
export function createGridClasses(cols: ResponsiveValue<number>, gap: SpacingScale = '4'): string {
  const gapClass = `gap-${gap}`

  if (typeof cols === 'number') {
    return `grid grid-cols-${cols} ${gapClass}`
  }

  const gridClasses = ['grid', gapClass]

  Object.entries(cols).forEach(([breakpoint, colCount]) => {
    if (colCount) {
      const prefix = getBreakpointPrefix(breakpoint as Breakpoint)
      gridClasses.push(`${prefix}grid-cols-${colCount}`)
    }
  })

  return gridClasses.join(' ')
}

/**
 * 创建 Flexbox 布局类名
 */
export function createFlexClasses(
  direction: 'row' | 'col' = 'row',
  justify: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly' = 'start',
  align: 'start' | 'center' | 'end' | 'stretch' = 'start',
  gap: SpacingScale = '4'
): string {
  return `flex flex-${direction} justify-${justify} items-${align} gap-${gap}`
}

/**
 * 获取文本截断类名
 */
export function getTruncateClass(lines?: number): string {
  if (!lines || lines === 1) {
    return 'truncate'
  }

  return `line-clamp-${lines}`
}

/**
 * 获取可访问性相关的类名
 */
export function getA11yClasses(): string {
  return 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
}

/**
 * 创建条件类名
 */
export function conditionalClass(
  condition: boolean,
  trueClass: string,
  falseClass: string = ''
): string {
  return condition ? trueClass : falseClass
}

/**
 * 获取深色模式类名
 */
export function getDarkModeClass(lightClass: string, darkClass: string): string {
  return `${lightClass} dark:${darkClass}`
}

/**
 * 验证设计令牌值
 */
export function validateDesignToken(value: string, allowedValues: readonly string[]): boolean {
  return allowedValues.includes(value)
}

/**
 * 获取 CSS 自定义属性值
 */
export function getCSSVariable(variable: string): string {
  if (typeof window !== 'undefined') {
    return getComputedStyle(document.documentElement).getPropertyValue(variable).trim()
  }
  return ''
}

/**
 * 设置 CSS 自定义属性值
 */
export function setCSSVariable(variable: string, value: string): void {
  if (typeof window !== 'undefined') {
    document.documentElement.style.setProperty(variable, value)
  }
}
