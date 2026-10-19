<template>
  <div class="yanping-page">
    <!-- 渐变遮罩层 -->
    <div class="bg-overlay" />

    <!-- 主体内容区 -->
    <div class="main-content">
      <!-- 头部标题区 -->
      <div class="header-section">
        <div class="header-badge">
          <span class="dot"></span>
          研评智坊 · Evaluation Studio
        </div>
        <h1 class="page-title">智能评审工具集</h1>
        <p class="page-subtitle">面向风电、光伏项目前期工作，一站式完成可研报告评审、技经概算与财务评价。</p>
      </div>

      <!-- 卡片区域 -->
      <div class="card-container">
        <div
          v-for="item in modules"
          :key="item.key"
          class="module-card"
          :style="{ background: item.cardBg }"
        >
          <!-- 卡片头部：标签 + 图标 -->
          <div class="card-top">
            <span class="card-tag">{{ item.tag }}</span>
            <div class="card-icon">
              <svg v-if="item.key === 'review'" viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              <svg v-if="item.key === 'budget'" viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              <svg v-if="item.key === 'finance'" viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
            </div>
          </div>

          <!-- 卡片内容 -->
          <h3 class="card-title">{{ item.title }}</h3>
          <p class="card-desc">{{ item.desc }}</p>

          <!-- 卡片按钮 -->
          <el-button 
            class="card-btn" 
            @click="enter(item)"
          >
            开始使用
            <svg class="arrow-icon" viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const modules = [
  {
    key: 'review',
    tag: '评审工具',
    title: '智能评审',
    desc: '目前支持对风电、光伏项目可行性研究报告（word版本）进行一键智能评审，可智能评审项目中发电量、技经概算、财务等指标，定位异常数据，并给出合理建议值。',
    path: '/yanping/review',
    cardBg: 'linear-gradient(160deg, rgba(239, 250, 255, 0.85) 0%, rgba(175, 226, 251, 0.55) 50%, rgba(114, 209, 255, 0.460749) 94.63%, rgba(114, 209, 255, 0.45) 100%)'
  },
  {
    key: 'budget',
    tag: '概算工具',
    title: '技经概算',
    desc: '风电、光伏项目技经概算工具。可对项目静态投资、动态投资、单位千瓦造价等关键技经指标进行快速测算与对标分析。',
    path: '/yanping/budget',
    cardBg: 'linear-gradient(125.43deg, rgba(239, 254, 255, 0.646) 2.35%, rgba(223, 252, 253, 0.646) 32.15%, rgba(139, 232, 249, 0.38) 87.59%)'
  },
  {
    key: 'finance',
    tag: '财务工具',
    title: '财务评价',
    desc: '风电、光伏项目财务评价工具。涵盖资本金内部收益率、投资回收期、度电成本等核心财务指标的自动化计算与敏感性分析。',
    path: '/yanping/finance',
    cardBg: 'linear-gradient(125.14deg, rgba(255, 255, 255, 0.6375) 2.43%, rgba(244, 241, 255, 0.6375) 30.72%, rgba(211, 217, 255, 0.375) 91.81%)'
  }
]

function enter(item) {
  router.push(item.path)
}
</script>

<style scoped>
.yanping-page {
  width: 100%;
  height: 100%; 
  position: relative;
  overflow: hidden; /* 防止页面出现横向滚动条 */
  background-image: url('@/assets/img/yanping/yanping-bg.png'); 
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  justify-content: center;
  align-items: flex-start; 
  font-family: "PingFang SC", "Helvetica Neue", Helvetica, "Hiragino Sans GB", "Microsoft YaHei", Arial, sans-serif;
  box-sizing: border-box;
}

.bg-overlay {
  position: absolute;
  inset: 0;
  z-index: 1;
  background: 
    radial-gradient(circle at 0% 0%, rgba(255, 190, 220, 0.6) 0%, transparent 40%),
    radial-gradient(circle at 100% 100%, rgba(160, 200, 255, 0.6) 0%, transparent 40%),
    rgba(245, 247, 255, 0.2);
  pointer-events: none;
}

/* 内容容器 */
.main-content {
  position: relative;
  z-index: 2;
  width: 100%;
  /* 最高支持 1740 的宽度，保证在超大屏也能居中 */
  max-width: 1740px; 
  padding: 0 40px;
  /* 往上提，大概在屏幕偏上的视觉中心 */
  margin: 10vh auto 0; 
  box-sizing: border-box;
}

.header-section {
  margin-bottom: 40px;
}

.header-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(4px);
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  color: #555;
  margin-bottom: 16px;
  border: 1px solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 2px 8px rgba(100, 120, 200, 0.05);
}

.header-badge .dot {
  width: 6px;
  height: 6px;
  background: #5A5CE5;
  border-radius: 50%;
}

.page-title {
  font-size: 36px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 12px 0;
  letter-spacing: 1px;
}

.page-subtitle {
  font-size: 15px;
  color: #555;
  margin: 0;
}

/* 卡片区域 */
.card-container {
  display: flex;
  gap: 32px;
  align-items: stretch;
  width: 100%;
}

/* ================== 卡片基础状态 ================== */
.module-card {
  flex: 1;
  min-width: 0; /* 关键点：允许卡片在空间不足时收缩，防止文字把卡片撑破屏幕 */
  
  /* 宽高比与兜底高度 */
  aspect-ratio: 530 / 378;
  min-height: 378px; 
  
  border-radius: 20px;
  padding: 32px;
  display: flex;
  flex-direction: column;
  text-align: left;
  transition: all 0.3s ease;
  position: relative;
  box-sizing: border-box;
  
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 2px solid transparent; 
  box-shadow: 0 8px 32px rgba(100, 120, 200, 0.08);
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.card-tag {
  display: inline-block;
  background: linear-gradient(90deg, #DCD3FF 0%, #AFCAFF 100%);
  color: #3B3A7A;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.card-icon {
  width: 44px;
  height: 44px;
  background: #fff;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #5A5CE5;
  box-shadow: 0 4px 12px rgba(100, 120, 200, 0.1);
}

.card-title {
  font-size: 22px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 16px 0;
}

.card-desc {
  font-size: 14px;
  color: #444;
  line-height: 1.7;
  margin: 0 0 32px 0;
  flex: 1; 
}

/* ================== Hover 悬停状态 ================== */
.module-card:hover {
  transform: translateY(-6px);
  border: 2px solid #5A5CE5;
  box-shadow: 0 12px 48px rgba(90, 92, 229, 0.15);
}

/* ================== 按钮样式 ================== */
.card-btn {
  width: 120px !important;
  height: 40px !important;
  border-radius: 20px !important;
  border: 1px solid transparent !important; 
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 6px !important;
  font-weight: 500 !important;
  transition: all 0.3s ease !important;
  padding: 0 !important;
  
  background: linear-gradient(90deg, #6A5AE0, #8A7DF0) !important;
  color: #fff !important;
  box-shadow: 0 4px 12px rgba(106, 90, 224, 0.2) !important;
}

.module-card:hover .card-btn {
  background: #fff !important;
  color: #333 !important;
  border: 1px solid rgba(0, 0, 0, 0.05) !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05) !important;
}

.arrow-icon {
  margin-top: 1px;
}

/* ================== 响应式适配 ================== */

/* 屏幕宽度小于 1440 (如 1366x768) */
@media (max-width: 1440px) {
  .main-content {
    margin-top: 8vh;
    padding: 0 30px;
  }
  .card-container {
    gap: 24px;
  }
  .module-card {
    padding: 24px;
    min-height: 340px;
  }
  .card-desc {
    margin-bottom: 24px;
  }
}

/* 屏幕宽度小于 1200 (如 1280x720) */
@media (max-width: 1200px) {
  .main-content {
    margin-top: 6vh;
    padding: 0 20px;
  }
  .card-container {
    gap: 16px;
  }
  .module-card {
    padding: 20px;
    min-height: 310px;
  }
  .page-title {
    font-size: 28px;
  }
  .card-title {
    font-size: 20px;
  }
  .card-desc {
    font-size: 13px;
    margin-bottom: 16px;
  }
  .header-section {
    margin-bottom: 24px;
  }
}
</style>