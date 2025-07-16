<template>
  <div class="initialization-container">
    <!-- 全窗口渐变背景 - 应用品牌色彩系统 -->
    <div
      class="inset-0 overflow-hidden bg-gradient-to-br from-primary-50 via-white to-secondary-50 animate-fade-in"
    >
      <!-- 背景装饰元素 -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          class="absolute rounded-full -top-40 -right-40 w-80 h-80 bg-primary-100 opacity-20 animate-pulse"
        ></div>
        <div
          class="absolute rounded-full -bottom-40 -left-40 w-80 h-80 bg-secondary-100 opacity-20 animate-pulse"
          style="animation-delay: 1s"
        ></div>
        <div
          class="absolute rounded-full top-1/4 left-1/4 w-60 h-60 bg-secondary-100 opacity-10 animate-pulse"
          style="animation-delay: 2s"
        ></div>
        <div
          class="absolute w-40 h-40 rounded-full bottom-1/4 right-1/4 bg-primary-100 opacity-15 animate-pulse"
          style="animation-delay: 3s"
        ></div>
      </div>

      <!-- 全窗口布局容器 -->
      <div class="relative flex flex-col">
        <!-- 主初始化内容区域 -->
        <div class="flex flex-col justify-center flex-1 main-content">
          <!-- 内容卡片 -->
          <div
            class="relative w-full mx-auto border main-card bg-white/95 backdrop-blur-sm shadow-strong border-primary-200/50 animate-scale-in"
          >
            <!-- 卡片头部 - 品牌标识区域 -->
            <header class="p-8 text-center border-b card-header border-neutral-100/80">
              <div class="mb-6 brand-section">
                <!-- 品牌Logo区域 -->
                <div class="relative mb-4">
                  <div
                    class="inline-flex items-center justify-center w-16 h-16 mb-4 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl shadow-medium"
                  >
                    <span class="text-2xl font-bold text-white">E</span>
                  </div>
                </div>

                <h1
                  class="mb-3 text-4xl font-bold tracking-tight text-transparent bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text"
                >
                  EchoSoul
                </h1>

                <div
                  class="flex items-center justify-center mb-2 space-x-3 text-lg text-neutral-600"
                >
                  <div
                    class="w-12 h-px bg-gradient-to-r from-transparent via-primary-300 to-transparent"
                  ></div>
                  <span class="px-3 py-1 font-medium rounded-full bg-primary-50 text-primary-700"
                    >初始化</span
                  >
                  <div
                    class="w-12 h-px bg-gradient-to-r from-transparent via-primary-300 to-transparent"
                  ></div>
                </div>
              </div>

              <p class="mx-auto text-base leading-relaxed text-neutral-600">
                正在准备您的聊天记录分析环境，开启
                <span class="font-medium text-primary-600">内省之美</span>，
                <span class="font-medium text-secondary-600">洞察之光</span>
                的自我探索之旅...
              </p>
            </header>

            <!-- 卡片内容区域 -->
            <div class="p-8 space-y-8 card-content">
              <!-- 步骤列表区域 -->
              <section class="space-y-3 steps-section">
                <div
                  v-for="(stepInfo, step, index) in state?.steps"
                  :key="step"
                  class="relative step-card group"
                  :class="getStepCardClasses(stepInfo)"
                  :style="{ animationDelay: `${index * 100}ms` }"
                >
                  <!-- 步骤连接线 -->
                  <div
                    v-if="index < Object.keys(state?.steps || {}).length - 1"
                    class="absolute z-0 w-px h-6 left-6 top-16 bg-gradient-to-b from-neutral-200 to-transparent"
                    :class="{
                      'from-primary-300 to-primary-100': stepInfo.status === 'success',
                      'from-primary-500 to-primary-300': stepInfo.status === 'in_progress'
                    }"
                  ></div>

                  <!-- 步骤头部 -->
                  <div class="relative z-10 flex items-start justify-between step-header">
                    <div class="flex items-start flex-1 space-x-4 step-main">
                      <!-- 步骤图标 -->
                      <div class="relative flex-shrink-0 step-icon-container">
                        <div
                          class="flex items-center justify-center w-12 h-12 text-lg font-semibold transition-all duration-300 shadow-sm step-icon rounded-xl"
                          :class="getStepIconClasses(stepInfo.status)"
                        >
                          <span class="step-icon-content">{{ getStepIcon(stepInfo.status) }}</span>
                        </div>

                        <!-- 进度环 -->
                        <div
                          v-if="stepInfo.status === 'in_progress'"
                          class="absolute -inset-1 rounded-xl"
                        >
                          <div
                            class="absolute inset-0 border-2 rounded-xl border-primary-200 animate-pulse"
                          ></div>
                          <div
                            class="absolute inset-0 transition-all duration-500 border-2 rounded-xl border-primary-500"
                            :style="{
                              background: `conic-gradient(from 0deg, #0084ff ${(stepInfo.progress || 0) * 3.6}deg, transparent ${(stepInfo.progress || 0) * 3.6}deg)`
                            }"
                          ></div>
                        </div>

                        <!-- 成功光环 -->
                        <div
                          v-if="stepInfo.status === 'success'"
                          class="absolute -inset-2 rounded-xl bg-gradient-to-r from-success/20 to-primary-500/20 animate-pulse"
                        ></div>
                      </div>

                      <!-- 步骤信息 -->
                      <div class="flex-1 min-w-0 step-info">
                        <div class="flex items-center mb-2 space-x-2">
                          <h3 class="text-base font-semibold truncate step-title text-neutral-800">
                            {{ stepInfo.title }}
                          </h3>
                          <div v-if="stepInfo.status === 'in_progress'" class="flex space-x-1">
                            <div class="w-1 h-1 rounded-full bg-primary-500 animate-bounce"></div>
                            <div
                              class="w-1 h-1 rounded-full bg-primary-500 animate-bounce"
                              style="animation-delay: 0.1s"
                            ></div>
                            <div
                              class="w-1 h-1 rounded-full bg-primary-500 animate-bounce"
                              style="animation-delay: 0.2s"
                            ></div>
                          </div>
                        </div>
                        <p class="text-sm leading-relaxed step-description text-neutral-600">
                          {{ stepInfo.description }}
                        </p>

                        <!-- 进度条（仅在进行中时显示） -->
                        <div
                          v-if="stepInfo.status === 'in_progress' && stepInfo.progress"
                          class="mt-3"
                        >
                          <div class="flex items-center justify-between mb-1">
                            <span class="text-xs text-neutral-500">进度</span>
                            <span class="text-xs font-medium text-primary-600"
                              >{{ stepInfo.progress }}%</span
                            >
                          </div>
                          <div class="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                            <div
                              class="h-full transition-all duration-300 rounded-full bg-gradient-to-r from-primary-400 to-primary-500"
                              :style="{ width: `${stepInfo.progress}%` }"
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- 步骤状态 -->
                    <div class="flex-shrink-0 ml-4 step-status">
                      <span
                        class="status-badge inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-200"
                        :class="getStatusBadgeClasses(stepInfo.status)"
                      >
                        {{ getStatusText(stepInfo.status) }}
                      </span>
                    </div>
                  </div>

                  <!-- 错误信息展示 -->
                  <div
                    v-if="stepInfo.error"
                    class="p-4 mt-4 border shadow-sm step-error bg-gradient-to-r from-error-light to-error-light/80 border-error/30 rounded-xl animate-slide-up"
                  >
                    <div class="flex items-start space-x-3">
                      <div
                        class="error-icon w-6 h-6 bg-error/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                      >
                        <span class="text-sm">⚠️</span>
                      </div>
                      <div class="flex-1 min-w-0 error-content">
                        <p class="mb-1 text-sm font-semibold text-error-dark">操作失败</p>
                        <p class="text-sm leading-relaxed text-error-dark/90">
                          {{ stepInfo.error }}
                        </p>
                      </div>
                    </div>
                  </div>

                  <!-- 用户操作区域（仅在需要用户输入时显示） -->
                  <div
                    v-if="stepInfo.status === 'waiting_user_input' && step === 'selecting_workdir'"
                    class="mt-4 step-actions animate-slide-up"
                  >
                    <button
                      class="action-button w-full px-4 py-3 bg-gradient-to-r from-success to-success-dark text-white rounded-xl font-medium transition-all duration-200 hover:shadow-medium hover:-translate-y-0.5 flex items-center justify-center space-x-2"
                      @click="selectWorkDir"
                    >
                      <span class="text-lg">📁</span>
                      <span>选择数据保存目录</span>
                    </button>
                  </div>
                </div>
              </section>

              <!-- 重要提示区域 -->
              <section class="warning-section">
                <div
                  class="p-5 border shadow-sm warning-card bg-gradient-to-r from-warning-light via-warning-light/90 to-warning-light/80 border-warning/30 rounded-xl"
                >
                  <div class="flex items-start space-x-4">
                    <div
                      class="warning-icon w-8 h-8 bg-warning/10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                    >
                      <span class="text-lg">⚠️</span>
                    </div>
                    <div class="flex-1 warning-content">
                      <h4
                        class="flex items-center mb-2 space-x-2 text-sm font-semibold text-warning-dark"
                      >
                        <span>重要提示</span>
                        <div class="w-2 h-2 rounded-full bg-warning-dark animate-pulse"></div>
                      </h4>
                      <p class="text-sm leading-relaxed text-warning-dark/90">
                        初始化过程中请勿关闭应用程序，这可能导致数据损坏或配置丢失。整个过程通常需要2-5分钟，请耐心等待。
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <!-- 全局重试按钮区域 -->
              <section v-if="hasError" class="retry-section">
                <div
                  class="p-4 border retry-card bg-gradient-to-r from-neutral-50 to-neutral-100/50 border-neutral-200 rounded-xl"
                >
                  <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                      <div class="flex items-center justify-center w-8 h-8 rounded-lg bg-error/10">
                        <span class="text-sm">🔄</span>
                      </div>
                      <div>
                        <p class="text-sm font-medium text-neutral-800">初始化遇到问题</p>
                        <p class="text-xs text-neutral-600">点击重试按钮重新开始初始化流程</p>
                      </div>
                    </div>
                    <button
                      class="retry-button px-6 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg font-medium transition-all duration-200 hover:shadow-medium hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center space-x-2"
                      :disabled="isRetrying"
                      @click="retryInitialization"
                    >
                      <div
                        v-if="isRetrying"
                        class="w-4 h-4 border-2 rounded-full border-white/30 border-t-white animate-spin"
                      ></div>
                      <span>{{ isRetrying ? '重试中...' : '重试初始化' }}</span>
                    </button>
                  </div>
                </div>
              </section>
            </div>

            <!-- 卡片页脚 -->
            <footer
              class="flex items-center justify-between p-8 border-t card-footer border-neutral-100/80 bg-gradient-to-r from-neutral-50/80 to-neutral-100/50"
            >
              <button
                class="flex items-center px-3 py-2 space-x-2 text-sm transition-all duration-200 rounded-lg diagnostics-button text-neutral-500 hover:text-neutral-700 group hover:bg-neutral-100"
                @click="showDiagnostics = true"
              >
                <div
                  class="flex items-center justify-center w-5 h-5 transition-colors rounded-lg bg-neutral-200 group-hover:bg-neutral-300"
                >
                  <span class="text-xs">🔍</span>
                </div>
                <span>查看诊断信息</span>
              </button>

              <div
                v-if="state?.isCompleted"
                class="flex items-center space-x-4 completion-status animate-scale-in"
              >
                <div class="relative completion-animation">
                  <div
                    class="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-success to-success-dark rounded-xl shadow-medium"
                  >
                    <span class="text-xl">🎉</span>
                  </div>
                  <div
                    class="absolute -inset-1 bg-gradient-to-r from-success/30 to-success-dark/30 rounded-xl animate-pulse"
                  ></div>
                </div>
                <div class="completion-text">
                  <div class="flex items-center mb-1 space-x-2">
                    <span
                      class="text-base font-bold text-transparent bg-gradient-to-r from-success to-success-dark bg-clip-text"
                    >
                      初始化完成！
                    </span>
                    <div class="flex space-x-1">
                      <div class="w-1 h-1 rounded-full bg-success animate-bounce"></div>
                      <div
                        class="w-1 h-1 rounded-full bg-success animate-bounce"
                        style="animation-delay: 0.1s"
                      ></div>
                      <div
                        class="w-1 h-1 rounded-full bg-success animate-bounce"
                        style="animation-delay: 0.2s"
                      ></div>
                    </div>
                  </div>
                  <p class="flex items-center space-x-1 text-sm text-success/90">
                    <span>即将进入主应用</span>
                    <span class="animate-pulse">✨</span>
                  </p>
                </div>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </div>

    <!-- 诊断信息模态框 -->
    <div
      v-if="showDiagnostics"
      class="fixed inset-0 z-50 flex items-center justify-center diagnostics-modal bg-black/50 backdrop-blur-sm animate-fade-in"
      @click="showDiagnostics = false"
    >
      <div
        class="modal-content bg-white rounded-xl max-w-4xl max-h-[80vh] w-full mx-4 flex flex-col shadow-strong animate-scale-in"
        @click.stop
      >
        <!-- 模态框头部 -->
        <div class="flex items-center justify-between p-6 border-b modal-header border-neutral-200">
          <div class="modal-title-section">
            <h2 class="text-xl font-semibold text-neutral-800">系统诊断报告</h2>
            <p class="mt-1 text-sm text-neutral-500">详细的系统状态和配置信息</p>
          </div>
          <button
            class="flex items-center justify-center w-8 h-8 transition-all duration-200 rounded-lg close-button text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100"
            @click="showDiagnostics = false"
          >
            <span class="text-lg">✕</span>
          </button>
        </div>

        <!-- 模态框内容 -->
        <div class="flex-1 p-6 overflow-y-auto modal-body">
          <div class="diagnostics-content">
            <pre
              class="p-4 font-mono text-sm leading-relaxed whitespace-pre-wrap border rounded-lg diagnostics-text bg-neutral-50 border-neutral-200"
              >{{ diagnosticsReport || '正在加载诊断信息...' }}</pre
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

// 使用主进程定义的类型
interface InitializationStep {
  step: string
  status: 'pending' | 'in_progress' | 'success' | 'error' | 'waiting_user_input'
  progress: number
  title: string
  description: string
  error?: string
  canRetry?: boolean
  userAction?: string
}

interface InitializationState {
  currentStep: string
  steps: Record<string, InitializationStep>
  overallProgress: number
  isCompleted: boolean
  canExit: boolean
}

const router = useRouter()

// 响应式状态
const state = ref<InitializationState | null>(null)
const isRetrying = ref(false)
const showDiagnostics = ref(false)
const diagnosticsReport = ref('')

// 计算属性
const overallProgress = computed(() => state.value?.overallProgress || 0)

// 检查是否有错误
const hasError = computed(() => {
  if (!state.value?.steps) return false
  return Object.values(state.value.steps).some((step) => step.status === 'error')
})

// 样式计算方法
const getStepCardClasses = (stepInfo: InitializationStep) => {
  const baseClasses =
    'p-5 rounded-xl border transition-all duration-300 animate-slide-up hover:shadow-soft'

  switch (stepInfo.status) {
    case 'in_progress':
      return `${baseClasses} border-primary-300/50 bg-gradient-to-br from-primary-50/80 to-primary-100/50 shadow-soft`
    case 'success':
      return `${baseClasses} border-success/30 bg-gradient-to-br from-success-light/60 to-success-light/40`
    case 'error':
      return `${baseClasses} border-error/30 bg-gradient-to-br from-error-light/60 to-error-light/40`
    case 'waiting_user_input':
      return `${baseClasses} border-warning/30 bg-gradient-to-br from-warning-light/60 to-warning-light/40`
    default:
      return `${baseClasses} border-neutral-200/50 bg-gradient-to-br from-neutral-50/80 to-neutral-100/50`
  }
}

const getStepIconClasses = (status: string) => {
  switch (status) {
    case 'in_progress':
      return 'bg-gradient-to-br from-primary-400 to-primary-500 text-white border-primary-300'
    case 'success':
      return 'bg-gradient-to-br from-success to-success-dark text-white border-success/30'
    case 'error':
      return 'bg-gradient-to-br from-error to-error-dark text-white border-error/30'
    case 'waiting_user_input':
      return 'bg-gradient-to-br from-warning to-warning-dark text-white border-warning/30'
    default:
      return 'bg-gradient-to-br from-neutral-300 to-neutral-400 text-neutral-600 border-neutral-200'
  }
}

const getStatusBadgeClasses = (status: string) => {
  switch (status) {
    case 'in_progress':
      return 'bg-primary-100 text-primary-700 border-primary-200/50'
    case 'success':
      return 'bg-success-light text-success-dark border-success/30'
    case 'error':
      return 'bg-error-light text-error-dark border-error/30'
    case 'waiting_user_input':
      return 'bg-warning-light text-warning-dark border-warning/30'
    default:
      return 'bg-neutral-100 text-neutral-600 border-neutral-200/50'
  }
}

// 获取步骤图标
const getStepIcon = (status: string) => {
  switch (status) {
    case 'success':
      return '✓'
    case 'in_progress':
      return '⟳'
    case 'error':
      return '✕'
    case 'waiting_user_input':
      return '⚠'
    default:
      return '○'
  }
}

// 获取状态文本
const getStatusText = (status: string) => {
  switch (status) {
    case 'success':
      return '已完成'
    case 'in_progress':
      return '进行中'
    case 'error':
      return '失败'
    case 'waiting_user_input':
      return '等待操作'
    case 'pending':
      return '等待中'
    default:
      return '未知'
  }
}

// 重试整个初始化流程
const retryInitialization = async () => {
  isRetrying.value = true
  try {
    // 重新启动初始化流程
    await window.api.initialization.start()
  } catch (error) {
    console.error('重试初始化失败:', error)
  } finally {
    isRetrying.value = false
  }
}

// 选择工作目录
const selectWorkDir = async () => {
  try {
    const result = await window.api.initialization.selectWorkDir()
    if (result.success) {
      console.log('工作目录选择成功:', result.workDir)
    } else {
      console.error('选择目录失败:', result.error)
    }
  } catch (error) {
    console.error('选择目录失败:', error)
  }
}

// 获取诊断信息
const getDiagnostics = async () => {
  try {
    const result = await window.api.initialization.getDiagnostics()
    if (result.success) {
      diagnosticsReport.value = result.report || '无诊断信息'
    } else {
      diagnosticsReport.value = `获取诊断信息失败: ${result.error}`
    }
  } catch (error) {
    diagnosticsReport.value = `获取诊断信息失败: ${error}`
  }
}

// 生命周期钩子
onMounted(async () => {
  // 获取诊断信息
  await getDiagnostics()

  // 注册事件监听器
  window.api.initialization.onStateChanged((newState: any) => {
    state.value = newState
  })

  window.api.initialization.onCompleted(() => {
    // 初始化完成后导航到主应用
    // setTimeout(() => {
    //   router.push('/main')
    // }, 2000)
  })

  window.api.initialization.onError((error: any) => {
    console.error('初始化错误:', error)
  })

  // 启动初始化
  try {
    await window.api.initialization.start()
  } catch (error) {
    console.error('启动初始化失败:', error)
  }
})

onUnmounted(() => {
  // 清理事件监听器
  window.api.initialization.removeAllListeners()
})
</script>

<style scoped>
/* 基于设计系统的自定义动画 */
@keyframes shimmer {
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
}

@keyframes breathe {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.05);
    opacity: 1;
  }
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

.animate-shimmer {
  background: linear-gradient(
    90deg,
    transparent 25%,
    rgba(255, 255, 255, 0.4) 50%,
    transparent 75%
  );
  background-size: 200px 100%;
  animation: shimmer 1.5s infinite;
}

/* 背景装饰动画 */
.absolute.-top-40.-right-40 {
  animation: float 6s ease-in-out infinite;
}

.absolute.-bottom-40.-left-40 {
  animation: float 8s ease-in-out infinite reverse;
}

/* 步骤卡片高级悬停效果 */
.step-card {
  position: relative;
  overflow: hidden;
}

.step-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0, 132, 255, 0.1), transparent);
  transition: left 0.5s;
}

.step-card:hover::before {
  left: 100%;
}

.step-card:hover {
  transform: translateY(-2px) scale(1.01);
  box-shadow: 0 12px 32px rgba(0, 132, 255, 0.15);
}

/* 按钮高级悬停效果 */
.retry-button,
.action-button {
  position: relative;
  overflow: hidden;
}

.retry-button::before,
.action-button::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition:
    width 0.3s ease,
    height 0.3s ease;
}

.retry-button:active::before,
.action-button:active::before {
  width: 200px;
  height: 200px;
}

.retry-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 132, 255, 0.4);
}

.action-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(16, 185, 129, 0.4);
}

/* 诊断按钮微交互 */
.diagnostics-button {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.diagnostics-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 模态框高级效果 */
.diagnostics-modal {
  backdrop-filter: blur(12px);
  background: rgba(0, 0, 0, 0.4);
}

/* 进度条高级动画 */
.progress-bar {
  position: relative;
  overflow: hidden;
}

.progress-bar::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5), transparent);
  animation: shimmer 2s infinite;
}

/* 完成状态高级动画 */
.completion-status {
  animation: breathe 3s ease-in-out infinite;
}

.completion-animation {
  animation: float 4s ease-in-out infinite;
}

/* 响应式设计优化 */
@media (max-width: 768px) {
  .main-card {
    margin: 0.75rem;
    border-radius: 1.25rem;
    max-width: none;
  }

  .card-header {
    padding: 1.5rem 1.25rem;
  }

  .card-content {
    padding: 1.5rem 1.25rem;
  }

  .card-footer {
    padding: 1.5rem 1.25rem;
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .step-card {
    padding: 1rem;
  }

  .step-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .step-status {
    align-self: flex-start;
    margin-top: 0.5rem;
  }

  .step-main {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .step-icon-container {
    align-self: center;
  }

  .progress-section .flex {
    flex-direction: column;
    gap: 0.5rem;
    align-items: stretch;
  }

  .brand-section h1 {
    font-size: 2.5rem;
  }

  .completion-status {
    flex-direction: column;
    text-align: center;
    gap: 0.75rem;
  }
}

@media (max-width: 480px) {
  .main-card {
    margin: 0.5rem;
    border-radius: 1rem;
  }

  .card-header,
  .card-content,
  .card-footer {
    padding: 1rem;
  }

  .brand-section h1 {
    font-size: 2rem;
  }

  .step-card {
    padding: 0.75rem;
  }
}

/* 深色模式支持 */
@media (prefers-color-scheme: dark) {
  .main-card {
    background: rgba(15, 23, 42, 0.95);
    border-color: rgba(51, 65, 85, 0.5);
  }

  .modal-content {
    background: rgb(15, 23, 42);
    border-color: rgb(51, 65, 85);
  }

  .card-header {
    border-color: rgba(51, 65, 85, 0.8);
  }

  .card-footer {
    border-color: rgba(51, 65, 85, 0.8);
    background: rgba(30, 41, 59, 0.5);
  }
}

/* 高对比度模式支持 */
@media (prefers-contrast: high) {
  .step-card {
    border-width: 2px;
  }

  .status-badge {
    border-width: 2px;
  }

  .progress-bar {
    border: 1px solid currentColor;
  }
}

/* 减少动画模式支持 */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }

  .step-card:hover {
    transform: none;
  }

  .retry-button:hover:not(:disabled),
  .action-button:hover {
    transform: none;
  }
}

/* 全窗口布局样式 */
.initialization-container {
  font-family:
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    sans-serif;
  line-height: 1.6;
  color: #374151;
  height: 100vh;
  overflow: hidden;
}

.main-content {
  min-height: 100vh;
}

.main-card {
  min-height: 70vh;
  max-height: 90vh;
  overflow-y: auto;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .main-content {
    padding: 1rem;
  }

  .main-card {
    min-height: 80vh;
    max-height: 95vh;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 0.5rem;
  }

  .main-card {
    min-height: 85vh;
    max-height: 98vh;
    border-radius: 1rem;
  }
}
</style>
