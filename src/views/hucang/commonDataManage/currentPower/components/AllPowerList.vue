<template>
    <div class="user-list">
        <table-list
            id="currentPowerTable"
            class="user-table"
            fit
            :loading="loading"
            :tableData="dataList"
            :tableColumn="clomun"
            :page="page"
            @getRowData="getRowData"
            @changePage="changePage"
        >
            <template #areaData="{ record }">
                <span>{{ record.provinceName }}{{ record.cityName ? `/${record.cityName}` : '' }}{{ record.districtName ? `/${record.districtName}` : '' }}</span>
            </template>
            <template #projectCodes="{ record }">
                <div class="associated-num has-bind-clor">
                    <span v-if="record.projectCodes && record.projectCodes.length <= 1">{{ record.projectCodes[0] }}</span>
                    <template v-if="record.projectCodes && record.projectCodes.length > 1">
                        <a-popover title="">
                            <template #content>
                                <p v-for="(item, index) in record.projectCodes" :key="index">{{ item }}</p>
                            </template>
                            <span>{{ record.projectCodes[0] }}...共{{ record.projectCodes.length }}个</span>
                        </a-popover>
                    </template>
                </div>
            </template>
            <template #statusName="{ record }">
                <div v-if="searchKey.source == 2" class="status-tag" :class="record.statusClassName">{{ record.statusName }}</div>
                <div v-if="searchKey.source == 1" class="status-tag" :class="record.disabledClassName">{{ record.isDisabledName }}</div>
            </template>
            <template #isLocations="{ record }">
                <iconpark-icon :name="record.isLocations == 1 ? 'you' : 'wu'"></iconpark-icon>
            </template>
            <template #isCurrentPowerGrid="{ record }">
                <iconpark-icon :name="record.isCurrentPowerGrid == 1 ? 'you' : 'wu'"></iconpark-icon>
            </template>
            <template #isCurrentPowerSupply="{ record }">
                <iconpark-icon :name="record.isCurrentPowerSupply == 1 ? 'you' : 'wu'"></iconpark-icon>
            </template>
            <template #isElectricityConsumptionDevLevel="{ record }">
                <iconpark-icon :name="record.isElectricityConsumptionDevLevel == 1 ? 'you' : 'wu'"></iconpark-icon>
            </template>
            <template #isPowerGridSurroundRela="{ record }">
                <iconpark-icon :name="record.isPowerGridSurroundRela == 1 ? 'you' : 'wu'"></iconpark-icon>
            </template>
            <template #isV500PowerGridProblem="{ record }">
                <iconpark-icon :name="record.isV500PowerGridProblem == 1 ? 'you' : 'wu'"></iconpark-icon>
            </template>
            <template #isNeedPrediction="{ record }">
                <iconpark-icon :name="record.isNeedPrediction == 1 ? 'you' : 'wu'"></iconpark-icon>
            </template>
            <template #filePath="{ record }">
                <iconpark-icon :name="record.filePath == 1 ? 'you' : 'wu'"></iconpark-icon>
            </template>
            <template #operation="{ record }">
                <div class="operation-btn">
                    <template v-if="searchKey.source == 2">
                        <span class="operation-btn-item" @click.stop="editFile(record)">{{ record.status != 2 ? '核对' : '编辑' }}</span>
                        <span class="operation-btn-item is-danger" @click.stop="deleteFile(record)">删除</span>
                    </template>
                    <template v-if="searchKey.source == 1">
                        <span class="operation-btn-item" @click.stop="editFile(record)">编辑</span>
                        <span class="operation-btn-item is-danger" @click.stop="deleteFile(record)">删除</span>
                        <span class="operation-btn-item" v-if="record.isDisable == 0" @click.stop="disableFile(record)">禁用</span>
                        <span class="operation-btn-item" v-if="record.isDisable == 1" @click.stop="openFile(record)">置为开放</span>
                    </template>
                </div>
            </template>
        </table-list>

        <!-- 删除 -->
        <tips-modal
            :width="'490px'"
            title="删除提示"
            :tipType="'danger'"
            class="tip-content-modal"
            :okText="'确定删除'"
            v-model:openTipsModal="openTipsPowerModal"
            @handleChangeFileModal="handleChangeClose"
        >
            <template #contentBody>
                <span class="modalTip">确定删除该数据么？</span>
            </template>
        </tips-modal>

        <!-- 开放、禁用 -->
        <tips-modal
            :width="'490px'"
            :tipType="'danger'"
            class="tip-content-modal"
            :okText="tipModalType == 'open' ? '确定开放' : '确定禁用'"
            v-model:openTipsModal="openTipsOpenModal"
            @handleChangeFileModal="handleChangeOpenModal"
        >
            <template #customTitle>{{ tipTitle }}</template>
            <template #contentBody>
                <div class="tuning-tip">
                    <iconpark-icon name="jinggao" size="18" class="success"></iconpark-icon>
                    <span class="tuning-tip-title">{{ contentTip }}</span>
                </div>
                <a-form
                    :colon="false"
                    class="sort-form"
                    ref="openFormRef"
                    :model="openFormData"
                    :labelCol="labelCol"
                    labelAlign="left"
                >
                    <a-form-item label="原因" name="reason" :rules="[{ required: true, message: '请输入原因' }]">
                        <a-textarea style="width: 358px" :auto-size="{ minRows: 2, maxRows: 5 }" v-model:value="openFormData.reason" placeholder="请输入原因" />
                    </a-form-item>
                </a-form>
            </template>
        </tips-modal>
    </div>
</template>

<script setup>
import { ref, onMounted, onDeactivated, onActivated, onBeforeUnmount, nextTick } from 'vue';
import TableList from '@/components/tableList/TableList.vue';
import TipsModal from '@/components/tipsDialog/TipsModal.vue';
import mitt from '@/utils/eventBus';
import { POWER_TABLE_LIST_CLOUMN } from '../currentPower.js';
import { useRouter } from 'vue-router';
import _ from 'lodash';
import { USER_COMMON_DATA_STATUS, PUBLIC_COMMON_STATUS } from '../../commonData';
import { getGridList, disableGrid } from '@/api/modules/commonDataManage.js';
import { removeEmpty } from '../../commonData.js';
import dayjs from 'dayjs';

const searchKey = ref({});
const loading = ref(false);
const router = useRouter();
const clomun = ref(_.cloneDeep(POWER_TABLE_LIST_CLOUMN));
const dataList = ref([]);

const handleStatus = (val) => {
    const dataArr = searchKey.value.source == 2 ? USER_COMMON_DATA_STATUS : PUBLIC_COMMON_STATUS;
    const obj = { class: '', label: '' };
    dataArr.filter((item) => {
        if (item.value == val) {
            obj.class = item.className;
            obj.label = item.label;
        }
    });
    return obj;
};

const tipModalType = ref('');
const contentTip = ref('');
const openTipsOpenModal = ref(false);
const openFormRef = ref(null);
const openFormData = ref({ reason: '' });
const labelCol = { style: { width: '70px', marginRight: '6px' } };
const page = ref({ pageNo: 1, pageSize: 10, total: 0 });

const handleSearch = (val) => {
    page.value.pageNo = 1;
    getTableData(val);
};
const resetSearch = (val) => {
    page.value.pageNo = 1;
    page.value.pageSize = 10;
    handleSearch(val);
};

const getTableData = async (val) => {
    dataList.value = [];
    try {
        const data = {
            pageNo: page.value.pageNo,
            pageSize: page.value.pageSize,
            ...val,
            cityCode: val.areaCode ? val.areaCode[val.areaCode?.length - 1] : '',
        };
        data.modeType = '';
        data.areaCode = '';
        const res = await getGridList(removeEmpty(data));
        if (res.code === 200) {
            dataList.value = res.data.list?.map((item) => {
                return {
                    ...item,
                    statusName: handleStatus(item.status).label,
                    isDisabledName: handleStatus(item.isDisable).label,
                    statusClassName: handleStatus(item.status).class,
                    disabledClassName: handleStatus(item.isDisable).class,
                    createTime: item.createTime ? dayjs(item.createTime).format('YYYY-MM-DD HH:mm:ss') : '--',
                };
            });
            page.value.total = res.data.total;
        } else {
            dataList.value = [];
            page.value.total = 0;
        }
    } catch (err) {
        console.log('err', err);
    }
};

const getRowData = (row) => {
    router.push({ path: '/currentPower/detail', query: { id: row.id } });
};

const changePage = (val) => {
    page.value.pageNo = val.page;
    page.value.pageSize = val.pageSize;
    getTableData(searchKey.value);
};

const openTipsPowerModal = ref(false);
const tipTitle = ref('');

const editFile = (val) => {
    router.push({ path: '/currentPower/add', query: { id: val.id } });
};
const deleteFile = (val) => {
    chooseFileDetail.value = val;
    openTipsPowerModal.value = true; // 修复为直接赋值
};
const chooseFileDetail = ref({});
const disableFile = (val) => {
    chooseFileDetail.value = val;
    contentTip.value = '确定将该数据置为禁用状态么？';
    openTipsOpenModal.value = true; // 修复为直接赋值
    tipModalType.value = 'disable';
    tipTitle.value = '禁用提示';
};
const openFile = (val) => {
    chooseFileDetail.value = val;
    contentTip.value = '确定将该数据置为开放状态么？';
    openTipsOpenModal.value = true; // 修复为直接赋值
    tipModalType.value = 'open';
    tipTitle.value = '开放提示';
};
const handleChangeOpenModal = (val) => {
    if (val) {
        openFormRef.value.validateFields().then(() => {
            submitOpenFile(tipModalType.value);
        }).catch((error) => { console.log('错误', error); });
    } else {
        openFormRef.value.resetFields();
        openTipsOpenModal.value = false; // 修复为直接赋值
    }
};
const submitOpenFile = async (type) => {
    const data = { id: chooseFileDetail.value.id };
    switch (type) {
        case 'open': data.isDisable = 0; data.reason = openFormData.value.reason; break;
        case 'disable': data.isDisable = 1; data.reason = openFormData.value.reason; break;
        case 'delete': data.isDelete = 1; break;
    }
    try {
        const res = await disableGrid(data);
        if (res.code == 200) {
            if (type !== 'delete') { openFormRef.value.resetFields(); }
            type == 'delete' ? (openTipsPowerModal.value = false) : (openTipsOpenModal.value = false);
            getTableData(searchKey.value);
        }
    } catch (err) {
        console.log('err', err);
    }
};
const handleChangeClose = (val) => {
    if (val) {
        submitOpenFile('delete');
    } else {
        openTipsPowerModal.value = false; // 修复为直接赋值
    }
};

let isListening = false;
const handleSearchEvent = (val) => { searchKey.value = val; handleSearch(val); };
const resetSearchEvent = (val) => { searchKey.value = val; resetSearch(val); };
const initMitt = () => {
    if (isListening) return;
    mitt.on('handleSearch', handleSearchEvent);
    mitt.on('resetSearch', resetSearchEvent);
    isListening = true;
};
const deletMitt = () => {
    if (!isListening) return;
    mitt.off('handleSearch', handleSearchEvent);
    mitt.off('resetSearch', resetSearchEvent);
    isListening = false;
};

onMounted(() => {
    initMitt();
    nextTick(() => {
        if (!searchKey.value || Object.keys(searchKey.value).length === 0) {
            getTableData({ source: 1, rangeType: 0, areaCode: [] });
        }
    });
});
onActivated(() => { initMitt(); });
onDeactivated(() => { deletMitt(); });
onBeforeUnmount(() => { deletMitt(); });
</script>

<style scoped lang="scss">
@import '@/assets/css/fixedGroup.scss';

/* ========== 完全参考气候列表强制撑满 ========== */
.user-list {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    min-height: 0;
    overflow: hidden;
}
.user-list > .user-table {
    flex: 1 1 auto;
    min-height: 0;
    width: 100%;

    /* 强制撑满表格，解决右侧留白问题 */
    :deep(.ant-table-wrapper),
    :deep(.ant-table),
    :deep(.ant-table-container),
    :deep(.ant-table-content),
    :deep(.ant-table table) {
        width: 100% !important;
    }
}

/* ========== 状态与操作按钮 ========== */
.user-list .status-tag {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: auto;
    min-height: 24px;
    padding: 0 10px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
    line-height: 24px;
    white-space: nowrap;
}
.user-list .status-tag.pending-icon {
    color: #00A63E; background: #E8F7EE; box-shadow: inset 0 0 0 1px #B7E4C7;
}
.user-list .status-tag.finish-icon {
    color: #D9363E; background: #FEECEC; box-shadow: inset 0 0 0 1px #FFC9C9;
}
.user-list .status-tag.bind-icon {
    color: #D97706; background: #FFF3E0; box-shadow: inset 0 0 0 1px #FFD8A8;
}
.user-list .status-tag.has-bind-icon {
    color: #0050B5; background: #DDF0FF; box-shadow: inset 0 0 0 1px #ABD1FF;
}
.user-list .status-tag.stop-icon {
    color: #667383; background: #EEF1F5; box-shadow: inset 0 0 0 1px #DFE5EC;
}

.user-list .operation-btn {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 4px 12px;
}
.user-list .operation-btn-item {
    color: #667383;
    font-size: 13px;
    cursor: pointer;
    white-space: nowrap;
    &:hover { color: #0278E7; }
    &.is-danger {
        color: #F2555A;
        &:hover { color: #D9363E; }
    }
}

.tuning-tip {
    display: flex;
    padding: 8px 0 5px;
    margin-bottom: 20px;
    background: #FEF1DF;
    border-radius: 4px;
    .success { margin: 0 9px 0 12px; color: #FE830F; }
    .tuning-tip-title { color: #21263F; font-size: 14px; line-height: 22px; }
}
</style>