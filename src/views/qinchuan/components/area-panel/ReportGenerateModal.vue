<template>
  <div
    v-if="visible && !requestFormVisible"
    class="modal-mask"
    @click.self="$emit('close')"
  >
    <div class="modal-box">
      <header class="modal-header">
        <span class="modal-title">
          <svg viewBox="0 0 16 16" class="title-icon" aria-hidden="true">
            <rect x="3" y="2" width="10" height="12" rx="1" fill="none" stroke="currentColor" stroke-width="1.2" />
            <path d="M5.5 5.5h5M5.5 8h5M5.5 10.5h3" stroke="currentColor" stroke-width="1" stroke-linecap="round" />
          </svg>
          生成报告/函件
        </span>
        <button type="button" class="close-btn" aria-label="关闭" @click="$emit('close')">
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
          </svg>
        </button>
      </header>

      <div class="modal-body">
        <div class="section-title">请选择需生成的报告类型</div>

        <div class="option-grid">
          <button
            v-for="option in options"
            :key="option.key"
            type="button"
            class="option-card"
            :class="{ selected: selectedKey === option.key }"
            @click="handleSelect(option)"
          >
            <span v-if="selectedKey === option.key" class="selected-badge" aria-label="已选择">
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path d="M4 8.5l2.5 2.5L12 5.5" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </span>
            <span class="option-icon" :style="{ color: option.iconColor || '#2f8dff', background: `${option.iconColor || '#2f8dff'}22` }">
              <svg viewBox="0 0 20 20" aria-hidden="true">
                <rect x="4" y="3" width="12" height="14" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.3" />
                <path d="M7 7h6M7 10h6M7 13h4" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" />
              </svg>
            </span>
            <span class="option-label">{{ option.label }}</span>
            <span v-if="option.sub" class="option-sub">{{ option.sub }}</span>
          </button>
        </div>
      </div>

      <footer class="modal-footer">
        <button type="button" class="footer-btn" @click="handleAddReport">
          添加项目报告
        </button>
        <button type="button" class="footer-btn primary" @click="openRequestForm">
          添加请示文件
        </button>
      </footer>
    </div>
  </div>

  <div v-if="visible && requestFormVisible" class="request-page">
    <header class="request-header">
      <button type="button" class="back-button" aria-label="返回" @click="backToChooser">
        <svg viewBox="0 0 20 20" aria-hidden="true">
          <path d="M12.5 4.5L7 10l5.5 5.5M7.5 10H17" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
      <h1>请示文件生成</h1>
      <div class="request-header-actions">
        <button type="button" disabled>打印</button>
        <button type="button" @click="downloadRequestTemplate">下载请示文件</button>
      </div>
    </header>

    <main class="request-layout">
      <section class="request-left-card">
        <div class="request-form-scroll">
          <!-- Step 1: 文件类型 -->
          <section class="request-step">
            <div class="step-header">
              <h2 class="step-title">文件类型</h2>
            </div>
            <div class="request-option-grid">
              <button
                v-for="option in requestTypeOptions"
                :key="option.key"
                type="button"
                class="request-option"
                :class="{ selected: selectedKeys.includes(option.key) }"
                :aria-pressed="selectedKeys.includes(option.key)"
                @click="toggleRequestType(option)"
              >
                <span class="request-option-label">{{ option.label }}</span>
                <span v-if="option.sub" class="request-option-sub">{{ option.sub }}</span>
                <span class="request-check">
                  <svg v-if="selectedKeys.includes(option.key)" viewBox="0 0 12 12" aria-hidden="true">
                    <path d="M2 6.2l2.4 2.3L10 3" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </span>
              </button>
            </div>
            <div class="selection-tools">
              <button type="button" @click="selectAllRequestTypes">全选</button>
              <button type="button" @click="clearRequestTypes">清除选择</button>
            </div>
          </section>

          <!-- Step 2: 请示单位 -->
          <section class="request-step">
            <div class="step-header">
              <h2 class="step-title">请示单位</h2>
            </div>
            <div v-if="selectedOptions.length" class="unit-fields">
              <label v-for="option in selectedOptions" :key="option.key" class="unit-row">
                <span class="unit-label">{{ option.label }}{{ option.sub || '请示' }}</span>
                <input
                  v-model="requestUnits[option.key]"
                  type="text"
                  :placeholder="`请输入${option.label}${option.sub || '请示'}单位`"
                />
              </label>
            </div>
            <p v-else class="form-hint">请先选择文件类型，系统会为每种类型添加对应的请示单位。</p>
          </section>

          <!-- Step 3: 引用与联系人 -->
          <section class="request-step contact-step">
            <div class="step-header">
              <h2 class="step-title">引用项目与联系人</h2>
            </div>
            <div class="reference-row">
              <span class="field-label">引用项目报告</span>
              <span class="reference-tag">可研报告</span>
              <!-- 改为 el-select 支持远程搜索和加载 -->
              <el-select
                v-model="selectedReportId"
                class="report-select"
                filterable
                remote
                :remote-method="fetchReportList"
                :loading="reportLoading"
                placeholder="请选择项目名称"
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
            <div class="contact-row">
              <span class="field-label">联系人</span>
              <input v-model="contactName" type="text" placeholder="请输入联系人姓名" aria-label="联系人姓名" />
              <input v-model="contactPhone" type="tel" placeholder="请输入联系电话" aria-label="联系电话" />
            </div>
          </section>

          <!-- Step 4: 项目信息 -->
          <section class="request-step project-info-step">
            <div v-show="!isCollapsed" class="project-info-content">
              <div class="form-row">
                <span class="form-label">装机容量</span>
                <div class="input-with-suffix">
                  <input v-model="formData.projectCapacity" type="number" placeholder="请输入装机容量" />
                  <span class="suffix">万千瓦</span>
                </div>
              </div>

              <div class="form-row">
                <span class="form-label">总投资</span>
                <div class="input-with-suffix">
                  <input v-model="formData.totalInvestment" type="number" placeholder="请输入总投资" />
                  <span class="suffix">亿元</span>
                </div>
              </div>

              <div class="form-row">
                <span class="form-label">建设单位</span>
                <input v-model="formData.investor" type="text" placeholder="请输入建设单位" class="full-width-input" />
              </div>

              <div class="form-row">
                <span class="form-label">项目选址</span>
                <div class="radio-group">
                  <label class="radio-label">
                    <input type="radio" value="简写" v-model="formData.siteSelectionType" />
                    <span>简写</span>
                  </label>
                  <label class="radio-label">
                    <input type="radio" value="详细" v-model="formData.siteSelectionType" />
                    <span>详细</span>
                  </label>
                </div>
              </div>

              <div class="form-row mt-2" v-if="formData.siteSelectionType">
                <span class="form-label"></span>
                <input v-model="formData.siteSelectionContent" type="text" placeholder="请输入选址内容" class="full-width-input" />
              </div>

              <div class="form-row">
                <span class="form-label">申报保障性并网项目年份</span>
                <div class="input-with-icon">
                  <input v-model="formData.gridYear" type="number" placeholder="如：2026" />
                  <svg class="icon-date" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2">
                    <rect x="3" y="4" width="10" height="9" rx="1" />
                    <path d="M3 7h10M6 2v3M10 2v3" stroke-linecap="round" />
                  </svg>
                </div>
              </div>

              <div class="form-row">
                <span class="form-label">落款日期</span>
                <div class="input-with-icon">
                  <input v-model="formData.signDate" type="date" />
                  <svg class="icon-date" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2">
                    <rect x="3" y="4" width="10" height="9" rx="1" />
                    <path d="M3 7h10M6 2v3M10 2v3" stroke-linecap="round" />
                  </svg>
                </div>
              </div>
            </div>

            <div class="collapse-toggle" @click="isCollapsed = !isCollapsed">
              <span>{{ isCollapsed ? '展开' : '收起' }}</span>
              <svg :class="{ rotated: isCollapsed }" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 10l4-4 4 4" />
              </svg>
            </div>
          </section>
        </div>

        <footer class="request-footer">
          <span class="request-count">
            {{ selectedOptions.length ? `已选择 ${selectedOptions.length} 项请示文件` : '请选择请示文件类型' }}
          </span>
          <div class="request-footer-actions">
            <button type="button" class="footer-btn" @click="$emit('close')">取消</button>
            <button
              type="button"
              class="footer-btn primary"
              :disabled="!selectedOptions.length || loading"
              @click="handleStartGeneration"
            >
              {{ loading ? '生成中...' : '开始生成' }}
            </button>
          </div>
        </footer>
      </section>

      <section class="preview-card">
        <h2 class="preview-title">
          <span class="preview-title-icon">
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M4 2.5h5l3 3v8H4zM9 2.5v3h3M6 8h4M6 10.5h4" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linejoin="round" stroke-linecap="round" />
            </svg>
          </span>
          文件预览
        </h2>
        <div class="preview-tabs" v-if="generatedTabs.length">
          <span v-for="tab in generatedTabs" :key="tab" class="preview-tab active">{{ tab }}</span>
        </div>
        <div class="preview-canvas">
          <div v-loading="templateLoading" class="request-template-preview">
            <div ref="requestTemplateRef" class="request-template-docx" />
            <p v-if="templateError" class="template-error">{{ templateError }}</p>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed, ref, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { renderAsync } from 'docx-preview'
import { reportTypeOptions } from '../../js/areaPanelMockData'
import { createQXReport } from '@/api/modules/report'
import { pageReport } from '@/api/modules/aiProject' // 引入接口

const props = defineProps({
  visible: { type: Boolean, default: false },
  project: { type: Object, default: () => null },
})

const emit = defineEmits(['close', 'add-report', 'confirm', 'generate-request', 'open-add-report'])

/* ---------------- 报告类型（保持原样） ---------------- */
const options = reportTypeOptions

/* ---------------- 请示文件类型 ---------------- */
const requestTypeOptions = [
  { key: 'request-yafukuang',  label: '压覆矿',        sub: '审查请示' },
  { key: 'request-wenwu',      label: '文物保护',      sub: '审查请示' },
  { key: 'request-shuibao',    label: '水保',          sub: '审批请示' },
  { key: 'request-huanbao',    label: '环保',          sub: '审批请示' },
  { key: 'request-anquan',     label: '安全',          sub: '审查请示' },
  { key: 'request-linye',      label: '林业',          sub: '审查请示' },
  { key: 'request-junshi',     label: '军事',          sub: '审查请示' },
  { key: 'request-yongdi',     label: '用地',          sub: '审批请示' },
  { key: 'request-qianqi',     label: '前期工作',      sub: '审查请示' },
  { key: 'request-tudi',       label: '土地等自然资源', sub: '审批请示' },
]

const selectedKey = ref('')
const requestFormVisible = ref(false)
const selectedKeys = ref([])
const requestUnits = ref({})
const contactName = ref('')
const contactPhone = ref('')

// --- 引用项目报告下拉框状态 ---
const selectedReportId = ref('')
const reportOptions = ref([])
const reportLoading = ref(false)

// --- 项目信息表单数据 ---
const isCollapsed = ref(false)
const loading = ref(false)
const generatedTabs = ref([])
const requestTemplateRef = ref(null)
const templateLoading = ref(false)
const templateError = ref('')
const REQUEST_TEMPLATE_URL = '/templates/请示文件模板.docx'

const formData = ref({
  projectCapacity: '',
  totalInvestment: '',
  investor: '陕西华电新能源发电有限公司',
  siteSelectionType: '简写',
  siteSelectionContent: '',
  gridYear: new Date().getFullYear().toString(),
  signDate: new Date().toISOString().split('T')[0],
})

const selectedOptions = computed(() =>
  requestTypeOptions.filter((option) => selectedKeys.value.includes(option.key)),
)

const projectName = computed(() =>
  props.project?.projectName || props.project?.name || '',
)

// 获取项目 ID（考虑到你组件可能传入的字段结构，做兼容处理）
const aiProjectId = computed(() => props.project?.id || props.project?.projectId || 1001)

watch(
  () => props.visible,
  (value) => {
    if (value) {
      selectedKey.value = ''
      requestFormVisible.value = false
      selectedKeys.value = []
      requestUnits.value = {}
      contactName.value = props.project?.contactName || props.project?.managerName || ''
      contactPhone.value = props.project?.contactPhone || props.project?.managerPhone || ''
      generatedTabs.value = []
      
      // 重置下拉报告
      selectedReportId.value = ''
      reportOptions.value = []
      
      formData.value = {
        projectCapacity: props.project?.projectCapacity || '',
        totalInvestment: props.project?.totalInvestment ? (props.project.totalInvestment / 100000000).toString() : '',
        investor: props.project?.investor || '陕西华电新能源发电有限公司',
        siteSelectionType: '简写',
        siteSelectionContent: '',
        gridYear: new Date().getFullYear().toString(),
        signDate: new Date().toISOString().split('T')[0],
      }
    } else {
      requestFormVisible.value = false
    }
  },
)

/* ---------------- 可研报告下拉框接口逻辑 ---------------- */
async function fetchReportList(keyword = '') {
  if (!aiProjectId.value) return
  
  reportLoading.value = true
  try {
    const res = await pageReport({
      aiProjectId: aiProjectId.value,
      pageNo: 1,
      pageSize: 20, // 后续数据多，使用远程搜索每次拉取20条
      status: 'COMPLETED', // 写死已完成
      reportType: 'FEASIBILITY_STUDY', // 可研报告
      fileName: keyword // 远程搜索参数
    })
    
    // 兼容不同的返回结构，假设标准返回为 { code: 200, data: { list: [...] } }
    reportOptions.value = res.data?.list || res.list || []
  } catch (error) {
    console.error('获取可研报告列表失败:', error)
    ElMessage.error('获取可研报告列表失败')
  } finally {
    reportLoading.value = false
  }
}

function handleDropdownVisibleChange(visible) {
  // 首次展开时加载初始数据
  if (visible && reportOptions.value.length === 0) {
    fetchReportList()
  }
}

function handleSelect(option) {
  selectedKey.value = option.key
  
  // ★ 如果是竞配申报文件，直接抛出事件，并 return 阻断后续逻辑
  if (option.key === 'bidding') {
    emit('generate-competitive', props.project)
    return
  }
  
  // 其他类型保持原有逻辑
  emit('confirm', { option, project: props.project })
}

function handleAddReport() {
  emit('open-add-report', { subTab: 'FEASIBILITY_STUDY', project: props.project })
}

async function openRequestForm() {
  requestFormVisible.value = true
  selectedKeys.value = []
  requestUnits.value = {}
  await nextTick()
  await renderRequestTemplate()
}

async function renderRequestTemplate() {
  if (!requestTemplateRef.value) return
  templateLoading.value = true
  templateError.value = ''
  try {
    const response = await fetch(REQUEST_TEMPLATE_URL)
    if (!response.ok) throw new Error(`模板加载失败（${response.status}）`)
    const blob = await response.blob()
    requestTemplateRef.value.innerHTML = ''
    await renderAsync(blob, requestTemplateRef.value, undefined, {
      className: 'docx-preview',
      inWrapper: true,
      ignoreLastRenderedPageBreak: true,
      experimental: true,
      useBase64URL: true,
      breakPages: true,
    })
  } catch (error) {
    console.error('[ReportGenerateModal] 请示模板预览失败:', error)
    templateError.value = error?.message || '模板预览失败'
  } finally {
    templateLoading.value = false
  }
}

async function downloadRequestTemplate() {
  try {
    const response = await fetch(REQUEST_TEMPLATE_URL)
    if (!response.ok) throw new Error(`模板下载失败（${response.status}）`)
    const blobUrl = URL.createObjectURL(await response.blob())
    const link = document.createElement('a')
    link.href = blobUrl
    link.download = '请示文件模板.docx'
    document.body.appendChild(link)
    link.click()
    link.remove()
    setTimeout(() => URL.revokeObjectURL(blobUrl), 1500)
  } catch (error) {
    console.error('[ReportGenerateModal] 请示模板下载失败:', error)
    ElMessage.error(error?.message || '模板下载失败')
  }
}

function backToChooser() {
  requestFormVisible.value = false
}

function toggleRequestType(option) {
  const selected = selectedKeys.value.includes(option.key)
  selectedKeys.value = selected
    ? selectedKeys.value.filter((key) => key !== option.key)
    : [...selectedKeys.value, option.key]

  if (!selected && requestUnits.value[option.key] === undefined) {
    requestUnits.value[option.key] = ''
  }
}

function selectAllRequestTypes() {
  selectedKeys.value = requestTypeOptions.map((option) => option.key)
  for (const option of requestTypeOptions) {
    if (requestUnits.value[option.key] === undefined) requestUnits.value[option.key] = ''
  }
}

function clearRequestTypes() {
  selectedKeys.value = []
}

/* ---------------- 核心生成逻辑 ---------------- */
async function handleStartGeneration() {
  if (!selectedOptions.value.length) {
    ElMessage.warning('请先选择文件类型')
    return
  }

  const missingUnit = selectedOptions.value.some(
    (option) => !String(requestUnits.value[option.key] || '').trim(),
  )
  if (missingUnit) {
    ElMessage.warning('请填写每种文件对应的请示单位')
    return
  }

  if (!selectedReportId.value) {
    ElMessage.warning('请选择引用的项目报告')
    return
  }

  loading.value = true

  try {
    const firstUnitKey = selectedOptions.value[0]?.key
    const dockingDepartment = requestUnits.value[firstUnitKey] || ''

    const submitData = {
      aiProjectId: aiProjectId.value,
      // ★ 使用下拉框选中的可研报告ID
      aiProjectReportId: selectedReportId.value,
      contactName: contactName.value,
      contactPhone: contactPhone.value,
      dockingDepartment: dockingDepartment,
      gridYear: Number(formData.value.gridYear) || undefined,
      investor: formData.value.investor,
      projectCapacity: Number(formData.value.projectCapacity) || undefined,
      totalInvestment: formData.value.totalInvestment ? Number(formData.value.totalInvestment) * 100000000 : undefined,
      siteSelectionType: formData.value.siteSelectionType,
      siteSelectionContent: formData.value.siteSelectionContent,
      signDate: formData.value.signDate,
      requestDocTypes: selectedOptions.value.map(option => ({
        type: `${option.label}${option.sub || '请示'}`,
        content: ''
      }))
    }

    await createQXReport(submitData)
    ElMessage.success('请示文件生成成功')
    
    generatedTabs.value = submitData.requestDocTypes.map(item => item.type)
    
    emit('generate-request', {
      options: selectedOptions.value,
      requestUnits: { ...requestUnits.value },
      selectedReportId: selectedReportId.value,
      contactName: contactName.value,
      contactPhone: contactPhone.value,
      project: props.project,
      formData: formData.value
    })
  } catch (error) {
    console.error('生成请示文件失败:', error)
    ElMessage.error(error.message || '生成失败，请稍后重试')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* --- 原有样式保留，此处省略未改动部分以节省版面 --- */
.modal-mask {
  position: fixed; z-index: 300; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(0, 8, 20, 0.5);
}
.modal-box { width: min(600px, calc(100vw - 40px)); overflow: hidden; border-radius: 8px; background: #eef1f4; box-shadow: 0 20px 50px rgba(0, 0, 0, 0.35); }
.modal-header { display: flex; align-items: center; justify-content: space-between; padding: 14px 18px; border-bottom: 1px solid rgba(0, 0, 0, 0.08); background: #e4e8ec; }
.modal-title { display: inline-flex; align-items: center; gap: 6px; color: #1f2937; font-size: 14px; font-weight: 600; }
.title-icon, .close-btn svg { width: 14px; height: 14px; }
.close-btn { display: flex; align-items: center; justify-content: center; width: 22px; height: 22px; border: none; border-radius: 4px; cursor: pointer; color: #6b7280; background: none; }
.close-btn:hover { background: rgba(0, 0, 0, 0.06); }
.modal-body { padding: 20px 24px; }
.section-title { color: #374151; font-size: 13px; text-align: center; }
.option-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-top: 16px; }
.option-card { position: relative; display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 16px 10px; border: 1px solid rgba(0, 0, 0, 0.08); border-radius: 8px; cursor: pointer; background: #fff; transition: border-color 0.15s, box-shadow 0.15s; }
.option-card:hover { border-color: #93c5fd; }
.option-card.selected { border-color: #2f8dff; box-shadow: 0 0 0 1px #2f8dff; }
.selected-badge { position: absolute; top: -6px; right: -6px; display: flex; align-items: center; justify-content: center; width: 18px; height: 18px; border-radius: 50%; background: #2f8dff; }
.selected-badge svg { width: 11px; height: 11px; }
.option-icon { display: flex; align-items: center; justify-content: center; width: 34px; height: 34px; border-radius: 8px; }
.option-icon svg { width: 18px; height: 18px; }
.option-label { color: #1f2937; font-size: 12.5px; line-height: 1.4; text-align: center; }
.option-sub { color: #9ca3af; font-size: 11px; }
.modal-footer { display: flex; justify-content: center; gap: 10px; padding: 14px 24px 22px; }
.footer-btn { min-width: 94px; padding: 8px 18px; border: 1px solid rgba(0, 0, 0, 0.12); border-radius: 5px; cursor: pointer; color: #374151; background: #fff; font-size: 13px; }
.footer-btn.primary { border-color: #2f8dff; color: #fff; background: #2f8dff; }
.footer-btn.primary:disabled { cursor: not-allowed; opacity: 0.5; }

.request-page { position: absolute; z-index: 320; inset: 0; display: flex; flex-direction: column; min-width: 0; min-height: 0; overflow: hidden; background: radial-gradient(ellipse at 10% 0%, rgba(255, 220, 232, 0.42), transparent 42%), radial-gradient(ellipse at 96% 100%, rgba(176, 210, 250, 0.48), transparent 43%), linear-gradient(122deg, #f1f4f9 0%, #e8f0fa 100%); }
.request-header { display: flex; flex: 0 0 44px; align-items: center; gap: 10px; padding: 0 14px; color: #273443; }
.request-header h1 { margin: 0; font-size: 13px; font-weight: 600; }
.back-button { display: inline-flex; align-items: center; justify-content: center; width: 26px; height: 26px; padding: 0; color: #586575; background: #fff; border: 1px solid #dce4ed; border-radius: 50%; cursor: pointer; }
.back-button svg { width: 17px; height: 17px; }
.request-header-actions { display: flex; gap: 8px; margin-left: auto; }
.request-header-actions button { padding: 5px 11px; color: #aab5c2; background: #f4f7fb; border: 1px solid #e7edf4; border-radius: 5px; font-size: 11px; }
.request-layout { display: grid; flex: 1 1 auto; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 12px; min-height: 0; padding: 20px; }
.request-left-card, .preview-card { min-width: 0; min-height: 0; overflow: hidden; background: #fff; border: 1px solid #e2eaf3; border-radius: 8px; box-shadow: 0 1px 5px rgba(35, 69, 107, 0.04); }
.request-left-card { display: flex; flex-direction: column; }
.request-form-scroll { flex: 1 1 auto; min-height: 0; overflow: auto; padding: 16px 20px 8px; }
.request-step { padding: 0 0 16px; margin-bottom: 16px; border-bottom: 1px dashed #e2e8f0; }
.request-step:last-child { border-bottom: 0; }
.step-header { display: flex; align-items: center; margin-bottom: 12px; }
.step-title { margin: 0; color: #303c4b; font-size: 13px; font-weight: 600; }
.request-option-grid { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 8px; }
.request-option { position: relative; display: flex; min-width: 0; min-height: 64px; flex-direction: column; align-items: center; justify-content: center; gap: 4px; padding: 8px; color: #465364; background: #fff; border: 1px solid #e4e9ef; border-radius: 6px; cursor: pointer; text-align: center; transition: all 0.15s; }
.request-option:hover { border-color: #9cbef4; }
.request-option.selected { color: #2e66c5; background: #f0f7ff; border-color: #3979e8; }
.request-option-label { font-size: 13px; font-weight: 600; }
.request-option-sub { color: #a5aeb9; font-size: 10px; }
.request-check { position: absolute; top: 4px; right: 4px; display: flex; align-items: center; justify-content: center; width: 12px; height: 12px; color: #cbd2db; border: 1px solid #dbe1e8; border-radius: 50%; }
.request-check svg { width: 8px; height: 8px; }
.request-option.selected .request-check { background: #3979e8; border-color: #3979e8; }
.selection-tools { display: flex; gap: 12px; margin-top: 8px; }
.selection-tools button { padding: 0; color: #4385e8; background: none; border: 0; cursor: pointer; font-size: 12px; }
.selection-tools button + button { color: #8a96a5; }
.unit-fields { display: flex; flex-direction: column; gap: 8px; }
.unit-row, .reference-row, .contact-row { display: flex; align-items: center; gap: 10px; min-width: 0; }
.unit-label, .field-label { flex: 0 0 100px; color: #4b5563; font-size: 12px; text-align: right; }
.unit-row input, .contact-row input, .form-row input { box-sizing: border-box; min-width: 0; height: 32px; padding: 0 10px; color: #354254; background: #fff; border: 1px solid #e2e8ef; border-radius: 4px; outline: none; font: inherit; font-size: 12px; flex: 1; }
.unit-row input:focus, .contact-row input:focus, .form-row input:focus { border-color: #72a5f5; box-shadow: 0 0 0 2px rgba(114, 165, 245, 0.2); }
.form-hint { margin: 0; color: #9aa5b2; font-size: 12px; }
.reference-row { margin-bottom: 10px; }
.reference-tag { flex: 0 0 auto; padding: 3px 7px; color: #8290a0; background: #f2f5f8; border-radius: 4px; font-size: 11px; }

/* --- 覆盖 el-select 样式使其与原生 input 统一 --- */
.report-select { flex: 1; width: 100%; }
:deep(.report-select .el-input__wrapper) {
  box-shadow: none !important;
  border: 1px solid #e2e8ef;
  border-radius: 4px;
  height: 32px;
  background-color: #fff;
  padding: 0 10px;
}
:deep(.report-select .el-input__wrapper.is-focus) {
  border-color: #72a5f5;
  box-shadow: 0 0 0 2px rgba(114, 165, 245, 0.2) !important;
}
:deep(.report-select .el-input__inner) {
  font-size: 12px;
  color: #354254;
}

.project-info-content { display: flex; flex-direction: column; gap: 12px; }
.form-row { display: flex; align-items: center; gap: 10px; }
.form-label { flex: 0 0 140px; color: #4b5563; font-size: 12px; text-align: right; }
.input-with-suffix { position: relative; display: flex; flex: 1; align-items: center; }
.input-with-suffix input { padding-right: 60px; width: 100%; }
.input-with-suffix .suffix { position: absolute; right: 10px; color: #6b7280; font-size: 12px; pointer-events: none; }
.full-width-input { width: 100%; }
.radio-group { display: flex; gap: 16px; flex: 1; }
.radio-label { display: flex; align-items: center; gap: 4px; font-size: 12px; color: #354254; cursor: pointer; }
.input-with-icon { position: relative; display: flex; flex: 1; align-items: center; }
.input-with-icon input { padding-right: 30px; width: 100%; }
.icon-date { position: absolute; right: 10px; width: 14px; height: 14px; color: #9ca3af; pointer-events: none; }
.mt-2 { margin-top: -4px; }
.collapse-toggle { display: flex; align-items: center; justify-content: center; gap: 4px; margin-top: 14px; color: #3b82f6; font-size: 12px; cursor: pointer; }
.collapse-toggle svg { width: 14px; height: 14px; transition: transform 0.2s; }
.collapse-toggle svg.rotated { transform: rotate(180deg); }

.request-footer { display: flex; flex: 0 0 auto; align-items: center; justify-content: space-between; gap: 10px; padding: 12px 20px; border-top: 1px solid #f0f3f7; }
.request-count { color: #8693a1; font-size: 12px; }
.request-footer-actions { display: flex; gap: 10px; }
.request-footer-actions .footer-btn { min-width: 100px; padding: 8px 16px; font-size: 13px; }

.preview-card { display: flex; flex-direction: column; padding: 16px; }
.preview-title { display: flex; flex: 0 0 auto; align-items: center; gap: 8px; margin: 0 0 12px; color: #303c4b; font-size: 13px; font-weight: 600; }
.preview-title-icon { display: inline-flex; width: 20px; height: 20px; align-items: center; justify-content: center; color: #3979e8; background: #edf5ff; border-radius: 4px; }
.preview-tabs { display: flex; gap: 8px; margin-bottom: 12px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; overflow-x: auto; }
.preview-tab { font-size: 13px; color: #3b82f6; padding: 2px 8px; border-radius: 4px; background: #eff6ff; white-space: nowrap; }
.preview-canvas { display: flex; flex: 1 1 auto; min-height: 0; align-items: center; justify-content: center; overflow: auto; background: #f8fafc; border-radius: 6px; border: 1px solid #e2e8f0; padding: 20px; }
.preview-empty { display: flex; max-width: 320px; flex-direction: column; align-items: center; color: #94a3b8; text-align: center; }
.preview-empty svg { width: 40px; height: 40px; margin-bottom: 12px; color: #cbd5e1; }
.preview-empty strong { margin-bottom: 8px; color: #475569; font-size: 14px; font-weight: 600; }
.preview-empty p { margin: 0; color: #94a3b8; font-size: 12px; line-height: 1.6; }
.preview-content { width: 100%; height: 100%; display: flex; justify-content: center; }
.mock-doc { background: #fff; padding: 40px; width: 100%; max-width: 600px; box-shadow: 0 2px 12px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; min-height: 100%; font-size: 14px; line-height: 2; }
.mock-doc h3 { text-align: center; font-size: 18px; margin-bottom: 20px; }

@media (max-width: 760px) {
  .request-page { overflow: auto; }
  .request-layout { grid-template-columns: 1fr; grid-template-rows: minmax(450px, auto) minmax(300px, 45vh); }
  .request-option-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .request-footer { align-items: flex-start; flex-direction: column; }
  .request-footer-actions { align-self: flex-end; }
  .unit-row, .contact-row, .form-row { flex-wrap: wrap; }
  .unit-label, .field-label, .form-label { flex-basis: 100%; text-align: left; margin-bottom: 4px; }
  .mt-2 { margin-top: 0; }
}
.request-template-preview { height: 100%; min-height: 0; overflow: auto; padding: 12px; box-sizing: border-box; background: #f5f6f8; }
.request-template-docx { min-height: 100%; }
.request-template-docx :deep(.docx-wrapper) { padding: 0; background: transparent; }
.request-template-docx :deep(.docx-wrapper > section.docx) { margin: 0 auto 16px; box-shadow: 0 1px 6px rgba(0, 0, 0, 0.1); }
.template-error { color: #dc2626; text-align: center; font-size: 12px; }
</style>