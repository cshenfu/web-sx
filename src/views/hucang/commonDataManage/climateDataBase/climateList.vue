<template>
    <!-- 外层：带渐变和光晕的容器 -->
    <div class="climate-page-bg">
        <!-- 背景光晕层 -->
        <div class="bg-glow-top-left"></div>
        <div class="bg-glow-bottom-right"></div>
        <div class="bg-glow-top-right"></div>

        <!-- 内容层 -->
        <div class="climate-list-content">
            <div class="climate-content white-card">
                <searchBar 
                    ref="climateListRef" 
                    v-model:modeType="modeType" 
                    @getModeType="getModeType" 
                    @addEvent="showAddModal" 
                    @useFileEvent="showImportFileModal">
                </searchBar>
                
                <climateMap v-if="modeType == 'a'"></climateMap>
                <List v-if="modeType == 'b'"></List>
            </div>
        </div>
    </div>

    <!-- 导入数据 -->
    <import-climate-file v-model:importFileFlg="openAddClimateTipsModal"></import-climate-file>
    
    <!-- 新增 -->
    <tips-modal
        :width="'490px'"
        :tipType="'success'"
        class="tip-content-modal"
        okText="确定"
        :openTipsModal.sync="openTipsOpenModal"
        @handleChangeFileModal="handleChangeOpenModal"
    >
        <template #customTitle>{{ tipTitle }}</template>
        <template #contentBody>
            <div class="tuning-tip">
                <!-- <iconpark-icon name="jinggao" size="18" class="success"></iconpark-icon>
                <span class="tuning-tip-title">{{ contentTip }}</span> -->
            </div>
            <a-form
                :colon="false"
                class="sort-form"
                ref="openFormRef"
                :model="openFormData"
                labelAlign="left"
            >
                <a-form-item
                    label="数据类型"
                    name="type"
                    :rules="[
                        { required: true, ElMessage: '请输入要新增的数据类型', trigger: 'blur' },
                    ]"
                >
                    <a-radio-group v-model:value="openFormData.type" :options="PLAIN_OPTIONS" name="radioGroup" />
                </a-form-item>
            </a-form>
        </template>
    </tips-modal>
</template>

<script setup>
    import List from './components/allList.vue';
    import searchBar from './components/searchBar.vue';
    import climateMap from './climateMap.vue';
    import { ref, reactive,onBeforeMount, onMounted,onUnmounted, computed, watch, nextTick } from 'vue';
    import { useRouter } from 'vue-router';
    import TipsModal from '@/components/tipsDialog/TipsModal.vue';
    import { trigger } from '@vue/reactivity';
    import ImportClimateFile from './components/ImportClimateFile.vue';
    import {PLAIN_OPTIONS} from './climateDataBase'
    const modeType = ref('');
    const climateListRef = ref(null)
    
    onMounted(()=> {
        modeType.value = climateListRef.value.searchKey.modeType
    })
    // 获取模式
    const getModeType=(val)=> {
        // modeType.value = val;
    }
    const router = useRouter();
    // 新增导入
    const openAddClimateTipsModal = ref(false);
    // 关闭导入数据
    const handleChangeAddClimateModal = (val) => {
        console.log('关闭新增', val);
    };
    // 显示导入弹窗
    const showImportFileModal = () => {
        openAddClimateTipsModal.value = true;
    }

    // 新增操作
    const openFormRef = ref(null);
    let tipTitle = ref('');
    let openTipsOpenModal = ref(false);
    let openFormData = reactive({
        type: '1',
    });
    // 显示新增弹窗
    const showAddModal = (title) => {
        tipTitle.value = title;
        openTipsOpenModal.value = true;
    }
    const handleChangeOpenModal = (value) => {
        if (value) {
            router.push({
                path: '/climate/edit',
                query: {
                    type: openFormData.type,
                },
            });
        } 
        openFormRef.value.resetFields();
        openTipsOpenModal.value = false;
    };

    onBeforeMount(() => {
        sessionStorage.setItem('obsPath','climate/')
    });
    onUnmounted(() => {
        sessionStorage.removeItem('obsPath')
    })
</script>

<style scoped lang="scss">
  @import '@/assets/css/fixedGroup.scss';
  @import '@/assets/css/tabs.scss';

    /* 外层全屏容器 */
    .climate-page-bg {
        position: relative;
        width: 100%;
        height: 100%;
        /* 基础浅蓝渐变底色 */
        background: linear-gradient(122.01deg, #E6EEF8 0%, #D2E0F4 100%), #FFFFFF;
        overflow: hidden;
    }

    /* ========== 背景光晕层 ========== */
    .bg-glow-top-left {
        position: absolute;
        left: -1.61%;
        top: -18.52%;
        width: 350px;
        height: 350px;
        background: linear-gradient(135deg, #FFCCD5 0%, #FECFEF 100%);
        opacity: 0.49;
        filter: blur(129.5px);
        border-radius: 50%;
        pointer-events: none;
        z-index: 1;
    }
    .bg-glow-bottom-right {
        position: absolute;
        right: 4.64%;
        bottom: -18.13%;
        width: 450px;
        height: 450px;
        background: linear-gradient(120deg, #A1C4FD 0%, #C2E9FB 100%);
        opacity: 0.7;
        filter: blur(123px);
        border-radius: 50%;
        pointer-events: none;
        z-index: 1;
    }
    .bg-glow-top-right {
        position: absolute;
        right: 19.01%;
        top: -37.04%;
        width: 300px;
        height: 300px;
        background: linear-gradient(120deg, #A1C4FD 0%, #C2E9FB 100%);
        opacity: 0.7;
        filter: blur(123px);
        border-radius: 50%;
        pointer-events: none;
        z-index: 1;
    }

    /* 内容层：去掉了原来的 background 白底，留出 padding */
    .climate-list-content {
        position: relative;
        z-index: 2;
        padding: 24px;
        height: 100%;
        max-height: calc(100vh - 100px);
        box-sizing: border-box;
        overflow: auto;
        /* 隐藏滚动条让视觉更干净（可选） */
        &::-webkit-scrollbar {
            display: none;
        }
    }

    /* 内容卡片：把搜索栏、列表包裹在一个白底卡片里 */
    .white-card {
        background: #FFFFFF;
        border-radius: 16px;
        padding: 24px;
        box-shadow: 0 4px 16px rgba(11, 28, 44, 0.04);
        min-height: 100%; /* 保证内容较少时也能撑开 */
        box-sizing: border-box;
    }
</style>