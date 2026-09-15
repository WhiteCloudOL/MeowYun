// 仅用于本地验收缓存分类、压缩和深层路由；不是线上源站配置，也不模拟 EdgeOne 命中。
import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { resolve, sep, extname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { brotliCompress, gzip } from 'node:zlib'
import { promisify } from 'node:util'
const root = fileURLToPath(new URL('../dist/', import.meta.url))
const manifest = JSON.parse(await readFile(resolve(root, '.vite/manifest.json'), 'utf8'))
const versioned = new Set(
  Object.values(manifest).flatMap((entry) => [
    entry.file,
    ...(entry.css ?? []),
    ...(entry.assets ?? []),
  ]),
)
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
}
const compressBr = promisify(brotliCompress),
  compressGzip = promisify(gzip)
async function regular(path) {
  try {
    return (await stat(path)).isFile()
  } catch {
    return false
  }
}
createServer(async (req, res) => {
  try {
    if (!['GET', 'HEAD'].includes(req.method)) {
      res.writeHead(405, { Allow: 'GET, HEAD', 'Cache-Control': 'no-store' })
      res.end()
      return
    }
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname)
    // 禁止隐藏文件、Windows 反斜线和目录穿越；只从构建目录返回已存在文件。
    if (
      pathname.includes('\\') ||
      pathname.includes('\0') ||
      pathname.split('/').some((part) => part.startsWith('.'))
    ) {
      res.writeHead(404, { 'Cache-Control': 'no-store' })
      res.end()
      return
    }
    const relative = pathname.replace(/^\/+/, '')
    const target = resolve(root, relative)
    if (target !== resolve(root) && !target.startsWith(resolve(root) + sep)) {
      res.writeHead(404)
      res.end()
      return
    }
    const candidates = [target]
    if (!extname(pathname)) candidates.push(target + '.html', resolve(target, 'index.html'))
    let file
    for (const candidate of candidates)
      if (await regular(candidate)) {
        file = candidate
        break
      }
    let status = 200
    if (!file) {
      status = 404
      // 只有无扩展名的 HTML 导航使用 404 页面；缺失资源/API 绝不返回首页 HTML。
      if (
        !extname(pathname) &&
        !pathname.startsWith('/api/') &&
        req.headers.accept?.includes('text/html')
      )
        file = resolve(root, '404.html')
      else {
        res.writeHead(404, {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-store',
        })
        res.end(req.method === 'HEAD' ? undefined : 'Not found')
        return
      }
    }
    const type = mime[extname(file)] ?? 'application/octet-stream'
    const cache =
      status !== 200
        ? 'no-store'
        : versioned.has(relative)
          ? 'public, max-age=31536000, immutable'
          : 'no-cache'
    let body = await readFile(file)
    const headers = {
      'Content-Type': type,
      'Cache-Control': cache,
      'X-Content-Type-Options': 'nosniff',
    }
    if (/^(text\/|application\/(json|xml))/.test(type)) {
      headers.Vary = 'Accept-Encoding'
      if (/\bbr\b/.test(req.headers['accept-encoding'] ?? '')) {
        body = await compressBr(body)
        headers['Content-Encoding'] = 'br'
      } else if (/\bgzip\b/.test(req.headers['accept-encoding'] ?? '')) {
        body = await compressGzip(body)
        headers['Content-Encoding'] = 'gzip'
      }
    }
    headers['Content-Length'] = String(body.length)
    res.writeHead(status, headers)
    res.end(req.method === 'HEAD' ? undefined : body)
  } catch {
    res.writeHead(400, { 'Cache-Control': 'no-store' })
    res.end('Bad request')
  }
}).listen(4183, '127.0.0.1', () =>
  console.log('Local verification origin: http://127.0.0.1:4183 (not a CDN)'),
)
