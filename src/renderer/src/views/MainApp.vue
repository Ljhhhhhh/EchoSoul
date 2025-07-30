<template>
  <div class="main-app">
    <!-- Application Header -->
    <header class="app-header">
      <div class="header-content">
        <!-- Brand Section -->
        <div class="brand-section">
          <div class="brand-logo">
            <div class="logo-gradient">
              <Icon name="brain" :size="28" class="logo-icon" />
            </div>
          </div>
          <div class="brand-text">
            <h1 class="brand-title">EchoSoul</h1>
            <p class="brand-subtitle">数字化的内省之旅</p>
          </div>
        </div>

        <!-- Main Navigation -->
        <nav class="main-navigation" role="navigation" aria-label="主导航">
          <div class="nav-menu">
            <router-link
              v-for="item in navigationItems"
              :key="item.id"
              :to="item.path"
              class="nav-item"
              :class="{ 'nav-item-active': isActiveRoute(item.path) }"
              @click="handleNavigation(item)"
            >
              <div class="nav-icon-wrapper">
                <Icon :name="item.icon" :size="18" class="nav-icon" />
              </div>
              <span class="nav-label">{{ item.label }}</span>
              <div v-if="item.badge" class="nav-badge">{{ item.badge }}</div>
            </router-link>
          </div>
        </nav>

        <!-- User Section -->
        <div class="user-section">
          <div class="connection-status">
            <div class="status-indicator" :class="connectionStatus">
              <div class="status-pulse" :class="connectionStatus"></div>
            </div>
            <span class="status-text">{{ getStatusText() }}</span>
          </div>

          <div class="user-actions">
            <Button
              variant="text"
              size="sm"
              icon="help-circle"
              aria-label="帮助"
              class="action-button"
              @click="showHelp"
            />
            <Button
              variant="text"
              size="sm"
              icon="refresh-cw"
              aria-label="解密聊天记录"
              class="action-button"
              @click="decryptDatabase"
            />
          </div>
        </div>
      </div>
    </header>

    <!-- 主内容区域 -->
    <main class="main-content">
      <div class="content-container">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Button from '@renderer/components/design-system/Button.vue'
import Icon from '@renderer/components/design-system/Icon.vue'
import type { NavigationItem } from '@renderer/types/pages'

// Router
const router = useRouter()
const route = useRoute()

// Reactive state
const connectionStatus = ref<'connected' | 'disconnected' | 'connecting'>('connected')

// Navigation items
const navigationItems = ref<NavigationItem[]>([
  {
    id: 'report-center',
    label: '报告中心',
    icon: 'file-text',
    path: '/main',
    isActive: false
  },
  {
    id: 'create-report',
    label: '生成报告',
    icon: 'plus-circle',
    path: '/main/reports',
    isActive: false
  },
  {
    id: 'report-history',
    label: '历史报告',
    icon: 'archive',
    path: '/main/history',
    isActive: false
  },
  {
    id: 'settings',
    label: '设置',
    icon: 'settings',
    path: '/main/settings',
    isActive: false
  }
])

// Computed properties

// Methods
const isActiveRoute = (path: string) => {
  if (path === '/main') {
    return route.path === '/main' || route.path === '/main/'
  }
  return route.path.startsWith(path)
}

const handleNavigation = (item: NavigationItem) => {
  // Update active states
  navigationItems.value.forEach((nav) => {
    nav.isActive = nav.id === item.id
  })

  // Navigate to route
  if (route.path !== item.path) {
    router.push(item.path)
  }
}

const getStatusText = () => {
  switch (connectionStatus.value) {
    case 'connected':
      return '已连接'
    case 'connecting':
      return '连接中'
    case 'disconnected':
      return '未连接'
    default:
      return '未知'
  }
}

const showHelp = () => {
  // TODO: Implement help dialog or navigate to help page
  console.log('显示帮助')
}

const decryptDatabase = async () => {
  try {
    console.log('开始解密聊天记录...')
    const result = await window.api.chatlog.decryptDatabase()

    if (result.success) {
      console.log('聊天记录解密成功:', result.message)
      // TODO: 可以添加成功提示
    } else {
      console.error('聊天记录解密失败:', result.message)
      // TODO: 可以添加错误提示
    }
  } catch (error) {
    console.error('调用解密功能时出错:', error)
    // TODO: 可以添加错误提示
  }
}

// Update navigation active states when route changes
const updateNavigationStates = () => {
  navigationItems.value.forEach((item) => {
    item.isActive = isActiveRoute(item.path)
  })
}

// Lifecycle
onMounted(() => {
  updateNavigationStates()

  // Watch for route changes
  router.afterEach(() => {
    updateNavigationStates()
  })
})
</script>

<style scoped></style>
