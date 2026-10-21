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
        <button type="button" disabled>下载请示文件</button>
      </div>
    </header>

    <main class="request-layout">
      <section class="request-left-card">
        <div class="request-form-scroll">
          <section class="request-step">
            <h2 class="step-title"><span class="step-number">1</span>选择文件类型</h2>
            <div class="request-option-grid">
              <button
                v-for="option in options"
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

          <section class="request-step">
            <h2 class="step-title"><span class="step-number">2</span>填写请示单位</h2>
            <div v-if="selectedOptions.length" class="unit-fields">
              <label v-for="option in selectedOptions" :key="option.key" class="unit-row">
                <span class="unit-label">{{ option.label }}请示</span>
                <input
                  v-model="requestUnits[option.key]"
                  type="text"
                  :placeholder="`请输入${option.label}请示单位`"
                />
              </label>
            </div>
            <p v-else class="form-hint">请先选择文件类型，系统会为每种类型添加对应的请示单位。</p>
          </section>

          <section class="request-step contact-step">
            <h2 class="step-title"><span class="step-number">3</span>补充引用与联系人</h2>
            <label class="reference-row">
              <span class="field-label">引用项目报告</span>
              <span class="reference-tag">可研报告</span>
              <select v-model="referenceProjectName" aria-label="引用项目">
                <option value="" disabled>请选择项目名称</option>
                <option v-if="projectName" :value="projectName">{{ projectName }}</option>
                <option v-else value="当前项目">当前项目</option>
              </select>
            </label>
            <div class="contact-row">
              <span class="field-label">联系人</span>
              <input v-model="contactName" type="text" placeholder="请输入联系人姓名" aria-label="联系人姓名" />
              <input v-model="contactPhone" type="tel" placeholder="请输入联系电话" aria-label="联系电话" />
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
              :disabled="!selectedOptions.length"
              @click="handleStartGeneration"
            >
              开始生成
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
        <div class="preview-canvas">
          <div class="preview-empty">
            <svg viewBox="0 0 32 32" aria-hidden="true">
              <path d="M9 4.5h9l6 6v16H9zM18 4.5v6h6M13 16h7M13 19.5h7M13 23h4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              <circle cx="23" cy="23" r="5" fill="#f4f7fb" stroke="currentColor" stroke-width="1.4" />
              <path d="M26.5 26.5l3 3" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
            </svg>
            <strong>尚未生成文件</strong>
            <p>请在左侧完成文件类型选择与信息填写，点击“开始生成”后，生成的请示文件将在此预览。</p>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { reportTypeOptions } from '../../js/areaPanelMockData'

const props = defineProps({
  visible: { type: Boolean, default: false },
  // 由首页传入当前项目。组件本身不读取项目字段，只在触发时一并传回。
  project: { type: Object, default: () => null },
})

const emit = defineEmits(['close', 'add-report', 'confirm', 'generate-request'])
const options = reportTypeOptions
const selectedKey = ref('')
const requestFormVisible = ref(false)
const selectedKeys = ref([])
const requestUnits = ref({})
const referenceProjectName = ref('')
const contactName = ref('')
const contactPhone = ref('')

const selectedOptions = computed(() =>
  options.filter((option) => selectedKeys.value.includes(option.key)),
)
const projectName = computed(() =>
  props.project?.projectName || props.project?.name || '',
)

watch(
  () => props.visible,
  (value) => {
    if (value) {
      selectedKey.value = ''
      requestFormVisible.value = false
      selectedKeys.value = []
      requestUnits.value = {}
      referenceProjectName.value = projectName.value
      contactName.value = props.project?.contactName || props.project?.managerName || ''
      contactPhone.value = props.project?.contactPhone || props.project?.managerPhone || ''
    } else {
      requestFormVisible.value = false
    }
  },
)

function handleSelect(option) {
  selectedKey.value = option.key
  emit('confirm', {
    option,
    project: props.project,
  })
}

function handleAddReport() {
  window.alert('添加项目报告：功能开发中')
}

function openRequestForm() {
  requestFormVisible.value = true
  selectedKeys.value = []
  requestUnits.value = {}
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
  selectedKeys.value = options.map((option) => option.key)
  for (const option of options) {
    if (requestUnits.value[option.key] === undefined) requestUnits.value[option.key] = ''
  }
}

function clearRequestTypes() {
  selectedKeys.value = []
}

function handleStartGeneration() {
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

  emit('generate-request', {
    options: selectedOptions.value,
    requestUnits: { ...requestUnits.value },
    referenceProjectName: referenceProjectName.value,
    contactName: contactName.value,
    contactPhone: contactPhone.value,
    project: props.project,
  })
  ElMessage.info('文件生成流程待接入，当前已完成表单样式与信息收集')
}
</script>

<style scoped>
.modal-mask {
  position: fixed;
  z-index: 200;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 8, 20, 0.5);
}
.modal-box {
  width: min(600px, calc(100vw - 40px));
  overflow: hidden;
  border-radius: 8px;
  background: #eef1f4;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.35);
}
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  background: #e4e8ec;
}
.modal-title {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #1f2937;
  font-size: 14px;
  font-weight: 600;
}
.title-icon, .close-btn svg { width: 14px; height: 14px; }
.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: #6b7280;
  background: none;
}
.close-btn:hover { background: rgba(0, 0, 0, 0.06); }
.modal-body { padding: 20px 24px; }
.section-title { color: #374151; font-size: 13px; text-align: center; }
.option-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-top: 16px; }
.option-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 16px 10px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  cursor: pointer;
  background: #fff;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.option-card:hover { border-color: #93c5fd; }
.option-card.selected { border-color: #2f8dff; box-shadow: 0 0 0 1px #2f8dff; }
.selected-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #2f8dff;
}
.selected-badge svg { width: 11px; height: 11px; }
.option-icon { display: flex; align-items: center; justify-content: center; width: 34px; height: 34px; border-radius: 8px; }
.option-icon svg { width: 18px; height: 18px; }
.option-label { color: #1f2937; font-size: 12.5px; line-height: 1.4; text-align: center; }
.option-sub { color: #9ca3af; font-size: 11px; }
.modal-footer { display: flex; justify-content: center; gap: 10px; padding: 14px 24px 22px; }
.footer-btn {
  min-width: 94px;
  padding: 8px 18px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 5px;
  cursor: pointer;
  color: #374151;
  background: #fff;
  font-size: 13px;
}
.footer-btn.primary { border-color: #2f8dff; color: #fff; background: #2f8dff; }
.footer-btn.primary:disabled { cursor: not-allowed; opacity: 0.5; }

.request-page {
  /* Overview 根节点是 position: relative，面板只覆盖 Overview，不盖住全局导航。 */
  position: absolute;
  z-index: 220;
  inset: 0;
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
   background:
    radial-gradient(ellipse at 10% 0%, rgba(255, 220, 232, 0.42), transparent 42%),
    radial-gradient(ellipse at 96% 100%, rgba(176, 210, 250, 0.48), transparent 43%),
    linear-gradient(122deg, #f1f4f9 0%, #e8f0fa 100%);
  /* border-radius: 24px 0 0 0; */
}
.request-header {
  display: flex;
  flex: 0 0 44px;
  align-items: center;
  gap: 10px;
  padding: 0 14px;
  color: #273443;
}
.request-header h1 { margin: 0; font-size: 13px; font-weight: 600; }
.back-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  padding: 0;
  color: #586575;
  background: #fff;
  border: 1px solid #dce4ed;
  border-radius: 50%;
  cursor: pointer;
}
.back-button svg { width: 17px; height: 17px; }
.request-header-actions { display: flex; gap: 8px; margin-left: auto; }
.request-header-actions button {
  padding: 5px 11px;
  color: #aab5c2;
  background: #f4f7fb;
  border: 1px solid #e7edf4;
  border-radius: 5px;
  font-size: 11px;
}
.request-layout {
  display: grid;
  flex: 1 1 auto;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 12px;
  min-height: 0;
  padding: 20px;
}
.request-left-card, .preview-card {
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  background: #fff;
  border: 1px solid #e2eaf3;
  border-radius: 8px;
  box-shadow: 0 1px 5px rgba(35, 69, 107, 0.04);
}
.request-left-card { display: flex; flex-direction: column; }
.request-form-scroll { flex: 1 1 auto; min-height: 0; overflow: auto; padding: 10px 14px 8px; }
.request-step { padding: 3px 0 11px; border-bottom: 1px solid #f0f3f7; }
.step-title {
  display: flex;
  align-items: center;
  gap: 7px;
  margin: 0 0 9px;
  color: #303c4b;
  font-size: 11px;
  font-weight: 600;
}
.step-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 17px;
  height: 17px;
  color: #fff;
  background: #347cf0;
  border-radius: 50%;
  font-size: 10px;
}
.request-option-grid { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 6px; }
.request-option {
  position: relative;
  display: flex;
  min-width: 0;
  min-height: 66px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  padding: 6px 13px 5px 6px;
  color: #465364;
  background: #fff;
  border: 1px solid #e4e9ef;
  border-radius: 6px;
  cursor: pointer;
  text-align: center;
  transition: border-color 0.15s, background 0.15s, box-shadow 0.15s;
}
.request-option:hover { border-color: #9cbef4; }
.request-option.selected { color: #2e66c5; background: #fbfdff; border-color: #3979e8; box-shadow: 0 0 0 1px rgba(57, 121, 232, 0.13); }
.request-option-label { display: -webkit-box; overflow: hidden; max-width: 100%; font-size: 10px; font-weight: 600; line-height: 1.3; text-overflow: ellipsis; -webkit-box-orient: vertical; -webkit-line-clamp: 1; }
.request-option-sub { overflow: hidden; max-width: 100%; color: #a5aeb9; font-size: 9px; line-height: 1.2; text-overflow: ellipsis; white-space: nowrap; }
.request-check {
  position: absolute;
  top: 3px;
  right: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 11px;
  height: 11px;
  color: #cbd2db;
  border: 1px solid #dbe1e8;
  border-radius: 50%;
}
.request-check svg { width: 8px; height: 8px; }
.request-option.selected .request-check { background: #3979e8; border-color: #3979e8; }
.selection-tools { display: flex; gap: 10px; margin-top: 6px; }
.selection-tools button { padding: 0; color: #4385e8; background: none; border: 0; cursor: pointer; font-size: 10px; }
.selection-tools button + button { color: #8a96a5; }
.unit-fields { display: flex; flex-direction: column; gap: 6px; }
.unit-row, .reference-row, .contact-row { display: flex; align-items: center; gap: 7px; min-width: 0; }
.unit-label, .field-label { flex: 0 0 74px; overflow: hidden; color: #718091; font-size: 10px; text-overflow: ellipsis; white-space: nowrap; }
.unit-row input, .contact-row input, .reference-row select {
  box-sizing: border-box;
  min-width: 0;
  height: 27px;
  padding: 0 8px;
  color: #354254;
  background: #fff;
  border: 1px solid #e2e8ef;
  border-radius: 5px;
  outline: none;
  font: inherit;
  font-size: 10px;
}
.unit-row input { flex: 1; }
.unit-row input:focus, .contact-row input:focus, .reference-row select:focus { border-color: #72a5f5; }
.form-hint { margin: 0; padding: 4px 0 6px 81px; color: #9aa5b2; font-size: 10px; }
.contact-step { border-bottom: 0; }
.reference-row { margin-bottom: 7px; }
.reference-tag { flex: 0 0 auto; padding: 3px 7px; color: #8290a0; background: #f2f5f8; border-radius: 3px; font-size: 9px; }
.reference-row select { flex: 1; }
.contact-row input { flex: 1; }
.request-footer {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 8px 12px;
  border-top: 1px solid #f0f3f7;
}
.request-count { color: #8693a1; font-size: 10px; }
.request-footer-actions { display: flex; gap: 7px; }
.request-footer-actions .footer-btn { min-width: 90px; padding-top: 7px; padding-bottom: 7px; font-size: 11px; }
.preview-card { display: flex; flex-direction: column; padding: 10px 12px 12px; }
.preview-title { display: flex; flex: 0 0 auto; align-items: center; gap: 7px; margin: 0 0 9px; color: #303c4b; font-size: 11px; font-weight: 600; }
.preview-title-icon { display: inline-flex; width: 17px; height: 17px; align-items: center; justify-content: center; color: #3979e8; background: #edf5ff; border-radius: 4px; }
.preview-title-icon svg { width: 13px; height: 13px; }
.preview-canvas { display: flex; flex: 1 1 auto; min-height: 0; align-items: center; justify-content: center; overflow: auto; background: #f3f6fc; border-radius: 5px; }
.preview-empty { display: flex; max-width: 300px; flex-direction: column; align-items: center; padding: 20px; color: #96a3b1; text-align: center; }
.preview-empty svg { width: 31px; height: 31px; margin-bottom: 10px; color: #8c9aaa; }
.preview-empty strong { margin-bottom: 6px; color: #566475; font-size: 11px; font-weight: 600; }
.preview-empty p { margin: 0; color: #98a4b1; font-size: 9px; line-height: 1.7; }

@media (max-width: 760px) {
  .request-page { overflow: auto; }
  .request-layout { grid-template-columns: 1fr; grid-template-rows: minmax(450px, auto) minmax(300px, 45vh); }
  .request-option-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .request-footer { align-items: flex-start; flex-direction: column; }
  .request-footer-actions { align-self: flex-end; }
  .unit-row, .contact-row { flex-wrap: wrap; }
  .unit-label, .field-label { flex-basis: 70px; }
}
</style>
