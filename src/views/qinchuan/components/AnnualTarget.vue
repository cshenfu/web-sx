<template>
  <section class="dashboard-panel annual-panel">
    <div class="panel-heading" :style="{ backgroundImage: `url(${titleBg})` }">
      <div class="heading-left">
        <img :src="ndmbIcon" class="heading-img" alt="年度目标" />
        <span class="panel-title">年度目标</span>
      </div>
      <div class="panel-location">
        <span>{{ data.year || '2026年' }}</span>
      </div>
    </div>

    <div class="target-list">
      <div v-for="item in targetItems" :key="item.key" class="target-item">
        
        <!-- ⭐️ 直接使用图片，去掉圆环 -->
        <div class="target-icon-wrap">
          <img :src="item.icon" class="target-icon-bg" alt="" />
          <div class="ring-inner">
            <strong>{{ percentage(item) }}%</strong>
            <span>{{ item.label }}</span>
          </div>
        </div>

        <div class="target-content">
          <div class="target-caption">
            <span class="caption-label">{{ item.label }}已完成</span>
            <strong class="caption-value" :style="{ color: item.key === 'development' ? '#1B7EF2' : '#29F1FA' }">
              {{ formatValue(item.completed) }} <small>{{ item.unit }}</small>
            </strong>
          </div>
          <div class="progress-track">
            <div class="progress-fill" :style="fillStyle(item)" />
            <div class="progress-thumb" :style="{ left: `${percentage(item)}%`, borderColor: item.key === 'development' ? '#1B7EF2' : '#28D2DD' }">
              <span class="dot-inner" />
            </div>
          </div>
          <div class="target-meta">
            <span class="meta-item"><i class="meta-dot" :style="{ backgroundColor: item.key === 'development' ? '#1B7EF2' : '#29F1FA' }"></i>年度目标 {{ formatValue(item.target) }} {{ item.unit }}</span>
            <span class="meta-item"><i class="meta-dot" :style="{ backgroundColor: item.key === 'development' ? '#1B7EF2' : '#29F1FA' }"></i>完成 {{ formatValue(item.completed) }} {{ item.unit }}</span>
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
import { annualTargetData } from '../js/dashboardMcokData'

const props = defineProps({ data: { type: Object, default: () => annualTargetData } })
const targetItems = computed(() => [
  { ...props.data.development, key: 'development', icon: developmentIcon },
  { ...props.data.commissioning, key: 'commissioning', icon: commissioningIcon },
])
function percentage(item) { return !item.target ? 0 : Math.min(100, Math.max(0, Math.round((item.completed / item.target) * 100))) }
function formatValue(value) { return Number(value || 0).toLocaleString('zh-CN') }
function fillStyle(item) {
  return {
    width: `${percentage(item)}%`,
    background: item.key === 'development' ? 'linear-gradient(269.98deg, #1B7EF2 0.96%, rgba(27, 126, 242, 0) 99.99%)' : 'linear-gradient(269.98deg, #29F1FA 0.96%, rgba(41, 241, 250, 0) 99.99%)'
  }
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
}
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
.panel-location { font-family: 'PingFang SC', sans-serif; font-size: 13px; font-weight: 500; color: #fff; opacity: 0.9; transform: translateY(-4px); }

/* ⭐️ 稍微加大列表内边距 */
.target-list { padding: 28px 14px 12px; }
.target-item { display: flex; align-items: center; gap: 12px; }
.target-item + .target-item { margin-top: 14px; }

/* ⭐️ 直接包图片和文字 */
.target-icon-wrap { position: relative; width: 52px; height: 52px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
.target-icon-bg { width: 100%; height: 100%; object-fit: contain; }

.ring-inner { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -40%); display: flex; flex-direction: column; align-items: center; z-index: 1; }
.ring-inner strong { color: #effaff; font-family: 'PingFang SC', sans-serif; font-size: 15px; line-height: 15px; font-weight: 700; }
.ring-inner span { color: rgba(255, 255, 255, 0.7); font-size: 10px; margin-top: 1px; }

.target-content { min-width: 0; flex: 1; }
.target-caption, .target-meta { display: flex; align-items: center; justify-content: space-between; }
.target-caption { margin-bottom: 6px; }
.caption-label { font-family: 'PingFang SC', sans-serif; font-size: 13px; background: linear-gradient(180deg, #FFFFFF 0%, rgba(255, 255, 255, 0.5) 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.caption-value { font-family: 'PingFang SC', sans-serif; font-size: 15px; font-weight: 700; }
.caption-value small { color: rgba(255, 255, 255, 0.6); font-size: 11px; margin-left: 2px; }

.progress-track { position: relative; height: 5px; margin: 4px 6px 6px 0; border-radius: 999px; background: rgba(112, 112, 112, 0.23); }
.progress-fill { height: 100%; border-radius: inherit; }
.progress-thumb { position: absolute; top: 50%; width: 16px; height: 16px; transform: translate(-50%, -50%); background: #161616; border: 0.77px solid; border-radius: 50%; box-shadow: 0 0 4px 2px rgba(27, 126, 242, 0.65); display: flex; align-items: center; justify-content: center; }
.dot-inner { width: 5px; height: 5px; background: #FFF; border-radius: 50%; box-shadow: 0 0 3px 1px rgba(255, 255, 255, 0.44); }
.target-meta { color: rgba(255, 255, 255, 0.6); font-size: 11px; }
.meta-item { display: flex; align-items: center; gap: 4px; }
.meta-dot { width: 4px; height: 4px; border-radius: 50%; }
</style>