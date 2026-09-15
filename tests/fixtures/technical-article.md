# 验证夹具：长技术标题与部署说明，不属于正式发布文章

这份夹具只用于浏览器回归，不会被文章 glob、RSS 或 Sitemap 读取。

## 重名标题

一个很长的 URL：https://example.invalid/a/very/long/path/with/no/shortening/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa

## 重名标题

- 第一项列表
- 第二项列表
  - 嵌套项目与 **重点内容**

1. 有序步骤
2. 验证编号

> 阅读提示：引用应使用稳定的主题纸面，不倾斜。

| 项目   | 输入     | 输出     | 边界           | 备注                 |
| ------ | -------- | -------- | -------------- | -------------------- |
| 长表格 | 输入字段 | 输出字段 | 移动端横向查看 | 不让文档整体横向滚动 |

```typescript
const firstBlock: string = '<script>not executable</script>'
console.log(
  'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
)
```

```python
second_block = 'independent clipboard feedback'
print(second_block)
```

```unknown-format
<img src=x onerror=alert('unsafe')>
```

<script>window.untrustedExecuted = true</script>

![完整技术截图验证](/test-technical.svg)

![加载失败的技术图片](/test-missing-image.png)
