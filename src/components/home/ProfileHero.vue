<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import BaseAvatar from '@/components/ui/BaseAvatar.vue'
import ConfigIcon from '@/components/ui/ConfigIcon.vue'
import IconGlyph from '@/components/ui/IconGlyph.vue'
import TypewriterText from '@/components/ui/TypewriterText.vue'
import { siteConfig } from '@/config/site'

const socials = siteConfig.profile.socials.filter((item) => item.enabled)
const quoteIndex = ref(0)
const activeQuote = computed(() => siteConfig.profile.quotes[quoteIndex.value] ?? '')
let quoteTimer: ReturnType<typeof setInterval> | undefined

onMounted(() => {
  if (siteConfig.profile.quotes.length < 2 || !siteConfig.profile.typingEffect) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  quoteTimer = setInterval(() => {
    quoteIndex.value = (quoteIndex.value + 1) % siteConfig.profile.quotes.length
  }, Math.max(3000, siteConfig.profile.quoteInterval))
})

onBeforeUnmount(() => {
  if (quoteTimer) clearInterval(quoteTimer)
})
</script>

<template>
  <section v-if="siteConfig.profile.enabled" class="profile-hero" aria-labelledby="profile-title">
    <div class="profile-hero__identity">
      <div class="profile-hero__avatar-wrap">
        <BaseAvatar
          :src="siteConfig.profile.avatar"
          :alt="siteConfig.profile.avatarAlt"
          :initials="siteConfig.profile.name.slice(0, 1)"
          shape="round"
        />
        <span class="profile-hero__spark" aria-hidden="true"><IconGlyph name="sparkles" :size="15" /></span>
      </div>

      <p class="profile-hero__handle">{{ siteConfig.profile.handle }}</p>
      <h1 id="profile-title">{{ siteConfig.profile.greeting }}</h1>
      <p class="profile-hero__tagline">{{ siteConfig.profile.tagline }}</p>
      <p class="profile-hero__quote">
        <TypewriterText
          :key="activeQuote"
          :text="activeQuote"
          :enabled="siteConfig.profile.typingEffect"
        />
      </p>
    </div>

    <nav v-if="socials.length" class="profile-hero__socials" aria-label="社交链接">
      <a
        v-for="social in socials"
        :key="social.id"
        :href="social.href"
        :aria-label="social.label"
        :title="social.label"
        target="_blank"
        rel="noopener noreferrer"
        :style="{ '--social-color': social.color }"
      >
        <ConfigIcon :name="social.icon" :provider="social.iconProvider" :size="20" />
      </a>
    </nav>

    <a class="profile-hero__scroll" href="#home-content" aria-label="继续浏览">
      <span>SCROLL</span>
      <IconGlyph name="arrow-down" :size="16" />
    </a>
  </section>
</template>

<style scoped>
.profile-hero {
  position: relative;
  display: grid;
  min-height: clamp(31rem, 64svh, 42rem);
  align-content: center;
  justify-items: center;
  gap: var(--space-8);
  padding-block: clamp(var(--space-12), 10vh, 7rem);
  text-align: center;
}

.profile-hero__identity {
  display: grid;
  max-width: 46rem;
  justify-items: center;
  gap: var(--space-3);
  text-shadow: var(--anime-hero-shadow);
}

.profile-hero__avatar-wrap {
  position: relative;
  margin-bottom: var(--space-3);
}

.profile-hero :deep(.base-avatar--large) {
  width: clamp(7rem, 13vw, 9.5rem);
  height: clamp(7rem, 13vw, 9.5rem);
  border: 0.2rem solid rgb(238 242 255 / 72%);
  box-shadow: 0 1rem 3rem rgb(2 5 20 / 42%), 0 0 0 0.45rem rgb(255 255 255 / 8%);
}

.profile-hero__spark {
  position: absolute;
  right: 0.2rem;
  bottom: 0.4rem;
  display: grid;
  width: 2.15rem;
  height: 2.15rem;
  place-items: center;
  border: 1px solid var(--anime-border-bright);
  border-radius: 50%;
  background: var(--anime-glass-strong);
  color: var(--site-accent);
  box-shadow: 0 0.4rem 1rem rgb(4 7 25 / 28%);
}

.profile-hero__handle {
  color: var(--anime-text-soft);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  letter-spacing: 0.08em;
}

.profile-hero h1 {
  margin-top: var(--space-2);
  font-size: clamp(2rem, 5vw, 4rem);
  font-weight: 800;
  letter-spacing: -0.055em;
  line-height: 1.12;
  text-wrap: balance;
}

.profile-hero__tagline {
  color: var(--anime-text-soft);
  font-size: var(--text-sm);
  font-weight: 650;
}

.profile-hero__quote {
  min-height: 1.8rem;
  max-width: min(34rem, calc(100vw - 2rem));
  margin-top: var(--space-2);
  color: var(--anime-text-soft);
  font-size: var(--text-base);
  line-height: 1.65;
  text-wrap: balance;
}

.profile-hero__socials {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--space-3);
}

.profile-hero__socials a {
  display: grid;
  width: 3.25rem;
  height: 3.25rem;
  place-items: center;
  border: 1px solid var(--anime-border-bright);
  border-radius: 50%;
  background: var(--anime-glass);
  box-shadow: 0 0.5rem 1.5rem rgb(2 5 20 / 20%), inset 0 1px 0 rgb(255 255 255 / 10%);
  color: var(--social-color);
  backdrop-filter: blur(0.9rem);
  transition:
    transform var(--transition-press),
    background-color var(--transition-fast),
    box-shadow var(--transition-fast);
}

.profile-hero__socials a:active {
  transform: scale(0.92);
}

.profile-hero__scroll {
  position: absolute;
  bottom: var(--space-4);
  display: grid;
  justify-items: center;
  gap: var(--space-1);
  color: var(--anime-muted);
  font-family: var(--font-mono);
  font-size: 0.58rem;
  letter-spacing: 0.12em;
}

.profile-hero__scroll :deep(svg) {
  animation: scroll-hint 1.8s ease-in-out infinite;
}

@keyframes scroll-hint {
  50% {
    transform: translateY(0.25rem);
  }
}

@media (hover: hover) {
  .profile-hero__socials a:hover {
    background: rgb(226 234 255 / 18%);
    box-shadow: 0 0.7rem 1.8rem rgb(2 5 20 / 28%), 0 0 1.5rem color-mix(in srgb, var(--social-color) 24%, transparent);
    transform: translateY(-0.2rem);
  }
}

@media (max-width: 38rem) {
  .profile-hero {
    min-height: clamp(30rem, 68svh, 38rem);
  }

  .profile-hero h1 {
    max-width: 12ch;
  }
}

@media (prefers-reduced-motion: reduce) {
  .profile-hero__scroll :deep(svg) {
    animation: none;
  }
}
</style>
