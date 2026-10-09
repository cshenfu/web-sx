<template>
  <section class="dashboard-panel annual-panel">
    <div class="panel-heading">
      <span class="heading-mark">◒</span>
      <span class="panel-title">年度目标</span>
      <span class="panel-unit">{{ data.year || '2026年' }}</span>
    </div>

    <div class="target-list">
      <div
        v-for="item in targetItems"
        :key="item.key"
        class="target-item"
      >
        <div class="target-ring" :style="ringStyle(item)">
          <div class="ring-inner">
            <strong>{{ percentage(item) }}%</strong>
            <span>{{ item.label }}</span>
          </div>
        </div>

        <div class="target-content">
          <div class="target-caption">
            <span>{{ item.label }}已完成</span>
            <strong>{{ formatValue(item.completed) }} <small>{{ item.unit }}</small></strong>
          </div>
          <div class="progress-track">
            <i :style="{ width: `${percentage(item)}%` }" />
            <b :style="{ left: `${percentage(item)}%` }" />
          </div>
          <div class="target-meta">
            <span>年度目标 {{ formatValue(item.target) }} {{ item.unit }}</span>
            <span>完成 {{ formatValue(item.completed) }} {{ item.unit }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import developmentIcon from '@/assets/img/qinchuan/dashbord/kf.png'
import commissioningIcon from '@/assets/img/qinchuan/dashbord/tc.png'
import { annualTargetData } from '../js/dashboardMcokData'

const props = defineProps({
  data: {
    type: Object,
    default: () => annualTargetData,
  },
})

const targetItems = computed(() => [
  { ...props.data.development, key: 'development', icon: developmentIcon },
  { ...props.data.commissioning, key: 'commissioning', icon: commissioningIcon },
])

function percentage(item) {
  if (!item.target) return 0
  return Math.min(100, Math.max(0, Math.round((item.completed / item.target) * 100)))
}

function formatValue(value) {
  return Number(value || 0).toLocaleString('zh-CN')
}

function ringStyle(item) {
  const percent = percentage(item)
  const color = item.key === 'development' ? '#35d9ff' : '#40e8d0'
  return {
    '--ring-progress': `${percent * 3.6}deg`,
    '--ring-color': color,
    '--ring-icon': `url(${item.icon})`,
  }
}
</script>

<style scoped>
.dashboard-panel {
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(67, 161, 235, 0.48);
  border-radius: 6px;
  background:
    linear-gradient(135deg, rgba(15, 66, 113, 0.82), rgba(5, 23, 56, 0.85) 62%),
    rgba(4, 19, 47, 0.86);
  box-shadow:
    inset 0 0 24px rgba(20, 136, 237, 0.1),
    0 0 16px rgba(0, 116, 224, 0.13);
}

.panel-heading {
  display: flex;
  align-items: center;
  min-height: 33px;
  padding: 0 10px;
  border-bottom: 1px solid rgba(101, 189, 255, 0.27);
  background: linear-gradient(90deg, rgba(26, 115, 185, 0.55), rgba(17, 59, 112, 0.18));
  color: #f2f9ff;
}

.heading-mark {
  display: inline-flex;
  width: 19px;
  height: 19px;
  align-items: center;
  justify-content: center;
  margin-right: 7px;
  border: 1px solid rgba(160, 225, 255, 0.9);
  border-radius: 4px;
  color: #9ce5ff;
  font-size: 12px;
  box-shadow: 0 0 8px rgba(80, 198, 255, 0.5);
}

.panel-title {
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.1em;
}

.panel-unit {
  margin-left: auto;
  color: #8cb5d4;
  font-size: 10px;
}

.target-list {
  padding: 12px 13px 10px;
}

.target-item {
  display: flex;
  align-items: center;
  gap: 11px;
}

.target-item + .target-item {
  margin-top: 10px;
}

.target-ring {
  position: relative;
  display: grid;
  width: 62px;
  height: 62px;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 50%;
  background: conic-gradient(
    var(--ring-color) 0 var(--ring-progress),
    rgba(47, 108, 157, 0.33) var(--ring-progress) 360deg
  );
  filter: drop-shadow(0 0 8px color-mix(in srgb, var(--ring-color) 65%, transparent));
}

.target-ring::before {
  position: absolute;
  inset: 4px;
  border-radius: 50%;
  background: #0d3862;
  content: '';
}

.target-ring::after {
  position: absolute;
  inset: 10px;
  border-radius: 50%;
  background: var(--ring-icon) center / contain no-repeat;
  content: '';
  opacity: 0.68;
}

.ring-inner {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  transform: translateY(1px);
}

.ring-inner strong {
  color: #effaff;
  font-size: 15px;
  line-height: 17px;
}

.ring-inner span {
  color: #8bc2e6;
  font-size: 9px;
}

.target-content {
  min-width: 0;
  flex: 1;
}

.target-caption,
.target-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.target-caption {
  color: #c9e6f8;
  font-size: 11px;
}

.target-caption strong {
  color: #62ddff;
  font-size: 13px;
}

.target-caption small {
  color: #84abc4;
  font-size: 9px;
  font-weight: 400;
}

.progress-track {
  position: relative;
  height: 5px;
  margin: 8px 7px 6px 0;
  border-radius: 999px;
  background: rgba(40, 100, 152, 0.48);
}

.progress-track i {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #0ba7e9, #53e7ff);
  box-shadow: 0 0 8px rgba(45, 205, 255, 0.75);
}

.target-item:last-child .progress-track i {
  background: linear-gradient(90deg, #10aeb4, #67f1d8);
  box-shadow: 0 0 8px rgba(52, 234, 213, 0.65);
}

.progress-track b {
  position: absolute;
  top: 50%;
  width: 9px;
  height: 9px;
  border: 2px solid #b9f5ff;
  border-radius: 50%;
  background: #1179b1;
  box-shadow: 0 0 6px #3bd9ff;
  transform: translate(-50%, -50%);
}

.target-meta {
  color: #709bb6;
  font-size: 9px;
}

@media (max-width: 1050px) {
  .panel-title {
    font-size: 12px;
  }

  .target-ring {
    width: 54px;
    height: 54px;
  }

  .ring-inner strong {
    font-size: 13px;
  }
}

@media (max-height: 820px), (max-width: 1200px) {
  .panel-heading {
    min-height: 29px;
  }

  .target-list {
    padding: 8px 10px 7px;
  }

  .target-item {
    gap: 8px;
  }

  .target-item + .target-item {
    margin-top: 6px;
  }

  .target-ring {
    width: 50px;
    height: 50px;
  }

  .ring-inner strong {
    font-size: 12px;
    line-height: 14px;
  }

  .ring-inner span {
    font-size: 8px;
  }

  .target-caption {
    font-size: 10px;
  }

  .target-caption strong {
    font-size: 12px;
  }

  .progress-track {
    margin: 5px 5px 5px 0;
  }

  .target-meta {
    font-size: 8px;
  }
}
</style>