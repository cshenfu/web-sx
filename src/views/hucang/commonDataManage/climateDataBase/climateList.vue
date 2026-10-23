<template>
    <!-- 唯一根节点 -->
    <div class="climate-list-root">
        <div class="climate-page-bg">
            <!-- 背景光晕层 -->
            <div class="bg-glow-top-left"></div>
            <div class="bg-glow-bottom-right"></div>
            <div class="bg-glow-top-right"></div>

            <!-- 顶部 Header -->
            <div class="page-header">
                <span class="page-title">气候数据库</span>
            </div>

            <!-- 主卡片：从分类 Tab 到表格、分页，整体白底 -->
            <div class="main-card">
                <div class="filter-bar">
                    <searchBar
                        ref="climateListRef"
                        v-model:modeType="modeType"
                        @getModeType="getModeType"
                        @addEvent="showAddModal"
                        @useFileEvent="showImportFileModal">
                    </searchBar>
                </div>

                <div class="table-wrapper">
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
            v-model:openTipsModal="openTipsOpenModal"
            @handleChangeFileModal="handleChangeOpenModal"
        >
            <template #customTitle>{{ tipTitle }}</template>
            <template #contentBody>
                <div class="tuning-tip"></div>
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
                            { required: true, message: '请输入要新增的数据类型', trigger: 'blur' },
                        ]"
                    >
                        <a-radio-group v-model:value="openFormData.type" :options="PLAIN_OPTIONS" name="radioGroup" />
                    </a-form-item>
                </a-form>
            </template>
        </tips-modal>
    </div>
</template>

<script setup>
    import List from './components/allList.vue';
    import searchBar from './components/searchBar.vue';
    import climateMap from './climateMap.vue';
    import { ref, reactive, onBeforeMount, onMounted, onUnmounted } from 'vue';
    import { useRouter } from 'vue-router';
    import TipsModal from '@/components/tipsDialog/TipsModal.vue';
    import ImportClimateFile from './components/ImportClimateFile.vue';
    import { PLAIN_OPTIONS } from './climateDataBase';

    const router = useRouter();
    const modeType = ref('');
    const climateListRef = ref(null);

    onMounted(() => {
        modeType.value = climateListRef.value?.searchKey?.modeType;
    });

    // 获取模式
    const getModeType = (val) => {
        // modeType.value = val;
    };

    // 导入数据
    const openAddClimateTipsModal = ref(false);
    const showImportFileModal = () => {
        openAddClimateTipsModal.value = true;
    };

    // 新增操作
    const openFormRef = ref(null);
    const tipTitle = ref('');
    const openTipsOpenModal = ref(false);
    const openFormData = reactive({
        type: '1',
    });

    // 显示新增弹窗
    const showAddModal = (title) => {
        tipTitle.value = title;
        openTipsOpenModal.value = true;
    };

    const handleChangeOpenModal = (value) => {
        if (value) {
            router.push({
                path: '/hucang/climate/edit',
                query: {
                    type: openFormData.type,
                },
            });
        }
        openFormRef.value?.resetFields();
        openTipsOpenModal.value = false;
    };

    onBeforeMount(() => {
        sessionStorage.setItem('obsPath', 'climate/');
    });
    onUnmounted(() => {
        sessionStorage.removeItem('obsPath');
    });
</script>

<style scoped lang="scss">
  @import '@/assets/css/fixedGroup.scss';
  @import '@/assets/css/tabs.scss';

    .climate-list-root {
        width: 100%;
        height: 100%;
    }

    /* 外层容器：纵向 flex，撑满父级 */
    .climate-page-bg {
        position: relative;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
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

    /* ========== 顶部 Header ========== */
    .page-header {
        position: relative;
        z-index: 2;
        display: flex;
        align-items: center;
        height: 67px;
        padding: 15px 20px;
        box-sizing: border-box;
        flex-shrink: 0;
        border-bottom: 1px solid #E2E9F0;
    }
    .page-title {
        font-family: 'PingFang SC';
        font-weight: 500;
        font-size: 16px;
        color: #0B1C2C;
    }

    /* ========== 主卡片：Tab + 筛选 + 表格 + 分页 同在一张白卡里 ========== */
    .main-card {
        position: relative;
        z-index: 2;
        flex: 1;
        min-height: 0;
        display: flex;
        flex-direction: column;
        margin: 0 12px 30px;          /* 底部 30px 留白 */
        background: #FFFFFF;
        border: 1px solid #DFE5EC;
        border-radius: 12px;
        box-shadow: 0 4px 16px rgba(11, 28, 44, 0.04);
        overflow: hidden;
    }

    /* 搜索栏（含分类 Tab、筛选项、按钮）：白底，内边距由 searchBar 自己控制 */
    .filter-bar {
        flex-shrink: 0;
        background: #FFFFFF;
    }

    /* 列表 / 地图区域：占满剩余高度，滚动交给 allList 内部，分页固定在底部 */
    .table-wrapper {
        flex: 1;
        min-height: 0;
        display: flex;
        flex-direction: column;
        padding: 0 20px;              /* 与 Tab、筛选行左右对齐 */
        box-sizing: border-box;
        overflow: hidden;

        > * {
            flex: 1;
            min-height: 0;
        }
    }
</style>