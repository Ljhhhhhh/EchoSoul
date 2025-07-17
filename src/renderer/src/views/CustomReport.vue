<template>
  <div class="custom-report">
    <!-- 主要内容区域 -->
    <div class="main-container">
      <!-- 内容区域 -->
      <div class="content-wrapper">
        <!-- 左侧配置表单 -->
        <div class="config-form">
          <div class="form-content">
            <!-- 时间范围配置 -->
            <div class="form-section">
              <div class="section-header">
                <Icon name="calendar" :size="20" class="section-icon" />
                <h2 class="section-title">时间范围</h2>
              </div>

              <div class="time-range-config">
                <!-- 快捷预设 -->
                <div class="preset-buttons">
                  <button
                    v-for="preset in timePresets"
                    :key="preset.id"
                    class="preset-btn"
                    :class="{ 'preset-active': selectedTimePreset === preset.id }"
                    @click="selectTimePreset(preset)"
                  >
                    {{ preset.title }}
                  </button>
                </div>

                <!-- 自定义日期 -->
                <div class="date-range">
                  <div class="date-input-group">
                    <label class="date-label">开始日期</label>
                    <input
                      v-model="customTimeRange.startDate"
                      type="date"
                      class="date-input"
                      :max="customTimeRange.endDate || today"
                    />
                  </div>
                  <div class="date-separator">
                    <Icon name="arrow-right" :size="16" />
                  </div>
                  <div class="date-input-group">
                    <label class="date-label">结束日期</label>
                    <input
                      v-model="customTimeRange.endDate"
                      type="date"
                      class="date-input"
                      :min="customTimeRange.startDate"
                      :max="today"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- 分析对象和分析配置并排布局 -->
            <div class="analysis-row">
              <!-- 联系人选择 -->
              <div class="form-section analysis-section">
                <div class="section-header">
                  <Icon name="users" :size="20" class="section-icon" />
                  <h2 class="section-title">分析对象</h2>
                </div>

                <div class="contacts-config">
                  <!-- 搜索框 -->
                  <div class="search-box">
                    <Icon name="search" :size="16" class="search-icon" />
                    <input
                      v-model="participantSearchQuery"
                      type="text"
                      placeholder="搜索联系人..."
                      class="search-input"
                    />
                  </div>

                  <!-- 快速选择 -->
                  <div class="quick-actions">
                    <button
                      class="quick-btn"
                      :class="{ active: allParticipantsSelected }"
                      @click="selectAllParticipants"
                    >
                      全选
                    </button>
                    <button
                      class="quick-btn"
                      :class="{ active: onlyActiveSelected }"
                      @click="selectActiveParticipants"
                    >
                      活跃联系人
                    </button>
                    <button class="quick-btn" @click="clearAllParticipants">清空</button>
                  </div>

                  <!-- 联系人列表 - 优化为网格布局 -->
                  <div class="contacts-grid">
                    <div
                      v-for="contact in filteredContacts"
                      :key="contact.id"
                      class="contact-card"
                      :class="{ selected: contact.isSelected }"
                      @click="toggleParticipant(contact)"
                    >
                      <div class="contact-avatar">
                        {{ contact.name.charAt(0).toUpperCase() }}
                      </div>
                      <div class="contact-info">
                        <div class="contact-name">{{ contact.name }}</div>
                        <div class="contact-stats">{{ contact.messageCount }} 条消息</div>
                      </div>
                      <div class="contact-checkbox">
                        <Icon v-if="contact.isSelected" name="check" :size="14" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 分析配置 -->
              <div class="form-section analysis-section">
                <div class="section-header">
                  <Icon name="settings" :size="20" class="section-icon" />
                  <h2 class="section-title">分析配置</h2>
                </div>

                <div class="analysis-config">
                  <!-- 分析深度 -->
                  <div class="config-group">
                    <label class="config-label">分析深度</label>
                    <div class="depth-selector-horizontal">
                      <div
                        v-for="depth in analysisDepths"
                        :key="depth.id"
                        class="depth-option-horizontal"
                        :class="{ selected: customReportConfig.analysisOptions.depth === depth.id }"
                        @click="selectAnalysisDepth(depth.id)"
                      >
                        <span class="depth-name">{{ depth.name }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- 分析维度 -->
                  <div class="config-group">
                    <label class="config-label">分析维度</label>
                    <div class="dimensions-horizontal">
                      <div
                        v-for="dimension in analysisDimensions"
                        :key="dimension.id"
                        class="dimension-chip"
                        :class="{ active: dimension.isEnabled }"
                        @click="toggleDimension(dimension)"
                      >
                        <span class="dimension-name">{{ dimension.name }}</span>
                        <div class="toggle-switch" :class="{ active: dimension.isEnabled }">
                          <div class="toggle-handle"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- 执行区域 -->
                  <div class="execution-section">
                    <!-- AI 模型选择 -->
                    <div class="config-group">
                      <label class="config-label">AI 模型</label>
                      <select v-model="selectedAIModel" class="model-select">
                        <option value="gpt-4">GPT-4 (推荐)</option>
                        <option value="gpt-3.5">GPT-3.5 Turbo</option>
                        <option value="claude-3">Claude 3</option>
                        <option value="gemini-pro">Gemini Pro</option>
                      </select>
                    </div>

                    <!-- 生成报告按钮 -->
                    <div class="generate-action">
                      <Button
                        variant="primary"
                        size="lg"
                        icon="sparkles"
                        :disabled="!isConfigurationValid"
                        :loading="isGenerating"
                        class="generate-btn"
                        @click="generateReport"
                      >
                        {{ isGenerating ? '生成中...' : '生成报告' }}
                      </Button>
                      <p class="generate-hint">
                        {{
                          isConfigurationValid ? '配置完成，可以开始生成报告' : '请完成必要的配置项'
                        }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import Button from '@renderer/components/design-system/Button.vue'
import Icon from '@renderer/components/design-system/Icon.vue'

// 类型定义
interface CustomReportConfig {
  timeRange: {
    start: Date
    end: Date
  }
  participants: string[]
  analysisOptions: {
    depth: string
    dimensions: string[]
    includeEmotions: boolean
    includeTopics: boolean
    includeTimeline: boolean
    language: string
  }
}

interface ContactInfo {
  id: string
  name: string
  messageCount: number
  isSelected: boolean
  avatar?: string
}

interface AnalysisDimension {
  id: string
  name: string
  description: string
  isEnabled: boolean
}

// Router
const router = useRouter()

// Reactive state
const isGenerating = ref(false)
const selectedTimePreset = ref('last7days')
const participantSearchQuery = ref('')
const selectedAIModel = ref('gpt-4')

// 时间范围相关
const customTimeRange = ref({
  startDate: '',
  endDate: ''
})

const today = new Date().toISOString().split('T')[0]

const customReportConfig = ref<CustomReportConfig>({
  timeRange: {
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    end: new Date()
  },
  participants: [],
  analysisOptions: {
    depth: 'detailed',
    dimensions: [],
    includeEmotions: true,
    includeTopics: true,
    includeTimeline: true,
    language: 'zh'
  }
})

const availableContacts = ref<ContactInfo[]>([
  { id: '1', name: '张三', messageCount: 1250, isSelected: false, avatar: '' },
  { id: '2', name: '李四', messageCount: 890, isSelected: false, avatar: '' },
  { id: '3', name: '王五', messageCount: 2100, isSelected: false, avatar: '' },
  { id: '4', name: '赵六', messageCount: 567, isSelected: false, avatar: '' },
  { id: '5', name: '工作群', messageCount: 3200, isSelected: false, avatar: '' }
])

const analysisDimensions = ref<AnalysisDimension[]>([
  { id: 'emotion', name: '情感分析', description: '分析对话中的情感倾向和变化', isEnabled: true },
  { id: 'topic', name: '话题趋势', description: '识别热门话题和讨论重点', isEnabled: true },
  { id: 'timeline', name: '时间线分析', description: '展示沟通活跃度的时间分布', isEnabled: false },
  { id: 'relationship', name: '关系动态', description: '分析人际关系的发展变化', isEnabled: false },
  { id: 'communication', name: '沟通模式', description: '识别沟通习惯和风格特征', isEnabled: false }
])

// Mock data
const timePresets = [
  {
    id: 'last7days',
    title: '最近7天',
    description: '分析近期活跃对话',
    days: 7
  },
  {
    id: 'last30days',
    title: '最近30天',
    description: '获得月度沟通洞察',
    days: 30
  },
  {
    id: 'last90days',
    title: '最近3个月',
    description: '深度季度分析报告',
    days: 90
  },
  {
    id: 'custom',
    title: '自定义范围',
    description: '选择特定时间段',
    days: 0
  }
]

const analysisDepths = [
  {
    id: 'basic',
    name: '基础分析',
    description: '快速概览，包含基本统计和趋势',
    duration: '2-3分钟',
    features: ['消息统计', '活跃度分析', '基础图表']
  },
  {
    id: 'detailed',
    name: '详细分析',
    description: '深入分析，包含情感和话题洞察',
    duration: '5-8分钟',
    features: ['情感分析', '话题识别', '关系网络', '详细图表']
  },
  {
    id: 'comprehensive',
    name: '全面分析',
    description: '最全面的分析，包含所有维度和深度洞察',
    duration: '10-15分钟',
    features: ['全维度分析', '深度洞察', '预测趋势', '完整报告']
  }
]

// 计算属性
const filteredContacts = computed(() => {
  if (!participantSearchQuery.value) return availableContacts.value

  return availableContacts.value.filter((contact) =>
    contact.name.toLowerCase().includes(participantSearchQuery.value.toLowerCase())
  )
})

const selectedParticipants = computed(() => availableContacts.value.filter((c) => c.isSelected))

const selectedTimeRange = computed(() => {
  if (selectedTimePreset.value && selectedTimePreset.value !== 'custom') {
    const preset = timePresets.find((p) => p.id === selectedTimePreset.value)
    if (preset && preset.days > 0) {
      const end = new Date()
      const start = new Date(end.getTime() - preset.days * 24 * 60 * 60 * 1000)
      return { start, end }
    }
  }

  if (customTimeRange.value.startDate && customTimeRange.value.endDate) {
    return {
      start: new Date(customTimeRange.value.startDate),
      end: new Date(customTimeRange.value.endDate)
    }
  }

  return null
})

const allParticipantsSelected = computed(() => {
  return availableContacts.value.length > 0 && availableContacts.value.every((c) => c.isSelected)
})

const onlyActiveSelected = computed(() => {
  const activeContacts = availableContacts.value.filter((c) => c.messageCount > 1000)
  return (
    activeContacts.length > 0 &&
    activeContacts.every((c) => c.isSelected) &&
    availableContacts.value.filter((c) => c.messageCount <= 1000).every((c) => !c.isSelected)
  )
})

const isConfigurationValid = computed(() => {
  return selectedTimeRange.value && selectedParticipants.value.length > 0
})

// 方法
const selectTimePreset = (preset: any) => {
  selectedTimePreset.value = preset.id

  if (preset.id !== 'custom') {
    const end = new Date()
    const start = new Date(end.getTime() - preset.days * 24 * 60 * 60 * 1000)

    customReportConfig.value.timeRange = { start, end }
    customTimeRange.value.startDate = start.toISOString().split('T')[0]
    customTimeRange.value.endDate = end.toISOString().split('T')[0]
  }
}

const toggleParticipant = (contact: ContactInfo) => {
  contact.isSelected = !contact.isSelected
}

const selectAllParticipants = () => {
  availableContacts.value.forEach((contact) => {
    contact.isSelected = true
  })
}

const selectActiveParticipants = () => {
  availableContacts.value.forEach((contact) => {
    contact.isSelected = contact.messageCount > 1000
  })
}

const clearAllParticipants = () => {
  availableContacts.value.forEach((contact) => {
    contact.isSelected = false
  })
}

const selectAnalysisDepth = (depthId: string) => {
  customReportConfig.value.analysisOptions.depth = depthId
}

const toggleDimension = (dimension: AnalysisDimension) => {
  dimension.isEnabled = !dimension.isEnabled
}

const generateReport = async () => {
  if (!isConfigurationValid.value) return

  try {
    isGenerating.value = true

    // TODO: 实际的报告生成逻辑
    console.log('开始生成报告...', {
      timeRange: selectedTimeRange.value,
      participants: selectedParticipants.value,
      config: customReportConfig.value
    })

    // 模拟生成过程
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // 跳转到报告详情页面
    router.push('/main/report/new-report-id')
  } catch (error) {
    console.error('生成报告失败:', error)
  } finally {
    isGenerating.value = false
  }
}

// 初始化默认值
const initializeDefaults = () => {
  // 设置默认时间范围
  selectTimePreset(timePresets[0])
}

// 组件挂载时初始化
initializeDefaults()
</script>

<style scoped>
/* ========================================
   EchoSoul 生成报告界面 - 优化布局设计
   严格遵循设计系统规范
======================================== */

.custom-report {
  @apply min-h-screen bg-neutral-50;
  font-family:
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    sans-serif;
}

/* ========================================
   主要内容区域
======================================== */

.main-container {
  @apply max-w-7xl mx-auto p-6;
}

.content-wrapper {
  @apply block;
}

.config-form {
  @apply w-full;
}

.form-content {
  @apply space-y-6;
}

/* ========================================
   分析对象和分析配置并排布局
======================================== */

.analysis-row {
  @apply flex gap-6;
}

.analysis-section:first-child {
  @apply w-1/3;
}

.analysis-section:last-child {
  @apply w-2/3;
}

/* ========================================
   表单区块样式
======================================== */

.form-section {
  @apply bg-white rounded-xl p-5 shadow-sm border border-neutral-200;
  transition: all 0.3s ease;
}

.form-section:hover {
  @apply shadow-md border-neutral-300;
}

.section-header {
  @apply flex items-center gap-3 mb-4;
}

.section-icon {
  @apply text-primary-500;
}

.section-title {
  @apply text-base font-semibold text-neutral-800;
}

/* ========================================
   时间范围配置样式
======================================== */

.time-range-config {
  @apply space-y-4;
}

.preset-buttons {
  @apply flex flex-wrap gap-2;
}

.preset-btn {
  @apply px-3 py-2 border border-neutral-300 rounded-lg text-sm font-medium transition-all duration-200;
  @apply hover:border-neutral-400 hover:bg-neutral-50;
}

.preset-btn.preset-active {
  @apply border-primary-500 bg-primary-50 text-primary-700;
}

.date-range {
  @apply flex items-center gap-4;
}

.date-input-group {
  @apply flex-1;
}

.date-label {
  @apply block text-sm font-medium text-neutral-700 mb-2;
}

.date-input {
  @apply w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors;
}

.date-separator {
  @apply flex items-center text-neutral-400 mt-6;
}

/* ========================================
   联系人选择样式
======================================== */

.contacts-config {
  @apply space-y-4;
}

.search-box {
  @apply relative;
}

.search-icon {
  @apply absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400;
}

.search-input {
  @apply w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors;
}

.quick-actions {
  @apply flex gap-2;
}

.quick-btn {
  @apply px-3 py-1.5 text-sm border border-neutral-300 rounded-md hover:bg-neutral-50 transition-colors;
}

.quick-btn.active {
  @apply border-primary-500 bg-primary-50 text-primary-700;
}

/* 联系人网格布局 */
.contacts-grid {
  @apply grid grid-cols-1 gap-3 max-h-64 overflow-y-auto;
}

.contact-card {
  @apply flex items-center gap-3 p-3 border border-neutral-200 rounded-lg cursor-pointer transition-all duration-200;
  @apply hover:border-neutral-300 hover:bg-neutral-50;
}

.contact-card.selected {
  @apply border-primary-500 bg-primary-50;
}

.contact-avatar {
  @apply w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white font-semibold;
}

.contact-info {
  @apply flex-1;
}

.contact-name {
  @apply font-medium text-neutral-800;
}

.contact-stats {
  @apply text-sm text-neutral-500;
}

.contact-checkbox {
  @apply w-5 h-5 border-2 border-neutral-300 rounded flex items-center justify-center;
}

.contact-card.selected .contact-checkbox {
  @apply border-primary-500 bg-primary-500 text-white;
}

/* ========================================
   分析配置样式
======================================== */

.analysis-config {
  @apply space-y-5;
}

.config-group {
  @apply space-y-3;
}

.config-label {
  @apply block text-sm font-medium text-neutral-700;
}

/* 配置网格布局 */
.config-grid {
  @apply grid grid-cols-2 gap-4 mb-5;
}

.config-group.full-width {
  @apply col-span-2;
}

/* 分析深度选择器 - 横向布局 */
.depth-selector-horizontal {
  @apply flex gap-2;
}

.depth-option-horizontal {
  @apply flex-1 p-3 border border-neutral-200 rounded-lg cursor-pointer transition-all duration-200 text-center;
  @apply hover:border-neutral-300 hover:bg-neutral-50;
}

.depth-option-horizontal.selected {
  @apply border-primary-500 bg-primary-50;
}

.depth-name {
  @apply font-medium text-neutral-800 text-sm;
}

/* 网格布局分析维度 */
.dimensions-grid {
  @apply grid grid-cols-3 gap-3;
}

/* 分析维度 - 横向布局 */
.dimensions-horizontal {
  @apply flex flex-wrap gap-2;
}

.dimension-chip {
  @apply flex items-center gap-2 px-3 py-2 border border-neutral-200 rounded-lg cursor-pointer transition-all duration-200;
  @apply hover:border-neutral-300 hover:bg-neutral-50;
}

.dimension-chip.active {
  @apply border-primary-500 bg-primary-50;
}

.dimension-chip .dimension-name {
  @apply text-sm font-medium text-neutral-800;
}

/* ========================================
   执行区域样式
======================================== */

.execution-section {
  @apply mt-6 pt-6 border-t border-neutral-200;
}

.generate-action {
  @apply mt-4;
}

.generate-btn {
  @apply w-full mb-2;
}

.generate-hint {
  @apply text-sm text-neutral-500 text-center;
}

.dimension-card {
  @apply p-4 border border-neutral-200 rounded-lg cursor-pointer transition-all duration-200;
  @apply hover:border-neutral-300 hover:bg-neutral-50;
}

.dimension-card.active {
  @apply border-primary-500 bg-primary-50;
}

.dimension-header {
  @apply flex items-center justify-between mb-2;
}

.dimension-name {
  @apply font-medium text-neutral-800 text-sm;
}

.dimension-desc {
  @apply text-xs text-neutral-500 leading-relaxed;
}

.toggle-switch {
  @apply w-10 h-5 bg-neutral-300 rounded-full relative transition-colors cursor-pointer;
}

.toggle-switch.active {
  @apply bg-primary-500;
}

.toggle-handle {
  @apply w-4 h-4 bg-white rounded-full absolute top-0.5 left-0.5 transition-transform;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.toggle-switch.active .toggle-handle {
  @apply transform translate-x-5;
}

.model-select {
  @apply w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors;
}

/* ========================================
   响应式设计
======================================== */

@media (max-width: 1024px) {
  .analysis-row {
    @apply flex-col gap-4;
  }

  .analysis-section:first-child,
  .analysis-section:last-child {
    @apply w-full;
  }

  .config-grid {
    @apply grid-cols-1 gap-3;
  }

  .config-group.full-width {
    @apply col-span-1;
  }

  .contacts-grid {
    @apply grid-cols-1;
  }

  .dimensions-grid {
    @apply grid-cols-2;
  }

  .depth-selector-horizontal {
    @apply flex-col gap-2;
  }

  .dimensions-horizontal {
    @apply flex-col gap-2;
  }
}

@media (max-width: 768px) {
  .main-container {
    @apply p-4;
  }

  .page-header {
    @apply gap-3;
  }

  .page-title {
    @apply text-lg;
  }

  .page-subtitle {
    @apply text-xs;
  }

  .analysis-row {
    @apply flex-col gap-4;
  }

  .date-range {
    @apply flex-col gap-4;
  }

  .preset-buttons {
    @apply grid grid-cols-2 gap-2;
  }

  .config-grid {
    @apply grid-cols-1;
  }

  .contacts-grid {
    @apply grid-cols-1;
  }

  .dimensions-grid {
    @apply grid-cols-1;
  }

  .depth-selector-horizontal {
    @apply flex-col;
  }

  .dimensions-horizontal {
    @apply flex-col;
  }
}

/* ========================================
   微交互动画
======================================== */

.form-section {
  animation: slideUp 0.5s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.contact-card:hover,
.depth-option-horizontal:hover,
.dimension-card:hover,
.dimension-chip:hover {
  transform: translateY(-1px);
}

.preset-btn:hover,
.quick-btn:hover {
  transform: translateY(-1px);
}

/* ========================================
   焦点和无障碍样式
======================================== */

.preset-btn:focus,
.contact-card:focus,
.depth-option-horizontal:focus,
.dimension-card:focus,
.dimension-chip:focus {
  @apply outline-none ring-2 ring-primary-500 ring-offset-2;
}

.date-input:focus,
.search-input:focus,
.model-select:focus {
  @apply outline-none;
}
</style>
