<template>
  <div class="page-container">
    <!-- 顶部标题 & 操作栏 -->
    <div class="page-header">
      <h2 class="page-title">字典管理</h2>
      <div class="action-area">
        <!-- 仅在对接部门时显示导入导出 -->
        <template v-if="activeTab === 'dept'">
          <el-button plain @click="handleMock('导出')">导出数据</el-button>
          <el-button plain @click="handleMock('导入')">导入数据</el-button>
        </template>
        <el-button type="primary" @click="handleAdd">
          {{ activeTab === 'file' ? '添加数据' : '添加对接部门' }}
        </el-button>
      </div>
    </div>

    <!-- Tabs 切换 -->
    <el-tabs v-model="activeTab" class="dict-tabs" @tab-change="handleTabChange">
      <el-tab-pane label="支持性文件分类" name="file" />
      <el-tab-pane label="支持文件对接部门" name="dept" />
    </el-tabs>

    <!-- 主体内容：左右分栏 -->
    <div class="dict-body">
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
          <div class="nav-list" style="margin-top: 10px;">
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

      <!-- 右侧表格区 -->
      <div class="right-content">
        <!-- 搜索栏 -->
        <div class="search-bar">
          <el-select v-model="searchForm.type" placeholder="类型" clearable style="width: 140px; margin-right: 12px">
            <el-option label="意见" value="1" />
            <el-option label="批复" value="2" />
          </el-select>
          <el-input v-model="searchForm.name" placeholder="请输入名称" clearable style="width: 200px; margin-right: 12px" />
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </div>

        <!-- 表格展示区 -->
        <div class="table-container">
          <!-- 文件分类表格 -->
          <el-table v-if="activeTab === 'file'" :data="fileTableData" style="width: 100%" header-cell-class-name="table-header">
            <el-table-column prop="shortName" label="类型简称" min-width="120" />
            <el-table-column prop="fullName" label="类型全称" min-width="200" />
            <el-table-column prop="stage" label="适用阶段" min-width="120" />
            <el-table-column prop="updateTime" label="更新日期" min-width="160" />
            <el-table-column label="操作" width="120" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
                <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- 对接部门表格 -->
          <el-table v-else :data="deptTableData" style="width: 100%" header-cell-class-name="table-header">
            <el-table-column prop="deptName" label="部门名称" min-width="250" />
            <el-table-column prop="updateTime" label="更新日期" min-width="160" />
            <el-table-column label="操作" width="120" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
                <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
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
          />
        </div>
      </div>
    </div>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="activeTab === 'file' ? '添加文件分类' : '添加对接部门'"
      width="600px"
      destroy-on-close
    >
      <el-form :model="formData" :rules="rules" ref="formRef" label-width="100px">
        <!-- 文件分类表单 (动态增减) -->
        <template v-if="activeTab === 'file'">
          <div 
            v-for="(item, index) in formData.fileItems" 
            :key="index"
            class="dynamic-row"
            style="margin-bottom: 16px;"
          >
            <span class="required-star">*</span>
            <span class="row-label">类型名称</span>
            <div class="row-inputs">
              <el-input v-model="item.shortName" placeholder="简称，如国土意见" style="width: 180px; margin-right: 8px" />
              <el-input v-model="item.fullName" placeholder="全称，如国土意见" style="width: 180px" />
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

          <el-form-item label="适用阶段" required>
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
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave" :loading="saveLoading">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { CirclePlus, Remove } from '@element-plus/icons-vue'

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
const deptLevel = ref('district') // 默认选中区
const currentDeptNav = ref('d1')
const mockDeptData = {
  province: [
    { id: 'p1', label: '陕西省' }
  ],
  city: [
    { id: 'c1', label: '榆林市' }
  ],
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
  { id: 6, shortName: '环保批复', fullName: 'XXXXXXXXXXXXXXXXXXXX', stage: '投资决策', updateTime: '2025-01-02 08:00' },
  { id: 7, shortName: '水保意见', fullName: 'XXXXXXXXXXXXXXXXXXXX', stage: '立项阶段', updateTime: '2025-01-02 08:00' },
  { id: 8, shortName: '水保批复', fullName: 'XXXXXXXXXXXXXXXXXXXX', stage: '投资决策', updateTime: '2025-01-02 08:00' }
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
  fileItems: [
    { shortName: '', fullName: '' }
  ],
  stages: [],
  deptName: ''
})

const rules = {
  deptName: [{ required: true, message: '请输入部门名称', trigger: 'blur' }]
}

// ================= 交互逻辑 =================
const handleTabChange = () => {
  // 切换 Tab 时重置搜索和左侧选中
  handleReset()
  if (activeTab.value === 'file') {
    currentFileNav.value = 'all'
  } else {
    currentDeptNav.value = 'd5' // 默认选中靖边县
  }
}

const handleSearch = () => {
  ElMessage.success('触发搜索（模拟）')
}

const handleReset = () => {
  searchForm.type = ''
  searchForm.name = ''
}

const handleMock = (type) => {
  ElMessage.info(`模拟${type}操作`)
}

// 动态增减行逻辑
const addFileRow = () => {
  formData.fileItems.push({ shortName: '', fullName: '' })
}
const removeFileRow = (index) => {
  if (formData.fileItems.length > 1) {
    formData.fileItems.splice(index, 1)
  }
}

// 打开新增弹窗
const handleAdd = () => {
  formData.fileItems = [{ shortName: '', fullName: '' }]
  formData.stages = []
  formData.deptName = ''
  dialogVisible.value = true
}

// 打开编辑弹窗
const handleEdit = (row) => {
  if (activeTab.value === 'file') {
    formData.fileItems = [{ shortName: row.shortName, fullName: row.fullName }]
    formData.stages = [row.stage]
  } else {
    formData.deptName = row.deptName
  }
  dialogVisible.value = true
}

// 保存
const handleSave = () => {
  formRef.value.validate((valid) => {
    if (!valid) return
    
    // 简单校验文件分类必填项
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
    type: 'warning'
  }).then(() => {
    ElMessage.success('删除成功')
  }).catch(() => {})
}
</script>

<style scoped>
.page-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 24px;
  box-sizing: border-box;
}

/* 顶部 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.page-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
}
.action-area {
  display: flex;
  gap: 10px;
}

/* Tabs 样式微调 */
.dict-tabs {
  margin-bottom: 16px;
}
:deep(.el-tabs__nav-wrap::after) {
  height: 1px;
  background-color: #ebeef5;
}

/* 主体左右布局 */
.dict-body {
  display: flex;
  flex: 1;
  gap: 20px;
  min-height: 0; /* 防止 flex 子项溢出 */
}

/* 左侧导航 */
.left-nav {
  width: 160px;
  background: #f9f9f9;
  border-radius: 8px;
  padding: 10px 0;
  display: flex;
  flex-direction: column;
}
.nav-list {
  flex: 1;
  overflow-y: auto;
}
.nav-item {
  padding: 12px 20px;
  font-size: 14px;
  color: #606266;
  cursor: pointer;
  transition: all 0.2s;
}
.nav-item:hover {
  color: #409EFF;
}
.nav-item.active {
  color: #409EFF;
  background: #e6f1fc;
  font-weight: 600;
}
/* 省市区的 Tabs */
.level-tabs {
  display: flex;
  padding: 0 10px;
  gap: 4px;
}
.level-tab {
  flex: 1;
  text-align: center;
  padding: 6px 0;
  font-size: 13px;
  color: #606266;
  background: #fff;
  border-radius: 4px;
  cursor: pointer;
}
.level-tab.active {
  background: #409EFF;
  color: #fff;
}

/* 右侧内容 */
.right-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.search-bar {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}
.table-container {
  flex: 1;
  overflow: hidden;
}
:deep(.table-header) {
  background-color: #f8fafc !important;
  color: #333;
  font-weight: 500;
}
.pagination-wrap {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

/* 弹窗动态表单行 */
.dynamic-row {
  display: flex;
  align-items: center;
}
.required-star {
  color: #f56c6c;
  margin-right: 4px;
}
.row-label {
  width: 70px;
  font-size: 14px;
  color: #606266;
  text-align: right;
  margin-right: 12px;
}
.row-inputs {
  display: flex;
  align-items: center;
  flex: 1;
}
.row-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 12px;
}
.action-icon {
  font-size: 20px;
  cursor: pointer;
}
.action-icon.add {
  color: #409EFF;
}
.action-icon.remove {
  color: #f56c6c;
}
.action-icon.disabled {
  color: #c0c4cc;
  cursor: not-allowed;
}
</style>