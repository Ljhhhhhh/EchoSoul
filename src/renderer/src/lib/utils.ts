import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 类型安全的类名合并函数，专门处理 $attrs.class
 */
export function cnWithAttrs(baseClasses: ClassValue, attrsClass: unknown): string {
  return cn(baseClasses, attrsClass as ClassValue)
}
