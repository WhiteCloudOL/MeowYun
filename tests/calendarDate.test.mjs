import assert from 'node:assert/strict'
import test from 'node:test'
import {
  calendarDate,
  shiftDay,
  shiftMonth,
  clampDate,
  monthWeeks,
} from '../src/utils/calendarDate.ts'

test('日期运算处理闰日、月末、跨年和无效日期', () => {
  assert.equal(shiftMonth('2024-01-31', 1), '2024-02-29')
  assert.equal(shiftMonth('2024-02-29', 12), '2025-02-28')
  assert.equal(shiftMonth('2026-01-31', -1), '2025-12-31')
  assert.equal(shiftDay('2026-03-08', 1), '2026-03-09')
  assert.equal(shiftDay('2026-12-31', 1), '2027-01-01')
  for (const value of ['2026-02-29', '2026-13-01', 'bad', '2026-1-01'])
    assert.throws(() => calendarDate(value))
})

test('月历从星期一开始，42个连续日期，范围边界不能越过', () => {
  const grid = monthWeeks('2026-09-15').flat()
  assert.equal(grid.length, 42)
  assert.equal(grid[0], '2026-08-31')
  assert.equal(grid.at(-1), '2026-10-11')
  assert.equal(new Set(grid).size, 42)
  assert.equal(clampDate('2026-01-01', '2026-09-01', '2026-09-15'), '2026-09-01')
  assert.equal(clampDate('2026-09-16', '2026-09-01', '2026-09-15'), '2026-09-15')
})
