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
        v-for="(item, index) in items"
        :key="item.id"
        class="quick-link"
        :to="isRoute(item.href) ? item.href : undefined"
        :href="isRoute(item.href) ? undefined : item.href"
        :target="!isRoute(item.href) && !item.href.startsWith('#') ? '_blank' : undefined"
        :rel="!isRoute(item.href) && !item.href.startsWith('#') ? 'noopener noreferrer' : undefined"
        :style="{
          '--link-accent': item.accent ?? 'var(--site-accent)',
          '--link-delay': `${index * 70}ms`,
        }"
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
  min-width: 0;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--space-4);
}

.quick-links__heading {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--anime-text-soft);
}

.quick-links__heading::after {
  width: 3.5rem;
  height: 0.45rem;
  margin-left: 0.15rem;
  border-radius: 50%;
  background: color-mix(in srgb, var(--site-accent) 34%, transparent);
  content: '';
  filter: blur(0.08rem);
  transform: rotate(-2deg);
}

.quick-links__heading :deep(svg) {
  color: var(--anime-accent-soft);
  animation: heading-spark 3.2s var(--ease-spring-bold) infinite;
}

.quick-links__heading h2 {
  font-size: var(--text-sm);
  font-weight: 700;
  letter-spacing: 0.02em;
}

.quick-links__grid {
  display: flex;
  flex-wrap: wrap;
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
  overflow: visible;
  border: 1px solid var(--paper-edge);
  border-radius: 0.75rem 1.25rem 0.75rem 1rem;
  background: color-mix(in srgb, var(--link-accent) 8%, var(--paper-surface));
  box-shadow: 0.3rem 0.35rem 0 color-mix(in srgb, var(--link-accent) 13%, transparent), var(--shadow-card);
  transition:
    transform var(--transition-press),
    background-color var(--transition-fast),
    border-color var(--transition-fast),
    box-shadow var(--transition-normal);
  animation: quick-link-arrive 560ms var(--link-delay) cubic-bezier(0.16, 1, 0.3, 1.1) backwards;
  flex: 1 1 13rem;
}

.quick-link:nth-child(4n + 1) { flex-grow: 1.35; }
.quick-link:nth-child(4n + 2) { flex-grow: 0.85; transform: translateY(0.65rem) rotate(0.4deg); }
.quick-link:nth-child(4n + 3) { flex-grow: 1.08; transform: rotate(-0.35deg); }

.quick-link::before {
  position: absolute;
  top: -0.45rem;
  right: 1.1rem;
  width: 2.7rem;
  height: 0.8rem;
  background: color-mix(in srgb, var(--link-accent) 46%, transparent);
  clip-path: polygon(3% 12%, 96% 0, 100% 90%, 0 100%);
  content: '';
  filter: none;
  opacity: 0.6;
  transform: rotate(3deg);
}

.quick-link:active {
  transform: scale(0.98);
}

.quick-link__icon {
  display: grid;
  width: 2.75rem;
  height: 2.75rem;
  place-items: center;
  border: 1px dashed color-mix(in srgb, var(--link-accent) 48%, transparent);
  border-radius: 50%;
  background: color-mix(in srgb, var(--link-accent) 13%, var(--paper-surface));
  color: color-mix(in srgb, var(--link-accent) 50%, var(--anime-text));
  transition: transform var(--transition-normal);
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

@keyframes quick-link-arrive {
  from {
    opacity: 0;
    transform: translateY(0.8rem) scale(0.94);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes heading-spark {
  0%,
  72%,
  100% {
    transform: rotate(0) scale(1);
  }

  82% {
    transform: rotate(16deg) scale(1.18);
  }
}

@media (hover: hover) {
  .quick-link:hover {
    border-color: var(--anime-border-bright);
    background: color-mix(in srgb, var(--link-accent) 12%, var(--paper-surface));
    box-shadow: var(--shadow-card-hover);
    transform: translateY(-0.28rem) rotate(-1deg);
  }

  .quick-link:hover .quick-link__icon {
    transform: rotate(-8deg) scale(1.08);
  }

  .quick-link:hover .quick-link__arrow {
    transform: translate(0.12rem, -0.12rem);
  }
}

@media (prefers-reduced-motion: reduce) {
  .quick-link,
  .quick-links__heading :deep(svg) {
    animation: none;
  }
}

@media (max-width: 34rem) {
  .quick-link { flex-basis: 100%; transform: none; }
}
</style>
