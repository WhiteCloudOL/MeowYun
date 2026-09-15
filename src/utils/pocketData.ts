export const stampCatalog = [
  { id: 'first-save', label: '口袋第一件', motif: 'heart', reason: '第一次收藏真实内容' },
  { id: 'project-visit', label: '作品探险家', motif: 'star', reason: '打开一件作品详情' },
  { id: 'workshop-visit', label: '工坊来客', motif: 'flower', reason: '走进明信片工坊' },
  { id: 'postcard-export', label: '寄一朵云', motif: 'cloud', reason: '成功导出一张明信片' },
  { id: 'palette-save', label: '收集好颜色', motif: 'rainbow', reason: '保存一组自己调制的颜色' },
  { id: 'garden-visit', label: '花园漫游', motif: 'flower', reason: '走进友链花园' },
] as const
export type StampId = (typeof stampCatalog)[number]['id']
export interface PocketData {
  version: 1
  favorites: Array<{ id: string; at: string }>
  later: string[]
  stamps: Array<{ id: StampId; at: string }>
  reading: Array<{ id: string; progress: number; at: string }>
  palettes: Array<{ id: string; name: string; colors: string[]; at: string }>
  focus: Array<{ id: string; minutes: number; at: string }>
}
export function emptyPocket(): PocketData {
  return { version: 1, favorites: [], later: [], stamps: [], reading: [], palettes: [], focus: [] }
}
function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('数据结构不正确')
  return value as Record<string, unknown>
}
function list(value: unknown, max = 300): unknown[] {
  if (!Array.isArray(value) || value.length > max) throw new Error('数据条目超出限制')
  return value
}
function string(value: unknown, max = 180): string {
  if (typeof value !== 'string' || !value || value.length > max) throw new Error('文字字段不正确')
  return value
}
function id(value: unknown) {
  const result = string(value)
  if (!/^[a-zA-Z0-9_-]+$/.test(result)) throw new Error('内容编号不正确')
  return result
}
function date(value: unknown) {
  const result = string(value, 30)
  if (!Number.isFinite(Date.parse(result))) throw new Error('记录时间不正确')
  return new Date(result).toISOString()
}
function number(value: unknown, min: number, max: number) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max)
    throw new Error('记录数值超出范围')
  return value
}
function unique<T extends { id: string }>(items: T[]): T[] {
  return [...new Map(items.map((item) => [item.id, item])).values()]
}
// 导入只重建白名单字段，绝不直接合并任意对象；数量、字符串、数值和颜色都有上限。
export function validatePocket(value: unknown): PocketData {
  const data = record(value)
  if (data.version !== 1) throw new Error('不支持这个备份版本')
  return {
    version: 1,
    favorites: unique(
      list(data.favorites).map((value) => {
        const r = record(value)
        return { id: id(r.id), at: date(r.at) }
      }),
    ),
    later: [...new Set(list(data.later).map(id))],
    stamps: unique(
      list(data.stamps, 6).map((value) => {
        const r = record(value)
        const stamp = stampCatalog.find((s) => s.id === r.id)
        if (!stamp) throw new Error('不认识的印章')
        return { id: stamp.id, at: date(r.at) }
      }),
    ),
    reading: unique(
      list(data.reading).map((value) => {
        const r = record(value)
        return { id: id(r.id), progress: number(r.progress, 0, 1), at: date(r.at) }
      }),
    ),
    palettes: unique(
      list(data.palettes, 40).map((value) => {
        const r = record(value)
        const colors = list(r.colors, 8).map((c) => string(c, 7))
        if (colors.length < 3 || colors.some((c) => !/^#[0-9a-f]{6}$/i.test(c)))
          throw new Error('配色必须为 3–8 个 HEX 颜色')
        return { id: id(r.id), name: string(r.name, 40), colors, at: date(r.at) }
      }),
    ),
    focus: unique(
      list(data.focus, 100).map((value) => {
        const r = record(value)
        return { id: id(r.id), minutes: number(r.minutes, 1, 180), at: date(r.at) }
      }),
    ),
  }
}
