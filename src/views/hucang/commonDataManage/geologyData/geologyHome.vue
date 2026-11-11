<template>
    <!-- 唯一根节点 -->
    <div class="geology-home-root">
        <div class="geology-page-bg">
            <!-- 背景光晕层 -->
            <div class="bg-glow-top-left"></div>
            <div class="bg-glow-bottom-right"></div>
            <div class="bg-glow-top-right"></div>

            <!-- 顶部 Header：左标题，右新增按钮 -->
            <div class="page-header">
                <span class="page-title">地质数据库</span>
                <el-button type="primary" class="add-btn" @click="addGeology">
                    <iconpark-icon name="xinzeng"></iconpark-icon>
                    新增地质数据
                </el-button>
            </div>

            <!-- 主卡片：搜索 + 列表 / 地图，整体白底 -->
            <div class="main-card">
                <div class="filter-bar">
                    <searchCommon
                        ref="searchCommonRef"
                        @viewType="getViewType"
                        @handleSearchCommon="handleSearchEvent"
                        @resetSearchCommon="resetSearchEvent"
                        :activeKey="activeKey"
                    ></searchCommon>
                </div>

                <div class="table-wrapper" :class="{ 'is-map': viewTypes == 1 }">
                    <geologyMap :dataSource="dataForMap" v-if="viewTypes == 1"></geologyMap>

                    <geologyList
                        ref="geologyListRef"
                        :dataSource="dataForList"
                        :activeKey="activeKey"
                        :totalNum="totalNum"
                        @reGetListData="onInitAreaListData()"
                        v-if="viewTypes == 2"
                    ></geologyList>
                </div>
            </div>
        </div>

        <el-dialog
            v-model="dataTypeDialogVisible"
            title="选择数据设置类型"
            width="420px"
            append-to-body
        >
            <div class="data-type-options">
                <el-button
                    type="primary"
                    size="large"
                    class="data-type-button"
                    @click="goToDataImport('geology')"
                >
                    地勘报告
                </el-button>
                <el-button
                    size="large"
                    class="data-type-button"
                    @click="goToDataImport('topographic')"
                >
                    地形数据
                </el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
export default {name: "geologyList"}
</script>
<script setup>
    import { ref, onMounted, watch, onActivated, onDeactivated, onBeforeUnmount, nextTick } from 'vue';
    import searchCommon from './components/searchCommon.vue';
    import geologyList from './geologyList.vue';
    import geologyMap from './geologyMap.vue';
    import { useRouter } from 'vue-router';
    import { getGeologyList } from '@/api/modules/geology';
    import mitt from '@/utils/eventBus';
    const router = useRouter();

    // 陕西省区域编码（接口返回为字符串）
    const SHANXI_REGION_CODE = '610000';

    // 固定公共数据，不再提供用户/公共切换
    const activeKey = ref(1);
    // 1：地图，2：列表。地质数据库默认显示列表。
    const viewTypes = ref(2);
    const totalNum = ref(0);
    const searchCommonRef = ref();
    const geologyListRef = ref();
    const dataTypeDialogVisible = ref(false);

    const getViewType = (value) => {
        const nextViewType = Number(value);
        if (nextViewType !== 1 && nextViewType !== 2) {
            return;
        }

        viewTypes.value = nextViewType;
        if (nextViewType === 2) {
            nextTick(() => onInitAreaListData());
        }
    };
    // 地图数据变量
    const dataForMap = ref([]);
    // 列表数据变量
    const dataForList = ref([]);
    // 新增地质数据
    const addGeology = () => {
        dataTypeDialogVisible.value = true;
    };

    // 选择数据类型后进入对应的上传页面
    const goToDataImport = (dataType) => {
        dataTypeDialogVisible.value = false;
        router.push({
            path: '/hucang/geology/import',
            query: {
                source: activeKey.value, // 固定 1，公共数据
                dataType,
            },
        });
    };
    // 搜索数据信息
    const searchCont = ref();
    watch(
        [viewTypes],
        () => {
            if (viewTypes.value == 2) {
                nextTick(() => onInitAreaListData());
            }
        },
        { deep: true },
    );
    onMounted(async() => {
        initMitt()
        nextTick(() => {
            if (viewTypes.value == 2) {
                onInitAreaListData();
            }
        });
    });
    onActivated(()=> {
        initMitt()
    })
    onBeforeUnmount(() => {
        deletMitt()
    });
    onDeactivated(()=> {
        deletMitt()
    })
    const initMitt =()=> {
        mitt.off('reGetListData'); // 防重复注册
        if (sessionStorage.getItem('reGetListData')) {
            sessionStorage.removeItem('reGetListData');
            onInitAreaListData();
        }
        mitt.on('reGetListData',()=>{
            onInitAreaListData();
        });
    }
    const deletMitt=() => {
        mitt.off('reGetListData');
    }
    // 获取地质列表数据
    const onInitAreaListData = () => {
        const listPage =
            geologyListRef.value?.getPageInfo?.() ||
            geologyListRef.value?.page ||
            {};

        let params = {
            pageNo: listPage.current ?? listPage.pageNo ?? 1,
            pageSize: listPage.pageSize ?? 10,
            source: activeKey.value, // 固定 1 公共数据
            rangeType: searchCont.value?.rangeType, // 数据范围 0全部 1省 2市 3区
            projectCode: searchCont.value?.projectCode, // 关联项目编号
            geologyCode: searchCont.value?.geologyCode, // 数据编号
        };

        // 区域兜底：geo 为空时永远带陕西，保证只查陕西
        const geoArr = searchCont.value?.geo;
        const lastGeo = (geoArr && geoArr.length > 0)
            ? geoArr[geoArr.length - 1]
            : null;

        params = Object.assign(params, {
            status: searchCont.value?.status,
            cityCode: lastGeo ?? SHANXI_REGION_CODE,
        });
        if (activeKey.value == 1) {
            params.isDisable = params.status;
            delete params.status;
        }
        getGeologyList(params).then((res) => {
            if (res.code == 200) {
                dataForList.value = res.data.list;
                totalNum.value = res.data.total;
            }
        });
    };
    // 搜索事件
    const handleSearchEvent = (searchInfo) => {
        searchCont.value = searchInfo;
        if (geologyListRef.value?.page) {
            geologyListRef.value.page.current = 1;
        }
        nextTick(() => onInitAreaListData());
    };
    // 重置搜索
    const resetSearchEvent = () => {
        searchCont.value = undefined;
        if (geologyListRef.value?.page) {
            geologyListRef.value.page.current = 1;
        }
        nextTick(() => onInitAreaListData());
    };
</script>

<style scoped lang="scss">
    @use './css/index.scss';

    .geology-home-root {
        width: 100%;
        height: 100%;
    }

    /* 外层容器：纵向 flex，撑满父级 */
    .geology-page-bg {
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
        justify-content: space-between;
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
    .add-btn {
        --el-button-bg-color: #0278E7;
        --el-button-border-color: #0278E7;
        --el-button-hover-bg-color: #0267C7;
        --el-button-hover-border-color: #0267C7;
        --el-button-active-bg-color: #0267C7;
        --el-button-active-border-color: #0267C7;
        height: 36px;
        padding: 0 16px;
        border-radius: 8px;
        font-size: 13px;
    }

    /* ========== 主卡片 ========== */
    .main-card {
        position: relative;
        z-index: 2;
        flex: 1;
        min-height: 0;
        display: flex;
        flex-direction: column;
        margin: 0 12px 30px;
        background: #FFFFFF;
        border: 1px solid #DFE5EC;
        border-radius: 12px;
        box-shadow: 0 4px 16px rgba(11, 28, 44, 0.04);
        overflow: hidden;
    }

    .filter-bar {
        flex-shrink: 0;
        background: #FFFFFF;
    }

    .table-wrapper {
        flex: 1;
        min-height: 0;
        display: flex;
        flex-direction: column;
        padding: 0 20px;
        box-sizing: border-box;
        overflow: hidden;

        > * {
            flex: 1;
            min-height: 0;
        }

        /* 地图模式：铺满卡片，不留内边距 */
        &.is-map {
            padding: 0;
        }
    }

    /* 选择数据类型弹窗 */
    .data-type-options {
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding: 8px 16px 20px;
    }

    .data-type-button {
        width: 100%;
        margin-left: 0;
    }
</style>