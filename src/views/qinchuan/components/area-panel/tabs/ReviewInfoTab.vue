<!-- components/area-panel/tabs/ReviewInfoTab.vue -->
<template>
  <div class="review-info-tab">
    <!-- 顶部进度条 -->
    <div class="progress-bar">
      <div v-for="(step, idx) in data.timeline" :key="step.key" class="progress-step">
        <div class="progress-label">{{ step.label }}</div>
        <div class="progress-track">
          <span class="progress-dot" :class="{ done: step.date }" />
          <span v-if="idx < data.timeline.length - 1" class="progress-line" />
        </div>
        <div class="progress-date">{{ step.date || '' }}</div>
      </div>
    </div>

    <!-- 时间轴分组 -->
    <div class="groups">
      <div v-for="group in data.groups" :key="group.key" class="group-row">
        <div class="group-axis">
          <span class="axis-stage">{{ group.stage }}</span>
          <span class="axis-dot" />
          <span class="axis-line" />
        </div>

        <div class="group-content" :class="{ active: group.active }">
          <div class="group-meta">{{ group.date }} {{ group.to }}</div>
          <div v-for="(item, idx) in group.items" :key="idx" class="group-item">
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
    </div>
  </div>
</template>

<script setup>
defineProps({
  data: { type: Object, required: true },
})
</script>

<style scoped>
.review-info-tab {
  padding: 16px 20px;
  overflow-y: auto;
}

.progress-bar {
  display: flex;
  padding: 12px 8px;
  border: 1px solid rgba(118, 213, 255, 0.18);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.02);
}

.progress-step {
  flex: 1;
  text-align: center;
}

.progress-label {
  color: #9bdfff;
  font-size: 12px;
}

.progress-track {
  position: relative;
  display: flex;
  align-items: center;
  margin-top: 8px;
}

.progress-dot {
  z-index: 1;
  width: 8px;
  height: 8px;
  margin: 0 auto;
  border-radius: 50%;
  background: rgba(155, 223, 255, 0.3);
}

.progress-dot.done {
  background: #52c1ff;
}

.progress-line {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 1px;
  background: rgba(118, 213, 255, 0.25);
  transform: translateY(-50%);
}

.progress-date {
  margin-top: 6px;
  color: #7fa8bb;
  font-size: 11px;
}

.groups {
  margin-top: 18px;
}

.group-row {
  display: flex;
  gap: 12px;
}

.group-axis {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 40px;
  flex-shrink: 0;
}

.axis-stage {
  color: #7fa8bb;
  font-size: 12px;
  white-space: nowrap;
}

.axis-dot {
  width: 7px;
  height: 7px;
  margin-top: 6px;
  border-radius: 50%;
  background: rgba(155, 223, 255, 0.5);
}

.axis-line {
  flex: 1;
  width: 1px;
  margin-top: 4px;
  background: rgba(118, 213, 255, 0.2);
}

.group-content {
  flex: 1;
  min-width: 0;
  padding: 12px;
  margin-bottom: 14px;
  border: 1px solid transparent;
  border-radius: 6px;
}

.group-content.active {
  border-color: #49d5ff;
  background: rgba(82, 190, 245, 0.08);
}

.group-meta {
  color: #effbff;
  font-size: 13px;
  font-weight: 600;
}

.group-item {
  padding-top: 10px;
  margin-top: 10px;
  border-top: 1px solid rgba(118, 213, 255, 0.1);
}

.group-item:first-of-type {
  border-top: none;
}

.item-top {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
  font-size: 12px;
}

.tag {
  padding: 1px 6px;
  border-radius: 3px;
  color: #9bdfff;
  background: rgba(43, 130, 179, 0.35);
  font-size: 11px;
}

.item-org,
.item-doc,
.item-date {
  color: #8fb9cc;
}

.item-name {
  margin-top: 6px;
  color: #effbff;
  font-size: 13px;
}

.item-footer {
  display: flex;
  gap: 12px;
  margin-top: 6px;
  color: #7fa8bb;
  font-size: 11px;
}
</style>
