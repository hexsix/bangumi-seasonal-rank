<template>
  <div class="flex justify-center items-center" :class="containerClass">
    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    <span v-if="text" class="ml-3 text-gray-600">{{ text }}</span>
  </div>
</template>

<script setup lang="ts">
defineProps({
  text: {
    type: String,
    default: ''
  },
  containerClass: {
    type: String,
    default: 'min-h-64'
  }
})
</script> 