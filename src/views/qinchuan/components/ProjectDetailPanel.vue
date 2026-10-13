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
          <el-button size="small" type="primary" @click="handleHeaderAction">
            开始立项
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
import { ElMessage } from 'element-plus'
import DetailMainTab from './DetailMainTab.vue'
import DetailMaterialTab from './DetailMaterialTab.vue'
import DetailMeetingTab from './DetailMeetingTab.vue'
import MaterialSettingPanel from './MaterialSettingPanel.vue'
import FileUploadDialog from './FileUploadDialog.vue'
import MeetingMinutesUploadDialog from './MeetingMinutesUploadDialog.vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  project: { type: Object, default: null },
  stage: { type: String, default: '' },
  initialTab: { type: String, default: 'main' },
})

const emit = defineEmits(['close', 'action'])

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
  subCode: '',      // PIM_TO_NEW_ENERGY_COMPANY 等
  record: null,     // 该步骤下已有记录（用于 update 追加）
})

// 走会议纪要上传弹窗的 action key
const MEETING_UPLOAD_ACTIONS = new Set([
  'gen-application',
  'gen-letter',
  'gen-report',
  'upload-minutes',
  'upload-approval',
  'replace',        // 替换按钮也复用这个弹窗
])

// ========================================================
// 各阶段 Tabs 配置
// ========================================================
const STAGE_TABS_CONFIG = {
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
// 面板顶栏按钮
// ========================================================
function handleHeaderAction() {
  ElMessage.info('点击了「开始立项」')
  emit('action', { type: 'header-button', project: props.project })
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
}

// ========================================================
// 上会流程（DetailMeetingTab → MeetingMinutesUploadDialog）
// ========================================================
function handleMeetingAction(payload) {
  console.log('[panel] meeting action =', payload)

  // 设置负责人：将来接弹窗（暂时弹提示占位）
  if (payload.key === 'set-owner') {
    ElMessage.info(`点击了「设置负责人」：${payload.step || ''}（弹窗待接）`)
    emit('action', { type: 'meeting', ...payload })
    return
  }

  // 上传 / 生成 / 替换 → 打开会议纪要上传弹窗
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