<script setup lang="ts">
import { ref } from 'vue'
import IconGlyph from '@/components/ui/IconGlyph.vue'
import { siteConfig } from '@/config/site'

const iconFailed = ref(false)
withDefaults(defineProps<{ compact?: boolean }>(), { compact: false })
</script>

<template>
  <footer class="app-footer" :class="{ 'app-footer--compact': compact }">
    <div class="page-shell app-footer__inner">
      <p class="app-footer__note">
        <IconGlyph name="heart" :size="14" />
        {{ siteConfig.footer.text }}
      </p>

      <div
        v-if="siteConfig.footer.icp || siteConfig.footer.publicSecurity"
        class="app-footer__beian"
      >
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
          <img
            v-if="!iconFailed"
            :src="siteConfig.footer.publicSecurity.iconUrl"
            alt=""
            width="16"
            height="16"
            loading="lazy"
            @error="iconFailed = true"
          />
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
  padding-block: 2.5rem 1.5rem;
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
}
.app-footer__inner {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem 1.5rem;
  align-items: center;
  border-top: 1px solid var(--color-border);
  padding-top: 1.25rem;
}
.app-footer__note,
.app-footer__beian,
.beian-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.app-footer__beian {
  gap: 0.5rem 1rem;
}
.beian-item {
  min-height: var(--tap-size);
}
.beian-item img {
  width: 1rem;
  height: 1rem;
  object-fit: contain;
}
.app-footer__disclaimer {
  width: 100%;
  line-height: 1.8;
}
.app-footer__disclaimer a {
  display: inline-flex;
  align-items: center;
  min-height: var(--tap-size);
  margin-left: 0.5rem;
  color: var(--color-link);
  text-decoration: underline;
  text-underline-offset: 0.2em;
}
</style>
