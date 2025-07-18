<template>
  <div class="system-settings">
    <div class="settings-container">
      <!-- Page Header -->
      <div class="page-header">
        <h2 class="text-title-large text-neutral-800">系统设置</h2>
        <p class="mt-2 text-body-medium text-neutral-600">配置应用的行为、界面和系统集成选项</p>
      </div>

      <!-- Appearance Settings -->
      <section class="settings-section">
        <div class="section-header">
          <h3 class="text-title-medium text-neutral-800">外观设置</h3>
          <p class="text-body-small text-neutral-600">自定义应用的视觉外观和主题</p>
        </div>

        <div class="settings-form">
          <div class="form-group">
            <label class="form-label">主题模式</label>
            <div class="theme-options">
              <div
                v-for="theme in themeOptions"
                :key="theme.id"
                class="theme-option"
                :class="{ selected: systemSettings.theme === theme.id }"
                @click="systemSettings.theme = theme.id"
              >
                <div class="theme-preview">
                  <Icon :name="theme.icon" :size="24" />
                </div>
                <div class="theme-info">
                  <div class="theme-name">{{ theme.name }}</div>
                  <div class="theme-description">{{ theme.description }}</div>
                </div>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">界面语言</label>
            <select v-model="systemSettings.language" class="form-select">
              <option value="zh">中文</option>
              <option value="en">English</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">界面缩放</label>
            <div class="zoom-control">
              <Button variant="text" size="sm" icon="minus" @click="decreaseZoom" />
              <span class="zoom-value">{{ systemSettings.zoomLevel }}%</span>
              <Button variant="text" size="sm" icon="plus" @click="increaseZoom" />
            </div>
          </div>

          <div class="form-group">
            <div class="setting-item">
              <div class="setting-info">
                <label class="setting-label">显示动画效果</label>
                <p class="setting-description">启用界面过渡动画和微交互</p>
              </div>
              <div class="setting-control">
                <div
                  class="toggle-switch"
                  :class="{ active: systemSettings.enableAnimations }"
                  @click="systemSettings.enableAnimations = !systemSettings.enableAnimations"
                >
                  <div class="toggle-handle"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Startup Settings -->
      <section class="settings-section">
        <div class="section-header">
          <h3 class="text-title-medium text-neutral-800">启动设置</h3>
          <p class="text-body-small text-neutral-600">配置应用的启动行为和系统集成</p>
        </div>

        <div class="settings-form">
          <div class="form-group">
            <div class="setting-item">
              <div class="setting-info">
                <label class="setting-label">开机自启动</label>
                <p class="setting-description">系统启动时自动运行 EchoSoul</p>
              </div>
              <div class="setting-control">
                <div
                  class="toggle-switch"
                  :class="{ active: systemSettings.startOnBoot }"
                  @click="systemSettings.startOnBoot = !systemSettings.startOnBoot"
                >
                  <div class="toggle-handle"></div>
                </div>
              </div>
            </div>
          </div>

          <div class="form-group">
            <div class="setting-item">
              <div class="setting-info">
                <label class="setting-label">最小化到系统托盘</label>
                <p class="setting-description">关闭窗口时最小化到系统托盘而不是退出</p>
              </div>
              <div class="setting-control">
                <div
                  class="toggle-switch"
                  :class="{ active: systemSettings.minimizeToTray }"
                  @click="systemSettings.minimizeToTray = !systemSettings.minimizeToTray"
                >
                  <div class="toggle-handle"></div>
                </div>
              </div>
            </div>
          </div>

          <div class="form-group">
            <div class="setting-item">
              <div class="setting-info">
                <label class="setting-label">启动时最小化</label>
                <p class="setting-description">应用启动时直接最小化到托盘</p>
              </div>
              <div class="setting-control">
                <div
                  class="toggle-switch"
                  :class="{ active: systemSettings.startMinimized }"
                  @click="systemSettings.startMinimized = !systemSettings.startMinimized"
                >
                  <div class="toggle-handle"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Update Settings -->
      <section class="settings-section">
        <div class="section-header">
          <h3 class="text-title-medium text-neutral-800">更新设置</h3>
          <p class="text-body-small text-neutral-600">管理应用更新和版本控制</p>
        </div>

        <div class="settings-form">
          <div class="form-group">
            <label class="form-label">更新频道</label>
            <div class="update-channels">
              <div
                v-for="channel in updateChannels"
                :key="channel.id"
                class="channel-option"
                :class="{ selected: systemSettings.updateChannel === channel.id }"
                @click="systemSettings.updateChannel = channel.id"
              >
                <div class="channel-info">
                  <div class="channel-name">{{ channel.name }}</div>
                  <div class="channel-description">{{ channel.description }}</div>
                </div>
                <div class="channel-indicator">
                  <Icon
                    v-if="systemSettings.updateChannel === channel.id"
                    name="check-circle"
                    :size="20"
                    class="text-primary-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div class="form-group">
            <div class="setting-item">
              <div class="setting-info">
                <label class="setting-label">自动检查更新</label>
                <p class="setting-description">定期检查并提示可用的更新</p>
              </div>
              <div class="setting-control">
                <div
                  class="toggle-switch"
                  :class="{ active: systemSettings.autoCheckUpdates }"
                  @click="systemSettings.autoCheckUpdates = !systemSettings.autoCheckUpdates"
                >
                  <div class="toggle-handle"></div>
                </div>
              </div>
            </div>
          </div>

          <div class="form-group">
            <div class="setting-item">
              <div class="setting-info">
                <label class="setting-label">自动下载更新</label>
                <p class="setting-description">自动下载更新，手动安装</p>
              </div>
              <div class="setting-control">
                <div
                  class="toggle-switch"
                  :class="{ active: systemSettings.autoDownloadUpdates }"
                  @click="systemSettings.autoDownloadUpdates = !systemSettings.autoDownloadUpdates"
                >
                  <div class="toggle-handle"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Update Status -->
          <div class="update-status">
            <div class="status-info">
              <div class="status-icon">
                <Icon name="check-circle" :size="20" class="text-success" />
              </div>
              <div class="status-content">
                <div class="status-title">当前版本: v{{ appVersion }}</div>
                <div class="status-description">您正在使用最新版本</div>
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              icon="refresh-cw"
              :loading="checkingUpdates"
              @click="checkForUpdates"
            >
              检查更新
            </Button>
          </div>
        </div>
      </section>

      <!-- Performance Settings -->
      <section class="settings-section">
        <div class="section-header">
          <h3 class="text-title-medium text-neutral-800">性能设置</h3>
          <p class="text-body-small text-neutral-600">优化应用性能和资源使用</p>
        </div>

        <div class="settings-form">
          <div class="form-group">
            <label class="form-label">内存使用限制</label>
            <div class="memory-control">
              <input
                v-model.number="systemSettings.memoryLimit"
                type="range"
                min="512"
                max="4096"
                step="256"
                class="memory-slider"
              />
              <span class="memory-value">{{ systemSettings.memoryLimit }} MB</span>
            </div>
          </div>

          <div class="form-group">
            <div class="setting-item">
              <div class="setting-info">
                <label class="setting-label">硬件加速</label>
                <p class="setting-description">使用 GPU 加速渲染和动画</p>
              </div>
              <div class="setting-control">
                <div
                  class="toggle-switch"
                  :class="{ active: systemSettings.hardwareAcceleration }"
                  @click="
                    systemSettings.hardwareAcceleration = !systemSettings.hardwareAcceleration
                  "
                >
                  <div class="toggle-handle"></div>
                </div>
              </div>
            </div>
          </div>

          <div class="form-group">
            <div class="setting-item">
              <div class="setting-info">
                <label class="setting-label">后台处理</label>
                <p class="setting-description">允许在后台进行数据分析和报告生成</p>
              </div>
              <div class="setting-control">
                <div
                  class="toggle-switch"
                  :class="{ active: systemSettings.backgroundProcessing }"
                  @click="
                    systemSettings.backgroundProcessing = !systemSettings.backgroundProcessing
                  "
                >
                  <div class="toggle-handle"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Debug Settings -->
      <section class="settings-section">
        <div class="section-header">
          <h3 class="text-title-medium text-neutral-800">调试设置</h3>
          <p class="text-body-small text-neutral-600">开发和调试相关的设置选项</p>
        </div>

        <div class="settings-form">
          <div class="form-group">
            <label class="form-label">日志级别</label>
            <select v-model="systemSettings.logLevel" class="form-select">
              <option value="error">错误</option>
              <option value="warn">警告</option>
              <option value="info">信息</option>
              <option value="debug">调试</option>
            </select>
          </div>

          <div class="form-group">
            <div class="setting-item">
              <div class="setting-info">
                <label class="setting-label">开发者工具</label>
                <p class="setting-description">启用开发者调试工具</p>
              </div>
              <div class="setting-control">
                <div
                  class="toggle-switch"
                  :class="{ active: systemSettings.enableDevTools }"
                  @click="systemSettings.enableDevTools = !systemSettings.enableDevTools"
                >
                  <div class="toggle-handle"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Debug Actions -->
          <div class="debug-actions">
            <Button variant="secondary" size="sm" icon="folder" @click="openLogsFolder">
              打开日志文件夹
            </Button>

            <Button variant="secondary" size="sm" icon="terminal" @click="openDevTools">
              打开开发者工具
            </Button>
          </div>
        </div>
      </section>

      <!-- System Information -->
      <section class="settings-section">
        <div class="section-header">
          <h3 class="text-title-medium text-neutral-800">系统信息</h3>
          <p class="text-body-small text-neutral-600">查看应用和系统的详细信息</p>
        </div>

        <div class="system-info">
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">应用版本</div>
              <div class="info-value">{{ appVersion }}</div>
            </div>

            <div class="info-item">
              <div class="info-label">Electron 版本</div>
              <div class="info-value">{{ electronVersion }}</div>
            </div>

            <div class="info-item">
              <div class="info-label">Node.js 版本</div>
              <div class="info-value">{{ nodeVersion }}</div>
            </div>

            <div class="info-item">
              <div class="info-label">操作系统</div>
              <div class="info-value">{{ osInfo }}</div>
            </div>

            <div class="info-item">
              <div class="info-label">CPU 架构</div>
              <div class="info-value">{{ cpuArch }}</div>
            </div>

            <div class="info-item">
              <div class="info-label">内存使用</div>
              <div class="info-value">{{ memoryUsage }}</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Action Buttons -->
      <div class="actions-section">
        <div class="actions-buttons">
          <Button variant="secondary" size="md" icon="refresh-cw" @click="resetToDefaults">
            重置为默认
          </Button>

          <Button variant="primary" size="md" icon="save" :loading="isSaving" @click="saveSettings">
            保存设置
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Button from '@renderer/components/design-system/Button.vue'
import Icon from '@renderer/components/design-system/Icon.vue'
import type { SystemSettings } from '@renderer/types/pages'

// Reactive state
const isSaving = ref(false)
const checkingUpdates = ref(false)

const systemSettings = ref<SystemSettings>({
  theme: 'auto',
  language: 'zh',
  startOnBoot: false,
  minimizeToTray: true,
  updateChannel: 'stable',
  logLevel: 'info',
  zoomLevel: 100,
  enableAnimations: true,
  startMinimized: false,
  autoCheckUpdates: true,
  autoDownloadUpdates: false,
  memoryLimit: 1024,
  hardwareAcceleration: true,
  backgroundProcessing: true,
  enableDevTools: false
})

const appVersion = ref('1.0.0')
const electronVersion = ref('28.0.0')
const nodeVersion = ref('18.17.0')
const osInfo = ref('macOS 14.0')
const cpuArch = ref('arm64')
const memoryUsage = ref('256 MB')

const themeOptions: Array<{
  id: 'light' | 'dark' | 'auto'
  name: string
  description: string
  icon: string
}> = [
  {
    id: 'light',
    name: '浅色模式',
    description: '明亮的界面主题',
    icon: 'sun'
  },
  {
    id: 'dark',
    name: '深色模式',
    description: '深色的界面主题',
    icon: 'moon'
  },
  {
    id: 'auto',
    name: '跟随系统',
    description: '根据系统设置自动切换',
    icon: 'monitor'
  }
]

const updateChannels: Array<{
  id: 'stable' | 'beta'
  name: string
  description: string
}> = [
  {
    id: 'stable',
    name: '稳定版',
    description: '经过充分测试的稳定版本'
  },
  {
    id: 'beta',
    name: '测试版',
    description: '包含最新功能的测试版本'
  }
]

// Methods
const increaseZoom = () => {
  if (systemSettings.value.zoomLevel < 200) {
    systemSettings.value.zoomLevel += 10
  }
}

const decreaseZoom = () => {
  if (systemSettings.value.zoomLevel > 50) {
    systemSettings.value.zoomLevel -= 10
  }
}

const checkForUpdates = async () => {
  checkingUpdates.value = true

  try {
    // TODO: Implement update check
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Show update status
  } catch (error) {
    // Show error message
  } finally {
    checkingUpdates.value = false
  }
}

const openLogsFolder = () => {
  // TODO: Open logs folder in file manager
}

const openDevTools = () => {
  // TODO: Open developer tools
}

const resetToDefaults = () => {
  systemSettings.value = {
    theme: 'auto',
    language: 'zh',
    startOnBoot: false,
    minimizeToTray: true,
    updateChannel: 'stable',
    logLevel: 'info',
    zoomLevel: 100,
    enableAnimations: true,
    startMinimized: false,
    autoCheckUpdates: true,
    autoDownloadUpdates: false,
    memoryLimit: 1024,
    hardwareAcceleration: true,
    backgroundProcessing: true,
    enableDevTools: false
  }
}

const saveSettings = async () => {
  isSaving.value = true

  try {
    // TODO: Implement actual settings save
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Show success message
  } catch (error) {
    // Show error message
  } finally {
    isSaving.value = false
  }
}

// Lifecycle
onMounted(async () => {
  // Load system information and settings
  // TODO: Implement data loading
})
</script>

<style scoped>
.system-settings {
  @apply p-6;
}

.settings-container {
  @apply space-y-8;
}

.page-header {
  @apply mb-8;
}

.settings-section {
  @apply bg-white p-6 rounded-lg shadow-sm;
}

.section-header {
  @apply mb-6;
}

.settings-form {
  @apply space-y-6;
}

.form-group {
  @apply space-y-2;
}

.form-label {
  @apply text-sm font-medium text-neutral-700;
}

.form-select {
  @apply w-full px-3 py-2 border border-neutral-300 rounded-md;
}

.theme-options {
  @apply grid grid-cols-1 md:grid-cols-3 gap-4;
}

.theme-option {
  @apply flex items-center space-x-3 p-4 border border-neutral-200 rounded-lg cursor-pointer transition-colors hover:border-neutral-300;
}

.theme-option.selected {
  @apply border-primary-500 bg-primary-50;
}

.theme-preview {
  @apply w-12 h-12 bg-neutral-100 rounded-lg flex items-center justify-center;
}

.theme-option.selected .theme-preview {
  @apply bg-primary-100 text-primary-600;
}

.theme-name {
  @apply font-medium text-neutral-800;
}

.theme-description {
  @apply text-sm text-neutral-600;
}

.zoom-control {
  @apply flex items-center space-x-4;
}

.zoom-value {
  @apply text-sm font-medium text-neutral-700 min-w-12 text-center;
}

.setting-item {
  @apply flex items-center justify-between p-4 border border-neutral-200 rounded-lg;
}

.setting-info {
  @apply flex-1;
}

.setting-label {
  @apply font-medium text-neutral-800;
}

.setting-description {
  @apply text-sm text-neutral-600 mt-1;
}

.toggle-switch {
  @apply w-12 h-6 bg-neutral-300 rounded-full relative cursor-pointer transition-colors;
}

.toggle-switch.active {
  @apply bg-primary-500;
}

.toggle-handle {
  @apply w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5 transition-transform;
}

.toggle-switch.active .toggle-handle {
  @apply transform translate-x-6;
}

.update-channels {
  @apply space-y-3;
}

.channel-option {
  @apply flex items-center justify-between p-4 border border-neutral-200 rounded-lg cursor-pointer transition-colors hover:border-neutral-300;
}

.channel-option.selected {
  @apply border-primary-500 bg-primary-50;
}

.channel-name {
  @apply font-medium text-neutral-800;
}

.channel-description {
  @apply text-sm text-neutral-600;
}

.update-status {
  @apply flex items-center justify-between p-4 bg-neutral-50 rounded-lg;
}

.status-info {
  @apply flex items-center space-x-3;
}

.status-title {
  @apply font-medium text-neutral-800;
}

.status-description {
  @apply text-sm text-neutral-600;
}

.memory-control {
  @apply flex items-center space-x-4;
}

.memory-slider {
  @apply flex-1;
}

.memory-value {
  @apply text-sm font-medium text-neutral-700 min-w-20;
}

.debug-actions {
  @apply flex items-center space-x-3 pt-4 border-t border-neutral-200;
}

.system-info {
  @apply bg-neutral-50 p-6 rounded-lg;
}

.info-grid {
  @apply grid grid-cols-2 md:grid-cols-3 gap-4;
}

.info-item {
  @apply space-y-1;
}

.info-label {
  @apply text-sm text-neutral-600;
}

.info-value {
  @apply font-medium text-neutral-800;
}

.actions-section {
  @apply bg-white p-6 rounded-lg shadow-sm;
}

.actions-buttons {
  @apply flex items-center justify-end space-x-3;
}
</style>
