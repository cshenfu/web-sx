<template>
    <aside class="right-dashboard">
      <InvestmentOverview :data="investmentData" />
      <StrategicPlanning :data="strategyData" />
      <PolicyNews
        :items="newsItems"
        @news-click="emit('news-click', $event)"
      />
    </aside>
  </template>
  
  <script setup>
  import InvestmentOverview from './InvestmentOverview.vue'
  import StrategicPlanning from './StrategicPlanning.vue'
  import PolicyNews from './PolicyNews.vue'
  import {
    investmentOverviewData,
    policyNewsData,
    strategyPlanningData,
  } from '../js/dashboardMcokData'
  
  defineProps({
    investmentData: {
      type: Object,
      default: () => investmentOverviewData,
    },
    strategyData: {
      type: Object,
      default: () => strategyPlanningData,
    },
    newsItems: {
      type: Array,
      default: () => policyNewsData,
    },
  })
  
  const emit = defineEmits(['news-click'])
  </script>
  
  <style scoped>
  .right-dashboard {
    display: grid;
    width: clamp(238px, 23vw, 326px);
    height: 100%;
    grid-template-rows: 1.15fr 0.95fr 0.62fr;
    gap: 10px;
  }
  
  .right-dashboard > * {
    min-height: 0;
  }
  
  @media (max-width: 1200px) {
    .right-dashboard {
      width: clamp(220px, 25vw, 300px);
      gap: 7px;
    }
  }
  
  @media (max-width: 700px) {
    .right-dashboard {
      width: min(86vw, 326px);
      height: auto;
      grid-template-rows: none;
    }
  }
  </style>