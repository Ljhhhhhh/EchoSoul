import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, AlertCircle, CheckCircle, Clock } from 'lucide-react';

export function Dashboard() {
  const [chatlogStatus, setChatlogStatus] = useState<
    'running' | 'not-running' | 'error'
  >('not-running');
  const [isLoading, setIsLoading] = useState(false);

  const checkChatlogStatus = async () => {
    setIsLoading(true);
    try {
      const status = await window.electronAPI.chatlog.status();
      setChatlogStatus(status);
    } catch (error) {
      console.error('Failed to check chatlog status:', error);
      setChatlogStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkChatlogStatus();
  }, []);

  const getStatusIcon = () => {
    switch (chatlogStatus) {
      case 'running':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusText = () => {
    switch (chatlogStatus) {
      case 'running':
        return '运行中';
      case 'error':
        return '错误';
      default:
        return '未运行';
    }
  };

  const getStatusVariant = () => {
    switch (chatlogStatus) {
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
      <div>
        <h1 className="text-3xl font-bold tracking-tight">仪表板</h1>
        <p className="text-muted-foreground">
          欢迎使用 EchoSoul，您的智能自我认知助手
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chatlog 服务</CardTitle>
            {getStatusIcon()}
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Badge variant={getStatusVariant()}>{getStatusText()}</Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={checkChatlogStatus}
                disabled={isLoading}
              >
                <RefreshCw
                  className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`}
                />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">今日报告</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">暂无今日报告</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总报告数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">历史报告总数</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">下次报告</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">明日 2:00</div>
            <p className="text-xs text-muted-foreground">自动生成时间</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>快速开始</CardTitle>
            <CardDescription>开始使用 EchoSoul 的基本步骤</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">1. 配置 AI 服务</h4>
              <p className="text-sm text-muted-foreground">
                前往设置页面配置您的 AI API 密钥
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium">2. 启动 Chatlog 服务</h4>
              <p className="text-sm text-muted-foreground">
                确保 Chatlog 服务正在运行以获取聊天记录
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium">3. 生成第一份报告</h4>
              <p className="text-sm text-muted-foreground">
                等待自动生成或手动创建自定义报告
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>系统状态</CardTitle>
            <CardDescription>当前系统运行状态概览</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">应用版本</span>
              <Badge variant="outline">v0.1.0</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">数据库状态</span>
              <Badge variant="default">正常</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">定时任务</span>
              <Badge variant="default">运行中</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
