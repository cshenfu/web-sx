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
          <el-button link type="primary" :disabled="!generated" @click="handleDownloadAll">
            下载所有文件
          </el-button>
        </div>
      </div>

      <!-- 主体内容：左右分栏 -->
      <div class="gp-body">
        <!-- 左侧表单区 -->
        <div class="gp-form-side">
          <div class="gp-form-inner">
            <!-- 引用项目报告 -->
            <div class="form-row">
              <span class="form-label required">引用项目报告</span>
              <div class="form-control report-ref-row">
                <el-select v-model="form.reportType" class="report-type-select" disabled>
                  <el-option label="项目建议书" value="proposal" />
                </el-select>
                <!-- 远程搜索加载可研报告 -->
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
                    :label="item.reportProjectName || item.fileName"
                    :value="item.id"
                  />
                </el-select>
              </div>
            </div>

            <!-- 申请公司 -->
            <div class="form-row">
              <span class="form-label required">申请公司</span>
              <el-select 
                v-model="form.applyCompany" 
                placeholder="请选择" 
                class="form-control"
                value-key="id"
              >
                <el-option
                  v-for="item in companyOptions"
                  :key="item.id"
                  :label="item.name"
                  :value="item"
                />
              </el-select>
            </div>

            <!-- 请示公司 -->
            <div class="form-row">
              <span class="form-label required">请示公司</span>
              <el-select 
                v-model="form.requestCompany" 
                placeholder="请选择" 
                class="form-control"
                value-key="id"
              >
                <el-option
                  v-for="item in companyOptions"
                  :key="item.id"
                  :label="item.name"
                  :value="item"
                />
              </el-select>
            </div>

            <!-- 前期计划 (仅立项类显示) -->
            <template v-if="!isFeasibility">
              <div class="form-section-title">前期工作计划</div>
              <div class="form-row">
                <span class="form-label">取得项目核准日期</span>
                <el-date-picker
                  v-model="form.approvalDate"
                  type="date"
                  placeholder="选择日期"
                  value-format="YYYY-MM-DD"
                  class="form-control"
                  style="width: 100%"
                />
              </div>
              <div class="form-row">
                <span class="form-label">取得可研审查日期</span>
                <el-date-picker
                  v-model="form.reviewDate"
                  type="date"
                  placeholder="选择日期"
                  value-format="YYYY-MM-DD"
                  class="form-control"
                  style="width: 100%"
                />
              </div>
              <div class="form-row">
                <span class="form-label">完成项目投资决策日期</span>
                <el-date-picker
                  v-model="form.decisionDate"
                  type="date"
                  placeholder="选择日期"
                  value-format="YYYY-MM-DD"
                  class="form-control"
                  style="width: 100%"
                />
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

            <!-- 联系人 -->
            <div class="form-row">
              <span class="form-label">联系人</span>
              <div class="contact-row">
                <el-input v-model="form.contactName" placeholder="姓名" />
                <el-input v-model="form.contactPhone" placeholder="电话" />
              </div>
            </div>

            <!-- 底部按钮 -->
            <div class="gp-form-actions">
              <el-button
                type="primary"
                class="generate-btn"
                :loading="generating"
                @click="handleGenerate"
              >
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
              <div class="loading-tip">正在生成文件，请稍候...</div>
            </div>
            <div v-else-if="generated" class="preview-content">
              <iframe
                v-if="previewType === 'pdf'"
                class="preview-iframe"
                :src="previewUrl"
                frameborder="0"
              />
              <div v-else-if="previewType === 'word'" class="preview-word-wrap">
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
import { createLXReport } from '@/api/modules/report'
import { pageReport } from '@/api/modules/aiProject'

const props = defineProps({
  visible: { type: Boolean, default: false },
  project: { type: Object, default: null },
  actionKey: { type: String, default: '' },
  subCode: { type: String, default: '' },
  toNode: { type: String, default: 'to陕西公司' }, // ★ 由父组件传入
})

const emit = defineEmits(['close', 'generated'])

const REPORT_TITLE_MAP = {
  'gen-application': '立项申请报告生成',
  'gen-letter': '立项请示函生成',
  'gen-report': '可研审查报告生成',
  'gen-investment': '投资决策申请报告生成',
}

const title = computed(() => REPORT_TITLE_MAP[props.actionKey] || '报告生成')
const isFeasibility = computed(() => props.actionKey === 'gen-report')

// AI 项目ID
const aiProjectId = computed(() => props.project?.id || props.project?.projectId || 1001)

// ★ 预览文件配置
const previewUrl = computed(() => {
  if (props.actionKey === 'gen-report') {
    return '/doc/2.pdf'
  } else if (props.actionKey === 'gen-investment') {
    return '/doc/投资决策.docx'
  } else {
    return '/doc/立项报告.docx'
  }
})

const previewType = computed(() => {
  return previewUrl.value.endsWith('.docx') || previewUrl.value.endsWith('.doc') ? 'word' : 'pdf'
})

/* ---------------- 可研报告下拉逻辑 ---------------- */
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
      reportType: 'FEASIBILITY_STUDY',
      fileName: keyword
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
  if (visible && reportOptions.value.length === 0) {
    fetchReportList()
  }
}

/* ---------------- 公司下拉假数据 ---------------- */
// 后期替换为接口请求的数据
const companyOptions = ref([
  { id: 2001, name: '陕西华电永寿新能源有限公司' },
  { id: 2002, name: '华电陕西能源有限公司' },
  { id: 2003, name: '陕西华电新能源发电有限公司' },
])

// 表单数据
const form = reactive({
  reportType: 'proposal',
  applyCompany: { id: 2001, name: '陕西华电永寿新能源有限公司' }, // 默认选中第一个
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

watch(
  () => props.visible,
  (val) => {
    if (val) {
      generated.value = false
      generating.value = false
      selectedReportId.value = ''
      reportOptions.value = []
      // 重置假数据默认选项
      form.applyCompany = companyOptions.value[0] || null
      form.requestCompany = companyOptions.value[1] || null
    }
  }
)

// ★ 核心渲染 Word 逻辑
async function renderWord() {
  if (!wordContainer.value) return
  try {
    const response = await fetch(previewUrl.value)
    if (!response.ok) throw new Error('文件获取失败')
    const blob = await response.blob()

    wordContainer.value.innerHTML = ''
    await renderAsync(blob, wordContainer.value, null, {
      className: 'docx-preview',
      inWrapper: true,
      ignoreWidth: false,
      breakPages: true,
      renderHeaders: true,
      renderFooters: true,
    })
  } catch (err) {
    console.error('Word 渲染失败:', err)
    ElMessage.error('Word 文件预览加载失败，请点击右上角下载')
  }
}

// 格式化时间为 YYYY年M月
function formatToMonth(dateStr) {
  if (!dateStr) return undefined
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return dateStr
  return `${date.getFullYear()}年${date.getMonth() + 1}月`
}

/* ---------------- 核心生成逻辑 ---------------- */
async function handleGenerate() {
  if (generating.value) return

  if (!selectedReportId.value) {
    ElMessage.warning('请选择引用的可研报告')
    return
  }
  
  if (!form.applyCompany || !form.requestCompany) {
    ElMessage.warning('请选择申请公司和请示公司')
    return
  }

  generating.value = true
  generated.value = false

  try {
    // 组装接口参数
    const submitData = {
      aiProjectId: aiProjectId.value,
      reportProjectId: selectedReportId.value,
      toNode: props.toNode, // ★ 从父组件带入
      
      applyCompanyId: form.applyCompany.id,
      applyCompanyName: form.applyCompany.name,
      requestCompanyId: form.requestCompany.id,
      requestCompanyName: form.requestCompany.name,
      
      contactName: form.contactName,
      contactPhone: form.contactPhone,
    }

    // 如果不是可研审查（立项、投决等），则带上计划与费用参数
    if (!isFeasibility.value) {
      submitData.applyEarlyCost = form.applyFee ? Number(form.applyFee) : undefined
      submitData.thisYearEarlyCost = form.estimateFee ? Number(form.estimateFee) : undefined
      
      submitData.planApprovalTime = formatToMonth(form.approvalDate)
      submitData.planFeasibilityTime = formatToMonth(form.reviewDate)
      submitData.planInvestmentDecisionTime = formatToMonth(form.decisionDate)
    }

    // 真实调用接口
    await createLXReport(submitData)
    
    generating.value = false
    generated.value = true
    emit('generated', { actionKey: props.actionKey, subCode: props.subCode })

    if (previewType.value === 'word') {
      await nextTick()
      await renderWord()
    }
  } catch (error) {
    console.error('生成报告失败:', error)
    ElMessage.error(error.message || '生成报告失败，请重试')
    generating.value = false
  }
}

function handlePrint() {
  window.print()
}

function handleDownloadAll() {
  ElMessage.success('下载所有文件（模拟）')
}

function handleClose() {
  if (generating.value) {
    ElMessage.warning('正在生成中，请稍候')
    return
  }
  emit('close')
}
</script>

<style scoped>
.generate-panel {
  position: fixed;
  top: 65px;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 300;
  display: flex;
  flex-direction: column;
  background: #fff;
}

/* Header */
.gp-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 48px;
  padding: 0 20px;
  border-bottom: 1px solid #ebeef5;
  flex-shrink: 0;
}
.gp-header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}
.gp-back-btn {
  font-size: 16px;
}
.gp-title {
  color: #303133;
  font-size: 15px;
  font-weight: 600;
}
.gp-header-right {
  display: flex;
  gap: 16px;
}

/* Body */
.gp-body {
  flex: 1;
  display: flex;
  min-height: 0;
}

/* 左侧表单 */
.gp-form-side {
  width: 45%;
  min-width: 480px;
  overflow-y: auto;
  border-right: 1px solid #ebeef5;
  background: #fff;
}
.gp-form-inner {
  padding: 24px 40px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.form-row {
  display: flex;
  align-items: center;
  gap: 16px;
}
.form-label {
  width: 140px;
  flex-shrink: 0;
  color: #606266;
  font-size: 13px;
  text-align: right;
}
.form-label.required::before {
  content: '*';
  color: #f56c6c;
  margin-right: 4px;
}
.form-control {
  flex: 1;
}
.form-control.with-unit {
  display: flex;
  align-items: center;
  gap: 8px;
}
.form-control.with-unit .el-input {
  flex: 1;
}
.unit {
  color: #909399;
  font-size: 13px;
}

.report-ref-row {
  display: flex;
  gap: 8px;
}
.report-type-select {
  width: 120px;
  flex-shrink: 0;
}
.report-ref-select {
  flex: 1;
}

.form-section-title {
  margin-top: 8px;
  margin-bottom: -4px;
  color: #303133;
  font-size: 13px;
  font-weight: 600;
}

.contact-row {
  flex: 1;
  display: flex;
  gap: 12px;
}
.contact-row .el-input {
  flex: 1;
}

.gp-form-actions {
  display: flex;
  justify-content: center;
  margin-top: 40px;
}
.generate-btn {
  width: 200px;
  height: 40px;
  border-radius: 4px; /* 根据原型图看起来是圆角矩形 */
  font-size: 14px;
}

/* 右侧预览 */
.gp-preview-side {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
  min-width: 0;
  min-height: 0;
}
.gp-preview-header {
  height: 40px;
  padding: 0 20px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #ebeef5;
  background: #fff;
  flex-shrink: 0;
}
.preview-title {
  color: #303133;
  font-size: 13px;
  font-weight: 600;
}
.gp-preview-body {
  flex: 1;
  overflow: auto;
  padding: 20px;
  min-height: 0;
  box-sizing: border-box;
}

.preview-empty {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
  font-size: 13px;
}
.preview-loading {
  background: #fff;
  padding: 40px;
  border-radius: 4px;
  height: 100%;
  box-sizing: border-box;
}
.loading-tip {
  margin-top: 24px;
  text-align: center;
  color: #909399;
  font-size: 13px;
}

.preview-content {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
}

/* PDF 和 Word 的统一外观 */
.preview-iframe {
  width: 100%;
  height: 100%;
  background: #fff;
  border: none;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.preview-word-wrap {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.docx-preview-container {
  flex: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #f5f7fa;
  overflow-y: auto;
}

:deep(.docx-wrapper) {
  background: #f5f7fa !important;
  padding: 20px 0 !important;
}
:deep(.docx-wrapper > section.docx) {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px !important;
  background: #fff;
}

/* Transition */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.28s ease, opacity 0.28s ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(30px);
  opacity: 0;
}
</style>