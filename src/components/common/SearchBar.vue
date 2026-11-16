<template>
    <div class="search-bar">
      <template v-for="field in fields" :key="field.key">
  
        <!-- 日期范围 -->
        <el-date-picker
          v-if="field.type === 'daterange'"
          v-model="model[field.key]"
          type="daterange"
          :start-placeholder="field.startPlaceholder || '开始时间'"
          :end-placeholder="field.endPlaceholder || '结束时间'"
          size="small"
          style="width: 220px"
          value-format="YYYY-MM-DD"
        />
  
        <!-- 下拉选择 -->
        <el-select
          v-else-if="field.type === 'select'"
          v-model="model[field.key]"
          :placeholder="field.placeholder"
          size="small"
          :style="{ width: field.width || '120px' }"
          clearable
        >
          <el-option
            v-for="opt in field.options"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
  
        <!-- 普通输入 -->
        <el-input
          v-else
          v-model="model[field.key]"
          :placeholder="field.placeholder"
          size="small"
          :style="{ width: field.width || '150px' }"
          clearable
          @keyup.enter="handleSearch"
        />
      </template>

      <!-- 允许页面传入专属筛选项，同时复用统一的布局与操作按钮 -->
      <slot />
  
      <el-button type="primary" size="small" @click="handleSearch">查询</el-button>
      <el-button size="small" @click="handleReset">重置</el-button>
    </div>
  </template>
  
  <script setup>
  import { reactive, watch } from 'vue'
  
  const props = defineProps({
    fields: { type: Array, default: () => [] }
  })
  const emit = defineEmits(['search', 'reset'])
  
  const model = reactive({})

  // 字段配置可能由异步数据生成；新增字段取默认值，已有输入保持不变。
  watch(
    () => props.fields,
    (fields = []) => {
      const keys = new Set(fields.map(field => field.key))
      Object.keys(model).forEach(key => {
        if (!keys.has(key)) delete model[key]
      })
      fields.forEach(field => {
        if (!Object.prototype.hasOwnProperty.call(model, field.key)) {
          model[field.key] = field.default ?? null
        }
      })
    },
    { immediate: true, deep: true }
  )

  function handleSearch() {
    emit('search', model)
  }
  
  function handleReset() {
    props.fields.forEach(f => { model[f.key] = f.default ?? null })
    emit('reset', model)
    emit('search', model)
  }
  </script>
  
  <style scoped>
  .search-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    padding: 12px 0;
  }
  </style>