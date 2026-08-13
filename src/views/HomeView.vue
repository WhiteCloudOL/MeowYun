<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import AmbientParticles from '@/components/home/AmbientParticles.vue'
import ContributionCalendar from '@/components/home/ContributionCalendar.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import ConfigIcon from '@/components/ui/ConfigIcon.vue'
import IconGlyph from '@/components/ui/IconGlyph.vue'
import ScrapbookCard from '@/components/ui/ScrapbookCard.vue'
import TypewriterText from '@/components/ui/TypewriterText.vue'
import { siteConfig } from '@/config/site'

const sceneRoot = ref<HTMLElement>()
const activeScene = ref(0)
const activeProject = ref(0)
const projects = siteConfig.sections.projects.items.filter((item) => item.enabled)
const skills = siteConfig.sections.skills.items.filter((item) => item.enabled).slice(0, 8)
const facts = siteConfig.sections.about.facts.slice(0, 3)
const scenes = [
  { id: 'hero', label: '初见' },
  { id: 'status', label: '档案' },
  { id: 'showcase', label: '玩具箱' },
]

const activeProjectItem = computed(() => projects[activeProject.value])
const previousProject = computed(() =>
  projects.length ? projects[(activeProject.value - 1 + projects.length) % projects.length] : undefined,
)
const nextProject = computed(() =>
  projects.length ? projects[(activeProject.value + 1) % projects.length] : undefined,
)
const farPreviousProject = computed(() =>
  projects.length > 4
    ? projects[(activeProject.value - 2 + projects.length) % projects.length]
    : undefined,
)
const farNextProject = computed(() =>
  projects.length > 4 ? projects[(activeProject.value + 2) % projects.length] : undefined,
)

type HomeSceneKey = 'hero' | 'showcase' | 'status'

function createSceneBackgroundStyle(scene: HomeSceneKey) {
  const appearance = siteConfig.appearance
  const background = {
    ...appearance.globalBackground,
    ...appearance.homeBackground,
    ...appearance.homeSceneBackgrounds?.[scene],
  }

  return {
    '--scene-background-image': `url("${background.image}")`,
    '--scene-background-mobile-image': `url("${background.mobileImage ?? background.image}")`,
    '--scene-background-position': background.position,
    '--scene-background-overlay': background.overlay,
    '--scene-background-blur': `${background.blur}px`,
    '--scene-background-opacity': background.imageOpacity,
    '--scene-background-grayscale': background.grayscale,
    '--scene-background-saturation': background.saturation,
    '--scene-background-brightness': background.brightness,
  }
}

const sceneBackgroundStyles = {
  hero: createSceneBackgroundStyle('hero'),
  status: createSceneBackgroundStyle('status'),
  showcase: createSceneBackgroundStyle('showcase'),
}
let sceneObserver: IntersectionObserver | undefined
let sceneScrollFrame: number | undefined
let sceneUnlockTimer: number | undefined
let sceneScrollLocked = false

function springProgress(progress: number) {
  if (progress >= 1) return 1
  const time = progress * progress
  return 1 - Math.exp(-5 * time) * (1 - time) * Math.cos(4 * time)
}

function scrollToScene(index: number, interrupt = false) {
  // 分页按钮可以打断尚未完成的慢动画，避免视口变化后锁定在上一屏。
  if (interrupt) {
    if (sceneScrollFrame) cancelAnimationFrame(sceneScrollFrame)
    if (sceneUnlockTimer) window.clearTimeout(sceneUnlockTimer)
    sceneScrollFrame = undefined
    sceneUnlockTimer = undefined
    sceneScrollLocked = false
  }

  const root = sceneRoot.value
  const scene = sceneRoot.value?.querySelector<HTMLElement>(`#scene-${scenes[index]?.id}`)
  if (!root || !scene || sceneScrollLocked) return

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    root.scrollTop = scene.offsetTop
    activeScene.value = index
    return
  }

  const scrollRoot = root
  const targetTop = scene.offsetTop
  const start = scrollRoot.scrollTop
  const distance = targetTop - start
  if (Math.abs(distance) < 1) {
    activeScene.value = index
    sceneScrollLocked = false
    return
  }
  const duration = 1150
  const startedAt = performance.now()
  sceneScrollLocked = true

  function renderFrame(now: number) {
    const progress = Math.min(1, (now - startedAt) / duration)
    scrollRoot.scrollTop = start + distance * springProgress(progress)

    if (progress < 1) {
      sceneScrollFrame = requestAnimationFrame(renderFrame)
      return
    }

    scrollRoot.scrollTop = targetTop
    activeScene.value = index
    sceneScrollFrame = undefined
    sceneUnlockTimer = window.setTimeout(() => (sceneScrollLocked = false), 160)
  }

  sceneScrollFrame = requestAnimationFrame(renderFrame)
}

function handleSceneWheel(event: WheelEvent) {
  if (Math.abs(event.deltaY) < 8) return

  const target = event.target
  const scrollablePanel = target instanceof Element ? target.closest<HTMLElement>('.status-panel') : null
  if (scrollablePanel) {
    const canContinueDown =
      event.deltaY > 0 &&
      scrollablePanel.scrollTop + scrollablePanel.clientHeight < scrollablePanel.scrollHeight - 1
    const canContinueUp = event.deltaY < 0 && scrollablePanel.scrollTop > 1
    if (canContinueDown || canContinueUp) return
  }

  event.preventDefault()
  if (sceneScrollLocked) return
  const nextScene = Math.max(0, Math.min(scenes.length - 1, activeScene.value + Math.sign(event.deltaY)))
  if (nextScene !== activeScene.value) scrollToScene(nextScene)
}

function changeProject(step: number) {
  if (!projects.length) return
  activeProject.value = (activeProject.value + step + projects.length) % projects.length
}

function selectProject(index: number) {
  activeProject.value = index
}

function handleCarouselKeydown(event: KeyboardEvent) {
  if (event.key === 'ArrowLeft') {
    event.preventDefault()
    changeProject(-1)
  }
  if (event.key === 'ArrowRight') {
    event.preventDefault()
    changeProject(1)
  }
}

onMounted(() => {
  const root = sceneRoot.value
  if (!root) return

  // 以全屏滚动容器为观察根，每次场景进入时恢复慢速的分层入场。
  sceneObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((left, right) => right.intersectionRatio - left.intersectionRatio)[0]
      if (!visible) return

      const index = Number((visible.target as HTMLElement).dataset.sceneIndex)
      if (Number.isFinite(index)) activeScene.value = index
    },
    { root, threshold: [0.35, 0.6, 0.82] },
  )

  root.querySelectorAll<HTMLElement>('.home-scene').forEach((scene) => {
    sceneObserver?.observe(scene)
  })
})

onBeforeUnmount(() => {
  sceneObserver?.disconnect()
  if (sceneScrollFrame) cancelAnimationFrame(sceneScrollFrame)
  if (sceneUnlockTimer) window.clearTimeout(sceneUnlockTimer)
})
</script>

<template>
  <div class="home-view">
    <AmbientParticles />

    <div ref="sceneRoot" class="home-scenes" aria-label="主页场景" @wheel="handleSceneWheel">
      <section
        id="scene-hero"
        class="home-scene hero-scene"
        :class="{ 'is-active': activeScene === 0 }"
        data-scene-index="0"
        aria-labelledby="home-hero-title"
      >
        <div class="home-scene__background" :style="sceneBackgroundStyles.hero"></div>
        <div class="hero-composition">
          <ScrapbookCard
            as="section"
            tone="yellow"
            :tilt="-1.2"
            interactive
            class="hero-journal scene-reveal"
            style="--reveal-delay: 90ms"
          >
            <div class="hero-journal__label">
              <IconGlyph name="sparkles" :size="16" />
              MY LITTLE SPACE
            </div>
            <span class="hero-journal__date">No. 0812</span>
            <p class="hero-journal__hello">你好呀，欢迎来串门！</p>
            <h1 id="home-hero-title">
              {{ siteConfig.profile.name }}
              <span aria-hidden="true">(≧∇≦)ﾉ</span>
            </h1>
            <p class="hero-journal__typewriter">
              <TypewriterText
                :text="siteConfig.profile.tagline"
                :enabled="siteConfig.profile.typingEffect"
              />
            </p>
            <p class="hero-journal__description">{{ siteConfig.profile.description }}</p>
            <div class="hero-journal__actions">
              <RouterLink class="chunky-button chunky-button--pink" to="/articles">
                <IconGlyph name="book-open" :size="17" />
                翻翻手账
              </RouterLink>
              <button class="chunky-button chunky-button--mint" type="button" @click="scrollToScene(1, true)">
                看看档案
                <IconGlyph name="arrow-down" :size="17" />
              </button>
            </div>
            <span class="hero-journal__paw" aria-hidden="true">🐾</span>
          </ScrapbookCard>

          <figure class="hero-polaroid scene-reveal" style="--reveal-delay: 280ms">
            <span class="hero-polaroid__tape hero-polaroid__tape--top" aria-hidden="true"></span>
            <span class="hero-polaroid__tape hero-polaroid__tape--side" aria-hidden="true"></span>
            <div class="hero-polaroid__photo">
              <img :src="siteConfig.profile.avatar" :alt="siteConfig.profile.avatarAlt" />
              <span aria-hidden="true">✦</span>
            </div>
            <figcaption>
              <strong>{{ siteConfig.profile.name }}</strong>
              <small>{{ siteConfig.profile.handle }}</small>
            </figcaption>
            <span class="hero-polaroid__scribble" aria-hidden="true">Nyaa~ ♡</span>
          </figure>

          <span class="hero-doodle hero-doodle--star" aria-hidden="true">✦</span>
          <span class="hero-doodle hero-doodle--heart" aria-hidden="true">♡</span>
        </div>

        <button class="scene-scroll-cue" type="button" @click="scrollToScene(1, true)">
          往下逛逛
          <IconGlyph name="arrow-down" :size="16" />
        </button>
      </section>

      <section
        id="scene-status"
        class="home-scene status-scene"
        :class="{ 'is-active': activeScene === 1 }"
        data-scene-index="1"
        aria-labelledby="status-title"
      >
        <div class="home-scene__background" :style="sceneBackgroundStyles.status"></div>
        <ScrapbookCard
          as="section"
          tone="cream"
          :tilt="0.45"
          class="status-panel scene-reveal"
          style="--reveal-delay: 75ms"
        >
          <header class="status-panel__header">
            <div class="status-panel__avatar-wrap">
              <img
                class="status-panel__avatar"
                :src="siteConfig.profile.avatar"
                :alt="siteConfig.profile.avatarAlt"
              />
              <span aria-hidden="true">✓</span>
            </div>
            <div class="status-panel__identity">
              <p>CHARACTER FILE · 角色小档案</p>
              <h2 id="status-title">{{ siteConfig.profile.name }}</h2>
              <span>{{ siteConfig.profile.tagline }}</span>
            </div>
            <span class="status-panel__stamp" aria-hidden="true">MEOW<br />APPROVED</span>
            <dl class="status-panel__facts">
              <div v-for="fact in facts" :key="fact.label">
                <dt>{{ fact.label }}</dt>
                <dd>{{ fact.value }}</dd>
              </div>
            </dl>
          </header>

          <div class="status-panel__body">
            <ContributionCalendar compact />

            <section class="equipment" aria-labelledby="equipment-title">
              <header>
                <div>
                  <p>STICKER COLLECTION</p>
                  <h3 id="equipment-title">技能吧唧</h3>
                </div>
                <span aria-hidden="true">贴贴！</span>
              </header>
              <div class="equipment__slots">
                <div
                  v-for="(skill, index) in skills"
                  :key="skill.label"
                  class="equipment-slot"
                  :class="`equipment-slot--${index % 4}`"
                >
                  <ConfigIcon :name="skill.icon" :provider="skill.iconProvider" :size="20" />
                  <span>{{ skill.label }}</span>
                </div>
              </div>
            </section>
          </div>
        </ScrapbookCard>
      </section>

      <section
        id="scene-showcase"
        class="home-scene showcase-scene"
        :class="{ 'is-active': activeScene === 2 }"
        data-scene-index="2"
        aria-labelledby="showcase-title"
      >
        <div class="home-scene__background" :style="sceneBackgroundStyles.showcase"></div>
        <header class="showcase-heading scene-reveal" style="--reveal-delay: 75ms">
          <span aria-hidden="true">NEW QUEST!</span>
          <div>
            <p>THE TOY BOX · SELECT A CARTRIDGE</p>
            <h2 id="showcase-title">项目玩具箱</h2>
          </div>
          <strong aria-hidden="true">૮₍˶ᵔ ᵕ ᵔ˶₎ა</strong>
        </header>

        <div
          v-if="projects.length"
          class="project-carousel scene-reveal"
          style="--reveal-delay: 170ms"
          role="region"
          aria-roledescription="项目卡带轮播"
          :aria-label="`当前项目：${activeProjectItem?.title ?? ''}`"
          tabindex="0"
          @keydown="handleCarouselKeydown"
        >
          <div class="project-carousel__stage">
            <button
              v-if="farPreviousProject"
              class="project-preview project-preview--far project-preview--far-previous"
              type="button"
              :aria-label="`向前两个项目：${farPreviousProject.title}`"
              @click="changeProject(-2)"
            >
              <ConfigIcon
                :name="farPreviousProject.icon"
                :provider="farPreviousProject.iconProvider"
                :size="20"
              />
              <small>- 02</small>
              <strong>{{ farPreviousProject.title }}</strong>
            </button>

            <button
              v-if="previousProject"
              class="project-preview project-preview--previous"
              type="button"
              :aria-label="`上一个项目：${previousProject.title}`"
              @click="changeProject(-1)"
            >
              <ConfigIcon :name="previousProject.icon" :provider="previousProject.iconProvider" :size="22" />
              <small>PREV</small>
              <strong>{{ previousProject.title }}</strong>
            </button>

            <article v-if="activeProjectItem" :key="activeProjectItem.id" class="project-cartridge">
              <div class="project-cartridge__screen">
                <span class="project-cartridge__screw project-cartridge__screw--left" aria-hidden="true">×</span>
                <span class="project-cartridge__screw project-cartridge__screw--right" aria-hidden="true">×</span>
                <ConfigIcon
                  :name="activeProjectItem.icon"
                  :provider="activeProjectItem.iconProvider"
                  :size="38"
                />
                <span class="project-cartridge__face" aria-hidden="true">&gt; ᴗ &lt;</span>
                <p>{{ String(activeProject + 1).padStart(2, '0') }} / {{ String(projects.length).padStart(2, '0') }}</p>
              </div>
              <div class="project-cartridge__body">
                <p class="project-cartridge__eyebrow">READY TO PLAY</p>
                <h3>{{ activeProjectItem.title }}</h3>
                <p class="project-cartridge__description">{{ activeProjectItem.description }}</p>
                <div class="project-cartridge__skills">
                  <span v-for="technology in activeProjectItem.technologies" :key="technology">
                    {{ technology }}
                  </span>
                </div>
                <a
                  class="chunky-button chunky-button--yellow project-cartridge__link"
                  :href="activeProjectItem.href"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  查看项目
                  <IconGlyph name="arrow-up-right" :size="17" />
                </a>
              </div>
            </article>

            <button
              v-if="nextProject"
              class="project-preview project-preview--next"
              type="button"
              :aria-label="`下一个项目：${nextProject.title}`"
              @click="changeProject(1)"
            >
              <ConfigIcon :name="nextProject.icon" :provider="nextProject.iconProvider" :size="22" />
              <small>NEXT</small>
              <strong>{{ nextProject.title }}</strong>
            </button>

            <button
              v-if="farNextProject"
              class="project-preview project-preview--far project-preview--far-next"
              type="button"
              :aria-label="`向后两个项目：${farNextProject.title}`"
              @click="changeProject(2)"
            >
              <ConfigIcon
                :name="farNextProject.icon"
                :provider="farNextProject.iconProvider"
                :size="20"
              />
              <small>+ 02</small>
              <strong>{{ farNextProject.title }}</strong>
            </button>
          </div>

          <div class="project-carousel__controls">
            <button type="button" aria-label="上一个项目" @click="changeProject(-1)">
              <IconGlyph name="arrow-right" :size="18" />
            </button>
            <div class="project-carousel__dots" aria-label="选择项目">
              <button
                v-for="(project, index) in projects"
                :key="project.id"
                type="button"
                :class="{ 'is-active': index === activeProject }"
                :aria-label="`查看项目：${project.title}`"
                :aria-current="index === activeProject ? 'true' : undefined"
                @click="selectProject(index)"
              ></button>
            </div>
            <button type="button" aria-label="下一个项目" @click="changeProject(1)">
              <IconGlyph name="arrow-right" :size="18" />
            </button>
          </div>
        </div>

        <AppFooter
          v-if="siteConfig.footer.enabled"
          compact
          class="showcase-footer scene-reveal"
          style="--reveal-delay: 310ms"
        />
      </section>
    </div>

    <nav class="scene-pagination" aria-label="主页场景导航">
      <button
        v-for="(scene, index) in scenes"
        :key="scene.id"
        type="button"
        :class="{ 'is-active': activeScene === index }"
        :aria-label="`前往${scene.label}`"
        :aria-current="activeScene === index ? 'step' : undefined"
        @click="scrollToScene(index, true)"
      >
        <span>{{ scene.label }}</span>
      </button>
    </nav>
  </div>
</template>

<style scoped>
.home-view {
  --home-paper: #fffdf9;
  --home-ink: #4a3b32;
  --home-navy: #2b2d42;
  --home-pink: #ff9ebb;
  --home-yellow: #fdfd96;
  --home-mint: #a7e9af;
  position: relative;
  height: 100dvh;
  min-height: 32rem;
  overflow: hidden;
  color: var(--home-ink);
  font-family: ui-rounded, 'Hiragino Maru Gothic ProN', 'Microsoft YaHei UI', sans-serif;
}

.home-scenes {
  position: relative;
  z-index: 1;
  height: 100%;
  overflow-x: clip;
  overflow-y: auto;
  overscroll-behavior-y: contain;
  scroll-behavior: smooth;
  scrollbar-width: none;
  scroll-snap-type: y mandatory;
}

.home-scenes::-webkit-scrollbar {
  display: none;
}

.home-scene {
  position: relative;
  display: grid;
  width: 100%;
  height: 100dvh;
  min-height: 32rem;
  overflow: hidden;
  scroll-snap-align: start;
  scroll-snap-stop: always;
}

.home-scene__background {
  position: absolute;
  z-index: 0;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.home-scene__background::before,
.home-scene__background::after {
  position: absolute;
  content: '';
  pointer-events: none;
}

.home-scene__background::before {
  inset: -1.5%;
  background-image: var(--scene-background-image);
  background-position: var(--scene-background-position);
  background-size: cover;
  filter: blur(var(--scene-background-blur)) grayscale(var(--scene-background-grayscale))
    saturate(var(--scene-background-saturation)) brightness(var(--scene-background-brightness));
  opacity: var(--scene-background-opacity);
  transform: scale(1.035);
  animation: scene-background-breathe 22s ease-in-out infinite alternate;
}

.home-scene__background::after {
  inset: 0;
  background:
    radial-gradient(circle, rgb(255 158 187 / 32%) 2px, transparent 2.5px) 0 0 / 36px 36px,
    linear-gradient(90deg, rgb(167 233 175 / 13%) 1px, transparent 1px) 0 0 / 72px 72px,
    linear-gradient(rgb(167 233 175 / 13%) 1px, transparent 1px) 0 0 / 72px 72px,
    #fff7ef;
  opacity: calc(0.46 + var(--scene-background-overlay) * 0.28);
}

@keyframes scene-background-breathe {
  to {
    transform: scale(1.075) translate3d(-0.35%, 0.25%, 0);
  }
}

.scene-reveal {
  opacity: 0;
  transform: translateY(2.2rem) scale(0.96);
}

.home-scene.is-active .scene-reveal {
  animation: scene-pop-in 1100ms cubic-bezier(0.34, 1.56, 0.64, 1) var(--reveal-delay, 0ms) both;
}

@keyframes scene-pop-in {
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.hero-scene {
  place-items: center;
  padding: clamp(6.7rem, 13vh, 8.8rem) clamp(1.25rem, 6vw, 6rem) clamp(4.5rem, 8vh, 6rem);
}

.hero-composition {
  position: relative;
  display: grid;
  width: min(68rem, 86vw);
  grid-template-columns: minmax(0, 1.08fr) minmax(17rem, 0.72fr);
  align-items: center;
  gap: clamp(2rem, 6vw, 5rem);
  z-index: 1;
}

.hero-journal {
  z-index: 1;
  min-width: 0;
  padding: clamp(1.6rem, 4vw, 3rem);
}

.hero-journal::after {
  position: absolute;
  right: 8%;
  bottom: 14%;
  width: 3.5rem;
  height: 3.5rem;
  border: 3px dashed rgb(74 59 50 / 26%);
  border-radius: 50%;
  content: '';
  pointer-events: none;
}

.hero-journal__label,
.hero-journal__date {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-family: var(--font-mono);
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.11em;
}

.hero-journal__label {
  padding: 0.45rem 0.7rem;
  border: 2px solid var(--home-ink);
  border-radius: 0.8rem;
  background-color: var(--home-mint);
  transform: rotate(-2deg);
}

.hero-journal__date {
  position: absolute;
  top: 2rem;
  right: 2rem;
  color: rgb(74 59 50 / 62%);
}

.hero-journal__hello {
  margin-top: clamp(1.35rem, 3vh, 2rem);
  color: #d45c84;
  font-size: clamp(0.85rem, 1.4vw, 1.05rem);
  font-weight: 800;
}

.hero-journal h1 {
  max-width: 13ch;
  margin-top: 0.35rem;
  color: var(--home-navy);
  font-size: clamp(2.35rem, 5.5vw, 4.5rem);
  font-weight: 900;
  letter-spacing: -0.055em;
  line-height: 1.05;
}

.hero-journal h1 span {
  display: block;
  margin-top: 0.2rem;
  color: #d45c84;
  font-size: 0.22em;
  letter-spacing: 0.05em;
}

.hero-journal__typewriter {
  min-height: 1.7rem;
  margin-top: 1rem;
  color: var(--home-ink);
  font-size: clamp(0.95rem, 1.5vw, 1.1rem);
  font-weight: 800;
}

.hero-journal__description {
  max-width: 37rem;
  margin-top: 0.6rem;
  color: rgb(74 59 50 / 78%);
  font-size: clamp(0.78rem, 1.2vw, 0.94rem);
  line-height: 1.75;
}

.hero-journal__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.85rem;
  margin-top: clamp(1.25rem, 3vh, 2rem);
}

.hero-journal__paw {
  position: absolute;
  right: 1.4rem;
  bottom: 0.8rem;
  font-size: 1.35rem;
  transform: rotate(14deg);
}

.chunky-button,
.scene-scroll-cue,
.project-carousel__controls > button {
  display: inline-flex;
  min-height: 2.9rem;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.62rem 1rem;
  border: 3px solid var(--home-ink);
  border-radius: 1rem;
  background-color: #ffffff;
  box-shadow: 0 5px 0 var(--home-ink);
  color: var(--home-navy);
  cursor: pointer;
  font: inherit;
  font-size: var(--text-sm);
  font-weight: 900;
  transition:
    box-shadow 300ms cubic-bezier(0.34, 1.56, 0.64, 1),
    transform 420ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

.chunky-button--pink {
  background-color: var(--home-pink);
}

.chunky-button--mint {
  background-color: var(--home-mint);
}

.chunky-button--yellow {
  background-color: var(--home-yellow);
}

.chunky-button:active,
.scene-scroll-cue:active,
.project-carousel__controls > button:active {
  box-shadow: 0 0 0 var(--home-ink);
  transform: translateY(5px);
}

.hero-polaroid {
  position: relative;
  width: min(25rem, 100%);
  margin: 0;
  padding: 1rem 1rem 1.45rem;
  border: 4px solid var(--home-ink);
  border-radius: 1.4rem;
  background-color: #ffffff;
  box-shadow: 8px 9px 0 var(--home-mint);
  transform: rotate(3deg);
}

.hero-polaroid__photo {
  position: relative;
  overflow: hidden;
  aspect-ratio: 0.94;
  border: 3px solid var(--home-ink);
  border-radius: 0.8rem;
  background-color: #ffe8f0;
}

.hero-polaroid__photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-polaroid__photo > span {
  position: absolute;
  top: 0.55rem;
  right: 0.7rem;
  color: var(--home-yellow);
  font-size: 1.8rem;
  -webkit-text-stroke: 1.5px var(--home-ink);
}

.hero-polaroid figcaption {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 0.8rem;
}

.hero-polaroid figcaption strong {
  color: var(--home-navy);
  font-size: clamp(1.2rem, 2vw, 1.55rem);
  font-weight: 900;
}

.hero-polaroid figcaption small {
  font-family: var(--font-mono);
  font-size: 0.62rem;
  font-weight: 800;
}

.hero-polaroid__scribble {
  position: absolute;
  right: -1.5rem;
  bottom: 28%;
  padding: 0.35rem 0.6rem;
  border: 2px solid var(--home-ink);
  border-radius: 0.7rem;
  background-color: var(--home-pink);
  font-size: 0.7rem;
  font-weight: 900;
  transform: rotate(-8deg);
}

.hero-polaroid__tape {
  position: absolute;
  z-index: 2;
  width: 5.6rem;
  height: 1.55rem;
  border: 2px solid rgb(74 59 50 / 24%);
  background-color: rgb(253 253 150 / 86%);
  clip-path: polygon(3% 6%, 98% 0, 94% 94%, 0 100%);
}

.hero-polaroid__tape--top {
  top: -0.9rem;
  left: 32%;
  transform: rotate(-4deg);
}

.hero-polaroid__tape--side {
  top: 38%;
  right: -2.5rem;
  background-color: rgb(255 158 187 / 70%);
  transform: rotate(82deg);
}

.hero-doodle {
  position: absolute;
  z-index: 3;
  font-weight: 900;
  pointer-events: none;
}

.hero-doodle--star {
  top: -1.5rem;
  left: 45%;
  color: #e4bd29;
  font-size: 2rem;
  transform: rotate(12deg);
}

.hero-doodle--heart {
  right: 31%;
  bottom: -2.5rem;
  color: #e8608b;
  font-size: 3rem;
  transform: rotate(-11deg);
}

.scene-scroll-cue {
  position: absolute;
  right: clamp(1.25rem, 5vw, 5rem);
  bottom: clamp(1.15rem, 3vh, 2rem);
  min-height: 2.65rem;
  padding: 0.45rem 0.8rem;
  background-color: #ffffff;
  font-size: 0.68rem;
}

.status-scene {
  place-items: center;
  padding: clamp(6.6rem, 12vh, 8.3rem) clamp(1rem, 6vw, 6rem) clamp(2rem, 5vh, 3.5rem);
}

.status-panel {
  z-index: 1;
  width: min(70rem, 86vw);
  max-height: calc(100dvh - 9.5rem);
  padding: clamp(1.3rem, 3vw, 2.35rem);
  overflow-y: auto;
  scrollbar-color: var(--home-pink) transparent;
  scrollbar-width: thin;
}

.status-panel__header {
  position: relative;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: clamp(0.85rem, 2vw, 1.5rem);
  padding-bottom: 1.35rem;
  border-bottom: 3px dashed rgb(74 59 50 / 30%);
}

.status-panel__avatar-wrap {
  position: relative;
}

.status-panel__avatar {
  width: clamp(4.25rem, 7vw, 5.7rem);
  aspect-ratio: 1;
  border: 3px solid var(--home-ink);
  border-radius: 46% 54% 48% 52%;
  object-fit: cover;
  box-shadow: 4px 4px 0 var(--home-pink);
  transform: rotate(-3deg);
}

.status-panel__avatar-wrap > span {
  position: absolute;
  right: -0.15rem;
  bottom: -0.15rem;
  display: grid;
  width: 1.55rem;
  height: 1.55rem;
  place-items: center;
  border: 2px solid var(--home-ink);
  border-radius: 50%;
  background-color: var(--home-mint);
  font-size: 0.72rem;
  font-weight: 900;
}

.status-panel__identity > p,
.equipment header p,
.showcase-heading p,
.project-cartridge__eyebrow {
  color: #b14c70;
  font-family: var(--font-mono);
  font-size: 0.64rem;
  font-weight: 900;
  letter-spacing: 0.12em;
}

.status-panel__identity h2 {
  margin-top: 0.2rem;
  color: var(--home-navy);
  font-size: clamp(1.45rem, 3vw, 2.25rem);
  font-weight: 900;
}

.status-panel__identity > span {
  color: rgb(74 59 50 / 72%);
  font-size: var(--text-sm);
}

.status-panel__stamp {
  display: grid;
  width: 4.4rem;
  height: 4.4rem;
  place-items: center;
  border: 3px solid #dd6e91;
  border-radius: 50%;
  color: #cf547b;
  font-family: var(--font-mono);
  font-size: 0.57rem;
  font-weight: 900;
  line-height: 1.15;
  text-align: center;
  transform: rotate(10deg);
}

.status-panel__facts {
  display: flex;
  grid-column: 1 / -1;
  gap: 0.65rem;
  margin: 0;
}

.status-panel__facts div {
  display: grid;
  min-width: 0;
  flex: 1;
  gap: 0.12rem;
  padding: 0.55rem 0.75rem;
  border: 2px solid var(--home-ink);
  border-radius: 0.8rem;
  background-color: #fff4c8;
}

.status-panel__facts div:nth-child(2) {
  background-color: #e2f6e5;
  transform: rotate(0.7deg);
}

.status-panel__facts div:nth-child(3) {
  background-color: #ffe8f0;
  transform: rotate(-0.7deg);
}

.status-panel__facts dt {
  color: rgb(74 59 50 / 62%);
  font-size: 0.58rem;
}

.status-panel__facts dd {
  margin: 0;
  overflow: hidden;
  color: var(--home-navy);
  font-size: 0.74rem;
  font-weight: 900;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-panel__body {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(17rem, 0.85fr);
  gap: clamp(1.2rem, 3vw, 2.3rem);
  padding-top: clamp(1rem, 2.5vh, 1.6rem);
}

.equipment header {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.8rem;
}

.equipment header > span {
  padding: 0.22rem 0.5rem;
  border: 2px solid var(--home-ink);
  border-radius: 0.65rem;
  background-color: var(--home-yellow);
  font-size: 0.65rem;
  font-weight: 900;
  transform: rotate(5deg);
}

.equipment h3 {
  margin-top: 0.2rem;
  color: var(--home-navy);
  font-size: 1.1rem;
  font-weight: 900;
}

.equipment__slots {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.75rem 0.6rem;
}

.equipment-slot {
  --badge-turn: -3deg;
  display: grid;
  min-width: 0;
  min-height: 4.6rem;
  place-items: center;
  align-content: center;
  gap: 0.3rem;
  padding: 0.45rem 0.25rem;
  border: 3px solid var(--home-ink);
  border-radius: 48% 52% 46% 54% / 54% 45% 55% 46%;
  background-color: #ffd7e3;
  box-shadow: 3px 4px 0 var(--home-ink);
  color: var(--home-navy);
  transform: rotate(var(--badge-turn));
  transition:
    box-shadow 360ms cubic-bezier(0.34, 1.56, 0.64, 1),
    transform 520ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

.equipment-slot--1 {
  --badge-turn: 2deg;
  border-radius: 1.1rem 1.6rem 1.2rem 1.7rem;
  background-color: #fff5ad;
}

.equipment-slot--2 {
  --badge-turn: -1deg;
  border-radius: 50%;
  background-color: #c8f1ce;
}

.equipment-slot--3 {
  --badge-turn: 3deg;
  border-radius: 1.5rem 0.9rem 1.6rem 1rem;
  background-color: #d9e9ff;
}

.equipment-slot span {
  max-width: 100%;
  overflow: hidden;
  font-size: 0.66rem;
  font-weight: 900;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.showcase-scene {
  place-items: center;
  padding: clamp(6.5rem, 12vh, 8.3rem) clamp(1rem, 6vw, 6rem) clamp(2rem, 4vh, 3rem);
}

.showcase-heading {
  position: absolute;
  z-index: 4;
  top: clamp(6.6rem, 12vh, 8.2rem);
  left: clamp(1.5rem, 8vw, 8rem);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.showcase-heading > span {
  padding: 0.45rem 0.65rem;
  border: 3px solid var(--home-ink);
  border-radius: 0.75rem;
  background-color: var(--home-pink);
  box-shadow: 3px 3px 0 var(--home-ink);
  color: var(--home-navy);
  font-family: var(--font-mono);
  font-size: 0.57rem;
  font-weight: 900;
  transform: rotate(-5deg);
}

.showcase-heading h2 {
  margin-top: 0.15rem;
  color: var(--home-navy);
  font-size: clamp(1.8rem, 4vw, 3.35rem);
  font-weight: 900;
  letter-spacing: -0.045em;
}

.showcase-heading > strong {
  align-self: end;
  color: #c55378;
  font-size: 0.75rem;
}

.project-carousel {
  position: relative;
  z-index: 1;
  width: min(75rem, 92vw);
  outline: none;
}

.project-carousel:focus-visible {
  border-radius: 2rem;
  outline: 3px dashed var(--home-pink);
  outline-offset: 0.75rem;
}

.project-carousel__stage {
  position: relative;
  display: grid;
  min-height: min(31rem, 62vh);
  place-items: center;
}

.project-cartridge {
  position: relative;
  z-index: 3;
  display: grid;
  width: min(31rem, 72vw);
  grid-template-columns: 0.72fr 1.28fr;
  overflow: hidden;
  border: 4px solid var(--home-ink);
  border-radius: 2rem 2rem 2.7rem 2.7rem;
  background-color: #fff8cf;
  box-shadow: 8px 9px 0 var(--home-pink);
  animation: cartridge-swap 720ms cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

.project-cartridge::after {
  position: absolute;
  right: 12%;
  bottom: -0.25rem;
  left: 12%;
  height: 0.75rem;
  border-top: 3px solid var(--home-ink);
  border-radius: 50% 50% 0 0;
  background-color: var(--home-pink);
  content: '';
}

@keyframes cartridge-swap {
  from {
    opacity: 0;
    transform: translateY(1.6rem) rotate(-2deg) scale(0.92);
  }

  to {
    opacity: 1;
    transform: translateY(0) rotate(0) scale(1);
  }
}

.project-cartridge__screen {
  position: relative;
  display: grid;
  min-height: 20rem;
  place-items: center;
  align-content: center;
  gap: 0.75rem;
  padding: 1.4rem;
  border-right: 4px solid var(--home-ink);
  background-color: #a7e9af;
  color: var(--home-navy);
}

.project-cartridge__screen :deep(svg) {
  padding: 0.65rem;
  box-sizing: content-box;
  border: 3px solid var(--home-ink);
  border-radius: 1rem;
  background-color: #fffdf9;
  box-shadow: 4px 4px 0 var(--home-ink);
}

.project-cartridge__face {
  font-family: var(--font-mono);
  font-size: 0.78rem;
  font-weight: 900;
}

.project-cartridge__screen p {
  font-family: var(--font-mono);
  font-size: 0.6rem;
  font-weight: 900;
}

.project-cartridge__screw {
  position: absolute;
  top: 0.8rem;
  display: grid;
  width: 1.25rem;
  height: 1.25rem;
  place-items: center;
  border: 2px solid var(--home-ink);
  border-radius: 50%;
  background-color: #ffffff;
  font-size: 0.7rem;
  font-weight: 900;
}

.project-cartridge__screw--left {
  left: 0.8rem;
}

.project-cartridge__screw--right {
  right: 0.8rem;
}

.project-cartridge__body {
  display: flex;
  min-width: 0;
  flex-direction: column;
  align-items: flex-start;
  padding: clamp(1.35rem, 3vw, 2.2rem);
}

.project-cartridge h3 {
  max-width: 100%;
  margin-top: 0.35rem;
  overflow: hidden;
  color: var(--home-navy);
  font-size: clamp(1.45rem, 3vw, 2.25rem);
  font-weight: 900;
  letter-spacing: -0.035em;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.project-cartridge__description {
  display: -webkit-box;
  margin-top: 0.75rem;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  color: rgb(74 59 50 / 78%);
  font-size: 0.82rem;
  line-height: 1.75;
}

.project-cartridge__skills {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-top: 1rem;
}

.project-cartridge__skills span {
  padding: 0.28rem 0.48rem;
  border: 2px solid var(--home-ink);
  border-radius: 0.6rem;
  background-color: #ffffff;
  color: var(--home-ink);
  font-size: 0.6rem;
  font-weight: 900;
}

.project-cartridge__skills span:nth-child(2n) {
  background-color: #ffe3ec;
  transform: rotate(1.5deg);
}

.project-cartridge__link {
  margin-top: auto;
}

.project-preview {
  position: absolute;
  z-index: 1;
  display: grid;
  width: min(18rem, 28vw);
  min-height: 18rem;
  align-content: center;
  justify-items: start;
  gap: 0.65rem;
  padding: 1.5rem;
  overflow: hidden;
  border: 4px solid var(--home-ink);
  border-radius: 1.7rem;
  background-color: #ffd9e4;
  box-shadow: 6px 7px 0 var(--home-ink);
  color: var(--home-navy);
  cursor: pointer;
  font: inherit;
  text-align: left;
  transition:
    box-shadow 360ms cubic-bezier(0.34, 1.56, 0.64, 1),
    transform 520ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

.project-preview::after {
  position: absolute;
  right: -2rem;
  bottom: -2rem;
  width: 7rem;
  height: 7rem;
  border: 3px dashed rgb(74 59 50 / 30%);
  border-radius: 50%;
  content: '';
}

.project-preview--previous {
  left: 13%;
  transform: translateX(-8%) rotate(-7deg) scale(0.88);
}

.project-preview--next {
  right: 13%;
  background-color: #d8f5dc;
  transform: translateX(8%) rotate(7deg) scale(0.88);
}

.project-preview--far {
  z-index: 0;
  width: min(14rem, 20vw);
  min-height: 15rem;
  background-color: #fff1ae;
}

.project-preview--far-previous {
  left: 0;
  transform: translateX(-5%) rotate(-11deg) scale(0.78);
}

.project-preview--far-next {
  right: 0;
  background-color: #cfe8ff;
  transform: translateX(5%) rotate(11deg) scale(0.78);
}

.project-preview small {
  padding: 0.2rem 0.4rem;
  border: 2px solid var(--home-ink);
  border-radius: 0.45rem;
  background-color: #ffffff;
  font-family: var(--font-mono);
  font-size: 0.56rem;
  font-weight: 900;
}

.project-preview strong {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  font-size: clamp(1rem, 2vw, 1.35rem);
  font-weight: 900;
}

.project-carousel__controls {
  position: relative;
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.9rem;
  margin-top: 0.45rem;
}

.project-carousel__controls > button {
  width: 2.85rem;
  min-height: 2.85rem;
  padding: 0;
  border-radius: 50%;
  background-color: #ffffff;
}

.project-carousel__controls > button:first-child :deep(svg) {
  transform: rotate(180deg);
}

.project-carousel__dots {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.45rem 0.6rem;
  border: 3px solid var(--home-ink);
  border-radius: 999px;
  background-color: #ffffff;
}

.project-carousel__dots button {
  width: 0.68rem;
  height: 0.68rem;
  padding: 0;
  border: 2px solid var(--home-ink);
  border-radius: 50%;
  background-color: #ffffff;
  cursor: pointer;
  transition: transform 380ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

.project-carousel__dots button:nth-child(3n + 1).is-active {
  background-color: var(--home-pink);
}

.project-carousel__dots button:nth-child(3n + 2).is-active {
  background-color: var(--home-yellow);
}

.project-carousel__dots button:nth-child(3n).is-active {
  background-color: var(--home-mint);
}

.project-carousel__dots button.is-active {
  transform: scale(1.35);
}

.showcase-footer {
  position: absolute;
  z-index: 5;
  right: 50%;
  bottom: 0.85rem;
  width: min(68rem, 78vw);
  transform: translateX(50%);
}

.showcase-scene.is-active .showcase-footer.scene-reveal {
  animation-name: footer-pop-in;
}

@keyframes footer-pop-in {
  from {
    opacity: 0;
    transform: translate(50%, 1.5rem) scale(0.97);
  }

  to {
    opacity: 1;
    transform: translate(50%, 0) scale(1);
  }
}

.scene-pagination {
  position: fixed;
  z-index: 8;
  top: 50%;
  right: clamp(0.8rem, 2vw, 1.8rem);
  display: grid;
  gap: 0.75rem;
  transform: translateY(-50%);
}

.scene-pagination button {
  position: relative;
  width: 0.95rem;
  height: 0.95rem;
  padding: 0;
  border: 2px solid var(--home-ink);
  border-radius: 50%;
  background-color: #ffffff;
  box-shadow: 2px 2px 0 var(--home-ink);
  cursor: pointer;
  transition:
    background-color 300ms ease,
    transform 420ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

.scene-pagination button:nth-child(2) {
  border-radius: 35%;
}

.scene-pagination button.is-active {
  background-color: var(--home-pink);
  transform: scale(1.35) rotate(8deg);
}

.scene-pagination span {
  position: absolute;
  top: 50%;
  right: calc(100% + 0.7rem);
  padding: 0.25rem 0.45rem;
  border: 2px solid var(--home-ink);
  border-radius: 0.5rem;
  background-color: #ffffff;
  color: var(--home-ink);
  font-size: 0.6rem;
  font-weight: 900;
  opacity: 0;
  pointer-events: none;
  transform: translate(0.4rem, -50%);
  transition:
    opacity 220ms ease,
    transform 320ms cubic-bezier(0.34, 1.56, 0.64, 1);
  white-space: nowrap;
}

@media (hover: hover) {
  .chunky-button:hover,
  .scene-scroll-cue:hover,
  .project-carousel__controls > button:hover {
    box-shadow: 0 8px 0 var(--home-ink);
    transform: translateY(-0.25rem) scale(1.035);
  }

  .hero-polaroid:hover {
    box-shadow: 11px 12px 0 var(--home-mint);
    transform: translateY(-0.5rem) rotate(-1deg) scale(1.02);
  }

  .equipment-slot:hover {
    z-index: 3;
    box-shadow: 6px 7px 0 var(--home-ink);
    transform: translateY(-0.3rem) rotate(0) scale(1.25);
  }

  .project-preview--previous:hover {
    z-index: 4;
    transform: translateX(0) rotate(-3deg) scale(0.96);
  }

  .project-preview--next:hover {
    z-index: 4;
    transform: translateX(0) rotate(3deg) scale(0.96);
  }

  .project-preview--far-previous:hover {
    z-index: 4;
    transform: translateX(1rem) rotate(-6deg) scale(0.88);
  }

  .project-preview--far-next:hover {
    z-index: 4;
    transform: translateX(-1rem) rotate(6deg) scale(0.88);
  }

  .scene-pagination button:hover span,
  .scene-pagination button:focus-visible span {
    opacity: 1;
    transform: translate(0, -50%);
  }
}

.hero-polaroid {
  transition:
    box-shadow 380ms cubic-bezier(0.34, 1.56, 0.64, 1),
    transform 520ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

:is(.chunky-button, .scene-scroll-cue, .project-preview, .project-carousel button, .scene-pagination button):focus-visible {
  outline: 3px dashed #c84671;
  outline-offset: 4px;
}

@media (max-width: 64rem) {
  .hero-composition {
    width: min(59rem, 87vw);
    grid-template-columns: minmax(0, 1fr) minmax(15rem, 0.62fr);
    gap: 2.2rem;
  }

  .status-panel {
    width: min(58rem, 88vw);
  }

  .status-panel__body {
    grid-template-columns: 1fr;
  }

  .project-preview {
    width: 23vw;
  }
}

@media (max-width: 47.99rem) {
  .home-scene__background {
    background-image: var(--scene-background-mobile-image);
  }

  .home-scene__background::before {
    background-image: var(--scene-background-mobile-image);
  }

  .hero-scene {
    padding: 6rem 1.1rem 3.6rem;
  }

  .hero-composition {
    display: block;
    width: min(33rem, 88vw);
  }

  .hero-journal {
    padding: 7.5rem 1.2rem 1.3rem;
  }

  .hero-journal__date {
    top: 1.3rem;
    left: 1.2rem;
    right: auto;
  }

  .hero-journal__label {
    position: absolute;
    top: 3.1rem;
    left: 1.1rem;
  }

  .hero-journal__hello {
    margin-top: 0;
  }

  .hero-journal h1 {
    font-size: clamp(2rem, 12vw, 3.1rem);
  }

  .hero-journal__description {
    display: -webkit-box;
    overflow: hidden;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }

  .hero-polaroid {
    position: absolute;
    z-index: 3;
    top: -2.7rem;
    right: -0.4rem;
    width: 10.2rem;
    padding: 0.5rem 0.5rem 0.65rem;
    border-width: 3px;
    box-shadow: 5px 6px 0 var(--home-mint);
  }

  .hero-polaroid__photo {
    border-width: 2px;
  }

  .hero-polaroid figcaption strong {
    font-size: 0.8rem;
  }

  .hero-polaroid figcaption small,
  .hero-polaroid__scribble,
  .hero-polaroid__tape--side {
    display: none;
  }

  .hero-doodle--heart {
    right: 0;
    bottom: -2rem;
  }

  .scene-scroll-cue {
    right: 1rem;
    bottom: 0.85rem;
  }

  .status-scene {
    padding: 5.8rem 0.8rem 1.6rem;
  }

  .status-panel {
    width: min(32rem, 91vw);
    max-height: calc(100dvh - 7.2rem);
    padding: 1rem;
    border-width: 3px;
  }

  .status-panel__header {
    grid-template-columns: auto 1fr;
  }

  .status-panel__stamp {
    position: absolute;
    top: 0;
    right: 0;
    width: 3.4rem;
    height: 3.4rem;
    font-size: 0.46rem;
    opacity: 0.72;
  }

  .status-panel__identity {
    padding-right: 3rem;
  }

  .status-panel__facts {
    overflow-x: auto;
  }

  .status-panel__facts div {
    min-width: 8rem;
  }

  .status-panel__body {
    grid-template-columns: 1fr;
  }

  .equipment__slots {
    grid-template-columns: repeat(4, minmax(4.3rem, 1fr));
    overflow-x: auto;
    padding: 0.2rem 0.25rem 0.7rem;
  }

  .showcase-scene {
    padding: 5.8rem 0.8rem 1.5rem;
  }

  .showcase-heading {
    top: 5.7rem;
    left: 1rem;
    gap: 0.65rem;
  }

  .showcase-heading > span,
  .showcase-heading > strong,
  .showcase-heading p {
    display: none;
  }

  .showcase-heading h2 {
    font-size: 1.8rem;
  }

  .project-carousel {
    width: 94vw;
    margin-top: 2rem;
  }

  .showcase-footer {
    bottom: 0.55rem;
    width: min(32rem, 88vw);
  }

  .project-carousel__stage {
    min-height: min(28rem, 64vh);
  }

  .project-cartridge {
    width: min(23rem, 78vw);
    grid-template-columns: 1fr;
  }

  .project-cartridge__screen {
    min-height: 8.5rem;
    border-right: 0;
    border-bottom: 4px solid var(--home-ink);
  }

  .project-cartridge__screen :deep(svg) {
    padding: 0.4rem;
  }

  .project-cartridge__body {
    min-height: 14.5rem;
    padding: 1rem 1.1rem 1.25rem;
  }

  .project-cartridge h3 {
    font-size: 1.35rem;
  }

  .project-cartridge__description {
    -webkit-line-clamp: 2;
    margin-top: 0.45rem;
  }

  .project-preview {
    width: 42vw;
    min-height: 16rem;
    padding: 1rem;
    opacity: 1;
  }

  .project-preview--far {
    display: none;
  }

  .project-preview--previous {
    left: -10%;
  }

  .project-preview--next {
    right: -10%;
  }

  .scene-pagination {
    top: 50%;
    right: 0.55rem;
    bottom: auto;
    display: grid;
    transform: translateY(-50%);
  }

  .scene-pagination span {
    display: none;
  }
}

@media (max-height: 44rem) and (min-width: 48rem) {
  .hero-scene,
  .status-scene,
  .showcase-scene {
    padding-top: 5.4rem;
    padding-bottom: 1.3rem;
  }

  .hero-composition {
    width: min(58rem, 82vw);
    transform: scale(0.82);
  }

  .status-panel {
    max-height: calc(100dvh - 6.8rem);
  }

  .showcase-heading {
    top: 5.3rem;
  }

  .project-carousel__stage {
    min-height: min(25rem, 66vh);
    transform: scale(0.84);
  }
}

@media (prefers-reduced-motion: reduce) {
  .scene-reveal,
  .home-scene.is-active .scene-reveal {
    animation: none;
    opacity: 1;
    transform: none;
  }

  .hero-polaroid,
  .chunky-button,
  .scene-scroll-cue,
  .equipment-slot,
  .project-cartridge,
  .project-preview,
  .project-carousel button,
  .scene-pagination button,
  .scene-pagination span {
    animation: none;
    transition: none;
  }

  .home-scenes {
    scroll-behavior: auto;
  }

  .home-scene__background::before {
    animation: none;
    transform: scale(1.04);
  }
}
</style>
