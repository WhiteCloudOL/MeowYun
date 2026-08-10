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

const monthLabels = computed(() => {
  const formatter = new Intl.DateTimeFormat('zh-CN', { month: 'short' })
  let previousMonth = -1

  return Array.from({ length: 53 }, (_, week) => {
    const day = days.value[week * 7]
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
  <section class="contribution-calendar" aria-labelledby="contribution-title">
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
      <div class="contribution-calendar__canvas">
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
            v-for="day in days"
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
  border: 1px solid var(--anime-border-bright);
  border-radius: 0.9rem;
  background: linear-gradient(145deg, rgb(184 196 255 / 15%), rgb(238 171 209 / 8%));
  color: var(--anime-text);
  box-shadow: inset 0 1px rgb(255 255 255 / 10%);
}

.contribution-calendar h2 {
  font-size: var(--text-lg);
  line-height: 1.35;
}

.contribution-calendar p {
  overflow: hidden;
  color: var(--anime-muted);
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
  background: #b8c6ff;
  box-shadow: 0 0 0.45rem rgb(184 198 255 / 62%);
}

.contribution-calendar__status[data-state='live'] i {
  background: #9de5cf;
  box-shadow: 0 0 0.45rem rgb(157 229 207 / 62%);
}

.contribution-calendar__viewport {
  min-width: 0;
  overflow-x: auto;
  padding: 0.95rem 1rem 1.05rem;
  border: 1px solid rgb(190 203 255 / 9%);
  border-radius: 1.15rem;
  background:
    radial-gradient(circle at 20% 0%, rgb(142 163 243 / 10%), transparent 40%),
    var(--anime-inner);
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
  grid-template-columns: repeat(53, 0.67rem);
  gap: 0.2rem;
  color: var(--anime-muted);
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
  color: var(--anime-muted);
  font-family: var(--font-mono);
  font-size: 0.5rem;
}

.contribution-calendar__grid {
  display: grid;
  grid-row: 2;
  grid-column: 2;
  grid-auto-flow: column;
  grid-template-columns: repeat(53, 0.67rem);
  grid-template-rows: repeat(7, 0.67rem);
  gap: 0.2rem;
}

.contribution-calendar__grid i,
.contribution-calendar__legend i {
  border: 1px solid rgb(198 210 255 / 7%);
  border-radius: 0.2rem;
  background: rgb(150 169 231 / 9%);
  box-shadow: inset 0 1px rgb(255 255 255 / 3%);
  transition:
    transform var(--transition-fast),
    filter var(--transition-fast);
}

[data-level='1'] {
  background: #4c5e91 !important;
}

[data-level='2'] {
  background: #7088d4 !important;
}

[data-level='3'] {
  background: #a08bdc !important;
}

[data-level='4'] {
  background: #e6a4ca !important;
  box-shadow: 0 0 0.42rem rgb(230 164 202 / 22%) !important;
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
