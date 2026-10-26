<template>
  <div class="list-panel-wrapper" :class="{ 'collapsed': collapsed }">
    <!-- 折叠/展开按钮：紧贴面板，上下居中 -->
    <div class="fold-btn" @click="toggleFold" :title="collapsed ? '展开列表' : '收起列表'">
      <el-icon :size="16">
        <component :is="collapsed ? ArrowLeft : ArrowRight" />
      </el-icon>
    </div>

    <!-- 面板内容 -->
    <div class="list-panel" v-show="!collapsed">
      <!-- 顶部搜索栏 -->
     <!-- 顶部搜索栏 -->
        <div class="search-bar">
        <el-select v-model="filters.type" placeholder="避让类型" size="small" clearable style="width: 110px">
            <el-option label="矿区" value="矿区" />
            <el-option label="生态保护区" value="生态保护区" />
            <el-option label="耕地" value="耕地" />
            <el-option label="不可用" value="不可用" />
        </el-select>
        <el-select v-model="filters.lineType" placeholder="线路类型" size="small" clearable style="width: 110px">
            <el-option label="已建项目" value="已建项目" />
            <el-option label="规划项目" value="规划项目" />
        </el-select>
        <el-button size="small" type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
        </el-button>

        <!-- 新增：操作按钮组 -->
        <div class="search-actions">
            <el-button size="small" @click="handleImport">导入避让区域</el-button>
            <el-button size="small" type="primary" plain @click="handleAdd">添加避让区域</el-button>
        </div>
        </div>

      <!-- 列表 -->
      <div class="list-body" v-loading="loading">
        <div
          v-for="item in pagedList"
          :key="item.guid"
          class="list-item"
          :class="{ active: activeGuid === item.guid }"
          @click="$emit('select', item)"
        >
          <div class="item-header">
            <span class="tag">{{ item.attributes?.type || '避让区' }}</span>
            <span class="name">{{ item.attributes?.name || '未命名' }}</span>
          </div>
          <div class="item-meta">
            <span>👤 {{ item.attributes?.manager || '未知' }}</span>
            <span>🕒 {{ item.attributes?.createTime || '-' }}</span>
          </div>
        </div>
        <div v-if="!pagedList.length" class="empty-tip">暂无避让区数据</div>
      </div>

      <!-- 底部分页 -->
      <div class="pagination-bar">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="filteredList.length"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          small
          @size-change="handleSizeChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Search, ArrowLeft, ArrowRight } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'   // 新增

const props = defineProps({
  list: { type: Array, default: () => [] },
  activeGuid: { type: String, default: null },
  collapsed: { type: Boolean, default: false }
})

const emit = defineEmits(['update:collapsed', 'select', 'fold-change'])

const filters = ref({ type: '', lineType: '' })
const currentPage = ref(1)
const pageSize = ref(10)
// 新增：占位方法
function handleImport() {
  ElMessage.info('导入避让区域功能开发中')
}

function handleAdd() {
  ElMessage.info('添加避让区域功能开发中')
}
// 过滤
const filteredList = computed(() => {
  return props.list.filter(item => {
    const attrs = item.attributes || {}
    if (filters.value.type && attrs.type !== filters.value.type) return false
    if (filters.value.lineType && attrs.lineType !== filters.value.lineType) return false
    return true
  })
})

// 分页
const pagedList = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredList.value.slice(start, start + pageSize.value)
})

function handleSearch() {
  currentPage.value = 1
}

function handleSizeChange() {
  currentPage.value = 1
}

function toggleFold() {
  emit('update:collapsed', !props.collapsed)
  emit('fold-change', !props.collapsed)
}
</script>

<style scoped>
/* 外层包装器 */
.list-panel-wrapper {
  width:500px;
  height:100%;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 10px;
  z-index: 20;
  display: flex;
  align-items: stretch; /* 让子项高度铺满 */
  pointer-events: none; /* 避免遮挡地图事件 */
}
/* 新增：收起时宽度收缩为按钮宽度 */
.list-panel-wrapper.collapsed {
  width: 24px; /* 与 .fold-btn 的 width 一致 */
}
/* 折叠按钮 */
.fold-btn {
  width: 24px;
  height: 48px;
  background: #fff;
  border-radius: 6px 0 0 6px; /* 左侧圆角，右侧紧贴面板 */
  box-shadow: -2px 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #606266;
  transition: all 0.2s;
  align-self: center; /* 垂直居中 */
  flex-shrink: 0;
  pointer-events: auto; /* 恢复点击 */
  margin-right: -1px; /* 消除与面板之间的缝隙 */
}

.fold-btn:hover {
  color: #1677ff;
  background: #e8f2ff;
}

/* 面板 */
.list-panel {
  width: 100%;
  height: 100%; /* 占满父容器高度 */
  background: #fff;
  border-radius: 0 8px 8px 0; /* 左侧直角贴合按钮，右侧圆角 */
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  padding: 12px;
  overflow: hidden;
  pointer-events: auto; /* 恢复点击 */
}

/* 搜索栏 */
.search-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

/* 列表体 */
.list-body {
  flex: 1;
  overflow-y: auto;
  scrollbar-width: none; /* 隐藏滚动条 */
}
.list-body::-webkit-scrollbar {
  display: none;
}

.list-item {
  padding: 10px 12px;
  margin-bottom: 8px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.list-item:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.list-item.active {
  background: #eff6ff;
  border-color: #3b82f6;
}

.item-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
}
.search-actions{
    display:flex;
}
.tag {
  display: inline-block;
  padding: 2px 6px;
  font-size: 11px;
  color: #fff;
  background: #3b82f6;
  border-radius: 4px;
  white-space: nowrap;
}

.name {
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #64748b;
}

.empty-tip {
  text-align: center;
  color: #94a3b8;
  padding: 20px 0;
  font-size: 13px;
}

/* 底部翻页 */
.pagination-bar {
  display: flex;
  justify-content: flex-end;
  padding-top: 8px;
  border-top: 1px solid #e2e8f0;
  margin-top: 8px;
}
</style>