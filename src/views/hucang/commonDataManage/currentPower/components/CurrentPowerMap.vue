<template>
  <div class="climate-map-components" ref="mapBox">
    <!-- 地图高度跟随父卡片剩余空间，容器尺寸确定后再渲染 -->
    <txMap v-if="mapHeight > 0" class="txMap" :height="mapHeight"></txMap>
  </div>
</template>

<script setup>
// import txMap from '../../../../components/txMap/txMap.vue';
import { ref, onMounted, onActivated, onBeforeUnmount, onDeactivated, nextTick } from 'vue';
import mitt from '@/utils/eventBus';

const searchKey = ref({});
const mapBox = ref(null);
const mapHeight = ref(0);
let resizeObserver = null;
let isListening = false;

const updateMapHeight = () => {
  const height = mapBox.value?.clientHeight || 0;
  if (height > 0) mapHeight.value = height;
};

const handleSearchEvent = (value) => {
  searchKey.value = value;
  getTableData(value);
};
const resetSearchEvent = (value) => {
  searchKey.value = value;
  getTableData(value);
};

const initMitt = () => {
  if (isListening) return;
  mitt.on('handleSearch', handleSearchEvent);
  mitt.on('resetSearch', resetSearchEvent);
  isListening = true;
};
const deleteMitt = () => {
  if (!isListening) return;
  mitt.off('handleSearch', handleSearchEvent);
  mitt.off('resetSearch', resetSearchEvent);
  isListening = false;
};

const observeMapBox = () => {
  if (!mapBox.value) return;
  updateMapHeight();
  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver?.disconnect();
    resizeObserver = new ResizeObserver(updateMapHeight);
    resizeObserver.observe(mapBox.value);
  } else {
    window.addEventListener('resize', updateMapHeight);
  }
};

onMounted(() => {
  observeMapBox();
  initMitt();
});
onActivated(() => {
  initMitt();
  nextTick(updateMapHeight);
});
onBeforeUnmount(() => {
  resizeObserver?.disconnect();
  window.removeEventListener('resize', updateMapHeight);
  deleteMitt();
});
onDeactivated(() => {
  deleteMitt();
});

// 获取地图数据
const getTableData = (value) => {
  console.log('地图数据请求', value);
};
</script>

<style lang="scss" scoped>
.climate-map-components {
  position: relative;
  display: flex;
  flex: 1 1 auto;
  width: 100%;
  height: 100%;
  min-height: 0;
  overflow: hidden;
}
.txMap {
  display: block;
  flex: 1 1 auto;
  min-height: 0;
}
</style>