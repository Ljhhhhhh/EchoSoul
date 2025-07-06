import { useState, useEffect } from 'react';
import { InitializationStep, InitializationStepInfo } from '@echosoul/common';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  CheckCircle,
  AlertCircle,
  Loader2,
  MessageSquare,
  Key,
  FolderOpen,
  Database,
  Server,
  CheckCircle2,
  Play,
} from 'lucide-react';

interface InitializationPageProps {
  onComplete: () => void;
}

export function InitializationPage({ onComplete }: InitializationPageProps) {
  const [currentStep, setCurrentStep] = useState<InitializationStep>(
    InitializationStep.CHECKING_WECHAT
  );
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  // 步骤配置
  const stepConfigs: Record<
    InitializationStep,
    { title: string; description: string; icon: any }
  > = {
    [InitializationStep.CHECKING_WECHAT]: {
      title: '检查微信运行状态',
      description: '确认微信应用已启动并可访问',
      icon: MessageSquare,
    },
    [InitializationStep.GETTING_KEY]: {
      title: '获取微信密钥',
      description: '获取解密聊天记录所需的密钥',
      icon: Key,
    },
    [InitializationStep.SELECTING_WORKDIR]: {
      title: '选择存储目录',
      description: '选择聊天记录解密后的存储位置',
      icon: FolderOpen,
    },
    [InitializationStep.DECRYPTING_DATABASE]: {
      title: '解密聊天数据库',
      description: '解密并处理微信聊天记录数据',
      icon: Database,
    },
    [InitializationStep.STARTING_SERVICE]: {
      title: '启动分析服务',
      description: '启动聊天记录分析服务',
      icon: Server,
    },
    [InitializationStep.COMPLETED]: {
      title: '初始化完成',
      description: '所有设置已完成，可以开始使用',
      icon: CheckCircle2,
    },
  };

  const steps = Object.values(InitializationStep);
  const currentStepIndex = steps.indexOf(currentStep);

  useEffect(() => {
    // 监听初始化步骤更新
    const handleStepUpdate = (
      step: InitializationStep,
      errorMessage?: string
    ) => {
      setCurrentStep(step);
      setError(errorMessage || null);

      if (step === InitializationStep.COMPLETED) {
        setIsCompleted(true);
        setIsInitializing(false);
        // 延迟一下再调用完成回调，让用户看到完成状态
        setTimeout(() => {
          onComplete();
        }, 2000);
      }
    };

    window.electronAPI.on('initialization:step-update', handleStepUpdate);

    return () => {
      window.electronAPI.off('initialization:step-update', handleStepUpdate);
    };
  }, [onComplete]);

  const handleStartInitialization = async () => {
    setIsInitializing(true);
    setError(null);

    try {
      await window.electronAPI.initialization.start();
    } catch (error) {
      console.error('Initialization failed:', error);
      setError(error instanceof Error ? error.message : '初始化失败');
      setIsInitializing(false);
    }
  };

  const getStepInfo = (step: InitializationStep): InitializationStepInfo => {
    const config = stepConfigs[step];
    const stepIndex = steps.indexOf(step);
    const isActive = step === currentStep;
    const isFinished: boolean =
      stepIndex < currentStepIndex ||
      (step === InitializationStep.COMPLETED && isCompleted);
    const hasError = isActive && !!error;

    return {
      step,
      title: config.title,
      description: config.description,
      isActive,
      isCompleted: isFinished,
      hasError,
      errorMessage: hasError ? error : undefined,
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* 紧凑标题区域 */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
              <MessageSquare className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                EchoSoul
              </h1>
              <p className="text-sm text-muted-foreground">
                智能聊天记录分析助手
              </p>
            </div>
          </div>
        </div>

        {/* 主要内容区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)] min-h-[500px]">
          {/* 左侧：步骤列表 */}
          <div className="lg:col-span-2">
            <Card className="h-full shadow-lg border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-800">
                      初始化步骤 ({currentStepIndex + 1}/{steps.length})
                    </CardTitle>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${((currentStepIndex + 1) / steps.length) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                  {!isInitializing && !isCompleted && (
                    <Button
                      onClick={handleStartInitialization}
                      size="sm"
                      className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 border-0 shadow-md"
                    >
                      <Play className="h-4 w-4" />
                      开始
                    </Button>
                  )}
                  {isInitializing && (
                    <Button
                      disabled
                      size="sm"
                      className="flex items-center gap-2 bg-blue-100 text-blue-600 border-blue-200"
                    >
                      <Loader2 className="h-4 w-4 animate-spin" />
                      进行中
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-2 overflow-y-auto">
                {steps.map((step, index) => {
                  const stepInfo = getStepInfo(step);
                  const stepNumber = index + 1;

                  return (
                    <div
                      key={step}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
                        stepInfo.isActive
                          ? 'bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-500 shadow-sm'
                          : stepInfo.isCompleted
                            ? 'bg-gradient-to-r from-green-50 to-green-100 border-l-4 border-green-500'
                            : stepInfo.hasError
                              ? 'bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500'
                              : 'bg-gray-50/50 border-l-4 border-gray-200 hover:bg-gray-100/50'
                      }`}
                    >
                      {/* 步骤编号/状态图标 */}
                      <div
                        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                          stepInfo.isActive
                            ? 'bg-blue-500 text-white shadow-md'
                            : stepInfo.isCompleted
                              ? 'bg-green-500 text-white shadow-sm'
                              : stepInfo.hasError
                                ? 'bg-red-500 text-white shadow-sm'
                                : 'bg-gray-300 text-gray-600'
                        }`}
                      >
                        {stepInfo.isCompleted ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : stepInfo.hasError ? (
                          <AlertCircle className="h-4 w-4" />
                        ) : stepInfo.isActive && isInitializing ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          stepNumber
                        )}
                      </div>

                      {/* 步骤信息 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {(() => {
                            const IconComponent = stepConfigs[step].icon;
                            return (
                              <IconComponent className="h-4 w-4 text-gray-500" />
                            );
                          })()}
                          <h3
                            className={`font-medium text-sm ${
                              stepInfo.isActive
                                ? 'text-blue-800'
                                : stepInfo.isCompleted
                                  ? 'text-green-800'
                                  : stepInfo.hasError
                                    ? 'text-red-800'
                                    : 'text-gray-600'
                            }`}
                          >
                            {stepInfo.title}
                          </h3>
                        </div>

                        {stepInfo.hasError && stepInfo.errorMessage && (
                          <p className="text-xs text-red-600 mt-1 font-medium">
                            {stepInfo.errorMessage}
                          </p>
                        )}
                      </div>

                      {/* 状态指示器 */}
                      <div className="flex-shrink-0">
                        {stepInfo.isCompleted && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                        {stepInfo.hasError && (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        )}
                        {stepInfo.isActive && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* 右侧：当前步骤详情和提示 */}
          <div className="space-y-4">
            {/* 温馨提示 */}
            <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 shadow-sm">
              <CardContent className="pt-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-amber-800">
                    <p className="font-semibold mb-2 text-amber-900">
                      温馨提示
                    </p>
                    <ul className="space-y-1.5 text-xs">
                      <li>• 请确保微信应用已启动并登录</li>
                      <li>• 初始化过程中请不要关闭应用</li>
                      <li>• 首次初始化可能需要几分钟时间</li>
                      <li>• 如遇问题，请重启微信后重试</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 完成状态 */}
            {isCompleted && (
              <div className="flex justify-center">
                <Button
                  size="sm"
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 border-0 shadow-md text-white font-semibold"
                  onClick={onComplete}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  进入应用
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
