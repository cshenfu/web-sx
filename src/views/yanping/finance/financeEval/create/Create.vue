<!--
  风电场项目财务评价 - 主页面
  路由: /financeEval/create
  文件位置: src/pages/financeEval/create/Create.vue
-->
<template>
  <div class="wfe-page">
    <!-- 顶部 -->
    <div class="wfe-header">
      <!-- <div class="wfe-header-left" /> -->
      <h2 class="wfe-title">风电场项目财务评价</h2>
      <div class="wfe-header-right">
        <!-- <a-button @click="handlePreview">
          <template #icon><span v-html="downloadIconSvg" class="btn-icon" /></template>
          预览下载
        </a-button> -->
        <a-button type="primary" v-if="hasProjectId" :loading="saving" @click="aginreport">重新生成报告</a-button>
        <a-button type="primary" v-if="activeTab !== 'calculation'" :loading="saving" @click="handleSave">保存项目</a-button>
      </div>
    </div>

    <!-- 主体 -->
    <div class="wfe-body">
      <!-- 左侧 Tab -->
      <nav class="wfe-sidebar">
        <button
          v-for="(tab, index) in TABS"
          :key="tab.key"
          type="button"
          :class="[
            'tab-btn',
            { active: activeTab === tab.key },
            { 'tab-error': tabErrors[tab.key] },
            { 'tab-loading': tab.key === 'calculation' && calculating }
          ]"
          :disabled="tab.key === 'calculation' && calculating"
          @click="handleTabClick(tab.key)"
        >
          <div class="tab-btn-inner">
            <!-- 图标圆圈 + 状态角标 -->
            <div class="tab-icon-wrap">
              <div class="tab-icon-circle">
                <span class="icon-svg" v-html="TAB_ICON_MAP[tab.key]" />
              </div>
              <!-- 填写中：三点图标 -->
              <span
                v-if="activeTab === tab.key"
                class="tab-status"
                v-html="STATUS_ACTIVE_SVG"
              />
              <!-- 已完成：对号图标 -->
              <span
                v-else-if="completedTabs[tab.key]"
                class="tab-status"
                v-html="STATUS_DONE_SVG"
              />
            </div>
            <!-- 步骤 + 名称 -->
            <div class="tab-text">
              <span class="tab-step">步骤{{ index + 1 }}</span>
              <span class="tab-name">
                <template v-if="tab.key === 'calculation' && calculating">计算中…</template>
                <template v-else>{{ tab.label }}</template>
              </span>
            </div>
          </div>
        </button>
      </nav>

      <!-- 右侧内容 -->
      <main class="wfe-content">
        <a-alert
          v-if="errorTabs.length > 0"
          type="error"
          class="error-banner"
          :message="`以下项目有必填项未完成：${errorTabs.join('、')}`"
          show-icon
          closable
          @close="clearErrors"
        />

        <!-- v-show 保持组件常驻，保证 validate() 可调用 -->
        <div v-show="activeTab === 'basicInfo'">
          <BasicInfoTab
            ref="basicInfoRef"
            v-model="basicInfo"
            @construction-period-change="constructionYears = $event"
          />
        </div>
        <div v-show="activeTab === 'investment'">
          <InvestmentTab ref="investmentRef" v-model="investment" />
        </div>
        <div v-show="activeTab === 'cost'">
          <CostTab v-model="costRows" :construction-years="constructionYears" />
        </div>
        <div v-show="activeTab === 'depreciation'">
          <DepreciationTab ref="depreciationRef" v-model="depreciation" />
        </div>
        <div v-show="activeTab === 'revenue'">
          <RevenueTab v-model="revenueRows" :construction-years="constructionYears" />
        </div>
        <div v-show="activeTab === 'calculation'">
          <CalculationTab
            :result="calcResult"
            @download="handleDownloadReport"
            @preview="handlePreview"
          />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import {
    ref,
    computed,
    onMounted,
    onUnmounted,
} from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { message } from 'ant-design-vue'

import BasicInfoTab    from './tabs/BasicInfoTab.vue'
import InvestmentTab   from './tabs/InvestmentTab.vue'
import CostTab         from './tabs/CostTab.vue'
import DepreciationTab from './tabs/DepreciationTab.vue'
import RevenueTab      from './tabs/RevenueTab.vue'
import CalculationTab  from './tabs/CalculationTab.vue'

import { TOTAL_YEARS, PARAM_CODE, initTableRow } from './types.js'
import { MENU_ICON_SVGS, STATUS_ACTIVE_SVG, STATUS_DONE_SVG } from './icons.js'
import { saveFinanceProject, getProjectIfnoByProjectid, comprehensiveFinanceData, getDefaultPricValue,againGeneReport } from '@/api/modules/pric.js'

const router = useRouter()
const route = useRoute()
const projectId = ref(null)


// 重新生成报告按钮显示控制
const hasProjectId = ref(false)

/**
 * 等待五环平台传递登录态
 */
/**
 * 等待五环平台传递登录态
 * 
 * 只有 URL 中带 origin=wh 时才执行跨平台登录态同步。
 * 普通从天同平台内部进入时，直接继续执行。
 * 增加 5 秒超时机制：如果父窗口没有响应，自动放行，避免页面卡死。
 */
 const waitForSessionStorage = () => {
    // 普通进入财务页面，不需要跨平台同步
    if (route.query.origin !== 'wh') {
        return Promise.resolve();
    }

    // 没有 opener，无法向五环平台请求数据
    if (!window.opener) {
        console.warn('财务页面没有找到来源窗口，跳过登录态同步');
        return Promise.resolve();
    }

    return new Promise((resolve) => {
        let finished = false;

        // 结束函数：清理监听器并 resolve
        const finish = () => {
            if (finished) return;
            finished = true;
            clearTimeout(timeoutId); // 清除超时定时器
            window.removeEventListener('message', handleSessionMessage);
            resolve();
        };

        // ✅ 超时机制：5秒后如果还没收到消息，自动放行
        const timeoutId = setTimeout(() => {
            console.warn('等待登录态超时（5s），继续执行');
            finish();
        }, 5000);

        // 消息处理函数
        const handleSessionMessage = (event) => {
            // 只接收打开当前页面的窗口发来的消息
            if (event.source !== window.opener) {
                return;
            }

            // 'weather' / 'wh' 是握手消息，不是真正的数据
            if (event.data === 'weather' || event.data === 'wh') {
                return;
            }

            // 尝试解析 JSON 数据
            let sessionStorageData;
            try {
                sessionStorageData = typeof event.data === 'string'
                    ? JSON.parse(event.data)
                    : event.data;
            } catch (error) {
                console.warn('财务页面收到的消息不是有效 JSON：', event.data);
                return;
            }

            // 校验数据格式
            if (!sessionStorageData || typeof sessionStorageData !== 'object') {
                return;
            }

            // 将收到的数据写入 sessionStorage
            Object.keys(sessionStorageData).forEach((key) => {
                sessionStorage.setItem(key, sessionStorageData[key] ?? '');
            });

            console.log('✅ 财务页面登录态同步完成');

            // 删除 URL 中的 origin 参数，避免重复触发
            const query = { ...route.query };
            delete query.origin;
            router.replace({
                path: route.path,
                query,
            });

            // 同步完成，结束等待
            finish();
        };

        // 监听消息事件
        window.addEventListener('message', handleSessionMessage);

        // 向父窗口发起登录态请求
        window.opener.postMessage('weather', '*');
    });
};
// ── 预览下载按钮图标 ──────────────────────────────────────────
const downloadIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 16 16" fill="none">
<path d="M2 11v2a1 1 0 001 1h10a1 1 0 001-1v-2M8 3v7M5 8l3 3 3-3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

// ── Tab 定义 ──────────────────────────────────────────────
const TABS = [
  { key: 'basicInfo',    label: '基本信息' },
  { key: 'investment',   label: '投资设置' },
  { key: 'cost',         label: '成本设置' },
  { key: 'depreciation', label: '折旧设置' },
  { key: 'revenue',      label: '收入税金' },
  { key: 'calculation',  label: '计算项目' },
]

// ── Tab 图标映射 ──────────────────────────────────────────
const TAB_ICON_MAP = {
  basicInfo:    MENU_ICON_SVGS[0],
  investment:   MENU_ICON_SVGS[2],
  cost:         MENU_ICON_SVGS[4],
  depreciation: MENU_ICON_SVGS[3],
  revenue:      MENU_ICON_SVGS[5],
  calculation:  MENU_ICON_SVGS['calc'],
}

const activeTab = ref('basicInfo')

// ── 已完成 Tab 状态 ───────────────────────────────────────
const completedTabs = ref({
  basicInfo: false, investment: false, cost: false,
  depreciation: false, revenue: false, calculation: false,
})

// ── 建设期年数（由基本信息联动） ───────────────────────────
const constructionYears = ref(1)

// ── 各 Tab 表单数据 ───────────────────────────────────────
const basicInfo = ref({
  projectName: '',
  region: [],
  startYearMonth: undefined,
  constructionPeriod: 1,
  capacity: null,
  capitalIRRAfterTax: 6.5,
  investIRRBeforeTax: 6,
})

const investment = ref({
  longTermLoanRate: null,
  shortTermLoanRate: null,
  capitalRatio: null,
  workingCapitalPerKW: null,
  ownWorkingCapitalRatio: null,
  loanRepaymentPeriod: 15,
  unitCostStaticInvestment: null,
  unitCostDynamic: null,
  deductibleTax: null,
})

const depreciation = ref({
  method: '直线折旧法',
  depreciationYears: 20,
  residualRate: 5,
})

// ── 成本设置表格 ──────────────────────────────────────────
const costRows = ref([
  initTableRow('headcount',      '定员人数',      '人',    { mode: 'annual' }),
  initTableRow('avgWage',        '人工年平均工资', '元/年'),
  initTableRow('benefitRatio',   '福利及其他占比', '%'),
  initTableRow('maintenance',    '风电维修费',     '元/kW'),
  initTableRow('insurance',      '风电保险费率',   '%'),
  initTableRow('material',       '风电材料费',     '元/kW'),
  initTableRow('otherFee',       '其他费用',       '元/kW'),
  initTableRow('storageLease',   '储能租赁费', '万元', { isDynamic: true, constructionReadOnly: true, originalLabel: '储能租赁费' }),
  initTableRow('batteryReplace', '电池更换费', '万元', { isDynamic: true, constructionReadOnly: true, originalLabel: '电池更换费' }),
  initTableRow('otherAnnual',    '其他费用1',  '万元', { isDynamic: true, constructionReadOnly: true, originalLabel: '其他费用1'  }),
])

// ── 收入税金表格 ──────────────────────────────────────────
const revenueRows = ref([
  initTableRow('operationRate',    '投运率',                '%'),
  initTableRow('annualGridHours',  '年上网小时数',           'h'),
  initTableRow('annualGridEnergy', '年上网电量',             'MWh'),
  initTableRow('gridPrice',        '上网电价(含税)',          '元/kWh'),
  initTableRow('vatRefundRate',    '即征即返比',            '%',  { isSimpleInput: true, constructionReadOnly: false, defaultValue: 0 }),
  initTableRow('subsidyYears',     '持续年限',               '年', { isSimpleInput: true, constructionReadOnly: false, defaultValue: 0 }),
  initTableRow('govSubsidyYears',  '政府贴息年限',           '年', { isSimpleInput: true, constructionReadOnly: false, defaultValue: 0 }),
  initTableRow('subsidyRatio',     '贴息比例',               '%',  { isSimpleInput: true, constructionReadOnly: false, defaultValue: 0 }),
  initTableRow('incomeTaxRate',    '企业所得税率',            '%',  { defaultValue: 25 }),
  initTableRow('businessTax',      '营业税金及附加',          '%',  { isSimpleInput: true, constructionReadOnly: false, defaultValue: 10 }),
  initTableRow('equipVATRate',     '设备增值税率(销项税率)',   '%',  { isSimpleInput: true, constructionReadOnly: false, defaultValue: 13 }),
  initTableRow('deferredVATRate',  '建安增值税率(销项税率)',   '%',  { isSimpleInput: true, constructionReadOnly: false, defaultValue: 9 }),
])

const calcResult = ref(null)

async function handleCalculate() {
  calculating.value = true
  try {
    // 新建项目首次计算时需要先保存；项目已经保存过并拿到 ID 后直接计算，
    // 避免再次触发保存接口。
    const saved = projectId.value ? true : await handleSave()
    if (!saved) return

    const res = await comprehensiveFinanceData(projectId.value)
    if (res && res.code === 200) {
      calcResult.value = res.data
      activeTab.value = 'calculation'
      completedTabs.value.calculation = true
      message.success('计算完成')
    } else {
      message.error(res?.msg || '计算失败，请稍后重试')
    }
  } catch {
    message.error('计算失败，请稍后重试')
  } finally {
    calculating.value = false
  }
}

const getDefaultPriceValue = async() => {
  try{
    const res = await getDefaultPricValue()
    if(res.code == 200){
      investment.value.longTermLoanRate = res.data.longTermRate;
      investment.value.shortTermLoanRate = res.data.shortTermRate;
      investment.value.capitalRatio = res.data.workingCapitalRatio;

    }
    console.log(res)
  }catch(err){
    console.log(err)
  }
}

// ── 子组件 ref ────────────────────────────────────────────
const basicInfoRef    = ref(null)
const investmentRef   = ref(null)
const depreciationRef = ref(null)

// ── 校验错误状态 ──────────────────────────────────────────
const tabErrors = ref({
  basicInfo: false, investment: false, cost: false,
  depreciation: false, revenue: false, calculation: false,
})

const errorTabs = computed(() =>
  TABS.filter(t => tabErrors.value[t.key]).map(t => t.label)
)

function clearErrors() {
  TABS.forEach(t => { tabErrors.value[t.key] = false })
}

function handleTabClick(key) {
  if (key === 'calculation') {
    handleCalculate()
  } else {
    // 离开 cost / revenue 时标记为已完成（无需强制验证）
    if (['cost', 'revenue'].includes(activeTab.value)) {
      completedTabs.value[activeTab.value] = true
    }
    activeTab.value = key
  }
}

// ── 折旧方式枚举映射 ──────────────────────────────────────
const DEPRECIATION_METHOD_MAP = { '直线折旧法': 1, '双倍余额递减法': 2, '年数总和法': 3 }

function calcInvestmentExtras() {
  const inv = investment.value
  const cost         = inv.unitCostStaticInvestment ?? 0
  const loanRate     = (inv.longTermLoanRate ?? 0) / 100
  const capitalRatio = (inv.capitalRatio ?? 0) / 100
  const interest     = cost * (1 - capitalRatio) * loanRate * 0.5
  const constructionInterest = interest > 0 ? parseFloat(interest.toFixed(2)) : 0
  const totalInvestment      = parseFloat((cost + constructionInterest + (inv.deductibleTax ?? 0)).toFixed(2))
  return { constructionInterest, totalInvestment }
}

function buildParamDataList(row, constrYears) {
  const list = []
  for (let i = 0; i < TOTAL_YEARS; i++) {
    const year = i + 1
    let value
    if (i < constrYears) {
      value = 0
    } else if (row.mode === 'quick') {
      value = row.quickValue !== null && row.quickValue !== undefined ? Number(row.quickValue) : 0
    } else {
      value = row.yearValues[i] !== null && row.yearValues[i] !== undefined ? Number(row.yearValues[i]) : 0
    }
    list.push({ year, value })
  }
  return list
}

function buildPayload() {
  const bi  = basicInfo.value
  const inv = investment.value
  const dep = depreciation.value
  const constrYears = constructionYears.value
  const { constructionInterest, totalInvestment } = calcInvestmentExtras()

  const revenueMap = Object.fromEntries(revenueRows.value.map(r => [r.id, r]))

  const yearRows = [
    ...costRows.value,
    ...revenueRows.value.filter(r => !r.isSimpleInput),
  ]

  const paramConfigList = yearRows.map(row => {
    const isCustomRow = row.id.startsWith('dynamic_')
    const isLabelChanged =
      row.originalLabel !== null &&
      row.originalLabel !== undefined &&
      row.label !== row.originalLabel
    const treatAsCustom = isCustomRow || isLabelChanged

    // paramCode 决策：
    //   1. 系统固定行                             → PARAM_CODE 枚举
    //   2. 编辑模式自定义行 + 名称未改             → 复用服务端 serverCode
    //   3. 新增自定义行 或 名称已改                → '' (后端自动生成新 code)
    let paramCode
    if (!treatAsCustom) {
      paramCode = PARAM_CODE[row.id] ?? ''
    } else if (isCustomRow && row.serverCode && !isLabelChanged) {
      paramCode = row.serverCode
    } else {
      paramCode = ''
    }

    const item = {
      paramCode,
      paramName: row.label,
      unit:      row.unit,
      inputType: row.mode === 'quick' ? 1 : 2,
      isCustom:  treatAsCustom ? 1 : 0,
    }
    if (row.mode === 'quick') {
      item.defaultValue = row.quickValue ?? null
    } else {
      item.paramDataList = buildParamDataList(row, constrYears)
    }
    return item
  })

  return {
    ...(projectId.value ? { id: Number(projectId.value) } : {}),
    platformType: '2',
    projectType:  3,
    businessId: route.query.businessId || undefined,
    projectName:                          bi.projectName,
    provinceCode:                         bi.region?.[0] ?? '',
    cityCode:                             bi.region?.[1] ?? '',
    districtCode:                         bi.region?.[2] ?? '',
    startDate:                            bi.startYearMonth,
    constructionPeriod:                   bi.constructionPeriod,
    actualInstalledCapacity:              bi.capacity,
    capitalBenchmarkInternalRateOfReturn: bi.capitalIRRAfterTax,
    benchmarkInternalRateOfReturn:        bi.investIRRBeforeTax,
    longTermRate:              inv.longTermLoanRate,
    shortTermRate:             inv.shortTermLoanRate,
    equityRatio:               inv.capitalRatio,
    workingCapitalFeeStandard: inv.workingCapitalPerKW,
    workingCapitalRatio:       inv.ownWorkingCapitalRatio,
    loanRepaymentPeriod:       inv.loanRepaymentPeriod,
    unitCostTotalInvestment:   inv.unitCostStaticInvestment,
    unitCostDynamic:           inv.unitCostDynamic,
    deductibleTax:             inv.deductibleTax,
    depreciationMethod: DEPRECIATION_METHOD_MAP[dep.method] ?? 1,
    depreciationPeriod: dep.depreciationYears,
    residualValueRate:  dep.residualRate,
    immediateRefundRatio:           revenueMap.vatRefundRate?.quickValue   ?? 0,
    immediateRefundDuration:        revenueMap.subsidyYears?.quickValue    ?? 0,
    governmentInterestSubsidyYears: revenueMap.govSubsidyYears?.quickValue ?? 0,
    interestSubsidyRatio:           revenueMap.subsidyRatio?.quickValue    ?? 0,
    corporateIncomeTaxRate:         revenueMap.incomeTaxRate?.quickValue   ?? 25,
    businessTaxAndSurcharges:       revenueMap.businessTax?.quickValue     ?? 10,
    equipmentVatRate:               revenueMap.equipVATRate?.quickValue    ?? 13,
    constructionVatRate:            revenueMap.deferredVATRate?.quickValue ?? 9,
    paramConfigList,
  }
}

// ── 保存 ─────────────────────────────────────────────────
const saving = ref(false)

async function handleSave() {
  saving.value = true
  clearErrors()

  const results = await Promise.allSettled([
    basicInfoRef.value?.validate(),
    investmentRef.value?.validate(),
    depreciationRef.value?.validate(),
  ])

  const keys = ['basicInfo', 'investment', 'depreciation']
  let hasError = false
  results.forEach((result, idx) => {
    if (result.status === 'rejected') {
      tabErrors.value[keys[idx]] = true
      hasError = true
    }
  })

  if (hasError) {
    saving.value = false
    const firstErrorTab = keys.find(k => tabErrors.value[k])
    if (firstErrorTab) activeTab.value = firstErrorTab
    message.error('请完善必填项后再保存')
    return false
  }

  try {
    const payload = buildPayload()
    const res = await saveFinanceProject(payload)
    if (res && res.code === 200) {
      // 保存接口返回的 data 即项目 ID，后续计算直接复用，避免重复保存。
      if (res.data !== null && res.data !== undefined) {
        projectId.value = res.data
      }
      // 标记已通过校验的 Tab 为已完成
      completedTabs.value.basicInfo    = true
      completedTabs.value.investment   = true
      completedTabs.value.depreciation = true
      message.success(route.query.id ? '项目更新成功' : '项目创建成功')
      return true
    } else {
      message.error(res?.msg || '保存失败，请稍后重试')
      return false
    }
  } catch {
    message.error('保存失败，请稍后重试')
    return false
  } finally {
    saving.value = false
  }
}

const aginreport = async () => {
    try{
        const id = route.query.projectId
        const res = await againGeneReport(id)
        if(res.code == 200){
            message.success('报告重新生成成功');
        }
    }catch(err){
        message.error(res.msg);
    }
}

const calculating = ref(false)

function handlePreview() {
  message.info('正在生成预览文件…')
}

// ── 折旧方式枚举反向映射 ──────────────────────────────────
const DEPRECIATION_METHOD_REVERSE = { 1: '直线折旧法', 2: '双倍余额递减法', 3: '年数总和法' }

function loadProjectData(data) {
  let startYearMonth
  if (Array.isArray(data.startDate)) {
    const [y, m, d] = data.startDate
    startYearMonth = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
  } else {
    startYearMonth = data.startDate ?? undefined
  }

  basicInfo.value = {
    projectName:         data.projectName ?? '',
    region:              [data.provinceCode, data.cityCode, data.districtCode].filter(Boolean),
    startYearMonth,
    constructionPeriod:  data.constructionPeriod ?? 1,
    capacity:            data.actualInstalledCapacity ?? null,
    capitalIRRAfterTax:  data.capitalBenchmarkInternalRateOfReturn ?? 6.5,
    investIRRBeforeTax:  data.benchmarkInternalRateOfReturn ?? 6,
  }
  constructionYears.value = data.constructionPeriod ?? 1

  investment.value = {
    longTermLoanRate:         data.longTermRate ?? null,
    shortTermLoanRate:        data.shortTermRate ?? null,
    capitalRatio:             data.equityRatio ?? null,
    workingCapitalPerKW:      data.workingCapitalFeeStandard ?? null,
    ownWorkingCapitalRatio:   data.workingCapitalRatio ?? null,
    loanRepaymentPeriod:      data.loanRepaymentPeriod ?? 15,
    unitCostStaticInvestment: data.unitCostTotalInvestment ?? null,
    unitCostDynamic:          data.unitCostDynamic ?? null,
    deductibleTax:            data.deductibleTax ?? null,
  }

  const DEPRECIATION_REVERSE = { 1: '直线折旧法', 2: '双倍余额递减法', 3: '年数总和法' }
  depreciation.value = {
    method:            DEPRECIATION_REVERSE[data.depreciationMethod] ?? '直线折旧法',
    depreciationYears: data.depreciationPeriod ?? 15,
    residualRate:      data.residualValueRate ?? 5,
  }

  const setQuick = (id, val) => {
    const row = revenueRows.value.find(r => r.id === id)
    if (row != null) row.quickValue = val ?? row.quickValue ?? null
  }
  setQuick('vatRefundRate',   data.immediateRefundRatio)
  setQuick('subsidyYears',    data.immediateRefundDuration)
  setQuick('govSubsidyYears', data.governmentInterestSubsidyYears)
  setQuick('subsidyRatio',    data.interestSubsidyRatio)
  setQuick('businessTax',     data.businessTaxAndSurcharges)
  setQuick('equipVATRate',    data.equipmentVatRate)
  setQuick('deferredVATRate', data.constructionVatRate)

  if (!Array.isArray(data.paramConfigList)) return

  const reverseCode = Object.fromEntries(
    Object.entries(PARAM_CODE).map(([id, code]) => [code, id])
  )
  const allRows = [
    ...costRows.value,
    ...revenueRows.value.filter(r => !r.isSimpleInput),
  ]

  data.paramConfigList.forEach(item => {
    let row = null
    if (item.isCustom) {
      row = costRows.value.find(r => r.isDynamic && r.label === item.paramName)
      if (!row) {
        const newRow = initTableRow(
          `dynamic_${Date.now()}_${Math.random().toString(36).slice(2)}`,
          item.paramName,
          item.unit || '万元',
          { isDynamic: true, constructionReadOnly: true }
        )
        costRows.value.push(newRow)
        row = newRow
      }
      // ── 编辑模式：记录服务端 code 和原始名称 ──────────────
      // serverCode：提交时若名称未改则原样回传，后端可识别已有记录
      row.serverCode    = item.paramCode || ''
      // originalLabel：用于判断用户是否修改了名称
      row.originalLabel = item.paramName
    } else {
      const rowId = reverseCode[item.paramCode]
      row = rowId ? allRows.find(r => r.id === rowId) : null
    }

    if (!row) return
    if (item.unit) row.unit = item.unit
    row.mode = item.inputType === 2 ? 'annual' : 'quick'

    if (item.inputType === 1) {
      row.quickValue = item.defaultValue ?? null
      for (let i = constructionYears.value; i < TOTAL_YEARS; i++) {
        row.yearValues[i] = row.quickValue
      }
    } else {
      if (Array.isArray(item.paramDataList)) {
        item.paramDataList.forEach(({ year, value }) => {
          row.yearValues[year - 1] = value ?? null
        })
      }
    }
  })
}

onMounted(async () => {
    try {
        // 先等待五环平台传递登录态
        await waitForSessionStorage()

        // 财务页面使用 projectId
        const queryProjectId =
            route.query.projectId || route.query.id

        projectId.value = queryProjectId || null

        if (!queryProjectId) {
            // 没有项目ID，说明是新建财务项目
            await getDefaultPriceValue()
            return
        }
        // 有项目ID，加载已有财务项目
        const res = await getProjectIfnoByProjectid(
            queryProjectId,
        )

        if (
            res &&
            res.code === 200 &&
            res.data
        ) {
            loadProjectData(res.data)
            if (res.data.channel == 0) {
              hasProjectId.value = false
          }else{
              hasProjectId.value = true
          }
        } else {
            message.error(
                res?.msg || '加载项目数据失败',
            )
        }
    } catch (error) {
        console.error(
            '财务页面初始化失败：',
            error,
        )

        message.error(
            '加载项目数据失败，请稍后重试',
        )
    }
})
</script>

<style scoped>
.wfe-page {
  margin: 12px 0 0 12px;
  border-radius: 12px 0 0 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f0f4fa;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif;
  font-size: 14px;
  color: #333;
  min-height: 0;
}

/* ── 顶部 ─────────────────────────────────────────────── */
.wfe-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  background: #fff;
  flex-shrink: 0;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  border-bottom: 1px solid #f0f0f0;
}
.wfe-header-left  { width: 200px; }
.wfe-header-right { width: 200px; display: flex; justify-content: flex-end; gap: 12px; align-items: center; }
.wfe-title {
  flex: 1;
  text-align: left;
  font-size: 16px;
  font-weight: 600;
  color: #222;
  margin: 0;
}

/* ── 按钮图标 ─────────────────────────────────────────── */
.btn-icon {
  display: inline-flex;
  align-items: center;
  vertical-align: middle;
  margin-right: 2px;
}

/* ── 主体 ─────────────────────────────────────────────── */
.wfe-body { display: flex; flex: 1; overflow: hidden; min-height: 0; }

/* ── 左侧侧边栏 ───────────────────────────────────────── */
.wfe-sidebar {
  width: 160px;
  flex-shrink: 0;
  background: #fff;
  padding: 16px 10px 0 20px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  overflow-y: auto;
}

/* ── Tab 按钮 ─────────────────────────────────────────── */
.tab-btn {
  width: 100%;
  padding: 10px 10px;
  border: none;
  border-radius: 10px;
  background: #F4F6FA;
  cursor: pointer;
  transition: all 0.22s ease;
  text-align: left;
  outline: none;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.06);
}

.tab-btn:hover:not(.active):not(:disabled) {
  background: #EBF2FF;
}

.tab-btn.active {
  background: linear-gradient(to right, #2883FF, #2BB7FF);
                        box-shadow: 0 4px 14px rgba(40, 131, 255, 0.28);
}

.tab-btn.tab-error:not(.active) {
  box-shadow: 0 2px 8px rgba(255, 77, 79, 0.15);
}

.tab-btn:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

/* ── Tab 内部布局 ─────────────────────────────────────── */
.tab-btn-inner {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* ── 图标圆圈区域 ─────────────────────────────────────── */
.tab-icon-wrap {
  position: relative;
  flex-shrink: 0;
}

.tab-icon-circle {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  /* background: #fff; */
  display: flex;
  align-items: center;
  justify-content: center;
  /* box-shadow: 0 1px 6px rgba(0, 0, 0, 0.10); */
  flex-shrink: 0;
  overflow: visible;
}

/* 激活态：图标圆圈半透明白色，图标变白 */
.tab-btn.active .tab-icon-circle {
  /* background: rgba(255, 255, 255, 0.20); */
  box-shadow: none;
}

.tab-btn.active .icon-svg {
  filter: brightness(0) invert(1);
}

.icon-svg {
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 0;
}

/* ── 状态角标（右上角） ───────────────────────────────── */
.tab-status {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 0;
  pointer-events: none;
}

/* ── 步骤文字区域 ─────────────────────────────────────── */
.tab-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.tab-step {
  font-size: 11px;
  color: #aab4c8;
  line-height: 1;
  letter-spacing: 0.2px;
}

.tab-btn.active .tab-step {
  color: rgba(255, 255, 255, 0.75);
}

.tab-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  line-height: 1.3;
  white-space: nowrap;
}

.tab-btn.active .tab-name {
  color: #fff;
}

.tab-btn.tab-error:not(.active) .tab-name {
  color: #ff4d4f;
}

.tab-btn.tab-error:not(.active) .tab-step {
  color: rgba(255, 77, 79, 0.6);
}

/* ── 右侧内容 ─────────────────────────────────────────── */
.wfe-content {
  flex: 1;
  overflow: auto;
  padding: 32px 40px;
  background: #fff;
  min-width: 0;
}
.error-banner { margin-bottom: 24px; }

/* ── 统一子组件表单 label 高度 ──────────────────────────── */
.wfe-content :deep(.ant-form-item-label > label) {
  height: 36px;
}
</style>