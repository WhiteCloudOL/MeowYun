<script setup lang="ts">
import IconGlyph from '@/components/ui/IconGlyph.vue'
import { siteConfig } from '@/config/site'

withDefaults(defineProps<{ compact?: boolean }>(), { compact: false })
</script>

<template>
  <footer class="app-footer" :class="{ 'app-footer--compact': compact }">
    <div class="page-shell app-footer__inner">
      <p class="app-footer__note">
        <IconGlyph name="heart" :size="14" />
        {{ siteConfig.footer.text }}
      </p>

      <div v-if="siteConfig.footer.icp || siteConfig.footer.publicSecurity" class="app-footer__beian">
        <a
          v-if="siteConfig.footer.icp"
          class="beian-item"
          :href="siteConfig.footer.icp.href"
          target="_blank"
          rel="noopener noreferrer"
        >
          {{ siteConfig.footer.icp.number }}
        </a>
        <a
          v-if="siteConfig.footer.publicSecurity"
          class="beian-item"
          :href="siteConfig.footer.publicSecurity.href"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img :src="siteConfig.footer.publicSecurity.iconUrl" alt="公安备案图标" />
          <span>{{ siteConfig.footer.publicSecurity.number }}</span>
        </a>
      </div>

      <p v-if="siteConfig.footer.imageDisclaimer" class="app-footer__disclaimer">
        {{ siteConfig.footer.imageDisclaimer }}
        <a
          v-if="siteConfig.friendsPage.applicationEmail"
          :href="`mailto:${siteConfig.friendsPage.applicationEmail}`"
        >
          联系邮箱
        </a>
      </p>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  padding-block: var(--space-10) var(--space-6);
  color: #6b584e;
  font-family: ui-rounded, 'Hiragino Maru Gothic ProN', 'Microsoft YaHei UI', sans-serif;
  font-size: var(--text-xs);
}

.app-footer__inner {
  display: flex;
  width: 100%;
  max-width: none;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0.25rem 1rem;
  padding: 0.65rem 1rem;
  border: 3px solid #4a3b32;
  border-radius: 1.2rem;
  background: #fffdf9;
  box-shadow: 5px 5px 0 #a7e9af;
  text-align: center;
}

.app-footer__note,
.app-footer__beian,
.beian-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
}

.app-footer__beian {
  flex-wrap: wrap;
  gap: var(--space-2) var(--space-4);
}

.app-footer__disclaimer {
  display: -webkit-box;
  width: 100%;
  max-width: 48rem;
  margin-top: 0;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  color: color-mix(in srgb, var(--anime-muted), transparent 14%);
  font-size: 0.68rem;
  line-height: 1.4;
}

.app-footer__disclaimer a {
  margin-left: 0.3rem;
  color: var(--anime-text-soft);
  text-decoration: underline;
  text-decoration-color: color-mix(in srgb, var(--site-accent), transparent 55%);
  text-underline-offset: 0.18rem;
}

.beian-item {
  transition: color var(--transition-fast);
}

.beian-item img {
  width: 0.9rem;
  height: 0.9rem;
  object-fit: contain;
}

@media (hover: hover) {
  .beian-item:hover {
    color: var(--anime-text);
  }
}

.app-footer--compact {
  padding: 0;
  color: #6b584e;
  font-family: ui-rounded, 'Hiragino Maru Gothic ProN', 'Microsoft YaHei UI', sans-serif;
}

.app-footer--compact .app-footer__inner {
  max-width: none;
}

.app-footer--compact .app-footer__note {
  color: #2b2d42;
  font-weight: 850;
}

.app-footer--compact .app-footer__disclaimer {
  display: -webkit-box;
  width: 100%;
  max-width: none;
  margin-top: 0;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  color: #79665b;
  font-size: 0.58rem;
  line-height: 1.4;
}

.app-footer:not(.app-footer--compact) .app-footer__note {
  color: #2b2d42;
  font-weight: 850;
}

.app-footer:not(.app-footer--compact) .app-footer__inner {
  width: min(68rem, 78vw);
  margin-inline: auto;
}

.app-footer:not(.app-footer--compact) .app-footer__disclaimer {
  max-width: none;
  color: #79665b;
  font-size: 0.58rem;
}

@media (max-width: 34rem) {
  .app-footer:not(.app-footer--compact) .app-footer__inner {
    width: 88vw;
  }

  .app-footer--compact {
    font-size: 0.58rem;
  }

  .app-footer--compact .app-footer__inner {
    gap: 0.18rem 0.5rem;
    padding: 0.5rem 0.65rem;
    border-width: 2px;
    box-shadow: 3px 3px 0 #a7e9af;
  }

  .app-footer--compact .app-footer__disclaimer {
    font-size: 0.5rem;
  }
}
</style>
