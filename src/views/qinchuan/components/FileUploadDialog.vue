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
      <!-- 文件头部 -->
      <div class="file-top">
        <div class="file-name-wrapper">
          <el-icon class="file-icon"><Document /></el-icon>
          <span class="file-name">{{ selectedFile.name }}</span>
        </div>
        <!-- 统一把删除按钮放在右上角或紧跟文件名，避免样式乱飘 -->
        <el-icon class="file-delete" @click="handleRemove"><Delete /></el-icon>
      </div>

      <el-form label-position="left" label-width="120px" size="small" class="file-form">
        <el-form-item label="文件类型">
          <div class="readonly-input">
            {{ standardTag || form.fileType || '通用文件' }}
          </div>
        </el-form-item>

        <!-- 通用的基础字段 -->
        <el-form-item
          v-for="field in visibleCommonFields"
          :key="field.key"
          :label="field.label"
          :required="field.required"
        >
          <template #label>
            <span v-if="field.required" class="required-star">*</span>
            {{ field.label }}
          </template>
          
          <div class="input-wrapper">
            <el-date-picker
              v-if="field.type === 'date'"
              v-model="form[field.key]"
              type="date"
              placeholder="请选择"
              value-format="YYYY-MM-DD"
              style="width: 100%"
            />
            <el-input
              v-else
              v-model="form[field.key]"
              :placeholder="field.placeholder || '请输入'"
            />
            <!-- 必填项红字校验提示 -->
            <div v-if="field.required && !form[field.key]" class="field-error">请手动填写</div>
            <div v-if="field.hint" class="field-hint">{{ field.hint }}</div>
          </div>
        </el-form-item>

        <!-- 特定的额外字段 (水保、环保等) -->
        <el-form-item
          v-for="field in extraFields"
          :key="field.key"
          :label="field.label"
          :required="field.required"
        >
          <template #label>
            <span v-if="field.required" class="required-star">*</span>
            {{ field.label }}
          </template>

          <div class="input-wrapper">
            <el-input
              v-if="field.type !== 'latlng'"
              v-model="form.extra[field.key]"
              :placeholder="field.placeholder || '请输入'"
            >
              <template v-if="field.suffix" #suffix>
                <span class="input-suffix">{{ field.suffix }}</span>
              </template>
            </el-input>
            <div v-else class="latlng-row">
              <el-input v-model="form.extra[`${field.key}Lng`]" placeholder="经度" />
              <el-input v-model="form.extra[`${field.key}Lat`]" placeholder="纬度" />
            </div>
            
            <!-- 必填项红字校验提示 -->
            <div v-if="field.required && !form.extra[field.key]" class="field-error">请手动填写</div>
            <div v-if="field.hint" class="field-hint">{{ field.hint }}</div>
          </div>
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
import { ref, reactive, computed, watch } from 'vue'
import { Delete, Plus, Document } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import {
  fileParse,
  updateFile,
  addFileType,
} from '@/api/modules/projectFile'
import { useOssUpload } from '@/components/ossClient/index'

const props = defineProps({
  visible: { type: Boolean, default: false },
  tagName: { type: String, default: '' },
  project: { type: Object, default: null },
  fileCode: { type: String, default: '' },
  secondaryBusinessTitle: { type: String, default: '' },
  record: { type: Object, default: null },
})

const emit = defineEmits(['close', 'saved', 'parsed'])

// ========================================================
// 1. 字段配置与类型映射
// ========================================================
const ALL_COMMON_FIELDS = [
  { key: 'fixedFileTitle', label: '文件标题', required: true },
  { key: 'approvalUnit', label: '批准单位', required: true },
  { key: 'dispatchNo', label: '发文号', required: false, hint: '如果有发文号请填写' },
  { key: 'obtainDate', label: '取得日期', required: false, type: 'date' },
]

// 别名映射（把不同的写法归一到标准名称）
const TAG_ALIAS = {
  '环保意见': '环评批复',
  '环评批复': '环评批复',
  '环保批复': '环评批复',
  '水保意见': '水保批复',
  '水保批复': '水保批复',
  '核准批复': '核准批复',
  '核准文件': '核准批复',
}

// 隐藏通用字段的配置 (水保、环保隐藏“文件标题”)
const HIDE_COMMON_FIELDS_MAP = {
  '环评批复': ['fixedFileTitle'],
  '水保批复': ['fixedFileTitle'],
  '核准批复': ['fixedFileTitle'],
}

// 特定字段的额外配置 (水保、环保等)
const EXTRA_FIELDS_MAP = {
  '环评批复': [
    { key: 'environmentalProtectionInvestment', label: '环保投资', required: true, suffix: '万元' },
  ],
  '水保批复': [
    { key: 'waterConservationInvestment', label: '水保投资', required: true, suffix: '万元' },
    { key: 'soilWaterConservationFee', label: '水土保持补偿费', required: true, suffix: '万元' },
  ],
  '贷款意向书': [
    { key: 'loanRate', label: '贷款利率', required: true, suffix: '%' },
  ],
  '用地预审': [
    { key: 'landControl', label: '用地控制', required: false, suffix: '公顷' },
  ],
  '接入批复': [
    { key: 'accessApprovalInvestment', label: '接入投资', required: true, suffix: '万元' },
    { key: 'accessScheme', label: '接入方案', required: true },
    { key: 'accessStationName', label: '接入站名称', required: true },
    { key: 'accessLocation', label: '接入位置', type: 'latlng', required: false },
    { key: 'outletCircuitCount', label: '送出回路数', required: true, suffix: '回' },
    { key: 'accessDistance', label: '接入距离', required: true, suffix: 'km' },
    { key: 'outletConductorSection', label: '送出导线截面', required: true },
    { key: 'accessIntervalDescription', label: '接入间隔说明', required: true },
    { key: 'mainTransformerCapacity', label: '主变容量', required: true, suffix: 'MVA' },
    { key: 'mainTransformerWiringMode', label: '主变接线方式', required: true },
    { key: 'svgCapacity', label: 'SVG容量', required: true, suffix: 'Mvar' },
  ]
}

// 2. 精准 file_type 映射 (对应你的要求)
const FILE_TYPE_MAP = {
  '贷款意向书': 1,
  '贷款意向': 1,
  '用地预审': 2,
  '环评批复': 3,
  '水保批复': 4,
  '接入批复': 5,
  '核准批复': 6,
}
const DEFAULT_FILE_TYPE = 7 // 7 = 通用文件

const standardTag = computed(() => TAG_ALIAS[props.tagName] || props.tagName)

function resolveFileType(tag) {
  const standardName = TAG_ALIAS[tag] || tag
  const fileType = FILE_TYPE_MAP[standardName]
  return fileType !== undefined ? fileType : DEFAULT_FILE_TYPE
}

// 计算属性：控制显示的字段
const visibleCommonFields = computed(() => {
  const hidden = new Set(HIDE_COMMON_FIELDS_MAP[standardTag.value] || [])
  return ALL_COMMON_FIELDS.filter(f => !hidden.has(f.key))
})

const extraFields = computed(() => EXTRA_FIELDS_MAP[standardTag.value] || [])

// ========================================================
// 3. 状态与表单
// ========================================================
const fileInputRef = ref(null)
const selectedFile = ref(null)
const filePath = ref('')
const processing = ref(false)
const processingText = ref('解析中...')
const saving = ref(false)
const parsedRawData = ref({}) // 存储原始解析结果

const form = reactive({
  fileType: '',
  fixedFileTitle: '',
  approvalUnit: '',
  dispatchNo: '',
  obtainDate: '',
  extra: {},
})

// 弹窗打开时重置状态
watch(
  () => props.visible,
  (val) => {
    if (val) reset()
  }
)

function reset() {
  selectedFile.value = null
  filePath.value = ''
  processing.value = false
  processingText.value = '解析中...'
  saving.value = false
  parsedRawData.value = {}
  
  form.fileType = standardTag.value || props.tagName
  form.fixedFileTitle = ''
  form.approvalUnit = ''
  form.dispatchNo = ''
  form.obtainDate = ''
  form.extra = {}
  
  // 初始化额外字段
  for (const f of extraFields.value) {
    if (f.type === 'latlng') {
      form.extra[`${f.key}Lng`] = ''
      form.extra[`${f.key}Lat`] = ''
    } else {
      form.extra[f.key] = ''
    }
  }
}

// ========================================================
// 4. 选文件 → OSS 上传 + 解析
// ========================================================
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

  selectedFile.value = file
  processing.value = true
  processingText.value = '上传中...'

  // 1. OSS 上传
  const ossPromise = uploadToOss(file).then(path => {
    filePath.value = path
  }).catch(err => {
    console.error('[upload] OSS 上传失败:', err)
    ElMessage.error('文件上传失败：' + (err?.message || '未知错误'))
    selectedFile.value = null
  })

  // 2. 解析文件
  processingText.value = '解析中...'
  const parsePromise = parseFile(file).then(data => {
    applyParseResult(data)
  }).catch(err => {
    console.error('[upload] fileParse 失败:', err)
    form.fixedFileTitle = form.fixedFileTitle || file.name
  })

  await Promise.allSettled([ossPromise, parsePromise])
  processing.value = false
}

async function uploadToOss(file) {
  const ossUpload = useOssUpload()
  const result = await ossUpload.uploadFile(file)
  return result?.obsPath || ''
}

async function parseFile(file) {
  const formData = new FormData()
  formData.append('file', file)
  // ★ 使用精准映射的 file_type
  formData.append('file_type', resolveFileType(props.tagName))
  const res = await fileParse(formData)
  if (res && typeof res === 'object' && 'fixedFileTitle' in res) return res
  return res?.data ?? {}
}

function applyParseResult(data) {
  parsedRawData.value = data || {}
  
  form.fixedFileTitle = data.fixedFileTitle || selectedFile.value?.name || ''
  form.approvalUnit = data.approvalUnit || ''
  form.dispatchNo = data.dispatchNo || ''
  form.obtainDate = normalizeDate(data.obtainDate)

  // 回显特定字段
  for (const f of extraFields.value) {
    if (f.type === 'latlng') {
      const v = data[f.key]
      if (typeof v === 'string' && v.includes(',')) {
        const [lng, lat] = v.split(',')
        form.extra[`${f.key}Lng`] = lng.trim()
        form.extra[`${f.key}Lat`] = lat.trim()
      }
    } else if (data[f.key] !== undefined && data[f.key] !== null) {
      form.extra[f.key] = data[f.key]
    }
  }

  // 抛出事件给父组件
  emit('parsed', data)
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
  reset()
}

// ========================================================
// 5. 保存校验
// ========================================================
function validate() {
  const missing = []
  // 校验通用必填
  visibleCommonFields.value.forEach(f => {
    if (f.required && !form[f.key]) {
      missing.push(f.label)
    }
  })
  // 校验额外必填
  extraFields.value.forEach(f => {
    if (f.required && !form.extra[f.key]) {
      missing.push(f.label)
    }
  })

  if (missing.length) {
    ElMessage.warning(`请填写必填项：${missing.join('、')}`)
    return false
  }
  return true
}

function buildRecognitionContent() {
  const content = {
    fileType: form.fileType || standardTag.value,
    approvalUnit: form.approvalUnit,
    dispatchNo: form.dispatchNo,
    obtainDate: form.obtainDate,
  }
  
  if (visibleCommonFields.value.find(f => f.key === 'fixedFileTitle')) {
    content.fixedFileTitle = form.fixedFileTitle
  }
  
  // 组装 extra
  for (const key in form.extra) {
    if (form.extra[key] !== '') {
      content[key] = form.extra[key]
    }
  }
  
  // 合并接口原始解析数据（兜底）
  Object.assign(content, parsedRawData.value)
  
  return content
}

function normalizeBool(v) {
  return v === 1 || v === '1' || v === true || v === 'true'
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
  if (!validate()) return

  const fileName = selectedFile.value.name
  const fileSuffix = fileName.split('.').pop().toLowerCase()

  const newFile = {
    fileName,
    filePath: filePath.value,
    fileSuffix,
    recognitionContent: buildRecognitionContent(),
  }

  saving.value = true
  try {
    let res
    if (props.record?.id) {
      // 有记录，追加或更新
      const existing = (props.record.fileUrlList || []).map(f => ({
        fileName: f.fileName,
        filePath: f.filePath,
        fileSuffix: f.fileSuffix,
        recognitionContent: f.recognitionContent,
      }))
      const payload = {
        id: props.record.id,
        aiProjectId: props.project?.id,
        firstBusinessTitle: props.record.firstBusinessTitle || props.fileCode,
        secondaryBusinessTitle: props.record.secondaryBusinessTitle || props.secondaryBusinessTitle,
        fileTypeTag: props.record.fileTypeTag || props.tagName,
        isRequiredUpload: normalizeBool(props.record.isRequiredUpload),
        notes: props.record.notes,
        fileUrlList: [...existing, newFile],
      }
      res = await updateFile(payload)
    } else {
      // 无记录，走新增
      const payload = {
        aiProjectId: props.project?.id,
        firstBusinessTitle: props.fileCode,
        secondaryBusinessTitle: props.secondaryBusinessTitle,
        fileTypeTag: props.tagName,
        isRequiredUpload: 0,
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
    console.error('[upload] 提交失败:', err)
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
  padding: 16px;
  background: #f7f8fa;
  border-radius: 6px;
  border: 1px solid #ebeef5;
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
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px dashed #dcdfe6;
}
.file-name-wrapper {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
  overflow: hidden;
}
.file-icon {
  color: #1677ff;
  font-size: 16px;
}
.file-name {
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
  padding: 4px;
}
.file-delete:hover { color: #f56c6c; }

.file-form :deep(.el-form-item) {
  margin-bottom: 18px;
  align-items: flex-start;
}
.file-form :deep(.el-form-item__label) {
  color: #606266;
  font-size: 13px;
  font-weight: 500;
  line-height: 32px;
}

.readonly-input {
  height: 32px;
  line-height: 32px;
  padding: 0 12px;
  background-color: #f0f2f5;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  color: #606266;
  font-size: 13px;
}

.required-star {
  color: #f56c6c;
  margin-right: 2px;
}

.input-wrapper {
  flex: 1;
  width: 100%;
}

.field-error {
  color: #f56c6c;
  font-size: 12px;
  line-height: 1.2;
  margin-top: 4px;
}

.field-hint {
  color: #a0a5ad;
  font-size: 12px;
  line-height: 1.4;
  margin-top: 4px;
}

.input-suffix {
  color: #606266;
  font-size: 12px;
}

.latlng-row {
  display: flex;
  gap: 8px;
}
.latlng-row .el-input {
  flex: 1;
}
</style>