<template>
  <div
    :class="cnWithAttrs('rounded-lg border bg-card text-card-foreground shadow-sm', $attrs.class)"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { cnWithAttrs } from '@renderer/lib/utils'
</script>

<script lang="ts">
export default {
  inheritAttrs: false
}
</script>
