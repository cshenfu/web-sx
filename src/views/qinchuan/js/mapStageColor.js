function hexToRgb(hex) {
    const normalized = String(hex || '').replace('#', '').trim()
    const fullHex = normalized.length === 3
      ? normalized.split('').map(char => char + char).join('')
      : normalized
  
    if (!/^[0-9a-f]{6}$/i.test(fullHex)) {
      return { r: 51, g: 180, b: 235 }
    }
  
    return {
      r: parseInt(fullHex.slice(0, 2), 16),
      g: parseInt(fullHex.slice(2, 4), 16),
      b: parseInt(fullHex.slice(4, 6), 16),
    }
  }
  
  function toHex(value) {
    return Math.round(Math.min(255, Math.max(0, value)))
      .toString(16)
      .padStart(2, '0')
  }
  
  function mixColor(color, target, amount) {
    return `#${toHex(color.r + (target.r - color.r) * amount)}${toHex(color.g + (target.g - color.g) * amount)}${toHex(color.b + (target.b - color.b) * amount)}`
  }
  
  /**
   * 将各市区的数值转换为同一阶段颜色的深浅。
   *
   * cityValues:
   * {
   *   西安市: 80,
   *   榆林市: 100,
   *   ...
   * }
   *
   * baseColor 就是项目概况中对应阶段的小圆点颜色。
   */
  export function buildStageColorMap(cityValues = {}, baseColor = '#39d4ff') {
    const entries = Object.entries(cityValues)
    if (!entries.length) return {}
  
    const values = entries.map(([, value]) => Number(value) || 0)
    const min = Math.min(...values)
    const max = Math.max(...values)
    const base = hexToRgb(baseColor)
    const dark = { r: 4, g: 24, b: 63 }
    const light = { r: 225, g: 250, b: 255 }
  
    return Object.fromEntries(
      entries.map(([city, rawValue]) => {
        const value = Number(rawValue) || 0
        const normalized = max === min ? 0.72 : (value - min) / (max - min)
        // 低值偏暗、高值偏亮，同时保留阶段本身的色相。
        const stageColor = mixColor(base, dark, 0.52 - normalized * 0.38)
        const finalColor = mixColor(
          hexToRgb(stageColor),
          light,
          Math.max(0, normalized - 0.72) * 0.38,
        )
        return [city, finalColor]
      }),
    )
  }