<template>
  <!-- 唯一根节点 -->
  <div class="dict-root">
    <div class="dict-page-bg">
      <!-- 背景光晕层 -->
      <div class="bg-glow-top-left"></div>
      <div class="bg-glow-bottom-right"></div>
      <div class="bg-glow-top-right"></div>

      <!-- 顶部 Header -->
      <div class="page-header">
        <span class="page-title">字典管理</span>
      </div>

      <!-- 主卡片 -->
      <div class="main-card">
        <!-- 卡片头部：Tabs + 操作按钮 -->
        <div class="card-header">
          <div class="header-left">
            <el-tabs v-model="activeTab" class="dict-tabs" @tab-change="handleTabChange">
              <el-tab-pane label="支持性文件分类" name="file" />
              <el-tab-pane label="支持文件对接部门" name="dept" />
            </el-tabs>
          </div>
          <div class="header-actions">
            <template v-if="activeTab === 'dept'">
              <el-button class="btn-reset" @click="handleMock('导出')">导出数据</el-button>
              <el-button class="btn-reset" @click="handleMock('导入')">导入数据</el-button>
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
            <!-- 文件分类的左侧菜单 -->
            <div v-if="activeTab === 'file'" class="nav-list">
              <div 
                v-for="item in fileNavList" 
                :key="item.id"
                class="nav-item"
                :class="{ active: currentFileNav === item.id }"
                @click="currentFileNav = item.id"
              >
                {{ item.label }}
              </div>
            </div>

            <!-- 对接部门的左侧菜单 (含省市区三级) -->
            <div v-else class="dept-nav">
              <div class="level-tabs">
                <div class="level-tab" :class="{ active: deptLevel === 'province' }" @click="deptLevel = 'province'">省</div>
                <div class="level-tab" :class="{ active: deptLevel === 'city' }" @click="deptLevel = 'city'">市</div>
                <div class="level-tab" :class="{ active: deptLevel === 'district' }" @click="deptLevel = 'district'">区</div>
              </div>
              <div class="nav-list" style="margin-top: 12px;">
                <div 
                  v-for="item in currentDeptList" 
                  :key="item.id"
                  class="nav-item"
                  :class="{ active: currentDeptNav === item.id }"
                  @click="currentDeptNav = item.id"
                >
                  {{ item.label }}
                </div>
              </div>
            </div>
          </div>

          <!-- 右侧内容区 -->
          <div class="right-content">
            <!-- 搜索栏 -->
            <div class="filter-bar">
              <div class="filter-row">
                <el-select v-model="searchForm.type" placeholder="类型" clearable class="filter-select">
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

            <!-- 表格展示区 -->
            <div class="table-wrapper">
              <!-- 文件分类表格 -->
              <el-table 
                v-if="activeTab === 'file'" 
                :data="fileTableData" 
                style="width: 100%; height: 100%" 
                header-cell-class-name="table-header"
              >
                <el-table-column prop="shortName" label="类型简称" min-width="120" />
                <el-table-column prop="fullName" label="类型全称" min-width="200" />
                <el-table-column prop="stage" label="适用阶段" min-width="120" />
                <el-table-column prop="updateTime" label="更新日期" min-width="160" />
                <el-table-column label="操作" width="120" fixed="right">
                  <template #default="{ row }">
                    <el-button link type="primary" class="operation-btn-item" @click="handleEdit(row)">编辑</el-button>
                    <el-button link type="danger" class="operation-btn-item is-danger" @click="handleDelete(row)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>

              <!-- 对接部门表格 -->
              <el-table 
                v-else 
                :data="deptTableData" 
                style="width: 100%; height: 100%" 
                header-cell-class-name="table-header"
              >
                <el-table-column prop="deptName" label="部门名称" min-width="250" />
                <el-table-column prop="updateTime" label="更新日期" min-width="160" />
                <el-table-column label="操作" width="120" fixed="right">
                  <template #default="{ row }">
                    <el-button link type="primary" class="operation-btn-item" @click="handleEdit(row)">编辑</el-button>
                    <el-button link type="danger" class="operation-btn-item is-danger" @click="handleDelete(row)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>

            <!-- 分页 -->
            <div class="pagination-wrap">
              <el-pagination
                v-model:current-page="currentPage"
                v-model:page-size="pageSize"
                :total="total"
                layout="total, sizes, prev, pager, next, jumper"
                background
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="activeTab === 'file' ? '添加文件分类' : '添加对接部门'"
      width="600px"
      destroy-on-close
      class="custom-dialog"
    >
      <el-form :model="formData" :rules="rules" ref="formRef" label-width="100px">
        <!-- 文件分类表单 (动态增减) -->
        <template v-if="activeTab === 'file'">
          <div 
            v-for="(item, index) in formData.fileItems" 
            :key="index"
            class="dynamic-row"
          >
            <span class="required-star">*</span>
            <span class="row-label">类型名称</span>
            <div class="row-inputs">
              <el-input v-model="item.shortName" placeholder="简称，如国土意见" class="short-input" />
              <el-input v-model="item.fullName" placeholder="全称，如国土意见" class="full-input" />
            </div>
            <div class="row-actions">
              <el-icon class="action-icon add" @click="addFileRow"><CirclePlus /></el-icon>
              <el-icon 
                class="action-icon remove" 
                :class="{ disabled: formData.fileItems.length === 1 }"
                @click="removeFileRow(index)"
              ><Remove /></el-icon>
            </div>
          </div>

          <el-form-item label="适用阶段" required style="margin-top: 24px;">
            <el-checkbox-group v-model="formData.stages">
              <el-checkbox label="立项阶段" />
              <el-checkbox label="投资决策" />
              <el-checkbox label="建设准备" />
              <el-checkbox label="建设实施" />
              <el-checkbox label="竣工验收" />
              <el-checkbox label="投产运营" />
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
        <el-button class="btn-reset" @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" class="btn-search" @click="handleSave" :loading="saveLoading">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { CirclePlus, Remove, Plus } from '@element-plus/icons-vue'

// ================= 状态定义 =================
const activeTab = ref('file')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(20)

const searchForm = reactive({
  type: '',
  name: ''
})

// ================= 左侧菜单数据 =================
// 1. 文件分类
const currentFileNav = ref('all')
const fileNavList = ref([
  { id: 'all', label: '全部阶段' },
  { id: 'stage1', label: '立项阶段' },
  { id: 'stage2', label: '投资决策' },
  { id: 'stage3', label: '建设准备' },
  { id: 'stage4', label: '建设实施' },
  { id: 'stage5', label: '竣工验收' },
  { id: 'stage6', label: '投产运营' }
])

// 2. 对接部门 (省市区)
const deptLevel = ref('district')
const currentDeptNav = ref('d1')
const mockDeptData = {
  province: [{ id: 'p1', label: '陕西省' }],
  city: [{ id: 'c1', label: '榆林市' }],
  district: [
    { id: 'd1', label: '榆阳区' },
    { id: 'd2', label: '横山区' },
    { id: 'd3', label: '神木市' },
    { id: 'd4', label: '府谷县' },
    { id: 'd5', label: '靖边县' },
    { id: 'd6', label: '定边县' },
    { id: 'd7', label: '绥德县' },
    { id: 'd8', label: '米脂县' },
    { id: 'd9', label: '佳县' },
    { id: 'd10', label: '吴堡县' },
    { id: 'd11', label: '清涧县' },
    { id: 'd12', label: '子洲县' }
  ]
}
const currentDeptList = computed(() => mockDeptData[deptLevel.value] || [])

// ================= 右侧表格数据 =================
const fileTableData = ref([
  { id: 1, shortName: '国土意见', fullName: 'XXXXXXXXXXXXXXXXXXXX', stage: '立项阶段', updateTime: '2025-01-02 08:00' },
  { id: 2, shortName: '国土批复', fullName: 'XXXXXXXXXXXXXXXXXXXX', stage: '投资决策', updateTime: '2025-01-02 08:00' },
  { id: 3, shortName: '林草意见', fullName: 'XXXXXXXXXXXXXXXXXXXX', stage: '立项阶段', updateTime: '2025-01-02 08:00' },
  { id: 4, shortName: '林草批复', fullName: 'XXXXXXXXXXXXXXXXXXXX', stage: '投资决策', updateTime: '2025-01-02 08:00' },
  { id: 5, shortName: '环保意见', fullName: 'XXXXXXXXXXXXXXXXXXXX', stage: '立项阶段', updateTime: '2025-01-02 08:00' },
  { id: 6, shortName: '环保批复', fullName: 'XXXXXXXXXXXXXXXXXXXX', stage: '投资决策', updateTime: '2025-01-02 08:00' }
])

const deptTableData = ref([
  { id: 1, deptName: '靖边县武装部', updateTime: '2025-01-02 08:00' },
  { id: 2, deptName: '靖边县资源规划局', updateTime: '2025-01-02 08:00' },
  { id: 3, deptName: '榆阳市生态环境局靖边分局', updateTime: '2025-01-02 08:00' }
])

// ================= 弹窗与表单 =================
const dialogVisible = ref(false)
const saveLoading = ref(false)
const formRef = ref(null)

const formData = reactive({
  fileItems: [{ shortName: '', fullName: '' }],
  stages: [],
  deptName: ''
})

const rules = {
  deptName: [{ required: true, message: '请输入部门名称', trigger: 'blur' }]
}

// ================= 交互逻辑 =================
const handleTabChange = () => {
  handleReset()
  if (activeTab.value === 'file') {
    currentFileNav.value = 'all'
  } else {
    currentDeptNav.value = 'd5'
  }
}

const handleSearch = () => {
  ElMessage.success('触发搜索')
}

const handleReset = () => {
  searchForm.type = ''
  searchForm.name = ''
}

const handleMock = (type) => {
  ElMessage.info(`模拟${type}操作`)
}

const addFileRow = () => {
  formData.fileItems.push({ shortName: '', fullName: '' })
}
const removeFileRow = (index) => {
  if (formData.fileItems.length > 1) {
    formData.fileItems.splice(index, 1)
  }
}

const handleAdd = () => {
  formData.fileItems = [{ shortName: '', fullName: '' }]
  formData.stages = []
  formData.deptName = ''
  dialogVisible.value = true
}

const handleEdit = (row) => {
  if (activeTab.value === 'file') {
    formData.fileItems = [{ shortName: row.shortName, fullName: row.fullName }]
    formData.stages = [row.stage]
  } else {
    formData.deptName = row.deptName
  }
  dialogVisible.value = true
}

const handleSave = () => {
  formRef.value.validate((valid) => {
    if (!valid) return
    if (activeTab.value === 'file') {
      const hasEmpty = formData.fileItems.some(item => !item.shortName || !item.fullName)
      if (hasEmpty) {
        ElMessage.warning('请填写完整的类型名称')
        return
      }
      if (formData.stages.length === 0) {
        ElMessage.warning('请至少选择一个适用阶段')
        return
      }
    }
    saveLoading.value = true
    setTimeout(() => {
      saveLoading.value = false
      dialogVisible.value = false
      ElMessage.success('保存成功')
    }, 500)
  })
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除这条数据吗？', '提示', {
    type: 'warning',
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  }).then(() => {
    ElMessage.success('删除成功')
  }).catch(() => {})
}
</script>

<style scoped lang="scss">
.dict-root {
  width: 100%;
  height: 100%;
}

/* ========== 外层容器与背景 ========== */
.dict-page-bg {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: linear-gradient(122.01deg, #E6EEF8 0%, #D2E0F4 100%), #FFFFFF;
  overflow: hidden;
}

.bg-glow-top-left {
  position: absolute;
  left: -1.61%;
  top: -18.52%;
  width: 350px;
  height: 350px;
  background: linear-gradient(135deg, #FFCCD5 0%, #FECFEF 100%);
  opacity: 0.49;
  filter: blur(129.5px);
  border-radius: 50%;
  pointer-events: none;
  z-index: 1;
}
.bg-glow-bottom-right {
  position: absolute;
  right: 4.64%;
  bottom: -18.13%;
  width: 450px;
  height: 450px;
  background: linear-gradient(120deg, #A1C4FD 0%, #C2E9FB 100%);
  opacity: 0.7;
  filter: blur(123px);
  border-radius: 50%;
  pointer-events: none;
  z-index: 1;
}
.bg-glow-top-right {
  position: absolute;
  right: 19.01%;
  top: -37.04%;
  width: 300px;
  height: 300px;
  background: linear-gradient(120deg, #A1C4FD 0%, #C2E9FB 100%);
  opacity: 0.7;
  filter: blur(123px);
  border-radius: 50%;
  pointer-events: none;
  z-index: 1;
}

/* ========== 顶部 Header ========== */
.page-header {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  height: 67px;
  padding: 15px 20px;
  box-sizing: border-box;
  flex-shrink: 0;
  border-bottom: 1px solid #E2E9F0;
}
.page-title {
  font-family: 'PingFang SC';
  font-weight: 500;
  font-size: 16px;
  color: #0B1C2C;
}

/* ========== 主卡片 ========== */
.main-card {
  position: relative;
  z-index: 2;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  margin: 16px 12px 30px;
  background: #FFFFFF;
  border: 1px solid #DFE5EC;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(11, 28, 44, 0.04);
  overflow: hidden;
}

/* ========== 卡片头部 ========== */
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 56px;
  border-bottom: 1px solid #E2E9F0;
  flex-shrink: 0;
}
.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* Tabs 重写 */
.dict-tabs {
  margin-bottom: -1px; /* 下划线压住 border */
  :deep(.el-tabs__header) {
    margin: 0;
  }
  :deep(.el-tabs__nav-wrap::after) {
    display: none;
  }
  :deep(.el-tabs__item) {
    height: 56px;
    font-size: 14px;
    color: #667383;
    &.is-active {
      color: #0278E7;
      font-weight: 500;
    }
  }
  :deep(.el-tabs__active-bar) {
    background-color: #0278E7;
    height: 2px;
  }
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
  background: #FAFBFC;
  border-right: 1px solid #E2E9F0;
  display: flex;
  flex-direction: column;
}
.nav-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

/* 省市区 Tabs 样式优化 */
.dept-nav {
  display: flex;
  flex-direction: column;
  height: 100%;
  .level-tabs {
    display: flex;
    padding: 12px;
    gap: 8px;
    border-bottom: 1px solid #E2E9F0;
    background: #FFFFFF;
  }
  .level-tab {
    flex: 1;
    text-align: center;
    padding: 6px 0;
    font-size: 13px;
    color: #667383;
    background: #F0F4F8;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
    &:hover { background: #E6EEF8; }
    &.active {
      background: #0278E7;
      color: #fff;
      font-weight: 500;
    }
  }
}

/* 左侧菜单项 */
.nav-item {
  padding: 10px 16px;
  margin-bottom: 4px;
  border-radius: 8px;
  font-size: 14px;
  color: #667383;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: #F0F4F8;
    color: #0B1C2C;
  }
  &.active {
    color: #0278E7;
    font-weight: 500;
    background: #E6F2FF;
    position: relative;
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 3px;
      height: 14px;
      border-radius: 0 2px 2px 0;
      background: #0278E7;
    }
  }
}

/* ========== 右侧内容 ========== */
.right-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

/* 搜索栏 */
.filter-bar {
  flex-shrink: 0;
  background: #FFFFFF;
}
.filter-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
}
.filter-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Element 控件统一样式 */
.filter-row :deep(.el-input__wrapper) {
  height: 36px;
  box-shadow: 0 0 0 1px #E2E9F0 inset;
  border-radius: 10px;
  background-color: #FFFFFF;
  padding: 1px 11px;
}
.filter-row :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #0278E7 inset;
}
.filter-select {
  width: 140px;
}
.filter-input {
  width: 200px;
}

/* 按钮统一 */
.btn-reset,
.btn-search,
.btn-add {
  height: 36px;
  padding: 0 16px;
  border-radius: 8px;
  font-size: 13px;
}
.btn-reset {
  color: #667383;
  background: #FFFFFF;
  border: 1px solid #E2E9F0;
  &:hover { color: #0278E7; border-color: #0278E7; background: #F0F7FF;}
}
.btn-search,
.btn-add {
  background: #0278E7 !important;
  border-color: #0278E7 !important;
  color: #FFFFFF !important;
  &:hover {
    background: #0267C7 !important;
    border-color: #0267C7 !important;
  }
}
.mr-1 { margin-right: 4px; }

/* 表格区域 */
.table-wrapper {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 0 20px;
  box-sizing: border-box;
  overflow: hidden;
}
:deep(.el-table) {
  --el-table-border-color: #E2E9F0;
  --el-table-header-bg-color: #F8FAFC;
  --el-table-row-hover-bg-color: #F4F8FC;
  width: 100% !important;
  flex: 1;
}
:deep(.el-table th.el-table__cell) {
  background-color: #F8FAFC !important;
  color: #0B1C2C;
  font-weight: 500;
}
:deep(.el-table__inner-wrapper::before) {
  display: none;
}

/* 分页 */
.pagination-wrap {
  flex-shrink: 0;
  display: flex;
  justify-content: flex-end;
  padding: 16px 20px;
}

/* 表格操作按钮 */
.operation-btn-item {
  font-size: 13px;
  padding: 0;
  margin-left: 12px;
  &:first-child { margin-left: 0; }
  &.is-danger { color: #F2555A !important; }
}

/* ========== 弹窗样式定制 ========== */
.custom-dialog {
  :deep(.el-dialog__header) {
    border-bottom: 1px solid #E2E9F0;
    margin-right: 0;
    padding-bottom: 16px;
  }
  :deep(.el-dialog__footer) {
    border-top: 1px solid #E2E9F0;
    padding-top: 16px;
  }
}
.dynamic-row {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}
.required-star {
  color: #F2555A;
  margin-right: 4px;
  font-size: 14px;
}
.row-label {
  width: 70px;
  font-size: 14px;
  color: #667383;
  text-align: right;
  margin-right: 12px;
}
.row-inputs {
  display: flex;
  align-items: center;
  flex: 1;
  gap: 8px;
}
.short-input { width: 180px; }
.full-input { width: 180px; }
.row-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 12px;
}
.action-icon {
  font-size: 18px;
  cursor: pointer;
}
.action-icon.add {
  color: #0278E7;
  &:hover { color: #0267C7; }
}
.action-icon.remove {
  color: #F2555A;
  &:hover { color: #D9363E; }
}
.action-icon.disabled {
  color: #C0C4CC;
  cursor: not-allowed;
}
</style>