<template>
    <div class="main-info-tab">
      <el-form label-position="left" label-width="100px" size="small">
        <el-form-item label="项目编号">
          <span class="field-value">{{ project?.projectCode || '-' }}</span>
        </el-form-item>
        <el-form-item label="项目名称">
          <span class="field-value">{{ project?.projectName || '-' }}</span>
        </el-form-item>
        <el-form-item label="项目类型">
          <span class="field-value">{{ itemTypeLabel }}</span>
        </el-form-item>
        <el-form-item label="项目区域">
          <span class="field-value">{{ regionLabel }}</span>
        </el-form-item>
        <el-form-item label="装机容量">
          <span class="field-value">{{ project?.currentProjectCapacity ?? '-' }} MW</span>
        </el-form-item>
        <el-form-item label="资本金 IRR">
          <span class="field-value">
            {{ project?.capitalFinancialRate != null ? project.capitalFinancialRate + '%' : '-' }}
          </span>
        </el-form-item>
        <el-form-item label="阶段">
          <span class="field-value">{{ project?.projectStage || '-' }}</span>
        </el-form-item>
        <el-form-item label="所属公司">
          <span class="field-value">{{ project?.managerCompany || '-' }}</span>
        </el-form-item>
        <el-form-item label="负责人">
          <span class="field-value">{{ project?.managerName || '-' }}</span>
        </el-form-item>
        <el-form-item label="创建时间">
          <span class="field-value">{{ project?.createTime || '-' }}</span>
        </el-form-item>
        <el-form-item label="备注">
          <span class="field-value">{{ project?.notes || '-' }}</span>
        </el-form-item>
      </el-form>
    </div>
  </template>
  
  <script setup>
  import { computed } from 'vue'
  
  const props = defineProps({
    project: { type: Object, default: null },
  })
  
  const ITEM_TYPE_MAP = { FD: '风电', GF: '光伏' }
  const itemTypeLabel = computed(() => ITEM_TYPE_MAP[props.project?.itemType] || '-')
  const regionLabel = computed(() => {
    const p = props.project || {}
    const names = [p.provinceName, p.cityName, p.districtName].filter(Boolean)
    return names.length ? names.join('/') : (p.address || '-')
  })
  </script>
  
  <style scoped>
  .main-info-tab { padding: 4px 0; }
  .field-value { color: #303133; font-size: 13px; }
  :deep(.el-form-item) { margin-bottom: 12px; }
  :deep(.el-form-item__label) { color: #909399; font-size: 12px; }
  </style>