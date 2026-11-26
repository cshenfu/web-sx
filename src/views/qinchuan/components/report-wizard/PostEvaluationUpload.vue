<template>
  <div class="upload-row" :class="{ 'no-label': !label }">
    <label v-if="label" class="upload-label">{{ label }}<span v-if="required" class="required-mark"> *</span></label>
    <div class="upload-content">
      <div class="post-upload">
    <input
      ref="inputRef"
      class="native-input"
      type="file"
      :accept="accept"
      :multiple="directory || multiple"
      :webkitdirectory="directory ? '' : undefined"
      :directory="directory ? '' : undefined"
      @change="handleChange"
    />
    <button
      type="button"
      class="upload-trigger"
      :class="{ 'has-file': hasFile, 'is-loading': loading }"
      :disabled="loading"
      :title="directory ? '选择文件夹' : '上传文件'"
      @click="openPicker"
    >
      <el-icon v-if="loading" class="loading-icon"><Loading /></el-icon>
      <el-icon v-else-if="hasFile"><FolderChecked /></el-icon>
      <el-icon v-else><Plus /></el-icon>
    </button>
    <div v-if="displayName" class="upload-meta">
      <span class="file-name" :title="displayName">{{ displayName }}</span>
      <span v-if="status" class="file-status">{{ status }}</span>
      <span v-if="validationMessage" class="validation-message" :class="'is-' + (validationStatus || 'success')">{{ validationMessage }}</span>
      <button v-if="clearable" type="button" class="remove-action" title="删除文件" aria-label="删除文件" @click="$emit('remove')"><el-icon><Delete /></el-icon></button>
    </div>
      </div>
      <div v-if="$slots.hint" class="upload-hint"><slot name="hint" /></div>
      <div v-else-if="showHint" class="upload-hint">
        {{ hintText }}，查看下载
        <a class="template-link" href="#" @click.prevent="$emit('template-download')">{{ templateName }}</a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { Delete, FolderChecked, Loading, Plus } from '@element-plus/icons-vue'

const props = defineProps({
  label: { type: String, default: '' },
  required: { type: Boolean, default: true },
  accept: { type: String, default: '.xlsx,.xls' },
  directory: { type: Boolean, default: false },
  multiple: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  file: { type: Object, default: null },
  files: { type: Array, default: () => [] },
  status: { type: String, default: '' },
  clearable: { type: Boolean, default: true },
  showHint: { type: Boolean, default: true },
  hintText: { type: String, default: '支持 xlsx 格式数据' },
  templateName: { type: String, default: '数据模板.xlsx' },
  validationStatus: { type: String, default: '' },
  validationMessage: { type: String, default: '' },
})
const emit = defineEmits(['select', 'remove', 'template-download'])
const inputRef = ref(null)
const hasFile = computed(() => props.directory ? props.files.length > 0 : Boolean(props.file))
const displayName = computed(() => {
  if (props.directory) return props.files.length ? `已选择文件夹（${props.files.length} 个文件）` : ''
  return props.file?.name || ''
})

function openPicker() {
  if (!props.loading) inputRef.value?.click()
}
function handleChange(event) {
  const selected = Array.from(event.target.files || [])
  if (props.directory || props.multiple) emit('select', selected)
  else if (selected[0]) emit('select', selected[0])
  event.target.value = ''
}
</script>

<style scoped>
.upload-row { display: grid; grid-template-columns: minmax(150px, 190px) minmax(0, 1fr); gap: 18px; align-items: center; margin: 18px 0; }
.upload-row.no-label { grid-template-columns: minmax(0, 1fr); margin: 0; }
.upload-label { color: #303133; font-size: 13px; line-height: 1.45; text-align: right; }
.required-mark { color: #f56c6c; }
.upload-content { min-width: 0; }
.post-upload { display: flex; align-items: center; gap: 12px; min-width: 0; }
.upload-hint { margin-top: 5px; color: #a0a3a8; font-size: 12px; line-height: 1.6; }
.upload-hint :deep(.template-link) { color: #1677ff; cursor: pointer; transition: color .18s ease; }
.upload-hint :deep(.template-link:hover) { color: #409eff; text-decoration: underline; }
.native-input { display: none; }
.upload-trigger {
  display: inline-flex;
  flex: 0 0 54px;
  width: 54px;
  height: 54px;
  align-items: center;
  justify-content: center;
  border: 1px dashed #b8c5d6;
  border-radius: 6px;
  background: #f8fbff;
  color: #7b8da5;
  cursor: pointer;
  transition: all .2s ease;
}
.upload-trigger :deep(.el-icon) { font-size: 22px; }
.upload-trigger:hover { border-color: #409eff; background: #f0f7ff; color: #409eff; }
.upload-trigger.has-file { border-color: #67c23a; background: #f5fbf3; color: #67c23a; }
.upload-trigger.is-loading { cursor: wait; opacity: .7; }
.upload-meta { display: flex; flex-wrap: wrap; align-items: center; gap: 6px 10px; min-width: 0; font-size: 12px; }
.file-name { max-width: 280px; overflow: hidden; color: #526174; text-overflow: ellipsis; white-space: nowrap; }
.file-status { color: #67c23a; }
.validation-message { flex-basis: 100%; line-height: 1.5; }
.validation-message.is-success { color: #67c23a; }
.validation-message.is-warning { color: #e6a23c; }
.validation-message.is-error { color: #f56c6c; }
.remove-action { display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; padding: 0; border: 0; border-radius: 4px; background: transparent; color: #f56c6c; cursor: pointer; font-size: 16px; transition: background .18s ease, color .18s ease; }
.remove-action:hover { color: #dc2626; background: #fef2f2; }
</style>
