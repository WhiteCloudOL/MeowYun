<script setup lang="ts">
defineProps<{
  eyebrow: string
  title: string
  description?: string
}>()
</script>

<template>
  <header class="section-title">
    <p class="eyebrow">{{ eyebrow }}</p>
    <h2>{{ title }}</h2>
    <p v-if="description" class="section-title__description">{{ description }}</p>
  </header>
</template>

<style scoped>
.section-title {
  display: grid;
  gap: var(--space-3);
}

.section-title h2 {
  font-size: var(--text-2xl);
  font-weight: 780;
  letter-spacing: -0.035em;
  line-height: 1.15;
}

.section-title__description {
  max-width: 36rem;
  color: var(--color-text-secondary);
}
</style>
