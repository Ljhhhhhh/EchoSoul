<template>
  <div class="report-center">
    <!-- Welcome Banner -->
    <section class="welcome-banner">
      <div class="banner-content">
        <h1 class="text-headline-large text-neutral-800">欢迎回到 EchoSoul</h1>
        <p class="mt-2 text-body-large text-neutral-600">
          探索您的数字化内省之旅，发现沟通中的深层洞察
        </p>
      </div>
      <div class="banner-actions">
        <Button variant="primary" size="lg" icon="plus" @click="navigateToCustomReport">
          生成新报告
        </Button>
      </div>
    </section>

    <!-- Quick Statistics Panel -->
    <section class="quick-stats">
      <div class="stats-grid">
        <div v-for="stat in quickStats" :key="stat.id" class="stat-card">
          <div class="stat-icon">
            <Icon :name="stat.icon" :size="24" />
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stat.value }}</div>
            <div class="stat-label">{{ stat.label }}</div>
            <div v-if="stat.trend" class="stat-trend" :class="stat.trend.direction">
              <Icon
                :name="stat.trend.direction === 'up' ? 'trending-up' : 'trending-down'"
                :size="16"
              />
              <span>{{ stat.trend.value }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Today's Report -->
    <section v-if="todayReport" class="today-report">
      <div class="section-header">
        <h2 class="text-title-large text-neutral-800">今日报告</h2>
        <Button variant="text" size="sm" @click="viewReport(todayReport.id)"> 查看详情 </Button>
      </div>

      <div class="report-card today-card">
        <div class="report-header">
          <div class="report-meta">
            <h3 class="text-title-medium">{{ todayReport.title }}</h3>
            <div class="report-info">
              <span class="text-body-small text-neutral-500">
                {{ formatDate(todayReport.createdAt) }}
              </span>
              <Badge :variant="getStatusVariant(todayReport.status)">
                {{ getStatusText(todayReport.status) }}
              </Badge>
            </div>
          </div>
          <div class="report-actions">
            <Button variant="text" size="sm" icon="share">分享</Button>
            <Button variant="text" size="sm" icon="download">导出</Button>
          </div>
        </div>

        <div class="report-preview">
          <p class="text-body-medium text-neutral-700">
            {{ todayReport.summary }}
          </p>

          <!-- Key Insights Preview -->
          <div v-if="todayReport.insights.length > 0" class="insights-preview">
            <h4 class="mb-3 text-title-small text-neutral-800">关键洞察</h4>
            <div class="insights-grid">
              <div
                v-for="insight in todayReport.insights.slice(0, 3)"
                :key="insight.id"
                class="insight-item"
              >
                <div class="insight-icon">
                  <Icon :name="getInsightIcon(insight.type)" :size="20" />
                </div>
                <div class="insight-content">
                  <div class="insight-title">{{ insight.title }}</div>
                  <div class="insight-value">{{ insight.value }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Historical Reports -->
    <section class="historical-reports">
      <div class="section-header">
        <h2 class="text-title-large text-neutral-800">历史报告</h2>
        <div class="header-actions">
          <Button variant="text" size="sm" icon="search" @click="toggleSearch"> 搜索 </Button>
          <Button variant="text" size="sm" @click="navigateToHistory"> 查看全部 </Button>
        </div>
      </div>

      <!-- Search and Filter -->
      <div v-if="showSearch" class="search-controls">
        <div class="search-input">
          <Icon name="search" :size="20" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索报告..."
            class="search-field"
            @input="handleSearch"
          />
        </div>
        <div class="filter-controls">
          <select v-model="selectedFilter" class="filter-select">
            <option value="">全部类型</option>
            <option value="daily">每日报告</option>
            <option value="weekly">每周报告</option>
            <option value="custom">自定义报告</option>
          </select>
        </div>
      </div>

      <!-- Reports Grid -->
      <div class="reports-grid">
        <div
          v-for="report in filteredReports"
          :key="report.id"
          class="report-card"
          @click="viewReport(report.id)"
        >
          <div class="report-header">
            <div class="report-meta">
              <h3 class="text-title-small">{{ report.title }}</h3>
              <div class="report-info">
                <span class="text-body-small text-neutral-500">
                  {{ formatDate(report.createdAt) }}
                </span>
                <Badge :variant="getStatusVariant(report.status)">
                  {{ getStatusText(report.status) }}
                </Badge>
              </div>
            </div>
          </div>

          <div class="report-summary">
            <p class="text-body-small text-neutral-600">
              {{ report.summary }}
            </p>
          </div>

          <div class="report-stats">
            <div class="stat-item">
              <Icon name="users" :size="16" />
              <span>{{ report.participants.length }} 参与者</span>
            </div>
            <div class="stat-item">
              <Icon name="clock" :size="16" />
              <span>{{ report.metadata.readingTime }}分钟阅读</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Load More -->
      <div v-if="hasMoreReports" class="load-more">
        <Button variant="secondary" size="md" :loading="isLoadingMore" @click="loadMoreReports">
          加载更多
        </Button>
      </div>
    </section>

    <!-- Empty State -->
    <div v-if="!todayReport && filteredReports.length === 0" class="empty-state">
      <div class="empty-icon">
        <Icon name="file-text" :size="48" />
      </div>
      <h3 class="text-title-medium text-neutral-700">还没有报告</h3>
      <p class="mt-2 text-body-medium text-neutral-500">生成您的第一份分析报告，开始探索沟通洞察</p>
      <Button variant="primary" size="lg" class="mt-6" @click="navigateToCustomReport">
        生成第一份报告
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Button from '@renderer/components/design-system/Button.vue'
import Icon from '@renderer/components/design-system/Icon.vue'
import Badge from '@renderer/components/ui/badge.vue'
import type { ReportData, QuickStatsItem } from '@renderer/types/pages'

// Router
const router = useRouter()

// Reactive state
const todayReport = ref<ReportData | null>(null)
const historicalReports = ref<ReportData[]>([])
const quickStats = ref<QuickStatsItem[]>([])
const searchQuery = ref('')
const selectedFilter = ref('')
const showSearch = ref(false)
const isLoadingMore = ref(false)
const hasMoreReports = ref(true)

// Computed properties
const filteredReports = computed(() => {
  let filtered = historicalReports.value

  if (searchQuery.value) {
    filtered = filtered.filter(
      (report) =>
        report.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        report.summary.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  if (selectedFilter.value) {
    filtered = filtered.filter((report) => report.type === selectedFilter.value)
  }

  return filtered
})

// Methods
const navigateToCustomReport = () => {
  router.push('/main/create')
}

const navigateToHistory = () => {
  router.push('/main/history')
}

const viewReport = (reportId: string) => {
  router.push(`/main/report/${reportId}`)
}

const toggleSearch = () => {
  showSearch.value = !showSearch.value
  if (!showSearch.value) {
    searchQuery.value = ''
    selectedFilter.value = ''
  }
}

const handleSearch = () => {
  // Debounced search implementation would go here
}

const loadMoreReports = async () => {
  isLoadingMore.value = true
  // Load more reports implementation
  setTimeout(() => {
    isLoadingMore.value = false
  }, 1000)
}

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'completed':
      return 'success'
    case 'generating':
      return 'warning'
    case 'failed':
      return 'destructive'
    default:
      return 'secondary'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'completed':
      return '已完成'
    case 'generating':
      return '生成中'
    case 'failed':
      return '失败'
    default:
      return '未知'
  }
}

const getInsightIcon = (type: string) => {
  switch (type) {
    case 'communication_pattern':
      return 'message-circle'
    case 'emotion_analysis':
      return 'heart'
    case 'topic_trend':
      return 'trending-up'
    case 'relationship_dynamic':
      return 'users'
    default:
      return 'lightbulb'
  }
}

// Lifecycle
onMounted(async () => {
  // Load initial data
  // TODO: Implement data loading from services

  // Initialize quick stats with mock data
  quickStats.value = [
    {
      id: 'total-reports',
      label: '总报告数',
      value: 156,
      icon: 'file-text',
      trend: {
        direction: 'up',
        value: '+12%',
        label: '较上月'
      }
    },
    {
      id: 'this-week-reports',
      label: '本周报告',
      value: 8,
      icon: 'calendar',
      trend: {
        direction: 'up',
        value: '+3',
        label: '较上周'
      }
    },
    {
      id: 'total-messages',
      label: '分析消息数',
      value: '2.4万',
      icon: 'message-circle',
      trend: {
        direction: 'up',
        value: '+15%',
        label: '较上月'
      }
    },
    {
      id: 'active-contacts',
      label: '活跃联系人',
      value: 89,
      icon: 'users',
      trend: {
        direction: 'down',
        value: '-2',
        label: '较上月'
      }
    }
  ]
})
</script>

<style scoped>
.report-center {
  @apply min-h-screen bg-neutral-50 p-6;
}

.welcome-banner {
  @apply flex items-center justify-between mb-8 p-6 bg-white rounded-lg shadow-sm;
}

.banner-content h1 {
  @apply font-medium;
}

.quick-stats {
  @apply mb-8;
}

.stats-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4;
}

.stat-card {
  @apply bg-white p-6 rounded-lg shadow-sm flex items-center space-x-4;
}

.stat-icon {
  @apply w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600;
}

.stat-value {
  @apply text-2xl font-semibold text-neutral-800;
}

.stat-label {
  @apply text-sm text-neutral-600;
}

.stat-trend {
  @apply flex items-center space-x-1 text-xs;
}

.stat-trend.up {
  @apply text-green-600;
}

.stat-trend.down {
  @apply text-red-600;
}

.section-header {
  @apply flex items-center justify-between mb-6;
}

.header-actions {
  @apply flex items-center space-x-2;
}

.today-report {
  @apply mb-8;
}

.today-card {
  @apply bg-gradient-to-br from-primary-50 to-secondary-50 border border-primary-200;
}

.report-card {
  @apply bg-white p-6 rounded-lg shadow-sm cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-1;
}

.report-header {
  @apply flex items-start justify-between mb-4;
}

.report-info {
  @apply flex items-center space-x-2 mt-1;
}

.report-actions {
  @apply flex items-center space-x-2;
}

.insights-preview {
  @apply mt-6;
}

.insights-grid {
  @apply grid grid-cols-1 md:grid-cols-3 gap-4;
}

.insight-item {
  @apply flex items-center space-x-3 p-3 bg-white/50 rounded-lg;
}

.insight-icon {
  @apply w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600;
}

.insight-title {
  @apply text-sm font-medium text-neutral-700;
}

.insight-value {
  @apply text-lg font-semibold text-neutral-800;
}

.search-controls {
  @apply flex items-center space-x-4 mb-6 p-4 bg-white rounded-lg shadow-sm;
}

.search-input {
  @apply flex items-center space-x-2 flex-1;
}

.search-field {
  @apply flex-1 border-none outline-none text-sm;
}

.filter-select {
  @apply px-3 py-2 border border-neutral-300 rounded-md text-sm;
}

.reports-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6;
}

.report-summary {
  @apply mb-4;
}

.report-stats {
  @apply flex items-center space-x-4 text-xs text-neutral-500;
}

.stat-item {
  @apply flex items-center space-x-1;
}

.load-more {
  @apply flex justify-center mt-8;
}

.empty-state {
  @apply flex flex-col items-center justify-center py-16 text-center;
}

.empty-icon {
  @apply text-neutral-400 mb-4;
}
</style>
