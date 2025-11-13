<template>
  <div class="bg-white/70 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 p-6">
    <div class="flex items-center space-x-2 mb-6">
      <div class="w-6 h-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
        <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
        </svg>
      </div>
      <h2 class="text-lg font-semibold text-gray-900">智能文件上传</h2>
    </div>
    
    <!-- Upload Area -->
    <div
      ref="dropZone"
      @drop="handleDrop"
      @dragover.prevent
      @dragenter="isDragOver = true"
      @dragleave="isDragOver = false"
      class="relative border-2 border-dashed rounded-xl p-10 text-center transition-all duration-300 cursor-pointer group"
      :class="{
        'border-blue-400 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-inner': isDragOver,
        'border-gray-300 hover:border-gray-400 hover:bg-gray-50/50': !isDragOver
      }"
      @click="$refs.fileInput?.click()"
    >
      <div class="space-y-5">
        <div class="relative">
          <div class="w-16 h-16 mx-auto bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center transition-transform group-hover:scale-105"
               :class="{ 'animate-bounce': isDragOver }">
            <svg class="w-8 h-8 transition-colors" :class="isDragOver ? 'text-blue-600' : 'text-gray-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
        </div>
        
        <div class="space-y-2">
          <p class="text-xl font-semibold text-gray-900">
            {{ isDragOver ? '释放文件开始上传' : '拖拽文件到这里' }}
          </p>
          <p class="text-sm text-gray-500">
            或点击此处选择文件，支持多文件同时上传
          </p>
          <div class="flex items-center justify-center space-x-4 text-xs text-gray-400 pt-2">
            <span class="flex items-center space-x-1">
              <div class="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
              <span>代码文件</span>
            </span>
            <span class="flex items-center space-x-1">
              <div class="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
              <span>文档</span>
            </span>
            <span class="flex items-center space-x-1">
              <div class="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
              <span>图片</span>
            </span>
            <span class="flex items-center space-x-1">
              <div class="w-1.5 h-1.5 bg-orange-400 rounded-full"></div>
              <span>其他</span>
            </span>
          </div>
        </div>
        
        <div>
          <input
            ref="fileInput"
            type="file"
            multiple
            @change="handleFileSelect"
            class="hidden"
            accept=".js,.jsx,.ts,.tsx,.vue,.py,.java,.c,.cpp,.h,.hpp,.css,.scss,.html,.xml,.json,.yaml,.yml,.md,.txt,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.7z,.tar,.png,.jpg,.jpeg,.gif,.svg,.mp4,.mp3,.wav"
          >
          <button
            type="button"
            class="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            @click.stop="$refs.fileInput?.click()"
          >
            <span class="flex items-center space-x-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
              <span>选择文件</span>
            </span>
          </button>
        </div>
      </div>
      
      <!-- Decorative elements -->
      <div class="absolute top-4 right-4 opacity-20">
        <svg class="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
        </svg>
      </div>
    </div>
    
    <!-- Upload Progress -->
    <div v-if="uploading.length > 0" class="mt-6">
      <div class="flex items-center space-x-2 mb-4">
        <div class="w-4 h-4 bg-emerald-100 rounded flex items-center justify-center">
          <svg class="w-2.5 h-2.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
          </svg>
        </div>
        <h3 class="text-sm font-medium text-gray-900">上传进度</h3>
      </div>
      <div class="space-y-3">
        <div
          v-for="upload in uploading"
          :key="upload.id"
          class="bg-white/50 rounded-lg p-4 border border-gray-200/50"
        >
          <div class="flex items-center space-x-3">
            <div class="flex-1">
              <div class="flex items-center justify-between text-sm mb-2">
                <span class="font-medium text-gray-900 truncate">{{ upload.name }}</span>
                <span class="text-sm font-medium text-gray-600 ml-2">{{ upload.progress }}%</span>
              </div>
              <div class="relative bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  class="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500 ease-out"
                  :style="{ width: `${upload.progress}%` }"
                ></div>
                <div class="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
              </div>
            </div>
            
            <button
              @click="cancelUpload(upload.id)"
              class="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- File Type Filters -->
    <div class="mt-6">
      <div class="flex items-center space-x-2 mb-4">
        <div class="w-4 h-4 bg-purple-100 rounded flex items-center justify-center">
          <svg class="w-2.5 h-2.5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z"/>
          </svg>
        </div>
        <h3 class="text-sm font-medium text-gray-900">智能筛选</h3>
      </div>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="filter in fileFilters"
          :key="filter.type"
          @click="setFileFilter(filter.extensions)"
          class="group relative px-4 py-2 text-xs font-medium rounded-xl border transition-all duration-200 hover:shadow-md"
          :class="{
            'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-blue-200 shadow-sm': selectedFilter === filter.extensions.join(','),
            'bg-white/70 text-gray-700 border-gray-200 hover:bg-white hover:border-gray-300': selectedFilter !== filter.extensions.join(',')
          }"
        >
          <span class="flex items-center space-x-1.5">
            <div class="w-1.5 h-1.5 rounded-full" :class="{
              'bg-green-400': filter.type === 'code',
              'bg-blue-400': filter.type === 'document',
              'bg-amber-400': filter.type === 'data',
              'bg-purple-400': filter.type === 'image',
              'bg-orange-400': filter.type === 'archive'
            }"></div>
            <span>{{ filter.label }}</span>
          </span>
          <div v-if="selectedFilter === filter.extensions.join(',')" 
               class="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
            <svg class="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
            </svg>
          </div>
        </button>
        <button
          @click="clearFileFilter"
          class="px-4 py-2 text-xs font-medium rounded-xl border bg-white/70 text-gray-700 border-gray-200 hover:bg-white hover:border-gray-300 transition-all duration-200 hover:shadow-md"
        >
          <span class="flex items-center space-x-1.5">
            <div class="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
            <span>全部类型</span>
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FileInfo } from '~/types'
import { generateFileId, getFileCategory, formatFileSize } from '~/utils/fileUtils'

// Emits
const emit = defineEmits<{
  uploaded: [file: FileInfo]
}>()

// Reactive state
const isDragOver = ref(false)
const uploading = ref<Array<{
  id: string
  name: string
  progress: number
  controller: AbortController
}>>([])
const selectedFilter = ref('')

// File filters
const fileFilters = [
  { type: 'code', label: '代码文件', extensions: ['.js', '.jsx', '.ts', '.tsx', '.vue', '.py', '.java', '.c', '.cpp', '.css', '.html'] },
  { type: 'document', label: '文档', extensions: ['.txt', '.md', '.pdf', '.doc', '.docx'] },
  { type: 'data', label: '数据文件', extensions: ['.json', '.xml', '.yaml', '.yml', '.csv', '.xls', '.xlsx'] },
  { type: 'image', label: '图片', extensions: ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'] },
  { type: 'archive', label: '压缩文件', extensions: ['.zip', '.rar', '.7z', '.tar'] }
]

// Methods
const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  isDragOver.value = false
  
  const files = Array.from(event.dataTransfer?.files || [])
  if (files.length > 0) {
    uploadFiles(files)
  }
}

const handleFileSelect = (event: Event) => {
  const input = event.target as HTMLInputElement
  const files = Array.from(input.files || [])
  if (files.length > 0) {
    uploadFiles(files)
  }
  // Reset input
  input.value = ''
}

const uploadFiles = async (files: File[]) => {
  for (const file of files) {
    await uploadFile(file)
  }
}

const uploadFile = async (file: File) => {
  const uploadId = generateFileId()
  const controller = new AbortController()
  
  // Add to uploading list
  uploading.value.push({
    id: uploadId,
    name: file.name,
    progress: 0,
    controller
  })
  
  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('uploadId', uploadId)
    
    const response = await $fetch('/api/upload', {
      method: 'POST',
      body: formData,
      signal: controller.signal,
      onUploadProgress: (progress) => {
        const uploadIndex = uploading.value.findIndex(u => u.id === uploadId)
        if (uploadIndex !== -1) {
          uploading.value[uploadIndex].progress = Math.round((progress.loaded / progress.total) * 100)
        }
      }
    }) as FileInfo
    
    // Remove from uploading list
    uploading.value = uploading.value.filter(u => u.id !== uploadId)
    
    // Emit uploaded event
    emit('uploaded', response)
    
  } catch (error: any) {
    if (error.name !== 'AbortError') {
      console.error('Upload error:', error)
      // Handle error - could emit an error event or show toast
    }
    
    // Remove from uploading list
    uploading.value = uploading.value.filter(u => u.id !== uploadId)
  }
}

const cancelUpload = (uploadId: string) => {
  const upload = uploading.value.find(u => u.id === uploadId)
  if (upload) {
    upload.controller.abort()
    uploading.value = uploading.value.filter(u => u.id !== uploadId)
  }
}

const setFileFilter = (extensions: string[]) => {
  selectedFilter.value = extensions.join(',')
  const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
  if (fileInput) {
    fileInput.accept = extensions.join(',')
  }
}

const clearFileFilter = () => {
  selectedFilter.value = ''
  const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
  if (fileInput) {
    fileInput.accept = '.js,.jsx,.ts,.tsx,.vue,.py,.java,.c,.cpp,.h,.hpp,.css,.scss,.html,.xml,.json,.yaml,.yml,.md,.txt,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.7z,.tar,.png,.jpg,.jpeg,.gif,.svg,.mp4,.mp3,.wav'
  }
}

// Cleanup on unmount
onUnmounted(() => {
  uploading.value.forEach(upload => {
    upload.controller.abort()
  })
})
</script>
