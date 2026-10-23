<template>
  <!-- 唯一根节点 -->
  <div class="role-manage-root">
    <div class="role-manage-page-bg">
      <!-- 背景光晕层 -->
      <div class="bg-glow-top-left"></div>
      <div class="bg-glow-bottom-right"></div>
      <div class="bg-glow-top-right"></div>

      <!-- 顶部 Header -->
      <div class="page-header">
        <span class="page-title">角色管理</span>
      </div>

      <!-- 主卡片 -->
      <div class="main-card">
        <!-- 顶部操作栏 -->
        <div class="card-header">
          <div class="header-left">
            <el-radio-group v-model="viewMode" class="view-mode-group">
              <el-radio-button label="table">
                <el-icon><List /></el-icon>
                列表
              </el-radio-button>
              <el-radio-button label="card">
                <el-icon><Grid /></el-icon>
                卡片
              </el-radio-button>
            </el-radio-group>
          </div>
          <div class="header-actions">
            <el-button type="primary" class="btn-add" @click="handleAdd">
              <el-icon class="mr-1"><Plus /></el-icon>
              添加角色
            </el-button>
          </div>
        </div>

        <!-- 搜索栏 -->
        <div class="filter-bar">
          <div class="filter-row">
            <el-date-picker
              v-model="searchForm.dateRange"
              type="daterange"
              range-separator="~"
              start-placeholder="创建时间"
              end-placeholder="结束时间"
              value-format="YYYY-MM-DD"
              class="filter-date"
            />
            <el-input
              v-model="searchForm.name"
              placeholder="角色名称"
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

        <!-- 视图内容区 -->
        <div class="content-wrapper">
          <!-- 表格视图 -->
          <template v-if="viewMode === 'table'">
            <div class="table-container">
              <el-table 
                :data="tableData" 
                style="width: 100%; height: 100%" 
                header-cell-class-name="table-header"
                :border="false"
              >
                <el-table-column prop="code" label="角色ID" min-width="120" />
                <el-table-column prop="name" label="角色名称" min-width="150" />
                <el-table-column prop="desc" label="角色描述" min-width="300" show-overflow-tooltip />
                <el-table-column prop="createTime" label="创建时间" min-width="160" />
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
          </template>

          <!-- 卡片视图 -->
          <div v-else class="card-scroll-container">
            <div class="card-grid">
              <div v-for="item in tableData" :key="item.id" class="role-card">
                <div class="card-code">编码：{{ item.code }}</div>
                <div class="card-name">{{ item.name }}</div>
                <div class="card-desc">{{ item.desc }}</div>
                <div class="card-actions">
                  <el-button link type="primary" class="operation-btn-item" @click="handleEdit(item)">编辑</el-button>
                  <el-button link type="danger" class="operation-btn-item is-danger" @click="handleDelete(item)">删除</el-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑角色' : '新增角色'"
      width="800px"
      destroy-on-close
      class="custom-dialog"
    >
      <el-form :model="formData" :rules="rules" ref="formRef" label-width="100px">
        <div class="form-row">
          <el-form-item label="角色ID">
            <el-input v-model="formData.code" disabled placeholder="系统自动生成" />
          </el-form-item>
          <el-form-item label="角色名称" prop="name">
            <el-input v-model="formData.name" placeholder="请输入，最多20个字" maxlength="20" />
          </el-form-item>
          <el-form-item label="角色描述" prop="desc">
            <el-input v-model="formData.desc" placeholder="请输入，最多50个字" maxlength="50" />
          </el-form-item>
        </div>

        <!-- 权限配置 Tabs -->
        <el-tabs v-model="activeTab" class="permission-tabs">
          <el-tab-pane label="菜单权限" name="menu">
            <div class="tree-container">
              <el-tree
                ref="treeRef"
                :data="menuTreeData"
                show-checkbox
                node-key="id"
                default-expand-all
                :default-checked-keys="formData.menuKeys"
                :props="{ label: 'label', children: 'children' }"
              />
            </div>
          </el-tab-pane>
          <el-tab-pane label="数据权限" name="data">
            <div class="empty-tip">数据权限配置区域（待开发）</div>
          </el-tab-pane>
        </el-tabs>
      </el-form>

      <template #footer>
        <el-button class="btn-reset" @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" class="btn-search" @click="handleSave" :loading="saveLoading">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { List, Grid, Plus } from '@element-plus/icons-vue'

// ================= 数据定义 =================
const viewMode = ref('table') // 'table' | 'card'
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)

const searchForm = reactive({
  dateRange: [],
  name: ''
})

// 表格假数据
const tableData = ref([
  { id: 1, code: 'JS98767899', name: '管理员', desc: '角色描述角色描述角色描述角色描述角色描述角色描述', createTime: '2025-11-18 09:00' },
  { id: 2, code: 'JS98767899', name: '项目经理', desc: '角色描述角色描述角色描述角色描述角色描述角色描述', createTime: '2025-11-18 09:00' },
  { id: 3, code: 'JS98767899', name: '数据管理', desc: '角色描述角色描述角色描述角色描述角色描述角色描述', createTime: '2025-11-18 09:00' },
  { id: 4, code: 'JS98767899', name: '部门主管', desc: '角色描述角色描述角色描述角色描述角色描述角色描述', createTime: '2025-11-18 09:00' },
  { id: 5, code: 'JS98767899', name: '角色名称', desc: '角色描述角色描述角色描述角色描述角色描述角色描述', createTime: '2025-11-18 09:00' }
])

// 弹窗相关
const dialogVisible = ref(false)
const isEdit = ref(false)
const saveLoading = ref(false)
const activeTab = ref('menu')
const formRef = ref(null)
const treeRef = ref(null)

const formData = reactive({
  id: '',
  code: '',
  name: '',
  desc: '',
  menuKeys: []
})

const rules = {
  name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }]
}

// 菜单权限树假数据
const menuTreeData = ref([
  {
    id: 'qinchuan', label: '秦川智筹',
    children: [
      { id: 'q1', label: '功能名称' },
      { id: 'q2', label: '功能名称' },
      { id: 'q3', label: '功能名称' },
      { id: 'q4', label: '功能名称' },
      { id: 'q5', label: '功能名称' }
    ]
  },
  {
    id: 'yanping', label: '研评智坊',
    children: [
      { id: 'y1', label: '功能名称' },
      { id: 'y2', label: '功能名称' }
    ]
  },
  {
    id: 'hucang', label: '湖仓汇源',
    children: [
      {
        id: 'hc1', label: '地质库',
        children: [
          {
            id: 'hc1-1', label: '地质数据库',
            children: [
              { id: 'hc1-1-1', label: '添加' },
              { id: 'hc1-1-2', label: '编辑' },
              { id: 'hc1-1-3', label: '删除' }
            ]
          }
        ]
      }
    ]
  }
])

// ================= 交互逻辑 =================
const handleSearch = () => {
  ElMessage.success('触发搜索（模拟）')
}

const handleReset = () => {
  searchForm.dateRange = []
  searchForm.name = ''
  handleSearch()
}

const handleAdd = () => {
  isEdit.value = false
  formData.id = ''
  formData.code = 'JS' + Math.floor(Math.random() * 100000000)
  formData.name = ''
  formData.desc = ''
  formData.menuKeys = []
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  formData.id = row.id
  formData.code = row.code
  formData.name = row.name
  formData.desc = row.desc
  formData.menuKeys = ['q1', 'y1']
  dialogVisible.value = true
}

const handleSave = () => {
  formRef.value.validate((valid) => {
    if (!valid) return
    const checkedKeys = treeRef.value.getCheckedKeys()
    const halfCheckedKeys = treeRef.value.getHalfCheckedKeys()
    formData.menuKeys = [...checkedKeys, ...halfCheckedKeys]

    saveLoading.value = true
    setTimeout(() => {
      saveLoading.value = false
      dialogVisible.value = false
      ElMessage.success(isEdit.value ? '编辑成功' : '新增成功')
    }, 500)
  })
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除角色 "${row.name}" 吗？`, '提示', {
    type: 'warning',
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    customClass: 'custom-message-box'
  }).then(() => {
    ElMessage.success('删除成功')
  }).catch(() => {})
}
</script>

<style scoped lang="scss">
.role-manage-root {
  width: 100%;
  height: 100%;
}

/* ========== 外层容器与背景 ========== */
.role-manage-page-bg {
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

/* ========== 卡片头部操作栏 ========== */
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 56px;
  border-bottom: 1px solid #E2E9F0;
  flex-shrink: 0;

  .view-mode-group {
    :deep(.el-radio-button__inner) {
      height: 36px;
      display: flex;
      align-items: center;
      gap: 4px;
      border-color: #E2E9F0;
      color: #667383;
      box-shadow: none;
    }
    :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
      background-color: #0278E7;
      border-color: #0278E7;
      box-shadow: -1px 0 0 0 #0278E7;
      color: #fff;
    }
  }
}

/* ========== 搜索栏 ========== */
.filter-bar {
  flex-shrink: 0;
  background: #FFFFFF;
}
.filter-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
}
.filter-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 覆盖 Element 控件样式以统一规范 */
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
.filter-row :deep(.el-range-editor.el-input__wrapper) {
  width: 260px;
}
.filter-row :deep(.el-range-input) {
  font-size: 13px;
}
.filter-row .filter-input {
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
  &:hover { color: #0278E7; border-color: #0278E7; }
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

/* ========== 视图内容容器 ========== */
.content-wrapper {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 0 20px 16px;
  box-sizing: border-box;
  overflow: hidden;
}

/* 表格撑满 */
.table-container {
  flex: 1;
  min-height: 0;
  width: 100%;
}
:deep(.el-table) {
  --el-table-border-color: #E2E9F0;
  --el-table-header-bg-color: #F8FAFC;
  --el-table-row-hover-bg-color: #F4F8FC;
  width: 100% !important;
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
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

/* 卡片视图 */
.card-scroll-container {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding-top: 8px;
}
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}
.role-card {
  background: #F8FAFC;
  border: 1px solid #E2E9F0;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  transition: all 0.2s ease;
}
.role-card:hover {
  box-shadow: 0 4px 12px rgba(11, 28, 44, 0.06);
  border-color: #D1DFEE;
  background: #FFFFFF;
}
.card-code {
  font-size: 12px;
  color: #8D9AAF;
  margin-bottom: 8px;
}
.card-name {
  font-size: 16px;
  font-weight: 500;
  color: #0B1C2C;
  margin-bottom: 12px;
}
.card-desc {
  font-size: 13px;
  color: #667383;
  line-height: 1.5;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 16px;
}
.card-actions {
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid #E2E9F0;
  padding-top: 12px;
}

/* ========== 表格操作按钮 ========== */
.operation-btn-item {
  font-size: 13px;
  padding: 0;
  margin-left: 12px;
  &:first-child { margin-left: 0; }
  &.is-danger { color: #F2555A !important; }
}

/* ========== 弹窗内样式 ========== */
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
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 16px;
}
.permission-tabs {
  margin-top: 10px;
  :deep(.el-tabs__item.is-active) { color: #0278E7; }
  :deep(.el-tabs__active-bar) { background-color: #0278E7; }
}
.tree-container {
  border: 1px solid #E2E9F0;
  border-radius: 8px;
  padding: 16px;
  min-height: 300px;
  max-height: 400px;
  overflow-y: auto;
  background: #FAFBFC;
}
.empty-tip {
  padding: 40px 20px;
  color: #8D9AAF;
  text-align: center;
}
.mr-1 { margin-right: 4px; }
</style>