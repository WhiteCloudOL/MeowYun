import ts from 'typescript'

type Literal = string | boolean | number | null | Literal[] | { [key: string]: Literal | undefined }

function literal(node: ts.Expression): Literal | undefined {
  if (
    ts.isSatisfiesExpression(node) ||
    ts.isAsExpression(node) ||
    ts.isParenthesizedExpression(node)
  )
    return literal(node.expression)
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text
  if (ts.isNumericLiteral(node)) return Number(node.text)
  if (node.kind === ts.SyntaxKind.TrueKeyword) return true
  if (node.kind === ts.SyntaxKind.FalseKeyword) return false
  if (node.kind === ts.SyntaxKind.NullKeyword) return null
  if (ts.isArrayLiteralExpression(node))
    return node.elements
      .map((item) => literal(item))
      .filter((item): item is Literal => item !== undefined)
  if (ts.isObjectLiteralExpression(node)) {
    const result: Record<string, Literal | undefined> = {}
    for (const property of node.properties) {
      if (!ts.isPropertyAssignment(property)) continue
      if (ts.isIdentifier(property.name) || ts.isStringLiteral(property.name))
        result[property.name.text] = literal(property.initializer)
    }
    return result
  }
  return undefined
}

function object(value: Literal | undefined): Record<string, Literal | undefined> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {}
}

export function readPublicSiteConfig(source: string) {
  const file = ts.createSourceFile('site.ts', source, ts.ScriptTarget.Latest, true)
  let config: Record<string, Literal | undefined> = {}
  // 只读取导出配置的字面量，不执行配置代码，也不跨对象正则匹配 enabled。
  for (const statement of file.statements) {
    if (!ts.isVariableStatement(statement)) continue
    for (const declaration of statement.declarationList.declarations) {
      if (
        ts.isIdentifier(declaration.name) &&
        declaration.name.text === 'siteConfig' &&
        declaration.initializer
      )
        config = object(literal(declaration.initializer))
    }
  }
  const meta = object(config.meta)
  const text = (key: string, fallback = '') =>
    typeof meta[key] === 'string' ? (meta[key] as string) : fallback
  for (const key of ['name', 'title', 'description', 'siteUrl']) {
    if (!text(key)) throw new Error(`site.ts: meta.${key} 必须使用非空字符串字面量，以生成静态 SEO`)
  }
  const siteUrl = new URL(text('siteUrl'))
  if (!['http:', 'https:'].includes(siteUrl.protocol))
    throw new Error('site.ts: meta.siteUrl 必须是 HTTP(S) 地址')
  const redirects = (Array.isArray(config.redirects) ? config.redirects : [])
    .map(object)
    .filter((item) => item.enabled === true && typeof item.path === 'string')
    .map((item) => String(item.path))
  return {
    text,
    siteUrl: siteUrl.href.endsWith('/') ? siteUrl.href : siteUrl.href + '/',
    redirects,
  }
}
