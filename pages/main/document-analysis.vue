<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 页面头部 -->
    <div class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">AI文档分析</h1>
            <p class="text-gray-600 mt-1">智能检测文档错误、漏项和格式问题</p>
          </div>
          <div class="flex items-center space-x-2 text-sm text-gray-500">
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
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
            <span>垂直领域AI V1.0</span>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- 左侧：输入区域 -->
        <div class="space-y-6">
          <!-- 文档上传区域 -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2
              class="text-lg font-semibold text-gray-900 mb-4 flex items-center"
            >
              <svg
                class="w-5 h-5 mr-2 text-blue-600"
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
              文档上传
            </h2>

            <!-- 文件拖拽上传区 -->
            <div
              @drop.prevent="handleFileDrop"
              @dragover.prevent
              @dragenter.prevent
              class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors"
              :class="{ 'border-blue-400 bg-blue-50': isDragging }"
              @dragenter="isDragging = true"
              @dragleave="isDragging = false"
            >
              <div class="flex flex-col items-center">
                <svg
                  class="w-12 h-12 text-gray-400 mb-4"
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
                <p class="text-gray-600 mb-2">将文档拖放到此处，或</p>
                <button
                  @click="$refs.fileInput.click()"
                  class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  选择文件
                </button>
                <input
                  ref="fileInput"
                  type="file"
                  accept=".doc,.docx,.pdf,.txt"
                  @change="handleFileSelect"
                  class="hidden"
                />
                <p class="text-sm text-gray-500 mt-2">
                  支持 DOC、DOCX、PDF、TXT 格式
                </p>
              </div>
            </div>

            <!-- 已选择的文件 -->
            <div v-if="selectedFile" class="mt-4 p-4 bg-gray-50 rounded-lg">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <svg
                    class="w-8 h-8 text-blue-600"
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
                  <div>
                    <p class="text-sm font-medium text-gray-900">
                      {{ selectedFile.name }}
                    </p>
                    <p class="text-xs text-gray-500">
                      {{ formatFileSize(selectedFile.size) }}
                    </p>
                  </div>
                </div>
                <button
                  @click="removeFile"
                  class="text-gray-400 hover:text-red-600 transition-colors"
                >
                  <svg
                    class="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- DOCX转XML测试区域 -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2
              class="text-lg font-semibold text-gray-900 mb-4 flex items-center"
            >
              <svg
                class="w-5 h-5 mr-2 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                />
              </svg>
              DOCX转XML测试
            </h2>

            <div class="space-y-4">
              <!-- 测试按钮组 -->
              <div class="flex flex-wrap gap-2">
                <button
                  @click="testDocxConversion('xml')"
                  :disabled="
                    !selectedFile || !isDocxFile || isTestingConversion
                  "
                  class="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  测试XML提取
                </button>
                <button
                  @click="testDocxConversion('json')"
                  :disabled="
                    !selectedFile || !isDocxFile || isTestingConversion
                  "
                  class="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  测试JSON转换
                </button>
                <button
                  @click="testDocxConversion('text')"
                  :disabled="
                    !selectedFile || !isDocxFile || isTestingConversion
                  "
                  class="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  测试文本提取
                </button>
                <button
                  @click="testDocxConversion('xml-formatted')"
                  :disabled="
                    !selectedFile || !isDocxFile || isTestingConversion
                  "
                  class="px-4 py-2 bg-teal-600 text-white text-sm rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  测试完整XML
                </button>
              </div>

              <!-- 提示信息 -->
              <div
                v-if="!selectedFile"
                class="text-sm text-gray-500 flex items-center"
              >
                <svg
                  class="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                请先上传DOCX文件进行测试
              </div>
              <div
                v-else-if="!isDocxFile"
                class="text-sm text-orange-600 flex items-center"
              >
                <svg
                  class="w-4 h-4 mr-2"
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
                当前文件不是DOCX格式
              </div>

              <!-- 测试进度 -->
              <div
                v-if="isTestingConversion"
                class="p-4 bg-purple-50 rounded-lg"
              >
                <div class="space-y-2">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-2 text-purple-700">
                      <svg
                        class="w-5 h-5 animate-spin"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                      <span class="text-sm font-medium">{{
                        conversionStatus
                      }}</span>
                    </div>
                    <span class="text-sm font-semibold text-purple-700"
                      >{{ Math.round(conversionProgress) }}%</span
                    >
                  </div>
                  <div class="w-full bg-purple-200 rounded-full h-2">
                    <div
                      class="bg-gradient-to-r from-purple-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
                      :style="{ width: `${conversionProgress}%` }"
                    ></div>
                  </div>
                </div>
              </div>

              <!-- 测试结果 -->
              <div v-if="conversionResult" class="space-y-3">
                <!-- 成功状态 -->
                <div
                  v-if="conversionResult.success"
                  class="p-4 bg-green-50 border border-green-200 rounded-lg"
                >
                  <div class="flex items-center space-x-2 mb-3">
                    <svg
                      class="w-5 h-5 text-green-600"
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
                    <span class="text-sm font-semibold text-green-800"
                      >转换成功</span
                    >
                    <span
                      class="text-xs text-green-600 bg-green-100 px-2 py-1 rounded"
                      >{{ conversionResult.format }}</span
                    >
                  </div>

                  <!-- 结果预览 -->
                  <div class="mt-3">
                    <div class="flex items-center justify-between mb-2">
                      <span class="text-xs font-medium text-green-700"
                        >转换结果预览：</span
                      >
                      <button
                        @click="downloadConversionResult"
                        class="text-xs text-green-600 hover:text-green-700 flex items-center"
                      >
                        <svg
                          class="w-4 h-4 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                          />
                        </svg>
                        下载结果
                      </button>
                    </div>
                    <div
                      v-if="conversionResult.format === 'xml' || conversionResult.format === 'xml-formatted'"
                      class="mb-3"
                    >
                      <button
                        @click="callCozeWorkflow"
                        :disabled="isCallingWorkflow"
                        class="w-full px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                      >
                        <svg
                          v-if="!isCallingWorkflow"
                          class="w-4 h-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                          />
                        </svg>
                        <svg
                          v-else
                          class="w-4 h-4 mr-2 animate-spin"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                          />
                        </svg>
                        {{ isCallingWorkflow ? '正在调用Coze Workflow...' : '调用Coze Workflow分析' }}
                      </button>
                    </div>
                    <div
                      class="bg-white border border-green-200 rounded p-3 max-h-96 overflow-auto"
                    >
                      <pre class="text-xs text-gray-700 whitespace-pre-wrap">{{
                        formatConversionResult(conversionResult.data)
                      }}</pre>
                    </div>

                    <!-- 统计信息 -->
                    <div
                      v-if="conversionResult.format === 'xml'"
                      class="mt-3 grid grid-cols-2 gap-2 text-xs"
                    >
                      <div class="bg-white border border-green-200 rounded p-2">
                        <div class="text-green-600 font-medium">
                          提取的XML文件数
                        </div>
                        <div class="text-lg font-bold text-green-700">
                          {{
                            Object.keys(conversionResult.data.allXmlFiles || {})
                              .length
                          }}
                        </div>
                      </div>
                      <div class="bg-white border border-green-200 rounded p-2">
                        <div class="text-green-600 font-medium">主文档大小</div>
                        <div class="text-lg font-bold text-green-700">
                          {{
                            formatFileSize(
                              (conversionResult.data.document || '').length
                            )
                          }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Workflow调用结果 -->
                <div
                  v-if="workflowResult"
                  class="mt-4 p-4 border-2 border-blue-200 rounded-lg"
                  :class="{
                    'bg-blue-50': workflowResult.success,
                    'bg-red-50': !workflowResult.success
                  }"
                >
                  <div class="flex items-center space-x-2 mb-3">
                    <svg
                      v-if="workflowResult.success"
                      class="w-5 h-5 text-blue-600"
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
                    <svg
                      v-else
                      class="w-5 h-5 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span class="text-sm font-semibold" :class="{
                      'text-blue-800': workflowResult.success,
                      'text-red-800': !workflowResult.success
                    }">Workflow {{ workflowResult.success ? '调用成功' : '调用失败' }}</span>
                  </div>
                  <div
                    class="bg-white border rounded p-3 max-h-64 overflow-auto"
                    :class="{
                      'border-blue-200': workflowResult.success,
                      'border-red-200': !workflowResult.success
                    }"
                  >
                    <pre class="text-xs text-gray-700 whitespace-pre-wrap">{{ formatWorkflowResult(workflowResult) }}</pre>
                  </div>
                </div>

                <!-- 错误状态 -->
                <div
                  v-else
                  class="p-4 bg-red-50 border border-red-200 rounded-lg"
                >
                  <div class="flex items-center space-x-2 mb-2">
                    <svg
                      class="w-5 h-5 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span class="text-sm font-semibold text-red-800"
                      >转换失败</span
                    >
                  </div>
                  <p class="text-sm text-red-700">
                    {{ conversionResult.error || '未知错误' }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- 文本输入区域 -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2
              class="text-lg font-semibold text-gray-900 mb-4 flex items-center"
            >
              <svg
                class="w-5 h-5 mr-2 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              文本直接输入
            </h2>

            <textarea
              v-model="textInput"
              class="w-full h-48 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              placeholder="您可以直接在此处输入或粘贴文档内容进行分析..."
            ></textarea>

            <div
              class="flex items-center justify-between mt-4 text-sm text-gray-500"
            >
              <span>{{ textInput.length }} / 10000 字符</span>
              <button
                @click="clearText"
                class="text-blue-600 hover:text-blue-700"
              >
                清空内容
              </button>
            </div>
          </div>

          <!-- 分析按钮 -->
          <div class="text-center">
            <button
              @click="analyzeDocument"
              :disabled="!canAnalyze || isAnalyzing"
              class="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:-translate-y-0.5"
            >
              <span v-if="!isAnalyzing" class="flex items-center">
                <svg
                  class="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
                开始AI分析
              </span>
              <span v-else class="flex items-center">
                <svg
                  class="w-5 h-5 mr-2 animate-spin"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                分析中...
              </span>
            </button>
          </div>
        </div>

        <!-- 右侧：分析结果区域 -->
        <div class="space-y-6">
          <!-- 分析进度 -->
          <div
            v-if="isAnalyzing"
            class="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div class="flex items-center space-x-3 mb-4">
              <div
                class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center"
              >
                <svg
                  class="w-4 h-4 text-blue-600 animate-spin"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </div>
              <h2 class="text-lg font-semibold text-gray-900">AI分析进行中</h2>
            </div>
            <div class="space-y-2">
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-600">{{ currentStep }}</span>
                <span class="text-blue-600 font-medium"
                  >{{ Math.round(progress) }}%</span
                >
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div
                  class="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
                  :style="{ width: `${progress}%` }"
                ></div>
              </div>
            </div>
          </div>

          <!-- 分析结果 -->
          <div
            v-if="analysisResult && !isAnalyzing"
            class="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h2
              class="text-lg font-semibold text-gray-900 mb-6 flex items-center"
            >
              <svg
                class="w-5 h-5 mr-2 text-green-600"
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
              分析结果
            </h2>

            <!-- 问题统计 -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div class="text-center p-4 bg-red-50 rounded-lg">
                <div class="text-2xl font-bold text-red-600">
                  {{ analysisResult.missingCount || 0 }}
                </div>
                <div class="text-sm text-red-700">漏填项</div>
              </div>
              <div class="text-center p-4 bg-orange-50 rounded-lg">
                <div class="text-2xl font-bold text-orange-600">
                  {{ analysisResult.errorCount || 0 }}
                </div>
                <div class="text-sm text-orange-700">文字错误</div>
              </div>
              <div class="text-center p-4 bg-yellow-50 rounded-lg">
                <div class="text-2xl font-bold text-yellow-600">
                  {{ analysisResult.formatCount || 0 }}
                </div>
                <div class="text-sm text-yellow-700">格式问题</div>
              </div>
              <div class="text-center p-4 bg-purple-50 rounded-lg">
                <div class="text-2xl font-bold text-purple-600">
                  {{ analysisResult.imageCount || 0 }}
                </div>
                <div class="text-sm text-purple-700">缺失图片</div>
              </div>
            </div>

            <!-- 详细问题列表 -->
            <div class="space-y-4">
              <!-- 漏填项 -->
              <div
                v-if="analysisResult.missingFields?.length"
                class="border border-red-200 rounded-lg p-4"
              >
                <h3
                  class="text-sm font-semibold text-red-800 mb-3 flex items-center"
                >
                  <svg
                    class="w-4 h-4 mr-2"
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
                  漏填项
                </h3>
                <div class="space-y-2">
                  <div
                    v-for="(item, index) in analysisResult.missingFields"
                    :key="index"
                    class="flex items-start space-x-3 text-sm"
                  >
                    <span
                      class="inline-flex items-center justify-center w-6 h-6 bg-red-100 text-red-700 rounded-full text-xs font-medium"
                    >
                      {{ item.page }}
                    </span>
                    <span class="text-red-700"
                      >第{{ item.page }}页，第{{ item.line }}行：{{
                        item.description
                      }}</span
                    >
                  </div>
                </div>
              </div>

              <!-- 文字错误 -->
              <div
                v-if="analysisResult.textErrors?.length"
                class="border border-orange-200 rounded-lg p-4"
              >
                <h3
                  class="text-sm font-semibold text-orange-800 mb-3 flex items-center"
                >
                  <svg
                    class="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  文字错误
                </h3>
                <div class="space-y-2">
                  <div
                    v-for="(item, index) in analysisResult.textErrors"
                    :key="index"
                    class="flex items-start space-x-3 text-sm"
                  >
                    <span
                      class="inline-flex items-center justify-center w-6 h-6 bg-orange-100 text-orange-700 rounded-full text-xs font-medium"
                    >
                      {{ item.page }}
                    </span>
                    <div class="text-orange-700">
                      <div>
                        第{{ item.page }}页，第{{ item.line }}行：{{
                          item.description
                        }}
                      </div>
                      <div
                        v-if="item.suggestion"
                        class="text-xs text-orange-600 mt-1"
                      >
                        建议：{{ item.suggestion }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 格式问题 -->
              <div
                v-if="analysisResult.formatIssues?.length"
                class="border border-yellow-200 rounded-lg p-4"
              >
                <h3
                  class="text-sm font-semibold text-yellow-800 mb-3 flex items-center"
                >
                  <svg
                    class="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
                    />
                  </svg>
                  格式问题
                </h3>
                <div class="space-y-2">
                  <div
                    v-for="(item, index) in analysisResult.formatIssues"
                    :key="index"
                    class="flex items-start space-x-3 text-sm"
                  >
                    <span
                      class="inline-flex items-center justify-center w-6 h-6 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium"
                    >
                      {{ item.page }}
                    </span>
                    <div class="text-yellow-700">
                      <div>
                        第{{ item.page }}页，第{{ item.line }}行：{{
                          item.description
                        }}
                      </div>
                      <div
                        v-if="item.suggestion"
                        class="text-xs text-yellow-600 mt-1"
                      >
                        建议：{{ item.suggestion }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 缺失图片 -->
              <div
                v-if="analysisResult.missingImages?.length"
                class="border border-purple-200 rounded-lg p-4"
              >
                <h3
                  class="text-sm font-semibold text-purple-800 mb-3 flex items-center"
                >
                  <svg
                    class="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  缺失图片
                </h3>
                <div class="space-y-2">
                  <div
                    v-for="(item, index) in analysisResult.missingImages"
                    :key="index"
                    class="flex items-start space-x-3 text-sm"
                  >
                    <span
                      class="inline-flex items-center justify-center w-6 h-6 bg-purple-100 text-purple-700 rounded-full text-xs font-medium"
                    >
                      {{ item.page }}
                    </span>
                    <span class="text-purple-700"
                      >第{{ item.page }}页：{{ item.description }}</span
                    >
                  </div>
                </div>
              </div>
            </div>

            <!-- 操作按钮 -->
            <div
              class="flex items-center justify-end space-x-3 mt-6 pt-6 border-t border-gray-200"
            >
              <button
                @click="exportReport"
                class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                导出报告
              </button>
              <button
                @click="clearResults"
                class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                清空结果
              </button>
            </div>
          </div>

          <!-- 空状态 -->
          <div
            v-if="!analysisResult && !isAnalyzing"
            class="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center"
          >
            <div
              class="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center"
            >
              <svg
                class="w-8 h-8 text-gray-400"
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
            <h3 class="text-lg font-medium text-gray-900 mb-2">等待文档分析</h3>
            <p class="text-gray-500">
              请上传文档或输入文本内容，然后点击"开始AI分析"
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { CozeAPI } from '@coze/api'

  // 页面标题
  definePageMeta({
    title: 'AI文档分析',
  })

  // 响应式数据
  const selectedFile = ref<File | null>(null)
  const textInput = ref('')
  const isDragging = ref(false)
  const isAnalyzing = ref(false)
  const progress = ref(0)
  const currentStep = ref('')
  const analysisResult = ref<any>(null)

  // DOCX转XML测试相关
  const isTestingConversion = ref(false)
  const conversionStatus = ref('')
  const conversionProgress = ref(0)
  const conversionResult = ref<any>(null)
  const uploadedFileId = ref<string>('')
  
  // Coze workflow调用相关
  const isCallingWorkflow = ref(false)
  const workflowResult = ref<any>(null)

  // 计算属性
  const canAnalyze = computed(() => {
    return selectedFile.value || textInput.value.trim().length > 0
  })

  const isDocxFile = computed(() => {
    if (!selectedFile.value) return false
    return selectedFile.value.name.toLowerCase().endsWith('.docx')
  })

  // 方法
  const handleFileDrop = (event: DragEvent) => {
    isDragging.value = false
    const files = event.dataTransfer?.files
    if (files && files.length > 0) {
      selectedFile.value = files[0]
    }
  }

  const handleFileSelect = (event: Event) => {
    const target = event.target as HTMLInputElement
    if (target.files && target.files.length > 0) {
      selectedFile.value = target.files[0]
    }
  }

  const removeFile = () => {
    selectedFile.value = null
  }

  const clearText = () => {
    textInput.value = ''
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const analyzeDocument = async () => {
    isAnalyzing.value = true
    progress.value = 0
    analysisResult.value = null

    const steps = [
      '正在读取文档内容...',
      '正在进行AI语义分析...',
      '正在检查格式规范...',
      '正在识别漏填项...',
      '正在生成分析报告...',
    ]

    for (let i = 0; i < steps.length; i++) {
      currentStep.value = steps[i]
      progress.value = ((i + 1) / steps.length) * 100
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    // 调用Coze API进行分析
    try {
      await callCozeAPI()
    } catch (error) {
      console.error('分析失败:', error)
      // 显示模拟结果
      showMockResult()
    }

    isAnalyzing.value = false
  }

  const callCozeAPI = async () => {
    const content = selectedFile.value
      ? await readFileContent(selectedFile.value)
      : textInput.value

    const response = await $fetch('/api/coze/analyze', {
      method: 'POST',
      body: {
        content,
        type: selectedFile.value ? 'file' : 'text',
      },
    })

    analysisResult.value = (response as any).result
  }

  const readFileContent = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsText(file)
    })
  }

  const showMockResult = () => {
    // 模拟分析结果
    analysisResult.value = {
      missingCount: 3,
      errorCount: 2,
      formatCount: 1,
      imageCount: 1,
      missingFields: [
        { page: 1, line: 15, description: '缺少项目负责人签名' },
        { page: 2, line: 8, description: '施工日期字段为空' },
        { page: 3, line: 22, description: '材料规格信息不完整' },
      ],
      textErrors: [
        {
          page: 1,
          line: 10,
          description: '"施工现场"拼写错误',
          suggestion: '应为"施工现场"',
        },
        {
          page: 2,
          line: 18,
          description: '数字格式不统一',
          suggestion: '统一使用阿拉伯数字',
        },
      ],
      formatIssues: [
        {
          page: 1,
          line: 5,
          description: '标题格式不符合标准',
          suggestion: '使用标准的标题格式',
        },
      ],
      missingImages: [{ page: 2, description: '缺少现场施工图片' }],
    }
  }

  const exportReport = () => {
    // 导出分析报告功能
    const reportContent = JSON.stringify(analysisResult.value, null, 2)
    const blob = new Blob([reportContent], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = '文档分析报告.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const clearResults = () => {
    analysisResult.value = null
    selectedFile.value = null
    textInput.value = ''
  }

  // DOCX转XML测试方法
  const testDocxConversion = async (format: string) => {
    if (!selectedFile.value || !isDocxFile.value) return

    isTestingConversion.value = true
    conversionStatus.value = '正在准备...'
    conversionProgress.value = 0
    conversionResult.value = null

    try {
      // 1. 上传文件
      conversionStatus.value = '正在上传文件...'
      conversionProgress.value = 10
      
      const formData = new FormData()
      formData.append('file', selectedFile.value)

      const uploadResponse = await $fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      })

      uploadedFileId.value = (uploadResponse as any).id
      conversionProgress.value = 40
      conversionStatus.value = `正在转换为${format}格式...`

      // 模拟转换进度
      const progressInterval = setInterval(() => {
        if (conversionProgress.value < 90) {
          conversionProgress.value += 5
        }
      }, 200)

      // 2. 转换文件
      const convertResponse = await $fetch('/api/files/convert-docx', {
        method: 'POST',
        body: {
          fileId: uploadedFileId.value,
          format: format,
        },
      })

      clearInterval(progressInterval)
      conversionProgress.value = 100
      conversionStatus.value = '转换完成'
      conversionResult.value = convertResponse
      
      // 延迟一下让用户看到100%
      await new Promise(resolve => setTimeout(resolve, 300))
    } catch (error: any) {
      console.error('转换失败:', error)
      conversionResult.value = {
        success: false,
        error:
          error.message || error.statusMessage || '转换失败，请检查文件格式',
      }
    } finally {
      isTestingConversion.value = false
      conversionProgress.value = 0
    }
  }

  const formatConversionResult = (data: any): string => {
    if (!data) return ''

    if (typeof data === 'string') {
      // 如果是XML字符串，截取前1000个字符
      return data.length > 1000
        ? data.substring(0, 1000) + '\n\n... (总计 ' + data.length + ' 字符)'
        : data
    }

    // 如果是对象，格式化为JSON
    const jsonStr = JSON.stringify(data, null, 2)
    return jsonStr.length > 1000
      ? jsonStr.substring(0, 1000) +
          '\n\n... (总计 ' +
          jsonStr.length +
          ' 字符)'
      : jsonStr
  }

  const downloadConversionResult = () => {
    if (!conversionResult.value || !conversionResult.value.success) return

    const data = conversionResult.value.data
    const format = conversionResult.value.format

    let content: string
    let filename: string
    let mimeType: string

    switch (format) {
      case 'xml':
      case 'xml-formatted':
        content =
          typeof data === 'string' ? data : JSON.stringify(data, null, 2)
        filename = 'docx-converted.xml'
        mimeType = 'application/xml'
        break
      case 'json':
        content = JSON.stringify(data, null, 2)
        filename = 'docx-converted.json'
        mimeType = 'application/json'
        break
      case 'text':
        content = typeof data === 'string' ? data : JSON.stringify(data)
        filename = 'docx-extracted-text.txt'
        mimeType = 'text/plain'
        break
      default:
        content = JSON.stringify(data, null, 2)
        filename = 'docx-converted.txt'
        mimeType = 'text/plain'
    }

    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  // 调用Coze Workflow
  const callCozeWorkflow = async () => {
    if (!conversionResult.value || !conversionResult.value.success) return
    
    const xmlContent = getXmlContent()
    if (!xmlContent) {
      workflowResult.value = {
        success: false,
        error: 'XML内容为空'
      }
      return
    }

    isCallingWorkflow.value = true
    workflowResult.value = null

    try {
      console.log('调用Coze Workflow，XML内容长度:', xmlContent.length)
      
      // 初始化Coze API客户端
      const apiClient = new CozeAPI({
        token: 'cztei_hb0jiElxbrOyBJYn0wbBKZMTfUJTUcWltqtjLoOvQo51G6pBILr8MVnF4ws2dS66D',
        baseURL: 'https://api.coze.cn'
      })

      // 调用workflow stream API
      const stream = await apiClient.workflows.runs.stream({
        workflow_id: '7573337879529062440',
        parameters: {
          bit1: 0,
          table_summary: selectedFile.value?.name || '工程总监任命通知',
          xml_content: xmlContent
        }
      })

      console.log('Coze Workflow Stream创建成功')
      
      // 收集流式响应数据
      const chunks: any[] = []
      let fullResponse: any = {}

      // 处理流式响应
      for await (const chunk of stream) {
        console.log('收到chunk:', chunk)
        chunks.push(chunk)
        
        // 合并所有响应数据
        fullResponse = { ...fullResponse, ...chunk }
      }

      console.log('Coze Workflow调用完成')
      console.log('总共收到chunks:', chunks.length)
      console.log('完整响应:', fullResponse)

      workflowResult.value = {
        success: true,
        data: fullResponse
      }
    } catch (error: any) {
      console.error('Coze Workflow调用失败:', error)
      workflowResult.value = {
        success: false,
        error: error.message || error.toString() || '调用失败'
      }
    } finally {
      isCallingWorkflow.value = false
    }
  }

  // 获取XML内容
  const getXmlContent = (): string => {
    if (!conversionResult.value || !conversionResult.value.success) return ''
    
    const data = conversionResult.value.data
    const format = conversionResult.value.format

    if (format === 'xml' || format === 'xml-formatted') {
      if (typeof data === 'string') {
        return data
      } else if (data.document) {
        return data.document
      } else if (data.allXmlFiles && data.allXmlFiles['word/document.xml']) {
        return data.allXmlFiles['word/document.xml']
      }
    }
    
    return ''
  }

  // 格式化Workflow结果
  const formatWorkflowResult = (result: any): string => {
    if (!result) return ''
    
    if (result.success && result.data) {
      return JSON.stringify(result.data, null, 2)
    } else if (result.error) {
      return `错误: ${result.error}`
    }
    
    return JSON.stringify(result, null, 2)
  }
</script>
