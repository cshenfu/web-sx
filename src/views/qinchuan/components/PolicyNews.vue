<template>
  <section class="dashboard-panel news-panel">
    <div class="news-body">
      <!-- 左侧：大图标（无边框，直接展示） -->
      <div class="icon-wrapper">
        <img :src="newsIcon" class="big-icon" alt="政策新闻" />
      </div>

      <!-- 右侧：内容区 -->
      <div class="news-content">
        <!-- 顶部标题行 -->
        <div class="news-header">
          <div class="title-box">
            <span class="new-tag">NEW</span>
            <span class="title-text">政策新闻</span>
          </div>
          <span class="more-link" @click="emit('more-click')">更多 &gt;&gt;</span>
        </div>

        <!-- 新闻列表：支持滚动 -->
        <div class="news-list">
          <button
            v-for="news in items"
            :key="news.id"
            type="button"
            class="news-item"
            @click="emit('news-click', news)"
          >
            <span class="news-tag">集团</span>
            <span class="news-title">{{ news.title }}</span>
            <time class="news-date">{{ news.date }}</time>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import newsIcon from '@/assets/img/qinchuan/dashbord/zcxw.png'
import { policyNewsData } from '../js/dashboardMcokData'

defineProps({
  items: { type: Array, default: () => policyNewsData },
})

const emit = defineEmits(['news-click', 'more-click'])
</script>

<style scoped>
/* ⭐️ 完全去掉边框，只保留给定的渐变背景 */
.dashboard-panel {
  position: relative; 
  width: 100%; 
  height: 100%; 
  box-sizing: border-box; 
  display: flex; 
  flex-direction: column; 
  min-height: 0;
  
  /* 去除边框，使用你提供的渐变 */
  border: none;
  border-radius: 4px; 
  background: linear-gradient(90deg, rgba(41, 145, 247, 0.3) 0%, rgba(41, 145, 247, 0) 100%);
  
  margin-top: 0 !important;
  /* 移除 overflow: hidden 以允许内部滚动 */
}

/* 左右布局 */
.news-body {
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center; /* 垂直居中，图标自然占位 */
  gap: 16px;
  padding: 0 12px;
}

/* 左侧图标（去除所有框） */
.icon-wrapper {
  flex: 0 0 auto;
  width: 80px; 
  height: 80px; 
  display: flex;
  align-items: center;
  justify-content: center;
}

.big-icon {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 0 10px rgba(0, 150, 255, 0.6));
}

/* 右侧内容区 */
.news-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  height: 100%;
  padding-top: 10px;
  padding-bottom: 10px;
  box-sizing: border-box;
}

/* 标题行 */
.news-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 6px;
  flex-shrink: 0; /* 标题不允许被压缩 */
}

.title-box {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.new-tag {
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 900;
  color: #127EFF;
  font-style: italic;
  text-shadow: 0 0 6px rgba(18, 126, 255, 0.5);
}

.title-text {
  font-family: 'YouSheBiaoTiHei', sans-serif;
  font-size: 20px;
  font-weight: 800;
  font-style: italic;
  color: #FFFFFF;
  letter-spacing: 1px;
  transform: skewX(-8deg);
  text-shadow: 0 2px 4px rgba(0,0,0,0.6);
}

.more-link {
  font-family: 'PingFang SC', sans-serif;
  font-size: 11px;
  color: #00E5FF;
  cursor: pointer;
  transform: translateY(-2px);
}

/* ⭐️ 列表区：支持内部滚动 */
.news-list {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  overflow-y: auto; /* 允许滚动 */
  scrollbar-width: none; /* 隐藏滚动条但保持可滚动 */
}

.news-list::-webkit-scrollbar {
  display: none;
}

.news-item {
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 22px;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  text-align: left;
  flex-shrink: 0; /* 防止滚动时被压缩 */
}

.news-item:hover .news-title {
  color: #6ceaff;
}

/* 标签 */
.news-tag {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 18px;
  background: rgba(18, 125, 252, 0.2); /* 稍微加深一点背景以适配无边框 */
  border-radius: 2px;
  font-family: 'Inter', sans-serif;
  font-size: 11px;
  color: #1177F4;
  margin-right: 8px;
}

/* 标题 */
.news-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: 'PingFang SC', sans-serif;
  font-size: 11px;
  color: #E6F7FF;
  transition: color 0.2s;
}

/* 日期 */
.news-date {
  flex-shrink: 0;
  margin-left: 10px;
  font-family: 'PingFang SC', sans-serif;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
}
</style>