<script setup lang="ts">
import { computed, ref } from 'vue'
import { siteConfig } from '@/config/site'
import { matchesSearch } from '@/utils/search'
import LinkCard from '@/components/content/LinkCard.vue'
import ProjectCard from '@/components/content/ProjectCard.vue'
import IconGlyph from '@/components/ui/IconGlyph.vue'
const query = ref('')
const siteLinks = computed(() =>
  siteConfig.sections.navigation.items.filter(
    (x) => x.enabled && matchesSearch(x.title + ' ' + x.description, query.value),
  ),
)
const projects = computed(() =>
  siteConfig.sections.projects.items.filter(
    (x) =>
      x.enabled &&
      matchesSearch(x.title + ' ' + x.description + ' ' + x.technologies.join(' '), query.value),
  ),
)
</script>
<template>
  <div class="navigation-view page-shell page-content">
    <header class="page-heading paper">
      <p class="eyebrow">收藏入口，也收纳作品</p>
      <h1>导航与作品索引</h1>
      <p>文档、服务与开源项目，都可以从这里找到。</p>
    </header>
    <label class="search-field navigation-search"
      ><IconGlyph name="search" /><span class="sr-only">查找站点与作品</span
      ><input v-model="query" type="search" placeholder="查找站点、作品或技术"
    /></label>
    <p v-if="query" class="result-count" role="status">
      找到
      {{
        (siteConfig.sections.navigation.enabled ? siteLinks.length : 0) +
        (siteConfig.sections.projects.enabled ? projects.length : 0)
      }}
      个入口
    </p>
    <section
      v-if="siteConfig.sections.navigation.enabled"
      id="sites"
      class="navigation-section"
      aria-labelledby="sites-title"
    >
      <div class="section-heading">
        <h2 id="sites-title">{{ siteConfig.sections.navigation.title }}</h2>
      </div>
      <div class="link-grid">
        <LinkCard v-for="item in siteLinks" :key="item.id" :item="item" />
      </div>
      <p v-if="!siteLinks.length" class="muted">没有匹配的站点入口。</p>
    </section>
    <section
      v-if="siteConfig.sections.projects.enabled"
      id="projects"
      class="navigation-section"
      aria-labelledby="projects-title"
    >
      <div class="section-heading">
        <h2 id="projects-title">全部作品</h2>
        <span class="muted">{{ projects.length }} 个开源项目</span>
      </div>
      <div class="project-grid">
        <ProjectCard v-for="item in projects" :key="item.id" :item="item" />
      </div>
      <p v-if="!projects.length" class="muted">没有匹配的作品，试试更短的关键词。</p>
    </section>
  </div>
</template>
<style scoped>
.navigation-view .page-heading {
  max-width: none;
  margin-bottom: 1.5rem;
}
.navigation-search {
  max-width: 34rem;
}
.navigation-section {
  margin-top: 2.5rem;
}
.link-grid,
.project-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.25rem;
}
.result-count {
  margin-top: 1rem;
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}
@media (max-width: 700px) {
  .link-grid,
  .project-grid {
    grid-template-columns: 1fr;
  }
}
</style>
