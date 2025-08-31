import React, { useState, useRef } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Download, Copy, Share2, Brain } from 'lucide-react'
import { toast } from 'sonner'

// 导入 markdown-to-image 组件
import 'markdown-to-image/dist/style.css'
import { Md2Poster, Md2PosterContent, Md2PosterHeader, Md2PosterFooter } from 'markdown-to-image'

interface ShareReportProps {
  content: string
  reportId: string
  disabled?: boolean
}

export const ShareReport: React.FC<ShareReportProps> = ({
  content,
  reportId,
  disabled = false
}) => {
  const [isGenerating, setIsGenerating] = useState(false)
  const posterRef = useRef<HTMLDivElement>(null)

  // 生成海报图片的通用方法
  const generatePosterImage = async (): Promise<HTMLCanvasElement | null> => {
    if (!posterRef.current) return null

    const html2canvas = await import('html2canvas')
    return html2canvas.default(posterRef.current, {
      backgroundColor: '#ffffff',
      scale: 2, // 提高图片质量
      useCORS: true,
      allowTaint: true,
      width: posterRef.current.offsetWidth,
      height: posterRef.current.offsetHeight
    })
  }

  // 处理图片下载
  const handleDownloadImage = async () => {
    try {
      setIsGenerating(true)
      toast.info('正在生成分享图片...')

      const canvas = await generatePosterImage()
      if (!canvas) return

      // 创建下载链接
      const link = document.createElement('a')
      link.download = `echosoul-report-${reportId}-${Date.now()}.png`
      link.href = canvas.toDataURL('image/png', 1.0)
      link.click()

      toast.success('图片已下载到本地')
    } catch (error) {
      console.error('下载图片失败:', error)
      toast.error('下载图片失败，请重试')
    } finally {
      setIsGenerating(false)
    }
  }

  // 处理复制图片到剪贴板
  const handleCopyImage = async () => {
    try {
      setIsGenerating(true)
      toast.info('正在生成分享图片...')

      const canvas = await generatePosterImage()
      if (!canvas) return

      canvas.toBlob(
        async (blob) => {
          if (blob) {
            try {
              await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
              toast.success('图片已复制到剪贴板')
            } catch (error) {
              console.error('复制图片失败:', error)
              toast.error('复制图片失败，请重试')
            }
          }
        },
        'image/png',
        1.0
      )
    } catch (error) {
      console.error('生成图片失败:', error)
      toast.error('生成图片失败，请重试')
    } finally {
      setIsGenerating(false)
    }
  }

  // 获取当前日期
  const getCurrentDate = () => {
    return new Date().toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // 处理长内容的截取和优化
  const processContent = (content: string) => {
    // 调整内容长度限制，适应desktop尺寸
    const maxLength = 2000
    if (content.length > maxLength) {
      const truncated = content.substring(0, maxLength)
      const lastNewline = truncated.lastIndexOf('\n')
      const cutPoint = lastNewline > maxLength * 0.8 ? lastNewline : maxLength
      return truncated.substring(0, cutPoint) + '\n\n...\n\n*内容过长，完整报告请查看应用内详情*'
    }
    return content
  }

  return (
    <>
      {/* 隐藏的海报生成区域 */}
      <div
        ref={posterRef}
        className="fixed -top-[9999px] -left-[9999px] w-[600px]"
        style={{ aspectRatio: '9/16' }}
      >
        <Md2Poster theme="SpringGradientWave" size="desktop" className="w-full h-full">
          <Md2PosterHeader className="flex justify-between items-center px-8 py-6">
            <div className="flex items-center gap-3">
              <Brain className="w-6 h-6 text-white" />
              <span className="font-bold text-white text-lg">EchoSoul</span>
            </div>
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30 px-3 py-1">
              AI分析报告
            </Badge>
          </Md2PosterHeader>

          <Md2PosterContent className="text-sm leading-relaxed px-8">
            {processContent(content || '暂无内容')}
          </Md2PosterContent>

          <Md2PosterFooter className="flex justify-between items-center px-8 py-6 text-white/80">
            <span className="text-sm font-medium">© EchoSoul - 智能聊天分析</span>
            <span className="text-sm">{getCurrentDate()}</span>
          </Md2PosterFooter>
        </Md2Poster>
      </div>

      {/* 分享按钮下拉菜单 */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            disabled={disabled || !content || isGenerating}
            className="flex items-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            {isGenerating ? '生成中...' : '分享报告'}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={handleDownloadImage}
            disabled={isGenerating || !content}
            className="flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            下载到本地
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleCopyImage}
            disabled={isGenerating || !content}
            className="flex items-center gap-2 cursor-pointer"
          >
            <Copy className="w-4 h-4" />
            复制到剪贴板
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}

export default ShareReport
