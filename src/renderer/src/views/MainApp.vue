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
    path: '/main/create',
    isActive: false,
    badge: '新'
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

<style scoped>
/* ========================================
 * Main App Layout
 * ======================================== */

.main-app {
  @apply min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 flex flex-col;
}

/* ========================================
 * Application Header
 * ======================================== */

.app-header {
  @apply border-b border-neutral-200 h-16 sticky top-0 z-50;
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  box-shadow:
    0 1px 3px 0 rgba(0, 0, 0, 0.05),
    0 1px 2px 0 rgba(0, 0, 0, 0.1);
}

.header-content {
  @apply max-w-none px-6 h-full flex items-center justify-between;
}

/* ========================================
 * Brand Section
 * ======================================== */

.brand-section {
  @apply flex items-center gap-4 min-w-48;
}

.brand-logo {
  @apply relative;
}

.logo-gradient {
  @apply w-12 h-12 rounded-xl flex items-center justify-center relative overflow-hidden;
  background: linear-gradient(135deg, var(--color-primary-500) 0%, var(--color-secondary-600) 100%);
  box-shadow: 0 4px 12px rgba(0, 132, 255, 0.25);
}

.logo-gradient::before {
  @apply absolute inset-0 rounded-xl;
  content: '';
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, transparent 50%);
}

.logo-icon {
  @apply text-white relative z-10;
}

.brand-text {
  @apply flex flex-col;
}

.brand-title {
  @apply text-xl font-semibold text-neutral-800 leading-tight;
  font-family: var(--font-family-sans);
}

.brand-subtitle {
  @apply text-sm text-neutral-500 leading-relaxed;
  font-family: var(--font-family-sans);
}

/* ========================================
 * Main Navigation
 * ======================================== */

.main-navigation {
  @apply flex-1 flex justify-center;
}

.nav-menu {
  @apply flex items-center gap-1 rounded-2xl p-1;
  background-color: rgba(245, 245, 245, 0.8);
  backdrop-filter: blur(4px);
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);
}

.nav-item {
  @apply flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-neutral-600 no-underline min-w-32 justify-center relative;
  transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

.nav-item:hover {
  @apply text-primary-700;
  background-color: rgba(59, 130, 246, 0.1);
  transform: translateY(-1px);
}

.nav-item-active {
  @apply text-primary-700 bg-white shadow-sm;
  box-shadow:
    0 2px 8px rgba(0, 132, 255, 0.15),
    0 1px 3px rgba(0, 0, 0, 0.1);
}

.nav-icon-wrapper {
  @apply relative;
}

.nav-icon {
  @apply transition-transform duration-300;
}

.nav-item:hover .nav-icon {
  @apply scale-110;
}

.nav-label {
  @apply text-sm font-medium transition-colors duration-300;
}

.nav-badge {
  @apply absolute -top-1 -right-1 bg-primary-500 text-white text-xs px-1.5 py-0.5 rounded-full;
  font-size: 10px;
  line-height: 1;
}

/* ========================================
 * User Section
 * ======================================== */

.user-section {
  @apply flex items-center gap-4 min-w-48 justify-end;
}

.connection-status {
  @apply flex items-center gap-2;
}

.status-indicator {
  @apply w-2 h-2 rounded-full relative;
}

.status-pulse {
  @apply absolute inset-0 rounded-full animate-pulse;
}

.status-indicator.connected {
  @apply bg-green-500;
}

.status-indicator.connecting {
  @apply bg-yellow-500;
}

.status-indicator.disconnected {
  @apply bg-red-500;
}

.status-pulse.connected {
  @apply bg-green-500;
}

.status-pulse.connecting {
  @apply bg-yellow-500;
}

.status-pulse.disconnected {
  @apply bg-red-500;
}

.status-text {
  @apply text-sm text-neutral-600 font-medium;
}

.user-actions {
  @apply flex items-center gap-1;
}

.action-button {
  @apply hover:bg-neutral-100 rounded-lg transition-colors duration-200;
  padding: 8px;
}

/* ========================================
 * Main Content Area
 * ======================================== */

.main-content {
  @apply flex-1;
}

.content-container {
  @apply mx-auto space-y-8;
}

/* ========================================
 * Welcome Banner
 * ======================================== */

.welcome-banner {
  @apply relative overflow-hidden bg-gradient-to-r from-primary-500 to-secondary-600 rounded-3xl p-8;
  box-shadow: 0 10px 25px rgba(0, 132, 255, 0.2);
}

.banner-content {
  @apply relative z-10 flex items-center gap-6;
}

.banner-icon {
  @apply relative;
}

.icon-glow {
  @apply w-16 h-16 rounded-2xl flex items-center justify-center;
  background-color: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(4px);
  box-shadow: 0 8px 32px rgba(255, 255, 255, 0.1);
}

.sparkle-icon {
  @apply text-white;
}

.banner-text {
  @apply flex-1;
}

.banner-title {
  @apply text-2xl font-bold text-white mb-2;
}

.banner-description {
  @apply text-white/90 text-base leading-relaxed;
}

.banner-decoration {
  @apply absolute right-8 top-1/2 transform -translate-y-1/2;
}

.decoration-circle {
  @apply absolute rounded-full;
  background-color: rgba(255, 255, 255, 0.1);
}

.decoration-1 {
  @apply w-32 h-32 -top-8 -right-8;
  animation: float 6s ease-in-out infinite;
}

.decoration-2 {
  @apply w-20 h-20 top-4 right-12;
  animation: float 4s ease-in-out infinite reverse;
}

.decoration-3 {
  @apply w-12 h-12 -bottom-2 right-4;
  animation: float 5s ease-in-out infinite;
}

/* ========================================
 * Quick Actions Cards
 * ======================================== */

.quick-actions {
  @apply space-y-6;
}

.actions-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6;
}

.action-card {
  @apply bg-white rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1;
  box-shadow:
    0 4px 6px rgba(0, 0, 0, 0.05),
    0 1px 3px rgba(0, 0, 0, 0.1);
}

.action-card:hover {
  box-shadow:
    0 20px 25px rgba(0, 0, 0, 0.1),
    0 10px 10px rgba(0, 0, 0, 0.04);
}

.primary-card {
  @apply border-l-4 border-primary-500;
}

.secondary-card {
  @apply border-l-4 border-secondary-500;
}

.tertiary-card {
  @apply border-l-4 border-neutral-400;
}

.card-header {
  @apply flex items-center justify-between mb-4;
}

.card-icon {
  @apply w-12 h-12 rounded-xl flex items-center justify-center;
}

.primary-icon {
  @apply bg-primary-100 text-primary-600;
}

.secondary-icon {
  @apply bg-secondary-100 text-secondary-600;
}

.tertiary-icon {
  @apply bg-neutral-100 text-neutral-600;
}

.card-badge {
  @apply bg-primary-500 text-white text-xs px-2 py-1 rounded-full font-medium;
}

.card-content {
  @apply mb-6;
}

.card-title {
  @apply text-lg font-semibold text-neutral-800 mb-2;
}

.card-description {
  @apply text-neutral-600 text-sm leading-relaxed;
}

.card-footer {
  @apply flex items-center justify-between;
}

.card-button {
  @apply transition-all duration-200;
}

.card-stats {
  @apply flex items-center gap-1 text-xs text-neutral-500;
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

  .actions-grid {
    @apply grid-cols-1;
  }

  .banner-content {
    @apply flex-col text-center gap-4;
  }

  .banner-decoration {
    @apply hidden;
  }
}

/* ========================================
 * System Status Panel
 * ======================================== */

.system-status {
  @apply bg-white rounded-2xl p-6;
  box-shadow:
    0 4px 6px rgba(0, 0, 0, 0.05),
    0 1px 3px rgba(0, 0, 0, 0.1);
}

.status-header {
  @apply flex items-center justify-between mb-6;
}

.status-title {
  @apply text-lg font-semibold text-neutral-800;
}

.status-refresh {
  @apply w-8 h-8 bg-neutral-100 hover:bg-neutral-200 rounded-lg flex items-center justify-center cursor-pointer transition-colors duration-200;
}

.status-grid {
  @apply grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4;
}

.status-item {
  @apply flex items-center gap-3 p-4 rounded-xl transition-all duration-200;
}

.status-connected {
  @apply border;
  background-color: rgba(34, 197, 94, 0.05);
  border-color: rgba(34, 197, 94, 0.2);
}

.status-warning {
  @apply border;
  background-color: rgba(245, 158, 11, 0.05);
  border-color: rgba(245, 158, 11, 0.2);
}

.status-error {
  @apply border;
  background-color: rgba(239, 68, 68, 0.05);
  border-color: rgba(239, 68, 68, 0.2);
}

.status-loading {
  @apply bg-neutral-100 border border-neutral-200;
}

.status-icon {
  @apply flex-shrink-0;
}

.status-connected .status-icon {
  @apply text-green-600;
}

.status-warning .status-icon {
  @apply text-yellow-600;
}

.status-error .status-icon {
  @apply text-red-600;
}

.status-loading .status-icon {
  @apply text-neutral-400;
}

.state-info {
  @apply flex-1 min-w-0;
}

.status-label {
  @apply block text-sm font-medium text-neutral-700;
}

.status-value {
  @apply block text-xs text-neutral-500 mt-0.5;
}

.status-indicator {
  @apply w-2 h-2 rounded-full flex-shrink-0;
}

.status-indicator.connected {
  @apply bg-green-500;
}

.status-indicator.warning {
  @apply bg-yellow-500;
}

.status-indicator.error {
  @apply bg-red-500;
}

.status-indicator.loading {
  @apply bg-neutral-400 animate-pulse;
}

/* ========================================
 * Animations
 * ======================================== */

@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeIn 0.6s ease-out;
}

/* ========================================
 * Accessibility & Focus States
 * ======================================== */

.nav-item:focus-visible,
.action-card:focus-visible,
.status-refresh:focus-visible {
  @apply outline-none ring-2 ring-primary-500 ring-offset-2;
}

.action-card:focus-visible {
  @apply ring-offset-white;
}

/* ========================================
 * Dark Mode Support (Future)
 * ======================================== */

@media (prefers-color-scheme: dark) {
  /* Dark mode styles can be added here in the future */
}
</style>
