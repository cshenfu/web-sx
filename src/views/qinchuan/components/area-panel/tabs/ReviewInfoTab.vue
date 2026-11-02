<template>
  <div class="review-info-tab">
    <!-- 顶部进度条 -->
    <div v-if="safeData.timeline.length" class="progress-bar">
      <div v-for="(step, idx) in safeData.timeline" :key="step.key ?? idx" class="progress-step">
        <div class="progress-label">{{ step.label }}</div>
        <div class="progress-track">
          <span class="progress-dot" :class="{ done: step.date }" />
          <span v-if="idx < safeData.timeline.length - 1" class="progress-line" />
        </div>
        <div class="progress-date">{{ step.date || '' }}</div>
      </div>
    </div>

    <!-- 时间轴分组 -->
    <div class="groups">
      <div v-for="(group, gi) in safeData.groups" :key="group.key ?? gi" class="group-row">
        <div class="group-axis">
          <span class="axis-stage">{{ group.stage }}</span>
          <span class="axis-dot" />
          <span class="axis-line" />
        </div>

        <div class="group-content" :class="{ active: group.active }">
          <div class="group-meta">{{ group.date }} {{ group.to }}</div>
          <div v-for="(item, idx) in group.items || []" :key="idx" class="group-item">
            <div class="item-top">
              <span class="tag">{{ item.tag }}</span>
              <span class="item-org">{{ item.org }}</span>
              <span v-if="item.docNo" class="item-doc"> | {{ item.docNo }}</span>
              <span class="item-date"> | {{ item.date }}</span>
            </div>
            <div class="item-name">{{ item.name }}</div>
            <div class="item-footer">
              <span>{{ item.operator }}</span>
              <span>{{ item.updatedAt }}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="!safeData.groups.length" class="empty-state">暂无审查信息~</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  data: { type: Object, default: () => ({}) },
})

// ★ 归一化：timeline / groups 一定存在且为数组
const safeData = computed(() => {
  const d = props.data || {}
  return {
    timeline: Array.isArray(d.timeline) ? d.timeline : [],
    groups: Array.isArray(d.groups) ? d.groups : [],
  }
})
</script>

<style scoped>
.review-info-tab {
  padding: 16px 24px;
  overflow-y: auto;
  height: 100%;
  box-sizing: border-box;
}

/* ============ 顶部进度条 ============ */
.progress-bar {
  display: flex;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.5);
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.progress-step { flex: 1; text-align: center; }

.progress-label {
  color: #6B7280;
  font-size: 13px;
}

.progress-track {
  position: relative;
  display: flex;
  align-items: center;
  margin-top: 8px;
}

.progress-dot {
  z-index: 1;
  width: 10px;
  height: 10px;
  margin: 0 auto;
  border-radius: 50%;
  background: #BFDBFE;
}

.progress-dot.done {
  background: #2563EB;
}

.progress-line {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 2px;
  background: #E5E7EB;
  transform: translateY(-50%);
}

.progress-date {
  margin-top: 6px;
  color: #9CA3AF;
  font-size: 12px;
}

/* ============ 时间轴分组 ============ */
.groups {
  margin-top: 20px;
}

.group-row {
  display: flex;
  gap: 16px;
}

.group-axis {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 40px;
  flex-shrink: 0;
}

.axis-stage {
  color: #6B7280;
  font-size: 13px;
  white-space: nowrap;
  font-weight: 500;
}

.axis-dot {
  width: 8px;
  height: 8px;
  margin-top: 6px;
  border-radius: 50%;
  background: #9CA3AF;
}

.axis-line {
  flex: 1;
  width: 2px;
  margin-top: 4px;
  background: #E5E7EB;
}

.group-content {
  flex: 1;
  min-width: 0;
  padding: 16px;
  margin-bottom: 16px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.5);
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.group-content.active {
  border-color: #2563EB;
  background: rgba(37, 99, 235, 0.05);
  box-shadow: 0 2px 6px rgba(37, 99, 235, 0.1);
}

.group-meta {
  color: #1F2937;
  font-size: 14px;
  font-weight: 700;
}

.group-item {
  padding-top: 12px;
  margin-top: 12px;
  border-top: 1px solid rgba(209, 213, 219, 0.5);
}

.group-item:first-of-type {
  border-top: none;
}

.item-top {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  font-size: 12px;
}

.tag {
  padding: 2px 8px;
  border-radius: 4px;
  color: #1D4ED8;
  background: rgba(37, 99, 235, 0.1);
  font-size: 11px;
  font-weight: 500;
}

.item-org,
.item-doc,
.item-date {
  color: #6B7280;
}

.item-name {
  margin-top: 8px;
  color: #374151;
  font-size: 13px;
}

.item-footer {
  display: flex;
  gap: 16px;
  margin-top: 8px;
  color: #9CA3AF;
  font-size: 12px;
}

.empty-state {
  padding: 48px 0;
  color: #9CA3AF;
  font-size: 12px;
  text-align: center;
}
</style>