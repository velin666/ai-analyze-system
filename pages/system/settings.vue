<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 页面头部 -->
    <div class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">系统设置</h1>
            <p class="text-gray-600 mt-1">管理您的偏好设置和系统配置</p>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="space-y-8">
        <!-- 外观设置 -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-6">外观设置</h3>
          
          <div class="space-y-6">
            <!-- 主题设置 -->
            <div class="flex items-center justify-between">
              <div>
                <h4 class="text-sm font-medium text-gray-900">深色模式</h4>
                <p class="text-sm text-gray-500">启用深色主题以减少眼部疲劳</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  v-model="settings.darkMode"
                  type="checkbox"
                  class="sr-only peer"
                />
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <!-- 紧凑模式 -->
            <div class="flex items-center justify-between">
              <div>
                <h4 class="text-sm font-medium text-gray-900">紧凑模式</h4>
                <p class="text-sm text-gray-500">减少界面间距，显示更多内容</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  v-model="settings.compactMode"
                  type="checkbox"
                  class="sr-only peer"
                />
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <!-- 语言设置 -->
            <div>
              <label for="language" class="block text-sm font-medium text-gray-700 mb-2">界面语言</label>
              <select
                id="language"
                v-model="settings.language"
                class="block w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="zh-CN">简体中文</option>
                <option value="zh-TW">繁体中文</option>
                <option value="en-US">English</option>
              </select>
            </div>
          </div>
        </div>

        <!-- 通知设置 -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-6">通知设置</h3>
          
          <div class="space-y-6">
            <!-- 系统通知 -->
            <div class="flex items-center justify-between">
              <div>
                <h4 class="text-sm font-medium text-gray-900">系统通知</h4>
                <p class="text-sm text-gray-500">接收系统更新和维护通知</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  v-model="settings.systemNotifications"
                  type="checkbox"
                  class="sr-only peer"
                />
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <!-- 检查提醒 -->
            <div class="flex items-center justify-between">
              <div>
                <h4 class="text-sm font-medium text-gray-900">检查提醒</h4>
                <p class="text-sm text-gray-500">待检查项目和逾期提醒</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  v-model="settings.inspectionReminders"
                  type="checkbox"
                  class="sr-only peer"
                />
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <!-- 邮件通知 -->
            <div class="flex items-center justify-between">
              <div>
                <h4 class="text-sm font-medium text-gray-900">邮件通知</h4>
                <p class="text-sm text-gray-500">通过邮件接收重要通知</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  v-model="settings.emailNotifications"
                  type="checkbox"
                  class="sr-only peer"
                />
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        <!-- 数据设置 -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-6">数据设置</h3>
          
          <div class="space-y-6">
            <!-- 自动保存 -->
            <div class="flex items-center justify-between">
              <div>
                <h4 class="text-sm font-medium text-gray-900">自动保存</h4>
                <p class="text-sm text-gray-500">自动保存您的工作进度</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  v-model="settings.autoSave"
                  type="checkbox"
                  class="sr-only peer"
                />
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <!-- 数据备份 -->
            <div>
              <div class="flex items-center justify-between mb-4">
                <div>
                  <h4 class="text-sm font-medium text-gray-900">数据备份</h4>
                  <p class="text-sm text-gray-500">定期备份您的数据</p>
                </div>
                <button
                  @click="backupData"
                  class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  立即备份
                </button>
              </div>
              <p class="text-xs text-gray-500">最后备份时间：2025-11-13 10:30</p>
            </div>

            <!-- 清除缓存 -->
            <div>
              <div class="flex items-center justify-between mb-2">
                <div>
                  <h4 class="text-sm font-medium text-gray-900">清除缓存</h4>
                  <p class="text-sm text-gray-500">清除应用缓存数据</p>
                </div>
                <button
                  @click="clearCache"
                  class="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm"
                >
                  清除缓存
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 安全设置 -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-6">安全设置</h3>
          
          <div class="space-y-6">
            <!-- 会话超时 -->
            <div>
              <label for="sessionTimeout" class="block text-sm font-medium text-gray-700 mb-2">会话超时时间</label>
              <select
                id="sessionTimeout"
                v-model="settings.sessionTimeout"
                class="block w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="30">30 分钟</option>
                <option value="60">1 小时</option>
                <option value="120">2 小时</option>
                <option value="480">8 小时</option>
                <option value="1440">24 小时</option>
              </select>
            </div>

            <!-- 登录历史 -->
            <div>
              <div class="flex items-center justify-between mb-4">
                <div>
                  <h4 class="text-sm font-medium text-gray-900">登录历史</h4>
                  <p class="text-sm text-gray-500">查看最近的登录记录</p>
                </div>
                <button
                  @click="viewLoginHistory"
                  class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  查看历史
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 保存按钮 -->
        <div class="flex items-center justify-end space-x-3">
          <button
            @click="resetSettings"
            class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            重置设置
          </button>
          <button
            @click="saveSettings"  
            class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            保存设置
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

// 设置数据
const settings = ref({
  darkMode: false,
  compactMode: false,
  language: 'zh-CN',
  systemNotifications: true,
  inspectionReminders: true,
  emailNotifications: false,
  autoSave: true,
  sessionTimeout: '60'
})

onMounted(() => {
  // 加载用户设置
  const savedSettings = localStorage.getItem('userSettings')
  if (savedSettings) {
    settings.value = { ...settings.value, ...JSON.parse(savedSettings) }
  }
})

// 保存设置
const saveSettings = () => {
  localStorage.setItem('userSettings', JSON.stringify(settings.value))
  alert('设置保存成功！')
}

// 重置设置
const resetSettings = () => {
  if (confirm('确定要重置所有设置吗？')) {
    settings.value = {
      darkMode: false,
      compactMode: false,
      language: 'zh-CN',
      systemNotifications: true,
      inspectionReminders: true,
      emailNotifications: false,
      autoSave: true,
      sessionTimeout: '60'
    }
    localStorage.removeItem('userSettings')
    alert('设置已重置！')
  }
}

// 备份数据
const backupData = () => {
  // 模拟数据备份
  alert('数据备份成功！')
}

// 清除缓存
const clearCache = () => {
  if (confirm('确定要清除缓存吗？这可能会影响应用性能。')) {
    // 清除部分缓存数据
    sessionStorage.clear()
    alert('缓存清除成功！')
  }
}

// 查看登录历史
const viewLoginHistory = () => {
  alert('登录历史功能开发中...')
}

// 页面标题
useHead({
  title: '系统设置 - 工地资料管理系统'
})
</script>
