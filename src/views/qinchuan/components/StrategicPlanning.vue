<template>
  <section class="dashboard-panel strategy-panel">
    <!-- 统一头部 -->
    <div class="panel-heading" :style="{ backgroundImage: `url(${titleBg})` }">
      <div class="heading-left">
        <img :src="jdyjIcon" class="heading-img" alt="战略规划" />
        <span class="panel-title">“十五五”战略规划</span>
      </div>
      <div class="panel-location">
        <span>{{ data.year || '十五五' }}</span>
      </div>
    </div>

    <div class="strategy-body">
      <!-- 顶部两个卡片 -->
      <div class="strategy-targets">
        <div v-for="(target, index) in data.targets" :key="target.key" class="target-card">
          <div class="target-num-box">
            <strong :class="`color-${index}`">{{ formatValue(target.value, 2) }}</strong>
            <span class="unit">{{ target.unit }}</span>
          </div>
          <div class="target-label">{{ target.label }}</div>
          <div class="target-rate-row">
            <i class="square-dot" :class="`bg-${index}`" />
            <span class="rate-label">完成率</span>
            <span class="rate-val">{{ target.completionRate }}%</span>
          </div>
          <i :style="{ width: `${target.completionRate}%` }" :class="`bar-${index}`" />
        </div>
      </div>

      <!-- 底部两列结构 -->
      <div class="structure-columns">
        <!-- 左列：实际完成结构 -->
        <div class="structure-column">
          <div class="column-title">
            <i class="arrow-icon" />
            实际完成结构/万kw
          </div>
          <div class="structure-list">
            <div v-for="item in data.actualStructure" :key="`actual-${item.label}`" class="structure-row">
              <span class="row-label">{{ item.label }}</span>
              <span class="row-val">{{ formatValue(item.value, 2) }} <span class="slash">/</span> {{ formatValue(item.target || item.value, 2) }}</span>
            </div>
          </div>
          <div class="structure-note" v-if="data.note1">（{{ data.note1 }}）</div>
        </div>

        <!-- 右列：十五五期间新增 -->
        <div class="structure-column right-col">
          <div class="column-title">
            <i class="arrow-icon" />
            十五五期间新增/万kw
          </div>
          <div class="structure-list">
            <div v-for="item in data.newDuringPeriod" :key="`new-${item.label}`" class="structure-row">
              <span class="row-label">{{ item.label }}:</span>
              <span class="row-val highlight">{{ formatValue(item.value, 2) }}</span>
            </div>
            <!-- 特殊备注项（非化石能源...）如果是写死在数据里的 -->
            <div class="structure-row special-row" v-if="data.note2">
              <span class="row-label">{{ data.note2 }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import titleBg from '@/assets/img/qinchuan/dashbord/title-bg.png'
import jdyjIcon from '@/assets/img/qinchuan/dashbord/jdyj.png'
import { strategyPlanningData } from '../js/dashboardMcokData'

defineProps({
  data: { type: Object, default: () => strategyPlanningData },
})

// 加入固定小数位
function formatValue(value, digits = 0) {
  return Number(value || 0).toLocaleString('zh-CN', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })
}
</script>

<style scoped>
/* 基础面板框架 */
.dashboard-panel {
  position: relative; width: 100%; height: 100%; box-sizing: border-box; display: flex; flex-direction: column; min-height: 0;
  border: 0.93px solid transparent;
  border-image: linear-gradient(162.05deg, rgba(165, 199, 238, 0.0001) 21.01%, #0077FF 51.91%, rgba(165, 199, 238, 0.2) 91.52%) 1;
  border-top: none; border-radius: 0px 0px 11px 11px;
  background: linear-gradient(180deg, rgba(16, 98, 222, 0.12) 0%, rgba(57, 126, 233, 0.11) 54.88%, rgba(19, 98, 215, 0.05) 75.82%, rgba(0, 95, 223, 0.03) 100%), linear-gradient(180deg, rgba(0, 40, 96, 0) 0%, rgba(0, 42, 95, 0.09) 23.24%, rgba(0, 42, 97, 0.23) 44.61%, rgba(0, 40, 96, 0.27) 100%);
  backdrop-filter: blur(14px); box-shadow: inset 0 0 24px rgba(20, 136, 237, 0.1), 0 0 16px rgba(0, 116, 224, 0.13);
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
.panel-location { font-family: 'PingFang SC', sans-serif; font-size: 12px; font-weight: 500; color: #fff; opacity: 0.8; transform: translateY(-4px); }

/* 内容区 */
.strategy-body {
  flex: 1; min-height: 0; display: flex; flex-direction: column; padding: 24px 12px 10px; gap: 12px;
  overflow-y: auto; scrollbar-width: none;
}
.strategy-body::-webkit-scrollbar { display: none; }

/* ============ 1. 顶部卡片 ============ */
.strategy-targets { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; flex-shrink: 0; }
.target-card {
  position: relative; display: flex; flex-direction: column; padding: 10px 10px 14px; overflow: hidden;
  border: 1px solid rgba(41, 145, 247, 0.2); border-radius: 4px;
  background: linear-gradient(180deg, rgba(41, 145, 247, 0) 0%, rgba(41, 145, 247, 0.15) 100%);
}
.target-num-box { display: flex; align-items: baseline; gap: 4px; }
.target-num-box strong { 
  font-family: 'Bebas Neue', 'YouSheBiaoTiHei', sans-serif; font-size: 26px; line-height: 1; 
}
.target-num-box strong.color-0 { 
  background: linear-gradient(180deg, #FFFFFF 6.94%, #09E0F3 96.03%); 
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; 
  text-shadow: 0px 0px 10px rgba(9, 224, 243, 0.4);
}
.target-num-box strong.color-1 { 
  background: linear-gradient(180deg, #FFFFFF 10.5%, #1EA2FF 90.61%); 
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; 
  text-shadow: 0px 0px 10px rgba(30, 162, 255, 0.4);
}
.target-num-box .unit { font-family: 'PingFang SC', sans-serif; font-size: 11px; color: rgba(255,255,255,0.7); }

.target-label { font-family: 'PingFang SC', sans-serif; font-size: 13px; color: #E6F7FF; margin-top: 4px; font-weight: 500;}
.target-rate-row { display: flex; align-items: center; gap: 4px; margin-top: 6px; }
.square-dot { width: 5px; height: 5px; border-radius: 1px; }
.square-dot.bg-0 { background: #09E0F3; box-shadow: 0 0 4px #09E0F3; }
.square-dot.bg-1 { background: #1EA2FF; box-shadow: 0 0 4px #1EA2FF; }
.rate-label { font-family: 'PingFang SC', sans-serif; font-size: 11px; color: rgba(255,255,255,0.6); }
.rate-val { font-family: 'PingFang SC', sans-serif; font-size: 12px; color: #FFF; }

.target-card i { position: absolute; right: 0; bottom: 0; left: 0; display: block; height: 2px; }
.target-card i.bar-0 { background: #09E0F3; box-shadow: 0 0 7px rgba(0, 201, 220, 0.8); }
.target-card i.bar-1 { background: #1EA2FF; box-shadow: 0 0 7px rgba(53, 159, 232, 0.5); }

/* ============ 2. 底部两列结构 ============ */
.structure-columns { display: grid; grid-template-columns: 1.05fr 1fr; gap: 10px; flex: 1; min-height: 0; padding-top: 4px; }
.structure-column { display: flex; flex-direction: column; }

/* 右列虚线分隔 */
.right-col { border-left: 1px dashed rgba(13, 48, 88, 1); padding-left: 12px; }

/* 小标题 */
.column-title { 
  display: flex; align-items: center; gap: 6px; 
  color: #E6F7FF; font-family: 'PingFang SC', sans-serif; font-size: 12px; 
  font-weight: bold; margin-bottom: 8px; white-space: nowrap;
}
/* 三角形箭头 */
.arrow-icon { 
  display: inline-block; width: 0; height: 0;
  border-top: 4px solid transparent; border-bottom: 4px solid transparent;
  border-left: 6px solid #0AE4F5; 
  filter: drop-shadow(0 0 3px #0AE4F5);
}

/* 列表容器 */
.structure-list { display: flex; flex-direction: column; gap: 6px; }

/* 单行数据 */
.structure-row { display: flex; align-items: center; justify-content: space-between; min-height: 18px; }
.structure-row .row-label { color: #E6F7FF; font-family: 'PingFang SC', sans-serif; font-size: 12px; white-space: nowrap; }
.structure-row .row-val { color: #8CC8FF; font-family: 'PingFang SC', sans-serif; font-size: 12px; white-space: nowrap; margin-left: 8px;}
.structure-row .slash { color: rgba(255,255,255,0.3); margin: 0 2px; }

/* 右列数值高亮 */
.structure-row .row-val.highlight { color: #00BBFF; font-weight: 500; }

/* 特殊行（非化石能源） */
.special-row { justify-content: flex-start; margin-top: 2px;}
.special-row .row-label { color: #00E5FF; font-weight: 500; white-space: normal;}

/* 底部备注（户用光伏） */
.structure-note { color: #00E5FF; font-family: 'PingFang SC', sans-serif; font-size: 11px; margin-top: 4px; white-space: nowrap;}
</style>