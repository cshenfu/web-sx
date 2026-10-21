<template>
  <el-dialog v-model="visible" title="储备项目审批" width="800px" :close-on-click-modal="false">
    <el-form :model="form" label-width="110px" label-position="right">
      <!-- 上半部分 -->
      <div class="section-bg">
        <el-form-item label="任务牵头部门" required>
          <el-select v-model="form.leadDept" placeholder="请选择" style="width: 100%">
            <el-option label="规划发展部" value="规划发展部" />
          </el-select>
        </el-form-item>
        <el-form-item label="任务来源" required>
          <el-input v-model="form.taskSource" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="任务名称" required>
          <el-input v-model="form.taskName" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="任务内容">
          <el-input v-model="form.taskContent" type="textarea" :rows="3" placeholder="请输入" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="发起时间" required>
              <el-date-picker v-model="form.startTime" type="date" placeholder="请选择" style="width: 100%" value-format="YYYY-MM-DD" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="反馈时间" required>
              <el-date-picker v-model="form.feedbackTime" type="date" placeholder="请选择" style="width: 100%" value-format="YYYY-MM-DD" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="指示文件">
          <div style="display: flex; align-items: center; gap: 10px;">
            <el-upload action="#" :auto-upload="false" :show-file-list="false">
              <el-button type="primary" link>添加附件</el-button>
            </el-upload>
            <span class="upload-tip">严禁上传国家秘密文件，违规必究</span>
          </div>
        </el-form-item>
      </div>

      <!-- 下半部分 -->
      <div class="section-bg" style="margin-top: 15px;">
        <el-form-item label="落实单位" required>
          <el-select v-model="form.implementUnit" placeholder="请选择" style="width: 100%">
             <el-option label="陕西公司" value="陕西公司" />
          </el-select>
        </el-form-item>
        <el-form-item label="落实部门" required>
          <el-select v-model="form.implementDept" placeholder="请选择" style="width: 100%">
             <el-option label="陕西公司规划发展部" value="陕西公司规划发展部" />
          </el-select>
        </el-form-item>
        <el-form-item label="部门主任" required>
          <el-select v-model="form.deptDirector" placeholder="请选择" style="width: 100%">
             <el-option label="陕西公司规划发展部部门主任" value="陕西公司规划发展部部门主任" />
          </el-select>
        </el-form-item>
        <el-form-item label="专责" required>
          <el-select v-model="form.specialist" placeholder="请选择" style="width: 100%">
             <el-option label="待指定" value="待指定" />
          </el-select>
        </el-form-item>
      </div>

      <el-form-item label="延期申请" required style="margin-top: 20px;">
        <el-radio-group v-model="form.extension">
          <el-radio :label="1">是</el-radio>
          <el-radio :label="0">否</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="handleSave">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  project: { type: Object, default: null }
})
const emit = defineEmits(['update:modelValue', 'saved'])

const visible = ref(props.modelValue)
watch(() => props.modelValue, (val) => { visible.value = val })
watch(visible, (val) => { emit('update:modelValue', val) })

const form = reactive({
  leadDept: '', taskSource: '', taskName: '', taskContent: '',
  startTime: '', feedbackTime: '', implementUnit: '', 
  implementDept: '', deptDirector: '', specialist: '', extension: 0
})

// 初始化默认值
watch(visible, (val) => {
  if (val) {
    const p = props.project || {}
    form.leadDept = '规划发展部'
    form.taskSource = `${p.projectName || ''}${p.projectCode || ''}`
    form.taskName = '储备项目审批'
    form.taskContent = p.notes || p.verifyRemark || '默认填充项目核查说明信息'
    
    const now = new Date()
    form.startTime = now.toISOString().split('T')[0]
    form.feedbackTime = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    
    form.implementUnit = '陕西公司'
    form.implementDept = '陕西公司规划发展部'
    form.deptDirector = '陕西公司规划发展部部门主任'
    form.specialist = '待指定'
    form.extension = 0
  }
})

function handleSave() {
  ElMessage.success('储备项目审批已提交')
  emit('saved')
  visible.value = false
}
</script>

<style scoped>
.section-bg { background: #f9fafc; padding: 20px 20px 0; border-radius: 8px; }
.upload-tip { color: #f56c6c; font-size: 12px; }
</style>