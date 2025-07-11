<template>
  <div v-if="error" class="flex justify-center items-center min-h-64">
    <div class="text-center max-w-md">
      <!-- 错误图标 -->
      <div class="text-red-500 text-4xl mb-4">
        <svg class="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
      </div>
      
      <!-- 错误类型和消息 -->
      <div class="text-red-500 text-lg mb-2 font-semibold">
        {{ getErrorTitle() }}
      </div>
      <div class="text-gray-600 mb-4">{{ error.message || '发生未知错误' }}</div>
      
      <!-- 错误详情（开发环境显示） -->
      <div v-if="showErrorDetails" class="text-left bg-gray-100 p-3 rounded text-sm mb-4">
        <div class="font-semibold mb-2">错误详情:</div>
        <div class="text-gray-700">
          <div><strong>类型:</strong> {{ getErrorType() }}</div>
          <div v-if="error.status"><strong>状态码:</strong> {{ error.status }}</div>
          <div v-if="error.statusText"><strong>状态:</strong> {{ error.statusText }}</div>
          <div v-if="retryCount > 0"><strong>重试次数:</strong> {{ retryCount }}</div>
        </div>
      </div>
      
      <!-- 操作按钮 -->
      <div class="space-y-2">
        <button 
          v-if="isRetryable"
          :disabled="isRetrying"
          class="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          @click="handleRetry"
        >
          <span v-if="isRetrying">重试中...</span>
          <span v-else>智能重试</span>
        </button>
        
        <button 
          class="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
          @click="handleForceRetry"
        >
          强制刷新
        </button>
        
        <button 
          v-if="!showErrorDetails"
          class="w-full px-3 py-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          @click="showErrorDetails = true"
        >
          显示错误详情
        </button>
      </div>
    </div>
  </div>
  <slot v-else />
</template>

<script setup lang="ts">
const props = defineProps({
  error: {
    type: Object,
    default: null
  },
  isRetrying: {
    type: Boolean,
    default: false
  },
  retryCount: {
    type: Number,
    default: 0
  },
  isRetryable: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['retry', 'forceRetry'])

const showErrorDetails = ref(false)

// 获取错误标题
const getErrorTitle = () => {
  if (props.error?.type === 'cors') return '跨域请求错误'
  if (props.error?.type === 'network') return '网络连接错误'
  if (props.error?.type === 'api') return 'API请求错误'
  if (props.error?.status === 404) return '资源未找到'
  if (props.error?.status >= 500) return '服务器错误'
  return '请求失败'
}

// 获取错误类型
const getErrorType = () => {
  if (props.error?.type) return props.error.type
  if (props.error?.status >= 500) return 'server'
  if (props.error?.status >= 400) return 'client'
  return 'unknown'
}

// 智能重试
const handleRetry = () => {
  if (!props.isRetrying && props.isRetryable) {
    emit('retry')
  }
}

// 强制刷新
const handleForceRetry = () => {
  emit('forceRetry')
}
</script> 