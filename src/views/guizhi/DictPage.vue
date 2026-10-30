<template>
  <!-- 唯一根节点 -->
  <div class="dict-root">
    <div class="dict-page-bg">
      <!-- 背景光晕层 -->
      <div class="bg-glow bg-glow-top-left"></div>
      <div class="bg-glow bg-glow-top-right"></div>
      <div class="bg-glow bg-glow-bottom-right"></div>

      <!-- 顶部 Header -->
      <div class="page-header">
        <span class="page-title">字典管理</span>
      </div>

      <!-- 主卡片 -->
      <div class="main-card">
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
            <div v-if="activeTab === 'file'" class="nav-list">
              <div
                v-for="item in fileNavList"
                :key="item.id"
                class="nav-item"
                :class="{ active: currentFileNav === item.id }"
                @click="handleFileNavClick(item.id)"
              >
                {{ item.label }}
              </div>
            </div>

            <!-- 对接部门左侧菜单（省市区三级） -->
            <div v-else class="dept-nav">
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
            <div class="table-area">
              <!-- 文件分类表格 -->
              <CommonTable
                v-if="activeTab === 'file'"
                :data="pagedData"
                :columns="fileColumns"
                :total="filteredFileData.length"
                v-model:current-page="currentPage"
                v-model:page-size="pageSize"
                :action-width="120"
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
                :data="pagedData"
                :columns="deptColumns"
                :total="filteredDeptData.length"
                v-model:current-page="currentPage"
                v-model:page-size="pageSize"
                :action-width="120"
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

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      destroy-on-close
      class="custom-dialog"
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
                v-model="item.shortName"
                placeholder="简称，如国土意见"
                class="short-input"
              />
              <el-input
                v-model="item.fullName"
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
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { CirclePlus, Remove, Plus } from '@element-plus/icons-vue'
import CommonTable from './components/CommonTable.vue'

// ================= 状态 =================
const activeTab = ref('file')
const currentPage = ref(1)
const pageSize = ref(10)

const searchForm = reactive({
  type: '',
  name: ''
})

// ================= 左侧：文件分类导航 =================
const currentFileNav = ref('all')
const fileNavList = ref([
  { id: 'all',    label: '全部阶段',   stage: '' },
  { id: 'stage1', label: '立项阶段',   stage: '立项阶段' },
  { id: 'stage2', label: '投资决策',   stage: '投资决策' },
  { id: 'stage3', label: '建设准备',   stage: '建设准备' },
  { id: 'stage4', label: '建设实施',   stage: '建设实施' },
  { id: 'stage5', label: '竣工验收',   stage: '竣工验收' },
  { id: 'stage6', label: '投产运营',   stage: '投产运营' }
])

// ================= 左侧：对接部门（省市区） =================
const deptLevel = ref('district')
const currentDeptNav = ref('d5')

const mockDeptData = {
  province: [{ id: 'p1', label: '陕西省' }],
  city: [{ id: 'c1', label: '榆林市' }],
  district: [
    { id: 'd1',  label: '榆阳区' },
    { id: 'd2',  label: '横山区' },
    { id: 'd3',  label: '神木市' },
    { id: 'd4',  label: '府谷县' },
    { id: 'd5',  label: '靖边县' },
    { id: 'd6',  label: '定边县' },
    { id: 'd7',  label: '绥德县' },
    { id: 'd8',  label: '米脂县' },
    { id: 'd9',  label: '佳县' },
    { id: 'd10', label: '吴堡县' },
    { id: 'd11', label: '清涧县' },
    { id: 'd12', label: '子洲县' }
  ]
}
const currentDeptList = computed(() => mockDeptData[deptLevel.value] || [])

// ================= 右侧表格数据 =================
const fileTableData = ref([
  { id: 1, shortName: '国土意见', fullName: '国土空间规划意见书',       stage: '立项阶段', updateTime: '2025-01-02 08:00' },
  { id: 2, shortName: '国土批复', fullName: '国土空间规划批复文件',     stage: '投资决策', updateTime: '2025-01-02 08:00' },
  { id: 3, shortName: '林草意见', fullName: '林地草地使用意见书',       stage: '立项阶段', updateTime: '2025-01-02 08:00' },
  { id: 4, shortName: '林草批复', fullName: '林地草地使用批复文件',     stage: '投资决策', updateTime: '2025-01-02 08:00' },
  { id: 5, shortName: '环保意见', fullName: '环境影响评价意见书',       stage: '立项阶段', updateTime: '2025-01-02 08:00' },
  { id: 6, shortName: '环保批复', fullName: '环境影响评价批复文件',     stage: '投资决策', updateTime: '2025-01-02 08:00' }
])

const deptTableData = ref([
  { id: 1,  deptName: '靖边县武装部',             districtId: 'd5', updateTime: '2025-01-02 08:00' },
  { id: 2,  deptName: '靖边县资源规划局',         districtId: 'd5', updateTime: '2025-01-02 08:00' },
  { id: 3,  deptName: '榆阳市生态环境局靖边分局', districtId: 'd5', updateTime: '2025-01-02 08:00' },
  { id: 4,  deptName: '榆阳区武装部',             districtId: 'd1', updateTime: '2025-01-02 08:00' },
  { id: 5,  deptName: '榆阳区资源规划局',         districtId: 'd1', updateTime: '2025-01-02 08:00' },
  { id: 6,  deptName: '神木市武装部',             districtId: 'd3', updateTime: '2025-01-02 08:00' },
  { id: 7,  deptName: '神木市生态环境局',         districtId: 'd3', updateTime: '2025-01-02 08:00' },
  { id: 8,  deptName: '横山区资源规划局',         districtId: 'd2', updateTime: '2025-01-02 08:00' },
  { id: 9,  deptName: '府谷县武装部',             districtId: 'd4', updateTime: '2025-01-02 08:00' },
  { id: 10, deptName: '定边县资源规划局',         districtId: 'd6', updateTime: '2025-01-02 08:00' }
])

// ================= 表格列配置 =================
const fileColumns = [
  { prop: 'shortName',  label: '类型简称', minWidth: 120 },
  { prop: 'fullName',   label: '类型全称', minWidth: 200 },
  { prop: 'stage',      label: '适用阶段', minWidth: 120 },
  { prop: 'updateTime', label: '更新日期', minWidth: 160 }
]

const deptColumns = [
  { prop: 'deptName',   label: '部门名称', minWidth: 250 },
  { prop: 'updateTime', label: '更新日期', minWidth: 160 }
]

// ================= 筛选：文件分类 =================
const filteredFileData = computed(() => {
  const nav = fileNavList.value.find((n) => n.id === currentFileNav.value)
  const stageFilter = nav ? nav.stage : ''

  const keyword = (searchForm.name || '').trim().toLowerCase()
  const typeFilter = searchForm.type

  return fileTableData.value.filter((row) => {
    if (stageFilter && row.stage !== stageFilter) return false

    if (typeFilter) {
      const isOpinion = row.shortName.includes('意见')
      const isReply = row.shortName.includes('批复')
      if (typeFilter === '1' && !isOpinion) return false
      if (typeFilter === '2' && !isReply) return false
    }

    if (keyword) {
      const matchShort = row.shortName.toLowerCase().includes(keyword)
      const matchFull = row.fullName.toLowerCase().includes(keyword)
      if (!matchShort && !matchFull) return false
    }

    return true
  })
})

// ================= 筛选：对接部门 =================
const filteredDeptData = computed(() => {
  // 省 / 市 层级只有单一节点，直接显示全部；区层级按 districtId 过滤
  const isDistrict = deptLevel.value === 'district'
  const keyword = (searchForm.name || '').trim().toLowerCase()

  return deptTableData.value.filter((row) => {
    if (isDistrict && currentDeptNav.value && row.districtId !== currentDeptNav.value) {
      return false
    }

    if (keyword && !row.deptName.toLowerCase().includes(keyword)) return false

    return true
  })
})

// ================= 当前 Tab 的分页切片 =================
const currentFiltered = computed(() =>
  activeTab.value === 'file' ? filteredFileData.value : filteredDeptData.value
)

const pagedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return currentFiltered.value.slice(start, start + pageSize.value)
})

// ================= 左侧导航交互 =================
const handleFileNavClick = (id) => {
  currentFileNav.value = id
  currentPage.value = 1
}

const handleDeptLevelChange = (level) => {
  deptLevel.value = level
  const list = mockDeptData[level] || []
  currentDeptNav.value = list.length ? list[0].id : ''
  currentPage.value = 1
}

const handleDeptNavClick = (id) => {
  currentDeptNav.value = id
  currentPage.value = 1
}

// ================= Tab 切换 =================
const handleTabChange = () => {
  handleReset()
  currentPage.value = 1

  if (activeTab.value === 'file') {
    currentFileNav.value = 'all'
  } else {
    deptLevel.value = 'district'
    currentDeptNav.value = 'd5'
  }
}

// ================= 搜索 / 重置 =================
const handleSearch = () => {
  currentPage.value = 1
  ElMessage.success(`搜索完成，共 ${currentFiltered.value.length} 条`)
}

const handleReset = () => {
  searchForm.type = ''
  searchForm.name = ''
  currentPage.value = 1
}

const handleMock = (type) => {
  ElMessage.info(`模拟${type}操作`)
}

// ================= 弹窗 / 表单 =================
const dialogVisible = ref(false)
const saveLoading = ref(false)
const formRef = ref(null)
const editingId = ref(null)

const formData = reactive({
  fileItems: [{ shortName: '', fullName: '' }],
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

// ================= 动态行 =================
const addFileRow = () => {
  formData.fileItems.push({ shortName: '', fullName: '' })
}

const removeFileRow = (index) => {
  if (formData.fileItems.length > 1) {
    formData.fileItems.splice(index, 1)
  }
}

// ================= 新增 =================
const handleAdd = () => {
  editingId.value = null
  formData.fileItems = [{ shortName: '', fullName: '' }]
  formData.stages = []
  formData.deptName = ''
  dialogVisible.value = true
}

// ================= 编辑 =================
const handleEdit = (row) => {
  editingId.value = row.id

  if (activeTab.value === 'file') {
    formData.fileItems = [{ shortName: row.shortName, fullName: row.fullName }]
    formData.stages = row.stage ? row.stage.split('、') : []
  } else {
    formData.deptName = row.deptName
  }

  dialogVisible.value = true
}

// ================= 时间格式化 =================
const formatNow = () => {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// ================= 保存 =================
const handleSave = () => {
  formRef.value.validate((valid) => {
    if (!valid) return

    if (activeTab.value === 'file') {
      const hasEmpty = formData.fileItems.some((it) => !it.shortName || !it.fullName)
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
      const now = formatNow()

      if (activeTab.value === 'file') {
        const stageText = formData.stages.join('、')
        const first = formData.fileItems[0]

        if (editingId.value) {
          const idx = fileTableData.value.findIndex((r) => r.id === editingId.value)
          if (idx > -1) {
            fileTableData.value[idx] = {
              ...fileTableData.value[idx],
              shortName: first.shortName,
              fullName: first.fullName,
              stage: stageText,
              updateTime: now
            }
          }
        } else {
          const startId = Date.now()
          const newRows = formData.fileItems.map((it, i) => ({
            id: startId + i,
            shortName: it.shortName,
            fullName: it.fullName,
            stage: stageText,
            updateTime: now
          }))
          fileTableData.value.unshift(...newRows)
          currentPage.value = 1
        }
      } else {
        if (editingId.value) {
          const idx = deptTableData.value.findIndex((r) => r.id === editingId.value)
          if (idx > -1) {
            deptTableData.value[idx] = {
              ...deptTableData.value[idx],
              deptName: formData.deptName,
              updateTime: now
            }
          }
        } else {
          deptTableData.value.unshift({
            id: Date.now(),
            deptName: formData.deptName,
            districtId: deptLevel.value === 'district' ? currentDeptNav.value : '',
            updateTime: now
          })
          currentPage.value = 1
        }
      }

      dialogVisible.value = false
      ElMessage.success(editingId.value ? '编辑成功' : '保存成功')
    }, 400)
  })
}

// ================= 删除 =================
const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除这条数据吗？', '提示', {
    type: 'warning',
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    customClass: 'custom-message-box'
  })
    .then(() => {
      if (activeTab.value === 'file') {
        const idx = fileTableData.value.findIndex((r) => r.id === row.id)
        if (idx > -1) fileTableData.value.splice(idx, 1)
      } else {
        const idx = deptTableData.value.findIndex((r) => r.id === row.id)
        if (idx > -1) deptTableData.value.splice(idx, 1)
      }

      const maxPage = Math.max(1, Math.ceil(currentFiltered.value.length / pageSize.value))
      if (currentPage.value > maxPage) currentPage.value = maxPage

      ElMessage.success('删除成功')
    })
    .catch(() => {})
}
</script>

<style scoped lang="scss">
/* =========================================================
   页面整体
========================================================= */
.dict-root {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.dict-page-bg {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: linear-gradient(122deg, #eef3fa 0%, #f7f8fc 48%, #eaf2fb 100%);
}

/* =========================================================
   背景光晕（沿用组件1）
========================================================= */
.bg-glow {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  z-index: 0;
}

.bg-glow-top-left {
  left: -80px;
  top: -140px;
  width: 430px;
  height: 430px;
  background: radial-gradient(circle, rgba(255, 205, 220, 0.45) 0%, rgba(255, 205, 220, 0) 70%);
  filter: blur(45px);
}

.bg-glow-top-right {
  right: 60px;
  top: -160px;
  width: 420px;
  height: 420px;
  background: radial-gradient(circle, rgba(184, 219, 255, 0.45) 0%, rgba(184, 219, 255, 0) 70%);
  filter: blur(50px);
}

.bg-glow-bottom-right {
  right: -100px;
  bottom: -180px;
  width: 560px;
  height: 560px;
  background: radial-gradient(circle, rgba(172, 216, 255, 0.4) 0%, rgba(172, 216, 255, 0) 70%);
  filter: blur(55px);
}

/* =========================================================
   顶部 Header
========================================================= */
.page-header {
  position: relative;
  z-index: 2;
  height: 48px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  padding: 0 16px;
  box-sizing: border-box;
  border-bottom: 1px solid rgba(218, 226, 236, 0.9);
  background: rgba(255, 255, 255, 0.18);
}

.page-title {
  font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #152536;
}

/* =========================================================
   主卡片
========================================================= */
.main-card {
  position: relative;
  z-index: 2;
  flex: 1 1 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  margin: 10px 16px 14px;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid #e1e7ef;
  border-radius: 6px;
  box-shadow: 0 3px 12px rgba(34, 57, 86, 0.035);
  overflow: hidden;
}

/* =========================================================
   卡片头部：Tabs + 操作按钮
========================================================= */
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

/* Tabs */
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
}

.btn-ghost:hover {
  color: #087fe5;
  border-color: #b9d4ed;
  background: #fff;
}

.btn-add {
  border: none !important;
  background: #0783eb !important;
  color: #fff !important;
  box-shadow: 0 4px 10px rgba(2, 120, 231, 0.18);
}

.btn-add:hover {
  background: #0675d4 !important;
}

.mr-1 {
  margin-right: 4px;
}

/* =========================================================
   左右分栏
========================================================= */
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
}

.nav-list::-webkit-scrollbar {
  width: 5px;
}

.nav-list::-webkit-scrollbar-thumb {
  background: rgba(150, 165, 180, 0.35);
  border-radius: 5px;
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

    &:hover {
      background: #e6eef8;
    }

    &.active {
      background: #087fe5;
      color: #fff;
      font-weight: 500;
    }
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

/* =========================================================
   右侧内容
========================================================= */
.right-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

/* 搜索栏 */
.filter-bar {
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.72);
  border-bottom: 1px solid #e8edf3;
}

.filter-row {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 10px 14px;
  box-sizing: border-box;
  flex-wrap: wrap;
}

.filter-select {
  width: 140px;
}

.filter-input {
  width: 200px;
}

/* 控件统一高度 */
.filter-row :deep(.el-input),
.filter-row :deep(.el-select) {
  --el-input-height: 26px;
}

.filter-row :deep(.el-input__wrapper),
.filter-row :deep(.el-select__wrapper) {
  min-height: 26px;
  height: 26px;
  padding: 0 9px;
  box-sizing: border-box;
  background: rgba(255, 255, 255, 0.92);
  border-radius: 6px;
  box-shadow: 0 0 0 1px #dfe6ee inset;
}

.filter-row :deep(.el-input__wrapper:hover),
.filter-row :deep(.el-select__wrapper:hover) {
  box-shadow: 0 0 0 1px #cbd7e5 inset;
}

.filter-row :deep(.el-input__wrapper.is-focus),
.filter-row :deep(.el-select__wrapper.is-focused) {
  box-shadow: 0 0 0 1px #1686e9 inset;
}

.filter-row :deep(.el-input__inner),
.filter-row :deep(.el-select__placeholder),
.filter-row :deep(.el-select__selected-item) {
  font-size: 14px;
  color: #536274;
}

.filter-row :deep(.el-input__inner::placeholder) {
  font-size: 12px;
  color: #8190a2;
}

.filter-buttons {
  display: flex;
  align-items: center;
  gap: 7px;
}

.btn-reset,
.btn-search {
  height: 26px;
  padding: 0 14px;
  border-radius: 6px;
  font-size: 14px;
  line-height: 26px;
}

.btn-reset {
  color: #657487;
  background: rgba(255, 255, 255, 0.55);
  border: 1px solid #dfe6ee;
}

.btn-reset:hover {
  color: #167ddd;
  border-color: #b9d4ed;
  background: #fff;
}

.btn-search {
  background: #087fe5 !important;
  border-color: #087fe5 !important;
  color: #fff !important;
  box-shadow: 0 3px 8px rgba(8, 127, 229, 0.15);
}

.btn-search:hover {
  background: #0874d0 !important;
  border-color: #0874d0 !important;
}

/* =========================================================
   表格区域容器
========================================================= */
.table-area {
  flex: 1 1 0;
  min-height: 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  padding: 10px 14px 14px;
  box-sizing: border-box;
  overflow: hidden;
}

/* 表格操作按钮 */
.operation-btn-item {
  margin: 0 !important;
  padding: 0 !important;
  height: auto;
  font-size: 14px;
  color: #718092 !important;
}

.operation-btn-item:hover {
  color: #187ed9 !important;
}

.operation-btn-item.is-danger {
  color: #f15e64 !important;
}

.operation-btn-item.is-danger:hover {
  color: #e9474e !important;
}

/* =========================================================
   弹窗
========================================================= */
.custom-dialog {
  :deep(.el-dialog) {
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 12px 40px rgba(30, 55, 80, 0.16);
  }

  :deep(.el-dialog__header) {
    height: 54px;
    margin-right: 0;
    padding: 0 22px;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    border-bottom: 1px solid #e7ecf2;
  }

  :deep(.el-dialog__title) {
    color: #172536;
    font-size: 14px;
    font-weight: 600;
  }

  :deep(.el-dialog__headerbtn) {
    top: 0;
    right: 15px;
    height: 54px;
  }

  :deep(.el-dialog__body) {
    padding: 22px;
  }

  :deep(.el-dialog__footer) {
    padding: 13px 22px;
    border-top: 1px solid #e7ecf2;
  }

  :deep(.el-form-item__label) {
    color: #536274;
    font-size: 14px;
  }

  :deep(.el-input__wrapper) {
    height: 34px;
    border-radius: 6px;
    box-shadow: 0 0 0 1px #dfe6ee inset;
  }

  :deep(.el-input__inner) {
    font-size: 14px;
  }

  :deep(.el-input__inner::placeholder) {
    font-size: 12px;
    color: #8190a2;
  }
}

/* 动态行 */
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

  &:hover {
    color: #0675d4;
  }
}

.action-icon.remove {
  color: #f15e64;

  &:hover {
    color: #e9474e;
  }
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

/* 弹窗按钮 */
.dialog-cancel-btn,
.dialog-save-btn {
  height: 34px;
  padding: 0 18px;
  border-radius: 6px;
  font-size: 14px;
}

.dialog-cancel-btn {
  color: #657487;
  border-color: #dfe6ee;
  background: #fff;
}

.dialog-cancel-btn:hover {
  color: #087fe5;
  border-color: #bcd7ee;
}

.dialog-save-btn {
  background: #087fe5 !important;
  border-color: #087fe5 !important;
}

.dialog-save-btn:hover {
  background: #0874d0 !important;
  border-color: #0874d0 !important;
}

/* MessageBox */
:deep(.custom-message-box) {
  border-radius: 8px;
}

/* =========================================================
   响应式
========================================================= */
@media screen and (max-width: 1100px) {
  .left-nav {
    width: 170px;
  }
}

@media screen and (max-width: 800px) {
  .filter-row {
    flex-wrap: wrap;
  }

  .filter-select,
  .filter-input {
    flex: 1 1 130px;
    min-width: 120px;
    width: auto;
  }

  .left-nav {
    width: 150px;
  }

  .dict-tabs :deep(.el-tabs__item) {
    padding: 0 10px;
  }
}

@media screen and (max-width: 600px) {
  .content-body {
    flex-direction: column;
  }

  .left-nav {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid #e8edf3;
    max-height: 180px;
  }

  .card-header {
    padding: 0 10px;
  }

  .btn-ghost {
    display: none;
  }
}
</style>