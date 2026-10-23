<template>
    <div class="climate-map-components" ref="mapBox">
        <!-- 等容器高度测量出来后再渲染地图，高度跟随白色卡片 -->
        <txMap v-if="mapHeight > 0" class="txMap" :height="mapHeight"></txMap>
    </div>
</template>
<script setup>
// import txMap from '../../../../components/txMap/txMap.vue';
import { ref, onMounted, onActivated, onBeforeUnmount, onDeactivated, onBeforeMount } from 'vue';
import mitt from '@/utils/eventBus';
const searchKey = ref({});

// 地图高度：跟随容器（卡片剩余空间），窗口变化时同步
const mapBox = ref(null);
const mapHeight = ref(0);
let resizeObserver = null;
const updateMapHeight = () => {
    const h = mapBox.value?.clientHeight || 0;
    if (h > 0) mapHeight.value = h;
};

onMounted(() => {
    console.log('onMounted');
    updateMapHeight();
    if (typeof ResizeObserver !== 'undefined' && mapBox.value) {
        resizeObserver = new ResizeObserver(updateMapHeight);
        resizeObserver.observe(mapBox.value);
    }
    initMitt()
})
onActivated(() => {
    console.log('电网现状,onActivated');
    initMitt()
})
onBeforeUnmount(() => {
    resizeObserver?.disconnect();
    deletMitt()
});
onDeactivated(() => {
    deletMitt()
})
const initMitt = () => {
    // mitt.on('*',(type,val)=>{
    //     searchKey.value = val
    //     getTableData(val);
    // })
    mitt.on('handleSearch', (val) => {
        searchKey.value = val
        getTableData(val);
    });
    mitt.on('resetSearch', (val) => {
        searchKey.value = val
        getTableData(val);
    });
}
const deletMitt = async () => {
    mitt.off('handleSearch');
    mitt.off('resetSearch');
    await mitt.all.clear()
}
// 获取地图数据
const getTableData = (val) => {
    console.log('地图数据请求', val);
};
</script>
<style lang="scss" scoped>
.climate-map-components {
    position: relative;
    width: 100%;
    height: 100%;
    min-height: 0;
    overflow: hidden;
}
</style>