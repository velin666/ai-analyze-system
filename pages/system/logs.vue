<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="bg-white dark:bg-gray-800 shadow rounded-lg">
      <!-- 页面标题 -->
      <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">系统日志</h1>
        <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">查看和管理系统运行日志</p>
      </div>
      
      <!-- 过滤器 -->
      <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <!-- 日志级别 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">日志级别</label>
            <select 
              v-model="filters.level" 
              multiple
              class="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="error">错误</option>
              <option value="warn">警告</option>
              <option value="info">信息</option>
              <option value="debug">调试</option>
            </select>
          </div>
          
          <!-- 服务 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">服务</label>
            <input 
              v-model="filters.service"
              type="text" 
              placeholder="输入服务名"
              class="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
          </div>
          
          <!-- 搜索 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">搜索</label>
            <input 
              v-model="filters.search"
              type="text" 
              placeholder="搜索日志内容"
              class="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
          </div>
          
          <!-- 操作按钮 -->
          <div class="flex items-end space-x-2">
            <button 
              @click="loadLogs"
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              搜索
            </button>
            <button 
              @click="refreshLogs"
              class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              刷新
            </button>
          </div>
        </div>
      </div>
      
      <!-- 日志列表 -->
      <div class="overflow-hidden">
        <div v-if="loading" class="px-6 py-8 text-center">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">加载中...</p>
        </div>
        
        <div v-else-if="logs.length === 0" class="px-6 py-8 text-center">
          <p class="text-gray-600 dark:text-gray-400">暂无日志数据</p>
        </div>
        
        <div v-else class="divide-y divide-gray-200 dark:divide-gray-700">
          <div 
            v-for="log in logs" 
            :key="log.id"
            class="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <div class="flex items-start space-x-3">
              <!-- 日志级别标识 -->
              <span 
                :class="getLevelClass(log.level)"
                class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
              >
                {{ getLevelText(log.level) }}
              </span>
              
              <!-- 日志内容 -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-1">
                  <span>{{ formatTime(log.timestamp) }}</span>
                  <span v-if="log.service" class="text-blue-600 dark:text-blue-400">{{ log.service }}</span>
                  <span v-if="log.method && log.url" class="text-green-600 dark:text-green-400">
                    {{ log.method }} {{ log.url }}
                  </span>
                  <span v-if="log.statusCode" 
                    :class="log.statusCode >= 400 ? 'text-red-600' : 'text-green-600'"
                  >
                    {{ log.statusCode }}
                  </span>
                </div>
                
                <p class="text-gray-900 dark:text-white">{{ log.message }}</p>
                
                <!-- 错误详情 -->
                <div v-if="log.error" class="mt-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-md">
                  <p class="text-sm font-medium text-red-800 dark:text-red-400">{{ log.error.name }}: {{ log.error.message }}</p>
                  <pre v-if="log.error.stack" class="mt-2 text-xs text-red-700 dark:text-red-300 whitespace-pre-wrap">{{ log.error.stack }}</pre>
                </div>
                
                <!-- 元数据 -->
                <div v-if="log.metadata && Object.keys(log.metadata).length > 0" class="mt-2">
                  <details class="text-sm">
                    <summary class="cursor-pointer text-gray-600 dark:text-gray-400">元数据</summary>
                    <pre class="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-md text-xs overflow-x-auto">{{ JSON.stringify(log.metadata, null, 2) }}</pre>
                  </details>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 分页 -->
        <div v-if="hasMore" class="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <button 
            @click="loadMoreLogs"
            :disabled="loading"
            class="w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
          >
            加载更多
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { LogEntry, LogFilter, LogResponse } from '~/types'

definePageMeta({
  title: '系统日志'
})

// 响应式数据
const logs = ref<LogEntry[]>([])
const loading = ref(false)
const hasMore = ref(false)
const offset = ref(0)

// 过滤条件
const filters = reactive<LogFilter>({
  level: [],
  service: '',
  search: '',
  limit: 50
})

// 方法
const loadLogs = async (reset = true) => {
  if (reset) {
    offset.value = 0
    logs.value = []
  }
  
  loading.value = true
  
  try {
    const query = {
      ...filters,
      offset: offset.value
    }
    
    const response = await $fetch<LogResponse>('/api/logs', { query })
    
    if (reset) {
      logs.value = response.logs
    } else {
      logs.value.push(...response.logs)
    }
    
    hasMore.value = response.hasMore
    offset.value += response.logs.length
    
  } catch (error) {
    console.error('加载日志失败:', error)
  } finally {
    loading.value = false
  }
}

const loadMoreLogs = () => {
  loadLogs(false)
}

const refreshLogs = () => {
  loadLogs(true)
}

// 工具方法
const getLevelClass = (level: string) => {
  const classes = {
    error: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    warn: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    debug: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
  }
  return classes[level as keyof typeof classes] || classes.info
}

const getLevelText = (level: string) => {
  const texts = {
    error: '错误',
    warn: '警告',
    info: '信息',
    debug: '调试'
  }
  return texts[level as keyof typeof texts] || level
}

const formatTime = (timestamp: string) => {
  return new Date(timestamp).toLocaleString('zh-CN')
}

// 生命周期
onMounted(() => {
  loadLogs()
})
</script>
