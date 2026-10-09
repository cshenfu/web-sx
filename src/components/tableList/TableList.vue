<template>
    <div class="table-list">
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
  
      <div
        v-if="props.isShowPage && pageData.total > 0"
        class="table-pagination"
      >
        <el-pagination
          v-model:current-page="pageData.current"
          v-model:page-size="pageData.pageSize"
          :total="pageData.total"
          :page-sizes="normalizedPageSizeOptions"
          layout="total, sizes, prev, pager, next, jumper"
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
    if (!props.height || props.height <= 0) return undefined
    return props.height
  })
  
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
  
  function getColumnWidth(column = {}) {
    return column.width || undefined
  }
  
  function getColumnMinWidth(column = {}) {
    return column.minWidth || undefined
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
  </style>