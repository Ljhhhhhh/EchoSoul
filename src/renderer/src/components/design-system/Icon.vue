<template>
  <component
    :is="iconComponent"
    :size="iconSize"
    :stroke-width="strokeWidth"
    :class="iconClasses"
    v-bind="$attrs"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/utils/design-system'
import type { ComponentSize } from '@/types/design-system'

// 动态导入 lucide-vue-next 图标
import {
  Home,
  Settings,
  User,
  Search,
  Plus,
  Edit,
  Trash2,
  Download,
  Upload,
  Share,
  Copy,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  MoreHorizontal,
  MoreVertical,
  Info,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  Eye,
  EyeOff,
  Calendar,
  Clock,
  Mail,
  Phone,
  MapPin,
  Star,
  Heart,
  Bookmark,
  Filter,
  SortAsc,
  SortDesc,
  Refresh,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  FileText,
  Image,
  Video,
  Music,
  Folder,
  FolderOpen,
  Save,
  Print,
  Maximize,
  Minimize,
  Menu,
  Grid,
  List,
  BarChart,
  PieChart,
  TrendingUp,
  TrendingDown,
  Zap,
  Shield,
  Lock,
  Unlock,
  Key,
  Database,
  Server,
  Cloud,
  Wifi,
  WifiOff,
  Bluetooth,
  Battery,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Stop,
  SkipBack,
  SkipForward,
  Repeat,
  Shuffle
} from 'lucide-vue-next'

export interface IconProps {
  name: string
  size?: number | ComponentSize
  color?: string
  strokeWidth?: number
  className?: string
}

const props = withDefaults(defineProps<IconProps>(), {
  size: 24,
  strokeWidth: 2
})

// 图标映射表
const iconMap = {
  // 导航类
  home: Home,
  settings: Settings,
  user: User,
  search: Search,
  menu: Menu,

  // 操作类
  plus: Plus,
  edit: Edit,
  'trash-2': Trash2,
  download: Download,
  upload: Upload,
  share: Share,
  copy: Copy,
  save: Save,
  print: Print,
  refresh: Refresh,

  // 状态类
  check: Check,
  'check-circle': CheckCircle,
  x: X,
  'x-circle': XCircle,
  info: Info,
  'alert-triangle': AlertTriangle,
  'alert-circle': AlertCircle,
  'loader-2': Loader2,

  // 方向类
  'chevron-left': ChevronLeft,
  'chevron-right': ChevronRight,
  'chevron-up': ChevronUp,
  'chevron-down': ChevronDown,
  'arrow-left': ArrowLeft,
  'arrow-right': ArrowRight,
  'arrow-up': ArrowUp,
  'arrow-down': ArrowDown,

  // 更多操作
  'more-horizontal': MoreHorizontal,
  'more-vertical': MoreVertical,

  // 可见性
  eye: Eye,
  'eye-off': EyeOff,

  // 时间日期
  calendar: Calendar,
  clock: Clock,

  // 联系方式
  mail: Mail,
  phone: Phone,
  'map-pin': MapPin,

  // 收藏评分
  star: Star,
  heart: Heart,
  bookmark: Bookmark,

  // 排序筛选
  filter: Filter,
  'sort-asc': SortAsc,
  'sort-desc': SortDesc,

  // 链接
  'external-link': ExternalLink,

  // 文件类型
  'file-text': FileText,
  image: Image,
  video: Video,
  music: Music,
  folder: Folder,
  'folder-open': FolderOpen,

  // 窗口控制
  maximize: Maximize,
  minimize: Minimize,

  // 布局视图
  grid: Grid,
  list: List,

  // 图表类
  'bar-chart': BarChart,
  'pie-chart': PieChart,
  'trending-up': TrendingUp,
  'trending-down': TrendingDown,

  // 系统类
  zap: Zap,
  shield: Shield,
  lock: Lock,
  unlock: Unlock,
  key: Key,
  database: Database,
  server: Server,
  cloud: Cloud,

  // 连接类
  wifi: Wifi,
  'wifi-off': WifiOff,
  bluetooth: Bluetooth,

  // 设备类
  battery: Battery,
  volume2: Volume2,
  'volume-x': VolumeX,

  // 媒体控制
  play: Play,
  pause: Pause,
  stop: Stop,
  'skip-back': SkipBack,
  'skip-forward': SkipForward,
  repeat: Repeat,
  shuffle: Shuffle
}

const iconComponent = computed(() => {
  return iconMap[props.name as keyof typeof iconMap] || Info
})

const iconSize = computed(() => {
  if (typeof props.size === 'number') {
    return props.size
  }

  const sizeMap = {
    sm: 16,
    md: 20,
    lg: 24
  }

  return sizeMap[props.size] || 20
})

const iconClasses = computed(() => {
  return cn(
    'inline-block flex-shrink-0',
    {
      [`text-${props.color}`]: props.color
    },
    props.className
  )
})
</script>

<style scoped>
/* 图标动画效果 */
.icon-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 图标悬停效果 */
.icon-hover {
  transition: all 150ms ease;
}

.icon-hover:hover {
  transform: scale(1.1);
}

/* 图标脉冲效果 */
.icon-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
