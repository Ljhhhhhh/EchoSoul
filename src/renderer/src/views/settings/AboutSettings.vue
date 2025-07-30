<template>
  <div class="about-settings">
    <div class="settings-container">
      <!-- Page Header -->
      <div class="page-header">
        <h2 class="page-title">关于应用</h2>
        <p class="page-subtitle">查看应用版本信息、检查更新和许可证信息</p>
      </div>

      <!-- App Information -->
      <section class="settings-section">
        <div class="app-info">
          <div class="app-logo">
            <Icon name="zap" :size="48" />
          </div>
          <div class="app-details">
            <h3 class="app-name">EchoSoul</h3>
            <p class="app-tagline">智能聊天记录分析工具</p>
            <div class="app-version">
              <span class="version-label">版本</span>
              <span class="version-number">{{ appInfo.version }}</span>
              <span v-if="appInfo.buildNumber" class="build-number"
                >({{ appInfo.buildNumber }})</span
              >
            </div>
          </div>
        </div>
      </section>

      <!-- Version Information -->
      <section class="settings-section">
        <div class="section-header">
          <h3 class="section-title">版本信息</h3>
          <p class="section-description">当前应用和依赖组件的版本详情</p>
        </div>

        <div class="version-grid">
          <div class="version-item">
            <div class="version-icon">
              <Icon name="package" :size="20" />
            </div>
            <div class="version-content">
              <div class="version-name">应用版本</div>
              <div class="version-value">{{ appInfo.version }}</div>
            </div>
          </div>

          <div class="version-item">
            <div class="version-icon">
              <Icon name="cpu" :size="20" />
            </div>
            <div class="version-content">
              <div class="version-name">Electron</div>
              <div class="version-value">{{ appInfo.electronVersion }}</div>
            </div>
          </div>

          <div class="version-item">
            <div class="version-icon">
              <Icon name="code" :size="20" />
            </div>
            <div class="version-content">
              <div class="version-name">Node.js</div>
              <div class="version-value">{{ appInfo.nodeVersion }}</div>
            </div>
          </div>

          <div class="version-item">
            <div class="version-icon">
              <Icon name="chrome" :size="20" />
            </div>
            <div class="version-content">
              <div class="version-name">Chromium</div>
              <div class="version-value">{{ appInfo.chromeVersion }}</div>
            </div>
          </div>

          <div class="version-item">
            <div class="version-icon">
              <Icon name="calendar" :size="20" />
            </div>
            <div class="version-content">
              <div class="version-name">构建日期</div>
              <div class="version-value">{{ appInfo.buildDate }}</div>
            </div>
          </div>

          <div class="version-item">
            <div class="version-icon">
              <Icon name="git-branch" :size="20" />
            </div>
            <div class="version-content">
              <div class="version-name">Git 提交</div>
              <div class="version-value">{{ appInfo.gitCommit }}</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Update Check -->
      <section class="settings-section">
        <div class="section-header">
          <h3 class="section-title">更新检查</h3>
          <p class="section-description">检查应用更新和管理自动更新设置</p>
        </div>

        <div class="update-status" :class="updateStatus.type">
          <div class="status-icon">
            <Icon :name="updateStatus.icon" :size="24" />
          </div>
          <div class="status-content">
            <div class="status-title">{{ updateStatus.title }}</div>
            <div class="status-message">{{ updateStatus.message }}</div>
          </div>
          <div class="status-actions">
            <Button
              v-if="updateStatus.type === 'available'"
              variant="primary"
              size="sm"
              :disabled="isDownloading"
              @click="downloadUpdate"
            >
              <Icon name="download" :size="16" />
              <span>{{ isDownloading ? '下载中...' : '立即更新' }}</span>
            </Button>
            <Button
              variant="outlined"
              size="sm"
              :disabled="isCheckingUpdate"
              @click="checkForUpdates"
            >
              <Icon name="refresh-cw" :size="16" :class="{ 'animate-spin': isCheckingUpdate }" />
              <span>{{ isCheckingUpdate ? '检查中...' : '检查更新' }}</span>
            </Button>
          </div>
        </div>

        <div class="update-settings">
          <label class="toggle-item">
            <input
              v-model="autoUpdateEnabled"
              type="checkbox"
              class="toggle-input"
              @change="toggleAutoUpdate"
            />
            <span class="toggle-slider"></span>
            <span class="toggle-label">自动检查更新</span>
          </label>
          <p class="form-help">启用后将定期检查应用更新</p>
        </div>
      </section>

      <!-- License Information -->
      <section class="settings-section">
        <div class="section-header">
          <h3 class="section-title">许可证信息</h3>
          <p class="section-description">应用许可证和开源组件信息</p>
        </div>

        <div class="license-info">
          <div class="license-item">
            <h4 class="license-title">EchoSoul</h4>
            <p class="license-description">
              本应用基于 MIT 许可证开源，您可以自由使用、修改和分发。
            </p>
            <div class="license-actions">
              <Button variant="outlined" size="sm" @click="openLicense">
                <Icon name="external-link" :size="16" />
                <span>查看许可证</span>
              </Button>
              <Button variant="outlined" size="sm" @click="openSourceCode">
                <Icon name="github" :size="16" />
                <span>源代码</span>
              </Button>
            </div>
          </div>

          <div class="license-item">
            <h4 class="license-title">开源组件</h4>
            <p class="license-description">本应用使用了多个开源组件，感谢开源社区的贡献。</p>
            <div class="license-actions">
              <Button variant="outlined" size="sm" @click="showThirdPartyLicenses">
                <Icon name="list" :size="16" />
                <span>第三方许可证</span>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <!-- Support Information -->
      <section class="settings-section">
        <div class="section-header">
          <h3 class="section-title">支持与反馈</h3>
          <p class="section-description">获取帮助、报告问题或提供反馈</p>
        </div>

        <div class="support-grid">
          <div class="support-item">
            <div class="support-icon">
              <Icon name="help-circle" :size="24" />
            </div>
            <div class="support-content">
              <h4 class="support-title">使用帮助</h4>
              <p class="support-description">查看使用文档和常见问题</p>
            </div>
            <Button variant="outlined" size="sm" @click="openHelp">
              <Icon name="external-link" :size="16" />
              <span>查看帮助</span>
            </Button>
          </div>

          <div class="support-item">
            <div class="support-icon">
              <Icon name="bug" :size="24" />
            </div>
            <div class="support-content">
              <h4 class="support-title">报告问题</h4>
              <p class="support-description">遇到问题？请告诉我们</p>
            </div>
            <Button variant="outlined" size="sm" @click="reportIssue">
              <Icon name="external-link" :size="16" />
              <span>报告问题</span>
            </Button>
          </div>

          <div class="support-item">
            <div class="support-icon">
              <Icon name="message-circle" :size="24" />
            </div>
            <div class="support-content">
              <h4 class="support-title">功能建议</h4>
              <p class="support-description">有好的想法？与我们分享</p>
            </div>
            <Button variant="outlined" size="sm" @click="submitFeedback">
              <Icon name="external-link" :size="16" />
              <span>提交反馈</span>
            </Button>
          </div>
        </div>
      </section>

      <!-- System Information -->
      <section class="settings-section">
        <div class="section-header">
          <h3 class="section-title">系统信息</h3>
          <p class="section-description">当前运行环境的系统信息</p>
        </div>

        <div class="system-grid">
          <div class="system-item">
            <span class="system-label">操作系统</span>
            <span class="system-value">{{ systemInfo.platform }}</span>
          </div>
          <div class="system-item">
            <span class="system-label">系统版本</span>
            <span class="system-value">{{ systemInfo.release }}</span>
          </div>
          <div class="system-item">
            <span class="system-label">架构</span>
            <span class="system-value">{{ systemInfo.arch }}</span>
          </div>
          <div class="system-item">
            <span class="system-label">内存</span>
            <span class="system-value">{{ systemInfo.memory }}</span>
          </div>
        </div>

        <div class="system-actions">
          <Button variant="outlined" size="sm" @click="copySystemInfo">
            <Icon name="copy" :size="16" />
            <span>复制系统信息</span>
          </Button>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import Button from '@renderer/components/design-system/Button.vue'
import Icon from '@renderer/components/design-system/Icon.vue'

// Types
interface AppInfo {
  version: string
  buildNumber?: string
  electronVersion: string
  nodeVersion: string
  chromeVersion: string
  buildDate: string
  gitCommit: string
}

interface UpdateStatus {
  type: 'checking' | 'available' | 'not-available' | 'error'
  icon: string
  title: string
  message: string
}

interface SystemInfo {
  platform: string
  release: string
  arch: string
  memory: string
}

// Reactive state
const appInfo = reactive<AppInfo>({
  version: '1.0.0',
  buildNumber: '20240130',
  electronVersion: '28.0.0',
  nodeVersion: '18.17.0',
  chromeVersion: '120.0.6099.109',
  buildDate: '2024-01-30',
  gitCommit: 'abc1234'
})

const updateStatus = ref<UpdateStatus>({
  type: 'not-available',
  icon: 'check-circle',
  title: '已是最新版本',
  message: '您正在使用最新版本的 EchoSoul'
})

const systemInfo = reactive<SystemInfo>({
  platform: 'macOS',
  release: '14.2.1',
  arch: 'arm64',
  memory: '16 GB'
})

const autoUpdateEnabled = ref(true)
const isCheckingUpdate = ref(false)
const isDownloading = ref(false)

// Methods
const checkForUpdates = async () => {
  isCheckingUpdate.value = true

  try {
    // TODO: 实际检查更新逻辑
    await new Promise((resolve) => setTimeout(resolve, 2000)) // 模拟检查延迟

    // 模拟检查结果
    updateStatus.value = {
      type: 'not-available',
      icon: 'check-circle',
      title: '已是最新版本',
      message: '您正在使用最新版本的 EchoSoul'
    }
  } catch (error) {
    updateStatus.value = {
      type: 'error',
      icon: 'x-circle',
      title: '检查更新失败',
      message: '无法连接到更新服务器，请稍后重试'
    }
  } finally {
    isCheckingUpdate.value = false
  }
}

const downloadUpdate = async () => {
  isDownloading.value = true

  try {
    // TODO: 下载更新逻辑
    await new Promise((resolve) => setTimeout(resolve, 3000)) // 模拟下载延迟
    console.log('更新下载完成')
  } catch (error) {
    console.error('下载更新失败:', error)
  } finally {
    isDownloading.value = false
  }
}

const toggleAutoUpdate = async () => {
  try {
    // TODO: 保存自动更新设置
    console.log('自动更新设置已变更:', autoUpdateEnabled.value)
  } catch (error) {
    console.error('保存自动更新设置失败:', error)
  }
}

const openLicense = () => {
  // TODO: 打开许可证页面
  window.open('https://opensource.org/licenses/MIT', '_blank')
}

const openSourceCode = () => {
  // TODO: 打开源代码仓库
  window.open('https://github.com/echosoul/echosoul', '_blank')
}

const showThirdPartyLicenses = () => {
  // TODO: 显示第三方许可证
  console.log('显示第三方许可证')
}

const openHelp = () => {
  // TODO: 打开帮助文档
  window.open('https://echosoul.app/help', '_blank')
}

const reportIssue = () => {
  // TODO: 打开问题报告页面
  window.open('https://github.com/echosoul/echosoul/issues', '_blank')
}

const submitFeedback = () => {
  // TODO: 打开反馈页面
  window.open('https://echosoul.app/feedback', '_blank')
}

const copySystemInfo = async () => {
  try {
    const info = `
EchoSoul ${appInfo.version}
Electron: ${appInfo.electronVersion}
Node.js: ${appInfo.nodeVersion}
Chromium: ${appInfo.chromeVersion}
Platform: ${systemInfo.platform} ${systemInfo.release}
Architecture: ${systemInfo.arch}
Memory: ${systemInfo.memory}
Build Date: ${appInfo.buildDate}
Git Commit: ${appInfo.gitCommit}
    `.trim()

    await navigator.clipboard.writeText(info)
    console.log('系统信息已复制到剪贴板')
  } catch (error) {
    console.error('复制系统信息失败:', error)
  }
}

const loadAppInfo = async () => {
  try {
    // TODO: 从主进程获取应用信息
    // const info = await window.electronAPI.invoke('app:get-info')
    // Object.assign(appInfo, info)
  } catch (error) {
    console.error('加载应用信息失败:', error)
  }
}

const loadSystemInfo = async () => {
  try {
    // TODO: 从主进程获取系统信息
    // const info = await window.electronAPI.invoke('system:get-info')
    // Object.assign(systemInfo, info)
  } catch (error) {
    console.error('加载系统信息失败:', error)
  }
}

// Lifecycle
onMounted(() => {
  loadAppInfo()
  loadSystemInfo()
})
</script>

<style scoped></style>
