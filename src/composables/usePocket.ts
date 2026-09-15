import { computed, readonly, ref } from 'vue'
import {
  emptyPocket,
  stampCatalog,
  validatePocket,
  type PocketData,
  type StampId,
} from '@/utils/pocketData'
const key = 'meowyun-pocket-v1'
const warning = ref('')
let persistenceBlocked = false
function load(): PocketData {
  try {
    const raw = localStorage.getItem(key)
    persistenceBlocked = false
    return raw ? validatePocket(JSON.parse(raw)) : emptyPocket()
  } catch {
    // 无法解析时保护原始记录，访问印章等自动写入不能覆盖损坏的备份。
    persistenceBlocked = true
    warning.value = '本地记录暂时无法读取，新操作只在本次访问保留。'
    return emptyPocket()
  }
}
const data = ref<PocketData>(load())
const announcement = ref('')
const newStamp = ref<StampId>()
let stampTimer: ReturnType<typeof setTimeout> | undefined
function save() {
  if (persistenceBlocked) return false
  try {
    localStorage.setItem(key, JSON.stringify(data.value))
    warning.value = ''
    return true
  } catch {
    warning.value = '浏览器没有保存成功；本次访问仍可使用，请及时导出备份。'
    return false
  }
}
function earn(id: StampId) {
  if (data.value.stamps.some((s) => s.id === id)) return
  data.value.stamps.push({ id, at: new Date().toISOString() })
  newStamp.value = id
  if (stampTimer) clearTimeout(stampTimer)
  stampTimer = setTimeout(() => {
    newStamp.value = undefined
  }, 4000)
  save()
}
function toggleFavorite(id: string) {
  const exists = data.value.favorites.findIndex((x) => x.id === id)
  if (exists >= 0) {
    data.value.favorites.splice(exists, 1)
    announcement.value = '已移出口袋，可以再次收藏。'
  } else if (data.value.favorites.length < 300) {
    data.value.favorites.unshift({ id, at: new Date().toISOString() })
    earn('first-save')
    announcement.value = '已放进口袋。'
  } else {
    announcement.value = '口袋最多保存 300 项，请先整理一些内容。'
    return
  }
  save()
}
function toggleLater(id: string) {
  const index = data.value.later.indexOf(id)
  if (index >= 0) data.value.later.splice(index, 1)
  else if (data.value.later.length < 300) data.value.later.push(id)
  save()
}
function rememberReading(id: string, progress: number) {
  if (!Number.isFinite(progress)) return
  data.value.reading = [
    { id, progress: Math.max(0, Math.min(1, progress)), at: new Date().toISOString() },
    ...data.value.reading.filter((r) => r.id !== id),
  ].slice(0, 300)
  save()
}
function importData(value: unknown) {
  data.value = validatePocket(value)
  persistenceBlocked = false
  return save()
}
function reset() {
  data.value = emptyPocket()
  persistenceBlocked = false
  newStamp.value = undefined
  return save()
}
function savePalette(name: string, colors: string[]) {
  if (data.value.palettes.length >= 40)
    throw new Error('最多保存 40 组配色，请先在口袋里删除不需要的配色。')
  const next = {
    ...data.value,
    palettes: [
      { id: crypto.randomUUID(), name, colors, at: new Date().toISOString() },
      ...data.value.palettes,
    ],
  }
  data.value = validatePocket(next)
  earn('palette-save')
  return save()
}
function finishFocus(id: string, minutes: number) {
  if (data.value.focus.some((r) => r.id === id)) return
  data.value.focus = [{ id, minutes, at: new Date().toISOString() }, ...data.value.focus].slice(
    0,
    100,
  )
  save()
}
// 本地数据不发送到服务器；只有自己的存储键发生变化时才同步其他标签页。
function storage(event: StorageEvent) {
  if (event.key === key) data.value = load()
}
window.addEventListener('storage', storage)
if (import.meta.hot)
  import.meta.hot.dispose(() => {
    window.removeEventListener('storage', storage)
    if (stampTimer) clearTimeout(stampTimer)
  })
export function usePocket() {
  return {
    data: readonly(data),
    warning,
    announcement,
    newStamp,
    count: computed(() => data.value.favorites.length),
    stampCatalog,
    toggleFavorite,
    toggleLater,
    earn,
    rememberReading,
    importData,
    reset,
    savePalette,
    removePalette: (id: string) => {
      data.value.palettes = data.value.palettes.filter((p) => p.id !== id)
      save()
    },
    finishFocus,
    isFavorite: (id: string) => data.value.favorites.some((x) => x.id === id),
    exportData: () => JSON.stringify(data.value, null, 2),
  }
}
