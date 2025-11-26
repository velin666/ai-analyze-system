<template>
  <div class="container mx-auto p-6">
    <h1 class="text-3xl font-bold mb-6">文件清理测试页面</h1>

    <div class="grid gap-6">
      <!-- 清理统计 -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold mb-4">清理统计</h2>
        <div v-if="loading" class="text-gray-500">加载中...</div>
        <div v-else-if="stats" class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="text-center p-4 bg-blue-50 rounded">
            <div class="text-2xl font-bold text-blue-600">
              {{ stats.totalFiles }}
            </div>
            <div class="text-sm text-gray-600">总文件数</div>
          </div>
          <div class="text-center p-4 bg-red-50 rounded">
            <div class="text-2xl font-bold text-red-600">
              {{ stats.oldFiles }}
            </div>
            <div class="text-sm text-gray-600">过期文件</div>
          </div>
          <div class="text-center p-4 bg-green-50 rounded">
            <div class="text-2xl font-bold text-green-600">
              {{ stats.totalSizeFormatted }}
            </div>
            <div class="text-sm text-gray-600">总大小</div>
          </div>
          <div class="text-center p-4 bg-yellow-50 rounded">
            <div class="text-2xl font-bold text-yellow-600">
              {{ stats.oldFileSizeFormatted }}
            </div>
            <div class="text-sm text-gray-600">过期文件大小</div>
          </div>
        </div>
        <div v-else class="text-red-500">{{ error }}</div>
      </div>

      <!-- 操作按钮 -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold mb-4">操作</h2>
        <div class="flex gap-4">
          <button
            @click="refreshStats"
            :disabled="loading"
            class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            刷新统计
          </button>
          <button
            @click="manualCleanup"
            :disabled="cleanupLoading"
            class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
          >
            {{ cleanupLoading ? '清理中...' : '手动清理' }}
          </button>
        </div>
        <div
          v-if="cleanupResult"
          class="mt-4 p-3 rounded"
          :class="
            cleanupResult.success
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          "
        >
          {{ cleanupResult.message }}
        </div>
      </div>

      <!-- 清理配置 -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold mb-4">配置信息</h2>
        <div v-if="stats" class="text-sm text-gray-600">
          <p><strong>清理阈值:</strong> {{ stats.cleanupThreshold }}</p>
          <p><strong>清理频率:</strong> {{ stats.nextCleanup }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  const stats = ref(null)
  const loading = ref(false)
  const error = ref('')
  const cleanupLoading = ref(false)
  const cleanupResult = ref(null)

  // 获取清理统计
  async function fetchStats() {
    loading.value = true
    error.value = ''

    try {
      const response = await $fetch('/api/files/cleanup-stats')
      if (response.success) {
        stats.value = response.data
      } else {
        error.value = '获取统计失败'
      }
    } catch (err) {
      error.value = '网络错误: ' + err.message
      console.error('Error fetching stats:', err)
    } finally {
      loading.value = false
    }
  }

  // 刷新统计
  function refreshStats() {
    fetchStats()
  }

  // 手动清理
  async function manualCleanup() {
    cleanupLoading.value = true
    cleanupResult.value = null

    try {
      const response = await $fetch('/api/files/cleanup', {
        method: 'POST',
      })

      cleanupResult.value = {
        success: response.success,
        message: response.message || '清理完成',
      }

      // 清理后重新获取统计
      setTimeout(() => {
        fetchStats()
      }, 1000)
    } catch (err) {
      cleanupResult.value = {
        success: false,
        message: '清理失败: ' + err.message,
      }
      console.error('Error during cleanup:', err)
    } finally {
      cleanupLoading.value = false
    }
  }

  // 页面加载时获取统计
  onMounted(() => {
    fetchStats()
  })

  // 页面标题
  useHead({
    title: '文件清理测试',
  })
</script>
