import { useState, useEffect } from 'react';
import { InitializationState, InitializationStep } from '@echosoul/common';

export function useInitialization() {
  const [state, setState] = useState<InitializationState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 检查是否需要初始化
  const checkInitializationNeeds = async () => {
    try {
      setLoading(true);
      const needsInit = await window.electronAPI.initialization.needsInitialization();
      
      if (needsInit) {
        // 获取当前状态
        const currentState = await window.electronAPI.initialization.getState();
        setState(currentState);
      } else {
        // 不需要初始化，设置为已完成状态
        setState({
          currentStep: InitializationStep.COMPLETED,
          isCompleted: true,
        });
      }
    } catch (err) {
      console.error('Failed to check initialization needs:', err);
      setError(err instanceof Error ? err.message : '检查初始化状态失败');
    } finally {
      setLoading(false);
    }
  };

  // 开始初始化
  const startInitialization = async () => {
    try {
      setError(null);
      await window.electronAPI.initialization.start();
    } catch (err) {
      console.error('Failed to start initialization:', err);
      setError(err instanceof Error ? err.message : '启动初始化失败');
    }
  };

  // 监听初始化步骤更新
  useEffect(() => {
    const handleStepUpdate = (step: InitializationStep, errorMessage?: string) => {
      setState(prevState => ({
        ...prevState,
        currentStep: step,
        isCompleted: step === InitializationStep.COMPLETED,
        error: errorMessage,
      }));
      
      if (errorMessage) {
        setError(errorMessage);
      } else {
        setError(null);
      }
    };

    window.electronAPI.on('initialization:step-update', handleStepUpdate);

    return () => {
      window.electronAPI.off('initialization:step-update', handleStepUpdate);
    };
  }, []);

  // 初始检查
  useEffect(() => {
    checkInitializationNeeds();
  }, []);

  return {
    state,
    loading,
    error,
    needsInitialization: state && !state.isCompleted,
    startInitialization,
    refreshState: checkInitializationNeeds,
  };
}
