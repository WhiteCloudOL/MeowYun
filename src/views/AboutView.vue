<script setup lang="ts">
import { siteConfig } from '@/config/site'
import CloudAvatar from '@/components/ui/CloudAvatar.vue'
import ConfigIcon from '@/components/ui/ConfigIcon.vue'
import ProjectCard from '@/components/content/ProjectCard.vue'
import ContributionCalendar from '@/components/home/ContributionCalendar.vue'
const { profile, sections } = siteConfig
</script>
<template>
  <div class="about-view page-shell page-content">
    <header class="owner-folder">
      <div class="owner-portrait">
        <CloudAvatar :src="profile.avatar" :alt="profile.avatarAlt" loading="eager" />
        <p>{{ profile.handle }}</p>
      </div>
      <div>
        <span class="folder-tab">关于我</span>
        <h1>你好，我是<br />{{ profile.name }}。</h1>
        <p>{{ profile.tagline }}</p>
        <p>{{ sections.about.description }}</p>
        <p v-if="profile.location" class="muted">⌖ {{ profile.location }}</p>
        <div class="owner-contact">
          <a
            v-for="social in profile.socials.filter((s) => s.enabled)"
            :key="social.id"
            :href="social.href"
            :target="social.href.startsWith('mailto:') ? undefined : '_blank'"
            rel="noopener noreferrer"
            class="text-link"
            ><ConfigIcon :name="social.icon" :provider="social.iconProvider" :size="18" />{{
              social.label
            }}</a
          >
        </div>
        <RouterLink to="/postoffice" class="cottage-button">写封信，聊聊 →</RouterLink>
      </div>
    </header>
    <section class="about-interests">
      <h2>常用技术与工具</h2>
      <p>真实的技术方向，不用百分比定义熟练度。</p>
      <div class="skill-list">
        <RouterLink
          v-for="skill in sections.skills.items.filter((s) => s.enabled)"
          :key="skill.label"
          to="/projects"
          class="chip"
          >{{ skill.label }}</RouterLink
        >
      </div>
    </section>
    <section v-if="sections.projects.enabled">
      <header class="cottage-section-heading">
        <h2>从这些作品认识我</h2>
        <RouterLink to="/projects" class="text-link">全部作品 →</RouterLink>
      </header>
      <div class="owner-projects">
        <ProjectCard
          v-for="(project, index) in sections.projects.items.filter((p) => p.enabled).slice(0, 3)"
          :key="project.id"
          :item="project"
          :tone="(['rose', 'blue', 'mint'] as const)[index]"
        />
      </div>
    </section>
    <ContributionCalendar v-if="sections.contributions.enabled" class="owner-contributions" />
  </div>
</template>
<style scoped>
.owner-folder {
  display: grid;
  grid-template-columns: 0.7fr 1.3fr;
  gap: 3rem;
  align-items: center;
  padding: 1rem 0 2rem;
}
.folder-tab {
  display: block;
  color: var(--color-link);
  font-size: var(--text-sm);
  margin-bottom: 0.75rem;
}
.owner-folder h1 {
  font-size: var(--text-2xl);
}
.owner-folder p {
  margin: 1rem 0;
  color: var(--color-text-secondary);
}
.owner-portrait {
  width: min(100%, 19rem);
  margin: auto;
}
.owner-portrait > p {
  font: var(--text-sm)/1.5 var(--font-mono);
  text-align: center;
}
.owner-contact {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;
}
.about-interests {
  margin-block: 3.5rem;
  padding: 1.5rem 0;
  border-bottom: 1px solid var(--color-border);
}
.about-interests h2 {
  font-size: var(--text-xl);
}
.about-interests p {
  margin: 0.5rem 0 1rem;
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
}
.skill-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.7rem;
}
.owner-projects {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 2rem;
}
.owner-contributions {
  margin-top: 4rem;
}
@media (max-width: 800px) {
  .owner-folder {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  .owner-portrait {
    width: 12rem;
  }
  .owner-projects {
    grid-template-columns: 1fr;
  }
}
</style>
