<template>
  <section class="dashboard-panel warning-panel">
    <div class="panel-heading">
      <span class="heading-mark warning-mark">◒</span>
      <span class="panel-title">进度预警</span>
      <span class="panel-unit">目标完成情况</span>
    </div>

    <div class="warning-list">
      <div
        v-for="item in items"
        :key="item.key || item.label"
        class="warning-item"
        :class="item.actual < item.target ? 'is-lagging' : 'is-normal'"
      >
        <img
          class="warning-icon"
          :src="item.actual < item.target ? lagIcon : normalIcon"
          :alt="item.actual < item.target ? '滞后' : '正常'"
        />
        <div class="warning-main">
          <div class="warning-title">
            <span>{{ item.label }}</span>
            <strong v-if="item.actual < item.target">
              滞后 {{ item.target - item.actual }}{{ item.unit }}
            </strong>
            <strong v-else>正常</strong>
          </div>
          <div class="warning-subtitle">
            目标 {{ item.target }}{{ item.unit }}
            <span>·</span>
            实际完成 {{ item.actual }}{{ item.unit }}
          </div>
          <div class="warning-progress">
            <i :style="{ width: `${completionPercent(item)}%` }" />
          </div>
        </div>
        <span class="status-chip">{{ item.actual < item.target ? '滞后' : '正常' }}</span>
      </div>
    </div>
  </section>
</template>

<script setup>
import normalIcon from '@/assets/img/qinchuan/dashbord/zc.png'
import lagIcon from '@/assets/img/qinchuan/dashbord/zh.png'
import { progressWarningData } from '../js/dashboardMcokData'

defineProps({
  items: {
    type: Array,
    default: () => progressWarningData,
  },
})

function completionPercent(item) {
  if (!item.target) return 0
  return Math.min(100, Math.max(0, Math.round((item.actual / item.target) * 100)))
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

.warning-list {
  padding: 9px;
}

.warning-item {
  display: flex;
  min-height: 53px;
  align-items: center;
  gap: 8px;
  padding: 6px 7px 6px 6px;
  border: 1px solid rgba(46, 146, 221, 0.26);
  border-radius: 4px;
  background: linear-gradient(90deg, rgba(19, 99, 160, 0.36), rgba(10, 50, 95, 0.25));
}

.warning-item + .warning-item {
  margin-top: 5px;
}

.warning-item.is-lagging {
  border-color: rgba(255, 112, 123, 0.42);
  background: linear-gradient(90deg, rgba(125, 54, 91, 0.44), rgba(50, 43, 83, 0.28));
}

.warning-icon {
  width: 28px;
  height: 28px;
  flex: 0 0 auto;
  object-fit: contain;
}

.warning-main {
  min-width: 0;
  flex: 1;
}

.warning-title,
.warning-subtitle {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.warning-title {
  color: #d9f1ff;
  font-size: 11px;
  font-weight: 700;
}

.warning-title strong {
  color: #52ddff;
  font-size: 10px;
  font-weight: 500;
}

.is-lagging .warning-title strong {
  color: #ff7180;
}

.warning-subtitle {
  justify-content: flex-start;
  gap: 5px;
  margin-top: 3px;
  color: #739db9;
  font-size: 9px;
}

.warning-progress {
  height: 3px;
  margin-top: 5px;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(77, 143, 186, 0.29);
}

.warning-progress i {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: #43dcf6;
  box-shadow: 0 0 6px #43dcf6;
}

.is-lagging .warning-progress i {
  background: #ff6679;
  box-shadow: 0 0 6px #ff6679;
}

.status-chip {
  display: inline-flex;
  min-width: 28px;
  justify-content: center;
  padding: 2px 4px;
  border: 1px solid rgba(70, 222, 249, 0.6);
  border-radius: 2px;
  color: #58defd;
  font-size: 9px;
}

.is-lagging .status-chip {
  border-color: rgba(255, 113, 128, 0.64);
  color: #ff7888;
}

@media (max-width: 1050px) {
  .panel-title {
    font-size: 12px;
  }

  .warning-title {
    font-size: 10px;
  }
}

@media (max-height: 820px), (max-width: 1200px) {
  .panel-heading {
    min-height: 29px;
  }

  .warning-list {
    padding: 6px;
  }

  .warning-item {
    min-height: 43px;
    gap: 6px;
    padding: 5px 6px 5px 5px;
  }

  .warning-item + .warning-item {
    margin-top: 3px;
  }

  .warning-icon {
    width: 23px;
    height: 23px;
  }

  .warning-title {
    font-size: 10px;
  }

  .warning-subtitle {
    margin-top: 2px;
    font-size: 8px;
  }

  .warning-progress {
    margin-top: 3px;
  }

  .status-chip {
    min-width: 25px;
    padding: 1px 3px;
    font-size: 8px;
  }
}
</style>