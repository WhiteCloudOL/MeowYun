<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { siteConfig } from '@/config/site'
import { matchesSearch } from '@/utils/search'
import { readPreference, writePreference } from '@/utils/preferences'
import SearchField from '@/components/ui/SearchField.vue'
import SaveButton from '@/components/content/SaveButton.vue'
import ConfigIcon from '@/components/ui/ConfigIcon.vue'
const route = useRoute(),
  router = useRouter()
const query = ref(''),
  view = ref(readPreference('meowyun-nav-view') === 'list' ? 'list' : 'map'),
  selected = ref('')
const all = siteConfig.sections.navigation.enabled
  ? siteConfig.sections.navigation.items.filter((x) => x.enabled)
  : []
const links = computed(() =>
  all.filter((x) => matchesSearch(x.title + ' ' + x.description, query.value)),
)
const active = computed(() => links.value.find((x) => x.id === selected.value))
function groupFor(id: string) {
  return id.includes('docs') ? '知识与文档' : id.includes('rainyun') ? '第三方服务' : '小屋的服务'
}
const groups = computed(() =>
  [...new Set(links.value.map((x) => groupFor(x.id)))].map((name) => ({
    name,
    items: links.value.filter((x) => groupFor(x.id) === name),
  })),
)
function setView(value: string) {
  view.value = value
  writePreference('meowyun-nav-view', value)
}
watch(
  () => route.hash,
  (hash) => {
    const id = hash.slice('#project-'.length)
    if (
      hash.startsWith('#project-') &&
      siteConfig.sections.projects.items.some((p) => p.enabled && p.id === id)
    )
      void router.replace('/projects/' + id)
  },
  { immediate: true },
)
</script>
<template>
  <div class="navigation-view page-shell page-content">
    <header class="star-heading">
      <span class="material-label material-label--blue">星图导航</span>
      <h1>沿着星光，去看看。</h1>
      <p>真实站点组成的小小星群。点选一颗星，看看它通往哪里。</p>
    </header>
    <div class="navigation-toolbar">
      <SearchField
        v-model="query"
        label="查找站点"
        name="navigation-search"
        placeholder="站点名或用途"
      />
      <div>
        <button type="button" class="chip" :aria-pressed="view === 'map'" @click="setView('map')">
          星图</button
        ><button
          type="button"
          class="chip"
          :aria-pressed="view === 'list'"
          @click="setView('list')"
        >
          高效列表
        </button>
      </div>
    </div>
    <p role="status" class="result-count">{{ links.length }} 个真实入口</p>
    <section v-if="view === 'map'" class="constellation" aria-label="按用途分组的站点星图">
      <div v-for="group in groups" :key="group.name" class="star-group">
        <h2>{{ group.name }}</h2>
        <div class="star-nodes">
          <button
            v-for="item in group.items"
            :key="item.id"
            type="button"
            class="star-node"
            :aria-pressed="active?.id === item.id"
            @click="selected = item.id"
          >
            <span class="star-symbol"
              ><ConfigIcon :name="item.icon" :provider="item.iconProvider" :size="26" /></span
            ><span>{{ item.title }}</span>
          </button>
        </div>
      </div>
      <p v-if="!links.length">星图里没有匹配的入口，试试更短的关键词。</p>
    </section>
    <article v-if="view === 'map' && active" class="selected-star" aria-live="polite">
      <div>
        <span class="material-label">{{ groupFor(active.id) }}</span>
        <h2>{{ active.title }}</h2>
        <p>{{ active.description }}</p>
      </div>
      <a
        :href="active.href"
        target="_blank"
        rel="noopener noreferrer"
        class="cottage-button cottage-button--blue"
        >打开这个站点 ↗</a
      ><SaveButton :id="'site-' + active.id" />
    </article>
    <p v-else-if="view === 'map'" class="star-hint">
      点选星点后显示用途与访问按钮，也可以切到列表直接浏览。
    </p>
    <div v-if="view === 'list'" class="navigation-list">
      <article v-for="item in links" :key="item.id">
        <ConfigIcon :name="item.icon" :provider="item.iconProvider" :size="26" />
        <div>
          <h2>
            <a :href="item.href" target="_blank" rel="noopener noreferrer">{{ item.title }} ↗</a>
          </h2>
          <p>{{ item.description }}</p>
        </div>
        <SaveButton :id="'site-' + item.id" compact />
      </article>
      <p v-if="!links.length">没有匹配的站点入口。</p>
    </div>
    <section id="projects" class="navigation-project-move">
      <h2>还有这些作品</h2>
      <p>查看项目介绍、使用范围与相关实践，也可以收藏后再读。</p>
      <RouterLink to="/projects" class="text-link">打开作品陈列室 →</RouterLink>
      <div>
        <RouterLink
          v-for="project in siteConfig.sections.projects.items.filter((p) => p.enabled)"
          :id="'project-' + project.id"
          :key="project.id"
          :to="'/projects/' + project.id"
          class="chip"
          >{{ project.title }}</RouterLink
        >
      </div>
    </section>
  </div>
</template>
<style scoped>
.star-heading {
  margin-bottom: 2rem;
}
.star-heading h1 {
  font-size: var(--text-2xl);
}
.star-heading p {
  margin-top: 0.8rem;
  color: var(--color-text-secondary);
}
.navigation-toolbar {
  display: flex;
  gap: 1rem;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
}
.navigation-toolbar > .search-field {
  flex: 1;
  min-width: 14rem;
}
.navigation-toolbar > div:last-child {
  display: flex;
  gap: 0.5rem;
}
.result-count {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  margin: 1rem 0;
}
.constellation {
  position: relative;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.5rem;
  padding: 2rem;
  background: linear-gradient(
    135deg,
    rgb(var(--tone-blue) / 0.28),
    var(--color-surface-glass),
    rgb(var(--tone-lilac) / 0.2)
  );
  border: 1px solid var(--color-rim);
  border-radius: var(--radius-jelly);
  color: var(--color-text);
  box-shadow: var(--shadow-card);
}
.star-group {
  min-width: 0;
  text-align: center;
  padding: 1rem 0.5rem;
}
.star-group h2 {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text-secondary);
  letter-spacing: 0.15em;
}
.star-nodes {
  position: relative;
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 1rem;
}
.star-nodes::before {
  content: '';
  position: absolute;
  top: 42%;
  left: 20%;
  right: 20%;
  border-top: 1px solid var(--color-border);
  transform: rotate(-12deg);
}
.star-node {
  position: relative;
  display: grid;
  justify-items: center;
  gap: 0.7rem;
  width: 8rem;
  min-height: 110px;
  padding: 0.5rem;
  border: 0;
  background: transparent;
  color: var(--color-text);
  font-size: var(--text-sm);
}
.star-symbol {
  display: grid;
  place-items: center;
  width: 60px;
  height: 60px;
  border: 1px solid var(--color-rim);
  border-radius: 42% 55% 44% 52%;
  background: rgb(var(--tone-blue) / 0.5);
  box-shadow: var(--shadow-card);
  transition:
    transform 220ms,
    background 220ms;
}
.star-node:hover .star-symbol,
.star-node[aria-pressed='true'] .star-symbol {
  background: rgb(var(--tone-rose) / 0.65);
  box-shadow: 0 0 0 3px var(--color-link);
}
.selected-star {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 2rem;
  padding: 1.5rem;
  border: 1px solid var(--color-rim);
  border-radius: var(--radius-large);
  background: var(--color-surface-glass);
  box-shadow: var(--shadow-card);
}
.selected-star > div {
  flex: 1;
  min-width: 14rem;
}
.selected-star h2 {
  font-size: var(--text-xl);
}
.selected-star p {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  margin-top: 0.5rem;
}
.star-hint {
  margin: 1.5rem 0;
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}
.navigation-list article {
  display: flex;
  gap: 1.3rem;
  align-items: center;
  padding: 1.5rem 0;
  border-bottom: 1px solid var(--color-border);
}
.navigation-list article > div {
  flex: 1;
}
.navigation-list h2 {
  font-size: var(--text-lg);
}
.navigation-list h2 a {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
}
.navigation-list p {
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
}
.navigation-project-move {
  margin-top: 4rem;
  padding-top: 2rem;
  border-top: 1px solid var(--color-border);
}
.navigation-project-move h2 {
  font-size: var(--text-xl);
}
.navigation-project-move p {
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
  margin-top: 0.7rem;
}
.navigation-project-move > div {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
}
@media (max-width: 800px) {
  .constellation {
    grid-template-columns: 1fr;
    padding: 1.5rem;
    border-radius: 35px 12px;
  }
  .star-group {
    padding: 0.5rem;
  }
  .star-nodes {
    gap: 2rem;
    margin-top: 0.7rem;
  }
  .star-group + .star-group {
    border-top: 1px dashed var(--color-border);
    padding-top: 1.5rem;
  }
}
</style>
