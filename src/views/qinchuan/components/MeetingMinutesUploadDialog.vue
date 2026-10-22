<template>
    <el-dialog
      :model-value="visible"
      :title="`上传${tagName}`"
      width="640px"
      :close-on-click-modal="false"
      class="file-upload-dialog"
      @update:model-value="v => !v && emit('close')"
    >
      <div class="upload-tip">
        支持 docx、pdf 格式数据（系统会自动解析文档，请确认解析的内容）
      </div>
  
      <div v-if="parseError" class="upload-error-tip">
        解析文件不完整，请手动填写对应数据后进行上传
      </div>
  
      <!-- ① 选择文件 -->
      <div v-if="!selectedFile" class="upload-empty">
        <el-button type="primary" plain @click="pickFile">
          <el-icon><Plus /></el-icon>
          选择文件
        </el-button>
        <p class="upload-empty-tip">支持 pdf / doc / docx，文件最大 100M</p>
      </div>
  
      <!-- ② 处理中 -->
      <div v-else-if="processing" class="file-card parsing-card">
        <div class="parsing-top">
          <span class="file-name">{{ selectedFile.name }}</span>
          <el-icon class="file-delete" @click="handleRemove"><Delete /></el-icon>
        </div>
        <el-progress
          :percentage="100"
          :show-text="false"
          :indeterminate="true"
          :duration="2"
          :stroke-width="4"
        />
        <div class="parsing-text">{{ processingText }}</div>
      </div>
  
      <!-- ③ 表单 -->
      <div v-else class="file-card">
        <div class="file-top">
          <span class="file-name">{{ selectedFile.name }}</span>
          <el-icon class="file-delete" @click="handleRemove"><Delete /></el-icon>
        </div>
  
        <el-form label-position="left" label-width="100px" size="small" class="file-form">
          <el-form-item label="文件类型">
            <el-input v-model="form.fileType" disabled />
          </el-form-item>
  
          <el-form-item label="批准单位">
            <el-input v-model="form.approvalUnit" placeholder="请输入" />
          </el-form-item>
  
          <el-form-item label="发文号">
            <el-input v-model="form.dispatchNo" placeholder="请输入" />
            <div class="field-hint">如果有发文号请填写</div>
          </el-form-item>
  
          <el-form-item label="取得日期">
            <el-date-picker
              v-model="form.obtainDate"
              type="date"
              placeholder="请选择"
              value-format="YYYY-MM-DD"
              style="width: 100%"
            />
          </el-form-item>
        </el-form>
      </div>
  
      <input
        ref="fileInputRef"
        type="file"
        accept=".pdf,.doc,.docx"
        style="display: none"
        @change="onFilePicked"
      />
  
      <template #footer>
        <el-button @click="emit('close')">取消</el-button>
        <el-button
          type="primary"
          :loading="saving"
          :disabled="!selectedFile || processing || !filePath"
          @click="handleSave"
        >
          保存
        </el-button>
      </template>
    </el-dialog>
  </template>
  
  <script setup>
  import { ref, reactive, watch } from 'vue'
  import { Delete, Plus } from '@element-plus/icons-vue'
  import { ElMessage } from 'element-plus'
  import {
    fileParse,
    updateFile,
    addFileType,
  } from '@/api/modules/projectFile'
  import { useOssUpload } from '@/components/ossClient/index'
  
  const props = defineProps({
    visible: { type: Boolean, default: false },
    tagName: { type: String, default: '会议纪要' },
    project: { type: Object, default: null },
    fileCode: { type: String, default: '' },
    secondaryBusinessTitle: { type: String, default: '' },
    record: { type: Object, default: null },
  })
  
  const emit = defineEmits(['close', 'saved'])
  
  const FORCE_FILE_TYPE = 2
  
  const fileInputRef = ref(null)
  const selectedFile = ref(null)
  const filePath = ref('')
  const processing = ref(false)
  const processingText = ref('解析中...')
  const parseError = ref(false)
  const saving = ref(false)
  
  const form = reactive({
    fileType: '会议纪要',
    approvalUnit: '',
    dispatchNo: '',
    obtainDate: '',
  })
  
  watch(
    () => props.visible,
    (val) => {
      console.log('[meeting-upload] visible:', val, 'tag:', props.tagName, 'record:', props.record)
      if (val) reset()
    }
  )
  
  function reset() {
    selectedFile.value = null
    filePath.value = ''
    processing.value = false
    processingText.value = '解析中...'
    parseError.value = false
    saving.value = false
    form.fileType = props.tagName
    form.approvalUnit = ''
    form.dispatchNo = ''
    form.obtainDate = ''
  }
  
  function pickFile() {
    fileInputRef.value?.click()
  }
  
  async function onFilePicked(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
  
    const ext = file.name.split('.').pop().toLowerCase()
    if (!['pdf', 'doc', 'docx'].includes(ext)) {
      ElMessage.error('仅支持 pdf / doc / docx 格式')
      return
    }
    if (file.size / 1024 / 1024 > 100) {
      ElMessage.error('文件大小不能超过 100M')
      return
    }
  
    console.log('[meeting-upload] 选中 File:', file.name, file.size, 'isFile:', file instanceof File)
  
    selectedFile.value = file
    processing.value = true
    parseError.value = false
    processingText.value = '上传中...'
  
    const ossPromise = uploadToOss(file).then(path => {
      filePath.value = path
    }).catch(err => {
      console.error('[meeting-upload] OSS 上传失败:', err)
      ElMessage.error('文件上传失败：' + (err?.message || '未知错误'))
      selectedFile.value = null
    })
  
    processingText.value = '解析中...'
    const parsePromise = parseFile(file).then(data => {
      applyParseResult(data)
    }).catch(err => {
      console.error('[meeting-upload] fileParse 失败:', err)
      form.fileType = props.tagName
    })
  
    await Promise.allSettled([ossPromise, parsePromise])
    processing.value = false
  }
  
  async function uploadToOss(file) {
    const ossUpload = useOssUpload()
    const result = await ossUpload.uploadFile(file)
    console.log('[meeting-upload] OSS 上传返回:', result)
    return result?.obsPath || ''
  }
  
  async function parseFile(file) {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('file_type', FORCE_FILE_TYPE)
    const res = await fileParse(formData)
    console.log('[meeting-upload] fileParse 返回:', res)
    if (res && typeof res === 'object' && 'fixedFileTitle' in res) return res
    return res?.data ?? {}
  }
  
  function applyParseResult(data) {
    form.approvalUnit = data.approvalUnit || ''
    form.dispatchNo = data.dispatchNo || ''
    form.obtainDate = normalizeDate(data.obtainDate)
    if (data.fileType) form.fileType = data.fileType
  }
  
  function normalizeDate(v) {
    if (!v) return ''
    const n = Number(v)
    if (Number.isFinite(n) && n > 1000000000000) {
      const d = new Date(n)
      const pad = x => String(x).padStart(2, '0')
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
    }
    return String(v)
  }
  
  function handleRemove() {
    selectedFile.value = null
    filePath.value = ''
    parseError.value = false
    reset()
  }
  
  function buildRecognitionContent() {
    return {
      fileType: form.fileType,
      approvalUnit: form.approvalUnit,
      dispatchNo: form.dispatchNo,
      obtainDate: form.obtainDate,
    }
  }
  
async function handleSave() {
  if (!selectedFile.value) {
    ElMessage.warning('请先选择文件')
    return
  }
  if (!filePath.value) {
    ElMessage.warning('文件还在上传中，请稍候')
    return
  }

  const fileName = selectedFile.value.name
  const fileSuffix = fileName.split('.').pop().toLowerCase()

  // ★ 解析结果只构建一次，文件级 + 记录级共用
  const recognitionContent = buildRecognitionContent()

  const newFile = {
    fileName,
    filePath: filePath.value,
    fileSuffix,
    recognitionContent, // 文件级
  }

  saving.value = true
  try {
    let res
    if (props.record?.id) {
      const payload = {
        id: props.record.id,
        aiProjectId: props.project?.id,
        firstBusinessTitle: props.record.firstBusinessTitle || props.fileCode,
        secondaryBusinessTitle: props.record.secondaryBusinessTitle || props.secondaryBusinessTitle,
        fileTypeTag: props.record.fileTypeTag || props.tagName,
        isRequiredUpload: normalizeBool(props.record.isRequiredUpload),
        notes: props.record.notes,
        recognitionContent, // ★ 记录级
        fileUrlList: [newFile],
      }
      res = await updateFile(payload)
    } else {
      const payload = {
        aiProjectId: props.project?.id,
        firstBusinessTitle: props.fileCode,
        secondaryBusinessTitle: props.secondaryBusinessTitle,
        fileTypeTag: props.tagName,
        isRequiredUpload: false,
        recognitionContent, // ★ 记录级
        fileUrlList: [newFile],
      }
      res = await addFileType(payload)
    }

    if (res?.code === 200) {
      ElMessage.success('上传成功')
      emit('saved')
      emit('close')
    } else {
      ElMessage.error(res?.msg || '上传失败')
    }
  } catch (err) {
    console.error('[meeting-upload] 提交失败:', err)
    ElMessage.error(err?.message || '上传失败')
  } finally {
    saving.value = false
  }
}
  </script>
  
  <style scoped>
  .upload-tip {
    padding: 8px 12px;
    margin-bottom: 12px;
    color: #909399;
    font-size: 12px;
    background: #f7f8fa;
    border-radius: 4px;
  }
  
  .upload-error-tip {
    padding: 8px 12px;
    margin-bottom: 12px;
    color: #f56c6c;
    font-size: 12px;
    background: #fef0f0;
    border: 1px solid #fde2e2;
    border-radius: 4px;
  }
  
  .upload-empty {
    padding: 30px 0;
    text-align: center;
  }
  .upload-empty-tip {
    margin-top: 8px;
    color: #909399;
    font-size: 12px;
  }
  
  .file-card {
    padding: 14px 16px;
    background: #f7f8fa;
    border-radius: 6px;
  }
  
  .parsing-card {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .parsing-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .parsing-text {
    color: #909399;
    font-size: 12px;
  }
  
  .file-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
  }
  .file-name {
    flex: 1;
    overflow: hidden;
    color: #1677ff;
    font-size: 13px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .file-delete {
    color: #909399;
    cursor: pointer;
    font-size: 16px;
  }
  .file-delete:hover { color: #f56c6c; }
  
  .file-form :deep(.el-form-item) {
    margin-bottom: 12px;
  }
  .file-form :deep(.el-form-item__label) {
    color: #606266;
    font-size: 12px;
  }
  
  .field-hint {
    color: #a0a5ad;
    font-size: 11px;
    line-height: 1.4;
    margin-top: 2px;
  }
  </style>