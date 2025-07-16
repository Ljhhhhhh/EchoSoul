<template>
  <button :class="buttonClasses" :disabled="disabled" :type="type" @click="handleClick">
    <Icon v-if="icon && iconPosition === 'left'" :name="icon" :size="iconSize" class="mr-2" />

    <span v-if="$slots.default" class="button-content">
      <slot />
    </span>

    <Icon v-if="icon && iconPosition === 'right'" :name="icon" :size="iconSize" class="ml-2" />

    <Icon
      v-if="loading"
      name="loader-2"
      :size="iconSize"
      class="animate-spin"
      :class="{ 'ml-2': $slots.default }"
    />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { cn, getButtonVariantClasses, getComponentSizeClasses } from '@/utils/design-system'
import Icon from './Icon.vue'

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'text' | 'outlined'
  size?: 'sm' | 'md' | 'lg'
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  loading?: boolean
  icon?: string
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
  className?: string
}

const props = withDefaults(defineProps<ButtonProps>(), {
  variant: 'primary',
  size: 'md',
  type: 'button',
  disabled: false,
  loading: false,
  iconPosition: 'left',
  fullWidth: false
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const iconSize = computed(() => {
  const sizeMap = {
    sm: 16,
    md: 20,
    lg: 24
  }
  return sizeMap[props.size]
})

const buttonClasses = computed(() => {
  const baseClasses = [
    // 基础样式
    'inline-flex items-center justify-center',
    'font-medium rounded-sm',
    'transition-all duration-fast ease-material-standard',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',

    // 变体样式
    getButtonVariantClasses(props.variant),

    // 尺寸样式
    getComponentSizeClasses(props.size).padding,
    getComponentSizeClasses(props.size).height,

    // 条件样式
    {
      'w-full': props.fullWidth,
      'cursor-not-allowed': props.disabled,
      'cursor-wait': props.loading
    }
  ]

  return cn(baseClasses, props.className)
})

const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<style scoped>
.button-content {
  @apply flex items-center;
}

/* 按钮涟漪效果 */
button {
  position: relative;
  overflow: hidden;
}

button::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: translate(-50%, -50%);
  transition:
    width 0.3s ease,
    height 0.3s ease;
}

button:active::before {
  width: 300px;
  height: 300px;
}

/* 深色模式下的涟漪效果 */
.dark button::before {
  background: rgba(0, 0, 0, 0.2);
}
</style>
