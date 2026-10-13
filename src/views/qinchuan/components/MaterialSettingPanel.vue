<template>
  <div class="setting-panel">
    <div class="setting-header">
      <div class="setting-title-wrap">
        <button class="back-btn" title="返回" @click="emit('cancel')">
          <el-icon><ArrowLeft /></el-icon>
        </button>
        <span class="setting-title">材料所需设置</span>
      </div>
      <div class="setting-actions">
        <el-button size="small" @click="emit('cancel')">取消</el-button>
        <el-button size="small" type="primary" @click="handleSave">保存</el-button>
      </div>
    </div>

    <div v-loading="loading" class="setting-body">
      <!-- 必要材料 -->
      <div class="setting-section">
        <div class="section-header">
          <span class="section-title">▍必要材料</span>
          <el-button link type="primary" size="small" @click="openAdd('required')">
            +添加
          </el-button>
        </div>
        <div class="tag-list">
          <span
            v-for="(item, i) in requiredList"
            :key="item.id ?? item.name + i"
            class="material-tag"
          >
            {{ item.name }}
            <span class="tag-close" @click="removeItem(i, 'required')">×</span>
          </span>
          <el-select
            v-if="addingType === 'required'"
            ref="requiredSelectRef"
            v-model="selectedValue"
            filterable
            placeholder="请选择"
            size="small"
            style="width: 180px"
            @change="confirmAdd"
            @blur="resetAdd"
          >
            <el-option
              v-for="opt in optionsWithDisabled"
              :key="opt.id"
              :label="opt.name"
              :value="opt.name"
              :disabled="opt.disabled"
            />
          </el-select>
        </div>
      </div>

      <!-- 其他材料 -->
      <div class="setting-section">
        <div class="section-header">
          <span class="section-title">▍其他材料</span>
          <el-button link type="primary" size="small" @click="openAdd('other')">
            +添加
          </el-button>
        </div>
        <div class="tag-list">
          <span
            v-for="(item, i) in otherList"
            :key="item.id ?? item.name + i"
            class="material-tag"
          >
            {{ item.name }}
            <span class="tag-close" @click="removeItem(i, 'other')">×</span>
          </span>
          <el-select
            v-if="addingType === 'other'"
            ref="otherSelectRef"
            v-model="selectedValue"
            filterable
            placeholder="请选择"
            size="small"
            style="width: 180px"
            @change="confirmAdd"
            @blur="resetAdd"
          >
            <el-option
              v-for="opt in optionsWithDisabled"
              :key="opt.id"
              :label="opt.name"
              :value="opt.name"
              :disabled="opt.disabled"
            />
          </el-select>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { ArrowLeft } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as fileApi from '@/api/modules/projectFile'
import { useStageConfig } from '../js/useStageConfig'

const props = defineProps({
  project: { type: Object, default: null },
  stageCode: { type: String, default: '' },
  fileCode: { type: String, default: '' },
})

const emit = defineEmits(['cancel', 'save'])

const { getStageIdByCode, getFileItemsByStageId } = useStageConfig()

const loading = ref(false)
const requiredList = ref([])   // [{ id, name }]
const otherList = ref([])      // [{ id, name }]
const allOptions = ref([])     // 下拉候选

const addingType = ref('')
const selectedValue = ref('')
const requiredSelectRef = ref(null)
const otherSelectRef = ref(null)

function isRequired(r) {
  const v = r?.isRequiredUpload
  return v === 1 || v === '1' || v === true || v === 'true'
}

// 已使用项在下拉里显示但禁用
const optionsWithDisabled = computed(() => {
  const used = new Set([
    ...requiredList.value.map(i => i.name),
    ...otherList.value.map(i => i.name),
  ])
  return allOptions.value.map(o => ({
    ...o,
    disabled: used.has(o.name),
  }))
})

async function loadData() {
  if (!props.project?.id || !props.fileCode) return
  loading.value = true
  try {
    // 1. 已配置记录
    const res = await fileApi.getFileListByProjectid({
      aiProjectId: props.project.id,
      firstBusinessTitle: props.fileCode,
    })
    const records = res?.data || []
    requiredList.value = records
      .filter(isRequired)
      .map(r => ({ id: r.id, name: r.fileTypeTag }))
    otherList.value = records
      .filter(r => !isRequired(r))
      .map(r => ({ id: r.id, name: r.fileTypeTag }))

    // 2. 下拉候选
    if (props.stageCode) {
      const stageId = await getStageIdByCode(props.stageCode)
      allOptions.value = stageId ? await getFileItemsByStageId(stageId) : []
      console.log('[setting] stageCode=', props.stageCode, 'stageId=', stageId)
    }
    console.log('[setting] 已配置必要:', requiredList.value)
    console.log('[setting] 已配置其他:', otherList.value)
    console.log('[setting] 下拉候选:', allOptions.value)
  } catch (err) {
    console.error('[setting] 加载失败:', err)
  } finally {
    loading.value = false
  }
}

watch(
  () => [props.project?.id, props.fileCode, props.stageCode],
  loadData,
  { immediate: true }
)

function openAdd(type) {
  addingType.value = type
  selectedValue.value = ''
  nextTick(() => {
    const ref = type === 'required' ? requiredSelectRef.value : otherSelectRef.value
    ref?.focus?.()
  })
}

function resetAdd() {
  setTimeout(() => {
    if (!selectedValue.value) addingType.value = ''
  }, 150)
}

// ★ 新增：调 /ai/api/aiProjectFile/upload
async function confirmAdd(val) {
  if (!val) return
  const opt = allOptions.value.find(o => o.name === val)
  if (!opt) return

  if (!props.project?.id || !props.fileCode) {
    ElMessage.warning('缺少项目信息，无法添加')
    return
  }

  const isRequired = addingType.value === 'required'

  // 只传必填字段，不传 fileUrlList / recognitionContent
  const payload = {
    aiProjectId: props.project.id,
    firstBusinessTitle: props.fileCode,
    secondaryBusinessTitle: '',
    fileTypeTag: opt.name,
    isRequiredUpload: isRequired,
  }

  try {
    const res = await fileApi.addFileType(payload)
    if (res?.code === 200) {
      ElMessage.success('已添加')
      const newId = res.data ?? null
      const newItem = { id: newId, name: opt.name }
      if (isRequired) requiredList.value.push(newItem)
      else otherList.value.push(newItem)
    } else {
      ElMessage.error(res?.msg || '添加失败')
    }
  } catch (err) {
    console.error('[setting] 新增失败:', err)
    ElMessage.error(err?.message || '添加失败')
  } finally {
    selectedValue.value = ''
    addingType.value = ''
  }
}

// ★ 删除：调 /ai/api/aiProjectFile/delete?id=xx
async function removeItem(index, type) {
  const list = type === 'required' ? requiredList.value : otherList.value
  const item = list[index]
  if (!item) return

  // 无 id（本地临时项）直接移除
  if (!item.id) {
    list.splice(index, 1)
    return
  }

  try {
    await ElMessageBox.confirm(`确认删除「${item.name}」吗？`, '提示', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消',
    })
  } catch {
    return
  }

  try {
    const res = await fileApi.delFileType(item.id)
    if (res?.code === 200) {
      ElMessage.success('已删除')
      list.splice(index, 1)
    } else {
      ElMessage.error(res?.msg || '删除失败')
    }
  } catch (err) {
    console.error('[setting] 删除失败:', err)
    ElMessage.error(err?.message || '删除失败')
  }
}

function handleSave() {
  emit('save', {
    required: requiredList.value.map(i => i.name),
    other: otherList.value.map(i => i.name),
  })
}
</script>

<style scoped>
.setting-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.setting-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 20px 12px;
  border-bottom: 1px solid #ebeef5;
}
.setting-title-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}
.back-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  color: #606266;
  background: transparent;
  border: 0;
  border-radius: 4px;
  cursor: pointer;
}
.back-btn:hover { color: #1677ff; background: #f0f7ff; }
.setting-title { color: #303133; font-size: 15px; font-weight: 600; }
.setting-actions { display: flex; gap: 8px; }

.setting-body {
  flex: 1;
  padding: 16px 20px;
  overflow-y: auto;
}
.setting-section { margin-bottom: 24px; }
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.section-title { color: #303133; font-size: 13px; font-weight: 600; }

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.material-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: #f7f8fa;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  color: #303133;
  font-size: 12px;
}
.tag-close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  color: #909399;
  cursor: pointer;
  font-size: 14px;
  line-height: 1;
}
.tag-close:hover { color: #f56c6c; }
</style>