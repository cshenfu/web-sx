<template>
  <aside class="left-dashboard">
    <ProjectOverview v-model="selectedStage" :rows="projectRows" @select="handleProjectSelect" />
    <AnnualTarget :data="annualData" />
    <ProgressWarning :items="warningItems" />
  </aside>
</template>

<script setup>
import { ref } from 'vue'
import ProjectOverview from './ProjectOverview.vue'
import AnnualTarget from './AnnualTarget.vue'
import ProgressWarning from './ProgressWarning.vue'
import { annualTargetData, progressWarningData, projectOverviewRows } from '../js/dashboardMcokData'

const props = defineProps({
  projectRows: { type: Array, default: () => projectOverviewRows },
  annualData: { type: Object, default: () => annualTargetData },
  warningItems: { type: Array, default: () => progressWarningData },
  modelValue: { type: [String, Number], default: null },
})

const emit = defineEmits(['project-select', 'update:modelValue'])
const selectedStage = ref(props.modelValue || props.projectRows[0]?.key || null)

function handleProjectSelect(row) {
  selectedStage.value = row.key || row.stage
  emit('update:modelValue', selectedStage.value)
  emit('project-select', row)
}
</script>

<style scoped>
.left-dashboard {
  display: flex;
  flex-direction: column;
  width: clamp(240px, 23vw, 320px);
  height: 100%; 
  box-sizing: border-box;
  padding-top: 20px; /* ⭐️ 关键：给凸出面板的头部留出安全空间 */
  padding-bottom: 10px;
  gap: 20px; 
}

/* 按比例分配高度 */
.left-dashboard > :nth-child(1) { flex: 307.5; min-height: 0; }
.left-dashboard > :nth-child(2) { flex: 230; min-height: 0; }
.left-dashboard > :nth-child(3) { flex: 297; min-height: 0; }

.left-dashboard > :deep(.dashboard-panel) {
  margin-top: 0 !important;
  width: 100%;
  display: flex;
  flex-direction: column;
  /* ⭐️ 去掉 overflow: hidden，避免切掉头部 */
  min-height: 0; 
}
</style>