/**
 * AI 项目详情数据适配层
 * getAiProjectData 返回的扁平结构 → MainInfoTab 需要的结构化数据
 */

// ---------- 通用工具 ----------
export function safeParseJson(str) {
    if (str == null) return null
    if (typeof str !== 'string') return str
    try {
      return JSON.parse(str)
    } catch {
      return null
    }
  }
  
  export function formatDate(ts) {
    if (ts == null || ts === '') return '——'
    const d = new Date(Number(ts))
    if (Number.isNaN(d.getTime())) return '——'
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}/${m}/${day}`
  }
  
  // ---------- 升压站坐标解析 ----------
  /**
   * 解析 "coordinate=[{...}], radius=9367.18"
   * → { coordinate: [...], radius: 9367.18 }
   */
  export function parseSubstationCoord(raw) {
    const empty = { coordinate: [], radius: null }
    if (!raw || typeof raw !== 'string') return empty
  
    let coordinate = []
    const coordMatch = raw.match(/coordinate\s*=\s*(\[[\s\S]*?\])\s*(?:,|$)/)
    if (coordMatch) {
      const arr = safeParseJson(coordMatch[1])
      if (Array.isArray(arr)) coordinate = arr
    }
  
    const radiusMatch = raw.match(/radius\s*=\s*([\d.]+)/)
    const radius = radiusMatch ? Number(radiusMatch[1]) : null
  
    return { coordinate, radius }
  }
  
  export function getCoordCenter(coordinate = []) {
    if (!coordinate.length) return null
    let sumLng = 0
    let sumLat = 0
    let n = 0
    for (const c of coordinate) {
      const lng = Number(c.longitude)
      const lat = Number(c.latitude)
      if (Number.isFinite(lng) && Number.isFinite(lat)) {
        sumLng += lng
        sumLat += lat
        n += 1
      }
    }
    return n ? [sumLng / n, sumLat / n] : null
  }
  
  // ---------- 正则提取 ----------
  /** 从 mainTransformerParam 抠 "额定容量：xxx MVA" */
  export function extractMainTransformerCapacity(text) {
    if (!text || typeof text !== 'string') return ''
    const m = text.match(/额定容量\s*[:：]\s*([\d.]+)\s*MVA/i)
    return m ? `${m[1]}MVA` : ''
  }
  
  /** 从 accessStation 抠接入站名称 */
  export function extractAccessStationName(text) {
    if (!text || typeof text !== 'string') return ''
    const m = text.match(/接入\s*([^\s,，。；;]+)/)
    return m ? m[1] : ''
  }
  
  /** 从 lineTotalLength 抠集电线路总长（km） */
  export function extractLineTotalLength(text) {
    if (!text || typeof text !== 'string') return null
    const m = text.match(/总长\s*[:：]?\s*([\d.]+)\s*km/i)
    return m ? Number(m[1]) : null
  }
  
  /** 从 lineLoopDesc 抠回路数 */
  export function extractLoopCount(text) {
    if (!text || typeof text !== 'string') return null
    const m = text.match(/(\d+)\s*回/)
    return m ? Number(m[1]) : null
  }
  
  /** 从 lineLoopDesc 抠每条回路的描述 */
  export function extractLoopItems(text) {
    if (!text || typeof text !== 'string') return []
    const clean = text.replace(/\\r|\\t/g, ' ').replace(/[\r\t]/g, ' ').trim()
    const parts = clean.split(
      /(?=[IVX]{1,4}回集电线路连接\s*[:：]|[一二三四五六七八九十]+回集电线路连接\s*[:：])/g
    )
    return parts.map((p) => p.trim()).filter((p) => p.includes('集电线路连接'))
  }
  
  /** 通用：从文本里抠单个长度 */
  function extractSingleLength(text, reg) {
    if (!text || typeof text !== 'string') return null
    const m = text.match(reg)
    return m ? Number(m[1]) : null
  }
  
  /** 从多段道路文本求和总长 */
  export function extractTotalRoadLength(...texts) {
    let total = 0
    let hit = false
    for (const t of texts) {
      if (!t || typeof t !== 'string') continue
      const matches = t.matchAll(/(?:长约|长)\s*([\d.]+)\s*km/gi)
      for (const m of matches) {
        const v = Number(m[1])
        if (Number.isFinite(v)) {
          total += v
          hit = true
        }
      }
    }
    return hit ? Math.round(total * 1000) / 1000 : null
  }
  
  // ---------- geoFiles 过滤 ----------
  function filterGeoFiles(files, keywords) {
    if (!Array.isArray(files)) return []
    return files.filter((f) => {
      const t = `${f.fileBusinessType || ''}${f.fileName || ''}`.toLowerCase()
      return keywords.some((k) => t.includes(k.toLowerCase()))
    })
  }
  
  // ---------- 各模块组装 ----------
  function buildTimeline(stageTimeList) {
    const list = Array.isArray(stageTimeList) ? stageTimeList : []
    let currentIndex = -1
    list.forEach((s, i) => {
      if (s.stageTime != null) currentIndex = i
    })
    return list.map((s, i) => ({
      key: s.stageCode,
      label: s.stageName,
      date: formatDate(s.stageTime),
      active: i <= currentIndex,       // 到当前阶段都深色
      current: i === currentIndex,     // 当前阶段额外高亮
    }))
  }
  
  function buildMetrics(p) {
    const safe = (v) => (v == null || v === '' ? '暂无数据' : String(v))
    const unit = (v, u) => (v == null || v === '' ? '' : u)
  
    return [
      { label: '装机容量', value: safe(p.actualCapacity), unit: unit(p.actualCapacity, 'MW'), highlight: true },
      { label: '建设总投资', value: safe(p.totalInvestment), unit: unit(p.totalInvestment, '万元'), highlight: false },
      { label: '资本金IRR', value: safe(p.equityIRR), unit: unit(p.equityIRR, '%'), highlight: true },
      { label: '年均上网小时数', value: safe(p.annualHours), unit: unit(p.annualHours, 'h'), highlight: false },
    ]
  }
  
  function buildPlanCards(p) {
    const roadLen = extractTotalRoadLength(p.newRoadInfo, p.expandRoadInfo, p.entryRoadInfo)
    const lineLen = extractLineTotalLength(p.lineTotalLength)
  
    const planRows = []
    const turbineDesc =
      p.turbineCount && p.ratedPower
        ? `${p.turbineCount}台(单机${p.ratedPower}MW)`
        : p.turbineCount
          ? `${p.turbineCount}台`
          : ''
    if (turbineDesc) planRows.push(['风机数量', turbineDesc])
  
    const hubDesc =
      p.hubHeight && p.rotorDiameter ? `${p.hubHeight}m/${p.rotorDiameter}m` : ''
    if (hubDesc) planRows.push(['轮毂高度/叶轮直径', hubDesc])
  
    if (roadLen != null) planRows.push(['道路总长度', `${roadLen}km`])
    if (lineLen != null) planRows.push(['线路总长度', `${lineLen}km`])
  
    const stationRows = []
    if (p.substationVoltage) stationRows.push(['升压站电压等级', p.substationVoltage])
  
    const transformerCap = extractMainTransformerCapacity(p.mainTransformerParam)
    if (transformerCap) stationRows.push(['主变容量', transformerCap])
  
    if (p.lineLayingMethod) stationRows.push(['集电线路敷设方式', p.lineLayingMethod])
  
    const accessName = extractAccessStationName(p.accessStation)
    if (accessName) stationRows.push(['接入站', accessName])
  
    // 接入距离 / 永久征地面积：接口没有，整行不渲染
  
    return [
      { title: '规划情况', icon: 'default', rows: planRows },
      { title: '升压站及接入信息', icon: 'bolt', rows: stationRows },
    ]
  }
  
  function buildSubTabs(p, parsed, center, windTable, geoFiles) {
    const centerStr = center
      ? `${center[0].toFixed(6)},${center[1].toFixed(6)}`
      : ''
  
    // —— 1. 风机坐标 ——
    const windRows = windTable
      .filter((w) => !['MAX', 'MIN', '平均'].includes(w.label))
      .map((w) => [
        w.label ?? '-',
        w.x ?? '-',
        w.y ?? '-',
        w.avgWindSpeed ?? '-',
        w.yearPower ?? '-',
      ])
    const windTab = {
      key: 'wind',
      label: '风机坐标',
      blocks: [
        {
          type: 'table',
          columns: ['风机编号', 'X坐标', 'Y坐标', '平均风速(m/s)', '年发电量(万kWh)'],
          rows: windRows,
        },
      ],
    }
  
    // —— 2. 升压站 ——
    const corners = (parsed.coordinate || []).map((c) => [
      c.longitude ?? '-',
      c.latitude ?? '-',
    ])
    const stationBlocks = []
    if (p.substationVoltage) {
      stationBlocks.push({ type: 'text', label: '升压站电压等级', value: p.substationVoltage })
    }
    if (centerStr) {
      stationBlocks.push({ type: 'text', label: '升压站中心点', value: centerStr })
    }
    if (corners.length) {
      stationBlocks.push({
        type: 'table',
        title: '升压站拐点坐标：',
        columns: ['经度', '纬度'],
        rows: corners,
      })
    }
    const stationTab = { key: 'station', label: '升压站', blocks: stationBlocks }
  
    // —— 3. 接入站 ——
    const accessTab = {
      key: 'access',
      label: '接入站',
      blocks: [
        { type: 'text', label: '接入站名称', value: extractAccessStationName(p.accessStation) || '暂无数据' },
        { type: 'text', label: '接入站中心点', value: centerStr || '暂无数据' },
        { type: 'text', label: '可接入电压', value: '——' },
        { type: 'text', label: '可接入容量', value: '——' },
      ],
    }
  
    // —— 4. 道路数据 ——
    const roadFiles = filterGeoFiles(geoFiles, ['道路', 'road'])
    const newFieldLen = extractSingleLength(p.newRoadInfo, /新建场内道路长约([\d.]+)\s*km/)
    const newEntryLen = extractSingleLength(p.entryRoadInfo, /长([\d.]+)\s*km/)
    const expandLen = extractSingleLength(p.expandRoadInfo, /长约([\d.]+)\s*km/)
  
    const roadBlocks = []
    if (newFieldLen != null) roadBlocks.push({ type: 'text', label: '新建场内道路长度', value: `${newFieldLen}km` })
    if (newEntryLen != null) roadBlocks.push({ type: 'text', label: '新建进站道路长度', value: `${newEntryLen}km` })
    if (expandLen != null) roadBlocks.push({ type: 'text', label: '扩建道路长度', value: `${expandLen}km` })
    roadFiles.forEach((f) => {
      roadBlocks.push({ type: 'file', label: '道路文件', name: f.fileName, url: f.url || f.filePath })
    })
    const roadTab = { key: 'road', label: '道路数据', blocks: roadBlocks }
  
    // —— 5. 线路数据 ——
    const lineFiles = filterGeoFiles(geoFiles, ['线路', 'line'])
    const loopCount = extractLoopCount(p.lineLoopDesc)
    const loopItems = extractLoopItems(p.lineLoopDesc)
  
    const lineBlocks = []
    if (p.lineLayingMethod) {
      lineBlocks.push({ type: 'text', label: '线路敷设方式', value: p.lineLayingMethod })
    }
    if (loopCount != null) {
      lineBlocks.push({ type: 'text', label: '回路数', value: String(loopCount) })
    }
    if (loopItems.length) {
      lineBlocks.push({ type: 'indent', lines: loopItems })
    }
    lineFiles.forEach((f) => {
      lineBlocks.push({ type: 'file', label: '线路文件', name: f.fileName, url: f.url || f.filePath })
    })
    const lineTab = { key: 'line', label: '线路数据', blocks: lineBlocks }
  
    return [windTab, stationTab, accessTab, roadTab, lineTab]
  }
  
  // ---------- 主入口 ----------
  export function buildMainInfoFromAi(aiData) {
    const p = aiData?.reportParamResult || {}
    const parsed = parseSubstationCoord(p.substationCoord)
    const center = getCoordCenter(parsed.coordinate)
    const windTable = safeParseJson(p.projectWindPowerFarmPowerTableData) || []
    // ⭐ geoFiles 在 reportParamResult 下，不在顶层
    const geoFiles = Array.isArray(p?.geoFiles) ? p.geoFiles : []
  
    return {
      timeline: buildTimeline(aiData?.stageTimeList),
      metrics: buildMetrics(p),
      planCards: buildPlanCards(p),
      subTabs: buildSubTabs(p, parsed, center, windTable, geoFiles),
    }
  }