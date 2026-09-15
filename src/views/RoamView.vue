<script setup lang="ts">
import { vEntrance } from '@/utils/entrance'
import IconGlyph from '@/components/ui/IconGlyph.vue'
const places = [
  {
    to: '/navigation',
    label: '星图导航',
    text: '沿着站点的星光，走到另一个小世界。',
    kind: 'compass',
  },
  { to: '/friends', label: '友链花园', text: '给认真打理的小站，留一块花圃。', kind: 'users' },
  { to: '/moments', label: '云间小记', text: '翻翻文章发布和小屋的真实变化。', kind: 'book-open' },
  { to: '/about', label: '小屋主人', text: '技术、作品和真实的自我介绍。', kind: 'user' },
  { to: '/postoffice', label: '云间邮局', text: '挑张信纸，写几句想说的话。', kind: 'mail' },
  { to: '/pocket', label: '我的口袋', text: '看看收藏，翻一翻本地漫游护照。', kind: 'heart' },
] as const
</script>
<template>
  <div class="roam-view page-shell page-content">
    <header>
      <span class="material-label">小屋之外，也有风景</span>
      <h1>今天想往哪儿走？</h1>
      <p>没有规定的路线。可以逛花园，也可以寄封信。</p>
    </header>
    <div v-entrance class="roam-map">
      <RouterLink
        v-for="place in places"
        :key="place.to"
        :to="place.to"
        class="roam-stop jelly-link"
        ><span class="jelly-icon"><IconGlyph :name="place.kind" :size="28" /></span>
        <div>
          <h2>{{ place.label }}</h2>
          <p>{{ place.text }}</p>
          <span class="roam-direction"
            >走这边 <IconGlyph name="arrow-right" :size="16"
          /></span></div
      ></RouterLink>
    </div>
  </div>
</template>
<style scoped>
.roam-view > header {
  margin-bottom: 3rem;
}
.roam-view h1 {
  font-size: var(--text-2xl);
}
.roam-view header p {
  margin-top: 1rem;
  color: var(--color-text-secondary);
}
.roam-map {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 2rem;
}
.roam-stop {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}
.roam-stop h2 {
  font-size: var(--text-xl);
}
.roam-stop p {
  font-size: var(--text-sm);
  margin: 0.6rem 0;
  color: var(--color-text-secondary);
}
.roam-direction {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 44px;
}
.roam-direction .icon-glyph {
  transition: transform 220ms ease-out;
}
@media (hover: hover) {
  .roam-stop:hover .roam-direction .icon-glyph {
    transform: translateX(3px);
  }
}
.roam-stop:focus-visible .roam-direction .icon-glyph {
  transform: translateX(3px);
}
:global([data-motion='off'] .roam-stop:is(:hover, :focus-visible) .roam-direction .icon-glyph) {
  transform: none;
}
.roam-stop span {
  color: var(--color-link);
  font-size: var(--text-sm);
}
@media (max-width: 750px) {
  .roam-map {
    grid-template-columns: 1fr;
  }
  .roam-stop {
    padding: 1.2rem;
    gap: 1rem;
  }
}
</style>
