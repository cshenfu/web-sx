<template>
  <aside class="right-dashboard">
    <InvestmentOverview :data="investmentData" />
    <StrategicPlanning :data="strategyData" />
    <PolicyNews :items="newsItems" @news-click="emit('news-click', $event)" />
  </aside>
</template>

<script setup>
import InvestmentOverview from './InvestmentOverview.vue'
import StrategicPlanning from './StrategicPlanning.vue'
import PolicyNews from './PolicyNews.vue'
import { investmentOverviewData, policyNewsData, strategyPlanningData } from '../js/dashboardMcokData'

defineProps({
  investmentData: { type: Object, default: () => investmentOverviewData },
  strategyData: { type: Object, default: () => strategyPlanningData },
  newsItems: { type: Array, default: () => policyNewsData },
})

const emit = defineEmits(['news-click'])
</script>

<style scoped>
.right-dashboard {
  display: flex;
  flex-direction: column;
  width: clamp(238px, 23vw, 326px);
  height: 100%;
  box-sizing: border-box;
  padding-top: 20px; /* 给悬浮头部留空间 */
  padding-bottom: 10px;
  gap: 20px; 
}

/* ⭐️ 按 Figma 比例 470 : 271 : 102 分配 */
.right-dashboard > :nth-child(1) { flex: 430; min-height: 0; }
.right-dashboard > :nth-child(2) { flex: 280; min-height: 0; }
.right-dashboard > :nth-child(3) { flex: 102; min-height: 0; }

.right-dashboard > :deep(.dashboard-panel) {
  width: 100%;
  display: flex;
  flex-direction: column;
  margin-top: 0 !important;
  min-height: 0;
}

@media (max-width: 1200px) {
  .right-dashboard {
    width: clamp(220px, 25vw, 300px);
    gap: 8px;
  }
}
</style>