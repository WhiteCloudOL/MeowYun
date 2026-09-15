import assert from 'node:assert/strict'
import test from 'node:test'
import { parseArticleSource } from '../src/utils/articleMetadata.ts'
import { readPublicSiteConfig } from '../build/siteConfig.ts'

test('构建配置读取不跨 disabled 对象，且不误取其他 name/description', () => {
  const config = readPublicSiteConfig(`export const siteConfig = {
    profile: { name: '错误名称' },
    meta: {name:'站点', title:'首页', description:'说明', siteUrl:'https://example.com'},
    redirects: [{path:'/off',enabled:false},{enabled:true,path:'/on'}]
  } satisfies SiteConfig`)
  assert.equal(config.text('name'), '站点')
  assert.deepEqual(config.redirects, ['/on'])
  assert.equal(config.siteUrl, 'https://example.com/')
})

test('文章日期失败应指出文件，不猜测发布日期；构建与运行时共用解析', () => {
  for (const date of ['', '2025-02-29', '2026-13-01', 'not-a-date'])
    assert.throws(
      () => parseArticleSource(`---\ndate: ${date}\n---\n正文`, 'broken.md'),
      /broken.md: date/,
    )
  const article = parseArticleSource(
    `---\ndate: '2024-02-29'\nupdated: 2026-09-15\ntags: ['Vue', TypeScript]\n---\n正文`,
    'ok.md',
  )
  assert.equal(article.attributes.date, '2024-02-29')
  assert.deepEqual(article.tags, ['Vue', 'TypeScript'])
})

test('作品静态入口只读取启用条目，拒绝目录穿越 ID', () => {
  const source = (items) => `export const siteConfig = {
    meta:{name:'站点',title:'首页',description:'说明',siteUrl:'https://example.com'},
    sections:{projects:{items:${items}}}
  }`
  assert.deepEqual(readPublicSiteConfig(source(`[
    {id:'off',title:'隐藏',enabled:false},
    {id:'real-tool',title:'真实工具',description:'用途',enabled:true}
  ]`)).projects, [{id:'real-tool', title:'真实工具', description:'用途'}])
  assert.throws(() => readPublicSiteConfig(source(`[{id:'../outside',enabled:true}]`)), /稳定路径/)
})
