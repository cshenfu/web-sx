<template>
  <div v-if="visible" class="add-report-drawer">
    <header class="drawer-header">
      <h1>添加报告</h1>
      <div class="drawer-actions">
        <button type="button" class="btn-cancel" @click="$emit('close')">取消</button>
        <button type="button" class="btn-save" :disabled="saving" @click="handleSave">
          {{ saving ? '保存中...' : '保存' }}
        </button>
      </div>
    </header>

    <main class="drawer-body">
      <!-- 报告类型 Tabs -->
      <div v-if="!reportType" class="report-tabs">
        <button
          v-for="tab in reportTypeOptions"
          :key="tab.key"
          type="button"
          class="report-tab"
          :class="{ active: activeReportTab === tab.key }"
          @click="handleSwitchTab(tab.key)"
        >
          {{ tab.label }}
        </button>
      </div>

      <div class="upload-section">
        <div class="upload-hint">
          支持 docx 支持 doc、docx、pdf 格式数据导入，每次只能选择一种类型并导入最多1个文件（系统会自动解析文档，请确认解析的内容）
        </div>
        
        <div class="upload-action">
          <button type="button" class="btn-upload" :disabled="saving" @click="triggerFileInput">上传数据</button>
          <input
            ref="fileInputRef"
            type="file"
            multiple
            accept=".doc,.docx,.pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf"            style="display: none"
            @change="handleFileChange"
          />
        </div>

        <!-- 已上传文件展示 -->
        <div v-for="file in currentFiles" :key="file.name + file.size + file.lastModified" class="uploaded-file">
          <span class="file-name">{{ file.name }}</span>
        </div>
      </div>
      
      <!-- 备注输入框 -->
      <div class="remark-section">
        <div class="remark-label">备注</div>
        <el-input
          v-model="remark"
          type="textarea"
          :rows="3"
          placeholder="请输入备注信息（选填）"
          maxlength="200"
          show-word-limit
          :disabled="saving"
        />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import * as aiProjectApi from '@/api/modules/aiProject' 
import { useOssUpload } from '@/components/ossClient/index' 

const props = defineProps({
  visible: { type: Boolean, default: false },
  project: { type: Object, default: () => null },
  reportType: { type: String, default: '' }
})

const emit = defineEmits(['close', 'success'])

// 1. 顶层调用 Hook
const ossUpload = useOssUpload() 

const reportTypeOptions = [
  { key: 'FEASIBILITY_STUDY', label: '可研报告' },
  { key: 'PROJECT_PROPOSAL', label: '项目建议书' },
  { key: 'WIND_RESOURCE_ASSESSMENT', label: '风资源评估' },
  { key: 'COMPETITIVE_ALLOCATION', label: '竞配申请报告' },
  { key: 'POST_EVALUATION', label: '后评价报告' },
  { key: 'PROJECT_INITIATION', label: '请示文件' },
]

const activeReportTab = ref('FEASIBILITY_STUDY')
const fileInputRef = ref(null)
const currentFiles = ref([])
const remark = ref('')
const saving = ref(false)

watch(() => props.visible, (val) => {
  if (val) {
    console.log('【AddReportPanel】组件已显示，当前 project:', props.project)
    activeReportTab.value = props.reportType || 'FEASIBILITY_STUDY'
    currentFiles.value = []
    remark.value = ''
    saving.value = false
  }
})

function handleSwitchTab(key) {
  if (activeReportTab.value === key) return
  activeReportTab.value = key
  currentFiles.value = []
}

function triggerFileInput() {
  fileInputRef.value?.click()
}

function handleFileChange(e) {
  const files = Array.from(e.target.files || [])
  if (!files.length) return
  const allowExts = ['doc', 'docx', 'pdf']
  const invalid = files.filter(file => !allowExts.includes(file.name.split('.').pop()?.toLowerCase()))
  if (invalid.length) {
    ElMessage.warning('仅支持 doc、docx、pdf 格式，请检查所选文件')
    e.target.value = ''
    return
  }
  const existing = new Set(currentFiles.value.map(file => file.name + file.size + file.lastModified))
  currentFiles.value = [...currentFiles.value, ...files.filter(file => !existing.has(file.name + file.size + file.lastModified))]
  e.target.value = ''
}
// ★ 核心排错方法
async function handleSave() {
  if (!currentFiles.value.length) {
    ElMessage.warning('请先选择报告文件')
    return
  }
  const projectId = props.project?.aiProjectId || props.project?.id
  if (!projectId) {
    ElMessage.error('缺少项目 ID，无法上传报告')
    return
  }
  try {
    saving.value = true
    if (!ossUpload || typeof ossUpload.uploadFile !== 'function') throw new Error('OSS 上传组件未正确初始化')
    if (typeof aiProjectApi.uploadReport !== 'function') throw new Error('找不到 uploadReport 接口')
    const reportType = props.reportType || activeReportTab.value
    let successCount = 0
    for (const file of currentFiles.value) {
      const uploadRes = await ossUpload.uploadFile(file)
      const fileUrl = uploadRes?.obsPath || uploadRes?.url || ''
      if (!fileUrl) throw new Error('文件「' + file.name + '」上传后未获取到文件地址')
      const payload = {
        aiProjectId: projectId,
        fileName: file.name,
        fileSize: file.size,
        fileSuffix: file.name.split('.').pop().toLowerCase(),
        fileUrl,
        remark: remark.value,
        reportType,
      }
      const res = await aiProjectApi.uploadReport(payload)
      if (res?.code === 200 || res?.code === '200' || res?.success) successCount++
      else throw new Error(res?.msg || '「' + file.name + '」保存失败')
    }
    ElMessage.success('成功添加 ' + successCount + ' 份报告')
    emit('success', { reportType, project: props.project, count: successCount })
    currentFiles.value = []
    emit('close')
  } catch (err) {
    console.error('【AddReportPanel】异常详情:', err)
    ElMessage.error(err?.message || '报告上传失败')
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.add-report-drawer {
  position: fixed; top: 65px; right: 0; bottom: 0;
  width: 50vw; min-width: 500px; z-index: 310;
  background: #f5f7fa; box-shadow: -4px 0 16px rgba(0, 0, 0, 0.1);
  display: flex; flex-direction: column;
}
.drawer-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 24px; background: #fff; border-bottom: 1px solid #eef0f4;
}
.drawer-header h1 { margin: 0; font-size: 18px; font-weight: 600; color: #1f2937; }
.drawer-actions { display: flex; gap: 12px; }
.drawer-actions button {
  padding: 6px 16px; font-size: 14px; border-radius: 4px; cursor: pointer;
  border: 1px solid transparent; transition: all 0.2s;
}
.btn-cancel { color: #606266; background: #f4f4f5; border-color: #dcdfe6; }
.btn-cancel:hover { background: #e9e9eb; color: #1677ff; border-color: #c6e2ff; }
.btn-save { color: #fff; background: #1677ff; }
.btn-save:hover { background: #4096ff; }
.btn-save:disabled { opacity: 0.6; cursor: not-allowed; }
.drawer-body { flex: 1; padding: 24px; overflow-y: auto; }
.report-tabs { display: flex; gap: 8px; margin-bottom: 24px; flex-wrap: wrap; }
.report-tab {
  padding: 8px 16px; font-size: 14px; color: #606266; background: #fff;
  border: 1px solid #e4e7ed; border-radius: 4px; cursor: pointer; transition: all 0.2s;
}
.report-tab:hover { color: #1677ff; }
.report-tab.active {
  color: #1677ff; background: #e6f2ff; border-color: #1677ff; font-weight: 500;
}
.upload-section { background: #fff; padding: 24px; border-radius: 8px; border: 1px solid #eef0f4; }
.upload-hint { color: #909399; font-size: 13px; margin-bottom: 16px; line-height: 1.5; }
.btn-upload {
  padding: 8px 24px; color: #1677ff; background: #e6f2ff; border: 1px solid #1677ff;
  border-radius: 4px; cursor: pointer; font-size: 14px; transition: all 0.2s;
}
.btn-upload:hover { background: #bae0ff; }
.btn-upload:disabled { opacity: 0.6; cursor: not-allowed; }
.uploaded-file { margin-top: 16px; }
.file-name { color: #1677ff; font-size: 14px; text-decoration: underline; cursor: default; }
.remark-section { margin-top: 24px; }
.remark-label { margin-bottom: 8px; color: #606266; font-size: 14px; }
</style>