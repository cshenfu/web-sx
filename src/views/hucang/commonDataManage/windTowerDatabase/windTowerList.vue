<template>
  <!-- 唯一根节点 -->
  <div class="wind-tower-root">
    <div class="wind-tower-page-bg">
      <!-- 背景光晕层 -->
      <div class="bg-glow-top-left"></div>
      <div class="bg-glow-bottom-right"></div>
      <div class="bg-glow-top-right"></div>

      <!-- 顶部 Header -->
      <div class="page-header">
        <span class="page-title">测风塔数据库</span>
      </div>

      <!-- 主卡片：搜索栏 + 列表 / 地图 + 分页，整体白底 -->
      <div class="main-card">
        <div class="filter-bar">
          <wind-tower-list-search-bar ref="windTowerListSearch" @getModeType="getModeType" />
        </div>

        <div class="table-wrapper" :class="{ 'is-map': modeType == 'a' }">
          <WindTowerMaps v-if="modeType == 'a'"></WindTowerMaps>
          <AllWindTowerList v-if="modeType == 'b'"></AllWindTowerList>
        </div>
      </div>
    </div>

    <!-- 新增数据 -->
    <add-wind-towe-data v-model:openModal="openAddModal"></add-wind-towe-data>
  </div>
</template>

<script setup>
import { ref, onMounted, onActivated, onDeactivated } from 'vue';
import AllWindTowerList from './components/AllWindTowerList.vue';
import WindTowerMaps from './components/WindTowerMaps.vue';
import WindTowerListSearchBar from './components/WindTowerListSearchBar.vue';
import AddWindToweData from './components/AddWindToweData.vue';
import { useRouter } from 'vue-router';

const allWindTowerListRef = ref(null);
const modeType = ref('')
const windTowerListSearch = ref(null)

onMounted(() => {
  modeType.value = windTowerListSearch.value?.searchKey?.modeType
})
onActivated(() => {
  modeType.value = windTowerListSearch.value?.searchKey?.modeType
})
onDeactivated(() => {
  modeType.value = ''
})

// 地图还是公共数据
const getModeType = (val) => {
  modeType.value = val
};
const router = useRouter()

// 新增数据
const openAddModal = ref(false);
const addData = () => {
  openAddModal.value = true;
}
</script>

<style scoped lang='scss'>
@import './windTower.scss';

.wind-tower-root {
  width: 100%;
  height: 100%;
}

/* 外层容器：纵向 flex，撑满父级 */
.wind-tower-page-bg {
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