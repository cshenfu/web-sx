<template>
    <div class="geology-map-components" ref="mapBox">
        <!-- 等容器高度测量出来后再渲染地图，高度跟随白色卡片 -->
        <txMap v-if="mapHeight > 0" class="txMap" :height="mapHeight"></txMap>
    </div>
</template>
<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
// import txMap from '@/components/txMap/txMap.vue';
const props = defineProps({
    // 数据（父组件传入的是数组，类型同时允许 Object / Array，避免类型校验警告）
    dataSource: {
        type: [Object, Array],
        default: () => []
    }
})

// 地图高度：跟随容器（卡片剩余空间），窗口变化时同步
const mapBox = ref(null);
const mapHeight = ref(0);
let resizeObserver = null;
const updateMapHeight = () => {
    const h = mapBox.value?.clientHeight || 0;
    if (h > 0) mapHeight.value = h;
};
onMounted(() => {
    updateMapHeight();
    if (typeof ResizeObserver !== 'undefined' && mapBox.value) {
        resizeObserver = new ResizeObserver(updateMapHeight);
        resizeObserver.observe(mapBox.value);
    }
});
onBeforeUnmount(() => {
    resizeObserver?.disconnect();
});

// 数据格式处理，获取地图模式数据
const getMapData = () => {
    console.log(props.dataSource)
}
watch(() => [props.dataSource], () => {
    getMapData()
}, {
    deep: true,
    immediate: true
})
</script>
<style lang="scss" scoped>
.geology-map-components {
    position: relative;
    width: 100%;
    height: 100%;
    min-height: 0;
    overflow: hidden;
}
</style>