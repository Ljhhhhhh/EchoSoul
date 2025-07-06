import React, { useState, useEffect, useCallback } from 'react';
import {
  InitializationState,
  InitializationStep,
  InitializationStatus,
  INITIALIZATION_STEPS_CONFIG,
} from '../../../electron/src/types/initialization';

interface InitializationProgressProps {
  onComplete: () => void;
}

export const InitializationProgress: React.FC<InitializationProgressProps> = ({
  onComplete,
}) => {
  const [state, setState] = useState<InitializationState | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [diagnosticsReport, setDiagnosticsReport] = useState<string>('');

  // 初始化
  useEffect(() => {
    startInitialization();

    // 监听状态变化
    const handleStateChanged = (_: any, newState: InitializationState) => {
      setState(newState);
    };

    const handleCompleted = () => {
      setTimeout(() => {
        onComplete();
      }, 1500); // 延迟1.5秒显示完成状态
    };

    const handleError = (_: any, error: any) => {
      console.error('Initialization error:', error);
    };

    window.electronAPI.on('initialization:stateChanged', handleStateChanged);
    window.electronAPI.on('initialization:completed', handleCompleted);
    window.electronAPI.on('initialization:error', handleError);

    return () => {
      window.electronAPI.off('initialization:stateChanged', handleStateChanged);
      window.electronAPI.off('initialization:completed', handleCompleted);
      window.electronAPI.off('initialization:error', handleError);
    };
  }, [onComplete]);

  const startInitialization = async () => {
    try {
      await window.electronAPI.invoke('initialization:start');
    } catch (error) {
      console.error('Failed to start initialization:', error);
    }
  };

  const retryCurrentStep = async () => {
    setIsRetrying(true);
    try {
      await window.electronAPI.invoke('initialization:retryCurrentStep');
    } catch (error) {
      console.error('Failed to retry current step:', error);
    } finally {
      setIsRetrying(false);
    }
  };

  const retryFromStep = async (step: InitializationStep) => {
    setIsRetrying(true);
    try {
      await window.electronAPI.invoke('initialization:retryFromStep', step);
    } catch (error) {
      console.error('Failed to retry from step:', error);
    } finally {
      setIsRetrying(false);
    }
  };

  const selectWorkDir = async () => {
    try {
      const result = await window.electronAPI.invoke(
        'initialization:selectWorkDir'
      );
      if (result.success && !result.canceled) {
        // 选择完成后继续初始化
        await retryCurrentStep();
      }
    } catch (error) {
      console.error('Failed to select work directory:', error);
    }
  };

  const showDiagnosticsReport = async () => {
    try {
      const result = await window.electronAPI.invoke(
        'initialization:getDiagnostics'
      );
      if (result.success) {
        setDiagnosticsReport(result.report);
        setShowDiagnostics(true);
      }
    } catch (error) {
      console.error('Failed to get diagnostics:', error);
    }
  };

  const getStepIcon = (status: InitializationStatus) => {
    switch (status) {
      case InitializationStatus.SUCCESS:
        return '✅';
      case InitializationStatus.IN_PROGRESS:
        return '🔄';
      case InitializationStatus.ERROR:
        return '❌';
      case InitializationStatus.WAITING_USER_INPUT:
        return '⏳';
      default:
        return '⚪';
    }
  };

  const getStepStatusText = (status: InitializationStatus) => {
    switch (status) {
      case InitializationStatus.SUCCESS:
        return '已完成';
      case InitializationStatus.IN_PROGRESS:
        return '进行中...';
      case InitializationStatus.ERROR:
        return '失败';
      case InitializationStatus.WAITING_USER_INPUT:
        return '等待用户操作';
      case InitializationStatus.PENDING:
        return '等待中';
      default:
        return '未知';
    }
  };

  if (!state) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">正在初始化...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full">
        {/* 标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            EchoSoul 初始化
          </h1>
          <p className="text-gray-600">正在为您准备聊天记录分析服务...</p>
        </div>

        {/* 总进度条 */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">总进度</span>
            <span className="text-sm text-gray-500">
              {state.overallProgress}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-indigo-600 h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${state.overallProgress}%` }}
            ></div>
          </div>
        </div>

        {/* 步骤列表 */}
        <div className="space-y-4 mb-8">
          {Object.values(InitializationStep)
            .filter(step => step !== InitializationStep.COMPLETED)
            .map(step => {
              const stepInfo = state.steps[step];
              const isCurrentStep = state.currentStep === step;

              return (
                <div
                  key={step}
                  className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                    isCurrentStep
                      ? 'border-indigo-500 bg-indigo-50'
                      : stepInfo.status === InitializationStatus.SUCCESS
                        ? 'border-green-200 bg-green-50'
                        : stepInfo.status === InitializationStatus.ERROR
                          ? 'border-red-200 bg-red-50'
                          : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">
                        {getStepIcon(stepInfo.status)}
                      </span>
                      <div>
                        <h3 className="font-semibold text-gray-800">
                          {stepInfo.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {stepInfo.description}
                        </p>
                        {stepInfo.userAction && (
                          <p className="text-sm text-blue-600 mt-1">
                            {stepInfo.userAction}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium text-gray-700">
                        {getStepStatusText(stepInfo.status)}
                      </span>
                      {stepInfo.status === InitializationStatus.IN_PROGRESS && (
                        <div className="w-16 bg-gray-200 rounded-full h-2 mt-1">
                          <div
                            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${stepInfo.progress}%` }}
                          ></div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 错误信息 */}
                  {stepInfo.error && (
                    <div className="mt-3 p-3 bg-red-100 border border-red-200 rounded text-sm text-red-700">
                      <strong>错误：</strong> {stepInfo.error}
                    </div>
                  )}

                  {/* 操作按钮 */}
                  {stepInfo.status === InitializationStatus.ERROR &&
                    stepInfo.canRetry && (
                      <div className="mt-3 flex space-x-2">
                        <button
                          onClick={() => retryFromStep(step)}
                          disabled={isRetrying}
                          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 text-sm"
                        >
                          {isRetrying ? '重试中...' : '重试'}
                        </button>
                      </div>
                    )}

                  {/* 特殊操作按钮 */}
                  {step === InitializationStep.SELECTING_WORKDIR &&
                    stepInfo.status ===
                      InitializationStatus.WAITING_USER_INPUT && (
                      <div className="mt-3">
                        <button
                          onClick={selectWorkDir}
                          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                        >
                          选择目录
                        </button>
                      </div>
                    )}
                </div>
              );
            })}
        </div>

        {/* 底部操作 */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
          <button
            onClick={showDiagnosticsReport}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            查看诊断信息
          </button>

          {state.isCompleted && (
            <div className="flex items-center space-x-2 text-green-600">
              <span className="text-2xl">🎉</span>
              <span className="font-semibold">初始化完成！</span>
            </div>
          )}
        </div>

        {/* 重要提示 */}
        {!state.canExit && (
          <div className="mt-4 p-3 bg-yellow-100 border border-yellow-200 rounded text-sm text-yellow-800">
            <strong>提示：</strong>{' '}
            初始化过程中请不要关闭应用程序。首次初始化可能需要几分钟时间。
          </div>
        )}
      </div>

      {/* 诊断信息模态框 */}
      {showDiagnostics && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold">系统诊断报告</h3>
              <button
                onClick={() => setShowDiagnostics(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              <pre className="text-sm bg-gray-100 p-4 rounded whitespace-pre-wrap">
                {diagnosticsReport}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
