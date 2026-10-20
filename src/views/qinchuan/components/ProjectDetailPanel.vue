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
        <div class="panel-header">
          <span class="panel-title">{{ project?.projectName || '-' }}</span>
          <el-button
            v-if="advanceConfig"
            size="small"
            type="primary"
            :disabled="!necessaryFilesDone"
            :loading="advancing"
            @click="handleHeaderAction"
          >
            {{ advanceConfig.label }}
          </el-button>
        </div>

        <div class="panel-tabs">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            class="panel-tab"
            :class="{ active: activeTab === tab.key }"
            @click="activeTab = tab.key"
          >
            {{ tab.label }}
          </button>
        </div>

        <div class="panel-body">
          <DetailMainTab
            v-if="activeTab === 'main'"
            :project="project"
          />
          <DetailMaterialTab
            v-else-if="activeTab === 'material'"
            ref="materialTabRef"
            :project="project"
            :file-code="activeTabConfig.fileCode"
            :stage-code="activeTabConfig.stageCode"
            @open-setting="openSetting"
            @upload="handleUpload"
          />
          <DetailMeetingTab
            v-else-if="activeTab === 'meeting'"
            ref="meetingTabRef"
            :project="project"
            :stage-code="activeTabConfig.stageCode"
            :file-code="activeTabConfig.fileCode"
            @action="handleMeetingAction"
          />
        </div>
      </template>

      <!-- 通用材料上传弹窗（FileUploadDialog） -->
      <FileUploadDialog
        :visible="showUploadDialog"
        :tag-name="uploadTagName"
        :record="uploadRecord"
        :project="project"
        :file-code="activeTabConfig.fileCode"
        @close="showUploadDialog = false"
        @saved="handleUploadSaved"
      />

      <!-- 会议纪要上传弹窗（MeetingMinutesUploadDialog） -->
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
import DetailMainTab from './DetailMainTab.vue'
import DetailMaterialTab from './DetailMaterialTab.vue'
import DetailMeetingTab from './DetailMeetingTab.vue'
import MaterialSettingPanel from './MaterialSettingPanel.vue'
import FileUploadDialog from './FileUploadDialog.vue'
import MeetingMinutesUploadDialog from './MeetingMinutesUploadDialog.vue'
import * as api from '@/api/modules/project'
import * as fileApi from '@/api/modules/projectFile'

const props = defineProps({
  visible: { type: Boolean, default: false },
  project: { type: Object, default: null },
  stage: { type: String, default: '' },
  initialTab: { type: String, default: 'main' },
})

const emit = defineEmits(['close', 'action'])

const router = useRouter()

const activeTab = ref('main')
const showSettingPanel = ref(false)
const settingType = ref('material')

// ---- 通用材料上传弹窗 ----
const materialTabRef = ref(null)
const showUploadDialog = ref(false)
const uploadTagName = ref('')
const uploadRecord = ref(null)

// ---- 会议纪要上传弹窗 ----
const meetingTabRef = ref(null)
const showMeetingUpload = ref(false)
const meetingUploadConfig = ref({
  tagName: '会议纪要',
  subCode: '',
  record: null,
})

// ★ 走全屏生成面板的 action（把投决相关拦截掉暂不支持）
const GENERATE_REPORT_ACTIONS = new Set([
  'gen-application',
  'gen-letter',
  'gen-report',
])

// ★ 走上传弹窗的 action
const MEETING_UPLOAD_ACTIONS = new Set([
  'upload-minutes',
  'upload-approval',
  'replace',
])

// ========================================================
// ★ 阶段推进配置（header 右上角按钮）
// ========================================================
const STAGE_ADVANCE = {
  PROJECT_RESERVE:    { label: '开始立项', next: 'PROJECT_INITIATION' },
  PROJECT_INITIATION: { label: '开始审查', next: 'FEASIBILITY_REVIEW' },
}
const advanceConfig = computed(() => STAGE_ADVANCE[props.stage] || null)

// ★ 阶段 → 路由 name 映射（与 router 中各阶段页面一致）
const STAGE_ROUTE_NAME = {
  PRELIMINARY_SELECTION: 'SiteSelect',
  PROJECT_RESERVE:       'Reserve',
  PROJECT_INITIATION:    'Approval',
  FEASIBILITY_REVIEW:    'Research',
  INVESTMENT_DECISION:   'Decision',
}

// ★ 必要性文件是否全部上传完成
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
      firstBusinessTitle: 'PROJECT_INITIATION_MATERIALS',
    })
    const list = (res?.data || []).map(normalizeRecord)
    const required = list.filter(isRequired)
    necessaryFilesDone.value =
      required.length > 0 && required.every(f => f.fileUrlList.length > 0)
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

    // ★ 跳转到下一阶段的列表模式
    const targetName = STAGE_ROUTE_NAME[next]
    if (targetName) {
      router.push({ name: targetName, query: { view: 'list' } })
    }
  } catch (err) {
    ElMessage.error(err?.message || `${label}失败`)
  } finally {
    advancing.value = false
  }
}

// ========================================================
// 各阶段 Tabs 配置
// ========================================================
const STAGE_TABS_CONFIG = {
  PRELIMINARY_SELECTION: [
    { key: 'main', label: '主要信息' },
  ],
  PROJECT_RESERVE: [
    { key: 'main', label: '主要信息' },
    {
      key: 'material',
      label: '立项材料',
      stageCode: 'PROJECT_RESERVE',
      fileCode: 'PROJECT_INITIATION_MATERIALS',
    },
  ],
  PROJECT_INITIATION: [
    { key: 'main', label: '主要信息' },
    {
      key: 'material',
      label: '立项材料',
      stageCode: 'PROJECT_INITIATION',
      fileCode: 'PROJECT_INITIATION_MATERIALS',
    },
    {
      key: 'meeting',
      label: '立项上会',
      stageCode: 'PROJECT_INITIATION',
      fileCode: 'PROJECT_INITIATION_MEETING_MATERIALS',
    },
  ],
  FEASIBILITY_REVIEW: [
    { key: 'main', label: '主要信息' },
    {
      key: 'material',
      label: '可研材料',
      stageCode: 'FEASIBILITY_REVIEW',
      fileCode: 'PROJECT_FEASIBILITY_MATERIALS',
    },
    {
      key: 'meeting',
      label: '可研审查',
      stageCode: 'FEASIBILITY_REVIEW',
      fileCode: 'FEASIBILITY_REVIEW_MATERIALS',
    },
  ],
  INVESTMENT_DECISION: [
    { key: 'main', label: '主要信息' },
    {
      key: 'material',
      label: '投决材料',
      stageCode: 'INVESTMENT_DECISION',
      fileCode: 'INVESTMENT_DECISION_MATERIALS',
    },
    {
      key: 'meeting',
      label: '投决上会',
      stageCode: 'INVESTMENT_DECISION',
      fileCode: 'INVESTMENT_DECISION_MEETING_MATERIALS',
    },
  ],
}

const tabs = computed(
  () => STAGE_TABS_CONFIG[props.stage] || STAGE_TABS_CONFIG.PROJECT_RESERVE
)

const activeTabConfig = computed(
  () => tabs.value.find(t => t.key === activeTab.value) || {}
)

watch(
  () => props.visible,
  (val) => {
    if (val) {
      activeTab.value = props.initialTab || 'main'
      showSettingPanel.value = false
      showUploadDialog.value = false
      showMeetingUpload.value = false
      uploadRecord.value = null
      meetingUploadConfig.value = { tagName: '会议纪要', subCode: '', record: null }
    }
  },
  { immediate: true }
)

watch(
  () => props.initialTab,
  (val) => {
    if (props.visible && val) activeTab.value = val
  }
)

// ========================================================
// 设置面板
// ========================================================
function openSetting(type) {
  settingType.value = type
  showSettingPanel.value = true
}

function handleSettingSave(data) {
  console.log('[setting] 保存:', data)
  ElMessage.success('设置已保存（接口待接）')
  showSettingPanel.value = false
}

// ========================================================
// 通用材料上传（DetailMaterialTab → FileUploadDialog）
// ========================================================
function handleUpload(item) {
  console.log('[panel] 打开通用上传弹窗，item =', item)
  uploadRecord.value = item?.record || null
  uploadTagName.value = item?.label || ''
  showUploadDialog.value = true
}

function handleUploadSaved() {
  showUploadDialog.value = false
  materialTabRef.value?.loadFiles()
  loadNecessaryFiles()          // ★ 同步刷新 header 按钮可用态
}

// ========================================================
// 上会流程（DetailMeetingTab → MeetingMinutesUploadDialog）
// ========================================================
function handleMeetingAction(payload) {
  console.log('[panel] meeting action =', payload)

  // 设置负责人
  if (payload.key === 'set-owner') {
    ElMessage.info(`点击了「设置负责人」：${payload.step || ''}（弹窗待接）`)
    emit('action', { type: 'meeting', ...payload })
    return
  }

  // ★ 生成报告：抛给上层打开全屏面板
  if (GENERATE_REPORT_ACTIONS.has(payload.key)) {
    emit('action', {
      type: 'generate-report',
      actionKey: payload.key,
      subCode: payload.subCode,
      step: payload.step,
      project: props.project,
    })
    return
  }

  // 上传 / 替换 → 打开会议纪要上传弹窗
  if (MEETING_UPLOAD_ACTIONS.has(payload.key)) {
    meetingUploadConfig.value = {
      tagName: payload.label?.replace(/^(生成|上传)/, '') || '会议纪要',
      subCode: payload.subCode || '',
      record: payload.record || null,
    }
    showMeetingUpload.value = true
    return
  }

  // 其他 action 直接向上抛
  ElMessage.info(`点击了：${payload.label || ''}`)
  emit('action', { type: 'meeting', ...payload })
}

function handleMeetingUploadSaved() {
  showMeetingUpload.value = false
  meetingTabRef.value?.loadMeeting()
}
</script>

<style scoped>
.detail-panel {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 520px;
  z-index: 200;
  display: flex;
  flex-direction: column;
  background: #fff;
  box-shadow: -4px 0 16px rgba(0, 0, 0, 0.08);
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 20px 12px;
  border-bottom: 1px solid #ebeef5;
}
.panel-title {
  flex: 1;
  overflow: hidden;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.panel-tabs {
  display: flex;
  gap: 24px;
  padding: 0 20px;
  border-bottom: 1px solid #ebeef5;
}
.panel-tab {
  position: relative;
  padding: 12px 0;
  color: #606266;
  font-size: 14px;
  background: transparent;
  border: 0;
  cursor: pointer;
}
.panel-tab.active {
  color: #1677ff;
  font-weight: 500;
}
.panel-tab.active::after {
  content: '';
  position: absolute;
  right: 0; bottom: -1px; left: 0;
  height: 2px;
  background: #1677ff;
}

.panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
}

.detail-slide-enter-active,
.detail-slide-leave-active {
  transition: transform 0.25s ease;
}
.detail-slide-enter-from,
.detail-slide-leave-to {
  transform: translateX(100%);
}
</style>