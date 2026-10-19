// ─────────────────────────────────────────────────────────────────────────────
// types.js
// 路径: src/pages/financeEval/create/types.js
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 总年数 = 最大建设期(5年) + 运营期(20年)
 * 表格列数固定为 25，前 N 列为建设期（N 由 constructionYears 决定），剩余为运营期
 */
 export const TOTAL_YEARS = 21

 /**
  * paramCode 枚举 —— 系统预置行使用
  * key 与 initTableRow 的 id 一一对应
  */
 export const PARAM_CODE = {
   // ── 成本设置 ──────────────────────────────────────────────────────────────
   headcount:      'staff_number',       // 定员人数
   avgWage:        'salary',             // 人工年平均工资
   benefitRatio:   'benefits_insurance', // 福利及其他占比
   maintenance:    'maintenance_cost',   // 风电维修费
   insurance:      'insurance_rate',     // 风电保险费率
   material:       'material_cost',      // 风电材料费
   otherFee:       'other_expenses',     // 其他费用
   storageLease:   'land_rental',        // 储能租赁费
   batteryReplace: 'amortization',       // 电池更换费
   otherAnnual:    'other_annual',       // 其他费用1
 
   // ── 收入税金（逐年行） ─────────────────────────────────────────────────────
   operationRate:    'operation_rate',    // 投运率
   annualGridHours:  'utilization_hours', // 年上网小时数
   annualGridEnergy: 'connected_power',   // 年上网电量
   gridPrice:        'electricity_price', // 上网电价(含税)
 
   // ── 税率 / 财务参数（单值行） ──────────────────────────────────────────────
   incomeTaxRate:    'corporate_tax',         // 企业所得税税率
   longTermRate:     'long_term_rate',        // 长期贷款利率
   workingCapRate:   'working_capital_rate',  // 流动资金贷款利率
   capitalCostRate:  'cost_of_capital_rate',  // 资本成本率
   interestExpense:  'interest_expense',      // 利息支出
 }
 
 /**
  * 初始化一条表格行
  *
  * @param {string}      id        行唯一标识（系统预置行与 PARAM_CODE key 对应，自定义行用 'dynamic_<ts>'）
  * @param {string}      label     显示名称
  * @param {string}      unit      单位
  * @param {object}      options
  * @param {number|null} options.defaultValue         快速输入默认值，null 表示无预设
  * @param {string}      options.mode                 'quick'（快速输入）| 'annual'（逐年输入），默认 'quick'
  * @param {boolean}     options.isDynamic            是否可删除，默认 false
  * @param {boolean}     options.isSimpleInput        单值行（无年份列），默认 false
  * @param {boolean}     options.constructionReadOnly 建设期锁定显示 0，默认 true
  */
 export function initTableRow(id, label, unit, options = {}) {
   const {
     defaultValue = null,
     mode = 'quick',
     isDynamic = false,
     isSimpleInput = false,
     constructionReadOnly = true,
     originalLabel = null,
   } = options
 
   const yearValues = Array(TOTAL_YEARS).fill(null)
   if (mode === 'quick' && defaultValue !== null) {
     yearValues.fill(defaultValue)
   }
 
   return {
     id,
     label,
     unit,
     mode,
     quickValue: defaultValue,
     yearValues,
     isDynamic,
     isSimpleInput,
     constructionReadOnly,
     originalLabel, 
   }
 }
 