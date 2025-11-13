<template>
  <div class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex min-h-screen items-center justify-center px-4 py-6">
      <!-- Backdrop -->
      <div 
        class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        @click="$emit('close')"
      ></div>
      
      <!-- Modal -->
      <div class="relative bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <!-- Header -->
        <div class="flex items-center justify-between p-6 border-b border-gray-200">
          <div class="flex items-center space-x-3">
            <div
              class="w-8 h-8 rounded-lg flex items-center justify-center"
              :class="getFileIconStyle(file.category)"
            >
              <component :is="getFileIcon(file.category)" class="w-4 h-4" />
            </div>
            <div>
              <h2 class="text-lg font-semibold text-gray-900">{{ file.originalName }}</h2>
              <p class="text-sm text-gray-500">{{ formatFileSize(file.size) }} • {{ getCategoryLabel(file.category) }}</p>
            </div>
          </div>
          
          <div class="flex items-center space-x-2">
            <!-- Download Button -->
            <a
              :href="`/api/files/${file.id}/download`"
              download
              class="px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              下载
            </a>
            
            <!-- Close Button -->
            <button
              @click="$emit('close')"
              class="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <!-- Content -->
        <div class="flex h-[calc(90vh-80px)]">
          <!-- Left Panel: File Content -->
          <div class="flex-1 overflow-auto">
            <!-- Image Preview -->
            <div v-if="file.category === 'image'" class="p-6 flex items-center justify-center">
              <img
                :src="`/api/files/${file.id}/content`"
                :alt="file.originalName"
                class="max-w-full max-h-full object-contain rounded-lg shadow-lg"
              />
            </div>
            
            <!-- Code/Text Preview -->
            <div v-else-if="isPreviewable(file)" class="h-full flex flex-col">
              <div class="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
                <div class="flex items-center space-x-2">
                  <span class="text-sm font-medium text-gray-700">
                    {{ file.analysis?.language || 'Text' }}
                  </span>
                  <span v-if="lineCount > 0" class="text-sm text-gray-500">
                    {{ lineCount }} 行
                  </span>
                </div>
                
                <div class="flex items-center space-x-2">
                  <!-- Line Numbers Toggle -->
                  <button
                    @click="showLineNumbers = !showLineNumbers"
                    class="px-2 py-1 text-xs font-medium rounded"
                    :class="showLineNumbers ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'"
                  >
                    行号
                  </button>
                  
                  <!-- Word Wrap Toggle -->
                  <button
                    @click="wordWrap = !wordWrap"
                    class="px-2 py-1 text-xs font-medium rounded"
                    :class="wordWrap ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'"
                  >
                    自动换行
                  </button>
                </div>
              </div>
              
              <div class="flex-1 overflow-auto">
                <pre
                  class="code-editor text-sm p-4 h-full"
                  :class="{ 'whitespace-pre-wrap': wordWrap, 'whitespace-pre': !wordWrap }"
                  v-html="highlightedContent"
                ></pre>
              </div>
            </div>
            
            <!-- Other File Types -->
            <div v-else class="p-6 text-center">
              <div class="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-lg flex items-center justify-center">
                <component :is="getFileIcon(file.category)" class="w-8 h-8 text-gray-400" />
              </div>
              <h3 class="text-lg font-medium text-gray-900 mb-2">无法预览此文件类型</h3>
              <p class="text-gray-500 mb-4">{{ file.originalName }} 不支持在线预览</p>
              <a
                :href="`/api/files/${file.id}/download`"
                download
                class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                下载文件
              </a>
            </div>
          </div>
          
          <!-- Right Panel: Analysis & Errors -->
          <div v-if="file.analysis || (file.errors && file.errors.length > 0)" class="w-80 border-l border-gray-200 bg-gray-50 overflow-auto">
            <!-- Analysis Results -->
            <div v-if="file.analysis" class="p-4 border-b border-gray-200">
              <h3 class="text-sm font-semibold text-gray-900 mb-3">AI 分析结果</h3>
              
              <div class="space-y-3">
                <!-- Summary -->
                <div>
                  <h4 class="text-xs font-medium text-gray-700 mb-1">摘要</h4>
                  <p class="text-sm text-gray-600">{{ file.analysis.summary }}</p>
                </div>
                
                <!-- Complexity -->
                <div>
                  <h4 class="text-xs font-medium text-gray-700 mb-1">复杂度</h4>
                  <span
                    class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                    :class="getComplexityStyle(file.analysis.complexity)"
                  >
                    {{ getComplexityLabel(file.analysis.complexity) }}
                  </span>
                </div>
                
                <!-- Metrics -->
                <div v-if="file.analysis.metrics" class="grid grid-cols-2 gap-2">
                  <div v-if="file.analysis.metrics.linesOfCode" class="text-center p-2 bg-white rounded">
                    <div class="text-lg font-semibold text-gray-900">{{ file.analysis.metrics.linesOfCode }}</div>
                    <div class="text-xs text-gray-500">代码行</div>
                  </div>
                  <div v-if="file.analysis.metrics.functions" class="text-center p-2 bg-white rounded">
                    <div class="text-lg font-semibold text-gray-900">{{ file.analysis.metrics.functions }}</div>
                    <div class="text-xs text-gray-500">函数</div>
                  </div>
                  <div v-if="file.analysis.metrics.classes" class="text-center p-2 bg-white rounded">
                    <div class="text-lg font-semibold text-gray-900">{{ file.analysis.metrics.classes }}</div>
                    <div class="text-xs text-gray-500">类</div>
                  </div>
                  <div v-if="file.analysis.metrics.comments" class="text-center p-2 bg-white rounded">
                    <div class="text-lg font-semibold text-gray-900">{{ file.analysis.metrics.comments }}</div>
                    <div class="text-xs text-gray-500">注释</div>
                  </div>
                </div>
                
                <!-- Suggestions -->
                <div v-if="file.analysis.suggestions && file.analysis.suggestions.length > 0">
                  <h4 class="text-xs font-medium text-gray-700 mb-2">建议</h4>
                  <ul class="space-y-1">
                    <li
                      v-for="(suggestion, index) in file.analysis.suggestions"
                      :key="index"
                      class="text-sm text-gray-600 flex items-start space-x-2"
                    >
                      <span class="text-blue-500 mt-1">•</span>
                      <span>{{ suggestion }}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            
            <!-- Error List -->
            <div v-if="file.errors && file.errors.length > 0" class="p-4">
              <h3 class="text-sm font-semibold text-gray-900 mb-3">
                发现的问题 ({{ file.errors.length }})
              </h3>
              
              <div class="space-y-2">
                <div
                  v-for="(error, index) in file.errors"
                  :key="index"
                  class="p-3 bg-white rounded-lg border"
                  :class="{
                    'border-red-200 bg-red-50': error.severity === 'error',
                    'border-yellow-200 bg-yellow-50': error.severity === 'warning',
                    'border-blue-200 bg-blue-50': error.severity === 'info'
                  }"
                >
                  <div class="flex items-start justify-between">
                    <div class="flex-1">
                      <div class="flex items-center space-x-2 mb-1">
                        <span
                          class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium"
                          :class="{
                            'bg-red-100 text-red-800': error.severity === 'error',
                            'bg-yellow-100 text-yellow-800': error.severity === 'warning',
                            'bg-blue-100 text-blue-800': error.severity === 'info'
                          }"
                        >
                          {{ error.severity }}
                        </span>
                        <span class="text-xs text-gray-500">
                          行 {{ error.line }}{{ error.column ? `, 列 ${error.column}` : '' }}
                        </span>
                      </div>
                      <p class="text-sm text-gray-700">{{ error.message }}</p>
                      <p v-if="error.rule" class="text-xs text-gray-500 mt-1">
                        规则: {{ error.rule }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FileInfo, FileCategory } from '~/types'
import { formatFileSize } from '~/utils/fileUtils'

// Props
const props = defineProps<{
  file: FileInfo
}>()

// Emits
defineEmits<{
  close: []
}>()

// Reactive state
const showLineNumbers = ref(true)
const wordWrap = ref(false)
const fileContent = ref('')
const lineCount = ref(0)

// Computed
const highlightedContent = computed(() => {
  if (!fileContent.value) return ''
  
  // Simple syntax highlighting (in a real app, you'd use Prism.js or similar)
  let content = fileContent.value
  const lines = content.split('\n')
  lineCount.value = lines.length
  
  if (showLineNumbers.value) {
    content = lines
      .map((line, index) => {
        const lineNum = (index + 1).toString().padStart(4, ' ')
        return `<span class="line-number text-gray-400 select-none mr-4">${lineNum}</span>${line}`
      })
      .join('\n')
  }
  
  return content
})

// Methods
const getFileIcon = (category: FileCategory) => {
  const icons = {
    document: 'DocumentTextIcon',
    code: 'CodeBracketIcon',
    image: 'PhotoIcon',
    video: 'VideoCameraIcon',
    audio: 'SpeakerWaveIcon',
    data: 'TableCellsIcon',
    archive: 'ArchiveBoxIcon',
    other: 'DocumentIcon'
  }
  return icons[category] || icons.other
}

const getFileIconStyle = (category: FileCategory) => {
  const styles = {
    document: 'bg-blue-100 text-blue-600',
    code: 'bg-green-100 text-green-600',
    image: 'bg-purple-100 text-purple-600',
    video: 'bg-red-100 text-red-600',
    audio: 'bg-yellow-100 text-yellow-600',
    data: 'bg-indigo-100 text-indigo-600',
    archive: 'bg-gray-100 text-gray-600',
    other: 'bg-gray-100 text-gray-600'
  }
  return styles[category] || styles.other
}

const getCategoryLabel = (category: FileCategory) => {
  const labels = {
    document: '文档',
    code: '代码',
    image: '图片',
    video: '视频',
    audio: '音频',
    data: '数据',
    archive: '压缩包',
    other: '其他'
  }
  return labels[category] || labels.other
}

const getComplexityStyle = (complexity: 'low' | 'medium' | 'high') => {
  const styles = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800'
  }
  return styles[complexity]
}

const getComplexityLabel = (complexity: 'low' | 'medium' | 'high') => {
  const labels = {
    low: '简单',
    medium: '中等',
    high: '复杂'
  }
  return labels[complexity]
}

const isPreviewable = (file: FileInfo) => {
  const previewableCategories = ['code', 'document']
  const previewableTypes = ['text/', 'application/json', 'application/xml']
  
  if (previewableCategories.includes(file.category)) return true
  if (previewableTypes.some(type => file.type.startsWith(type))) return true
  
  return false
}

// Load file content for preview
const loadFileContent = async () => {
  if (!isPreviewable(props.file)) return
  
  try {
    const response = await $fetch(`/api/files/${props.file.id}/content`)
    fileContent.value = response.content || ''
  } catch (error) {
    console.error('Failed to load file content:', error)
    fileContent.value = '无法加载文件内容'
  }
}

// Load content on mount
onMounted(() => {
  loadFileContent()
})
</script>

<style scoped>
.line-number {
  display: inline-block;
  width: 3rem;
  text-align: right;
}

.code-editor {
  tab-size: 2;
}
</style>
