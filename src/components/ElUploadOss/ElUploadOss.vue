<template>
  <div class="el-upload-oss-wrapper">
    <el-upload
      v-model:file-list="fileList"
      list-type="picture-card"
      :accept="fileType"
      :limit="maxFileLength"
      :http-request="customUpload"
      :on-remove="handleRemove"
      :on-preview="handlePreview"
      :before-upload="beforeUpload"
    >
      <el-icon><Plus /></el-icon>
    </el-upload>

    <!-- 图片预览器 -->
    <el-image-viewer
      v-if="previewVisible"
      :url-list="previewList"
      :initial-index="previewIndex"
      @close="previewVisible = false"
    />
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
// 注意：这里引入你们项目的 OSS 上传 Hook，路径需根据实际修改
import { useOssUpload } from '@/components/ossClient/index'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  fileType: {
    type: String,
    default: '.png,.jpg,.jpeg,.pdf' // 默认支持图片和PDF
  },
  maxFileLength: {
    type: Number,
    default: 20
  },
  projectId: {
    type: [String, Number],
    default: null
  }
})

const emit = defineEmits(['update:modelValue'])

const obsUpload = useOssUpload()
const fileList = ref([])
const previewVisible = ref(false)
const previewList = ref([])
const previewIndex = ref(0)
const isUpdating = ref(false)

// 监听外部传入的数据进行回显 (对应你原本的 updateFileData 逻辑)
watch(() => props.modelValue, (val) => {
  if (isUpdating.value) return
  if (!val || val.length === 0) {
    fileList.value = []
    return
  }
  
  fileList.value = val.map(item => {
    const suffix = item.fileSuffix || item.suffix || ''
    // 针对 PDF 自定义渲染缩略图，图片直接用 url
    const isPdf = suffix.toLowerCase() === '.pdf'
    return {
      name: item.fileName,
      url: item.filePath || item.url,
      status: 'success',
      uid: item.id || Date.now() + Math.random(),
      // 挂载原始数据，方便删除和提取
      raw: item,
      isPdf
    }
  })
}, { immediate: true, deep: true })

// 上传前校验
const beforeUpload = (file) => {
  if (fileList.value.length >= props.maxFileLength) {
    ElMessage.warning(`最多只能上传 ${props.maxFileLength} 个文件`)
    return false
  }
  // 校验文件类型
  const extension = '.' + file.name.split('.').pop().toLowerCase()
  if (props.fileType && !props.fileType.includes(extension)) {
    ElMessage.warning(`不支持的文件格式，请上传 ${props.fileType}`)
    return false
  }
  return true
}

// 自定义上传逻辑 (对应你原本的 beforeUpload)
const customUpload = async (options) => {
  const { file } = options
  try {
    const uploadResult = await obsUpload.uploadFile(file, '', { projectId: props.projectId })
    // 假设 uploadResult.obsPath 是完整路径
    const filePath = uploadResult.obsPath
    
    const newFileInfo = {
      fileName: file.name,
      filePath: filePath,
      fileSuffix: '.' + file.name.split('.').pop().toLowerCase(),
      // 后端需要的额外字段可以在这里补充
    }
    
    // 更新当前上传文件的状态和 url
    const currentFile = fileList.value.find(f => f.uid === file.uid)
    if (currentFile) {
      currentFile.url = filePath
      currentFile.raw = newFileInfo
      currentFile.isPdf = newFileInfo.fileSuffix === '.pdf'
    }
    
    triggerChange()
  } catch (error) {
    ElMessage.error('上传失败，请重试')
    // 移除失败的文件
    fileList.value = fileList.value.filter(f => f.uid !== file.uid)
  }
}

// 删除文件 (对应你原本的 delFileItem)
const handleRemove = (uploadFile) => {
  fileList.value = fileList.value.filter(f => f.uid !== uploadFile.uid)
  triggerChange()
}

// 触发 v-model 更新
const triggerChange = () => {
  isUpdating.value = true
  // 过滤掉处于上传中状态的文件，只传成功的
  const result = fileList.value
    .filter(f => f.status === 'success' && f.raw)
    .map(f => f.raw)
  
  emit('update:modelValue', result)
  
  nextTick(() => {
    isUpdating.value = false
  })
}

// 预览
const handlePreview = (uploadFile) => {
  if (uploadFile.isPdf) {
    window.open(uploadFile.url, '_blank')
    return
  }
  previewList.value = fileList.value
    .filter(f => !f.isPdf && f.status === 'success')
    .map(f => f.url)
  const index = previewList.value.findIndex(url => url === uploadFile.url)
  previewIndex.value = index !== -1 ? index : 0
  previewVisible.value = true
}
</script>

<style scoped lang="scss">
.el-upload-oss-wrapper {
  :deep(.el-upload--picture-card) {
    width: 80px;
    height: 80px;
    line-height: 80px;
  }
  :deep(.el-upload-list--picture-card .el-upload-list__item) {
    width: 80px;
    height: 80px;
    margin: 0 8px 8px 0;
    
    /* 让内部图片占满 */
    img {
      object-fit: cover;
    }
  }
}
</style>