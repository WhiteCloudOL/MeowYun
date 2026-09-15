<script setup lang="ts">
import { computed, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { siteConfig } from '@/config/site'
import { articles } from '@/content/articles'
import { updateSeo } from '@/utils/seo'
import { usePocket } from '@/composables/usePocket'
import ProjectCard from '@/components/content/ProjectCard.vue'
import SaveButton from '@/components/content/SaveButton.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
const route = useRoute(),
  { earn } = usePocket()
const project = computed(() =>
  siteConfig.sections.projects.items.find((p) => p.enabled && p.id === route.params.slug),
)
const related = computed(() =>
  articles.filter((a) =>
    project.value?.technologies.some(
      (t) =>
        a.tags.some((tag) => tag.toLowerCase() === t.toLowerCase()) ||
        a.title.toLowerCase().includes(t.toLowerCase()),
    ),
  ),
)
watchEffect(() => {
  if (project.value) {
    earn('project-visit')
    updateSeo({
      title: project.value.title + ' · ' + siteConfig.meta.name,
      description: project.value.description,
      path: '/projects/' + project.value.id,
    })
  } else updateSeo({ title: '作品未找到 · ' + siteConfig.meta.name, noIndex: true })
})
</script>
<template>
  <div class="project-view page-shell page-content">
    <template v-if="project"
      ><RouterLink to="/projects" class="text-link">← 回到作品陈列室</RouterLink>
      <section class="project-sleeve">
        <div class="project-sleeve__art">
          <ProjectCard :item="project" featured static-cover />
          <p>项目主题卡片</p>
        </div>
        <div class="project-sleeve__copy">
          <span class="material-label">作品详情</span>
          <h1>{{ project.title }}</h1>
          <p class="project-description">{{ project.description }}</p>
          <p v-if="project.audience">适用范围：{{ project.audience }}</p>
          <p v-if="project.note">{{ project.note }}</p>
          <div class="project-technologies">
            <span v-for="tech in project.technologies" :key="tech" class="chip">{{ tech }}</span>
          </div>
          <p v-if="project.status" class="muted">{{ project.status }}</p>
          <time v-if="project.updatedAt">{{ project.updatedAt }}</time>
          <div class="project-actions">
            <a :href="project.href" target="_blank" rel="noopener noreferrer" class="cottage-button"
              >打开项目仓库 ↗</a
            ><SaveButton :id="'project-' + project.id" />
          </div>
          <p class="project-source">
            项目说明来自站长配置。安装步骤、兼容要求与使用许可，请以仓库文档为准。
          </p>
        </div>
      </section>
      <section v-if="related.length" class="related-project-notes">
        <h2>相关实践文章</h2>
        <p class="muted">按共同技术标签或标题关键词关联。</p>
        <RouterLink
          v-for="article in related"
          :key="article.slug"
          :to="'/articles/' + article.slug"
          class="text-link"
          >{{ article.title }} →</RouterLink
        >
      </section></template
    ><EmptyState
      v-else
      title="没有找到这件作品"
      description="作品可能已移动，回到陈列室再找找。"
      icon="folder"
      ><RouterLink to="/projects" class="cottage-button">回到作品陈列室</RouterLink></EmptyState
    >
  </div>
</template>
<style scoped>
.project-sleeve {
  display: grid;
  grid-template-columns: 0.85fr 1.15fr;
  gap: 3rem;
  align-items: center;
  margin-top: 2rem;
  padding: 2.5rem;
  border: 1px solid var(--color-rim);
  border-radius: var(--radius-jelly);
  background: linear-gradient(135deg, rgb(var(--tone-blue) / 0.2), var(--color-surface-glass) 60%);
  box-shadow: var(--shadow-card);
}
.project-sleeve__art {
  min-width: 0;
}
.project-sleeve__art > p {
  font-size: var(--text-xs);
  text-align: center;
  margin-top: 1.2rem;
  color: var(--color-text-muted);
}
.project-sleeve h1 {
  font-size: var(--text-2xl);
}
.project-description {
  margin: 1.2rem 0;
  font-size: var(--text-lg);
}
.project-technologies {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 1.3rem 0;
}
.project-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-top: 1.5rem;
}
.project-source {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  margin-top: 1.5rem;
}
.related-project-notes {
  margin-top: 4rem;
  display: grid;
  justify-items: start;
  gap: 0.5rem;
}
.related-project-notes h2 {
  font-size: var(--text-xl);
}
@media (max-width: 800px) {
  .project-sleeve {
    grid-template-columns: 1fr;
    padding: 1.5rem;
    gap: 2.5rem;
  }
  .project-sleeve__art {
    max-width: 30rem;
    width: 100%;
    margin: auto;
  }
}
</style>
