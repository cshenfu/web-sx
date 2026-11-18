/**
 * 本地构建分析插件。
 * 仅在 ANALYZE=true 时启用，不影响常规构建产物和构建流程。
 * 报告包含每个 chunk 的模块贡献大小，可用于定位超大 bundle 的来源。
 */
function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[char])
}

function formatBytes(value) {
  const bytes = Number(value) || 0
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

export function bundleAnalysisPlugin() {
  return {
    name: 'local-bundle-analysis',
    apply: 'build',
    generateBundle(_options, bundle) {
      const chunks = Object.values(bundle)
        .filter((item) => item.type === 'chunk')
        .map((chunk) => {
          const modules = Object.entries(chunk.modules || {})
            .map(([id, info]) => ({
              id,
              renderedLength: info.renderedLength || 0,
              originalLength: info.originalLength || 0,
            }))
            .sort((a, b) => b.renderedLength - a.renderedLength)

          return {
            fileName: chunk.fileName,
            size: chunk.code.length,
            isEntry: chunk.isEntry,
            isDynamicEntry: chunk.isDynamicEntry,
            imports: chunk.imports || [],
            dynamicImports: chunk.dynamicImports || [],
            modules,
          }
        })
        .sort((a, b) => b.size - a.size)

      const totalSize = chunks.reduce((sum, chunk) => sum + chunk.size, 0)
      const rows = chunks.map((chunk) => {
        const moduleRows = chunk.modules.map((module) => `
          <tr>
            <td class="path" title="${escapeHtml(module.id)}">${escapeHtml(module.id)}</td>
            <td class="num">${formatBytes(module.renderedLength)}</td>
            <td class="num">${formatBytes(module.originalLength)}</td>
          </tr>`).join('')

        return `
          <section class="chunk">
            <h2>${escapeHtml(chunk.fileName)} <small>${formatBytes(chunk.size)}</small></h2>
            <p class="meta">${chunk.isEntry ? '入口 chunk' : chunk.isDynamicEntry ? '动态入口 chunk' : '共享/依赖 chunk'}</p>
            <details>
              <summary>查看模块明细（${chunk.modules.length} 个）</summary>
              <table>
                <thead><tr><th>模块路径</th><th>Tree-shaking 后代码量</th><th>模块原始代码量</th></tr></thead>
                <tbody>${moduleRows}</tbody>
              </table>
            </details>
          </section>`
      }).join('')

      const html = `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Vite Bundle 分析报告</title>
<style>
  *{box-sizing:border-box}body{margin:0;padding:28px;background:#f5f7fb;color:#202938;font:14px/1.6 system-ui,-apple-system,"Segoe UI",sans-serif}
  main{max-width:1200px;margin:0 auto}.summary{padding:20px 24px;background:#fff;border:1px solid #e5eaf2;border-radius:12px;margin:16px 0 24px}
  h1{font-size:24px;margin:0}.summary strong{font-size:22px;margin-right:8px}.chunk{background:#fff;border:1px solid #e5eaf2;border-radius:10px;padding:16px 20px;margin:12px 0}
  h2{font-size:16px;margin:0 0 4px;overflow-wrap:anywhere}h2 small{color:#0369a1;margin-left:8px}.meta{color:#667085;margin:0 0 12px}
  summary{cursor:pointer;color:#075985;font-weight:600;padding:8px 0}table{width:100%;border-collapse:collapse;table-layout:fixed}
  th,td{text-align:left;padding:8px;border-bottom:1px solid #edf0f5}th{background:#f8fafc}td.path{overflow-wrap:anywhere;font-family:ui-monospace,monospace;font-size:12px}
  td.num,th:not(:first-child){width:130px;text-align:right;white-space:nowrap}.hint{color:#667085}
</style>
</head>
<body><main>
<h1>Vite Bundle 分析报告</h1>
<div class="summary"><strong>${formatBytes(totalSize)}</strong> 所有 JS chunk 总体积（未 gzip）<p class="hint">按 chunk 体积从大到小排列；展开模块明细可查看各模块对 chunk 的体积贡献。</p></div>
${rows}
</main></body></html>`

      this.emitFile({
        type: 'asset',
        fileName: 'bundle-analysis.html',
        source: html,
      })
    },
  }
}
