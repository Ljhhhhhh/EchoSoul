<template>
  <div class="data-settings">
    <div class="settings-container">
      <!-- Page Header -->
      <div class="page-header">
        <h2 class="text-title-large text-neutral-800">数据管理</h2>
        <p class="mt-2 text-body-medium text-neutral-600">管理聊天数据的存储、备份和清理设置</p>
      </div>

      <!-- Storage Overview -->
      <section class="settings-section">
        <div class="section-header">
          <h3 class="text-title-medium text-neutral-800">存储概览</h3>
          <p class="text-body-small text-neutral-600">查看当前数据使用情况</p>
        </div>

        <div class="storage-overview">
          <div class="storage-stats">
            <div class="stat-card">
              <div class="stat-icon">
                <Icon name="message-circle" :size="24" />
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ storageStats.totalMessages.toLocaleString() }}</div>
                <div class="stat-label">总消息数</div>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">
                <Icon name="users" :size="24" />
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ storageStats.totalContacts }}</div>
                <div class="stat-label">联系人数</div>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">
                <Icon name="file-text" :size="24" />
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ storageStats.totalReports }}</div>
                <div class="stat-label">生成报告数</div>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">
                <Icon name="hard-drive" :size="24" />
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ formatFileSize(storageStats.totalSize) }}</div>
                <div class="stat-label">占用空间</div>
              </div>
            </div>
          </div>

          <!-- Storage Usage Chart -->
          <div class="storage-chart">
            <h4 class="chart-title">存储空间分布</h4>
            <div class="chart-container">
              <div class="chart-item">
                <div class="chart-bar">
                  <div
                    class="chart-fill messages"
                    :style="{ width: `${storageBreakdown.messages}%` }"
                  ></div>
                </div>
                <div class="chart-label">
                  <span class="chart-color messages"></span>
                  <span>聊天数据 ({{ storageBreakdown.messages }}%)</span>
                </div>
              </div>

              <div class="chart-item">
                <div class="chart-bar">
                  <div
                    class="chart-fill reports"
                    :style="{ width: `${storageBreakdown.reports}%` }"
                  ></div>
                </div>
                <div class="chart-label">
                  <span class="chart-color reports"></span>
                  <span>报告数据 ({{ storageBreakdown.reports }}%)</span>
                </div>
              </div>

              <div class="chart-item">
                <div class="chart-bar">
                  <div
                    class="chart-fill cache"
                    :style="{ width: `${storageBreakdown.cache}%` }"
                  ></div>
                </div>
                <div class="chart-label">
                  <span class="chart-color cache"></span>
                  <span>缓存数据 ({{ storageBreakdown.cache }}%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Data Retention -->
      <section class="settings-section">
        <div class="section-header">
          <h3 class="text-title-medium text-neutral-800">数据保留</h3>
          <p class="text-body-small text-neutral-600">配置数据的自动清理和保留策略</p>
        </div>

        <div class="settings-form">
          <div class="form-group">
            <div class="setting-item">
              <div class="setting-info">
                <label class="setting-label">启用自动清理</label>
                <p class="setting-description">自动删除过期的数据和缓存</p>
              </div>
              <div class="setting-control">
                <div
                  class="toggle-switch"
                  :class="{ active: dataSettings.autoCleanup }"
                  @click="dataSettings.autoCleanup = !dataSettings.autoCleanup"
                >
                  <div class="toggle-handle"></div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="dataSettings.autoCleanup" class="form-group">
            <label class="form-label">数据保留期限</label>
            <select v-model="dataSettings.retentionPeriod" class="form-select">
              <option :value="30">30 天</option>
              <option :value="90">90 天</option>
              <option :value="180">180 天</option>
              <option :value="365">1 年</option>
              <option :value="730">2 年</option>
              <option :value="0">永久保留</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">报告保留期限</label>
            <select v-model="dataSettings.reportRetentionPeriod" class="form-select">
              <option :value="90">90 天</option>
              <option :value="180">180 天</option>
              <option :value="365">1 年</option>
              <option :value="730">2 年</option>
              <option :value="0">永久保留</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">缓存清理频率</label>
            <select v-model="dataSettings.cacheCleanupFrequency" class="form-select">
              <option value="daily">每天</option>
              <option value="weekly">每周</option>
              <option value="monthly">每月</option>
              <option value="manual">手动</option>
            </select>
          </div>
        </div>
      </section>

      <!-- Backup Settings -->
      <section class="settings-section">
        <div class="section-header">
          <h3 class="text-title-medium text-neutral-800">备份设置</h3>
          <p class="text-body-small text-neutral-600">配置数据备份和恢复选项</p>
        </div>

        <div class="settings-form">
          <div class="form-group">
            <div class="setting-item">
              <div class="setting-info">
                <label class="setting-label">启用自动备份</label>
                <p class="setting-description">定期自动备份重要数据</p>
              </div>
              <div class="setting-control">
                <div
                  class="toggle-switch"
                  :class="{ active: dataSettings.backupEnabled }"
                  @click="dataSettings.backupEnabled = !dataSettings.backupEnabled"
                >
                  <div class="toggle-handle"></div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="dataSettings.backupEnabled" class="backup-config">
            <div class="form-group">
              <label class="form-label">备份频率</label>
              <select v-model="dataSettings.backupFrequency" class="form-select">
                <option value="daily">每天</option>
                <option value="weekly">每周</option>
                <option value="monthly">每月</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">备份位置</label>
              <div class="backup-location">
                <input
                  v-model="dataSettings.backupLocation"
                  type="text"
                  class="form-input"
                  readonly
                />
                <Button variant="secondary" size="sm" icon="folder" @click="selectBackupLocation">
                  选择
                </Button>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">保留备份数量</label>
              <input
                v-model.number="dataSettings.maxBackups"
                type="number"
                min="1"
                max="50"
                class="form-input"
              />
            </div>
          </div>

          <!-- Backup Actions -->
          <div class="backup-actions">
            <Button
              variant="secondary"
              size="md"
              icon="download"
              :loading="isCreatingBackup"
              @click="createBackup"
            >
              立即备份
            </Button>

            <Button variant="secondary" size="md" icon="upload" @click="restoreBackup">
              恢复备份
            </Button>
          </div>
        </div>
      </section>

      <!-- Data Export -->
      <section class="settings-section">
        <div class="section-header">
          <h3 class="text-title-medium text-neutral-800">数据导出</h3>
          <p class="text-body-small text-neutral-600">导出您的数据用于备份或迁移</p>
        </div>

        <div class="export-options">
          <div class="export-item">
            <div class="export-info">
              <div class="export-icon">
                <Icon name="message-circle" :size="24" />
              </div>
              <div class="export-details">
                <h4 class="export-title">聊天数据</h4>
                <p class="export-description">导出所有聊天记录和联系人信息</p>
              </div>
            </div>
            <Button variant="secondary" size="sm" icon="download" @click="exportChatData">
              导出
            </Button>
          </div>

          <div class="export-item">
            <div class="export-info">
              <div class="export-icon">
                <Icon name="file-text" :size="24" />
              </div>
              <div class="export-details">
                <h4 class="export-title">报告数据</h4>
                <p class="export-description">导出所有生成的分析报告</p>
              </div>
            </div>
            <Button variant="secondary" size="sm" icon="download" @click="exportReportData">
              导出
            </Button>
          </div>

          <div class="export-item">
            <div class="export-info">
              <div class="export-icon">
                <Icon name="settings" :size="24" />
              </div>
              <div class="export-details">
                <h4 class="export-title">应用设置</h4>
                <p class="export-description">导出应用配置和偏好设置</p>
              </div>
            </div>
            <Button variant="secondary" size="sm" icon="download" @click="exportSettings">
              导出
            </Button>
          </div>
        </div>
      </section>

      <!-- Data Cleanup -->
      <section class="settings-section">
        <div class="section-header">
          <h3 class="text-title-medium text-neutral-800">数据清理</h3>
          <p class="text-body-small text-neutral-600">清理不需要的数据以释放存储空间</p>
        </div>

        <div class="cleanup-options">
          <div class="cleanup-item">
            <div class="cleanup-info">
              <h4 class="cleanup-title">清理缓存</h4>
              <p class="cleanup-description">删除临时文件和缓存数据</p>
              <div class="cleanup-size">可释放: {{ formatFileSize(cleanupSizes.cache) }}</div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              icon="trash-2"
              :loading="cleaningUp.cache"
              @click="cleanupCache"
            >
              清理
            </Button>
          </div>

          <div class="cleanup-item">
            <div class="cleanup-info">
              <h4 class="cleanup-title">清理过期报告</h4>
              <p class="cleanup-description">删除超过保留期限的报告</p>
              <div class="cleanup-size">可释放: {{ formatFileSize(cleanupSizes.reports) }}</div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              icon="trash-2"
              :loading="cleaningUp.reports"
              @click="cleanupExpiredReports"
            >
              清理
            </Button>
          </div>

          <div class="cleanup-item danger">
            <div class="cleanup-info">
              <h4 class="cleanup-title">重置所有数据</h4>
              <p class="cleanup-description">删除所有数据并重置应用</p>
              <div class="cleanup-warning">⚠️ 此操作不可恢复</div>
            </div>
            <Button variant="destructive" size="sm" icon="alert-triangle" @click="resetAllData">
              重置
            </Button>
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
import type { DataManagementSettings } from '@renderer/types/pages'

// Reactive state
const isSaving = ref(false)
const isCreatingBackup = ref(false)

const cleaningUp = ref({
  cache: false,
  reports: false
})

const dataSettings = ref<DataManagementSettings>({
  retentionPeriod: 365,
  autoCleanup: true,
  exportFormat: 'json',
  backupEnabled: true,
  backupLocation: '',
  reportRetentionPeriod: 365,
  cacheCleanupFrequency: 'weekly',
  backupFrequency: 'weekly',
  maxBackups: 10
})

const storageStats = ref({
  totalMessages: 0,
  totalContacts: 0,
  totalReports: 0,
  totalSize: 0
})

const storageBreakdown = ref({
  messages: 70,
  reports: 20,
  cache: 10
})

const cleanupSizes = ref({
  cache: 0,
  reports: 0
})

// Methods
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B'

  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const selectBackupLocation = async () => {
  // TODO: Implement directory selection dialog
  // const result = await window.electron.showOpenDialog({
  //   properties: ['openDirectory']
  // })
  // if (result.filePaths.length > 0) {
  //   dataSettings.value.backupLocation = result.filePaths[0]
  // }
}

const createBackup = async () => {
  isCreatingBackup.value = true

  try {
    // TODO: Implement backup creation
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Show success message
  } catch (error) {
    // Show error message
  } finally {
    isCreatingBackup.value = false
  }
}

const restoreBackup = async () => {
  // TODO: Implement backup restoration
}

const exportChatData = async () => {
  // TODO: Implement chat data export
}

const exportReportData = async () => {
  // TODO: Implement report data export
}

const exportSettings = async () => {
  // TODO: Implement settings export
}

const cleanupCache = async () => {
  cleaningUp.value.cache = true

  try {
    // TODO: Implement cache cleanup
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Update cleanup sizes
    cleanupSizes.value.cache = 0
  } catch (error) {
    // Show error message
  } finally {
    cleaningUp.value.cache = false
  }
}

const cleanupExpiredReports = async () => {
  cleaningUp.value.reports = true

  try {
    // TODO: Implement expired reports cleanup
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Update cleanup sizes
    cleanupSizes.value.reports = 0
  } catch (error) {
    // Show error message
  } finally {
    cleaningUp.value.reports = false
  }
}

const resetAllData = async () => {
  // TODO: Show confirmation dialog and implement data reset
  const confirmed = confirm('确定要重置所有数据吗？此操作不可恢复。')
  if (confirmed) {
    // Implement data reset
  }
}

const resetToDefaults = () => {
  dataSettings.value = {
    retentionPeriod: 365,
    autoCleanup: true,
    exportFormat: 'json',
    backupEnabled: true,
    backupLocation: '',
    reportRetentionPeriod: 365,
    cacheCleanupFrequency: 'weekly',
    backupFrequency: 'weekly',
    maxBackups: 10
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
  // Load storage stats and settings
  // TODO: Implement data loading
})
</script>

<style scoped>
.data-settings {
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

.storage-overview {
  @apply space-y-6;
}

.storage-stats {
  @apply grid grid-cols-2 md:grid-cols-4 gap-4;
}

.stat-card {
  @apply bg-neutral-50 p-4 rounded-lg flex items-center space-x-3;
}

.stat-icon {
  @apply w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600;
}

.stat-value {
  @apply text-lg font-semibold text-neutral-800;
}

.stat-label {
  @apply text-sm text-neutral-600;
}

.storage-chart {
  @apply bg-neutral-50 p-6 rounded-lg;
}

.chart-title {
  @apply text-lg font-medium text-neutral-800 mb-4;
}

.chart-container {
  @apply space-y-4;
}

.chart-item {
  @apply space-y-2;
}

.chart-bar {
  @apply w-full h-4 bg-neutral-200 rounded-full overflow-hidden;
}

.chart-fill {
  @apply h-full transition-all;
}

.chart-fill.messages {
  @apply bg-primary-500;
}

.chart-fill.reports {
  @apply bg-secondary-500;
}

.chart-fill.cache {
  @apply bg-neutral-400;
}

.chart-label {
  @apply flex items-center space-x-2 text-sm;
}

.chart-color {
  @apply w-3 h-3 rounded-full;
}

.chart-color.messages {
  @apply bg-primary-500;
}

.chart-color.reports {
  @apply bg-secondary-500;
}

.chart-color.cache {
  @apply bg-neutral-400;
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

.form-input,
.form-select {
  @apply w-full px-3 py-2 border border-neutral-300 rounded-md;
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

.backup-config {
  @apply space-y-4 p-4 bg-neutral-50 rounded-lg;
}

.backup-location {
  @apply flex items-center space-x-2;
}

.backup-location .form-input {
  @apply flex-1;
}

.backup-actions {
  @apply flex items-center space-x-3 pt-4 border-t border-neutral-200;
}

.export-options,
.cleanup-options {
  @apply space-y-4;
}

.export-item,
.cleanup-item {
  @apply flex items-center justify-between p-4 border border-neutral-200 rounded-lg;
}

.cleanup-item.danger {
  @apply border-red-500 bg-red-50;
}

.export-info,
.cleanup-info {
  @apply flex items-center space-x-4;
}

.export-icon {
  @apply w-12 h-12 bg-neutral-100 rounded-lg flex items-center justify-center;
}

.export-title,
.cleanup-title {
  @apply font-medium text-neutral-800;
}

.export-description,
.cleanup-description {
  @apply text-sm text-neutral-600;
}

.cleanup-size {
  @apply text-sm text-primary-600 font-medium;
}

.cleanup-warning {
  @apply text-sm text-error font-medium;
}

.actions-section {
  @apply bg-white p-6 rounded-lg shadow-sm;
}

.actions-buttons {
  @apply flex items-center justify-end space-x-3;
}
</style>
