<template>
  <div :class="cnWithAttrs('flex flex-col space-y-1.5 p-6', $attrs.class)">
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
