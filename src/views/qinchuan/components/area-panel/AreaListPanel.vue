<!-- components/area-panel/AreaListPanel.vue -->
<!-- 放大层级后，右侧默认收起（只有展开图标），展开后是区域卡片列表。
     点击列表项对外抛出 select 事件，由父组件负责 flyTo + 切换到详情面板。 -->
<template>
  <div class="area-list-wrap">
    <!-- 收起态：只有一个展开箭头 -->
    <button
      v-if="!expanded"
      type="button"
      class="expand-toggle collapsed"
      title="展开区域列表"
      @click="expanded = true"
    >
      <svg viewBox="0 0 16 16" class="chevron"><path d="M6 3l5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </button>

    <section v-else class="area-list-panel">
      <button
        type="button"
        class="expand-toggle attached"
        title="收起"
        @click="expanded = false"
      >
        <svg viewBox="0 0 16 16" class="chevron rotated"><path d="M6 3l5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>

      <header class="list-header">
        <div class="header-top">
          <div class="title-block">
            <div class="title">{{ title }}</div>
            <div class="subtitle">共{{ total }}条{{ subtitleExtra }}</div>
          </div>
          <div class="header-actions">
            <button type="button" class="header-btn" @click="$emit('import')">
              <svg viewBox="0 0 16 16" class="btn-icon"><path d="M8 2v8m0 0l-3-3m3 3l3-3M3 12.5h10" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>
              导入区域
            </button>
            <button type="button" class="header-btn primary" @click="$emit('add')">
              <svg viewBox="0 0 16 16" class="btn-icon"><path d="M8 3v10M3 8h10" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
              添加区域
            </button>
          </div>
        </div>

        <div class="filter-row">
          <select v-model="areaTypeFilter" class="filter-select">
            <option v-for="opt in areaTypeOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
          <select v-model="dataTypeFilter" class="filter-select">
            <option v-for="opt in dataTypeOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
          <div class="search-box">
            <svg viewBox="0 0 16 16" class="search-icon"><circle cx="7" cy="7" r="4.5" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="M10.5 10.5L14 14" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
            <input v-model="keyword" class="search-input" placeholder="位置或者经纬度" />
          </div>
        </div>
      </header>

      <div class="list-body">
        <div
          v-for="area in filteredAreas"
          :key="area.id"
          class="area-card"
          :class="{ active: area.id === activeAreaId }"
          @click="$emit('select', area)"
        >
          <div class="card-top">
            <span class="tag" :class="`tag-${area.tagType}`">{{ area.tag }}</span>
            <span class="card-name">{{ area.name }}</span>
          </div>
          <div class="card-bottom">
            <span class="card-meta">
              <svg viewBox="0 0 16 16" class="meta-icon"><circle cx="8" cy="8" r="6.2" fill="none" stroke="currentColor" stroke-width="1.2"/><path d="M8 4.6V8l2.4 1.4" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>
              {{ area.updatedAt }}
            </span>
            <span class="card-meta">
              <svg viewBox="0 0 16 16" class="meta-icon"><circle cx="8" cy="5.6" r="2.4" fill="none" stroke="currentColor" stroke-width="1.2"/><path d="M3.2 13c0-2.4 2.1-4 4.8-4s4.8 1.6 4.8 4" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>
              {{ area.operator }}
            </span>

            <span class="card-ops">
              <button type="button" class="op-btn" title="下载" @click.stop="$emit('download', area)">
                <svg viewBox="0 0 16 16"><path d="M8 2v7m0 0l-2.5-2.5M8 9l2.5-2.5M3 12.5h10" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </button>
              <button type="button" class="op-btn danger" title="删除" @click.stop="$emit('delete', area)">
                <svg viewBox="0 0 16 16"><path d="M3.5 4.5h9M6.5 4.5V3a1 1 0 011-1h1a1 1 0 011 1v1.5M4.5 4.5l.6 8a1 1 0 001 .9h3.8a1 1 0 001-.9l.6-8" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </button>
            </span>
          </div>
        </div>

        <div v-if="!filteredAreas.length" class="empty-state">暂无数据~</div>
      </div>

      <footer v-if="total" class="list-footer">
        <span class="footer-total">共 {{ total }} 条</span>
        <span class="pager">
          <button type="button" class="pager-btn" :disabled="page <= 1" @click="$emit('update:page', page - 1)">‹</button>
          <button
            v-for="p in pageCount"
            :key="p"
            type="button"
            class="pager-btn"
            :class="{ active: p === page }"
            @click="$emit('update:page', p)"
          >
            {{ p }}
          </button>
          <button type="button" class="pager-btn" :disabled="page >= pageCount" @click="$emit('update:page', page + 1)">›</button>
        </span>
      </footer>
    </section>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { AREA_TYPE_OPTIONS, DATA_TYPE_OPTIONS } from '../../js/areaPanelMockData'

const props = defineProps({
  title: { type: String, default: '避让区域' },
  subtitleExtra: { type: String, default: '' },
  areas: { type: Array, default: () => [] },
  total: { type: Number, default: 0 },
  page: { type: Number, default: 1 },
  pageSize: { type: Number, default: 8 },
  activeAreaId: { type: [String, Number], default: null },
  // 默认收起；父组件可用 v-model:expanded 控制（比如切换区域后自动展开）
  modelValueExpanded: { type: Boolean, default: false },
})

const emit = defineEmits([
  'select', 'add', 'import', 'download', 'delete',
  'update:page', 'update:modelValueExpanded',
])

const expanded = computed({
  get: () => props.modelValueExpanded,
  set: (val) => emit('update:modelValueExpanded', val),
})

const areaTypeOptions = AREA_TYPE_OPTIONS
const dataTypeOptions = DATA_TYPE_OPTIONS
const areaTypeFilter = ref('')
const dataTypeFilter = ref('')
const keyword = ref('')

const filteredAreas = computed(() => {
  return props.areas.filter((area) => {
    if (areaTypeFilter.value && area.tagType !== areaTypeFilter.value) return false
    if (keyword.value && !area.name.includes(keyword.value)) return false
    return true
  })
})

const pageCount = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)))

// expanded 的初始值由外部传入，这里保留一个本地兜底，避免父组件没接 v-model 时组件“打不开”
watch(() => props.modelValueExpanded, () => {})
</script>

<style scoped>
.area-list-wrap {
  position: relative;
  height: 100%;
}

.expand-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 44px;
  border: 1px solid rgba(90, 201, 255, 0.7);
  border-radius: 4px;
  cursor: pointer;
  color: #9bdfff;
  background: rgba(3, 22, 48, 0.9);
}

.expand-toggle.collapsed {
  margin-top: 4px;
}

.expand-toggle.attached {
  position: absolute;
  top: 50%;
  left: -14px;
  z-index: 5;
  transform: translateY(-50%);
}

.chevron {
  width: 14px;
  height: 14px;
}

.chevron.rotated {
  transform: rotate(180deg);
}

.area-list-panel {
  position: relative;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  width: clamp(300px, 24vw, 380px);
  max-height: 100%;
  border: 1px solid rgba(90, 201, 255, 0.7);
  border-radius: 6px;
  color: #d9f5ff;
  background:
    linear-gradient(180deg, rgba(7, 44, 78, 0.96), rgba(3, 22, 48, 0.97)),
    rgba(3, 22, 48, 0.95);
  box-shadow:
    0 0 0 1px rgba(42, 159, 255, 0.15) inset,
    0 10px 28px rgba(0, 0, 0, 0.35);
}

.list-header {
  padding: 16px 16px 12px;
  border-bottom: 1px solid rgba(118, 213, 255, 0.18);
}

.header-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}

.title {
  color: #fff;
  font-size: 17px;
  font-weight: 600;
}

.subtitle {
  margin-top: 4px;
  color: #8fb9cc;
  font-size: 12px;
}

.header-actions {
  display: flex;
  flex-shrink: 0;
  gap: 8px;
}

.header-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 10px;
  border: 1px solid rgba(125, 213, 255, 0.55);
  border-radius: 3px;
  cursor: pointer;
  color: #c8efff;
  background: rgba(8, 66, 104, 0.6);
  font-size: 12px;
  white-space: nowrap;
}

.header-btn.primary {
  border-color: #49d5ff;
  color: #fff;
  background: rgba(12, 130, 178, 0.85);
}

.btn-icon {
  width: 12px;
  height: 12px;
}

.filter-row {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.filter-select {
  flex: 1;
  min-width: 0;
  height: 30px;
  padding: 0 8px;
  border: 1px solid rgba(101, 195, 238, 0.4);
  border-radius: 3px;
  color: #d9f5ff;
  background: rgba(0, 18, 39, 0.6);
  font-size: 12px;
}

.search-box {
  display: flex;
  flex: 1.4;
  align-items: center;
  min-width: 0;
  height: 30px;
  padding: 0 8px;
  border: 1px solid rgba(101, 195, 238, 0.4);
  border-radius: 3px;
  background: rgba(0, 18, 39, 0.6);
}

.search-icon {
  width: 12px;
  height: 12px;
  margin-right: 4px;
  color: #7fa8bb;
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  color: #d9f5ff;
  background: transparent;
  font-size: 12px;
}

.list-body {
  flex: 1;
  min-height: 0;
  padding: 8px 12px;
  overflow-y: auto;
}

.area-card {
  padding: 10px 12px;
  margin-bottom: 8px;
  border: 1px solid transparent;
  border-radius: 5px;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.03);
  transition: background 0.15s, border-color 0.15s;
}

.area-card:hover {
  background: rgba(82, 190, 245, 0.1);
}

.area-card.active {
  border-color: #49d5ff;
  background: rgba(82, 190, 245, 0.16);
}

.card-top {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tag {
  padding: 1px 6px;
  border-radius: 3px;
  color: #8de7b0;
  background: rgba(45, 145, 90, 0.3);
  font-size: 11px;
  white-space: nowrap;
}

.tag-survey {
  color: #7fc3ff;
  background: rgba(43, 130, 179, 0.35);
}

.card-name {
  overflow: hidden;
  color: #effbff;
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-bottom {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 6px;
}

.card-meta {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #7fa8bb;
  font-size: 11px;
}

.meta-icon {
  width: 11px;
  height: 11px;
}

.card-ops {
  display: flex;
  flex-shrink: 0;
  gap: 4px;
  margin-left: auto;
}

.op-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  color: #9bdfff;
  background: transparent;
}

.op-btn svg {
  width: 13px;
  height: 13px;
}

.op-btn:hover {
  background: rgba(255, 255, 255, 0.08);
}

.op-btn.danger:hover {
  color: #ff7e7e;
}

.empty-state {
  padding: 30px 0;
  color: #6f93a6;
  font-size: 12px;
  text-align: center;
}

.list-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border-top: 1px solid rgba(118, 213, 255, 0.18);
}

.footer-total {
  color: #7fa8bb;
  font-size: 12px;
}

.pager {
  display: flex;
  gap: 4px;
}

.pager-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 22px;
  padding: 0 4px;
  border: 1px solid rgba(101, 195, 238, 0.35);
  border-radius: 3px;
  cursor: pointer;
  color: #c8efff;
  background: transparent;
  font-size: 11px;
}

.pager-btn.active {
  border-color: #49d5ff;
  color: #fff;
  background: rgba(12, 130, 178, 0.85);
}

.pager-btn:disabled {
  cursor: not-allowed;
  opacity: 0.4;
}
</style>
