<template>
  <ProgressRoot
    v-bind="forwarded"
    :class="cn('relative h-4 w-full overflow-hidden rounded-full bg-secondary', props.class)"
  >
    <ProgressIndicator
      class="h-full w-full flex-1 bg-primary transition-all"
      :style="`transform: translateX(-${100 - (modelValue || 0)}%)`"
    />
  </ProgressRoot>
</template>

<script setup lang="ts">
import { type HTMLAttributes } from 'vue'
import { ProgressIndicator, ProgressRoot, useForwardProps } from 'radix-vue'
import type { ProgressRootProps } from 'radix-vue'

import { cn } from '@renderer/lib/utils'

interface ProgressProps extends ProgressRootProps {
  class?: HTMLAttributes['class']
}

const props = defineProps<ProgressProps>()

const forwarded = useForwardProps(props)
</script>
