"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskStatusSchema = exports.AnalysisConfigSchema = exports.ReportMetaSchema = exports.ChatMessageSchema = exports.UserSettingsSchema = void 0;
const zod_1 = require("zod");
// 用户配置
exports.UserSettingsSchema = zod_1.z.object({
    llmProvider: zod_1.z.enum(['openai', 'anthropic', 'gemini', 'openrouter', 'deepseek']),
    apiKeyEncrypted: zod_1.z.string(),
    cronTime: zod_1.z.string().default('02:00'),
    reportPrefs: zod_1.z.object({
        autoGenerate: zod_1.z.boolean().default(true),
        includeEmotions: zod_1.z.boolean().default(true),
        includeTopics: zod_1.z.boolean().default(true),
        includeSocial: zod_1.z.boolean().default(true),
    }),
});
// 聊天消息
exports.ChatMessageSchema = zod_1.z.object({
    id: zod_1.z.string(),
    sender: zod_1.z.string(),
    recipient: zod_1.z.string(),
    timestamp: zod_1.z.string(),
    content: zod_1.z.string(),
    type: zod_1.z.enum(['text', 'image', 'voice', 'video', 'file']).default('text'),
    isGroupChat: zod_1.z.boolean().default(false),
    groupName: zod_1.z.string().optional(),
});
// 报告元数据
exports.ReportMetaSchema = zod_1.z.object({
    id: zod_1.z.string(),
    type: zod_1.z.enum(['auto', 'custom']),
    date: zod_1.z.string(),
    title: zod_1.z.string(),
    filePath: zod_1.z.string(),
    metadata: zod_1.z.object({
        messageCount: zod_1.z.number(),
        timeRange: zod_1.z.object({
            start: zod_1.z.string(),
            end: zod_1.z.string(),
        }),
        participants: zod_1.z.array(zod_1.z.string()),
        analysisConfig: zod_1.z.any(), // 稍后定义详细schema
    }),
    createdAt: zod_1.z.string(),
});
// 分析配置
exports.AnalysisConfigSchema = zod_1.z.object({
    timeRange: zod_1.z.object({
        start: zod_1.z.string(),
        end: zod_1.z.string(),
    }),
    participants: zod_1.z.array(zod_1.z.string()).optional(),
    dimensions: zod_1.z.array(zod_1.z.enum(['emotion', 'topic', 'social', 'personality'])),
    customPrompt: zod_1.z.string().optional(),
});
// 任务状态
exports.TaskStatusSchema = zod_1.z.object({
    id: zod_1.z.string(),
    type: zod_1.z.enum(['daily-report', 'custom-report']),
    status: zod_1.z.enum(['pending', 'running', 'completed', 'failed']),
    progress: zod_1.z.number().min(0).max(100),
    errorMessage: zod_1.z.string().optional(),
    result: zod_1.z.object({
        reportId: zod_1.z.string(),
        filePath: zod_1.z.string(),
    }).optional(),
    createdAt: zod_1.z.string(),
    updatedAt: zod_1.z.string(),
});
//# sourceMappingURL=types.js.map