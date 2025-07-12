<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 头部导航 -->
    <LayoutHeader />

    <!-- 主要内容区域 -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <slot />
    </main>

    <!-- 底部 -->
    <LayoutFooter />
  </div>
</template>

<script setup lang="ts">
// 设置页面元数据
useHead({
  title: 'Bangumi 新番排行榜',
  meta: [
    { name: 'description', content: 'Bangumi.tv动画季度排行榜展示网站，实时获取最新动画排行数据' }
  ]
})
</script>