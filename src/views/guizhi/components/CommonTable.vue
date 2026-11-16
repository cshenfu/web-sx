<template>
  <div class="common-table-wrap">
    <div class="table-container">
      <el-table
        :data="data"
        style="width: 100%"
        height="100%"
        header-cell-class-name="table-header"
        :border="false"
        :row-key="rowKey"
        v-loading="loading"
      >
        <el-table-column
          v-for="col in columns"
          :key="col.prop || col.label"
          :prop="col.prop"
          :label="col.label"
          :width="col.width"
          :min-width="col.minWidth"
          :fixed="col.fixed"
          :show-overflow-tooltip="col.showOverflowTooltip"
          :align="col.align || 'left'"
        >
          <template v-if="col.slot" #default="scope">
            <slot :name="col.slot" v-bind="scope" />
          </template>
        </el-table-column>

        <el-table-column
          v-if="hasActions"
          label="操作"
          :width="actionWidth"
          fixed="right"
        >
          <template #default="scope">
            <ActionOverflow class="table-actions">
              <slot name="actions" v-bind="scope" />
            </ActionOverflow>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div v-if="showPagination" class="pagination-wrap">
      <div class="pagination-total">共 {{ total }} 条</div>
      <el-pagination
        v-model:current-page="innerCurrentPage"
        v-model:page-size="innerPageSize"
        :total="total"
        :page-sizes="pageSizes"
        :pager-count="5"
        :layout="paginationLayout"
        background
      />
      <span v-if="!showPageSizes" class="page-size-text">
        {{ innerPageSize }} 条/页
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed, useSlots } from 'vue'
import ActionOverflow from '@/components/ActionOverflow.vue'

const props = defineProps({
  data: { type: Array, default: () => [] },
  columns: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  rowKey: { type: [String, Function], default: 'id' },
  actionWidth: { type: [String, Number], default: 100 },
  showPagination: { type: Boolean, default: true },
  total: { type: Number, default: 0 },
  currentPage: { type: Number, default: 1 },
  pageSize: { type: Number, default: 10 },
  pageSizes: { type: Array, default: () => [10, 20, 50, 100] },
  showPageSizes: { type: Boolean, default: false },
  showJumper: { type: Boolean, default: false }
})

const emit = defineEmits(['update:currentPage', 'update:pageSize'])

const slots = useSlots()
const hasActions = computed(() => !!slots.actions)

const paginationLayout = computed(() => {
  const parts = []
  if (props.showPageSizes) parts.push('sizes')
  parts.push('prev', 'pager', 'next')
  if (props.showJumper) parts.push('jumper')
  return parts.join(', ')
})

const innerCurrentPage = computed({
  get: () => props.currentPage,
  set: (val) => emit('update:currentPage', val)
})

const innerPageSize = computed({
  get: () => props.pageSize,
  set: (val) => {
    emit('update:pageSize', val)
    emit('update:currentPage', 1)
  }
})
</script>

<style scoped lang="scss">
.common-table-wrap {
  flex: 1;
  min-height: 0;
  min-width: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
}

/* ========== 表格容器（沿用组件1） ========== */
.table-container {
  flex: 1;
  min-height: 0;
  width: 100%;
  overflow: hidden;
  border-radius: 5px;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid #e1e7ef;
}

.table-container :deep(.el-table) {
  --el-table-border-color: #e6ebf1;
  --el-table-header-bg-color: #f2f5f9;
  --el-table-row-hover-bg-color: #f7faff;

  width: 100% !important;
  background: transparent;
}

/* 表头：14px */
.table-container :deep(.el-table th.el-table__cell) {
  height: 40px;
  padding: 0;
  background: #f2f5f9 !important;
  color: #637285;
  font-size: 14px;
  font-weight: 600;
  border-bottom: 1px solid #e0e7ef;
}

.table-container :deep(.el-table th .cell) {
  padding: 0 14px;
  line-height: 40px;
}

/* 行：14px */
.table-container :deep(.el-table td.el-table__cell) {
  height: 40px;
  padding: 0;
  border-bottom: 1px solid #e8edf3;
  color: #304153;
  font-size: 14px;
}

.table-container :deep(.el-table td .cell) {
  padding: 0 14px;
  line-height: 40px;
}

.table-container :deep(.el-table__body tr:last-child td.el-table__cell) {
  border-bottom: none;
}

.table-container :deep(.el-table__body tr:hover > td.el-table__cell) {
  background: #f8fbff !important;
}

.table-container :deep(.el-table__inner-wrapper::before) {
  display: none;
}

/* 空状态：12px 提示 */
.table-container :deep(.el-table__empty-text) {
  font-size: 12px;
  color: #8190a2;
}

/* ========== 操作列 ========== */
.table-actions {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
}

/* ========== 分页（沿用组件1 风格） ========== */
.pagination-wrap {
  flex-shrink: 0;
  height: 28px;
  margin-top: 7px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 7px;
}

.pagination-total {
  margin-right: auto;
  color: #667688;
  font-size: 12px;
}

.pagination-wrap :deep(.el-pagination) {
  padding: 0;
  height: 26px;
}

.pagination-wrap :deep(.el-pagination .btn-prev),
.pagination-wrap :deep(.el-pagination .btn-next),
.pagination-wrap :deep(.el-pagination .el-pager li) {
  width: 23px;
  min-width: 23px;
  height: 23px;
  margin: 0 2px;
  padding: 0;
  border: 1px solid #e0e6ee;
  border-radius: 5px;
  background: #fff;
  color: #667688;
  font-size: 12px;
  line-height: 21px;
}

.pagination-wrap :deep(.el-pagination .el-pager li.is-active) {
  background: #087fe5;
  border-color: #087fe5;
  color: #fff;
}

.pagination-wrap :deep(.el-pagination .btn-prev:hover),
.pagination-wrap :deep(.el-pagination .btn-next:hover),
.pagination-wrap :deep(.el-pagination .el-pager li:hover) {
  color: #087fe5;
  border-color: #bcd8ef;
}

.pagination-wrap :deep(.el-pagination .el-pager li.is-active:hover) {
  color: #fff;
  border-color: #087fe5;
  background: #087fe5;
}

.pagination-wrap :deep(.el-pagination__sizes .el-select__wrapper) {
  min-height: 26px;
  height: 26px;
  font-size: 12px;
  border-radius: 6px;
  box-shadow: 0 0 0 1px #dfe6ee inset;
}

.pagination-wrap :deep(.el-pagination__jump) {
  font-size: 12px;
  color: #667688;
}

.page-size-text {
  color: #667688;
  font-size: 12px;
  white-space: nowrap;
}
</style>