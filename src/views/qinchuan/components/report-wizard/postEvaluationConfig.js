export const POST_EVALUATION_UPLOAD_KEYS = [
  'completionSettlement',
  'intervalGeneration',
  'scadaCoordinate',
  'capitalContribution',
  'operationData',
  'costComparison',
  'dailyPowerFinance',
  'dailyPowerMarket',
  'financialBasicData',
  'loanInfo',
]

export const POST_EVALUATION_TURBINE_MODELS = [
  { label: 'MySE 5.0-200', value: 'MySE 5.0-200', capacity: 5 },
  { label: 'MySE 6.25-220', value: 'MySE 6.25-220', capacity: 6.25 },
  { label: 'GW 6.7-220', value: 'GW 6.7-220', capacity: 6.7 },
]

export const POST_EVALUATION_SCADA_EXAMPLE_FILES = [
  'WTG-001_10min_SCADA.xlsx',
  'WTG-002_10min_SCADA.xlsx',
  'WTG-003_10min_SCADA.xlsx',
]

export const POST_EVALUATION_TEMPLATE_HINT = '支持 xlsx 格式数据'

/**
 * 后评价报告数据模板文件名（文件放置于 public/modelTemplate 目录）
 */
export const POST_EVALUATION_TEMPLATE_FILES = {
  completionSettlement: '竣工结算报告模板.xlsx',
  intervalGeneration: '区间发电量模板.xlsx',
  scadaCoordinate: 'SCADA风机坐标对照表模板.xlsx',
  capitalContribution: '项目资本金投入表模板.xlsx',
  operationData: '项目主要经营数据表模板.xlsx',
  costComparison: '项目总成本费用对比表模板.xlsx',
  dailyPowerFinance: '项目日电量电价表（财务报表）模板.xlsx',
  dailyPowerMarket: '项目日电量电价表（市场部）模板.xlsx',
  financialBasicData: '财务评价基础数据表模板.xlsx',
  loanInfo: '贷款信息模板.xlsx',
}
