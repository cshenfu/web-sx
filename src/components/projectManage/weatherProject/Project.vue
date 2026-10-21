<template>
    <div class="project-list">
            <div class="project-content">
                <my-project-list :itemType="0"></my-project-list>
            </div>
        <div class="empty-img-wrap" v-if="!isShowList">
            <img src="@/assets/img/index/empty-home.png" class="empty-img" alt="">
            <p>您最近暂无创建项目</p>
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
    import AutomaticList from './components/AutomaticList.vue';
    import ProposalList from './components/ProposalList.vue';
    import { useRoute, useRouter } from 'vue-router';
    import { getProvince } from '@/api/modules/base';
    import useAreaDataStore from '@/pinia/modules/areaData';
    import {getDataStatistics} from '@/api/modules/project';
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
    const windTypeNum = ref(0); //一键可研-集中式
    const windTypeDistributedNum = ref(0); //一键可研-分散式
    const autoTypeNum = ref(0); // AI找风资源
    const proposalTypeNum = ref(0); //  项目建议书
    const activeKey = ref(101); // 默认显示一键可研
    const isShowList = computed(() => {
        return windTypeNum.value || windTypeDistributedNum.value || autoTypeNum.value || proposalTypeNum.value;
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
