<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, useId } from 'vue'
import IconGlyph from './IconGlyph.vue'
import { calendarDate, clampDate, monthWeeks, shiftDay, shiftMonth } from '@/utils/calendarDate'

const props = defineProps<{
  id: string
  modelValue: string
  min: string
  max: string
  label: string
}>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
const uid = useId()
const dialog = ref<HTMLDialogElement>()
const trigger = ref<HTMLButtonElement>()
const opened = ref(false)
const focused = ref(props.modelValue)
const month = ref(props.modelValue.slice(0, 7))
const weeks = computed(() => monthWeeks(month.value + '-01'))
const monthLabel = computed(
  () => Number(month.value.slice(0, 4)) + '年 ' + Number(month.value.slice(5)) + '月',
)
const weekdays = ['一', '二', '三', '四', '五', '六', '日']
const today = (() => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
})()
const formatter = new Intl.DateTimeFormat('zh-CN', { dateStyle: 'full', timeZone: 'UTC' })
let alive = true
const backdropPressed = ref(false)

function available(value: string) {
  return value >= props.min && value <= props.max
}
async function move(value: string, focus = true) {
  focused.value = clampDate(value, props.min, props.max)
  month.value = focused.value.slice(0, 7)
  await nextTick()
  if (alive && opened.value && focus)
    dialog.value?.querySelector<HTMLButtonElement>(`[data-day="${focused.value}"]`)?.focus()
}
async function open() {
  document.dispatchEvent(new CustomEvent('meowyun:popover', { detail: uid }))
  opened.value = true
  dialog.value?.showModal()
  await move(props.modelValue || today)
}
function backdropClick(event: MouseEvent) {
  if (backdropPressed.value && event.target === dialog.value) close()
}
function close() {
  dialog.value?.close()
}
function restore() {
  opened.value = false
  if (alive) trigger.value?.focus()
}
function select(value: string) {
  if (!available(value)) return
  emit('update:modelValue', value)
  close()
}
function changeMonth(offset: number) {
  void move(shiftMonth(focused.value, offset), false)
}
function canChangeMonth(offset: number) {
  const target = shiftMonth(month.value + '-01', offset).slice(0, 7)
  return target >= props.min.slice(0, 7) && target <= props.max.slice(0, 7)
}
function keyboard(event: KeyboardEvent) {
  if (event.altKey || event.ctrlKey || event.metaKey) return
  const weekday = (calendarDate(focused.value).getUTCDay() + 6) % 7
  const shifts: Record<string, number> = {
    ArrowLeft: -1,
    ArrowRight: 1,
    ArrowUp: -7,
    ArrowDown: 7,
    Home: -weekday,
    End: 6 - weekday,
  }
  let next: string
  if (event.key in shifts) next = shiftDay(focused.value, shifts[event.key]!)
  else if (event.key === 'PageUp' || event.key === 'PageDown')
    next = shiftMonth(focused.value, (event.key === 'PageUp' ? -1 : 1) * (event.shiftKey ? 12 : 1))
  else return
  event.preventDefault()
  void move(next)
}
function trapTab(event: KeyboardEvent) {
  if (event.key !== 'Tab') return
  const controls = [
    ...(dialog.value?.querySelectorAll<HTMLButtonElement>(
      'button:not(:disabled):not([tabindex="-1"])',
    ) ?? []),
  ]
  const first = controls[0]
  const last = controls.at(-1)
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last?.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first?.focus()
  }
}
// dialog 保留浏览器的模态焦点边界；内部日历与外观由站点控制。异步聚焦在卸载后取消。
onBeforeUnmount(() => {
  alive = false
})
</script>

<template>
  <button
    :id="id"
    ref="trigger"
    type="button"
    class="date-trigger"
    aria-haspopup="dialog"
    :aria-expanded="opened"
    :aria-controls="uid"
    :aria-label="label + '，' + modelValue.replaceAll('-', '/')"
    @click="open"
  >
    <span>{{ modelValue.replaceAll('-', '/') }}</span
    ><IconGlyph name="calendar-days" :size="18" />
  </button>
  <Teleport to="body">
    <dialog
      :id="uid"
      ref="dialog"
      class="date-picker"
      :aria-labelledby="uid + '-title'"
      @close="restore"
      @pointerdown="backdropPressed = $event.target === dialog"
      @click="backdropClick"
      @cancel.prevent="close"
      @keydown="trapTab"
    >
      <div class="date-picker__body">
        <header class="date-picker__header">
          <h2 :id="uid + '-title'">{{ label }}</h2>
          <button type="button" class="icon-button" aria-label="关闭日期选择" @click="close">
            <IconGlyph name="x" :size="18" />
          </button>
        </header>
        <div class="date-picker__navigation">
          <button
            type="button"
            class="icon-button date-previous"
            aria-label="上个月"
            :disabled="!canChangeMonth(-1)"
            @click="changeMonth(-1)"
          >
            <IconGlyph name="arrow-right" :size="18" />
          </button>
          <p :id="uid + '-month'" aria-live="polite" aria-atomic="true">{{ monthLabel }}</p>
          <button
            type="button"
            class="icon-button"
            aria-label="下个月"
            :disabled="!canChangeMonth(1)"
            @click="changeMonth(1)"
          >
            <IconGlyph name="arrow-right" :size="18" />
          </button>
        </div>
        <table
          role="grid"
          :aria-labelledby="uid + '-month'"
          :aria-describedby="uid + '-help'"
          @keydown="keyboard"
        >
          <thead>
            <tr>
              <th v-for="day in weekdays" :key="day" scope="col" :abbr="'星期' + day">{{ day }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="week in weeks" :key="week[0]">
              <td
                v-for="day in week"
                :key="day"
                :aria-selected="day === modelValue ? true : undefined"
              >
                <button
                  type="button"
                  class="date-day"
                  :data-day="day"
                  :data-outside="day.slice(0, 7) !== month || undefined"
                  :aria-label="formatter.format(calendarDate(day))"
                  :aria-current="day === today ? 'date' : undefined"
                  :disabled="!available(day)"
                  :tabindex="day === focused ? 0 : -1"
                  @focus="focused = day"
                  @click="select(day)"
                >
                  {{ Number(day.slice(-2)) }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <footer class="date-picker__footer">
          <p>已选 {{ modelValue.replaceAll('-', '/') }}</p>
          <button type="button" class="chip" @click="select(max)">最新记录</button>
        </footer>
        <p :id="uid + '-help'" class="date-picker__help">
          方向键选日 · Page Up / Down 切月<br />Enter 确认 · Esc 关闭
        </p>
      </div>
    </dialog>
  </Teleport>
</template>

<style scoped>
.date-trigger {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  min-height: var(--tap-size);
  max-width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-medium);
  background: var(--color-surface-glass);
  box-shadow: inset 0 2px 2px var(--color-rim);
  font-variant-numeric: tabular-nums;
  transition: background var(--transition-fast);
}
.date-trigger:hover {
  background: var(--color-primary-soft);
}
.date-trigger svg {
  color: var(--color-link);
  flex-shrink: 0;
}
.date-picker {
  position: fixed;
  inset: 0;
  width: min(25rem, calc(100% - 1rem));
  max-width: 100%;
  max-height: calc(100dvh - 1rem);
  margin: auto;
  padding: 0;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-large);
  color: var(--color-text);
  background: linear-gradient(145deg,var(--color-surface-raised),var(--color-background-soft));
  box-shadow: var(--shadow-popover);
  overflow: auto;
}
.date-picker::backdrop {
  background: var(--color-overlay);
}
.date-picker__body {
  padding: 1.25rem;
}
.date-picker__header,
.date-picker__navigation,
.date-picker__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}
.date-picker__header h2 {
  font-size: var(--text-lg);
}
.date-picker__header {
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--color-border-soft);
}
.date-picker__navigation {
  margin-block: 0.75rem 0.5rem;
  font-weight: 600;
}
.date-previous svg {
  transform: rotate(180deg);
}
.date-picker .icon-button:disabled {
  opacity: 0.4;
  background: var(--color-background);
}
.date-picker table {
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
  font-variant-numeric: tabular-nums;
}
.date-picker th {
  height: 2.5rem;
  font-size: var(--text-xs);
  font-weight: 500;
  color: var(--color-text-secondary);
}
.date-picker td {
  padding: 0;
  text-align: center;
}
.date-day {
  position: relative;
  width: 100%;
  min-width: var(--tap-size);
  height: var(--tap-size);
  border: 1px solid transparent;
  border-radius: var(--radius-small);
  background: transparent;
  font-size: var(--text-sm);
  transition: background var(--transition-fast);
}
.date-day[data-outside] {
  color: var(--color-text-secondary);
}
.date-day:disabled {
  opacity: 0.38;
}
.date-day:hover:not(:disabled) {
  background: var(--color-primary-soft);
}
[aria-selected='true'] .date-day {
  border-color: var(--color-link);
  background: var(--color-primary);
  color: var(--color-on-primary);
  font-weight: 700;
}
.date-day[aria-current]::after {
  content: '';
  position: absolute;
  width: 4px;
  height: 4px;
  bottom: 4px;
  left: calc(50% - 2px);
  border-radius: var(--radius-round);
  background: currentColor;
}
.date-day:focus-visible {
  outline-offset: -3px;
}
.date-picker__footer {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--color-border-soft);
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
}
.date-picker__footer .chip {
  font-size: var(--text-xs);
  color: var(--color-link);
}
.date-picker__help {
  margin-top: 0.75rem;
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}
@media (max-width: 380px) {
  .date-picker__body {
    padding: 0.75rem;
  }
}
/* 320px 保留七列 44px 命中区；窄屏使用满宽纸面，避免把日期缩成难点的小格。 */
@media (max-width: 340px) {
  .date-picker {
    width: 100%;
    border-inline: 0;
  }
  .date-picker__body {
    padding: 0.75rem 6px;
  }
  .date-picker__header,
  .date-picker__footer,
  .date-picker__help {
    margin-inline: 0.5rem;
  }
}
@media (forced-colors: active) {
  [aria-selected='true'] .date-day {
    outline: 2px solid Highlight;
    outline-offset: -4px;
  }
  .date-day:disabled {
    color: GrayText;
    opacity: 1;
  }
}
</style>
