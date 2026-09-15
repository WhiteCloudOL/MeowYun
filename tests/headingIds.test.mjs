import assert from 'node:assert/strict'
import test from 'node:test'
import { createHeadingId } from '../src/utils/headingIds.ts'

test('重名标题与实际后缀标题不产生锚点碰撞', () => {
  for (const headings of [
    ['A', 'A', 'A-2', 'A'],
    ['A-2', 'A', 'A'],
    ['！', '？', 'section'],
  ]) {
    const used = new Set()
    const ids = headings.map((title) => createHeadingId(title, used))
    assert.equal(new Set(ids).size, headings.length)
    assert.ok(ids.every((id) => id.startsWith('heading-')))
  }
  assert.equal(createHeadingId('怎么选择部署方式', new Set()), 'heading-怎么选择部署方式')
})
