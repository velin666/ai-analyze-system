<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 页面头部 -->
    <div class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">资料管理</h1>
            <p class="text-gray-600 mt-1">整理、查看和管理所有工地资料文档</p>
          </div>
          <div class="flex items-center space-x-3">
            <button
              @click="showUploadModal = true"
              class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
              </svg>
              上传新资料
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- 搜索和筛选 -->
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
                placeholder="搜索资料名称、描述或类型..."
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
              <option value="验收记录">验收记录</option>
              <option value="检测报告">检测报告</option>
              <option value="检验记录">检验记录</option>
              <option value="其他">其他</option>
            </select>

            <!-- 状态筛选 -->
            <select
              v-model="selectedStatus"
              class="border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">全部</option>
              <option value="已完成">已完成</option>
              <option value="待审核">待审核</option>
              <option value="紧急">紧急</option>
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

      <!-- 文件统计 -->
      <div class="mb-6">
        <p class="text-lg font-medium text-gray-900">
          {{ filteredFiles.length }} 个资料
          <span class="text-sm font-normal text-gray-500 ml-2">
            共 {{ totalFiles }} 个资料
          </span>
        </p>
      </div>

      <!-- 文件列表 -->
      <div class="space-y-4">
        <div
          v-for="file in filteredFiles"
          :key="file.id"
          class="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow overflow-hidden"
        >
          <div class="p-6">
            <div class="flex items-start justify-between">
              <!-- 文件信息 -->
              <div class="flex items-start space-x-4 flex-1">
                <!-- 文件图标 -->
                <div class="flex-shrink-0">
                  <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                  </div>
                </div>

                <!-- 文件详情 -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-center space-x-3 mb-2">
                    <h3 class="text-lg font-semibold text-gray-900 truncate">
                      {{ file.name }}
                    </h3>
                    <span
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      :class="{
                        'bg-green-100 text-green-800': file.status === '已完成',
                        'bg-yellow-100 text-yellow-800': file.status === '待审核', 
                        'bg-red-100 text-red-800': file.status === '紧急'
                      }"
                    >
                      {{ file.status }}
                    </span>
                  </div>
                  
                  <div class="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                    <span class="flex items-center space-x-1">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
                      </svg>
                      <span>{{ file.type }}</span>
                    </span>
                    <span class="flex items-center space-x-1">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                      </svg>
                      <span>{{ file.size }}</span>
                    </span>
                    <span class="flex items-center space-x-1">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                      <span>{{ file.date }}</span>
                    </span>
                  </div>

                  <p class="text-sm text-gray-600 line-clamp-2">
                    {{ file.description || '暂无描述' }}
                  </p>
                </div>
              </div>

              <!-- 操作按钮 -->
              <div class="flex items-center space-x-2 ml-4">
                <button
                  @click="previewFile(file)"
                  class="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="预览"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                </button>
                <button
                  @click="downloadFile(file)"
                  class="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  title="下载"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                </button>
                <div class="relative">
                  <button
                    @click="toggleFileMenu(file.id)"
                    class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/>
                    </svg>
                  </button>
                  
                  <!-- 下拉菜单 -->
                  <div
                    v-if="activeFileMenu === file.id"
                    class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10"
                  >
                    <button
                      @click="editFile(file)"
                      class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                      </svg>
                      编辑信息
                    </button>
                    <button
                      @click="deleteFile(file.id)"
                      class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                    >
                      <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                      删除
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="filteredFiles.length === 0" class="text-center py-16">
        <div class="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">没有找到资料</h3>
        <p class="text-gray-500 mb-6">尝试调整搜索条件或上传新的资料</p>
        <button
          @click="showUploadModal = true"
          class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
          </svg>
          上传资料
        </button>
      </div>
    </div>

    <!-- 上传模态框 -->
    <div v-if="showUploadModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
        <div class="p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">上传新资料</h3>
            <button
              @click="showUploadModal = false"
              class="text-gray-400 hover:text-gray-600"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          
          <!-- 拖拽上传区域 -->
          <div class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
            </svg>
            <p class="text-gray-600 mb-2">点击选择文件或拖拽到此处</p>
            <p class="text-sm text-gray-500">支持 PDF、DOC、DOCX、XLS、XLSX 等格式</p>
            <input type="file" class="hidden" multiple />
            <button class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              选择文件
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

// 模拟数据
const mockFiles = [
  {
    id: '1',
    name: '地基验收记录',
    type: '验收记录', 
    size: '1.2MB',
    date: '2025-11-12',
    status: '已完成',
    description: '2号楼基础工程验收记录，经过严格检验符合标准'
  },
  {
    id: '2',
    name: '混凝土抗压强度报告',
    type: '检测报告',
    size: '2.5MB', 
    date: '2025-11-11',
    status: '待审核',
    description: '3号楼二层混凝土抗压强度检测报告'
  },
  {
    id: '3',
    name: '钢筋进场检验记录',
    type: '检验记录',
    size: '0.8MB',
    date: '2025-11-10',
    status: '紧急',
    description: '钢筋进场检验记录，需要立即审核处理'
  },
  {
    id: '4',  
    name: '模板安装验收记录',
    type: '验收记录',
    size: '1.5MB',
    date: '2025-11-09',
    status: '已完成',
    description: '模板安装工程验收记录，安装质量良好'
  }
]

// 响应式数据
const files = ref(mockFiles)
const searchQuery = ref('')
const selectedCategory = ref('')
const selectedStatus = ref('')
const activeFileMenu = ref<string | null>(null)
const showUploadModal = ref(false)

// 计算属性
const totalFiles = computed(() => files.value.length)

const filteredFiles = computed(() => {
  let result = files.value

  // 搜索筛选
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(file => 
      file.name.toLowerCase().includes(query) ||
      file.type.toLowerCase().includes(query) ||
      (file.description && file.description.toLowerCase().includes(query))
    )
  }

  // 分类筛选
  if (selectedCategory.value) {
    result = result.filter(file => file.type === selectedCategory.value)
  }

  // 状态筛选
  if (selectedStatus.value) {
    result = result.filter(file => file.status === selectedStatus.value)
  }

  return result
})

// 方法
const resetFilters = () => {
  searchQuery.value = ''
  selectedCategory.value = ''
  selectedStatus.value = ''
}

const toggleFileMenu = (fileId: string) => {
  activeFileMenu.value = activeFileMenu.value === fileId ? null : fileId
}

const previewFile = (file: any) => {
  console.log('Preview file:', file)
  activeFileMenu.value = null
}

const downloadFile = (file: any) => {
  console.log('Download file:', file)
  activeFileMenu.value = null
}

const editFile = (file: any) => {
  console.log('Edit file:', file)
  activeFileMenu.value = null
}

const deleteFile = (fileId: string) => {
  if (confirm('确定要删除这个文件吗？')) {
    files.value = files.value.filter(f => f.id !== fileId)
  }
  activeFileMenu.value = null
}

// 点击外部关闭菜单
onMounted(() => {
  document.addEventListener('click', (e) => {
    if (!(e.target as Element).closest('[data-file-menu]')) {
      activeFileMenu.value = null
    }
  })
})

// 页面标题
useHead({
  title: '资料管理 - 工地资料管理系统'
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;  
  overflow: hidden;
}
</style>
