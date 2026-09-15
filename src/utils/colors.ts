export function validHex(value: string): boolean {
  return /^#[0-9a-f]{6}$/i.test(value)
}
export function luminance(hex: string): number {
  if (!validHex(hex)) return 1
  const rgb = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
  const linear = rgb.map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
  return linear[0]! * 0.2126 + linear[1]! * 0.7152 + linear[2]! * 0.0722
}
export function contrast(a: string, b: string): number {
  const x = luminance(a),
    y = luminance(b)
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)
}
export function readableInk(hex: string): string {
  return contrast(hex, '#222536') >= contrast(hex, '#ffffff') ? '#222536' : '#ffffff'
}
export function hslToHex(h: number, s: number, l: number): string {
  s /= 100
  l /= 100
  const a = s * Math.min(l, 1 - l)
  const channel = (n: number) => {
    const k = (n + h / 30) % 12
    return Math.round(255 * (l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))))
      .toString(16)
      .padStart(2, '0')
  }
  return '#' + channel(0) + channel(8) + channel(4)
}
export function hexToHsl(hex: string): [number, number, number] {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255) as [
    number,
    number,
    number,
  ]
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b),
    d = max - min,
    l = (max + min) / 2
  const h = !d
    ? 0
    : max === r
      ? ((g - b) / d + (g < b ? 6 : 0)) * 60
      : max === g
        ? ((b - r) / d + 2) * 60
        : ((r - g) / d + 4) * 60
  return [
    Math.round(h),
    Math.round(d ? (d / (1 - Math.abs(2 * l - 1))) * 100 : 0),
    Math.round(l * 100),
  ]
}
// 使用同一基色附近的类似色和柔和对比色，控制饱和度/明度；锁定颜色由调用方原样保留。
export function relatedPalette(hue: number): string[] {
  return [
    [-28, 68, 85],
    [0, 62, 79],
    [38, 65, 88],
    [145, 46, 81],
    [215, 53, 85],
  ].map(([offset, s, l]) => hslToHex((hue + offset! + 360) % 360, s!, l!))
}
