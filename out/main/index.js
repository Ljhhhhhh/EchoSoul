"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const electron = require("electron");
const path = require("path");
const winston = require("winston");
const utils = require("@electron-toolkit/utils");
const Store = require("electron-store");
const child_process = require("child_process");
const execa = require("execa");
const fs = require("fs");
const os = require("os");
const fs$1 = require("fs/promises");
const cron = require("node-cron");
const events = require("events");
function _interopNamespaceDefault(e) {
  const n = Object.create(null, { [Symbol.toStringTag]: { value: "Module" } });
  if (e) {
    for (const k in e) {
      if (k !== "default") {
        const d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: () => e[k]
        });
      }
    }
  }
  n.default = e;
  return Object.freeze(n);
}
const path__namespace = /* @__PURE__ */ _interopNamespaceDefault(path);
const winston__namespace = /* @__PURE__ */ _interopNamespaceDefault(winston);
const fs__namespace = /* @__PURE__ */ _interopNamespaceDefault(fs);
const os__namespace = /* @__PURE__ */ _interopNamespaceDefault(os);
const fs__namespace$1 = /* @__PURE__ */ _interopNamespaceDefault(fs$1);
const cron__namespace = /* @__PURE__ */ _interopNamespaceDefault(cron);
const logDir = path__namespace.join(electron.app.getPath("userData"), "logs");
const logFormat = winston__namespace.format.combine(
  winston__namespace.format.timestamp({
    format: "YYYY-MM-DD HH:mm:ss"
  }),
  winston__namespace.format.errors({ stack: true }),
  winston__namespace.format.printf(({ timestamp, level, message, service, stack }) => {
    const servicePrefix = service ? `[${service}] ` : "";
    const logMessage = `${timestamp} ${level.toUpperCase()} ${servicePrefix}${message}`;
    return stack ? `${logMessage}
${stack}` : logMessage;
  })
);
const mainLogger = winston__namespace.createLogger({
  level: process.env.NODE_ENV === "development" ? "debug" : "info",
  format: logFormat,
  transports: [
    // 控制台输出
    new winston__namespace.transports.Console({
      format: winston__namespace.format.combine(winston__namespace.format.colorize(), logFormat)
    }),
    // 文件输出
    new winston__namespace.transports.File({
      filename: path__namespace.join(logDir, "error.log"),
      level: "error",
      maxsize: 5242880,
      // 5MB
      maxFiles: 5
    }),
    new winston__namespace.transports.File({
      filename: path__namespace.join(logDir, "combined.log"),
      maxsize: 5242880,
      // 5MB
      maxFiles: 5
    })
  ]
});
function createLogger(service) {
  return mainLogger.child({ service });
}
const logger$a = createLogger("ConfigService");
class ConfigService {
  store;
  defaultSettings = {
    llmProvider: "openai",
    apiKeyEncrypted: "",
    cronTime: "02:00",
    reportPrefs: {
      autoGenerate: true,
      includeEmotions: true,
      includeTopics: true,
      includeSocial: true
    }
  };
  constructor() {
    this.store = new Store({
      name: "echosoul-config",
      defaults: this.defaultSettings
    });
  }
  async initialize() {
    logger$a.info("ConfigService initialized");
  }
  async get() {
    return this.store.store;
  }
  async set(settings) {
    const current = await this.get();
    const updated = { ...current, ...settings };
    this.store.store = updated;
    logger$a.info("Settings updated");
  }
  async testApiKey(provider, apiKey) {
    logger$a.info(`Testing API key for provider: ${provider}：${apiKey}`);
    return true;
  }
  async cleanup() {
    logger$a.info("ConfigService cleaned up");
  }
}
const logger$9 = createLogger("ChatlogService");
class ChatlogService {
  baseUrl = "http://127.0.0.1:5030";
  // chatlog默认端口
  chatlogProcess = null;
  chatlogPath;
  isInitialized = false;
  // TODO: wechatKey 是固定不变的，应该长期存储
  wechatKey = "";
  // 存储获取到的微信密钥
  constructor() {
    const platform = process.platform;
    let resourcesPath;
    if (electron.app.isPackaged) {
      resourcesPath = path__namespace.join(process.resourcesPath, "app.asar.unpacked", "resources");
    } else {
      resourcesPath = path__namespace.join(process.cwd(), "resources");
    }
    if (platform === "darwin") {
      this.chatlogPath = path__namespace.join(resourcesPath, "chatlog_mac", "chatlog");
    } else if (platform === "win32") {
      this.chatlogPath = path__namespace.join(resourcesPath, "chatlog_windows", "chatlog.exe");
    } else {
      throw new Error(`Unsupported platform: ${platform}`);
    }
  }
  async initialize() {
    try {
      if (!fs__namespace.existsSync(this.chatlogPath)) {
        throw new Error(`Chatlog executable not found at: ${this.chatlogPath}`);
      }
      if (process.platform === "darwin") {
        await this.setExecutablePermission();
      }
      logger$9.info(`ChatlogService initialized with executable: ${this.chatlogPath}`);
      this.isInitialized = true;
    } catch (error) {
      logger$9.error("Failed to initialize ChatlogService:", error);
      throw error;
    }
  }
  async setExecutablePermission() {
    try {
      await execa.execa("chmod", ["+x", this.chatlogPath]);
      logger$9.info("Executable permission set successfully");
    } catch (error) {
      logger$9.error("Failed to set executable permission:", error);
      throw error;
    }
  }
  /**
   * 获取chatlog解密后的数据目录
   * 我们将数据解密到固定的目录：~/Documents/EchoSoul/chatlog_data
   */
  getChatlogDataDir() {
    const homeDir = os__namespace.homedir();
    const dataDir = path__namespace.join(homeDir, "Documents", "EchoSoul", "chatlog_data");
    if (!fs__namespace.existsSync(dataDir)) {
      fs__namespace.mkdirSync(dataDir, { recursive: true });
      logger$9.info(`Created chatlog data directory: ${dataDir}`);
    }
    return dataDir;
  }
  /**
   * 获取微信原始数据目录（用于key命令）
   */
  getWeChatSourceDir() {
    const homeDir = os__namespace.homedir();
    if (process.platform === "darwin") {
      return path__namespace.join(
        homeDir,
        "Library",
        "Containers",
        "com.tencent.xinWeChat",
        "Data",
        "Library",
        "Application Support",
        "com.tencent.xinWeChat"
      );
    }
    if (process.platform === "win32") {
      return path__namespace.join(homeDir, "Documents", "WeChat Files");
    }
    logger$9.warn(`Unsupported platform: ${process.platform}, using home directory`);
    return homeDir;
  }
  async checkStatus() {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/contact`, {
        method: "GET",
        timeout: 3e3
      });
      return response.ok ? "running" : "error";
    } catch (error) {
      logger$9.debug("Chatlog service not running:", error);
      return "not-running";
    }
  }
  async startService() {
    if (!this.isInitialized) {
      logger$9.error("ChatlogService not initialized");
      return false;
    }
    if (this.chatlogProcess) {
      logger$9.info("Chatlog service already running");
      return true;
    }
    try {
      logger$9.info(`Starting chatlog server by ${this.chatlogPath}`);
      const dataDir = this.getChatlogDataDir();
      logger$9.info(`Using chatlog data directory: ${dataDir}`);
      this.chatlogProcess = child_process.spawn(
        this.chatlogPath,
        ["server", "--work-dir", dataDir, "--addr", "127.0.0.1:5030"],
        {
          stdio: ["pipe", "pipe", "pipe"],
          detached: false
        }
      );
      this.chatlogProcess.stdout?.on("data", (data) => {
        logger$9.debug(`Chatlog stdout: ${data.toString().trim()}`);
      });
      this.chatlogProcess.stderr?.on("data", (data) => {
        logger$9.warn(`Chatlog stderr: ${data.toString().trim()}`);
      });
      this.chatlogProcess.on("close", (code) => {
        logger$9.info(`Chatlog process exited with code ${code}`);
        this.chatlogProcess = null;
      });
      this.chatlogProcess.on("error", (error) => {
        logger$9.error("Chatlog process error:", error);
        this.chatlogProcess = null;
      });
      await this.waitForService();
      logger$9.info("Chatlog server started successfully");
      return true;
    } catch (error) {
      logger$9.error("Failed to start chatlog service:", error);
      this.chatlogProcess = null;
      return false;
    }
  }
  async stopService() {
    if (this.chatlogProcess) {
      logger$9.info("Stopping chatlog service...");
      this.chatlogProcess.kill("SIGTERM");
      this.chatlogProcess = null;
    }
  }
  async waitForService(maxAttempts = 10, interval = 1e3) {
    for (let i = 0; i < maxAttempts; i++) {
      const status = await this.checkStatus();
      if (status === "running") {
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, interval));
    }
    throw new Error("Chatlog service failed to start within timeout");
  }
  /**
   * 获取微信数据密钥
   */
  async getWechatKey() {
    if (!this.isInitialized) {
      return { success: false, message: "ChatlogService not initialized" };
    }
    return new Promise((resolve) => {
      logger$9.info("Getting WeChat key...");
      const process2 = child_process.spawn(this.chatlogPath, ["key"], {
        stdio: ["pipe", "pipe", "pipe"]
      });
      let output = "";
      let errorOutput = "";
      process2.stdout?.on("data", (data) => {
        output += data.toString();
      });
      process2.stderr?.on("data", (data) => {
        errorOutput += data.toString();
      });
      process2.on("close", (code) => {
        logger$9.info(`Get key process exited with code ${code}`);
        if (code === 0) {
          logger$9.info(`WeChat key obtained successfully: ${output.trim()}`);
          this.wechatKey = output.trim();
          resolve({ success: true, message: output.trim() });
        } else {
          logger$9.error("Failed to get WeChat key:", errorOutput);
          resolve({
            success: false,
            message: errorOutput.trim() || "Unknown error"
          });
        }
      });
      process2.on("error", (error) => {
        logger$9.error("Error getting WeChat key:", error);
        resolve({ success: false, message: error.message });
      });
    });
  }
  /**
   * 解密数据库文件
   */
  async decryptDatabase() {
    if (!this.isInitialized) {
      return { success: false, message: "ChatlogService not initialized" };
    }
    if (!this.wechatKey) {
      return {
        success: false,
        message: "WeChat key not obtained. Please get key first."
      };
    }
    return new Promise((resolve) => {
      logger$9.info("Decrypting database...");
      const wechatSourceDir = this.getWeChatSourceDir();
      const workDir = this.getChatlogDataDir();
      logger$9.info(`Using WeChat source directory (data-dir): ${wechatSourceDir}`);
      logger$9.info(`Decrypting to work directory (work-dir): ${workDir}`);
      logger$9.info(`Using key: ${this.wechatKey.substring(0, 10)}...`);
      const process2 = child_process.spawn(
        this.chatlogPath,
        [
          "decrypt",
          "--data-dir",
          wechatSourceDir,
          // 微信原始数据目录
          "--work-dir",
          workDir,
          // 解密后数据存放目录
          "--key",
          this.wechatKey
        ],
        {
          stdio: ["pipe", "pipe", "pipe"]
        }
      );
      let output = "";
      let errorOutput = "";
      process2.stdout?.on("data", (data) => {
        output += data.toString();
      });
      process2.stderr?.on("data", (data) => {
        errorOutput += data.toString();
      });
      process2.on("close", (code) => {
        if (code === 0) {
          logger$9.info("Database decrypted successfully");
          resolve({ success: true, message: output.trim() });
        } else {
          logger$9.error("Failed to decrypt database:", errorOutput);
          resolve({
            success: false,
            message: errorOutput.trim() || "Unknown error"
          });
        }
      });
      process2.on("error", (error) => {
        logger$9.error("Error decrypting database:", error);
        resolve({ success: false, message: error.message });
      });
    });
  }
  /**
   * 检查chatlog是否已经初始化（密钥获取和数据库解密）
   */
  async checkInitialization() {
    try {
      const status = await this.checkStatus();
      const canStartServer = status === "running";
      return {
        keyObtained: true,
        // 简化实现，实际应该检查密钥文件
        databaseDecrypted: true,
        // 简化实现，实际应该检查解密后的数据库
        canStartServer
      };
    } catch (error) {
      return {
        keyObtained: false,
        databaseDecrypted: false,
        canStartServer: false
      };
    }
  }
  async getContacts() {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/contact`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      return this.normalizeContacts(data);
    } catch (error) {
      logger$9.error("Failed to get contacts:", error);
      return [];
    }
  }
  async getMessages(params) {
    try {
      const url = new URL(`${this.baseUrl}/api/v1/chatlog`);
      url.searchParams.set("time", `${params.startDate}~${params.endDate}`);
      if (params.talker) {
        url.searchParams.set("talker", params.talker);
      }
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      return this.normalizeMessages(data);
    } catch (error) {
      logger$9.error("Failed to get messages:", error);
      return [];
    }
  }
  normalizeContacts(data) {
    return data.map((item) => ({
      id: item.id || item.wxid,
      name: item.name || item.nickname,
      type: item.type === "chatroom" ? "group" : "individual",
      avatar: item.avatar,
      lastMessageTime: item.lastMessageTime
    }));
  }
  normalizeMessages(data) {
    return data.map((item) => ({
      id: item.id || `${item.timestamp}-${item.sender}`,
      sender: item.sender || item.from,
      recipient: item.recipient || item.to,
      timestamp: item.timestamp,
      content: item.content || item.message,
      type: this.normalizeMessageType(item.type),
      isGroupChat: item.isGroupChat || false,
      groupName: item.groupName
    }));
  }
  normalizeMessageType(type) {
    if (typeof type === "string") {
      switch (type.toLowerCase()) {
        case "image":
        case "img":
          return "image";
        case "voice":
        case "audio":
          return "voice";
        case "video":
          return "video";
        case "file":
          return "file";
        default:
          return "text";
      }
    }
    return "text";
  }
  async cleanup() {
    await this.stopService();
    logger$9.info("ChatlogService cleaned up");
  }
}
const logger$8 = createLogger("AnalysisService");
class AnalysisService {
  async initialize() {
    logger$8.info("AnalysisService initialized");
  }
  async generateReport(messages, config) {
    logger$8.info(`Generating report for ${messages.length} messages`);
    try {
      const stats = this.calculateBasicStats(messages);
      const analysis = await this.analyzeMessages(messages, stats);
      return this.formatReport(analysis, stats, config);
    } catch (error) {
      logger$8.error("Failed to generate report:", error);
      throw error;
    }
  }
  calculateBasicStats(messages) {
    const totalMessages = messages.length;
    const sentMessages = messages.filter((m) => m.sender !== "self").length;
    const sendReceiveRatio = totalMessages > 0 ? sentMessages / totalMessages : 0;
    const hourCounts = /* @__PURE__ */ new Map();
    messages.forEach((message) => {
      const hour = new Date(message.timestamp).getHours();
      hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
    });
    const activeHours = Array.from(hourCounts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([hour]) => `${hour}:00-${hour + 1}:00`);
    const contactCounts = /* @__PURE__ */ new Map();
    messages.forEach((message) => {
      const contact = message.isGroupChat ? message.groupName || "Unknown Group" : message.sender;
      contactCounts.set(contact, (contactCounts.get(contact) || 0) + 1);
    });
    const topContacts = Array.from(contactCounts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([contact]) => contact);
    return {
      totalMessages,
      sendReceiveRatio,
      activeHours,
      topContacts
    };
  }
  async analyzeMessages(messages, stats) {
    logger$8.info("Performing AI analysis (mock implementation)");
    this.sampleMessages(messages, 100);
    return {
      emotion: {
        positive: 0.7,
        negative: 0.2,
        neutral: 0.1
      },
      topics: ["工作", "生活", "娱乐"],
      personality: {
        expressiveness: 0.8,
        responsiveness: 0.7,
        initiative: 0.6
      },
      social: {
        groupChatRatio: 0.6,
        privateChatRatio: 0.4,
        averageResponseTime: 15
      },
      summary: "您是一个积极乐观的人，善于表达，在社交中比较活跃，主要关注工作和生活话题。"
    };
  }
  formatReport(analysis, stats, config) {
    const { start, end } = config.timeRange;
    return `# 聊天记录分析报告

## 分析时间范围
${start} 至 ${end}

## 基础统计
- **消息总数**: ${stats.totalMessages}条
- **主要联系人**: ${stats.topContacts.join(", ")}
- **活跃时段**: ${stats.activeHours.join(", ")}

## 情绪分析
- **积极情绪**: ${(analysis.emotion.positive * 100).toFixed(1)}%
- **消极情绪**: ${(analysis.emotion.negative * 100).toFixed(1)}%
- **中性情绪**: ${(analysis.emotion.neutral * 100).toFixed(1)}%

## 主要话题
${analysis.topics.map((topic) => `- ${topic}`).join("\n")}

## 性格特征
- **表达丰富度**: ${(analysis.personality.expressiveness * 100).toFixed(1)}%
- **回应积极性**: ${(analysis.personality.responsiveness * 100).toFixed(1)}%
- **主动性**: ${(analysis.personality.initiative * 100).toFixed(1)}%

## 社交模式
- **群聊比例**: ${(analysis.social.groupChatRatio * 100).toFixed(1)}%
- **私聊比例**: ${(analysis.social.privateChatRatio * 100).toFixed(1)}%
- **平均回复时间**: ${analysis.social.averageResponseTime}分钟

## 总结
${analysis.summary}

---
*报告生成时间: ${(/* @__PURE__ */ new Date()).toLocaleString()}*
`;
  }
  sampleMessages(messages, maxCount = 100) {
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
  async cleanup() {
    logger$8.info("AnalysisService cleaned up");
  }
}
const logger$7 = createLogger("ReportService");
class ReportService {
  constructor(database, analysis) {
    this.database = database;
    this.analysis = analysis;
    const userDataPath = electron.app.getPath("userData");
    this.reportsDir = path__namespace.join(userDataPath, "reports");
  }
  reportsDir;
  // 工具函数
  generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  formatDate(date) {
    return date.toISOString().split("T")[0];
  }
  async initialize() {
    try {
      await fs__namespace$1.mkdir(this.reportsDir, { recursive: true });
      logger$7.info(`Reports directory created at: ${this.reportsDir}`);
    } catch (error) {
      logger$7.error("Failed to create reports directory:", error);
      throw error;
    }
  }
  async generateCustomReport(config, taskId) {
    const actualTaskId = taskId || this.generateId();
    try {
      await this.createTask(actualTaskId, "custom-report");
      await this.updateTaskProgress(actualTaskId, 50, "生成报告中...");
      const reportContent = `# 自定义分析报告

## 分析配置
- **时间范围**: ${config.timeRange.start} 至 ${config.timeRange.end}
- **分析维度**: ${config.dimensions.join(", ")}
${config.participants ? `- **分析对象**: ${config.participants.join(", ")}` : ""}

## 报告内容
这是一个模拟的自定义报告内容。

---
*报告生成时间: ${(/* @__PURE__ */ new Date()).toLocaleString()}*
`;
      const reportMeta = await this.saveReport(reportContent, "custom", config);
      await this.updateTaskProgress(actualTaskId, 100, "报告生成完成");
      await this.completeTask(actualTaskId, reportMeta.id, reportMeta.filePath);
      return reportMeta.id;
    } catch (error) {
      await this.failTask(actualTaskId, error instanceof Error ? error.message : "Unknown error");
      throw error;
    }
  }
  async saveReport(content, type, config) {
    const id = this.generateId();
    const date = this.formatDate(/* @__PURE__ */ new Date());
    const timestamp = (/* @__PURE__ */ new Date()).toISOString();
    let fileName = `${date}-${type}`;
    if (type === "custom" && config?.participants?.length) {
      const participantName = config.participants[0];
      fileName += `-${participantName}`;
    }
    fileName += ".md";
    const filePath = path__namespace.join(this.reportsDir, fileName);
    await fs__namespace$1.writeFile(filePath, content, "utf-8");
    const reportMeta = {
      id,
      type,
      date,
      title: type === "auto" ? `${date} 每日报告` : `自定义报告 - ${date}`,
      filePath,
      metadata: {
        messageCount: 0,
        // TODO: 从实际数据获取
        timeRange: config?.timeRange || { start: date, end: date },
        participants: config?.participants || [],
        analysisConfig: config || {}
      },
      createdAt: timestamp
    };
    await this.database.saveReport(reportMeta);
    logger$7.info(`Report saved: ${fileName}`);
    return reportMeta;
  }
  async getReports() {
    return await this.database.getReports();
  }
  async getReportContent(id) {
    const reportMeta = await this.database.getReportById(id);
    if (!reportMeta) return null;
    try {
      const content = await fs__namespace$1.readFile(reportMeta.filePath, "utf-8");
      return content;
    } catch (error) {
      logger$7.error(`Failed to read report file: ${reportMeta.filePath}`, error);
      return null;
    }
  }
  // 任务管理方法
  async createTask(id, type) {
    const task = {
      id,
      type,
      status: "pending",
      progress: 0,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    await this.database.saveTaskStatus(task);
  }
  async updateTaskProgress(id, progress, message) {
    const task = await this.database.getTaskStatus(id);
    if (!task) return;
    task.status = progress === 100 ? "completed" : "running";
    task.progress = progress;
    task.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    await this.database.saveTaskStatus(task);
    logger$7.info(`Task ${id} progress: ${progress}% - ${message || ""}`);
  }
  async completeTask(id, reportId, filePath) {
    const task = await this.database.getTaskStatus(id);
    if (!task) return;
    task.status = "completed";
    task.progress = 100;
    task.result = { reportId, filePath };
    task.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    await this.database.saveTaskStatus(task);
  }
  async failTask(id, errorMessage) {
    const task = await this.database.getTaskStatus(id);
    if (!task) return;
    task.status = "failed";
    task.errorMessage = errorMessage;
    task.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    await this.database.saveTaskStatus(task);
  }
  async getTaskStatus(id) {
    return await this.database.getTaskStatus(id);
  }
  async cleanup() {
    logger$7.info("ReportService cleaned up");
  }
}
const logger$6 = createLogger("SchedulerService");
class SchedulerService {
  constructor(chatlog, report) {
    this.chatlog = chatlog;
    this.report = report;
  }
  jobs = /* @__PURE__ */ new Map();
  getYesterday() {
    const yesterday = /* @__PURE__ */ new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split("T")[0];
  }
  async initialize() {
    logger$6.info("SchedulerService initialized");
    this.setupDailyReportJob();
  }
  setupDailyReportJob() {
    const dailyTask = cron__namespace.schedule(
      "0 2 * * *",
      async () => {
        await this.generateDailyReport();
      },
      {
        scheduled: false,
        timezone: "Asia/Shanghai"
      }
    );
    this.jobs.set("daily-report", dailyTask);
    dailyTask.start();
    logger$6.info("Daily report job scheduled for 2:00 AM");
  }
  async generateDailyReport() {
    try {
      logger$6.info("Starting daily report generation");
      const status = await this.chatlog.checkStatus();
      if (status !== "running") {
        logger$6.warn("Chatlog service not running, skipping daily report");
        return;
      }
      const yesterday = this.getYesterday();
      const messages = await this.chatlog.getMessages({
        startDate: yesterday,
        endDate: yesterday
      });
      if (messages.length === 0) {
        logger$6.info("No messages found for yesterday, skipping report generation");
        return;
      }
      const reportContent = `# ${yesterday} 每日聊天分析报告

## 基础统计
- **消息总数**: ${messages.length}条
- **分析日期**: ${yesterday}

## 简要分析
昨日共产生 ${messages.length} 条聊天记录。

---
*报告生成时间: ${(/* @__PURE__ */ new Date()).toLocaleString()}*
`;
      await this.report.saveReport(reportContent, "auto");
      logger$6.info(`Daily report generated successfully for ${yesterday}`);
    } catch (error) {
      logger$6.error("Failed to generate daily report:", error);
    }
  }
  // 手动触发每日报告生成（用于测试）
  async triggerDailyReport() {
    await this.generateDailyReport();
  }
  // 更新定时任务时间
  async updateSchedule(cronTime) {
    const dailyTask = this.jobs.get("daily-report");
    if (dailyTask) {
      dailyTask.stop();
      this.jobs.delete("daily-report");
    }
    const newTask = cron__namespace.schedule(
      cronTime,
      async () => {
        await this.generateDailyReport();
      },
      {
        scheduled: false,
        timezone: "Asia/Shanghai"
      }
    );
    this.jobs.set("daily-report", newTask);
    newTask.start();
    logger$6.info(`Daily report schedule updated to: ${cronTime}`);
  }
  async cleanup() {
    for (const [name, task] of this.jobs) {
      task.stop();
      logger$6.info(`Stopped scheduled task: ${name}`);
    }
    this.jobs.clear();
    logger$6.info("SchedulerService cleaned up");
  }
}
const logger$5 = createLogger("DatabaseService");
class DatabaseService {
  reports = /* @__PURE__ */ new Map();
  settings = /* @__PURE__ */ new Map();
  tasks = /* @__PURE__ */ new Map();
  dbPath;
  constructor() {
    const userDataPath = electron.app.getPath("userData");
    this.dbPath = path__namespace.join(userDataPath, "echosoul.db");
  }
  async initialize() {
    try {
      logger$5.info(`Initializing in-memory database (SQLite disabled temporarily)`);
      const dbDir = path__namespace.dirname(this.dbPath);
      if (!fs__namespace.existsSync(dbDir)) {
        fs__namespace.mkdirSync(dbDir, { recursive: true });
      }
      logger$5.info("In-memory database initialized successfully");
    } catch (error) {
      logger$5.error("Failed to initialize database:", error);
      throw error;
    }
  }
  // 报告相关操作
  async saveReport(report) {
    this.reports.set(report.id, report);
  }
  async getReports() {
    const reports = Array.from(this.reports.values());
    return reports.sort((a, b) => {
      if (a.date !== b.date) {
        return b.date.localeCompare(a.date);
      }
      return b.createdAt.localeCompare(a.createdAt);
    });
  }
  async getReportById(id) {
    return this.reports.get(id) || null;
  }
  // 配置相关操作
  async getSetting(key) {
    return this.settings.get(key) || null;
  }
  async setSetting(key, value) {
    this.settings.set(key, value);
  }
  // 任务状态相关操作
  async saveTaskStatus(task) {
    this.tasks.set(task.id, task);
  }
  async getTaskStatus(id) {
    return this.tasks.get(id) || null;
  }
  async cleanup() {
    this.reports.clear();
    this.settings.clear();
    this.tasks.clear();
    logger$5.info("In-memory database cleared");
  }
}
const logger$4 = createLogger("AppServices");
class AppServices {
  _database;
  _config;
  _chatlog;
  _analysis;
  _report;
  _scheduler;
  constructor() {
    this._database = new DatabaseService();
    this._config = new ConfigService();
    this._chatlog = new ChatlogService();
    this._analysis = new AnalysisService();
    this._report = new ReportService(this._database, this._analysis);
    this._scheduler = new SchedulerService(this._chatlog, this._report);
  }
  async initialize() {
    try {
      logger$4.info("Initializing application services...");
      await this._database.initialize();
      await this._config.initialize();
      await this._chatlog.initialize();
      await this._analysis.initialize();
      await this._report.initialize();
      await this._scheduler.initialize();
      logger$4.info("All services initialized successfully");
    } catch (error) {
      logger$4.error("Failed to initialize services:", error);
      throw error;
    }
  }
  async cleanup() {
    try {
      logger$4.info("Cleaning up application services...");
      await this._scheduler.cleanup();
      await this._report.cleanup();
      await this._analysis.cleanup();
      await this._chatlog.cleanup();
      await this._config.cleanup();
      await this._database.cleanup();
      logger$4.info("All services cleaned up successfully");
    } catch (error) {
      logger$4.error("Failed to cleanup services:", error);
    }
  }
  // Getter方法
  get database() {
    return this._database;
  }
  get config() {
    return this._config;
  }
  get chatlog() {
    return this._chatlog;
  }
  get analysis() {
    return this._analysis;
  }
  get report() {
    return this._report;
  }
  get scheduler() {
    return this._scheduler;
  }
}
const icon = path.join(__dirname, "../../resources/icon.png");
const logger$3 = createLogger("IPC");
function setupIpcHandlers(services) {
  logger$3.info("Setting up IPC handlers");
  electron.ipcMain.handle("config:get", async () => {
    try {
      return await services.config.get();
    } catch (error) {
      logger$3.error("Failed to get config:", error);
      throw error;
    }
  });
  electron.ipcMain.handle("config:set", async (_, settings) => {
    try {
      await services.config.set(settings);
    } catch (error) {
      logger$3.error("Failed to set config:", error);
      throw error;
    }
  });
  electron.ipcMain.handle(
    "config:test-api",
    async (_, provider, apiKey) => {
      try {
        return await services.config.testApiKey(provider, apiKey);
      } catch (error) {
        logger$3.error("Failed to test API key:", error);
        return false;
      }
    }
  );
  electron.ipcMain.handle("chatlog:status", async () => {
    try {
      return await services.chatlog.checkStatus();
    } catch (error) {
      logger$3.error("Failed to check chatlog status:", error);
      return "error";
    }
  });
  electron.ipcMain.handle("chatlog:start", async () => {
    try {
      return await services.chatlog.startService();
    } catch (error) {
      logger$3.error("Failed to start chatlog service:", error);
      return false;
    }
  });
  electron.ipcMain.handle("chatlog:stop", async () => {
    try {
      await services.chatlog.stopService();
    } catch (error) {
      logger$3.error("Failed to stop chatlog service:", error);
    }
  });
  electron.ipcMain.handle("chatlog:get-contacts", async () => {
    try {
      return await services.chatlog.getContacts();
    } catch (error) {
      logger$3.error("Failed to get contacts:", error);
      return [];
    }
  });
  electron.ipcMain.handle("chatlog:get-wechat-key", async () => {
    try {
      return await services.chatlog.getWechatKey();
    } catch (error) {
      logger$3.error("Failed to get WeChat key:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error"
      };
    }
  });
  electron.ipcMain.handle("chatlog:decrypt-database", async () => {
    try {
      return await services.chatlog.decryptDatabase();
    } catch (error) {
      logger$3.error("Failed to decrypt database:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error"
      };
    }
  });
  electron.ipcMain.handle("chatlog:check-initialization", async () => {
    try {
      return await services.chatlog.checkInitialization();
    } catch (error) {
      logger$3.error("Failed to check chatlog initialization:", error);
      return {
        keyObtained: false,
        databaseDecrypted: false,
        canStartServer: false
      };
    }
  });
  electron.ipcMain.handle("report:list", async () => {
    try {
      return await services.report.getReports();
    } catch (error) {
      logger$3.error("Failed to get reports:", error);
      return [];
    }
  });
  electron.ipcMain.handle("report:get", async (_, id) => {
    try {
      return await services.report.getReportContent(id);
    } catch (error) {
      logger$3.error("Failed to get report content:", error);
      return null;
    }
  });
  electron.ipcMain.handle("report:generate-custom", async (_, config) => {
    try {
      return await services.report.generateCustomReport(config);
    } catch (error) {
      logger$3.error("Failed to generate custom report:", error);
      throw error;
    }
  });
  electron.ipcMain.handle("task:status", async (_, taskId) => {
    try {
      return await services.report.getTaskStatus(taskId);
    } catch (error) {
      logger$3.error("Failed to get task status:", error);
      return null;
    }
  });
  electron.ipcMain.handle("task:cancel", async (_, taskId) => {
    try {
      logger$3.info(`Cancelling task: ${taskId}`);
    } catch (error) {
      logger$3.error("Failed to cancel task:", error);
      throw error;
    }
  });
  if (process.env.NODE_ENV === "development") {
    electron.ipcMain.handle("dev:trigger-daily-report", async () => {
      try {
        await services.scheduler.triggerDailyReport();
        return true;
      } catch (error) {
        logger$3.error("Failed to trigger daily report:", error);
        return false;
      }
    });
  }
  logger$3.info("IPC handlers setup completed");
}
var InitializationStep = /* @__PURE__ */ ((InitializationStep2) => {
  InitializationStep2["CHECKING_WECHAT"] = "checking_wechat";
  InitializationStep2["GETTING_KEY"] = "getting_key";
  InitializationStep2["SELECTING_WORKDIR"] = "selecting_workdir";
  InitializationStep2["DECRYPTING_DATABASE"] = "decrypting_database";
  InitializationStep2["STARTING_SERVICE"] = "starting_service";
  InitializationStep2["COMPLETED"] = "completed";
  return InitializationStep2;
})(InitializationStep || {});
var InitializationStatus = /* @__PURE__ */ ((InitializationStatus2) => {
  InitializationStatus2["PENDING"] = "pending";
  InitializationStatus2["IN_PROGRESS"] = "in_progress";
  InitializationStatus2["SUCCESS"] = "success";
  InitializationStatus2["ERROR"] = "error";
  InitializationStatus2["WAITING_USER_INPUT"] = "waiting_user_input";
  return InitializationStatus2;
})(InitializationStatus || {});
const INITIALIZATION_STEPS_CONFIG = {
  [
    "checking_wechat"
    /* CHECKING_WECHAT */
  ]: {
    title: "检查微信状态",
    description: "正在检查微信是否正在运行...",
    weight: 10
  },
  [
    "getting_key"
    /* GETTING_KEY */
  ]: {
    title: "获取微信密钥",
    description: "正在获取微信数据解密密钥...",
    weight: 20
  },
  [
    "selecting_workdir"
    /* SELECTING_WORKDIR */
  ]: {
    title: "选择数据目录",
    description: "请选择解密数据的保存位置...",
    weight: 10
  },
  [
    "decrypting_database"
    /* DECRYPTING_DATABASE */
  ]: {
    title: "解密数据库",
    description: "正在解密微信数据库文件...",
    weight: 40
  },
  [
    "starting_service"
    /* STARTING_SERVICE */
  ]: {
    title: "启动服务",
    description: "正在启动 Chatlog 服务...",
    weight: 20
  },
  [
    "completed"
    /* COMPLETED */
  ]: {
    title: "初始化完成",
    description: "所有初始化步骤已完成，正在进入应用...",
    weight: 0
  }
};
var InitializationError = /* @__PURE__ */ ((InitializationError2) => {
  InitializationError2["WECHAT_NOT_RUNNING"] = "wechat_not_running";
  InitializationError2["KEY_GENERATION_FAILED"] = "key_generation_failed";
  InitializationError2["WORKDIR_INVALID"] = "workdir_invalid";
  InitializationError2["DECRYPTION_FAILED"] = "decryption_failed";
  InitializationError2["SERVICE_START_FAILED"] = "service_start_failed";
  InitializationError2["UNKNOWN_ERROR"] = "unknown_error";
  return InitializationError2;
})(InitializationError || {});
const ERROR_MESSAGES = {
  [
    "wechat_not_running"
    /* WECHAT_NOT_RUNNING */
  ]: "微信未运行，请启动微信后重试",
  [
    "key_generation_failed"
    /* KEY_GENERATION_FAILED */
  ]: "获取微信密钥失败，请确保微信正在运行",
  [
    "workdir_invalid"
    /* WORKDIR_INVALID */
  ]: "选择的目录无效或无权限访问",
  [
    "decryption_failed"
    /* DECRYPTION_FAILED */
  ]: "数据库解密失败，请检查密钥和数据路径",
  [
    "service_start_failed"
    /* SERVICE_START_FAILED */
  ]: "Chatlog 服务启动失败",
  [
    "unknown_error"
    /* UNKNOWN_ERROR */
  ]: "发生未知错误"
};
const USER_ACTION_MESSAGES = {
  start_wechat: "请启动微信应用，然后点击重试",
  select_workdir: "请选择一个用于保存解密数据的目录",
  wait_decryption: "数据库解密可能需要几分钟时间，请耐心等待",
  restart_app: "如果问题持续存在，请重启应用"
};
const logger$2 = createLogger("InitializationManager");
class InitializationManager extends events.EventEmitter {
  store;
  chatlogService;
  state;
  isRunning = false;
  constructor() {
    super();
    this.store = new Store({
      name: "initialization-config",
      defaults: {
        autoStartService: true,
        skipWeChatCheck: false
      }
    });
    this.chatlogService = new ChatlogService();
    this.state = this.createInitialState();
  }
  /**
   * 创建初始状态
   */
  createInitialState() {
    const steps = {};
    Object.values(InitializationStep).forEach((step) => {
      const config = INITIALIZATION_STEPS_CONFIG[step];
      steps[step] = {
        step,
        status: InitializationStatus.PENDING,
        progress: 0,
        title: config.title,
        description: config.description,
        canRetry: true
      };
    });
    return {
      currentStep: InitializationStep.CHECKING_WECHAT,
      steps,
      overallProgress: 0,
      isCompleted: false,
      canExit: false
    };
  }
  /**
   * 开始初始化流程
   */
  async startInitialization() {
    if (this.isRunning) {
      logger$2.warn("Initialization is already running");
      return;
    }
    this.isRunning = true;
    logger$2.info("Starting initialization process");
    try {
      await this.chatlogService.initialize();
      const savedConfig = this.store.store;
      if (savedConfig.wechatKey && savedConfig.workDir) {
        logger$2.info("Found existing configuration, checking if service can start");
        if (await this.tryStartService()) {
          this.completeInitialization();
          return;
        }
      }
      await this.runInitializationSteps();
    } catch (error) {
      logger$2.error("Initialization failed:", error);
      this.handleStepError(this.state.currentStep, error);
    } finally {
      this.isRunning = false;
    }
  }
  /**
   * 执行初始化步骤
   */
  async runInitializationSteps() {
    const steps = [
      InitializationStep.CHECKING_WECHAT,
      InitializationStep.GETTING_KEY,
      InitializationStep.SELECTING_WORKDIR,
      InitializationStep.DECRYPTING_DATABASE,
      InitializationStep.STARTING_SERVICE
    ];
    for (const step of steps) {
      await this.executeStep(step);
      if (this.state.steps[step].status === InitializationStatus.ERROR) {
        return;
      }
    }
    this.completeInitialization();
  }
  /**
   * 执行单个步骤
   */
  async executeStep(step) {
    this.updateStepStatus(step, InitializationStatus.IN_PROGRESS);
    try {
      let result;
      switch (step) {
        case InitializationStep.CHECKING_WECHAT:
          result = await this.checkWeChat();
          break;
        case InitializationStep.GETTING_KEY:
          result = await this.getWeChatKey();
          break;
        case InitializationStep.SELECTING_WORKDIR:
          result = await this.selectWorkDir();
          break;
        case InitializationStep.DECRYPTING_DATABASE:
          result = await this.decryptDatabase();
          break;
        case InitializationStep.STARTING_SERVICE:
          result = await this.startService();
          break;
        default:
          throw new Error(`Unknown step: ${step}`);
      }
      if (result.success) {
        this.updateStepStatus(step, InitializationStatus.SUCCESS, 100);
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      this.handleStepError(step, error);
      throw error;
    }
  }
  /**
   * 检查微信状态
   */
  async checkWeChat() {
    if (this.store.get("skipWeChatCheck")) {
      return { success: true, message: "Skipped WeChat check" };
    }
    const wechatInfo = await this.getWeChatInfo();
    if (!wechatInfo.isRunning) {
      this.updateStepUserAction(InitializationStep.CHECKING_WECHAT, "start_wechat");
      return {
        success: false,
        message: ERROR_MESSAGES[InitializationError.WECHAT_NOT_RUNNING]
      };
    }
    return {
      success: true,
      message: `Found ${wechatInfo.processIds.length} WeChat process(es)`,
      data: wechatInfo
    };
  }
  /**
   * 获取微信密钥
   */
  async getWeChatKey() {
    const savedKey = this.store.get("wechatKey");
    if (savedKey) {
      logger$2.info("Using saved WeChat key");
      return { success: true, message: "Using saved key" };
    }
    const result = await this.chatlogService.getWechatKey();
    if (result.success && result.message) {
      this.store.set("wechatKey", result.message);
      logger$2.info("WeChat key obtained and saved");
      return { success: true, message: "Key obtained successfully" };
    }
    return {
      success: false,
      message: result.message || ERROR_MESSAGES[InitializationError.KEY_GENERATION_FAILED]
    };
  }
  /**
   * 选择工作目录
   */
  async selectWorkDir() {
    const savedWorkDir = this.store.get("workDir");
    if (savedWorkDir) {
      logger$2.info("Using saved work directory:", savedWorkDir);
      return { success: true, message: "Using saved directory" };
    }
    const defaultWorkDir = path__namespace.join(os__namespace.homedir(), "Documents", "EchoSoul", "chatlog_data");
    this.updateStepStatus(
      InitializationStep.SELECTING_WORKDIR,
      InitializationStatus.WAITING_USER_INPUT
    );
    this.updateStepUserAction(InitializationStep.SELECTING_WORKDIR, "select_workdir");
    const selectedDir = defaultWorkDir;
    this.store.set("workDir", selectedDir);
    logger$2.info("Work directory selected:", selectedDir);
    return { success: true, message: "Directory selected", data: selectedDir };
  }
  /**
   * 解密数据库
   */
  async decryptDatabase() {
    this.updateStepUserAction(InitializationStep.DECRYPTING_DATABASE, "wait_decryption");
    const result = await this.chatlogService.decryptDatabase();
    if (result.success) {
      return { success: true, message: "Database decrypted successfully" };
    }
    return {
      success: false,
      message: result.message || ERROR_MESSAGES[InitializationError.DECRYPTION_FAILED]
    };
  }
  /**
   * 启动服务
   */
  async startService() {
    const success = await this.chatlogService.startService();
    if (success) {
      return { success: true, message: "Service started successfully" };
    }
    return {
      success: false,
      message: ERROR_MESSAGES[InitializationError.SERVICE_START_FAILED]
    };
  }
  /**
   * 尝试启动服务（用于检查现有配置）
   */
  async tryStartService() {
    try {
      const status = await this.chatlogService.checkStatus();
      if (status === "running") {
        return true;
      }
      return await this.chatlogService.startService();
    } catch (error) {
      logger$2.debug("Failed to start service with existing config:", error);
      return false;
    }
  }
  /**
   * 完成初始化
   */
  completeInitialization() {
    this.state.currentStep = InitializationStep.COMPLETED;
    this.state.isCompleted = true;
    this.state.canExit = true;
    this.state.overallProgress = 100;
    this.updateStepStatus(InitializationStep.COMPLETED, InitializationStatus.SUCCESS, 100);
    logger$2.info("Initialization completed successfully");
    this.emit("completed");
  }
  /**
   * 处理步骤错误
   */
  handleStepError(step, error) {
    logger$2.error(`Step ${step} failed:`, error);
    this.updateStepStatus(step, InitializationStatus.ERROR, 0, error.message);
    this.emit("error", { step, error: error.message });
  }
  /**
   * 更新步骤状态
   */
  updateStepStatus(step, status, progress = 0, error) {
    this.state.currentStep = step;
    this.state.steps[step].status = status;
    this.state.steps[step].progress = progress;
    if (error) {
      this.state.steps[step].error = error;
    }
    this.calculateOverallProgress();
    this.emit("stateChanged", this.state);
  }
  /**
   * 更新步骤用户操作提示
   */
  updateStepUserAction(step, actionKey) {
    this.state.steps[step].userAction = USER_ACTION_MESSAGES[actionKey];
    this.emit("stateChanged", this.state);
  }
  /**
   * 计算总进度
   */
  calculateOverallProgress() {
    let totalWeight = 0;
    let completedWeight = 0;
    Object.values(InitializationStep).forEach((step) => {
      if (step === InitializationStep.COMPLETED) return;
      const config = INITIALIZATION_STEPS_CONFIG[step];
      const stepInfo = this.state.steps[step];
      totalWeight += config.weight;
      if (stepInfo.status === InitializationStatus.SUCCESS) {
        completedWeight += config.weight;
      } else if (stepInfo.status === InitializationStatus.IN_PROGRESS) {
        completedWeight += config.weight * stepInfo.progress / 100;
      }
    });
    this.state.overallProgress = totalWeight > 0 ? Math.round(completedWeight / totalWeight * 100) : 0;
  }
  /**
   * 获取微信信息
   */
  async getWeChatInfo() {
    const processIds = await this.findWeChatProcesses();
    return {
      isRunning: processIds.length > 0,
      processIds
    };
  }
  /**
   * 查找微信进程
   */
  async findWeChatProcesses() {
    try {
      const { stdout } = await execa.execa("pgrep", ["-f", "WeChat|Weixin"]);
      const pids = stdout.trim().split("\n").filter((line) => line.trim()).map((pid) => parseInt(pid.trim())).filter((pid) => !isNaN(pid));
      return pids;
    } catch (error) {
      return [];
    }
  }
  // 公共方法
  getState() {
    return { ...this.state };
  }
  async retryCurrentStep() {
    if (!this.isRunning) {
      await this.executeStep(this.state.currentStep);
    }
  }
  async retryFromStep(step) {
    const stepOrder = Object.values(InitializationStep);
    const startIndex = stepOrder.indexOf(step);
    for (let i = startIndex; i < stepOrder.length; i++) {
      const resetStep = stepOrder[i];
      if (resetStep !== InitializationStep.COMPLETED) {
        this.state.steps[resetStep].status = InitializationStatus.PENDING;
        this.state.steps[resetStep].progress = 0;
        this.state.steps[resetStep].error = void 0;
      }
    }
    this.state.currentStep = step;
    this.state.isCompleted = false;
    this.state.canExit = false;
    await this.runInitializationSteps();
  }
  // 配置方法
  setWorkDir(workDir) {
    this.store.set("workDir", workDir);
  }
  getConfig() {
    return this.store.store;
  }
  clearConfig() {
    this.store.clear();
  }
}
const logger$1 = createLogger("InitializationIPC");
let initializationManager = null;
function registerInitializationHandlers() {
  electron.ipcMain.handle("initialization:start", async () => {
    try {
      if (!initializationManager) {
        initializationManager = new InitializationManager();
        initializationManager.on("stateChanged", (state) => {
          electron.BrowserWindow.getAllWindows().forEach((window) => {
            window.webContents.send("initialization:stateChanged", state);
          });
        });
        initializationManager.on("completed", () => {
          electron.BrowserWindow.getAllWindows().forEach((window) => {
            window.webContents.send("initialization:completed");
          });
        });
        initializationManager.on("error", (error) => {
          electron.BrowserWindow.getAllWindows().forEach((window) => {
            window.webContents.send("initialization:error", error);
          });
        });
      }
      await initializationManager.startInitialization();
      return { success: true };
    } catch (error) {
      logger$1.error("Failed to start initialization:", error);
      return { success: false, error: error.message };
    }
  });
  electron.ipcMain.handle("initialization:getState", () => {
    if (!initializationManager) {
      return null;
    }
    return initializationManager.getState();
  });
  electron.ipcMain.handle("initialization:retryCurrentStep", async () => {
    try {
      if (!initializationManager) {
        throw new Error("Initialization manager not initialized");
      }
      await initializationManager.retryCurrentStep();
      return { success: true };
    } catch (error) {
      logger$1.error("Failed to retry current step:", error);
      return { success: false, error: error.message };
    }
  });
  electron.ipcMain.handle("initialization:retryFromStep", async (_, step) => {
    try {
      if (!initializationManager) {
        throw new Error("Initialization manager not initialized");
      }
      await initializationManager.retryFromStep(step);
      return { success: true };
    } catch (error) {
      logger$1.error("Failed to retry from step:", error);
      return { success: false, error: error.message };
    }
  });
  electron.ipcMain.handle("initialization:selectWorkDir", async () => {
    try {
      const result = await electron.dialog.showOpenDialog({
        title: "选择数据保存目录",
        message: "请选择一个目录来保存解密后的微信数据",
        properties: ["openDirectory", "createDirectory"],
        buttonLabel: "选择此目录"
      });
      if (result.canceled || result.filePaths.length === 0) {
        return { success: false, canceled: true };
      }
      const selectedPath = result.filePaths[0];
      if (initializationManager) {
        initializationManager.setWorkDir(selectedPath);
      }
      return { success: true, path: selectedPath };
    } catch (error) {
      logger$1.error("Failed to select work directory:", error);
      return { success: false, error: error.message };
    }
  });
  electron.ipcMain.handle("initialization:getConfig", () => {
    if (!initializationManager) {
      return {};
    }
    return initializationManager.getConfig();
  });
  electron.ipcMain.handle("initialization:clearConfig", () => {
    try {
      if (initializationManager) {
        initializationManager.clearConfig();
      }
      return { success: true };
    } catch (error) {
      logger$1.error("Failed to clear config:", error);
      return { success: false, error: error.message };
    }
  });
  electron.ipcMain.handle("initialization:checkWeChat", async () => {
    try {
      const { stdout } = await execa.execa("pgrep", ["-f", "WeChat|Weixin"]);
      const pids = stdout.trim().split("\n").filter((line) => line.trim()).map((pid) => parseInt(pid.trim())).filter((pid) => !isNaN(pid));
      return { isRunning: pids.length > 0, processIds: pids };
    } catch (error) {
      return { isRunning: false, processIds: [] };
    }
  });
  electron.ipcMain.handle("initialization:forceExit", () => {
    if (process.env.NODE_ENV === "development") {
      logger$1.warn("Force exiting initialization (development mode)");
      if (initializationManager) {
        initializationManager.removeAllListeners();
        initializationManager = null;
      }
      return { success: true };
    }
    return { success: false, error: "Not allowed in production" };
  });
  electron.ipcMain.handle("initialization:getDiagnostics", async () => {
    try {
      const { ChatlogDiagnostics } = await Promise.resolve().then(() => require("./ChatlogDiagnostics-B3ITDdna.js"));
      const diagnostics = new ChatlogDiagnostics();
      const results = await diagnostics.runFullDiagnostics();
      const report = diagnostics.generateReport(results);
      return { success: true, results, report };
    } catch (error) {
      logger$1.error("Failed to get diagnostics:", error);
      return { success: false, error: error.message };
    }
  });
  logger$1.info("Initialization IPC handlers registered");
}
function cleanupInitializationManager() {
  if (initializationManager) {
    initializationManager.removeAllListeners();
    initializationManager = null;
    logger$1.info("Initialization manager cleaned up");
  }
}
const logger = createLogger("main");
const appServices = new AppServices();
function createWindow() {
  const mainWindow = new electron.BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...process.platform === "linux" ? { icon } : {},
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      sandbox: false
    }
  });
  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
  });
  mainWindow.webContents.setWindowOpenHandler((details) => {
    electron.shell.openExternal(details.url);
    return { action: "deny" };
  });
  if (utils.is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
  }
}
electron.app.whenReady().then(async () => {
  utils.electronApp.setAppUserModelId("com.echosoul");
  logger.info("Initializing EchoSoul application");
  await appServices.initialize();
  setupIpcHandlers(appServices);
  registerInitializationHandlers();
  electron.app.on("browser-window-created", (_, window) => {
    utils.optimizer.watchWindowShortcuts(window);
  });
  electron.ipcMain.on("ping", () => console.log("pong"));
  createWindow();
  electron.app.on("activate", function() {
    if (electron.BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    electron.app.quit();
  }
});
electron.app.on("before-quit", async () => {
  logger.info("Application is quitting, cleaning up...");
  if (appServices) {
    await appServices.cleanup();
  }
  cleanupInitializationManager();
});
exports.createLogger = createLogger;
