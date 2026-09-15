<script setup lang="ts">
import { computed, ref } from 'vue'
import { searchEntries, type SearchEntry } from '@/utils/search'
import SaveButton from './SaveButton.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import IconGlyph from '@/components/ui/IconGlyph.vue'

const category = ref('全部')
const current = ref<SearchEntry>()
const drawn = new Set<string>()
const candidates = computed(() =>
  searchEntries.filter((e) => category.value === '全部' || e.group === category.value),
)
function setCategory(group: string) {
  category.value = group
  drawn.clear()
  current.value = undefined
}
function draw() {
  let pool = candidates.value.filter((e) => !drawn.has(e.id))
  if (!pool.length) {
    drawn.clear()
    pool = candidates.value
  }
  if (!pool.length) {
    current.value = undefined
    return
  }
  const item = pool[Math.floor(Math.random() * pool.length)]!
  drawn.add(item.id)
  current.value = item
}
</script>
<template>
  <section id="discovery" class="discovery-machine">
    <div class="discovery-machine__intro">
      <span class="jelly-icon"><IconGlyph name="sparkles" :size="28" /></span>
      <div>
        <h2>让好奇心带个路</h2>
        <p>从真实文章、作品和站点里，抽一张灵感签。</p>
      </div>
    </div>
    <div class="discovery-filters" aria-label="抽签内容">
      <button
        v-for="group in ['全部', '文章', '项目', '站点']"
        :key="group"
        type="button"
        class="chip"
        :aria-pressed="category === group"
        @click="setCategory(group)"
      >
        {{ group }}
      </button>
    </div>
    <BaseButton class="draw-button" :disabled="!candidates.length" @click="draw"
      >抽一张 →</BaseButton
    >
    <div v-if="current" :key="current.id" class="discovery-ticket" role="status">
      <span>{{ current.group }} · 今日偶遇</span>
      <h3>{{ current.title }}</h3>
      <p>{{ current.description }}</p>
      <div>
        <RouterLink v-if="current.href.startsWith('/')" :to="current.href" class="text-link"
          >去看看 →</RouterLink
        ><a v-else :href="current.href" target="_blank" rel="noopener noreferrer" class="text-link"
          >打开站点 ↗</a
        ><SaveButton :id="current.id" />
      </div>
    </div>
    <p v-if="!candidates.length">这里还没有可抽取的内容。</p>
  </section>
</template>
<style scoped>
.discovery-machine {
  position: relative;
  padding: 2rem;
  border: 1px solid var(--color-rim);
  border-radius: var(--radius-jelly);
  background: linear-gradient(135deg, rgb(var(--tone-blue) / 0.22), var(--color-surface-glass) 60%);
  box-shadow: var(--shadow-card);
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 1rem;
  align-items: center;
}
.discovery-machine__intro {
  display: flex;
  align-items: center;
  gap: 1rem;
  grid-column: 1/-1;
}
.discovery-machine__intro > svg {
  width: 5rem;
  flex-shrink: 0;
}
.discovery-machine h2 {
  font-size: var(--text-xl);
}
.discovery-machine p {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}
.discovery-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}
.draw-button {
  justify-self: end;
}
.discovery-ticket {
  grid-column: 1/-1;
  position: relative;
  padding: 1.3rem 1.5rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-medium);
  background: var(--color-surface);
  animation: ticket-out 400ms var(--ease-spring);
}
.discovery-ticket > span {
  font-size: var(--text-xs);
  color: var(--color-link);
}
.discovery-ticket > div {
  display: flex;
  gap: 1rem;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.7rem;
}
.discovery-ticket h3 {
  margin: 0.4rem 0;
  font-size: var(--text-lg);
}
@keyframes ticket-out {
  from {
    transform: translateY(6px);
    opacity: 0.4;
  }
  to {
    transform: none;
    opacity: 1;
  }
}
@media (max-width: 600px) {
  .discovery-machine {
    padding: 1.2rem;
    grid-template-columns: 1fr;
  }
  .draw-button {
    justify-self: end;
  }
  .discovery-machine__intro {
    align-items: flex-start;
  }
  .discovery-machine__intro > svg {
    width: 3.5rem;
  }
}
</style>
