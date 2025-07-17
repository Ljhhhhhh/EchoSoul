<template>
  <div :class="cnWithAttrs(alertClasses, $attrs.class)" role="alert">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { cnWithAttrs } from '@renderer/lib/utils'

export interface AlertProps {
  variant?: 'default' | 'destructive'
  class?: string
}

const props = withDefaults(defineProps<AlertProps>(), {
  variant: 'default'
})

const alertClasses = computed(() => {
  const baseClasses =
    'relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground'

  const variantClasses = {
    default: 'bg-background text-foreground',
    destructive:
      'border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive'
  }

  return `${baseClasses} ${variantClasses[props.variant]}`
})
</script>

<script lang="ts">
export default {
  inheritAttrs: false
}
</script>
