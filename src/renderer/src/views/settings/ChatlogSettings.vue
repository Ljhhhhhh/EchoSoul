<template>
  <div class="chatlog-settings">
    <div class="settings-container">
      <!-- Page Header -->
      <div class="page-header">
        <h2 class="page-title">Chatlog 服务</h2>
        <p class="page-subtitle">配置 Chatlog 服务的连接地址、端口和测试连接状态</p>
      </div>

      <!-- Connection Status -->
      <section class="settings-section">
        <div class="section-header">
          <h3 class="section-title">连接状态</h3>
          <p class="section-description">当前 Chatlog 服务的连接状态</p>
        </div>

        <div class="status-card" :class="connectionStatus.type">
          <div class="status-indicator">
            <Icon :name="connectionStatus.icon" :size="24" />
          </div>
          <div class="status-content">
            <div class="status-title">{{ connectionStatus.title }}</div>
            <div class="status-message">{{ connectionStatus.message }}</div>
          </div>
          <div class="status-actions">
            <Button
              variant="outlined"
              size="sm"
              :disabled="isTestingConnection"
              @click="testConnection"
            >
              <Icon name="refresh-cw" :size="16" :class="{ 'animate-spin': isTestingConnection }" />
              <span>{{ isTestingConnection ? '测试中...' : '测试连接' }}</span>
            </Button>
          </div>
        </div>
      </section>

      <!-- Service Configuration -->
      <section class="settings-section">
        <div class="section-header">
          <h3 class="section-title">服务配置</h3>
          <p class="section-description">配置 Chatlog 服务的连接参数</p>
        </div>

        <div class="config-form">
          <div class="form-group">
            <label class="form-label" for="service-host">服务地址</label>
            <input
              id="service-host"
              v-model="config.host"
              type="text"
              class="form-input"
              placeholder="localhost"
              @input="onConfigChange"
            />
            <p class="form-help">Chatlog 服务运行的主机地址</p>
          </div>

          <div class="form-group">
            <label class="form-label" for="service-port">端口号</label>
            <input
              id="service-port"
              v-model.number="config.port"
              type="number"
              class="form-input"
              placeholder="5030"
              min="1"
              max="65535"
              @input="onConfigChange"
            />
            <p class="form-help">Chatlog 服务监听的端口号（默认：5030）</p>
          </div>

          <div class="form-group">
            <label class="form-label" for="service-timeout">连接超时</label>
            <input
              id="service-timeout"
              v-model.number="config.timeout"
              type="number"
              class="form-input"
              placeholder="10000"
              min="1000"
              max="60000"
              step="1000"
              @input="onConfigChange"
            />
            <p class="form-help">连接超时时间（毫秒）</p>
          </div>

          <div class="form-actions">
            <Button variant="primary" :disabled="!hasConfigChanges || isSaving" @click="saveConfig">
              <Icon name="save" :size="16" />
              <span>{{ isSaving ? '保存中...' : '保存配置' }}</span>
            </Button>
            <Button variant="outlined" :disabled="!hasConfigChanges" @click="resetConfig">
              <Icon name="rotate-ccw" :size="16" />
              <span>重置</span>
            </Button>
          </div>
        </div>
      </section>

      <!-- Service Information -->
      <section class="settings-section">
        <div class="section-header">
          <h3 class="section-title">服务信息</h3>
          <p class="section-description">Chatlog 服务的详细信息和统计数据</p>
        </div>

        <div class="info-grid">
          <div class="info-card">
            <div class="info-icon">
              <Icon name="server" :size="20" />
            </div>
            <div class="info-content">
              <div class="info-label">服务版本</div>
              <div class="info-value">{{ serviceInfo.version || '未知' }}</div>
            </div>
          </div>

          <div class="info-card">
            <div class="info-icon">
              <Icon name="database" :size="20" />
            </div>
            <div class="info-content">
              <div class="info-label">数据库状态</div>
              <div class="info-value">{{ serviceInfo.dbStatus || '未知' }}</div>
            </div>
          </div>

          <div class="info-card">
            <div class="info-icon">
              <Icon name="clock" :size="20" />
            </div>
            <div class="info-content">
              <div class="info-label">运行时间</div>
              <div class="info-value">{{ serviceInfo.uptime || '未知' }}</div>
            </div>
          </div>

          <div class="info-card">
            <div class="info-icon">
              <Icon name="activity" :size="20" />
            </div>
            <div class="info-content">
              <div class="info-label">最后同步</div>
              <div class="info-value">{{ serviceInfo.lastSync || '未知' }}</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import Button from '@renderer/components/design-system/Button.vue'
import Icon from '@renderer/components/design-system/Icon.vue'

// Types
interface ChatlogConfig {
  host: string
  port: number
  timeout: number
}

interface ConnectionStatus {
  type: 'success' | 'warning' | 'error' | 'info'
  icon: string
  title: string
  message: string
}

interface ServiceInfo {
  version?: string
  dbStatus?: string
  uptime?: string
  lastSync?: string
}

// Reactive state
const config = reactive<ChatlogConfig>({
  host: 'localhost',
  port: 5030,
  timeout: 10000
})

const originalConfig = ref<ChatlogConfig>({
  host: 'localhost',
  port: 5030,
  timeout: 10000
})

const connectionStatus = ref<ConnectionStatus>({
  type: 'info',
  icon: 'help-circle',
  title: '未知状态',
  message: '点击测试连接以检查服务状态'
})

const serviceInfo = ref<ServiceInfo>({})

const isTestingConnection = ref(false)
const isSaving = ref(false)

// Computed
const hasConfigChanges = computed(() => {
  return (
    config.host !== originalConfig.value.host ||
    config.port !== originalConfig.value.port ||
    config.timeout !== originalConfig.value.timeout
  )
})

// Methods
const testConnection = async () => {
  isTestingConnection.value = true

  try {
    // TODO: 实际调用 Chatlog 服务测试连接
    await new Promise((resolve) => setTimeout(resolve, 2000)) // 模拟延迟

    // 模拟成功连接
    connectionStatus.value = {
      type: 'success',
      icon: 'check-circle',
      title: '连接成功',
      message: `已成功连接到 ${config.host}:${config.port}`
    }

    // 更新服务信息
    serviceInfo.value = {
      version: 'v1.2.3',
      dbStatus: '正常',
      uptime: '2天 3小时',
      lastSync: '刚刚'
    }
  } catch (error) {
    connectionStatus.value = {
      type: 'error',
      icon: 'x-circle',
      title: '连接失败',
      message: '无法连接到 Chatlog 服务，请检查配置和服务状态'
    }
  } finally {
    isTestingConnection.value = false
  }
}

const saveConfig = async () => {
  isSaving.value = true

  try {
    // TODO: 保存配置到存储
    await new Promise((resolve) => setTimeout(resolve, 1000)) // 模拟保存延迟

    // 更新原始配置
    originalConfig.value = { ...config }

    console.log('配置已保存:', config)
  } catch (error) {
    console.error('保存配置失败:', error)
  } finally {
    isSaving.value = false
  }
}

const resetConfig = () => {
  Object.assign(config, originalConfig.value)
}

const onConfigChange = () => {
  // 配置变更时的处理逻辑
}

const loadConfig = async () => {
  try {
    // TODO: 从存储加载配置
    // const savedConfig = await window.electronAPI.invoke('chatlog:get-config')
    // if (savedConfig) {
    //   Object.assign(config, savedConfig)
    //   originalConfig.value = { ...savedConfig }
    // }
  } catch (error) {
    console.error('加载配置失败:', error)
  }
}

// Lifecycle
onMounted(() => {
  loadConfig()
  testConnection() // 初始化时测试连接
})
</script>

<style scoped></style>
