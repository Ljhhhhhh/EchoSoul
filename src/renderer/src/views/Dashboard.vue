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

<style scoped></style>
