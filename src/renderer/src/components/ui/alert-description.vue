<template>
  <div :class="cnWithAttrs('text-sm [&_p]:leading-relaxed', $attrs.class)">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { cnWithAttrs } from '@renderer/lib/utils'

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
