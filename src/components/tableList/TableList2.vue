<template>
  <div class="table-list" :class="{ 'is-fit': props.fit }">
    <div class="table-body">
      <el-table
        ref="tableList"
        v-loading="props.loading"
        :data="props.tableData"
        :border="props.bordered"
        :height="tableHeight"
        :style="{ width: props.width }"
        v-bind="$attrs"
        @row-click="handleRowClick"
      >
        <el-table-column
          v-for="column in normalizedColumns"
          :key="getColumnKey(column)"
          :prop="getColumnProp(column)"
          :label="getColumnTitle(column)"
          :width="getColumnWidth(column)"
          :min-width="getColumnMinWidth(column)"
          :fixed="column.fixed"
          :align="column.align || 'center'"
          :header-align="column.headerAlign || column.align || 'center'"
          :sortable="column.sortable || false"
          show-overflow-tooltip
        >
          <template #header>
            <template
              v-if="
                column.selfHeader &&
                getColumnTitle(column).includes('|')
              "
            >
              <p
                v-for="(title, index) in getColumnTitle(column).split('|')"
                :key="`${getColumnKey(column)}-title-${index}`"
                :class="{ 'second-title': index > 0 }"
              >
                {{ title }}
              </p>
            </template>
            <span v-else>{{ getColumnTitle(column) }}</span>
          </template>

          <template #default="{ row, $index }">
            <slot
              v-if="column.scopedSlots"
              :name="column.scopedSlots"
              :record="row"
              :index="$index"
            />
            <span v-else>{{ getCellValue(row, column) }}</span>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div
      v-if="props.isShowPage && pageData.total > 0"
      class="table-pagination"
    >
      <!-- fit 模式：左侧显示"共 N 条"，右侧是页码 + 每页条数 -->
      <span v-if="props.fit" class="total-text">共 {{ pageData.total }} 条</span>
      <el-pagination
        v-model:current-page="pageData.current"
        v-model:page-size="pageData.pageSize"
        :total="pageData.total"
        :page-sizes="normalizedPageSizeOptions"
        :layout="paginationLayout"
        background
        @current-change="handleCurrentChange"
        @size-change="handleSizeChange"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, watch } from 'vue'

defineOptions({
  inheritAttrs: false,
})

const props = defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
  bordered: {
    type: Boolean,
    default: false,
  },
  tableData: {
    type: Array,
    default: () => [],
  },
  tableColumn: {
    type: Array,
    default: () => [],
  },
  isShowPage: {
    type: Boolean,
    default: true,
  },
  page: {
    type: Object,
    default: () => ({
      current: 1,
      pageSize: 10,
      total: 0,
    }),
  },
  pageSizeOptions: {
    type: Array,
    default: () => ['10', '20', '50', '100'],
  },
  height: {
    type: Number,
    default: 540,
  },
  width: {
    type: String,
    default: '100%',
  },
  // 自适应模式（默认关闭，不影响其他页面）：
  // 1. 表格宽度铺满父级：column.width 当作最小宽度，多余空间按比例分配
  // 2. 表格高度铺满父级剩余空间，分页固定在底部
  // 3. 分页改为 "共 N 条" 在左、页码在右的新布局
  fit: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['changePage', 'getRowData'])

const pageData = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
})

const normalizedPageSizeOptions = computed(() =>
  props.pageSizeOptions
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value) && value > 0),
)

const normalizedColumns = computed(() =>
  (props.tableColumn || []).filter((column) => column != null),
)

const tableHeight = computed(() => {
  if (props.fit) return '100%'
  if (!props.height || props.height <= 0) return undefined
  return props.height
})

const paginationLayout = computed(() =>
  props.fit
    ? 'prev, pager, next, sizes'
    : 'total, sizes, prev, pager, next, jumper',
)

watch(
  () => props.page,
  (value) => {
    if (!value) return

    pageData.current = Number(value.current ?? value.pageNo ?? 1)
    pageData.pageSize = Number(value.pageSize ?? 10)
    pageData.total = Number(value.total ?? 0)
  },
  { deep: true, immediate: true },
)

function getColumnKey(column = {}) {
  return (
    column.key ||
    column.dataIndex ||
    column.prop ||
    column.scopedSlots ||
    column.title
  )
}

function getColumnProp(column = {}) {
  return column.prop || column.dataIndex || column.key
}

function getColumnTitle(column = {}) {
  return String(column.label ?? column.title ?? '')
}

// fit 模式下，固定列和操作列保持固定宽度，其余列的 width 当作最小宽度
function isFixedWidthColumn(column = {}) {
  return !!column.fixed || column.scopedSlots === 'operation'
}

function getColumnWidth(column = {}) {
  if (props.fit && !isFixedWidthColumn(column)) return undefined
  return column.width || undefined
}

function getColumnMinWidth(column = {}) {
  if (column.minWidth) return column.minWidth
  if (props.fit && !isFixedWidthColumn(column)) return column.width || undefined
  return undefined
}

function getCellValue(row, column = {}) {
  const prop = getColumnProp(column)
  if (!prop) return ''

  return String(
    prop.split('.').reduce((value, key) => value?.[key], row) ?? '',
  )
}

function emitPageChange() {
  emit('changePage', {
    page: pageData.current,
    pageSize: pageData.pageSize,
  })
}

function handleCurrentChange(current) {
  pageData.current = current
  emitPageChange()
}

function handleSizeChange(size) {
  pageData.pageSize = size
  pageData.current = 1
  emitPageChange()
}

function handleRowClick(row) {
  emit('getRowData', row)
}
</script>

<style scoped lang="scss">
.table-list {
  width: 100%;
}

.table-pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

:deep(.el-table th.el-table__cell) {
  color: #1f2937;
  font-weight: 600;
  background: #f2f8f7;
}

:deep(.el-table .cell) {
  line-height: 20px;
}

.second-title {
  margin-top: -8px;
}

/* ========== fit 模式：新版样式 ========== */
.table-list.is-fit {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;

  .table-body {
    flex: 1;
    min-height: 0;
  }

  /* 分页栏：左侧总数，右侧页码 */
  .table-pagination {
    flex-shrink: 0;
    margin-top: 0;
    padding: 14px 0 16px;
    align-items: center;
    justify-content: space-between;
  }
  .total-text {
    font-size: 12.5px;
    color: #667383;
  }

  /* 表格 */
  :deep(.el-table) {
    --el-table-border-color: #DFE5EC;
    --el-table-text-color: #0B1C2C;
    --el-table-row-hover-bg-color: #F8FAFC;
    font-size: 13px;
  }
  :deep(.el-table__inner-wrapper::before) {
    display: none;
  }
  :deep(.el-table th.el-table__cell) {
    padding: 11px 0;
    color: #667383;
    font-size: 13px;
    font-weight: 500;
    background: rgba(236, 243, 250, 0.6);
  }
  :deep(.el-table td.el-table__cell) {
    padding: 15px 0;
  }

  /* 分页器 */
  :deep(.el-pagination) {
    --el-pagination-button-width: 28px;
    --el-pagination-button-height: 28px;
    --el-pagination-font-size: 12.5px;
    --el-text-color-regular: #667383;
    font-weight: 400;
  }
  :deep(.el-pagination.is-background .btn-prev),
  :deep(.el-pagination.is-background .btn-next),
  :deep(.el-pagination.is-background .el-pager li) {
    box-sizing: border-box;
    min-width: 28px;
    height: 28px;
    margin: 0 4px;
    color: #667383;
    background: #FFFFFF;
    border: 1px solid #E2E9F0;
    border-radius: 8px;
  }
  :deep(.el-pagination.is-background .el-pager li:not(.is-disabled):not(.is-active):hover) {
    color: #0278E7;
    border-color: #0278E7;
  }
  :deep(.el-pagination.is-background .el-pager li.is-active) {
    color: #FFFFFF;
    background: #0278E7;
    border-color: #0278E7;
  }
  :deep(.el-pagination .el-select) {
    width: 100px;
  }
}
</style>