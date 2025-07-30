<template>
  <div class="settings-page">
    <div class="settings-container">
      <!-- Page Header -->
      <div class="page-header">
        <h1 class="page-title">设置</h1>
        <p class="page-subtitle">管理您的应用配置和偏好设置</p>
      </div>

      <!-- Chatlog Service Configuration -->
      <section class="settings-section">
        <div class="section-header">
          <div class="section-icon">
            <Icon name="server" :size="24" />
          </div>
          <div class="section-info">
            <h2 class="section-title">Chatlog 服务</h2>
            <p class="section-description">配置 Chatlog 服务的连接地址、端口和测试连接状态</p>
          </div>
        </div>

        <div class="section-content">
          <!-- Connection Status -->
          <div class="status-card" :class="connectionStatus.type">
            <div class="status-indicator">
              <Icon :name="connectionStatus.icon" :size="20" />
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
                <Icon
                  name="refresh-cw"
                  :size="16"
                  :class="{ 'animate-spin': isTestingConnection }"
                />
                <span>{{ isTestingConnection ? '测试中...' : '测试连接' }}</span>
              </Button>
            </div>
          </div>

          <!-- Service Configuration Form -->
          <div class="config-form">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="service-host">服务地址</label>
                <input
                  id="service-host"
                  v-model="chatlogConfig.host"
                  type="text"
                  class="form-input"
                  placeholder="localhost"
                />
              </div>
              <div class="form-group">
                <label class="form-label" for="service-port">端口号</label>
                <input
                  id="service-port"
                  v-model.number="chatlogConfig.port"
                  type="number"
                  class="form-input"
                  placeholder="5030"
                  min="1"
                  max="65535"
                />
              </div>
            </div>
            <div class="form-actions">
              <Button variant="primary" :disabled="isSaving" @click="saveChatlogConfig">
                <Icon name="save" :size="16" />
                <span>{{ isSaving ? '保存中...' : '保存配置' }}</span>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <!-- AI Service Providers Configuration -->
      <section class="settings-section">
        <div class="section-header">
          <div class="section-icon">
            <Icon name="brain" :size="24" />
          </div>
          <div class="section-info">
            <h2 class="section-title">AI 服务提供商</h2>
            <p class="section-description">配置用于报告生成的 AI 模型和服务提供商</p>
          </div>
        </div>

        <div class="section-content">
          <div class="providers-grid">
            <div
              v-for="provider in aiProviders"
              :key="provider.id"
              class="provider-card"
              :class="{ active: provider.isEnabled }"
            >
              <div class="provider-header">
                <div class="provider-info">
                  <div class="provider-icon">
                    <Icon :name="provider.icon" :size="20" />
                  </div>
                  <div class="provider-details">
                    <h3 class="provider-name">{{ provider.name }}</h3>
                    <p class="provider-description">{{ provider.description }}</p>
                  </div>
                </div>
                <div class="provider-toggle">
                  <div
                    class="toggle-switch"
                    :class="{ active: provider.isEnabled }"
                    @click="toggleProvider(provider)"
                  >
                    <div class="toggle-handle"></div>
                  </div>
                </div>
              </div>

              <div v-if="provider.isEnabled" class="provider-config">
                <div class="form-group">
                  <label class="form-label">API Key</label>
                  <div class="input-group">
                    <input
                      v-model="provider.apiKey"
                      :type="showApiKey[provider.id] ? 'text' : 'password'"
                      class="form-input"
                      :placeholder="`输入 ${provider.name} API Key`"
                    />
                    <Button variant="text" size="sm" @click="toggleApiKeyVisibility(provider.id)">
                      <Icon :name="showApiKey[provider.id] ? 'eye-off' : 'eye'" :size="16" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- About Application -->
      <section class="settings-section">
        <div class="section-header">
          <div class="section-icon">
            <Icon name="info" :size="24" />
          </div>
          <div class="section-info">
            <h2 class="section-title">关于应用</h2>
            <p class="section-description">查看应用版本信息和许可证信息</p>
          </div>
        </div>

        <div class="section-content">
          <div class="app-info">
            <div class="app-logo">
              <Icon name="zap" :size="32" />
            </div>
            <div class="app-details">
              <h3 class="app-name">EchoSoul</h3>
              <p class="app-tagline">智能聊天记录分析工具</p>
              <div class="app-version">
                <span class="version-label">版本</span>
                <span class="version-number">{{ appInfo.version }}</span>
              </div>
            </div>
          </div>

          <div class="version-grid">
            <div class="version-item">
              <div class="version-icon">
                <Icon name="package" :size="16" />
              </div>
              <div class="version-content">
                <div class="version-name">应用版本</div>
                <div class="version-value">{{ appInfo.version }}</div>
              </div>
            </div>
            <div class="version-item">
              <div class="version-icon">
                <Icon name="cpu" :size="16" />
              </div>
              <div class="version-content">
                <div class="version-name">Electron</div>
                <div class="version-value">{{ appInfo.electronVersion }}</div>
              </div>
            </div>
            <div class="version-item">
              <div class="version-icon">
                <Icon name="calendar" :size="16" />
              </div>
              <div class="version-content">
                <div class="version-name">构建日期</div>
                <div class="version-value">{{ appInfo.buildDate }}</div>
              </div>
            </div>
          </div>
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
interface ChatlogConfig {
  host: string
  port: number
}

interface ConnectionStatus {
  type: 'success' | 'warning' | 'error' | 'info'
  icon: string
  title: string
  message: string
}

interface AIProvider {
  id: string
  name: string
  description: string
  icon: string
  isEnabled: boolean
  apiKey: string
}

interface AppInfo {
  version: string
  electronVersion: string
  buildDate: string
}

// Reactive state
const chatlogConfig = reactive<ChatlogConfig>({
  host: 'localhost',
  port: 5030
})

const connectionStatus = ref<ConnectionStatus>({
  type: 'info',
  icon: 'help-circle',
  title: '未知状态',
  message: '点击测试连接以检查服务状态'
})

const aiProviders = ref<AIProvider[]>([
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'GPT-4, GPT-3.5 等模型',
    icon: 'zap',
    isEnabled: false,
    apiKey: ''
  },
  {
    id: 'claude',
    name: 'Anthropic Claude',
    description: 'Claude-3 系列模型',
    icon: 'brain',
    isEnabled: false,
    apiKey: ''
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    description: 'Gemini Pro 模型',
    icon: 'sparkles',
    isEnabled: false,
    apiKey: ''
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    description: '国产大语言模型',
    icon: 'cpu',
    isEnabled: false,
    apiKey: ''
  }
])

const appInfo = ref<AppInfo>({
  version: '1.0.0',
  electronVersion: '28.0.0',
  buildDate: '2024-01-15'
})

const showApiKey = ref<Record<string, boolean>>({})
const isTestingConnection = ref(false)
const isSaving = ref(false)

// Methods
const testConnection = async () => {
  isTestingConnection.value = true

  try {
    await new Promise((resolve) => setTimeout(resolve, 2000))

    connectionStatus.value = {
      type: 'success',
      icon: 'check-circle',
      title: '连接成功',
      message: `已成功连接到 ${chatlogConfig.host}:${chatlogConfig.port}`
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

const saveChatlogConfig = async () => {
  isSaving.value = true

  try {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    console.log('Chatlog 配置已保存:', chatlogConfig)
  } catch (error) {
    console.error('保存配置失败:', error)
  } finally {
    isSaving.value = false
  }
}

const toggleProvider = (provider: AIProvider) => {
  provider.isEnabled = !provider.isEnabled
  if (!provider.isEnabled) {
    provider.apiKey = ''
  }
}

const toggleApiKeyVisibility = (providerId: string) => {
  showApiKey.value[providerId] = !showApiKey.value[providerId]
}

// Lifecycle
onMounted(() => {
  // Initialize API key visibility state
  aiProviders.value.forEach((provider) => {
    showApiKey.value[provider.id] = false
  })
})
</script>

<style scoped></style>
