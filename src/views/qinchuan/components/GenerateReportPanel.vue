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
        <!-- ================= 左侧表单区 ================= -->
        <div class="gp-form-side">
          
          <!-- ★ 情况 A：竞配申请文件专属表单 -->
          <div v-if="isCompetitive" class="gp-form-inner comp-form-inner">
            
            <!-- 竞配申报 -->
            <div class="form-row">
              <span class="form-label required" style="color:#e6a23c;">竞配申报</span>
              <div class="form-control flex-between">
                <el-select 
                  v-model="compForm.competitiveFileId" 
                  filterable remote 
                  :remote-method="(q) => fetchCompReportList(q)" 
                  :loading="compReportLoading" 
                  placeholder="请选择申报文件" 
                  class="flex-1"
                  @visible-change="(v) => handleDropdownVisibleChange(v, 'comp')"
                  @change="checkAndFetchScore"
                >
                  <el-option v-for="item in compReportOptions" :key="item.id" :label="item.reportProjectName || item.fileName" :value="item.id" />
                </el-select>
                <span class="link-text" @click="handleUploadCompetitiveFile">添加申报文件</span>
              </div>
            </div>

            <!-- 可研报告（★ 修改点：竞配这里用 reportProjectId） -->
            <div class="form-row">
              <span class="form-label">可研报告</span>
              <div class="form-control report-ref-row">
                <span class="reference-tag">可研报告</span>
                <el-select 
                  v-model="compForm.reportId" 
                  filterable remote 
                  :remote-method="(q) => fetchReportList(q)" 
                  :loading="reportLoading" 
                  placeholder="请选择可研报告" 
                  class="flex-1"
                  @visible-change="(v) => handleDropdownVisibleChange(v, 'feasibility')"
                  @change="checkAndFetchScore"
                >
                  <el-option 
                    v-for="item in reportOptions" 
                    :key="item.id" 
                    :label="item.reportProjectName || item.fileName" 
                    :value="item.reportProjectId || item.id" 
                  />
                </el-select>
              </div>
            </div>

            <!-- 资源报告 (假数据) -->
            <div class="form-row">
              <span class="form-label">资源报告</span>
              <div class="form-control">
                <el-select v-model="compForm.resourceId" placeholder="请选择资源报告" class="flex-1" disabled>
                  <el-option label="陕西华电白水20万千瓦风力发电项目风资源评估报告" value="mock-resource" />
                </el-select>
              </div>
            </div>

            <!-- 是否取得测风塔 -->
            <div class="form-row">
              <span class="form-label" style="width: 260px; line-height: 1.4; padding-top: 4px; text-align: left;">
                是否已取得测风塔服务采购合同<br/>(包括测风塔坐标描述)及发票复印件
              </span>
              <el-select v-model="compForm.hasContract" style="width: 120px" @change="checkAndFetchScore">
                <el-option label="是" value="1" />
                <el-option label="否" value="0" />
              </el-select>
            </div>

            <!-- 申报企业 -->
            <div class="form-row">
              <span class="form-label required" style="color:#e6a23c;">申报企业</span>
              <div class="form-control flex-between">
                <el-select v-model="compForm.companyId" placeholder="请选择企业" class="flex-1" @change="checkAndFetchScore">
                  <el-option label="陕西华电新能源发电有限公司" value="1" />
                  <el-option label="陕西华电永寿新能源有限公司" value="2" />
                </el-select>
                <span class="link-text" @click="handleOpenCompanyInfo">企业信息</span>
              </div>
            </div>

            <!-- 竞配评分表格 -->
                        <!-- 竞配评分表格 -->
            <div class="form-row mt-4">
              <span class="form-label required" style="color:#e6a23c;">竞配评分</span>
            </div>
            <div class="score-table-wrap" v-loading="fetchingScore">
              <table class="score-table">
                <thead v-if="scoreTableData.length > 1">
                  <tr>
                    <th width="45">{{ scoreTableData[0][0] }}</th>
                    <th width="120">{{ scoreTableData[0][1] }}</th>
                    <th width="120">{{ scoreTableData[0][2] }}</th>
                    <th>{{ scoreTableData[0][3] }}</th>
                    <th width="50">{{ scoreTableData[0][4] }}</th>
                  </tr>
                </thead>
                <tbody>
                  <!-- 渲染数据行（跳过第一行表头） -->
                  <template v-if="scoreTableData.length > 1">
                    <tr v-for="(row, index) in scoreTableData.slice(1)" :key="index">
                      <td align="center">{{ row[0] }}</td>
                      <td align="center">{{ row[1] }}</td>
                      <td align="center">{{ row[2] }}</td>
                      <td>
                        <div class="desc-text">{{ row[3] }}</div>
                      </td>
                      <td align="center">{{ row[4] }}</td>
                    </tr>
                  </template>
                  <tr v-else>
                    <td colspan="5" align="center" class="empty-tip">请先完善上方必填项以获取评分数据</td>
                  </tr>
                  <!-- 总计行 -->
                  <tr class="total-row">
                    <td colspan="3" align="center">总计</td>
                    <td align="center">/</td>
                    <td align="center">{{ totalScore }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- 申报承诺书 -->
            <div class="form-row mt-4">
              <span class="form-label required" style="color:#e6a23c;">申报承诺书</span>
              <div class="form-control">
                <span class="link-text" style="margin-right: 12px;">上传附件</span>
                <span class="danger-text">严禁上传国家秘密文件，违规必究</span>
                <div class="upload-tip">支持pdf格式数据（最多上传1个），非必填</div>
              </div>
            </div>

            <div class="gp-form-actions">
              <el-button type="primary" class="generate-btn" :loading="generating" @click="handleGenerate">
                开始生成
              </el-button>
            </div>
          </div>

          <!-- ★ 情况 B：常规表单（立项、投决、请示等，这里用 item.id） -->
          <div v-else class="gp-form-inner">
            <div class="form-row">
              <span class="form-label required">引用项目报告</span>
              <div class="form-control report-ref-row">
                <el-select v-model="form.reportType" class="report-type-select" disabled>
                  <el-option label="可研报告" value="FEASIBILITY_STUDY" />
                </el-select>
                <el-select v-model="selectedReportId" class="report-ref-select" filterable remote :remote-method="fetchReportList" :loading="reportLoading" placeholder="请选择可研报告" @visible-change="(v) => handleDropdownVisibleChange(v, 'feasibility')">
                  <el-option 
                    v-for="item in reportOptions" 
                    :key="item.id" 
                    :label="`${item.reportProjectName || item.fileName} (${item.reportProjectCode || '-'})`" 
                    :value="item.id" 
                  />
                </el-select>
              </div>
            </div>
            
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

            <template v-if="['gen-application', 'gen-letter'].includes(props.actionKey)">
              <div class="form-section-title">前期工作计划</div>
              <div class="form-row"><span class="form-label">取得项目核准日期</span><el-date-picker v-model="form.approvalDate" type="date" value-format="YYYY-MM-DD" class="form-control" style="width: 100%" /></div>
              <div class="form-row"><span class="form-label">取得可研审查日期</span><el-date-picker v-model="form.reviewDate" type="date" value-format="YYYY-MM-DD" class="form-control" style="width: 100%" /></div>
              <div class="form-row"><span class="form-label">完成项目投资决策日期</span><el-date-picker v-model="form.decisionDate" type="date" value-format="YYYY-MM-DD" class="form-control" style="width: 100%" /></div>
              <div class="form-section-title">前期费用计划</div>
              <div class="form-row"><span class="form-label">拟申请前期费用</span><div class="form-control with-unit"><el-input v-model="form.applyFee" type="number" /><span class="unit">万元</span></div></div>
              <div class="form-row"><span class="form-label">本年预计发送费用</span><div class="form-control with-unit"><el-input v-model="form.estimateFee" type="number" /><span class="unit">万元</span></div></div>
            </template>

            <div class="form-row" v-if="props.actionKey !== 'gen-invest-commitment'">
              <span class="form-label">联系人</span>
              <div class="contact-row">
                <el-input v-model="form.contactName" placeholder="姓名" />
                <el-input v-model="form.contactPhone" placeholder="电话" />
              </div>
            </div>

            <div class="gp-form-actions">
              <el-button type="primary" class="generate-btn" :loading="generating" @click="handleGenerate">
                开始生成
              </el-button>
            </div>
          </div>
        </div>

        <!-- ================= 右侧预览区 ================= -->
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

      <!-- ★ 隐藏的竞配文件上传 input -->
      <input
        ref="compFileInputRef"
        type="file"
        accept=".doc,.docx,.pdf"
        style="display: none"
        @change="onCompFileChange"
      />

      <!-- ★ 新增：引入的企业信息弹窗 -->
      <CompanyInfoModal
        v-model:visible="showCompanyModal"
        :company-id="currentCompanyId"
        :company-name="currentCompanyName"
      />
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
import { useOssUpload } from '@/components/ossClient/index'
import { pageReport, createReport, uploadReport } from '@/api/modules/aiProject'
import * as fileApi from '@/api/modules/projectFile'
import { createLXReport, createCNSReport, createTZJCReport, createJPReport } from '@/api/modules/report'
// 引入刚刚写的企业弹窗组件
import CompanyInfoModal from '@/components/companyDialog/index.vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  project: { type: Object, default: null },
  actionKey: { type: String, default: '' },
  subCode: { type: String, default: '' },
  aiDetail: { type: Object, default: null },
  source: { type: String, default: '' },                    // ★
  firstBusinessTitle: { type: String, default: '' },        // ★
  secondaryBusinessTitle: { type: String, default: '' },    // ★
  fileTypeTag: { type: String, default: '' },               // ★
})

const needUpdateFile = computed(() => props.source === 'sitemap-detail')

const emit = defineEmits(['close', 'generated'])

const isCompetitive = computed(() => ['gen-competitive', 'bidding'].includes(props.actionKey))

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
  'bidding': '竞配申请文件生成',
  'gen-competitive': '竞配申请文件生成',
}

const TEMPLATE_MAP = {
  'gen-application': '/templates/initiation-application.docx',
  'gen-letter': '/templates/initiation-letter.docx',
  'gen-report': '/templates/feasibility-review.docx',
  'gen-invest-apply': '/templates/investment-application.docx',
  'gen-invest-letter': '/templates/investment-letter.docx',
  'gen-invest-commitment': '/templates/investment-commitment.docx',
  'gen-audit-notice': '/templates/audit-notice.docx',
  'gen-audit-topic': '/templates/audit-topic.docx',
  'gen-filing-report': '/templates/filing-report.docx',
  'gen-approval-doc': '/templates/approval-document.docx',
  'bidding': '/templates/competitive-application.docx',
  'gen-competitive': '/templates/competitive-application.docx',
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
  'bidding': 'COMPETITIVE_ALLOCATION',
  'gen-competitive': 'COMPETITIVE_ALLOCATION',
}

const title = computed(() => REPORT_TITLE_MAP[props.actionKey] || '报告生成')
const aiProjectId = computed(
  () => props.project?.aiProjectId ?? props.aiDetail?.rawAiData?.aiProjectId ?? props.project?.id ?? 1001
)
const templatePath = computed(() => TEMPLATE_MAP[props.actionKey] || '/templates/wind-proposal.docx')

const companyLabel1 = computed(() => (props.actionKey === 'gen-invest-commitment' ? '建设公司' : '申请公司'))
const companyLabel2 = computed(() => (props.actionKey === 'gen-invest-commitment' ? '投资公司' : '请示公司'))

// ================= 状态管理 =================
// 1. 常规表单
const selectedReportId = ref('')
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

// 2. 竞配表单
const compForm = reactive({
  competitiveFileId: '',
  reportId: '',
  resourceId: 'mock-resource',
  hasContract: '0',
  companyId: '',
})
const scoreTableData = ref([])
const totalScore = ref('0')
const fetchingScore = ref(false)
const compResParams = ref(null)

// 3. 弹窗及下拉列表
const showCompanyModal = ref(false)
const currentCompanyId = ref('')
const currentCompanyName = ref('')

const reportOptions = ref([])
const reportLoading = ref(false)
const compReportOptions = ref([])
const compReportLoading = ref(false)

const companyOptions = ref([
  { id: 2001, name: '陕西华电永寿新能源有限公司' },
  { id: 2002, name: '华电陕西能源有限公司' },
  { id: 2003, name: '陕西华电新能源发电有限公司' },
])

const generating = ref(false)
const generated = ref(false)
const wordContainer = ref(null)
const generatedFilePath = ref('')
const compFileInputRef = ref(null)

watch(() => props.visible, (val) => {
  if (val) {
    generated.value = false
    generating.value = false
    generatedFilePath.value = ''
    
    // 重置数据
    selectedReportId.value = ''
    reportOptions.value = []
    form.applyCompany = companyOptions.value[0] || null
    form.requestCompany = companyOptions.value[1] || null
    
    compForm.competitiveFileId = ''
    compForm.reportId = ''
    compForm.companyId = ''
    compReportOptions.value = []
    scoreTableData.value = []
    totalScore.value = '0'
    compResParams.value = null
  }
})

// 双重保险：1. 使用 watch 深度监听
watch(
  () => [compForm.competitiveFileId, compForm.reportId, compForm.companyId],
  ([fileId, reportId, companyId]) => {
    if (fileId && reportId && companyId) {
      fetchScoreTable()
    }
  }
)

// 双重保险：2. 在 @change 中直接触发的方法
function checkAndFetchScore() {
  setTimeout(() => {
    const { competitiveFileId, reportId, companyId } = compForm
    if (competitiveFileId && reportId && companyId) {
      fetchScoreTable()
    }
  }, 50)
}

// ================= 接口请求 =================
async function fetchReportList(keyword = '') {
  if (!aiProjectId.value) return
  reportLoading.value = true
  try {
    const res = await pageReport({
      aiProjectId: aiProjectId.value, pageNo: 1, pageSize: 20,
      status: 'COMPLETED', reportType: 'FEASIBILITY_STUDY', fileName: keyword,
    })
    reportOptions.value = res.data?.list || res.list || []
  } catch (error) {
    ElMessage.error('获取可研报告列表失败')
  } finally {
    reportLoading.value = false
  }
}

async function fetchCompReportList(keyword = '') {
  if (!aiProjectId.value) return
  compReportLoading.value = true
  try {
    const res = await pageReport({
      aiProjectId: aiProjectId.value, pageNo: 1, pageSize: 20,
      status: 'COMPLETED', reportType: 'COMPETITIVE_ALLOCATION', fileName: keyword,
    })
    compReportOptions.value = res.data?.list || res.list || []
  } catch (error) {
    ElMessage.error('获取竞配申报列表失败')
  } finally {
    compReportLoading.value = false
  }
}

function handleDropdownVisibleChange(visible, type) {
  if (!visible) return
  if (type === 'feasibility' && reportOptions.value.length === 0) {
    fetchReportList()
  }
  if (type === 'comp' && compReportOptions.value.length === 0) {
    fetchCompReportList()
  }
}

// ================= 竞配特定逻辑 =================
function handleUploadCompetitiveFile() {
  compFileInputRef.value?.click()
}

async function onCompFileChange(e) {
  const file = e.target.files?.[0]
  if (!file) return

  const ext = file.name.split('.').pop()?.toLowerCase()
  if (!['doc', 'docx', 'pdf'].includes(ext)) {
    ElMessage.warning('仅支持 doc、docx、pdf 格式的文件')
    e.target.value = ''
    return
  }

  compReportLoading.value = true
  try {
    const ossUpload = useOssUpload()
    const uploadRes = await ossUpload.uploadFile(file)
    const fileUrl = uploadRes?.obsPath || uploadRes?.url
    
    if (!fileUrl) throw new Error('文件上传失败，未获取到URL')

    const payload = {
      aiProjectId: aiProjectId.value,
      fileName: file.name,
      fileSize: file.size,
      fileSuffix: ext,
      fileUrl: fileUrl,
      remark: '竞配申报文件追加',
      reportType: 'COMPETITIVE_ALLOCATION'
    }

    const res = await uploadReport(payload)
    
    if (res?.code === 200 || res?.code === '200' || res?.success) {
      ElMessage.success('申报文件上传成功')
      await fetchCompReportList()
      
      const newRecordId = res.data?.id || res.data?.reportId
      if (newRecordId) {
        compForm.competitiveFileId = newRecordId
      } else if (compReportOptions.value.length > 0) {
        compForm.competitiveFileId = compReportOptions.value[0].id
      }
      checkAndFetchScore()
    } else {
      ElMessage.error(res?.msg || '保存文件记录失败')
    }
  } catch (err) {
    console.error('上传申报文件异常:', err)
    ElMessage.error(err.message || '上传失败')
  } finally {
    compReportLoading.value = false
    e.target.value = ''
  }
}

// 点击“企业信息”
function handleOpenCompanyInfo() {
  if (!compForm.companyId) {
    return ElMessage.warning('请先选择申报企业')
  }
  currentCompanyId.value = compForm.companyId
  currentCompanyName.value = compForm.companyId === '1' 
    ? '陕西华电新能源发电有限公司' 
    : '陕西华电永寿新能源有限公司'
  
  showCompanyModal.value = true
}

// ★ 调用接口获取评分表格及 Word 渲染参数
// ★ 调用接口获取评分表格及 Word 渲染参数
async function fetchScoreTable() {
  if (fetchingScore.value) return
  fetchingScore.value = true
  console.log('【开始请求评分表格】数据已准备齐全')
  try {
    const enterpriseName = compForm.companyId === '1' 
      ? '陕西华电新能源发电有限公司' 
      : '陕西华电永寿新能源有限公司'

    const payload = {
      aiProjectId: aiProjectId.value,
      // 强制转 String 防精度丢失
      fsProjectId: compForm.reportId,
      enterpriseId: Number(compForm.companyId),
      enterpriseName: enterpriseName,
      resourceReportId: compForm.resourceId,
      resourceReportName: '陕西华电白水20万千瓦风力发电项目风资源评估报告',
      contractObj:1,
      declarationLevel: 'province',
    }

    const res = await createJPReport(payload)
    console.log('【评分接口返回】', res)

    if (res.code === 200 && res.data) {
      const data = res.data
      
      // 1. 整个 data 就是 Word 的渲染参数（里面全是 "${xxx}" 的 key）
      compResParams.value = data 

      // 2. 获取表格数据（注意 key 带有 ${}）
      // 优先取带 ${} 的，如果没有，再取普通的 selfScoreTable
      const rawTable = data['${selfScoreTable}'] || data.selfScoreTable
      
      if (rawTable && Array.isArray(rawTable)) {
        scoreTableData.value = rawTable
        
        // 3. 自动计算总分（跳过第 0 行表头，从第 1 行开始累加第 4 列得分）
        let sum = 0
        for (let i = 1; i < rawTable.length; i++) {
          const row = rawTable[i]
          const scoreStr = row[4] // 第 5 列是得分
          if (scoreStr !== undefined && scoreStr !== null && scoreStr !== '') {
            const val = Number(scoreStr)
            if (!isNaN(val)) sum += val
          }
        }
        totalScore.value = String(sum)
        console.log('【解析表格成功】总得分为:', sum, '行数:', rawTable.length)
      } else {
        scoreTableData.value = []
        totalScore.value = '0'
        console.warn('【警告】接口返回中没有找到 ${selfScoreTable} 或 selfScoreTable')
      }
      
      ElMessage.success('评分数据获取成功')
    } else {
      ElMessage.error(res.msg || '评分计算失败')
    }
  } catch (error) {
    console.error('获取评分数据失败:', error)
    ElMessage.error('获取评分数据失败')
  } finally {
    fetchingScore.value = false
  }
}

// ================= 通用渲染与上传逻辑 =================
async function renderTemplateToBlob(data) {
  const res = await fetch(templatePath.value)
  if (!res.ok) throw new Error(`模板加载失败`)
  const buf = await res.arrayBuffer()
  const zip = new PizZip(buf)
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true, linebreaks: true,
    delimiters: { start: '${', end: '}' }, nullGetter: () => '',
  })
  doc.render(JSON.parse(JSON.stringify(data)))
  return doc.getZip().generate({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
}

function mergeFillData(params, aiDetail) {
  const normalized = {}
  for (const [k, v] of Object.entries(params || {})) {
    const key = k.replace(/^\$\{/, '').replace(/\}$/, '')
    normalized[key] = v === null || v === 'null' || v === 'nullnull' ? '' : v
  }
  const rawAi = aiDetail?.rawAiData || aiDetail || {}
  const p = rawAi.reportParamResult || {}
  
  return {
    ...normalized,
    project_name: normalized.project_name || rawAi.reportProjectName || props.project?.projectName || '',
    project_construction_site: normalized.project_construction_site || p.projectAddress || '',
    total_turbine_count: normalized.total_turbine_count || p.turbineCount || '',
    rated_power: normalized.rated_power || p.ratedPower || '',
    projectSelectedDeviceInstallCapacity: normalized.projectSelectedDeviceInstallCapacity || p.actualCapacity || '',
    hub_height: normalized.hub_height || p.hubHeight || '',
    wheel_diameter: normalized.wheel_diameter || p.rotorDiameter || '',
  }
}

async function uploadGeneratedFile(blob, fileName) {
  try {
    const file = new File([blob], fileName, { type: blob.type })
    const obsUpload = useOssUpload()
    const uploadResult = await obsUpload.uploadFile(file)
    return uploadResult.obsPath
  } catch (err) {
    throw new Error('文件上传至云端失败')
  }
}

async function submitReport({ fileUrl, fileName, resData }) {
  const selectedItem = reportOptions.value.find(r => r.id === selectedReportId.value) || {}
  
  const finalReportType = REPORT_TYPE_MAP[props.actionKey] || 'PROJECT_INITIATION'

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
    paramSourceReportId: isCompetitive.value ? compForm.reportId : selectedReportId.value,
  }
  return await createReport(payload)
}

async function syncToMeetingTab(fileUrl, fileName, fileSuffix) {
  // 保持你原有的逻辑
}

// ================= 核心生成逻辑 =================

function buildUpdateFilePayload({ id, fileUrl, fileName, resData }) {
  const recognitionContent = resData?.params ?? {}
  return {
    id,
    aiProjectId: aiProjectId.value,
    firstBusinessTitle: props.firstBusinessTitle || '',
    secondaryBusinessTitle: props.secondaryBusinessTitle || props.subCode || '',
    fileTypeTag: props.fileTypeTag || title.value,
    isRequiredUpload: false,
    recognitionContent,
    fileUrlList: [{
      fileName,
      filePath: fileUrl,
      fileSuffix: 'docx',
      recognitionContent,
    }],
  }
}

async function handleGenerate() {
  if (generating.value) return

  // ========== ① 校验 ==========
  if (isCompetitive.value) {
    if (!compForm.competitiveFileId) return ElMessage.warning('请选择竞配申报文件')
    if (!compForm.reportId) return ElMessage.warning('请选择可研报告')
    if (!compForm.companyId) return ElMessage.warning('请选择申报企业')
    if (!compResParams.value) return ElMessage.warning('请等待评分数据加载完毕再生成')
  } else {
    if (!selectedReportId.value) return ElMessage.warning('请选择引用的可研报告')
    if (!form.applyCompany) return ElMessage.warning(`请选择${companyLabel1.value}`)
    if (props.actionKey !== 'gen-invest-commitment' && !form.requestCompany) {
      return ElMessage.warning(`请选择${companyLabel2.value}`)
    }
  }

  generating.value = true
  generated.value = false
  generatedFilePath.value = ''

  try {
    // ========== ② 获取 Word 渲染参数 ==========
    let resData = null

    if (isCompetitive.value) {
      resData = { params: compResParams.value }
    } else if (['gen-application', 'gen-letter'].includes(props.actionKey)) {
      const submitData = {
        aiProjectId: aiProjectId.value, reportProjectId: selectedReportId.value,
        toNode: getToNodeLabel(), applyCompanyId: form.applyCompany.id, applyCompanyName: form.applyCompany.name,
        requestCompanyId: form.requestCompany.id, requestCompanyName: form.requestCompany.name,
        contactName: form.contactName, contactPhone: form.contactPhone,
        applyEarlyCost: form.applyFee ? Number(form.applyFee) : undefined,
        thisYearEarlyCost: form.estimateFee ? Number(form.estimateFee) : undefined,
        planApprovalTime: formatToMonth(form.approvalDate), planFeasibilityTime: formatToMonth(form.reviewDate),
        planInvestmentDecisionTime: formatToMonth(form.decisionDate),
      }
      const res = await createLXReport(submitData)
      resData = res.data || res
    } else if (props.actionKey === 'gen-invest-commitment') {
      const submitData = { aiProjectId: aiProjectId.value, fsProjectId: selectedReportId.value, constructProjectName: form.applyCompany?.name }
      const res = await createCNSReport(submitData)
      resData = res.data || res
    } else {
      const submitData = {
        aiProjectId: aiProjectId.value, fsProjectId: selectedReportId.value,
        companyName: form.applyCompany?.name, requestCompanyId: String(form.requestCompany?.id),
        requestCompanyName: form.requestCompany?.name, nickname: form.contactName,
        mobile: form.contactPhone, toNode: getToNodeLabel(),
      }
      const res = await createTZJCReport(submitData)
      resData = res.data || res
    }

    // ========== ③ 渲染 Word 并展示 ==========
    const fillData = mergeFillData(resData.params || {}, props.aiDetail)
    const blob = await renderTemplateToBlob(fillData)

    generating.value = false
    generated.value = true
    await nextTick()

    if (wordContainer.value) {
      wordContainer.value.innerHTML = ''
      await renderAsync(blob, wordContainer.value, null, {
        className: 'docx-preview', inWrapper: true, ignoreWidth: false, breakPages: true,
      })
    }

    // ========== ④ 上传 OSS ==========
    const fileName = `${title.value}_${props.subCode || 'R'}_${Date.now()}.docx`
    const fileUrl = await uploadGeneratedFile(blob, fileName)
    generatedFilePath.value = fileUrl

    // ========== ⑤ createReport 落库 ==========
    const createRes = await submitReport({ fileUrl, fileName, resData })
    if (Number(createRes?.code) !== 200) {
      throw new Error(createRes?.msg || '报告记录保存失败，请稍后重试')
    }

    // ========== ⑥ 仅 sitemap-detail 来源：create 后调 updateFile 补全归档 ==========
    const needUpdate = ['sitemap-detail', 'report-tab'].includes(props.source)
    if (needUpdate && createRes?.code === 200) {
      // —— 内联 extractCreatedId ——
      const d = createRes?.data
      const newRecordId =
        d == null
          ? null
          : typeof d === 'number' || typeof d === 'string'
            ? d
            : (d.id ?? d.reportId ?? d.recordId ?? null)

      if (!newRecordId) {
        console.warn('[updateFile] createReport 返回中未获取到记录 ID，跳过归档')
        ElMessage.warning('报告已生成，但未获取到归档 ID，请检查后端返回结构')
      } else {
        // —— 内联 buildUpdateFilePayload ——
        const recognitionContent = resData?.params ?? {}
        const updatePayload = {
          id: newRecordId,
          aiProjectId: aiProjectId.value,
          firstBusinessTitle: props.firstBusinessTitle || '',
          secondaryBusinessTitle: props.secondaryBusinessTitle || props.subCode || '',
          fileTypeTag: props.fileTypeTag || title.value,
          isRequiredUpload: false,
          recognitionContent,
          fileUrlList: [
            {
              fileName,
              filePath: fileUrl,
              fileSuffix: 'docx',
              recognitionContent,
            },
          ],
        }

        try {
          const updateRes = await fileApi.updateFile(updatePayload)
          if (updateRes?.code !== 200) {
            console.warn('[updateFile] 返回非 200:', updateRes)
            ElMessage.warning('报告已生成，但归档信息更新失败：' + (updateRes?.msg || ''))
          }
        } catch (e) {
          console.warn('[updateFile] 调用失败', e)
          ElMessage.warning('报告已生成，但归档信息更新失败')
        }
      }
    }

    // ========== ⑦ 同步上会流程（占位） ==========
    await syncToMeetingTab(fileUrl, fileName, 'docx')

    ElMessage.success('报告已生成并同步至上会流程')
    const createdData = createRes?.data
    const createdReportId = createdData == null
      ? null
      : typeof createdData === 'number' || typeof createdData === 'string'
        ? createdData
        : (createdData.id ?? createdData.reportId ?? createdData.recordId ?? null)
    emit('generated', {
      actionKey: props.actionKey,
      subCode: props.subCode,
      reportType: REPORT_TYPE_MAP[props.actionKey] || 'PROJECT_INITIATION',
      reportId: createdReportId,
      project: props.project,
    })
  } catch (err) {
    console.error('[生成失败]', err)
    ElMessage.error(err.message || '生成报告失败')
    generating.value = false
    generated.value = false
  }
}

function getToNodeLabel() {
  const sub = props.subCode
  if (sub === 'PIM_TO_NEW_ENERGY_COMPANY' || sub === 'IDM_TO_NEW_ENERGY_COMPANY') return 'to新能源公司'
  if (sub === 'PIM_TO_SHAANXI_COMPANY' || sub === 'IDM_TO_SHAANXI_COMPANY') return 'to陕西公司'
  if (sub === 'IDM_TO_GROUP') return 'to集团公司'
  return 'to陕西公司'
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
    if (url) window.open(url, '_blank')
  } catch (error) { ElMessage.error('下载文件失败') }
}
function handleClose() {
  if (generating.value) return ElMessage.warning('正在生成中，请稍候')
  emit('close')
}
</script>

<style scoped>
/* ===== 原有基础样式 ===== */
.generate-panel { position: fixed; top: 65px; left: 0; right: 0; bottom: 0; z-index: 300; display: flex; flex-direction: column; background: #fff; }
.gp-header { display: flex; align-items: center; justify-content: space-between; height: 48px; padding: 0 20px; border-bottom: 1px solid #ebeef5; flex-shrink: 0; }
.gp-header-left { display: flex; align-items: center; gap: 8px; }
.gp-back-btn { font-size: 16px; }
.gp-title { color: #303133; font-size: 15px; font-weight: 600; }
.gp-header-right { display: flex; gap: 16px; }
.gp-body { flex: 1; display: flex; min-height: 0; }
.gp-form-side { width: 50%; min-width: 600px; overflow-y: auto; border-right: 1px solid #ebeef5; background: #fff; }
.gp-form-inner { padding: 24px 40px; display: flex; flex-direction: column; gap: 16px; }
.form-row { display: flex; align-items: flex-start; gap: 16px; }
.form-label { width: 140px; flex-shrink: 0; color: #606266; font-size: 13px; text-align: right; padding-top: 8px; }
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
.gp-form-actions { display: flex; justify-content: center; margin-top: 24px; }
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

/* ===== 竞配专属样式 ===== */
.flex-between { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.flex-1 { flex: 1; }
.link-text { color: #3b82f6; font-size: 12px; cursor: pointer; white-space: nowrap; }
.link-text:hover { text-decoration: underline; }
.danger-text { color: #f56c6c; font-size: 12px; font-weight: bold; }
.upload-tip { font-size: 12px; color: #909399; margin-top: 4px; }
.mt-4 { margin-top: 16px; }

/* 表格区域 */
.score-table-wrap { width: 100%; padding-left: 156px; padding-right: 16px; }
.score-table { width: 100%; border-collapse: collapse; font-size: 12px; color: #333; table-layout: fixed; }
.score-table th, .score-table td { border: 1px solid #e2e8f0; padding: 6px 8px; vertical-align: top; word-break: break-all; }
.score-table th { background-color: #f8fafc; color: #475569; font-weight: 500; text-align: center; }
.desc-text { line-height: 1.6; color: #4b5563; }
.total-row td { background-color: #f9f9f9; font-weight: bold; }
.empty-tip { color: #909399; padding: 20px 0 !important; }
</style>