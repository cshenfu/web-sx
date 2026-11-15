// utils/downloadTemplate.js
import { templatePath, ossClientInfo } from '@/assets/js/static.js'

// 业务别名 → static.js templatePath 的 key
const TEMPLATE_KEY_MAP = {
  // 场区范围（template.txt 里叫 siteRange，static 里叫 point）
  siteRange: 'point',
  point: 'point',
  // 风机点位
  windTurbine: 'fan',
  fan: 'fan',
  // 升压站 / 开关站
  booster: 'boosterStation',
  boosterStation: 'boosterStation',
  // 其他业务按需补
  weather: 'weather',
  device: 'device',
  anemometerTower: 'anemometerTower',
  windMesoscale: 'windMesoscale',
}

// templatePath 里写死的是生产桶，非生产环境换成当前桶
function resolveTemplateUrl(url) {
  if (!url) return ''
  const prodBucket = 'whln-prod-public'
  const targetBucket = ossClientInfo?.bucketname || prodBucket
  if (targetBucket === prodBucket) return url
  return url.replace(new RegExp(prodBucket, 'g'), targetBucket)
}

function getFileNameFromUrl(url, fallback = '模板.xlsx') {
  try {
    const pathname = new URL(url, window.location.origin).pathname
    const raw = decodeURIComponent(pathname.split('/').pop() || '')
    return raw || fallback
  } catch {
    return fallback
  }
}

/**
 * 下载模板
 * @param {string} type 业务别名，见 TEMPLATE_KEY_MAP
 * @param {object} [options]
 * @param {string} [options.fileName] 强制指定下载文件名
 * @param {boolean} [options.silent] 失败时不弹提示
 * @returns {Promise<boolean>} 是否成功触发下载
 */
export async function downloadTemplate(type, options = {}) {
  const key = TEMPLATE_KEY_MAP[type]
  const rawUrl = key ? templatePath[key] : null
  if (!rawUrl) {
    if (!options.silent) {
      console.warn(`[downloadTemplate] 未找到模板类型：${type}`)
    }
    return false
  }

  const url = resolveTemplateUrl(rawUrl)
  const fileName = options.fileName || getFileNameFromUrl(url, `${type}模板.xlsx`)

  // 优先 fetch + blob，文件名可控
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const blob = await res.blob()
    const objectUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = objectUrl
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    setTimeout(() => URL.revokeObjectURL(objectUrl), 2000)
    return true
  } catch (err) {
    // 跨域未开 CORS 时回退 window.open（文件名由 OSS Content-Disposition 决定）
    console.warn('[downloadTemplate] blob 下载失败，回退 window.open', err)
    window.open(url, '_blank')
    return true
  }
}

export default downloadTemplate