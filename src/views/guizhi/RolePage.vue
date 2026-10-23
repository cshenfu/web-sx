<template>
  <div class="role-manage-root">
    <div class="role-manage-page-bg">

      <!-- 背景光晕 -->
      <div class="bg-glow bg-glow-top-left"></div>
      <div class="bg-glow bg-glow-top-right"></div>
      <div class="bg-glow bg-glow-bottom-right"></div>

      <!-- 顶部 Header -->
      <div class="page-header">
        <span class="page-title">角色管理</span>

        <el-button
          type="primary"
          class="btn-add"
          @click="handleAdd"
        >
          <el-icon>
            <Plus />
          </el-icon>
          <span>添加角色</span>
        </el-button>
      </div>

      <!-- 页面主体 -->
      <div class="main-content">

        <!-- 搜索区域 -->
        <div class="toolbar">

          <div class="filter-row">

            <!-- 日期 -->
            <el-date-picker
              v-model="searchForm.dateRange"
              type="daterange"
              range-separator="~"
              start-placeholder="创建时间"
              end-placeholder="结束时间"
              value-format="YYYY-MM-DD"
              class="filter-date"
              prefix-icon="Calendar"
            />

            <!-- 搜索 -->
            <el-input
              v-model="searchForm.name"
              placeholder="编号/名称"
              clearable
              class="filter-input"
              @keyup.enter="handleSearch"
            >
              <template #prefix>
                <el-icon>
                  <Search />
                </el-icon>
              </template>
            </el-input>

            <!-- 操作按钮 -->
            <div class="filter-buttons">
              <el-button
                class="btn-reset"
                @click="handleReset"
              >
                重置
              </el-button>

              <el-button
                type="primary"
                class="btn-search"
                @click="handleSearch"
              >
                搜索
              </el-button>
            </div>
          </div>

          <!-- 视图切换 -->
          <div class="view-mode-wrapper">
            <el-radio-group
              v-model="viewMode"
              class="view-mode-group"
            >
              <el-radio-button label="table">
                <el-icon>
                  <List />
                </el-icon>
                <span>列表</span>
              </el-radio-button>

              <el-radio-button label="card">
                <el-icon>
                  <Grid />
                </el-icon>
                <span>卡片</span>
              </el-radio-button>
            </el-radio-group>
          </div>

        </div>

        <!-- ================= 列表模式 ================= -->
        <template v-if="viewMode === 'table'">

          <div class="table-container">

            <el-table
              :data="pagedTableData"
              style="width: 100%"
              height="100%"
              header-cell-class-name="table-header"
              :border="false"
            >

              <el-table-column
                prop="code"
                label="角色ID"
                min-width="130"
              />

              <!-- 角色名称 -->
              <el-table-column
                label="角色名称"
                min-width="130"
              >
                <template #default="{ row, $index }">
                  <span
                    class="role-tag"
                    :class="getRoleTagClass($index, row.name)"
                  >
                    {{ row.name }}
                  </span>
                </template>
              </el-table-column>

              <!-- 描述 -->
              <el-table-column
                prop="desc"
                label="角色描述"
                min-width="300"
                show-overflow-tooltip
              />

              <!-- 创建时间 -->
              <el-table-column
                prop="createTime"
                label="创建时间"
                min-width="180"
              />

              <!-- 操作 -->
              <el-table-column
                label="操作"
                width="100"
                fixed="right"
              >
                <template #default="{ row }">

                  <div class="table-actions">

                    <el-button
                      link
                      class="operation-btn-item"
                      @click="handleEdit(row)"
                    >
                      编辑
                    </el-button>

                    <el-button
                      link
                      class="operation-btn-item is-danger"
                      @click="handleDelete(row)"
                    >
                      删除
                    </el-button>

                  </div>

                </template>
              </el-table-column>

            </el-table>

          </div>

          <!-- 分页 -->
          <div class="pagination-wrap">

            <div class="pagination-total">
              共 {{ total }} 条
            </div>

            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :total="total"
              layout="prev, pager, next"
              :pager-count="5"
              background
            />

            <span class="page-size-text">
              {{ pageSize }} 条/页
            </span>

          </div>

        </template>

        <!-- ================= 卡片模式 ================= -->
        <div
          v-else
          class="card-scroll-container"
        >

          <div class="card-grid">

            <div
              v-for="(item, index) in tableData"
              :key="item.id"
              class="role-card"
              :class="{ 'is-active': index === 1 }"
            >

              <!-- 卡片顶部 -->
              <div class="role-card-header">

                <span class="card-code">
                  角色ID：{{ item.code }}
                </span>

                <el-dropdown
                  trigger="click"
                  placement="bottom-end"
                >

                  <button
                    class="card-more-btn"
                    type="button"
                  >
                    <el-icon>
                      <MoreFilled />
                    </el-icon>
                  </button>

                  <template #dropdown>

                    <el-dropdown-menu>

                      <el-dropdown-item
                        @click="handleEdit(item)"
                      >
                        <el-icon>
                          <Edit />
                        </el-icon>
                        编辑
                      </el-dropdown-item>

                      <el-dropdown-item
                        class="delete-dropdown-item"
                        @click="handleDelete(item)"
                      >
                        <el-icon>
                          <Delete />
                        </el-icon>
                        删除
                      </el-dropdown-item>

                    </el-dropdown-menu>

                  </template>

                </el-dropdown>

              </div>

              <!-- 角色名称 -->
              <div class="card-name">
                {{ item.name }}
              </div>

              <!-- 角色描述 -->
              <div class="card-desc">
                {{ item.desc }}
              </div>

              <!-- 创建时间 -->
              <div class="card-time">

                <el-icon>
                  <Clock />
                </el-icon>

                <span>
                  {{ item.createTime }}
                </span>

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
      class="custom-dialog"
    >

      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="100px"
      >

        <!-- 基础信息 -->
        <div class="form-row">

          <el-form-item label="角色ID">
            <el-input
              v-model="formData.code"
              disabled
              placeholder="系统自动生成"
            />
          </el-form-item>

          <el-form-item
            label="角色名称"
            prop="name"
          >
            <el-input
              v-model="formData.name"
              placeholder="请输入，最多20个字"
              maxlength="20"
            />
          </el-form-item>

          <el-form-item
            label="角色描述"
            prop="desc"
          >
            <el-input
              v-model="formData.desc"
              placeholder="请输入，最多50个字"
              maxlength="50"
            />
          </el-form-item>

        </div>

        <!-- 权限配置 -->
        <el-tabs
          v-model="activeTab"
          class="permission-tabs"
        >

          <el-tab-pane
            label="菜单权限"
            name="menu"
          >

            <div class="tree-container">

              <el-tree
                ref="treeRef"
                :data="menuTreeData"
                show-checkbox
                node-key="id"
                default-expand-all
                :default-checked-keys="formData.menuKeys"
                :props="{
                  label: 'label',
                  children: 'children'
                }"
              />

            </div>

          </el-tab-pane>

          <el-tab-pane
            label="数据权限"
            name="data"
          >
            <div class="empty-tip">
              数据权限配置区域（待开发）
            </div>
          </el-tab-pane>

        </el-tabs>

      </el-form>

      <!-- Footer -->
      <template #footer>

        <el-button
          class="dialog-cancel-btn"
          @click="dialogVisible = false"
        >
          取消
        </el-button>

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
import { ref, reactive, onMounted,computed } from 'vue'
import {
  ElMessage,
  ElMessageBox
} from 'element-plus'

import {
  List,
  Grid,
  Plus,
  Calendar,
  Search,
  MoreFilled,
  Edit,
  Delete,
  Clock
} from '@element-plus/icons-vue'


// ================= 数据定义 =================

const viewMode = ref('table')

const currentPage = ref(1)

const pageSize = ref(10)

const total = ref(20)


const searchForm = reactive({
  dateRange: [],
  name: ''
})


// ================= 表格假数据 =================

const tableData = ref([
  {
    id: 1,
    code: 'JS09876456',
    name: '成员',
    desc: '可查看系统基础信息及授权范围内的业务数据，支持日常业务操作。',
    createTime: '2025-06-09 09:00:00'
  },
  {
    id: 2,
    code: 'JS09876457',
    name: '项目经理',
    desc: '负责项目整体管理与进度跟踪，可查看项目数据并协调相关业务工作。',
    createTime: '2025-06-09 09:00:00'
  },
  {
    id: 3,
    code: 'JS09876458',
    name: '数据管理',
    desc: '负责业务数据维护、数据质量检查及相关数据资源的日常管理。',
    createTime: '2025-06-09 09:00:00'
  },
  {
    id: 4,
    code: 'JS09876459',
    name: '部门主管',
    desc: '负责本部门业务数据查看与审核，可对部门成员的相关操作进行管理。',
    createTime: '2025-06-09 09:00:00'
  },
  {
    id: 5,
    code: 'JS09876460',
    name: '管理员',
    desc: '负责系统基础配置、用户管理、角色权限配置及系统运行维护。',
    createTime: '2025-06-09 09:00:00'
  },
  {
    id: 6,
    code: 'JS09876461',
    name: '成员',
    desc: '可根据授权范围访问业务功能，完成日常数据查询、录入及业务操作。',
    createTime: '2025-06-09 09:00:00'
  },
  {
    id: 7,
    code: 'JS09876462',
    name: '成员',
    desc: '主要用于普通业务人员访问系统功能及查看权限范围内的业务信息。',
    createTime: '2025-06-09 09:00:00'
  },
  {
    id: 8,
    code: 'JS09876463',
    name: '成员',
    desc: '负责日常业务信息维护，可根据系统授权执行对应的数据操作。',
    createTime: '2025-06-09 09:00:00'
  },
  {
    id: 9,
    code: 'JS09876464',
    name: '成员',
    desc: '具备基础业务访问权限，可进行授权范围内的数据查询和业务处理。',
    createTime: '2025-06-09 09:00:00'
  },
  {
    id: 10,
    code: 'JS09876465',
    name: '成员',
    desc: '面向普通业务用户使用，提供基础功能访问及相关业务数据操作权限。',
    createTime: '2025-06-09 09:00:00'
  },
  {
    id: 11,
    code: 'JS09876466',
    name: '成员',
    desc: '负责授权范围内的日常业务处理及相关信息维护工作。',
    createTime: '2025-06-09 09:00:00'
  },
  {
    id: 12,
    code: 'JS09876467',
    name: '成员',
    desc: '可访问授权业务模块，支持日常数据查询和基础业务操作。',
    createTime: '2025-06-09 09:00:00'
  }
])

// ================= 弹窗 =================

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
  name: [
    {
      required: true,
      message: '请输入角色名称',
      trigger: 'blur'
    }
  ]
}


// ================= 菜单权限树 =================

const menuTreeData = ref([
  {
    id: 'qinchuan',
    label: '秦川智筹',
    children: [
      {
        id: 'q1',
        label: '功能名称'
      },
      {
        id: 'q2',
        label: '功能名称'
      },
      {
        id: 'q3',
        label: '功能名称'
      },
      {
        id: 'q4',
        label: '功能名称'
      },
      {
        id: 'q5',
        label: '功能名称'
      }
    ]
  },
  {
    id: 'yanping',
    label: '研评智坊',
    children: [
      {
        id: 'y1',
        label: '功能名称'
      },
      {
        id: 'y2',
        label: '功能名称'
      }
    ]
  },
  {
    id: 'hucang',
    label: '湖仓汇源',
    children: [
      {
        id: 'hc1',
        label: '地质库',
        children: [
          {
            id: 'hc1-1',
            label: '地质数据库',
            children: [
              {
                id: 'hc1-1-1',
                label: '添加'
              },
              {
                id: 'hc1-1-2',
                label: '编辑'
              },
              {
                id: 'hc1-1-3',
                label: '删除'
              }
            ]
          }
        ]
      }
    ]
  }
])


// ================= 角色标签颜色 =================

const getRoleTagClass = (index, name) => {

  if (name === '项目经理') {
    return 'tag-purple'
  }

  if (name === '数据管理') {
    return 'tag-cyan'
  }

  if (name === '部门主管') {
    return 'tag-green'
  }

  if (name === '管理员') {
    return 'tag-blue'
  }

  return 'tag-gray'
}

const pagedTableData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value

  return tableData.value.slice(start, end)
})


// ================= 搜索 =================

const handleSearch = () => {

  ElMessage.success('触发搜索（模拟）')

}


const handleReset = () => {

  searchForm.dateRange = []

  searchForm.name = ''

  handleSearch()

}


// ================= 新增 =================

const handleAdd = () => {

  isEdit.value = false

  formData.id = ''

  formData.code =
    'JS' +
    Math.floor(
      Math.random() * 100000000
    )

  formData.name = ''

  formData.desc = ''

  formData.menuKeys = []

  dialogVisible.value = true

}


// ================= 编辑 =================

const handleEdit = (row) => {

  isEdit.value = true

  formData.id = row.id

  formData.code = row.code

  formData.name = row.name

  formData.desc = row.desc

  formData.menuKeys = [
    'q1',
    'y1'
  ]

  dialogVisible.value = true

}


// ================= 保存 =================

const handleSave = () => {

  formRef.value.validate((valid) => {

    if (!valid) return

    const checkedKeys =
      treeRef.value.getCheckedKeys()

    const halfCheckedKeys =
      treeRef.value.getHalfCheckedKeys()

    formData.menuKeys = [
      ...checkedKeys,
      ...halfCheckedKeys
    ]

    saveLoading.value = true

    setTimeout(() => {

      saveLoading.value = false

      dialogVisible.value = false

      ElMessage.success(
        isEdit.value
          ? '编辑成功'
          : '新增成功'
      )

    }, 500)

  })

}


// ================= 删除 =================

const handleDelete = (row) => {

  ElMessageBox.confirm(
    `确定要删除角色 "${row.name}" 吗？`,
    '提示',
    {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      customClass: 'custom-message-box'
    }
  )
    .then(() => {

      ElMessage.success('删除成功')

    })
    .catch(() => {})

}


onMounted(() => {

})
</script>


<style scoped lang="scss">

/* =========================================================
   页面整体
========================================================= */

.role-manage-root {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.role-manage-page-bg {
  position: relative;

  width: 100%;
  height: 100%;

  display: flex;
  flex-direction: column;

  overflow: hidden;

  background:
    linear-gradient(
      122deg,
      #eef3fa 0%,
      #f7f8fc 48%,
      #eaf2fb 100%
    );
}


/* =========================================================
   背景光晕
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

  background:
    radial-gradient(
      circle,
      rgba(255, 205, 220, 0.45) 0%,
      rgba(255, 205, 220, 0) 70%
    );

  filter: blur(45px);
}

.bg-glow-top-right {
  right: 60px;
  top: -160px;

  width: 420px;
  height: 420px;

  background:
    radial-gradient(
      circle,
      rgba(184, 219, 255, 0.45) 0%,
      rgba(184, 219, 255, 0) 70%
    );

  filter: blur(50px);
}

.bg-glow-bottom-right {
  right: -100px;
  bottom: -180px;

  width: 560px;
  height: 560px;

  background:
    radial-gradient(
      circle,
      rgba(172, 216, 255, 0.4) 0%,
      rgba(172, 216, 255, 0) 70%
    );

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

  justify-content: space-between;

  padding: 0 16px;

  box-sizing: border-box;

  border-bottom: 1px solid rgba(218, 226, 236, 0.9);

  background: rgba(255, 255, 255, 0.18);
}

.page-title {
  font-family:
    "PingFang SC",
    "Microsoft YaHei",
    sans-serif;

  font-size: 13px;

  font-weight: 600;

  color: #152536;
}


/* =========================================================
   添加按钮
========================================================= */

.btn-add {
  height: 28px;

  padding: 0 13px;

  border-radius: 7px;

  border: none !important;

  font-size: 11px;

  box-shadow:
    0 4px 10px
    rgba(2, 120, 231, 0.18);

  display: inline-flex;

  align-items: center;

  gap: 5px;

  background: #0783eb !important;

  color: #fff !important;
}

.btn-add:hover {
  background: #0675d4 !important;
}


/* =========================================================
   主体
========================================================= */

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


/* =========================================================
   搜索工具栏
========================================================= */

.toolbar {
  position: relative;

  flex-shrink: 0;

  min-height: 40px;

  display: flex;

  align-items: center;

  justify-content: space-between;

  margin-bottom: 9px;
}

.filter-row {
  display: flex;

  align-items: center;

  gap: 9px;

  min-width: 0;
}


/* 日期 */

.filter-date {
  width: 218px;
}

.filter-row :deep(.el-date-editor.el-input__wrapper) {
  height: 26px;

  padding: 0 8px;

  border-radius: 6px;

  box-shadow:
    0 0 0 1px #dfe6ee inset;

  background: rgba(255, 255, 255, 0.92);
}

.filter-row :deep(.el-date-editor.el-input__wrapper:hover) {
  box-shadow:
    0 0 0 1px #cbd7e5 inset;
}

.filter-row :deep(.el-date-editor.el-input__wrapper.is-focus) {
  box-shadow:
    0 0 0 1px #1686e9 inset;
}


/* 输入框 */

.filter-input {
  width: 280px;
}

.filter-row :deep(.el-input__wrapper) {
  height: 26px;

  padding: 0 9px;

  border-radius: 6px;

  box-shadow:
    0 0 0 1px #dfe6ee inset;

  background: rgba(255, 255, 255, 0.92);
}

.filter-row :deep(.el-input__wrapper:hover) {
  box-shadow:
    0 0 0 1px #cbd7e5 inset;
}

.filter-row :deep(.el-input__wrapper.is-focus) {
  box-shadow:
    0 0 0 1px #1686e9 inset;
}

.filter-row :deep(.el-input__inner) {
  font-size: 10px;

  color: #536274;
}

.filter-row :deep(.el-input__inner::placeholder) {
  color: #8190a2;
}

.filter-row :deep(.el-input__prefix-inner) {
  color: #748397;
}


/* 日期文字 */

.filter-row :deep(.el-range-input) {
  font-size: 10px;

  color: #536274;
}

.filter-row :deep(.el-range-input::placeholder) {
  color: #8190a2;
}


/* =========================================================
   搜索按钮
========================================================= */

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

  font-size: 10px;

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

  box-shadow:
    0 3px 8px
    rgba(8, 127, 229, 0.15);
}

.btn-search:hover {
  background: #0874d0 !important;

  border-color: #0874d0 !important;
}


/* =========================================================
   列表 / 卡片切换
========================================================= */

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

  font-size: 10px;
}

.view-mode-group
  :deep(.el-radio-button:first-child .el-radio-button__inner) {
  border-radius: 6px 0 0 6px;
}

.view-mode-group
  :deep(.el-radio-button:last-child .el-radio-button__inner) {
  border-radius: 0 6px 6px 0;
}

.view-mode-group
  :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  color: #147fe1;

  background: #fff;

  border-color: #d7e1ec;

  box-shadow:
    0 0 0 1px rgba(20, 127, 225, 0.04);
}

.view-mode-group :deep(.el-icon) {
  font-size: 12px;
}


/* =========================================================
   表格
========================================================= */

.table-container {
  flex: 1;

  min-height: 0;

  width: 100%;

  overflow: hidden;

  border-radius: 5px;

  background: rgba(255, 255, 255, 0.96);

  border: 1px solid #e1e7ef;
}


/* Element Plus 表格 */

.table-container :deep(.el-table) {
  --el-table-border-color: #e6ebf1;
  --el-table-header-bg-color: #f2f5f9;
  --el-table-row-hover-bg-color: #f7faff;

  width: 100% !important;

  background: transparent;
}


/* 表头 */

.table-container :deep(.el-table th.el-table__cell) {
  height: 28px;

  padding: 0;

  background: #f2f5f9 !important;

  color: #637285;

  font-size: 9px;

  font-weight: 500;

  border-bottom: 1px solid #e0e7ef;
}

.table-container :deep(.el-table th .cell) {
  padding: 0 14px;

  line-height: 28px;
}


/* 表格行 */

.table-container :deep(.el-table td.el-table__cell) {
  height: 40px;

  padding: 0;

  border-bottom: 1px solid #e8edf3;

  color: #304153;

  font-size: 9px;
}

.table-container :deep(.el-table td .cell) {
  padding: 0 14px;

  line-height: 36px;
}


/* 最后一行 */

.table-container
  :deep(.el-table__body tr:last-child td.el-table__cell) {
  border-bottom: none;
}


/* Hover */

.table-container
  :deep(.el-table__body tr:hover > td.el-table__cell) {
  background: #f8fbff !important;
}


/* 移除默认底线 */

.table-container
  :deep(.el-table__inner-wrapper::before) {
  display: none;
}


/* =========================================================
   角色名称 Tag
========================================================= */

.role-tag {
  display: inline-flex;

  align-items: center;

  justify-content: center;

  min-width: 48px;

  height: 18px;

  padding: 0 9px;

  box-sizing: border-box;

  border-radius: 10px;

  font-size: 9px;

  line-height: 18px;

  white-space: nowrap;
}


/* 灰色 */

.tag-gray {
  color: #647385;

  background: #e9eef3;

  border: 1px solid #e0e7ed;
}


/* 紫色 */

.tag-purple {
  color: #9a55df;

  background: #f1e3ff;

  border: 1px solid #dfc2fa;
}


/* 青色 */

.tag-cyan {
  color: #0b9da2;

  background: #d8f7f6;

  border: 1px solid #b5e9e7;
}


/* 绿色 */

.tag-green {
  color: #1d9b5a;

  background: #dcf8e8;

  border: 1px solid #b9eaca;
}


/* 蓝色 */

.tag-blue {
  color: #2579d5;

  background: #dceeff;

  border: 1px solid #bcdcff;
}


/* =========================================================
   表格操作
========================================================= */

.table-actions {
  display: flex;

  align-items: center;

  justify-content: flex-start;

  gap: 8px;
}

.operation-btn-item {
  margin: 0 !important;

  padding: 0 !important;

  height: auto;

  font-size: 9px;

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
   分页
========================================================= */

.pagination-wrap {
  flex-shrink: 0;

  height: 28px;

  margin-top: 7px;

  display: flex;

  align-items: center;

  justify-content: flex-end;

  gap: 7px;
}

.pagination-total {
  margin-right: auto;

  color: #667688;

  font-size: 9px;
}

.pagination-wrap :deep(.el-pagination) {
  padding: 0;

  height: 26px;
}

.pagination-wrap
  :deep(.el-pagination .btn-prev),
.pagination-wrap
  :deep(.el-pagination .btn-next),
.pagination-wrap
  :deep(.el-pagination .el-pager li) {
  width: 23px;

  min-width: 23px;

  height: 23px;

  margin: 0 2px;

  padding: 0;

  border: 1px solid #e0e6ee;

  border-radius: 5px;

  background: #fff;

  color: #667688;

  font-size: 9px;

  line-height: 21px;
}

.pagination-wrap
  :deep(.el-pagination .el-pager li.is-active) {
  background: #087fe5;

  border-color: #087fe5;

  color: #fff;
}

.pagination-wrap
  :deep(.el-pagination .btn-prev:hover),
.pagination-wrap
  :deep(.el-pagination .btn-next:hover),
.pagination-wrap
  :deep(.el-pagination .el-pager li:hover) {
  color: #087fe5;

  border-color: #bcd8ef;
}

.pagination-wrap
  :deep(.el-pagination .el-pager li.is-active:hover) {
  color: #fff;

  border-color: #087fe5;

  background: #087fe5;
}

.page-size-text {
  color: #667688;

  font-size: 9px;

  white-space: nowrap;
}


/* =========================================================
   卡片区域
========================================================= */

.card-scroll-container {
  flex: 1;

  min-height: 0;

  overflow-y: auto;

  overflow-x: hidden;

  padding: 0 0 10px;
}

.card-scroll-container::-webkit-scrollbar {
  width: 5px;
}

.card-scroll-container::-webkit-scrollbar-thumb {
  background: rgba(150, 165, 180, 0.35);

  border-radius: 5px;
}

.card-scroll-container::-webkit-scrollbar-track {
  background: transparent;
}


/* 4列 */

.card-grid {
  display: grid;

  grid-template-columns:
    repeat(4, minmax(0, 1fr));

  gap: 11px;

  width: 100%;
}


/* =========================================================
   角色卡片
========================================================= */

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

  box-shadow:
    0 2px 8px
    rgba(50, 80, 110, 0.035);

  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}


/* Hover */

.role-card:hover {
  border-color: #c7def4;

  box-shadow:
    0 4px 14px
    rgba(35, 91, 137, 0.08);

  transform: translateY(-1px);
}


/* 当前选中卡片 */

.role-card.is-active {
  border-color: #1688ef;

  box-shadow:
    0 2px 8px
    rgba(22, 136, 239, 0.1);
}


/* =========================================================
   卡片 Header
========================================================= */

.role-card-header {
  width: 100%;

  height: 24px;

  flex-shrink: 0;

  display: flex;

  align-items: flex-start;

  justify-content: space-between;
}


/* 卡片 ID */

.card-code {
  display: inline-flex;

  align-items: center;

  height: 18px;

  padding: 0 9px;

  border-radius: 9px;

  background: #f4f7fa;

  border: 1px solid #e2e9f0;

  color: #7a8999;

  font-size: 8px;

  line-height: 18px;

  white-space: nowrap;
}


/* 更多按钮 */

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
}

.card-more-btn:hover {
  background: #f1f4f7;

  color: #167fe0;
}

.card-more-btn :deep(.el-icon) {
  font-size: 13px;
}


/* =========================================================
   卡片名称
========================================================= */

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


/* =========================================================
   卡片描述
========================================================= */

.card-desc {
  flex: 1;

  min-height: 0;

  overflow: hidden;

  display: -webkit-box;

  -webkit-box-orient: vertical;

  -webkit-line-clamp: 2;

  color: #536274;

  font-size: 9px;

  line-height: 16px;

  word-break: break-all;
}


/* =========================================================
   卡片时间
========================================================= */

.card-time {
  flex-shrink: 0;

  display: flex;

  align-items: center;

  gap: 5px;

  margin-top: 7px;

  color: #b1bbc6;

  font-size: 8px;

  line-height: 14px;
}

.card-time :deep(.el-icon) {
  font-size: 12px;

  color: #c2cbd4;
}


/* =========================================================
   Dropdown
========================================================= */

:deep(.el-dropdown-menu) {
  min-width: 82px;

  padding: 4px;

  border-radius: 6px;
}

:deep(.el-dropdown-menu__item) {
  height: 30px;

  padding: 0 9px;

  gap: 5px;

  border-radius: 4px;

  font-size: 10px;

  color: #4d5b6b;
}

:deep(.el-dropdown-menu__item:hover) {
  background: #f3f7fb;

  color: #187ed9;
}

:deep(.delete-dropdown-item) {
  color: #f05b61 !important;
}

:deep(.delete-dropdown-item:hover) {
  color: #e84950 !important;

  background: #fff4f4 !important;
}


/* =========================================================
   Dialog
========================================================= */

.custom-dialog {
  :deep(.el-dialog) {
    border-radius: 10px;

    overflow: hidden;

    box-shadow:
      0 12px 40px
      rgba(30, 55, 80, 0.16);
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

    font-size: 15px;

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
}


/* =========================================================
   表单
========================================================= */

.form-row {
  display: grid;

  grid-template-columns:
    repeat(3, 1fr);

  gap: 16px;
}

.form-row :deep(.el-form-item) {
  margin-bottom: 0;
}

.form-row :deep(.el-form-item__label) {
  color: #536274;

  font-size: 12px;
}

.form-row :deep(.el-input__wrapper) {
  height: 34px;

  border-radius: 6px;

  box-shadow:
    0 0 0 1px #dfe6ee inset;
}


/* =========================================================
   Tabs
========================================================= */

.permission-tabs {
  margin-top: 22px;

  :deep(.el-tabs__header) {
    margin-bottom: 15px;
  }

  :deep(.el-tabs__item) {
    height: 38px;

    color: #69788a;

    font-size: 12px;
  }

  :deep(.el-tabs__item.is-active) {
    color: #087fe5;
  }

  :deep(.el-tabs__active-bar) {
    background-color: #087fe5;
  }
}


/* =========================================================
   权限树
========================================================= */

.tree-container {
  min-height: 300px;

  max-height: 400px;

  overflow-y: auto;

  padding: 15px;

  box-sizing: border-box;

  background: #fafbfd;

  border: 1px solid #e2e8ef;

  border-radius: 7px;
}

.tree-container
  :deep(.el-tree) {
  background: transparent;

  color: #425466;

  font-size: 12px;
}

.tree-container
  :deep(.el-tree-node__content) {
  height: 30px;
}

.tree-container
  :deep(.el-tree-node__content:hover) {
  background: #f0f6fc;
}


/* =========================================================
   空状态
========================================================= */

.empty-tip {
  padding: 50px 20px;

  color: #9aa7b5;

  text-align: center;

  font-size: 12px;
}


/* =========================================================
   Dialog 按钮
========================================================= */

.dialog-cancel-btn,
.dialog-save-btn {
  height: 34px;

  padding: 0 18px;

  border-radius: 6px;

  font-size: 12px;
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


/* =========================================================
   MessageBox
========================================================= */

:deep(.custom-message-box) {
  border-radius: 8px;
}


/* =========================================================
   响应式
========================================================= */

@media screen and (max-width: 1100px) {

  .card-grid {
    grid-template-columns:
      repeat(3, minmax(0, 1fr));
  }

}


@media screen and (max-width: 800px) {

  .card-grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }

  .filter-row {
    flex-wrap: wrap;
  }

}


@media screen and (max-width: 600px) {

  .card-grid {
    grid-template-columns: 1fr;
  }

  .filter-date,
  .filter-input {
    width: 180px;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

}

</style>