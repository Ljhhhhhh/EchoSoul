import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'

// UI 组件导入
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

// 图标导入
import {
  Sparkles,
  FolderOpen,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Settings,
  Database,
  Key,
  MessageSquare,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

// 工具函数导入
import { setInitializationCompleted } from '@/utils/initializationStorage'

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

const InitializationPage: React.FC = () => {
  // 响应式状态
  const [state, setState] = useState<InitializationState | null>(null)
  const [isRetrying, setIsRetrying] = useState(false)
  const [showAllSteps, setShowAllSteps] = useState(false)
  const navigate = useNavigate()

  // 检查是否有错误
  const hasError = useMemo(() => {
    if (!state?.steps) return false
    return Object.values(state.steps).some((step) => step.status === 'error')
  }, [state?.steps])

  // 获取当前步骤信息
  const getCurrentStepInfo = useCallback(() => {
    if (!state?.steps || !state?.currentStep) return null
    return state.steps[state.currentStep]
  }, [state?.steps, state?.currentStep])

  // 获取步骤图标
  const getStepIcon = useCallback((stepKey: string) => {
    const iconProps = { className: 'w-6 h-6' }

    switch (stepKey) {
      case 'checking_wechat':
        return <MessageSquare {...iconProps} />
      case 'getting_key':
        return <Key {...iconProps} />
      case 'selecting_workdir':
        return <FolderOpen {...iconProps} />
      case 'decrypting_database':
        return <Database {...iconProps} />
      case 'starting_service':
        return <Settings {...iconProps} />
      default:
        return <Sparkles {...iconProps} />
    }
  }, [])

  // 获取状态图标
  const getStatusIcon = useCallback((status: string) => {
    switch (status) {
      case 'in_progress':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />
      case 'waiting_user_input':
        return <AlertCircle className="w-5 h-5 text-amber-500" />
      default:
        return <div className="w-5 h-5 rounded-full bg-muted" />
    }
  }, [])

  // 获取已完成步骤数量
  const getCompletedStepsCount = useCallback(() => {
    if (!state?.steps) return 0
    return Object.values(state.steps).filter((step) => step.status === 'success').length
  }, [state?.steps])

  // 重试整个初始化流程
  const retryInitialization = useCallback(async () => {
    setIsRetrying(true)
    try {
      // 重新启动初始化流程
      await window.api.initialization.start()
    } catch (error) {
      console.error('重试初始化失败:', error)
    } finally {
      setIsRetrying(false)
    }
  }, [])

  // 选择工作目录
  const selectWorkDir = useCallback(async () => {
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
  }, [])

  // 生命周期钩子
  useEffect(() => {
    // 注册事件监听器
    window.api.initialization.onStateChanged((newState: InitializationState) => {
      setState(newState)
    })

    window.api.initialization.onCompleted(() => {
      // 保存初始化完成状态到本地存储
      setInitializationCompleted()
      console.log('初始化完成，状态已保存到本地存储')

      // 初始化完成后导航到主应用Dashboard
      setTimeout(() => {
        navigate('/')
      }, 1500)
    })

    window.api.initialization.onError((error) => {
      console.error('初始化错误:', error)
    })

    // 启动初始化
    const startInitialization = async (): Promise<void> => {
      try {
        await window.api.initialization.start()
      } catch (error) {
        console.error('启动初始化失败:', error)
      }
    }

    startInitialization()

    // 清理函数
    return () => {
      window.api.initialization.removeAllListeners()
    }
  }, [navigate])

  // 获取当前步骤信息
  const currentStep = getCurrentStepInfo()
  const totalSteps = state?.steps ? Object.keys(state.steps).length : 0
  const completedSteps = getCompletedStepsCount()

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-background">
      <div className="w-full max-w-lg space-y-8">
        {/* Logo 和标题 */}
        <div className="space-y-4 text-center">
          <div className="flex items-center justify-center w-20 h-20 mx-auto shadow-lg rounded-2xl bg-primary">
            <Sparkles className="w-10 h-10 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">EchoSoul</h1>
            <p className="mt-2 text-muted-foreground">正在初始化应用环境</p>
          </div>
        </div>

        {/* 当前步骤卡片 */}
        {currentStep && (
          <Card className="p-6">
            <CardContent className="p-0 space-y-6">
              {/* 当前步骤信息 */}
              <div className="flex items-center space-x-4">
                <div
                  className={cn(
                    'flex items-center justify-center w-12 h-12 rounded-xl',
                    currentStep.status === 'in_progress' && 'bg-blue-100 text-blue-600',
                    currentStep.status === 'success' && 'bg-green-100 text-green-600',
                    currentStep.status === 'error' && 'bg-red-100 text-red-600',
                    currentStep.status === 'waiting_user_input' && 'bg-amber-100 text-amber-600',
                    currentStep.status === 'pending' && 'bg-gray-100 text-gray-600'
                  )}
                >
                  {getStepIcon(state?.currentStep || '')}
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-foreground">{currentStep.title}</h2>
                  <p className="text-sm text-muted-foreground">{currentStep.description}</p>
                </div>
                <div className="flex-shrink-0">{getStatusIcon(currentStep.status)}</div>
              </div>

              {/* 进度条 */}
              {currentStep.status === 'in_progress' && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>当前进度</span>
                    <span>{currentStep.progress}%</span>
                  </div>
                  <Progress value={currentStep.progress} className="h-2" />
                </div>
              )}

              {/* 错误信息 */}
              {currentStep.status === 'error' && currentStep.error && (
                <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                  <p className="text-sm text-red-700">{currentStep.error}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* 总体进度 */}
        {state && (
          <div className="space-y-3">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>总体进度</span>
              <span>
                {completedSteps} / {totalSteps}
              </span>
            </div>
            <Progress value={state.overallProgress} className="h-2" />
            <p className="text-xs text-center text-muted-foreground">
              {state.overallProgress}% 完成
            </p>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex flex-col gap-3">
          {/* 重试按钮 */}
          {hasError && (
            <Button
              disabled={isRetrying}
              variant="outline"
              size="lg"
              onClick={retryInitialization}
              className="w-full"
            >
              <RefreshCw className={cn('w-5 h-5 mr-2', isRetrying && 'animate-spin')} />
              {isRetrying ? '重试中...' : '重试初始化'}
            </Button>
          )}

          {/* 选择目录按钮 */}
          {currentStep?.status === 'waiting_user_input' &&
            currentStep?.step === 'selecting_workdir' && (
              <Button variant="default" size="lg" onClick={selectWorkDir} className="w-full">
                <FolderOpen className="w-5 h-5 mr-2" />
                选择工作目录
              </Button>
            )}
        </div>

        {/* 步骤概览 */}
        {!showAllSteps && state?.steps && totalSteps > 1 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAllSteps(true)}
            className="w-full text-muted-foreground"
          >
            <ChevronDown className="w-4 h-4 mr-2" />
            查看所有步骤 ({totalSteps})
          </Button>
        )}

        {/* 所有步骤列表 */}
        {showAllSteps && state?.steps && (
          <Card className="p-4">
            <CardContent className="p-0 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-foreground">所有步骤</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowAllSteps(false)}>
                  <ChevronUp className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-2">
                {Object.entries(state.steps).map(([stepKey, stepInfo], index) => (
                  <div
                    key={stepKey}
                    className={cn(
                      'flex items-center space-x-3 p-2 rounded-lg transition-colors',
                      state.currentStep === stepKey && 'bg-blue-50 border border-blue-200',
                      stepInfo.status === 'success' && 'bg-green-50',
                      stepInfo.status === 'error' && 'bg-red-50'
                    )}
                  >
                    <div className="flex items-center justify-center flex-shrink-0 w-6 h-6">
                      {stepInfo.status === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : stepInfo.status === 'error' ? (
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      ) : stepInfo.status === 'in_progress' ? (
                        <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                      ) : (
                        <div className="w-2 h-2 bg-gray-300 rounded-full" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate text-foreground">
                        {stepInfo.title}
                      </p>
                    </div>
                    <div className="text-xs text-muted-foreground">{index + 1}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default InitializationPage
