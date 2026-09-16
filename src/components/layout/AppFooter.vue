<script setup lang="ts">
import { ref } from 'vue'
import IconGlyph from '@/components/ui/IconGlyph.vue'
import CloudBrandMark from '@/components/ui/CloudBrandMark.vue'
import { siteConfig } from '@/config/site'

const iconFailed = ref(false)
withDefaults(defineProps<{ compact?: boolean }>(), { compact: false })
</script>

<template>
  <footer class="app-footer" :class="{ 'app-footer--compact': compact }">
    <div class="page-shell">
      <div class="app-footer__cloud">
        <div class="app-footer__primary">
          <RouterLink
            class="app-footer__brand"
            to="/"
            :aria-label="siteConfig.meta.name + ' · 首页'"
          >
            <span class="app-footer__brand-mark" aria-hidden="true"><CloudBrandMark /></span>
            <strong>{{ siteConfig.meta.name }}的小小云端</strong>
          </RouterLink>
          <nav class="app-footer__nav" aria-label="页脚导航">
            <RouterLink to="/about">关于</RouterLink>
            <RouterLink to="/friends">友链</RouterLink>
            <RouterLink to="/postoffice">联系</RouterLink>
            <RouterLink to="/navigation">导航</RouterLink>
            <RouterLink to="/lab">工坊</RouterLink>
          </nav>
        </div>
        <p class="app-footer__summary">
          文章、作品和可以带走的小工具，都收在这片云里。收藏与偏好只保存在当前浏览器。
        </p>
      </div>

      <div class="app-footer__legal">
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
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  padding-block: clamp(3rem, 7vw, 5rem) 1.5rem;
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
}
.app-footer__cloud {
  padding: clamp(2rem, 5vw, 3.25rem);
  border: 1px solid var(--color-rim);
  border-radius: 2.25rem;
  background: linear-gradient(
    112deg,
    rgb(var(--tone-rose) / 0.11),
    var(--color-surface-glass) 42%,
    rgb(var(--tone-blue) / 0.2) 100%
  );
  box-shadow:
    inset 0 1px 0 var(--color-rim),
    0 20px 45px -34px rgb(87 92 140 / 30%);
}
.app-footer__primary {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem 2rem;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid var(--color-border);
  padding-top: clamp(2rem, 4vw, 2.75rem);
}
.app-footer__brand,
.app-footer__brand-mark,
.app-footer__nav {
  display: flex;
  align-items: center;
}
.app-footer__brand {
  gap: 0.65rem;
  min-height: var(--tap-size);
  color: var(--color-text);
  font-family: var(--font-display);
  font-size: var(--text-base);
}
.app-footer__brand-mark {
  justify-content: center;
  width: 2rem;
  height: 2rem;
  color: var(--color-link);
  border: 1px solid var(--color-rim);
  border-radius: 50%;
  background: var(--color-surface-glass);
}
.app-footer__nav {
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.25rem 1.25rem;
  font-size: var(--text-sm);
}
.app-footer__nav a {
  min-height: var(--tap-size);
  display: inline-flex;
  align-items: center;
  transition: color 160ms ease;
}
.app-footer__nav a:hover,
.app-footer__nav a:focus-visible,
.app-footer__nav a[aria-current='page'] {
  color: var(--color-link);
}
.app-footer__summary {
  margin-top: 1.25rem;
  max-width: 50rem;
  font-size: var(--text-sm);
  line-height: 1.8;
}
.app-footer__legal {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem 1.5rem;
  align-items: center;
  padding: 1.1rem clamp(0.25rem, 1vw, 0.75rem) 0;
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
@media (max-width: 640px) {
  .app-footer__cloud {
    padding: 1.5rem;
    border-radius: 1.75rem;
  }
  .app-footer__primary {
    align-items: flex-start;
    flex-direction: column;
    padding-top: 1.5rem;
  }
  .app-footer__nav {
    justify-content: flex-start;
    gap: 0.15rem 1rem;
  }
  .app-footer__legal {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
