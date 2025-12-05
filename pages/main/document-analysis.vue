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
                  accept=".doc,.docx,.xls,.xlsx,.pdf,.txt"
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

          <!-- DOCX文档拆分区域 -->
          <div
            v-if="isDocxFile"
            class="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              DOCX文档拆分
            </h2>

            <div class="space-y-4">
              <!-- 拆分设置 -->
              <div class="flex items-center space-x-3 mb-3">
                <label class="text-sm text-gray-700">每个文件包含页数：</label>
                <input
                  v-model.number="pagesPerFile"
                  type="number"
                  min="1"
                  max="1000"
                  class="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
                <span class="text-xs text-gray-500">（默认30页）</span>
              </div>

              <!-- 拆分按钮 -->
              <button
                @click="splitDocument"
                :disabled="!selectedFile || !isDocxFile || isSplittingDocument"
                class="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <svg
                  v-if="!isSplittingDocument"
                  class="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5"
                  />
                </svg>
                <svg
                  v-else
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
                {{ isSplittingDocument ? '拆分中...' : '拆分文档' }}
              </button>

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
                请先上传DOCX文件进行拆分
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

              <!-- 拆分进度显示 -->
              <div v-if="isSplittingDocument" class="mt-4 space-y-4">
                <!-- 进度卡片 -->
                <div
                  class="bg-white rounded-xl shadow-sm border border-purple-200 p-6"
                >
                  <div class="flex items-center space-x-3 mb-4">
                    <div
                      class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center"
                    >
                      <svg
                        class="w-4 h-4 text-purple-600 animate-spin"
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
                    <h3 class="text-lg font-semibold text-gray-900">
                      文档拆分进行中
                    </h3>
                  </div>

                  <!-- 总体进度 -->
                  <div class="mb-6">
                    <div
                      class="flex justify-between text-sm text-gray-600 mb-2"
                    >
                      <span><strong>总体进度</strong></span>
                      <span
                        >{{ splitProgress.completed }}/{{
                          splitProgress.total
                        }}
                        文件</span
                      >
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-4">
                      <div
                        class="bg-gradient-to-r from-purple-500 to-pink-500 h-4 rounded-full transition-all duration-500"
                        :style="{ width: `${splitProgress.percentage}%` }"
                      ></div>
                    </div>
                    <div class="text-xs text-gray-500 mt-1">
                      {{ splitProgress.percentage }}%
                    </div>
                  </div>

                  <!-- 当前文件进度 -->
                  <div v-if="currentFileProgress.fileIndex > 0" class="mb-6">
                    <div
                      class="flex justify-between text-sm text-gray-600 mb-2"
                    >
                      <span
                        ><strong
                          >当前任务：第{{
                            currentFileProgress.fileIndex
                          }}个</strong
                        ></span
                      >
                      <span>{{ currentFileProgress.step }}</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-3">
                      <div
                        class="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-300"
                        :style="{ width: `${currentFileProgress.percentage}%` }"
                      ></div>
                    </div>
                    <div class="text-xs text-gray-500 mt-1">
                      {{ currentFileProgress.percentage }}%
                    </div>
                  </div>

                  <!-- 实时统计 -->
                  <div class="grid grid-cols-3 gap-4 mb-6">
                    <div class="bg-purple-50 p-4 rounded-lg text-center">
                      <div class="text-2xl font-bold text-purple-600">
                        {{ splitProgress.completed }}
                      </div>
                      <div class="text-sm text-gray-600">已完成</div>
                    </div>
                    <div class="bg-blue-50 p-4 rounded-lg text-center">
                      <div class="text-2xl font-bold text-blue-600">
                        {{ splitProgress.total }}
                      </div>
                      <div class="text-sm text-gray-600">总数</div>
                    </div>
                    <div class="bg-green-50 p-4 rounded-lg text-center">
                      <div class="text-lg font-bold text-green-600">
                        {{ getCurrentPhase() }}
                      </div>
                      <div class="text-sm text-gray-600">当前阶段</div>
                    </div>
                  </div>

                  <!-- 详细日志 -->
                  <div class="bg-gray-50 rounded-lg p-4">
                    <h4 class="text-sm font-semibold mb-2 flex items-center">
                      <svg
                        class="w-4 h-4 mr-2 text-gray-600"
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
                      处理日志
                    </h4>
                    <div
                      class="max-h-48 overflow-y-auto bg-white rounded border p-3"
                    >
                      <div class="space-y-1 font-mono text-xs">
                        <div
                          v-for="(log, index) in progressLogs"
                          :key="index"
                          class="text-gray-700"
                          :class="{
                            'text-green-600':
                              log.includes('完成') || log.includes('成功'),
                            'text-red-600':
                              log.includes('错误') || log.includes('失败'),
                            'text-blue-600':
                              log.includes('开始') || log.includes('正在'),
                          }"
                        >
                          [{{ formatTime(new Date()) }}] {{ log }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 拆分结果 -->
              <div v-if="splitResult" class="mt-4 space-y-3">
                <div
                  class="p-4 bg-purple-50 border border-purple-200 rounded-lg"
                >
                  <div class="flex items-center space-x-2 mb-3">
                    <svg
                      class="w-5 h-5 text-purple-600"
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
                    <span class="text-sm font-semibold text-purple-800"
                      >拆分完成</span
                    >
                  </div>
                  <div class="grid grid-cols-2 gap-2 text-xs mb-4">
                    <div class="bg-white border border-purple-200 rounded p-3">
                      <div class="text-purple-600 font-medium">拆分文件数</div>
                      <div class="text-2xl font-bold text-purple-700">
                        {{ splitResult.totalFiles }}
                      </div>
                    </div>
                    <div class="bg-white border border-purple-200 rounded p-3">
                      <div class="text-purple-600 font-medium">每个文件</div>
                      <div class="text-2xl font-bold text-purple-700">
                        {{ splitResult.pagesPerFile }} 页
                      </div>
                    </div>
                  </div>

                  <!-- 文件列表 -->
                  <div
                    class="bg-white border border-purple-200 rounded p-3 max-h-40 overflow-auto mb-3"
                  >
                    <div class="text-xs font-medium text-purple-700 mb-2">
                      拆分文件列表：
                    </div>
                    <div class="space-y-1">
                      <div
                        v-for="(file, index) in splitResult.files"
                        :key="index"
                        class="text-xs text-gray-700 flex items-center justify-between"
                      >
                        <div class="flex items-center flex-1 min-w-0">
                          <svg
                            class="w-3 h-3 mr-1 text-purple-500 flex-shrink-0"
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
                          <span class="truncate">{{
                            typeof file === 'string' ? file : file.name
                          }}</span>
                        </div>
                        <span
                          v-if="file.size"
                          class="text-gray-500 ml-2 flex-shrink-0"
                        >
                          {{ formatFileSize(file.size) }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <!-- 下载按钮 -->
                  <button
                    @click="downloadSplitFiles"
                    class="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center"
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
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    打包下载全部DOCX文档
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Excel提示词输入区域 -->
          <div
            v-if="isExcelFile"
            class="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
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
              Excel提示词
            </h2>
            <p class="text-sm text-gray-600 mb-3">
              请输入对Excel分析的业务需求，例如：更换品牌、字段校验、指标统计等。
            </p>
            <a-textarea
              v-model:value="excelWorkRequirements"
              :rows="4"
              placeholder="例如：帮我把控制器、触摸屏、模块从西门子替换成三菱同规格型号。原来其他型号不用变。"
              allowClear
            />
            <div class="text-xs text-gray-500 mt-2">
              注：Excel分析会将该提示词作为WorkRequirements传入AI工作流。
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
            <!-- <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
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
            </div> -->

            <!-- 详细问题列表 -->
            <!-- <div class="space-y-4"> -->
            <!-- 漏填项 -->
            <!-- <div
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
              </div> -->

            <!-- 文字错误 -->
            <!-- <div
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
              </div> -->

            <!-- 格式问题 -->
            <!-- <div
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
              </div> -->

            <!-- 缺失图片 -->
            <!-- <div
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
            </div> -->

            <!-- 分页结果展示 -->
            <div v-if="analysisResults.length > 0" class="mt-6">
              <h3
                class="text-md font-semibold text-gray-800 mb-4 flex items-center justify-between"
              >
                <span>文件分析详情 (共 {{ analysisResults.length }} 个)</span>
                <button
                  v-if="allReportUrls.length > 0"
                  @click="batchExportReports"
                  class="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors flex items-center"
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
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  批量导出报告 ({{ allReportUrls.length }})
                </button>
              </h3>

              <!-- 文件列表 -->
              <div class="space-y-4">
                <div
                  v-for="result in paginatedResults"
                  :key="result.fileIndex"
                  class="border rounded-lg p-4"
                  :class="
                    result.error
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-300 bg-white'
                  "
                >
                  <div class="flex items-start justify-between mb-3">
                    <div class="flex items-center space-x-2">
                      <span class="text-sm font-semibold text-gray-700">
                        文件 #{{ result.fileIndex }}
                      </span>
                      <span
                        v-if="result.error"
                        class="px-2 py-1 bg-red-200 text-red-800 text-xs rounded"
                      >
                        失败
                      </span>
                      <span
                        v-else
                        class="px-2 py-1 bg-green-200 text-green-800 text-xs rounded"
                      >
                        成功
                      </span>
                    </div>
                  </div>

                  <!-- 错误信息 -->
                  <div v-if="result.error" class="text-sm text-red-700 mb-2">
                    <strong>错误:</strong> {{ result.error_message }}
                  </div>

                  <!-- 成功结果 -->
                  <div v-else-if="result.result?.content" class="space-y-3">
                    <div
                      class="bg-gray-50 p-3 rounded text-sm max-h-64 overflow-y-auto whitespace-pre-wrap"
                    >
                      {{ result.result.content }}
                    </div>

                    <!-- 提取的URL -->
                    <div
                      v-if="extractUrls(result.result.content).length > 0"
                      class="space-y-2"
                    >
                      <div class="text-xs font-semibold text-gray-600">
                        报告文件:
                      </div>
                      <div class="space-y-1">
                        <div
                          v-for="(url, idx) in extractUrls(
                            result.result.content
                          )"
                          :key="idx"
                          class="flex items-center justify-between bg-blue-50 p-2 rounded"
                        >
                          <span class="text-xs text-blue-700 truncate flex-1">{{
                            url
                          }}</span>
                          <button
                            @click="
                              exportSingleReport(
                                url,
                                `report_${result.fileIndex}_${idx + 1}.docx`
                              )
                            "
                            class="ml-2 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                          >
                            下载
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 分页控制 -->
              <div
                v-if="totalPages > 1"
                class="flex items-center justify-center space-x-2 mt-6"
              >
                <button
                  @click="currentPage = Math.max(1, currentPage - 1)"
                  :disabled="currentPage === 1"
                  class="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  上一页
                </button>
                <span class="text-sm text-gray-600">
                  第 {{ currentPage }} / {{ totalPages }} 页
                </span>
                <button
                  @click="currentPage = Math.min(totalPages, currentPage + 1)"
                  :disabled="currentPage === totalPages"
                  class="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  下一页
                </button>
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
  import { message } from 'ant-design-vue'

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
  const analysisResults = ref<any[]>([])
  const currentPage = ref(1)
  const pageSize = ref(10)

  // 文档拆分相关
  const pagesPerFile = ref(30)
  const isSplittingDocument = ref(false)
  const splitResult = ref<any>(null)

  // Excel提示词
  const excelWorkRequirements = ref<string>('')

  // 拆分进度相关
  const splitProgress = ref({
    total: 0,
    completed: 0,
    percentage: 0,
  })

  const currentFileProgress = ref({
    fileIndex: 0,
    step: '',
    percentage: 0,
  })

  const progressLogs = ref<string[]>([])

  // 计算属性
  const canAnalyze = computed(() => {
    if (selectedFile.value) {
      // Excel文件需填写提示词
      if (isExcelFile.value) {
        return excelWorkRequirements.value.trim().length > 0
      }
      return true
    }
    return textInput.value.trim().length > 0
  })

  const isDocxFile = computed(() => {
    if (!selectedFile.value) return false
    return selectedFile.value.name.toLowerCase().endsWith('.docx')
  })

  const isExcelFile = computed(() => {
    if (!selectedFile.value) return false
    const name = selectedFile.value.name.toLowerCase()
    return name.endsWith('.xlsx') || name.endsWith('.xls')
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

  // 获取当前阶段
  const getCurrentPhase = () => {
    if (
      currentFileProgress.value.step.includes('ZIP') ||
      currentFileProgress.value.step.includes('打包')
    ) {
      return '打包中'
    } else if (currentFileProgress.value.step.includes('完成')) {
      return '已完成'
    } else if (splitProgress.value.completed > 0) {
      return '拆分中'
    } else {
      return '准备中'
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString()
  }

  // Toast提示函数
  const showToast = (
    content: string,
    type: 'success' | 'error' | 'warning' = 'error'
  ) => {
    message[type](content)
  }

  // 计算分页数据
  const paginatedResults = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    return analysisResults.value.slice(start, end)
  })

  const totalPages = computed(() => {
    return Math.ceil(analysisResults.value.length / pageSize.value)
  })

  // 提取content中的URL
  const extractUrls = (content: string): string[] => {
    if (!content) return []
    const urlRegex = /https?:\/\/[^\s"']+\.docx[^\s"']*/g
    const matches = content.match(urlRegex)
    return matches || []
  }

  // 获取所有报告URL
  const allReportUrls = computed(() => {
    const urls: string[] = []
    analysisResults.value.forEach(result => {
      if (result.result?.content) {
        const extractedUrls = extractUrls(result.result.content)
        urls.push(...extractedUrls)
      }
    })
    return urls
  })

  const analyzeDocument = async () => {
    // Excel需提示词
    if (
      selectedFile.value &&
      isExcelFile.value &&
      !excelWorkRequirements.value.trim()
    ) {
      message.warning('请填写Excel提示词（WorkRequirements）')
      return
    }

    isAnalyzing.value = true
    progress.value = 0
    analysisResult.value = null

    try {
      // 如果是文件上传，使用新的 Coze 工作流
      if (selectedFile.value) {
        await analyzeWithCozeWorkflow()
      } else {
        // 文本输入使用原有方法
        await analyzeWithCozeAPI()
      }
    } catch (error: any) {
      console.error('分析失败:', error)
      message.error(error.message || '分析失败，请重试')
      // 显示模拟结果用于演示
      // showMockResult()
    } finally {
      isAnalyzing.value = false
    }
  }

  // 使用 Coze 工作流分析（文件上传）
  const analyzeWithCozeWorkflow = async () => {
    if (!selectedFile.value) return

    // Excel分支：上传并调用Excel工作流（含WorkRequirements）
    if (isExcelFile.value) {
      try {
        currentStep.value = '正在上传Excel到服务器...'
        progress.value = 10

        const formData = new FormData()
        formData.append('file', selectedFile.value)

        const uploadResponse = await $fetch('/api/files/upload', {
          method: 'POST',
          body: formData,
        })

        if (!uploadResponse || !uploadResponse.url) {
          throw new Error('文件上传失败，未获取到文件URL')
        }

        const fileUrl = uploadResponse.url
        console.log('Excel文件上传成功，URL:', fileUrl)

        // 重置结果数组
        analysisResults.value = []
        currentPage.value = 1

        currentStep.value = '正在调用Excel AI分析工作流...'
        progress.value = 40

        const workflowResponse = await $fetch('/api/coze/workflow-excel', {
          method: 'POST',
          body: {
            fileUrl,
            workRequirements: excelWorkRequirements.value,
            tableSummary: `${selectedFile.value.name}`,
          },
        })

        console.log('Excel分析响应:', workflowResponse)

        // 处理响应
        if (workflowResponse.error && workflowResponse.error_message) {
          showToast(`Excel分析失败: ${workflowResponse.error_message}`, 'error')
          console.error('Excel分析错误:', workflowResponse)

          analysisResults.value.push({
            fileIndex: 1,
            fileUrl,
            error: true,
            error_message: workflowResponse.error_message,
            error_code: workflowResponse.error_code,
          })
        } else if (workflowResponse.success) {
          analysisResults.value.push({
            fileIndex: 1,
            fileUrl,
            result: workflowResponse.result,
          })
          analysisResult.value = processWorkflowOutput(workflowResponse.result)
          console.log('Excel分析完成')
        } else {
          showToast('Excel分析失败: 未知错误', 'error')
          analysisResults.value.push({
            fileIndex: 1,
            fileUrl,
            error: true,
            error_message: '未知错误',
          })
        }

        progress.value = 100
        currentStep.value = 'Excel分析完成'
      } catch (error: any) {
        console.error('Excel工作流分析失败:', error)
        throw error
      }
      return
    }

    // Word分支：原有逻辑
    try {
      let fileUrls: string[] = []

      // 检查是否有拆分文档
      if (
        splitResult.value &&
        splitResult.value.files &&
        splitResult.value.files.length > 0
      ) {
        // 有拆分文档，获取拆分文件的URL列表
        currentStep.value = `正在获取 ${splitResult.value.files.length} 个拆分文件的URL...`
        progress.value = 10

        try {
          // 从拆分结果中获取文件ID（需要保存在拆分时）
          // 假设在拆分时我们保存了原始文件的ID
          const originalFileId = splitResult.value.fileId

          if (!originalFileId) {
            throw new Error('拆分结果中缺少文件ID，请重新拆分文档')
          }

          const urlResponse = await $fetch('/api/files/split-and-get-urls', {
            method: 'POST',
            body: { fileId: originalFileId },
          })

          if (
            !urlResponse ||
            !urlResponse.fileUrls ||
            urlResponse.fileUrls.length === 0
          ) {
            throw new Error('获取拆分文件URL失败')
          }

          fileUrls = urlResponse.fileUrls
          console.log(`成功获取 ${fileUrls.length} 个拆分文件的URL`)
        } catch (error: any) {
          console.error('获取拆分文件URL失败:', error)
          showToast(
            `获取拆分文件URL失败: ${error.message}。请重新拆分文档后再试。`,
            'error'
          )
          return
        }
      } else {
        // 单个文件：上传到本地服务器
        currentStep.value = '正在上传文件到服务器...'
        progress.value = 10

        const formData = new FormData()
        formData.append('file', selectedFile.value)

        const uploadResponse = await $fetch('/api/files/upload', {
          method: 'POST',
          body: formData,
        })

        if (!uploadResponse || !uploadResponse.url) {
          throw new Error('文件上传失败，未获取到文件URL')
        }

        fileUrls = [uploadResponse.url]
        console.log('文件上传成功，URL:', uploadResponse.url)
      }

      // 重置结果数组
      analysisResults.value = []
      currentPage.value = 1

      // 在前端循环调用API，每次处理一个文件
      const totalFiles = fileUrls.length
      for (let i = 0; i < totalFiles; i++) {
        const fileUrl = fileUrls[i]
        currentStep.value = `正在分析第 ${i + 1}/${totalFiles} 个文件...`
        progress.value = 20 + (i / totalFiles) * 70

        try {
          console.log(`开始分析第 ${i + 1}/${totalFiles} 个文件: ${fileUrl}`)

          const workflowResponse = await $fetch('/api/coze/workflow', {
            method: 'POST',
            body: {
              fileUrl,
              tableSummary: `${selectedFile.value.name} - 第${i + 1}部分`,
            },
          })

          console.log(`第 ${i + 1} 个文件分析响应:`, workflowResponse)

          // 检查是否有错误
          if (workflowResponse.error && workflowResponse.error_message) {
            showToast(
              `第 ${i + 1} 个文件分析失败: ${workflowResponse.error_message}`,
              'error'
            )
            console.error(`第 ${i + 1} 个文件错误:`, workflowResponse)

            // 即使出错也记录结果
            analysisResults.value.push({
              fileIndex: i + 1,
              fileUrl,
              error: true,
              error_message: workflowResponse.error_message,
              error_code: workflowResponse.error_code,
            })
          } else if (workflowResponse.success) {
            // 成功的结果
            analysisResults.value.push({
              fileIndex: i + 1,
              fileUrl,
              result: workflowResponse.result,
            })
            console.log(`第 ${i + 1} 个文件分析完成`)
          } else {
            // 未知错误
            showToast(`第 ${i + 1} 个文件分析失败: 未知错误`, 'error')
            analysisResults.value.push({
              fileIndex: i + 1,
              fileUrl,
              error: true,
              error_message: '未知错误',
            })
          }
        } catch (error: any) {
          console.error(`第 ${i + 1} 个文件分析失败:`, error)
          showToast(
            `第 ${i + 1} 个文件分析失败: ${error.message || '网络错误'}`,
            'error'
          )

          analysisResults.value.push({
            fileIndex: i + 1,
            fileUrl,
            error: true,
            error_message: error.message || '网络错误',
          })
        }
      }

      progress.value = 90
      currentStep.value = '分析完成，正在生成报告...'

      // 合并所有成功的文件结果用于兼容旧的显示逻辑
      const successResults = analysisResults.value.filter(r => !r.error)
      if (successResults.length > 0) {
        analysisResult.value = mergeAnalysisResults(successResults)
        console.log(`合并后的分析结果:`, analysisResult.value)
      }

      progress.value = 100
      currentStep.value = `分析完成！成功: ${successResults.length}/${totalFiles}`

      if (successResults.length < totalFiles) {
        showToast(
          `部分文件分析失败，成功: ${successResults.length}/${totalFiles}`,
          'warning'
        )
      }
    } catch (error: any) {
      console.error('Coze工作流分析失败:', error)
      throw error
    }
  }

  // 轮询工作流状态
  const pollWorkflowStatus = async (executeId: string) => {
    const maxAttempts = 60 // 最多轮询60次
    const pollInterval = 3000 // 每3秒轮询一次
    let attempts = 0

    while (attempts < maxAttempts) {
      attempts++

      try {
        const statusResponse = await $fetch(
          `/api/coze/workflow-status?executeId=${executeId}`
        )
        const status = (statusResponse as any).status

        if (status === 'succeeded') {
          // 工作流成功完成
          currentStep.value = '分析完成，正在生成报告...'
          progress.value = 100

          // 处理输出结果
          const output = (statusResponse as any).output
          analysisResult.value = processWorkflowOutput(output)
          return
        } else if (status === 'failed') {
          // 工作流失败
          const errorMsg =
            (statusResponse as any).errorMessage || '工作流执行失败'
          throw new Error(errorMsg)
        } else if (status === 'running') {
          // 工作流仍在运行，更新进度
          currentStep.value = `正在分析文档... (${attempts}/${maxAttempts})`
          progress.value = 60 + (attempts / maxAttempts) * 30

          // 等待后继续轮询
          await new Promise(resolve => setTimeout(resolve, pollInterval))
        }
      } catch (error) {
        console.error('查询工作流状态失败:', error)
        throw error
      }
    }

    // 超时
    throw new Error('工作流执行超时，请稍后重试')
  }

  // 处理工作流输出
  const processWorkflowOutput = (output: any) => {
    // 根据实际的工作流输出格式进行解析
    try {
      const result = typeof output === 'string' ? JSON.parse(output) : output

      // 如果后端已经解析好返回了content字段
      if (result.success && result.content !== undefined) {
        const content = result.content

        // 尝试解析content为JSON（如果content是JSON字符串）
        let parsedContent = content
        if (typeof content === 'string') {
          try {
            parsedContent = JSON.parse(content)
          } catch {
            // content不是JSON，保持原样
            parsedContent = { rawContent: content }
          }
        }

        // 如果parsedContent有结构化数据，使用它
        if (parsedContent && typeof parsedContent === 'object') {
          return {
            missingCount: parsedContent.missing_fields?.length || 0,
            errorCount: parsedContent.text_errors?.length || 0,
            formatCount: parsedContent.format_issues?.length || 0,
            imageCount: parsedContent.missing_images?.length || 0,
            missingFields: parsedContent.missing_fields || [],
            textErrors: parsedContent.text_errors || [],
            formatIssues: parsedContent.format_issues || [],
            missingImages: parsedContent.missing_images || [],
            summary:
              parsedContent.summary ||
              parsedContent.rawContent ||
              content ||
              '文档分析完成',
            score: parsedContent.quality_score || 85,
            usage: result.usage, // 保留使用量信息
            rawContent: content, // 保留原始content
          }
        }

        // 如果content是纯文本，作为summary展示
        return {
          missingCount: 0,
          errorCount: 0,
          formatCount: 0,
          imageCount: 0,
          missingFields: [],
          textErrors: [],
          formatIssues: [],
          missingImages: [],
          summary: content || '文档分析完成',
          score: 85,
          usage: result.usage,
          rawContent: content,
        }
      }

      // 兼容旧格式
      return {
        missingCount: result.missing_fields?.length || 0,
        errorCount: result.text_errors?.length || 0,
        formatCount: result.format_issues?.length || 0,
        imageCount: result.missing_images?.length || 0,
        missingFields: result.missing_fields || [],
        textErrors: result.text_errors || [],
        formatIssues: result.format_issues || [],
        missingImages: result.missing_images || [],
        summary: result.summary || '文档分析完成',
        score: result.quality_score || 85,
      }
    } catch (error) {
      console.error('解析工作流输出失败:', error)
      // 返回原始输出
      return {
        missingCount: 0,
        errorCount: 0,
        formatCount: 0,
        imageCount: 0,
        missingFields: [],
        textErrors: [],
        formatIssues: [],
        missingImages: [],
        summary:
          typeof output === 'string'
            ? output
            : JSON.stringify(output) || '文档分析完成',
        score: 85,
      }
    }
  }

  // 合并多个文件的分析结果
  const mergeAnalysisResults = (results: any[]) => {
    if (!results || results.length === 0) {
      return {
        missingCount: 0,
        errorCount: 0,
        formatCount: 0,
        imageCount: 0,
        missingFields: [],
        textErrors: [],
        formatIssues: [],
        missingImages: [],
        summary: '未获取到分析结果',
        score: 0,
      }
    }

    // 如果只有一个文件，直接处理其结果
    if (results.length === 1) {
      return processWorkflowOutput(results[0].result)
    }

    // 合并多个文件的结果
    const merged = {
      missingCount: 0,
      errorCount: 0,
      formatCount: 0,
      imageCount: 0,
      missingFields: [] as any[],
      textErrors: [] as any[],
      formatIssues: [] as any[],
      missingImages: [] as any[],
      summary: '',
      score: 0,
    }

    let totalScore = 0

    results.forEach((fileResult, index) => {
      const processed = processWorkflowOutput(fileResult.result)

      merged.missingCount += processed.missingCount
      merged.errorCount += processed.errorCount
      merged.formatCount += processed.formatCount
      merged.imageCount += processed.imageCount

      // 添加文件索引到每个问题项
      merged.missingFields.push(
        ...(processed.missingFields || []).map((item: any) => ({
          ...item,
          fileIndex: index + 1,
        }))
      )
      merged.textErrors.push(
        ...(processed.textErrors || []).map((item: any) => ({
          ...item,
          fileIndex: index + 1,
        }))
      )
      merged.formatIssues.push(
        ...(processed.formatIssues || []).map((item: any) => ({
          ...item,
          fileIndex: index + 1,
        }))
      )
      merged.missingImages.push(
        ...(processed.missingImages || []).map((item: any) => ({
          ...item,
          fileIndex: index + 1,
        }))
      )

      totalScore += processed.score || 0
    })

    merged.score = Math.round(totalScore / results.length)
    merged.summary = `已分析 ${results.length} 个文件，平均质量分数: ${merged.score}`

    return merged
  }

  // 使用原有 API 分析（文本输入）
  const analyzeWithCozeAPI = async () => {
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

    await callCozeAPI()
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

  // 导出单个报告（从URL下载）
  const exportSingleReport = async (url: string, fileName: string) => {
    try {
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      showToast('报告下载已开始', 'success')
    } catch (error: any) {
      console.error('下载报告失败:', error)
      showToast('下载报告失败: ' + error.message, 'error')
    }
  }

  // 批量导出报告
  const batchExportReports = async () => {
    if (allReportUrls.value.length === 0) {
      showToast('没有可导出的报告', 'warning')
      return
    }

    try {
      currentStep.value = `正在打包 ${allReportUrls.value.length} 个报告...`
      isAnalyzing.value = true

      const response = await $fetch('/api/reports/batch-export', {
        method: 'POST',
        body: {
          reportUrls: allReportUrls.value,
        },
      })

      if (response.success && response.downloadUrl) {
        // 下载ZIP文件
        const link = document.createElement('a')
        link.href = response.downloadUrl
        link.download = response.fileName || 'reports.zip'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        showToast(`成功打包 ${response.totalFiles} 个报告`, 'success')
      } else {
        throw new Error('批量导出失败')
      }
    } catch (error: any) {
      console.error('批量导出失败:', error)
      showToast('批量导出失败: ' + error.message, 'error')
    } finally {
      isAnalyzing.value = false
      currentStep.value = ''
    }
  }

  const clearResults = () => {
    analysisResult.value = null
    selectedFile.value = null
    textInput.value = ''
  }

  // 保存当前拆分的文件ID（用于后续获取拆分文件URL）
  const currentSplitFileId = ref<string | null>(null)

  // 文档拆分方法
  const splitDocument = async () => {
    if (!selectedFile.value || !isDocxFile.value) return

    // 重置进度状态
    isSplittingDocument.value = true
    splitResult.value = null
    currentSplitFileId.value = null
    splitProgress.value = { total: 0, completed: 0, percentage: 0 }
    currentFileProgress.value = { fileIndex: 0, step: '', percentage: 0 }
    progressLogs.value = []

    try {
      // 1. 上传文件
      const formData = new FormData()
      formData.append('file', selectedFile.value)

      const uploadResponse = await $fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      })

      const fileId = (uploadResponse as any).id
      const originalName = (uploadResponse as any).originalName
      currentSplitFileId.value = fileId // 保存文件ID
      progressLogs.value.push('文件上传完成，开始拆分...')

      // 2. 使用EventSource接收实时进度
      progressLogs.value.push('开始拆分处理...')

      // 尝试使用实时进度版本
      const useRealTimeProgress = true // 可以设置为false使用简单版本

      if (useRealTimeProgress) {
        await handleRealTimeProgress(fileId, originalName)
      } else {
        await handleSimpleProgress(fileId, originalName)
      }
    } catch (error: any) {
      console.error('拆分失败:', error)
      message.error(error.message || '拆分失败，请重试')
    } finally {
      isSplittingDocument.value = false
    }
  }

  // 实时进度处理方法
  const handleRealTimeProgress = (fileId: string, originalName: string) => {
    return new Promise<void>((resolve, reject) => {
      const eventSource = new EventSource(
        `/api/files/split-docx-stream?fileId=${fileId}&pagesPerFile=${
          pagesPerFile.value
        }&originalName=${encodeURIComponent(originalName)}`
      )

      eventSource.onmessage = event => {
        try {
          const data = JSON.parse(event.data)
          handleProgressMessage(data, resolve, reject, eventSource)
        } catch (e) {
          console.error('解析进度数据失败:', e)
          eventSource.close()
          reject(e)
        }
      }

      eventSource.onerror = error => {
        console.error('EventSource错误:', error)
        eventSource.close()
        reject(new Error('连接错误'))
      }

      // 5分钟超时
      setTimeout(() => {
        eventSource.close()
        reject(new Error('处理超时'))
      }, 300000)
    })
  }

  // 简单进度处理方法（备用）
  const handleSimpleProgress = async (fileId: string, originalName: string) => {
    // 调用简单版本的拆分API
    const splitResponse = await $fetch('/api/files/split-docx', {
      method: 'POST',
      body: {
        fileId: fileId,
        pagesPerFile: pagesPerFile.value,
        originalName: originalName,
      },
    })

    // 将文件ID添加到拆分结果中
    splitResult.value = {
      ...(splitResponse as any),
      fileId: currentSplitFileId.value,
    }
    progressLogs.value.push('拆分完成！')
  }

  // 处理进度消息
  const handleProgressMessage = (
    data: any,
    resolve: Function,
    reject: Function,
    eventSource: EventSource
  ) => {
    switch (data.type) {
      case 'progress':
        handleProgressUpdate(data.data)
        break
      case 'log':
        progressLogs.value.push(data.data.message)
        // 保持日志数量不超过50条
        if (progressLogs.value.length > 50) {
          progressLogs.value = progressLogs.value.slice(-50)
        }
        break
      case 'info':
        progressLogs.value.push(data.data.message)
        break
      case 'complete':
        eventSource.close()
        // 将文件ID添加到拆分结果中
        splitResult.value = {
          ...data.data,
          fileId: currentSplitFileId.value,
        }
        progressLogs.value.push('拆分完成！')
        resolve()
        break
      case 'error':
        eventSource.close()
        progressLogs.value.push('错误: ' + data.data.message)
        reject(new Error(data.data.message))
        break
    }
  }

  // 处理进度更新
  const handleProgressUpdate = (progressData: any) => {
    switch (progressData.type) {
      case 'total_files':
        splitProgress.value.total = progressData.total
        progressLogs.value.push(`总共需要拆分 ${progressData.total} 个文件`)
        break
      case 'file_start':
        currentFileProgress.value.fileIndex = progressData.current
        currentFileProgress.value.step = '开始处理'
        currentFileProgress.value.percentage = 0
        progressLogs.value.push(`开始处理第 ${progressData.current} 个文件`)
        break
      case 'file_step':
        currentFileProgress.value.fileIndex = progressData.fileIndex
        currentFileProgress.value.step = progressData.step
        currentFileProgress.value.percentage = progressData.percentage
        break
      case 'file_complete':
        splitProgress.value.completed = progressData.completed
        splitProgress.value.percentage = Math.round(
          (progressData.completed / progressData.total) * 100
        )
        currentFileProgress.value.percentage = 100
        progressLogs.value.push(
          `完成第 ${progressData.completed} 个文件 (共 ${progressData.total} 个)`
        )
        break
      case 'all_complete':
        splitProgress.value.completed = progressData.completed
        splitProgress.value.percentage = 100
        currentFileProgress.value.percentage = 100
        currentFileProgress.value.step = '所有文件拆分完成'
        break
      case 'zip_start':
        currentFileProgress.value.fileIndex = 0
        currentFileProgress.value.step = '创建ZIP文件'
        currentFileProgress.value.percentage = 0
        progressLogs.value.push('开始创建ZIP压缩包...')
        break
      case 'zip_progress':
        currentFileProgress.value.step = `打包文件: ${progressData.fileName}`
        currentFileProgress.value.percentage = progressData.percentage
        if (
          progressData.current % 5 === 0 ||
          progressData.current === progressData.total
        ) {
          progressLogs.value.push(
            `正在打包: ${progressData.current}/${progressData.total} 个文件`
          )
        }
        break
    }
  }

  // 下载拆分后的文件
  const downloadSplitFiles = () => {
    if (!splitResult.value || !splitResult.value.downloadUrl) return

    // 创建下载链接
    const link = document.createElement('a')
    link.href = splitResult.value.downloadUrl
    link.download = 'split_documents.zip'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // 通用文件下载函数
  const downloadFile = (
    content: string,
    filename: string,
    mimeType: string
  ) => {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }
</script>
