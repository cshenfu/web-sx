import * as XLSX from 'xlsx'

const DATE_KEYS = ['日期', '时间', '统计日期', '月份', '年月', 'date', 'datetime', 'timestamp', 'time']
const YEAR_KEYS = ['年份', '年度', '年', 'year']
const MONTH_KEYS = ['月份', '月', 'month']
const INVESTMENT_KEYS = ['投资决策', '投资决策列']
const HEADER_SCAN_ROWS = 12

const text = value => String(value ?? '').replace(/\\s+/g, '').trim()
const isEmpty = value => value === null || value === undefined || text(value) === ''

function rowsFromWorkbook(workbook) {
  return (workbook.SheetNames || []).map(name => ({
    name,
    rows: XLSX.utils.sheet_to_json(workbook.Sheets[name], { header: 1, defval: '', raw: false })
      .filter(row => row.some(cell => !isEmpty(cell))),
  }))
}

function findHeader(rows, candidates = []) {
  for (let r = 0; r < Math.min(rows.length, HEADER_SCAN_ROWS); r++) {
    const cells = rows[r].map(text)
    const matched = candidates.some(key => cells.some(cell => cell.toLowerCase().includes(key.toLowerCase())))
    if (matched) return { index: r, cells }
  }
  return { index: -1, cells: [] }
}

function findColumn(headers, candidates) {
  return headers.findIndex(cell => candidates.some(key => text(cell).toLowerCase().includes(key.toLowerCase())))
}

function parseDate(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value
  if (typeof value === 'number' && value > 20000 && value < 80000) {
    const parsed = XLSX.SSF.parse_date_code(value)
    if (parsed) return new Date(parsed.y, parsed.m - 1, parsed.d)
  }
  const raw = text(value)
  if (!raw) return null
  const match = raw.match(/(\\d{4})[年./-]\\s*(\\d{1,2})(?:[月./-]\\s*(\\d{1,2}))?/)
  if (match) return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3] || 1))
  const date = new Date(raw)
  return Number.isNaN(date.getTime()) ? null : date
}

function monthKey(date) {
  return date ? date.getFullYear() * 100 + date.getMonth() + 1 : null
}

function dateValues(rows, headerIndex, headers) {
  const dateCol = findColumn(headers, DATE_KEYS)
  const yearCol = findColumn(headers, YEAR_KEYS)
  const monthCol = findColumn(headers, MONTH_KEYS)
  const dates = []
  for (const row of rows.slice(headerIndex + 1)) {
    let date = dateCol >= 0 ? parseDate(row[dateCol]) : null
    if (!date && yearCol >= 0 && monthCol >= 0) {
      const year = Number(row[yearCol])
      const month = Number(String(row[monthCol] ?? '').replace(/[^0-9]/g, ''))
      if (year > 1900 && month >= 1 && month <= 12) date = new Date(year, month - 1, 1)
    }
    if (date) dates.push(date)
  }
  return dates
}

function allDataRows(rows, headerIndex) {
  return rows.slice(Math.max(headerIndex + 1, 1)).filter(row => row.some(cell => !isEmpty(cell)))
}

function result(errors = [], warnings = []) {
  return { valid: errors.length === 0, errors, warnings, message: errors[0] || warnings[0] || '校验通过' }
}

export async function readExcel(file) {
  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: true })
  if (!workbook.SheetNames?.length) throw new Error('未发现工作表')
  return { workbook, sheets: rowsFromWorkbook(workbook) }
}

export async function validatePostEvaluationFile(key, file, context = {}) {
  let parsed
  try {
    parsed = await readExcel(file)
  } catch (error) {
    return result(['Excel 文件无法读取，请检查文件是否损坏或格式是否正确'])
  }
  const { sheets } = parsed
  const allRows = sheets.flatMap(sheet => sheet.rows)
  if (!allRows.some(row => row.some(cell => !isEmpty(cell)))) return result(['文件没有有效数据'])

  if (key === 'completionSettlement') {
    const rows = allRows
    const content = rows.flat().map(text)
    const required = ['序号', '项目名称', '批准概算', '竣工结算']
    const missing = required.filter(label => !content.some(cell => cell.includes(label)))
    const summarySheet = sheets.find(sheet => /总结算/.test(sheet.name)) || sheets.find(sheet => sheet.rows.flat().some(cell => text(cell).includes('总结算表')))
    if (!summarySheet) missing.unshift('总结算表')
    if (missing.length) return result([`竣工结算报告缺少：${[...new Set(missing)].join('、')}`])
    return result()
  }

  if (key === 'intervalGeneration') {
    const candidates = sheets.map(sheet => {
      const header = findHeader(sheet.rows, [...DATE_KEYS, ...YEAR_KEYS])
      return { ...sheet, header }
    }).find(item => item.header.index >= 0)
    if (!candidates) return result(['未识别到日期/年月列，请检查表头'])
    const dates = dateValues(candidates.rows, candidates.header.index, candidates.header.cells)
    const months = [...new Set(dates.map(monthKey).filter(Boolean))].sort((a,b)=>a-b)
    if (months.length < 12) return result([`场区月发电量至少需要连续12个月，目前识别到 ${months.length} 个月`])
    for (let i=1;i<months.length;i++) {
      const prevYear=Math.floor(months[i-1]/100), prevMonth=months[i-1]%100
      const expected=(prevYear+(prevMonth===12?1:0))*100+(prevMonth===12?1:prevMonth+1)
      if (months[i]!==expected) return result(['场区月发电量月份不连续，请补齐缺失月份'])
    }
    const gridDateRaw = context.fullCapacityGridDate
    if (!gridDateRaw) return result([], ['尚未获取项目全容量并网日期，暂跳过开始日期校验'])
    const gridDate = parseDate(gridDateRaw)
    if (gridDate && dates.length && dates.reduce((min,d)=>d<min?d:min,dates[0]) < new Date(gridDate.getFullYear(),gridDate.getMonth(),gridDate.getDate())) {
      return result(['场区月发电量开始日期不能早于项目全容量并网日期'])
    }
    return result()
  }

  if (key === 'scadaCoordinate') {
    const sheet = sheets.find(item => item.rows.length > 1) || sheets[0]
    const header = findHeader(sheet.rows, ['风机编号', '机位编号', '编号'])
    const start = header.index >= 0 ? header.index + 1 : 1
    const rows = sheet.rows.slice(start).filter(row => row.some(cell => !isEmpty(cell)))
    if (!rows.length) return result(['坐标对照表没有风机数据'])
    const emptyRows = rows.filter(row => row.some(cell => isEmpty(cell)))
    if (emptyRows.length) return result([`坐标对照表存在 ${emptyRows.length} 行必填数据为空，请补全后重新上传`])
    return result()
  }

  if (['operationData','costComparison','financialBasicData'].includes(key)) {
    const sheet = sheets.find(item => item.rows.length > 1) || sheets[0]
    const header = findHeader(sheet.rows, [...INVESTMENT_KEYS, ...YEAR_KEYS, ...DATE_KEYS])
    if (header.index < 0) return result(['未识别到投资决策列及年度/日期表头，请检查模板'])
    const rows = allDataRows(sheet.rows, header.index)
    if (!rows.length) return result(['数据不能为空'])
    const investmentCol = findColumn(header.cells, INVESTMENT_KEYS)
    if (investmentCol < 0) return result(['缺少“投资决策”列'])
    if (!rows.some(row => !isEmpty(row[investmentCol]))) return result(['投资决策列不能全部为空'])
    const dates = dateValues(sheet.rows, header.index, header.cells)
    const years = [...new Set(dates.map(date => date.getFullYear()))]
    if (!years.length) return result(['未识别到年度数据'])
    const months = [...new Set(dates.map(monthKey))]
    if (months.length < 12) return result(['至少需要一个完整年度（12个月）的数据'])
    if (context.intervalMonths?.length) {
      const expected = new Set(context.intervalMonths)
      const mismatched = months.filter(month => !expected.has(month))
      if (mismatched.length) return result(['数据年度/月度范围与场区月发电量表不一致'])
    }
    return result()
  }

  if (key === 'loanInfo') {
    const sheet = sheets.find(item => item.rows.length > 1) || sheets[0]
    if (!sheet.rows.slice(1).some(row => row.some(cell => !isEmpty(cell)))) return result(['贷款信息至少需要一行有效数据'])
    return result()
  }

  if (key === 'capitalContribution' || key === 'dailyPowerFinance' || key === 'dailyPowerMarket') {
    const nonEmptyRows = allRows.filter(row => row.some(cell => !isEmpty(cell)))
    if (nonEmptyRows.length < 2) return result(['数据不能为空，至少需要一行有效数据'])
    return result()
  }

  return result()
}

export async function validateScadaFolder(files, coordinateFile, intervalMonths = []) {
  const errors = []
  const coordinateIds = new Set()
  if (!coordinateFile?.file) errors.push('请先上传 SCADA 风机坐标对照表')
  else {
    try {
      const { sheets } = await readExcel(coordinateFile.file)
      const sheet = sheets.find(item => item.rows.length > 1) || sheets[0]
      const header = findHeader(sheet.rows, ['风机编号', '机位编号', '编号'])
      const col = findColumn(header.cells, ['风机编号', '机位编号', '编号'])
      if (col < 0) errors.push('坐标对照表未识别到风机编号列')
      else sheet.rows.slice(header.index + 1).forEach(row => { if (!isEmpty(row[col])) coordinateIds.add(text(row[col])) })
    } catch { errors.push('坐标对照表无法读取') }
  }
  const scada = files.filter(item => /\\.(xlsx|xls|csv)$/i.test(item.name || item.file?.name || ''))
  if (!scada.length) errors.push('未选择有效的 SCADA 数据文件')
  const seen = new Set()
  for (const item of scada) {
    const name = item.name || item.file?.name || ''
    const id = name.replace(/\\.(xlsx|xls|csv)$/i, '')
    if (!id) errors.push(`文件名“${name}”无法识别风机编号`)
    if (seen.has(id)) errors.push(`风机编号“${id}”存在重复文件`)
    seen.add(id)
    if (coordinateIds.size && !coordinateIds.has(id)) errors.push(`风机“${id}”不在坐标对照表中`)
    if (item.inspectStatus !== 'success') errors.push(`${name}：${item.inspectMessage || '文件读取失败'}`)
    if (item.file && !/\\.csv$/i.test(name)) {
      try {
        const { sheets } = await readExcel(item.file)
        const rows = sheets.flatMap(sheet => sheet.rows)
        const header = findHeader(rows, DATE_KEYS)
        if (header.index < 0) errors.push(`${name}：未识别到时间列`)
        else {
          const dates = dateValues(rows, header.index, header.cells)
          if (!dates.length) errors.push(`${name}：没有有效时间数据`)
          else if (intervalMonths.length) {
            const actual = new Set(dates.map(monthKey))
            if (intervalMonths.some(month => !actual.has(month))) errors.push(`${name}：时间范围未覆盖场区月发电量周期`)
          }
        }
      } catch { errors.push(`${name}：Excel 内容读取失败`) }
    }
  }
  if (coordinateIds.size && seen.size !== coordinateIds.size) errors.push(`SCADA 文件数量（${seen.size}）与坐标表风机数量（${coordinateIds.size}）不一致`)
  return result(errors)
}
