<script setup lang="ts">
import { vEntrance } from '@/utils/entrance'
import { computed, ref } from 'vue'
import { siteConfig } from '@/config/site'
import { matchesSearch } from '@/utils/search'
import ProjectCard from '@/components/content/ProjectCard.vue'
import SaveButton from '@/components/content/SaveButton.vue'
import SearchField from '@/components/ui/SearchField.vue'
const query = ref(''),
  tag = ref('全部')
const projects = siteConfig.sections.projects.items.filter((p) => p.enabled)
const tags = ['全部', ...new Set(projects.flatMap((p) => p.technologies))]
const filtered = computed(() =>
  projects.filter(
    (p) =>
      (tag.value === '全部' || p.technologies.includes(tag.value)) &&
      matchesSearch(p.title + ' ' + p.description + ' ' + p.technologies.join(' '), query.value),
  ),
)
</script>
<template>
  <div class="projects-view page-shell page-content">
    <header class="showroom-heading">
      <div>
        <span class="material-label">作品陈列室</span>
        <h1>把小想法，<br />做成有用的作品。</h1>
        <p>机器人、服务器与中文文档。从一个想法，到真正能用的工具。</p>
      </div>
    </header>
    <SearchField
      v-model="query"
      label="搜索作品"
      name="project-search"
      placeholder="作品名、用途或技术栈"
    />
    <div class="project-filters">
      <button
        v-for="value in tags"
        :key="value"
        type="button"
        class="chip"
        :aria-pressed="tag === value"
        @click="tag = value"
      >
        {{ value }}
      </button>
    </div>
    <p role="status" class="muted">{{ filtered.length }} 件真实作品</p>
    <div v-entrance class="showroom-grid">
      <div v-for="(item, index) in filtered" :key="item.id">
        <ProjectCard
          :item="item"
          :tone="(['rose', 'blue', 'mint'] as const)[index % 3]"
        /><SaveButton :id="'project-' + item.id" />
      </div>
    </div>
    <p v-if="!filtered.length" class="project-empty">
      没有找到这件作品。试试更短的关键词，或切回全部。
    </p>
  </div>
</template>
<style scoped>
.showroom-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
  margin-bottom: 2rem;
}
.showroom-heading h1 {
  font-size: var(--text-2xl);
}
.showroom-heading p {
  margin-top: 1rem;
  color: var(--color-text-secondary);
  max-width: 36rem;
}

.project-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 1rem 0;
}
.showroom-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}
.showroom-grid > div {
  min-width: 0;
}
.showroom-grid .save-button {
  margin-top: 1.2rem;
}
.project-empty {
  padding: 3rem 0;
}
.projects-view > .search-field {
  max-width: 38rem;
}
@media (max-width: 1000px) {
  .showroom-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 600px) {
  .showroom-grid {
    grid-template-columns: 1fr;
  }

  .showroom-heading {
    gap: 1rem;
    align-items: flex-start;
  }
  .showroom-heading p {
    font-size: var(--text-sm);
  }
}
</style>
