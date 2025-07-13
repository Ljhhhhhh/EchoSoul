<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 顶部导航栏 -->
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <h1 class="text-xl font-semibold text-gray-900">EchoSoul</h1>
            <span class="ml-2 text-sm text-gray-500">聊天记录分析</span>
          </div>
          <div class="flex items-center space-x-4">
            <button class="text-gray-500 hover:text-gray-700 transition-colors">
              <span class="sr-only">设置</span>
              ⚙️
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- 主内容区域 -->
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <!-- 欢迎卡片 -->
        <div class="bg-white overflow-hidden shadow rounded-lg mb-6">
          <div class="px-4 py-5 sm:p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <span class="text-3xl">🎉</span>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">
                    初始化完成
                  </dt>
                  <dd class="text-lg font-medium text-gray-900">
                    欢迎使用 EchoSoul！您的聊天记录分析环境已准备就绪。
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <!-- 功能卡片网格 -->
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <!-- 生成报告卡片 -->
          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <span class="text-2xl">📊</span>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">
                      分析报告
                    </dt>
                    <dd class="text-lg font-medium text-gray-900">
                      生成聊天记录分析报告
                    </dd>
                  </dl>
                </div>
              </div>
              <div class="mt-5">
                <button class="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors">
                  生成新报告
                </button>
              </div>
            </div>
          </div>

          <!-- 历史报告卡片 -->
          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <span class="text-2xl">📚</span>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">
                      历史报告
                    </dt>
                    <dd class="text-lg font-medium text-gray-900">
                      查看已生成的报告
                    </dd>
                  </dl>
                </div>
              </div>
              <div class="mt-5">
                <button class="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">
                  查看报告
                </button>
              </div>
            </div>
          </div>

          <!-- 设置卡片 -->
          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <span class="text-2xl">⚙️</span>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">
                      应用设置
                    </dt>
                    <dd class="text-lg font-medium text-gray-900">
                      配置AI模型和分析参数
                    </dd>
                  </dl>
                </div>
              </div>
              <div class="mt-5">
                <button class="w-full bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors">
                  打开设置
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 状态信息 -->
        <div class="mt-6 bg-white overflow-hidden shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
              系统状态
            </h3>
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div class="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <span class="text-sm font-medium text-gray-500">微信连接状态</span>
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  已连接
                </span>
              </div>
              <div class="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <span class="text-sm font-medium text-gray-500">数据库状态</span>
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  正常
                </span>
              </div>
              <div class="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <span class="text-sm font-medium text-gray-500">AI服务状态</span>
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  未配置
                </span>
              </div>
              <div class="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <span class="text-sm font-medium text-gray-500">定时任务</span>
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  已启用
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

onMounted(() => {
  console.log('主应用页面已加载')
})
</script>
