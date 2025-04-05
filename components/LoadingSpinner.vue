<template>
  <div class="flex justify-center items-center py-10">
    <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    <span class="ml-3 text-lg">{{ message }}</span>
  </div>
</template>

<script>
export default {
  props: {
    message: {
      type: String,
      default: '加载中...'
    }
  }
}
</script> 