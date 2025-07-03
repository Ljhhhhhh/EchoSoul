/**
 * 生成唯一ID
 */
export declare function generateId(): string;
/**
 * 格式化日期为YYYY-MM-DD
 */
export declare function formatDate(date: Date): string;
/**
 * 获取昨天的日期
 */
export declare function getYesterday(): string;
/**
 * 获取今天的日期
 */
export declare function getToday(): string;
/**
 * 解析时间范围字符串
 */
export declare function parseTimeRange(range: string): {
    start: string;
    end: string;
};
/**
 * 智能采样消息
 */
export declare function sampleMessages<T>(messages: T[], maxCount?: number): T[];
/**
 * 错误处理Result类型
 */
export type Result<T, E = Error> = {
    success: true;
    data: T;
} | {
    success: false;
    error: E;
};
export declare function success<T>(data: T): Result<T>;
export declare function failure<E = Error>(error: E): Result<never, E>;
//# sourceMappingURL=utils.d.ts.map