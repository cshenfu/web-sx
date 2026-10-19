// ─────────────────────────────────────────────────────────────────────────────
// types.js
// 路径: src/pages/financeEval/create/types.js
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 总年数 = 最大建设期(5年) + 运营期(20年)
 * 表格列数固定为 25，前 N 列为建设期（N 由 constructionYears 决定），剩余为运营期
 */
 export const TOTAL_YEARS = 25

 /**
  * paramCode 枚举 —— 系统预置行使用，待后端确认后替换为正式值
  * key 与 initTableRow 的 id 一一对应
  */
 export const PARAM_CODE = {
   // ── 成本设置 ──────────────────────────────────────────────────────────────
   headcount:      'staff_number',       // 定员人数
   avgWage:        'salary',             // 人工年平均工资
   benefitRatio:   'benefit_ratio',      // 福利及其他占比
   maintenance:    'maintenance_cost',   // 风电维修费
   insurance:      'insurance_rate',     // 风电保险率
   material:       'material_cost',      // 风电材料费
   otherFee:       'other_fee',          // 其他费用（初始系统预置行）
   storageLease:   'storage_lease',      // 储能租赁费
   batteryReplace: 'battery_replace',    // 电池更换费
 
   // ── 收入税金（逐年行） ─────────────────────────────────────────────────────
   operationRate:    'operation_rate',     // 投运率
   annualGridHours:  'annual_grid_hours',  // 年上网小时数
   annualGridEnergy: 'annual_grid_energy', // 年上网电量
   gridPrice:        'grid_price',         // 上网电价(含税)
   subsidyEnergy:    'subsidy_energy',     // 补贴年上网电量
   subsidyPrice:     'subsidy_price',      // 补贴电价(含税)
 }
 
 /**
  * 初始化一条表格行
  *
  * @param {string}      id        行唯一标识
  *                                  系统预置行 → PARAM_CODE 中的 key（如 'headcount'）
  *                                  用户自定义行 → 'dynamic_<timestamp>'（isCustom=1，paramCode=''）
  * @param {string}      label     显示名称
  * @param {string}      unit      默认单位
  * @param {object}      options   可选配置
  * @param {number|null} options.defaultValue      快速输入默认值，null 表示无预设
  * @param {string}      options.mode              'quick'（快速输入）| 'annual'（逐年输入），默认 'quick'
  * @param {boolean}     options.isDynamic         是否可删除，默认 false
  * @param {boolean}     options.isSimpleInput     是否为单值行（无年份列，如税率/持续年限），默认 false
  * @param {boolean}     options.constructionReadOnly 建设期是否锁定（UI 显示为 0），默认 true
  */
 export function initTableRow(id, label, unit, options = {}) {
   const {
     defaultValue = null,
     mode = 'quick',
     isDynamic = false,
     isSimpleInput = false,
     constructionReadOnly = true,
   } = options
 
   // yearValues 长度固定为 TOTAL_YEARS
   // 快速输入时：所有运营期位置预填 defaultValue（建设期位置由 buildParamDataList 强制置 0）
   // 逐年输入时：全部初始为 null，由用户逐格填写
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
   }
 }
 