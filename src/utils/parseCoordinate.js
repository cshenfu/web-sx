import JSZip from 'jszip'
import * as XLSX from 'xlsx'

// ─────────────────────────────────────────────
// 内部工具：把 KML 坐标字符串解析成点位数组
// ─────────────────────────────────────────────
function parseCoordString(str) {
  return str
    .trim()
    .split(/\s+/)
    .map(seg => {
      const parts = seg.split(',').map(Number)
      return { lng: parts[0], lat: parts[1], alt: parts[2] ?? 0 }
    })
    .filter(p => !isNaN(p.lng) && !isNaN(p.lat))
}

// ─────────────────────────────────────────────
// 内部工具：从已解析的 DOM 提取所有 Feature
// ─────────────────────────────────────────────
function extractFeaturesFromDom(dom) {
  const features = []
  const placemarks = dom.querySelectorAll('Placemark')

  placemarks.forEach(pm => {
    const name = pm.querySelector('name')?.textContent?.trim() ?? ''

    // Point
    pm.querySelectorAll('Point > coordinates').forEach(el => {
      const coords = parseCoordString(el.textContent)
      if (coords.length) features.push({ type: 'Point', name, coordinates: coords[0] })
    })

    // LineString
    pm.querySelectorAll('LineString > coordinates').forEach(el => {
      features.push({ type: 'LineString', name, coordinates: parseCoordString(el.textContent) })
    })

    // Polygon（取外环）
    pm.querySelectorAll('Polygon outerBoundaryIs coordinates').forEach(el => {
      features.push({ type: 'Polygon', name, coordinates: parseCoordString(el.textContent) })
    })

    // MultiGeometry 递归子级
    pm.querySelectorAll('MultiGeometry').forEach(mg => {
      mg.querySelectorAll('Point > coordinates').forEach(el => {
        const coords = parseCoordString(el.textContent)
        if (coords.length) features.push({ type: 'Point', name, coordinates: coords[0] })
      })
      mg.querySelectorAll('LineString > coordinates').forEach(el => {
        features.push({ type: 'LineString', name, coordinates: parseCoordString(el.textContent) })
      })
      mg.querySelectorAll('Polygon outerBoundaryIs coordinates').forEach(el => {
        features.push({ type: 'Polygon', name, coordinates: parseCoordString(el.textContent) })
      })
    })
  })

  return features
}

// ─────────────────────────────────────────────
// 公开方法 1：解析 KML 文件
// ─────────────────────────────────────────────
/**
 * @param {File} file  .kml 文件
 * @returns {Promise<{ features: Array, points: Array, polygons: Array, lines: Array }>}
 */
export async function parseKml(file) {
  const text = await file.text()
  const dom = new DOMParser().parseFromString(text, 'text/xml')

  const parseErr = dom.querySelector('parsererror')
  if (parseErr) throw new Error('KML 格式错误：' + parseErr.textContent)

  const features = extractFeaturesFromDom(dom)
  const result = {
    features,
    points:   features.filter(f => f.type === 'Point'),
    polygons: features.filter(f => f.type === 'Polygon'),
    lines:    features.filter(f => f.type === 'LineString'),
  }

  console.log(`[KML 解析] ${file.name}`, result)
  return result
}

// ─────────────────────────────────────────────
// 公开方法 2：解析 KMZ 文件（zip 包含 kml）
// ─────────────────────────────────────────────
/**
 * @param {File} file  .kmz 文件
 * @returns {Promise<{ features: Array, points: Array, polygons: Array, lines: Array }>}
 */
export async function parseKmz(file) {
  const buf = await file.arrayBuffer()
  const zip = await JSZip.loadAsync(buf)

  // KMZ 里可能有多个 kml，优先取 doc.kml，否则取第一个
  const kmlFiles = Object.values(zip.files).filter(f => /\.kml$/i.test(f.name))
  if (!kmlFiles.length) throw new Error('KMZ 内未找到 KML 文件')

  const preferred = kmlFiles.find(f => /doc\.kml$/i.test(f.name)) ?? kmlFiles[0]
  const text = await preferred.async('text')
  const dom = new DOMParser().parseFromString(text, 'text/xml')

  const parseErr = dom.querySelector('parsererror')
  if (parseErr) throw new Error('KMZ 内 KML 格式错误：' + parseErr.textContent)

  const features = extractFeaturesFromDom(dom)
  const result = {
    features,
    points:   features.filter(f => f.type === 'Point'),
    polygons: features.filter(f => f.type === 'Polygon'),
    lines:    features.filter(f => f.type === 'LineString'),
  }

  console.log(`[KMZ 解析] ${file.name}`, result)
  return result
}

// ─────────────────────────────────────────────
// 公开方法 3：解析 XLSX 文件
// ─────────────────────────────────────────────
/**
 * @param {File} file  .xlsx 文件
 * @returns {Promise<{ headers: string[], rows: object[], raw: any[][] }>}
 */
export async function parseXlsx(file) {
  const buf = await file.arrayBuffer()
  const wb = XLSX.read(buf, { type: 'array' })

  // 默认取第一个 Sheet
  const sheetName = wb.SheetNames[0]
  const sheet = wb.Sheets[sheetName]

  const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' })
  const raw  = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' })
  const headers = raw[0] ?? []

  const result = { sheetName, headers, rows, raw }
  console.log(`[XLSX 解析] ${file.name}`, result)
  return result
}

// ─────────────────────────────────────────────
// 公开方法 4：自动识别并解析（给组件用）
// ─────────────────────────────────────────────
/**
 * 根据文件扩展名自动选择解析方法
 * 不支持解析的格式返回 null（不报错，直接上传就行）
 * @param {File} file
 */
export async function autoParseFile(file) {
  const ext = file.name.split('.').pop().toLowerCase()
  if (ext === 'kml')  return parseKml(file)
  if (ext === 'kmz')  return parseKmz(file)
  if (ext === 'xlsx') return parseXlsx(file)
  return null   // dwg/pdf/png 等不解析
}