<template>
  <div class="dict-root">
    <!-- 统一背景 -->
    <div class="admin-page-bg">
      <!-- 背景光晕层 -->
      <div class="bg-glow bg-glow-top-left"></div>
      <div class="bg-glow bg-glow-top-right"></div>
      <div class="bg-glow bg-glow-bottom-right"></div>

      <!-- 顶部 Header -->
      <div class="admin-page-header">
        <span class="page-title">字典管理</span>
      </div>

      <!-- 主卡片 -->
      <div class="admin-main-card">
        <!-- 卡片头部：Tabs + 操作按钮 -->
        <div class="card-header">
          <div class="header-left">
            <el-tabs
              v-model="activeTab"
              class="dict-tabs"
              @tab-change="handleTabChange"
            >
              <el-tab-pane label="支持性文件分类" name="file" />
              <el-tab-pane label="支持文件对接部门" name="dept" />
            </el-tabs>
          </div>

          <div class="header-actions">
            <template v-if="activeTab === 'dept'">
              <el-button class="btn-ghost" @click="handleMock('导出')">导出数据</el-button>
              <el-button class="btn-ghost" @click="handleMock('导入')">导入数据</el-button>
            </template>
            <el-button type="primary" class="btn-add" @click="handleAdd">
              <el-icon class="mr-1"><Plus /></el-icon>
              {{ activeTab === 'file' ? '添加数据' : '添加对接部门' }}
            </el-button>
          </div>
        </div>

        <!-- 左右分栏主体 -->
        <div class="content-body">
          <!-- 左侧导航区 -->
          <div class="left-nav">
            <!-- 文件分类左侧菜单 -->
            <div v-if="activeTab === 'file'" class="nav-list" v-loading="navLoading">
              <div
                v-for="item in fileNavList"
                :key="item.id"
                class="nav-item"
                :class="{ active: currentFileNav === item.id }"
                @click="handleFileNavClick(item.id)"
              >
                {{ item.name }}
              </div>
            </div>

            <!-- 对接部门左侧菜单（省市区三级） -->
            <div v-else class="dept-nav" v-loading="navLoading">
              <div class="level-tabs">
                <div
                  class="level-tab"
                  :class="{ active: deptLevel === 'province' }"
                  @click="handleDeptLevelChange('province')"
                >
                  省
                </div>
                <div
                  class="level-tab"
                  :class="{ active: deptLevel === 'city' }"
                  @click="handleDeptLevelChange('city')"
                >
                  市
                </div>
                <div
                  class="level-tab"
                  :class="{ active: deptLevel === 'district' }"
                  @click="handleDeptLevelChange('district')"
                >
                  区
                </div>
              </div>

              <div class="nav-list">
                <div
                  v-for="item in currentDeptList"
                  :key="item.id"
                  class="nav-item"
                  :class="{ active: currentDeptNav === item.id }"
                  @click="handleDeptNavClick(item.id)"
                >
                  {{ item.name }}
                </div>
              </div>
            </div>
          </div>

          <!-- 右侧内容区 -->
          <div class="right-content">
            <!-- 搜索栏 (使用公共类名 admin-filter-bar) -->
            <div class="admin-filter-bar">
              <div class="filter-row">
                <el-select
                  v-model="searchForm.type"
                  placeholder="类型"
                  clearable
                  class="filter-select"
                >
                  <el-option label="意见" value="1" />
                  <el-option label="批复" value="2" />
                </el-select>

                <el-input
                  v-model="searchForm.name"
                  placeholder="请输入名称"
                  clearable
                  class="filter-input"
                  @keyup.enter="handleSearch"
                />

                <div class="filter-buttons">
                  <el-button class="btn-reset" @click="handleReset">重置</el-button>
                  <el-button type="primary" class="btn-search" @click="handleSearch">搜索</el-button>
                </div>
              </div>
            </div>

            <!-- 表格 + 分页 -->
            <div class="admin-table-area">
              <!-- 文件分类表格 -->
              <CommonTable
                v-if="activeTab === 'file'"
                :data="tableData"
                :columns="fileColumns"
                :total="total"
                v-model:current-page="currentPage"
                v-model:page-size="pageSize"
                :action-width="120"
                :loading="tableLoading"
              >
                <template #actions="{ row }">
                  <el-button link type="primary" class="operation-btn-item" @click="handleEdit(row)">
                    编辑
                  </el-button>
                  <el-button link type="danger" class="operation-btn-item is-danger" @click="handleDelete(row)">
                    删除
                  </el-button>
                </template>
              </CommonTable>

              <!-- 对接部门表格 -->
              <CommonTable
                v-else
                :data="tableData"
                :columns="deptColumns"
                :total="total"
                v-model:current-page="currentPage"
                v-model:page-size="pageSize"
                :action-width="120"
                :loading="tableLoading"
              >
                <template #actions="{ row }">
                  <el-button link type="primary" class="operation-btn-item" @click="handleEdit(row)">
                    编辑
                  </el-button>
                  <el-button link type="danger" class="operation-btn-item is-danger" @click="handleDelete(row)">
                    删除
                  </el-button>
                </template>
              </CommonTable>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 新增/编辑弹窗 (使用公共类名 admin-custom-dialog) -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      destroy-on-close
      class="admin-custom-dialog"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="100px"
      >
        <!-- 文件分类表单（动态增减） -->
        <template v-if="activeTab === 'file'">
          <div
            v-for="(item, index) in formData.fileItems"
            :key="index"
            class="dynamic-row"
          >
            <span class="required-star">*</span>
            <span class="row-label">类型名称</span>
            <div class="row-inputs">
              <el-input
                v-model="item.name"
                placeholder="简称，如国土意见"
                class="short-input"
              />
              <el-input
                v-model="item.detailName"
                placeholder="全称，如国土意见"
                class="full-input"
              />
            </div>
            <div class="row-actions">
              <el-icon class="action-icon add" @click="addFileRow"><CirclePlus /></el-icon>
              <el-icon
                class="action-icon remove"
                :class="{ disabled: formData.fileItems.length === 1 }"
                @click="removeFileRow(index)"
              >
                <Remove />
              </el-icon>
            </div>
          </div>

          <el-form-item label="适用阶段" required class="stage-form-item">
            <el-checkbox-group v-model="formData.stages">
              <el-checkbox 
                v-for="stage in allStageList" 
                :key="stage.id" 
                :label="stage.id" 
                :value="stage.id"
              >
                {{ stage.name }}
              </el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </template>

        <!-- 对接部门表单 -->
        <template v-else>
          <el-form-item label="部门名称" prop="deptName">
            <el-input v-model="formData.deptName" placeholder="请输入部门名称" />
          </el-form-item>
        </template>
      </el-form>

      <template #footer>
        <el-button class="dialog-cancel-btn" @click="dialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          class="dialog-save-btn"
          :loading="saveLoading"
          @click="handleSave"
        >
          保存
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { CirclePlus, Remove, Plus } from '@element-plus/icons-vue'
import CommonTable from './components/CommonTable.vue'
import * as dicApi from '@/api/modules/dic'

// ================= 全局状态 =================
const activeTab = ref('file')
const tableData = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const tableLoading = ref(false)
const navLoading = ref(false)

const searchForm = reactive({
  type: '',
  name: ''
})

// 统一处理响应
function unwrapResponse(response) {
  let result = response
  if (result && Object.prototype.hasOwnProperty.call(result, 'data') && (result.status || result.config || result.headers)) {
    result = result.data
  }
  if (result && typeof result === 'object' && Object.prototype.hasOwnProperty.call(result, 'code')) {
    if (result.code !== 0 && result.code !== 200) throw new Error(result.msg || '接口请求失败')
    return result.data
  }
  return result
}

// ================= 1. 文件分类逻辑 =================
const currentFileNav = ref('all')
const fileNavList = ref([])
const allStageList = ref([]) 

const loadStages = async () => {
  try {
    navLoading.value = true
    const res = await dicApi.getConfigDataStages()
    const data = unwrapResponse(res) || []
    
    allStageList.value = data
    
    fileNavList.value = [
      { id: 'all', name: '全部阶段' },
      ...data.map(item => ({
        id: item.id,
        name: item.name,
        stage: item.bizScenarioType
      }))
    ]
    
    if (fileNavList.value.length > 0) {
      currentFileNav.value = fileNavList.value[0].id
      getTableData()
    }
  } catch (error) {
    ElMessage.error(error.message || '获取适用阶段失败')
  } finally {
    navLoading.value = false
  }
}

const handleFileNavClick = (id) => {
  currentFileNav.value = id
  currentPage.value = 1
  getTableData()
}

// ================= 2. 对接部门逻辑 =================
const deptLevel = ref('province') 
const currentDeptNav = ref('')
const deptTreeData = reactive({
  province: [],
  city: [],
  district: []
})

const currentDeptList = computed(() => deptTreeData[deptLevel.value] || [])

const loadDeptLevelData = async (level, parentId) => {
  try {
    navLoading.value = true
    const res = await dicApi.getConfigDataByParentId(parentId)
    const data = unwrapResponse(res) || []
    
    deptTreeData[level] = data.map(item => ({
      id: item.id,
      name: item.name
    }))
    
    if (deptTreeData[level].length > 0) {
      currentDeptNav.value = deptTreeData[level][0].id
      getTableData()
    } else {
      currentDeptNav.value = ''
      tableData.value = []
      total.value = 0
    }
  } catch (error) {
    ElMessage.error(error.message || `获取${level}级部门失败`)
  } finally {
    navLoading.value = false
  }
}

const handleDeptLevelChange = (level) => {
  deptLevel.value = level
  currentDeptNav.value = ''
  if (level === 'province') loadDeptLevelData('province', 0) 
  else if (level === 'city') loadDeptLevelData('city', deptTreeData.province[0]?.id || 0)
  else loadDeptLevelData('district', deptTreeData.city[0]?.id || 0)
}

const handleDeptNavClick = (id) => {
  currentDeptNav.value = id
  currentPage.value = 1
  getTableData()
}

// ================= 3. 核心：获取右侧列表数据 =================
const getTableData = async () => {
  try {
    tableLoading.value = true
    const parentId = activeTab.value === 'file' 
      ? (currentFileNav.value === 'all' ? undefined : currentFileNav.value)
      : (currentDeptNav.value || undefined)

    const params = { pageNo: currentPage.value, pageSize: pageSize.value }
    if (parentId) params.parentId = parentId
    if (searchForm.name) params.name = searchForm.name

    const res = await dicApi.pageConfigData(params)
    const data = unwrapResponse(res)
    
    tableData.value = data.list || []
    total.value = data.total || 0
  } catch (error) {
    tableData.value = []
    total.value = 0
    ElMessage.error(error.message || '获取列表失败')
  } finally {
    tableLoading.value = false
  }
}

// ================= 4. 表格列配置 =================
const fileColumns = [
  { prop: 'name',       label: '类型简称', minWidth: 150, showOverflowTooltip: true },
  { prop: 'detailName', label: '类型全称', minWidth: 200, showOverflowTooltip: true },
  { prop: 'sortOrder',  label: '排序号',   width: 100, align: 'center' },
  { prop: 'notes',      label: '备注',     minWidth: 150, showOverflowTooltip: true }
]

const deptColumns = [
  { prop: 'name',       label: '部门名称', minWidth: 250, showOverflowTooltip: true },
  { prop: 'notes',      label: '备注',     minWidth: 150, showOverflowTooltip: true }
]

// ================= 5. 搜索 / 重置 / Tab切换 =================
const handleSearch = () => {
  currentPage.value = 1
  getTableData()
}

const handleReset = () => {
  searchForm.type = ''
  searchForm.name = ''
  currentPage.value = 1
  getTableData()
}

const handleTabChange = () => {
  handleReset()
  if (activeTab.value === 'file') {
    if (fileNavList.value.length > 0) {
      currentFileNav.value = fileNavList.value[0].id
      getTableData()
    }
  } else {
    deptLevel.value = 'province'
    loadDeptLevelData('province', 0)
  }
}

const handleMock = (type) => {
  ElMessage.info(`模拟${type}操作`)
}

// ================= 6. 弹窗 / 表单 =================
const dialogVisible = ref(false)
const saveLoading = ref(false)
const formRef = ref(null)
const editingId = ref(null)

const formData = reactive({
  fileItems: [{ name: '', detailName: '' }],
  stages: [],
  deptName: ''
})

const rules = {
  deptName: [{ required: true, message: '请输入部门名称', trigger: 'blur' }]
}

const dialogTitle = computed(() => {
  const isFile = activeTab.value === 'file'
  if (editingId.value) return isFile ? '编辑文件分类' : '编辑对接部门'
  return isFile ? '添加文件分类' : '添加对接部门'
})

const addFileRow = () => {
  formData.fileItems.push({ name: '', detailName: '' })
}

const removeFileRow = (index) => {
  if (formData.fileItems.length > 1) {
    formData.fileItems.splice(index, 1)
  }
}

// ================= 7. 新增 / 编辑 / 保存 =================
const handleAdd = () => {
  editingId.value = null
  formData.fileItems = [{ name: '', detailName: '' }]
  formData.stages = (activeTab.value === 'file' && currentFileNav.value !== 'all') 
    ? [currentFileNav.value] 
    : []
  formData.deptName = ''
  dialogVisible.value = true
}

const handleEdit = (row) => {
  editingId.value = row.id
  if (activeTab.value === 'file') {
    formData.fileItems = [{ name: row.name, detailName: row.detailName }]
    formData.stages = row.parentId ? [row.parentId] : []
  } else {
    formData.deptName = row.name
  }
  dialogVisible.value = true
}

const handleSave = () => {
  formRef.value.validate(async (valid) => {
    if (!valid) return

    if (activeTab.value === 'file') {
      const hasEmpty = formData.fileItems.some((it) => !it.name || !it.detailName)
      if (hasEmpty) return ElMessage.warning('请填写完整的类型名称')
      if (formData.stages.length === 0) return ElMessage.warning('请至少选择一个适用阶段')
    }

    saveLoading.value = true
    try {
      if (activeTab.value === 'file') {
        const selectedStages = allStageList.value.filter(s => formData.stages.includes(s.id))
        
        if (editingId.value) {
          const payload = {
            id: editingId.value,
            name: formData.fileItems[0].name,
            detailName: formData.fileItems[0].detailName,
            parentId: formData.stages[0]
          }
          await dicApi.updateConfigData(payload)
        } else {
          const payload = {
            stageList: selectedStages.map(s => ({ id: s.id, name: s.name, stage: s.bizScenarioType })),
            typeList: formData.fileItems.map((it, index) => ({
              name: it.name,
              detailName: it.detailName,
              sortOrder: index + 1
            }))
          }
          await dicApi.batchCreateConfigData(payload)
        }
      } else {
        const payload = { name: formData.deptName, parentId: currentDeptNav.value || 0 }
        if (editingId.value) {
          payload.id = editingId.value
          await dicApi.updateConfigData(payload)
        } else {
          await dicApi.createConfigData(payload)
        }
      }

      ElMessage.success('保存成功')
      dialogVisible.value = false
      getTableData()
    } catch (error) {
      ElMessage.error(error.message || '保存失败')
    } finally {
      saveLoading.value = false
    }
  })
}

// ================= 8. 删除 =================
const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除这条数据吗？', '提示', {
    type: 'warning',
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  })
    .then(async () => {
      try {
        await dicApi.deleteConfigData(row.id)
        ElMessage.success('删除成功')
        
        if (tableData.value.length === 1 && currentPage.value > 1) {
          currentPage.value--
        }
        getTableData()
      } catch (error) {
        ElMessage.error(error.message || '删除失败')
      }
    })
    .catch(() => {})
}

// ================= 监听分页变化 =================
watch([currentPage, pageSize], () => {
  getTableData()
})

// ================= 初始化 =================
onMounted(() => {
  loadStages()
})
</script>

<style scoped lang="scss">
/* 引入公共样式 */
@import './components/css/admin-common.scss';


.dict-root {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

/* 👇 修复搜索栏宽度 👇 */
.filter-row {
  .filter-select {
    width: 140px !important;
  }
  .filter-input {
    width: 240px !important;
  }
}
/* ========== 卡片头部：Tabs + 操作按钮 ========== */
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  height: 48px;
  flex-shrink: 0;
  border-bottom: 1px solid #e8edf3;
}

.header-left {
  display: flex;
  align-items: center;
  height: 48px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Tabs 微调 */
.dict-tabs {
  height: 48px;
  margin-bottom: -1px;

  :deep(.el-tabs__header) {
    margin: 0;
  }
  :deep(.el-tabs__nav-wrap::after) {
    display: none;
  }
  :deep(.el-tabs__item) {
    height: 48px;
    line-height: 48px;
    padding: 0 16px;
    font-size: 14px;
    color: #667383;

    &.is-active {
      color: #087fe5;
      font-weight: 600;
    }
  }
  :deep(.el-tabs__active-bar) {
    background-color: #087fe5;
    height: 2px;
  }
}

/* 头部按钮 */
.btn-ghost,
.btn-add {
  height: 28px;
  padding: 0 12px;
  border-radius: 7px;
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.btn-ghost {
  color: #657487;
  background: rgba(255, 255, 255, 0.55);
  border: 1px solid #dfe6ee;
  &:hover {
    color: #087fe5;
    border-color: #b9d4ed;
    background: #fff;
  }
}

.btn-add {
  border: none !important;
  background: #0783eb !important;
  color: #fff !important;
  box-shadow: 0 4px 10px rgba(2, 120, 231, 0.18);
  &:hover {
    background: #0675d4 !important;
  }
}

.mr-1 {
  margin-right: 4px;
}

/* ========== 左右分栏 ========== */
.content-body {
  flex: 1;
  min-height: 0;
  display: flex;
}

/* 左侧导航 */
.left-nav {
  width: 200px;
  flex-shrink: 0;
  background: #fafbfc;
  border-right: 1px solid #e8edf3;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.nav-list {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  &::-webkit-scrollbar { width: 5px; }
  &::-webkit-scrollbar-thumb { background: rgba(150, 165, 180, 0.35); border-radius: 5px; }
}

/* 省市区 Tabs */
.dept-nav {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;

  .level-tabs {
    display: flex;
    padding: 10px;
    gap: 6px;
    border-bottom: 1px solid #e8edf3;
    background: #ffffff;
    flex-shrink: 0;
  }

  .level-tab {
    flex: 1;
    text-align: center;
    padding: 5px 0;
    font-size: 14px;
    color: #667383;
    background: #f0f4f8;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;

    &:hover { background: #e6eef8; }
    &.active { background: #087fe5; color: #fff; font-weight: 500; }
  }
}

/* 左侧菜单项 */
.nav-item {
  padding: 8px 14px;
  margin-bottom: 3px;
  border-radius: 6px;
  font-size: 14px;
  color: #667383;
  cursor: pointer;
  transition: all 0.15s ease;
  position: relative;

  &:hover {
    background: #f0f4f8;
    color: #152536;
  }

  &.active {
    color: #087fe5;
    font-weight: 500;
    background: #e6f2ff;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 3px;
      height: 14px;
      border-radius: 0 2px 2px 0;
      background: #087fe5;
    }
  }
}

/* ========== 右侧内容区 ========== */
.right-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

/* ========== 弹窗内动态行 ========== */
.dynamic-row {
  display: flex;
  align-items: center;
  margin-bottom: 14px;
}

.required-star {
  color: #f15e64;
  margin-right: 4px;
  font-size: 14px;
}

.row-label {
  width: 76px;
  font-size: 14px;
  color: #536274;
  text-align: right;
  margin-right: 12px;
  flex-shrink: 0;
}

.row-inputs {
  display: flex;
  align-items: center;
  flex: 1;
  gap: 8px;
  min-width: 0;
}

.short-input,
.full-input {
  flex: 1;
  min-width: 0;
}

.row-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 12px;
  flex-shrink: 0;
}

.action-icon {
  font-size: 18px;
  cursor: pointer;
}

.action-icon.add {
  color: #087fe5;
  &:hover { color: #0675d4; }
}

.action-icon.remove {
  color: #f15e64;
  &:hover { color: #e9474e; }
}

.action-icon.disabled {
  color: #c0c4cc;
  cursor: not-allowed;
}

/* 适用阶段 */
.stage-form-item {
  margin-top: 20px;
}

.stage-form-item :deep(.el-checkbox) {
  font-size: 14px;
}

.stage-form-item :deep(.el-checkbox__label) {
  font-size: 14px;
  color: #536274;
}

/* ========== 响应式 ========== */
@media screen and (max-width: 1100px) {
  .left-nav { width: 170px; }
}

@media screen and (max-width: 800px) {
  .left-nav { width: 150px; }
  .dict-tabs :deep(.el-tabs__item) { padding: 0 10px; }
}

@media screen and (max-width: 600px) {
  .content-body { flex-direction: column; }
  .left-nav {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid #e8edf3;
    max-height: 180px;
  }
  .card-header { padding: 0 10px; }
  .btn-ghost { display: none; }
}
</style>