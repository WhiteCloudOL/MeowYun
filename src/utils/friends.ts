import type { FriendLinkItem } from '../config/schema'
/** 示例保留在本地配置中也不当作真人公开；无效或不安全协议同样不输出。 */
export function isRealFriend(friend: FriendLinkItem): boolean {
  try {
    const url = new URL(friend.href)
    return (
      friend.enabled &&
      /^https?:$/.test(url.protocol) &&
      !/(^|\.)example\.(com|org|net)$/.test(url.hostname) &&
      !/示例友人/.test(friend.name)
    )
  } catch {
    return false
  }
}
