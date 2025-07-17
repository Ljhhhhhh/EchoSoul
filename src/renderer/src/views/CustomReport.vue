<template>
  <div class="custom-report">
    <!-- Wizard Header -->
    <header class="wizard-header">
      <div class="header-content">
        <div class="header-left">
          <Button variant="text" size="sm" icon="arrow-left" @click="goBack"> 返回 </Button>
          <div class="header-title">
            <h1 class="text-headline-medium text-neutral-800">生成自定义报告</h1>
            <p class="text-body-medium text-neutral-600">根据您的需求定制专属的分析报告</p>
          </div>
        </div>

        <div class="header-actions">
          <Button variant="text" size="sm" icon="help-circle" @click="showHelp"> 帮助 </Button>
        </div>
      </div>
    </header>

    <!-- Step Indicator -->
    <div class="step-indicator">
      <div class="steps-container">
        <div
          v-for="step in wizardSteps"
          :key="step.id"
          class="step-item"
          :class="{
            active: step.isActive,
            completed: step.isCompleted,
            invalid: !step.isValid && step.isActive
          }"
        >
          <div class="step-circle">
            <Icon v-if="step.isCompleted" name="check" :size="16" />
            <span v-else>{{ step.order }}</span>
          </div>
          <div class="step-content">
            <div class="step-title">{{ step.title }}</div>
            <div class="step-description">{{ step.description }}</div>
          </div>
        </div>
      </div>

      <!-- Progress Bar -->
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: `${overallProgress}%` }"></div>
      </div>
    </div>

    <!-- Wizard Content -->
    <div class="wizard-content">
      <!-- Main Step Content -->
      <main class="step-content-area">
        <!-- Step 1: Time Range Selection -->
        <div v-if="currentStep === 1" class="step-panel">
          <div class="panel-header">
            <h2 class="text-title-large text-neutral-800">选择时间范围</h2>
            <p class="text-body-medium text-neutral-600">选择您想要分析的聊天记录时间范围</p>
          </div>

          <div class="time-range-selector">
            <!-- Quick Presets -->
            <div class="preset-buttons">
              <Button
                v-for="preset in timePresets"
                :key="preset.id"
                :variant="selectedPreset === preset.id ? 'primary' : 'secondary'"
                size="sm"
                @click="selectTimePreset(preset)"
              >
                {{ preset.label }}
              </Button>
            </div>

            <!-- Custom Date Range -->
            <div class="custom-range">
              <div class="date-inputs">
                <div class="input-group">
                  <label class="text-label-medium text-neutral-700">开始日期</label>
                  <input
                    v-model="customReportConfig.timeRange.start"
                    type="date"
                    class="date-input"
                  />
                </div>
                <div class="input-group">
                  <label class="text-label-medium text-neutral-700">结束日期</label>
                  <input
                    v-model="customReportConfig.timeRange.end"
                    type="date"
                    class="date-input"
                  />
                </div>
              </div>
            </div>

            <!-- Time Range Summary -->
            <div class="range-summary">
              <div class="summary-card">
                <Icon name="calendar" :size="20" />
                <div class="summary-text">
                  <div class="summary-title">选中时间范围</div>
                  <div class="summary-value">
                    {{ formatDateRange(customReportConfig.timeRange) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 2: Participant Selection -->
        <div v-if="currentStep === 2" class="step-panel">
          <div class="panel-header">
            <h2 class="text-title-large text-neutral-800">选择分析对象</h2>
            <p class="text-body-medium text-neutral-600">选择您想要包含在分析中的聊天对象</p>
          </div>

          <div class="participant-selector">
            <!-- Search and Filter -->
            <div class="search-controls">
              <div class="search-input">
                <Icon name="search" :size="20" />
                <input
                  v-model="participantSearch"
                  type="text"
                  placeholder="搜索联系人..."
                  class="search-field"
                />
              </div>
              <div class="selection-actions">
                <Button variant="text" size="sm" @click="selectAllParticipants"> 全选 </Button>
                <Button variant="text" size="sm" @click="clearAllParticipants"> 清空 </Button>
              </div>
            </div>

            <!-- Participant List -->
            <div class="participant-list">
              <div
                v-for="contact in filteredContacts"
                :key="contact.id"
                class="participant-item"
                :class="{ selected: contact.isSelected }"
                @click="toggleParticipant(contact)"
              >
                <div class="participant-avatar">
                  <img
                    v-if="contact.avatar"
                    :src="contact.avatar"
                    :alt="contact.name"
                    class="avatar-image"
                  />
                  <div v-else class="avatar-placeholder">
                    {{ contact.name.charAt(0) }}
                  </div>
                </div>
                <div class="participant-info">
                  <div class="participant-name">{{ contact.name }}</div>
                  <div class="participant-stats">{{ contact.messageCount }} 条消息</div>
                </div>
                <div class="selection-indicator">
                  <Icon
                    v-if="contact.isSelected"
                    name="check-circle"
                    :size="20"
                    class="text-primary-500"
                  />
                  <div v-else class="selection-circle"></div>
                </div>
              </div>
            </div>

            <!-- Selection Summary -->
            <div class="selection-summary">
              <div class="summary-card">
                <Icon name="users" :size="20" />
                <div class="summary-text">
                  <div class="summary-title">已选择</div>
                  <div class="summary-value">{{ selectedParticipants.length }} 个联系人</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 3: Analysis Configuration -->
        <div v-if="currentStep === 3" class="step-panel">
          <div class="panel-header">
            <h2 class="text-title-large text-neutral-800">配置分析选项</h2>
            <p class="text-body-medium text-neutral-600">选择分析的深度和维度</p>
          </div>

          <div class="analysis-config">
            <!-- Analysis Depth -->
            <div class="config-section">
              <h3 class="mb-3 text-title-medium text-neutral-800">分析深度</h3>
              <div class="depth-options">
                <div
                  v-for="depth in analysisDepths"
                  :key="depth.id"
                  class="depth-option"
                  :class="{ selected: customReportConfig.analysisOptions.depth === depth.id }"
                  @click="selectAnalysisDepth(depth.id)"
                >
                  <div class="option-header">
                    <div class="option-title">{{ depth.name }}</div>
                    <div class="option-badge">{{ depth.duration }}</div>
                  </div>
                  <div class="option-description">{{ depth.description }}</div>
                </div>
              </div>
            </div>

            <!-- Analysis Dimensions -->
            <div class="config-section">
              <h3 class="mb-3 text-title-medium text-neutral-800">分析维度</h3>
              <div class="dimension-options">
                <div
                  v-for="dimension in analysisDimensions"
                  :key="dimension.id"
                  class="dimension-item"
                  :class="{ enabled: dimension.isEnabled }"
                  @click="toggleDimension(dimension)"
                >
                  <div class="dimension-icon">
                    <Icon :name="getDimensionIcon(dimension.id)" :size="20" />
                  </div>
                  <div class="dimension-content">
                    <div class="dimension-name">{{ dimension.name }}</div>
                    <div class="dimension-description">{{ dimension.description }}</div>
                  </div>
                  <div class="dimension-toggle">
                    <div class="toggle-switch" :class="{ active: dimension.isEnabled }">
                      <div class="toggle-handle"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <!-- Preview Sidebar -->
      <aside class="preview-sidebar">
        <div class="preview-header">
          <h3 class="text-title-medium text-neutral-800">预览</h3>
          <Badge variant="secondary">{{ getConfigStatus() }}</Badge>
        </div>

        <div class="preview-content">
          <!-- Configuration Summary -->
          <div class="config-summary">
            <div class="summary-item">
              <Icon name="calendar" :size="16" />
              <div class="summary-details">
                <div class="summary-label">时间范围</div>
                <div class="summary-value">
                  {{ formatDateRange(customReportConfig.timeRange) }}
                </div>
              </div>
            </div>

            <div class="summary-item">
              <Icon name="users" :size="16" />
              <div class="summary-details">
                <div class="summary-label">分析对象</div>
                <div class="summary-value">{{ selectedParticipants.length }} 个联系人</div>
              </div>
            </div>

            <div class="summary-item">
              <Icon name="settings" :size="16" />
              <div class="summary-details">
                <div class="summary-label">分析深度</div>
                <div class="summary-value">
                  {{ getDepthName(customReportConfig.analysisOptions.depth) }}
                </div>
              </div>
            </div>
          </div>

          <!-- Estimated Generation Time -->
          <div class="generation-estimate">
            <div class="estimate-card">
              <Icon name="clock" :size="20" />
              <div class="estimate-content">
                <div class="estimate-label">预计生成时间</div>
                <div class="estimate-value">{{ estimatedTime }} 分钟</div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>

    <!-- Wizard Navigation -->
    <footer class="wizard-footer">
      <div class="footer-content">
        <div class="footer-left">
          <Button
            v-if="currentStep > 1"
            variant="secondary"
            size="md"
            icon="chevron-left"
            @click="previousStep"
          >
            上一步
          </Button>
        </div>

        <div class="footer-right">
          <Button
            v-if="currentStep < 3"
            variant="primary"
            size="md"
            icon="chevron-right"
            icon-position="right"
            :disabled="!isCurrentStepValid"
            @click="nextStep"
          >
            下一步
          </Button>

          <Button
            v-else
            variant="primary"
            size="md"
            icon="play"
            :disabled="!isConfigurationValid"
            :loading="isGenerating"
            @click="generateReport"
          >
            生成报告
          </Button>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Button from '@renderer/components/design-system/Button.vue'
import Icon from '@renderer/components/design-system/Icon.vue'
import Badge from '@renderer/components/ui/badge.vue'
import type {
  CustomReportConfig,
  ContactInfo,
  WizardStep,
  AnalysisDimension
} from '@renderer/types/pages'

// Router
const router = useRouter()

// Reactive state
const currentStep = ref(1)
const isGenerating = ref(false)
const selectedPreset = ref('')
const participantSearch = ref('')

const customReportConfig = ref<CustomReportConfig>({
  timeRange: {
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
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

const availableContacts = ref<ContactInfo[]>([])
const analysisDimensions = ref<AnalysisDimension[]>([])

// Mock data
const timePresets = [
  { id: 'last7days', label: '最近7天', days: 7 },
  { id: 'last30days', label: '最近30天', days: 30 },
  { id: 'last90days', label: '最近3个月', days: 90 },
  { id: 'custom', label: '自定义', days: 0 }
]

const analysisDepths = [
  {
    id: 'basic',
    name: '基础分析',
    description: '快速概览，包含基本统计和趋势',
    duration: '2-3分钟'
  },
  {
    id: 'detailed',
    name: '详细分析',
    description: '深入分析，包含情感和话题洞察',
    duration: '5-8分钟'
  },
  {
    id: 'comprehensive',
    name: '全面分析',
    description: '最全面的分析，包含所有维度和深度洞察',
    duration: '10-15分钟'
  }
]

// Computed properties
const wizardSteps = computed<WizardStep[]>(() => [
  {
    id: 'timeRange',
    title: '时间范围',
    description: '选择分析时间',
    order: 1,
    isActive: currentStep.value === 1,
    isCompleted: currentStep.value > 1,
    isValid: isStep1Valid.value,
    component: 'TimeRangeStep'
  },
  {
    id: 'participants',
    title: '分析对象',
    description: '选择联系人',
    order: 2,
    isActive: currentStep.value === 2,
    isCompleted: currentStep.value > 2,
    isValid: isStep2Valid.value,
    component: 'ParticipantStep'
  },
  {
    id: 'configuration',
    title: '分析配置',
    description: '配置选项',
    order: 3,
    isActive: currentStep.value === 3,
    isCompleted: false,
    isValid: isStep3Valid.value,
    component: 'ConfigurationStep'
  }
])

const overallProgress = computed(() => {
  const completedSteps = wizardSteps.value.filter((s) => s.isCompleted).length
  const currentProgress = currentStep.value === 3 ? 1 : 0.5
  return ((completedSteps + currentProgress) / 3) * 100
})

const filteredContacts = computed(() => {
  if (!participantSearch.value) return availableContacts.value

  return availableContacts.value.filter((contact) =>
    contact.name.toLowerCase().includes(participantSearch.value.toLowerCase())
  )
})

const selectedParticipants = computed(() => availableContacts.value.filter((c) => c.isSelected))

const isStep1Valid = computed(() => {
  const { start, end } = customReportConfig.value.timeRange
  return start && end && start <= end
})

const isStep2Valid = computed(() => selectedParticipants.value.length > 0)

const isStep3Valid = computed(() => customReportConfig.value.analysisOptions.depth !== '')

const isCurrentStepValid = computed(() => {
  switch (currentStep.value) {
    case 1:
      return isStep1Valid.value
    case 2:
      return isStep2Valid.value
    case 3:
      return isStep3Valid.value
    default:
      return false
  }
})

const isConfigurationValid = computed(
  () => isStep1Valid.value && isStep2Valid.value && isStep3Valid.value
)

const estimatedTime = computed(() => {
  const depth = customReportConfig.value.analysisOptions.depth
  const participantCount = selectedParticipants.value.length

  let baseTime = 0
  switch (depth) {
    case 'basic':
      baseTime = 2
      break
    case 'detailed':
      baseTime = 5
      break
    case 'comprehensive':
      baseTime = 10
      break
  }

  return Math.max(baseTime + Math.floor(participantCount / 5), 1)
})

// Methods
const goBack = () => {
  router.push('/main')
}

const showHelp = () => {
  // Show help dialog
}

const selectTimePreset = (preset: any) => {
  selectedPreset.value = preset.id

  if (preset.id !== 'custom') {
    const end = new Date()
    const start = new Date(end.getTime() - preset.days * 24 * 60 * 60 * 1000)

    customReportConfig.value.timeRange = { start, end }
  }
}

const toggleParticipant = (contact: ContactInfo) => {
  contact.isSelected = !contact.isSelected
}

const selectAllParticipants = () => {
  filteredContacts.value.forEach((contact) => {
    contact.isSelected = true
  })
}

const clearAllParticipants = () => {
  availableContacts.value.forEach((contact) => {
    contact.isSelected = false
  })
}

const selectAnalysisDepth = (depth: string) => {
  customReportConfig.value.analysisOptions.depth = depth as any
}

const toggleDimension = (dimension: AnalysisDimension) => {
  dimension.isEnabled = !dimension.isEnabled
}

const getDimensionIcon = (dimensionId: string) => {
  const icons: Record<string, string> = {
    emotion: 'heart',
    topic: 'hash',
    timeline: 'clock',
    relationship: 'users',
    communication: 'message-circle'
  }
  return icons[dimensionId] || 'settings'
}

const nextStep = () => {
  if (currentStep.value < 3 && isCurrentStepValid.value) {
    currentStep.value++
  }
}

const previousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

const generateReport = async () => {
  if (!isConfigurationValid.value) return

  try {
    isGenerating.value = true

    // TODO: Implement actual report generation
    // const reportId = await reportService.generateCustomReport(customReportConfig.value)

    // Mock generation
    setTimeout(() => {
      isGenerating.value = false
      // router.push(`/main/report/${reportId}`)
      router.push('/main')
    }, 2000)
  } catch (error) {
    isGenerating.value = false
    console.error('Report generation failed:', error)
  }
}

const formatDateRange = (range: { start: Date; end: Date }) => {
  const formatter = new Intl.DateTimeFormat('zh-CN', {
    month: 'short',
    day: 'numeric'
  })

  return `${formatter.format(range.start)} - ${formatter.format(range.end)}`
}

const getConfigStatus = () => {
  if (isConfigurationValid.value) return '配置完成'
  if (currentStep.value === 1) return '选择时间'
  if (currentStep.value === 2) return '选择对象'
  return '配置中'
}

const getDepthName = (depth: string) => {
  const depthMap: Record<string, string> = {
    basic: '基础分析',
    detailed: '详细分析',
    comprehensive: '全面分析'
  }
  return depthMap[depth] || '未选择'
}

// Lifecycle
onMounted(async () => {
  // Load available contacts and analysis dimensions
  // TODO: Implement data loading
})
</script>

<style scoped>
.custom-report {
  @apply min-h-screen bg-neutral-50 flex flex-col;
}

.wizard-header {
  @apply bg-white border-b border-neutral-200 p-6;
}

.header-content {
  @apply flex items-center justify-between;
}

.header-left {
  @apply flex items-center space-x-4;
}

.step-indicator {
  @apply bg-white border-b border-neutral-200 p-6;
}

.steps-container {
  @apply flex items-center justify-center space-x-8 mb-4;
}

.step-item {
  @apply flex items-center space-x-3;
}

.step-circle {
  @apply w-8 h-8 rounded-full border-2 border-neutral-300 flex items-center justify-center text-sm;
}

.step-item.active .step-circle {
  @apply border-primary-500 bg-primary-500 text-white;
}

.step-item.completed .step-circle {
  @apply border-success bg-success text-white;
}

.step-item.invalid .step-circle {
  @apply border-error bg-error text-white;
}

.step-title {
  @apply text-sm font-medium text-neutral-800;
}

.step-description {
  @apply text-xs text-neutral-500;
}

.progress-bar {
  @apply w-full h-2 bg-neutral-200 rounded-full;
}

.progress-fill {
  @apply h-full bg-primary-500 rounded-full transition-all duration-500;
}

.wizard-content {
  @apply flex flex-1;
}

.step-content-area {
  @apply flex-1 p-6;
}

.step-panel {
  @apply max-w-4xl mx-auto;
}

.panel-header {
  @apply mb-8;
}

.time-range-selector {
  @apply space-y-6;
}

.preset-buttons {
  @apply flex flex-wrap gap-3;
}

.custom-range {
  @apply bg-white p-6 rounded-lg shadow-sm;
}

.date-inputs {
  @apply grid grid-cols-2 gap-4;
}

.input-group {
  @apply space-y-2;
}

.date-input {
  @apply w-full px-3 py-2 border border-neutral-300 rounded-md;
}

.range-summary,
.selection-summary,
.generation-estimate {
  @apply mt-6;
}

.summary-card,
.estimate-card {
  @apply bg-white p-4 rounded-lg shadow-sm flex items-center space-x-3;
}

.participant-selector {
  @apply space-y-6;
}

.search-controls {
  @apply flex items-center justify-between bg-white p-4 rounded-lg shadow-sm;
}

.search-input {
  @apply flex items-center space-x-2 flex-1;
}

.search-field {
  @apply flex-1 border-none outline-none;
}

.selection-actions {
  @apply flex items-center space-x-2;
}

.participant-list {
  @apply bg-white rounded-lg shadow-sm divide-y divide-neutral-200 max-h-96 overflow-y-auto;
}

.participant-item {
  @apply flex items-center space-x-4 p-4 cursor-pointer hover:bg-neutral-50;
}

.participant-item.selected {
  @apply bg-primary-50;
}

.participant-avatar {
  @apply w-10 h-10 rounded-full overflow-hidden;
}

.avatar-image {
  @apply w-full h-full object-cover;
}

.avatar-placeholder {
  @apply w-full h-full bg-neutral-300 flex items-center justify-center text-neutral-600 font-medium;
}

.participant-info {
  @apply flex-1;
}

.participant-name {
  @apply font-medium text-neutral-800;
}

.participant-stats {
  @apply text-sm text-neutral-500;
}

.selection-circle {
  @apply w-5 h-5 border-2 border-neutral-300 rounded-full;
}

.analysis-config {
  @apply space-y-8;
}

.config-section {
  @apply bg-white p-6 rounded-lg shadow-sm;
}

.depth-options {
  @apply grid grid-cols-1 md:grid-cols-3 gap-4;
}

.depth-option {
  @apply p-4 border-2 border-neutral-200 rounded-lg cursor-pointer transition-colors hover:border-neutral-300;
}

.depth-option.selected {
  @apply border-primary-500 bg-primary-50;
}

.option-header {
  @apply flex items-center justify-between mb-2;
}

.option-title {
  @apply font-medium text-neutral-800;
}

.option-badge {
  @apply text-xs bg-neutral-100 px-2 py-1 rounded;
}

.option-description {
  @apply text-sm text-neutral-600;
}

.dimension-options {
  @apply space-y-3;
}

.dimension-item {
  @apply flex items-center space-x-4 p-4 border border-neutral-200 rounded-lg cursor-pointer transition-colors hover:bg-neutral-50;
}

.dimension-item.enabled {
  @apply border-primary-500 bg-primary-50;
}

.dimension-icon {
  @apply w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center;
}

.dimension-item.enabled .dimension-icon {
  @apply bg-primary-100 text-primary-600;
}

.dimension-content {
  @apply flex-1;
}

.dimension-name {
  @apply font-medium text-neutral-800;
}

.dimension-description {
  @apply text-sm text-neutral-600;
}

.toggle-switch {
  @apply w-12 h-6 bg-neutral-300 rounded-full relative transition-colors;
}

.toggle-switch.active {
  @apply bg-primary-500;
}

.toggle-handle {
  @apply w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5 transition-transform;
}

.toggle-switch.active .toggle-handle {
  @apply transform translate-x-6;
}

.preview-sidebar {
  @apply w-80 bg-white border-l border-neutral-200 p-6;
}

.preview-header {
  @apply flex items-center justify-between mb-6;
}

.config-summary {
  @apply space-y-4;
}

.summary-item {
  @apply flex items-start space-x-3;
}

.summary-details {
  @apply flex-1;
}

.summary-label {
  @apply text-sm text-neutral-600;
}

.summary-value {
  @apply text-sm font-medium text-neutral-800;
}

.wizard-footer {
  @apply bg-white border-t border-neutral-200 p-6;
}

.footer-content {
  @apply flex items-center justify-between max-w-4xl mx-auto;
}

.footer-left,
.footer-right {
  @apply flex items-center space-x-3;
}
</style>
