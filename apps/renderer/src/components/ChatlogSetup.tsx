import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, Loader2, Play, Square } from 'lucide-react';

interface ChatlogSetupProps {
  onComplete?: () => void;
}

export function ChatlogSetup({ onComplete }: ChatlogSetupProps) {
  const [status, setStatus] = useState<'running' | 'not-running' | 'error'>('not-running');
  const [initialization, setInitialization] = useState({
    keyObtained: false,
    databaseDecrypted: false,
    canStartServer: false,
  });
  const [loading, setLoading] = useState({
    key: false,
    decrypt: false,
    start: false,
    stop: false,
  });
  const [messages, setMessages] = useState<{ type: 'success' | 'error'; text: string }[]>([]);

  useEffect(() => {
    checkStatus();
    checkInitialization();
  }, []);

  const checkStatus = async () => {
    try {
      const result = await window.electronAPI.chatlog.status();
      setStatus(result);
    } catch (error) {
      console.error('Failed to check status:', error);
      setStatus('error');
    }
  };

  const checkInitialization = async () => {
    try {
      const result = await window.electronAPI.chatlog.checkInitialization();
      setInitialization(result);
    } catch (error) {
      console.error('Failed to check initialization:', error);
    }
  };

  const addMessage = (type: 'success' | 'error', text: string) => {
    setMessages(prev => [...prev, { type, text }]);
  };

  const handleGetKey = async () => {
    setLoading(prev => ({ ...prev, key: true }));
    try {
      const result = await window.electronAPI.chatlog.getWechatKey();
      if (result.success) {
        addMessage('success', '微信密钥获取成功');
        await checkInitialization();
      } else {
        addMessage('error', `获取密钥失败: ${result.message}`);
      }
    } catch (error) {
      addMessage('error', `获取密钥失败: ${error}`);
    } finally {
      setLoading(prev => ({ ...prev, key: false }));
    }
  };

  const handleDecrypt = async () => {
    setLoading(prev => ({ ...prev, decrypt: true }));
    try {
      const result = await window.electronAPI.chatlog.decryptDatabase();
      if (result.success) {
        addMessage('success', '数据库解密成功');
        await checkInitialization();
      } else {
        addMessage('error', `数据库解密失败: ${result.message}`);
      }
    } catch (error) {
      addMessage('error', `数据库解密失败: ${error}`);
    } finally {
      setLoading(prev => ({ ...prev, decrypt: false }));
    }
  };

  const handleStart = async () => {
    setLoading(prev => ({ ...prev, start: true }));
    try {
      const result = await window.electronAPI.chatlog.start();
      if (result) {
        addMessage('success', 'Chatlog服务启动成功');
        await checkStatus();
        await checkInitialization();
        onComplete?.();
      } else {
        addMessage('error', 'Chatlog服务启动失败');
      }
    } catch (error) {
      addMessage('error', `启动服务失败: ${error}`);
    } finally {
      setLoading(prev => ({ ...prev, start: false }));
    }
  };

  const handleStop = async () => {
    setLoading(prev => ({ ...prev, stop: true }));
    try {
      await window.electronAPI.chatlog.stop();
      addMessage('success', 'Chatlog服务已停止');
      await checkStatus();
    } catch (error) {
      addMessage('error', `停止服务失败: ${error}`);
    } finally {
      setLoading(prev => ({ ...prev, stop: false }));
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'running':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'running':
        return '运行中';
      case 'error':
        return '错误';
      default:
        return '未运行';
    }
  };

  const getStatusVariant = () => {
    switch (status) {
      case 'running':
        return 'default' as const;
      case 'error':
        return 'destructive' as const;
      default:
        return 'secondary' as const;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon()}
            Chatlog 服务设置
          </CardTitle>
          <CardDescription>
            配置和管理微信聊天记录分析服务
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">服务状态</span>
            <Badge variant={getStatusVariant()}>
              {getStatusText()}
            </Badge>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">1. 获取微信密钥</h4>
              <p className="text-xs text-muted-foreground">
                获取微信数据库的解密密钥
              </p>
              <Button
                onClick={handleGetKey}
                disabled={loading.key}
                size="sm"
                variant="outline"
              >
                {loading.key && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                获取密钥
              </Button>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">2. 解密数据库</h4>
              <p className="text-xs text-muted-foreground">
                解密微信聊天记录数据库
              </p>
              <Button
                onClick={handleDecrypt}
                disabled={loading.decrypt || !initialization.keyObtained}
                size="sm"
                variant="outline"
              >
                {loading.decrypt && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                解密数据库
              </Button>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            {status === 'running' ? (
              <Button
                onClick={handleStop}
                disabled={loading.stop}
                variant="destructive"
                size="sm"
              >
                {loading.stop ? (
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                ) : (
                  <Square className="mr-2 h-3 w-3" />
                )}
                停止服务
              </Button>
            ) : (
              <Button
                onClick={handleStart}
                disabled={loading.start || !initialization.databaseDecrypted}
                size="sm"
              >
                {loading.start ? (
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                ) : (
                  <Play className="mr-2 h-3 w-3" />
                )}
                启动服务
              </Button>
            )}
          </div>

          {messages.length > 0 && (
            <div className="space-y-2 pt-4 border-t">
              <h4 className="text-sm font-medium">操作日志</h4>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`text-xs p-2 rounded ${
                      msg.type === 'success'
                        ? 'bg-green-50 text-green-700'
                        : 'bg-red-50 text-red-700'
                    }`}
                  >
                    {msg.text}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
