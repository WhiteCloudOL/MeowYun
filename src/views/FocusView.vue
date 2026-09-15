<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import IconGlyph from '@/components/ui/IconGlyph.vue'
import { usePocket } from '@/composables/usePocket'
import { freshFocus, remainingFocus, validateFocus } from '@/utils/focusSession'
const key = 'meowyun-focus-session-v1',
  { finishFocus, data } = usePocket()
const message = ref(''),
  session = ref(freshFocus()),
  now = ref(Date.now()),
  focusMinutes = ref('25'),
  breakMinutes = ref('5')
let timer: ReturnType<typeof setInterval> | undefined,
  blocked = false
try {
  const raw = localStorage.getItem(key)
  if (raw) {
    session.value = validateFocus(JSON.parse(raw))
    if (session.value.phase === 'focus') focusMinutes.value = String(session.value.minutes)
    else breakMinutes.value = String(session.value.minutes)
  }
} catch {
  blocked = true
  message.value = '原计时记录无法读取，暂时保留在浏览器中。重新开始或重置会替换它。'
}
const remaining = computed(() => remainingFocus(session.value, now.value))
const display = computed(() => {
  const seconds = Math.ceil(remaining.value / 1000)
  return (
    String(Math.floor(seconds / 60)).padStart(2, '0') + ':' + String(seconds % 60).padStart(2, '0')
  )
})
const progress = computed(() => 1 - remaining.value / (session.value.minutes * 60000))
const running = computed(
  () => session.value.status === 'running' || session.value.status === 'paused',
)
function save() {
  if (blocked) return
  try {
    localStorage.setItem(key, JSON.stringify(session.value))
  } catch {
    message.value = '计时仍在继续，但浏览器未能保存；刷新可能无法恢复。'
  }
}
function tick() {
  now.value = Date.now()
  if (session.value.status === 'running' && remaining.value <= 0) {
    session.value.status = 'complete'
    session.value.remaining = 0
    save()
    if (session.value.phase === 'focus') finishFocus(session.value.id, session.value.minutes)
    message.value =
      session.value.phase === 'focus'
        ? '这一段专注完成了，休息一下吧。'
        : '休息结束，可以开始下一件小事。'
  }
}
function begin() {
  const minutes = Number(session.value.phase === 'focus' ? focusMinutes.value : breakMinutes.value)
  if (!Number.isInteger(minutes) || minutes < 1 || minutes > 180) {
    message.value = '时长请输入 1–180 之间的整数分钟。'
    return
  }
  blocked = false
  session.value = freshFocus(minutes, session.value.phase)
  resume()
}
function resume() {
  now.value = Date.now()
  session.value.deadline = now.value + session.value.remaining
  session.value.status = 'running'
  message.value = ''
  save()
}
function pause() {
  tick()
  if (session.value.status !== 'running') return
  session.value.remaining = remaining.value
  session.value.status = 'paused'
  save()
}
function reset() {
  blocked = false
  session.value = freshFocus(session.value.minutes, session.value.phase)
  message.value = '已重置这一段计时。'
  save()
}
function phase(value: 'focus' | 'break') {
  if (running.value) return
  const minutes = Number(value === 'focus' ? focusMinutes.value : breakMinutes.value)
  session.value = freshFocus(
    Number.isInteger(minutes) && minutes >= 1 && minutes <= 180 ? minutes : 25,
    value,
  )
  message.value = ''
}
function storage(event: StorageEvent) {
  if (event.key !== key) return
  try {
    session.value = event.newValue ? validateFocus(JSON.parse(event.newValue)) : freshFocus()
    blocked = false
    tick()
  } catch {
    message.value = '另一标签页的计时记录无效，已保留当前计时。'
  }
}
onMounted(() => {
  tick()
  timer = setInterval(tick, 250)
  document.addEventListener('visibilitychange', tick)
  window.addEventListener('pageshow', tick)
  window.addEventListener('storage', storage)
})
// 回调只刷新显示，经过时间来自绝对截止时间；卸载后停止回调，重返页面按截止时间恢复。
onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
  document.removeEventListener('visibilitychange', tick)
  window.removeEventListener('pageshow', tick)
  window.removeEventListener('storage', storage)
})
</script>
<template>
  <div class="focus-view page-shell page-content">
    <header class="page-heading">
      <RouterLink to="/lab" class="text-link">← 回到工坊</RouterLink>
      <h1>云端专注角</h1>
      <p>给一件小事，留一段安静的时间。</p>
    </header>
    <div class="focus-layout">
      <section class="focus-space">
        <div class="focus-phases" aria-label="计时类型">
          <button
            class="chip"
            :aria-pressed="session.phase === 'focus'"
            :disabled="running"
            @click="phase('focus')"
          >
            专注</button
          ><button
            class="chip"
            :aria-pressed="session.phase === 'break'"
            :disabled="running"
            @click="phase('break')"
          >
            休息
          </button>
        </div>
        <div class="cloud-clock" :style="{ '--progress': progress }">
          <div class="clock-fill" aria-hidden="true"></div>
          <IconGlyph name="cloud" :size="36" /><span
            class="clock-value"
            role="timer"
            aria-live="off"
            :aria-label="'剩余 ' + display"
            >{{ display }}</span
          ><span class="clock-label">{{
            session.status === 'running'
              ? '慢慢来，正在积累'
              : session.status === 'paused'
                ? '已暂停'
                : session.status === 'complete'
                  ? '这一段完成了'
                  : '准备好，就开始'
          }}</span>
        </div>
        <div class="focus-actions">
          <BaseButton
            v-if="session.status === 'idle' || session.status === 'complete'"
            @click="begin"
            >开始{{ session.phase === 'focus' ? '专注' : '休息' }}</BaseButton
          ><BaseButton v-else-if="session.status === 'running'" @click="pause">暂停</BaseButton
          ><BaseButton v-else @click="resume">继续</BaseButton
          ><button class="chip" :disabled="session.status === 'idle'" @click="reset">重置</button>
        </div>
        <p role="status" class="focus-status">{{ message }}</p>
      </section>
      <aside class="paper focus-settings">
        <h2>留多少时间？</h2>
        <label class="field-label"
          >专注时长（分钟）<input
            v-model="focusMinutes"
            class="milk-input"
            inputmode="numeric"
            maxlength="3"
            :disabled="running" /></label
        ><label class="field-label"
          >休息时长（分钟）<input
            v-model="breakMinutes"
            class="milk-input"
            inputmode="numeric"
            maxlength="3"
            :disabled="running"
        /></label>
        <p>每段 1–180 分钟。开始后锁定时长，暂停与继续保留进度。</p>
        <p>可以切换页面；回来时会校正剩余时间。页面关闭时不会发出提醒。</p>
        <h3>我的完成记录</h3>
        <p>
          当前浏览器完成了 {{ data.focus.length }} 段专注，共
          {{ data.focus.reduce((sum, r) => sum + r.minutes, 0) }} 分钟（最近 100 段）。
        </p>
      </aside>
    </div>
  </div>
</template>
<style scoped>
.focus-view {
  max-width: 65rem;
}
.focus-layout {
  display: grid;
  grid-template-columns: 1.3fr 1fr;
  gap: 3rem;
  align-items: center;
}
.focus-space {
  min-width: 0;
  text-align: center;
}
.focus-phases,
.focus-actions {
  display: flex;
  justify-content: center;
  gap: 0.7rem;
  flex-wrap: wrap;
}
.cloud-clock {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: min(100%, 24rem);
  aspect-ratio: 1.2;
  margin: 2rem auto;
  border: 1px solid var(--color-rim);
  border-radius: 44% 49% 41% 46% / 35% 42% 48% 49%;
  background: var(--color-surface-glass);
  box-shadow: var(--shadow-card);
}
.clock-fill {
  position: absolute;
  inset: 0;
  z-index: -1;
  background: linear-gradient(rgb(var(--tone-blue) / 0.25), rgb(var(--tone-mint) / 0.5));
  transform: translateY(calc((1 - var(--progress)) * 100%));
  border-radius: 43% 44% 0 0 / 10% 12% 0 0;
}
.clock-value {
  font: 600 clamp(2.5rem, 6vw, 4rem)/1.2 var(--font-mono);
  font-variant-numeric: tabular-nums;
}
.cloud-clock > svg {
  color: var(--color-link);
}
.clock-label {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}
.focus-status {
  min-height: 3em;
  font-size: var(--text-sm);
  margin: 1.5rem 0;
}
.focus-settings h2 {
  font-size: var(--text-xl);
  margin-bottom: 1.5rem;
}
.focus-settings h3 {
  font-size: var(--text-lg);
  margin-top: 1.5rem;
}
.focus-settings label {
  margin-bottom: 1rem;
}
.focus-settings p {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  margin: 0.75rem 0;
}
@media (max-width: 700px) {
  .focus-layout {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}
</style>
