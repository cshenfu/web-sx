<template>
    <el-table
      ref="tableRef"
      :data="data"
      :loading="loading"
      border
      stripe
      :height="height"
      style="width: 100%"
      :header-cell-style="{ background: '#f5f7fa', color: '#333', fontWeight: 600 }"
    >
      <!-- 可拖拽数据列 -->
      <el-table-column
        v-for="col in innerColumns"
        :key="col.prop"
        :prop="col.prop"
        :label="col.label"
        :min-width="col.minWidth || 100"
        :show-overflow-tooltip="col.tooltip !== false"
      >
        <template #default="{ row }">
          <!-- 插槽：允许外部自定义单元格 -->
          <slot :name="`cell-${col.prop}`" :row="row" :col="col">
  
            <!-- 内置：状态徽章 -->
            <el-tag v-if="col.type === 'tag'" :type="col.tagType?.(row[col.prop]) || 'info'" size="small">
              {{ col.formatter ? col.formatter(row[col.prop]) : row[col.prop] }}
            </el-tag>
  
            <!-- 内置：布尔勾选 -->
            <span v-else-if="col.type === 'check'" :style="{ color: row[col.prop] ? '#67c23a' : '#ccc', fontSize: '16px' }">
              {{ row[col.prop] ? '✓' : '○' }}
            </span>
  
            <!-- 普通文本 -->
            <span v-else>{{ col.formatter ? col.formatter(row[col.prop], row) : row[col.prop] }}</span>
          </slot>
        </template>
      </el-table-column>
  
      <!-- 操作列：固定右侧，内容完全由外部插槽决定 -->
      <el-table-column
        v-if="$slots.action"
        label="操作"
        :width="actionWidth"
        fixed="right"
        align="center"
      >
        <template #default="scope">
          <slot name="action" v-bind="scope" />
        </template>
      </el-table-column>
    </el-table>
  
    <!-- 分页 -->
    <el-pagination
      v-if="pagination"
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :total="total"
      :page-sizes="[10, 20, 50, 100]"
      layout="total, sizes, prev, pager, next"
      style="margin-top: 12px; justify-content: flex-end"
      @change="emit('page-change', { page: currentPage, size: pageSize })"
    />
  </template>
  
  <script setup>
  import { ref, onMounted, nextTick } from 'vue'
  import Sortable from 'sortablejs'
  
  const props = defineProps({
    columns:     { type: Array,   required: true },
    data:        { type: Array,   default: () => [] },
    loading:     { type: Boolean, default: false },
    height:      { type: [String, Number], default: 'calc(100vh - 230px)' },
    actionWidth: { type: Number,  default: 120 },
    draggable:   { type: Boolean, default: true },  // 是否允许列拖拽
    pagination:  { type: Boolean, default: true },
    total:       { type: Number,  default: 0 }
  })
  
  const emit = defineEmits(['page-change'])
  const tableRef    = ref(null)
  const innerColumns = ref([...props.columns])
  const currentPage  = ref(1)
  const pageSize     = ref(20)
  
  // ─── 列拖拽 ───────────────────────────────────────
  onMounted(() => {
    if (!props.draggable) return
    nextTick(() => {
      const tr = tableRef.value?.$el?.querySelector('.el-table__header-wrapper thead tr')
      if (!tr) return
      Sortable.create(tr, {
        animation: 200,
        filter: '.is-fixed',
        onEnd({ oldIndex, newIndex }) {
          if (oldIndex === newIndex) return
          const cols = [...innerColumns.value]
          const [moved] = cols.splice(oldIndex, 1)
          cols.splice(newIndex, 0, moved)
          innerColumns.value = cols
        }
      })
    })
  })
  </script>