<template>
    <!-- 唯一根节点 -->
    <div class="inverter-root">
        <div class="inverter-page-bg">
            <!-- 背景光晕层 -->
            <div class="bg-glow-top-left"></div>
            <div class="bg-glow-bottom-right"></div>
            <div class="bg-glow-top-right"></div>

            <!-- 顶部 Header -->
            <div class="page-header">
                <span class="page-title">逆变器库</span>
            </div>

            <!-- 主卡片 -->
            <div class="main-card">
                <!-- 头部操作栏 -->
                <div class="card-header">
                    <div class="header-left"></div>
                    <div class="header-actions">
                        <a-button type="primary" class="btn-add" @click="goPath">
                            <iconpark-icon name="daoru" size="12" class="add-icon"></iconpark-icon>
                            导入数据
                        </a-button>
                    </div>
                </div>

                <!-- 搜索栏 -->
                <div class="filter-bar">
                    <inverter-list-search-bar 
                        @handleSearch="handleSearch" 
                        ref="inverterSearchRef"
                    ></inverter-list-search-bar>
                </div>

                <!-- 表格区域 -->
                <div class="table-wrapper">
                    <table-list 
                        id="inverterListTable" 
                        class="user-table" 
                        fit
                        :loading="loading" 
                        :tableData="dataList"
                        :tableColumn="INVERTER_TABLE_LIST_CLOUMN" 
                        :page="page" 
                        @getRowData="getRowData" 
                        @changePage="changePage"
                    >
                        <template #gridVoltageRange="{record}">
                            <div class="operation-btn">
                                <!-- 预留操作位 -->
                            </div>
                        </template>
                        <template #operation="{record}">
                            <div class="operation-btn">
                                <span class="operation-btn-item is-danger" @click.stop="deleteFile(record)"> 删除 </span>
                            </div>
                        </template>
                    </table-list>
                </div>
            </div>
        </div>

        <!-- 导入数据弹窗 -->
        <import-file-modal 
            v-model:importFileFlg="importFileFlg" 
            v-if="importFileFlg" 
            @updateList="handleSearch"
        ></import-file-modal>

        <!-- 删除确认弹窗 -->
        <tips-modal
            :width="'490px'"
            title="删除提示"
            :tipType="'danger'"
            class="tip-content-modal"
            :okText="'确定删除'"
            v-model:openTipsModal="openTipsClimateModal"
            @handleChangeFileModal="handleChangeClose"
        >
            <template #contentBody>
                <span class="modalTip">确定删除该数据么？</span>
            </template>
        </tips-modal>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import InverterListSearchBar from './components/InverterListSearchBar.vue';
import TableList from '@/components/tableList/TableList.vue';
import { INVERTER_TABLE_LIST_CLOUMN } from './inverter';
import ImportFileModal from './components/ImportFileModal.vue';
import TipsModal from '@/components/tipsDialog/TipsModal.vue';
import { getInverterList, deleteInverter } from '@/api/modules/commonDataManage';
import dayjs from 'dayjs';
import { ElMessage } from 'element-plus';

const router = useRouter();
const importFileFlg = ref(false);
const tipTitle = ref('');
const inverterSearchRef = ref(null);
const dataList = ref([]);
const loading = ref(false);

const page = ref({
    pageNo: 1,
    pageSize: 10,
    total: 0,
});

// 表格行点击
const getRowData = (row) => {
    router.push({
        path: '/inverter/detail',
        query: {
            id: row.id,
        },
    });
};

// 搜索
const handleSearch = (e) => {
    let val = e ? e : inverterSearchRef.value?.searchKey;
    page.value.pageNo = 1;
    getTableData(val);
};

// 获取页面分页
const changePage = (val) => {
    page.value.pageNo = val.page;
    page.value.pageSize = val.pageSize;
    getTableData(inverterSearchRef.value?.searchKey);
};

// 获取表格数据
const getTableData = async (val) => {
    loading.value = true;
    let data = {
        ...val,
        pageNo: page.value.pageNo,
        pageSize: page.value.pageSize,
    };
    try {
        let res = await getInverterList(data);
        if (res.code == 200 && res.data.list?.length) {
            dataList.value = res.data?.list.map((item) => {
                return {
                    ...item,
                    createTime: item.createTime ? dayjs(item.createTime).format('YYYY-MM-DD HH:mm:ss') : '--',
                    updateTime: item.updateTime ? dayjs(item.updateTime).format('YYYY-MM-DD HH:mm:ss') : '--',
                };
            });
            page.value.total = res.data?.total;
        } else {
            dataList.value = [];
            page.value.total = 0;
        }
    } catch (error) {
        console.log('获取列表失败', error);
        dataList.value = [];
        page.value.total = 0;
    } finally {
        loading.value = false;
    }
};

const chooseSelectData = ref(null);
const openTipsClimateModal = ref(false);

// 删除数据（修复了取反逻辑）
const deleteFile = (val) => {
    chooseSelectData.value = val;
    openTipsClimateModal.value = true; 
    tipTitle.value = '删除提示';
};

// 关闭/确认弹窗（修复了取反逻辑）
const handleChangeClose = async (val) => {
    if (val) {
        try {
            let res = await deleteInverter(chooseSelectData.value.id);
            if (res.code == 200 && res.data) {
                ElMessage.success('删除成功！');
                page.value.pageNo = 1;
                getTableData(inverterSearchRef.value?.searchKey);
                openTipsClimateModal.value = false;
            }
        } catch (error) {
            console.log('删除失败', error);
        }
    } else {
        openTipsClimateModal.value = false;
    }
};

const goPath = () => {
    importFileFlg.value = true;
};

onMounted(() => {
    // 如果搜索栏没有在 mounted 里触发 handleSearch，可以在这里兜底
    // handleSearch();
});
</script>

<style scoped lang="scss">
.inverter-root {
    width: 100%;
    height: 100%;
}

/* 外层容器：纵向 flex，撑满父级 */
.inverter-page-bg {
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
    display: flex;
    flex-direction: column;
    margin: 0 12px 30px;
    background: #FFFFFF;
    border: 1px solid #DFE5EC;
    border-radius: 12px;
    box-shadow: 0 4px 16px rgba(11, 28, 44, 0.04);
    overflow: hidden;
}

/* ========== 头部操作栏 ========== */
.card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    height: 48px;
    border-bottom: 1px solid #E2E9F0;
    flex-shrink: 0;
}

/* 导入按钮 */
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
.add-icon {
    margin-right: 2px;
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
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 4px 12px;
}

.operation-btn-item {
    color: #667383;
    font-size: 13px;
    cursor: pointer;
    white-space: nowrap;

    &:hover {
        color: #0278E7;
    }
    &.is-danger {
        color: #F2555A;

        &:hover {
            color: #D9363E;
        }
    }
}

/* ========== 弹窗辅助样式 ========== */
.modalTip {
    color: #363b4d;
    font-size: 14px;
}
</style>