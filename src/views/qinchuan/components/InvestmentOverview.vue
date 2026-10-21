<template>
  <section class="dashboard-panel investment-panel">
    <!-- 统一头部 -->
    <div class="panel-heading" :style="{ backgroundImage: `url(${titleBg})` }">
      <div class="heading-left">
        <img :src="tzgkIcon" class="heading-img" alt="投资概况" />
        <span class="panel-title">投资概况</span>
      </div>
      <div class="panel-location">
        <span>{{ data.year || '2026年' }}</span>
        <svg class="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
    </div>

    <div class="investment-body">
      <!-- 顶部：年计划口径 + 大数字 -->
      <!-- 注意：增加了 no-padding 类，用于贴边 -->
      <div class="summary-header-block no-padding">
        <!-- 左侧：年计划口径 + 图片背景 -->
        <div class="summary-left">
          <div class="title-text">年计划口径</div>
          <div class="rate-bg-box" :style="{ backgroundImage: `url(${wclBg})` }">
            <strong class="rate-num">{{ data.completionRate }}%</strong>
            <span class="rate-label">完成率</span>
          </div>
        </div>

        <!-- 右侧：大数字在顶，计划和已完成在底部横条 -->
        <div class="summary-right">
          <strong class="big-num">{{ formatValue(data.completed, 2) }}</strong>
          <div class="right-bottom-bar">
            <span class="plan-text">计划: {{ formatValue(data.annualPlan, 0) }}</span>
            <span class="sub-label">已完成</span>
          </div>
        </div>
      </div>

      <!-- 中间：项目列表 -->
      <div class="energy-list">
        <div v-for="project in energyProjects" :key="project.key" class="energy-item">
          <div class="icon-wrapper">
            <img :src="project.icon" class="big-icon" alt="" />
          </div>
          
          <div class="energy-info">
            <div class="info-header">
              <span class="label">{{ project.label }}</span>
              <b class="rate">{{ project.completionRate }}%</b>
            </div>
            <div class="info-data">
              <div class="data-col">
                <span class="d-label">本年计划（万元）</span>
                <strong class="d-val">{{ formatValue(project.annualPlan, 0) }}</strong>
              </div>
              <div class="data-col">
                <span class="d-label">本年完成（万元）</span>
                <strong class="d-val highlight">{{ formatValue(project.completed, 2) }}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部：乡村振兴 -->
      <div class="support-panel">
        <div class="support-title">
          <i class="title-mark" />
          乡村振兴
        </div>
        <div class="support-grid">
          <div v-for="support in supportProjects" :key="support.key" class="support-item">
            <div class="s-icon-frame">
              <div class="s-icon-inner">
                <svg v-if="support.key === 'rural'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M12 2L22 8.5V20H2V8.5L12 2Z" />
                  <circle cx="12" cy="14" r="3" />
                </svg>
                <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <rect x="4" y="6" width="16" height="14" rx="2" />
                  <path d="M8 6V4h8v2M12 10v4M10 12h4" />
                </svg>
              </div>
            </div>
            <div class="s-info">
              <span class="s-label">{{ support.label }}</span>
              <strong class="s-val">{{ support.completed }}<span class="s-target">/{{ support.target }}</span> <span class="s-unit">{{ support.unit }}</span></strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import titleBg from '@/assets/img/qinchuan/dashbord/title-bg.png'
import tzgkIcon from '@/assets/img/qinchuan/dashbord/tzgk.png'
import windIcon from '@/assets/img/qinchuan/dashbord/fj.png'
import solarIcon from '@/assets/img/qinchuan/dashbord/tynb.png'
import wclBg from '@/assets/img/qinchuan/dashbord/wcl-bg.png' // 确保图片名字一致
import { investmentOverviewData } from '../js/dashboardMcokData'

const props = defineProps({
  data: { type: Object, default: () => investmentOverviewData },
})

const energyProjects = computed(() => [
  { ...props.data.wind, key: 'wind', icon: windIcon },
  { ...props.data.solar, key: 'solar', icon: solarIcon },
])

const supportProjects = computed(() => [
  { ...props.data.ruralSupport, key: 'rural' },
  { ...props.data.consumptionSupport, key: 'consumption' },
])

function formatValue(value, digits = 2) {
  return Number(value || 0).toLocaleString('zh-CN', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })
}
</script>

<style scoped>
/* 统一背景 */
.dashboard-panel {
  position: relative; width: 100%; height: 100%; box-sizing: border-box; display: flex; flex-direction: column; min-height: 0;
  container-type: size;
  border: 0.93px solid transparent;
  border-image: linear-gradient(162.05deg, rgba(165, 199, 238, 0.0001) 21.01%, #0077FF 51.91%, rgba(165, 199, 238, 0.2) 91.52%) 1;
  border-top: none; border-radius: 0px 0px 11px 11px;
  background: 
    linear-gradient(180deg, rgba(16, 98, 222, 0.12) 0%, rgba(57, 126, 233, 0.11) 54.88%, rgba(19, 98, 215, 0.05) 75.82%, rgba(0, 95, 223, 0.03) 100%), 
    linear-gradient(180deg, rgba(0, 40, 96, 0) 0%, rgba(0, 42, 95, 0.09) 23.24%, rgba(0, 42, 97, 0.23) 44.61%, rgba(0, 40, 96, 0.27) 100%);
  backdrop-filter: blur(14px); 
  box-shadow: inset 0 0 24px rgba(20, 136, 237, 0.1), 0 0 16px rgba(0, 116, 224, 0.13);
}

/* 统一头部 */
.panel-heading {
  position: absolute; top: -14px; left: 0; width: 100%; height: 42px;
  display: flex; align-items: center; justify-content: space-between; padding: 0 12px;
  box-sizing: border-box; background-size: 100% 100%; background-repeat: no-repeat; background-position: center; pointer-events: none;
}
.heading-left { display: flex; align-items: center; gap: 6px; transform: translateY(-4px); }
.heading-img { height: 26px; width: auto; object-fit: contain; }
.panel-title {
  font-family: 'YouSheBiaoTiHei', sans-serif; font-size: 20px; line-height: 17px; letter-spacing: 0.04em;
  color: #FFFFFF; -webkit-text-fill-color: #FFFFFF;
  transform: matrix(1, 0, -0.16, 0.99, 0, 0); text-shadow: 0px 2px 4px rgba(0, 0, 0, 0.8), 0 0 8px rgba(255, 255, 255, 0.4);
}
.panel-location { 
  display: flex; align-items: center; gap: 4px;
  font-family: 'YouSheBiaoTiHei', sans-serif; font-size: 14px; color: #fff; opacity: 0.9; transform: translateY(-4px); letter-spacing: 1px;
}
.arrow-icon { width: 12px; height: 12px; color: #00d2ff; margin-top: 2px; }

/* ⭐️ 内容区自适应 */
.investment-body {
  flex: 1; min-height: 0; display: flex; flex-direction: column;
  justify-content: safe center;
  padding:
    clamp(18px, min(5.85cqw, 5.1cqh), 30px)
    clamp(8px, min(2.93cqw, 2.55cqh), 18px)
    clamp(6px, min(2.13cqh, 16px), 16px);
  gap: clamp(12px, min(3.8cqh, 22px), 22px);
  overflow-x: hidden; overflow-y: auto; scrollbar-width: none;
}
.investment-body::-webkit-scrollbar { display: none; }

/* ============ 1. 顶部摘要 (比例缩小并贴边) ============ */
.summary-header-block {
  display: flex; align-items: flex-end; justify-content: space-between; 
  position: relative; flex-shrink: 0; padding-bottom: 4px;
}

/* 想要没有 padding，靠贴边框，使用负 margin 抵消父级 padding */
.summary-header-block.no-padding {
  margin: 0 -12px;
  width: calc(100% + 24px);
}

.summary-left { display: flex; flex-direction: column; gap: 2px; flex-shrink: 0; padding-left: 2px;}

/* 年计划口径文字 */
.title-text {
  font-family: 'YouSheBiaoTiHei', sans-serif; font-size: 13px; /* 适当缩小 */
  color: #fff; letter-spacing: 1px; text-shadow: 0 2px 4px rgba(0,0,0,0.5);
  font-style: italic; transform: skewX(-10deg);
  margin-bottom: 2px;
}

/* 完成率背景图容器 */
.rate-bg-box {
  display: flex; align-items: center; justify-content: center; gap: 4px;
  width: 140px; /* 宽度缩小 */
  height: 32px; /* 高度缩小 */
  background-size: 100% 100%; background-repeat: no-repeat;
  padding-right: 15px; /* 让内容在切角背景内居中 */
}

.rate-num {
  font-family: 'Bebas Neue', 'YouSheBiaoTiHei', sans-serif; font-size: 22px; line-height: 1; /* 字号缩小 */
  background: linear-gradient(180deg, #FFFFFF 24.74%, #FF9197 56.05%, #FF002E 86.96%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  font-style: italic; font-weight: bold;
}
.rate-label { 
  font-family: 'PingFang SC', sans-serif; font-size: 12px; color: #fff; 
  font-weight: bold; font-style: italic; margin-top: 2px; 
}

/* ⭐️ 右侧排版 */
.summary-right { 
  display: flex; flex-direction: column; align-items: flex-end; justify-content: flex-end; gap: 2px;
  flex: 1; min-width: 0; padding-right: 2px; /* 防止内容太长撑破 */
}
.big-num {
  font-family: 'Bebas Neue', 'YouSheBiaoTiHei', sans-serif; font-size: 22px; line-height: 1; /* 缩小 */
  background: linear-gradient(180deg, #FFFFFF 0%, #CAE2FF 74.24%, #8FACD7 102.38%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  letter-spacing: 1px; font-style: italic;
  white-space: nowrap;
}

/* 计划与已完成所在的渐变条 */
.right-bottom-bar {
  display: flex; align-items: center; justify-content: space-between;
  width: 100%; height: 20px; padding: 0 8px; box-sizing: border-box;
  position: relative;
}

/* 长条背景和左侧切角高光 */
.right-bottom-bar::before {
  content: ''; position: absolute; top: 0; left: 4px; right: 4px; bottom: 0;
  background: linear-gradient(90deg, rgba(14, 74, 158, 0.8) 0%, rgba(14, 74, 158, 0.1) 100%);
  transform: skewX(-30deg); z-index: -1; border-left: 2px solid #00d2ff;
}

.plan-text { 
  font-family: 'YouSheBiaoTiHei', sans-serif; font-size: 11px; /* 缩小 */
  color: #fff; letter-spacing: 1px; white-space: nowrap;
}
.sub-label { 
  font-family: 'PingFang SC', sans-serif; font-size: 11px; 
  color: rgba(255,255,255,0.6); white-space: nowrap; flex-shrink: 0;
}

/* ============ 2. 中间项目列表 ============ */
.energy-list { display: flex; flex-direction: column; gap: clamp(12px, min(2.55cqh, 20px), 20px); flex-shrink: 0; }
.energy-item { display: flex; align-items: center; gap: 10px; }
.icon-wrapper { width: 56px; height: 56px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
.big-icon { width: 100%; height: 100%; object-fit: contain; filter: drop-shadow(0 4px 10px rgba(0,150,255,0.3)); }

.energy-info { flex: 1; display: flex; flex-direction: column; min-width: 0; }

.info-header {
  display: flex; align-items: center; justify-content: space-between; padding: 2px 8px; margin-bottom: 4px;
  background: linear-gradient(90deg, rgba(34, 173, 255, 0.25) 0%, transparent 100%);
  border-left: 2px solid #0AE4F5;
}
.info-header .label { font-family: 'YouSheBiaoTiHei', sans-serif; font-size: 11px; color: #fff; letter-spacing: 1px;}
.info-header .rate {
  font-family: 'YouSheBiaoTiHei', sans-serif; font-size: 11px;
  background: linear-gradient(180deg, #FFFFFF 0%, #005BC5 74.24%, #418DFF 102.38%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
}

.info-data { display: flex; gap: 12px; padding-left: 8px; }
.data-col { flex: 1; display: flex; flex-direction: column; min-width: 0; }
.d-label { color: rgba(255,255,255,0.6); font-family: 'PingFang SC', sans-serif; font-size: 11px; }
.d-val { font-family: 'PingFang SC', sans-serif; font-size: 11px; font-weight: bold; color: #fff; margin-top: 2px; }
.d-val.highlight { color: #00BBFF; }

/* ============ 3. 底部乡村振兴 ============ */
.support-panel {
   display: flex; flex-direction: column; justify-content: center; min-height: 80px; flex-shrink: 0;
  padding: 10px 12px; 
  background: transparent;
  border: 1px solid rgba(61, 115, 255, 0.25); border-radius: 8px;
}
.support-title { 
  display: flex; align-items: center; gap: 6px; 
  font-family: 'YouSheBiaoTiHei', sans-serif; font-size: 14px; color: #fff; margin-bottom: 6px;
}
.title-mark { width: 6px; height: 12px; background: #0AE4F5; transform: skewX(-15deg); display: inline-block; border-radius: 1px;}

.support-grid { display: flex; gap: 10px; }
.support-item { flex: 1; display: flex; align-items: center; gap: 8px; min-width: 0; }

.s-icon-frame {
  position: relative; width: 28px; height: 28px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
}
.s-icon-frame::before { 
  content: ''; position: absolute; inset: 0; pointer-events: none;
  background:
    linear-gradient(#0AE4F5, #0AE4F5) top left / 6px 1px no-repeat,
    linear-gradient(#0AE4F5, #0AE4F5) top left / 1px 6px no-repeat,
    linear-gradient(#0AE4F5, #0AE4F5) top right / 6px 1px no-repeat,
    linear-gradient(#0AE4F5, #0AE4F5) top right / 1px 6px no-repeat,
    linear-gradient(#0AE4F5, #0AE4F5) bottom left / 6px 1px no-repeat,
    linear-gradient(#0AE4F5, #0AE4F5) bottom left / 1px 6px no-repeat,
    linear-gradient(#0AE4F5, #0AE4F5) bottom right / 6px 1px no-repeat,
    linear-gradient(#0AE4F5, #0AE4F5) bottom right / 1px 6px no-repeat;
}
.s-icon-inner {
  width: 18px; height: 18px; display: flex; align-items: center; justify-content: center;
  color: #0AE4F5;
}
.s-icon-inner svg { width: 100%; height: 100%; }

.s-info { display: flex; flex-direction: column; min-width: 0; }
.s-label { color: rgba(255,255,255,0.8); font-family: 'PingFang SC', sans-serif; font-size: 11px; white-space: nowrap; }
.s-val { font-family: 'Bebas Neue', 'YouSheBiaoTiHei', sans-serif; font-size: 18px; color: #fff; }
.s-target { color: #00BBFF; font-size: 16px; }
.s-unit { color: rgba(255,255,255,0.6); font-family: 'PingFang SC', sans-serif; font-size: 11px; margin-left: 2px;}
</style>