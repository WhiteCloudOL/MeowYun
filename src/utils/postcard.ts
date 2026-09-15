import { stampPaths } from './stampPaths.ts'
import { stampCatalog } from './pocketData.ts'
export type StickerKind =
  'cloud' | 'star' | 'flower' | 'heart' | 'rainbow' | 'stamp' | 'image' | 'text'
export interface PostcardObject {
  id: string
  kind: StickerKind
  x: number
  y: number
  scale: number
  rotation: number
  opacity: number
  text?: string
  imageId?: string
}
export interface PostcardDraft {
  template: 'cloud' | 'ticket' | 'note'
  background: string
  objects: PostcardObject[]
}
export const postcardWidth = 1200,
  postcardHeight = 800
export function freshPostcard(): PostcardDraft {
  return {
    template: 'cloud',
    background: '#fff9ef',
    objects: [
      {
        id: 'message',
        kind: 'text',
        x: 600,
        y: 365,
        scale: 1,
        rotation: 0,
        opacity: 1,
        text: '把一朵云寄给你。\n愿今天有一点点好事情。',
      },
      { id: 'first-cloud', kind: 'cloud', x: 190, y: 560, scale: 1, rotation: -10, opacity: 1 },
    ],
  }
}
const ink = '#443748',
  pink = '#f6cdde',
  blue = '#c5dff9'
function star(ctx: CanvasRenderingContext2D, r: number) {
  ctx.beginPath()
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5,
      radius = i % 2 ? r * 0.45 : r
    const x = Math.cos(a) * radius,
      y = Math.sin(a) * radius
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.closePath()
  ctx.fill()
  ctx.stroke()
}
export function drawSticker(ctx: CanvasRenderingContext2D, kind: StickerKind, label = '') {
  ctx.lineWidth = 4
  ctx.strokeStyle = ink
  ctx.fillStyle = pink
  if (kind === 'star') {
    star(ctx, 75)
  } else if (kind === 'cloud') {
    ctx.beginPath()
    ctx.moveTo(-58, 35)
    ctx.bezierCurveTo(-112, 23, -94, -33, -53, -24)
    ctx.bezierCurveTo(-58, -78, 27, -88, 44, -38)
    ctx.bezierCurveTo(89, -60, 112, 16, 65, 35)
    ctx.closePath()
    ctx.fillStyle = '#fffdfa'
    ctx.fill()
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(-29, -5)
    ctx.lineTo(-29, 5)
    ctx.moveTo(26, -5)
    ctx.lineTo(26, 5)
    ctx.moveTo(-10, 12)
    ctx.quadraticCurveTo(0, 25, 10, 12)
    ctx.stroke()
    ctx.fillStyle = pink
    ctx.beginPath()
    ctx.ellipse(-48, 15, 10, 5, 0, 0, 7)
    ctx.ellipse(44, 15, 10, 5, 0, 0, 7)
    ctx.fill()
  } else if (kind === 'heart') {
    ctx.beginPath()
    ctx.moveTo(0, 65)
    ctx.bezierCurveTo(-120, -5, -57, -97, 0, -40)
    ctx.bezierCurveTo(64, -98, 117, 0, 0, 65)
    ctx.fill()
    ctx.stroke()
  } else if (kind === 'flower') {
    for (let i = 0; i < 6; i++) {
      ctx.save()
      ctx.rotate((i * Math.PI) / 3)
      ctx.beginPath()
      ctx.ellipse(0, -43, 25, 37, 0, 0, 7)
      ctx.fill()
      ctx.stroke()
      ctx.restore()
    }
    ctx.beginPath()
    ctx.arc(0, 0, 27, 0, 7)
    ctx.fillStyle = '#ffdd8e'
    ctx.fill()
    ctx.stroke()
  } else if (kind === 'rainbow') {
    ;[pink, '#ffdd8e', blue].forEach((color, index) => {
      ctx.beginPath()
      ctx.arc(0, 30, 75 - index * 19, Math.PI, Math.PI * 2)
      ctx.strokeStyle = color
      ctx.lineWidth = 19
      ctx.stroke()
    })
    ctx.strokeStyle = ink
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.arc(0, 30, 85, Math.PI, Math.PI * 2)
    ctx.stroke()
  } else if (kind === 'stamp') {
    ctx.strokeStyle = '#914562'
    ctx.fillStyle = '#914562'
    ctx.lineWidth = 3
    ctx.setLineDash([5, 4])
    ctx.beginPath()
    ctx.arc(0, 0, 82, 0, 7)
    ctx.stroke()
    ctx.setLineDash([])
    ctx.beginPath()
    ctx.arc(0, 0, 70, 0, 7)
    ctx.stroke()
    ctx.save()
    ctx.translate(0, -13)
    const stamp = stampCatalog.find((s) => s.label === label)
    ctx.scale(1.15, 1.15)
    ctx.translate(-60, -60)
    if (stamp) ctx.stroke(new Path2D(stampPaths[stamp.id]))
    ctx.restore()
    ctx.font = 'bold 17px "Microsoft YaHei", sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(label, 0, 46)
  }
}
function textLines(ctx: { measureText(text: string): { width: number } }, text: string) {
  const lines: string[] = []
  for (const paragraph of text.split('\n')) {
    let line = ''
    for (const char of paragraph) {
      if (ctx.measureText(line + char).width > 760) {
        lines.push(line)
        line = ''
      }
      line += char
    }
    lines.push(line)
  }
  return lines.slice(0, 7)
}
function drawText(ctx: CanvasRenderingContext2D, text: string) {
  ctx.font = '40px "Microsoft YaHei", "PingFang SC", sans-serif'
  ctx.fillStyle = ink
  ctx.textAlign = 'center'
  const visible = textLines(ctx, text)
  visible.forEach((line, i) => ctx.fillText(line, 0, (i - (visible.length - 1) / 2) * 62))
}
// 预览与导出使用同一个纯 Canvas 渲染器；只接收已解码的本地图片，不引入跨域画布污染。
export function renderPostcard(
  ctx: CanvasRenderingContext2D,
  draft: PostcardDraft,
  images: ReadonlyMap<string, CanvasImageSource>,
  selected?: string,
) {
  ctx.clearRect(0, 0, postcardWidth, postcardHeight)
  ctx.save()
  ctx.fillStyle = draft.background
  ctx.fillRect(0, 0, postcardWidth, postcardHeight)
  if (draft.template === 'cloud') {
    ctx.fillStyle = blue
    ctx.fillRect(0, 0, 1200, 150)
    ctx.fillStyle = '#fffdfa'
    for (let x = -100; x < 1300; x += 160) {
      ctx.beginPath()
      ctx.ellipse(x, 150, 110, 55, 0, 0, 7)
      ctx.fill()
    }
    ctx.fillStyle = pink
    ctx.beginPath()
    ctx.arc(1060, 85, 42, 0, 7)
    ctx.fill()
    ctx.strokeStyle = ink
    ctx.lineWidth = 3
    ctx.strokeRect(28, 28, 1144, 744)
  } else if (draft.template === 'ticket') {
    ctx.fillStyle = '#263456'
    ctx.fillRect(0, 0, 1200, 175)
    ctx.fillStyle = '#fff3bb'
    for (const [x, y] of [
      [80, 70],
      [420, 45],
      [750, 105],
      [1050, 57],
    ]) {
      ctx.save()
      ctx.translate(x!, y!)
      star(ctx, 13)
      ctx.restore()
    }
    ctx.strokeStyle = ink
    ctx.lineWidth = 3
    ctx.setLineDash([10, 12])
    ctx.beginPath()
    ctx.moveTo(990, 190)
    ctx.lineTo(990, 740)
    ctx.stroke()
    ctx.setLineDash([])
    ctx.font = 'bold 24px sans-serif'
    ctx.fillStyle = ink
    ctx.save()
    ctx.translate(1070, 490)
    ctx.rotate(-Math.PI / 2)
    ctx.fillText('云上小屋 · 一张星夜车票', -200, 0)
    ctx.restore()
  } else {
    ctx.strokeStyle = '#a9cff580'
    ctx.lineWidth = 2
    for (let y = 190; y < 760; y += 62) {
      ctx.beginPath()
      ctx.moveTo(55, y)
      ctx.lineTo(1145, y)
      ctx.stroke()
    }
    ctx.fillStyle = pink
    ctx.save()
    ctx.translate(150, 60)
    ctx.rotate(-0.1)
    ctx.fillRect(0, 0, 220, 45)
    ctx.restore()
    ctx.fillStyle = blue
    ctx.save()
    ctx.translate(850, 40)
    ctx.rotate(0.1)
    ctx.fillRect(0, 0, 170, 45)
    ctx.restore()
  }
  ctx.fillStyle = draft.template === 'ticket' ? '#fff9ef' : ink
  ctx.font = 'bold 24px "Microsoft YaHei", sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText(
    draft.template === 'ticket' ? '星夜有一封来信' : '从云上小屋，寄出一点好心情',
    60,
    90,
  )
  for (const item of draft.objects) {
    ctx.save()
    ctx.translate(item.x, item.y)
    ctx.rotate((item.rotation * Math.PI) / 180)
    ctx.scale(item.scale, item.scale)
    ctx.globalAlpha = item.opacity
    if (item.kind === 'text') drawText(ctx, item.text ?? '')
    else if (item.kind === 'image') {
      const img = images.get(item.imageId ?? '')
      if (img) {
        const source = img as ImageBitmap
        const ratio = source.width / source.height
        ctx.drawImage(img, -90, -90 / ratio, 180, 180 / ratio)
      }
    } else drawSticker(ctx, item.kind, item.text)
    ctx.restore()
    if (item.id === selected) {
      ctx.save()
      ctx.translate(item.x, item.y)
      ctx.rotate((item.rotation * Math.PI) / 180)
      ctx.strokeStyle = '#914562'
      ctx.lineWidth = 2
      ctx.setLineDash([8, 6])
      const bounds = postcardBounds(item, images, ctx)
      ctx.strokeRect(
        (-bounds.width / 2) * item.scale,
        (-bounds.height / 2) * item.scale,
        bounds.width * item.scale,
        bounds.height * item.scale,
      )
      ctx.restore()
    }
  }
  ctx.fillStyle = ink
  ctx.font = '16px "Microsoft YaHei", sans-serif'
  ctx.textAlign = 'right'
  ctx.fillText('云上小屋 · made by you', 1140, 748)
  ctx.restore()
}
export function hitPostcard(
  draft: PostcardDraft,
  x: number,
  y: number,
  images: ReadonlyMap<string, CanvasImageSource> = new Map(),
  ctx?: CanvasRenderingContext2D,
): PostcardObject | undefined {
  return [...draft.objects].reverse().find((item) => {
    const a = (-item.rotation * Math.PI) / 180,
      dx = x - item.x,
      dy = y - item.y
    const px = (dx * Math.cos(a) - dy * Math.sin(a)) / item.scale,
      py = (dx * Math.sin(a) + dy * Math.cos(a)) / item.scale
    const bounds = postcardBounds(item, images, ctx)
    return Math.abs(px) < bounds.width / 2 && Math.abs(py) < bounds.height / 2
  })
}

export function postcardBounds(
  item: PostcardObject,
  images: ReadonlyMap<string, CanvasImageSource>,
  ctx?: CanvasRenderingContext2D,
): { width: number; height: number } {
  if (item.kind === 'text') {
    if (ctx) ctx.font = '40px "Microsoft YaHei", "PingFang SC", sans-serif'
    const measure = ctx ?? { measureText: (text: string) => ({ width: [...text].length * 40 }) }
    const lines = textLines(measure, item.text ?? '')
    return {
      width: Math.max(60, ...lines.map((line) => measure.measureText(line).width)) + 24,
      height: Math.max(62, lines.length * 62) + 20,
    }
  }
  if (item.kind === 'image') {
    const image = images.get(item.imageId ?? '') as ImageBitmap | undefined
    if (image) return { width: 190, height: (180 * image.height) / image.width + 10 }
  }
  return { width: 190, height: 200 }
}
// 将旋转后的包围盒保留在画布内；超大图层允许两侧裁切，但中心固定，避免完全拖丢。
export function clampPostcardObject(
  item: PostcardObject,
  images: ReadonlyMap<string, CanvasImageSource>,
  ctx?: CanvasRenderingContext2D,
) {
  const b = postcardBounds(item, images, ctx),
    a = (item.rotation * Math.PI) / 180
  const x = Math.min(
    600,
    ((Math.abs(Math.cos(a)) * b.width + Math.abs(Math.sin(a)) * b.height) * item.scale) / 2,
  )
  const y = Math.min(
    400,
    ((Math.abs(Math.sin(a)) * b.width + Math.abs(Math.cos(a)) * b.height) * item.scale) / 2,
  )
  item.x = Math.max(x, Math.min(1200 - x, item.x))
  item.y = Math.max(y, Math.min(800 - y, item.y))
}
