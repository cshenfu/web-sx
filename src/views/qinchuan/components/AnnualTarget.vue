<template>
  <section class="dashboard-panel annual-panel">
    <div class="panel-heading" :style="{ backgroundImage: `url(${titleBg})` }">
      <div class="heading-left">
        <img :src="ndmbIcon" class="heading-img" alt="年度目标" />
        <span class="panel-title">年度目标</span>
      </div>
      <div class="panel-location">
        <!-- 年份选择器 -->
        <div class="year-selector">
          <span class="year-text">{{ data.year || '2026年' }}</span>
          <div class="arrows">
            <i class="arrow-up"></i>
            <i class="arrow-down"></i>
          </div>
        </div>
      </div>
    </div>

    <div class="target-list">
      <div v-for="item in targetItems" :key="item.key" class="target-item">
        
        <!-- 左侧：环形图与标题 -->
        <div class="target-left">
          <div class="target-label-top">{{ item.label }}</div>
          <div class="target-icon-wrap">
            <img :src="item.icon" class="target-icon-bg" alt="" />
            <div class="ring-inner">
              <strong>{{ item.ringValue }}</strong><span>%</span>
            </div>
          </div>
        </div>

        <!-- 右侧：双进度条数据 -->
        <div class="target-right">
          <!-- 1. 确保目标 / 登高目标 (顶部文字) -->
          <div class="target-row">
            <div class="group-left">
              <span class="label">确保目标</span>
              <span class="value cyan">{{ item.ensureTarget }}%</span>
            </div>
            <div class="group-right">
              <span class="label">登高目标</span>
              <span class="value blue">{{ item.climbTarget }}%</span>
            </div>
          </div>

          <!-- 2. 双进度条 (倾斜且无圆角) -->
          <div class="progress-row">
            <div class="progress-track track-cyan">
              <div class="progress-fill fill-cyan" :style="{ width: `${item.ensureTarget}%` }"></div>
            </div>
            <div class="progress-track track-blue">
              <div class="progress-fill fill-blue" :style="{ width: `${item.climbTarget}%` }"></div>
            </div>
          </div>

          <!-- 3. 底部数值 -->
          <div class="target-row">
            <div class="group-left val-cyan">{{ item.ensureValue }}</div>
            <div class="group-right val-blue">{{ item.climbValue }}</div>
          </div>
        </div>

      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import titleBg from '@/assets/img/qinchuan/dashbord/title-bg.png'
import ndmbIcon from '@/assets/img/qinchuan/dashbord/ndmb.png'
import developmentIcon from '@/assets/img/qinchuan/dashbord/kf.png'
import commissioningIcon from '@/assets/img/qinchuan/dashbord/tc.png'

const props = defineProps({ 
  data: { 
    type: Object, 
    default: () => ({
      year: '2026年',
      list: [
        { key: '1', label: '建设规模', icon: developmentIcon, ringValue: 50, ensureTarget: 65, climbTarget: 45, ensureValue: '26,450kW', climbValue: '36,400kW' },
        { key: '2', label: '核准备案', icon: commissioningIcon, ringValue: 50, ensureTarget: 20, climbTarget: 45, ensureValue: '26,450kW', climbValue: '36,400kW' },
        { key: '3', label: '投资决策', icon: developmentIcon, ringValue: 100, ensureTarget: 100, climbTarget: 89, ensureValue: '26,450kW', climbValue: '36,400kW' }
      ]
    }) 
  } 
})

const targetItems = computed(() => {
  if (props.data.list && props.data.list.length) {
    return props.data.list
  }
  // 兼容旧数据格式的降级处理
  return [
    { key: 'construction', label: '建设规模', icon: developmentIcon, ringValue: 50, ensureTarget: 65, climbTarget: 45, ensureValue: '26,450kW', climbValue: '36,400kW' },
    { key: 'approval', label: '核准备案', icon: commissioningIcon, ringValue: 50, ensureTarget: 20, climbTarget: 45, ensureValue: '26,450kW', climbValue: '36,400kW' },
    { key: 'investment', label: '投资决策', icon: developmentIcon, ringValue: 100, ensureTarget: 100, climbTarget: 89, ensureValue: '26,450kW', climbValue: '36,400kW' }
  ]
})
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

/* 顶部标题栏 */
.panel-heading {
  position: absolute; top: -14px; left: 0; width: 100%; height: 42px; 
  display: flex; align-items: center; justify-content: space-between; padding: 0 12px;
  box-sizing: border-box; background-size: 100% 100%; background-repeat: no-repeat; background-position: center;
}
.heading-left { display: flex; align-items: center; gap: 6px; transform: translateY(-4px); }
.heading-img { height: 26px; width: auto; object-fit: contain; }
.panel-title {
  font-family: 'YouSheBiaoTiHei', sans-serif; font-size: 20px;
  background: linear-gradient(180deg, #FFFFFF 24.68%, #CAE2FF 69.7%, #8FACD7 86.96%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  transform: matrix(1, 0, -0.16, 0.99, 0, 0);
}

/* 年份选择器 */
.panel-location { transform: translateY(-4px); }
.year-selector { display: flex; align-items: center; gap: 4px; }
.year-text {
  font-family: 'YouSheBiaoTiHei', sans-serif; font-size: 14px;
  background: linear-gradient(180deg, #FFFFFF 24.68%, #CAE2FF 69.7%, #8FACD7 86.96%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  transform: matrix(1, 0, -0.16, 0.99, 0, 0);
}
.arrows { display: flex; flex-direction: column; gap: 2px; }
.arrow-up, .arrow-down {
  width: 0; height: 0;
  border-left: 4px solid transparent; border-right: 4px solid transparent;
}
.arrow-up { border-bottom: 5px solid #8FACD7; }
.arrow-down { border-top: 5px solid #8FACD7; }

/* ================= 列表内容区 ================= */
.target-list {
  display: flex; flex-direction: column; justify-content: space-between;
  width: 100%; height: 100%; box-sizing: border-box;
  padding: 32px 18px 16px;
  gap: 12px;
}

.target-item {
  display: flex; align-items: center; gap: 12px;
  flex: 1;
}

/* --- 左侧环形图区 (复用原图片) --- */
.target-left {
  display: flex; flex-direction: column; align-items: center;
  width: 100px; flex-shrink: 0;
}
.target-label-top {
  font-family: 'PingFang SC', sans-serif; font-size: 12px; font-weight: 500;
  background: linear-gradient(180deg, #FFFFFF 0%, rgba(255, 255, 255, 0.5) 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  margin-bottom: 2px;
}
.target-icon-wrap {
  position: relative; width: 52px; height: 52px; 
  display: flex; align-items: center; justify-content: center;
}
.target-icon-bg {
  width: 100%; height: 100%; object-fit: contain;
}
.ring-inner { 
  position: absolute; top: 50%; left: 50%; 
  transform: translate(-50%, -40%); /* 略微向上偏移以居中于图形 */
  display: flex; align-items: baseline; z-index: 1;
}
.ring-inner strong { color: #00CEEA; font-size: 18px; font-weight: 600; line-height: 1; text-shadow: 0 0 4px rgba(0, 206, 234, 0.3); }
.ring-inner span { color: #00CEEA; font-size: 11px; font-weight: 400; margin-left: 1px; }

/* --- 右侧双进度条区 --- */
.target-right {
  flex: 1; display: flex; flex-direction: column; justify-content: space-between; 
  min-width: 0; padding: 2px 0; gap: 6px;
}

.target-row {
  display: flex; justify-content: space-between; align-items: center;
}
.group-left, .group-right {
  display: flex; align-items: center; gap: 8px;
}

.label { font-size: 12px; color: rgba(255, 255, 255, 0.8); white-space: nowrap; }
.value { font-size: 12px; font-weight: 600; }
.value.cyan { color: #00CEEA; }
.value.blue { color: #1B7EF2; }

/* 进度条容器 */
.progress-row {
  display: flex; justify-content: space-between; align-items: center;
  height: 6px; margin: 2px 0;
}
.progress-track {
  height: 100%; 
  transform: skewX(-30deg); /* 倾斜度 */
  position: relative; 
  overflow: hidden; /* 保证填充不超出轨道边界 */
}
/* 左右轨道宽度占比，形成倾斜的中间切口 */
.track-cyan {
  width: 72%; 
  background: rgba(0, 206, 234, 0.35);
}
.track-blue {
  width: 24%; 
  background: rgba(27, 126, 242, 0.35);
}

.progress-fill {
  height: 100%; 
  /* 进度条本身无圆角 */
}
.fill-cyan { background: #00CEEA; }
.fill-blue { background: #1B7EF2; }

/* 底部数值 */
.group-left.val-cyan { color: #1F99B4; font-size: 12px; font-weight: 600; }
.group-right.val-blue { color: #155FBC; font-size: 12px; font-weight: 600; }

/* ================= 容器自适应 (cqw / cqh) ================= */
@container (min-height: 200px) {
  .target-list {
    padding: clamp(24px, 10cqh, 40px) clamp(12px, 3cqw, 20px) clamp(12px, 5cqh, 20px);
  }
  .target-left { width: clamp(80px, 20cqw, 110px); }
  .target-icon-wrap { width: clamp(48px, 12cqw, 64px); height: clamp(48px, 12cqw, 64px); }
  .ring-inner strong { font-size: clamp(16px, 4cqw, 20px); }
}
</style>