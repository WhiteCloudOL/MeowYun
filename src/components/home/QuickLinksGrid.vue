<script setup lang="ts">
import { RouterLink } from 'vue-router'
import ConfigIcon from '@/components/ui/ConfigIcon.vue'
import IconGlyph from '@/components/ui/IconGlyph.vue'
import { siteConfig } from '@/config/site'

const items = siteConfig.sections.quickLinks.items.filter((item) => item.enabled)

function isRoute(href: string) {
  return href.startsWith('/')
}
</script>

<template>
  <section v-if="siteConfig.sections.quickLinks.enabled && items.length" class="quick-links">
    <div class="quick-links__heading">
      <IconGlyph name="sparkles" :size="16" />
      <h2>{{ siteConfig.sections.quickLinks.title }}</h2>
    </div>

    <div class="quick-links__grid">
      <component
        :is="isRoute(item.href) ? RouterLink : 'a'"
        v-for="item in items"
        :key="item.id"
        class="quick-link"
        :to="isRoute(item.href) ? item.href : undefined"
        :href="isRoute(item.href) ? undefined : item.href"
        :target="!isRoute(item.href) && !item.href.startsWith('#') ? '_blank' : undefined"
        :rel="!isRoute(item.href) && !item.href.startsWith('#') ? 'noopener noreferrer' : undefined"
        :style="{ '--link-accent': item.accent ?? 'var(--site-accent)' }"
      >
        <span class="quick-link__icon">
          <ConfigIcon :name="item.icon" :provider="item.iconProvider" :size="22" />
        </span>
        <span class="quick-link__copy">
          <strong>{{ item.title }}</strong>
          <small>{{ item.description }}</small>
        </span>
        <IconGlyph name="arrow-up-right" class="quick-link__arrow" :size="16" />
      </component>
    </div>
  </section>
</template>

<style scoped>
.quick-links {
  display: grid;
  gap: var(--space-4);
}

.quick-links__heading {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--anime-text-soft);
}

.quick-links__heading h2 {
  font-size: var(--text-sm);
  font-weight: 700;
  letter-spacing: 0.02em;
}

.quick-links__grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--space-4);
}

.quick-link {
  position: relative;
  display: grid;
  min-height: 6.6rem;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4);
  border: 1px solid var(--anime-border);
  border-radius: var(--radius-medium);
  background: var(--anime-glass);
  box-shadow: 0 0.75rem 2.25rem rgb(2 6 22 / 20%), inset 0 1px 0 rgb(255 255 255 / 8%);
  backdrop-filter: blur(1rem) saturate(115%);
  transition:
    transform var(--transition-press),
    background-color var(--transition-fast),
    border-color var(--transition-fast);
}

.quick-link::before {
  position: absolute;
  top: 22%;
  bottom: 22%;
  left: 0;
  width: 0.18rem;
  border-radius: var(--radius-round);
  background: var(--link-accent);
  content: '';
  opacity: 0.78;
}

.quick-link:active {
  transform: scale(0.98);
}

.quick-link__icon {
  display: grid;
  width: 2.75rem;
  height: 2.75rem;
  place-items: center;
  border: 1px solid color-mix(in srgb, var(--link-accent) 34%, transparent);
  border-radius: 50%;
  background: color-mix(in srgb, var(--link-accent) 14%, transparent);
  color: var(--link-accent);
}

.quick-link__copy {
  display: grid;
  min-width: 0;
}

.quick-link strong {
  font-size: var(--text-sm);
}

.quick-link small {
  overflow: hidden;
  color: var(--anime-muted);
  font-size: var(--text-xs);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.quick-link__arrow {
  color: var(--anime-muted);
  transition: transform var(--transition-fast);
}

@media (hover: hover) {
  .quick-link:hover {
    border-color: var(--anime-border-bright);
    background: color-mix(in srgb, var(--anime-glass-strong) 88%, var(--link-accent));
    transform: translateY(-0.2rem);
  }

  .quick-link:hover .quick-link__arrow {
    transform: translate(0.12rem, -0.12rem);
  }
}

@media (max-width: 58rem) {
  .quick-links__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 34rem) {
  .quick-links__grid {
    grid-template-columns: 1fr;
  }
}
</style>
