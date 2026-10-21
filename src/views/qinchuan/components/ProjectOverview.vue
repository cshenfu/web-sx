<template>
  <section class="dashboard-panel project-panel">
    <div class="panel-heading" :style="{ backgroundImage: `url(${titleBg})` }">
      <div class="heading-left">
        <img :src="xmgkIcon" class="heading-img" alt="项目概况" />
        <span class="panel-title">项目概况</span>
      </div>
      <div class="panel-location">
        <span>陕西省</span>
        <svg class="location-icon" viewBox="0 0 24 24" fill="currentColor" style="width: 14px !important; height: 14px !important;">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"/>
        </svg>
      </div>
    </div>

    <div class="project-table">
      <div class="project-header">
        <span>项目阶段</span>
        <span class="project-type"><img :src="windIcon" alt="" />风电项目</span>
        <span class="project-type"><img :src="solarIcon" alt="" />光伏项目</span>
      </div>

      <button
        v-for="row in rows"
        :key="row.key || row.stage"
        class="project-row"
        :class="{ 'is-selected': selectedKey === (row.key || row.stage) }"
        type="button"
        @click="selectRow(row)"
      >
        <div class="decor-line left" v-if="selectedKey === (row.key || row.stage)">
          <span class="dot"></span><span class="line"></span><span class="dot"></span>
        </div>

        <span class="stage-cell">
          <i class="stage-dot" :style="{ backgroundColor: row.color, color: row.color }" />
          <span class="stage-name">{{ row.stage }}</span>
        </span>

        <template v-if="selectedKey === (row.key || row.stage)">
          <div class="capacity-merged">
            <span class="total-label">项目总容量：</span>
            <strong class="total-value">{{ (Number(row.wind?.value) || 0) + (Number(row.solar?.value) || 0) }}</strong>
            <small class="total-unit">MW</small>
          </div>
        </template>
        <template v-else>
          <div class="capacity-box">
            <img :src="windIcon" alt="" />
            <strong class="val-wind">{{ row.wind?.value ?? '-' }}</strong>
            <small>{{ row.wind?.unit || 'MW' }}</small>
          </div>
          <div class="capacity-box">
            <img :src="solarIcon" alt="" />
            <strong class="val-solar">{{ row.solar?.value ?? '-' }}</strong>
            <small>{{ row.solar?.unit || 'MW' }}</small>
          </div>
        </template>

        <div class="decor-line right" v-if="selectedKey === (row.key || row.stage)">
          <span class="dot"></span><span class="line"></span><span class="dot"></span>
        </div>
      </button>
    </div>
  </section>
</template>

<script setup>
import { ref, watch } from 'vue'
import titleBg from '@/assets/img/qinchuan/dashbord/title-bg.png'
import xmgkIcon from '@/assets/img/qinchuan/dashbord/xmgk.png'
import windIcon from '@/assets/img/qinchuan/dashbord/fj.png'
import solarIcon from '@/assets/img/qinchuan/dashbord/tynb.png'
import { projectOverviewRows } from '../js/dashboardMcokData'

const props = defineProps({
  rows: { type: Array, default: () => projectOverviewRows },
  modelValue: { type: [String, Number], default: null },
})
const emit = defineEmits(['select', 'update:modelValue'])

// 初始无选中；外部置为 null 时也能同步清空
const selectedKey = ref(props.modelValue ?? null)
watch(() => props.modelValue, (val) => { selectedKey.value = val ?? null })

function selectRow(row) {
  const key = row.key || row.stage
  // 再点一次已选中的行 → 取消选中
  if (selectedKey.value === key) {
    selectedKey.value = null
    emit('update:modelValue', null)
    emit('select', null)
    return
  }
  selectedKey.value = key
  emit('update:modelValue', key)
  emit('select', row)
}
</script>

<style scoped>
.dashboard-panel {
  position: relative;
  width: 100%;
  box-sizing: border-box;
  border: 0.93px solid transparent;
  border-image: linear-gradient(162.05deg, rgba(165, 199, 238, 0.0001) 21.01%, #0077FF 51.91%, rgba(165, 199, 238, 0.2) 91.52%) 1;
  border-top: none;
  border-radius: 0px 0px 11px 11px;
  background: linear-gradient(180deg, rgba(16, 98, 222, 0.12) 0%, rgba(57, 126, 233, 0.11) 54.88%, rgba(19, 98, 215, 0.05) 75.82%, rgba(0, 95, 223, 0.03) 100%),
              linear-gradient(180deg, rgba(0, 40, 96, 0) 0%, rgba(0, 42, 95, 0.09) 23.24%, rgba(0, 42, 97, 0.23) 44.61%, rgba(0, 40, 96, 0.27) 100%);
  backdrop-filter: blur(14px);
  box-shadow: inset 0 0 24px rgba(20, 136, 237, 0.1), 0 0 16px rgba(0, 116, 224, 0.13);
  margin-top: 14px;
}

.panel-heading {
  position: absolute;
  top: -14px;
  left: 0;
  width: 100%;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  box-sizing: border-box;
  background-size: 100% 100%;
  background-repeat: no-repeat;
  background-position: center;
}

.heading-left { display: flex; align-items: center; gap: 6px; transform: translateY(-4px); }
.heading-img { height: 26px; width: auto; object-fit: contain; }
.panel-title {
  font-family: 'YouSheBiaoTiHei', sans-serif; font-size: 20px; line-height: 17px;
  background: linear-gradient(180deg, #FFFFFF 24.68%, #CAE2FF 69.7%, #8FACD7 86.96%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  transform: matrix(1, 0, -0.16, 0.99, 0, 0);
}

.panel-location { display: flex; align-items: center; gap: 4px; font-family: 'PingFang SC', sans-serif; font-size: 13px; font-weight: 500; color: #fff; opacity: 0.9; transform: translateY(-4px); }
.location-icon { color: #00d2ff; flex-shrink: 0; }

.project-table { padding: 28px 8px 6px; }
.project-header, .project-row { display: grid; grid-template-columns: 1.1fr 1fr 1fr; align-items: center; column-gap: 2px; }
.project-header { height: 26px; padding: 0 6px; color: #FFFFFF; opacity: 0.64; font-family: 'PingFang SC', sans-serif; font-size: 12px; }
.project-header > span:first-child { padding-left: 8px; }
.project-type { display: flex; align-items: center; justify-content: center; gap: 4px; white-space: nowrap; }
.project-type img { width: 14px; height: 14px; }

.project-row {
  position: relative; width: 100%; min-height: 32px; margin-top: 2px; padding: 2px 6px;
  border: 1px solid transparent; border-radius: 2px; background: transparent; cursor: pointer; transition: all 0.2s; box-sizing: border-box;
}
.project-row.is-selected { background: rgba(91, 137, 254, 0.2); border-radius: 7.45px; }

.stage-cell { display: flex; align-items: center; gap: 6px; font-family: 'PingFang SC', sans-serif; font-size: 12px; font-weight: 500; white-space: nowrap; overflow: hidden; }
.stage-dot { display: inline-block; width: 5px; height: 5px; flex-shrink: 0; border-radius: 50%; box-shadow: 0 0 8px 1px currentColor; }
.stage-name { background: linear-gradient(180deg, #FFFFFF 0%, rgba(255, 255, 255, 0.5) 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }

.capacity-box { display: flex; align-items: center; justify-content: center; gap: 2px; min-width: 0; }
.capacity-box img { width: 16px; height: 16px; flex-shrink: 0; }
.val-wind { color: #20DAED; font-family: 'PingFang SC', sans-serif; font-size: 13px; font-weight: 500; }
.val-solar { color: #42A3FC; font-family: 'PingFang SC', sans-serif; font-size: 13px; font-weight: 500; }
.capacity-box small { color: rgba(255, 255, 255, 0.6); font-size: 10px; }

.capacity-merged { grid-column: span 2; display: flex; align-items: center; justify-content: center; height: 24px; white-space: nowrap; }
.total-label { color: rgba(255, 255, 255, 0.6); font-family: 'PingFang SC', sans-serif; font-size: 11px; margin-right: 4px; }
.total-value { color: #E8059B; font-family: 'PingFang SC', sans-serif; font-size: 13px; font-weight: 500; margin-right: 2px; }
.total-unit { color: rgba(255, 255, 255, 0.6); font-size: 10px; }

.decor-line { position: absolute; top: 50%; transform: translateY(-50%); display: flex; flex-direction: column; align-items: center; height: 100%; padding: 4px 0; box-sizing: border-box; pointer-events: none; }
.decor-line.left { left: 0px; } .decor-line.right { right: 0px; }
.decor-line .dot { width: 4px; height: 4px; border: 1px solid #FFFFFF; }
.decor-line .line { width: 0; flex: 1; border-left: 1px solid rgba(255, 255, 255, 0.2); }
</style>