<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 页面头部 -->
    <div class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">资料检查</h1>
            <p class="text-gray-600 mt-1">检查和审核工地资料的完整性和准确性</p>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- 总体检查进度 -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h2 class="text-lg font-semibold text-gray-900 mb-6">总体检查进度</h2>
        
        <!-- 进度条 -->
        <div class="mb-6">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-gray-700">总体进度</span>
            <span class="text-2xl font-bold text-green-600">{{ overallProgress }}%</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-3">
            <div 
              class="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-500"
              :style="{ width: `${overallProgress}%` }"
            ></div>
          </div>
        </div>

        <!-- 统计卡片 -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <!-- 通过项 -->
          <div class="bg-green-50 rounded-lg p-4 border border-green-200">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-green-700 text-sm font-medium">通过项</p>
                <p class="text-2xl font-bold text-green-900">{{ stats.passed }}</p>
                <p class="text-xs text-green-600">{{ Math.round((stats.passed / stats.total) * 100) }}% 的检查项</p>
              </div>
              <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
            </div>
          </div>

          <!-- 未通过项 -->
          <div class="bg-red-50 rounded-lg p-4 border border-red-200">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-red-700 text-sm font-medium">未通过项</p>
                <p class="text-2xl font-bold text-red-900">{{ stats.failed }}</p>
                <p class="text-xs text-red-600">{{ Math.round((stats.failed / stats.total) * 100) }}% 的检查项</p>
              </div>
              <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </div>
            </div>
          </div>

          <!-- 待检查项 -->
          <div class="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-yellow-700 text-sm font-medium">待检查项</p>
                <p class="text-2xl font-bold text-yellow-900">{{ stats.pending }}</p>
                <p class="text-xs text-yellow-600">{{ Math.round((stats.pending / stats.total) * 100) }}% 的检查项</p>
              </div>
              <div class="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
            </div>
          </div>

          <!-- 特检查项 -->
          <div class="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-blue-700 text-sm font-medium">特检查项</p>
                <p class="text-2xl font-bold text-blue-900">{{ stats.special }}</p>
                <p class="text-xs text-blue-600">{{ Math.round((stats.special / stats.total) * 100) }}% 的检查项</p>
              </div>
              <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.95-.69l1.52-4.674z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 筛选和搜索 -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
          <!-- 搜索框 -->
          <div class="flex-1 max-w-md">
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
              </div>
              <input
                v-model="searchQuery"
                type="text"
                class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="搜索检查项目、分析详情..."
              />
            </div>
          </div>

          <!-- 筛选器 -->
          <div class="flex items-center space-x-3">
            <!-- 分类筛选 -->
            <select
              v-model="selectedCategory"
              class="border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">全部</option>
              <option value="基础工程">基础工程</option>
              <option value="主体结构">主体结构</option>
              <option value="装饰装修">装饰装修</option>
              <option value="安全防护">安全防护</option>
            </select>

            <!-- 状态筛选 -->
            <select
              v-model="selectedStatus"
              class="border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">全部</option>
              <option value="通过">通过</option>
              <option value="未通过">未通过</option>
              <option value="待检查">待检查</option>
              <option value="特殊">特殊</option>
            </select>

            <!-- 重置筛选 -->
            <button
              @click="resetFilters"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              重置筛选
            </button>
          </div>
        </div>
      </div>

      <!-- 检查项统计 -->
      <div class="mb-6">
        <p class="text-lg font-medium text-gray-900">
          {{ filteredInspections.length }} 个检查项
          <span class="text-sm font-normal text-gray-500 ml-2">
            共 {{ totalInspections }} 个检查项
          </span>
        </p>
      </div>

      <!-- 检查项列表 -->
      <div class="space-y-4">
        <div
          v-for="inspection in filteredInspections"
          :key="inspection.id"
          class="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
        >
          <div class="p-6">
            <div class="flex items-start justify-between">
              <!-- 检查项信息 -->
              <div class="flex items-start space-x-4 flex-1">
                <!-- 状态图标 -->
                <div class="flex-shrink-0 mt-1">
                  <div 
                    class="w-8 h-8 rounded-full flex items-center justify-center"
                    :class="{
                      'bg-green-100': inspection.status === '通过',
                      'bg-red-100': inspection.status === '未通过', 
                      'bg-yellow-100': inspection.status === '待检查',
                      'bg-blue-100': inspection.status === '特殊'
                    }"
                  >
                    <svg
                      v-if="inspection.status === '通过'"
                      class="w-5 h-5 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                    <svg
                      v-else-if="inspection.status === '未通过'"
                      class="w-5 h-5 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                    <svg
                      v-else-if="inspection.status === '待检查'"
                      class="w-5 h-5 text-yellow-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <svg
                      v-else
                      class="w-5 h-5 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.95-.69l1.52-4.674z"/>
                    </svg>
                  </div>
                </div>

                <!-- 检查项详情 -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-center space-x-3 mb-2">
                    <h3 class="text-lg font-semibold text-gray-900">
                      {{ inspection.name }}
                    </h3>
                    <span
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      :class="{
                        'bg-green-100 text-green-800': inspection.status === '通过',
                        'bg-red-100 text-red-800': inspection.status === '未通过',
                        'bg-yellow-100 text-yellow-800': inspection.status === '待检查',
                        'bg-blue-100 text-blue-800': inspection.status === '特殊'
                      }"
                    >
                      {{ inspection.status }}
                    </span>
                  </div>
                  
                  <p class="text-sm text-gray-600 mb-3">
                    {{ inspection.description }}
                  </p>

                  <!-- 进度条 -->
                  <div class="flex items-center space-x-4 mb-3">
                    <span class="text-sm text-gray-500">资料进度</span>
                    <div class="flex-1 max-w-xs">
                      <div class="flex items-center justify-between text-xs mb-1">
                        <span class="text-gray-500">{{ inspection.progress.current }}/{{ inspection.progress.total }}</span>
                        <span class="font-medium">{{ Math.round((inspection.progress.current / inspection.progress.total) * 100) }}%</span>
                      </div>
                      <div class="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          class="h-2 rounded-full transition-all duration-300"
                          :class="{
                            'bg-green-500': inspection.status === '通过',
                            'bg-red-500': inspection.status === '未通过',
                            'bg-yellow-500': inspection.status === '待检查',
                            'bg-blue-500': inspection.status === '特殊'
                          }"
                          :style="{ width: `${(inspection.progress.current / inspection.progress.total) * 100}%` }"
                        ></div>
                      </div>
                    </div>
                  </div>

                  <!-- 标签 -->
                  <div class="flex items-center space-x-2">
                    <span class="inline-flex items-center px-2 py-1 rounded-md text-xs bg-gray-100 text-gray-700">
                      {{ inspection.category }}
                    </span>
                    <span class="text-xs text-gray-500">
                      最后检查：{{ inspection.lastChecked }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- 操作按钮 -->
              <div class="flex items-center space-x-2 ml-4">
                <button
                  @click="viewDetails(inspection)"
                  class="px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  查看详情
                </button>
                <button
                  v-if="inspection.status === '待检查'"
                  @click="startInspection(inspection)"
                  class="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  开始检查
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="filteredInspections.length === 0" class="text-center py-16">
        <div class="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">没有找到检查项</h3>
        <p class="text-gray-500">尝试调整搜索条件或筛选器</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// 模拟检查数据
const mockInspections = [
  {
    id: '1',
    name: '地基验收记录检查',
    description: '检查地基基础的验收记录完整性和准确性，符合建筑规范标准',
    status: '通过',
    category: '基础工程',
    progress: { current: 5, total: 5 },
    lastChecked: '2025-11-12'
  },
  {
    id: '2', 
    name: '混凝土抗压强度报告审核',
    description: '3号楼二层混凝土抗压强度检测报告，需要验收抗压强度指标',
    status: '待检查',
    category: '主体结构',
    progress: { current: 3, total: 4 },
    lastChecked: '2025-11-10'
  },
  {
    id: '3',
    name: '钢筋进场检验记录审查',
    description: '钢筋进场检验记录完整性检查，包括材质证明和检验报告',
    status: '未通过',
    category: '主体结构', 
    progress: { current: 2, total: 6 },
    lastChecked: '2025-11-09'
  },
  {
    id: '4',
    name: '模板安装验收记录检查',
    description: '模板安装工程验收记录，检查安装质量和安全性能',
    status: '通过',
    category: '基础工程',
    progress: { current: 4, total: 4 },
    lastChecked: '2025-11-11'
  },
  {
    id: '5',
    name: '建筑防火检查记录',
    description: '建筑防火安全检查记录，确保消防设施配置符合要求',
    status: '特殊',
    category: '安全防护',
    progress: { current: 2, total: 3 },
    lastChecked: '2025-11-08'
  },
  {
    id: '6',
    name: '电气安装验收记录',
    description: '电气系统安装验收记录检查，包括线路和设备安装',
    status: '待检查',
    category: '装饰装修',
    progress: { current: 1, total: 5 },
    lastChecked: '2025-11-07'
  }
]

// 响应式数据
const inspections = ref(mockInspections)
const searchQuery = ref('')
const selectedCategory = ref('')
const selectedStatus = ref('')

// 计算属性
const totalInspections = computed(() => inspections.value.length)

const stats = computed(() => {
  const total = inspections.value.length
  const passed = inspections.value.filter(i => i.status === '通过').length
  const failed = inspections.value.filter(i => i.status === '未通过').length
  const pending = inspections.value.filter(i => i.status === '待检查').length
  const special = inspections.value.filter(i => i.status === '特殊').length
  
  return { total, passed, failed, pending, special }
})

const overallProgress = computed(() => {
  const totalProgress = inspections.value.reduce((sum, item) => {
    return sum + (item.progress.current / item.progress.total)
  }, 0)
  return Math.round((totalProgress / inspections.value.length) * 100)
})

const filteredInspections = computed(() => {
  let result = inspections.value

  // 搜索筛选
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(inspection => 
      inspection.name.toLowerCase().includes(query) ||
      inspection.description.toLowerCase().includes(query) ||
      inspection.category.toLowerCase().includes(query)
    )
  }

  // 分类筛选
  if (selectedCategory.value) {
    result = result.filter(inspection => inspection.category === selectedCategory.value)
  }

  // 状态筛选
  if (selectedStatus.value) {
    result = result.filter(inspection => inspection.status === selectedStatus.value)
  }

  return result
})

// 方法
const resetFilters = () => {
  searchQuery.value = ''
  selectedCategory.value = ''
  selectedStatus.value = ''
}

const viewDetails = (inspection: any) => {
  console.log('View details:', inspection)
}

const startInspection = (inspection: any) => {
  // 更新检查状态为进行中
  const index = inspections.value.findIndex(i => i.id === inspection.id)
  if (index !== -1) {
    inspections.value[index].status = '特殊'
  }
  console.log('Start inspection:', inspection)
}

// 页面标题
useHead({
  title: '资料检查 - 工地资料管理系统'
})
</script>
