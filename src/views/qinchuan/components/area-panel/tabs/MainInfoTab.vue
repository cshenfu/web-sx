<!-- components/area-panel/tabs/MainInfoTab.vue -->
<template>
  <div class="main-info-tab">
    <!-- 阶段时间轴 -->
    <div class="timeline">
      <div
        v-for="(step, index) in data.timeline"
        :key="step.key"
        class="timeline-step"
        :class="{ active: step.active }"
      >
        <div class="step-label">{{ step.label }}</div>
        <div class="step-track">
          <span class="step-dot" />
          <span v-if="index < data.timeline.length - 1" class="step-line" />
        </div>
        <div class="step-date">{{ step.date }}</div>
      </div>
    </div>

    <!-- 关键指标 -->
    <div class="metrics-row">
      <div v-for="metric in data.metrics" :key="metric.label" class="metric-card">
        <div class="metric-label">{{ metric.label }}</div>
        <div class="metric-value" :class="{ highlight: metric.highlight }">
          {{ metric.value }}<span class="metric-unit">{{ metric.unit }}</span>
        </div>
      </div>
    </div>

    <!-- 规划/升压站信息卡片 -->
    <div class="plan-cards">
      <div v-for="card in data.planCards" :key="card.title" class="plan-card">
        <div class="plan-card-title">
          <span class="dot" :class="`dot-${card.icon}`" />
          {{ card.title }}
        </div>
        <div class="plan-card-rows">
          <div v-for="[label, value] in card.rows" :key="label" class="plan-row">
            <span class="plan-row-label">{{ label }}</span>
            <span class="plan-row-value">{{ value }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 子 tab + 表格 -->
    <div class="sub-tabs">
      <button
        v-for="tab in data.subTabs"
        :key="tab.key"
        type="button"
        class="sub-tab"
        :class="{ active: activeSubTab === tab.key }"
        @click="activeSubTab = tab.key"
      >
        {{ tab.label }}
      </button>
    </div>

    <div class="sub-table-wrap">
      <table v-if="currentSubTab && currentSubTab.columns.length" class="sub-table">
        <thead>
          <tr>
            <th v-for="col in currentSubTab.columns" :key="col">{{ col }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, idx) in currentSubTab.rows" :key="idx">
            <td v-for="(cell, cidx) in row" :key="cidx" :class="{ link: cidx === 0 && cell.startsWith('XZ') }">
              {{ cell }}
            </td>
          </tr>
        </tbody>
      </table>
      <div v-else class="empty-state">暂无数据~</div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  data: { type: Object, required: true },
})

const activeSubTab = ref(props.data.subTabs?.[0]?.key || '')

const currentSubTab = computed(() =>
  props.data.subTabs.find((tab) => tab.key === activeSubTab.value)
)
</script>

<style scoped>
.main-info-tab {
  padding: 16px 20px;
  overflow-y: auto;
}

.timeline {
  display: flex;
  align-items: flex-start;
  padding: 14px 10px;
  border: 1px solid rgba(118, 213, 255, 0.18);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.02);
}

.timeline-step {
  flex: 1;
  text-align: center;
}

.step-label {
  color: #9bdfff;
  font-size: 12px;
}

.timeline-step.active .step-label {
  color: #52c1ff;
  font-weight: 600;
}

.step-track {
  position: relative;
  display: flex;
  align-items: center;
  margin-top: 8px;
}

.step-dot {
  z-index: 1;
  width: 8px;
  height: 8px;
  margin: 0 auto;
  border-radius: 50%;
  background: rgba(155, 223, 255, 0.4);
}

.timeline-step.active .step-dot {
  background: #52c1ff;
  box-shadow: 0 0 0 3px rgba(82, 193, 255, 0.25);
}

.step-line {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 1px;
  background: rgba(118, 213, 255, 0.25);
  transform: translateY(-50%);
}

.step-date {
  margin-top: 6px;
  color: #7fa8bb;
  font-size: 11px;
}

.metrics-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-top: 14px;
}

.metric-card {
  padding: 12px;
  border: 1px solid rgba(118, 213, 255, 0.18);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.02);
}

.metric-label {
  color: #9bdfff;
  font-size: 12px;
}

.metric-value {
  margin-top: 8px;
  color: #effbff;
  font-size: 20px;
  font-weight: 600;
}

.metric-value.highlight {
  color: #ff6b6b;
}

.metric-unit {
  margin-left: 3px;
  color: #7fa8bb;
  font-size: 12px;
  font-weight: 400;
}

.plan-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 14px;
}

.plan-card {
  padding: 14px;
  border: 1px solid rgba(118, 213, 255, 0.18);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.02);
}

.plan-card-title {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #effbff;
  font-size: 13px;
  font-weight: 600;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #52c1ff;
}

.dot-bolt {
  background: #ffcc4d;
}

.plan-card-rows {
  margin-top: 10px;
}

.plan-row {
  display: flex;
  justify-content: space-between;
  padding: 5px 0;
  color: #bcecff;
  font-size: 12px;
}

.plan-row-value {
  color: #effbff;
}

.sub-tabs {
  display: flex;
  gap: 6px;
  margin-top: 16px;
  border-bottom: 1px solid rgba(118, 213, 255, 0.18);
}

.sub-tab {
  padding: 8px 4px;
  border: none;
  background: none;
  color: #9bdfff;
  font-size: 13px;
  cursor: pointer;
  border-bottom: 2px solid transparent;
}

.sub-tab.active {
  color: #52c1ff;
  border-bottom-color: #52c1ff;
  font-weight: 600;
}

.sub-table-wrap {
  margin-top: 10px;
}

.sub-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}

.sub-table th {
  padding: 8px 6px;
  color: #7fa8bb;
  text-align: left;
  font-weight: 400;
  border-bottom: 1px solid rgba(118, 213, 255, 0.18);
}

.sub-table td {
  padding: 8px 6px;
  color: #d9f5ff;
  border-bottom: 1px solid rgba(118, 213, 255, 0.08);
}

.sub-table td.link {
  color: #52c1ff;
}

.empty-state {
  padding: 24px 0;
  color: #6f93a6;
  font-size: 12px;
  text-align: center;
}
</style>
