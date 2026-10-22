<template>
  <div v-loading="loading" class="meeting-tab">
    <div v-if="!steps.length && !loading" class="meeting-empty">
      暂无上会流程
    </div>

    <div
      v-for="step in steps"
      :key="step.subCode"
      class="step-card"
      :class="{ locked: !step.unlocked }"
    >
      <!-- 标题行 -->
      <div class="step-header">
        <span class="step-check" :class="{ done: step.done, locked: !step.unlocked }">
          <el-icon v-if="step.done"><CircleCheckFilled /></el-icon>
          <el-icon v-else><CircleClose /></el-icon>
        </span>

        <span
          class="step-title"
          :class="{ 'has-file': step.fileGroups.length > 0 }"
          @click="handleTitleClick(step)"
        >
          {{ step.subDesc }}
        </span>

        <div class="step-meta">
          <span v-if="step.owner">@{{ step.owner }}</span>
          <span v-if="step.time">{{ formatTime(step.time) }}</span>
        </div>

        <el-button
          v-if="hasSetOwner(step)"
          link
          type="primary"
          size="small"
          class="set-owner-btn"
          @click.stop="handleSetOwner(step)"
        >
          {{ step.owner ? '调整负责人' : '设置负责人' }}
        </el-button>
      </div>

      <!-- 已上传文件 -->
      <div v-if="step.fileGroups.length" class="step-files">
        <div
          v-for="(group, gi) in step.fileGroups"
          :key="gi"
          class="file-card"
        >
          <div class="file-card-top">
            <span class="file-type-tag">{{ group.label }}</span>
            <span
              class="file-real-name"
              :title="group.fileName"
              @click="handleDownload(group)"
            >
              {{ group.fileName }}
            </span>
            <el-icon class="file-delete" title="删除" @click="handleRemoveFile(group, step)">
              <Delete />
            </el-icon>
          </div>
          <div class="file-card-meta">
            <span>@{{ group.uploaderName || '-' }}</span>
            <span>{{ formatTime(group.uploadTime) }}</span>
            <el-button
              link
              type="primary"
              size="small"
              class="replace-btn"
              :disabled="!step.unlocked"
              @click="handleReplace(group, step)"
            >
              替换
            </el-button>
          </div>
        </div>
      </div>

      <!-- 无文件时：常显未完成操作 -->
      <div v-if="step.pendingActions.length > 0" class="step-actions">
        <el-button
          v-for="action in step.pendingActions"
          :key="action.key"
          link
          type="primary"
          size="small"
          :disabled="!step.unlocked"
          @click="handleAction(action, step)"
        >
          {{ action.label }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { CircleCheckFilled, CircleClose, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as fileApi from '@/api/modules/projectFile'

const props = defineProps({
  project: { type: Object, default: null },
  stageCode: { type: String, default: '' },
  fileCode: { type: String, default: '' },
})

const emit = defineEmits(['action', 'deleted'])

const loading = ref(false)
const steps = ref([])

// 操作按钮配置
const STEP_ACTIONS_MAP = {
  PIM_TO_NEW_ENERGY_COMPANY: [
    { key: 'gen-application', label: '生成立项申请报告' },
    { key: 'upload-minutes', label: '上传会议纪要' },
  ],
  PIM_TO_SHAANXI_COMPANY: [
    { key: 'gen-application', label: '生成立项申请报告' },
    { key: 'gen-letter', label: '生成立项请示函' },
  ],
  PIM_SHAANXI_COMPANY: [
    { key: 'upload-minutes', label: '上传会议纪要' },
    { key: 'upload-approval', label: '上传立项批复文件' },
  ],
  FER_TO_NEW_ENERGY_COMPANY: [
    { key: 'gen-report', label: '生成可研审查报告' },
    { key: 'upload-minutes', label: '上传会议纪要' },
  ],
  IDM_TO_NEW_ENERGY_COMPANY: [
    { key: 'gen-application', label: '生成投决申请报告' },
    { key: 'upload-minutes', label: '上传会议纪要' },
  ],
  IDM_TO_SHAANXI_COMPANY: [
    { key: 'gen-application', label: '生成投决申请报告' },
    { key: 'gen-letter', label: '生成投决请示函' },
  ],
  IDM_SHAANXI_COMPANY: [
    { key: 'upload-minutes', label: '上传会议纪要' },
    { key: 'upload-approval', label: '上传投决批复文件' },
  ],
  IDM_TO_GROUP: [
    { key: 'upload-minutes', label: '上传会议纪要' },
    { key: 'upload-approval', label: '上传集团批复文件' },
  ],
  IDM_APPROVAL_TO_NEW_ENERGY_COMPANY: [
    { key: 'upload-approval', label: '上传投资决策批复文件' },
  ],
}

// ★ action.key → 该操作对应的文件类型标签（用于判定"是否已完成"）
const ACTION_TO_FILE_TAG = {
  'gen-application': '立项申请',
  'gen-letter': '立项请示函',
  'gen-report': '可研审查报告',
  'upload-minutes': '会议纪要',
  'upload-approval': '批复文件',
}

// 需要"设置负责人"的步骤
const NEED_SET_OWNER_STEPS = new Set([
  'PIM_TO_SHAANXI_COMPANY',
  'IDM_TO_SHAANXI_COMPANY',
])

function hasSetOwner(step) {
  return NEED_SET_OWNER_STEPS.has(step.subCode)
}

function normalizeBool(v) {
  return v === 1 || v === '1' || v === true || v === 'true'
}

function formatTime(t) {
  if (!t) return ''
  const d = new Date(t)
  if (Number.isNaN(d.getTime())) return t
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

function normalizeFileList(list) {
  return (list || []).map(item => {
    let urls = item.fileUrlList
    if (typeof urls === 'string') {
      try { urls = JSON.parse(urls) } catch { urls = [] }
    }
    return { ...item, fileUrlList: Array.isArray(urls) ? urls : [] }
  })
}

function buildFileGroups(record, actions) {
  if (!record?.fileUrlList?.length) return []
  return record.fileUrlList.map((f, i) => ({
    fileName: f.fileName,
    filePath: f.filePath,
    fileSuffix: f.fileSuffix,
    label:
      f.recognitionContent?.fileType ||
      f.fileBusinessType ||
      actions[i]?.label?.replace(/^(生成|上传)/, '') ||
      '文件',
    uploaderName: record.uploaderName || record.assignedUploaderName || '-',
    uploadTime: record.updateTime || record.createTime,
    raw: f,
    record,
  }))
}

// ★ 判断某个 action 是否已完成（该步骤下已有对应标签的文件）
function isActionCompleted(action, fileGroups) {
  const tag = ACTION_TO_FILE_TAG[action.key]
  if (!tag) return false
  return fileGroups.some(g => {
    const label = g.label || ''
    return label === tag || label.includes(tag) || tag.includes(label)
  })
}

// ★ 计算"还没完成的操作"
function getPendingActions(actions, fileGroups) {
  return actions.filter(a => !isActionCompleted(a, fileGroups))
}

function isStepDone(step) {
  return step.files.length > 0
}

// ========================================================
// loadMeeting
// ========================================================
async function loadMeeting() {
  if (!props.project?.id || !props.fileCode) {
    steps.value = []
    return
  }
  loading.value = true
  try {
    const enumRes = await fileApi.getFileType()
    const stage = (enumRes?.data || []).find(s => s.stageCode === props.stageCode)
    const firstBiz = (stage?.firstBusinessTitle || [])
      .find(f => f.fileCode === props.fileCode)
    const subList = firstBiz?.secondaryBusinessTitle || []

    const fileRes = await fileApi.getFileListByProjectid({
      aiProjectId: props.project.id,
      firstBusinessTitle: props.fileCode,
    })
    const fileList = normalizeFileList(fileRes?.data)

    const rawSteps = subList.map(sub => {
      const actions = STEP_ACTIONS_MAP[sub.subCode] || [
        { key: 'upload', label: '上传文件' },
      ]

      const records = fileList.filter(
        f => f.secondaryBusinessTitle === sub.subCode
      )
      const files = records.flatMap(r => r.fileUrlList || [])
      const fileGroups = records.flatMap(r => buildFileGroups(r, actions))
      const lastRecord = records.length ? records[records.length - 1] : null

      // ★ 计算未完成的操作
      const pendingActions = getPendingActions(actions, fileGroups)

      return {
        subCode: sub.subCode,
        subDesc: sub.subDesc,
        files,
        fileGroups,
        pendingActions,        // ★ 只包含未完成的操作
        owner:
          lastRecord?.assignedUploaderName ||
          lastRecord?.uploaderName ||
          '',
        time:
          lastRecord?.updateTime ||
          lastRecord?.createTime ||
          '',
        actions,
        lastRecord,
        records,
      }
    })

    let allPrevDone = true
    steps.value = rawSteps.map(step => {
      const done = isStepDone(step)
      const unlocked = allPrevDone
      allPrevDone = allPrevDone && done
      return { ...step, done, unlocked }
    })

    console.log('[meeting] steps =', steps.value)
  } catch (err) {
    console.error('[meeting] 加载失败:', err)
    steps.value = []
  } finally {
    loading.value = false
  }
}

watch(
  () => [props.project?.id, props.fileCode],
  () => loadMeeting(),
  { immediate: true }
)

// ========================================================
// 交互
// ========================================================
function handleTitleClick(step) {
  if (!step.fileGroups.length) return
  handleDownload(step.fileGroups[0])
}

function handleDownload(group) {
  ElMessage.info(`下载：${group.fileName}`)
}

// ★ 删除：文件级 + 记录级 recognitionContent 一起清空（传空对象，不能传 null）
async function handleRemoveFile(group, step) {
  const record = group?.record
  if (!record?.id) {
    ElMessage.warning('缺少文件记录，无法删除')
    return
  }

  try {
    await ElMessageBox.confirm(`确认删除「${group.fileName}」吗？`, '提示', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消',
    })
  } catch { return }

  try {
    await fileApi.updateFile({
      id: record.id,
      aiProjectId: record.aiProjectId ?? props.project?.id,
      firstBusinessTitle: record.firstBusinessTitle || props.fileCode,
      secondaryBusinessTitle: record.secondaryBusinessTitle || '',
      fileTypeTag: record.fileTypeTag,
      isRequiredUpload: normalizeBool(record.isRequiredUpload),
      notes: record.notes,
      recognitionContent: {}, // ★ 清空记录级解析数据（空对象，不能 null）
      fileUrlList: [],        // ★ 文件级随数组清空
    })
    ElMessage.success('删除成功')
    await loadMeeting()
    emit('deleted', step)
  } catch (err) {
    console.error('[meeting] 删除失败:', err)
    ElMessage.error(err?.message || '删除失败')
  }
}

function handleReplace(group, step) {
  emit('action', {
    key: 'replace',
    label: '替换文件',
    step: step.subDesc,
    subCode: step.subCode,
    file: group.raw,
    record: group.record,
  })
}

function handleSetOwner(step) {
  emit('action', {
    key: 'set-owner',
    label: '设置负责人',
    step: step.subDesc,
    subCode: step.subCode,
    record: step.lastRecord,
  })
}

function handleAction(action, step) {
  emit('action', {
    key: action.key,
    label: action.label,
    step: step.subDesc,
    subCode: step.subCode,
    record: step.lastRecord,
  })
}

defineExpose({ loadMeeting })
</script>

<style scoped>
.meeting-tab { padding: 4px 0; }

.meeting-empty {
  padding: 40px 0;
  color: #909399;
  font-size: 12px;
  text-align: center;
}

.step-card {
  padding: 14px 16px;
  margin-bottom: 12px;
  background: #f7f8fa;
  border-radius: 4px;
  transition: background 0.2s, opacity 0.2s;
}

.step-card.locked {
  background: #fafafa;
  opacity: 0.65;
}

.step-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}
.step-check {
  display: inline-flex;
  color: #c0c4cc;
  font-size: 16px;
}
.step-check.done { color: #24b26b; }
.step-check.locked { color: #dcdfe6; }

.step-title {
  color: #303133;
  font-size: 13px;
  font-weight: 500;
}
.step-title.has-file { cursor: pointer; }
.step-title.has-file:hover { color: #1677ff; }

.step-meta {
  display: flex;
  gap: 12px;
  margin-left: auto;
  color: #909399;
  font-size: 12px;
}

.set-owner-btn {
  padding: 0;
  margin-left: 4px;
}

.step-files {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 10px;
  padding-left: 24px;
}

.file-card {
  padding: 8px 10px;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 4px;
}

.file-card-top {
  display: flex;
  align-items: center;
  gap: 8px;
}

.file-type-tag {
  flex-shrink: 0;
  padding: 1px 6px;
  color: #606266;
  font-size: 11px;
  background: #f0f2f5;
  border-radius: 3px;
}

.file-real-name {
  flex: 1;
  overflow: hidden;
  color: #1677ff;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
}
.file-real-name:hover { text-decoration: underline; }

.file-delete {
  color: #c0c4cc;
  cursor: pointer;
  font-size: 14px;
}
.file-delete:hover { color: #f56c6c; }

.file-card-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 6px;
  color: #909399;
  font-size: 12px;
}
.replace-btn {
  margin-left: auto;
  padding: 0;
}

.step-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding-left: 24px;
}
</style>