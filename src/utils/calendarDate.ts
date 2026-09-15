const dayMilliseconds = 86_400_000

// 日期只表示日历日；统一用 UTC 运算，避免夏令时让加减一天落到同一天。
export function calendarDate(value: string): Date {
  const result = new Date(value + 'T00:00:00Z')
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
    !Number.isFinite(result.getTime()) ||
    result.toISOString().slice(0, 10) !== value
  ) {
    throw new Error('无效的日历日期：' + value)
  }
  return result
}

export function shiftDay(value: string, offset: number): string {
  return new Date(calendarDate(value).getTime() + offset * dayMilliseconds)
    .toISOString()
    .slice(0, 10)
}

export function shiftMonth(value: string, offset: number): string {
  const date = calendarDate(value)
  const day = date.getUTCDate()
  date.setUTCDate(1)
  date.setUTCMonth(date.getUTCMonth() + offset)
  const last = new Date(date.getTime())
  last.setUTCMonth(last.getUTCMonth() + 1, 0)
  date.setUTCDate(Math.min(day, last.getUTCDate()))
  return date.toISOString().slice(0, 10)
}

export function clampDate(value: string, min: string, max: string): string {
  return value < min ? min : value > max ? max : value
}

export function monthWeeks(value: string): string[][] {
  const first = value.slice(0, 7) + '-01'
  const start = shiftDay(first, -(calendarDate(first).getUTCDay() + 6) % 7)
  return Array.from({ length: 6 }, (_, week) =>
    Array.from({ length: 7 }, (_, day) => shiftDay(start, week * 7 + day)),
  )
}
