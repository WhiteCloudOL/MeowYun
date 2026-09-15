<script setup lang="ts">
import EmptyState from '@/components/ui/EmptyState.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
</script>
<template>
  <div class="page-shell page-content">
    <EmptyState
      label="404 · 页面未找到"
      title="这片云里没有页面"
      description="地址可能写错了，或者页面已经移动。可以回到首页，或在文章归档中继续找找。"
      ><BaseButton to="/">回到首页</BaseButton
      ><BaseButton to="/articles" variant="secondary">浏览文章</BaseButton></EmptyState
    >
  </div>
</template>
