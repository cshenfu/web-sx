<template>
    <section class="dashboard-panel investment-panel">
      <div class="panel-heading">
        <span class="heading-mark">◈</span>
        <span class="panel-title">投资概况</span>
        <span class="panel-unit">{{ data.year || '2026年' }}</span>
      </div>
  
      <div class="investment-body">
        <div class="investment-summary">
          <div class="summary-rate">
            <span>年计划口径</span>
            <strong>{{ data.completionRate }}<small>%</small></strong>
            <em>完成率</em>
          </div>
          <div class="summary-value">
            <span>年度计划</span>
            <strong>{{ formatValue(data.annualPlan) }}</strong>
            <small>万元</small>
          </div>
          <div class="summary-value completed-value">
            <span>已完成</span>
            <strong>{{ formatValue(data.completed) }}</strong>
            <small>万元</small>
          </div>
        </div>
  
        <div class="energy-projects">
          <div
            v-for="project in energyProjects"
            :key="project.key"
            class="energy-project"
          >
            <div class="energy-project-title">
              <img :src="project.icon" alt="" />
              <span>{{ project.label }}</span>
              <b>{{ project.completionRate }}%</b>
            </div>
            <div class="energy-project-metrics">
              <div>
                <span>本年计划（万元）</span>
                <strong>{{ formatValue(project.annualPlan) }}</strong>
              </div>
              <div>
                <span>本年完成（万元）</span>
                <strong>{{ formatValue(project.completed) }}</strong>
              </div>
            </div>
          </div>
        </div>
  
        <div class="support-grid">
          <div
            v-for="support in supportProjects"
            :key="support.key"
            class="support-item"
          >
            <div class="support-icon">{{ support.key === 'rural' ? '◇' : '▣' }}</div>
            <div class="support-copy">
              <span>{{ support.label }}</span>
              <strong>{{ support.completed }}<small>/{{ support.target }} {{ support.unit }}</small></strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  </template>
  
  <script setup>
  import { computed } from 'vue'
  import windIcon from '@/assets/img/qinchuan/dashbord/fj.png'
  import solarIcon from '@/assets/img/qinchuan/dashbord/tynb.png'
  import { investmentOverviewData } from '../js/dashboardMcokData'
  
  const props = defineProps({
    data: {
      type: Object,
      default: () => investmentOverviewData,
    },
  })
  
  const energyProjects = computed(() => [
    { ...props.data.wind, key: 'wind', icon: windIcon },
    { ...props.data.solar, key: 'solar', icon: solarIcon },
  ])
  
  const supportProjects = computed(() => [
    { ...props.data.ruralSupport, key: 'rural' },
    { ...props.data.consumptionSupport, key: 'consumption' },
  ])
  
  function formatValue(value) {
    return Number(value || 0).toLocaleString('zh-CN', {
      minimumFractionDigits: Number(value) % 1 ? 2 : 0,
      maximumFractionDigits: 2,
    })
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
    font-size: 12px;
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
  
  .investment-body {
    display: grid;
    grid-template-rows: auto 1fr auto;
    height: calc(100% - 33px);
    min-height: 0;
    padding: 8px;
  }
  
  .investment-summary {
    display: grid;
    grid-template-columns: 0.9fr 1.15fr 1.15fr;
    align-items: center;
    min-height: 69px;
    padding: 7px 8px;
    border: 1px solid rgba(52, 160, 231, 0.36);
    border-radius: 4px;
    background: rgba(11, 72, 126, 0.32);
  }
  
  .summary-rate,
  .summary-value {
    display: flex;
    min-width: 0;
    flex-direction: column;
  }
  
  .summary-rate {
    position: relative;
    padding-right: 9px;
    border-right: 1px solid rgba(85, 177, 230, 0.3);
  }
  
  .summary-rate span,
  .summary-value span {
    color: #80acc8;
    font-size: 9px;
  }
  
  .summary-rate strong {
    margin-top: 1px;
    color: #ff6485;
    font-size: 25px;
    line-height: 27px;
  }
  
  .summary-rate strong small {
    font-size: 11px;
  }
  
  .summary-rate em {
    color: #ff7892;
    font-size: 8px;
    font-style: normal;
  }
  
  .summary-value {
    padding: 0 8px;
  }
  
  .summary-value + .summary-value {
    border-left: 1px solid rgba(85, 177, 230, 0.3);
  }
  
  .summary-value strong {
    overflow: hidden;
    margin-top: 3px;
    color: #bce9ff;
    font-size: 14px;
    line-height: 20px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  .summary-value small {
    color: #769db8;
    font-size: 8px;
  }
  
  .summary-value.completed-value strong {
    color: #5ee7ff;
    font-size: 20px;
    line-height: 24px;
    text-shadow: 0 0 8px rgba(49, 213, 255, 0.28);
  }
  
  .energy-projects {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px;
    align-content: center;
    padding: 8px 0;
  }
  
  .energy-project {
    min-width: 0;
    padding: 6px 7px;
    border: 1px solid rgba(64, 151, 219, 0.3);
    border-radius: 4px;
    background: linear-gradient(135deg, rgba(25, 101, 166, 0.42), rgba(9, 43, 89, 0.27));
  }
  
  .energy-project-title {
    display: flex;
    align-items: center;
    gap: 4px;
    color: #d5efff;
    font-size: 10px;
    font-weight: 700;
  }
  
  .energy-project-title img {
    width: 25px;
    height: 25px;
    object-fit: contain;
  }
  
  .energy-project-title b {
    margin-left: auto;
    color: #55e6ff;
    font-size: 10px;
    font-weight: 500;
  }
  
  .energy-project-metrics {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 5px;
    margin-top: 5px;
  }
  
  .energy-project-metrics div {
    min-width: 0;
  }
  
  .energy-project-metrics span {
    display: block;
    overflow: hidden;
    color: #729db9;
    font-size: 8px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  .energy-project-metrics strong {
    display: block;
    overflow: hidden;
    margin-top: 3px;
    color: #b9e8ff;
    font-size: 10px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  .support-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px;
    padding-top: 7px;
    border-top: 1px solid rgba(80, 170, 225, 0.24);
  }
  
  .support-item {
    display: flex;
    min-width: 0;
    align-items: center;
    gap: 6px;
  }
  
  .support-icon {
    display: grid;
    width: 25px;
    height: 25px;
    flex: 0 0 auto;
    place-items: center;
    border: 1px solid rgba(64, 217, 238, 0.5);
    border-radius: 4px;
    background: rgba(20, 154, 197, 0.25);
    color: #45dff5;
    font-size: 15px;
  }
  
  .support-copy {
    display: flex;
    min-width: 0;
    flex-direction: column;
  }
  
  .support-copy span {
    color: #82aec8;
    font-size: 9px;
  }
  
  .support-copy strong {
    margin-top: 2px;
    color: #aeeaff;
    font-size: 12px;
  }
  
  .support-copy small {
    color: #6d9bb7;
    font-size: 8px;
    font-weight: 400;
  }
  
  @media (max-height: 820px), (max-width: 1200px) {
    .panel-heading {
      min-height: 29px;
    }
  
    .investment-body {
      height: calc(100% - 29px);
      padding: 6px;
    }
  
    .investment-summary {
      min-height: 58px;
      padding: 5px 6px;
    }
  
    .summary-rate strong {
      font-size: 21px;
      line-height: 22px;
    }
  
    .summary-value.completed-value strong {
      font-size: 16px;
      line-height: 19px;
    }
  
    .energy-projects {
      gap: 4px;
      padding: 5px 0;
    }
  
    .energy-project {
      padding: 4px 5px;
    }
  
    .energy-project-title img {
      width: 20px;
      height: 20px;
    }
  
    .support-grid {
      gap: 4px;
      padding-top: 5px;
    }
  
    .support-icon {
      width: 21px;
      height: 21px;
      font-size: 12px;
    }
  }
  </style>