import test from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { contributionWindow, dateEpoch, parseContributions } from '../src/utils/contributions.ts'

test('贡献窗口始于周日、终于周六并正确跨年/月/闰日', () => {
  for (const end of ['2026-09-13', '2026-01-01', '2024-02-29', '2024-03-01', '2025-12-31']) {
    const dates = contributionWindow(end)
    assert.equal(dates.length, 371)
    assert.equal(new Set(dates).size, 371)
    assert.equal(new Date(dateEpoch(dates[0])).getUTCDay(), 0)
    assert.equal(new Date(dateEpoch(dates.at(-1))).getUTCDay(), 6)
    assert.ok(dates.includes(end))
    for (let i = 1; i < dates.length; i++)
      assert.equal(dateEpoch(dates[i]) - dateEpoch(dates[i - 1]), 86400000)
  }
  assert.ok(contributionWindow('2024-03-01').includes('2024-02-29'))
  assert.throws(() => dateEpoch('2023-02-29'))
  assert.throws(() => dateEpoch('2026-13-01'))
})

test('UTC、UTC+8 与负时区使用相同的纯日期键', () => {
  const moduleUrl = new URL('../src/utils/contributions.ts', import.meta.url).href
  const script = `import { contributionWindow } from ${JSON.stringify(moduleUrl)}; console.log(JSON.stringify(contributionWindow('2024-03-01')))`
  const results = ['UTC', 'Asia/Shanghai', 'America/Los_Angeles'].map((TZ) =>
    execFileSync(process.execPath, ['--input-type=module', '-e', script], {
      env: { ...process.env, TZ },
      encoding: 'utf8',
    }),
  )
  assert.equal(results[0], results[1])
  assert.equal(results[1], results[2])
})

test('拒绝异常数值、错误日期、重复与空响应，不能生成演示贡献', () => {
  for (const count of [NaN, Infinity, -1, 1.5, '8', null, undefined])
    assert.throws(() => parseContributions({ contributions: [{ date: '2026-09-15', count }] }))
  for (const level of [NaN, Infinity, -1, 5, '2'])
    assert.throws(() =>
      parseContributions({ contributions: [{ date: '2026-09-15', count: 1, level }] }),
    )
  for (const payload of [
    null,
    {},
    [],
    { contributions: [] },
    { contributions: [{ date: '2026-02-30', count: 1 }] },
    {
      contributions: [
        { date: '2026-09-15', count: 1 },
        { date: '2026-09-15', count: 2 },
      ],
    },
  ])
    assert.throws(() => parseContributions(payload))
  assert.deepEqual(
    parseContributions({
      contributions: [
        { date: '2026-09-15', count: 10 },
        { date: '2026-09-14', count: 0 },
      ],
    }),
    [
      { date: '2026-09-14', count: 0, level: 0 },
      { date: '2026-09-15', count: 10, level: 4 },
    ],
  )
})
