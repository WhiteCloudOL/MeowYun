<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { siteConfig } from '@/config/site'
import { useMotion } from '@/composables/useMotion'
import SceneObject from './SceneObject.vue'
import ImageFallback from '@/components/ui/ImageFallback.vue'
const root = ref<HTMLElement>()
const inView = ref(true)
const response = ref(false)
const { motionAllowed } = useMotion()
let observer: IntersectionObserver | undefined
onMounted(() => {
  observer = new IntersectionObserver(([entry]) => {
    inView.value = !!entry?.isIntersecting
  })
  if (root.value) observer.observe(root.value)
})
onBeforeUnmount(() => observer?.disconnect())
</script>
<template>
  <div
    ref="root"
    class="cottage-scene"
    :class="{ 'scene-awake': motionAllowed && inView }"
    aria-label="小屋里的探索入口"
  >
    <div class="scene-cloud scene-cloud--back" aria-hidden="true"></div>
    <div class="cottage-window">
      <div class="window-sky" aria-hidden="true">
        <i class="window-sun"></i><i class="window-moon"></i><span>✦</span>
      </div>
      <ImageFallback
        :src="siteConfig.profile.avatar"
        :alt="siteConfig.profile.avatarAlt"
        fit="contain"
        loading="eager"
        class="window-avatar"
      />
      <div class="window-sill" aria-hidden="true"></div>
      <span class="window-name">{{ siteConfig.profile.name }}的小屋</span>
    </div>
    <div class="cottage-lamp" aria-hidden="true"><i></i><span></span></div>
    <div class="cottage-desk" aria-hidden="true"></div>
    <RouterLink to="/articles" class="scene-item scene-book"
      ><SceneObject kind="book" /><span>翻翻文章</span></RouterLink
    >
    <RouterLink to="/projects" class="scene-item scene-cassette"
      ><SceneObject kind="cassette" /><span>看看作品</span></RouterLink
    >
    <RouterLink to="/lab/postcard" class="scene-item scene-palette"
      ><SceneObject kind="palette" /><span>做张明信片</span></RouterLink
    >
    <RouterLink to="/postoffice" class="scene-item scene-mail"
      ><SceneObject kind="mail" /><span>云间邮局</span></RouterLink
    >
    <button
      type="button"
      class="cloud-guide"
      aria-label="和云团小向导打招呼"
      :aria-expanded="response"
      @click="response = !response"
    >
      <SceneObject kind="cloud" />
    </button>
    <div v-if="response" class="guide-response" role="status">
      <p>嗨！书架上有真文章，工坊里能做出带得走的明信片。</p>
      <a href="#discovery" class="text-link" @click="response = false">让一张纸签带路 →</a>
    </div>
    <span class="scene-caption">一间小屋，装得下好多好奇心。</span>
  </div>
</template>
<style scoped>
.cottage-scene {
  position: relative;
  min-width: 0;
  height: 540px;
  isolation: isolate;
}
.cottage-window {
  position: absolute;
  left: 24%;
  top: 2%;
  width: 47%;
  height: 65%;
  border: 7px solid var(--scene-outline);
  border-radius: 48% 48% 8px 8px;
  background: var(--scene-sky);
  box-shadow:
    inset 0 0 0 10px var(--color-surface),
    9px 8px 0 var(--color-accent);
}
.window-sky {
  position: absolute;
  inset: 10px;
  overflow: hidden;
  border-radius: 48% 48% 0 0;
  background: linear-gradient(var(--scene-sky), var(--color-blue-soft));
}
.window-sun {
  position: absolute;
  right: 18%;
  top: 10%;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #ffda87;
  border: 2px solid var(--scene-outline);
  transition:
    transform 600ms,
    opacity 600ms;
}
.window-moon {
  position: absolute;
  right: 18%;
  top: 10%;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  box-shadow: -9px 6px 0 #fff3b8;
  transform: translateY(-80px);
  opacity: 0;
  transition:
    transform 600ms,
    opacity 600ms;
}
.window-sky > span {
  position: absolute;
  left: 20%;
  top: 17%;
  font-size: 35px;
  color: var(--color-surface);
}
.window-avatar {
  position: absolute;
  bottom: 3px;
  left: 7%;
  width: 86%;
  height: 71%;
  border-radius: 45% 45% 0 0;
  overflow: hidden;
}
.window-sill {
  position: absolute;
  bottom: -18px;
  left: -10%;
  width: 120%;
  height: 22px;
  border: 3px solid var(--scene-outline);
  border-radius: 6px;
  background: var(--color-blue);
  box-shadow: 0 6px 0 var(--color-accent);
}
.window-name {
  position: absolute;
  top: calc(100% + 23px);
  left: 0;
  width: 100%;
  text-align: center;
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--color-text-secondary);
}
.cottage-desk {
  position: absolute;
  z-index: 1;
  left: 1%;
  right: 0;
  bottom: 9%;
  height: 26%;
  border: 3px solid var(--scene-outline);
  border-radius: 50% 50% 30px 30px/35% 35% 16px 16px;
  background: var(--material-wood);
  box-shadow:
    0 12px 0 var(--material-wood-side),
    0 15px 0 var(--scene-outline);
  transform: rotate(-3deg);
}
.scene-item {
  position: absolute;
  z-index: 3;
  width: 29%;
  text-align: center;
  transition: filter 200ms;
}
.scene-item > svg {
  filter: drop-shadow(3px 5px 0 var(--color-surface));
  transition: transform 300ms var(--ease-spring);
}
.scene-item:hover > svg,
.scene-item:focus-visible > svg {
  transform: translateY(-7px) rotate(3deg);
}
.scene-item > span {
  display: inline-block;
  position: relative;
  padding: 0.3rem 0.75rem;
  background: var(--color-surface);
  border: 1.5px solid var(--scene-outline);
  border-radius: 6px;
  font-weight: 600;
  font-size: var(--text-sm);
  box-shadow: 2px 3px 0 var(--color-primary);
  white-space: nowrap;
}
.scene-book {
  left: 0;
  bottom: 10%;
  transform: rotate(-9deg);
}
.scene-cassette {
  right: 0;
  bottom: 14%;
  transform: rotate(9deg);
}
.scene-palette {
  left: 34%;
  bottom: 1%;
  width: 28%;
  transform: rotate(-3deg);
}
.scene-mail {
  right: 0;
  top: 7%;
  width: 24%;
  transform: rotate(12deg);
}
.cloud-guide {
  position: absolute;
  z-index: 4;
  left: -5%;
  top: 9%;
  width: 26%;
  border: 0;
  background: transparent;
  transform: rotate(-7deg);
}
.guide-response {
  position: absolute;
  z-index: 6;
  top: 29%;
  left: 0;
  width: 15rem;
  max-width: 85%;
  padding: 0.75rem 1rem;
  border: 2px solid var(--scene-outline);
  border-radius: 0 18px 18px 18px;
  background: var(--color-surface);
  box-shadow: 4px 5px 0 var(--color-primary);
  font-size: var(--text-sm);
}
.scene-caption {
  position: absolute;
  bottom: -6%;
  left: 0;
  right: 0;
  text-align: center;
  color: var(--color-text-secondary);
  font-size: var(--text-xs);
}
.scene-cloud--back {
  position: absolute;
  left: -10%;
  top: 49%;
  width: 90%;
  height: 23%;
  border-radius: 50%;
  background: var(--scene-cloud);
  box-shadow: 45px 0 0 var(--scene-cloud);
  opacity: 0.7;
}
.cottage-lamp {
  position: absolute;
  z-index: 2;
  right: 10%;
  top: 44%;
  width: 12%;
  height: 30%;
  border-bottom: 7px solid var(--scene-outline);
}
.cottage-lamp > span {
  position: absolute;
  left: 48%;
  top: 18%;
  bottom: 0;
  border-left: 5px solid var(--scene-outline);
}
.cottage-lamp > i {
  position: absolute;
  z-index: 1;
  top: 0;
  left: 0;
  right: 0;
  height: 34%;
  background: var(--color-primary);
  clip-path: polygon(20% 0, 80% 0, 100% 100%, 0 100%);
  border-bottom: 5px solid var(--scene-outline);
}
.scene-awake .cloud-guide :deep(.guide-eye) {
  transform-origin: 75px 70px;
  animation: guide-blink 7s infinite;
}
.scene-awake .cloud-guide > svg {
  animation: guide-bob 6s ease-in-out infinite;
}
.cottage-window {
  animation: window-arrive 850ms var(--ease-spring) both;
}
.scene-item > svg {
  animation: object-arrive 800ms var(--ease-spring);
}
.scene-cassette > svg {
  animation-delay: 80ms;
}
.scene-palette > svg {
  animation-delay: 160ms;
}
:global([data-theme='dark'] .window-sun ){
  transform: translateY(90px);
  opacity: 0;
}
:global([data-theme='dark'] .window-moon ){
  transform: none;
  opacity: 1;
}
:global([data-theme='dark'] .cottage-lamp ){
  background: radial-gradient(ellipse at top, #ffc96e50, transparent 72%);
}
:global([data-theme='dark'] .cottage-lamp > i ){
  background: #ffd787;
}
@keyframes window-arrive {
  from {
    transform: translateY(20px) rotate(-4deg);
  }
  to {
    transform: none;
  }
}
@keyframes object-arrive {
  0% {
    transform: translateY(24px) rotate(-9deg);
  }
  70% {
    transform: translateY(-5px);
  }
  100% {
    transform: none;
  }
}
@keyframes guide-blink {
  0%,
  42%,
  46%,
  100% {
    transform: scaleY(1);
  }
  44% {
    transform: scaleY(0.12);
  }
}
@keyframes guide-bob {
  0%,
  30%,
  100% {
    transform: none;
  }
  60% {
    transform: translateY(-6px) rotate(3deg);
  }
}
@media (max-width: 700px) {
  .cottage-scene {
    height: 430px;
    max-width: 540px;
    margin-inline: auto;
    width: 100%;
  }
  .cottage-window {
    left: 27%;
    width: 43%;
    height: 63%;
    border-width: 5px;
  }
  .scene-mail {
    top: 2%;
    right: 0;
  }
  .cloud-guide {
    left: 0;
    top: 7%;
    width: 26%;
  }
  .scene-book {
    left: 1%;
    width: 31%;
    bottom: 12%;
  }
  .scene-cassette {
    width: 30%;
    bottom: 17%;
  }
  .scene-palette {
    width: 30%;
    left: 35%;
    bottom: 2%;
  }
  .scene-item > span {
    font-size: 12px;
    padding: 0.35rem 0.55rem;
  }
  .scene-caption {
    bottom: -3%;
  }
}
@media (max-width: 400px) {
  .cottage-scene {
    height: 360px;
  }
  .window-name {
    font-size: 10px;
  }
  .cottage-window {
    height: 61%;
  }
  .scene-item > span {
    font-size: 11px;
  }
  .scene-cloud--back {
    left: 0;
    width: 80%;
  }
}
</style>
