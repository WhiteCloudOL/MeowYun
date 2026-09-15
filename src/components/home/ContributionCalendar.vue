<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { siteConfig } from '@/config/site'
import BaseButton from '@/components/ui/BaseButton.vue'
import IconGlyph from '@/components/ui/IconGlyph.vue'
import { contributionWindow, parseContributions, type ContributionDay } from '@/utils/contributions'
withDefaults(defineProps<{ compact?: boolean }>(), { compact: false })
const config = siteConfig.sections.contributions
const state = ref<'loading' | 'live' | 'error'>('loading')
const days = ref<ContributionDay[]>([])
const selected = ref('')
const errorMessage = ref('暂时无法读取贡献记录。')
const viewport = ref<HTMLElement>()
let controller: AbortController | undefined
let timeout: ReturnType<typeof setTimeout> | undefined
let disposed = false
const end = computed(() => days.value.at(-1)?.date ?? '')
const windowDates = computed(() => (end.value ? contributionWindow(end.value) : []))
const dayMap = computed(() => new Map(days.value.map((d) => [d.date, d])))
const total = computed(() => days.value.reduce((sum, d) => sum + d.count, 0))
const detail = computed(() => dayMap.value.get(selected.value))
const months = computed(() =>
  windowDates.value
    .filter((_, i) => i % 7 === 0)
    .map((date, i, array) =>
      i === 0 || date.slice(0, 7) !== array[i - 1]?.slice(0, 7)
        ? Number(date.slice(5, 7)) + '月'
        : '',
    ),
)
async function load() {
  if (!config.enabled) return
  controller?.abort()
  if (timeout) clearTimeout(timeout)
  controller = new AbortController()
  const request = controller
  state.value = 'loading'
  timeout = setTimeout(() => request.abort('timeout'), 8000)
  try {
    if (!config.apiUrl) throw new Error('未配置公开贡献接口。')
    // 只使用可信配置模板，不存储 Token。每次请求可取消，超时后由用户决定是否重试。
    const endpoint = config.apiUrl.replaceAll('{username}', encodeURIComponent(config.username))
    const response = await fetch(endpoint, { signal: request.signal })
    if (!response.ok) throw new Error('贡献接口暂时不可用。')
    const nextDays = parseContributions(await response.json())
    if (disposed || request !== controller) return
    days.value = nextDays
    selected.value = nextDays.at(-1)?.date ?? ''
    state.value = 'live'
  } catch {
    if (disposed || request !== controller) return
    days.value = []
    errorMessage.value =
      request.signal.reason === 'timeout'
        ? '读取超时，请稍后重试。'
        : '暂时无法读取贡献记录，请稍后重试。'
    state.value = 'error'
  } finally {
    if (request === controller && timeout) clearTimeout(timeout)
  }
}
onMounted(load)
onBeforeUnmount(() => {
  disposed = true
  controller?.abort()
  if (timeout) clearTimeout(timeout)
})
</script>
<template>
  <section v-if="config.enabled" class="contribution-calendar" aria-labelledby="contribution-title">
    <header>
      <div>
        <p class="eyebrow"><IconGlyph name="github" :size="16" />公开的代码足迹</p>
        <h2 id="contribution-title">{{ config.title }}</h2>
      </div>
      <a
        class="icon-button"
        :href="config.profileUrl"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="在 GitHub 查看贡献"
        ><IconGlyph name="arrow-up-right"
      /></a>
    </header>
    <div v-if="state === 'loading'" class="contribution-empty" role="status">
      正在读取公开贡献记录…
    </div>
    <div v-else-if="state === 'error'" class="contribution-empty">
      <p role="status">{{ errorMessage }}</p>
      <BaseButton variant="secondary" @click="load">重新读取</BaseButton>
      <p class="muted">也可以直接在 GitHub 查看。</p>
    </div>
    <template v-else
      ><p class="contribution-summary">{{ days[0]?.date }} — {{ end }} · {{ total }} 次贡献</p>
      <div
        ref="viewport"
        class="contribution-viewport"
        tabindex="0"
        aria-label="全年贡献图，可横向滚动"
      >
        <div class="contribution-chart">
          <div class="contribution-months" aria-hidden="true">
            <span v-for="(month, index) in months" :key="index">{{ month }}</span>
          </div>
          <div class="contribution-weekdays" aria-hidden="true">
            <span>日</span><span>一</span><span>二</span><span>三</span><span>四</span
            ><span>五</span><span>六</span>
          </div>
          <div
            class="contribution-grid"
            role="img"
            :aria-label="'公开贡献热力图，' + total + ' 次贡献。可在下方按日期查询。'"
          >
            <i
              v-for="date in windowDates"
              :key="date"
              :data-date="date"
              :data-level="dayMap.get(date)?.level ?? 'unknown'"
              :title="
                date + ' · ' + (dayMap.has(date) ? dayMap.get(date)?.count + ' 次贡献' : '暂无记录')
              "
            ></i>
          </div>
        </div>
      </div>
      <div class="contribution-detail">
        <label for="contribution-date">查看日期</label
        ><input
          id="contribution-date"
          v-model="selected"
          type="date"
          :min="days[0]?.date"
          :max="end"
        /><output for="contribution-date" aria-live="polite">{{
          detail ? detail.count + ' 次贡献' : '该日期暂无记录'
        }}</output>
      </div>
      <p class="contribution-footnote">
        公开接口数据 · 手机可横向查看全年；缺失日期不计为零。
      </p></template
    >
  </section>
</template>
<style scoped>
.contribution-calendar {
  min-width: 0;
  padding: 1.5rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-large);
  background: var(--color-surface);
}
.contribution-calendar header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}
.contribution-calendar .eyebrow {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: var(--text-xs);
}
.contribution-calendar h2 {
  font-size: var(--text-lg);
}
.contribution-empty {
  min-height: 12rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 1rem;
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
}
.contribution-summary {
  margin-top: 1.5rem;
  color: var(--color-text-secondary);
  font-size: var(--text-xs);
}
.contribution-viewport {
  overflow-x: auto;
  margin-block: 1rem;
  padding: 0.4rem 0 0.75rem;
}
.contribution-chart {
  display: grid;
  grid-template-columns: 1.5rem 1fr;
  grid-template-rows: 1.5rem auto;
  width: 50rem;
  gap: 0.35rem;
  font-size: var(--text-xs);
}
.contribution-months {
  grid-column: 2;
  display: grid;
  grid-template-columns: repeat(53, 1fr);
  white-space: nowrap;
}
.contribution-weekdays {
  display: grid;
  grid-template-rows: repeat(7, 12px);
  gap: 3px;
  line-height: 12px;
}
.contribution-grid {
  display: grid;
  grid-auto-flow: column;
  grid-template-rows: repeat(7, 12px);
  grid-template-columns: repeat(53, 12px);
  justify-content: space-between;
  gap: 3px;
}
.contribution-grid i {
  border-radius: 2px;
  background: var(--color-border-soft);
}
.contribution-grid [data-level='1'] {
  background: var(--color-secondary);
}
.contribution-grid [data-level='2'] {
  background: color-mix(in srgb, var(--color-success) 45%, var(--color-secondary));
}
.contribution-grid [data-level='3'] {
  background: color-mix(in srgb, var(--color-success) 75%, var(--color-secondary));
}
.contribution-grid [data-level='4'] {
  background: var(--color-success);
}
.contribution-grid [data-level='unknown'] {
  background: transparent;
  border: 1px dashed var(--color-border);
}
.contribution-detail {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem 0.75rem;
  font-size: var(--text-sm);
}
.contribution-detail input {
  min-height: var(--tap-size);
  min-width: 0;
  max-width: 100%;
  border: 1px solid var(--color-border);
  background: var(--color-background);
  border-radius: var(--radius-small);
  padding: 0.4rem;
}
.contribution-footnote {
  margin-top: 1rem;
  color: var(--color-text-muted);
  font-size: var(--text-xs);
}
</style>
