<template>
  <div class="main-app">
    <!-- Application Header -->
    <header class="app-header">
      <div class="header-content">
        <!-- Brand Section -->
        <div class="brand-section">
          <div class="brand-logo">
            <Icon name="brain" :size="32" class="text-primary-600" />
          </div>
          <div class="brand-text">
            <h1 class="font-medium text-headline-medium text-neutral-800">EchoSoul</h1>
            <p class="text-body-small text-neutral-500">数字化的内省之旅</p>
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
              <Icon :name="item.icon" :size="20" />
              <span class="nav-label">{{ item.label }}</span>
            </router-link>
          </div>
        </nav>

        <!-- User Section -->
        <div class="user-section">
          <div class="user-status">
            <div class="status-indicator" :class="connectionStatus"></div>
            <span class="status-text">{{ getStatusText() }}</span>
          </div>

          <div class="user-actions">
            <Button
              variant="text"
              size="sm"
              icon="help-circle"
              aria-label="帮助"
              @click="showHelp"
            />
            <Button
              variant="text"
              size="sm"
              icon="settings"
              aria-label="设置"
              @click="navigateToSettings"
            />
          </div>
        </div>
      </div>
    </header>

    <!-- 主内容区域 -->
    <main class="py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <!-- 欢迎卡片 -->
        <div class="mb-6 overflow-hidden bg-white rounded-lg shadow">
          <div class="px-4 py-5 sm:p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <span class="text-3xl">🎉</span>
              </div>
              <div class="flex-1 w-0 ml-5">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">初始化完成</dt>
                  <dd class="text-lg font-medium text-gray-900">
                    欢迎使用 EchoSoul！您的聊天记录分析环境已准备就绪。
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <!-- 功能卡片网格 -->
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <!-- 生成报告卡片 -->
          <div class="overflow-hidden bg-white rounded-lg shadow">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <span class="text-2xl">📊</span>
                </div>
                <div class="flex-1 w-0 ml-5">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">分析报告</dt>
                    <dd class="text-lg font-medium text-gray-900">生成聊天记录分析报告</dd>
                  </dl>
                </div>
              </div>
              <div class="mt-5">
                <button
                  class="w-full px-4 py-2 text-white transition-colors bg-indigo-600 rounded-md hover:bg-indigo-700"
                >
                  生成新报告
                </button>
              </div>
            </div>
          </div>

          <!-- 历史报告卡片 -->
          <div class="overflow-hidden bg-white rounded-lg shadow">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <span class="text-2xl">📚</span>
                </div>
                <div class="flex-1 w-0 ml-5">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">历史报告</dt>
                    <dd class="text-lg font-medium text-gray-900">查看已生成的报告</dd>
                  </dl>
                </div>
              </div>
              <div class="mt-5">
                <button
                  class="w-full px-4 py-2 text-white transition-colors bg-green-600 rounded-md hover:bg-green-700"
                >
                  查看报告
                </button>
              </div>
            </div>
          </div>

          <!-- 设置卡片 -->
          <div class="overflow-hidden bg-white rounded-lg shadow">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <span class="text-2xl">⚙️</span>
                </div>
                <div class="flex-1 w-0 ml-5">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">应用设置</dt>
                    <dd class="text-lg font-medium text-gray-900">配置AI模型和分析参数</dd>
                  </dl>
                </div>
              </div>
              <div class="mt-5">
                <button
                  class="w-full px-4 py-2 text-white transition-colors bg-gray-600 rounded-md hover:bg-gray-700"
                >
                  打开设置
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 状态信息 -->
        <div class="mt-6 overflow-hidden bg-white rounded-lg shadow">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="mb-4 text-lg font-medium leading-6 text-gray-900">系统状态</h3>
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div class="flex items-center justify-between p-3 rounded-md bg-gray-50">
                <span class="text-sm font-medium text-gray-500">微信连接状态</span>
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                >
                  已连接
                </span>
              </div>
              <div class="flex items-center justify-between p-3 rounded-md bg-gray-50">
                <span class="text-sm font-medium text-gray-500">数据库状态</span>
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                >
                  正常
                </span>
              </div>
              <div class="flex items-center justify-between p-3 rounded-md bg-gray-50">
                <span class="text-sm font-medium text-gray-500">AI服务状态</span>
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"
                >
                  未配置
                </span>
              </div>
              <div class="flex items-center justify-between p-3 rounded-md bg-gray-50">
                <span class="text-sm font-medium text-gray-500">定时任务</span>
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  已启用
                </span>
              </div>
            </div>
          </div>
        </div>
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
    icon: 'plus',
    path: '/main/create',
    isActive: false
  },
  {
    id: 'report-history',
    label: '历史报告',
    icon: 'clock',
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

const navigateToSettings = () => {
  router.push('/main/settings')
}

const onPageEnter = (el: Element) => {
  // Page enter animation
  el.classList.add('page-enter-active')
}

const onPageLeave = (el: Element) => {
  // Page leave animation
  el.classList.add('page-leave-active')
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

<style scoped>
/* ========================================
 * Main App Layout
 * ======================================== */

.main-app {
  min-height: 100vh;
  background-color: var(--color-neutral-50);
  display: flex;
  flex-direction: column;
}

/* ========================================
 * Application Header
 * ======================================== */

.app-header {
  background-color: var(--color-neutral-0);
  border-bottom: 1px solid var(--color-neutral-200);
  height: 64px;
  position: sticky;
  top: 0;
  z-index: 50;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.header-content {
  max-width: none;
  padding-left: 24px;
  padding-right: 24px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* ========================================
 * Brand Section
 * ======================================== */

.brand-section {
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 280px;
}

.brand-logo {
  width: 48px;
  height: 48px;
  background-color: var(--color-primary-100);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.brand-text h1 {
  font-size: var(--font-size-headline-medium);
  line-height: var(--line-height-headline-medium);
  color: var(--color-neutral-800);
  font-weight: 500;
  margin: 0;
}

.brand-text p {
  font-size: var(--font-size-body-small);
  line-height: var(--line-height-body-small);
  color: var(--color-neutral-500);
  margin: 0;
}

/* ========================================
 * Main Navigation
 * ======================================== */

.main-navigation {
  flex: 1;
  display: flex;
  justify-content: center;
}

.nav-menu {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--color-neutral-100);
  border-radius: 12px;
  padding: 4px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: var(--font-size-title-medium);
  line-height: var(--line-height-title-medium);
  color: var(--color-neutral-600);
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
  text-decoration: none;
  font-weight: 500;
  min-width: 120px;
  justify-content: center;
}

.nav-item:hover {
  color: var(--color-primary-700);
  background-color: var(--color-primary-50);
}

.nav-item-active {
  color: var(--color-primary-700);
  background-color: var(--color-primary-100);
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.2);
}

.nav-label {
  font-size: var(--font-size-title-medium);
  line-height: var(--line-height-title-medium);
  font-weight: 500;
}

/* ========================================
 * User Section
 * ======================================== */

.user-section {
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 280px;
  justify-content: flex-end;
}

.user-status {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-indicator.connected {
  background-color: var(--color-success);
}

.status-indicator.connecting {
  background-color: var(--color-warning);
}

.status-indicator.disconnected {
  background-color: var(--color-error);
}

.status-text {
  font-size: var(--font-size-body-small);
  line-height: var(--line-height-body-small);
  color: var(--color-neutral-600);
  font-weight: 500;
}

.user-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* ========================================
 * Main Content Area
 * ======================================== */

.app-content {
  flex: 1;
  min-height: calc(100vh - 64px);
}

.content-container {
  height: 100%;
}

.page-component {
  height: 100%;
}

/* ========================================
 * Page Transitions
 * ======================================== */

.page-enter-active,
.page-leave-active {
  transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

.page-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* ========================================
 * Responsive Design
 * ======================================== */

@media (max-width: 768px) {
  .header-content {
    padding-left: 16px;
    padding-right: 16px;
  }

  .brand-section {
    min-width: auto;
  }

  .brand-text p {
    display: none;
  }

  .nav-menu {
    gap: 4px;
  }

  .nav-item {
    padding: 8px 12px;
    min-width: auto;
  }

  .nav-label {
    display: none;
  }

  .user-section {
    min-width: auto;
  }

  .status-text {
    display: none;
  }
}

@media (max-width: 640px) {
  .nav-menu {
    gap: 0;
    padding: 2px;
  }

  .nav-item {
    padding: 8px;
  }
}
</style>
