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
      <!-- 表头：4列 -->
      <div class="project-header">
        <span>项目阶段</span>
        <span>风电/MW</span>
        <span>光伏/MW</span>
        <span>总容量/MW</span>
      </div>

      <!-- 数据行 -->
      <button
        v-for="(row, index) in displayRows"
        :key="row.key || row.stage"
        class="project-row"
        :class="{ 'is-selected': selectedKey === (row.key || row.stage) }"
        type="button"
        @click="selectRow(row)"
      >
        <!-- 左右装饰线 (选中时出现) -->
        <div class="decor-line left" v-if="selectedKey === (row.key || row.stage)">
          <span class="dot"></span><span class="line"></span><span class="dot"></span>
        </div>
        <div class="decor-line right" v-if="selectedKey === (row.key || row.stage)">
          <span class="dot"></span><span class="line"></span><span class="dot"></span>
        </div>

        <!-- 1. 项目阶段列 -->
        <span class="stage-cell">
          <i class="stage-dot" :style="{ backgroundColor: row.color, color: row.color }" />
          
          <div v-if="row.isDropdown" class="dropdown-trigger" ref="dropdownRef" @click.stop="toggleDropdown(index)">
            <span class="stage-name">{{ row.stage }}</span>
            <i class="arrow-icon" :class="{ 'is-open': activeDropdownIndex === index }"></i>
            
            <!-- 毛玻璃下拉菜单 -->
            <transition name="fade">
              <div v-if="activeDropdownIndex === index" class="glass-dropdown">
                <div 
                  v-for="opt in dropdownOptions" 
                  :key="opt.label"
                  class="dropdown-item"
                  :class="{ active: row.stage === opt.label }"
                  @click.stop="selectOption(index, opt)"
                >
                  {{ opt.label }}
                </div>
              </div>
            </transition>
          </div>
          
          <span v-else class="stage-name">{{ row.stage }}</span>
        </span>

        <!-- 2. 右侧三列容量（带括号包裹） -->
        <div class="capacity-group">
          <span class="bracket bracket-left"></span>
          
          <div class="capacity-values">
            <span class="val-wind">{{ formatNumber(row.wind?.value) }}</span>
            <span class="val-solar">{{ formatNumber(row.solar?.value) }}</span>
            <span class="val-total">{{ formatNumber((Number(row.wind?.value) || 0) + (Number(row.solar?.value) || 0)) }}</span>
          </div>
          
          <span class="bracket bracket-right"></span>
        </div>
      </button>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import titleBg from '@/assets/img/qinchuan/dashbord/title-bg.png'
import xmgkIcon from '@/assets/img/qinchuan/dashbord/xmgk.png'
import { projectOverviewRows } from '../js/dashboardMcokData'

const props = defineProps({
  rows: { type: Array, default: () => projectOverviewRows },
  modelValue: { type: [String, Number], default: null },
})
const emit = defineEmits(['select', 'update:modelValue'])

// ========== 选中态逻辑（恢复原有） ==========
const selectedKey = ref(props.modelValue ?? null)
watch(() => props.modelValue, (val) => { selectedKey.value = val ?? null })

function selectRow(row) {
  const key = row.key || row.stage
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

// ========== 下拉框逻辑 ==========
const activeDropdownIndex = ref(null)
const dropdownRef = ref(null)

// 下拉选择对应的数据
const dropdownOptions = [
  { label: '推进中', wind: 200.00, solar: 100.32 },
  { label: '立项中', wind: 150.50, solar: 80.20 },
  { label: '可研中', wind: 120.00, solar: 60.10 },
  { label: '投决中', wind: 80.00, solar: 40.00 },
]

const selectedOptionIndex = ref(0)

function toggleDropdown(index) {
  if (activeDropdownIndex.value === index) {
    activeDropdownIndex.value = null
  } else {
    activeDropdownIndex.value = index
  }
}

function selectOption(rowIndex, opt) {
  selectedOptionIndex.value = dropdownOptions.findIndex(o => o.label === opt.label)
  activeDropdownIndex.value = null
}

// 点击外部关闭下拉
function handleClickOutside(e) {
  if (activeDropdownIndex.value !== null && !e.target.closest('.dropdown-trigger')) {
    activeDropdownIndex.value = null
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))

// ========== 数据渲染逻辑 ==========
const displayRows = computed(() => {
  return props.rows.map((row) => {
    if (row.stage === '规划中' || row.stage === '推进中') {
      const currentOpt = dropdownOptions[selectedOptionIndex.value]
      return {
        ...row,
        stage: currentOpt.label,
        isDropdown: true,
        wind: { value: currentOpt.wind },
        solar: { value: currentOpt.solar },
      }
    }
    return row
  })
})

function formatNumber(val) {
  if (val === undefined || val === null || isNaN(val)) return '0.00'
  return Number(val).toFixed(2)
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
  container-type: size;
  /* 确保面板不被内容撑破 */
  display: flex;
  flex-direction: column;
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

/* ================= 表格布局 ================= */
.project-table {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  min-height: 0;
  padding: 28px 12px 12px;
  box-sizing: border-box;
  /* 移除 overflow-y: auto 解决滚动条问题 */
  overflow: visible; 
}

.project-header, .project-row {
  display: grid;
  grid-template-columns: 1.2fr 1fr 1fr 1fr;
  align-items: center;
  column-gap: 4px;
}

.project-header {
  flex: 0 0 auto;
  height: 24px;
  padding: 0 6px;
  color: rgba(255, 255, 255, 0.6);
  font-family: 'PingFang SC', sans-serif;
  font-size: 12px;
}
.project-header > span:first-child { padding-left: 8px; }
.project-header > span:not(:first-child) { text-align: center; }

.project-row {
  position: relative;
  width: 100%;
  min-height: 32px;
  /* 减小行距，确保5行放得下 */
  margin-top: 6px; 
  padding: 4px 6px;
  box-sizing: border-box;
  border: 1px solid transparent;
  border-radius: 4px;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s;
}
.project-row:hover { background: rgba(255, 255, 255, 0.03); }
.project-row.is-selected { 
  background: rgba(91, 137, 254, 0.2); 
  border-radius: 7.45px; 
}

/* --- 阶段列 --- */
.stage-cell { 
  display: flex; align-items: center; gap: 6px; 
  font-family: 'PingFang SC', sans-serif; font-size: 13px; font-weight: 500; 
  white-space: nowrap;
}
.stage-dot { 
  display: inline-block; width: 6px; height: 6px; flex-shrink: 0; 
  border-radius: 50%; box-shadow: 0 0 8px 1px currentColor; 
}
.stage-name { 
  background: linear-gradient(180deg, #FFFFFF 0%, rgba(255, 255, 255, 0.7) 100%); 
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; 
}

/* --- 下拉框触发器 --- */
.dropdown-trigger {
  position: relative;
  display: flex; align-items: center; gap: 4px;
  cursor: pointer;
  padding: 2px 4px; border-radius: 4px;
}
.arrow-icon {
  display: inline-block;
  width: 0; height: 0;
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-top: 5px solid rgba(255, 255, 255, 0.6);
  transition: transform 0.3s;
}
.arrow-icon.is-open { transform: rotate(180deg); }

/* --- 毛玻璃下拉菜单 --- */
/* --- 毛玻璃下拉菜单 (使用原面板背景色) --- */
.glass-dropdown {
  position: absolute;
  top: 100%; left: 0;
  margin-top: 4px;
  min-width: 85px;
  padding: 4px;
  /* 将原本的深色背景替换为你提供的渐变背景 */
  background: linear-gradient(180deg, rgba(16, 98, 222, 0.4) 0%, rgba(57, 126, 233, 0.35) 54.88%, rgba(19, 98, 215, 0.2) 75.82%, rgba(0, 95, 223, 0.15) 100%),
              linear-gradient(180deg, rgba(0, 40, 96, 0.2) 0%, rgba(0, 42, 95, 0.3) 23.24%, rgba(0, 42, 97, 0.4) 44.61%, rgba(0, 40, 96, 0.5) 100%);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid rgba(0, 119, 255, 0.4);
  border-radius: 4px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
  z-index: 999;
}
.dropdown-item {
  padding: 6px 10px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  border-radius: 3px;
  white-space: nowrap;
  transition: all 0.2s;
}
.dropdown-item:hover { background: rgba(27, 126, 242, 0.3); color: #fff; }
.dropdown-item.active { color: #00CEEA; font-weight: bold; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s, transform 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(-4px); }

/* --- 容量数据组 (带括号) --- */
.capacity-group {
  grid-column: span 3;
  display: flex;
  align-items: stretch; /* 确保括号高度与数字齐平 */
  justify-content: space-between;
  padding: 2px 0;
  height: 22px; /* 固定高度防止因字体变化撑开 */
}

.bracket {
  width: 6px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}
.bracket-left { border-right: none; }
.bracket-right { border-left: none; }

.capacity-values {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  align-items: center;
}
.capacity-values > span {
  text-align: center;
  font-family: 'PingFang SC', sans-serif;
  font-size: 13px;
  font-weight: 600;
}

.val-wind { color: #20DAED; }
.val-solar { color: #42A3FC; }
.val-total { color: #42A3FC; }

/* --- 装饰线 (选中的左右括号) --- */
.decor-line { position: absolute; top: 50%; transform: translateY(-50%); display: flex; flex-direction: column; align-items: center; height: 100%; padding: 4px 0; box-sizing: border-box; pointer-events: none; }
.decor-line.left { left: 0px; } .decor-line.right { right: 0px; }
.decor-line .dot { width: 4px; height: 4px; border: 1px solid #FFFFFF; }
.decor-line .line { width: 0; flex: 1; border-left: 1px solid rgba(255, 255, 255, 0.2); }

/* ================= 容器自适应 ================= */
@container (min-height: 200px) {
  .project-table {
    padding: clamp(20px, 10cqh, 28px) clamp(8px, 3cqw, 12px) 8px;
  }
  .project-header {
    font-size: clamp(11px, 3cqw, 12px);
  }
  .stage-cell, .capacity-values > span {
    font-size: clamp(12px, 3.2cqw, 13px);
  }
  .project-row {
    min-height: clamp(28px, 8cqh, 32px);
    margin-top: clamp(4px, 2cqh, 6px);
  }
}
</style>