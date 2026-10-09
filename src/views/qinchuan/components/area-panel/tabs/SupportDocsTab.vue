<!-- components/area-panel/tabs/SupportDocsTab.vue -->
<template>
  <div class="support-docs-tab">
    <div class="stage-tabs">
      <button
        v-for="stage in data.stages"
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
        v-for="filter in data.typeFilters"
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
      <button type="button" class="add-btn" @click="$emit('add-data')">
        添加数据
        <svg viewBox="0 0 16 16" class="add-icon"><path d="M8 3v10M3 8h10" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
      </button>
    </div>

    <div class="file-list">
      <FileListItem
        v-for="(file, idx) in filteredFiles"
        :key="idx"
        :file="{ ...file, actions: ['download', 'edit', 'delete'] }"
        @action="(action, f) => $emit('file-action', action, f)"
      />
      <div v-if="!filteredFiles.length" class="empty-state">暂无数据~</div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import FileListItem from '../../shared/FileListItem.vue'

const props = defineProps({
  data: { type: Object, required: true },
})

defineEmits(['add-data', 'file-action'])

const activeStage = ref(props.data.activeStage || props.data.stages[0])
const activeFilter = ref('')

const filteredFiles = computed(() => {
  if (!activeFilter.value) return props.data.files
  const label = props.data.typeFilters.find((f) => f.key === activeFilter.value)?.label
  return props.data.files.filter((file) => file.tag === label)
})
</script>

<style scoped>
.support-docs-tab {
  padding: 16px 20px;
  overflow-y: auto;
}

.stage-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  border-bottom: 1px solid rgba(118, 213, 255, 0.18);
}

.stage-tab {
  padding: 8px 10px;
  border: none;
  background: none;
  color: #9bdfff;
  font-size: 13px;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  white-space: nowrap;
}

.stage-tab.active {
  color: #52c1ff;
  border-bottom-color: #52c1ff;
  font-weight: 600;
}

.type-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.type-pill {
  padding: 5px 12px;
  border-radius: 999px;
  cursor: pointer;
  color: #d9f5ff;
  font-size: 12px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid transparent;
}

.pill-pink {
  color: #ffb3c6;
  background: rgba(180, 60, 90, 0.25);
}

.pill-green {
  color: #8de7b0;
  background: rgba(45, 145, 90, 0.25);
}

.type-pill.active {
  border-color: currentColor;
}

.file-list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16px;
}

.file-list-title {
  color: #effbff;
  font-size: 13px;
  font-weight: 600;
}

.add-btn {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 0;
  border: none;
  background: none;
  color: #52c1ff;
  font-size: 12px;
  cursor: pointer;
}

.add-icon {
  width: 12px;
  height: 12px;
}

.file-list {
  margin-top: 6px;
}

.empty-state {
  padding: 14px 0;
  color: #6f93a6;
  font-size: 12px;
}
</style>
