<template>
  <div :class="cnWithAttrs(badgeClasses, $attrs.class)">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { cnWithAttrs } from '@renderer/lib/utils'

export interface BadgeProps {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning'
  class?: string
}

const props = withDefaults(defineProps<BadgeProps>(), {
  variant: 'default'
})

const badgeClasses = computed(() => {
  const baseClasses =
    'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'

  const variantClasses = {
    default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
    secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
    destructive:
      'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
    outline: 'text-foreground',
    success: 'border-transparent bg-success text-white hover:bg-success/80',
    warning: 'border-transparent bg-warning text-white hover:bg-warning/80'
  }

  return `${baseClasses} ${variantClasses[props.variant]}`
})
</script>

<script lang="ts">
export default {
  inheritAttrs: false
}
</script>
