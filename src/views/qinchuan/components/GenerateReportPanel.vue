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
                <el-select v-model="form.reportType" class="report-type-select">
                  <el-option :label="isFeasibility ? '可研报告' : '立项报告'" :value="isFeasibility ? 'feasibility' : 'initiation'" />
                </el-select>
                <el-select v-model="form.reportRef" placeholder="请选择" class="report-ref-select">
                  <el-option
                    label="陕西华电白水20万千瓦风力发电项目"
                    value="report-1"
                  />
                </el-select>
              </div>
            </div>

            <!-- 申请公司 -->
            <div class="form-row">
              <span class="form-label">申请公司</span>
              <el-select v-model="form.applicantCompany" placeholder="请选择" class="form-control">
                <el-option label="陕西华电永寿新能源有限公司" value="company-1" />
              </el-select>
            </div>

            <!-- 请示公司 -->
            <div class="form-row">
              <span class="form-label">请示公司</span>
              <el-select v-model="form.requestCompany" placeholder="请选择" class="form-control">
                <el-option label="华电陕西能源有限公司" value="company-2" />
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
                />
              </div>

              <div class="form-section-title">前期费用计划</div>
              <div class="form-row">
                <span class="form-label">拟申请前期费用</span>
                <div class="form-control with-unit">
                  <el-input v-model="form.applyFee" placeholder="请输入" />
                  <span class="unit">万元</span>
                </div>
              </div>
              <div class="form-row">
                <span class="form-label">本年预计发送费用</span>
                <div class="form-control with-unit">
                  <el-input v-model="form.estimateFee" placeholder="请输入" />
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
            <!-- 未生成 & 未加载 -->
            <div v-if="!generating && !generated" class="preview-empty">
              点击「开始生成」后预览文件
            </div>

            <!-- Loading 10s -->
            <div v-else-if="generating" class="preview-loading">
              <el-skeleton :rows="10" animated />
              <div class="loading-tip">正在生成文件，请稍候...</div>
            </div>

            <!-- 加载完成区 -->
            <div v-else-if="generated" class="preview-content">
              <!-- 如果是 PDF -->
              <iframe
                v-if="previewType === 'pdf'"
                class="preview-iframe"
                :src="previewUrl"
                frameborder="0"
              />

              <!-- 如果是 Word -->
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
import { ref, reactive, computed, watch, onBeforeUnmount, nextTick } from 'vue'
import { ArrowLeft } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { renderAsync } from 'docx-preview' // ★ 引入解析库

const props = defineProps({
  visible: { type: Boolean, default: false },
  project: { type: Object, default: null },
  actionKey: { type: String, default: '' },  // gen-application / gen-letter / gen-report / gen-investment
  subCode: { type: String, default: '' },
})

const emit = defineEmits(['close', 'generated'])

// ★ 标题映射 (增加了投决)
const REPORT_TITLE_MAP = {
  'gen-application': '立项申请报告生成',
  'gen-letter': '立项请示函生成',
  'gen-report': '可研审查报告生成',
  'gen-investment': '投资决策申请报告生成',
}

const title = computed(() => REPORT_TITLE_MAP[props.actionKey] || '报告生成')
const isFeasibility = computed(() => props.actionKey === 'gen-report')

// ★ 预览文件配置 (指向 public/doc 目录)
// 立项类走 Word，可研类走 PDF，投决类走 Word
const previewUrl = computed(() => {
  if (props.actionKey === 'gen-report') {
    return '/doc/2.pdf'               // 可研审查报告 (PDF)
  } else if (props.actionKey === 'gen-investment') {
    return '/doc/投资决策.docx'        // 投决 (Word)
  } else {
    return '/doc/立项报告.docx'        // 立项 (Word)
  }
})

// 自动判断文件类型
const previewType = computed(() => {
  return previewUrl.value.endsWith('.docx') || previewUrl.value.endsWith('.doc') ? 'word' : 'pdf'
})

// 表单数据（全假数据）
const form = reactive({
  reportType: '',
  reportRef: 'report-1',
  applicantCompany: 'company-1',
  requestCompany: 'company-2',
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
const wordContainer = ref(null) // ★ Word 挂载节点
let timer = null

watch(
  () => props.visible,
  (val) => {
    if (val) {
      generated.value = false
      generating.value = false
      clearTimer()
      form.reportType = isFeasibility.value ? 'feasibility' : 'initiation'
    }
  }
)

function clearTimer() {
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
}

// ★ 核心渲染 Word 逻辑
async function renderWord() {
  if (!wordContainer.value) return
  try {
    // 获取文件流
    const response = await fetch(previewUrl.value)
    if (!response.ok) throw new Error('文件获取失败')
    const blob = await response.blob()

    // 清空之前的渲染
    wordContainer.value.innerHTML = ''

    // 渲染 DOCX
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

async function handleGenerate() {
  if (generating.value) return
  generating.value = true
  generated.value = false

  // 假 loading 10 秒
  clearTimer()
  timer = setTimeout(async () => {
    generating.value = false
    generated.value = true
    emit('generated', { actionKey: props.actionKey, subCode: props.subCode })

    // 如果生成的类型是 Word，在 DOM 渲染后执行解析
    if (previewType.value === 'word') {
      await nextTick()
      await renderWord()
    }
  }, 10000)
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
  clearTimer()
  emit('close')
}

onBeforeUnmount(() => clearTimer())
</script>

<style scoped>
.generate-panel {
  position: fixed;
  top: 65px;       /* ★ 向下偏移 65px */
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
  min-height: 0; /* ★ 关键：防止 body 被内部撑破 */
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
  gap: 16px;
}
.form-row {
  display: flex;
  align-items: center;
  gap: 16px;
}
.form-label {
  width: 130px;
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
  width: 110px;
  flex-shrink: 0;
}
.report-ref-select {
  flex: 1;
}

.form-section-title {
  margin-top: 8px;
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
  margin-top: 32px;
}
.generate-btn {
  width: 160px;
  height: 40px;
  border-radius: 20px;
  font-size: 14px;
}

/* 右侧预览 */
.gp-preview-side {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
  min-width: 0;
  min-height: 0; /* ★ 关键：防止右侧被内部内容撑破 */
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
  min-height: 0;      /* ★ 关键 */
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
  height: 100%;       /* ★ 撑满父容器 */
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

/* 为了 Word 显示更像纸张 */
.docx-preview-container {
  flex: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #f5f7fa;
  overflow-y: auto; /* ★ 允许在内部滚动 */
}

/* 第三方库 word 页面的样式修正 */
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