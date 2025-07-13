<template>
  <div
    class="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100"
  >
    <Card class="w-full max-w-2xl">
      <CardHeader class="text-center">
        <CardTitle class="mb-2 text-3xl">EchoSoul 初始化</CardTitle>
        <p class="text-muted-foreground">正在准备您的聊天记录分析环境...</p>
      </CardHeader>

      <CardContent class="space-y-6">
        <!-- 总进度条 -->
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium">总进度</span>
            <span class="text-sm font-medium">{{ state?.overallProgress || 0 }}%</span>
          </div>
          <Progress :model-value="state?.overallProgress || 0" class="h-3" />
        </div>

        <!-- 步骤列表 -->
        <div class="mb-6 space-y-4">
          <div
            v-for="(stepInfo, step) in state?.steps"
            :key="step"
            class="p-4 transition-all duration-300 border-2 rounded-lg"
            :class="getStepClasses(stepInfo)"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <span class="text-2xl">{{ getStepIcon(stepInfo.status) }}</span>
                <div>
                  <h3 class="font-semibold text-gray-800">{{ stepInfo.title }}</h3>
                  <p class="text-sm text-gray-600">{{ stepInfo.description }}</p>
                </div>
              </div>
              <div class="text-right">
                <span class="text-sm font-medium text-gray-700">{{
                  getStatusText(stepInfo.status)
                }}</span>
                <div v-if="stepInfo.status === 'in_progress'" class="mt-1 text-xs text-gray-500">
                  {{ stepInfo.progress }}%
                </div>
              </div>
            </div>

            <!-- 错误信息 -->
            <div v-if="stepInfo.error" class="p-3 mt-3 bg-red-100 border border-red-200 rounded-md">
              <p class="text-sm text-red-700">{{ stepInfo.error }}</p>
            </div>

            <!-- 操作按钮 -->
            <div v-if="stepInfo.canRetry || stepInfo.userAction" class="flex mt-3 space-x-2">
              <button
                v-if="stepInfo.canRetry"
                @click="retryStep(step)"
                :disabled="isRetrying"
                class="px-4 py-2 text-white transition-colors bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ isRetrying ? '重试中...' : '重试' }}
              </button>
              <button
                v-if="stepInfo.userAction && step === 'selecting_workdir'"
                @click="selectWorkDir"
                class="px-4 py-2 text-white transition-colors bg-green-600 rounded-md hover:bg-green-700"
              >
                选择目录
              </button>
            </div>
          </div>
        </div>

        <!-- 重要提示 -->
        <div class="p-4 mb-6 bg-yellow-100 border border-yellow-200 rounded-md">
          <div class="flex items-center">
            <span class="mr-2 text-yellow-600">⚠️</span>
            <p class="text-sm text-yellow-800">
              初始化过程中请勿关闭应用程序，这可能导致数据损坏。
            </p>
          </div>
        </div>

        <!-- 页脚 -->
        <div class="flex items-center justify-between pt-4 border-t border-gray-200">
          <button
            @click="showDiagnostics = true"
            class="text-sm text-gray-500 transition-colors hover:text-gray-700"
          >
            查看诊断信息
          </button>
          <div v-if="state?.isCompleted" class="flex items-center text-green-600">
            <span class="mr-2">🎉</span>
            <span class="font-medium">初始化完成！</span>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 诊断信息模态框 -->
    <div
      v-if="showDiagnostics"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      @click="showDiagnostics = false"
    >
      <div class="bg-white rounded-lg max-w-4xl max-h-[80vh] w-full mx-4 flex flex-col" @click.stop>
        <div class="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 class="text-xl font-semibold text-gray-800">系统诊断报告</h2>
          <button
            @click="showDiagnostics = false"
            class="text-gray-400 transition-colors hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        <div class="flex-1 p-6 overflow-y-auto">
          <pre class="p-4 text-sm whitespace-pre-wrap bg-gray-100 rounded-md">{{
            diagnosticsReport
          }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import Card from '@renderer/components/ui/card.vue'
import CardHeader from '@renderer/components/ui/card-header.vue'
import CardContent from '@renderer/components/ui/card-content.vue'
import CardTitle from '@renderer/components/ui/card-title.vue'
import Progress from '@renderer/components/ui/progress.vue'
import Button from '@renderer/components/ui/button.vue'

const router = useRouter()

// 响应式状态
const state = ref<any>(null)
const isRetrying = ref(false)
const showDiagnostics = ref(false)
const diagnosticsReport = ref('')

// 获取步骤样式类
const getStepClasses = (stepInfo: any) => {
  const baseClasses = 'transition-all duration-300'

  if (stepInfo.status === 'in_progress') {
    return `${baseClasses} border-indigo-500 bg-indigo-50`
  } else if (stepInfo.status === 'success') {
    return `${baseClasses} border-green-200 bg-green-50`
  } else if (stepInfo.status === 'error') {
    return `${baseClasses} border-red-200 bg-red-50`
  } else {
    return `${baseClasses} border-gray-200 bg-gray-50`
  }
}

// 获取步骤图标
const getStepIcon = (status: string) => {
  switch (status) {
    case 'success':
      return '✅'
    case 'in_progress':
      return '🔄'
    case 'error':
      return '❌'
    default:
      return '⏳'
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
      return '等待用户操作'
    default:
      return '等待中'
  }
}

// 重试步骤
const retryStep = async (step: string) => {
  isRetrying.value = true
  try {
    await window.api.initialization.retryFromStep(step)
  } catch (error) {
    console.error('重试失败:', error)
  } finally {
    isRetrying.value = false
  }
}

// 选择工作目录
const selectWorkDir = async () => {
  try {
    await window.api.initialization.selectWorkDir()
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
    setTimeout(() => {
      router.push('/main')
    }, 2000) // 延迟2秒让用户看到完成状态
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
