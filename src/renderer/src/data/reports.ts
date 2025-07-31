export interface Report {
  id: string;
  title: string;
  summary: string;
  createdAt: string;
  timeRange: string;
  targetType: string;
  analysisType: string;
  messageCount: number;
  content?: string;
}

export const reports: Report[] = [
  {
    id: '1',
    title: '与张三的情感分析报告',
    summary: '通过分析你与张三最近一个月的聊天记录，发现你们的友谊正在加深。你表现出很强的同理心和关怀，经常主动询问对方的近况。',
    createdAt: '2024-12-15',
    timeRange: '最近一个月',
    targetType: '特定联系人',
    analysisType: '情感分析',
    messageCount: 245,
  },
  {
    id: '2',
    title: '工作群氛围分析',
    summary: '工作群整体氛围积极向上，团队协作良好。你在群中扮演积极的角色，经常分享有用信息并协调团队工作。',
    createdAt: '2024-12-14',
    timeRange: '最近两周',
    targetType: '群聊',
    analysisType: '工作氛围',
    messageCount: 156,
  },
  {
    id: '3',
    title: '个人情商提升分析',
    summary: '通过全面分析你的聊天模式，发现你在情感表达和社交互动方面有很大优势，同时也识别出一些可以改进的地方。',
    createdAt: '2024-12-13',
    timeRange: '最近一周',
    targetType: '全部聊天',
    analysisType: '情商提升',
    messageCount: 89,
  },
  {
    id: '4',
    title: '与朋友们的关系分析',
    summary: '你与朋友圈的互动显示出你是一个值得信赖的朋友。你善于倾听，经常给予建设性建议，朋友们都很信任你。',
    createdAt: '2024-12-12',
    timeRange: '最近一个月',
    targetType: '多个联系人',
    analysisType: '关系分析',
    messageCount: 312,
  },
  {
    id: '5',
    title: '思维模式深度分析',
    summary: '分析发现你具有成长型思维，面对挑战时表现积极。不过在某些情况下可能存在过度思考的倾向。',
    createdAt: '2024-12-11',
    timeRange: '最近三个月',
    targetType: '全部聊天',
    analysisType: '思维陷阱',
    messageCount: 567,
  },
  {
    id: '6',
    title: '家庭群互动分析',
    summary: '在家庭群中，你表现出很强的责任感和关爱。经常分享生活趣事，是家庭和谐的重要纽带。',
    createdAt: '2024-12-10',
    timeRange: '最近一个月',
    targetType: '群聊',
    analysisType: '关系分析',
    messageCount: 78,
  }
];