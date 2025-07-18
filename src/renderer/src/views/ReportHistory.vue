<template>
  <div class="report-history">
    <!-- Page Header -->
    <header class="page-header">
      <div class="header-content">
        <div class="header-left">
          <Button variant="text" size="sm" icon="arrow-left" @click="goBack"> 返回 </Button>
          <div class="header-title">
            <h1 class="text-headline-medium text-neutral-800">历史报告</h1>
            <p class="text-body-medium text-neutral-600">管理和查看您的所有分析报告</p>
          </div>
        </div>

        <div class="header-actions">
          <Button variant="secondary" size="md" icon="download" @click="exportReports">
            批量导出
          </Button>
          <Button variant="primary" size="md" icon="plus" @click="createNewReport">
            生成新报告
          </Button>
        </div>
      </div>
    </header>

    <!-- Filter and Search Controls -->
    <section class="filter-controls">
      <div class="controls-container">
        <!-- Search Input -->
        <div class="search-section">
          <div class="search-input">
            <Icon name="search" :size="20" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="搜索报告标题、内容或参与者..."
              class="search-field"
              @input="handleSearch"
            />
            <Button v-if="searchQuery" variant="text" size="sm" icon="x" @click="clearSearch" />
          </div>
        </div>

        <!-- Filter Options -->
        <div class="filter-section">
          <div class="filter-group">
            <label class="filter-label">类型</label>
            <select v-model="filters.reportType" class="filter-select">
              <option value="">全部类型</option>
              <option value="daily">每日报告</option>
              <option value="weekly">每周报告</option>
              <option value="monthly">每月报告</option>
              <option value="custom">自定义报告</option>
            </select>
          </div>

          <div class="filter-group">
            <label class="filter-label">状态</label>
            <select v-model="filters.status" class="filter-select">
              <option value="">全部状态</option>
              <option value="completed">已完成</option>
              <option value="generating">生成中</option>
              <option value="failed">失败</option>
            </select>
          </div>

          <div class="filter-group">
            <label class="filter-label">时间范围</label>
            <select v-model="filters.timeRange" class="filter-select">
              <option value="">全部时间</option>
              <option value="today">今天</option>
              <option value="week">本周</option>
              <option value="month">本月</option>
              <option value="quarter">本季度</option>
            </select>
          </div>

          <Button variant="text" size="sm" icon="filter-x" @click="clearFilters"> 清除筛选 </Button>
        </div>
      </div>
    </section>

    <!-- Results Summary -->
    <section class="results-summary">
      <div class="summary-content">
        <div class="results-count">
          <span class="text-body-medium text-neutral-700">
            找到 <strong>{{ filteredReports.length }}</strong> 个报告
          </span>
          <span v-if="hasActiveFilters" class="text-body-small text-neutral-500"> （已筛选） </span>
        </div>

        <div class="sort-controls">
          <label class="sort-label">排序方式</label>
          <select v-model="sortBy" class="sort-select" @change="handleSort">
            <option value="createdAt-desc">创建时间（最新）</option>
            <option value="createdAt-asc">创建时间（最早）</option>
            <option value="title-asc">标题（A-Z）</option>
            <option value="title-desc">标题（Z-A）</option>
            <option value="readingTime-desc">阅读时间（长到短）</option>
            <option value="readingTime-asc">阅读时间（短到长）</option>
          </select>
        </div>
      </div>
    </section>

    <!-- Reports List -->
    <section class="reports-section">
      <div v-if="isLoading" class="loading-state">
        <Icon name="loader-2" :size="32" class="animate-spin" />
        <p class="mt-4 text-body-medium text-neutral-600">加载报告列表...</p>
      </div>

      <div v-else-if="filteredReports.length === 0" class="empty-state">
        <div class="empty-icon">
          <Icon name="file-text" :size="48" />
        </div>
        <h3 class="text-title-medium text-neutral-700">
          {{ hasActiveFilters ? '没有找到匹配的报告' : '还没有报告' }}
        </h3>
        <p class="mt-2 text-body-medium text-neutral-500">
          {{ hasActiveFilters ? '尝试调整筛选条件' : '生成您的第一份分析报告' }}
        </p>
        <Button
          v-if="!hasActiveFilters"
          variant="primary"
          size="lg"
          class="mt-6"
          @click="createNewReport"
        >
          生成第一份报告
        </Button>
        <Button v-else variant="secondary" size="md" class="mt-6" @click="clearFilters">
          清除筛选条件
        </Button>
      </div>

      <div v-else class="reports-list">
        <!-- Bulk Actions -->
        <div v-if="selectedReports.length > 0" class="bulk-actions">
          <div class="selection-info">
            <span class="text-body-small text-neutral-600">
              已选择 {{ selectedReports.length }} 个报告
            </span>
          </div>
          <div class="bulk-buttons">
            <Button variant="text" size="sm" icon="download"> 批量导出 </Button>
            <Button variant="text" size="sm" icon="trash-2" class="text-error"> 批量删除 </Button>
            <Button variant="text" size="sm" @click="clearSelection"> 取消选择 </Button>
          </div>
        </div>

        <!-- Report Items -->
        <div class="report-items">
          <div
            v-for="report in paginatedReports"
            :key="report.id"
            class="report-item"
            :class="{ selected: selectedReports.includes(report.id) }"
          >
            <!-- Selection Checkbox -->
            <div class="item-selection">
              <input
                type="checkbox"
                :checked="selectedReports.includes(report.id)"
                class="selection-checkbox"
                @change="toggleReportSelection(report.id)"
              />
            </div>

            <!-- Report Content -->
            <div class="item-content" @click="viewReport(report.id)">
              <div class="item-header">
                <div class="item-meta">
                  <h3 class="item-title">{{ report.title }}</h3>
                  <div class="item-info">
                    <Badge :variant="getStatusVariant(report.status)">
                      {{ getStatusText(report.status) }}
                    </Badge>
                    <span class="item-type">{{ getTypeText(report.type) }}</span>
                    <span class="item-date">{{ formatDate(report.createdAt) }}</span>
                  </div>
                </div>

                <div class="item-stats">
                  <div class="stat-item">
                    <Icon name="users" :size="16" />
                    <span>{{ report.participants.length }}</span>
                  </div>
                  <div class="stat-item">
                    <Icon name="clock" :size="16" />
                    <span>{{ report.metadata.readingTime }}分钟</span>
                  </div>
                  <div class="stat-item">
                    <Icon name="file-text" :size="16" />
                    <span>{{ report.metadata.wordCount }}字</span>
                  </div>
                </div>
              </div>

              <div class="item-summary">
                <p class="summary-text">{{ report.summary }}</p>
              </div>

              <div class="item-participants">
                <span class="participants-label">参与者：</span>
                <div class="participants-list">
                  <span
                    v-for="(participant, index) in report.participants.slice(0, 3)"
                    :key="participant"
                    class="participant-name"
                  >
                    {{ participant
                    }}{{ index < Math.min(report.participants.length, 3) - 1 ? '、' : '' }}
                  </span>
                  <span v-if="report.participants.length > 3" class="more-participants">
                    等{{ report.participants.length }}人
                  </span>
                </div>
              </div>
            </div>

            <!-- Item Actions -->
            <div class="item-actions">
              <Button variant="text" size="sm" icon="eye" @click="viewReport(report.id)">
                查看
              </Button>
              <Button variant="text" size="sm" icon="share"> 分享 </Button>
              <Button variant="text" size="sm" icon="download"> 导出 </Button>
              <Button variant="text" size="sm" icon="more-horizontal"> 更多 </Button>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="pagination">
          <div class="pagination-info">
            <span class="text-body-small text-neutral-600">
              第 {{ currentPage }} 页，共 {{ totalPages }} 页
            </span>
          </div>

          <div class="pagination-controls">
            <Button
              variant="text"
              size="sm"
              icon="chevron-left"
              :disabled="currentPage === 1"
              @click="goToPage(currentPage - 1)"
            >
              上一页
            </Button>

            <div class="page-numbers">
              <Button
                v-for="page in visiblePages"
                :key="page"
                :variant="page === currentPage ? 'primary' : 'text'"
                size="sm"
                @click="goToPage(page)"
              >
                {{ page }}
              </Button>
            </div>

            <Button
              variant="text"
              size="sm"
              icon="chevron-right"
              :disabled="currentPage === totalPages"
              @click="goToPage(currentPage + 1)"
            >
              下一页
            </Button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import Button from '@renderer/components/design-system/Button.vue'
import Icon from '@renderer/components/design-system/Icon.vue'
import Badge from '@renderer/components/ui/badge.vue'
import type { ReportData, FilterOptions } from '@renderer/types/pages'

// Router
const router = useRouter()

// Reactive state
const reports = ref<ReportData[]>([])
const isLoading = ref(true)
const searchQuery = ref('')
const selectedReports = ref<string[]>([])
const currentPage = ref(1)
const pageSize = ref(10)
const sortBy = ref('createdAt-desc')

const filters = ref<FilterOptions>({
  reportType: '',
  status: '',
  timeRange: '',
  searchQuery: ''
})

// Computed properties
const hasActiveFilters = computed(
  () =>
    Object.values(filters.value).some((value) => value !== '' && value !== undefined) ||
    searchQuery.value !== ''
)

const filteredReports = computed(() => {
  let filtered = reports.value

  // Apply search
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(
      (report) =>
        report.title.toLowerCase().includes(query) ||
        report.summary.toLowerCase().includes(query) ||
        report.participants.some((p) => p.toLowerCase().includes(query))
    )
  }

  // Apply filters
  if (filters.value.reportType) {
    const reportType = filters.value.reportType
    if (Array.isArray(reportType)) {
      filtered = filtered.filter((report) => reportType.includes(report.type))
    } else {
      filtered = filtered.filter((report) => report.type === reportType)
    }
  }

  if (filters.value.status) {
    const status = filters.value.status
    if (Array.isArray(status)) {
      filtered = filtered.filter((report) => status.includes(report.status))
    } else {
      filtered = filtered.filter((report) => report.status === status)
    }
  }

  if (filters.value.timeRange) {
    const now = new Date()
    let startDate: Date

    switch (filters.value.timeRange) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        break
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      case 'quarter':
        startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1)
        break
      default:
        startDate = new Date(0)
    }

    filtered = filtered.filter((report) => report.createdAt >= startDate)
  }

  // Apply sorting
  const [field, direction] = sortBy.value.split('-')
  filtered.sort((a, b) => {
    let aValue: any = a[field as keyof ReportData]
    let bValue: any = b[field as keyof ReportData]

    if (field === 'readingTime') {
      aValue = a.metadata.readingTime
      bValue = b.metadata.readingTime
    }

    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase()
      bValue = bValue.toLowerCase()
    }

    if (direction === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  return filtered
})

const totalPages = computed(() => Math.ceil(filteredReports.value.length / pageSize.value))

const paginatedReports = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredReports.value.slice(start, end)
})

const visiblePages = computed(() => {
  const pages: (number | string)[] = []
  const total = totalPages.value
  const current = currentPage.value

  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    if (current <= 4) {
      for (let i = 1; i <= 5; i++) {
        pages.push(i)
      }
      pages.push('...', total)
    } else if (current >= total - 3) {
      pages.push(1, '...')
      for (let i = total - 4; i <= total; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1, '...')
      for (let i = current - 1; i <= current + 1; i++) {
        pages.push(i)
      }
      pages.push('...', total)
    }
  }

  return pages.filter((page) => page !== '...' || pages.indexOf(page) === pages.lastIndexOf(page))
})

// Methods
const goBack = () => {
  router.push('/main')
}

const createNewReport = () => {
  router.push('/main/create')
}

const viewReport = (reportId: string) => {
  router.push(`/main/report/${reportId}`)
}

const handleSearch = () => {
  currentPage.value = 1
}

const clearSearch = () => {
  searchQuery.value = ''
  currentPage.value = 1
}

const clearFilters = () => {
  filters.value = {
    reportType: '',
    status: '',
    timeRange: '',
    searchQuery: ''
  }
  searchQuery.value = ''
  currentPage.value = 1
}

const handleSort = () => {
  currentPage.value = 1
}

const toggleReportSelection = (reportId: string) => {
  const index = selectedReports.value.indexOf(reportId)
  if (index > -1) {
    selectedReports.value.splice(index, 1)
  } else {
    selectedReports.value.push(reportId)
  }
}

const clearSelection = () => {
  selectedReports.value = []
}

const goToPage = (page: number | string) => {
  if (typeof page === 'number' && page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
  // Ignore string values like "..."
}

const exportReports = () => {
  // Implement bulk export
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

const getTypeText = (type: string) => {
  switch (type) {
    case 'daily':
      return '每日报告'
    case 'weekly':
      return '每周报告'
    case 'monthly':
      return '每月报告'
    case 'custom':
      return '自定义报告'
    default:
      return '未知类型'
  }
}

// Watchers
watch(
  [searchQuery, filters],
  () => {
    currentPage.value = 1
  },
  { deep: true }
)

// Lifecycle
onMounted(async () => {
  try {
    // TODO: Load reports from service
    // reports.value = await reportService.getAllReports()
    isLoading.value = false
  } catch (error) {
    console.error('Failed to load reports:', error)
    isLoading.value = false
  }
})
</script>

<style scoped>
.report-history {
  @apply min-h-screen bg-neutral-50;
}

.page-header {
  @apply bg-white border-b border-neutral-200 p-6;
}

.header-content {
  @apply flex items-center justify-between;
}

.header-left {
  @apply flex items-center space-x-4;
}

.header-actions {
  @apply flex items-center space-x-3;
}

.filter-controls {
  @apply bg-white border-b border-neutral-200 p-6;
}

.controls-container {
  @apply space-y-4;
}

.search-section {
  @apply flex items-center;
}

.search-input {
  @apply flex items-center space-x-3 flex-1 max-w-md px-4 py-2 border border-neutral-300 rounded-lg;
}

.search-field {
  @apply flex-1 border-none outline-none;
}

.filter-section {
  @apply flex items-center space-x-4 flex-wrap;
}

.filter-group {
  @apply flex items-center space-x-2;
}

.filter-label {
  @apply text-sm text-neutral-700;
}

.filter-select,
.sort-select {
  @apply px-3 py-2 border border-neutral-300 rounded-md text-sm;
}

.results-summary {
  @apply bg-white border-b border-neutral-200 p-6;
}

.summary-content {
  @apply flex items-center justify-between;
}

.sort-controls {
  @apply flex items-center space-x-2;
}

.sort-label {
  @apply text-sm text-neutral-700;
}

.reports-section {
  @apply p-6;
}

.loading-state,
.empty-state {
  @apply flex flex-col items-center justify-center py-16 text-center;
}

.empty-icon {
  @apply text-neutral-400 mb-4;
}

.bulk-actions {
  @apply flex items-center justify-between bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6;
}

.bulk-buttons {
  @apply flex items-center space-x-2;
}

.report-items {
  @apply space-y-4;
}

.report-item {
  @apply bg-white border border-neutral-200 rounded-lg p-6 flex items-start space-x-4 transition-colors hover:border-neutral-300;
}

.report-item.selected {
  @apply border-primary-500 bg-primary-50;
}

.item-selection {
  @apply pt-1;
}

.selection-checkbox {
  @apply w-4 h-4;
}

.item-content {
  @apply flex-1 cursor-pointer;
}

.item-header {
  @apply flex items-start justify-between mb-3;
}

.item-title {
  @apply text-lg font-medium text-neutral-800;
}

.item-info {
  @apply flex items-center space-x-3 mt-1;
}

.item-type,
.item-date {
  @apply text-sm text-neutral-500;
}

.item-stats {
  @apply flex items-center space-x-4 text-sm text-neutral-500;
}

.stat-item {
  @apply flex items-center space-x-1;
}

.item-summary {
  @apply mb-3;
}

.summary-text {
  @apply text-neutral-700 line-clamp-2;
}

.item-participants {
  @apply flex items-center space-x-2 text-sm;
}

.participants-label {
  @apply text-neutral-600;
}

.participants-list {
  @apply flex items-center space-x-1;
}

.participant-name {
  @apply text-neutral-700;
}

.more-participants {
  @apply text-neutral-500;
}

.item-actions {
  @apply flex items-center space-x-2;
}

.pagination {
  @apply flex items-center justify-between mt-8 pt-6 border-t border-neutral-200;
}

.pagination-controls {
  @apply flex items-center space-x-2;
}

.page-numbers {
  @apply flex items-center space-x-1;
}
</style>
