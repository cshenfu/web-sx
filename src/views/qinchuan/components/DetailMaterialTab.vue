<template>
  <div v-loading="loading" class="material-tab">
    <!-- 可研报告固定入口，不依赖材料类型字典 -->
    <div v-if="isFeasibilityStage" class="section">
      <div class="section-header">
        <span class="section-title">必要支持文件</span>
      </div>
      <div class="file-item">
        <div class="file-title-row">
          <span class="file-name">可研报告</span>
          <div v-if="!feasibilityReportRecord" class="feasibility-report-actions">
            <el-button
              link
              type="primary"
              size="small"
              @click="emit('generate-feasibility-report')"
            >一键生成可研报告</el-button>
            <el-button
              link
              type="primary"
              size="small"
              :loading="feasibilityUploading"
              @click="pickFeasibilityReport"
            >选择可研报告</el-button>
          </div>
        </div>

        <div
          v-if="feasibilityReportRecord"
          class="file-card feasibility-report-card"
        >
          <div v-if="isFeasibilityGenerating" class="feasibility-generating">
            <el-icon class="is-loading"><Loading /></el-icon>
            <span>可研报告正在生成中</span>
          </div>
          <div v-else class="file-card-top">
            <span class="file-icon">📄</span>
            <span class="file-real-name" :title="feasibilityReportFile?.fileName || '可研报告'">
              {{ feasibilityReportFile?.fileName || '-' }}
            </span>
            <div class="feasibility-report-card-actions">
              <el-button
                v-if="feasibilityReportFile?.filePath"
                link type="primary" size="small"
                :loading="feasibilityDownloading"
                @click="downloadFeasibilityReport"
              >下载</el-button>
              <el-button
                v-if="!feasibilityReportRecord?.reportId"
                link type="danger" size="small"
                :loading="feasibilityDeleting"
                @click="deleteFeasibilityReport"
              >删除</el-button>
            </div>
          </div>
        </div>
        <div v-else class="feasibility-empty">暂未上传或生成可研报告</div>

        <input
          ref="feasibilityFileInput"
          class="hidden-file-input"
          type="file"
          accept=".pdf,.doc,.docx"
          @change="handleFeasibilityFileChange"
        />
      </div>
    </div>

    <!-- 其他阶段仍按材料配置展示必要文件 -->
    <div v-if="!isFeasibilityStage" class="section">
      <div class="section-header">
        <span class="section-title">
          必要支持文件 ({{ completedCount }}/{{ requiredItems.length }})
        </span>
        <el-button link type="primary" size="small" @click="emit('open-setting', 'material')">
          设置
        </el-button>
      </div>

      <div v-if="!requiredItems.length" class="section-empty">
        -
      </div>

      <div v-for="item in requiredItems" :key="item.key" class="file-item">
        <div class="file-title-row">
          <span class="file-check" :class="{ done: !!item.file }">
            <el-icon v-if="item.file"><CircleCheckFilled /></el-icon>
            <el-icon v-else><CircleClose /></el-icon>
          </span>
          <span class="file-name">{{ item.label }}</span>
        </div>

        <div v-if="item.file" class="file-card">
          <div class="file-card-top">
            <span class="file-icon">📄</span>
            <span class="file-real-name" :title="item.file.fileName">{{ item.file.fileName }}</span>
            <div class="file-card-actions">
              <el-button
                link
                type="primary"
                size="small"
                :loading="downloadingKey === item.key"
                @click="handleDownload(item)"
              >
                下载
              </el-button>
              <el-button link type="primary" size="small" @click="onUploadClick(item)">编辑</el-button>
              <el-icon class="file-delete" title="删除" @click="handleDelete(item)">
                <Delete />
              </el-icon>
            </div>
          </div>
          <div class="file-card-meta">
            <span v-if="item.record?.uploaderName">@{{ item.record.uploaderName }}</span>
            <span v-if="item.record?.updateTime">{{ formatTime(item.record.updateTime) }}</span>
          </div>
        </div>

        <div v-else class="file-actions">
          <el-button link type="primary" size="small" @click="setTask(item)">设置任务</el-button>
          <el-button link type="primary" size="small" @click="onUploadClick(item)">上传</el-button>
        </div>
      </div>
    </div>

    <!-- 其他材料 -->
    <div v-if="otherMaterials.length > 0" class="section">
      <div class="section-header">
        <span class="section-title">其他文件</span>
        <el-button link type="primary" size="small" @click="emit('open-setting', 'other')">
          设置
        </el-button>
      </div>

      <div v-for="item in otherMaterials" :key="item.key" class="file-item">
        <div class="file-title-row">
          <span class="file-name">{{ item.label }}</span>
        </div>
        <div v-if="item.file" class="file-card">
          <div class="file-card-top">
            <span class="file-icon">📄</span>
            <span class="file-real-name" :title="item.file.fileName">{{ item.file.fileName }}</span>
            <div class="file-card-actions">
              <el-button
                link
                type="primary"
                size="small"
                :loading="downloadingKey === item.key"
                @click="handleDownload(item)"
              >
                下载
              </el-button>
              <el-button link type="primary" size="small" @click="onUploadClick(item)">编辑</el-button>
              <el-icon class="file-delete" title="删除" @click="handleDelete(item)">
                <Delete />
              </el-icon>
            </div>
          </div>
        </div>
        <div v-else class="file-actions">
          <el-button link type="primary" size="small" @click="onUploadClick(item)">设置任务</el-button>
          <el-button link type="primary" size="small" @click="onUploadClick(item)">上传</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { CircleCheckFilled, CircleClose, Delete, Loading } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as fileApi from '@/api/modules/projectFile'
import { useOssUpload } from '@/components/ossClient/index'

const props = defineProps({
  project: { type: Object, default: null },
  fileCode: { type: String, default: '' },
  stageCode: { type: String, default: '' },
})

const emit = defineEmits(['open-setting', 'upload', 'deleted', 'generate-feasibility-report'])

const ossUpload = useOssUpload()
const isFeasibilityStage = computed(() => props.stageCode === 'FEASIBILITY_REVIEW')

const loading = ref(false)
const fileList = ref([])
const downloadingKey = ref(null)   // 正在下载的项 key
const feasibilityFileInput = ref(null)
const feasibilityUploading = ref(false)
const feasibilityDownloading = ref(false)
const feasibilityDeleting = ref(false)
const feasibilityReportStatus = ref(null)

const feasibilityReportRecord = computed(() =>
  fileList.value.find(r => String(r.fileTypeTag || '').trim() === '可研报告') || null
)
const isFeasibilityGenerating = computed(() => {
  const record = feasibilityReportRecord.value
  if (!record?.reportId || record.fileUrlList?.length) return false
  return feasibilityReportStatus.value?.statusType !== 'COMCOMPLETED'
})
const feasibilityReportFile = computed(() => {
  const uploadedFile = feasibilityReportRecord.value?.fileUrlList?.[0]
  if (uploadedFile) return uploadedFile
  const report = feasibilityReportStatus.value
  if (report?.statusType !== 'COMCOMPLETED' || !report?.fileUrl) return null
  return { fileName: report.fileName || '-', filePath: report.fileUrl }
})

async function loadFeasibilityReportStatus(record) {
  feasibilityReportStatus.value = null
  if (!record?.reportId || record.fileUrlList?.length || !props.project?.id) return
  try {
    const response = await fileApi.getReportByProject({
      aiProjectId: props.project.id,
      reportProjectId: record.reportId,
    })
    feasibilityReportStatus.value = response?.data || null
  } catch (error) {
    // 查询失败不影响材料记录；本次不轮询，重新加载材料页时再查询。
    console.error('[material] 查询可研报告生成状态失败:', error)
    feasibilityReportStatus.value = null
  }
}

function pickFeasibilityReport() {
  if (feasibilityUploading.value) return
  feasibilityFileInput.value?.click()
}

async function handleFeasibilityFileChange(event) {
  const file = event.target.files?.[0]
  event.target.value = ''
  if (!file) return

  const ext = file.name.split('.').pop()?.toLowerCase()
  if (!['pdf', 'doc', 'docx'].includes(ext)) {
    ElMessage.error('可研报告仅支持 PDF、DOC、DOCX 格式')
    return
  }
  if (file.size > 100 * 1024 * 1024) {
    ElMessage.error('文件大小不能超过 100M')
    return
  }
  if (!props.project?.id || !props.fileCode) {
    ElMessage.error('缺少项目或材料阶段信息，无法上传')
    return
  }

  feasibilityUploading.value = true
  try {
    // 第一步：上传至 OSS，获取文件路径
    const uploadResult = await ossUpload.uploadFile(file, '', { projectId: props.project.id })
    const filePath = uploadResult?.obsPath || ''
    if (!filePath) {
      throw new Error(uploadResult?.msg || '文件上传失败')
    }

    // 第二步：创建/更新必要支持文件记录。可研报告不调用 fileParse。
    const payload = {
      aiProjectId: props.project.id,
      firstBusinessTitle: props.fileCode,
      secondaryBusinessTitle: feasibilityReportRecord.value?.secondaryBusinessTitle || '',
      fileTypeTag: '可研报告',
      isRequiredUpload: true,
      fileUrlList: [{
        fileName: file.name,
        filePath,
        fileSuffix: ext,
      }],
    }
    const record = feasibilityReportRecord.value
    const saveResult = record?.id
      ? await fileApi.updateFile({ ...payload, id: record.id })
      : await fileApi.addFileType(payload)

    if (saveResult?.code !== 200) {
      throw new Error(saveResult?.msg || '可研报告材料记录保存失败')
    }

    ElMessage.success('可研报告上传成功')
    await loadFiles()
  } catch (err) {
    console.error('[material] 可研报告上传失败:', err)
    ElMessage.error(err?.message || '可研报告上传失败')
  } finally {
    feasibilityUploading.value = false
  }
}

async function deleteFeasibilityReport() {
  const record = feasibilityReportRecord.value
  if (!record?.id || feasibilityDeleting.value) {
    if (!record?.id) ElMessage.warning('缺少可研报告记录，无法删除')
    return
  }

  try {
    await ElMessageBox.confirm(
      '确认删除当前可研报告吗？删除后可重新选择或生成',
      '删除可研报告',
      { type: 'warning', confirmButtonText: '确定删除', cancelButtonText: '取消' }
    )
  } catch {
    return
  }

  feasibilityDeleting.value = true
  try {
    const result = await fileApi.delFileType(record.id)
    if (result?.code !== undefined && result.code !== 200) {
      throw new Error(result.msg || '删除可研报告失败')
    }
    ElMessage.success('可研报告删除成功')
    await loadFiles()
    emit('deleted', { record, label: '可研报告' })
  } catch (err) {
    console.error('[material] 删除可研报告失败:', err)
    ElMessage.error(err?.message || '删除可研报告失败')
  } finally {
    feasibilityDeleting.value = false
  }
}

async function downloadFeasibilityReport() {
  const file = feasibilityReportFile.value
  if (!file?.filePath) {
    ElMessage.warning('文件路径为空，无法下载')
    return
  }
  feasibilityDownloading.value = true
  try {
    const url = await ossUpload.getFileUrl(file.filePath)
    if (!url) {
      ElMessage.error('获取下载地址失败')
      return
    }
    const a = document.createElement('a')
    a.href = url
    a.download = file.fileName || ''
    a.target = '_blank'
    a.rel = 'noopener'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  } catch (err) {
    console.error('[material] 可研报告下载失败:', err)
    ElMessage.error('下载失败：' + (err?.message || '未知错误'))
  } finally {
    feasibilityDownloading.value = false
  }
}

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

const requiredItems = computed(() =>
  fileList.value
    .filter(isRequired)
    .filter(r => !(isFeasibilityStage.value && String(r.fileTypeTag || '').includes('可研报告')))
    .map(r => ({
      key: r.id,
      label: r.fileTypeTag || '-',
      record: r,
      file: r.fileUrlList?.[0] || null,
    }))
)

const otherMaterials = computed(() =>
  fileList.value
    .filter(r => !isRequired(r))
    .filter(r => !(isFeasibilityStage.value && String(r.fileTypeTag || '').includes('可研报告')))
    .map(r => ({
      key: r.id,
      label: r.fileTypeTag || '-',
      record: r,
      file: r.fileUrlList?.[0] || null,
    }))
)

const completedCount = computed(
  () => requiredItems.value.filter(i => !!i.file).length
)

function formatTime(t) {
  if (!t) return '-'
  const d = new Date(t)
  if (Number.isNaN(d.getTime())) return t
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

async function loadFiles() {
  if (!props.project?.id || !props.fileCode) {
    fileList.value = []
    return
  }
  loading.value = true
  try {
    const res = await fileApi.getFileListByProjectid({
      aiProjectId: props.project.id,
      firstBusinessTitle: props.fileCode,
    })
    fileList.value = (res?.data || []).map(normalizeRecord)
    const reportRecord = fileList.value.find(r => String(r.fileTypeTag || '').trim() === '可研报告')
    await loadFeasibilityReportStatus(reportRecord)
    console.log('[material] 上传记录:', fileList.value)
  } catch (err) {
    console.error('[material] 加载失败:', err)
    fileList.value = []
  } finally {
    loading.value = false
  }
}

watch(
  () => [props.project?.id, props.fileCode],
  () => loadFiles(),
  { immediate: true }
)

function onUploadClick(item) {
  console.log('[material] 点击上传，item =', item)
  emit('upload', item)
}

function setTask(item){
  console.log("设置任务")
}

// ★ 下载：调 ossClient.getFileUrl 拿签名 URL，再触发浏览器下载
async function handleDownload(item) {
  const file = item?.file
  if (!file?.filePath) {
    ElMessage.warning('文件路径为空，无法下载')
    return
  }

  downloadingKey.value = item.key
  try {
    const url = await ossUpload.getFileUrl(file.filePath)
    if (!url) {
      ElMessage.error('获取下载地址失败')
      return
    }

    // 用 a 标签触发下载，避免 window.open 被拦截
    const a = document.createElement('a')
    a.href = url
    a.download = file.fileName || ''
    a.target = '_blank'
    a.rel = 'noopener'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  } catch (err) {
    console.error('[material] 下载失败:', err)
    ElMessage.error('下载失败：' + (err?.message || '未知错误'))
  } finally {
    downloadingKey.value = null
  }
}

// ★ 删除：文件级 + 记录级 recognitionContent 一起清空
// ★ 删除：文件级 + 记录级 recognitionContent 一起清空（传空对象，不能传 null）
async function handleDelete(item) {
  const record = item?.record
  if (!record?.id) {
    ElMessage.warning('缺少文件记录，无法删除')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确认删除「${item.file?.fileName || item.label}」吗？删除后需重新上传`,
      '提示',
      { type: 'warning', confirmButtonText: '确定', cancelButtonText: '取消' }
    )
  } catch { return }

  try {
    await fileApi.updateFile({
      id: record.id,
      aiProjectId: record.aiProjectId ?? props.project?.id,
      firstBusinessTitle: record.firstBusinessTitle || props.fileCode,
      secondaryBusinessTitle: record.secondaryBusinessTitle || '',
      fileTypeTag: record.fileTypeTag,
      isRequiredUpload: isRequired(record),
      notes: record.notes,
      recognitionContent: {}, // ★ 清空记录级解析数据（空对象，不能 null）
      fileUrlList: [],        // ★ 文件级随数组清空
    })
    ElMessage.success('删除成功')
    await loadFiles()
    emit('deleted', item)
  } catch (err) {
    console.error('[material] 删除失败:', err)
    ElMessage.error(err?.message || '删除失败')
  }
}

defineExpose({ loadFiles })
</script>

<style scoped>
.material-tab { padding: 4px 0; }

.section { margin-bottom: 24px; }
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.section-title { color: #303133; font-size: 13px; font-weight: 600; }
.section-empty {
  padding: 16px 0;
  color: #909399;
  font-size: 12px;
  text-align: center;
}

.file-item { margin-bottom: 16px; }
.file-title-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
}
.file-check {
  display: inline-flex;
  color: #c0c4cc;
  font-size: 16px;
}
.file-check.done { color: #24b26b; }
.file-name { color: #303133; font-size: 13px; }

.feasibility-generating {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 42px;
  color: #409eff;
  font-size: 13px;
}
.feasibility-generating .el-icon { font-size: 17px; }

.file-card {
  padding: 10px 12px;
  background: #f7f8fa;
  border-radius: 4px;
}
.file-card-top {
  display: flex;
  align-items: center;
  gap: 8px;
}
.file-icon { font-size: 16px; }
.file-real-name {
  flex: 1;
  overflow: hidden;
  color: #303133;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.file-card-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
.file-delete {
  color: #c0c4cc;
  cursor: pointer;
  font-size: 14px;
}
.file-delete:hover { color: #f56c6c; }

.file-card-meta {
  display: flex;
  gap: 16px;
  margin-top: 6px;
  color: #909399;
  font-size: 12px;
}
.feasibility-report-actions { display: flex; align-items: center; gap: 12px; }
.feasibility-report-card-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.18s ease;
}
.feasibility-report-card:hover .feasibility-report-card-actions,
.feasibility-report-card:focus-within .feasibility-report-card-actions {
  opacity: 1;
}
.feasibility-empty { padding: 10px 12px; color: #909399; font-size: 12px; background: #f7f8fa; border-radius: 4px; }
.hidden-file-input { display: none; }

.file-actions {
  display: flex;
  gap: 12px;
  padding-left: 22px;
}
</style>