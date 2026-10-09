<template>
    <div class="geology-table-wrap">
  
      <!-- 用户数据 / 公共数据 Tab -->
      <div class="tab-bar">
        <span
          v-for="tab in tabs"
          :key="tab.key"
          class="tab-item"
          :class="{ active: activeTab === tab.key }"
          @click="switchTab(tab.key)"
        >{{ tab.label }}</span>
  
        <div class="tab-actions">
          <el-button type="primary" size="small" @click="showAddDialog = true">
            添加数据
          </el-button>
        </div>
      </div>
  
      <!-- 搜索栏 -->
      <div class="filter-row">
        <el-select
          v-model="filters.province"
          placeholder="省份选择"
          size="small"
          style="width: 100px"
        >
          <el-option label="陕西省" value="shaanxi" />
          <el-option label="甘肃省" value="gansu" />
        </el-select>
  
        <el-select
          v-model="filters.city"
          placeholder="市/区"
          size="small"
          style="width: 110px"
          clearable
        >
          <el-option
            v-for="c in cities"
            :key="c.value"
            :label="c.label"
            :value="c.value"
          />
        </el-select>
  
        <el-select
          v-model="filters.status"
          placeholder="数据状态"
          size="small"
          style="width: 110px"
          clearable
        >
          <el-option label="已开建" value="built" />
          <el-option label="勘查中" value="survey" />
          <el-option label="初步规划" value="plan" />
        </el-select>
  
        <el-input
          v-model="filters.code"
          placeholder="数据编号"
          size="small"
          style="width: 130px"
          clearable
        />
  
        <el-input
          v-model="filters.keyword"
          placeholder="关键词/联系编号"
          size="small"
          style="width: 160px"
          clearable
        />
  
        <el-button type="primary" size="small" @click="fetchData">查询</el-button>
        <el-button size="small" @click="resetFilters">重置</el-button>
      </div>
  
      <!-- 表格 -->
      <el-table
        ref="tableRef"
        v-loading="loading"
        :data="tableData"
        border
        stripe
        :height="tableHeight"
        style="width: 100%"
        :header-cell-style="{ background: '#f5f7fa', color: '#333', fontWeight: 600 }"
        :cell-style="{ fontSize: '12px' }"
      >
        <!-- 动态列（可拖拽） -->
        <el-table-column
          v-for="col in currentColumns"
          :key="col.prop"
          :prop="col.prop"
          :label="col.label"
          :min-width="col.minWidth || 100"
          show-overflow-tooltip
          align="center"
        >
          <template #default="{ row }">
            <!-- 状态徽章 -->
            <el-tag
              v-if="col.type === 'tag'"
              :type="statusTagType(row[col.prop])"
              size="small"
              effect="light"
            >
              {{ row[col.prop] }}
            </el-tag>
  
            <!-- 布尔勾选 -->
            <span
              v-else-if="col.type === 'check'"
              :class="row[col.prop] ? 'check-yes' : 'check-no'"
            >
              {{ row[col.prop] ? '✓' : '○' }}
            </span>
  
            <!-- 普通文字 -->
            <span v-else>{{ row[col.prop] ?? '-' }}</span>
          </template>
        </el-table-column>
  
        <!-- 操作列：固定右侧 -->
        <el-table-column
          label="操作"
          :width="activeTab === 'public' ? 180 : 120"
          fixed="right"
          align="center"
        >
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button link type="primary" size="small" @click="handleView(row)">
              查看数据
            </el-button>
  
            <!-- 公共数据额外操作 -->
            <template v-if="activeTab === 'public'">
              <el-divider direction="vertical" />
              <el-button link type="danger" size="small" @click="handleDelete(row)">
                删除
              </el-button>
              <el-button link type="warning" size="small" @click="handleDisable(row)">
                禁用
              </el-button>
            </template>
          </template>
        </el-table-column>
      </el-table>
  
      <!-- 分页 -->
      <div class="pagination-wrap">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @change="fetchData"
        />
      </div>
  
      <!-- 添加数据弹窗（占位，后续完善） -->
      <el-dialog v-model="showAddDialog" title="添加地勘数据" width="700px" destroy-on-close>
        <p style="color: #999; text-align: center; padding: 40px 0">表单待完善</p>
        <template #footer>
          <el-button @click="showAddDialog = false">取消</el-button>
          <el-button type="primary">确认保存</el-button>
        </template>
      </el-dialog>
  
    </div>
  </template>
  
  <script setup>
  import { ref, reactive, computed, onMounted, nextTick, watch } from 'vue'
  import Sortable from 'sortablejs'
  import { ElMessage, ElMessageBox } from 'element-plus'
  
  // ─── Tab 配置 ─────────────────────────────────────────────────
  const tabs = [
    { key: 'user',   label: '用户数据' },
    { key: 'public', label: '公共数据' },
  ]
  const activeTab = ref('user')
  
  // ─── 城市选项 ─────────────────────────────────────────────────
  const cities = [
    { label: '榆林市', value: 'yulin' },
    { label: '延安市', value: 'yanan' },
    { label: '铜川市', value: 'tongchuan' },
    { label: '咸阳市', value: 'xianyang' },
    { label: '渭南市', value: 'weinan' },
    { label: '宝鸡市', value: 'baoji' },
    { label: '西安市', value: 'xian' },
    { label: '商洛市', value: 'shangluo' },
    { label: '汉中市', value: 'hanzhong' },
    { label: '安康市', value: 'ankang' },
  ]
  
  // ─── 过滤条件 ────────────────────────────────────────────────
  const filters = reactive({
    province: 'shaanxi',
    city: '',
    status: '',
    code: '',
    keyword: '',
  })
  
  function resetFilters() {
    Object.assign(filters, { city: '', status: '', code: '', keyword: '' })
    fetchData()
  }
  
  // ─── 分页 ────────────────────────────────────────────────────
  const pagination = reactive({ page: 1, size: 20, total: 0 })
  
  // ─── 列定义：用户数据 ────────────────────────────────────────
  const userColumns = [
    { prop: 'code',         label: '数据编号',           minWidth: 130 },
    { prop: 'region',       label: '所属区域',           minWidth: 160 },
    { prop: 'sampleCode',   label: '关联取样编号',        minWidth: 140 },
    { prop: 'name',         label: '数据名称',           minWidth: 120 },
    { prop: 'landform',     label: '地貌引绰',           minWidth: 90  },
    { prop: 'terrain',      label: '地形引绰',           minWidth: 90  },
    { prop: 'startCoord',   label: '起点坐标',           minWidth: 130 },
    { prop: 'geoDoc',       label: '地质间文件',          minWidth: 90,  type: 'check' },
    { prop: 'reportDoc',    label: '勘察报告文件',        minWidth: 100, type: 'check' },
    { prop: 'rockCount',    label: '地质岩类数量',        minWidth: 100, type: 'check' },
    { prop: 'hydro',        label: '水工直线性',          minWidth: 90,  type: 'check' },
    { prop: 'geoKeyword',   label: '地质发展关键字',      minWidth: 120, type: 'check' },
    { prop: 'bearingLayer', label: '持力层描述',          minWidth: 100, type: 'check' },
    { prop: 'bearing',      label: '云土层厚度/承载力特征值', minWidth: 170, type: 'check' },
    { prop: 'regionParam',  label: '区域地貌参数',        minWidth: 110, type: 'check' },
    { prop: 'regionEval',   label: '地区地貌条件与评价',  minWidth: 150, type: 'check' },
    { prop: 'hydrology',    label: '长域水文勘察',        minWidth: 120, type: 'check' },
    { prop: 'suggestion',   label: '经验与建议',          minWidth: 100, type: 'check' },
    { prop: 'geoFile',      label: '地勘文件',           minWidth: 90,  type: 'check' },
    { prop: 'status',       label: '数据状态',           minWidth: 90,  type: 'tag'   },
    { prop: 'createdAt',    label: '录入时间',           minWidth: 150 },
  ]
  
  // ─── 列定义：公共数据（列稍少） ──────────────────────────────
  const publicColumns = [
    { prop: 'code',         label: '数据编号',          minWidth: 130 },
    { prop: 'region',       label: '所属区域',          minWidth: 160 },
    { prop: 'status',       label: '数据状态',          minWidth: 90,  type: 'tag'   },
    { prop: 'landform',     label: '地貌引绰',          minWidth: 90,  type: 'check' },
    { prop: 'terrain',      label: '地形引绰',          minWidth: 90,  type: 'check' },
    { prop: 'startCoord',   label: '起点坐标',          minWidth: 130, type: 'check' },
    { prop: 'geoDoc',       label: '地质间文件',         minWidth: 90,  type: 'check' },
    { prop: 'reportDoc',    label: '勘察报告文件',       minWidth: 100, type: 'check' },
    { prop: 'hydro',        label: '水工直线性',         minWidth: 90,  type: 'check' },
    { prop: 'geoKeyword',   label: '地质发展关键字',     minWidth: 120, type: 'check' },
    { prop: 'bearing',      label: '云土承载力特征值',   minWidth: 140, type: 'check' },
    { prop: 'regionEval',   label: '区域地貌条件评价',   minWidth: 140, type: 'check' },
    { prop: 'hydrology',    label: '水文勘察',          minWidth: 90,  type: 'check' },
    { prop: 'suggestion',   label: '经验建议',          minWidth: 90,  type: 'check' },
    { prop: 'condition',    label: '条件',              minWidth: 80,  type: 'check' },
    { prop: 'updatedAt',    label: '更新时间',          minWidth: 150 },
  ]
  
  // 当前激活的列（响应式，用于拖拽后更新）
  const currentColumns = ref([...userColumns])
  
  // ─── 状态徽章颜色映射 ────────────────────────────────────────
  function statusTagType(status) {
    const map = {
      '已开建': 'success',
      '勘查中': 'warning',
      '初步规划': '',       // 蓝色（element-plus 默认 primary）
      '已停止': 'danger',
      '待审核': 'info',
    }
    return map[status] ?? 'info'
  }
  
  // ─── mock 数据（接入接口后替换） ─────────────────────────────
  const loading = ref(false)
  const tableRef = ref(null)
  const showAddDialog = ref(false)
  const tableHeight = 'calc(100vh - 232px)'
  
  const tableData = ref([
    {
      code: 'DZD03767899', region: '陕西省/榆林市/定远站',
      sampleCode: 'FD00767899...共2个', name: '测试数据A',
      landform: '是', terrain: '是', startCoord: '109.23, 37.88',
      geoDoc: false, reportDoc: false, rockCount: false,
      hydro: false, geoKeyword: false, bearingLayer: false,
      bearing: false, regionParam: false, regionEval: false,
      hydrology: false, suggestion: false, geoFile: false,
      status: '初步规划', condition: true,
      createdAt: '2022-08-18 09:00', updatedAt: '2022-08-18 09:00'
    },
    {
      code: 'DZD03767899', region: '陕西省/榆林市/定远站',
      sampleCode: 'FD00767899...共2个', name: '测试数据B',
      landform: '是', terrain: '否', startCoord: '109.23, 37.88',
      geoDoc: false, reportDoc: false, rockCount: false,
      hydro: false, geoKeyword: false, bearingLayer: false,
      bearing: false, regionParam: false, regionEval: false,
      hydrology: false, suggestion: false, geoFile: false,
      status: '勘查中', condition: false,
      createdAt: '2022-08-18 09:00', updatedAt: '2022-08-18 09:00'
    },
    {
      code: 'DZD03767899', region: '陕西省/榆林市/定远站',
      sampleCode: 'FD00767899...共2个', name: '测试数据C',
      landform: '是', terrain: '是', startCoord: '109.23, 37.88',
      geoDoc: true, reportDoc: true, rockCount: true,
      hydro: false, geoKeyword: true, bearingLayer: false,
      bearing: true, regionParam: false, regionEval: true,
      hydrology: false, suggestion: true, geoFile: false,
      status: '已开建', condition: true,
      createdAt: '2022-08-18 09:00', updatedAt: '2022-08-18 09:00'
    },
    {
      code: 'DZD03767899', region: '陕西省/榆林市/定远站',
      sampleCode: 'FD00767899...共2个', name: '测试数据D',
      landform: '是', terrain: '是', startCoord: '109.23, 37.88',
      geoDoc: true, reportDoc: true, rockCount: false,
      hydro: false, geoKeyword: false, bearingLayer: true,
      bearing: false, regionParam: true, regionEval: false,
      hydrology: true, suggestion: false, geoFile: true,
      status: '已开建', condition: true,
      createdAt: '2022-08-18 09:00', updatedAt: '2022-08-18 09:00'
    },
    {
      code: 'DZD03767899', region: '陕西省/榆林市/定远站',
      sampleCode: 'FD00767899...共2个', name: '测试数据E',
      landform: '是', terrain: '否', startCoord: '109.23, 37.88',
      geoDoc: false, reportDoc: false, rockCount: false,
      hydro: false, geoKeyword: false, bearingLayer: false,
      bearing: false, regionParam: false, regionEval: false,
      hydrology: false, suggestion: false, geoFile: false,
      status: '初步规划', condition: false,
      createdAt: '2022-08-18 09:00', updatedAt: '2022-08-18 09:00'
    },
  ])
  
  async function fetchData() {
    loading.value = true
    try {
      // TODO: 替换为真实接口
      // const res = await api.getGeologyList({ ...filters, ...pagination, tab: activeTab.value })
      // tableData.value = res.list
      // pagination.total = res.total
      await new Promise(r => setTimeout(r, 300)) // mock 延迟
    } finally {
      loading.value = false
    }
  }
  
  // ─── 切换 Tab ────────────────────────────────────────────────
  function switchTab(key) {
    activeTab.value = key
    currentColumns.value = key === 'user' ? [...userColumns] : [...publicColumns]
    pagination.page = 1
    fetchData()
    // 重建 Sortable（新列结构）
    nextTick(() => initSortable())
  }
  
  // ─── 列拖拽 ──────────────────────────────────────────────────
  let sortableInstance = null
  
  function initSortable() {
    const tr = tableRef.value?.$el?.querySelector(
      '.el-table__header-wrapper thead tr'
    )
    if (!tr) return
  
    sortableInstance?.destroy()
    sortableInstance = Sortable.create(tr, {
      animation: 200,
      filter: '.is-fixed',          // 操作列不参与拖拽
      preventOnFilter: true,
      onEnd({ oldIndex, newIndex }) {
        if (oldIndex === newIndex) return
        const cols = [...currentColumns.value]
        const [moved] = cols.splice(oldIndex, 1)
        cols.splice(newIndex, 0, moved)
        currentColumns.value = cols
      },
    })
  }
  
  // ─── 操作方法 ────────────────────────────────────────────────
  function handleEdit(row) {
    // TODO: 打开编辑弹窗，传入 row 数据
    console.log('edit', row)
  }
  
  function handleView(row) {
    // TODO: 跳转详情或打开抽屉
    console.log('view', row)
  }
  
  async function handleDelete(row) {
    await ElMessageBox.confirm('确认删除该地勘数据？', '提示', {
      type: 'warning',
      confirmButtonText: '确认删除',
      confirmButtonClass: 'el-button--danger',
    })
    // TODO: 调用删除接口
    ElMessage.success('删除成功')
    fetchData()
  }
  
  function handleDisable(row) {
    // TODO: 调用禁用接口
    ElMessage.success('已禁用')
  }
  
  // ─── 初始化 ──────────────────────────────────────────────────
  onMounted(() => {
    fetchData()
    nextTick(() => initSortable())
  })
  </script>
  
  <style scoped>
  .geology-table-wrap {
    height: 100%;
    display: flex;
    flex-direction: column;
    background: #fff;
    padding: 0 16px 12px;
  }
  
  /* Tab 栏 */
  .tab-bar {
    display: flex;
    align-items: center;
    gap: 0;
    border-bottom: 2px solid #e4e7ed;
    padding-top: 12px;
    margin-bottom: 0;
  }
  
  .tab-item {
    padding: 8px 20px;
    font-size: 14px;
    color: #606266;
    cursor: pointer;
    border-bottom: 2px solid transparent;
    margin-bottom: -2px;
    transition: all 0.2s;
    user-select: none;
  }
  
  .tab-item:hover {
    color: #409eff;
  }
  
  .tab-item.active {
    color: #409eff;
    border-bottom-color: #409eff;
    font-weight: 600;
  }
  
  .tab-actions {
    margin-left: auto;
    padding-bottom: 8px;
  }
  
  /* 过滤行 */
  .filter-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 0 8px;
    flex-wrap: wrap;
  }
  
  /* 分页 */
  .pagination-wrap {
    display: flex;
    justify-content: flex-end;
    margin-top: 12px;
  }
  
  /* 勾选样式 */
  .check-yes {
    color: #67c23a;
    font-size: 15px;
    font-weight: bold;
  }
  
  .check-no {
    color: #c0c4cc;
    font-size: 15px;
  }
  
  /* 列头拖拽光标 */
  :deep(.el-table__header-wrapper thead tr th:not(.is-fixed)) {
    cursor: grab;
  }
  
  :deep(.el-table__header-wrapper thead tr th:not(.is-fixed):active) {
    cursor: grabbing;
  }
  </style>