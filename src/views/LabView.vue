<script setup lang="ts">
import { vEntrance } from '@/utils/entrance'
import SoftIllustration from '@/components/ui/SoftIllustration.vue'
import DiscoveryMachine from '@/components/content/DiscoveryMachine.vue'
const tools = [
  {
    to: '/lab/postcard',
    kind: 'mail',
    title: '云朵明信片',
    text: '挑纸、写字、贴印章，导出一张属于你的 PNG。',
    label: '制作明信片',
  },
  {
    to: '/lab/palette',
    kind: 'palette',
    title: '配色调制器',
    text: '留住一抹喜欢的颜色，再调出它的好朋友。',
    label: '调制配色',
  },
  {
    to: '/lab/focus',
    kind: 'clock',
    title: '云端专注角',
    text: '给一件小事留点时间，让云杯慢慢装满。',
    label: '留一段专注时间',
  },
] as const
</script>
<template>
  <div class="lab-view page-shell page-content">
    <header class="lab-heading">
      <span class="material-label">欢迎来到创意工坊</span>
      <h1>好点子，需要一点<br /><span>动手的时间。</span></h1>
      <p>就在浏览器里做点小东西。无需登录，制作内容不会上传。</p>
    </header>
    <div v-entrance class="lab-benches">
      <RouterLink
        v-for="(tool, index) in tools"
        :key="tool.to"
        :to="tool.to"
        class="lab-tool jelly-link"
        ><SoftIllustration :kind="tool.kind" :tone="(['rose', 'blue', 'mint'] as const)[index]" />
        <div>
          <h2>{{ tool.title }}</h2>
          <p>{{ tool.text }}</p>
          <span>{{ tool.label }} ↗</span>
        </div></RouterLink
      >
    </div>
    <DiscoveryMachine />
  </div>
</template>
<style scoped>
.lab-heading {
  max-width: 45rem;
  margin-bottom: 3rem;
}
.lab-heading h1 {
  font-size: clamp(2rem, 4vw, 3.5rem);
}
.lab-heading h1 span {
  color: var(--color-link);
}
.lab-heading p {
  margin-top: 1rem;
  color: var(--color-text-secondary);
}
.lab-benches {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.7rem;
  margin-bottom: 4rem;
}
.lab-tool {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.lab-tool > .soft-illustration {
  width: 190px;
  max-width: 100%;
  align-self: center;
  margin: -1rem 0 0.5rem;
}
.lab-tool h2 {
  font-size: var(--text-xl);
}
.lab-tool p {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  margin: 0.8rem 0 1rem;
}
.lab-tool span {
  font-size: var(--text-sm);
  font-weight: 700;
  color: var(--color-link);
}

@media (max-width: 700px) {
  .lab-benches {
    grid-template-columns: 1fr;
  }
  .lab-tool > .soft-illustration {
    margin: 0;
  }
  .lab-tool {
    display: grid;
    grid-template-columns: 7rem 1fr;
    gap: 1rem;
    align-items: center;
  }
}
</style>
