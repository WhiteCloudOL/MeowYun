import assert from 'node:assert/strict'
import test from 'node:test'
import { freshFocus, remainingFocus, validateFocus } from '../src/utils/focusSession.ts'
import { contrast, hexToHsl, hslToHex, relatedPalette, validHex } from '../src/utils/colors.ts'
import { emptyPocket, validatePocket } from '../src/utils/pocketData.ts'
import {
  freshPostcard,
  hitPostcard,
  postcardBounds,
  clampPostcardObject,
} from '../src/utils/postcard.ts'
import { stampPaths } from '../src/utils/stampPaths.ts'

test('专注按绝对时间校正，暂停不受后台经过时间影响', () => {
  const session = freshFocus(25)
  Object.assign(session, { status: 'running', deadline: 100000 })
  assert.equal(remainingFocus(session, 40000), 60000)
  assert.equal(remainingFocus(session, 120000), 0)
  assert.equal(remainingFocus(session, -2000000), 25 * 60000)
  Object.assign(session, { status: 'paused', remaining: 45678 })
  assert.equal(remainingFocus(session, 900000), 45678)
  assert.deepEqual(validateFocus(session), session)
  for (const override of [
    { minutes: 0 },
    { remaining: Infinity },
    { phase: 'fake' },
    { deadline: NaN },
    { id: '../x' },
  ])
    assert.throws(() => validateFocus({ ...session, ...override }))
})
test('颜色转换端点、协调色结构与对比度独立校验', () => {
  assert.equal(contrast('#000000', '#ffffff'), 21)
  assert.equal(contrast('#ffffff', '#ffffff'), 1)
  assert.equal(hslToHex(0, 100, 50), '#ff0000')
  assert.deepEqual(hexToHsl('#00ff00'), [120, 100, 50])
  for (const hue of [0, 45, 180, 359]) assert.ok(relatedPalette(hue).every(validHex))
  assert.equal(validHex('url(x)'), false)
  assert.equal(validHex('#ffff'), false)
})
test('口袋导入只接受白名单、有限配色和唯一收藏', () => {
  const data = emptyPocket(),
    at = '2026-09-15T12:00:00.000Z'
  data.favorites = [
    { id: 'project-demo', at },
    { id: 'project-demo', at },
  ]
  const parsed = validatePocket({ ...data, extra: { script: 'bad' } })
  assert.equal(parsed.favorites.length, 1)
  assert.equal(Object.hasOwn(parsed, 'extra'), false)
  assert.throws(() =>
    validatePocket({
      ...data,
      palettes: [{ id: 'a', name: 'bad', colors: ['red', '#ffffff', '#000000'], at }],
    }),
  )
  assert.throws(() => validatePocket({ ...data, stamps: [{ id: 'fake', at }] }))
  assert.throws(() => validatePocket({ ...data, version: 2 }))
})
test('长文字和纵向图片的选框与命中区域一致', () => {
  const draft = freshPostcard(),
    text = draft.objects[0]
  text.text = '第一行\n第二行\n第三行\n第四行\n第五行\n第六行\n第七行'
  assert.ok(postcardBounds(text, new Map()).height > 400)
  assert.equal(hitPostcard(draft, text.x, text.y + 170)?.id, text.id)
  const image = {
    id: 'image',
    kind: 'image',
    imageId: 'local',
    x: 600,
    y: 400,
    scale: 1,
    rotation: 0,
    opacity: 1,
  }
  const images = new Map([['local', { width: 100, height: 400 }]])
  draft.objects = [image]
  assert.equal(postcardBounds(image, images).height, 730)
  assert.equal(hitPostcard(draft, 600, 700, images)?.id, 'image')
  image.x = -200
  image.y = -100
  clampPostcardObject(image, images)
  assert.ok(image.x >= 95 && image.y >= 365)
})
test('六枚印章使用独立且共享的图形路径', () => {
  assert.equal(Object.keys(stampPaths).length, 6)
  assert.equal(new Set(Object.values(stampPaths)).size, 6)
})
