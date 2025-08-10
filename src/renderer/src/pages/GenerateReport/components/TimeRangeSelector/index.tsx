/**
 * 时间范围选择组件
 */
import React from 'react'
import { motion } from 'framer-motion'
import { Calendar } from 'lucide-react'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import type { TimeRange } from '../../types'

interface TimeRangeSelectorProps {
  timeRange: string
  customStartDate: string
  customEndDate: string
  timeRanges: TimeRange[]
  onTimeRangeChange: (value: string) => void
  onStartDateChange: (value: string) => void
  onEndDateChange: (value: string) => void
}

export const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({
  timeRange,
  customStartDate,
  customEndDate,
  timeRanges,
  onTimeRangeChange,
  onStartDateChange,
  onEndDateChange
}) => {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="space-y-4">
        <div className="flex gap-4 items-center">
          <Label className="text-base font-medium min-w-[100px] flex items-center gap-2 text-gray-700">
            <Calendar className="w-5 h-5 text-blue-500" />
            时间范围
          </Label>
          <Select value={timeRange} onValueChange={onTimeRangeChange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="选择时间范围" />
            </SelectTrigger>
            <SelectContent>
              {timeRanges.map((range) => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {timeRange === 'custom' && (
          <div className="flex items-center gap-4 ml-[116px]">
            <div>
              <Label htmlFor="startDate" className="text-xs text-gray-500">
                开始日期
              </Label>
              <Input
                id="startDate"
                type="date"
                value={customStartDate}
                onChange={(e) => onStartDateChange(e.target.value)}
                className="w-40"
              />
            </div>
            <div>
              <Label htmlFor="endDate" className="text-xs text-gray-500">
                结束日期
              </Label>
              <Input
                id="endDate"
                type="date"
                value={customEndDate}
                onChange={(e) => onEndDateChange(e.target.value)}
                className="w-40"
              />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
