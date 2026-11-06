<template>
  <transition name="slide-up">
    <div v-if="visible" class="generate-panel">
      <!-- 顶部 Header -->
      <div class="gp-header">
        <div class="gp-header-left">
          <el-button link class="gp-back-btn" @click="handleClose">
            <el-icon><ArrowLeft /></el-icon>
          </el-button>
          <span class="gp-title">{{ title }}</span>
        </div>
        <div class="gp-header-right">
          <el-button link type="primary" :disabled="!generated" @click="handlePrint">
            打印
          </el-button>
          <el-button link type="primary" :disabled="!generated || !generatedFilePath" @click="handleDownloadAll">
            下载所有文件
          </el-button>
        </div>
      </div>

      <!-- 主体内容 -->
      <div class="gp-body">
        <!-- 左侧表单区 (根据 actionKey 动态渲染) -->
        <div class="gp-form-side">
          <div class="gp-form-inner">
            
            <!-- 1. 引用项目报告 (所有报告都有) -->
            <div class="form-row">
              <span class="form-label required">引用项目报告</span>
              <div class="form-control report-ref-row">
                <el-select v-model="form.reportType" class="report-type-select" disabled>
                  <el-option label="可研报告" value="FEASIBILITY_STUDY" />
                </el-select>
                <el-select
                  v-model="selectedReportId"
                  class="report-ref-select"
                  filterable
                  remote
                  :remote-method="fetchReportList"
                  :loading="reportLoading"
                  placeholder="请选择可研报告"
                  @visible-change="handleDropdownVisibleChange"
                >
                  <el-option
                    v-for="item in reportOptions"
                    :key="item.id"
                    :label="`${item.reportProjectName || item.fileName} (${item.reportProjectCode || '-'})`"
                    :value="item.id"
                  />
                </el-select>
              </div>
            </div>

            <!-- 2. 公司选择 (承诺书和其他报告文案不同) -->
            <div class="form-row">
              <span class="form-label required">{{ companyLabel1 }}</span>
              <el-select v-model="form.applyCompany" placeholder="请选择" class="form-control" value-key="id">
                <el-option v-for="item in companyOptions" :key="item.id" :label="item.name" :value="item" />
              </el-select>
            </div>

            <div class="form-row">
              <span class="form-label required">{{ companyLabel2 }}</span>
              <el-select v-model="form.requestCompany" placeholder="请选择" class="form-control" value-key="id">
                <el-option v-for="item in companyOptions" :key="item.id" :label="item.name" :value="item" />
              </el-select>
            </div>

            <!-- 3. 前期计划与费用 (仅立项相关的报告显示) -->
            <template v-if="['gen-application', 'gen-letter'].includes(props.actionKey)">
              <div class="form-section-title">前期工作计划</div>
              <div class="form-row">
                <span class="form-label">取得项目核准日期</span>
                <el-date-picker v-model="form.approvalDate" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" class="form-control" style="width: 100%" />
              </div>
              <div class="form-row">
                <span class="form-label">取得可研审查日期</span>
                <el-date-picker v-model="form.reviewDate" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" class="form-control" style="width: 100%" />
              </div>
              <div class="form-row">
                <span class="form-label">完成项目投资决策日期</span>
                <el-date-picker v-model="form.decisionDate" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" class="form-control" style="width: 100%" />
              </div>
              <div class="form-section-title">前期费用计划</div>
              <div class="form-row">
                <span class="form-label">拟申请前期费用</span>
                <div class="form-control with-unit">
                  <el-input v-model="form.applyFee" placeholder="请输入" type="number" />
                  <span class="unit">万元</span>
                </div>
              </div>
              <div class="form-row">
                <span class="form-label">本年预计发送费用</span>
                <div class="form-control with-unit">
                  <el-input v-model="form.estimateFee" placeholder="请输入" type="number" />
                  <span class="unit">万元</span>
                </div>
              </div>
            </template>

            <!-- 4. 联系人 (承诺书不需要，其他都需要) -->
            <div class="form-row" v-if="props.actionKey !== 'gen-invest-commitment'">
              <span class="form-label">联系人</span>
              <div class="contact-row">
                <el-input v-model="form.contactName" placeholder="姓名" />
                <el-input v-model="form.contactPhone" placeholder="电话" />
              </div>
            </div>

            <!-- 底部按钮 -->
            <div class="gp-form-actions">
              <el-button type="primary" class="generate-btn" :loading="generating" @click="handleGenerate">
                开始生成
              </el-button>
            </div>
          </div>
        </div>

        <!-- 右侧预览区 -->
        <div class="gp-preview-side">
          <div class="gp-preview-header">
            <span class="preview-title">文件预览</span>
          </div>
          <div class="gp-preview-body">
            <div v-if="!generating && !generated" class="preview-empty">
              点击「开始生成」后预览文件
            </div>
            <div v-else-if="generating" class="preview-loading">
              <el-skeleton :rows="10" animated />
              <div class="loading-tip">正在生成文件并上传，请稍候...</div>
            </div>
            <div v-else-if="generated" class="preview-content">
              <div class="preview-word-wrap">
                <div ref="wordContainer" class="docx-preview-container"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, reactive, computed, watch, nextTick } from 'vue'
import { ArrowLeft } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { renderAsync } from 'docx-preview'
import Docxtemplater from 'docxtemplater'
import PizZip from 'pizzip'
import { pageReport, createReport } from '@/api/modules/aiProject'
import * as fileApi from '@/api/modules/projectFile'
import { useOssUpload } from '@/components/ossClient/index'
// ★ 引入封装的四个接口
import { createLXReport, createQXReport, createCNSReport, createTZJCReport } from '@/api/modules/report'

const props = defineProps({
  visible: { type: Boolean, default: false },
  project: { type: Object, default: null },
  actionKey: { type: String, default: '' },
  subCode: { type: String, default: '' },
  aiDetail: { type: Object, default: null },
})

const emit = defineEmits(['close', 'generated'])

// 补全 10 个动作的标题映射
const REPORT_TITLE_MAP = {
  'gen-application': '立项申请报告生成',
  'gen-letter': '立项请示函生成',
  'gen-report': '可研审查报告生成',
  'gen-invest-apply': '投资决策申请报告生成',
  'gen-invest-letter': '投资决策请示函生成',
  'gen-invest-commitment': '项目承诺书生成',
  'gen-audit-notice': '投审会通知文件生成',
  'gen-audit-topic': '投审议题材料生成',
  'gen-filing-report': '投资决策备案报告生成',
  'gen-approval-doc': '批复文件生成',
}

const TEMPLATE_MAP = {
  'gen-application': '/templates/wind-proposal.docx',
  'gen-letter': '/templates/wind-proposal.docx',
  'gen-report': '/templates/wind-proposal.docx',
  'gen-invest-apply': '/templates/investment-application.docx',
  'gen-invest-letter': '/templates/wind-proposal.docx',
  'gen-invest-commitment': '/templates/investment-commitment.docx',
  'gen-audit-notice': '/templates/wind-proposal.docx',
  'gen-audit-topic': '/templates/wind-proposal.docx',
  'gen-filing-report': '/templates/wind-proposal.docx',
  'gen-approval-doc': '/templates/wind-proposal.docx',
}

const REPORT_TYPE_MAP = {
  'gen-application': 'PROJECT_INITIATION',
  'gen-letter': 'PROJECT_INITIATION',
  'gen-approval-doc': 'PROJECT_INITIATION',
  'gen-report': 'FEASIBILITY_STUDY',
  'gen-invest-apply': 'INVESTMENT_DECISION',
  'gen-invest-letter': 'INVESTMENT_DECISION',
  'gen-filing-report': 'INVESTMENT_DECISION',
  'gen-invest-commitment': 'PROJECT_COMMITMENT',
  'gen-audit-notice': 'INVESTMENT_REVIEW_NOTICE',
  'gen-audit-topic': 'INVESTMENT_REVIEW_NOTICE',
}

const title = computed(() => REPORT_TITLE_MAP[props.actionKey] || '报告生成')
const aiProjectId = computed(
  () => props.project?.aiProjectId
    ?? props.project?.reportProjectId
    ?? props.project?.id
    ?? props.project?.projectId
    ?? 1001
)
const templatePath = computed(() => TEMPLATE_MAP[props.actionKey] || '/templates/wind-proposal.docx')

// 动态控制表单文案
const companyLabel1 = computed(() => {
  if (props.actionKey === 'gen-invest-commitment') return '建设公司'
  return '申请公司'
})
const companyLabel2 = computed(() => {
  if (props.actionKey === 'gen-invest-commitment') return '投资公司'
  return '请示公司'
})

// 可研报告下拉
const selectedReportId = ref('')
const reportOptions = ref([])
const reportLoading = ref(false)

async function fetchReportList(keyword = '') {
  if (!aiProjectId.value) return
  reportLoading.value = true
  try {
    const res = await pageReport({
      aiProjectId: aiProjectId.value,
      pageNo: 1,
      pageSize: 20,
      status: 'COMPLETED',
      reportType: "FEASIBILITY_STUDY"
    })
    reportOptions.value = res.data?.list || res.list || []
  } catch (error) {
    console.error('获取可研报告列表失败:', error)
    ElMessage.error('获取可研报告列表失败')
  } finally {
    reportLoading.value = false
  }
}
function handleDropdownVisibleChange(visible) {
  if (visible && reportOptions.value.length === 0) fetchReportList()
}

const companyOptions = ref([
  { id: 2001, name: '陕西华电永寿新能源有限公司' },
  { id: 2002, name: '华电陕西能源有限公司' },
  { id: 2003, name: '陕西华电新能源发电有限公司' },
])

const form = reactive({
  reportType: 'FEASIBILITY_STUDY',
  applyCompany: { id: 2001, name: '陕西华电永寿新能源有限公司' },
  requestCompany: { id: 2002, name: '华电陕西能源有限公司' },
  approvalDate: '',
  reviewDate: '',
  decisionDate: '',
  applyFee: '',
  estimateFee: '',
  contactName: '张三',
  contactPhone: '18900009876',
})

const generating = ref(false)
const generated = ref(false)
const wordContainer = ref(null)
const generatedFilePath = ref('')

watch(() => props.visible, (val) => {
  if (val) {
    generated.value = false
    generating.value = false
    generatedFilePath.value = ''
    selectedReportId.value = ''
    reportOptions.value = []
    form.applyCompany = companyOptions.value[0] || null
    form.requestCompany = companyOptions.value[1] || null
  }
})

// 工具函数：根据 subCode 推导 toNode 中文
function getToNodeLabel() {
  const sub = props.subCode
  if (sub === 'PIM_TO_NEW_ENERGY_COMPANY' || sub === 'IDM_TO_NEW_ENERGY_COMPANY') return 'to新能源公司'
  if (sub === 'PIM_TO_SHAANXI_COMPANY' || sub === 'IDM_TO_SHAANXI_COMPANY') return 'to陕西公司'
  if (sub === 'IDM_TO_GROUP') return 'to集团公司'
  return 'to陕西公司'
}

// 模板渲染
async function renderTemplateToBlob(data) {
  const res = await fetch(templatePath.value)
  if (!res.ok) throw new Error(`模板加载失败：${templatePath.value}`)
  const buf = await res.arrayBuffer()
  const zip = new PizZip(buf)
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    delimiters: { start: '${', end: '}' },
    nullGetter: () => '',
  })
  doc.render(JSON.parse(JSON.stringify(data)))
  return doc.getZip().generate({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  })
}

// 数据清洗与合并
const TEMPLATE_ALIAS = {
  project_construction_site: 'SX_project_detailed_address',
  地貌特征: 'SX_landform_feature',
  是否敏感: 'SX_is_sensitive',
  取得竞配指标年份: 'SX_competitive_year',
  mainPrice: 'SX_main_price',
  investment: 'SX_investment_situation',
}

function cleanValue(v) {
  if (v === null || v === undefined) return ''
  if (typeof v === 'string') {
    const s = v.trim()
    if (s === 'null' || s === 'undefined' || s === 'nullnull') return ''
    return v
  }
  return v
}

function normalizeParams(params) {
  if (!params || typeof params !== 'object') return {}
  const data = {}
  for (const [rawKey, rawValue] of Object.entries(params)) {
    const key = rawKey.replace(/^\$\{/, '').replace(/\}$/, '')
    data[key] = cleanValue(rawValue)
  }
  for (const [tplKey, apiKey] of Object.entries(TEMPLATE_ALIAS)) {
    if (!data[tplKey]) data[tplKey] = data[apiKey] ?? ''
  }
  return data
}

function safeParseJson(s) {
  if (Array.isArray(s)) return s
  if (typeof s !== 'string') return []
  try { return JSON.parse(s) } catch { return [] }
}

function mergeFillData(params, aiDetail) {
  const normalized = normalizeParams(params || {})
  const rawAi = aiDetail?.rawAiData || aiDetail || {}
  const p = rawAi.reportParamResult || {}
  const windTable = safeParseJson(p.projectWindPowerFarmPowerTableData)
  const avgRow = windTable.find(r => r.label === '平均') || {}

  return {
    ...normalized,
    project_name: normalized.project_name || rawAi.reportProjectName || props.project?.projectName || '',
    project_construction_site: normalized.project_construction_site || p.projectAddress || '',
    SX_project_detailed_address: normalized.SX_project_detailed_address || p.projectAddress || '',
    total_turbine_count: normalized.total_turbine_count || p.turbineCount || '',
    rated_power: normalized.rated_power || p.ratedPower || '',
    projectSelectedDeviceInstallCapacity: normalized.projectSelectedDeviceInstallCapacity || p.actualCapacity || '',
    hub_height: normalized.hub_height || p.hubHeight || '',
    wheel_diameter: normalized.wheel_diameter || p.rotorDiameter || '',
    projectSelectedDeviceYearPower: normalized.projectSelectedDeviceYearPower || p.annualEnergy || '',
    projectSelectedDeviceFullLoadHours: normalized.projectSelectedDeviceFullLoadHours || p.annualHours || '',
    hubHeightRevisedAvgWindSpeedDesc: normalized.hubHeightRevisedAvgWindSpeedDesc || avgRow.avgWindSpeed || '',
  }
}

// 真实上传
async function uploadGeneratedFile(blob, fileName) {
  try {
    const file = new File([blob], fileName, { type: blob.type })
    const obsUpload = useOssUpload()
    const uploadResult = await obsUpload.uploadFile(file)
    if (!uploadResult || !uploadResult.obsPath) {
      throw new Error('上传返回异常，未获取到文件路径')
    }
    return uploadResult.obsPath
  } catch (err) {
    console.error('[OSS 上传失败]', err)
    throw new Error('文件上传至云端失败，请重试')
  }
}

// 将生成的报告挂载到上会流程列表中
async function syncToMeetingTab(fileUrl, fileName, fileSuffix) {
  try {
    let fileCode = ''
    if (props.subCode.startsWith('PIM_')) fileCode = 'PROJECT_INITIATION_MEETING_MATERIALS'
    else if (props.subCode.startsWith('FER_')) fileCode = 'FEASIBILITY_REVIEW'
    else if (props.subCode.startsWith('IDM_')) fileCode = 'INVESTMENT_DECISION_MEETING_MATERIALS'
    else fileCode = 'PROJECT_INITIATION_MEETING_MATERIALS'

    const ACTION_TO_FILE_TAG = {
      'gen-application': '生成立项申请报告',
      'gen-letter': '生成立项请示函',
      'gen-report': '生成可研审查报告',
      'gen-invest-apply': '生成投资决策申请报告',
      'gen-invest-letter': '生成投资决策请示函',
      'gen-invest-commitment': '生成项目承诺书',
      'gen-audit-notice': '生成投审会通知文件',
      'gen-audit-topic': '生成投审议题材料',
      'gen-filing-report': '生成投资决策备案报告',
      'gen-approval-doc': '生成批复文件'
    }
    const tag = ACTION_TO_FILE_TAG[props.actionKey] || '生成报告文件'

    const res = await fileApi.getFileListByProjectid({
      aiProjectId: aiProjectId.value,
      firstBusinessTitle: fileCode,
    })
    const list = res?.data || []
    const existingRecord = list.find(item => (item.secondaryBusinessTitle || '') === props.subCode)

    let fileUrlList = existingRecord?.fileUrlList || []
    if (typeof fileUrlList === 'string') {
      try { fileUrlList = JSON.parse(fileUrlList) } catch { fileUrlList = [] }
    }
    fileUrlList.push({ fileName, filePath: fileUrl, fileSuffix })

    const payload = {
      aiProjectId: aiProjectId.value,
      firstBusinessTitle: fileCode,
      secondaryBusinessTitle: props.subCode,
      fileTypeTag: tag,
      isRequiredUpload: existingRecord?.isRequiredUpload !== undefined ? existingRecord.isRequiredUpload : true,
      fileUrlList: fileUrlList,
    }

    if (existingRecord && existingRecord.id) {
      payload.id = existingRecord.id
      await fileApi.updateFile(payload)
    } else {
      await fileApi.addFileType(payload)
    }
  } catch (err) {
    console.error('[File] 同步上会流程失败:', err)
    ElMessage.warning('报告已生成，但同步至上会列表失败')
  }
}

// 提交 createReport 业务记录
async function submitReport({ fileUrl, fileName, resData }) {
  const selectedItem = reportOptions.value.find(r => r.id === selectedReportId.value) || {}
  const finalReportType = 'PROJECT_INITIATION'

  const payload = {
    aiProjectId: aiProjectId.value,
    reportType: finalReportType,
    sourceType: 'SYSTEM_GENERATE',
    fileUrl: fileUrl,
    fileName,
    fileSuffix: 'docx',
    status: 'COMPLETED',
    parseStatus: 'NOT_REQUIRED',
    parseResultJson: resData?.params ? JSON.stringify(resData.params) : null,
    totalCapacityMw: selectedItem.totalCapacityMw ?? null,
    currentCapacityMw: selectedItem.currentCapacityMw ?? null,
    capitalFinancialRate: selectedItem.capitalFinancialRate ?? null,
    declaringUnit: form.applyCompany?.name || '',
    remark: `AI项目${aiProjectId.value} / ${props.subCode || 'N/A'} 生成`,
    paramSourceReportId: selectedReportId.value,
  }
  return await createReport(payload)
}

// 主流程
async function handleGenerate() {
  if (generating.value) return
  if (!selectedReportId.value) return ElMessage.warning('请选择引用的可研报告')
  if (!form.applyCompany) return ElMessage.warning(`请选择${companyLabel1.value}`)
  
  // 承诺书接口不需要投资公司，所以如果是承诺书，不校验 requestCompany
  if (props.actionKey !== 'gen-invest-commitment' && !form.requestCompany) {
    return ElMessage.warning(`请选择${companyLabel2.value}`)
  }

  generating.value = true
  generated.value = false
  generatedFilePath.value = ''

  try {
    let resData = null
    
    // ★ 根据 actionKey 分发到不同的接口
    if (['gen-application', 'gen-letter'].includes(props.actionKey)) {
      const submitData = {
        aiProjectId: aiProjectId.value,
        reportProjectId: selectedReportId.value,
        toNode: getToNodeLabel(),
        applyCompanyId: form.applyCompany.id,
        applyCompanyName: form.applyCompany.name,
        requestCompanyId: form.requestCompany.id,
        requestCompanyName: form.requestCompany.name,
        contactName: form.contactName,
        contactPhone: form.contactPhone,
        applyEarlyCost: form.applyFee ? Number(form.applyFee) : undefined,
        thisYearEarlyCost: form.estimateFee ? Number(form.estimateFee) : undefined,
        planApprovalTime: formatToMonth(form.approvalDate),
        planFeasibilityTime: formatToMonth(form.reviewDate),
        planInvestmentDecisionTime: formatToMonth(form.decisionDate),
      }
      const res = await createLXReport(submitData)
      resData = res.data || res
    } else if (['gen-invest-apply', 'gen-invest-letter', 'gen-filing-report', 'gen-audit-notice', 'gen-audit-topic', 'gen-approval-doc'].includes(props.actionKey)) {
      const submitData = {
        aiProjectId: aiProjectId.value,
        fsProjectId: selectedReportId.value,
        companyName: form.applyCompany?.name,
        requestCompanyId: String(form.requestCompany?.id),
        requestCompanyName: form.requestCompany?.name,
        nickname: form.contactName,
        mobile: form.contactPhone,
        toNode: getToNodeLabel(),
      }
      const res = await createTZJCReport(submitData)
      resData = res.data || res
    } else if (props.actionKey === 'gen-invest-commitment') {
      // 承诺书（注意：接口里只有 constructProjectName，也就是建设公司）
      const submitData = {
        aiProjectId: aiProjectId.value,
        fsProjectId: selectedReportId.value,
        constructProjectName: form.applyCompany?.name,
      }
      const res = await createCNSReport(submitData)
      resData = res.data || res
    } else if (props.actionKey === 'gen-report') {
      const res = await createLXReport({ aiProjectId: aiProjectId.value, reportProjectId: selectedReportId.value })
      resData = res.data || res
    } else {
      const res = await createLXReport({ aiProjectId: aiProjectId.value, reportProjectId: selectedReportId.value })
      resData = res.data || res
    }

    const fillData = mergeFillData(resData.params || {}, props.aiDetail)
    const blob = await renderTemplateToBlob(fillData)

    generating.value = false
    generated.value = true
    await nextTick()

    if (wordContainer.value) {
      wordContainer.value.innerHTML = ''
      await renderAsync(blob, wordContainer.value, null, {
        className: 'docx-preview',
        inWrapper: true,
        ignoreWidth: false,
        breakPages: true,
        renderHeaders: true,
        renderFooters: true,
      })
    }

    const fileName = `${title.value}_${props.subCode || 'R'}_${Date.now()}.docx`
    const fileUrl = await uploadGeneratedFile(blob, fileName)
    generatedFilePath.value = fileUrl

    try {
      await submitReport({ fileUrl, fileName, resData })
    } catch (e) {
      console.warn('[createReport] 提交失败', e)
    }

    await syncToMeetingTab(fileUrl, fileName, 'docx')

    ElMessage.success('报告已生成并同步至上会流程')
    emit('generated', { actionKey: props.actionKey, subCode: props.subCode })
  } catch (err) {
    console.error('[生成失败]', err)
    ElMessage.error(err.message || '生成报告失败')
    generating.value = false
    generated.value = false
  }
}

function formatToMonth(dateStr) {
  if (!dateStr) return undefined
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return dateStr
  return `${date.getFullYear()}年${date.getMonth() + 1}月`
}

function handlePrint() { window.print() }

async function handleDownloadAll() {
  if (!generatedFilePath.value) return ElMessage.warning('暂无可下载的文件')
  try {
    const obsUpload = useOssUpload()
    const url = await obsUpload.getFileUrl(generatedFilePath.value)
    if (url) {
      window.open(url, '_blank')
    } else {
      ElMessage.error('获取下载链接失败')
    }
  } catch (error) {
    console.error('[下载失败]', error)
    ElMessage.error('下载文件失败，请重试')
  }
}

function handleClose() {
  if (generating.value) return ElMessage.warning('正在生成中，请稍候')
  emit('close')
}
</script>

<style scoped>
.generate-panel { position: fixed; top: 65px; left: 0; right: 0; bottom: 0; z-index: 300; display: flex; flex-direction: column; background: #fff; }
.gp-header { display: flex; align-items: center; justify-content: space-between; height: 48px; padding: 0 20px; border-bottom: 1px solid #ebeef5; flex-shrink: 0; }
.gp-header-left { display: flex; align-items: center; gap: 8px; }
.gp-back-btn { font-size: 16px; }
.gp-title { color: #303133; font-size: 15px; font-weight: 600; }
.gp-header-right { display: flex; gap: 16px; }
.gp-body { flex: 1; display: flex; min-height: 0; }
.gp-form-side { width: 45%; min-width: 480px; overflow-y: auto; border-right: 1px solid #ebeef5; background: #fff; }
.gp-form-inner { padding: 24px 40px; display: flex; flex-direction: column; gap: 20px; }
.form-row { display: flex; align-items: center; gap: 16px; }
.form-label { width: 140px; flex-shrink: 0; color: #606266; font-size: 13px; text-align: right; }
.form-label.required::before { content: '*'; color: #f56c6c; margin-right: 4px; }
.form-control { flex: 1; }
.form-control.with-unit { display: flex; align-items: center; gap: 8px; }
.form-control.with-unit .el-input { flex: 1; }
.unit { color: #909399; font-size: 13px; }
.report-ref-row { display: flex; gap: 8px; }
.report-type-select { width: 120px; flex-shrink: 0; }
.report-ref-select { flex: 1; }
.form-section-title { margin-top: 8px; margin-bottom: -4px; color: #303133; font-size: 13px; font-weight: 600; }
.contact-row { flex: 1; display: flex; gap: 12px; }
.contact-row .el-input { flex: 1; }
.gp-form-actions { display: flex; justify-content: center; margin-top: 40px; }
.generate-btn { width: 200px; height: 40px; border-radius: 4px; font-size: 14px; }
.gp-preview-side { flex: 1; display: flex; flex-direction: column; background: #f5f7fa; min-width: 0; min-height: 0; }
.gp-preview-header { height: 40px; padding: 0 20px; display: flex; align-items: center; border-bottom: 1px solid #ebeef5; background: #fff; flex-shrink: 0; }
.preview-title { color: #303133; font-size: 13px; font-weight: 600; }
.gp-preview-body { flex: 1; overflow: auto; padding: 20px; min-height: 0; box-sizing: border-box; }
.preview-empty { height: 100%; display: flex; align-items: center; justify-content: center; color: #909399; font-size: 13px; }
.preview-loading { background: #fff; padding: 40px; border-radius: 4px; height: 100%; box-sizing: border-box; }
.loading-tip { margin-top: 24px; text-align: center; color: #909399; font-size: 13px; }
.preview-content { width: 100%; height: 100%; display: flex; justify-content: center; }
.preview-word-wrap { width: 100%; height: 100%; display: flex; flex-direction: column; background: #fff; box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1); }
.docx-preview-container { flex: 1; width: 100%; display: flex; flex-direction: column; align-items: center; background: #f5f7fa; overflow-y: auto; }
:deep(.docx-wrapper) { background: #f5f7fa !important; padding: 20px 0 !important; }
:deep(.docx-wrapper > section.docx) { box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1); margin-bottom: 20px !important; background: #fff; }
.slide-up-enter-active, .slide-up-leave-active { transition: transform 0.28s ease, opacity 0.28s ease; }
.slide-up-enter-from, .slide-up-leave-to { transform: translateY(30px); opacity: 0; }
</style>