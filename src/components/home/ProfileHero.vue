<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import BaseAvatar from '@/components/ui/BaseAvatar.vue'
import ConfigIcon from '@/components/ui/ConfigIcon.vue'
import IconGlyph from '@/components/ui/IconGlyph.vue'
import JellyButton from '@/components/ui/JellyButton.vue'
import TypewriterText from '@/components/ui/TypewriterText.vue'
import { siteConfig } from '@/config/site'

const socials = siteConfig.profile.socials.filter((item) => item.enabled)
const skillMagnets = siteConfig.sections.skills.items.filter((item) => item.enabled).slice(0, 6)
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
    <div class="profile-hero__board">
      <span class="profile-hero__scribble profile-hero__scribble--one" aria-hidden="true">✦</span>
      <span class="profile-hero__scribble profile-hero__scribble--two" aria-hidden="true">♡</span>

      <figure class="profile-hero__polaroid">
        <span class="profile-hero__tape" aria-hidden="true"></span>
        <div class="profile-hero__photo">
          <BaseAvatar
            :src="siteConfig.profile.avatar"
            :alt="siteConfig.profile.avatarAlt"
            :initials="siteConfig.profile.name.slice(0, 1)"
            shape="squircle"
          />
          <span class="profile-hero__spark" aria-hidden="true">
            <IconGlyph name="sparkles" :size="17" />
          </span>
        </div>
        <figcaption>
          <strong>{{ siteConfig.profile.name }}</strong>
          <span>{{ siteConfig.profile.handle }}</span>
        </figcaption>
      </figure>

      <div class="profile-hero__speech">
        <p class="profile-hero__eyebrow">HELLO, MY LITTLE WORLD!</p>
        <h1 id="profile-title">{{ siteConfig.profile.greeting }}</h1>
        <p class="profile-hero__tagline">{{ siteConfig.profile.tagline }}</p>
        <p class="profile-hero__description">{{ siteConfig.profile.description }}</p>
        <p class="profile-hero__quote">
          <span aria-hidden="true">“</span>
          <TypewriterText
            :key="activeQuote"
            :text="activeQuote"
            :enabled="siteConfig.profile.typingEffect"
          />
        </p>

        <div class="profile-hero__actions">
          <JellyButton to="/articles" icon="book-open">翻翻手账</JellyButton>
          <JellyButton href="#projects" tone="blue" icon="folder">看看作品</JellyButton>
        </div>

        <div v-if="skillMagnets.length" class="profile-hero__magnets" aria-label="技能关键词">
          <span
            v-for="(skill, index) in skillMagnets"
            :key="skill.label"
            class="profile-hero__magnet"
            :style="{
              '--magnet-color': skill.color ?? 'var(--site-accent)',
              '--magnet-index': index,
            }"
          >
            <ConfigIcon :name="skill.icon" :provider="skill.iconProvider" :size="17" />
            {{ skill.label }}
          </span>
        </div>
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
          <ConfigIcon :name="social.icon" :provider="social.iconProvider" :size="19" />
        </a>
      </nav>
    </div>

    <a class="profile-hero__scroll" href="#home-content" aria-label="继续浏览">
      <span>往下逛逛</span>
      <IconGlyph name="arrow-down" :size="16" />
    </a>
  </section>
</template>

<style scoped>
.profile-hero {
  position: relative;
  display: grid;
  width: 100%;
  min-width: 0;
  min-height: clamp(41rem, 92svh, 51rem);
  align-content: center;
  padding-block: clamp(7rem, 14vh, 9rem) 5.5rem;
}

.profile-hero__board {
  position: relative;
  display: grid;
  width: 100%;
  max-width: 67rem;
  min-width: 0;
  grid-template-columns: minmax(15rem, 0.78fr) minmax(20rem, 1.35fr);
  align-items: center;
  gap: clamp(1rem, 5vw, 4rem);
  margin-inline: auto;
  justify-self: center;
}

.profile-hero__board::before {
  position: absolute;
  z-index: -1;
  inset: -3rem -4rem;
  border: 2px dashed rgb(255 255 255 / 22%);
  border-radius: 38% 62% 56% 44% / 51% 42% 58% 49%;
  background: radial-gradient(ellipse at center, rgb(255 245 251 / 22%), transparent 68%);
  content: '';
  transform: rotate(-1deg);
}

.profile-hero__polaroid {
  position: relative;
  z-index: 2;
  padding: 0.85rem 0.85rem 1.2rem;
  border: 1px solid rgb(255 255 255 / 75%);
  border-radius: 1.4rem 1rem 1.6rem 0.9rem;
  background: color-mix(in srgb, var(--paper-surface) 94%, white);
  box-shadow: 0.85rem 1rem 0 rgb(124 185 232 / 18%), 0 1.5rem 4rem rgb(51 31 62 / 24%);
  color: var(--anime-text);
  transform: rotate(-4.5deg);
  animation: polaroid-arrive 820ms var(--ease-spring-bold) both;
}

.profile-hero__tape {
  position: absolute;
  z-index: 4;
  top: -0.8rem;
  left: 50%;
  width: 7rem;
  height: 1.65rem;
  clip-path: polygon(4% 6%, 97% 0, 100% 86%, 0 100%);
  background: rgb(253 253 150 / 62%);
  transform: translateX(-50%) rotate(3deg);
}

.profile-hero__photo {
  position: relative;
  aspect-ratio: 1 / 1.05;
  overflow: hidden;
  border-radius: 1rem 0.75rem 1.2rem 0.8rem;
  background: linear-gradient(145deg, #dff3ff, #ffe3ee);
}

.profile-hero :deep(.base-avatar--large) {
  width: 100%;
  height: 100%;
  border: 0;
  border-radius: inherit;
  box-shadow: none;
}

.profile-hero__spark {
  position: absolute;
  right: 0.65rem;
  bottom: 0.7rem;
  display: grid;
  width: 2.35rem;
  height: 2.35rem;
  place-items: center;
  border: 2px solid white;
  border-radius: 50%;
  background: #ffabd0;
  color: white;
  box-shadow: 0 0.35rem 0.8rem rgb(91 48 78 / 22%);
  animation: sticker-wiggle 3.6s var(--ease-spring-bold) infinite;
}

.profile-hero__polaroid figcaption {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.9rem 0.45rem 0;
  font-family: var(--font-display);
}

.profile-hero__polaroid figcaption strong {
  font-size: var(--text-lg);
}

.profile-hero__polaroid figcaption span {
  color: var(--anime-muted);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
}

.profile-hero__speech {
  position: relative;
  z-index: 1;
  display: grid;
  min-width: 0;
  gap: var(--space-3);
  padding: clamp(1.7rem, 5vw, 3.4rem);
  border: 2px solid rgb(255 255 255 / 56%);
  border-radius: 2.8rem 3.5rem 3rem 1.4rem;
  background:
    radial-gradient(circle at 88% 12%, rgb(255 255 255 / 52%), transparent 28%),
    rgb(var(--anime-glass-rgb) / 76%);
  box-shadow: inset 0 2px 4px rgb(255 255 255 / 46%), 0.7rem 0.85rem 0 rgb(255 183 178 / 15%), var(--anime-shadow);
  backdrop-filter: blur(1rem) saturate(128%);
  animation: speech-arrive 760ms 100ms var(--ease-spring-bold) both;
}

.profile-hero__speech::before {
  position: absolute;
  top: 46%;
  left: -1.55rem;
  width: 2.8rem;
  height: 2.8rem;
  border-bottom: 2px solid rgb(255 255 255 / 54%);
  border-left: 2px solid rgb(255 255 255 / 54%);
  border-radius: 0 0 0 0.8rem;
  background: rgb(var(--anime-glass-rgb) / 82%);
  content: '';
  transform: rotate(45deg) skew(-8deg, -8deg);
}

.profile-hero__eyebrow {
  color: color-mix(in srgb, var(--site-accent) 72%, var(--anime-text));
  font-family: var(--font-mono);
  font-size: 0.66rem;
  font-weight: 800;
  letter-spacing: 0.12em;
}

.profile-hero h1 {
  max-width: 13ch;
  font-family: var(--font-display);
  font-size: clamp(2.25rem, 5.5vw, 4.65rem);
  font-weight: 850;
  letter-spacing: -0.055em;
  line-height: 1.03;
  text-wrap: balance;
}

.profile-hero__tagline {
  width: fit-content;
  padding: 0.22rem 0.65rem;
  border-radius: 0.35rem 0.65rem 0.4rem 0.55rem;
  background: rgb(180 248 200 / 42%);
  color: var(--anime-text);
  font-size: var(--text-sm);
  font-weight: 750;
  transform: rotate(-1deg);
}

.profile-hero__description,
.profile-hero__quote {
  color: var(--anime-text-soft);
  line-height: 1.7;
}

.profile-hero__quote {
  min-height: 1.7rem;
  font-size: var(--text-sm);
}

.profile-hero__quote > span {
  margin-right: 0.2rem;
  color: var(--site-accent);
  font-size: 1.5em;
  font-weight: 900;
}

.profile-hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  margin-top: var(--space-3);
}

.profile-hero__magnets {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px dashed var(--anime-border-bright);
}

.profile-hero__magnet {
  display: inline-flex;
  min-height: 2.45rem;
  align-items: center;
  gap: 0.42rem;
  padding: 0.45rem 0.75rem;
  border: 2px solid rgb(255 255 255 / 68%);
  border-radius: 0.65rem 1.1rem 0.75rem 1rem;
  background: color-mix(in srgb, var(--magnet-color) 22%, var(--paper-surface));
  box-shadow: 0.18rem 0.25rem 0 color-mix(in srgb, var(--magnet-color) 28%, transparent);
  color: color-mix(in srgb, var(--magnet-color) 45%, var(--anime-text));
  font-size: var(--text-xs);
  font-weight: 760;
  transform: rotate(calc((var(--magnet-index) - 2.5) * 1.8deg));
  transition: transform 440ms var(--ease-spring-bold);
}

.profile-hero__socials {
  position: absolute;
  z-index: 5;
  bottom: -1.5rem;
  left: -1.2rem;
  display: flex;
  gap: 0.55rem;
}

.profile-hero__socials a {
  display: grid;
  width: 2.85rem;
  height: 2.85rem;
  place-items: center;
  border: 2px solid rgb(255 255 255 / 68%);
  border-radius: 50%;
  background: color-mix(in srgb, var(--social-color) 20%, var(--paper-surface));
  box-shadow: 0 0.35rem 0 color-mix(in srgb, var(--social-color) 30%, transparent);
  color: color-mix(in srgb, var(--social-color) 55%, var(--anime-text));
  transition: transform 420ms var(--ease-spring-bold);
}

.profile-hero__scribble {
  position: absolute;
  z-index: 5;
  color: #ffe17e;
  font-size: 2rem;
  text-shadow: 0 0.18rem 0 rgb(110 70 90 / 12%);
}

.profile-hero__scribble--one {
  top: -1.4rem;
  right: 5%;
  transform: rotate(12deg);
}

.profile-hero__scribble--two {
  top: 10%;
  left: -1.6rem;
  color: #ff9fc6;
  transform: rotate(-14deg);
}

.profile-hero__scroll {
  position: absolute;
  bottom: 0;
  left: 50%;
  display: flex;
  min-height: 2.75rem;
  align-items: center;
  gap: var(--space-2);
  padding-inline: var(--space-4);
  border: 1px dashed var(--anime-border-bright);
  border-radius: var(--radius-round);
  background: rgb(var(--anime-glass-rgb) / 68%);
  color: var(--anime-muted);
  font-family: var(--font-mono);
  font-size: 0.66rem;
  transform: translateX(-50%);
  backdrop-filter: blur(0.65rem);
}

.profile-hero__scroll :deep(svg) {
  animation: scroll-hop 1.8s var(--ease-spring-bold) infinite;
}

@keyframes polaroid-arrive {
  from { opacity: 0; transform: translate(-2rem, 1rem) rotate(-12deg) scale(0.82); }
}

@keyframes speech-arrive {
  from { opacity: 0; transform: translate(2rem, 0.6rem) scale(0.88); }
}

@keyframes sticker-wiggle {
  70%, 100% { transform: rotate(0) scale(1); }
  82% { transform: rotate(14deg) scale(1.12); }
}

@keyframes scroll-hop {
  50% { transform: translateY(0.26rem); }
}

@media (hover: hover) {
  .profile-hero__magnet:hover { transform: translateY(-0.28rem) rotate(-3deg) scale(1.06); }
  .profile-hero__socials a:hover { transform: translateY(-0.3rem) rotate(8deg) scale(1.08); }
}

@media (max-width: 48rem) {
  .profile-hero { min-height: auto; padding-block: 7rem 6rem; }
  .profile-hero__board { grid-template-columns: minmax(0, 1fr); gap: 1.4rem; }
  .profile-hero__polaroid { width: min(76vw, 18rem); justify-self: center; }
  .profile-hero__speech { border-radius: 2rem 2.6rem 2.4rem 1.4rem; }
  .profile-hero__speech::before { top: -1.2rem; left: 48%; transform: rotate(135deg) skew(-8deg, -8deg); }
  .profile-hero__magnets { justify-content: center; }
  .profile-hero__socials { position: relative; bottom: auto; left: auto; justify-content: center; }
  .profile-hero__scribble--two { left: 0; }
}

@media (max-width: 30rem) {
  .profile-hero h1 { font-size: clamp(2rem, 11vw, 3rem); }
  .profile-hero__speech { padding: 1.45rem; }
  .profile-hero__actions { align-items: stretch; flex-direction: column; }
}

@media (prefers-reduced-motion: reduce) {
  .profile-hero__polaroid,
  .profile-hero__speech,
  .profile-hero__spark,
  .profile-hero__scroll :deep(svg) { animation: none; }

  .profile-hero__magnet,
  .profile-hero__socials a { transition: none; }
}

@media (prefers-reduced-transparency: reduce) {
  .profile-hero__speech,
  .profile-hero__scroll { background: var(--color-surface-fallback); backdrop-filter: none; }
}
</style>
