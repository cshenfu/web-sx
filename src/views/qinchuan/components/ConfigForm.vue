<template>
    <div class="config-form-panel">
      <!-- 头部：标题 + 编辑/保存/取消 -->
      <div class="form-panel-header">
        <span class="form-panel-title">选址配置</span>
        <div class="form-panel-actions">
          <el-button v-if="!editing" size="small" @click="startEdit">
            <el-icon><Edit /></el-icon>
            编辑配置
          </el-button>
          <template v-else>
            <el-button size="small" type="primary" :loading="saving" @click="handleSave">
              保存
            </el-button>
            <el-button size="small" :disabled="saving" @click="handleCancel">
              取消
            </el-button>
          </template>
        </div>
      </div>
  
      <!-- 表单 -->
      <el-form
        label-position="left"
        label-width="112px"
        size="small"
        :disabled="!editing"
      >
        <el-form-item label="年度优先开发">
          <el-input-number
            v-model="form.year"
            :min="2024"
            :max="2035"
            controls-position="right"
          />
          <span class="unit">年</span>
          <el-input-number
            v-model="form.capacity"
            :min="0"
            controls-position="right"
          />
          <span class="unit">MW</span>
        </el-form-item>
  
        <el-form-item label="选址策略">
          <el-select v-model="form.strategyType" style="width: 260px">
            <el-option label="风电项目优先选址" value="风电项目优先选址" />
            <el-option label="光伏项目优先选址" value="光伏项目优先选址" />
          </el-select>
        </el-form-item>
  
        <el-form-item label="选址避让">
          <el-checkbox v-model="form.excludePlannedWind">
            已规划风电项目不能规划光伏
          </el-checkbox>
          <el-checkbox v-model="form.excludeAssigned">已分配项目</el-checkbox>
          <el-checkbox v-model="form.excludeVerified">已核查项目</el-checkbox>
        </el-form-item>
  
        <el-form-item label="风电项目">
          <span class="form-label">风速要求</span>
          <el-input-number
            v-model="form.windSpeedRequirement"
            :min="0"
            :precision="1"
          />
          <span class="unit">m/s及以上</span>
        </el-form-item>
  
        <el-form-item label="">
          <span class="form-label">资本金内部收益率要求</span>
          <el-input-number
            v-model="form.windInternalRate"
            :min="0"
            :precision="1"
          />
          <span class="unit">%及以上</span>
        </el-form-item>
  
        <el-form-item label="光伏项目">
          <span class="form-label">资本金内部收益率要求</span>
          <el-input-number
            v-model="form.solarInternalRate"
            :min="0"
            :precision="1"
          />
          <span class="unit">%及以上</span>
        </el-form-item>
  
        <el-form-item label="优先计算">
          <el-input
            v-model="form.priorityAreaCode"
            placeholder="请输入优先计算的区域，如：榆林市,汉中市"
            style="width: 260px"
          />
        </el-form-item>
      </el-form>
  
      <p class="form-tip">说明：在计算范围较大区域时，会优先计算设置的区域。</p>
    </div>
  </template>
  
  <script setup>
  import { reactive, ref, onMounted } from 'vue'
  import { ElMessage } from 'element-plus'
  import { Edit } from '@element-plus/icons-vue'
  import * as configApi from '@/api/modules/selectConfig'
  
  const emit = defineEmits(['change'])
  
  const editing = ref(false)
  const saving = ref(false)
  
  // 表单数据
  const form = reactive({
    id: null,
    year: 2026,
    capacity: 2000,
    strategyType: '风电项目优先选址',
    excludePlannedWind: true,
    excludeAssigned: true,
    excludeVerified: true,
    windSpeedRequirement: 4.5,
    windInternalRate: 6.5,
    solarInternalRate: 6.5,
    priorityAreaCode: '',
  })
  
  // 编辑前的备份，用于取消
  let backup = null
  
  // 后端 byte 字段 → 布尔
  function bytesToBool(v) {
    if (v === true || v === 1 || v === '1') return true
    if (v === false || v === 0 || v === '0') return false
    return !!v
  }
  
  // 布尔 → 后端 byte 字段（字符串 "0"/"1"）
  function boolToByte(v) {
    return v ? '1' : '0'
  }
  
  async function loadConfig() {
    try {
      const res = await configApi.getLastConfig()
      const data = res?.data
      if (!data) return
  
      form.id = data.id ?? null
      form.year = data.year ?? form.year
      form.capacity = data.capacity ?? form.capacity
      form.strategyType = data.strategyType ?? form.strategyType
      form.excludePlannedWind = bytesToBool(data.excludePlannedWind)
      form.excludeAssigned = bytesToBool(data.excludeAssigned)
      form.excludeVerified = bytesToBool(data.excludeVerified)
      form.windSpeedRequirement =
        data.windSpeedRequirement ?? form.windSpeedRequirement
      form.windInternalRate = data.windInternalRate ?? form.windInternalRate
      form.solarInternalRate = data.solarInternalRate ?? form.solarInternalRate
      form.priorityAreaCode = data.priorityAreaCode ?? form.priorityAreaCode
  
      console.log('[config] 加载完成:', { ...form })
      emit('change', { ...form })
    } catch (err) {
      console.error('[config] getLastConfig 失败:', err)
      ElMessage.error(err?.message || '配置加载失败')
    }
  }
  
  function startEdit() {
    backup = { ...form }
    editing.value = true
  }
  
  function handleCancel() {
    if (backup) {
      Object.assign(form, backup)
    }
    editing.value = false
    backup = null
  }
  
  async function handleSave() {
    try {
      saving.value = true
  
      const payload = {
        id: form.id,
        year: form.year,
        capacity: form.capacity,
        strategyType: form.strategyType,
        excludePlannedWind: boolToByte(form.excludePlannedWind),
        excludeAssigned: boolToByte(form.excludeAssigned),
        excludeVerified: boolToByte(form.excludeVerified),
        windSpeedRequirement: form.windSpeedRequirement,
        windInternalRate: form.windInternalRate,
        solarInternalRate: form.solarInternalRate,
        priorityAreaCode: form.priorityAreaCode,
      }
  
      console.log('[config] 提交保存:', payload)
      const res = await configApi.updateConfig(payload)
  
      if (res?.code === 200) {
        ElMessage.success('配置已保存')
        editing.value = false
        backup = null
        emit('change', { ...form })
      } else {
        ElMessage.error(res?.msg || '保存失败')
      }
    } catch (err) {
      console.error('[config] 保存失败:', err)
      ElMessage.error(err?.message || '保存失败')
    } finally {
      saving.value = false
    }
  }
  
  defineExpose({ loadConfig })
  
  onMounted(() => {
    loadConfig()
  })
  </script>
  
  <style scoped>
  .config-form-panel {
    position: relative;
    padding: 8px 28px 20px 4px;
    border-right: 1px solid #ebeef5;
  }
  
  .form-panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
    padding-bottom: 10px;
    border-bottom: 1px solid #ebeef5;
  }
  
  .form-panel-title {
    color: #303133;
    font-size: 14px;
    font-weight: 600;
  }
  
  .form-panel-actions {
    display: flex;
    gap: 6px;
  }
  
  .unit {
    margin: 0 8px;
    color: #606266;
    font-size: 12px;
  }
  
  .form-label {
    display: inline-block;
    width: 148px;
    color: #606266;
    font-size: 12px;
  }
  
  .form-tip {
    margin: 18px 0 0;
    color: #a0a5ad;
    font-size: 11px;
    line-height: 1.6;
  }
  
  :deep(.el-form-item) {
    margin-bottom: 18px;
  }
  
  :deep(.el-checkbox) {
    display: block;
    height: 27px;
  }
  
  :deep(.el-input-number) {
    width: 108px;
  }
  </style>