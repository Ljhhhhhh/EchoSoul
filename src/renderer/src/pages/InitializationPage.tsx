import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'

// UI 组件导入
import { Button } from '@/components/ui/button'

// 图标导入
import { Sparkles, FolderOpen, RefreshCw, Info, X } from 'lucide-react'

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
  const [showDiagnostics, setShowDiagnostics] = useState(false)
  const [diagnosticsReport, setDiagnosticsReport] = useState('')
  const navigate = useNavigate()

  // 检查是否有错误
  const hasError = useMemo(() => {
    if (!state?.steps) return false
    return Object.values(state.steps).some((step) => step.status === 'error')
  }, [state?.steps])

  // 获取呼吸式步骤圆点样式
  const getBreathingStepClasses = useCallback((status: string) => {
    switch (status) {
      case 'in_progress':
        return 'bg-white shadow-lg shadow-white/30 ring-2 ring-white/50'
      case 'success':
        return 'bg-emerald-400 shadow-lg shadow-emerald-400/40 ring-2 ring-emerald-400/30'
      case 'error':
        return 'bg-red-400 shadow-lg shadow-red-400/40 ring-2 ring-red-400/30'
      case 'waiting_user_input':
        return 'bg-amber-400 shadow-lg shadow-amber-400/40 ring-2 ring-amber-400/30'
      default:
        return 'bg-white/30 shadow-sm shadow-white/20'
    }
  }, [])

  // 获取内部光点样式
  const getInnerGlowClasses = useCallback((status: string) => {
    switch (status) {
      case 'in_progress':
        return 'bg-gradient-to-br from-white to-white/80'
      case 'success':
        return 'bg-gradient-to-br from-emerald-200 to-emerald-300'
      case 'error':
        return 'bg-gradient-to-br from-red-200 to-red-300'
      case 'waiting_user_input':
        return 'bg-gradient-to-br from-amber-200 to-amber-300'
      default:
        return 'bg-gradient-to-br from-white/40 to-white/20'
    }
  }, [])

  // 获取步骤文字样式
  const getStepTextClasses = useCallback((status: string) => {
    switch (status) {
      case 'in_progress':
        return 'text-white font-semibold'
      case 'success':
        return 'text-emerald-100 font-medium'
      case 'error':
        return 'text-red-100 font-medium'
      case 'waiting_user_input':
        return 'text-amber-100 font-medium'
      default:
        return 'text-white/60 font-normal'
    }
  }, [])

  // 获取状态指示点样式
  const getStatusDotClasses = useCallback((status: string) => {
    switch (status) {
      case 'in_progress':
        return 'bg-white animate-pulse'
      case 'success':
        return 'bg-emerald-300'
      case 'error':
        return 'bg-red-300'
      case 'waiting_user_input':
        return 'bg-amber-300'
      default:
        return 'bg-white/40'
    }
  }, [])

  // 获取当前步骤索引
  const getCurrentStepIndex = useCallback(() => {
    if (!state?.steps) return 0
    const steps = Object.keys(state.steps)
    const currentStepKey = state.currentStep
    return steps.indexOf(currentStepKey)
  }, [state?.steps, state?.currentStep])

  // 获取当前步骤信息
  const getCurrentStepInfo = useCallback(() => {
    if (!state?.steps || !state?.currentStep) return null
    return state.steps[state.currentStep]
  }, [state?.steps, state?.currentStep])

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

  // 刷新诊断信息
  const refreshDiagnostics = useCallback(async () => {
    try {
      const result = await window.api.initialization.getDiagnostics()
      setDiagnosticsReport(result.report || JSON.stringify(result, null, 2))
    } catch (error) {
      console.error('获取诊断信息失败:', error)
      setDiagnosticsReport('获取诊断信息失败: ' + error)
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

  // 获取诊断信息
  const getDiagnostics = useCallback(async () => {
    try {
      const result = await window.api.initialization.getDiagnostics()
      if (result.success) {
        setDiagnosticsReport(result.report || '无诊断信息')
      } else {
        setDiagnosticsReport(`获取诊断信息失败: ${result.error}`)
      }
    } catch (error) {
      setDiagnosticsReport(`获取诊断信息失败: ${error}`)
    }
  }, [])

  // 生命周期钩子
  useEffect(() => {
    // 获取诊断信息
    getDiagnostics()

    // 注册事件监听器
    window.api.initialization.onStateChanged((newState: InitializationState) => {
      setState(newState)
    })

    window.api.initialization.onCompleted(() => {
      // 初始化完成后导航到主应用
      setTimeout(() => {
        navigate('/main')
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
  }, [navigate, getDiagnostics])

  return (
    <div className="min-h-screen duration-1000 bg-gradient-to-br from-primary-500 to-secondary-700 animate-in fade-in">
      {/* 主容器 */}
      <div className="flex flex-col min-h-screen">
        {/* 头部区域 */}
        <div className="flex-shrink-0 pt-16 pb-8">
          <div className="container px-4 mx-auto">
            <div className="text-center duration-500 delay-500 animate-in fade-in">
              {/* Logo 区域 */}
              <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 transition-all duration-300 rounded-full bg-gradient-to-br from-primary-500 to-secondary-600 shadow-elevation-2 hover:shadow-elevation-4 hover:scale-105">
                <Sparkles className="w-10 h-10 text-white" />
              </div>

              {/* 标题区域 */}
              <div className="space-y-3">
                <h1 className="text-3xl font-bold text-white delay-700 sm:text-4xl lg:text-5xl animate-in slide-in-from-top-2 duration-600">
                  欢迎使用 EchoSoul
                </h1>
                <p className="text-lg sm:text-xl text-white/80 animate-in slide-in-from-top-2 duration-600 delay-900">
                  {getCurrentStepInfo()?.description || '正在为您初始化应用环境...'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 内容区域 */}
        <div className="flex-1 px-4 pb-8">
          <div className="container max-w-4xl mx-auto">
            {/* 横向步骤指示器 - 精致简约设计 */}
            {state?.steps && (
              <div className="duration-700 delay-300 animate-in slide-in-from-bottom-4">
                <div className="relative max-w-6xl px-4 mx-auto sm:px-8">
                  {/* 背景连接线 */}
                  <div
                    className="absolute h-px bg-gradient-to-r from-white/20 via-white/30 to-white/20"
                    style={{
                      top: '32px',
                      left: '32px',
                      right: '32px'
                    }}
                  />

                  {/* 进度连接线 */}
                  <div
                    className="absolute h-px transition-all duration-1000 ease-out bg-gradient-to-r from-white via-white/90 to-white/70"
                    style={{
                      top: '32px',
                      left: '32px',
                      width: `calc((100% - 64px) * ${Math.max(0, getCurrentStepIndex() / Math.max(1, Object.keys(state.steps).length - 1))})`
                    }}
                  />

                  {/* 步骤节点容器 */}
                  <div className="flex items-start justify-between">
                    {Object.entries(state.steps).map(([stepKey, stepInfo], index) => (
                      <div
                        key={stepKey}
                        className={cn(
                          'relative flex flex-col items-center group',
                          index > 0 && index < Object.keys(state.steps).length - 1 && 'flex-1'
                        )}
                      >
                        {/* 步骤圆点 */}
                        <div
                          className={cn(
                            'relative w-4 h-4 rounded-full transition-all duration-500 ease-out transform step-dot',
                            getBreathingStepClasses(stepInfo.status),
                            stepInfo.status === 'in_progress' && 'animate-breathe animate-soft-glow'
                          )}
                        >
                          {/* 内部光点 */}
                          <div
                            className={cn(
                              'absolute inset-0.5 rounded-full transition-all duration-300',
                              getInnerGlowClasses(stepInfo.status),
                              stepInfo.status === 'in_progress' && 'animate-gentle-pulse'
                            )}
                          />

                          {/* 呼吸光环 - 多层效果 */}
                          {stepInfo.status === 'in_progress' && (
                            <>
                              <div
                                className="absolute rounded-full -inset-1 bg-white/15 animate-ping"
                                style={{ animationDuration: '1.5s' }}
                              />
                              <div
                                className="absolute rounded-full -inset-2 bg-white/10 animate-ping"
                                style={{ animationDuration: '2s', animationDelay: '0.3s' }}
                              />
                            </>
                          )}
                        </div>

                        {/* 步骤信息 */}
                        <div
                          className={cn(
                            'mt-4 text-center transition-transform duration-300 group-hover:scale-105 sm:mt-6',
                            'max-w-16 sm:max-w-24'
                          )}
                        >
                          <h3
                            className={cn(
                              'text-xs font-medium transition-all duration-300 leading-tight sm:text-sm',
                              getStepTextClasses(stepInfo.status)
                            )}
                          >
                            {stepInfo.title}
                          </h3>

                          {/* 状态指示点 */}
                          <div className="flex justify-center mt-1.5 sm:mt-2">
                            <div
                              className={cn(
                                'w-1 h-1 rounded-full transition-all duration-300 sm:w-1.5 sm:h-1.5',
                                getStatusDotClasses(stepInfo.status),
                                stepInfo.status === 'in_progress' && 'status-dot-pulse'
                              )}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 操作按钮区域 */}
        <div className="flex-shrink-0 px-4 pb-8">
          <div className="container max-w-4xl mx-auto">
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              {/* 重试按钮 */}
              {hasError && (
                <Button
                  disabled={isRetrying}
                  variant="outline"
                  size="lg"
                  className="text-white bg-white/10 border-white/30 hover:bg-white/20"
                  onClick={retryInitialization}
                >
                  <RefreshCw className={cn('w-5 h-5 mr-2', isRetrying && 'animate-spin')} />
                  {isRetrying ? '重试中...' : '重试'}
                </Button>
              )}

              {/* 选择目录按钮 */}
              {state?.steps &&
                Object.values(state.steps).some(
                  (step) =>
                    step.status === 'waiting_user_input' && step.step === 'selecting_workdir'
                ) && (
                  <Button
                    variant="default"
                    size="lg"
                    className="bg-white text-primary-600 hover:bg-white/90"
                    onClick={selectWorkDir}
                  >
                    <FolderOpen className="w-5 h-5 mr-2" />
                    选择目录
                  </Button>
                )}
            </div>
          </div>
        </div>

        {/* 诊断信息按钮 - 固定在右下角 */}
        <div className="fixed z-30 bottom-6 right-6">
          <Button
            variant="ghost"
            size="sm"
            className="px-4 py-2 transition-all duration-200 border rounded-full shadow-lg text-white/80 hover:text-white hover:bg-white/15 backdrop-blur-md border-white/20"
            onClick={() => setShowDiagnostics(!showDiagnostics)}
          >
            <Info className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">诊断</span>
          </Button>
        </div>

        {/* 诊断信息侧边栏 */}
        {showDiagnostics && (
          <div
            className={cn(
              'fixed inset-y-0 right-0 z-50 flex flex-col transition-transform duration-300 ease-out transform border-l w-96 bg-black/85 backdrop-blur-xl border-white/10',
              showDiagnostics ? 'translate-x-0' : 'translate-x-full'
            )}
          >
            {/* 头部 */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/20">
                  <Info className="w-4 h-4 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">系统诊断</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-white/60 hover:text-white hover:bg-white/10"
                onClick={() => setShowDiagnostics(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* 内容区域 */}
            <div className="flex-1 p-6 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20 hover:scrollbar-thumb-white/30">
              <div className="space-y-4">
                {/* 诊断报告 */}
                <div className="p-4 border rounded-xl bg-white/5 border-white/10 backdrop-blur-sm">
                  <h4 className="flex items-center gap-2 mb-3 text-sm font-medium text-white/90">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    诊断报告
                  </h4>
                  <div className="relative">
                    <div
                      className="p-3 overflow-y-auto font-mono text-xs leading-relaxed break-words whitespace-pre-wrap border rounded-lg text-white/70 max-h-64 bg-black/20 border-white/5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20"
                      style={{
                        overflowX: 'hidden',
                        wordWrap: 'break-word',
                        wordBreak: 'break-all'
                      }}
                    >
                      {diagnosticsReport || '暂无诊断信息'}
                    </div>
                  </div>
                </div>

                {/* 当前状态 */}
                <div className="p-4 border rounded-xl bg-white/5 border-white/10 backdrop-blur-sm">
                  <h4 className="flex items-center gap-2 mb-3 text-sm font-medium text-white/90">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                    当前状态
                  </h4>
                  <div className="space-y-3">
                    {state?.currentStep && (
                      <div className="flex items-center justify-between p-2 rounded-lg bg-black/20">
                        <span className="text-xs text-white/60">当前步骤</span>
                        <span className="text-xs font-medium text-blue-300">
                          {state.steps[state.currentStep]?.title}
                        </span>
                      </div>
                    )}
                    {state?.steps && (
                      <div className="flex items-center justify-between p-2 rounded-lg bg-black/20">
                        <span className="text-xs text-white/60">总进度</span>
                        <span className="text-xs font-medium text-green-300">
                          {getCurrentStepIndex() + 1} / {Object.keys(state.steps).length}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 错误信息 */}
                {hasError && (
                  <div className="p-4 border rounded-xl bg-red-500/10 border-red-500/20 backdrop-blur-sm">
                    <h4 className="flex items-center gap-2 mb-3 text-sm font-medium text-red-300">
                      <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                      错误信息
                    </h4>
                    <div className="space-y-3">
                      {state?.steps &&
                        Object.entries(state.steps).map(([key, step]) => {
                          if (step.status === 'error') {
                            return (
                              <div
                                key={key}
                                className="p-3 border rounded-lg bg-red-500/5 border-red-500/20"
                              >
                                <div className="text-xs font-medium text-red-200">{step.title}</div>
                                <div className="mt-2 text-xs leading-relaxed text-red-300/80">
                                  {step.description || '未知错误'}
                                </div>
                              </div>
                            )
                          }
                          return null
                        })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 底部操作 */}
            <div className="flex-shrink-0 border-t border-white/10 bg-gradient-to-r from-black/30 to-black/20">
              <div className="p-4">
                {/* 操作提示 */}
                <div className="mb-3 text-center">
                  <p className="text-xs text-white/50">
                    {hasError ? '检测到错误，可以重试初始化' : '诊断信息实时更新'}
                  </p>
                </div>

                {/* 按钮组 */}
                <div className="flex gap-2">
                  {!hasError ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="relative flex-1 overflow-hidden text-green-400 transition-all duration-300 border group hover:bg-green-500/10 hover:text-green-300 border-green-500/20 hover:border-green-500/40"
                      disabled
                    >
                      <div className="absolute inset-0 transition-opacity duration-300 opacity-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 group-hover:opacity-100" />
                      <div className="relative z-10 w-2 h-2 mr-2 bg-green-400 rounded-full animate-pulse" />
                      <span className="relative z-10 font-medium">运行正常</span>
                    </Button>
                  ) : (
                    <Button
                      variant="default"
                      size="sm"
                      className="relative flex-1 overflow-hidden text-white transition-all duration-300 border-0 shadow-lg group bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 hover:shadow-red-500/25"
                      onClick={retryInitialization}
                    >
                      <div className="absolute inset-0 transition-opacity duration-300 opacity-0 bg-white/10 group-hover:opacity-100" />
                      <span className="relative z-10 font-medium">重试初始化</span>
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    className="relative flex-1 overflow-hidden text-blue-400 transition-all duration-300 border group bg-blue-500/5 border-blue-500/20 hover:bg-blue-500/10 hover:text-blue-300 hover:border-blue-500/40"
                    onClick={refreshDiagnostics}
                  >
                    <div className="absolute inset-0 transition-opacity duration-300 opacity-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 group-hover:opacity-100" />
                    <RefreshCw className="relative z-10 w-3 h-3 mr-2 group-hover:animate-spin" />
                    <span className="relative z-10 font-medium">刷新诊断</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 遮罩层 */}
        {showDiagnostics && (
          <div
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
            onClick={() => setShowDiagnostics(false)}
          />
        )}
      </div>
    </div>
  )
}

export default InitializationPage
