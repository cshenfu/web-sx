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
  
          <el-form-item
            v-for="field in commonFields"
            :key="field.key"
            :label="field.label"
            :required="field.required"
          >
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
            <div v-if="field.hint" class="field-hint">{{ field.hint }}</div>
          </el-form-item>
  
          <el-form-item
            v-for="field in extraFields"
            :key="field.key"
            :label="field.label"
            :required="field.required"
          >
            <div v-if="field.type === 'latlng'" class="latlng-row">
              <el-input v-model="form.extra[`${field.key}Lng`]" placeholder="经度" />
              <el-input v-model="form.extra[`${field.key}Lat`]" placeholder="纬度" />
            </div>
            <el-input
              v-else
              v-model="form.extra[field.key]"
              :placeholder="field.placeholder || '请输入'"
            >
              <template v-if="field.suffix" #suffix>
                <span class="input-suffix">{{ field.suffix }}</span>
              </template>
            </el-input>
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
  import { Delete, Plus } from '@element-plus/icons-vue'
  import { ElMessage } from 'element-plus'
  import {
    fileParse,
    updateFile,
    updateFileBatch,
  } from '@/api/modules/projectFile'
  import { useOssUpload } from '@/components/ossClient/index'
  
  const props = defineProps({
    visible: { type: Boolean, default: false },
    tagName: { type: String, default: '' },
    project: { type: Object, default: null },
    fileCode: { type: String, default: '' },
    secondaryBusinessTitle: { type: String, default: '' },
    // 要更新的记录（含 id）
    record: { type: Object, default: null },
  })
  
  const emit = defineEmits(['close', 'saved'])
  
  // ========================================================
  // 字段配置
  // ========================================================
  const ALL_COMMON_FIELDS = [
    { key: 'fixedFileTitle', label: '文件标题', required: true },
    { key: 'approvalUnit', label: '批准单位', required: true },
    { key: 'dispatchNo', label: '发文号', required: false, hint: '如果有发文号请填写' },
    { key: 'obtainDate', label: '取得日期', required: false, type: 'date' },
  ]
  
  const TAG_ALIAS = {
    '环保意见': '环保批复',
    '环评批复': '环保批复',
    '水保意见': '水保批复',
    '核准批复': '核准文件',
  }
  
  const HIDE_COMMON_FIELDS_MAP = {
    '环保批复': ['fixedFileTitle'],
    '水保批复': ['fixedFileTitle'],
    '核准文件': ['fixedFileTitle'],
  }
  
  const EXTRA_FIELDS_MAP = {
    '贷款意向书': [
      { key: 'loanRate', label: '贷款利率', required: true, suffix: '%' },
    ],
    '用地预审': [
      { key: 'landControl', label: '用地控制', required: false, suffix: '公顷' },
    ],
    '环保批复': [
      { key: 'environmentalProtectionInvestment', label: '环保投资', required: true, suffix: '万元' },
    ],
    '水保批复': [
      { key: 'waterConservationInvestment', label: '水保投资', required: true, suffix: '万元' },
      { key: 'soilWaterConservationFee', label: '水土保持补偿费', required: true, suffix: '万元' },
    ],
    '核准文件': [
      { key: 'approvalCapacity', label: '核准容量', required: true, suffix: '万千克' },
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
    ],
    '国土意见': [],
    '林业意见': [],
    '文物意见': [],
    '竞配指标': [],
  }
  
  // file_type 编码：1 贷款意向 / 2 用地预审 / 3 环评批复 / 4 水保批复 / 5 接入批复
  // 接口未完善，暂时统一传 2
  const FILE_TYPE_MAP = {
    '贷款意向书': 1,
    '用地预审': 2,
    '环保批复': 3,
    '水保批复': 4,
    '接入批复': 5,
  }
  const FORCE_FILE_TYPE = 2
  
  function resolveFileType(tag) {
    if (FORCE_FILE_TYPE !== null) return FORCE_FILE_TYPE
    return FILE_TYPE_MAP[TAG_ALIAS[tag] || tag] ?? 2
  }
  
  const standardTag = computed(() => TAG_ALIAS[props.tagName] || props.tagName)
  
  const commonFields = computed(() => {
    const hidden = new Set(HIDE_COMMON_FIELDS_MAP[standardTag.value] || [])
    return ALL_COMMON_FIELDS.filter(f => !hidden.has(f.key))
  })
  
  const extraFields = computed(() => EXTRA_FIELDS_MAP[standardTag.value] || [])
  
  // ========================================================
  // 状态
  // ========================================================
  const fileInputRef = ref(null)
  const selectedFile = ref(null)
  const filePath = ref('')
  const processing = ref(false)
  const processingText = ref('解析中...')
  const parseError = ref(false)
  const saving = ref(false)
  
  const form = reactive({
    fileType: '',
    fixedFileTitle: '',
    approvalUnit: '',
    dispatchNo: '',
    obtainDate: '',
    extra: {},
  })
  
  watch(
    () => props.visible,
    (val) => {
      console.log('[upload] dialog visible:', val, 'tag:', props.tagName, 'record:', props.record)
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
    form.fixedFileTitle = ''
    form.approvalUnit = ''
    form.dispatchNo = ''
    form.obtainDate = ''
    form.extra = {}
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
  // 选文件 → OSS 上传 + 解析
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
  
    console.log('[upload] 选中原生 File:', file.name, file.size, 'isFile:', file instanceof File)
  
    selectedFile.value = file
    processing.value = true
    parseError.value = false
    processingText.value = '上传中...'
  
    const ossPromise = uploadToOss(file).then(path => {
      filePath.value = path
    }).catch(err => {
      console.error('[upload] OSS 上传失败:', err)
      ElMessage.error('文件上传失败：' + (err?.message || '未知错误'))
      selectedFile.value = null
    })
  
    processingText.value = '解析中...'
    const parsePromise = parseFile(file).then(data => {
      applyParseResult(data)
    }).catch(err => {
      console.error('[upload] fileParse 失败:', err)
      parseError.value = true
      form.fixedFileTitle = file.name
    })
  
    await Promise.allSettled([ossPromise, parsePromise])
    processing.value = false
  }
  
  async function uploadToOss(file) {
    const ossUpload = useOssUpload()
    const result = await ossUpload.uploadFile(file)
    console.log('[oss] 上传返回:', result)
    return result?.obsPath || ''
  }
  
  async function parseFile(file) {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('file_type', resolveFileType(props.tagName))
    const res = await fileParse(formData)
    console.log('[upload] fileParse 返回:', res)
    if (res && typeof res === 'object' && 'fixedFileTitle' in res) return res
    return res?.data ?? {}
  }
  
  function applyParseResult(data) {
    form.fixedFileTitle = data.fixedFileTitle || selectedFile.value?.name || ''
    form.approvalUnit = data.approvalUnit || ''
    form.dispatchNo = data.dispatchNo || ''
    form.obtainDate = normalizeDate(data.obtainDate)
  
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
  
    const missing = [
      ...commonFields.value.filter(f => f.required && !form[f.key]),
      ...extraFields.value.filter(f => f.required && !form.extra[f.key]),
    ]
    if (missing.length) parseError.value = true
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
  
  // ========================================================
  // 保存 → PUT /ai/api/aiProjectFile/update 或 /update-batch
  // ========================================================
  function validate() {
    const missing = [
      ...commonFields.value.filter(f => f.required && !form[f.key]).map(f => f.label),
      ...extraFields.value.filter(f => f.required && !form.extra[f.key]).map(f => f.label),
    ]
    if (missing.length) {
      ElMessage.warning(`请填写：${missing.join('、')}`)
      return false
    }
    return true
  }
  
  function buildRecognitionContent() {
    const content = {
      fileType: form.fileType,
      approvalUnit: form.approvalUnit,
      dispatchNo: form.dispatchNo,
      obtainDate: form.obtainDate,
    }
    if (commonFields.value.find(f => f.key === 'fixedFileTitle')) {
      content.fixedFileTitle = form.fixedFileTitle
    }
    for (const f of extraFields.value) {
      if (f.type === 'latlng') {
        const lng = form.extra[`${f.key}Lng`]
        const lat = form.extra[`${f.key}Lat`]
        content[f.key] = lng && lat ? `${lng},${lat}` : ''
      } else {
        content[f.key] = form.extra[f.key] || ''
      }
    }
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
    if (!props.record?.id) {
      ElMessage.error('未找到对应的文件记录（id 缺失），请刷新重试')
      return
    }
    if (!validate()) return
  
    const fileName = selectedFile.value.name
    const fileSuffix = fileName.split('.').pop().toLowerCase()
  
    // 组装 payload（单个；将来若支持多文件，此处返回数组循环生成即可）
    const singlePayload = {
      id: props.record.id,
      aiProjectId: props.project?.id,
      firstBusinessTitle:
        props.record?.firstBusinessTitle || props.fileCode,
      secondaryBusinessTitle:
        props.record?.secondaryBusinessTitle || props.secondaryBusinessTitle || '',
      fileTypeTag:
        props.record?.fileTypeTag || props.tagName,
      isRequiredUpload:
        normalizeBool(props.record?.isRequiredUpload),
      notes: props.record?.notes || undefined,
      fileUrlList: [{
        fileName,
        filePath: filePath.value,
        fileSuffix,
        recognitionContent: buildRecognitionContent(),
      }],
    }
  
    const payloads = [singlePayload]
  
    console.log('[upload] 提交 payloads:', payloads)
  
    saving.value = true
    try {
      let res
      if (payloads.length === 1) {
        // 单条 → PUT /update
        res = await updateFile(payloads[0])
      } else {
        // 多条 → PUT /update-batch
        res = await updateFileBatch(payloads)
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