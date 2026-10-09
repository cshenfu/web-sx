<template>
    <div class="geology-database-component">
        <div class="fixed-group">
            <el-button type="primary" @click="addGeology">
                <iconpark-icon name="xinzeng"></iconpark-icon>
                新增地质数据
            </el-button>
        </div>
        <div class="user-tabs">
            <ul class="user-tabs-ul">
                <li
                    class="user-tabs-li"
                    @click="chooseTabs(2)"
                    :class="activeKey == 2 ? 'active' : ''"
                    >用户数据</li
                >
                <li
                    class="user-tabs-li"
                    @click="chooseTabs(1)"
                    :class="activeKey == 1 ? 'active' : ''"
                    >公共数据</li
                >
            </ul>
        </div>
        <searchCommon
            ref="searchCommonRef"
            @viewType="getViewType"
            @handleSearchCommon="handleSearchEvent"
            @resetSearchCommon="resetSearchEvent"
            :activeKey="activeKey"
        ></searchCommon>
        <geologyMap :dataSource="dataForMap" v-if="viewTypes == 1"></geologyMap>

        <geologyList
            ref="geologyListRef"
            :dataSource="dataForList"
            :activeKey="activeKey"
            :totalNum="totalNum"
            @reGetListData="onInitAreaListData()"
            v-if="viewTypes == 2"
        ></geologyList>

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
<style scoped lang="scss">
  @use './css/index.scss';
    @use '@/assets/css/tabs.scss';
    @use '@/assets/css/fixedGroup.scss';
</style>
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
    let activeKey = ref(1);
    // 1：地图，2：列表。地质数据库默认显示列表。
    let viewTypes = ref(2);
    let totalNum = ref(0);
    const searchCommonRef = ref();
    const geologyListRef = ref();
    const dataTypeDialogVisible = ref(false);
    const chooseTabs = (value) => {
        activeKey.value = value;
        if (geologyListRef.value?.page) {
            geologyListRef.value.page.current = 1;
        }
        nextTick(() => {
            if (viewTypes.value == 2) {
                onInitAreaListData();
            }
        });
    };
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
                source: activeKey.value,
                dataType,
            },
        });
    };
    // 搜索数据信息
    const searchCont = ref();
    watch(
        [viewTypes, activeKey],
        ([newType, oldType]) => {
            if (newType == 2) {
                // 加载列表数据
                nextTick(() => onInitAreaListData());
            }
        },
        {
            deep: true,
        },
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
    }),
    onDeactivated(()=> {
        deletMitt()
    })
    const initMitt =()=> {
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
            source: activeKey.value, // 数据来源 1后台数据 2用户数据
            rangeType: searchCont.value?.rangeType, // 数据范围 1省 2市 3区
            projectCode: searchCont.value?.projectCode, // 关联项目编号
            geologyCode: searchCont.value?.geologyCode, // 数据编号
        };
        console.log(params);
        params = Object.assign(params, {
            status: searchCont.value?.status,
            cityCode:
                searchCont.value && searchCont.value.geo
                    ? searchCont.value.geo[searchCont.value.geo.length - 1]
                    : '0',
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
        console.log(searchInfo);
        searchCont.value = searchInfo;
        console.log('搜索事件', searchInfo);
        if (geologyListRef.value?.page) {
            geologyListRef.value.page.current = 1;
        }
        nextTick(() => onInitAreaListData());
    };
    // 重置搜索
    const resetSearchEvent = () => {};
</script>

<style scoped lang="scss">
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