<!-- components/area-panel/tabs/SurveyInfoTab.vue -->
<template>
  <div class="survey-info-tab">
    <div v-for="section in data.sections" :key="section.key" class="section-block">
      <div class="section-header">
        <span class="section-title">
          <span class="bar" />
          {{ section.title }}
        </span>
        <button type="button" class="add-btn" @click="$emit('add-data', section.key)">
          添加数据
          <svg viewBox="0 0 16 16" class="add-icon"><path d="M8 3v10M3 8h10" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
        </button>
      </div>

      <div v-if="section.extraLabel" class="section-extra">
        {{ section.extraLabel }}<a class="extra-link" href="javascript:void(0)">{{ section.extraValue }}</a>
      </div>

      <div v-if="section.description" class="section-desc">{{ section.description }}</div>

      <div v-if="section.files.length" class="file-list">
        <FileListItem
          v-for="(file, idx) in section.files"
          :key="idx"
          :file="file"
          @action="(action, f) => $emit('file-action', action, f, section.key)"
          @click="(f) => handleFileClick(f, section.key)"
        />
      </div>
      <div v-else class="empty-state">{{ section.emptyText || '暂无数据~' }}</div>
    </div>
  </div>
</template>

<script setup>
import FileListItem from '../../shared/FileListItem.vue'

defineProps({
  data: { type: Object, required: true },
})

const emit = defineEmits(['add-data', 'file-action', 'file-click'])

function handleFileClick(file, sectionKey) {
  console.log('[SurveyInfoTab] 收到 file click', file, sectionKey)
  emit('file-click', file, sectionKey)
}
</script>

<style scoped>
.survey-info-tab {
  padding: 16px 24px;
  overflow-y: auto;
  height: 100%;
  box-sizing: border-box;
}

/* 背景为浅色玻璃质感 */
.section-block {
  padding: 16px;
  margin-bottom: 16px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.5);
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.section-block:last-child {
  margin-bottom: 0;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #1F2937;
  font-size: 16px;
  font-weight: 700;
}

.bar {
  width: 4px;
  height: 16px;
  border-radius: 2px;
  background: #2563EB;
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

.section-extra {
  margin-top: 10px;
  color: #6B7280;
  font-size: 13px;
}

.extra-link {
  color: #2563EB;
  text-decoration: none;
}
.extra-link:hover { text-decoration: underline; }

.section-desc {
  margin-top: 10px;
  color: #6B7280;
  font-size: 13px;
  line-height: 1.7;
}

.file-list {
  margin-top: 12px;
}

.empty-state {
  padding: 24px 0;
  color: #9CA3AF;
  font-size: 12px;
  text-align: center;
}
</style>