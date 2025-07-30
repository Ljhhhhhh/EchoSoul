<template>
  <div class="ai-settings">
    <div class="settings-container">
      <!-- Page Header -->
      <div class="page-header">
        <h2 class="text-title-large text-neutral-800">AI 服务配置</h2>
        <p class="mt-2 text-body-medium text-neutral-600">配置用于报告生成的 AI 模型和服务提供商</p>
      </div>

      <!-- AI Service Providers -->
      <section class="settings-section">
        <div class="section-header">
          <h3 class="text-title-medium text-neutral-800">AI 服务提供商</h3>
          <p class="text-body-small text-neutral-600">选择和配置您偏好的 AI 服务提供商</p>
        </div>

        <div class="providers-grid">
          <div
            v-for="provider in aiProviders"
            :key="provider.id"
            class="provider-card"
            :class="{
              active: provider.isEnabled,
              configured: provider.apiKey
            }"
          >
            <div class="provider-header">
              <div class="provider-info">
                <div class="provider-icon">
                  <Icon :name="provider.icon" :size="24" />
                </div>
                <div class="provider-details">
                  <h4 class="provider-name">{{ provider.name }}</h4>
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

            <!-- Provider Configuration -->
            <div v-if="provider.isEnabled" class="provider-config">
              <div class="config-form">
                <div class="form-group">
                  <label class="form-label">API Key</label>
                  <div class="input-group">
                    <input
                      v-model="provider.apiKey"
                      :type="showApiKey[provider.id] ? 'text' : 'password'"
                      class="form-input"
                      :placeholder="`输入 ${provider.name} API Key`"
                    />
                    <Button
                      variant="text"
                      size="sm"
                      :icon="showApiKey[provider.id] ? 'eye-off' : 'eye'"
                      @click="toggleApiKeyVisibility(provider.id)"
                    />
                  </div>
                </div>

                <div
                  v-if="provider.id === 'openrouter' || provider.id === 'custom'"
                  class="form-group"
                >
                  <label class="form-label">Base URL</label>
                  <input
                    v-model="provider.baseUrl"
                    type="url"
                    class="form-input"
                    placeholder="https://api.example.com/v1"
                  />
                </div>

                <div class="form-group">
                  <label class="form-label">模型</label>
                  <select v-model="provider.model" class="form-select">
                    <option
                      v-for="model in getAvailableModels(provider.id)"
                      :key="model.id"
                      :value="model.id"
                    >
                      {{ model.name }}
                    </option>
                  </select>
                </div>

                <!-- Advanced Settings -->
                <div class="advanced-settings">
                  <Button
                    variant="text"
                    size="sm"
                    :icon="showAdvanced[provider.id] ? 'chevron-up' : 'chevron-down'"
                    @click="toggleAdvancedSettings(provider.id)"
                  >
                    高级设置
                  </Button>

                  <div v-if="showAdvanced[provider.id]" class="advanced-form">
                    <div class="form-row">
                      <div class="form-group">
                        <label class="form-label">Temperature</label>
                        <input
                          v-model.number="provider.settings.temperature"
                          type="number"
                          min="0"
                          max="2"
                          step="0.1"
                          class="form-input"
                        />
                      </div>

                      <div class="form-group">
                        <label class="form-label">Max Tokens</label>
                        <input
                          v-model.number="provider.settings.maxTokens"
                          type="number"
                          min="1"
                          max="32000"
                          class="form-input"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Test Connection -->
                <div class="test-section">
                  <Button
                    variant="secondary"
                    size="sm"
                    icon="zap"
                    :loading="testingConnection[provider.id]"
                    :disabled="!provider.apiKey"
                    @click="testConnection(provider)"
                  >
                    测试连接
                  </Button>

                  <div v-if="connectionResults[provider.id]" class="test-result">
                    <div
                      class="result-message"
                      :class="connectionResults[provider.id].success ? 'success' : 'error'"
                    >
                      <Icon
                        :name="connectionResults[provider.id].success ? 'check-circle' : 'x-circle'"
                        :size="16"
                      />
                      <span>{{ connectionResults[provider.id].message }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Default Settings -->
      <section class="settings-section">
        <div class="section-header">
          <h3 class="text-title-medium text-neutral-800">默认设置</h3>
          <p class="text-body-small text-neutral-600">配置报告生成的默认 AI 参数</p>
        </div>

        <div class="default-settings-form">
          <div class="form-group">
            <label class="form-label">默认 AI 提供商</label>
            <select v-model="defaultSettings.provider" class="form-select">
              <option v-for="provider in enabledProviders" :key="provider.id" :value="provider.id">
                {{ provider.name }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">分析语言</label>
            <select v-model="defaultSettings.language" class="form-select">
              <option value="zh">中文</option>
              <option value="en">English</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">报告风格</label>
            <select v-model="defaultSettings.reportStyle" class="form-select">
              <option value="professional">专业</option>
              <option value="casual">轻松</option>
              <option value="detailed">详细</option>
              <option value="concise">简洁</option>
            </select>
          </div>
        </div>
      </section>

      <!-- Usage Statistics -->
      <section class="settings-section">
        <div class="section-header">
          <h3 class="text-title-medium text-neutral-800">使用统计</h3>
          <p class="text-body-small text-neutral-600">查看 AI 服务的使用情况和成本</p>
        </div>

        <div class="usage-stats">
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon">
                <Icon name="zap" :size="20" />
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ usageStats.totalRequests }}</div>
                <div class="stat-label">总请求数</div>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">
                <Icon name="clock" :size="20" />
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ usageStats.avgResponseTime }}ms</div>
                <div class="stat-label">平均响应时间</div>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">
                <Icon name="dollar-sign" :size="20" />
              </div>
              <div class="stat-content">
                <div class="stat-value">${{ usageStats.estimatedCost }}</div>
                <div class="stat-label">预估成本</div>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">
                <Icon name="check-circle" :size="20" />
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ usageStats.successRate }}%</div>
                <div class="stat-label">成功率</div>
              </div>
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
import { ref, computed, onMounted } from 'vue'
import Button from '@renderer/components/design-system/Button.vue'
import Icon from '@renderer/components/design-system/Icon.vue'
import type { AIServiceConfig } from '@renderer/types/pages'

// Reactive state
const isSaving = ref(false)
const showApiKey = ref<Record<string, boolean>>({})
const showAdvanced = ref<Record<string, boolean>>({})
const testingConnection = ref<Record<string, boolean>>({})
const connectionResults = ref<Record<string, { success: boolean; message: string }>>({})

const aiProviders = ref<AIServiceConfig[]>([
  {
    id: 'openai',
    name: 'OpenAI',
    description: '强大的 GPT 系列模型，适合各种文本生成任务',
    icon: 'brain',
    provider: 'openai',
    apiKey: '',
    model: 'gpt-4',
    isEnabled: false,
    settings: {
      temperature: 0.7,
      maxTokens: 4000
    }
  },
  {
    id: 'claude',
    name: 'Claude',
    description: 'Anthropic 的 Claude 模型，擅长对话和分析',
    icon: 'message-circle',
    provider: 'claude',
    apiKey: '',
    model: 'claude-3-sonnet',
    isEnabled: false,
    settings: {
      temperature: 0.7,
      maxTokens: 4000
    }
  },
  {
    id: 'gemini',
    name: 'Gemini',
    description: 'Google 的多模态 AI 模型',
    icon: 'sparkles',
    provider: 'gemini',
    apiKey: '',
    model: 'gemini-pro',
    isEnabled: false,
    settings: {
      temperature: 0.7,
      maxTokens: 4000
    }
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    description: '统一的 AI 模型接口，支持多种模型',
    icon: 'route',
    provider: 'openrouter',
    apiKey: '',
    model: 'openai/gpt-4',
    baseUrl: 'https://openrouter.ai/api/v1',
    isEnabled: false,
    settings: {
      temperature: 0.7,
      maxTokens: 4000
    }
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    description: '深度求索的高性能 AI 模型',
    icon: 'search',
    provider: 'deepseek',
    apiKey: '',
    model: 'deepseek-chat',
    isEnabled: false,
    settings: {
      temperature: 0.7,
      maxTokens: 4000
    }
  }
])

const defaultSettings = ref({
  provider: 'openai',
  language: 'zh',
  reportStyle: 'professional'
})

const usageStats = ref({
  totalRequests: 0,
  avgResponseTime: 0,
  estimatedCost: 0,
  successRate: 0
})

// Computed properties
const enabledProviders = computed(() => aiProviders.value.filter((p) => p.isEnabled))

// Methods
const toggleProvider = (provider: AIServiceConfig) => {
  provider.isEnabled = !provider.isEnabled
}

const toggleApiKeyVisibility = (providerId: string) => {
  showApiKey.value[providerId] = !showApiKey.value[providerId]
}

const toggleAdvancedSettings = (providerId: string) => {
  showAdvanced.value[providerId] = !showAdvanced.value[providerId]
}

const getAvailableModels = (providerId: string) => {
  const modelMap: Record<string, Array<{ id: string; name: string }>> = {
    openai: [
      { id: 'gpt-4', name: 'GPT-4' },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo' },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' }
    ],
    claude: [
      { id: 'claude-3-opus', name: 'Claude 3 Opus' },
      { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet' },
      { id: 'claude-3-haiku', name: 'Claude 3 Haiku' }
    ],
    gemini: [
      { id: 'gemini-pro', name: 'Gemini Pro' },
      { id: 'gemini-pro-vision', name: 'Gemini Pro Vision' }
    ],
    openrouter: [
      { id: 'openai/gpt-4', name: 'GPT-4 (OpenRouter)' },
      { id: 'anthropic/claude-3-opus', name: 'Claude 3 Opus (OpenRouter)' },
      { id: 'google/gemini-pro', name: 'Gemini Pro (OpenRouter)' }
    ],
    deepseek: [
      { id: 'deepseek-chat', name: 'DeepSeek Chat' },
      { id: 'deepseek-coder', name: 'DeepSeek Coder' }
    ]
  }

  return modelMap[providerId] || []
}

const testConnection = async (provider: AIServiceConfig) => {
  testingConnection.value[provider.provider] = true

  try {
    // TODO: Implement actual connection test
    await new Promise((resolve) => setTimeout(resolve, 2000))

    connectionResults.value[provider.provider] = {
      success: true,
      message: '连接成功'
    }
  } catch (error) {
    connectionResults.value[provider.provider] = {
      success: false,
      message: '连接失败，请检查 API Key 和网络连接'
    }
  } finally {
    testingConnection.value[provider.provider] = false
  }
}

const resetToDefaults = () => {
  // Reset all settings to default values
  aiProviders.value.forEach((provider) => {
    provider.isEnabled = false
    provider.apiKey = ''
    provider.settings = {
      temperature: 0.7,
      maxTokens: 4000
    }
  })

  defaultSettings.value = {
    provider: 'openai',
    language: 'zh',
    reportStyle: 'professional'
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
  // Load existing settings
  // TODO: Implement settings loading
})
</script>

<style scoped></style>
