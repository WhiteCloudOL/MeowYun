import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { parse, compileStyle } from '@vue/compiler-sfc'
test('插画 global 选择器必须包含目标层，不能泄漏为所有链接的 hover', () => {
  const source = readFileSync(
    new URL('../src/components/ui/SoftIllustration.vue', import.meta.url),
    'utf8',
  )
  const { descriptor } = parse(source)
  const { code, errors } = compileStyle({
    source: descriptor.styles[0].content,
    filename: 'SoftIllustration.vue',
    id: 'data-v-regression',
    scoped: true,
  })
  assert.deepEqual(errors, [])
  assert.match(code, /a:hover \.soft-illustration \.illustration-object/)
  assert.doesNotMatch(
    code,
    /(?:^|})\s*(?:@media[^{}]+{\s*)?(?:a:hover|\.project-card:hover)\s*[,{]/m,
  )
  assert.doesNotMatch(code, /\[data-motion=['"]off['"]\]\s*[,{]/)
})
