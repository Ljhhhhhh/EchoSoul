/**
 * 快速选择区域组件
 */
import React from 'react'
import { motion } from 'framer-motion'
import { Clock, Bookmark, Trash2 } from 'lucide-react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from '../../../../components/ui/card'
import { Button } from '../../../../components/ui/button'
import { Badge } from '../../../../components/ui/badge'
import type { SavedCondition } from '../../types'

interface QuickSelectSectionProps {
  conditions: SavedCondition[]
  showConditions: boolean
  onToggleDisplay: () => void
  onApplyCondition: (condition: SavedCondition) => void
  onDeleteCondition: (id: string) => void
}

export const QuickSelectSection: React.FC<QuickSelectSectionProps> = ({
  conditions,
  showConditions,
  onToggleDisplay,
  onApplyCondition,
  onDeleteCondition
}) => {
  if (conditions.length === 0) {
    return null
  }

  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
      <Card className="border-orange-200 bg-gradient-to-br from-orange-50/30 to-amber-50/30">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg text-orange-800">
              <Clock className="w-5 h-5" />
              快速选择
            </CardTitle>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onToggleDisplay}
              className="text-orange-600 hover:text-orange-700"
            >
              {showConditions ? '收起' : '展开'}
            </Button>
          </div>
          <CardDescription>使用之前保存的分析条件快速生成报告</CardDescription>
        </CardHeader>
        {showConditions && (
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {conditions.slice(0, 6).map((condition) => (
                <div
                  key={condition.id}
                  className="relative p-3 transition-all border border-orange-200 rounded-lg cursor-pointer group bg-white/50 hover:bg-white/80"
                  onClick={() => onApplyCondition(condition)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-800 truncate">
                        {condition.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          <Bookmark className="w-3 h-3 mr-1" />
                          使用 {condition.usageCount} 次
                        </Badge>
                        <span className="text-xs text-gray-400">
                          {new Date(condition.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-auto p-1 text-gray-400 transition-opacity opacity-0 group-hover:opacity-100 hover:text-red-500"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeleteCondition(condition.id)
                      }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>
    </motion.div>
  )
}
