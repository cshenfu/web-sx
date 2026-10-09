<template>
    <div class="geology-map-components">
        <txMap class="txMap" :height="800"></txMap>
    </div>
</template>
<script setup>
import {watch} from 'vue';
// import txMap from '@/components/txMap/txMap.vue';
const props = defineProps({
    // 数据
    dataSource: {
        type: Object,
        default: () => []
    }
})
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