<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import ConfigIcon from '@/components/ui/ConfigIcon.vue'
import IconGlyph from '@/components/ui/IconGlyph.vue'
import { siteConfig } from '@/config/site'

interface ContributionDay {
  date: string
  count: number
  level: number
}

interface ContributionResponse {
  contributions?: Array<Partial<ContributionDay>>
}

const props = withDefaults(defineProps<{ compact?: boolean }>(), { compact: false })

const liveDays = ref<ContributionDay[]>([])
const fetchState = ref<'loading' | 'live' | 'fallback'>('loading')
const controller = new AbortController()

const fallbackDays = computed<ContributionDay[]>(() => {
  // 以用户名生成稳定的演示矩阵，接口不可用时仍保持布局完整且不会伪装成实时数据。
  const seed = Array.from(siteConfig.sections.contributions.username).reduce(
    (total, character) => total + character.charCodeAt(0),
    0,
  )
  const today = new Date()

  return Array.from({ length: 371 }, (_, index) => {
    const date = new Date(today)
    date.setDate(today.getDate() - (370 - index))
    const value = (index * 17 + seed * 7 + (index % 19) * 13) % 29
    const level = value < 17 ? 0 : value < 21 ? 1 : value < 25 ? 2 : value < 28 ? 3 : 4

    return {
      date: date.toISOString().slice(0, 10),
      count: level === 0 ? 0 : (value + level) % 9 || level,
      level,
    }
  })
})

const days = computed(() => {
  if (!liveDays.value.length) return fallbackDays.value

  const liveMap = new Map(liveDays.value.map((day) => [day.date, day]))
  return fallbackDays.value.map((day) => liveMap.get(day.date) ?? { ...day, count: 0, level: 0 })
})

const compactDays = computed<ContributionDay[]>(() => {
  const source = days.value
  const latest = source.at(-1)
  if (!latest) return []

  // 紧凑矩阵始终从周日开始、到周六结束；本周尚未到达的日期补零，避免星期行错位。
  const sourceMap = new Map(source.map((day) => [day.date, day]))
  const latestDate = new Date(`${latest.date}T00:00:00`)
  const endOfWeek = new Date(latestDate)
  endOfWeek.setDate(latestDate.getDate() + (6 - latestDate.getDay()))
  const startOfWindow = new Date(endOfWeek)
  startOfWindow.setDate(endOfWeek.getDate() - 370)

  return Array.from({ length: 371 }, (_, index) => {
    const date = new Date(startOfWindow)
    date.setDate(startOfWindow.getDate() + index)
    const key = date.toISOString().slice(0, 10)
    return sourceMap.get(key) ?? { date: key, count: 0, level: 0 }
  })
})

const displayedDays = computed(() => (props.compact ? compactDays.value : days.value))
const displayedWeeks = computed(() => 53)

const monthLabels = computed(() => {
  const formatter = new Intl.DateTimeFormat('zh-CN', { month: 'short' })
  let previousMonth = -1

  return Array.from({ length: displayedWeeks.value }, (_, week) => {
    const day = displayedDays.value[week * 7]
    if (!day) return ''
    const date = new Date(`${day.date}T00:00:00`)
    const month = date.getMonth()
    if (month === previousMonth) return ''
    previousMonth = month
    return formatter.format(date)
  })
})

const total = computed(() => days.value.reduce((sum, day) => sum + day.count, 0))

function normalizeDay(day: Partial<ContributionDay>): ContributionDay | undefined {
  // 外部接口数据先归一化并限制等级范围，防止异常数值破坏网格样式。
  if (typeof day.date !== 'string') return undefined
  const count = Math.max(0, Number(day.count ?? 0))
  const inferredLevel = count === 0 ? 0 : count < 3 ? 1 : count < 6 ? 2 : count < 10 ? 3 : 4

  return {
    date: day.date,
    count,
    level: Math.min(4, Math.max(0, Number(day.level ?? inferredLevel))),
  }
}

async function loadContributions() {
  const template = siteConfig.sections.contributions.apiUrl?.trim()
  if (!template) {
    fetchState.value = 'fallback'
    return
  }

  try {
    // 用户名先编码再替换模板，避免特殊字符改变请求 URL 的结构。
    const endpoint = template.replaceAll(
      '{username}',
      encodeURIComponent(siteConfig.sections.contributions.username),
    )
    const response = await fetch(endpoint, { signal: controller.signal })
    if (!response.ok) throw new Error(`Contribution API responded ${response.status}`)
    const payload = (await response.json()) as ContributionResponse
    liveDays.value = (payload.contributions ?? [])
      .map(normalizeDay)
      .filter((day): day is ContributionDay => Boolean(day))
    fetchState.value = liveDays.value.length ? 'live' : 'fallback'
  } catch (error) {
    if ((error as Error).name !== 'AbortError') fetchState.value = 'fallback'
  }
}

onMounted(loadContributions)
onBeforeUnmount(() => controller.abort())
</script>

<template>
  <section
    class="contribution-calendar"
    :class="{ 'contribution-calendar--compact': compact }"
    aria-labelledby="contribution-title"
  >
    <header class="contribution-calendar__header">
      <div class="contribution-calendar__identity">
        <span class="contribution-calendar__icon">
          <ConfigIcon name="github" provider="fontawesome" :size="21" />
        </span>
        <div>
          <h2 id="contribution-title">{{ siteConfig.sections.contributions.title }}</h2>
          <p>{{ siteConfig.sections.contributions.description }}</p>
        </div>
      </div>

      <div class="contribution-calendar__actions">
        <span class="contribution-calendar__status" :data-state="fetchState">
          <i></i>
          {{ fetchState === 'live' ? 'LIVE' : fetchState === 'loading' ? 'SYNC' : 'DEMO' }}
        </span>
        <a
          :href="siteConfig.sections.contributions.profileUrl"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="打开 GitHub 主页"
        >
          <IconGlyph name="arrow-up-right" :size="18" />
        </a>
      </div>
    </header>

    <div class="contribution-calendar__viewport">
      <div
        class="contribution-calendar__canvas"
        :style="{ '--contribution-weeks': displayedWeeks }"
      >
        <div class="contribution-calendar__months" aria-hidden="true">
          <span v-for="(month, index) in monthLabels" :key="index">{{ month }}</span>
        </div>
        <div class="contribution-calendar__weekdays" aria-hidden="true">
          <span>一</span>
          <span>三</span>
          <span>五</span>
        </div>
        <div
          class="contribution-calendar__grid"
          role="img"
          :aria-label="`${siteConfig.sections.contributions.username} 最近一年的 GitHub 提交足迹，共 ${total} 次贡献`"
        >
          <i
            v-for="day in displayedDays"
            :key="day.date"
            :data-level="day.level"
            :title="`${day.date} · ${day.count} 次贡献`"
          ></i>
        </div>
      </div>
    </div>

    <footer class="contribution-calendar__footer">
      <span>过去一年 · {{ total }} contributions</span>
      <span class="contribution-calendar__legend" aria-hidden="true">
        <small>少</small>
        <i v-for="level in 5" :key="level" :data-level="level - 1"></i>
        <small>多</small>
      </span>
    </footer>
  </section>
</template>

<style scoped>
.contribution-calendar {
  display: grid;
  min-width: 0;
  gap: 1.35rem;
}

.contribution-calendar__header,
.contribution-calendar__identity,
.contribution-calendar__actions,
.contribution-calendar__footer {
  display: flex;
  align-items: center;
}

.contribution-calendar__header,
.contribution-calendar__footer {
  justify-content: space-between;
  gap: 1rem;
}

.contribution-calendar__identity {
  min-width: 0;
  gap: 0.8rem;
}

.contribution-calendar__icon,
.contribution-calendar__actions > a {
  display: grid;
  width: 2.85rem;
  height: 2.85rem;
  flex: none;
  place-items: center;
  border: 3px solid #4a3b32;
  border-radius: 0.9rem;
  background: #ffd8e4;
  color: #2b2d42;
  box-shadow: 3px 3px 0 #4a3b32;
}

.contribution-calendar h2 {
  color: #2b2d42;
  font-weight: 900;
  font-size: var(--text-lg);
  line-height: 1.35;
}

.contribution-calendar p {
  overflow: hidden;
  color: #79665b;
  font-size: var(--text-xs);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.contribution-calendar__actions {
  flex: none;
  gap: 0.65rem;
}

.contribution-calendar__status {
  display: inline-flex;
  align-items: center;
  gap: 0.38rem;
  padding: 0.38rem 0.55rem;
  border: 1px solid var(--anime-border);
  border-radius: 999px;
  color: var(--anime-muted);
  font-family: var(--font-mono);
  font-size: 0.56rem;
  letter-spacing: 0.06em;
}

.contribution-calendar__status i {
  width: 0.35rem;
  height: 0.35rem;
  border-radius: 50%;
  background: #f0a0c5;
  box-shadow: 0 0 0.45rem rgb(240 160 197 / 62%);
}

.contribution-calendar__status[data-state='live'] i {
  background: #9de5cf;
  box-shadow: 0 0 0.45rem rgb(157 229 207 / 62%);
}

.contribution-calendar__viewport {
  min-width: 0;
  overflow-x: auto;
  padding: 0.95rem 1rem 1.05rem;
  border: 3px solid #4a3b32;
  border-radius: 1.15rem;
  background-color: #fff9d7;
  box-shadow: 4px 4px 0 #a7e9af;
  scrollbar-color: rgb(207 220 255 / 22%) transparent;
  scrollbar-width: thin;
}

.contribution-calendar__canvas {
  display: grid;
  min-width: 42rem;
  grid-template-columns: 1.65rem 1fr;
  grid-template-rows: auto 1fr;
  gap: 0.42rem 0.55rem;
}

.contribution-calendar__months {
  display: grid;
  grid-column: 2;
  grid-template-columns: repeat(var(--contribution-weeks, 53), 0.67rem);
  gap: 0.2rem;
  color: #79665b;
  font-family: var(--font-mono);
  font-size: 0.53rem;
}

.contribution-calendar__months span {
  overflow: visible;
  white-space: nowrap;
}

.contribution-calendar__weekdays {
  display: grid;
  grid-row: 2;
  grid-template-rows: repeat(3, 1fr);
  align-items: center;
  color: #79665b;
  font-family: var(--font-mono);
  font-size: 0.5rem;
}

.contribution-calendar__grid {
  display: grid;
  grid-row: 2;
  grid-column: 2;
  grid-auto-flow: column;
  grid-template-columns: repeat(var(--contribution-weeks, 53), 0.67rem);
  grid-template-rows: repeat(7, 0.67rem);
  gap: 0.2rem;
}

.contribution-calendar__grid i,
.contribution-calendar__legend i {
  border: 1px solid rgb(74 59 50 / 28%);
  border-radius: 58% 42% 62% 38% / 42% 55% 45% 58%;
  background: #fff0f5;
  box-shadow: none;
  transition:
    transform var(--transition-fast),
    filter var(--transition-fast);
}

[data-level='1'] {
  background: #ffd1df !important;
}

[data-level='2'] {
  background: #ffacc4 !important;
}

[data-level='3'] {
  background: #ff82a8 !important;
}

[data-level='4'] {
  background: #d85c83 !important;
  box-shadow: 1px 1px 0 #4a3b32 !important;
}

.contribution-calendar--compact {
  gap: 0.8rem;
}

.contribution-calendar--compact .contribution-calendar__identity p,
.contribution-calendar--compact .contribution-calendar__status {
  display: none;
}

.contribution-calendar--compact .contribution-calendar__viewport {
  overflow: hidden;
  padding: 0.72rem 0.8rem 0.8rem;
  border-color: #4a3b32;
  background: #fff9d7;
}

.contribution-calendar--compact .contribution-calendar__canvas {
  width: 100%;
  min-width: 0;
  grid-template-columns: 1.2rem minmax(0, 1fr);
  margin-inline: auto;
}

.contribution-calendar--compact .contribution-calendar__months,
.contribution-calendar--compact .contribution-calendar__grid {
  grid-template-columns: repeat(var(--contribution-weeks, 53), minmax(0, 1fr));
  gap: 0.12rem;
}

.contribution-calendar--compact .contribution-calendar__grid {
  grid-template-rows: repeat(7, auto);
}

.contribution-calendar--compact .contribution-calendar__grid i {
  width: 100%;
  min-width: 0;
  aspect-ratio: 1;
}

.contribution-calendar--compact h2 {
  font-size: var(--text-sm);
}

.contribution-calendar--compact .contribution-calendar__footer {
  gap: 0.6rem;
  color: #6b584e;
  font-size: 0.55rem;
}

.contribution-calendar--compact .contribution-calendar__icon,
.contribution-calendar--compact .contribution-calendar__actions > a {
  width: 2.35rem;
  height: 2.35rem;
  border-radius: 50%;
  background: #ffd8e4;
}

.contribution-calendar__footer {
  color: var(--anime-muted);
  font-family: var(--font-mono);
  font-size: 0.58rem;
}

.contribution-calendar__legend {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
}

.contribution-calendar__legend i {
  width: 0.66rem;
  height: 0.66rem;
}

@media (hover: hover) {
  .contribution-calendar__grid i:hover {
    z-index: 1;
    filter: brightness(1.22);
    transform: scale(1.28);
  }
}

@media (max-width: 34rem) {
  .contribution-calendar__status,
  .contribution-calendar__identity p {
    display: none;
  }

  .contribution-calendar__viewport {
    margin-inline: -0.35rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .contribution-calendar__grid i {
    transition: none;
  }
}
</style>
