<template>
  <div class="support-docs-tab">
    <div class="stage-tabs">
      <button
        v-for="stage in safeData.stages"
        :key="stage"
        type="button"
        class="stage-tab"
        :class="{ active: stage === activeStage }"
        @click="activeStage = stage"
      >
        {{ stage }}
      </button>
    </div>

    <div class="type-filters">
      <span
        v-for="filter in safeData.typeFilters"
        :key="filter.key"
        class="type-pill"
        :class="[`pill-${filter.color}`, { active: activeFilter === filter.key }]"
        @click="activeFilter = activeFilter === filter.key ? '' : filter.key"
      >
        {{ filter.label }}
      </span>
    </div>

    <div class="file-list-header">
      <span class="file-list-title">文件列表</span>
      <button type="button" class="add-btn" v-if="!readonly" @click="$emit('add-data', activeStage)">
        添加数据
        <svg viewBox="0 0 16 16" class="add-icon"><path d="M8 3v10M3 8h10" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
      </button>
    </div>

    <div class="file-list">
      <FileListItem
        v-for="(file, idx) in filteredFiles"
        :key="idx"
        :file="{ ...file, actions: readonly ? ['download'] : ['download', 'edit', 'delete'] }"
        @action="(action, f) => $emit('file-action', action, f)"
      />
      <div v-if="!filteredFiles.length" class="empty-state">暂无数据~</div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import FileListItem from '../../shared/FileListItem.vue'

const props = defineProps({
  data: { type: Object, default: () => ({}) },
  readonly: { type: Boolean, default: false },
})

defineEmits(['add-data', 'file-action'])

// ★ 归一化：无论父组件传不传 / 传什么，都保证 4 个字段有兜底
const safeData = computed(() => ({
  stages: [],
  activeStage: '',
  typeFilters: [],
  files: [],
  ...(props.data || {}),
}))

const activeStage = ref(safeData.value.activeStage || safeData.value.stages[0] || '')
const activeFilter = ref('')

// ★ props.data 变化（切换项目）时同步当前选中的 stage
watch(safeData, (v) => {
  if (!v.stages.includes(activeStage.value)) {
    activeStage.value = v.activeStage || v.stages[0] || ''
  }
})

const filteredFiles = computed(() => {
  let files = safeData.value.files || []
  if (activeStage.value && activeStage.value !== '全部') {
    files = files.filter((file) => file.stage === activeStage.value)
  }
  if (!activeFilter.value) return files
  const label = (safeData.value.typeFilters || []).find((f) => f.key === activeFilter.value)?.label
  return label ? files.filter((file) => file.tag === label) : files
})
</script>


<style scoped>
.support-docs-tab {
  padding: 16px 24px;
  overflow-y: auto;
  height: 100%;
  box-sizing: border-box;
}

/* ============ 阶段 Tabs ============ */
.stage-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  border-bottom: 1px solid rgba(209, 213, 219, 0.6);
  padding-bottom: 8px;
}

.stage-tab {
  padding: 6px 16px;
  border: 1px solid rgba(255, 255, 255, 0.4);
  background: rgba(255, 255, 255, 0.6);
  border-radius: 4px;
  color: #000;
  font-size: 14px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}

.stage-tab:hover {
  background: rgba(255, 255, 255, 0.8);
}

.stage-tab.active {
  color: #1D4ED8;
  border-color: #1D4ED8;
  background: rgba(255, 255, 255, 0.8);
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(29, 78, 216, 0.3);
}

/* ============ 类型筛选 ============ */
.type-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 16px;
}

.type-pill {
  padding: 4px 12px;
  border-radius: 999px;
  cursor: pointer;
  color: #374151;
  font-size: 12px;
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.4);
  transition: all 0.2s;
}

.type-pill:hover {
  background: rgba(255, 255, 255, 0.9);
}

.type-pill.active {
  border-color: #1D4ED8;
  color: #1D4ED8;
  background: rgba(255, 255, 255, 0.9);
  font-weight: 600;
}

/* 特殊分类的颜色（可选，这里保留了一点点色彩，但去掉了深色底） */
.pill-pink { color: #db2777; }
.pill-green { color: #059669; }

/* ============ 列表头 ============ */
.file-list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 20px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(209, 213, 219, 0.4);
}

.file-list-title {
  color: #1F2937;
  font-size: 14px;
  font-weight: 600;
}

.add-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  border: 1px solid #2563EB;
  border-radius: 4px;
  background: #2563EB;
  color: #fff;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}
.add-btn:hover { background: #1D4ED8; }

.add-icon { width: 12px; height: 12px; }

.file-list { margin-top: 12px; }
.empty-state { padding: 24px 0; color: #9CA3AF; font-size: 12px; text-align: center; }
</style>