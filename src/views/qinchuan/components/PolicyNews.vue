<template>
    <section class="dashboard-panel news-panel">
      <div class="panel-heading">
        <span class="heading-mark">●</span>
        <span class="panel-title">政策新闻</span>
        <span class="panel-unit">POLICY NEWS</span>
      </div>
  
      <div class="news-body">
        <img class="news-icon" :src="newsIcon" alt="" />
        <div class="news-list">
          <button
            v-for="news in items"
            :key="news.id"
            type="button"
            class="news-item"
            @click="emit('news-click', news)"
          >
            <span class="news-bullet">›</span>
            <span class="news-title">{{ news.title }}</span>
            <time>{{ news.date }}</time>
          </button>
        </div>
      </div>
    </section>
  </template>
  
  <script setup>
  import newsIcon from '@/assets/img/qinchuan/dashbord/zc.png'
  import { policyNewsData } from '../js/dashboardMcokData'
  
  defineProps({
    items: {
      type: Array,
      default: () => policyNewsData,
    },
  })
  
  const emit = defineEmits(['news-click'])
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
    font-size: 10px;
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
    font-size: 9px;
  }
  
  .news-body {
    display: flex;
    height: calc(100% - 33px);
    min-height: 0;
    align-items: center;
    gap: 9px;
    padding: 8px 9px;
  }
  
  .news-icon {
    width: 39px;
    height: 39px;
    flex: 0 0 auto;
    object-fit: contain;
    filter: drop-shadow(0 0 8px rgba(73, 199, 255, 0.45));
  }
  
  .news-list {
    min-width: 0;
    flex: 1;
  }
  
  .news-item {
    display: grid;
    width: 100%;
    grid-template-columns: 9px minmax(0, 1fr) auto;
    align-items: center;
    gap: 3px;
    min-height: 22px;
    padding: 0;
    border: 0;
    background: transparent;
    color: #b8dff1;
    cursor: pointer;
    text-align: left;
  }
  
  .news-item:hover {
    color: #6ceaff;
  }
  
  .news-bullet {
    color: #52dff8;
    font-size: 14px;
  }
  
  .news-title {
    overflow: hidden;
    font-size: 9px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  .news-item time {
    color: #6794b1;
    font-size: 8px;
  }
  
  @media (max-height: 820px), (max-width: 1200px) {
    .panel-heading {
      min-height: 29px;
    }
  
    .news-body {
      height: calc(100% - 29px);
      gap: 6px;
      padding: 5px 6px;
    }
  
    .news-icon {
      width: 31px;
      height: 31px;
    }
  
    .news-item {
      min-height: 19px;
    }
  
    .news-title {
      font-size: 8px;
    }
  }
  </style>