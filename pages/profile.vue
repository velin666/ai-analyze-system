<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 页面头部 -->
    <div class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">个人资料</h1>
            <p class="text-gray-600 mt-1">管理您的个人信息和账户设置</p>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- 头像和基本信息 -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div class="text-center">
              <!-- 头像 -->
              <div class="w-24 h-24 mx-auto bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-4">
                <span class="text-white text-2xl font-bold">{{ user?.name?.charAt(0) || 'D' }}</span>
              </div>
              
              <h3 class="text-lg font-semibold text-gray-900">{{ user?.name || 'Demo User' }}</h3>
              <p class="text-gray-500">{{ user?.role || '资料员' }}</p>
              
              <button class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                更换头像
              </button>
            </div>
            
            <!-- 快速统计 -->
            <div class="mt-6 pt-6 border-t border-gray-200">
              <div class="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p class="text-2xl font-bold text-gray-900">128</p>
                  <p class="text-xs text-gray-500">管理资料</p>
                </div>
                <div>
                  <p class="text-2xl font-bold text-gray-900">45</p>
                  <p class="text-xs text-gray-500">检查项目</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 详细信息表单 -->
        <div class="lg:col-span-2">
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-6">基本信息</h3>
            
            <form @submit.prevent="updateProfile" class="space-y-6">
              <!-- 姓名 -->
              <div>
                <label for="name" class="block text-sm font-medium text-gray-700 mb-2">姓名</label>
                <input
                  id="name"
                  v-model="form.name"
                  type="text"
                  class="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="请输入姓名"
                />
              </div>

              <!-- 邮箱 -->
              <div>
                <label for="email" class="block text-sm font-medium text-gray-700 mb-2">邮箱</label>
                <input
                  id="email"
                  v-model="form.email"
                  type="email"
                  class="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="请输入邮箱地址"
                />
              </div>

              <!-- 电话 -->
              <div>
                <label for="phone" class="block text-sm font-medium text-gray-700 mb-2">联系电话</label>
                <input
                  id="phone"
                  v-model="form.phone"
                  type="tel"
                  class="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="请输入联系电话"
                />
              </div>

              <!-- 部门 -->
              <div>
                <label for="department" class="block text-sm font-medium text-gray-700 mb-2">所属部门</label>
                <select
                  id="department"
                  v-model="form.department"
                  class="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">请选择部门</option>
                  <option value="工程部">工程部</option>
                  <option value="质量部">质量部</option>
                  <option value="安全部">安全部</option>
                  <option value="资料部">资料部</option>
                </select>
              </div>

              <!-- 职位 -->
              <div>
                <label for="position" class="block text-sm font-medium text-gray-700 mb-2">职位</label>
                <input
                  id="position"
                  v-model="form.position"
                  type="text"
                  class="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="请输入职位"
                />
              </div>

              <!-- 个人简介 -->
              <div>
                <label for="bio" class="block text-sm font-medium text-gray-700 mb-2">个人简介</label>
                <textarea
                  id="bio"
                  v-model="form.bio"
                  rows="4"
                  class="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="请输入个人简介"
                ></textarea>
              </div>

              <!-- 提交按钮 -->
              <div class="flex items-center justify-end space-x-3">
                <button
                  type="button"
                  class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  保存更改
                </button>
              </div>
            </form>
          </div>

          <!-- 密码修改 -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-8">
            <h3 class="text-lg font-semibold text-gray-900 mb-6">修改密码</h3>
            
            <form @submit.prevent="updatePassword" class="space-y-6">
              <!-- 当前密码 -->
              <div>
                <label for="currentPassword" class="block text-sm font-medium text-gray-700 mb-2">当前密码</label>
                <input
                  id="currentPassword"
                  v-model="passwordForm.currentPassword"
                  type="password"
                  class="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="请输入当前密码"
                />
              </div>

              <!-- 新密码 -->
              <div>
                <label for="newPassword" class="block text-sm font-medium text-gray-700 mb-2">新密码</label>
                <input
                  id="newPassword"
                  v-model="passwordForm.newPassword"
                  type="password"
                  class="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="请输入新密码"
                />
              </div>

              <!-- 确认密码 -->
              <div>
                <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-2">确认新密码</label>
                <input
                  id="confirmPassword"
                  v-model="passwordForm.confirmPassword"
                  type="password"
                  class="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="请再次输入新密码"
                />
              </div>

              <!-- 提交按钮 -->
              <div class="flex items-center justify-end">
                <button
                  type="submit"
                  class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  修改密码
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

// 用户信息
const user = ref<any>(null)

// 表单数据
const form = ref({
  name: '',
  email: '',
  phone: '',
  department: '',
  position: '',
  bio: ''
})

// 密码表单
const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

onMounted(() => {
  // 加载用户信息
  const userData = localStorage.getItem('user')
  if (userData) {
    user.value = JSON.parse(userData)
    // 填充表单数据
    form.value = {
      name: user.value.name || '',
      email: user.value.email || 'demo@example.com',
      phone: user.value.phone || '',
      department: user.value.department || '',
      position: user.value.position || '资料员',
      bio: user.value.bio || ''
    }
  }
})

// 更新个人资料
const updateProfile = () => {
  // 更新用户信息
  const updatedUser = {
    ...user.value,
    ...form.value
  }
  localStorage.setItem('user', JSON.stringify(updatedUser))
  user.value = updatedUser
  
  alert('个人资料更新成功！')
}

// 修改密码
const updatePassword = () => {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    alert('两次输入的密码不一致！')
    return
  }
  
  if (passwordForm.value.newPassword.length < 6) {
    alert('密码长度不能少于6位！')
    return
  }
  
  // 模拟密码修改
  alert('密码修改成功！')
  passwordForm.value = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  }
}

// 页面标题
useHead({
  title: '个人资料 - 工地资料管理系统'
})
</script>
