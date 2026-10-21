<template>
    <div class="project-list">
        <template v-if="isShowList">
            <div class="project-tabs">
                <ul class="project-tabs-ul">
                    <li
                        v-if="pvTypeDraftNum"
                        class="project-tabs-li"
                        @click="chooseTabs(1)"
                        :class="activeKey == 1 ? 'active' : ''"
                        >一键光伏可研({{ pvTypeDraftNum }})</li
                    >
                    <!-- <li
                        v-if="autoTypeDraftNum"
                        class="project-tabs-li"
                        @click="chooseTabs(2)"
                        :class="activeKey == 2 ? 'active' : ''"
                        >AI找风资源({{ autoTypeDraftNum }})</li
                    >
                    <li
                        v-if="proposalTypeDraftNum"
                        class="project-tabs-li"
                        @click="chooseTabs(3)"
                        :class="activeKey == 3 ? 'active' : ''"
                        >项目建议书({{ proposalTypeDraftNum }})</li
                    > -->
                </ul>
            </div>
            <div class="project-content">
                <draft-project-list v-if="activeKey == 1"></draft-project-list>
                <draft-auto-project-list v-if="activeKey == 2"></draft-auto-project-list>
                <draft-proposal-project-list v-if="activeKey == 3"></draft-proposal-project-list>
            </div>
        </template>
        <div class="empty-img-wrap" v-if="!isShowList">
            <img src="@/assets/img/index/empty-home.png" class="empty-img" alt="" />
            <p>您最近暂无创建项目</p>
        </div> 
    </div>
</template>
<script setup>
    import { ref, reactive, toRefs, onBeforeMount, onMounted, watchEffect, computed, onBeforeUnmount } from 'vue';
    import DraftProjectList from './components/DraftProjectList.vue';
    import DraftAutoProjectList from './components/DraftAutoProjectList.vue';
    import DraftProposalProjectList from './components/DraftProposalProjectList.vue';
    import { useRoute, useRouter } from 'vue-router';
    import { getProvince } from '@/api/modules/base';
    import useAreaDataStore from '@/pinia/modules/areaData';
    import {getDataLightStatistics} from '@/api/modules/project';
    import eventBus from '@/utils/eventBus.js';
    let areaDataStore = useAreaDataStore();
    const chooseTabs = (index) => {
        if (index == 1) {
            // 用户行为日志--项目列表查看
            gtag('event', 'view_project_list', {
                user_info_id: sessionStorage.getItem('userId'),
            });
        } else {
            // 用户行为日志--项目草稿查看
            gtag('event', 'view_project_draft', {
                user_info_id: sessionStorage.getItem('userId'),
            });
        }

        activeKey.value = index;
        sessionStorage.setItem('activeIndex', activeKey.value);
    };
    const pvTypeDraftNum = ref(0);
    // const autoTypeDraftNum = ref(0); // AI找风资源
    // const proposalTypeDraftNum = ref(0); // 项目建议书
    const activeKey = ref(0); // 默认显示一键可研
    const isShowList = computed(() => {
        return pvTypeDraftNum.value;
        // return pvTypeDraftNum.value || autoTypeDraftNum.value || proposalTypeDraftNum.value;
    });
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
            let data = sessionStorage.getItem('userId');
            const res = await getDataLightStatistics(data);
            if (res.code === 200 && res.data) {
                areaDataStore.allDataCount  =res.data
                pvTypeDraftNum.value = res.data?.pvTypeDraftNum;
                // autoTypeDraftNum.value = res.data?.autoTypeProjectCount?.autoTypeDraftNum;
                // proposalTypeDraftNum.value = res.data?.proposalTypeProjectCount?.proposalTypeDraftNum;
                // activeKey.value = pvTypeDraftNum.value ? 1 : 2;
                if (pvTypeDraftNum.value) {
                    activeKey.value = 1;
                }
                // if (pvTypeDraftNum.value) {
                //     activeKey.value = 1;
                // } else if (autoTypeDraftNum.value) {
                //     activeKey.value = 2;
                // } else if (proposalTypeDraftNum.value) {
                //     activeKey.value = 3;
                // }
                // 用于AI找风资源历史版本回到列表，tab回显
                if (sessionStorage.getItem('activeIndex')) {
                    activeKey.value = Number(sessionStorage.getItem('activeIndex'));
                    sessionStorage.removeItem('activeIndex');
                }
            } else {
                pvTypeDraftNum.value = 0;
                // autoTypeDraftNum.value = 0;
                // proposalTypeDraftNum.value = 0;
            }
        } catch (error) {}
    };
    onBeforeMount(async () => {
        // if(areaDataStore.allDataCount?.windTypeProjectCount || areaDataStore.allDataCount?.autoTypeProjectCount){
        //     pvTypeDraftNum.value = areaDataStore.allDataCount?.windTypeProjectCount?.pvTypeDraftNum;
        //     autoTypeDraftNum.value = areaDataStore.allDataCount?.autoTypeProjectCount.autoTypeDraftNum;
        //     activeKey.value = pvTypeDraftNum.value? 1 : 2;
        // }else {
        //     getAllCount();
        // }
        sessionStorage.removeItem('activeIndex');
        getAllCount();
        await getAllAreaData();
    });
    onMounted(() => {
        eventBus.on('updateDraftCount', () => {
            getAllCount();
        });
    });
    onBeforeUnmount(() => {
        eventBus.off('updateDraftCount');
    })
</script>
<style scoped lang="scss">
    @import '../../project.scss';
</style>
