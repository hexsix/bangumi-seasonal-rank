<template>
  <div v-if="error" class="flex justify-center items-center min-h-64">
    <div class="text-center">
      <div class="text-red-500 text-lg mb-4">{{ error.message || '发生错误' }}</div>
      <button class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors" @click="handleRetry">
        重试
      </button>
    </div>
  </div>
  <slot v-else />
</template>

<script setup lang="ts">
defineProps({
  error: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['retry'])

const handleRetry = () => {
  emit('retry')
}
</script> 