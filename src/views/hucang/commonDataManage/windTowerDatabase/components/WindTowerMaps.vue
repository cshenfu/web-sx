<template>
    <div class="wind-tower-map-components">
        <txMap class="txMap" :height="800"></txMap>
    </div>
</template>
<script setup>
// import txMap from '../../../../components/txMap/txMap.vue';
import { ref, onMounted, onActivated, onBeforeUnmount, onDeactivated, onBeforeMount, onUnmounted } from 'vue';
import mitt from '@/utils/eventBus';
const props = defineProps({
    activeKey: {
        type: Number,
        default: 1,
    },
})
const searchKey = ref({});
onBeforeMount(()=> {
    initMitt()
})
onActivated(()=> {
    initMitt()
})
onBeforeUnmount(() => {
    deletMitt()
}),
onDeactivated(()=> {
    deletMitt()
})
onUnmounted(() => {
    
})
const initMitt =async ()=> {
    await mitt.on('*',(type,val)=>{
        searchKey.value = val? val: {}
        getTableData(val);
    })
}
const deletMitt =async()=> {
    mitt.off('handleSearch');
    mitt.off('resetSearch');
    mitt.off('uploadList');
    await mitt.all.clear()
}
// 获取地图数据
const getTableData = (val) => {
    console.log('地图数据请求', val);
};
</script>
<style lang="scss" scoped>
.wind-tower-map-components{
}
</style>