<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 页面头部 -->
    <div class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">
              欢迎回来，{{ user?.name || 'demo' }}！
            </h1>
            <p class="text-gray-600 mt-1">这是您的工地资料管理仪表盘</p>
          </div>
          <div class="text-sm text-gray-500">
            {{ currentDate }}
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- 统计卡片 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- 总资料数 -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">总资料数</p>
              <p class="text-3xl font-bold text-gray-900 mt-2">
                {{ stats.totalFiles }}
              </p>
            </div>
            <div
              class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center"
            >
              <svg
                class="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
          </div>
        </div>

        <!-- 已完成 -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">已完成</p>
              <p class="text-3xl font-bold text-gray-900 mt-2">
                {{ stats.completedFiles }}
              </p>
            </div>
            <div
              class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center"
            >
              <svg
                class="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <!-- 待审核 -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">待审核</p>
              <p class="text-3xl font-bold text-gray-900 mt-2">
                {{ stats.pendingFiles }}
              </p>
            </div>
            <div
              class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center"
            >
              <svg
                class="w-6 h-6 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <!-- 紧急资料 -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">紧急资料</p>
              <p class="text-3xl font-bold text-gray-900 mt-2">
                {{ stats.urgentFiles }}
              </p>
            </div>
            <div
              class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center"
            >
              <svg
                class="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- 图表区域 -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <!-- 资料状态分布 -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">资料状态分布</h3>
          <div class="flex items-center justify-center h-64">
            <div class="relative w-48 h-48">
              <!-- 简化的饼图展示 -->
              <svg
                class="w-full h-full transform -rotate-90"
                viewBox="0 0 100 100"
              >
                <!-- 已完成 (绿色) -->
                <circle
                  cx="50"
                  cy="50"
                  r="35"
                  fill="transparent"
                  stroke="#10b981"
                  stroke-width="8"
                  stroke-dasharray="65 100"
                  stroke-dashoffset="0"
                />
                <!-- 待审核 (黄色) -->
                <circle
                  cx="50"
                  cy="50"
                  r="35"
                  fill="transparent"
                  stroke="#f59e0b"
                  stroke-width="8"
                  stroke-dasharray="25 100"
                  stroke-dashoffset="-65"
                />
                <!-- 紧急 (红色) -->
                <circle
                  cx="50"
                  cy="50"
                  r="35"
                  fill="transparent"
                  stroke="#ef4444"
                  stroke-width="8"
                  stroke-dasharray="10 100"
                  stroke-dashoffset="-90"
                />
              </svg>
            </div>
          </div>
          <div class="flex items-center justify-center space-x-6 mt-4">
            <div class="flex items-center space-x-2">
              <div class="w-3 h-3 bg-green-500 rounded-full"></div>
              <span class="text-sm text-gray-600">已完成</span>
            </div>
            <div class="flex items-center space-x-2">
              <div class="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span class="text-sm text-gray-600">待审核</span>
            </div>
            <div class="flex items-center space-x-2">
              <div class="w-3 h-3 bg-red-500 rounded-full"></div>
              <span class="text-sm text-gray-600">紧急</span>
            </div>
          </div>
        </div>

        <!-- 资料类型统计 -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">资料类型统计</h3>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span class="text-sm text-gray-600">验收记录</span>
              </div>
              <div class="flex items-center space-x-2">
                <div class="w-24 h-2 bg-gray-200 rounded-full">
                  <div class="w-3/4 h-2 bg-blue-500 rounded-full"></div>
                </div>
                <span class="text-sm font-medium text-gray-900">42</span>
              </div>
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                <span class="text-sm text-gray-600">检测报告</span>
              </div>
              <div class="flex items-center space-x-2">
                <div class="w-24 h-2 bg-gray-200 rounded-full">
                  <div class="w-2/3 h-2 bg-green-500 rounded-full"></div>
                </div>
                <span class="text-sm font-medium text-gray-900">38</span>
              </div>
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span class="text-sm text-gray-600">检验记录</span>
              </div>
              <div class="flex items-center space-x-2">
                <div class="w-24 h-2 bg-gray-200 rounded-full">
                  <div class="w-1/2 h-2 bg-orange-500 rounded-full"></div>
                </div>
                <span class="text-sm font-medium text-gray-900">28</span>
              </div>
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span class="text-sm text-gray-600">其他资料</span>
              </div>
              <div class="flex items-center space-x-2">
                <div class="w-24 h-2 bg-gray-200 rounded-full">
                  <div class="w-1/3 h-2 bg-purple-500 rounded-full"></div>
                </div>
                <span class="text-sm font-medium text-gray-900">20</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部区域 -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- 最近资料 -->
        <div
          class="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200"
        >
          <div
            class="px-6 py-4 border-b border-gray-200 flex items-center justify-between"
          >
            <h3 class="text-lg font-semibold text-gray-900">最近资料</h3>
            <NuxtLink
              to="/main/files"
              class="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              查看全部
            </NuxtLink>
          </div>
          <div class="p-6">
            <div class="space-y-4">
              <div
                v-for="file in recentFiles"
                :key="file.id"
                class="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
              >
                <div class="flex items-center space-x-3">
                  <div
                    class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center"
                  >
                    <svg
                      class="w-4 h-4 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-900">
                      {{ file.name }}
                    </p>
                    <p class="text-xs text-gray-500">
                      {{ file.type }} • {{ file.date }}
                    </p>
                  </div>
                </div>
                <div class="flex items-center space-x-2">
                  <span
                    class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                    :class="{
                      'bg-green-100 text-green-800': file.status === '已完成',
                      'bg-yellow-100 text-yellow-800': file.status === '待审核',
                      'bg-red-100 text-red-800': file.status === '紧急',
                    }"
                  >
                    {{ file.status }}
                  </span>
                  <button class="text-gray-400 hover:text-gray-600">
                    <svg
                      class="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  </button>
                  <button class="text-gray-400 hover:text-gray-600">
                    <svg
                      class="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 快捷操作 -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">快捷操作</h3>
          <div class="space-y-3">
            <NuxtLink
              to="/main/files?action=upload"
              class="flex items-center p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group"
            >
              <div
                class="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mr-3"
              >
                <svg
                  class="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>
              <div>
                <p
                  class="text-sm font-medium text-gray-900 group-hover:text-blue-700"
                >
                  管理资料
                </p>
                <p class="text-xs text-gray-500">查看和管理所有资料</p>
              </div>
            </NuxtLink>

            <NuxtLink
              to="/main/inspection"
              class="flex items-center p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors group"
            >
              <div
                class="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mr-3"
              >
                <svg
                  class="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <p
                  class="text-sm font-medium text-gray-900 group-hover:text-green-700"
                >
                  资料检查
                </p>
                <p class="text-xs text-gray-500">开始进行抽查和合规检查</p>
              </div>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'

  // 用户信息
  const user = ref<any>(null)

  // 统计数据
  const stats = ref({
    totalFiles: 128,
    completedFiles: 83,
    pendingFiles: 45,
    urgentFiles: 12,
  })

  // 最近文件
  const recentFiles = ref([
    {
      id: 1,
      name: '地基验收记录',
      type: '验收记录',
      date: '2025-11-12',
      status: '已完成',
    },
    {
      id: 2,
      name: '混凝土抗压强度报告',
      type: '检测报告',
      date: '2025-11-11',
      status: '待审核',
    },
  ])

  // 当前日期
  const currentDate = computed(() => {
    return new Date().toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    })
  })

  onMounted(() => {
    // 加载用户信息
    const userData = localStorage.getItem('user')
    if (userData) {
      user.value = JSON.parse(userData)
    }

    // 加载统计数据
    loadDashboardData()
  })

  const loadDashboardData = async () => {
    try {
      const response = await $fetch('/api/dashboard/stats')
      if (response.success) {
        stats.value = response.data
        recentFiles.value = response.data.recentFiles
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    }
  }

  // 页面标题
  useHead({
    title: '仪表盘 - 工地资料管理系统',
  })
</script>
