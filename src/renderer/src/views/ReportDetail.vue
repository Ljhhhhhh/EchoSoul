<template>
  <div class="report-detail">
    <!-- Report Header -->
    <header class="report-header">
      <div class="header-content">
        <div class="header-left">
          <Button variant="text" size="sm" icon="arrow-left" @click="goBack"> 返回 </Button>
          <div class="report-meta">
            <h1 class="text-headline-medium text-neutral-800">
              {{ report?.title || '加载中...' }}
            </h1>
            <div class="meta-info">
              <span class="text-body-small text-neutral-500">
                {{ report ? formatDate(report.createdAt) : '' }}
              </span>
              <Badge v-if="report" :variant="getStatusVariant(report.status)">
                {{ getStatusText(report.status) }}
              </Badge>
              <span class="text-body-small text-neutral-500">
                {{ report ? `${report.metadata.readingTime} 分钟阅读` : '' }}
              </span>
            </div>
          </div>
        </div>

        <div class="header-actions">
          <Button variant="text" size="sm" icon="share">分享</Button>
          <Button variant="text" size="sm" icon="download">导出</Button>
          <Button variant="text" size="sm" icon="more-horizontal">更多</Button>
        </div>
      </div>

      <!-- Reading Progress -->
      <div class="reading-progress">
        <div class="progress-bar" :style="{ width: `${readingProgress}%` }"></div>
      </div>
    </header>

    <!-- Main Content -->
    <div class="report-content">
      <!-- Chapter Navigation Sidebar -->
      <aside class="chapter-navigation">
        <div class="nav-header">
          <h3 class="text-title-small text-neutral-800">目录</h3>
          <div class="reading-stats">
            <div class="stat-item">
              <Icon name="clock" :size="16" />
              <span class="text-body-small">{{ readingTimeRemaining }}分钟</span>
            </div>
            <div class="stat-item">
              <Icon name="check-circle" :size="16" />
              <span class="text-body-small">{{ completedChapters }}/{{ totalChapters }}</span>
            </div>
          </div>
        </div>

        <nav class="chapter-list">
          <div
            v-for="chapter in report?.chapters || []"
            :key="chapter.id"
            class="chapter-item"
            :class="{
              active: activeChapter === chapter.id,
              completed: chapter.isRead
            }"
            @click="scrollToChapter(chapter.id)"
          >
            <div class="chapter-indicator">
              <Icon v-if="chapter.isRead" name="check" :size="16" class="text-success" />
              <span v-else class="chapter-number">{{ chapter.order }}</span>
            </div>
            <div class="chapter-info">
              <div class="chapter-title">{{ chapter.title }}</div>
              <div class="chapter-time">{{ chapter.readingTime }}分钟</div>
            </div>
          </div>
        </nav>
      </aside>

      <!-- Report Content Area -->
      <main class="content-area">
        <div v-if="isLoading" class="loading-state">
          <Icon name="loader-2" :size="32" class="animate-spin" />
          <p class="mt-4 text-body-medium text-neutral-600">加载报告内容...</p>
        </div>

        <div v-else-if="error" class="error-state">
          <Icon name="alert-circle" :size="32" class="text-error" />
          <h3 class="mt-4 text-title-medium text-neutral-800">加载失败</h3>
          <p class="mt-2 text-body-medium text-neutral-600">{{ error }}</p>
          <Button variant="primary" size="md" class="mt-4" @click="retryLoad"> 重试 </Button>
        </div>

        <article v-else class="report-article">
          <!-- Report Summary -->
          <section class="report-summary">
            <div class="summary-card">
              <h2 class="mb-4 text-title-large text-neutral-800">报告摘要</h2>
              <p class="leading-relaxed text-body-large text-neutral-700">
                {{ report?.summary }}
              </p>

              <!-- Key Metrics -->
              <div class="key-metrics">
                <div class="metric-item">
                  <div class="metric-value">{{ report?.participants.length || 0 }}</div>
                  <div class="metric-label">参与者</div>
                </div>
                <div class="metric-item">
                  <div class="metric-value">{{ report?.metadata.dataPoints || 0 }}</div>
                  <div class="metric-label">数据点</div>
                </div>
                <div class="metric-item">
                  <div class="metric-value">{{ report?.metadata.wordCount || 0 }}</div>
                  <div class="metric-label">字数</div>
                </div>
              </div>
            </div>
          </section>

          <!-- Report Chapters -->
          <div class="chapters-content">
            <section
              v-for="chapter in report?.chapters || []"
              :id="`chapter-${chapter.id}`"
              :key="chapter.id"
              :ref="(el) => (chapterRefs[chapter.id] = el as HTMLElement)"
              class="chapter-section"
            >
              <header class="chapter-header">
                <h2 class="text-headline-small text-neutral-800">
                  {{ chapter.title }}
                </h2>
                <div class="chapter-meta">
                  <span class="text-body-small text-neutral-500"> 第 {{ chapter.order }} 章 </span>
                  <span class="text-body-small text-neutral-500">
                    {{ chapter.readingTime }} 分钟阅读
                  </span>
                </div>
              </header>

              <div class="chapter-content">
                <div class="content-text" v-html="formatContent(chapter.content)"></div>

                <!-- Chapter Subsections -->
                <div v-if="chapter.subsections.length > 0" class="subsections">
                  <div
                    v-for="subsection in chapter.subsections"
                    :key="subsection.id"
                    class="subsection"
                  >
                    <h3 class="mb-3 text-title-medium text-neutral-800">
                      {{ subsection.title }}
                    </h3>
                    <div
                      class="subsection-content"
                      v-html="formatContent(subsection.content)"
                    ></div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <!-- Chapter Navigation -->
          <nav class="chapter-nav">
            <Button
              v-if="previousChapter"
              variant="secondary"
              size="md"
              icon="chevron-left"
              @click="goToPreviousChapter"
            >
              上一章: {{ previousChapter.title }}
            </Button>

            <Button
              v-if="nextChapter"
              variant="primary"
              size="md"
              icon="chevron-right"
              icon-position="right"
              @click="goToNextChapter"
            >
              下一章: {{ nextChapter.title }}
            </Button>
          </nav>
        </article>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import Button from '@renderer/components/design-system/Button.vue'
import Icon from '@renderer/components/design-system/Icon.vue'
import Badge from '@renderer/components/ui/badge.vue'
import type { ReportData } from '@renderer/types/pages'

// Router
const router = useRouter()

// Props
const props = defineProps<{
  id: string
}>()

// Reactive state
const report = ref<ReportData | null>(null)
const isLoading = ref(true)
const error = ref<string | null>(null)
const activeChapter = ref<string>('')
const readingProgress = ref(0)
const chapterRefs = ref<Record<string, HTMLElement>>({})

// Computed properties
const completedChapters = computed(() => report.value?.chapters.filter((c) => c.isRead).length || 0)

const totalChapters = computed(() => report.value?.chapters.length || 0)

const readingTimeRemaining = computed(() => {
  if (!report.value) return 0
  const unreadChapters = report.value.chapters.filter((c) => !c.isRead)
  return unreadChapters.reduce((total, chapter) => total + chapter.readingTime, 0)
})

const currentChapterIndex = computed(() => {
  if (!report.value || !activeChapter.value) return -1
  return report.value.chapters.findIndex((c) => c.id === activeChapter.value)
})

const previousChapter = computed(() => {
  if (currentChapterIndex.value <= 0) return null
  return report.value?.chapters[currentChapterIndex.value - 1] || null
})

const nextChapter = computed(() => {
  if (!report.value || currentChapterIndex.value >= report.value.chapters.length - 1) return null
  return report.value.chapters[currentChapterIndex.value + 1] || null
})

// Methods
const goBack = () => {
  router.push('/main')
}

const loadReport = async () => {
  try {
    isLoading.value = true
    error.value = null

    // TODO: Implement actual report loading
    // const reportData = await reportService.getReport(props.id)
    // report.value = reportData

    // Mock data for now
    setTimeout(() => {
      // Mock report data would be loaded here using props.id
      console.log('Loading report with ID:', props.id)
      isLoading.value = false
    }, 1000)
  } catch (err) {
    error.value = err instanceof Error ? err.message : '加载报告失败'
    isLoading.value = false
  }
}

const retryLoad = () => {
  loadReport()
}

const scrollToChapter = (chapterId: string) => {
  const element = chapterRefs.value[chapterId]
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
    activeChapter.value = chapterId
  }
}

const goToPreviousChapter = () => {
  if (previousChapter.value) {
    scrollToChapter(previousChapter.value.id)
  }
}

const goToNextChapter = () => {
  if (nextChapter.value) {
    scrollToChapter(nextChapter.value.id)
  }
}

const formatContent = (content: string) => {
  // Basic content formatting
  return content.replace(/\n/g, '<br>')
}

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
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

const handleScroll = () => {
  // Update reading progress and active chapter based on scroll position
  const scrollTop = window.scrollY
  const documentHeight = document.documentElement.scrollHeight - window.innerHeight
  readingProgress.value = Math.min((scrollTop / documentHeight) * 100, 100)

  // Find active chapter
  const chapters = Object.entries(chapterRefs.value)
  for (const [chapterId, element] of chapters) {
    if (element) {
      const rect = element.getBoundingClientRect()
      if (rect.top <= 100 && rect.bottom > 100) {
        activeChapter.value = chapterId
        break
      }
    }
  }
}

// Lifecycle
onMounted(async () => {
  await loadReport()
  window.addEventListener('scroll', handleScroll)

  // Set initial active chapter
  nextTick(() => {
    if (report.value?.chapters.length) {
      activeChapter.value = report.value.chapters[0].id
    }
  })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped></style>
