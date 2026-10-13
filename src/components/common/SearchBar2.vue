<template>
    <div class="search-bar">
      <!-- 所属区域（市） -->
      <el-select
        v-model="filters.city"
        placeholder="所属区域"
        size="small"
        clearable
        style="width: 120px"
      >
        <el-option
          v-for="c in CITY_OPTIONS"
          :key="c.value"
          :label="c.label"
          :value="c.value"
        />
      </el-select>
  
      <!-- 项目类型 -->
      <el-select
        v-model="filters.itemType"
        placeholder="项目类型"
        size="small"
        clearable
        style="width: 112px"
      >
        <el-option label="风电" value="FD" />
        <el-option label="光伏" value="GF" />
      </el-select>
  
      <!-- 阶段 -->
      <el-select
        v-model="filters.projectStage"
        placeholder="全部阶段"
        size="small"
        clearable
        style="width: 120px"
      >
        <el-option
          v-for="item in stageOptions"
          :key="item.code"
          :label="item.desc"
          :value="item.code"
        />
      </el-select>
  
      <!-- 审批状态 -->
      <el-select
        v-model="filters.approvalStatus"
        placeholder="审批状态"
        size="small"
        clearable
        style="width: 112px"
      >
        <el-option label="未审批" value="NO_APPROVAL" />
        <el-option label="审批通过" value="APPROVED" />
        <el-option label="审批不通过" value="REJECTED" />
      </el-select>
  
      <!-- 核查状态 -->
      <el-select
        v-model="filters.isVerified"
        placeholder="核查状态"
        size="small"
        clearable
        style="width: 106px"
      >
        <el-option label="未核查" value="0" />
        <el-option label="已核查" value="1" />
      </el-select>
  
      <!-- 所属公司 -->
      <el-select
        v-model="filters.managerCompany"
        placeholder="所属公司"
        size="small"
        clearable
        style="width: 130px"
      >
        <el-option label="XX能源有限公司" value="XX能源有限公司" />
      </el-select>
  
      <!-- 负责人 -->
      <el-select
        v-model="filters.managerName"
        placeholder="负责人"
        size="small"
        clearable
        style="width: 100px"
      >
        <el-option label="张三222" value="张三222" />
        <el-option label="李四" value="李四" />
      </el-select>
  
      <!-- 创建时间 -->
      <el-date-picker
        v-model="createTimeRange"
        type="daterange"
        size="small"
        value-format="YYYY-MM-DD"
        start-placeholder="开始时间"
        end-placeholder="结束时间"
        style="width: 220px"
      />
  
      <!-- 项目编号 -->
      <el-input
        v-model="filters.projectCode"
        placeholder="项目编号"
        size="small"
        clearable
        style="width: 145px"
      />
  
      <!-- 项目名称 -->
      <el-input
        v-model="filters.projectName"
        placeholder="项目名称"
        size="small"
        clearable
        style="width: 145px"
        @keyup.enter="emit('search')"
      />
  
      <div class="search-actions">
        <el-button type="primary" size="small" @click="emit('search')">
          查询
        </el-button>
        <el-button size="small" @click="emit('reset')">
          重置
        </el-button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { computed } from 'vue'
  
  const props = defineProps({
    // ★ 直接传 filters 对象（响应式）
    filters: {
      type: Object,
      required: true,
    },
    // 阶段下拉选项
    stageOptions: {
      type: Array,
      default: () => [],
    },
  })
  
  const emit = defineEmits(['search', 'reset'])
  
  const CITY_OPTIONS = [
    { label: '西安市', value: '610100' },
    { label: '铜川市', value: '610200' },
    { label: '宝鸡市', value: '610300' },
    { label: '咸阳市', value: '610400' },
    { label: '渭南市', value: '610500' },
    { label: '延安市', value: '610600' },
    { label: '汉中市', value: '610700' },
    { label: '榆林市', value: '610800' },
    { label: '安康市', value: '610900' },
    { label: '商洛市', value: '611000' },
  ]
  
  // 日期区间 <-> createTimeStart / createTimeEnd 双向映射
  const createTimeRange = computed({
    get() {
      const f = props.filters
      return f.createTimeStart && f.createTimeEnd
        ? [f.createTimeStart, f.createTimeEnd]
        : []
    },
    set(val) {
      const f = props.filters
      if (Array.isArray(val) && val.length === 2) {
        f.createTimeStart = val[0]
        f.createTimeEnd = val[1]
      } else {
        f.createTimeStart = ''
        f.createTimeEnd = ''
      }
    },
  })
  </script>
  
  <style scoped>
  .search-bar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    padding: 12px 0;
  }
  
  .search-actions {
    display: flex;
    gap: 8px;
    margin-left: auto;
  }
  </style>