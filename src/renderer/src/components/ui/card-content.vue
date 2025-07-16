<template>
  <div :class="cn('p-6 pt-0', $attrs.class)">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { cn } from '@renderer/lib/utils'
</script>

<script lang="ts">
export default {
  inheritAttrs: false
}
</script>
