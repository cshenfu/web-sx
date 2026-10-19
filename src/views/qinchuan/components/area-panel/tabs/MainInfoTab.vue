<!-- components/area-panel/tabs/MainInfoTab.vue -->
<template>
  <div class="main-info-tab">
    <!-- 时间轴 -->
    <div class="timeline">
      <div
        v-for="(step, index) in data.timeline"
        :key="step.key"
        class="timeline-step"
        :class="{ active: step.active, current: step.current }"
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

    <!-- 规划卡 -->
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

    <!-- 子 tab -->
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

    <!-- 子内容 -->
    <div class="sub-content">
      <template v-for="(block, bi) in currentBlocks" :key="bi">
        <div v-if="block.type === 'text'" class="kv-line">
          <span class="kv-label">{{ block.label }}：</span>
          <span class="kv-value">{{ block.value }}</span>
        </div>

        <div v-else-if="block.type === 'file'" class="kv-line">
          <span class="kv-label">{{ block.label }}：</span>
          <a
            class="kv-file"
            href="javascript:;"
            @click="onFileClick(block)"
          >{{ block.name }}</a>
        </div>

        <div v-else-if="block.type === 'indent'" class="indent-list">
          <div v-for="(line, li) in block.lines" :key="li" class="indent-line">
            {{ line }}
          </div>
        </div>

        <div v-else-if="block.type === 'table'" class="table-block">
          <div v-if="block.title" class="table-title">{{ block.title }}</div>
          <table v-if="block.rows?.length" class="sub-table">
            <thead v-if="block.columns?.length">
              <tr>
                <th v-for="col in block.columns" :key="col">{{ col }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, ri) in block.rows" :key="ri">
                <td
                  v-for="(cell, ci) in row"
                  :key="ci"
                  :class="{ link: ci === 0 && String(cell).startsWith('XZ') }"
                >
                  {{ cell }}
                </td>
              </tr>
            </tbody>
          </table>
          <div v-else class="empty-state">暂无数据~</div>
        </div>
      </template>

      <div v-if="!currentBlocks.length" class="empty-state">暂无数据~</div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  data: { type: Object, default: () => ({}) },
})

const activeSubTab = ref(props.data?.subTabs?.[0]?.key || '')

watch(
  () => props.data?.subTabs,
  (tabs) => {
    if (!tabs?.length) return
    if (!tabs.find((t) => t.key === activeSubTab.value)) {
      activeSubTab.value = tabs[0].key
    }
  },
  { immediate: true }
)

const currentSubTab = computed(() =>
  (props.data?.subTabs || []).find((t) => t.key === activeSubTab.value)
)

const currentBlocks = computed(() => currentSubTab.value?.blocks || [])

function onFileClick(block) {
  if (!block.url) return
  window.open(block.url, '_blank')
}
</script>

<style scoped>
.main-info-tab {
  padding: 16px 20px;
  overflow-y: auto;
  color: #303133;
  background: transparent;
  font-size: 13px;
}

/* ============ 时间轴 ============ */
.timeline {
  display: flex;
  align-items: flex-start;
  padding: 14px 10px;
  border: 1px solid rgba(235, 238, 245, 0.8);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.8);
}
.timeline-step { flex: 1; text-align: center; }

.step-label { color: #909399; font-size: 12px; }
.timeline-step.active .step-label { color: #1677ff; font-weight: 600; }
.timeline-step.current .step-label { font-weight: 700; }

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
  background: #dcdfe6;
  transition: transform 0.2s;
}
.timeline-step.active .step-dot { background: #1677ff; }
.timeline-step.current .step-dot {
  box-shadow: 0 0 0 4px rgba(22, 119, 255, 0.2);
  transform: scale(1.2);
}

.step-line {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 1px;
  background: #e4e7ed;
  transform: translateY(-50%);
}
.timeline-step.active .step-line { background: #c6ddff; }

.step-date {
  margin-top: 6px;
  color: #a8abb2;
  font-size: 11px;
}
.timeline-step.active .step-date { color: #1677ff; }
.timeline-step.current .step-date { font-weight: 600; }

/* ============ 指标卡 ============ */
.metrics-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-top: 14px;
}
.metric-card {
  padding: 12px 14px;
  border: 1px solid rgba(235, 238, 245, 0.8);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
}
.metric-label { color: #909399; font-size: 12px; }
.metric-value {
  margin-top: 10px;
  color: #1f2d3d;
  font-size: 22px;
  font-weight: 700;
  line-height: 1.2;
}
.metric-value.highlight { color: #1677ff; }
.metric-unit {
  margin-left: 4px;
  color: #909399;
  font-size: 12px;
  font-weight: 400;
}

/* ============ 规划卡 ============ */
.plan-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 14px;
}
.plan-card {
  padding: 14px 16px;
  border: 1px solid rgba(235, 238, 245, 0.8);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
}
.plan-card-title {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #1f2d3d;
  font-size: 13px;
  font-weight: 600;
}
.dot { width: 8px; height: 8px; border-radius: 50%; background: #1677ff; }
.dot-bolt { background: #faad14; }

.plan-card-rows { margin-top: 12px; }
.plan-row {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  color: #606266;
  font-size: 12px;
  line-height: 1.5;
}
.plan-row-label { color: #909399; }
.plan-row-value {
  color: #303133;
  text-align: right;
  max-width: 62%;
  word-break: break-all;
}

/* ============ 子 tab ============ */
.sub-tabs {
  display: flex;
  gap: 12px;
  margin-top: 18px;
  border-bottom: 1px solid rgba(235, 238, 245, 0.8);
  padding-bottom: 8px;
}

.sub-tab {
  padding: 6px 16px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid transparent;
  color: #606266;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.sub-tab:hover { color: #1677ff; border-color: #a9cfff; }

.sub-tab.active {
  color: #1677ff;
  border-color: #1677ff;
  background: rgba(255, 255, 255, 1);
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(22, 119, 255, 0.15);
}

/* ============ 子内容 ============ */
.sub-content { padding-top: 12px; }

.kv-line {
  padding: 4px 0;
  color: #303133;
  font-size: 13px;
  line-height: 1.7;
}
.kv-label { color: #606266; }
.kv-value { color: #303133; }
.kv-file { color: #1677ff; text-decoration: none; cursor: pointer; }
.kv-file:hover { text-decoration: underline; }

.indent-list { padding: 4px 0 4px 8px; }
.indent-line { padding: 2px 0; color: #909399; font-size: 12px; line-height: 1.7; }

.table-block { margin-top: 6px; }
.table-title { margin-bottom: 8px; color: #303133; font-size: 13px; }
.sub-table {
  width: auto;
  min-width: 240px;
  border-collapse: collapse;
  font-size: 12px;
  border: 1px solid #ebeef5;
  background: rgba(255, 255, 255, 0.8);
}
.sub-table th {
  padding: 8px 14px;
  color: #909399;
  text-align: center;
  font-weight: 500;
  background: rgba(250, 251, 252, 0.9);
  border-bottom: 1px solid #ebeef5;
}
.sub-table td {
  padding: 8px 14px;
  color: #303133;
  text-align: center;
  border-bottom: 1px solid #f0f2f5;
}
.sub-table tbody tr:last-child td { border-bottom: none; }
.sub-table tbody tr:hover td { background: #f5f8ff; }
.sub-table td.link { color: #1677ff; }

.empty-state { padding: 32px 0; color: #a8abb2; font-size: 12px; text-align: center; }
</style>