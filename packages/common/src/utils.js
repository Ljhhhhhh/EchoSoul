"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateId = generateId;
exports.formatDate = formatDate;
exports.getYesterday = getYesterday;
exports.getToday = getToday;
exports.parseTimeRange = parseTimeRange;
exports.sampleMessages = sampleMessages;
exports.success = success;
exports.failure = failure;
/**
 * 生成唯一ID
 */
function generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
/**
 * 格式化日期为YYYY-MM-DD
 */
function formatDate(date) {
    return date.toISOString().split('T')[0];
}
/**
 * 获取昨天的日期
 */
function getYesterday() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return formatDate(yesterday);
}
/**
 * 获取今天的日期
 */
function getToday() {
    return formatDate(new Date());
}
/**
 * 解析时间范围字符串
 */
function parseTimeRange(range) {
    const today = new Date();
    switch (range) {
        case '最近7天':
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);
            return {
                start: formatDate(weekAgo),
                end: formatDate(today),
            };
        case '最近30天':
            const monthAgo = new Date(today);
            monthAgo.setDate(monthAgo.getDate() - 30);
            return {
                start: formatDate(monthAgo),
                end: formatDate(today),
            };
        case '最近一年':
            const yearAgo = new Date(today);
            yearAgo.setFullYear(yearAgo.getFullYear() - 1);
            return {
                start: formatDate(yearAgo),
                end: formatDate(today),
            };
        default:
            // 默认返回最近7天
            const defaultStart = new Date(today);
            defaultStart.setDate(defaultStart.getDate() - 7);
            return {
                start: formatDate(defaultStart),
                end: formatDate(today),
            };
    }
}
/**
 * 智能采样消息
 */
function sampleMessages(messages, maxCount = 100) {
    if (messages.length <= maxCount) {
        return messages;
    }
    const step = Math.floor(messages.length / maxCount);
    const sampled = [];
    for (let i = 0; i < messages.length; i += step) {
        sampled.push(messages[i]);
    }
    return sampled.slice(0, maxCount);
}
function success(data) {
    return { success: true, data };
}
function failure(error) {
    return { success: false, error };
}
//# sourceMappingURL=utils.js.map