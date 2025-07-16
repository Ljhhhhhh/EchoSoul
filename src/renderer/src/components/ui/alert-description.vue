<template>
  <div :class="cn('text-sm [&_p]:leading-relaxed', $attrs.class)">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { cn } from '@renderer/lib/utils'

export interface AlertDescriptionProps {
  class?: string
}

defineProps<AlertDescriptionProps>()
</script>

<script lang="ts">
export default {
  inheritAttrs: false
}
</script>
