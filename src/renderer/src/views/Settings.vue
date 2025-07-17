<template>
  <div class="settings">
    <!-- Settings Header -->
    <header class="settings-header">
      <div class="header-content">
        <div class="header-left">
          <Button variant="text" size="sm" icon="arrow-left" @click="goBack"> 返回 </Button>
          <div class="header-title">
            <h1 class="text-headline-medium text-neutral-800">设置</h1>
            <p class="text-body-medium text-neutral-600">配置 EchoSoul 的各项功能和偏好</p>
          </div>
        </div>

        <div class="header-actions">
          <Button variant="text" size="sm" icon="help-circle" @click="showHelp"> 帮助 </Button>
        </div>
      </div>
    </header>

    <!-- Settings Content -->
    <div class="settings-content">
      <!-- Settings Navigation -->
      <aside class="settings-navigation">
        <nav class="nav-menu">
          <div
            v-for="section in settingsSections"
            :key="section.id"
            class="nav-item"
            :class="{ active: section.isActive }"
            @click="navigateToSection(section)"
          >
            <div class="nav-icon">
              <Icon :name="section.icon" :size="20" />
            </div>
            <div class="nav-content">
              <div class="nav-title">{{ section.title }}</div>
              <div class="nav-description">{{ section.description }}</div>
            </div>
            <div class="nav-arrow">
              <Icon name="chevron-right" :size="16" />
            </div>
          </div>
        </nav>
      </aside>

      <!-- Settings Panel -->
      <main class="settings-panel">
        <div class="panel-container">
          <!-- Default Settings Overview -->
          <div v-if="!$route.params.section" class="settings-overview">
            <div class="overview-header">
              <h2 class="text-title-large text-neutral-800">设置概览</h2>
              <p class="mt-2 text-body-medium text-neutral-600">
                快速访问和配置 EchoSoul 的主要功能
              </p>
            </div>

            <div class="overview-grid">
              <div
                v-for="section in settingsSections"
                :key="section.id"
                class="overview-card"
                @click="navigateToSection(section)"
              >
                <div class="card-icon">
                  <Icon :name="section.icon" :size="24" />
                </div>
                <div class="card-content">
                  <h3 class="card-title">{{ section.title }}</h3>
                  <p class="card-description">{{ section.description }}</p>
                </div>
                <div class="card-arrow">
                  <Icon name="chevron-right" :size="20" />
                </div>
              </div>
            </div>

            <!-- Quick Actions -->
            <div class="quick-actions">
              <h3 class="mb-4 text-title-medium text-neutral-800">快速操作</h3>
              <div class="actions-grid">
                <Button variant="secondary" size="md" icon="download" @click="exportSettings">
                  导出设置
                </Button>
                <Button variant="secondary" size="md" icon="upload" @click="importSettings">
                  导入设置
                </Button>
                <Button variant="secondary" size="md" icon="refresh-cw" @click="resetSettings">
                  重置设置
                </Button>
                <Button variant="secondary" size="md" icon="info" @click="showAbout">
                  关于 EchoSoul
                </Button>
              </div>
            </div>
          </div>

          <!-- Settings Sub-pages -->
          <div v-else class="settings-subpage">
            <div class="subpage-header">
              <div class="breadcrumb">
                <Button variant="text" size="sm" @click="navigateToOverview"> 设置 </Button>
                <Icon name="chevron-right" :size="16" />
                <span class="current-section">{{ currentSectionTitle }}</span>
              </div>
            </div>

            <!-- Router View for Sub-pages -->
            <div class="subpage-content">
              <router-view />
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Button from '@renderer/components/design-system/Button.vue'
import Icon from '@renderer/components/design-system/Icon.vue'
import type { SettingsSection } from '@renderer/types/pages'

// Router
const router = useRouter()
const route = useRoute()

// Reactive state
const settingsSections = ref<SettingsSection[]>([
  {
    id: 'ai',
    title: 'AI 服务配置',
    description: '配置 AI 模型和 API 密钥',
    icon: 'brain',
    path: '/main/settings/ai'
  },
  {
    id: 'reports',
    title: '报告偏好',
    description: '自定义报告生成和显示选项',
    icon: 'file-text',
    path: '/main/settings/reports'
  },
  {
    id: 'data',
    title: '数据管理',
    description: '管理聊天数据和存储设置',
    icon: 'database',
    path: '/main/settings/data'
  },
  {
    id: 'system',
    title: '系统设置',
    description: '应用行为和界面偏好',
    icon: 'settings',
    path: '/main/settings/system'
  }
])

// Computed properties
const currentSectionTitle = computed(() => {
  const sectionId = route.params.section as string
  const section = settingsSections.value.find((s) => s.id === sectionId)
  return section?.title || '设置'
})

// Methods
const goBack = () => {
  router.push('/main')
}

const showHelp = () => {
  // Show help dialog or navigate to help page
}

const navigateToSection = (section: SettingsSection) => {
  router.push(section.path)
}

const navigateToOverview = () => {
  router.push('/main/settings')
}

const exportSettings = () => {
  // Implement settings export
}

const importSettings = () => {
  // Implement settings import
}

const resetSettings = () => {
  // Implement settings reset with confirmation
}

const showAbout = () => {
  // Show about dialog
}

const updateActiveSection = () => {
  const currentPath = route.path
  settingsSections.value.forEach((section) => {
    section.isActive = section.path === currentPath
  })
}

// Watchers
watch(route, updateActiveSection, { immediate: true })

// Lifecycle
onMounted(() => {
  updateActiveSection()
})
</script>

<style scoped>
.settings {
  @apply min-h-screen bg-neutral-50;
}

.settings-header {
  @apply bg-white border-b border-neutral-200 p-6;
}

.header-content {
  @apply flex items-center justify-between;
}

.header-left {
  @apply flex items-center space-x-4;
}

.settings-content {
  @apply flex;
}

.settings-navigation {
  @apply w-80 bg-white border-r border-neutral-200 p-6;
}

.nav-menu {
  @apply space-y-2;
}

.nav-item {
  @apply flex items-center space-x-3 p-4 rounded-lg cursor-pointer transition-colors hover:bg-neutral-100;
}

.nav-item.active {
  @apply bg-primary-50 text-primary-700;
}

.nav-icon {
  @apply w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center;
}

.nav-item.active .nav-icon {
  @apply bg-primary-100 text-primary-600;
}

.nav-content {
  @apply flex-1;
}

.nav-title {
  @apply font-medium text-neutral-800;
}

.nav-item.active .nav-title {
  @apply text-primary-700;
}

.nav-description {
  @apply text-sm text-neutral-500 mt-1;
}

.nav-arrow {
  @apply text-neutral-400;
}

.nav-item.active .nav-arrow {
  @apply text-primary-500;
}

.settings-panel {
  @apply flex-1;
}

.panel-container {
  @apply max-w-4xl mx-auto p-6;
}

.settings-overview {
  @apply space-y-8;
}

.overview-header {
  @apply text-center;
}

.overview-grid {
  @apply grid grid-cols-1 md:grid-cols-2 gap-6;
}

.overview-card {
  @apply bg-white p-6 rounded-lg shadow-sm border border-neutral-200 cursor-pointer transition-all hover:shadow-md hover:-translate-y-1;
}

.card-icon {
  @apply w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 mb-4;
}

.card-title {
  @apply text-lg font-medium text-neutral-800 mb-2;
}

.card-description {
  @apply text-neutral-600 mb-4;
}

.card-arrow {
  @apply text-neutral-400;
}

.quick-actions {
  @apply bg-white p-6 rounded-lg shadow-sm;
}

.actions-grid {
  @apply grid grid-cols-2 md:grid-cols-4 gap-4;
}

.settings-subpage {
  @apply space-y-6;
}

.subpage-header {
  @apply pb-4 border-b border-neutral-200;
}

.breadcrumb {
  @apply flex items-center space-x-2 text-sm;
}

.current-section {
  @apply text-neutral-700 font-medium;
}

.subpage-content {
  @apply bg-white rounded-lg shadow-sm;
}
</style>
