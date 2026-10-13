<template>
    <div>
        <a-modal ref="modalRef" v-model:open="open" width="950px" :footer="null">
            <template #title>
                <div ref="modalTitleRef" style="width: 100%">资源下载</div>
            </template>
            <a-tabs @change="changeTabEvent">
                <a-tab-pane key="0" tab="报告及附图" :forceRender="true">
                    <down-resource-management
                        v-model:visibleDownloadModal="visibleDownloadModal"
                        :downloadModalList="downloadModalList"
                        :isReplaceFinally="isReplaceFinally"
                        @customRequest="customRequest"
                        @replaceAllFileFn="replaceAllFileFn"
                    >
                    </down-resource-management>
                </a-tab-pane>
                <a-tab-pane key="1" tab="土建数据" :forceRender="true">
                    <civilEngineeringEle :projectId="projectId" ref="civilEngineeringRef" :resourceData="civilEngineeringData"></civilEngineeringEle>
                </a-tab-pane>
                <a-tab-pane key="2" tab="道路数据" :forceRender="true">
                    <RoadDataEle :projectId="projectId" ref="roadDataRef" :resourceData="roadData"></RoadDataEle>
                </a-tab-pane>
                <a-tab-pane key="3" tab="集电线路" :forceRender="true">
                    <LineDataEle :projectId="projectId" ref="lineDataRef" :resourceData="lineData"></LineDataEle>
                </a-tab-pane>
                <a-tab-pane key="4" tab="用地面积" :forceRender="true">
                    <LandAreaEle :projectId="projectId" ref="landAreaRef" :resourceData="landAreaData"></LandAreaEle>
                </a-tab-pane>
            </a-tabs>
            <p class="desc-tip" v-if="activeKey !== '0'">注：保存操作仅限于当前页面数据</p>
            <div class="footer-content">
                <a-button @click="getAllPostDataEvent" v-if="activeKey !== '0'">保存</a-button>
                <a-button
                    type="primary"
                    class="footer-btn"
                    @click="emits('replaceAllFileFn')"
                    style="margin-left: 24px"
                    >重新生成报告
                </a-button>
                <!-- <a-button @click="getAllPostDataEvent">获取各个数据</a-button> -->
            </div>
        </a-modal>
    </div>
</template>
<script setup>
    import { ref, computed, watch, onBeforeMount } from 'vue';
    import DownResourceManagement from './DownResourceManagement.vue';
    // 土建
    import civilEngineeringEle from './resourceManageComponents/CivilEngineering.vue';
    // 道路
    import RoadDataEle from './resourceManageComponents/RoadData.vue';
    // 线路
    import LineDataEle from './resourceManageComponents/LineData.vue';
    // 用地面积
    import LandAreaEle from './resourceManageComponents/LandArea.vue';

    import { getResourceManage, updateProcessData } from '@/api/modules/resourceManage.js';
import { message } from 'ant-design-vue';
    const isAdmin = ref(false);
    const activeKey = ref('0');  // 1 土建 2 道路 3 线路 4 用地面积
    const civilEngineeringRef = ref(null);
    const roadDataRef = ref(null);
    const lineDataRef = ref(null);
    const landAreaRef = ref(null);
    // const refList = [civilEngineeringRef, roadDataRef, lineDataRef, landAreaRef];
    const refList = {
        '1': {
            title: '土建数据',
            refEle: civilEngineeringRef
        },
        '2': {
            title: '道路数据',
            refEle: roadDataRef
        },
        '3': {
            title: '集电线路',
            refEle: lineDataRef
        },
        '4': {
            title: '用地面积',
            refEle: landAreaRef
        }
    }
    const projectId = ref('');
    const props = defineProps({
        visibleDownloadModal: {
            type: Boolean,
            default: false,
        },
        downloadModalList: {
            type: Object,
            default: () => {},
        },
        isReplaceFinally: {
            type: Boolean,
            default: false,
        },
        currentData: {
            type: Object,
            default: () => null,
        },
    });
    const visibleDownloadModal = computed(() => props.visibleDownloadModal);
    const downloadModalList = computed(() => props.downloadModalList);
    const isReplaceFinally = computed(() => props.isReplaceFinally);
    const open = computed({
        get() {
            return props.visibleDownloadModal;
        },
        set(value) {
            // fileList.value = [];
            emits('update:visibleDownloadModal', value);
        },
    });
    const emits = defineEmits([
        ,
        'update:visibleDownloadModal',
        'customRequest',
        'replaceAllFileFn',
    ]);
    const customRequest = (e, listItem) => {
        emits('customRequest', e, listItem);
    };
    // 替换所有报告
    const replaceAllFileFn = () => {
        emits('replaceAllFileFn');
    };
    const civilEngineeringData = ref([]);
    const roadData = ref([]);
    const lineData = ref([]);
    const landAreaData = ref([]);

    // 初始化数据
    const initData = (id) => {
        getResourceManage(id).then(res => {
        // getResourceManage('1952').then(res => {
            if (res.code == 200) {
                let data = res.data || [];
                civilEngineeringData.value = data.filter(item => item.dataClassify == '1');
                roadData.value = data.filter(item => item.dataClassify == '2');
                lineData.value = data.filter(item => item.dataClassify == '3');
                landAreaData.value = data.filter(item => item.dataClassify == '4');
            }
        })
    }
    // 切换tab
    const changeTabEvent = (val) => {
        
        // console.log(activeKey.value)
        // console.log(val);
        if (activeKey.value !== '0') {
            // 切换前要把activeKey所在的tab数据进行保存
        }
        activeKey.value = val;
    }
    const getAllPostDataEvent = () => {
        const refCurrent = refList[activeKey.value]['refEle'].value;
        if (refCurrent && refCurrent.postData()) {
            console.log(refCurrent.postData())
            // return false;
            updateProcessData(refCurrent.postData()).then(res => {
                if (res.code == 200) {
                    console.log('保存成功');
                    message.success(`${refList[activeKey.value]['title']}数据保存成功`);
                }
            })
        }
        
    }
    onBeforeMount(() => {
        isAdmin.value = sessionStorage.getItem('username') == 'admin';
    });
    
    watch(
        () => props.currentData,
        (val) => {
            if (val) {
                console.log(props.currentData);
                if (props.currentData && props.currentData.id) {
                    initData(props.currentData.id) 
                    projectId.value = props.currentData.id;
                }
            }
        }, {
            immediate: true,
            deep: true
        }
    );
</script>
<style scoped lang="scss">
.footer-content {
    display: flex;
    justify-content: center;
    margin: 16px 0;
}
.desc-tip {
    font-size: 12px;
    color: #999999;
    margin-top: 16px;
}
</style>
