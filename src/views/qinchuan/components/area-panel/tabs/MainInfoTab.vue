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
          <a class="kv-file" href="javascript:;" @click="onFileClick(block)">{{ block.name }}</a>
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
/* 去掉内层滚动，统一交给外层 */
.main-info-tab {
  padding: 16px 24px;
  color: #374151;
  background: transparent;
  font-size: 13px;
}

/* ============ 时间轴 ============ */
.timeline {
  display: flex;
  align-items: flex-start;
  padding: 14px 16px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.5);
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}
.timeline-step { flex: 1; text-align: center; }

.step-label { color: #6B7280; font-size: 12px; }
.timeline-step.active .step-label { color: #1D4ED8; font-weight: 600; }
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
  background: #D1D5DB;
  transition: transform 0.2s;
}
.timeline-step.active .step-dot { background: #2563EB; }
.timeline-step.current .step-dot {
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.2);
  transform: scale(1.2);
  background: #2563EB;
}

.step-line {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 2px;
  background: #E5E7EB;
  transform: translateY(-50%);
}
.timeline-step.active .step-line { background: #BFDBFE; }

.step-date {
  margin-top: 6px;
  color: #9CA3AF;
  font-size: 11px;
}
.timeline-step.active .step-date { color: #1D4ED8; }
.timeline-step.current .step-date { font-weight: 600; }

/* ============ 指标卡 ============ */
.metrics-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-top: 16px;
}
.metric-card {
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.5);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}
.metric-label { color: #6B7280; font-size: 13px; }
.metric-value {
  margin-top: 8px;
  color: #111827;
  font-size: 20px;
  font-weight: 700;
  line-height: 1.2;
}
.metric-value.highlight { color: #1D4ED8; }
.metric-unit {
  margin-left: 4px;
  color: #6B7280;
  font-size: 12px;
  font-weight: 400;
}

/* ============ 规划卡 ============ */
.plan-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 16px;
}
.plan-card {
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.5);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}
.plan-card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #1F2937;
  font-size: 16px;
  font-weight: 700;
}
.dot { width: 8px; height: 8px; border-radius: 50%; background: #3B82F6; }
.dot-bolt { background: #F59E0B; }

.plan-card-rows { margin-top: 12px; }
.plan-row {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  color: #6B7280;
  font-size: 13px;
  line-height: 1.5;
}
.plan-row-label { color: #6B7280; }
.plan-row-value {
  color: #374151;
  text-align: right;
  max-width: 62%;
  word-break: break-all;
}

/* ================= 子 Tab（文件夹标签样式） ================= */
.sub-tabs {
  display: flex;
  align-items: flex-end;
  margin-top: 24px;
  border-bottom: 1px solid rgba(209, 213, 219, 0.6);
  gap:8px;
}

.sub-tab {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  padding: 8px 10px;
  background: rgba(255, 255, 255, 0.3);
  border-width: 1px 1px 0 1px;
  border-style: solid;
  border-color: rgba(255, 255, 255, 0.1);
  border-radius: 4px 4px 0 0;
  color: #000000;
  font-family: 'PingFang SC', sans-serif;
  font-size: 14px;
  line-height: 16px;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: -1px;
}

.sub-tab + .sub-tab {
  margin-left: -1px;
}

.sub-tab.active {
  background: rgba(255, 255, 255, 0.8);
  border-color: rgba(255, 255, 255, 0.6);
  color: #1D4ED8;
  z-index: 1;
}

/* ============ 子内容 ============ */
.sub-content { padding-top: 16px; }

.kv-line {
  padding: 4px 0;
  color: #374151;
  font-size: 13px;
  line-height: 1.7;
}
.kv-label { color: #6B7280; }
.kv-value { color: #374151; }
.kv-file { color: #2563EB; text-decoration: none; cursor: pointer; }
.kv-file:hover { text-decoration: underline; }

.indent-list { padding: 4px 0 4px 8px; }
.indent-line { padding: 2px 0; color: #6B7280; font-size: 12px; line-height: 1.7; }

.table-block { margin-top: 6px; }
.table-title { margin-bottom: 12px; color: #1F2937; font-size: 14px; font-weight: 600; }

/* ================= 🌟 表格区域（完美色值与圆角） ================= */
.table-scroll-wrap {
  width: 100%;
  border-radius: 8px; /* 完美圆角 */
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.05);
  overflow-x: auto; /* 支持横向滚动 */
  overflow-y: hidden;
}
.table-scroll-wrap::-webkit-scrollbar { height: 6px; }
.table-scroll-wrap::-webkit-scrollbar-track { background: transparent; }
.table-scroll-wrap::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.15); border-radius: 3px; }

/* 表格本体 */
.sub-table {
  width: 100%;
  min-width: 600px;
  border-collapse: separate;
  border-spacing: 0;
  table-layout: fixed;
}

/* 表头 */
.sub-table th {
  height: 32px;
  padding: 10px 8px;
  background: rgba(241, 245, 249, 0.6); /* 表头 60% 透明 */
  border-right: 1px solid rgba(209, 213, 219, 0.4);
  border-bottom: 1px solid rgba(209, 213, 219, 0.4);
  font-family: 'PingFang SC', sans-serif;
  font-size: 12px;
  line-height: 16px;
  font-weight: 400;
  color: #1F2937;
  text-align: left;
  white-space: nowrap;
}

/* 处理表头的左右圆角，防止背景色溢出 */
.sub-table th:first-child {
  border-top-left-radius: 8px;
}
.sub-table th:last-child {
  border-top-right-radius: 8px;
  border-right: none;
}

/* 单元格 */
.sub-table td {
  height: 32px;
  padding: 8px;
  border-right: 1px solid rgba(209, 213, 219, 0.5);
  border-bottom: 1px solid rgba(209, 213, 219, 0.4);
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 12px;
  line-height: 16px;
  color: #374151;
  text-align: left;
  white-space: nowrap;
  background: rgba(255, 255, 255, 0.3); /* 默认行 30% 透明 */
}

/* 处理最后一行的左右圆角与底边框 */
.sub-table tbody tr:last-child td {
  border-bottom: none;
}
.sub-table tbody tr:last-child td:first-child {
  border-bottom-left-radius: 8px;
}
.sub-table tbody tr:last-child td:last-child {
  border-bottom-right-radius: 8px;
  border-right: none;
}

/* 第一列特殊加粗 */
.sub-table td:first-child {
  font-weight: 700;
  font-size: 11.1px;
  color: #111827;
}

/* 🌟 鼠标悬浮背景：60% 透明 */
.sub-table tbody tr:hover td {
  background: rgba(241, 245, 249, 0.6) !important;
}

/* 去除掉默认的 hover 文字颜色变化，保持干净 */
.sub-table tbody tr:hover td:first-child {
  color: #111827; 
}

.empty-state { padding: 32px 0; color: #9CA3AF; font-size: 12px; text-align: center; }
</style>