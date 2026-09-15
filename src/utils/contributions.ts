export interface ContributionDay {
  date: string
  count: number
  level: number
}
const dayMs = 86400000

/** 日期是日历键而非时刻。统一 UTC 运算，避免本地零点转 ISO 后回退一天。 */
export function dateEpoch(value: string): number {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error('无效日期')
  const epoch = Date.parse(value + 'T00:00:00Z')
  if (!Number.isFinite(epoch) || new Date(epoch).toISOString().slice(0, 10) !== value)
    throw new Error('无效日期')
  return epoch
}
export function contributionWindow(end: string, weeks = 53): string[] {
  const date = dateEpoch(end)
  const endSaturday = date + (6 - new Date(date).getUTCDay()) * dayMs
  return Array.from({ length: weeks * 7 }, (_, index) =>
    new Date(endSaturday - (weeks * 7 - 1 - index) * dayMs).toISOString().slice(0, 10),
  )
}
export function parseContributions(payload: unknown): ContributionDay[] {
  if (
    !payload ||
    typeof payload !== 'object' ||
    !('contributions' in payload) ||
    !Array.isArray(payload.contributions) ||
    !payload.contributions.length
  )
    throw new Error('缺少贡献数据')
  const seen = new Set<string>()
  return payload.contributions
    .map((item: unknown) => {
      if (
        !item ||
        typeof item !== 'object' ||
        !('date' in item) ||
        !('count' in item) ||
        typeof item.date !== 'string'
      )
        throw new Error('无效贡献记录')
      dateEpoch(item.date)
      if (
        typeof item.count !== 'number' ||
        !Number.isSafeInteger(item.count) ||
        item.count < 0 ||
        seen.has(item.date)
      )
        throw new Error('无效贡献数量')
      seen.add(item.date)
      const inferred =
        item.count === 0 ? 0 : item.count < 3 ? 1 : item.count < 6 ? 2 : item.count < 10 ? 3 : 4
      const level = 'level' in item ? item.level : inferred
      if (typeof level !== 'number' || !Number.isInteger(level) || level < 0 || level > 4)
        throw new Error('无效贡献等级')
      return { date: item.date, count: item.count, level }
    })
    .sort((a, b) => a.date.localeCompare(b.date))
}
