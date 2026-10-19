<template>
  <el-dialog
    v-model="visible"
    title="设置任务负责人"
    width="500px"
    :close-on-click-modal="false"
    @closed="handleClosed"
  >
    <el-form label-width="100px" style="margin-top: 10px;">
      <el-form-item label="所属公司">
        <el-select v-model="form.company" placeholder="请选择所属公司" style="width: 100%;">
          <el-option label="XXXX有限公司" value="XXXX有限公司" />
          <el-option label="YYYY有限公司" value="YYYY有限公司" />
        </el-select>
      </el-form-item>
      <el-form-item label="任务负责人">
        <el-select v-model="form.manager" placeholder="请选择任务负责人" style="width: 100%;">
          <el-option label="张三" value="张三" />
          <el-option label="李四" value="李四" />
        </el-select>
      </el-form-item>
    </el-form>
    
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirm">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  project: { type: Object, default: () => ({}) }
})
const emit = defineEmits(['update:modelValue', 'success'])

const visible = ref(false)
const form = reactive({
  company: '',
  manager: ''
})

watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val) {
    // 打开时如果有默认值可以在这里赋一下
    form.company = props.project?.managerCompany || ''
    form.manager = props.project?.managerName || ''
  }
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

function handleConfirm() {
  if (!form.company) return ElMessage.warning('请选择所属公司')
  if (!form.manager) return ElMessage.warning('请选择任务负责人')
  
  // TODO: 后面有接口了在这里调用，例如：
  // await api.assignProject(props.project.id, form)
  
  ElMessage.success('分配成功')
  emit('success', { ...form, id: props.project?.id })
  visible.value = false
}

function handleClosed() {
  form.company = ''
  form.manager = ''
}
</script>