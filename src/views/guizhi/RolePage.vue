<template>
  <div class="role-manage-root">
    <!-- 统一背景 -->
    <div class="admin-page-bg">
      <!-- 背景光晕层 -->
      <div class="bg-glow bg-glow-top-left"></div>
      <div class="bg-glow bg-glow-top-right"></div>
      <div class="bg-glow bg-glow-bottom-right"></div>

      <!-- 顶部 Header -->
      <div class="admin-page-header">
        <span class="page-title">角色管理</span>
        <el-button type="primary" class="btn-add" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          <span>添加角色</span>
        </el-button>
      </div>

      <!-- 页面主体 -->
      <div class="main-content">
        <!-- 搜索与工具栏 -->
        <div class="toolbar">
          <!-- 搜索栏 -->
          <div class="admin-filter-bar">
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
                placeholder="编号/名称"
                clearable
                class="filter-input"
                @keyup.enter="handleSearch"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>

              <div class="filter-buttons">
                <el-button class="btn-reset" @click="handleReset">重置</el-button>
                <el-button type="primary" class="btn-search" @click="handleSearch">搜索</el-button>
              </div>
            </div>
          </div>

          <!-- 视图切换 -->
          <div class="view-mode-wrapper">
            <el-radio-group v-model="viewMode" class="view-mode-group">
              <el-radio-button label="table">
                <el-icon><List /></el-icon>
                <span>列表</span>
              </el-radio-button>
              <el-radio-button label="card">
                <el-icon><Grid /></el-icon>
                <span>卡片</span>
              </el-radio-button>
            </el-radio-group>
          </div>
        </div>

        <!-- ================= 列表模式 ================= -->
        <template v-if="viewMode === 'table'">
          <div class="admin-table-area">
            <CommonTable
              :data="pagedTableData"
              :columns="columns"
              :total="filteredData.length"
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
            >
              <!-- 角色名称插槽 -->
              <template #name="{ row, $index }">
                <span class="role-tag" :class="getRoleTagClass($index, row.name)">
                  {{ row.name }}
                </span>
              </template>

              <!-- 操作插槽 -->
              <template #actions="{ row }">
                <el-button link type="primary" class="operation-btn-item" @click="handleEdit(row)">编辑</el-button>
                <el-button link type="danger" class="operation-btn-item is-danger" @click="handleDelete(row)">删除</el-button>
              </template>
            </CommonTable>
          </div>
        </template>

        <!-- ================= 卡片模式 ================= -->
        <div v-else class="card-scroll-container">
          <div class="card-grid">
            <div
              v-for="item in filteredData"
              :key="item.id"
              class="role-card"
              :class="{ 'is-active': selectedCardId === item.id }"
              @click="selectedCardId = item.id"
            >
              <!-- 卡片顶部 -->
              <div class="role-card-header">
                <span class="card-code">角色ID：{{ item.code }}</span>

                <el-dropdown trigger="click" placement="bottom-end" @click.stop>
                  <button class="card-more-btn" type="button" @click.stop>
                    <el-icon><MoreFilled /></el-icon>
                  </button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item @click="handleEdit(item)">
                        <el-icon><Edit /></el-icon> 编辑
                      </el-dropdown-item>
                      <el-dropdown-item class="delete-dropdown-item" @click="handleDelete(item)">
                        <el-icon><Delete /></el-icon> 删除
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>

              <!-- 角色名称 -->
              <div class="card-name">{{ item.name }}</div>

              <!-- 角色描述 -->
              <div class="card-desc">{{ item.desc }}</div>

              <!-- 创建时间 -->
              <div class="card-time">
                <el-icon><Clock /></el-icon>
                <span>{{ item.createTime }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ================= 新增 / 编辑弹窗 ================= -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑角色' : '新增角色'"
      width="800px"
      destroy-on-close
      class="admin-custom-dialog"
    >
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px">
        <!-- 基础信息 (内部采用3列 Grid 布局) -->
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

        <!-- 权限配置 -->
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

      <!-- Footer -->
      <template #footer>
        <el-button class="dialog-cancel-btn" @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" class="dialog-save-btn" :loading="saveLoading" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { List, Grid, Plus, Search, MoreFilled, Edit, Delete, Clock } from '@element-plus/icons-vue'
import CommonTable from './components/CommonTable.vue'

// ================= 视图与分页 =================
const viewMode = ref('table')
const currentPage = ref(1)
const pageSize = ref(10)

// ================= 搜索表单 =================
const searchForm = reactive({
  dateRange: [],
  name: ''
})

// ================= 表格假数据 =================
const tableData = ref([
  { id: 1,  code: 'JS09876456', name: '成员',     desc: '可查看系统基础信息及授权范围内的业务数据，支持日常业务操作。', createTime: '2025-06-09 09:00:00' },
  { id: 2,  code: 'JS09876457', name: '项目经理', desc: '负责项目整体管理与进度跟踪，可查看项目数据并协调相关业务工作。', createTime: '2025-06-10 09:00:00' },
  { id: 3,  code: 'JS09876458', name: '数据管理', desc: '负责业务数据维护、数据质量检查及相关数据资源的日常管理。', createTime: '2025-06-11 09:00:00' },
  { id: 4,  code: 'JS09876459', name: '部门主管', desc: '负责本部门业务数据查看与审核，可对部门成员的相关操作进行管理。', createTime: '2025-06-12 09:00:00' },
  { id: 5,  code: 'JS09876460', name: '管理员',   desc: '负责系统基础配置、用户管理、角色权限配置及系统运行维护。', createTime: '2025-06-13 09:00:00' },
  { id: 6,  code: 'JS09876461', name: '成员',     desc: '可根据授权范围访问业务功能，完成日常数据查询、录入及业务操作。', createTime: '2025-06-14 09:00:00' },
  { id: 7,  code: 'JS09876462', name: '成员',     desc: '主要用于普通业务人员访问系统功能及查看权限范围内的业务信息。', createTime: '2025-06-15 09:00:00' },
  { id: 8,  code: 'JS09876463', name: '成员',     desc: '负责日常业务信息维护，可根据系统授权执行对应的数据操作。', createTime: '2025-06-16 09:00:00' },
])

// ================= 表格列配置 =================
const columns = [
  { prop: 'code',       label: '角色ID',   minWidth: 130 },
  { prop: 'name',       label: '角色名称', minWidth: 130, slot: 'name' },
  { prop: 'desc',       label: '角色描述', minWidth: 300, showOverflowTooltip: true },
  { prop: 'createTime', label: '创建时间', minWidth: 180 }
]

// ================= 筛选与分页 =================
const filteredData = computed(() => {
  const [start, end] = searchForm.dateRange || []
  const keyword = (searchForm.name || '').trim().toLowerCase()

  return tableData.value.filter((row) => {
    if (keyword) {
      const matchCode = row.code.toLowerCase().includes(keyword)
      const matchName = row.name.toLowerCase().includes(keyword)
      if (!matchCode && !matchName) return false
    }
    if (start || end) {
      const rowDate = row.createTime.slice(0, 10)
      if (start && rowDate < start) return false
      if (end && rowDate > end) return false
    }
    return true
  })
})

const pagedTableData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredData.value.slice(start, start + pageSize.value)
})

// ================= 角色标签颜色 =================
const getRoleTagClass = (index, name) => {
  if (name === '项目经理') return 'tag-purple'
  if (name === '数据管理') return 'tag-cyan'
  if (name === '部门主管') return 'tag-green'
  if (name === '管理员')   return 'tag-blue'
  return 'tag-gray'
}

// ================= 卡片选中 =================
const selectedCardId = ref(null)

// ================= 搜索 / 重置 =================
const handleSearch = () => {
  currentPage.value = 1
  ElMessage.success(`搜索完成，共 ${filteredData.value.length} 条`)
}

const handleReset = () => {
  searchForm.dateRange = []
  searchForm.name = ''
  currentPage.value = 1
}

// ================= 弹窗与表单 =================
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

// ================= 菜单权限树 =================
const menuTreeData = ref([
  {
    id: 'qinchuan', label: '秦川智筹',
    children: [
      { id: 'q1', label: '功能名称' }, { id: 'q2', label: '功能名称' }, { id: 'q3', label: '功能名称' },
      { id: 'q4', label: '功能名称' }, { id: 'q5', label: '功能名称' }
    ]
  },
  {
    id: 'yanping', label: '研评智坊',
    children: [
      { id: 'y1', label: '功能名称' }, { id: 'y2', label: '功能名称' }
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

// ================= 新增 / 编辑 =================
const handleAdd = () => {
  isEdit.value = false
  activeTab.value = 'menu'
  formData.id = ''
  formData.code = 'JS' + Math.floor(Math.random() * 100000000)
  formData.name = ''
  formData.desc = ''
  formData.menuKeys = []
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  activeTab.value = 'menu'
  formData.id = row.id
  formData.code = row.code
  formData.name = row.name
  formData.desc = row.desc
  formData.menuKeys = ['q1', 'y1'] // 模拟回显
  dialogVisible.value = true
}

// ================= 时间格式化 =================
const formatNow = () => {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

// ================= 保存 =================
const handleSave = () => {
  formRef.value.validate((valid) => {
    if (!valid) return

    if (treeRef.value) {
      formData.menuKeys = [
        ...treeRef.value.getCheckedKeys(),
        ...treeRef.value.getHalfCheckedKeys()
      ]
    }

    saveLoading.value = true
    setTimeout(() => {
      saveLoading.value = false
      if (isEdit.value) {
        const idx = tableData.value.findIndex((r) => r.id === formData.id)
        if (idx > -1) {
          tableData.value[idx] = { ...tableData.value[idx], name: formData.name, desc: formData.desc }
        }
      } else {
        tableData.value.unshift({
          id: Date.now(),
          code: formData.code,
          name: formData.name,
          desc: formData.desc,
          createTime: formatNow()
        })
        currentPage.value = 1
      }
      dialogVisible.value = false
      ElMessage.success(isEdit.value ? '编辑成功' : '新增成功')
    }, 500)
  })
}

// ================= 删除 =================
const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除角色 "${row.name}" 吗？`, '提示', {
    type: 'warning',
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  })
    .then(() => {
      const idx = tableData.value.findIndex((r) => r.id === row.id)
      if (idx > -1) tableData.value.splice(idx, 1)

      const maxPage = Math.max(1, Math.ceil(filteredData.value.length / pageSize.value))
      if (currentPage.value > maxPage) currentPage.value = maxPage

      ElMessage.success('删除成功')
    })
    .catch(() => {})
}
</script>

<style scoped lang="scss">
/* 引入公共样式 */
@import './components/css/admin-common.scss';

.role-manage-root {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

/* ========== 页面主体与工具栏 ========== */
.main-content {
  position: relative;
  z-index: 2;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 10px 16px 18px;
  box-sizing: border-box;
  overflow: hidden;
}

.toolbar {
  position: relative;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 9px;
}

/* 修复搜索栏宽度拉伸 */
.admin-filter-bar {
  background: transparent !important;
  border: none !important;
  padding: 0 !important;

  .filter-row {
    padding: 0 !important;
    .filter-date {
      width: 240px !important;
      max-width: 240px !important;
      flex: none !important;
    }
    .filter-input {
      width: 240px !important;
      max-width: 240px !important;
      flex: none !important;
    }
  }
}

/* 添加按钮 */
.btn-add {
  height: 28px;
  padding: 0 13px;
  border-radius: 7px;
  border: none !important;
  font-size: 14px;
  box-shadow: 0 4px 10px rgba(2, 120, 231, 0.18);
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: #0783eb !important;
  color: #fff !important;
  &:hover {
    background: #0675d4 !important;
  }
}

/* ========== 视图切换 ========== */
.view-mode-wrapper {
  display: flex;
  align-items: center;
}

.view-mode-group {
  display: flex;
  height: 26px;
}

.view-mode-group :deep(.el-radio-button) {
  height: 26px;
}

.view-mode-group :deep(.el-radio-button__inner) {
  height: 26px;
  min-width: 58px;
  padding: 0 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  box-sizing: border-box;
  border: 1px solid #dfe6ee;
  background: rgba(255, 255, 255, 0.55);
  color: #69788a;
  box-shadow: none;
  font-size: 14px;
}

.view-mode-group :deep(.el-radio-button:first-child .el-radio-button__inner) {
  border-radius: 6px 0 0 6px;
}
.view-mode-group :deep(.el-radio-button:last-child .el-radio-button__inner) {
  border-radius: 0 6px 6px 0;
}
.view-mode-group :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  color: #147fe1;
  background: #fff;
  border-color: #d7e1ec;
}

/* ========== 角色 Tag 颜色 ========== */
.role-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 48px;
  height: 18px;
  padding: 0 9px;
  box-sizing: border-box;
  border-radius: 10px;
  font-size: 12px;
  line-height: 18px;
  white-space: nowrap;
}

.tag-gray   { color: #647385; background: #e9eef3; border: 1px solid #e0e7ed; }
.tag-purple { color: #9a55df; background: #f1e3ff; border: 1px solid #dfc2fa; }
.tag-cyan   { color: #0b9da2; background: #d8f7f6; border: 1px solid #b5e9e7; }
.tag-green  { color: #1d9b5a; background: #dcf8e8; border: 1px solid #b9eaca; }
.tag-blue   { color: #2579d5; background: #dceeff; border: 1px solid #bcdcff; }

/* ========== 卡片区域 ========== */
.card-scroll-container {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0 0 10px;

  &::-webkit-scrollbar { width: 5px; }
  &::-webkit-scrollbar-thumb { background: rgba(150, 165, 180, 0.35); border-radius: 5px; }
  &::-webkit-scrollbar-track { background: transparent; }
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 11px;
  width: 100%;
}

.role-card {
  position: relative;
  min-width: 0;
  height: 130px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  padding: 15px 16px 12px;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid transparent;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(50, 80, 110, 0.035);
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
  cursor: pointer;
}

.role-card:hover {
  border-color: #c7def4;
  box-shadow: 0 4px 14px rgba(35, 91, 137, 0.08);
  transform: translateY(-1px);
}

.role-card.is-active {
  border-color: #1688ef;
  box-shadow: 0 2px 8px rgba(22, 136, 239, 0.1);
}

.role-card-header {
  width: 100%;
  height: 24px;
  flex-shrink: 0;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.card-code {
  display: inline-flex;
  align-items: center;
  height: 18px;
  padding: 0 9px;
  border-radius: 9px;
  background: #f4f7fa;
  border: 1px solid #e2e9f0;
  color: #7a8999;
  font-size: 12px;
  line-height: 18px;
  white-space: nowrap;
}

.card-more-btn {
  width: 22px;
  height: 22px;
  padding: 0;
  margin: -2px -4px 0 0;
  border: none;
  outline: none;
  background: transparent;
  border-radius: 5px;
  color: #303b46;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover { background: #f1f4f7; color: #167fe0; }
  :deep(.el-icon) { font-size: 14px; }
}

.card-name {
  margin-top: 6px;
  margin-bottom: 7px;
  flex-shrink: 0;
  color: #101820;
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-desc {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  color: #536274;
  font-size: 12px;
  line-height: 16px;
  word-break: break-all;
}

.card-time {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 7px;
  color: #b1bbc6;
  font-size: 12px;
  line-height: 14px;

  :deep(.el-icon) { font-size: 14px; color: #c2cbd4; }
}

/* ========== 弹窗专属样式 ========== */
.form-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.form-row :deep(.el-form-item) {
  margin-bottom: 0;
}

.permission-tabs {
  margin-top: 22px;

  :deep(.el-tabs__header) { margin-bottom: 15px; }
  :deep(.el-tabs__item) { height: 38px; color: #69788a; font-size: 14px; }
  :deep(.el-tabs__item.is-active) { color: #087fe5; }
  :deep(.el-tabs__active-bar) { background-color: #087fe5; }
}
/* 覆盖公共表格容器的内边距，使其与搜索栏左右完美对齐 */
.admin-table-area {
  padding: 10px 0 14px !important;
}
.tree-container {
  min-height: 300px;
  max-height: 400px;
  overflow-y: auto;
  padding: 15px;
  box-sizing: border-box;
  background: #fafbfd;
  border: 1px solid #e2e8ef;
  border-radius: 7px;

  :deep(.el-tree) { background: transparent; color: #425466; font-size: 14px; }
  :deep(.el-tree-node__content) { height: 30px; }
  :deep(.el-tree-node__content:hover) { background: #f0f6fc; }
}

.empty-tip {
  padding: 50px 20px;
  color: #9aa7b5;
  text-align: center;
  font-size: 12px;
}

/* ========== 响应式 ========== */
@media screen and (max-width: 1100px) {
  .card-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}

@media screen and (max-width: 800px) {
  .card-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .admin-filter-bar .filter-row { flex-wrap: wrap; }
}

@media screen and (max-width: 600px) {
  .card-grid { grid-template-columns: 1fr; }
  .form-row { grid-template-columns: 1fr; }
}

.admin-filter-bar{
  background-color: rgba($color: #000000, $alpha: 0);
}
</style>