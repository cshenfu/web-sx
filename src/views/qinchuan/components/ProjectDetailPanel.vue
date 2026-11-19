<!-- components/ProjectDetailPanel.vue -->
<template>
  <transition name="detail-slide">
    <aside v-if="visible" class="detail-panel">
      <!-- 设置模式 -->
      <MaterialSettingPanel
        v-if="showSettingPanel"
        :project="project"
        :stage-code="activeTabConfig.stageCode"
        :file-code="activeTabConfig.fileCode"
        @cancel="showSettingPanel = false"
        @save="handleSettingSave"
      />

      <!-- 常规模式 -->
      <template v-else>
        <header class="panel-header">
          <div class="panel-title">{{ project?.projectName || '-' }}</div>
          <div class="header-actions">
            <!-- 报告/函件生成 按钮 -->
            <button type="button" class="report-btn" @click="$emit('generate-report', props.project)">
              <svg viewBox="0 0 16 16" class="report-icon"><rect x="3" y="2" width="10" height="12" rx="1" fill="none" stroke="currentColor" stroke-width="1.2"/><path d="M5.5 5.5h5M5.5 8h5M5.5 10.5h3" stroke="currentColor" stroke-width="1" stroke-linecap="round"/></svg>
              报告 / 函件生成
            </button>
            
            <!-- 阶段推进按钮 -->
            <el-button
              v-if="advanceConfig"
              class="advance-btn"
              size="small"
              type="primary"
              :disabled="!necessaryFilesDone"
              :loading="advancing"
              @click="handleHeaderAction"
            >
              {{ advanceConfig.label }}
            </el-button>

            <!-- 关闭叉号按钮 -->
            <button type="button" class="close-panel-btn" title="关闭面板" @click="$emit('close')">
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
              </svg>
            </button>
          </div>
        </header>

        <nav class="panel-tabs">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            class="panel-tab"
            :class="{ active: activeTab === tab.key }"
            @click="activeTab = tab.key"
          >
            {{ tab.label }}
          </button>
        </nav>

        <div class="panel-body">
          <MainInfoTab
            v-if="activeTab === 'main'"
            v-loading="mainInfoLoading"
            :data="mainInfoData"
          />
          
          <SupportDocsTab
            v-else-if="activeTab === 'support'"
            :data="supportDocsData"
            readonly
          />

          <DetailMaterialTab
            v-else-if="activeTab === 'material' || activeTab === 'invest-material'"
            ref="materialTabRef"
            :project="project"
            :file-code="activeTabConfig.fileCode"
            :stage-code="activeTabConfig.stageCode"
            @open-setting="openSetting"
            @upload="handleUpload"
            @deleted="handleFileDeleted"
            @generate-feasibility-report="emit('action', { type: 'generate-feasibility-report', project })"
          />
          
          <DetailMeetingTab
            v-else-if="activeTab === 'meeting'"
            ref="meetingTabRef"
            :project="project"
            :stage-code="activeTabConfig.stageCode"
            :file-code="activeTabConfig.fileCode"
            @action="handleMeetingAction"
            @deleted="handleMeetingFileDeleted"
          />

          <ProjectReportTab
            v-else-if="activeTabConfig.type === 'report'"
            :key="activeTab"
            :project="project"
            :initial-sub-tab="activeTabConfig.subTab"
            :hide-sub-tabs="true"
            :refresh-key="refreshKey"
            @row-action="handleReportRowAction"
            @create="handleReportCreate"
          />
        </div>
      </template>

      <!-- 弹窗组件 -->
      <FileUploadDialog
        :visible="showUploadDialog"
        :tag-name="uploadTagName"
        :record="uploadRecord"
        :project="project"
        :file-code="activeTabConfig.fileCode"
        @close="showUploadDialog = false"
        @saved="handleUploadSaved"
      />

      <MeetingMinutesUploadDialog
        :visible="showMeetingUpload"
        :tag-name="meetingUploadConfig.tagName"
        :project="project"
        :file-code="activeTabConfig.fileCode"
        :secondary-business-title="meetingUploadConfig.subCode"
        :record="meetingUploadConfig.record"
        @close="showMeetingUpload = false"
        @saved="handleMeetingUploadSaved"
      />
    </aside>
  </transition>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'

import MainInfoTab from './area-panel/tabs/MainInfoTab.vue'
import SupportDocsTab from './area-panel/tabs/SupportDocsTab.vue'
import { useProjectMainInfo } from '../js/useProjectMainInfo'
import ProjectReportTab from './area-panel/tabs/ProjectReportTab.vue'
import DetailMaterialTab from './DetailMaterialTab.vue'
import DetailMeetingTab from './DetailMeetingTab.vue'
import MaterialSettingPanel from './MaterialSettingPanel.vue'
import FileUploadDialog from './FileUploadDialog.vue'
import MeetingMinutesUploadDialog from './MeetingMinutesUploadDialog.vue'
import * as api from '@/api/modules/project'
import * as fileApi from '@/api/modules/projectFile'
import { buildSupportDocsData } from '../js/supportDocsAdapter'

const props = defineProps({
  visible: { type: Boolean, default: false },
  project: { type: Object, default: null },
  stage: { type: String, default: '' },
  initialTab: { type: String, default: 'main' },
  // ★ 新增：父级在报告/材料生成成功后自增，触发内部刷新
  refreshKey: { type: Number, default: 0 },
})

const emit = defineEmits(['close', 'action', 'generate-report'])
const router = useRouter()
const { mainInfo: mainInfoData, loading: mainInfoLoading } = useProjectMainInfo(computed(() => props.project))

const activeTab = ref('main')
const showSettingPanel = ref(false)
const settingType = ref('material')

const materialTabRef = ref(null)
const showUploadDialog = ref(false)
const uploadTagName = ref('')
const uploadRecord = ref(null)

const meetingTabRef = ref(null)
const showMeetingUpload = ref(false)
const meetingUploadConfig = ref({
  tagName: '会议纪要',
  subCode: '',
  record: null,
})

// ★ 新增了投决阶段所有生成的动作
const GENERATE_REPORT_ACTIONS = new Set([
  'gen-application', 
  'gen-letter', 
  'gen-report',
  'gen-invest-apply',
  'gen-invest-letter',
  'gen-invest-commitment',
  'gen-audit-notice',
  'gen-audit-topic',
  'gen-filing-report',
  'gen-approval-doc'
])

const MEETING_UPLOAD_ACTIONS = new Set(['upload-minutes', 'upload-approval', 'replace', 'upload-manual-review', 'upload-party-minutes'])

const STAGE_ADVANCE = {
  PROJECT_RESERVE:    { label: '开始立项', next: 'PROJECT_INITIATION',  fileCode: 'PROJECT_INITIATION_MATERIALS' },
  PROJECT_INITIATION: { label: '开始审查', next: 'FEASIBILITY_REVIEW',  fileCode: 'PROJECT_INITIATION_MATERIALS' },
  FEASIBILITY_REVIEW: { label: '开始投决', next: 'INVESTMENT_DECISION', fileCode: 'PROJECT_FEASIBILITY_MATERIALS' },
}
const advanceConfig = computed(() => STAGE_ADVANCE[props.stage] || null)

const STAGE_ROUTE_NAME = {
  PRELIMINARY_SELECTION: 'SiteSelect',
  PROJECT_RESERVE:       'Reserve',
  PROJECT_INITIATION:    'Approval',
  FEASIBILITY_REVIEW:    'Research',
  INVESTMENT_DECISION:   'Decision',
}

const necessaryFilesDone = ref(false)
const advancing = ref(false)

function isRequired(r) {
  const v = r?.isRequiredUpload
  return v === 1 || v === '1' || v === true || v === 'true'
}
function normalizeRecord(r) {
  let urls = r.fileUrlList
  if (typeof urls === 'string') {
    try { urls = JSON.parse(urls) } catch { urls = [] }
  }
  return { ...r, fileUrlList: Array.isArray(urls) ? urls : [] }
}

async function loadNecessaryFiles() {
  if (!advanceConfig.value || !props.project?.id) {
    necessaryFilesDone.value = false
    return
  }
  try {
    const res = await fileApi.getFileListByProjectid({
      aiProjectId: props.project.id,
      firstBusinessTitle: advanceConfig.value.fileCode || 'PROJECT_INITIATION_MATERIALS',
    })
    const list = (res?.data || []).map(normalizeRecord)
    const required = list.filter(isRequired)
    necessaryFilesDone.value = required.length > 0 && required.every(f => f.fileUrlList.length > 0 || (String(f.fileTypeTag || '').trim() === '可研报告' && !!f.reportId))
  } catch (err) {
    console.error('[panel] 加载必要性文件失败:', err)
    necessaryFilesDone.value = false
  }
}

watch(
  () => [props.visible, props.project?.id, props.stage],
  ([visible]) => { if (visible) loadNecessaryFiles() },
  { immediate: true }
)

async function handleHeaderAction() {
  if (!advanceConfig.value || !necessaryFilesDone.value || advancing.value) return
  const { label, next } = advanceConfig.value
  try {
    await ElMessageBox.confirm(`确认「${label}」？推进后不可回退`, '提示', {
      type: 'warning', confirmButtonText: '确定', cancelButtonText: '取消',
    })
  } catch { return }

  advancing.value = true
  try {
    await api.updateProjectStage({ id: props.project.id, newStage: next })
    ElMessage.success(`${label}成功`)
    emit('action', { type: 'stage-changed', project: props.project, newStage: next })
    const targetName = STAGE_ROUTE_NAME[next]
    if (targetName) router.push({ name: targetName, query: { view: 'list' } })
  } catch (err) {
    ElMessage.error(err?.message || `${label}失败`)
  } finally {
    advancing.value = false
  }
}

const STAGE_TABS_CONFIG = {
  PRELIMINARY_SELECTION: [
    { key: 'main', label: '主要信息' },
    { key: 'support', label: '支持性文件' },
  ],
  PROJECT_RESERVE: [
    { key: 'main', label: '主要信息' },
    { key: 'support', label: '支持性文件' },
    { key: 'project-proposal', label: '项目建议书', type: 'report', subTab: 'PROJECT_PROPOSAL' },
    { key: 'request-file', label: '请示文件', type: 'report', subTab: 'PROJECT_INITIATION' },
    { key: 'competitive-allocation', label: '竞配申请报告', type: 'report', subTab: 'COMPETITIVE_ALLOCATION' },
    { key: 'material', label: '立项材料', stageCode: 'PROJECT_RESERVE', fileCode: 'PROJECT_INITIATION_MATERIALS' },
  ],
  PROJECT_INITIATION: [
    { key: 'main', label: '主要信息' },
    { key: 'support', label: '支持性文件' },
    { key: 'request-file', label: '请示文件', type: 'report', subTab: 'PROJECT_INITIATION' },
    { key: 'material', label: '立项材料', stageCode: 'PROJECT_INITIATION', fileCode: 'PROJECT_INITIATION_MATERIALS' },
    { key: 'meeting', label: '立项上会', stageCode: 'PROJECT_INITIATION', fileCode: 'PROJECT_INITIATION_MEETING_MATERIALS' },
  ],
  FEASIBILITY_REVIEW: [
    { key: 'main', label: '主要信息' },
    { key: 'support', label: '支持性文件' },
    { key: 'request-file', label: '请示文件', type: 'report', subTab: 'PROJECT_INITIATION' },
    { key: 'material', label: '可研材料', stageCode: 'FEASIBILITY_REVIEW', fileCode: 'PROJECT_FEASIBILITY_MATERIALS' },
    { key: 'meeting', label: '可研审查', stageCode: 'FEASIBILITY_REVIEW', fileCode: 'FEASIBILITY_REVIEW' },
    { key: 'invest-material', label: '投决准备', stageCode: 'FEASIBILITY_REVIEW', fileCode: 'INVESTMENT_DECISION_MATERIALS' },
  ],
  INVESTMENT_DECISION: [
    { key: 'main', label: '主要信息' },
    { key: 'support', label: '支持性文件' },
    { key: 'request-file', label: '请示文件', type: 'report', subTab: 'PROJECT_INITIATION' },
    { key: 'material', label: '投决材料', stageCode: 'INVESTMENT_DECISION', fileCode: 'INVESTMENT_DECISION_MATERIALS' },
    { key: 'meeting', label: '投决上会', stageCode: 'INVESTMENT_DECISION', fileCode: 'INVESTMENT_DECISION_MEETING_MATERIALS' },
  ],
}

const tabs = computed(() => STAGE_TABS_CONFIG[props.stage] || STAGE_TABS_CONFIG.PROJECT_RESERVE)
const activeTabConfig = computed(() => tabs.value.find(t => t.key === activeTab.value) || {})

const supportDocsData = computed(() => buildSupportDocsData(props.project || {}))

watch(
  () => [props.visible, props.project?.id, props.initialTab],
  ([visible, , tab]) => {
    if (visible) {
      // ★ 兜底：initialTab 不在当前阶段的 tabs 里就回退到 main
      const valid = tabs.value.some(t => t.key === tab)
      activeTab.value = valid ? tab : 'main'
      showSettingPanel.value = false
      showUploadDialog.value = false
      showMeetingUpload.value = false
      uploadRecord.value = null
      meetingUploadConfig.value = { tagName: '会议纪要', subCode: '', record: null }
    }
  },
  { immediate: true }
)

function handleReportCreate(payload) {
  emit('action', {
    type: 'create-report',
    subTab: payload.subTab,
    tabLabel: payload.tabLabel,
    project: props.project,
  })
}

function handleReportRowAction(row) {
  emit('action', { type: 'report-row-action', row, project: props.project })
}

function openSetting(type) {
  settingType.value = type
  showSettingPanel.value = true
}

function handleSettingSave(data) {
  console.log('[setting] 保存:', data)
  ElMessage.success('设置已保存（接口待接）')
  showSettingPanel.value = false
}

function handleUpload(item) {
  uploadRecord.value = item?.record || null
  uploadTagName.value = item?.label || ''
  showUploadDialog.value = true
}

function handleUploadSaved() {
  showUploadDialog.value = false
  materialTabRef.value?.loadFiles()
  loadNecessaryFiles()
}

function handleFileDeleted() {
  loadNecessaryFiles()
}

function handleMeetingAction(payload) {
  console.log('[ProjectDetailPanel] handleMeetingAction=', payload)
  console.log('[ProjectDetailPanel] has action?', GENERATE_REPORT_ACTIONS.has(payload.key))

  // 拦截智能审查
  if (payload.key === 'intelligent-review') {
    emit('action', { 
      type: 'intelligent-review', 
      subCode: payload.subCode, 
      step: payload.step, 
      project: props.project 
    })
    return
  }

  if (payload.key === 'set-owner') {
    ElMessage.info(`点击了「设置负责人」：${payload.step || ''}（弹窗待接）`)
    emit('action', { type: 'meeting', ...payload })
    return
  }

  // 拦截所有生成操作
  if (GENERATE_REPORT_ACTIONS.has(payload.key)) {
    emit('action', {
      type: 'generate-report',
      actionKey: payload.key,
      subCode: payload.subCode,
      step: payload.step,
      project: props.project,
      firstBusinessTitle: activeTabConfig.value.fileCode || '',
      secondaryBusinessTitle: payload.subCode || '',
      fileTypeTag: payload.fileTypeTag || '',
    })
    return
  }

  // 拦截所有上传操作
  if (MEETING_UPLOAD_ACTIONS.has(payload.key)) {
    meetingUploadConfig.value = { 
      tagName: payload.label?.replace(/^(生成|上传)/, '') || '文件', 
      subCode: payload.subCode || '', 
      record: payload.record || null 
    }
    showMeetingUpload.value = true
    return
  }

  ElMessage.info(`点击了：${payload.label || ''}`)
  emit('action', { type: 'meeting', ...payload })
}

function handleMeetingUploadSaved() {
  showMeetingUpload.value = false
  meetingTabRef.value?.loadMeeting()
  loadNecessaryFiles()
}

function handleMeetingFileDeleted() {
  loadNecessaryFiles()
}

// ★ 新增：refreshKey 变化时按当前 tab 刷新
watch(
  () => props.refreshKey,
  (val, old) => {
    if (val === old) return
    if (!props.visible) return

    if (activeTab.value === 'meeting') {
      meetingTabRef.value?.loadMeeting?.()
    } else if (activeTab.value === 'material' || activeTab.value === 'invest-material') {
      materialTabRef.value?.loadFiles?.()
    }
    // report tab 的刷新由 ProjectReportTab 内部 watch refreshKey 处理，此处不重复
    // 顺带刷新"必要性文件是否齐全"（阶段推进按钮可用性）
    loadNecessaryFiles()
  }
)
</script>

<style scoped>
/* ================= 完全同步 Overview 的毛玻璃外框 ================= */
.detail-panel {
  position: fixed;
  top: 65px;
  right: 12px;
  bottom: 20px;
  height: calc(100vh - 85px); 
  width: 779px;
  max-width: calc(100vw - 24px);
  z-index: 200;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  padding: 16px 0px 24px 0px;
  gap: 16px;
  background: linear-gradient(149.65deg, rgba(255, 255, 255, 0.2) 4.61%, rgba(255, 255, 255, 0.15) 29.07%, rgba(255, 255, 255, 0.3) 49.01%, rgba(255, 255, 255, 0.1) 61.4%, rgba(255, 255, 255, 0.2) 74.74%, rgba(255, 255, 255, 0.22) 97.19%);
  border: 3px solid rgba(255, 255, 255, 0.4);
  border-radius: 10px;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  box-shadow: 5px 5px 0px rgba(207, 234, 255, 0.5), -10px 0px 30px rgba(0, 0, 0, 0.1);
  color: #303133;
  overflow: hidden;
}

/* ================= 头部 ================= */
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin: 0 16px;
  padding: 10px 16px;
  border: none;
  border-radius: 0;
  background: transparent;
}
.panel-title {
  flex: 1;
  overflow: hidden;
  color: #111827;
  font-size: 24px;
  font-weight: 700;
  line-height: 28px;
  letter-spacing: 0.5px;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: 'Inter', 'PingFang SC', sans-serif;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

 .report-btn,
.advance-btn {
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  justify-content: center;
  min-width: 112px;
  padding: 0 16px;
  height: 36px;
  border: 1px solid #2563EB;
  border-radius: 6px;
  cursor: pointer;
  color: #2563EB;
  background: transparent;
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  transition: background 0.2s;
}
 .report-btn:hover { background: #eff6ff; }
 .advance-btn { margin: 0; color: #fff; background: #2563EB; border-color: #2563EB; font-size: 13px; font-weight: 500; border-radius: 6px; }
.advance-btn:hover { color: #fff; background: #1D4ED8; border-color: #1D4ED8; }
.report-icon { width: 14px; height: 14px; }

/* ================= 主 Tab 栏 ================= */
.panel-tabs {
  display: flex;
  justify-content: flex-start;
  height: 44px;
  background: rgba(255, 255, 255, 0.5);
  border-top: 1px solid rgba(255, 255, 255, 0.4);
  border-bottom: 1px solid rgba(255, 255, 255, 0.4);
  padding: 0 25px;
  gap: 0;
  overflow-x: auto;
}
.panel-tabs::-webkit-scrollbar { display: none; }

.panel-tab {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 0 20px;
  color: #4B5563;
  font-family: 'PingFang SC', 'Inter', sans-serif;
  font-size: 16px;
  background: transparent;
  border: 0;
  border-bottom: 3px solid transparent;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}
.panel-tab:hover { color: #1D4ED8; }
.panel-tab.active {
  color: #1D4ED8;
  font-weight: 500;
  background: rgba(19, 55, 134, 0.05);
  border-bottom-color: #2563EB;
}

/* ================= 内容区 ================= */

/* 详情面板内的文件条目统一使用半透明卡片，避免深色文字与底色冲突 */
.detail-panel :deep(.file-item) {
  box-sizing: border-box;
  margin: 0 0 10px;
  padding: 12px 14px;
  color: #374151;
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 10px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}
.detail-panel :deep(.file-item:hover) { background: rgba(255, 255, 255, 0.62); }
.detail-panel :deep(.file-item-name) { color: #1f2937; }
.detail-panel :deep(.file-item-desc) { color: #6b7280; }
.detail-panel :deep(.meta-inline),
.detail-panel :deep(.footer-meta) { color: #6b7280; }
.detail-panel :deep(.meta-inline.muted) { color: #9ca3af; }
.detail-panel :deep(.tag) {
  color: #1d4ed8;
  background: rgba(37, 99, 235, 0.1);
}
.detail-panel :deep(.tag-secondary) {
  color: #64748b;
  background: rgba(148, 163, 184, 0.14);
}

.panel-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 0 25px 16px 25px;
}
.panel-body::-webkit-scrollbar { width: 6px; height: 6px; }
.panel-body::-webkit-scrollbar-track { background: transparent; }
.panel-body::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.15); border-radius: 3px; }
.panel-body::-webkit-scrollbar-thumb:hover { background: rgba(0, 0, 0, 0.3); }

.detail-slide-enter-active,
.detail-slide-leave-active { transition: transform 0.25s ease; }
.detail-slide-enter-from,
.detail-slide-leave-to { transform: translateX(100%); }

.close-panel-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  color: #6b7280;
  background: transparent;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
  margin-left: 4px;
}
.close-panel-btn:hover {
  color: #111827;
  background: rgba(0, 0, 0, 0.06);
}
.close-panel-btn svg { width: 16px; height: 16px; }

/* 文件、会议步骤、报告表格等子页面内容统一为半透明白色卡片 */
.detail-panel :deep(.file-card),
.detail-panel :deep(.step-card),
.detail-panel :deep(.table-wrap) {
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 10px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}
.detail-panel :deep(.step-card.locked) {
  background: rgba(255, 255, 255, 0.38);
}
.detail-panel :deep(.sticky-col),
.detail-panel :deep(.report-table tbody tr:nth-child(even) td.sticky-col),
.detail-panel :deep(.report-table tbody tr:hover td.sticky-col) {
  background: rgba(255, 255, 255, 0.5) !important;
}

</style>