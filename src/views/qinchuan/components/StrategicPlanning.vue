<template>
    <section class="dashboard-panel strategy-panel">
      <div class="panel-heading">
        <span class="heading-mark">◆</span>
        <span class="panel-title">“十五五”战略规划</span>
        <span class="panel-unit">{{ data.year || '十五五' }}</span>
      </div>
  
      <div class="strategy-body">
        <div class="strategy-targets">
          <div
            v-for="target in data.targets"
            :key="target.key"
            class="strategy-target"
          >
            <strong>{{ formatValue(target.value) }}</strong>
            <small>{{ target.unit }}</small>
            <span>{{ target.label }}</span>
            <b>{{ target.completionRate }}%完成率</b>
            <i :style="{ width: `${target.completionRate}%` }" />
          </div>
        </div>
  
        <div class="structure-columns">
          <div class="structure-column">
            <div class="column-title">实际完成结构</div>
            <div
              v-for="item in data.actualStructure"
              :key="`actual-${item.label}`"
              class="structure-row"
            >
              <span class="direction-dot actual-dot" />
              <span>{{ item.label }}</span>
              <strong>{{ formatValue(item.value) }}</strong>
              <small>{{ item.unit }}</small>
              <em>{{ item.percentage }}%</em>
            </div>
          </div>
  
          <div class="structure-column">
            <div class="column-title">十五五期间新增</div>
            <div
              v-for="item in data.newDuringPeriod"
              :key="`new-${item.label}`"
              class="structure-row"
            >
              <span class="direction-dot new-dot" />
              <span>{{ item.label }}</span>
              <strong>{{ formatValue(item.value) }}</strong>
              <small>{{ item.unit }}</small>
              <em>{{ item.percentage }}%</em>
            </div>
          </div>
        </div>
      </div>
    </section>
  </template>
  
  <script setup>
  import { strategyPlanningData } from '../js/dashboardMcokData'
  
  defineProps({
    data: {
      type: Object,
      default: () => strategyPlanningData,
    },
  })
  
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
  
  .strategy-body {
    display: grid;
    grid-template-rows: auto 1fr;
    height: calc(100% - 33px);
    min-height: 0;
    padding: 9px;
  }
  
  .strategy-targets {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 7px;
  }
  
  .strategy-target {
    position: relative;
    min-width: 0;
    min-height: 65px;
    padding: 7px 8px 12px;
    overflow: hidden;
    border: 1px solid rgba(70, 168, 231, 0.4);
    border-radius: 3px;
    background: linear-gradient(135deg, rgba(28, 117, 185, 0.52), rgba(12, 50, 101, 0.35));
  }
  
  .strategy-target strong {
    display: block;
    color: #58dcff;
    font-size: 16px;
    line-height: 18px;
  }
  
  .strategy-target small {
    margin-left: 3px;
    color: #8bb3ca;
    font-size: 8px;
  }
  
  .strategy-target span {
    display: block;
    margin-top: 6px;
    color: #c9eaff;
    font-size: 9px;
  }
  
  .strategy-target b {
    position: absolute;
    right: 7px;
    bottom: 12px;
    color: #80cbed;
    font-size: 8px;
    font-weight: 400;
  }
  
  .strategy-target i {
    position: absolute;
    right: 0;
    bottom: 0;
    left: 0;
    display: block;
    height: 3px;
    background: linear-gradient(90deg, #13b4e6, #69efff);
    box-shadow: 0 0 7px rgba(50, 216, 255, 0.8);
  }
  
  .strategy-target:nth-child(2) i {
    background: linear-gradient(90deg, #13b7ae, #6ce9d3);
    box-shadow: 0 0 7px rgba(51, 229, 208, 0.7);
  }
  
  .structure-columns {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    align-content: center;
    padding-top: 11px;
  }
  
  .structure-column {
    min-width: 0;
  }
  
  .column-title {
    margin-bottom: 7px;
    padding-bottom: 5px;
    border-bottom: 1px solid rgba(80, 177, 230, 0.27);
    color: #a7dfff;
    font-size: 10px;
    font-weight: 700;
  }
  
  .structure-row {
    display: grid;
    grid-template-columns: 7px minmax(0, 1fr) auto auto auto;
    align-items: center;
    gap: 3px;
    min-height: 25px;
    color: #b9dff2;
    font-size: 9px;
  }
  
  .direction-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
  }
  
  .actual-dot {
    background: #4cdbf5;
    box-shadow: 0 0 5px #4cdbf5;
  }
  
  .new-dot {
    background: #49e3c2;
    box-shadow: 0 0 5px #49e3c2;
  }
  
  .structure-row span:not(.direction-dot) {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  .structure-row strong {
    color: #d6f4ff;
    font-size: 10px;
  }
  
  .structure-row small {
    color: #6f9db8;
    font-size: 8px;
  }
  
  .structure-row em {
    color: #59dfff;
    font-size: 8px;
    font-style: normal;
  }
  
  .structure-column:last-child .structure-row em {
    color: #62e4c5;
  }
  
  @media (max-height: 820px), (max-width: 1200px) {
    .panel-heading {
      min-height: 29px;
    }
  
    .strategy-body {
      height: calc(100% - 29px);
      padding: 6px;
    }
  
    .strategy-target {
      min-height: 54px;
      padding: 5px 6px 10px;
    }
  
    .strategy-target strong {
      font-size: 14px;
    }
  
    .strategy-target span {
      margin-top: 3px;
    }
  
    .strategy-target b {
      right: 6px;
      bottom: 10px;
    }
  
    .structure-columns {
      gap: 7px;
      padding-top: 6px;
    }
  
    .column-title {
      margin-bottom: 3px;
      padding-bottom: 3px;
    }
  
    .structure-row {
      min-height: 20px;
    }
  }
  </style>