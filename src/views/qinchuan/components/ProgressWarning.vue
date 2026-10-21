<template>
  <section class="dashboard-panel warning-panel">
    <div class="panel-heading" :style="{ backgroundImage: `url(${titleBg})` }">
      <div class="heading-left">
        <img :src="jdyjIcon" class="heading-img" alt="进度预警" />
        <span class="panel-title">进度预警</span>
      </div>
      <div class="panel-location"><span>目标完成情况</span></div>
    </div>

    <div class="warning-list">
      <div v-for="item in items" :key="item.key || item.label" class="warning-item" :class="item.actual < item.target ? 'is-lagging' : 'is-normal'">
        <div class="decor-line left"><span class="dot"></span><span class="line"></span><span class="dot"></span></div>
        <img class="warning-icon" :src="item.actual < item.target ? lagIcon : normalIcon" alt="状态" />
        <div class="warning-main">
          <div class="warning-title">
            <span class="title-text">{{ item.label }}</span>
            <strong v-if="item.actual < item.target">滞后 {{ item.target - item.actual }}{{ item.unit }}</strong>
            <strong v-else>正常</strong>
          </div>
          <div class="warning-subtitle">
            <span class="sub-text">目标 {{ item.target }}{{ item.unit }}</span>
            <span class="sub-divider">·</span>
            <span class="sub-text">实际完成 {{ item.actual }}{{ item.unit }}</span>
          </div>
          <div class="warning-progress"><i :style="{ width: `${completionPercent(item)}%` }" /></div>
        </div>
        <span class="status-chip">{{ item.actual < item.target ? '滞后' : '正常' }}</span>
        <div class="decor-line right"><span class="dot"></span><span class="line"></span><span class="dot"></span></div>
      </div>
    </div>
  </section>
</template>

<script setup>
import titleBg from '@/assets/img/qinchuan/dashbord/title-bg.png'
import jdyjIcon from '@/assets/img/qinchuan/dashbord/jdyj.png'
import normalIcon from '@/assets/img/qinchuan/dashbord/zc.png'
import lagIcon from '@/assets/img/qinchuan/dashbord/zh.png'
import { progressWarningData } from '../js/dashboardMcokData'

defineProps({ items: { type: Array, default: () => progressWarningData } })
function completionPercent(item) { return !item.target ? 0 : Math.min(100, Math.max(0, Math.round((item.actual / item.target) * 100))) }
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

.warning-list { padding: 24px 8px 6px; }
.warning-item { position: relative; display: flex; min-height: 38px; align-items: center; gap: 6px; padding: 4px 8px; margin-bottom: 4px; box-sizing: border-box; border-radius: 4px; }
.warning-item:last-child { margin-bottom: 0; }
.warning-item.is-normal { border: 0.93px solid rgba(27, 126, 242, 0.1); background: rgba(27, 126, 242, 0.05); }
.warning-item.is-lagging { border: 0.93px solid rgba(255, 56, 107, 0.1); background: rgba(255, 56, 107, 0.05); }

.warning-icon { width: 20px; height: 20px; flex-shrink: 0; object-fit: contain; }
.warning-main { min-width: 0; flex: 1; display: flex; flex-direction: column; gap: 2px; }
.warning-title, .warning-subtitle { display: flex; align-items: center; }
.warning-title { justify-content: space-between; font-size: 12px; }
.title-text { font-family: 'PingFang SC', sans-serif; background: linear-gradient(180deg, #FFFFFF 0%, rgba(255, 255, 255, 0.5) 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.is-normal .warning-title strong { color: #1B7EF2; font-size: 12px; }
.is-lagging .warning-title strong { color: #FF386B; font-size: 12px; }

.warning-subtitle { gap: 4px; font-family: 'PingFang SC', sans-serif; font-size: 10px; }
.sub-text { color: rgba(255, 255, 255, 0.6); }
.sub-divider { color: rgba(255, 255, 255, 0.3); }

.warning-progress { height: 3px; width: 100%; overflow: hidden; border-radius: 999px; background: rgba(255, 255, 255, 0.1); margin-top: 2px; }
.warning-progress i { display: block; height: 100%; border-radius: inherit; }
.is-normal .warning-progress i { background: linear-gradient(90deg, #1B7EF2, #29F1FA); }
.is-lagging .warning-progress i { background: linear-gradient(90deg, #FF003D, #FF386B); }

.status-chip { display: inline-flex; min-width: 26px; align-items: center; justify-content: center; padding: 1px 4px; font-family: 'PingFang SC', sans-serif; font-size: 10px; border-radius: 2px; flex-shrink: 0; }
.is-normal .status-chip { border: 1px solid rgba(27, 126, 242, 0.6); color: #1B7EF2; }
.is-lagging .status-chip { border: 1px solid rgba(255, 56, 107, 0.6); color: #FF386B; }

.decor-line { position: absolute; top: 0; bottom: 0; width: 6px; display: flex; flex-direction: column; justify-content: space-between; padding: 4px 0; box-sizing: border-box; pointer-events: none; }
.decor-line.left { left: 0; align-items: flex-start; }
.decor-line.right { right: 0; align-items: flex-end; }
.decor-line .dot { width: 3px; height: 3px; border-style: solid; }
.decor-line .line { flex: 1; border-left-style: solid; }
.is-normal .decor-line .dot { border-color: #1B7EF2; border-width: 1.5px; }
.is-normal .decor-line .line { border-left: 1px solid rgba(27, 126, 242, 0.3); }
.is-lagging .decor-line .dot { border-color: #FF003D; border-width: 1.5px; }
.is-lagging .decor-line .line { border-left: 1px solid rgba(255, 56, 107, 0.3); }
.dashboard-panel { container-type: size; }
.warning-list {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  min-height: 0;
  gap: clamp(5px, min(2.73cqw, 3.76cqh), 11.18px);
  padding:
    clamp(22px, min(10cqw, 13.79cqh), 41px)
    clamp(8px, min(3.64cqw, 5.02cqh), 14.91px)
    clamp(5px, min(3.41cqw, 4.71cqh), 14px);
}
.warning-item {
  flex: 1 1 52.09px;
  height: auto;
  min-height: 32px;
  margin-bottom: 0;
  padding: clamp(2px, min(.98cqw, 1.35cqh), 4px)
           clamp(5px, min(1.95cqw, 2.69cqh), 8px);
}
.warning-icon {
  width: clamp(26px, min(10cqw, 13.8cqh), 41px);
  height: clamp(26px, min(10cqw, 13.8cqh), 41px);
}
</style>