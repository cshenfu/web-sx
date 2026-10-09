<template>
    <div class="climate-map-components">
        <txMap class="txMap" :height="800"></txMap>
    </div>
</template>
<script setup>
// import txMap from '../../../components/txMap/txMap.vue';
import { ref, onMounted, onActivated, onBeforeUnmount, onDeactivated } from 'vue';
import mitt from '@/utils/eventBus';
const searchKey = ref({});

// onMounted(()=> {
//     console.log('onMounted');
    
//     initMitt()
// })
onActivated(()=> {
    initMitt()
})
onBeforeUnmount(() => {
    deletMitt()
}),
onDeactivated(()=> {
    deletMitt()
})
const initMitt =()=> {
    mitt.on('handleSearch',(val)=>{
        searchKey.value = val
        getTableData(val);
    });
    mitt.on('resetSearch', (val) => {
        searchKey.value = val
        getTableData(val);
    });
    console.log('mitt',mitt);
}
const deletMitt =()=> {
    mitt.off('handleSearch');
    mitt.off('resetSearch');
}
// 获取地图数据
const getTableData = (val) => {
    console.log('地图数据请求', val);
};
</script>
<style lang="scss" scoped>
.climate-map-components {
    // margin-top: 16px;
}
</style>