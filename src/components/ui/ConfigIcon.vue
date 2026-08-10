<script setup lang="ts">
import { computed } from 'vue'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { faBilibili, faGithub, faQq } from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import type {
  ConfigIconName,
  FontAwesomeBrandIcon,
  IconProvider,
} from '@/config/schema'
import { isSiteIcon } from '@/types/icon'
import IconGlyph from './IconGlyph.vue'

const props = withDefaults(
  defineProps<{
    name: ConfigIconName
    provider?: IconProvider
    size?: number
  }>(),
  {
    provider: 'lucide',
    size: 18,
  },
)

const brandIcons: Record<FontAwesomeBrandIcon, IconDefinition> = {
  bilibili: faBilibili,
  github: faGithub,
  qq: faQq,
}

// 品牌图标使用显式白名单以保留 Tree Shaking；无效配置回退到通用 Lucide 图标。
const brandIcon = computed(() => brandIcons[props.name as FontAwesomeBrandIcon])
const lucideIcon = computed(() => (isSiteIcon(props.name) ? props.name : 'sparkles'))
</script>

<template>
  <FontAwesomeIcon
    v-if="provider === 'fontawesome' && brandIcon"
    class="config-icon"
    :icon="brandIcon"
    :style="{ width: `${size}px`, height: `${size}px` }"
    aria-hidden="true"
  />
  <IconGlyph v-else :name="lucideIcon" :size="size" />
</template>

<style scoped>
.config-icon {
  display: block;
  flex: none;
}
</style>
