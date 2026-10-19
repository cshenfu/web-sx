<!--
  计算项目 Tab
  路径: src/pages/financeEval/create/tabs/CalculationTab.vue
-->
<template>
  <div class="calc-tab">
    <!-- 未计算时的空状态 -->
    <div v-if="!hasData" class="calc-empty">
      <div class="empty-icon">📊</div>
      <p class="empty-text">点击「计算项目」Tab 触发计算，结果将在此展示</p>
    </div>

    <template v-else>
      <!-- Tab 导航 -->
      <div class="calc-nav">
        <button
          v-for="tab in REPORT_TABS"
          :key="tab.key"
          :class="['nav-btn', { active: activeKey === tab.key }]"
          @click="activeKey = tab.key"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- 财务指标汇总表（无年份，简单格式） -->
      <div v-if="activeKey === 'summary'" class="calc-table-wrap">
        <a-table
          :columns="SUMMARY_COLUMNS"
          :data-source="summaryTableData"
          :pagination="false"
          :scroll="{ y: 'calc(80vh - 180px)' }"
          row-key="seq"
          size="middle"
          bordered
        >
          <template #title>
            <div class="table-main-title">财务指标汇总表</div>
          </template>
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'index'">{{ record.seq }}</template>
          </template>
        </a-table>
      </div>

      <!-- 敏感性分析表（独立格式，无年份列） -->
      <div v-else-if="activeKey === 'sensitivity'" class="calc-table-wrap">
        <a-table
          :columns="SENSITIVITY_COLUMNS"
          :data-source="sensitivityData"
          :pagination="false"
          :scroll="{ x: 'max-content', y: 'calc(80vh - 180px)' }"
          row-key="key"
          size="middle"
          bordered
        >
          <template #title>
            <div class="table-main-title">敏感性分析表</div>
          </template>
        </a-table>
      </div>

      <!-- 带年份的表格（其余所有 Tab） -->
      <div v-else class="calc-table-wrap year-table-wrap">
        <div class="table-unit-hint">人民币单位：万元</div>
        <a-table
          :columns="YEAR_COLUMNS"
          :data-source="currentYearTableData"
          :pagination="false"
          :scroll="{ x: 'max-content', y: 'calc(80vh - 180px)' }"
          row-key="key"
          size="middle"
          bordered
        >
          <template #bodyCell="{ column, record, index }">
            <template v-if="column.key === 'index'">{{ index + 1 }}</template>
            <template v-else-if="column.key === 'total'">{{ fmt(record.total) }}</template>
            <template v-else-if="column.dataIndex && /^year\d+$/.test(column.dataIndex)">
              {{ fmt(record[column.dataIndex]) }}
            </template>
          </template>
        </a-table>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

defineEmits(['download', 'preview'])

const props = defineProps({
  result: { type: Object, default: null },
})

const hasData = computed(() => !!props.result)

// ── Tab 定义 ────────────────────────────────────────────────
const REPORT_TABS = [
  { key: 'summary',      label: '财务指标汇总表'     },
  { key: 'totalCost',    label: '总成本费用表'       },
  { key: 'debtService',  label: '还本付息表'         },
  { key: 'profit',       label: '利润表'             },
  { key: 'interestRate', label: '利税表'             },
  { key: 'cashPlan',     label: '财务计划现金流量表' },
  { key: 'cashInvest',   label: '投资现金流量表'     },
  { key: 'cashCapital',  label: '资本金现金流量表'   },
  { key: 'balance',      label: '资产负债表'         },
  { key: 'sensitivity',  label: '敏感性分析表'       },
]

const activeKey = ref('summary')

// ── 格式化工具 ───────────────────────────────────────────────
function fmt(val) {
  if (val === null || val === undefined || val === '') return '—'
  const n = Number(val)
  if (isNaN(n)) return String(val)
  if (n === 0) return ''          // ← 新增：数值为 0 时不显示
  return n.toFixed(2)
}

/** 把 [{year, data}] 转成 { 1: v, 2: v, ... } */
function listToMap(list) {
  const map = {}
  if (Array.isArray(list)) list.forEach(item => { map[item.year] = item.data })
  return map
}

/**
 * 构造一条年份行
 * @param {string} key     唯一 key
 * @param {string} name    行名（支持前缀空格缩进）
 * @param {string} unit    单位
 * @param {*}      total   合计（DTO 中的标量字段）
 * @param {Array}  list    [{year, data}] 按年数据
 */
function buildRow(key, name, unit, total, list) {
  const m = listToMap(list)
  const row = { key, name, unit, total }
  for (let y = 1; y <= 21; y++) row[`year${y}`] = m[y] ?? null
  return row
}

// ── 敏感性分析表列定义 ──────────────────────────────────────────
const SENSITIVITY_COLUMNS = [
  { title: '方案类型',                            dataIndex: 'typeName',      key: 'typeName',      width: 180, fixed: 'left' },
  { title: '变化幅度',                            dataIndex: 'changeRateFmt', key: 'changeRateFmt', width: 100, align: 'center' },
  { title: '数值',                                dataIndex: 'adjustedValue', key: 'adjustedValue', width: 140, align: 'right' },
  { title: '项目投资财务内部收益率(所得税前)(%)', dataIndex: 'irrBeforeTax',  key: 'irrBeforeTax',  width: 220, align: 'right' },
  { title: '项目投资财务内部收益率(所得税后)(%)', dataIndex: 'irrAfterTax',   key: 'irrAfterTax',   width: 220, align: 'right' },
  { title: '资本金财务内部收益率(%)',             dataIndex: 'capitalIrr',    key: 'capitalIrr',    width: 180, align: 'right' },
]

function sensitivityTypeName(type) {
  switch (type) {
    case 1: return '项目总投资(万元)'
    case 2: return '年平均电量(MWh)'
    case 3: return '各年电价(元/KWh)'
    default: return '其他方案'
  }
}

// ── 汇总表列定义 ─────────────────────────────────────────────
const SUMMARY_COLUMNS = [
  { title: '序号', key: 'index',  dataIndex: 'seq',   width: 70,  align: 'center' },
  { title: '名称', key: 'name',   dataIndex: 'name'                               },
  { title: '单位', key: 'unit',   dataIndex: 'unit',  width: 110, align: 'center' },
  { title: '数值', key: 'value',  dataIndex: 'value', width: 200, align: 'right'  },
]

// ── 年份表列定义（公共，建设期固定，运营期可滚动）────────────
const YEAR_COLUMNS = [
  { title: '序号', key: 'index',                   fixed: 'left', width: 60,  align: 'center' },
  { title: '项目', key: 'name',  dataIndex: 'name', fixed: 'left', width: 200               },
  { title: '单位', key: 'unit',  dataIndex: 'unit', fixed: 'left', width: 80,  align: 'center' },
  { title: '合计', key: 'total', dataIndex: 'total', fixed: 'left', width: 130, align: 'right'  },
  {
    title: '建设期',
    children: [
      { title: '第1年', dataIndex: 'year1', key: 'year1', width: 120, align: 'right' },
    ],
  },
  {
    title: '运营期',
    children: Array.from({ length: 20 }, (_, i) => ({
      title: `第${i + 2}年`,
      dataIndex: `year${i + 2}`,
      key: `year${i + 2}`,
      width: 120,
      align: 'right',
    })),
  },
]

// ── 财务指标汇总表数据 ───────────────────────────────────────
const summaryTableData = computed(() => {
  const d = props.result?.financialSummaryRespDTO
  if (!d) return []
  return [
    { seq: 1,  name: '装机容量',                          unit: 'MW',      value: fmt(d.installedCapacity) },
    { seq: 2,  name: '年均上网电量',                      unit: 'MWh',     value: fmt(d.averageAnnualElectricitySales) },
    { seq: 3,  name: '总投资',                            unit: '万元',    value: fmt(d.totalInvestment) },
    { seq: 4,  name: '建设期利息',                        unit: '万元',    value: fmt(d.constructionPeriodInterest) },
    { seq: 5,  name: '流动资金',                          unit: '万元',    value: fmt(d.workingCapital) },
    { seq: 6,  name: '销售收入总额（不含增值税）',        unit: '万元',    value: fmt(d.totalSalesRevenueWithoutVAT) },
    { seq: 7,  name: '总成本费用',                        unit: '万元',    value: fmt(d.totalCost) },
    { seq: 8,  name: '销售税金附加总额',                  unit: '万元',    value: fmt(d.totalSalesTaxAndSurcharge) },
    { seq: 9,  name: '发电利润总额',                      unit: '万元',    value: fmt(d.totalPowerGenerationProfit) },
    { seq: 10, name: '经营期平均电价（不含增值税）',      unit: '元/kWh',  value: fmt(d.averageElectricityPriceWithoutVAT) },
    { seq: 11, name: '经营期平均电价（含增值税）',        unit: '元/kWh',  value: fmt(d.averageElectricityPriceWithVAT) },
    { seq: 12, name: '投资回收期（所得税前）',            unit: '年',      value: fmt(d.paybackPeriodBeforeTax) },
    { seq: 13, name: '投资回收期（所得税后）',            unit: '年',      value: fmt(d.paybackPeriodAfterTax) },
    { seq: 14, name: '全部投资内部收益率（所得税前）',    unit: '%',       value: fmt(d.irrBeforeTax) },
    { seq: 15, name: '全部投资内部收益率（所得税后）',    unit: '%',       value: fmt(d.irrAfterTax) },
    { seq: 16, name: '全部投资财务净现值（所得税前）',    unit: '万元',    value: fmt(d.npvBeforeTax) },
    { seq: 17, name: '全部投资财务净现值（所得税后）',    unit: '万元',    value: fmt(d.npvAfterTax) },
    { seq: 18, name: '资本金内部收益率',                  unit: '%',       value: fmt(d.equityIrr) },
    { seq: 19, name: '资本金财务净现值',                  unit: '万元',    value: fmt(d.equityNpv) },
    { seq: 20, name: '总投资收益率（ROI）',               unit: '%',       value: fmt(d.roi) },
    { seq: 21, name: '投资利税率',                        unit: '%',       value: fmt(d.profitTaxRatio) },
    { seq: 22, name: '项目资本金净利润率（ROE）',         unit: '%',       value: fmt(d.roe) },
    { seq: 23, name: '资产负债率',                        unit: '%',       value: fmt(d.assetLiabilityRatio) },
    { seq: 24, name: '盈亏平衡点（生产能力利用率）',      unit: '%',       value: fmt(d.breakevenCapacityUtilization) },
    { seq: 25, name: '盈亏平衡点（年产量）',              unit: 'MWh',     value: fmt(d.breakevenAnnualOutput) },
    { seq: 26, name: '经济增加值（EVA）（全周期平均）',   unit: '万元',    value: fmt(d.eva) },
  ]
})

// ── 总成本费用表数据 ─────────────────────────────────────────
const totalCostData = computed(() => {
  const d = props.result?.totalCostRespDTO
  if (!d) return []
  return [
    buildRow('depreciation',        '折旧',         '万元', d.depreciation,       d.depreciationList),
    buildRow('maintenanceFee',      '维修费',       '万元', d.maintenanceFee,      d.maintenanceFeeList),
    buildRow('wagesAndBenefits',    '工资和福利',   '万元', d.wagesAndBenefits,    d.wagesAndBenefitsList),
    buildRow('insuranceFee',        '保险费',       '万元', d.insuranceFee,        d.insuranceFeeList),
    buildRow('materialCost',        '材料费',       '万元', d.materialCost,        d.materialCostList),
    buildRow('amortizationFee',     '摊销费',       '万元', d.amortizationFee,     d.amortizationFeeList),
    buildRow('interestExpense',     '利息支出',     '万元', d.interestExpense,     d.interestExpenseList),
    buildRow('otherExpenses',       '其他费用',     '万元', d.otherExpenses,       d.otherExpensesList),
    buildRow('landLeaseFee',        '租地费',       '万元', d.landLeaseFee,        d.landLeaseFeeList),
    buildRow('otherAnnualExpenses', '其他逐年支出', '万元', d.otherAnnualExpenses, d.otherAnnualExpensesList),
    buildRow('operatingCost',       '经营成本',     '万元', d.operatingCost,       d.operatingCostList),
    buildRow('fixedCost',           '固定成本',     '万元', d.fixedCost,           d.fixedCostList),
    buildRow('variableCost',        '可变成本',     '万元', d.variableCost,        d.variableCostList),
    buildRow('totalCost',           '总成本费用',   '万元', d.totalCost,           d.totalCostList),
  ]
})

// ── 还本付息表数据 ───────────────────────────────────────────
const debtServiceData = computed(() => {
  const d = props.result?.loanRepaymentRespDTO
  if (!d) return []
  return [
    buildRow('longTermLoan',    '长期借款（项目建设贷款）',   '万元', d.longTermLoan,                          d.longTermLoanList),
    buildRow('beginLong',       '  长期-期初借款余额',        '万元', d.beginningLoanBalanceLong,              d.beginningLoanBalanceLongList),
    buildRow('piLong',          '  长期-当期还本付息',        '万元', d.currentPrincipalAndInterestPaymentLong, d.currentPrincipalAndInterestPaymentLongList),
    buildRow('principalLong',   '  长期-当期还本',            '万元', d.currentPrincipalRepaymentLong,         d.currentPrincipalRepaymentLongList),
    buildRow('interestLong',    '  长期-当期付息',            '万元', d.currentInterestPaymentLong,            d.currentInterestPaymentLongList),
    buildRow('endLong',         '  长期-期末借款余额',        '万元', d.endingLoanBalanceLong,                 d.endingLoanBalanceLongList),
    buildRow('workCapLoan',     '流动资金借款',               '万元', d.workingCapitalLoan,                    d.workingCapitalLoanList),
    buildRow('beginFlow',       '  流动-期初借款余额',        '万元', d.beginningLoanBalanceFlow,              d.beginningLoanBalanceFlowList),
    buildRow('piFlow',          '  流动-当期还本付息',        '万元', d.currentPrincipalAndInterestPaymentFlow, d.currentPrincipalAndInterestPaymentFlowList),
    buildRow('principalFlow',   '  流动-当期还本',            '万元', d.currentPrincipalRepaymentFlow,         d.currentPrincipalRepaymentFlowList),
    buildRow('interestFlow',    '  流动-当期付息',            '万元', d.currentInterestPaymentFlow,            d.currentInterestPaymentFlowList),
    buildRow('endFlow',         '  流动-期末借款余额',        '万元', d.endingLoanBalanceFlow,                 d.endingLoanBalanceFlowList),
    buildRow('shortLoan',       '短期借款',                   '万元', d.shortTermLoan,                         d.shortTermLoanList),
    buildRow('beginShort',      '  短期-期初借款余额',        '万元', d.beginningLoanBalanceShort,             d.beginningLoanBalanceShortList),
    buildRow('piShort',         '  短期-当期还本付息',        '万元', d.currentPrincipalAndInterestPaymentShort, d.currentPrincipalAndInterestPaymentShortList),
    buildRow('principalShort',  '  短期-当期还本',            '万元', d.currentPrincipalRepaymentShort,        d.currentPrincipalRepaymentShortList),
    buildRow('interestShort',   '  短期-当期付息',            '万元', d.currentInterestPaymentShort,           d.currentInterestPaymentShortList),
    buildRow('endShort',        '  短期-期末借款余额',        '万元', d.endingLoanBalanceShort,                d.endingLoanBalanceShortList),
    buildRow('totalPrincipal',  '当期偿还本金合计',           '万元', d.totalPrincipalRepayment,               d.totalPrincipalRepaymentList),
    buildRow('totalInterest',   '当期偿还利息合计',           '万元', d.totalInterestRepayment,                d.totalInterestRepaymentList),
  ]
})

// ── 利润表数据 ───────────────────────────────────────────────
const profitData = computed(() => {
  const d = props.result?.profitRespDTO
  if (!d) return []
  return [
    buildRow('operatingRevenue',   '营业收入',                  '万元',   d.operatingRevenue,            d.operatingRevenueList),
    buildRow('electricitySales',   '  上网电量',                '万kWh',  d.electricitySales,            d.electricitySalesList),
    buildRow('elecPriceNoVAT',     '  电价（不含增值税）',      '元/kWh', d.electricityPriceWithoutVAT,  d.electricityPriceWithoutVATList),
    buildRow('elecPriceVAT',       '  电价（含增值税）',        '元/kWh', d.electricityPriceWithVAT,     d.electricityPriceWithVATList),
    buildRow('businessTax',        '营业税金及附加',            '万元',   d.businessTaxAndSurcharge,     d.businessTaxAndSurchargeList),
    buildRow('totalCost',          '总成本费用',                '万元',   d.totalCost,                   d.totalCostList),
    buildRow('taxableSubsidy',     '补贴收入（应税）',          '万元',   d.taxableSubsidyIncome,        d.taxableSubsidyIncomeList),
    buildRow('totalProfit',        '利润总额',                  '万元',   d.totalProfit,                 d.totalProfitList),
    buildRow('priorLoss',          '弥补以前年度亏损',          '万元',   d.priorYearLossCoverage,       d.priorYearLossCoverageList),
    buildRow('taxableIncome',      '应纳税所得额',              '万元',   d.taxableIncome,               d.taxableIncomeList),
    buildRow('incomeTax',          '所得税',                    '万元',   d.incomeTax,                   d.incomeTaxList),
    buildRow('taxRate',            '税率',                      '%',      d.taxRate,                     d.taxRateList),
    buildRow('taxFreeSubsidy',     '补贴收入（免税）',          '万元',   d.taxFreeSubsidyIncome,        d.taxFreeSubsidyIncomeList),
    buildRow('netProfit',          '净利润',                    '万元',   d.netProfit,                   d.netProfitList),
    buildRow('surplusReserve',     '提取法定盈余公积金',        '万元',   d.statutorySurplusReserve,     d.statutorySurplusReserveList),
    buildRow('distribProfit',      '可供投资者分配利润',        '万元',   d.distributableProfit,         d.distributableProfitList),
    buildRow('payableProfit',      '应付利润',                  '万元',   d.payableProfit,               d.payableProfitList),
    buildRow('retainedEarnings',   '未分配利润',                '万元',   d.retainedEarnings,            d.retainedEarningsList),
    buildRow('nopat',              '税后净营业利润',            '万元',   d.nopat,                       d.nopatList),
    buildRow('ebit',               '息税前利润',                '万元',   d.ebit,                        d.ebitList),
    buildRow('ebitda',             '息税折旧摊销前利润',        '万元',   d.ebitda,                      d.ebitdaList),
    buildRow('breakCapUtil',       '盈亏平衡点（生产能力利用率）', '%',   d.breakevenCapacityUtilization, d.breakevenCapacityUtilizationList),
    buildRow('breakOutput',        '盈亏平衡点（年产量）',      'MWh',    d.breakevenAnnualOutput,       d.breakevenAnnualOutputList),
  ]
})

// ── 利税表数据 ───────────────────────────────────────────────
const interestRateData = computed(() => {
  const d = props.result?.profitAndTaxRespDTO
  if (!d) return []
  return [
    buildRow('outputVAT',         '销项税',           '万元', d.outputVAT,               d.outputVATList),
    buildRow('deductibleVAT',     '可抵扣的进项税',   '万元', d.deductibleInputVAT,      d.deductibleInputVATList),
    buildRow('vatPreference',     '增值税优惠',       '万元', d.vatPreference,           d.vatPreferenceList),
    buildRow('payableVAT',        '应缴增值税',       '万元', d.payableVAT,              d.payableVATList),
    buildRow('actualPaidVAT',     '实缴增值税',       '万元', d.actualPaidVAT,           d.actualPaidVATList),
    buildRow('businessTax',       '营业税金及附加',   '万元', d.businessTaxAndSurcharge, d.businessTaxAndSurchargeList),
    buildRow('taxableSubsidy',    '补贴收入（应税）', '万元', d.taxableSubsidyIncome,    d.taxableSubsidyIncomeList),
    buildRow('govSubsidy',        '政府贴息',         '万元', d.governmentInterestSubsidy, d.governmentInterestSubsidyList),
    buildRow('totalSubsidy',      '补贴收入（全部）', '万元', d.totalSubsidyIncome,      d.totalSubsidyIncomeList),
    buildRow('incomeTax',         '企业所得税',       '万元', d.enterpriseIncomeTax,     d.enterpriseIncomeTaxList),
    buildRow('totalProfit',       '利润总额',         '万元', d.totalProfit,             d.totalProfitList),
    buildRow('totalProfitAndTax', '利税总额',         '万元', d.totalProfitAndTax,       d.totalProfitAndTaxList),
    buildRow('profitTaxRate',     '投资利税率',       '%',    d.investmentProfitTaxRate, d.investmentProfitTaxRateList),
  ]
})

// ── 财务计划现金流量表数据 ───────────────────────────────────
const cashPlanData = computed(() => {
  const d = props.result?.financialPlanCashFlowRespDTO
  if (!d) return []
  return [
    buildRow('opInflow',        '经营活动现金流入',                   '万元', d.operatingCashInflow,            d.operatingCashInflowList),
    buildRow('revenueCash',     '  营业收入现金流入',                 '万元', d.operatingRevenueCash,           d.operatingRevenueCashList),
    buildRow('outputVATCash',   '  增值税销项税额现金流入',           '万元', d.outputVATCash,                  d.outputVATCashList),
    buildRow('subsidyCash',     '  补贴收入现金流入',                 '万元', d.subsidyIncomeCash,              d.subsidyIncomeCashList),
    buildRow('otherOpInflow',   '  其他经营活动现金流入',             '万元', d.otherOperatingCashInflow,       d.otherOperatingCashInflowList),
    buildRow('opOutflow',       '经营活动现金流出',                   '万元', d.operatingCashOutflow,           d.operatingCashOutflowList),
    buildRow('opCostCash',      '  经营成本现金流出',                 '万元', d.operatingCostCash,              d.operatingCostCashList),
    buildRow('inputVATCash',    '  增值税进项税额现金流出',           '万元', d.inputVATCash,                   d.inputVATCashList),
    buildRow('bizTaxCash',      '  营业税金及附加现金流出',           '万元', d.businessTaxCash,                d.businessTaxCashList),
    buildRow('vatPayCash',      '  增值税现金流出',                   '万元', d.vatPaymentCash,                 d.vatPaymentCashList),
    buildRow('incomeTaxCash',   '  所得税现金流出',                   '万元', d.incomeTaxCash,                  d.incomeTaxCashList),
    buildRow('otherOpOutflow',  '  其他经营活动现金流出',             '万元', d.otherOperatingCashOutflow,      d.otherOperatingCashOutflowList),
    buildRow('opNetFlow',       '经营活动净现金流量',                 '万元', d.operatingActivitiesNetCashFlow, d.operatingActivitiesNetCashFlowList),
    buildRow('invInflow',       '投资活动现金流入',                   '万元', d.investingCashInflow,            d.investingCashInflowList),
    buildRow('invOutflow',      '投资活动现金流出',                   '万元', d.investingCashOutflow,           d.investingCashOutflowList),
    buildRow('constCash',       '  建设投资现金流出',                 '万元', d.constructionInvestmentCash,     d.constructionInvestmentCashList),
    buildRow('workCapCash',     '  流动资金现金流出',                 '万元', d.workingCapitalCash,             d.workingCapitalCashList),
    buildRow('maintCash',       '  维持运营投资现金流出',             '万元', d.maintenanceInvestmentCash,      d.maintenanceInvestmentCashList),
    buildRow('otherInvOut',     '  其他投资活动现金流出',             '万元', d.otherInvestingCashOutflow,      d.otherInvestingCashOutflowList),
    buildRow('invNetFlow',      '投资活动净现金流量',                 '万元', d.investingActivitiesNetCashFlow, d.investingActivitiesNetCashFlowList),
    buildRow('finInflow',       '筹资活动现金流入',                   '万元', d.financingCashInflow,            d.financingCashInflowList),
    buildRow('capInvCash',      '  项目资本金投入现金流入',           '万元', d.capitalInvestmentCash,          d.capitalInvestmentCashList),
    buildRow('constLoanCash',   '  建设投资借款现金流入',             '万元', d.constructionLoanCash,           d.constructionLoanCashList),
    buildRow('workLoanCash',    '  流动资金借款现金流入',             '万元', d.workingCapitalLoanCash,         d.workingCapitalLoanCashList),
    buildRow('stLoanCash',      '  短期借款现金流入',                 '万元', d.shortTermLoanCash,              d.shortTermLoanCashList),
    buildRow('bondCash',        '  债券筹资现金流入',                 '万元', d.bondFinancingCash,              d.bondFinancingCashList),
    buildRow('otherFinIn',      '  其他筹资活动现金流入',             '万元', d.otherFinancingCashInflow,       d.otherFinancingCashInflowList),
    buildRow('finOutflow',      '筹资活动现金流出',                   '万元', d.financingCashOutflow,           d.financingCashOutflowList),
    buildRow('debtRepay',       '  偿还债务本金现金流出',             '万元', d.debtRepaymentCash,              d.debtRepaymentCashList),
    buildRow('ltLoanRepay',     '  偿还长期借款本金现金流出',         '万元', d.longTermLoanRepaymentCash,      d.longTermLoanRepaymentCashList),
    buildRow('workRepay',       '  偿还流动资金本金现金流出',         '万元', d.workingCapitalRepaymentCash,    d.workingCapitalRepaymentCashList),
    buildRow('stLoanRepay',     '  偿还短期借款本金现金流出',         '万元', d.shortTermLoanRepaymentCash,     d.shortTermLoanRepaymentCashList),
    buildRow('ltInterest',      '  长期借款利息现金流出',             '万元', d.longTermLoanInterestCash,       d.longTermLoanInterestCashList),
    buildRow('stInterest',      '  短期借款利息现金流出',             '万元', d.shortTermLoanInterestCash,      d.shortTermLoanInterestCashList),
    buildRow('workInterest',    '  流动资金借款利息现金流出',         '万元', d.workingCapitalLoanInterestCash, d.workingCapitalLoanInterestCashList),
    buildRow('interestPay',     '  利息支出现金流出',                 '万元', d.interestPaymentCash,            d.interestPaymentCashList),
    buildRow('dividendCash',    '  应付利润（股利分配）现金流出',     '万元', d.dividendPaymentCash,            d.dividendPaymentCashList),
    buildRow('otherFinOut',     '  其他筹资活动现金流出',             '万元', d.otherFinancingCashOutflow,      d.otherFinancingCashOutflowList),
    buildRow('finNetFlow',      '筹资活动净现金流量',                 '万元', d.financingActivitiesNetCashFlow, d.financingActivitiesNetCashFlowList),
    buildRow('netCashFlow',     '净现金流量',                         '万元', d.netCashFlow,                    d.netCashFlowList),
    buildRow('accumSurplus',    '累计盈余资金',                       '万元', d.accumulatedSurplusFund,         d.accumulatedSurplusFundList),
  ]
})

// ── 投资现金流量表数据 ───────────────────────────────────────
const cashInvestData = computed(() => {
  const d = props.result?.investmentCashFlowRespDTO
  if (!d) return []
  return [
    buildRow('cashInflow',      '现金流入',                   '万元', d.cashInflow,                    d.cashInflowList),
    buildRow('revenueInflow',   '  营业收入现金流入',         '万元', d.operatingRevenueInflow,        d.operatingRevenueInflowList),
    buildRow('subsidyInflow',   '  补贴收入现金流入',         '万元', d.subsidyIncomeInflow,           d.subsidyIncomeInflowList),
    buildRow('residualInflow',  '  回收固定资产余值现金流入', '万元', d.fixedAssetsResidualInflow,     d.fixedAssetsResidualInflowList),
    buildRow('workCapRecovery', '  回收流动资金现金流入',     '万元', d.workingCapitalRecoveryInflow,  d.workingCapitalRecoveryInflowList),
    buildRow('cashOutflow',     '现金流出',                   '万元', d.cashOutflow,                   d.cashOutflowList),
    buildRow('constOutflow',    '  建设投资现金流出',         '万元', d.constructionInvestmentOutflow, d.constructionInvestmentOutflowList),
    buildRow('workCapOutflow',  '  流动资金现金流出',         '万元', d.workingCapitalOutflow,         d.workingCapitalOutflowList),
    buildRow('opCostOutflow',   '  经营成本现金流出',         '万元', d.operatingCostOutflow,          d.operatingCostOutflowList),
    buildRow('bizTaxOutflow',   '  营业税金及附加现金流出',   '万元', d.businessTaxOutflow,            d.businessTaxOutflowList),
    buildRow('maintOutflow',    '  维持运营投资现金流出',     '万元', d.maintenanceInvestmentOutflow,  d.maintenanceInvestmentOutflowList),
    buildRow('adjustedTax',     '  调整所得税',               '万元', d.adjustedIncomeTax,             d.adjustedIncomeTaxList),
    buildRow('preTaxFlow',      '所得税前净现金流量',         '万元', d.preTaxNetCashFlow,             d.preTaxNetCashFlowList),
    buildRow('accumPreTax',     '累计所得税前净现金流量',     '万元', d.cumulativePreTaxNetCashFlow,   d.cumulativePreTaxNetCashFlowList),
    buildRow('afterTaxFlow',    '所得税后净现金流量',         '万元', d.afterTaxNetCashFlow,           d.afterTaxNetCashFlowList),
    buildRow('accumAfterTax',   '累计所得税后净现金流量',     '万元', d.cumulativeAfterTaxNetCashFlow, d.cumulativeAfterTaxNetCashFlowList),
    buildRow('preTaxNPV',       '所得税前净现值',             '万元', d.preTaxNPV,                     d.preTaxNPVList),
    buildRow('afterTaxNPV',     '所得税后净现值',             '万元', d.afterTaxNPV,                   d.afterTaxNPVList),
    buildRow('preTaxIRR',       '投资内部收益率（所得税前）', '%',    d.preTaxIRR,                     d.preTaxIRRList),
    buildRow('afterTaxIRR',     '投资内部收益率（所得税后）', '%',    d.afterTaxIRR,                   d.afterTaxIRRList),
    buildRow('preTaxPayback',   '投资回收期（所得税前）',     '年',   d.preTaxPaybackPeriod,           d.preTaxPaybackPeriodList),
    buildRow('afterTaxPayback', '投资回收期（所得税后）',     '年',   d.afterTaxPaybackPeriod,         d.afterTaxPaybackPeriodList),
  ]
})

// ── 资本金现金流量表数据 ─────────────────────────────────────
const cashCapitalData = computed(() => {
  const d = props.result?.equityCashFlowRespDTO
  if (!d) return []
  return [
    buildRow('cashInflow',       '现金流入',                   '万元', d.cashInflow,                    d.cashInflowList),
    buildRow('revenueInflow',    '  营业收入现金流入',         '万元', d.operatingRevenueInflow,        d.operatingRevenueInflowList),
    buildRow('subsidyInflow',    '  补贴收入现金流入',         '万元', d.subsidyIncomeInflow,           d.subsidyIncomeInflowList),
    buildRow('residualInflow',   '  回收固定资产余值现金流入', '万元', d.fixedAssetsResidualInflow,     d.fixedAssetsResidualInflowList),
    buildRow('workCapRecovery',  '  回收流动资金现金流入',     '万元', d.workingCapitalRecoveryInflow,  d.workingCapitalRecoveryInflowList),
    buildRow('cashOutflow',      '现金流出',                   '万元', d.cashOutflow,                   d.cashOutflowList),
    buildRow('capitalOutflow',   '  项目资本金现金流出',       '万元', d.capitalCashOutflow,            d.capitalCashOutflowList),
    buildRow('loanPrincipal',    '  偿还借款本金',             '万元', d.loanPrincipalRepaymentOutflow, d.loanPrincipalRepaymentOutflowList),
    buildRow('loanInterest',     '  偿还借款利息',             '万元', d.loanInterestPaymentOutflow,    d.loanInterestPaymentOutflowList),
    buildRow('opCostOutflow',    '  经营成本现金流出',         '万元', d.operatingCostOutflow,          d.operatingCostOutflowList),
    buildRow('bizTaxOutflow',    '  营业税金及附加现金流出',   '万元', d.businessTaxOutflow,            d.businessTaxOutflowList),
    buildRow('incomeTaxOutflow', '  所得税现金流出',           '万元', d.incomeTaxOutflow,              d.incomeTaxOutflowList),
    buildRow('maintOutflow',     '  维持运营投资现金流出',     '万元', d.maintenanceInvestmentOutflow,  d.maintenanceInvestmentOutflowList),
    buildRow('netCashFlow',      '净现金流量',                 '万元', d.netCashFlow,                   d.netCashFlowList),
    buildRow('npv',              '净现值',                     '万元', d.npv,                           d.npvList),
    buildRow('capitalIrr',       '资本金内部收益率',           '%',    d.capitalIr,                     d.capitalIrList),
  ]
})

// ── 资产负债表数据 ───────────────────────────────────────────
const balanceData = computed(() => {
  const d = props.result?.assetsAndLiabilitiesRespDTO
  if (!d) return []
  return [
    buildRow('totalCurrentAssets', '流动资产总额',         '万元', d.totalCurrentAssets,             d.totalCurrentAssetsList),
    buildRow('currentAssets',      '  流动资产',           '万元', d.currentAssets,                  d.currentAssetsList),
    buildRow('accumSurplus',       '  累计盈余资金',       '万元', d.accumulatedSurplusFund,         d.accumulatedSurplusFundList),
    buildRow('constructInProg',    '在建工程',             '万元', d.constructionInProgress,         d.constructionInProgressList),
    buildRow('netFixedAssets',     '固定资产净值',         '万元', d.netFixedAssets,                 d.netFixedAssetsList),
    buildRow('netIntangible',      '无形及其他资产净值',   '万元', d.netIntangibleAndOtherAssets,    d.netIntangibleAndOtherAssetsList),
    buildRow('deductibleVAT',      '可抵扣增值税形成资产', '万元', d.deductibleVATAssets,            d.deductibleVATAssetsList),
    buildRow('totalAssets',        '资产总额',             '万元', d.totalAssets,                    d.totalAssetsList),
    buildRow('totalCurLiab',       '流动负债总额',         '万元', d.totalCurrentLiabilities,        d.totalCurrentLiabilitiesList),
    buildRow('stLoanCur',          '  本年短期借款',       '万元', d.currentYearShortTermLoan,       d.currentYearShortTermLoanList),
    buildRow('otherCurLiab',       '  其他流动负债',       '万元', d.otherCurrentLiabilities,        d.otherCurrentLiabilitiesList),
    buildRow('constInvLoan',       '建设投资借款',         '万元', d.constructionInvestmentLoan,     d.constructionInvestmentLoanList),
    buildRow('workCapLoan',        '流动资金借款',         '万元', d.workingCapitalLoan,             d.workingCapitalLoanList),
    buildRow('totalLiab',          '负债小计',             '万元', d.totalLiabilities,               d.totalLiabilitiesList),
    buildRow('totalEquity',        '所有者权益总额',       '万元', d.totalEquity,                    d.totalEquityList),
    buildRow('capital',            '  资本金',             '万元', d.capital,                        d.capitalList),
    buildRow('capitalReserve',     '  资本公积',           '万元', d.capitalReserve,                 d.capitalReserveList),
    buildRow('accumSurplusRes',    '  累计盈余公积金',     '万元', d.accumulatedSurplusReserve,      d.accumulatedSurplusReserveList),
    buildRow('accumUndistrib',     '  累计未分配利润',     '万元', d.accumulatedUndistributedProfits, d.accumulatedUndistributedProfitsList),
    buildRow('totalLiabEquity',    '负债及所有者权益总额', '万元', d.totalLiabilitiesAndEquity,      d.totalLiabilitiesAndEquityList),
    buildRow('balanceCheck',       '资产负债平衡',         '万元', d.balanceSheetBalance,            d.balanceSheetBalanceList),
    buildRow('liabRatio',          '资产负债率',           '%',    d.assetLiabilityRatio,            d.assetLiabilityRatioList),
  ]
})

// ── 敏感性分析表数据 ────────────────────────────────────────────
const sensitivityData = computed(() => {
  const list = props.result?.sensitivityAnalysisRespDTO?.sensitivityItemList
  if (!list || list.length === 0) return []
  return list.map((item, i) => ({
    key: i,
    typeName:      sensitivityTypeName(item.sensitivityType),
    changeRateFmt: item.changeRate === 0 ? '0%' : `${(item.changeRate * 100).toFixed(0)}%`,
    adjustedValue: fmt(item.adjustedValue),
    irrBeforeTax:  fmt(item.irrBeforeTax),
    irrAfterTax:   fmt(item.irrAfterTax),
    capitalIrr:    item.capitalIrr >= 999 ? '—' : fmt(item.capitalIrr),
  }))
})

// ── 当前 Tab 对应年份表数据 ──────────────────────────────────
const currentYearTableData = computed(() => {
  const map = {
    totalCost:    totalCostData.value,
    debtService:  debtServiceData.value,
    profit:       profitData.value,
    interestRate: interestRateData.value,
    cashPlan:     cashPlanData.value,
    cashInvest:   cashInvestData.value,
    cashCapital:  cashCapitalData.value,
    balance:      balanceData.value,
    sensitivity:   [],   // 单独处理，不走年份表
  }
  return map[activeKey.value] ?? []
})
</script>

<style scoped>
/* ── 空状态 ─────────────────────────────────────────────── */
.calc-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
  color: #aaa;
}
.empty-icon { font-size: 56px; margin-bottom: 16px; }
.empty-text { font-size: 15px; }

/* ── Tab 导航 ────────────────────────────────────────────── */
.calc-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 0;
  /* border-bottom: 2px solid #e8e8e8; */
  margin-bottom: 24px;
  justify-content: center;
}

.nav-btn {
  padding: 10px 18px;
  border: none;
  background: transparent;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  position: relative;
  white-space: nowrap;
  transition: color 0.2s;
  outline: none;
}

.nav-btn::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 100%;
  height: 2px;
  background: transparent;
  transition: background 0.2s;
}

.nav-btn:hover { color: #1677ff; }

.nav-btn.active {
  color: #1677ff;
  font-weight: 600;
}

.nav-btn.active::after { background: #1677ff; }

/* ── 汇总表标题 ──────────────────────────────────────────── */
.table-main-title {
  text-align: center;
  font-size: 15px;
  font-weight: 700;
  color: #222;
}

/* ── 年份表单位提示 ──────────────────────────────────────── */
.table-unit-hint {
  text-align: right;
  font-size: 13px;
  color: #666;
  margin-bottom: 6px;
}

/* ── 表格容器 ────────────────────────────────────────────── */
.calc-table-wrap {
  overflow-x: auto;
}

.year-table-wrap {
  /* 确保年份列可横向滚动而固定列不动 */
}

/* ── 表头浅灰色 ──────────────────────────────────────────── */
.calc-table-wrap :deep(.ant-table-thead > tr > th) {
  background: #f0f0f0 !important;
  color: #333;
  font-weight: 600;
  border-color: #d9d9d9;
  text-align: center;
}

.calc-table-wrap :deep(.ant-table-thead > tr > th::before) {
  background-color: #d9d9d9 !important;
}

/* ── 单元格文字居中 ──────────────────────────────────────── */
.calc-table-wrap :deep(.ant-table-tbody > tr > td) {
  text-align: center;
}

/* ── 固定列必须有实色背景，否则横向滚动时内容会透出来 ── */

/* 普通行固定列 → 白色 */
.calc-table-wrap :deep(td.ant-table-cell-fix-left),
.calc-table-wrap :deep(td.ant-table-cell-fix-right) {
  background: #fff !important;
}

/* 表头固定列 → 深灰（与表头一致） */
.calc-table-wrap :deep(th.ant-table-cell-fix-left),
.calc-table-wrap :deep(th.ant-table-cell-fix-right) {
  background: #4a4a4a !important;
}

/* 斑马纹 */
.calc-table-wrap :deep(.ant-table-tbody > tr:nth-child(even) > td) {
  background: #fafafa;
}

/* 偶数行固定列 → 斑马色（覆盖上面的 #fff） */
.calc-table-wrap :deep(.ant-table-tbody > tr:nth-child(even) > td.ant-table-cell-fix-left),
.calc-table-wrap :deep(.ant-table-tbody > tr:nth-child(even) > td.ant-table-cell-fix-right) {
  background: #fafafa !important;
}

/* 鼠标悬停行固定列同步高亮 */
.calc-table-wrap :deep(.ant-table-tbody > tr:hover > td.ant-table-cell-fix-left),
.calc-table-wrap :deep(.ant-table-tbody > tr:hover > td.ant-table-cell-fix-right) {
  background: #e6f4ff !important;
}
</style>
