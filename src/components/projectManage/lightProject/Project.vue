<template>
    <div class="project-list">
        <template v-if="isShowList">
            <div class="project-tabs"  >
                <ul class="project-tabs-ul">
                    <li
                        v-if="pvTypeNum"
                        class="project-tabs-li"
                        @click="chooseTabs(1)"
                        :class="activeKey == 1 ? 'active' : ''"
                        >一键光伏可研({{ pvTypeNum }})</li
                    >
                    <!-- <li
                        v-if="autoTypeNum"
                        class="project-tabs-li"
                        @click="chooseTabs(2)"
                        :class="activeKey == 2 ? 'active' : ''"
                        >AI找风资源({{ autoTypeNum }})</li
                    >
                    <li
                        v-if="proposalTypeNum"
                        class="project-tabs-li"
                        @click="chooseTabs(3)"
                        :class="activeKey == 3 ? 'active' : ''"
                        >项目建议书({{ proposalTypeNum }})</li
                    > -->
                </ul>
            </div>
            <div class="project-content">
                <my-project-list v-if="activeKey == 1"></my-project-list>
                <automatic-list  v-if="activeKey == 2"></automatic-list>
                <proposal-list v-if="activeKey == 3"></proposal-list>
            </div>
        </template>
        <div class="empty-img-wrap" v-if="!isShowList">
            <img src="@/assets/img/index/empty-home.png" class="empty-img" alt="">
            <p>您最近暂无创建项目</p>
        </div>
    </div>
</template>
<script setup>
    import {
        ref,
        reactive,
        toRefs,
        onBeforeMount,
        onMounted,
        watchEffect,
        computed,
        nextTick,
        onBeforeUnmount
    } from 'vue';
    import MyProjectList from './components/MyProjectList.vue';
    import AutomaticList from './components/AutomaticList.vue';
    import ProposalList from './components/ProposalList.vue';
    import { useRoute, useRouter } from 'vue-router';
    import { getProvince } from '@/api/modules/base';
    import useAreaDataStore from '@/pinia/modules/areaData';
    import {getDataStatistics, getDataLightStatistics} from '@/api/modules/project';
    import eventBus from '@/utils/eventBus.js';
    import usePublicDataStore from '@/pinia/modules/public';
    const publicDataStore = usePublicDataStore()
    let areaDataStore = useAreaDataStore();
    const chooseTabs = (index) => {
        gtag('event', 'view_project_list', {
                user_info_id: sessionStorage.getItem('userId'),
        });
        activeKey.value = index;
        sessionStorage.setItem('activeIndex', activeKey.value);
    };
    const pvTypeNum = ref(0); //光伏一键可研
    // const autoTypeNum = ref(0); // AI找风资源
    // const proposalTypeNum = ref(0); //  项目建议书
    const activeKey = ref(0); // 默认显示一键可研
    const isShowList = computed(() => {
        return pvTypeNum.value;
        // return pvTypeNum.value || autoTypeNum.value || proposalTypeNum.value;
    })
    /**
     * 路由对象
     */
    const route = useRoute();
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
    const getAllCount = async () => {
        try {
            let data =sessionStorage.getItem('userId')
            const res = await getDataLightStatistics(data);
            if (res.code === 200 && res.data) {
                areaDataStore.allDataCount  =res.data
                pvTypeNum.value = res.data?.pvTypeNum;
                // autoTypeNum.value = res.data?.autoTypeProjectCount?.autoTypeNum;
                // proposalTypeNum.value = res.data?.proposalTypeProjectCount?.proposalTypeNum;
                if (pvTypeNum.value) {
                    activeKey.value = 1;
                }
                // if (pvTypeNum.value) {
                //     activeKey.value = 1;
                // } else if (autoTypeNum.value) {
                //     activeKey.value = 2;
                // } else if (proposalTypeNum.value) {
                //     activeKey.value = 3;
                // }
                // 用于删除操作tab回到原来状态
                if (sessionStorage.getItem('activeIndex')) {
                    activeKey.value = Number(sessionStorage.getItem('activeIndex'));
                    sessionStorage.removeItem('activeIndex');
                }
                // 用于AI找风资源历史版本回到列表，tab回显
                if (sessionStorage.getItem('activeHistoryIndex')) {
                    activeKey.value = Number(sessionStorage.getItem('activeHistoryIndex'));
                    sessionStorage.removeItem('activeHistoryIndex');
                }
            }else {
                pvTypeNum.value = 0;
                // autoTypeNum.value =0;
                // proposalTypeNum.value =0;
            }
        } catch (error) {
            
        }
    }
    onBeforeMount(async () => {
        // if(areaDataStore.allDataCount?.windTypeProjectCount || areaDataStore.allDataCount?.autoTypeProjectCount){
        //     pvTypeNum.value = areaDataStore.allDataCount?.windTypeProjectCount?.pvTypeNum;
        //     autoTypeNum.value = areaDataStore.allDataCount?.autoTypeProjectCount.autoTypeNum;
        //     activeKey.value = pvTypeNum.value? 1 : 2;
        //     // 用于AI找风资源历史版本回到列表，tab回显
        //     if (sessionStorage.getItem('activeIndex')) {
        //         activeKey.value = Number(sessionStorage.getItem('activeIndex'));
        //         sessionStorage.removeItem('activeIndex');
        //     }
        // }else {
        //     getAllCount();
        // }
        sessionStorage.removeItem('activeIndex');
        getAllCount();
        await getAllAreaData();
    });
    onMounted(() => {
        eventBus.on('updateProjectCount', () => {
            getAllCount();
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
