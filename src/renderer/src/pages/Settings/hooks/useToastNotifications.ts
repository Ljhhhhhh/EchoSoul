import { useToast } from '../../../hooks/use-toast'

export const useToastNotifications = () => {
  const { toast } = useToast()

  const showSaveSuccess = () => {
    toast({
      title: '设置已保存',
      description: '你的配置已成功更新。'
    })
  }

  const showChatlogTestSuccess = () => {
    toast({
      title: '测试 Chatlog 连接',
      description: '连接测试成功！'
    })
  }

  const showAiTestSuccess = (configName: string) => {
    toast({
      title: `测试 ${configName} 服务`,
      description: '连接测试成功！'
    })
  }

  const showConfigSwitchSuccess = (configName: string) => {
    toast({
      title: '切换成功',
      description: `已切换到 ${configName}`
    })
  }

  const showConfigAddSuccess = (configName: string) => {
    toast({
      title: '添加成功',
      description: `已添加 ${configName} 配置`
    })
  }

  const showConfigDeleteSuccess = (configName: string) => {
    toast({
      title: '删除成功',
      description: `已删除 ${configName} 配置`
    })
  }

  const showConfigNameError = () => {
    toast({
      title: '错误',
      description: '请输入配置名称'
    })
  }

  const showPromptAddSuccess = (promptName: string) => {
    toast({
      title: '添加成功',
      description: `已添加提示词 "${promptName}"`
    })
  }

  const showPromptUpdateSuccess = (promptName: string) => {
    toast({
      title: '更新成功',
      description: `已更新提示词 "${promptName}"`
    })
  }

  const showPromptDeleteSuccess = (promptName: string) => {
    toast({
      title: '删除成功',
      description: `已删除提示词 "${promptName}"`
    })
  }

  const showPromptNameError = () => {
    toast({
      title: '错误',
      description: '请输入提示词名称'
    })
  }

  const showPromptContentError = () => {
    toast({
      title: '错误',
      description: '请输入提示词内容'
    })
  }

  return {
    showSaveSuccess,
    showChatlogTestSuccess,
    showAiTestSuccess,
    showConfigSwitchSuccess,
    showConfigAddSuccess,
    showConfigDeleteSuccess,
    showConfigNameError,
    showPromptAddSuccess,
    showPromptUpdateSuccess,
    showPromptDeleteSuccess,
    showPromptNameError,
    showPromptContentError
  }
}
