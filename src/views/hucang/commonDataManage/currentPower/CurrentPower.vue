<template>
  <!-- 唯一根节点 -->
  <div class="current-power-root">
    <div class="current-power-page-bg">
      <!-- 背景光晕层 -->
      <div class="bg-glow-top-left"></div>
      <div class="bg-glow-bottom-right"></div>
      <div class="bg-glow-top-right"></div>

      <!-- 顶部 Header -->
      <div class="page-header">
        <span class="page-title">电网现状</span>
      </div>

      <!-- 主卡片：搜索栏 + 列表 / 地图，整体白底 -->
      <div class="main-card">
        <div class="filter-bar">
          <current-power-list-search-bar
            @getModeType="getModeType"
            ref="currentPowerRef"
          />
        </div>

        <div class="table-wrapper" :class="{ 'is-map': modeType == 'a' }">
          <current-power-map v-if="modeType == 'a'"></current-power-map>
          <all-power-list v-if="modeType == 'b'"></all-power-list>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onActivated } from 'vue';
import AllPowerList from './components/AllPowerList.vue';
import CurrentPowerListSearchBar from './components/CurrentPowerListSearchBar.vue';
import CurrentPowerMap from './components/CurrentPowerMap.vue';

const modeType = ref('a');
const currentPowerRef = ref(null);

onMounted(() => {
  // 加可选链：搜索栏 ref 未就绪时访问 searchKey 不会报错
  const initMode = currentPowerRef.value?.searchKey?.modeType;
  if (initMode) modeType.value = initMode;
});

const getModeType = (val) => {
  modeType.value = val;
};

onActivated(() => {
  console.log('currentPower');
});
</script>

<style scoped lang="scss">
/* 已移除 @import './currentPower.scss';
   如果该文件里还有变量/mixin 需要复用，请拆成单独文件按需引入，
   避免旧样式覆盖新布局 */

.current-power-root {
  width: 100%;
  height: 100%;
}

/* 外层容器：纵向 flex，撑满父级 */
.current-power-page-bg {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: linear-gradient(122.01deg, #E6EEF8 0%, #D2E0F4 100%), #FFFFFF;
  overflow: hidden;
}

/* ========== 背景光晕层 ========== */
.bg-glow-top-left {
  position: absolute;
  left: -1.61%;
  top: -18.52%;
  width: 350px;
  height: 350px;
  background: linear-gradient(135deg, #FFCCD5 0%, #FECFEF 100%);
  opacity: 0.49;
  filter: blur(129.5px);
  border-radius: 50%;
  pointer-events: none;
  z-index: 1;
}
.bg-glow-bottom-right {
  position: absolute;
  right: 4.64%;
  bottom: -18.13%;
  width: 450px;
  height: 450px;
  background: linear-gradient(120deg, #A1C4FD 0%, #C2E9FB 100%);
  opacity: 0.7;
  filter: blur(123px);
  border-radius: 50%;
  pointer-events: none;
  z-index: 1;
}
.bg-glow-top-right {
  position: absolute;
  right: 19.01%;
  top: -37.04%;
  width: 300px;
  height: 300px;
  background: linear-gradient(120deg, #A1C4FD 0%, #C2E9FB 100%);
  opacity: 0.7;
  filter: blur(123px);
  border-radius: 50%;
  pointer-events: none;
  z-index: 1;
}

/* ========== 顶部 Header ========== */
.page-header {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  height: 67px;
  padding: 15px 20px;
  box-sizing: border-box;
  flex-shrink: 0;
  border-bottom: 1px solid #E2E9F0;
}
.page-title {
  font-family: 'PingFang SC';
  font-weight: 500;
  font-size: 16px;
  color: #0B1C2C;
}

/* ========== 主卡片 ========== */
.main-card {
  position: relative;
  z-index: 2;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  margin: 0 12px 30px;
  background: #FFFFFF;
  border: 1px solid #DFE5EC;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(11, 28, 44, 0.04);
  overflow: hidden;
}

.filter-bar {
  flex-shrink: 0;
  background: #FFFFFF;
}

.table-wrapper {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 0 20px;
  box-sizing: border-box;
  overflow: hidden;

  > * {
    flex: 1;
    min-height: 0;
  }

  /* 地图模式：铺满卡片，不留内边距 */
  &.is-map {
    padding: 0;
  }
}
</style>