const articleAssets = import.meta.glob('../../assets/images/articles/*.{png,jpg,jpeg,webp,avif}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>

export function resolveImage(source = '') {
  const value = source.trim().replace(/^['"]|['"]$/g, '')

  if (!value) return undefined
  if (/^(?:https?:|data:|\/)/.test(value)) return value

  const filename = value.split('/').at(-1)
  const asset = Object.entries(articleAssets).find(([path]) => path.endsWith(`/${filename}`))
  return asset?.[1] ?? value
}
