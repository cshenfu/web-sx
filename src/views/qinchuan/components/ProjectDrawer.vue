<template>
  <transition name="drawer-slide">
    <aside v-if="visible" class="project-drawer">
      <!-- 排序 -->
      <div class="drawer-sort">
        <button
          class="sort-button"
          :class="{ active: sortKey === 'capacity' }"
          @click="toggleSort('capacity')"
        >
          容量
          <span class="sort-arrows">
            <i class="arrow up" :class="{ on: sortKey === 'capacity' && sortDir === 'asc' }" />
            <i class="arrow down" :class="{ on: sortKey === 'capacity' && sortDir === 'desc' }" />
          </span>
        </button>
        <button
          class="sort-button"
          :class="{ active: sortKey === 'rate' }"
          @click="toggleSort('rate')"
        >
          收益率
          <span class="sort-arrows">
            <i class="arrow up" :class="{ on: sortKey === 'rate' && sortDir === 'asc' }" />
            <i class="arrow down" :class="{ on: sortKey === 'rate' && sortDir === 'desc' }" />
          </span>
        </button>
        <button class="drawer-close" title="关闭" @click="emit('close')">
          <el-icon><Close /></el-icon>
        </button>
      </div>

      <!-- 列表 -->
      <div v-loading="loading" class="drawer-list">
        <div
          v-for="p in list"
          :key="p.id"
          class="project-card"
          :class="{ active: p.id === selectedId }"
          @click="emit('select', p)"
        >
          <div class="card-top">
            <span
              class="type-tag"
              :class="p.itemType === 'GF' ? 'solar' : 'wind'"
            >
              {{ ITEM_TYPE_MAP[p.itemType] || '项目' }}
            </span>
            <span class="card-name" :title="p.projectName">{{ p.projectName }}</span>
          </div>

          <div class="card-meta">
            <span class="meta-item">
              <el-icon><Location /></el-icon>
              {{ formatRegion(p) }}
            </span>
            <span class="meta-item">
              <el-icon><Box /></el-icon>
              推荐容量 {{ p.currentProjectCapacity ?? '-' }}MW
            </span>
            <span class="meta-item">
              <el-icon><Money /></el-icon>
              资本金IRR {{ p.capitalFinancialRate != null ? p.capitalFinancialRate + '%' : '-' }}
            </span>
            <span v-if="isVerified(p)" class="meta-item verified">
              <el-icon><CircleCheck /></el-icon>
              已核查
            </span>
          </div>

          <!-- 操作按钮：所有卡片都显示 -->
          <div class="card-actions" @click.stop>
            <button
              v-for="action in rowActions"
              :key="action"
              :class="{ danger: action === 'delete' }"
              @click="emit('action', { type: action, project: p })"
            >
              {{ ROW_ACTION_LABELS[action] || action }}
            </button>
          </div>
        </div>

        <div v-if="!loading && !list.length" class="drawer-empty">
          暂无项目
        </div>
      </div>

      <!-- 分页 -->
      <div class="drawer-pagination">
        <span class="total-text">共{{ total }}条</span>
        <el-select
          :model-value="pageSize"
          size="small"
          style="width: 90px"
          @change="(v) => emit('size-change', v)"
        >
          <el-option :value="10" label="10条/页" />
          <el-option :value="20" label="20条/页" />
          <el-option :value="50" label="50条/页" />
        </el-select>

        <button class="page-btn" :disabled="page <= 1" @click="emit('page-change', page - 1)">
          <el-icon><ArrowLeft /></el-icon>
        </button>

        <template v-for="n in visiblePages" :key="n">
          <button
            v-if="n !== '...'"
            class="page-btn"
            :class="{ active: n === page }"
            @click="emit('page-change', n)"
          >
            {{ n }}
          </button>
          <span v-else class="page-ellipsis">…</span>
        </template>

        <button class="page-btn" :disabled="page >= totalPages" @click="emit('page-change', page + 1)">
          <el-icon><ArrowRight /></el-icon>
        </button>

        <div class="page-jump">
          前往
          <el-input
            v-model="jumpValue"
            size="small"
            style="width: 40px"
            @keyup.enter="handleJump"
          />
          页
        </div>
      </div>
    </aside>
  </transition>
</template>

<script setup>
import { computed, ref } from 'vue'
import {
  ArrowLeft,
  ArrowRight,
  Box,
  CircleCheck,
  Close,
  Location,
  Money,
} from '@element-plus/icons-vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  list: { type: Array, default: () => [] },
  total: { type: Number, default: 0 },
  page: { type: Number, default: 1 },
  pageSize: { type: Number, default: 10 },
  selectedId: { type: [Number, String], default: null },
  loading: { type: Boolean, default: false },
  // ★ 操作按钮，由父组件按阶段传入
  rowActions: {
    type: Array,
    default: () => ['edit', 'assign', 'delete'],
  },
})

const emit = defineEmits([
  'close',
  'select',
  'action',
  'page-change',
  'size-change',
  'sort-change',
])

const ITEM_TYPE_MAP = { FD: '风电', GF: '光伏' }

// ★ 按钮标签
const ROW_ACTION_LABELS = {
  material: '立项材料',
  establishMeeting: '立项上会',
  researchMaterial: '可研材料',
  researchReview: '可研审查',
  investMaterial: '投资材料',
  investMeeting: '投决上会',
  assign: '分配',
  reserve: '储备',
  verify: '核查',
  share: '分享',
  edit: '编辑',
  delete: '删除',
}

// ---- 排序 ----
const sortKey = ref('')
const sortDir = ref('desc')

function toggleSort(key) {
  if (sortKey.value === key) {
    if (sortDir.value === 'asc') sortDir.value = 'desc'
    else if (sortDir.value === 'desc') {
      sortKey.value = ''
      sortDir.value = 'desc'
    }
  } else {
    sortKey.value = key
    sortDir.value = 'desc'
  }
  emit('sort-change', { key: sortKey.value, dir: sortDir.value })
}

// ---- 分页 ----
const totalPages = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)))

const visiblePages = computed(() => {
  const total = totalPages.value
  const cur = props.page
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1)
  const pages = []
  pages.push(1)
  if (cur > 3) pages.push('...')
  for (let i = Math.max(2, cur - 1); i <= Math.min(total - 1, cur + 1); i++) pages.push(i)
  if (cur < total - 2) pages.push('...')
  pages.push(total)
  return pages
})

const jumpValue = ref('')
function handleJump() {
  const n = Number(jumpValue.value)
  if (Number.isFinite(n) && n >= 1 && n <= totalPages.value) {
    emit('page-change', n)
  }
  jumpValue.value = ''
}

// ---- 工具 ----
function formatRegion(row) {
  const names = [row.cityName, row.districtName].filter(Boolean)
  return names.length ? names.join('/') : (row.address || '-')
}

function isVerified(row) {
  return row.isVerified === 1 || row.isVerified === true
}
</script>

<style scoped>
.project-drawer {
  position: fixed;
  top: 80px;
  right: 12px;
  bottom: 12px;
  width: 460px;
  z-index: 20;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
  overflow: hidden;
}

/* ---- 排序栏 ---- */
.drawer-sort {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 10px 16px;
  border-bottom: 1px solid #f0f0f0;
}

.sort-button {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 0;
  color: #606266;
  font-size: 12px;
  background: transparent;
  border: 0;
  cursor: pointer;
}
.sort-button.active { color: #1677ff; font-weight: 500; }

.sort-arrows {
  display: inline-flex;
  flex-direction: column;
  line-height: 0;
}
.sort-arrows .arrow {
  width: 0;
  height: 0;
  border-left: 3px solid transparent;
  border-right: 3px solid transparent;
  opacity: 0.35;
}
.sort-arrows .arrow.up {
  border-bottom: 4px solid currentColor;
  margin-bottom: 1px;
}
.sort-arrows .arrow.down {
  border-top: 4px solid currentColor;
}
.sort-arrows .arrow.on { opacity: 1; color: #1677ff; }

.drawer-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  margin-left: auto;
  color: #909399;
  background: transparent;
  border: 0;
  border-radius: 4px;
  cursor: pointer;
}
.drawer-close:hover {
  color: #1677ff;
  background: #f0f7ff;
}

/* ---- 列表 ---- */
.drawer-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px 12px;
}

.project-card {
  padding: 12px;
  margin-bottom: 8px;
  background: #fafbfc;
  border: 1px solid transparent;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;
}
.project-card:hover { background: #f5f8ff; }
.project-card.active { background: #eef4ff; border-color: #c6dfff; }

.card-top {
  display: flex;
  align-items: center;
  gap: 6px;
}

.type-tag {
  flex-shrink: 0;
  padding: 1px 6px;
  color: #fff;
  font-size: 11px;
  border-radius: 3px;
}
.type-tag.wind { background: #3b82f6; }
.type-tag.solar { background: #f59e0b; }

.card-name {
  flex: 1;
  overflow: hidden;
  color: #303133;
  font-size: 13px;
  font-weight: 500;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 14px;
  margin-top: 8px;
  color: #909399;
  font-size: 12px;
}

.meta-item {
  display: inline-flex;
  align-items: center;
  gap: 3px;
}
.meta-item.verified { color: #24b26b; }

/* ★ 操作按钮：所有卡片都显示 */
.card-actions {
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 4px;
  padding-top: 8px;
  margin-top: 8px;
  border-top: 1px solid #e5e7eb;
}
.card-actions button {
  padding: 4px 10px;
  color: #1677ff;
  font-size: 12px;
  background: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  cursor: pointer;
}
.card-actions button:hover {
  color: #1677ff;
  border-color: #1677ff;
}
.card-actions button.danger {
  color: #f56c6c;
}
.card-actions button.danger:hover {
  color: #f56c6c;
  border-color: #f56c6c;
}

.drawer-empty {
  padding: 40px 0;
  color: #909399;
  font-size: 12px;
  text-align: center;
}

/* ---- 分页 ---- */
.drawer-pagination {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  padding: 10px 12px;
  color: #606266;
  font-size: 12px;
  border-top: 1px solid #f0f0f0;
}

.total-text { margin-right: auto; }

.page-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 26px;
  height: 26px;
  padding: 0 6px;
  color: #606266;
  font-size: 12px;
  background: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  cursor: pointer;
}
.page-btn:hover:not(:disabled) { color: #1677ff; border-color: #1677ff; }
.page-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.page-btn.active { color: #fff; background: #1677ff; border-color: #1677ff; }

.page-ellipsis {
  padding: 0 2px;
  color: #909399;
}

.page-jump {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* ---- 过渡 ---- */
.drawer-slide-enter-active,
.drawer-slide-leave-active {
  transition: all 0.25s ease;
}
.drawer-slide-enter-from,
.drawer-slide-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>