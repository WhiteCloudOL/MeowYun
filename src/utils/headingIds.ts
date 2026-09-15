/** 最终 ID 全局唯一，避免重复 A 的后缀与真实标题 A-2 碰撞。 */
export function createHeadingId(text: string, used: Set<string>): string {
  const base =
    text
      .normalize('NFKC')
      .toLocaleLowerCase('zh-CN')
      .replace(/[^\p{Letter}\p{Number}]+/gu, '-')
      .replace(/^-|-$/g, '') || 'section'
  let id = `heading-${base}`
  let suffix = 2
  while (used.has(id)) id = `heading-${base}-${suffix++}`
  used.add(id)
  return id
}
