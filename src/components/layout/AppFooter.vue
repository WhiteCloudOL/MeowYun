<script setup lang="ts">
import IconGlyph from '@/components/ui/IconGlyph.vue'
import { siteConfig } from '@/config/site'
</script>

<template>
  <footer class="app-footer">
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
  color: var(--anime-muted);
  font-size: var(--text-xs);
}

.app-footer__inner {
  display: grid;
  justify-items: center;
  gap: var(--space-3);
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
  max-width: 48rem;
  margin-top: var(--space-1);
  color: color-mix(in srgb, var(--anime-muted), transparent 14%);
  font-size: 0.68rem;
  line-height: 1.75;
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
</style>
