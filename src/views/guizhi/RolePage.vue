<template>
  <div class="page-container">
    <!-- 顶部标题 & 操作栏 -->
    <div class="page-header">
      <div class="title-area">
        <h2 class="page-title">角色管理</h2>
      </div>
      <div class="action-area">
        <!-- 视图切换 (列表/卡片) -->
        <el-radio-group v-model="viewMode" style="margin-right: 16px">
          <el-radio-button label="table">
            <el-icon><List /></el-icon>
          </el-radio-button>
          <el-radio-button label="card">
            <el-icon><Grid /></el-icon>
          </el-radio-button>
        </el-radio-group>
        <el-button type="primary" @click="handleAdd">添加角色</el-button>
      </div>
    </div>

    <!-- 搜索栏 -->
    <div class="search-bar">
      <span class="label">创建时间</span>
      <el-date-picker
        v-model="searchForm.dateRange"
        type="daterange"
        range-separator="~"
        start-placeholder="开始时间"
        end-placeholder="结束时间"
        value-format="YYYY-MM-DD"
        style="width: 260px; margin-right: 16px"
      />
      <el-input
        v-model="searchForm.name"
        placeholder="角色名称"
        clearable
        style="width: 200px; margin-right: 16px"
      />
      <el-button type="primary" @click="handleSearch">搜索</el-button>
      <el-button @click="handleReset">重置</el-button>
    </div>

    <!-- 表格视图 -->
    <div v-if="viewMode === 'table'" class="content-card">
      <el-table :data="tableData" style="width: 100%" header-cell-class-name="table-header">
        <el-table-column prop="code" label="角色ID" min-width="120" />
        <el-table-column prop="name" label="角色名称" min-width="150" />
        <el-table-column prop="desc" label="角色描述" min-width="300" show-overflow-tooltip />
        <el-table-column prop="createTime" label="创建时间" min-width="160" />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页占位 (按需接入你的分页组件) -->
      <div class="pagination-wrap">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
        />
      </div>
    </div>

    <!-- 卡片视图 -->
    <div v-else class="card-grid">
      <div v-for="item in tableData" :key="item.id" class="role-card">
        <div class="card-code">编码：{{ item.code }}</div>
        <div class="card-name">{{ item.name }}</div>
        <div class="card-desc">{{ item.desc }}</div>
        <div class="card-actions">
          <el-button link type="primary" @click="handleEdit(item)">编辑</el-button>
          <el-button link type="danger" @click="handleDelete(item)">删除</el-button>
        </div>
      </div>
    </div>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑角色' : '新增角色'"
      width="800px"
      destroy-on-close
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
            <div style="padding: 20px; color: #999;">数据权限配置区域（待开发）</div>
          </el-tab-pane>
        </el-tabs>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave" :loading="saveLoading">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { List, Grid } from '@element-plus/icons-vue'

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
  menuKeys: [] // 选中的菜单节点 ID
})

const rules = {
  name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }]
}

// 菜单权限树假数据（模拟图2）
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
  // 实际接入时在这里调用接口，带上 searchForm 参数
}

const handleReset = () => {
  searchForm.dateRange = []
  searchForm.name = ''
  handleSearch()
}

// 打开新增
const handleAdd = () => {
  isEdit.value = false
  formData.id = ''
  formData.code = 'JS' + Math.floor(Math.random() * 100000000) // 模拟生成
  formData.name = ''
  formData.desc = ''
  formData.menuKeys = []
  dialogVisible.value = true
}

// 打开编辑
const handleEdit = (row) => {
  isEdit.value = true
  formData.id = row.id
  formData.code = row.code
  formData.name = row.name
  formData.desc = row.desc
  formData.menuKeys = ['q1', 'y1'] // 模拟回显部分权限
  dialogVisible.value = true
}

// 保存
const handleSave = () => {
  formRef.value.validate((valid) => {
    if (!valid) return

    // 获取树形选中的节点（包含半选节点，视具体业务而定）
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

// 删除
const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除角色 "${row.name}" 吗？`, '提示', {
    type: 'warning'
  }).then(() => {
    ElMessage.success('删除成功')
  }).catch(() => {})
}

onMounted(() => {
  // 初始化请求数据
})
</script>

<style scoped>
.page-container {
  padding: 24px;
  background-color: #fff;
  min-height: 100%;
  box-sizing: border-box;
}

/* 顶部 Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
.page-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
}
.action-area {
  display: flex;
  align-items: center;
}

/* 搜索栏 */
.search-bar {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  font-size: 14px;
}
.search-bar .label {
  margin-right: 12px;
  color: #606266;
}

/* 表格区域 */
.content-card {
  background: #fff;
  border-radius: 8px;
}
:deep(.table-header) {
  background-color: #f8fafc !important;
  color: #333;
  font-weight: 500;
}
.pagination-wrap {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 卡片视图 */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}
.role-card {
  background: #fafafa;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  transition: all 0.3s;
}
.role-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}
.card-code {
  font-size: 12px;
  color: #999;
  margin-bottom: 8px;
}
.card-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}
.card-desc {
  font-size: 13px;
  color: #666;
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
}

/* 弹窗内表单 */
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 16px;
}
.permission-tabs {
  margin-top: 10px;
}
.tree-container {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 16px;
  min-height: 300px;
  max-height: 400px;
  overflow-y: auto;
  background: #fafafa;
}
</style>