<template>
  <div v-loading="loading" class="material-tab">
    <!-- 必要材料 -->
    <div class="section">
      <div class="section-header">
        <span class="section-title">
          必要支持文件 ({{ completedCount }}/{{ requiredItems.length }})
        </span>
        <el-button link type="primary" size="small" @click="emit('open-setting', 'material')">
          设置
        </el-button>
      </div>

      <div v-if="!requiredItems.length" class="section-empty">
        暂无必要材料，请点击「设置」添加
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
          <el-button link type="primary" size="small" @click="onUploadClick(item)">设置任务</el-button>
          <el-button link type="primary" size="small" @click="onUploadClick(item)">上传</el-button>
        </div>
      </div>
    </div>

    <!-- 其他材料 -->
    <div v-if="otherMaterials.length > 0" class="section">
      <div class="section-header">
        <span class="section-title">其他材料</span>
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
import { CircleCheckFilled, CircleClose, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as fileApi from '@/api/modules/projectFile'
import { useOssUpload } from '@/components/ossClient/index'

const props = defineProps({
  project: { type: Object, default: null },
  fileCode: { type: String, default: '' },
  stageCode: { type: String, default: '' },
})

const emit = defineEmits(['open-setting', 'upload', 'deleted'])

const ossUpload = useOssUpload()

const loading = ref(false)
const fileList = ref([])
const downloadingKey = ref(null)   // 正在下载的项 key

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
  if (!t) return ''
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
.file-actions {
  display: flex;
  gap: 12px;
  padding-left: 22px;
}
</style>