export function parseArticleSource(source: string, filename: string) {
  const match = source.replaceAll('\r\n', '\n').match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
  const attributes: Record<string, string> = {}
  for (const line of (match?.[1] ?? '').split('\n')) {
    const separator = line.indexOf(':')
    if (separator < 0) continue
    const value = line.slice(separator + 1).trim()
    attributes[line.slice(0, separator).trim()] = value.replace(/^(['"])(.*)\1$/, '$2')
  }
  // 发布日期是内容事实，缺失或无效时阻止构建并指出文件，不能静默写成今天。
  for (const key of ['date', 'updated']) {
    const value = attributes[key]
    if (key === 'updated' && !value) continue
    const date = new Date(`${value}T00:00:00Z`)
    if (
      !value ||
      !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
      !Number.isFinite(date.getTime()) ||
      date.toISOString().slice(0, 10) !== value
    )
      throw new Error(`${filename}: ${key} 必须是有效的 YYYY-MM-DD 日期`)
  }
  const tags = (attributes.tags ?? '')
    .replace(/^\[|\]$/g, '')
    .split(',')
    .map((tag) => tag.trim().replace(/^(['"])(.*)\1$/, '$2'))
    .filter(Boolean)
  return { attributes, tags, body: match?.[2] ?? source }
}
