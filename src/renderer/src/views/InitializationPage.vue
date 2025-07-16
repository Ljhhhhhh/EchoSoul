<template>
  <div
    class="min-h-screen duration-1000 bg-gradient-to-br from-primary-500 to-secondary-700 animate-in fade-in"
  >
    <!-- 主容器 -->
    <div class="flex flex-col min-h-screen">
      <!-- 头部区域 -->
      <div class="flex-shrink-0 pt-16 pb-8">
        <div class="container px-4 mx-auto">
          <div class="text-center duration-500 delay-500 animate-in fade-in">
            <!-- Logo 区域 -->
            <div
              class="flex items-center justify-center w-20 h-20 mx-auto mb-6 transition-all duration-300 rounded-full bg-gradient-to-br from-primary-500 to-secondary-600 shadow-elevation-2 hover:shadow-elevation-4 hover:scale-105"
            >
              <Sparkles class="w-10 h-10 text-white" />
            </div>

            <!-- 标题区域 -->
            <div class="space-y-3">
              <h1
                class="text-3xl font-bold text-white delay-700 sm:text-4xl lg:text-5xl animate-in slide-in-from-top-2 duration-600"
              >
                欢迎使用 EchoSoul
              </h1>
              <p
                class="text-lg sm:text-xl text-white/80 animate-in slide-in-from-top-2 duration-600 delay-900"
              >
                {{ getCurrentStepInfo()?.description || '正在为您初始化应用环境...' }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- 内容区域 -->
      <div class="flex-1 px-4 pb-8">
        <div class="container max-w-4xl mx-auto">
          <!-- 横向步骤指示器 -->
          <div
            v-if="state?.steps"
            class="mb-12 duration-700 delay-300 animate-in slide-in-from-bottom-4"
          >
            <div class="relative flex items-center justify-between">
              <!-- 连接线 -->
              <div class="absolute top-6 left-6 right-6 h-0.5 bg-white/30"></div>
              <div
                class="absolute top-6 left-6 h-0.5 bg-white transition-all duration-500 ease-out"
                :style="{
                  width: `${Math.max(0, (getCurrentStepIndex() / (Object.keys(state.steps).length - 1)) * 100)}%`
                }"
              ></div>

              <!-- 步骤节点 -->
              <div
                v-for="(stepInfo, stepKey) in state.steps"
                :key="stepKey"
                class="relative z-10 flex flex-col items-center"
              >
                <!-- 步骤图标 -->
                <div
                  :class="
                    cn(
                      'w-12 h-12 rounded-full border-3 flex items-center justify-center transition-all duration-300',
                      getHorizontalStepClasses(stepInfo.status)
                    )
                  "
                >
                  <component
                    :is="getStepIconComponent(stepInfo.status)"
                    :class="cn('w-6 h-6', stepInfo.status === 'in_progress' && 'animate-spin')"
                  />
                </div>

                <!-- 步骤标题 -->
                <div class="mt-3 text-center">
                  <h3 class="mb-1 text-sm font-medium text-white">
                    {{ stepInfo.title }}
                  </h3>
                  <Badge
                    :class="getHorizontalStatusBadgeClasses(stepInfo.status)"
                    variant="outline"
                    class="text-xs"
                  >
                    {{ getStatusText(stepInfo.status) }}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 操作按钮区域 -->
      <div class="flex-shrink-0 px-4 pb-8">
        <div class="container max-w-4xl mx-auto">
          <div class="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <!-- 重试按钮 -->
            <Button
              v-if="hasError"
              :disabled="isRetrying"
              variant="outline"
              size="lg"
              class="text-white bg-white/10 border-white/30 hover:bg-white/20"
              @click="retryInitialization"
            >
              <RefreshCw :class="cn('w-5 h-5 mr-2', isRetrying && 'animate-spin')" />
              {{ isRetrying ? '重试中...' : '重试' }}
            </Button>

            <!-- 选择目录按钮 -->
            <Button
              v-if="
                state?.steps &&
                Object.values(state.steps).some(
                  (step) =>
                    step.status === 'waiting_user_input' && step.step === 'selecting_workdir'
                )
              "
              variant="default"
              size="lg"
              class="bg-white text-primary-600 hover:bg-white/90"
              @click="selectWorkDir"
            >
              <FolderOpen class="w-5 h-5 mr-2" />
              选择目录
            </Button>

            <!-- 诊断信息按钮 -->
            <Button
              variant="ghost"
              size="lg"
              class="text-white/80 hover:text-white hover:bg-white/10"
              @click="showDiagnostics = !showDiagnostics"
            >
              <Info class="w-5 h-5 mr-2" />
              诊断信息
            </Button>
          </div>
        </div>
      </div>
      <!-- 诊断信息弹窗 -->
      <div v-if="showDiagnostics" class="px-4 pb-8">
        <div class="container max-w-4xl mx-auto">
          <div class="p-6 border bg-white/10 backdrop-blur-sm rounded-2xl border-white/20">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-white">系统诊断信息</h3>
              <Button
                variant="ghost"
                size="sm"
                class="text-white/80 hover:text-white hover:bg-white/10"
                @click="showDiagnostics = false"
              >
                <X class="w-4 h-4" />
              </Button>
            </div>
            <pre
              class="p-4 overflow-auto text-xs whitespace-pre-wrap rounded-md bg-black/20 text-white/90 max-h-64"
              >{{ diagnosticsReport }}</pre
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
import { cn } from '@renderer/lib/utils'

// UI 组件导入
import Card from '@renderer/components/ui/card.vue'
import CardContent from '@renderer/components/ui/card-content.vue'
import CardFooter from '@renderer/components/ui/card-footer.vue'
import CardHeader from '@renderer/components/ui/card-header.vue'
import Button from '@renderer/components/ui/button.vue'
import Progress from '@renderer/components/ui/progress.vue'
import Badge from '@renderer/components/ui/badge.vue'
import Alert from '@renderer/components/ui/alert.vue'
import AlertDescription from '@renderer/components/ui/alert-description.vue'

// 图标导入
import {
  Sparkles,
  Check,
  X,
  Loader2,
  AlertTriangle,
  Circle,
  FolderOpen,
  RefreshCw,
  Info
} from 'lucide-vue-next'

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

// 检查是否有错误
const hasError = computed(() => {
  if (!state.value?.steps) return false
  return Object.values(state.value.steps).some((step) => step.status === 'error')
})

// 获取步骤图标组件
const getStepIconComponent = (status: string) => {
  switch (status) {
    case 'success':
      return Check
    case 'in_progress':
      return Loader2
    case 'error':
      return X
    case 'waiting_user_input':
      return AlertTriangle
    default:
      return Circle
  }
}

// 获取横向步骤样式
const getHorizontalStepClasses = (status: string) => {
  switch (status) {
    case 'in_progress':
      return 'bg-white border-white text-primary-600'
    case 'success':
      return 'bg-white border-white text-green-600'
    case 'error':
      return 'bg-red-500 border-red-500 text-white'
    case 'waiting_user_input':
      return 'bg-amber-500 border-amber-500 text-white'
    default:
      return 'bg-white/20 border-white/30 text-white/60'
  }
}

// 获取横向状态徽章样式
const getHorizontalStatusBadgeClasses = (status: string) => {
  switch (status) {
    case 'in_progress':
      return 'bg-white/20 text-white border-white/30'
    case 'success':
      return 'bg-green-500/20 text-green-100 border-green-400/30'
    case 'error':
      return 'bg-red-500/20 text-red-100 border-red-400/30'
    case 'waiting_user_input':
      return 'bg-amber-500/20 text-amber-100 border-amber-400/30'
    default:
      return 'bg-white/10 text-white/60 border-white/20'
  }
}

// 获取当前步骤索引
const getCurrentStepIndex = () => {
  if (!state.value?.steps) return 0
  const steps = Object.keys(state.value.steps)
  const currentStepKey = state.value.currentStep
  return steps.indexOf(currentStepKey)
}

// 获取当前步骤信息
const getCurrentStepInfo = () => {
  if (!state.value?.steps || !state.value?.currentStep) return null
  return state.value.steps[state.value.currentStep]
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

<style scoped></style>
