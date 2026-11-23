<template>
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
      <button v-if="clearable" type="button" class="remove-action" @click="$emit('remove')">移除</button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { FolderChecked, Loading, Plus } from '@element-plus/icons-vue'

const props = defineProps({
  accept: { type: String, default: '.xlsx,.xls' },
  directory: { type: Boolean, default: false },
  multiple: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  file: { type: Object, default: null },
  files: { type: Array, default: () => [] },
  status: { type: String, default: '' },
  clearable: { type: Boolean, default: true },
})
const emit = defineEmits(['select', 'remove'])
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
.post-upload { display: flex; align-items: center; gap: 12px; min-width: 0; }
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
.remove-action { padding: 0; border: 0; background: none; color: #f56c6c; cursor: pointer; font-size: 12px; }
</style>
