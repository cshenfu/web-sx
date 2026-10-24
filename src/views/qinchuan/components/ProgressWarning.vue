<template>
  <section class="dashboard-panel warning-panel">
    <div class="panel-heading" :style="{ backgroundImage: `url(${titleBg})` }">
      <div class="heading-left">
        <img :src="jdyjIcon" class="heading-img" alt="进度预警" />
        <span class="panel-title">进度预警</span>
      </div>
      <div class="panel-location"><span>目标完成情况</span></div>
    </div>

    <!-- 这里只循环 items，数据有几条就渲染几条 -->
    <div class="warning-list">
      <div 
        v-for="(item, index) in items" 
        :key="item.key || index" 
        class="warning-item" 
        :class="isLagging(item) ? 'is-lagging' : 'is-normal'"
      >
        <!-- 左侧状态图标 -->
        <div class="icon-wrapper">
          <div class="bracket left-bracket"></div>
          <img class="warning-icon" :src="isLagging(item) ? lagIcon : normalIcon" alt="状态" />
          <div class="bracket right-bracket"></div>
        </div>

        <!-- 中间内容区 -->
        <div class="warning-main">
          <div class="warning-title">{{ item.label }}</div>
          <div class="warning-subtitle">
            <span class="sub-label">完成/确保kW：</span>
            <span class="sub-val-actual">{{ item.actual }}</span>
            <span class="sub-divider">/</span>
            <span class="sub-val-target">{{ item.target }}</span>
          </div>
        </div>

        <!-- 右侧滞后状态块 (仅滞后时显示) -->
        <div v-if="isLagging(item)" class="lag-badge">
          <span class="lag-text">滞后</span>
          <span class="lag-num">{{ item.target - item.actual }}</span>
          <span class="lag-unit">{{ item.unit || 'MW' }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import titleBg from '@/assets/img/qinchuan/dashbord/title-bg.png'
import jdyjIcon from '@/assets/img/qinchuan/dashbord/jdyj.png'
import normalIcon from '@/assets/img/qinchuan/dashbord/zc.png'
import lagIcon from '@/assets/img/qinchuan/dashbord/zh.png'
// 移除了旧 mock 数据的引入，防止外部旧数据干扰

const props = defineProps({ 
  items: { 
    type: Array, 
    default: () => [
      // 强制默认只给 3 条，对应你的截图
      { label: '建设规模', actual: 260, target: 300, unit: 'MW' },
      { label: '核准备案', actual: 213, target: 233, unit: 'MW' },
      { label: '投资决策', actual: 233, target: 233, unit: 'MW' }
    ]
  } 
})

// 判断是否滞后
function isLagging(item) {
  return item.actual < item.target
}
</script>

<style scoped>
.dashboard-panel {
  position: relative; width: 100%; box-sizing: border-box;
  border: 0.93px solid transparent;
  border-image: linear-gradient(162.05deg, rgba(165, 199, 238, 0.0001) 21.01%, #0077FF 51.91%, rgba(165, 199, 238, 0.2) 91.52%) 1;
  border-top: none; border-radius: 0px 0px 11px 11px;
  background: linear-gradient(180deg, rgba(16, 98, 222, 0.12) 0%, rgba(57, 126, 233, 0.11) 54.88%, rgba(19, 98, 215, 0.05) 75.82%, rgba(0, 95, 223, 0.03) 100%), linear-gradient(180deg, rgba(0, 40, 96, 0) 0%, rgba(0, 42, 95, 0.09) 23.24%, rgba(0, 42, 97, 0.23) 44.61%, rgba(0, 40, 96, 0.27) 100%);
  backdrop-filter: blur(14px); box-shadow: inset 0 0 24px rgba(20, 136, 237, 0.1), 0 0 16px rgba(0, 116, 224, 0.13);
  margin-top: 14px; 
  container-type: size;
}
.panel-heading {
  position: absolute; top: -14px; left: 0; width: 100%; height: 42px;
  display: flex; align-items: center; justify-content: space-between; padding: 0 12px;
  box-sizing: border-box; background-size: 100% 100%; background-repeat: no-repeat; background-position: center; pointer-events: none;
}
.heading-left { display: flex; align-items: center; gap: 6px; transform: translateY(-4px); }
.heading-img { height: 26px; width: auto; object-fit: contain; }
.panel-title {
  font-family: 'YouSheBiaoTiHei', sans-serif; font-size: 20px;
  background: linear-gradient(180deg, #FFFFFF 24.68%, #CAE2FF 69.7%, #8FACD7 86.96%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  transform: matrix(1, 0, -0.16, 0.99, 0, 0);
}
.panel-location { font-family: 'PingFang SC', sans-serif; font-size: 12px; font-weight: 500; color: #fff; opacity: 0.8; transform: translateY(-4px); }

/* ================= 列表区域 ================= */
.warning-list {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  padding: 32px 14px 16px;
  gap: 10px;
}

.warning-item { 
  position: relative; 
  display: flex; 
  align-items: center; /* 让右侧块撑满高度 */
  flex: 1;
  min-height: 52px;
  padding: 4px 0; 
  box-sizing: border-box; 
  border-radius: 2px;
}
.warning-item.is-normal { border: 0.93px solid rgba(27, 126, 242, 0.1); background: rgba(27, 126, 242, 0.05); }
.warning-item.is-lagging { border: 0.93px solid rgba(255, 56, 107, 0.1); background: rgba(255, 56, 107, 0.05); }

/* --- 左侧图标装饰区 --- */
.icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  width: 54px;
  flex-shrink: 0;
  border-right: 0.93px solid transparent; 
}
.is-normal .icon-wrapper { border-right-color: rgba(27, 126, 242, 0.3); }
.is-lagging .icon-wrapper { border-right-color: rgba(255, 0, 61, 0.3); }

.warning-icon {
  width: 32px;
  height: 32px;
  object-fit: contain;
  margin: 0 2px;
}

/* 括号形状装饰 [ 和 ] */
.bracket {
  width: 4px;
  height: 24px;
  position: relative;
}
.bracket::before,
.bracket::after {
  content: '';
  position: absolute;
  width: 4px;
  height: 4px;
  border-style: solid;
}
.is-lagging .bracket::before,
.is-lagging .bracket::after { border-color: #FF003D; }
.is-normal .bracket::before,
.is-normal .bracket::after { border-color: #1B7EF2; }

.left-bracket::before { top: 0; left: 0; border-width: 1.5px 0 0 1.5px; }
.left-bracket::after { bottom: 0; left: 0; border-width: 0 0 1.5px 1.5px; }
.right-bracket::before { top: 0; right: 0; border-width: 1.5px 1.5px 0 0; }
.right-bracket::after { bottom: 0; right: 0; border-width: 0 1.5px 1.5px 0; }

/* --- 中间文字内容区 --- */
.warning-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 12px;
  min-width: 0;
}
.warning-title {
  font-family: 'PingFang SC', sans-serif; 
  font-size: 14px; 
  font-weight: 500;
  background: linear-gradient(180deg, #FFFFFF 0%, rgba(255, 255, 255, 0.5) 100%); 
  -webkit-background-clip: text; 
  -webkit-text-fill-color: transparent;
  margin-bottom: 2px;
}
.warning-subtitle {
  display: flex;
  align-items: center;
  font-family: 'PingFang SC', sans-serif;
  font-size: 12px;
}
.sub-label { color: rgba(255, 255, 255, 0.4); font-weight: 300; }
.is-normal .sub-val-actual { color: #1B7EF2; font-weight: 500; }
.is-lagging .sub-val-actual { color: #FF386B; font-weight: 500; }
.sub-divider, .sub-val-target { color: rgba(255, 255, 255, 0.6); font-weight: 500; }

/* --- 右侧滞后卡片 (缺角效果) --- */
.lag-badge {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 110px;
  margin: 0 12px 0 0; 
  padding: 0 10px;
  background: #421E31;
  /* 利用 clip-path 切割出左上角的缺角，大小可调 (10px) */
  clip-path: polygon(10px 0, 100% 0, 100% 100%, 0 100%, 0 10px);
  flex-shrink: 0;
}
.lag-text {
  font-size: 13px;
  color: #FF386B;
  font-family: 'PingFang SC', sans-serif;
}
.lag-num {
  font-size: 18px;
  font-weight: 700;
  color: #FF386B;
  font-family: 'Source Han Sans CN', 'PingFang SC', sans-serif;
}
.lag-unit {
  font-size: 11px;
  color: #FF386B;
  font-family: 'PingFang SC', sans-serif;
}

/* ================= 容器自适应 (cqw / cqh) ================= */
@container (min-height: 200px) {
  .warning-list {
    padding: clamp(26px, 10cqh, 40px) clamp(10px, 3cqw, 16px) clamp(10px, 5cqh, 16px);
    gap: clamp(6px, 2cqh, 12px);
  }
  .warning-item {
    min-height: clamp(46px, 15cqh, 60px);
  }
  .icon-wrapper {
    width: clamp(46px, 13cqw, 60px);
  }
  .warning-icon {
    width: clamp(26px, 8cqw, 36px);
    height: clamp(26px, 8cqw, 36px);
  }
  .warning-title {
    font-size: clamp(13px, 3.5cqw, 15px);
  }
  .warning-subtitle {
    font-size: clamp(11px, 3cqw, 13px);
  }
  .lag-badge {
    width: clamp(90px, 26cqw, 120px);
    height: 70%;
  }
}
</style>