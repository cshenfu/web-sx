<template>
  <aside class="left-dashboard">
    <ProjectOverview
      v-model="selectedStage"
      :rows="projectRows"
      @select="handleProjectSelect"
    />
    <AnnualTarget :data="annualData" />
    <ProgressWarning :items="warningItems" />
  </aside>
</template>

<script setup>
import { ref } from 'vue'
import ProjectOverview from './ProjectOverview.vue'
import AnnualTarget from './AnnualTarget.vue'
import ProgressWarning from './ProgressWarning.vue'
import {
  annualTargetData,
  progressWarningData,
  projectOverviewRows,
} from '../js/dashboardMcokData'

const props = defineProps({
  projectRows: {
    type: Array,
    default: () => projectOverviewRows,
  },
  annualData: {
    type: Object,
    default: () => annualTargetData,
  },
  warningItems: {
    type: Array,
    default: () => progressWarningData,
  },
  modelValue: {
    type: [String, Number],
    default: null,
  },
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
  display: grid;
  width: clamp(238px, 23vw, 326px);
  gap: 10px;
}

@media (max-width: 1200px) {
  .left-dashboard {
    width: clamp(220px, 25vw, 300px);
    gap: 7px;
  }
}

@media (max-width: 700px) {
  .left-dashboard {
    width: min(86vw, 326px);
  }
}
</style>