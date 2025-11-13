<template>
  <div class="group bg-white/60 backdrop-blur-sm border border-gray-200/60 rounded-xl p-5 hover:shadow-lg hover:bg-white/80 transition-all duration-300 hover:-translate-y-0.5">
    <div class="flex items-start justify-between">
      <!-- File Info -->
      <div class="flex items-start space-x-4 flex-1">
        <!-- File Icon -->
        <div class="flex-shrink-0">
          <div class="relative">
            <div
              class="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm transition-transform group-hover:scale-105"
              :class="getFileIconStyle(file.category)"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" v-if="file.category === 'document'">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" v-else-if="file.category === 'code'">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
              </svg>
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" v-else-if="file.category === 'image'">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" v-else-if="file.category === 'data'">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2z"/>
              </svg>
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" v-else-if="file.category === 'archive'">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10"/>
              </svg>
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" v-else>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
            </div>
            <!-- Analysis status indicator -->
            <div v-if="file.analysis" class="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
              <svg class="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
          </div>
        </div>
        
        <!-- File Details -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center space-x-3 mb-2">
            <h3 class="text-base font-semibold text-gray-900 truncate">
              {{ file.originalName }}
            </h3>
            <span
              class="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border"
              :class="getCategoryStyle(file.category)"
            >
              {{ getCategoryLabel(file.category) }}
            </span>
          </div>
          
          <div class="flex items-center space-x-4 text-xs text-gray-500 mb-3">
            <span class="flex items-center space-x-1">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
              </svg>
              <span>{{ formatFileSize(file.size) }}</span>
            </span>
            <span class="flex items-center space-x-1">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span>{{ formatDate(file.uploadedAt) }}</span>
            </span>
            <span v-if="file.analysis?.language" class="flex items-center space-x-1 text-blue-600 font-medium">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
              </svg>
              <span>{{ file.analysis.language }}</span>
            </span>
          </div>
          
          <!-- Analysis Summary -->
          <div v-if="file.analysis" class="mt-3 space-y-3">
            <!-- Main Analysis Card -->
            <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center space-x-2">
                  <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                  </svg>
                  <span class="text-sm font-semibold text-blue-700">AI 深度分析</span>
                </div>
                <div v-if="file.analysis.qualityScore" class="flex items-center space-x-1">
                  <span class="text-xs text-gray-500">质量评分:</span>
                  <div class="flex items-center space-x-1">
                    <div class="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        class="h-full rounded-full transition-all duration-300"
                        :class="getQualityScoreColor(file.analysis.qualityScore)"
                        :style="{ width: `${file.analysis.qualityScore * 10}%` }"
                      ></div>
                    </div>
                    <span class="text-xs font-medium" :class="getQualityScoreTextColor(file.analysis.qualityScore)">
                      {{ file.analysis.qualityScore.toFixed(1) }}
                    </span>
                  </div>
                </div>
              </div>
              
              <p class="text-sm text-gray-700 line-clamp-3 mb-3">
                {{ file.analysis.summary }}
              </p>
              
              <!-- Status Indicators -->
              <div class="flex items-center flex-wrap gap-2 mb-3">
                <span
                  class="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border"
                  :class="getComplexityStyle(file.analysis.complexity)"
                >
                  <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                  </svg>
                  复杂度: {{ getComplexityLabel(file.analysis.complexity) }}
                </span>
                
                <span
                  v-if="file.analysis.securityRisk"
                  class="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border"
                  :class="getSecurityRiskStyle(file.analysis.securityRisk)"
                >
                  <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                  </svg>
                  安全: {{ getSecurityRiskLabel(file.analysis.securityRisk) }}
                </span>

                <span
                  v-if="file.analysis.maintainability"
                  class="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border"
                  :class="getMaintainabilityStyle(file.analysis.maintainability)"
                >
                  <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                  可维护性: {{ getMaintainabilityLabel(file.analysis.maintainability) }}
                </span>

                <!-- Error Count -->
                <span
                  v-if="file.errors && file.errors.length > 0"
                  class="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-red-100 text-red-800 border border-red-200"
                >
                  <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                  </svg>
                  {{ file.errors.length }} 个问题
                </span>
              </div>

              <!-- Technologies and Keywords -->
              <div v-if="file.analysis.technologies?.length || file.analysis.keywords?.length" class="space-y-2">
                <div v-if="file.analysis.technologies?.length" class="flex items-center flex-wrap gap-1">
                  <span class="text-xs text-gray-500 mr-1">技术栈:</span>
                  <span
                    v-for="tech in file.analysis.technologies.slice(0, 3)"
                    :key="tech"
                    class="inline-flex items-center px-2 py-0.5 rounded text-xs bg-indigo-100 text-indigo-700"
                  >
                    {{ tech }}
                  </span>
                  <span v-if="file.analysis.technologies.length > 3" class="text-xs text-gray-400">
                    +{{ file.analysis.technologies.length - 3 }}
                  </span>
                </div>
                
                <div v-if="file.analysis.keywords?.length" class="flex items-center flex-wrap gap-1">
                  <span class="text-xs text-gray-500 mr-1">关键词:</span>
                  <span
                    v-for="keyword in file.analysis.keywords.slice(0, 4)"
                    :key="keyword"
                    class="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600"
                  >
                    {{ keyword }}
                  </span>
                  <span v-if="file.analysis.keywords.length > 4" class="text-xs text-gray-400">
                    +{{ file.analysis.keywords.length - 4 }}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Error Preview -->
          <div v-if="file.errors && file.errors.length > 0" class="mt-3">
            <div class="bg-red-50/80 backdrop-blur-sm border border-red-200/80 rounded-lg p-4">
              <div class="flex items-center space-x-2 mb-3">
                <div class="w-4 h-4 bg-red-100 rounded-full flex items-center justify-center">
                  <svg class="w-2.5 h-2.5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01"/>
                  </svg>
                </div>
                <h4 class="text-sm font-medium text-red-800">检测到的问题</h4>
              </div>
              <div class="space-y-2">
                <div
                  v-for="(error, index) in file.errors.slice(0, 3)"
                  :key="index"
                  class="flex items-start space-x-2 text-sm"
                >
                  <span class="inline-flex items-center justify-center w-5 h-5 bg-red-200 text-red-700 rounded text-xs font-medium">
                    {{ error.line }}
                  </span>
                  <span class="text-red-700 flex-1">{{ error.message }}</span>
                </div>
                <div v-if="file.errors.length > 3" class="text-sm text-red-600 italic pl-7">
                  还有 {{ file.errors.length - 3 }} 个问题，点击预览查看全部...
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Actions -->
      <div class="flex flex-col items-end space-y-2">
        <!-- Primary Action -->
        <button
          v-if="!file.analysis"
          @click="$emit('analyze', file.id)"
          class="group relative px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-medium shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:-translate-y-0.5"
        >
          <span class="flex items-center space-x-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
            </svg>
            <span>AI分析</span>
          </span>
        </button>
        
        <!-- Re-analyze Button -->
        <button
          v-else
          @click="$emit('analyze', file.id)"
          class="group relative px-4 py-2 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl text-sm font-medium shadow-lg hover:shadow-xl hover:from-emerald-700 hover:to-green-700 transition-all duration-200 transform hover:-translate-y-0.5"
        >
          <span class="flex items-center space-x-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            <span>重新分析</span>
          </span>
        </button>
        
        <!-- Secondary Actions -->
        <div class="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <!-- Preview Button -->
          <button
            @click="$emit('preview', file.id)"
            class="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200"
            title="预览文件"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
            </svg>
          </button>
          
          <!-- Download Button -->
          <button
            @click="downloadFile(file)"
            class="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
            title="下载文件"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
          </button>
          
          <!-- Delete Button -->
          <button
            @click="$emit('delete', file.id)"
            class="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
            title="删除文件"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
          </button>
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
  analyze: [fileId: string]
  preview: [fileId: string]
  delete: [fileId: string]
}>()

// File icon components (using Heroicons)
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

// File icon styles
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

// Category styles
const getCategoryStyle = (category: FileCategory) => {
  const styles = {
    document: 'bg-blue-100 text-blue-800',
    code: 'bg-green-100 text-green-800',
    image: 'bg-purple-100 text-purple-800',
    video: 'bg-red-100 text-red-800',
    audio: 'bg-yellow-100 text-yellow-800',
    data: 'bg-indigo-100 text-indigo-800',
    archive: 'bg-gray-100 text-gray-800',
    other: 'bg-gray-100 text-gray-800'
  }
  return styles[category] || styles.other
}

// Category labels
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

// Complexity styles
const getComplexityStyle = (complexity: 'low' | 'medium' | 'high') => {
  const styles = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800'
  }
  return styles[complexity]
}

// Complexity labels
const getComplexityLabel = (complexity: 'low' | 'medium' | 'high') => {
  const labels = {
    low: '简单',
    medium: '中等',
    high: '复杂'
  }
  return labels[complexity]
}

// Format date
const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Download file
const downloadFile = (file: FileInfo) => {
  window.open(`/api/files/${file.id}/download`, '_blank')
}

// Quality score styling
const getQualityScoreColor = (score: number) => {
  if (score >= 8) return 'bg-emerald-500'
  if (score >= 6) return 'bg-yellow-500'
  return 'bg-red-500'
}

const getQualityScoreTextColor = (score: number) => {
  if (score >= 8) return 'text-emerald-600'
  if (score >= 6) return 'text-yellow-600'
  return 'text-red-600'
}

// Security risk styling
const getSecurityRiskStyle = (risk: 'low' | 'medium' | 'high') => {
  const styles = {
    low: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    high: 'bg-red-100 text-red-800 border-red-200'
  }
  return styles[risk]
}

const getSecurityRiskLabel = (risk: 'low' | 'medium' | 'high') => {
  const labels = {
    low: '低风险',
    medium: '中风险',
    high: '高风险'
  }
  return labels[risk]
}

// Maintainability styling
const getMaintainabilityStyle = (maintainability: 'excellent' | 'good' | 'fair' | 'poor') => {
  const styles = {
    excellent: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    good: 'bg-blue-100 text-blue-800 border-blue-200',
    fair: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    poor: 'bg-red-100 text-red-800 border-red-200'
  }
  return styles[maintainability]
}

const getMaintainabilityLabel = (maintainability: 'excellent' | 'good' | 'fair' | 'poor') => {
  const labels = {
    excellent: '优秀',
    good: '良好',
    fair: '一般',
    poor: '较差'
  }
  return labels[maintainability]
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
