/** 存储可能被浏览器策略或配额禁用；失败只退化到本次会话，不中断页面。 */
export function readPreference(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}
export function writePreference(key: string, value: string): void {
  try {
    localStorage.setItem(key, value)
  } catch {
    /* 保留内存状态。 */
  }
}
