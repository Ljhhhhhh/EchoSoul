<template>
  <div class="dashboard">
    <!-- 欢迎横幅 -->
    <div class="welcome-banner">
      <div class="banner-content">
        <div class="banner-icon">
          <div class="icon-glow">
            <Icon name="sparkles" :size="24" class="sparkle-icon" />
          </div>
        </div>
        <div class="banner-text">
          <h2 class="banner-title">欢迎回到 EchoSoul</h2>
          <p class="banner-description">您的聊天记录分析环境已准备就绪，开始探索内心的数字足迹</p>
        </div>
        <div class="banner-decoration">
          <div class="decoration-circle decoration-1"></div>
          <div class="decoration-circle decoration-2"></div>
          <div class="decoration-circle decoration-3"></div>
        </div>
      </div>
    </div>

    <!-- 快速操作卡片 -->
    <div class="quick-actions">
      <div class="actions-grid">
        <!-- 生成报告卡片 -->
        <div
          class="action-card primary-card"
          role="button"
          tabindex="0"
          aria-label="生成新报告 - 基于最新聊天记录创建个性化分析报告"
          @click="navigateToCreate"
          @keydown.enter="navigateToCreate"
          @keydown.space.prevent="navigateToCreate"
        >
          <div class="card-header">
            <div class="card-icon primary-icon">
              <Icon name="plus-circle" :size="24" />
            </div>
            <div class="card-badge">推荐</div>
          </div>
          <div class="card-content">
            <h3 class="card-title">生成新报告</h3>
            <p class="card-description">基于最新聊天记录创建个性化分析报告</p>
          </div>
          <div class="card-footer">
            <Button
              variant="primary"
              size="sm"
              class="card-button"
              :disabled="isNavigating"
              @click.stop="navigateToCreate"
            >
              <Icon v-if="isNavigating" name="loader" :size="14" class="mr-1 animate-spin" />
              {{ isNavigating ? '跳转中...' : '开始分析' }}
            </Button>
            <div class="card-stats">
              <Icon name="clock" :size="14" />
              <span>约 2-5 分钟</span>
            </div>
          </div>
        </div>

        <!-- 历史报告卡片 -->
        <div
          class="action-card secondary-card"
          role="button"
          tabindex="0"
          aria-label="历史报告 - 查看和管理已生成的分析报告"
          @click="navigateToHistory"
          @keydown.enter="navigateToHistory"
          @keydown.space.prevent="navigateToHistory"
        >
          <div class="card-header">
            <div class="card-icon secondary-icon">
              <Icon name="file-text" :size="24" />
            </div>
          </div>
          <div class="card-content">
            <h3 class="card-title">历史报告</h3>
            <p class="card-description">查看和管理已生成的分析报告</p>
          </div>
          <div class="card-footer">
            <Button
              variant="secondary"
              size="sm"
              class="card-button"
              :disabled="isNavigating"
              @click.stop="navigateToHistory"
            >
              <Icon v-if="isNavigating" name="loader" :size="14" class="mr-1 animate-spin" />
              {{ isNavigating ? '跳转中...' : '查看报告' }}
            </Button>
            <div class="card-stats">
              <Icon name="archive" :size="14" />
              <span>{{ reportCount }} 个报告</span>
            </div>
          </div>
        </div>

        <!-- 设置卡片 -->
        <div
          class="action-card tertiary-card"
          role="button"
          tabindex="0"
          aria-label="应用设置 - 配置 AI 模型和个性化分析参数"
          @click="navigateToSettings"
          @keydown.enter="navigateToSettings"
          @keydown.space.prevent="navigateToSettings"
        >
          <div class="card-header">
            <div class="card-icon tertiary-icon">
              <Icon name="settings" :size="24" />
            </div>
          </div>
          <div class="card-content">
            <h3 class="card-title">应用设置</h3>
            <p class="card-description">配置 AI 模型和个性化分析参数</p>
          </div>
          <div class="card-footer">
            <Button
              variant="outlined"
              size="sm"
              class="card-button"
              :disabled="isNavigating"
              @click.stop="navigateToSettings"
            >
              <Icon v-if="isNavigating" name="loader" :size="14" class="mr-1 animate-spin" />
              {{ isNavigating ? '跳转中...' : '打开设置' }}
            </Button>
            <div class="card-stats">
              <Icon name="cpu" :size="14" />
              <span>AI 配置</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 系统状态面板 -->
    <div class="system-status">
      <div class="status-header">
        <h3 class="status-title">系统状态</h3>
        <div class="status-refresh" @click="refreshStatus">
          <Icon name="refresh-cw" :size="16" :class="{ 'animate-spin': isRefreshing }" />
        </div>
      </div>

      <div class="status-grid">
        <div class="status-item" :class="getStatusClass('wechat')">
          <div class="status-icon">
            <Icon name="message-circle" :size="20" />
          </div>
          <div class="state-info">
            <span class="status-label">微信连接</span>
            <span class="status-value">{{ systemStatus.wechat.text }}</span>
          </div>
          <div class="status-indicator" :class="systemStatus.wechat.status"></div>
        </div>

        <div class="status-item" :class="getStatusClass('database')">
          <div class="status-icon">
            <Icon name="database" :size="20" />
          </div>
          <div class="state-info">
            <span class="status-label">数据库</span>
            <span class="status-value">{{ systemStatus.database.text }}</span>
          </div>
          <div class="status-indicator" :class="systemStatus.database.status"></div>
        </div>

        <div class="status-item" :class="getStatusClass('ai')">
          <div class="status-icon">
            <Icon name="cpu" :size="20" />
          </div>
          <div class="state-info">
            <span class="status-label">AI 服务</span>
            <span class="status-value">{{ systemStatus.ai.text }}</span>
          </div>
          <div class="status-indicator" :class="systemStatus.ai.status"></div>
        </div>

        <div class="status-item" :class="getStatusClass('scheduler')">
          <div class="status-icon">
            <Icon name="clock" :size="20" />
          </div>
          <div class="state-info">
            <span class="status-label">定时任务</span>
            <span class="status-value">{{ systemStatus.scheduler.text }}</span>
          </div>
          <div class="status-indicator" :class="systemStatus.scheduler.status"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Button from '@renderer/components/design-system/Button.vue'
import Icon from '@renderer/components/design-system/Icon.vue'

// 系统状态类型定义
interface SystemStatusItem {
  status: 'connected' | 'warning' | 'error' | 'loading'
  text: string
}

interface SystemStatus {
  wechat: SystemStatusItem
  database: SystemStatusItem
  ai: SystemStatusItem
  scheduler: SystemStatusItem
}

// Router
const router = useRouter()

// Reactive state
const reportCount = ref(12)
const isNavigating = ref(false)
const isRefreshing = ref(false)

// 系统状态数据
const systemStatus = ref<SystemStatus>({
  wechat: { status: 'connected', text: '已连接' },
  database: { status: 'connected', text: '正常运行' },
  ai: { status: 'warning', text: '未配置' },
  scheduler: { status: 'connected', text: '已启用' }
})

// 通用导航方法
const navigateWithLoading = async (path: string, description: string) => {
  if (isNavigating.value) return

  try {
    isNavigating.value = true
    console.log(`Navigating to ${description}...`)

    // 添加轻微延迟以显示加载状态
    await new Promise((resolve) => setTimeout(resolve, 100))

    await router.push(path)
    console.log(`Successfully navigated to ${description}`)
  } catch (error) {
    console.error(`Failed to navigate to ${description}:`, error)
  } finally {
    isNavigating.value = false
  }
}

const navigateToSettings = () => {
  navigateWithLoading('/main/settings', 'settings page')
}

const navigateToCreate = () => {
  navigateWithLoading('/main/create', 'create report page')
}

const navigateToHistory = () => {
  navigateWithLoading('/main/history', 'report history page')
}

const refreshStatus = async () => {
  isRefreshing.value = true
  try {
    // 模拟状态刷新
    await new Promise((resolve) => setTimeout(resolve, 1000))
    // TODO: 实际的状态检查逻辑
  } finally {
    isRefreshing.value = false
  }
}

const getStatusClass = (type: keyof SystemStatus) => {
  const status = systemStatus.value[type].status
  return {
    'status-connected': status === 'connected',
    'status-warning': status === 'warning',
    'status-error': status === 'error',
    'status-loading': status === 'loading'
  }
}
</script>

<style scoped>
.dashboard {
  @apply bg-neutral-50 p-6;
}

/* 欢迎横幅样式 */
.welcome-banner {
  @apply relative mb-8 overflow-hidden rounded-2xl;
  background: linear-gradient(135deg, #0084ff 0%, #8b5cf6 100%);
  padding: 2rem;
  min-height: 160px;
}

.banner-content {
  @apply relative z-10 flex items-center gap-6;
}

.banner-icon {
  @apply flex-shrink-0;
}

.icon-glow {
  @apply flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm;
}

.sparkle-icon {
  @apply text-white;
}

.banner-text {
  @apply flex-1;
}

.banner-title {
  @apply text-3xl font-bold text-white mb-2;
}

.banner-description {
  @apply text-lg text-white/90;
}

.banner-decoration {
  @apply absolute right-8 top-1/2 -translate-y-1/2;
}

.decoration-circle {
  @apply absolute rounded-full bg-white/10;
}

.decoration-1 {
  @apply h-20 w-20;
  top: -10px;
  right: 0;
}

.decoration-2 {
  @apply h-12 w-12;
  top: 20px;
  right: 60px;
}

.decoration-3 {
  @apply h-8 w-8;
  top: -5px;
  right: 40px;
}

/* 快速操作卡片样式 */
.quick-actions {
  @apply mb-8;
}

.actions-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6;
}

.action-card {
  @apply bg-white rounded-xl p-6 shadow-sm border border-neutral-200 cursor-pointer transition-all duration-200;
  @apply hover:shadow-md hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2;
}

.action-card.primary-card {
  @apply border-primary-200 bg-gradient-to-br from-primary-50 to-primary-100;
}

.action-card.secondary-card {
  @apply border-secondary-200 bg-gradient-to-br from-secondary-50 to-secondary-100;
}

.action-card.tertiary-card {
  @apply border-neutral-200 bg-gradient-to-br from-neutral-50 to-neutral-100;
}

.card-header {
  @apply flex items-center justify-between mb-4;
}

.card-icon {
  @apply flex h-12 w-12 items-center justify-center rounded-lg;
}

.primary-icon {
  @apply bg-primary-500 text-white;
}

.secondary-icon {
  @apply bg-secondary-500 text-white;
}

.tertiary-icon {
  @apply bg-neutral-500 text-white;
}

.card-badge {
  @apply px-2 py-1 text-xs font-medium bg-orange-100 text-orange-700 rounded-full;
}

.card-content {
  @apply mb-6;
}

.card-title {
  @apply text-lg font-semibold text-neutral-800 mb-2;
}

.card-description {
  @apply text-sm text-neutral-600;
}

.card-footer {
  @apply flex items-center justify-between;
}

.card-button {
  @apply min-w-24;
}

.card-stats {
  @apply flex items-center gap-1 text-xs text-neutral-500;
}

/* 系统状态面板样式 */
.system-status {
  @apply bg-white rounded-xl p-6 shadow-sm border border-neutral-200;
}

.status-header {
  @apply flex items-center justify-between mb-6;
}

.status-title {
  @apply text-lg font-semibold text-neutral-800;
}

.status-refresh {
  @apply p-2 rounded-lg hover:bg-neutral-100 cursor-pointer transition-colors;
}

.status-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4;
}

.status-item {
  @apply flex items-center gap-4 p-4 rounded-lg border;
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
  @apply flex flex-col gap-1 min-w-0 flex-1;
}

.status-label {
  @apply text-sm font-medium text-neutral-700;
}

.status-value {
  @apply text-xs text-neutral-500;
}

.status-indicator {
  @apply h-3 w-3 rounded-full flex-shrink-0;
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
</style>
