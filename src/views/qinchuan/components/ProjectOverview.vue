<template>
  <section class="dashboard-panel project-panel">
    <div class="panel-heading">
      <span class="heading-mark project-mark">▰</span>
      <span class="panel-title">项目概况</span>
      <span class="panel-unit">项目容量</span>
    </div>

    <div class="project-table">
      <div class="project-header">
        <span>项目阶段</span>
        <span class="project-type">
          <img :src="windIcon" alt="" />
          风电项目
        </span>
        <span class="project-type">
          <img :src="solarIcon" alt="" />
          光伏项目
        </span>
      </div>

      <button
        v-for="row in rows"
        :key="row.key || row.stage"
        class="project-row"
        :class="{ 'is-selected': selectedKey === (row.key || row.stage) }"
        type="button"
        @click="selectRow(row)"
      >
        <span class="stage-cell">
          <i class="stage-dot" :style="{ backgroundColor: row.color }" />
          <span>{{ row.stage }}</span>
        </span>
        <span class="capacity-cell">
          <img :src="windIcon" alt="" />
          <strong>{{ row.wind?.value ?? '-' }}</strong>
          <small>{{ row.wind?.unit || 'MW' }}</small>
        </span>
        <span class="capacity-cell">
          <img :src="solarIcon" alt="" />
          <strong>{{ row.solar?.value ?? '-' }}</strong>
          <small>{{ row.solar?.unit || 'MW' }}</small>
        </span>
      </button>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import windIcon from '@/assets/img/qinchuan/dashbord/fj.png'
import solarIcon from '@/assets/img/qinchuan/dashbord/tynb.png'
import { projectOverviewRows } from '../js/dashboardMcokData'

const props = defineProps({
  rows: {
    type: Array,
    default: () => projectOverviewRows,
  },
  modelValue: {
    type: [String, Number],
    default: null,
  },
})

const emit = defineEmits(['select', 'update:modelValue'])
const selectedKey = ref(props.modelValue || props.rows[0]?.key || props.rows[0]?.stage || null)

function selectRow(row) {
  selectedKey.value = row.key || row.stage
  emit('update:modelValue', selectedKey.value)
  emit('select', row)
}
</script>

<style scoped>
.dashboard-panel {
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(67, 161, 235, 0.48);
  border-radius: 6px;
  background:
    linear-gradient(135deg, rgba(15, 66, 113, 0.82), rgba(5, 23, 56, 0.85) 62%),
    rgba(4, 19, 47, 0.86);
  box-shadow:
    inset 0 0 24px rgba(20, 136, 237, 0.1),
    0 0 16px rgba(0, 116, 224, 0.13);
}

.panel-heading {
  display: flex;
  align-items: center;
  min-height: 33px;
  padding: 0 10px;
  border-bottom: 1px solid rgba(101, 189, 255, 0.27);
  background: linear-gradient(90deg, rgba(26, 115, 185, 0.55), rgba(17, 59, 112, 0.18));
  color: #f2f9ff;
}

.heading-mark {
  display: inline-flex;
  width: 19px;
  height: 19px;
  align-items: center;
  justify-content: center;
  margin-right: 7px;
  border: 1px solid rgba(160, 225, 255, 0.9);
  border-radius: 4px;
  color: #9ce5ff;
  font-size: 11px;
  line-height: 1;
  box-shadow: 0 0 8px rgba(80, 198, 255, 0.5);
}

.panel-title {
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.1em;
}

.panel-unit {
  margin-left: auto;
  color: #8cb5d4;
  font-size: 10px;
}

.project-table {
  padding: 6px 9px 8px;
}

.project-header,
.project-row {
  display: grid;
  grid-template-columns: 1.15fr 1fr 1fr;
  align-items: center;
  column-gap: 4px;
}

.project-header {
  height: 27px;
  padding: 0 8px;
  color: #84badc;
  font-size: 10px;
}

.project-header > span:first-child {
  padding-left: 12px;
}

.project-type {
  display: flex;
  align-items: center;
  gap: 3px;
}

.project-type img {
  width: 16px;
  height: 16px;
  object-fit: contain;
}

.project-row {
  width: 100%;
  min-height: 32px;
  margin-top: 3px;
  padding: 0 8px;
  border: 1px solid rgba(65, 150, 216, 0.24);
  border-radius: 3px;
  background: rgba(25, 84, 137, 0.25);
  color: #dceeff;
  cursor: pointer;
  text-align: left;
  transition:
    border-color 180ms ease,
    background 180ms ease,
    transform 180ms ease;
}

.project-row:hover,
.project-row.is-selected {
  border-color: rgba(122, 225, 255, 0.9);
  background: linear-gradient(90deg, rgba(22, 132, 202, 0.48), rgba(35, 89, 145, 0.26));
  box-shadow: inset 0 0 12px rgba(67, 191, 255, 0.16);
  transform: translateX(2px);
}

.stage-cell,
.capacity-cell {
  display: flex;
  align-items: center;
  min-width: 0;
}

.stage-cell {
  gap: 7px;
  font-size: 11px;
  white-space: nowrap;
}

.stage-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  flex: 0 0 auto;
  border-radius: 50%;
  box-shadow: 0 0 7px currentColor;
}

.capacity-cell {
  gap: 3px;
  color: #e9f6ff;
  font-size: 10px;
}

.capacity-cell img {
  width: 19px;
  height: 19px;
  margin-right: 2px;
  object-fit: contain;
}

.capacity-cell strong {
  color: #a9ddff;
  font-size: 11px;
  font-weight: 700;
}

.capacity-cell small {
  color: #6f9bb9;
  font-size: 9px;
}

@media (max-width: 1050px) {
  .panel-title {
    font-size: 12px;
  }

  .project-header,
  .project-row {
    grid-template-columns: 1.1fr 1fr 1fr;
  }

  .stage-cell,
  .capacity-cell {
    font-size: 9px;
  }
}

@media (max-height: 820px), (max-width: 1200px) {
  .panel-heading {
    min-height: 29px;
  }

  .project-table {
    padding: 4px 7px 5px;
  }

  .project-header {
    height: 23px;
    padding: 0 6px;
  }

  .project-row {
    min-height: 27px;
    margin-top: 2px;
    padding: 0 6px;
  }

  .project-type img {
    width: 15px;
    height: 15px;
  }

  .capacity-cell img {
    width: 17px;
    height: 17px;
  }
}
</style>