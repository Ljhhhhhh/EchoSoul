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
            :class="{ active: isActiveSection(section.path) }"
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
          <!-- Router View for Settings Sub-pages -->
          <router-view v-if="$route.name !== 'settings'" />

          <!-- Default Settings Overview -->
          <div v-else class="settings-overview">
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
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
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

// Methods
const goBack = () => {
  router.push('/main')
}

const showHelp = () => {
  // Show help dialog or navigate to help page
}

const isActiveSection = (sectionPath: string) => {
  return route.path === sectionPath
}

const navigateToSection = (section: SettingsSection) => {
  router.push(section.path)
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
</script>

<style scoped>
.settings {
  min-height: 100vh;
  background-color: rgb(250 250 250);
}

.settings-header {
  background-color: white;
  border-bottom: 1px solid rgb(229 229 229);
  padding: 1.5rem;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.settings-content {
  display: flex;
}

.settings-navigation {
  width: 20rem;
  background-color: white;
  border-right: 1px solid rgb(229 229 229);
  padding: 1.5rem;
}

.nav-menu {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.nav-item:hover {
  background-color: rgb(245 245 245);
}

.nav-item.active {
  background-color: rgb(239 246 255);
  color: rgb(29 78 216);
}

.nav-icon {
  width: 2.5rem;
  height: 2.5rem;
  background-color: rgb(245 245 245);
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-item.active .nav-icon {
  background-color: rgb(219 234 254);
  color: rgb(37 99 235);
}

.nav-content {
  flex: 1;
}

.nav-title {
  font-weight: 500;
  color: rgb(38 38 38);
}

.nav-item.active .nav-title {
  color: rgb(29 78 216);
}

.nav-description {
  font-size: 0.875rem;
  color: rgb(107 114 128);
  margin-top: 0.25rem;
}

.nav-arrow {
  color: rgb(163 163 163);
}

.nav-item.active .nav-arrow {
  color: rgb(59 130 246);
}

.settings-panel {
  flex: 1;
}

.panel-container {
  max-width: 64rem;
  margin: 0 auto;
  padding: 1.5rem;
}

.settings-overview {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.overview-header {
  text-align: center;
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .overview-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.overview-card {
  background-color: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
  border: 1px solid rgb(229 229 229);
  cursor: pointer;
  transition: all 0.2s;
}

.overview-card:hover {
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  transform: translateY(-0.25rem);
}

.card-icon {
  width: 3rem;
  height: 3rem;
  background-color: rgb(219 234 254);
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgb(37 99 235);
  margin-bottom: 1rem;
}

.card-title {
  font-size: 1.125rem;
  font-weight: 500;
  color: rgb(38 38 38);
  margin-bottom: 0.5rem;
}

.card-description {
  color: rgb(115 115 115);
  margin-bottom: 1rem;
}

.card-arrow {
  color: rgb(163 163 163);
}

.quick-actions {
  background-color: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

@media (min-width: 768px) {
  .actions-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
</style>
