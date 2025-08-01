import React, { useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Loader2, AlertCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface InitializationCheckerProps {
  status: 'checking' | 'incomplete'
}

export const InitializationChecker: React.FC<InitializationCheckerProps> = ({ status }) => {
  const navigate = useNavigate()

  const handleGoToInitialization = () => {
    navigate('/initialization')
  }

  // 自动跳转到初始化页面
  useEffect(() => {
    if (status === 'incomplete') {
      const timer = setTimeout(() => {
        navigate('/initialization')
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [status, navigate])

  if (status === 'checking') {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              <Loader2 className="w-12 h-12 mx-auto text-blue-600 animate-spin" />
            </div>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">正在检查初始化状态</h2>
            <p className="mb-6 text-gray-600">请稍候，正在验证应用配置...</p>
            <Progress value={undefined} className="w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (status === 'incomplete') {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-orange-50 to-red-100">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              <AlertCircle className="w-12 h-12 mx-auto text-orange-600" />
            </div>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">需要完成初始化</h2>
            <p className="mb-6 text-gray-600">应用尚未完成初始化配置，即将跳转到初始化页面...</p>
            <Button onClick={handleGoToInitialization} className="w-full" size="lg">
              立即初始化
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return null
}
