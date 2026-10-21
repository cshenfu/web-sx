<template>
    <div class="project-list">
            <div class="project-content">
                <my-project-list></my-project-list>
            </div>
    </div>
</template>
<script setup>
    import {
        ref,
        onBeforeMount,
        onMounted,
        computed,
        nextTick,
        onBeforeUnmount
    } from 'vue';
    import MyProjectList from './components/MyProjectList.vue';
    import { useRoute, useRouter } from 'vue-router';
    import { getProvince } from '@/api/modules/base';
    import useAreaDataStore from '@/pinia/modules/areaData';
    import {getDataStatistics} from '@/api/modules/project';
    import eventBus from '@/utils/eventBus.js';
    import usePublicDataStore from '@/pinia/modules/public';
    const publicDataStore = usePublicDataStore()
    let areaDataStore = useAreaDataStore();
    /**
     * 路由实例
     */
    const router = useRouter();
    const getAllAreaData = async () => {
        return await getProvince().then((res) => {
            if (res.code === 200) {
                areaDataStore.areaArr = res.data?.subList;
            } else {
                areaDataStore.areaArr = [];
            }
        });
    };
    onBeforeMount(async () => {
        // if(areaDataStore.allDataCount?.windTypeProjectCount || areaDataStore.allDataCount?.autoTypeProjectCount){
        //     windTypeNum.value = areaDataStore.allDataCount?.windTypeProjectCount?.windTypeNum;
        //     autoTypeNum.value = areaDataStore.allDataCount?.autoTypeProjectCount.autoTypeNum;
        //     activeKey.value = windTypeNum.value? 1 : 2;
        //     // 用于AI找风资源历史版本回到列表，tab回显
        //     if (sessionStorage.getItem('activeIndex')) {
        //         activeKey.value = Number(sessionStorage.getItem('activeIndex'));
        //         sessionStorage.removeItem('activeIndex');
        //     }
        // }else {
        //     getAllCount();
        // }
        sessionStorage.removeItem('activeIndex');
        // getAllCount();
        await getAllAreaData();
    });
    onMounted(() => {
        eventBus.on('updateProjectCount', () => {
            // getAllCount();
        });
        nextTick(() => {});
    });
    onBeforeUnmount(() => {
        eventBus.off('updateProjectCount');
    })
</script>
<style scoped lang="scss">
    @import '../project.scss';
</style>
