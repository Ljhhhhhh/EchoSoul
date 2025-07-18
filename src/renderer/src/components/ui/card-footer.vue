<template>
  <div :class="cnWithAttrs('flex items-center p-6 pt-0', $attrs.class)">
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
