<template>
    <!-- 唯一根节点 -->
    <div class="cost-library-root">
        <div class="cost-library-page-bg">
            <!-- 背景光晕层 -->
            <div class="bg-glow-top-left"></div>
            <div class="bg-glow-bottom-right"></div>
            <div class="bg-glow-top-right"></div>

            <!-- 顶部 Header -->
            <div class="page-header">
                <span class="page-title">造价数据库</span>
            </div>

            <!-- 主卡片 -->
            <div class="main-card">
                <!-- 左侧菜单栏 -->
                <div class="library-list-left">
                    <ul class="library-list-content" v-show="itemType == 1">
                        <li
                            @click="changeType(itemIndex, item.title)"
                            :class="itemTypeActive == itemIndex ? 'active' : ''"
                            v-for="(item, itemIndex) in itemTypeList"
                            :key="itemIndex"
                        >
                            {{ item.title }}
                        </li>
                    </ul>
                </div>

                <!-- 右侧内容区 -->
                <div class="library-list-right">
                    <!-- 顶部操作栏 -->
                    <div class="content-header">
                        <span class="content-title">{{ itemTypeActiveName }}</span>
                        <a-button type="primary" class="btn-add" @click="goPath">
                            <iconpark-icon name="xinzeng" size="12"></iconpark-icon>
                            新增数据
                        </a-button>
                    </div>

                    <!-- 搜索栏 -->
                    <div class="filter-bar">
                        <costLibrarySearch
                            ref="costLibraryRef"
                            @handleSearchCommon="handleSearchEvent"
                            @resetSearchCommon="resetSearchEvent"
                        ></costLibrarySearch>
                    </div>

                    <!-- 表格区域 -->
                    <div class="table-wrapper">
                        <table-list
                            class="user-table"
                            fit
                            :loading="loading"
                            :tableData="dataList"
                            :tableColumn="itemTypeList[itemTypeActive]?.thArr || []"
                            :page="page"
                            @changePage="changePage"
                        >
                            <template #areaData="{ record }">
                                <span>{{ record.provinceName }}{{ record.cityName ? `/${record.cityName}` : '' }}{{ record.districtName ? `/${record.districtName}` : '' }}</span>
                            </template>
                            <template #value2="{ record }">
                                <a-popover overlay-class-name="name-popover-self">
                                    <template #content>
                                        {{ record.value2 }}
                                    </template>
                                    <div class="ellipsis-text-name">{{ record.value2 }}</div>
                                </a-popover>
                            </template>
                            <template #operation="{ record }">
                                <div class="operation-btn">
                                    <span class="operation-btn-item" @click.stop="edit(record)">更新</span>
                                </div>
                            </template>
                        </table-list>
                    </div>
                </div>
            </div>
        </div>

        <!-- 新增/编辑弹窗 -->
        <add-cost-modal
            :itemTypeActiveName="itemTypeActiveName"
            :selectData="selectData"
            @updateCostList="handleSearchEvent"
            v-if="openTipsManageModal"
            v-model:openTipsManageModal="openTipsManageModal"
        ></add-cost-modal>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import {
    COST_TABLE_LIST_CLOUMN_PRICE,
    COST_TABLE_LIST_CLOUMN_COMMON_DATA,
    COST_TABLE_LIST_CLOUMN_COMMON_PRICE,
    COST_TABLE_LIST_CLOUMN_AUXILIARY_UNIT,
    COST_TABLE_LIST_CLOUMN_OTHER_UNIT,
    COST_TABLE_LIST_CLOUMN_DEVICE_UNIT,
    COST_TABLE_LIST_CLOUMN_PRO_UNIT,
} from '../costLibrary';
import tableList from '@/components/tableList/TableList.vue';
import costLibrarySearch from './costLibrarySearch.vue';
import AddCostModal from './AddCostModal.vue';
import { getProjectCost } from '@/api/modules/sourceData/costLibraryManage';
import dayjs from 'dayjs';

const costLibraryRef = ref(null);
const itemType = ref(1);

const itemTypeList = ref([
    {
        title: '资金及费率',
        thArr: COST_TABLE_LIST_CLOUMN_COMMON_PRICE,
    },
    {
        title: '设备费用',
        thArr: COST_TABLE_LIST_CLOUMN_COMMON_PRICE,
    },
    {
        title: '其他费用单价',
        thArr: COST_TABLE_LIST_CLOUMN_COMMON_PRICE,
    },
]);

// 选中的数据
const selectData = ref(null);
// 弹窗是否展示
const openTipsManageModal = ref(false);
const itemTypeActive = ref(0);
const itemTypeActiveName = ref(itemTypeList.value[0]['title']);
const loading = ref(false);
const dataList = ref([]);
const page = ref({
    pageNo: 1,
    pageSize: 10,
    total: 0,
});

// 搜索
const handleSearchEvent = (val) => {
    let data = val ? val : costLibraryRef.value?.searchKey;
    page.value.pageNo = 1;
    selectData.value = null;
    getTableData(data);
};

// 重置
const resetSearchEvent = (val) => {
    handleSearchEvent(val);
};

// 获取页面分页
const changePage = (val) => {
    page.value.pageNo = val.page;
    page.value.pageSize = val.pageSize;
    getTableData(costLibraryRef.value?.searchKey);
};

// 选中项目类型
const changeType = (index, item) => {
    itemTypeActive.value = index;
    itemTypeActiveName.value = item;
    page.value.pageNo = 1;
    selectData.value = null;
    // 如果子组件有暴露重置方法
    if (costLibraryRef.value?.resetSearchEvent) {
        costLibraryRef.value.resetSearchEvent();
    } else {
        handleSearchEvent({});
    }
};

// 更改类型（预留）
const onChangeItemType = (value) => {
    itemType.value = value;
    itemTypeActive.value = 0;
    page.value.pageNo = 1;
};

// 编辑
const edit = (row) => {
    selectData.value = row;
    openTipsManageModal.value = true;
};

// 新增数据
const goPath = () => {
    selectData.value = null;
    openTipsManageModal.value = true;
};

// 加载数据表格
const getTableData = async (val) => {
    loading.value = true;
    let data = {
        ...val,
        parentType: itemTypeActiveName.value,
        pageNo: page.value.pageNo,
        pageSize: page.value.pageSize,
    };
    try {
        let res = await getProjectCost(data);
        if (res.code == 200) {
            dataList.value = res.data?.list.map((item) => {
                return {
                    ...item,
                    updateTimeStr: item.updateTime ? dayjs(item.updateTime).format('YYYY-MM-DD HH:mm:ss') : '--',
                };
            });
            page.value.total = res.data?.total || 0;
        } else {
            dataList.value = [];
            page.value.total = 0;
        }
    } catch (error) {
        console.log('获取造价数据失败', error);
        dataList.value = [];
        page.value.total = 0;
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    handleSearchEvent(costLibraryRef.value?.searchKey);
});
</script>

<style scoped lang="scss">
.cost-library-root {
    width: 100%;
    height: 100%;
}

/* 外层容器：纵向 flex，撑满父级 */
.cost-library-page-bg {
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

/* ========== 主卡片 ========== */
.main-card {
    position: relative;
    z-index: 2;
    flex: 1;
    min-height: 0;
    display: flex; /* 左右布局 */
    margin: 0 12px 30px;
    // background: #FFFFFF;
    border: 1px solid #DFE5EC;
    border-radius: 12px;
    box-shadow: 0 4px 16px rgba(11, 28, 44, 0.04);
    overflow: hidden;
    gap:20px;
}

/* ========== 左侧菜单 ========== */
.library-list-left {
    flex: none;
    width: 200px; /* 稍微收窄一点更符合现代侧边栏 */
    display: flex;
    flex-direction: column;
    border-right: 1px solid #E2E9F0; /* 分割线 */
    background: #ffffff;
}

.library-list-content {
    flex: 1;
    overflow-y: auto;
    margin: 0;
    padding: 12px;
    list-style: none;

    li {
        position: relative;
        padding: 10px 16px;
        margin-bottom: 4px;
        border-radius: 8px;
        font-size: 14px;
        color: #667383;
        cursor: pointer;
        transition: all 0.15s ease;

        &:hover {
            background: #F0F4F8;
            color: #0B1C2C;
        }

        &.active {
            color: #0278E7;
            font-weight: 500;
            background: #E6F2FF;

            /* 纯 CSS 实现左侧指示条 */
            &::before {
                content: '';
                position: absolute;
                left: 0;
                top: 50%;
                transform: translateY(-50%);
                width: 3px;
                height: 16px;
                border-radius: 0 2px 2px 0;
                background: #0278E7;
            }
        }
    }
}

/* ========== 右侧内容区 ========== */
.library-list-right {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    background: #FFFFFF;
}

/* 顶部操作栏 */
.content-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 56px;
    padding: 0 20px;
    border-bottom: 1px solid #E2E9F0;
    flex-shrink: 0;

    .content-title {
        font-size: 15px;
        font-weight: 500;
        color: #0B1C2C;
    }
}

/* 按钮标准化 */
.btn-add {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 36px;
    padding: 0 16px;
    border-radius: 8px;
    font-size: 13px;
    background: #0278E7 !important;
    border-color: #0278E7 !important;
    color: #FFFFFF !important;

    &:hover {
        background: #0267C7 !important;
        border-color: #0267C7 !important;
    }
}

/* ========== 搜索栏与表格 ========== */
.filter-bar {
    flex-shrink: 0;
    background: #FFFFFF;
}

.table-wrapper {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    padding: 0 20px 16px;
    box-sizing: border-box;
    overflow: hidden;

    > .user-table {
        flex: 1;
        min-height: 0;
        width: 100%;

        /* 强制撑满表格 */
        :deep(.ant-table-wrapper),
        :deep(.ant-table),
        :deep(.ant-table-container),
        :deep(.ant-table-content),
        :deep(.ant-table table) {
            width: 100% !important;
        }
    }
}

/* ========== 表格内元素 ========== */
.operation-btn {
    display: flex;
    align-items: center;
    gap: 12px;
}
.operation-btn-item {
    color: #667383;
    font-size: 13px;
    cursor: pointer;
    white-space: nowrap;

    &:hover {
        color: #0278E7;
    }
}
.ellipsis-text-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    cursor: default;
}
</style>