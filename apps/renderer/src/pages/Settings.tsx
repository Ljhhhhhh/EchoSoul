import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChatlogSetup } from '@/components/ChatlogSetup';

export function Settings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">设置</h1>
        <p className="text-muted-foreground">配置您的 EchoSoul 应用偏好设置</p>
      </div>

      <Tabs defaultValue="chatlog" className="space-y-4">
        <TabsList>
          <TabsTrigger value="chatlog">Chatlog 服务</TabsTrigger>
          <TabsTrigger value="ai">AI 配置</TabsTrigger>
          <TabsTrigger value="report">报告设置</TabsTrigger>
          <TabsTrigger value="general">通用设置</TabsTrigger>
        </TabsList>

        <TabsContent value="chatlog" className="space-y-4">
          <ChatlogSetup />
        </TabsContent>

        <TabsContent value="ai" className="space-y-4">
          <div className="text-center py-12">
            <p className="text-muted-foreground">AI 配置功能正在开发中...</p>
          </div>
        </TabsContent>

        <TabsContent value="report" className="space-y-4">
          <div className="text-center py-12">
            <p className="text-muted-foreground">报告设置功能正在开发中...</p>
          </div>
        </TabsContent>

        <TabsContent value="general" className="space-y-4">
          <div className="text-center py-12">
            <p className="text-muted-foreground">通用设置功能正在开发中...</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
