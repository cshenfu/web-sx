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
  padding: 16px 20px;
  overflow-y: auto;
}

.section-block {
  padding-bottom: 16px;
  margin-bottom: 16px;
  border-bottom: 1px solid rgba(118, 213, 255, 0.14);
}

.section-block:last-child {
  border-bottom: none;
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
  color: #effbff;
  font-size: 14px;
  font-weight: 600;
}

.bar {
  width: 3px;
  height: 14px;
  border-radius: 2px;
  background: #52c1ff;
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

.section-extra {
  margin-top: 8px;
  color: #9bdfff;
  font-size: 12px;
}

.extra-link {
  color: #52c1ff;
  text-decoration: none;
}

.section-desc {
  margin-top: 8px;
  color: #bcecff;
  font-size: 12px;
  line-height: 1.7;
}

.file-list {
  margin-top: 8px;
}

.empty-state {
  padding: 14px 0;
  color: #6f93a6;
  font-size: 12px;
}
</style>