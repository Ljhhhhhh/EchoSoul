import { z } from 'zod';
export declare const UserSettingsSchema: z.ZodObject<{
    llmProvider: z.ZodEnum<["openai", "anthropic", "gemini", "openrouter", "deepseek"]>;
    apiKeyEncrypted: z.ZodString;
    cronTime: z.ZodDefault<z.ZodString>;
    reportPrefs: z.ZodObject<{
        autoGenerate: z.ZodDefault<z.ZodBoolean>;
        includeEmotions: z.ZodDefault<z.ZodBoolean>;
        includeTopics: z.ZodDefault<z.ZodBoolean>;
        includeSocial: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        autoGenerate: boolean;
        includeEmotions: boolean;
        includeTopics: boolean;
        includeSocial: boolean;
    }, {
        autoGenerate?: boolean | undefined;
        includeEmotions?: boolean | undefined;
        includeTopics?: boolean | undefined;
        includeSocial?: boolean | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    llmProvider: "openai" | "anthropic" | "gemini" | "openrouter" | "deepseek";
    apiKeyEncrypted: string;
    cronTime: string;
    reportPrefs: {
        autoGenerate: boolean;
        includeEmotions: boolean;
        includeTopics: boolean;
        includeSocial: boolean;
    };
}, {
    llmProvider: "openai" | "anthropic" | "gemini" | "openrouter" | "deepseek";
    apiKeyEncrypted: string;
    reportPrefs: {
        autoGenerate?: boolean | undefined;
        includeEmotions?: boolean | undefined;
        includeTopics?: boolean | undefined;
        includeSocial?: boolean | undefined;
    };
    cronTime?: string | undefined;
}>;
export type UserSettings = z.infer<typeof UserSettingsSchema>;
export declare const ChatMessageSchema: z.ZodObject<{
    id: z.ZodString;
    sender: z.ZodString;
    recipient: z.ZodString;
    timestamp: z.ZodString;
    content: z.ZodString;
    type: z.ZodDefault<z.ZodEnum<["text", "image", "voice", "video", "file"]>>;
    isGroupChat: z.ZodDefault<z.ZodBoolean>;
    groupName: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    timestamp: string;
    type: "text" | "image" | "voice" | "video" | "file";
    id: string;
    sender: string;
    recipient: string;
    content: string;
    isGroupChat: boolean;
    groupName?: string | undefined;
}, {
    timestamp: string;
    id: string;
    sender: string;
    recipient: string;
    content: string;
    type?: "text" | "image" | "voice" | "video" | "file" | undefined;
    isGroupChat?: boolean | undefined;
    groupName?: string | undefined;
}>;
export type ChatMessage = z.infer<typeof ChatMessageSchema>;
export declare const ReportMetaSchema: z.ZodObject<{
    id: z.ZodString;
    type: z.ZodEnum<["auto", "custom"]>;
    date: z.ZodString;
    title: z.ZodString;
    filePath: z.ZodString;
    metadata: z.ZodObject<{
        messageCount: z.ZodNumber;
        timeRange: z.ZodObject<{
            start: z.ZodString;
            end: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            start: string;
            end: string;
        }, {
            start: string;
            end: string;
        }>;
        participants: z.ZodArray<z.ZodString, "many">;
        analysisConfig: z.ZodAny;
    }, "strip", z.ZodTypeAny, {
        messageCount: number;
        timeRange: {
            start: string;
            end: string;
        };
        participants: string[];
        analysisConfig?: any;
    }, {
        messageCount: number;
        timeRange: {
            start: string;
            end: string;
        };
        participants: string[];
        analysisConfig?: any;
    }>;
    createdAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: "custom" | "auto";
    date: string;
    id: string;
    title: string;
    filePath: string;
    metadata: {
        messageCount: number;
        timeRange: {
            start: string;
            end: string;
        };
        participants: string[];
        analysisConfig?: any;
    };
    createdAt: string;
}, {
    type: "custom" | "auto";
    date: string;
    id: string;
    title: string;
    filePath: string;
    metadata: {
        messageCount: number;
        timeRange: {
            start: string;
            end: string;
        };
        participants: string[];
        analysisConfig?: any;
    };
    createdAt: string;
}>;
export type ReportMeta = z.infer<typeof ReportMetaSchema>;
export declare const AnalysisConfigSchema: z.ZodObject<{
    timeRange: z.ZodObject<{
        start: z.ZodString;
        end: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        start: string;
        end: string;
    }, {
        start: string;
        end: string;
    }>;
    participants: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    dimensions: z.ZodArray<z.ZodEnum<["emotion", "topic", "social", "personality"]>, "many">;
    customPrompt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    timeRange: {
        start: string;
        end: string;
    };
    dimensions: ("emotion" | "topic" | "social" | "personality")[];
    participants?: string[] | undefined;
    customPrompt?: string | undefined;
}, {
    timeRange: {
        start: string;
        end: string;
    };
    dimensions: ("emotion" | "topic" | "social" | "personality")[];
    participants?: string[] | undefined;
    customPrompt?: string | undefined;
}>;
export type AnalysisConfig = z.infer<typeof AnalysisConfigSchema>;
export declare const TaskStatusSchema: z.ZodObject<{
    id: z.ZodString;
    type: z.ZodEnum<["daily-report", "custom-report"]>;
    status: z.ZodEnum<["pending", "running", "completed", "failed"]>;
    progress: z.ZodNumber;
    errorMessage: z.ZodOptional<z.ZodString>;
    result: z.ZodOptional<z.ZodObject<{
        reportId: z.ZodString;
        filePath: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        filePath: string;
        reportId: string;
    }, {
        filePath: string;
        reportId: string;
    }>>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    status: "pending" | "running" | "completed" | "failed";
    type: "daily-report" | "custom-report";
    id: string;
    createdAt: string;
    progress: number;
    updatedAt: string;
    errorMessage?: string | undefined;
    result?: {
        filePath: string;
        reportId: string;
    } | undefined;
}, {
    status: "pending" | "running" | "completed" | "failed";
    type: "daily-report" | "custom-report";
    id: string;
    createdAt: string;
    progress: number;
    updatedAt: string;
    errorMessage?: string | undefined;
    result?: {
        filePath: string;
        reportId: string;
    } | undefined;
}>;
export type TaskStatus = z.infer<typeof TaskStatusSchema>;
export interface BasicStats {
    totalMessages: number;
    sendReceiveRatio: number;
    activeHours: string[];
    topContacts: string[];
}
export interface Contact {
    id: string;
    name: string;
    type: 'individual' | 'group';
    avatar?: string;
    lastMessageTime?: string;
}
export type ChatlogStatus = 'running' | 'not-running' | 'error';
export interface IPCEvents {
    'task:progress': (taskId: string, progress: number, message: string) => void;
    'report:generated': (reportId: string) => void;
    'notification': (title: string, message: string) => void;
}
//# sourceMappingURL=types.d.ts.map