<template>
    <div class="water-conservation-list">
        <table-list id="waterConservationTable" class="user-table" fit :loading="loading" :tableData="dataList"
            :tableColumn="clomun" :page="page" @getRowData="getRowData" @changePage="changePage">
            <template #areaData="{ record }">
                <span>{{ record.provinceName }}{{ record.cityName?`/${record.cityName}`:'' }}{{ record.districtName?`/${record.districtName}`:'' }}</span>
            </template>
            <template #projectCodes="{ record }">
                <div class="associated-num has-bind-clor">
                    <span v-if="record.projectCodes && record.projectCodes.length <= 1">{{ record.projectCodes[0]
                        }}</span>
                    <template v-if="record.projectCodes && record.projectCodes.length > 1">
                        <a-popover title="">
                            <template #content>
                                <p v-for="(item, index) in record.projectCodes" :key="index">{{item}}</p>
                            </template>
                            <span>{{ record.projectCodes[0] }}...共{{ record.projectCodes.length }}个</span>
                        </a-popover>
                    </template>
                </div>
            </template>
            <template #statusName="{ record }">
                <div v-if="searchKey.source ==2" class="status-tag" :class="record.statusClassName">{{ record.statusName }}</div>
                <div v-if="searchKey.source ==1" class="status-tag" :class="record.disabledClassName">{{ record.isDisabledName}}</div>
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
            <template #createTime="{ record }">
               
            </template>
            <template #operation="{ record }">
                <div class="operation-btn">
                    <template v-if="searchKey.source == 2">
                        <span class="operation-btn-item" @click.stop="editFile(record)">{{
            record.status != 2? '核对' : '编辑'
        }}</span>
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
        <tips-modal :width="'490px'" title="删除提示" :tipType="'danger'" class="tip-content-modal" :okText="'确定删除'"
            v-model:openTipsModal="openTipsPowerModal" @handleChangeFileModal="handleChangeClose">
            <template #contentBody>
                <span class="modalTip">确定删除该数据么？</span>
            </template>
        </tips-modal>
        <!-- 开放、禁用 -->
        <tips-modal :width="'490px'" :tipType="'danger'" class="tip-content-modal"
            :okText="tipModalType == 'open' ? '确定开放' : '确定禁用'" v-model:openTipsModal="openTipsOpenModal"
            @handleChangeFileModal="handleChangeOpenModal">
            <template #customTitle>{{ tipTitle }}</template>
            <template #contentBody>
                <div class="tuning-tip">
                    <iconpark-icon name="jinggao" size="18" class="success"></iconpark-icon>
                    <span class="tuning-tip-title">{{ contentTip }}</span>
                </div>
                <a-form :colon="false" class="sort-form" ref="openFormRef" :model="openFormData" :labelCol="labelCol"
                    labelAlign="left">
                    <a-form-item label="原因" name="reason" :rules="[{ required: true, message: '请输入原因' }]">
                        <a-textarea style="width: 358px" :auto-size="{ minRows: 2, maxRows: 5 }"
                            v-model:value="openFormData.reason" placeholder="请输入原因" />
                    </a-form-item>
                </a-form>
            </template>
        </tips-modal>
    </div>
</template>

<script setup>
import { ref, reactive, toRefs, onUnmounted, onMounted, watch, onDeactivated, onActivated, onBeforeUnmount, onBeforeMount, nextTick } from 'vue';
import TableList from '@/components/tableList/TableList.vue';
import TipsModal from '@/components/tipsDialog/TipsModal.vue';
import mitt from '@/utils/eventBus';
import { WATER_CONSERATION_TABLE_LIST_CLOUMN } from '../environmental';
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router';
import _ from 'lodash';
import { cityClomun, USER_COMMON_DATA_STATUS, PUBLIC_COMMON_STATUS } from '../../commonData';
import { getGridList, disableGrid } from '@/api/modules/commonDataManage.js'
import { removeEmpty } from '../../commonData.js'
import dayjs from 'dayjs';
const props = defineProps({
});
const searchKey = ref({
})
const loading = ref(false);
const router = useRouter();
const clomun = ref(_.cloneDeep(WATER_CONSERATION_TABLE_LIST_CLOUMN));
const dataList = ref([])
// 处理标签key对应关系
const handleStatus = (val) => {
    let dataArr = searchKey.value.source == 2 ? USER_COMMON_DATA_STATUS : PUBLIC_COMMON_STATUS 
    let obj = {
        class: '',
        label: ''
    }
    dataArr.filter((item) => {
        if (item.value == (val)) {
            obj.class = item.className;
            obj.label = item.label;
        }
    });
    return obj;
};
// 开放、禁用
const tipModalType = ref('')
const contentTip = ref('')
const openTipsOpenModal = ref(false)
const openFormRef = ref(null)
const openFormData = ref({
    reason: ''
})
const labelCol = {
    style: {
        width: '70px',
        marginRight: '6px',
    },
};
const page = ref({
    pageNo: 1,
    pageSize: 10,
    total: 0,
});
// 搜索
const handleSearch = (val,) => {
    page.value.pageNo = 1;
    getTableData(val);
};
// 重置
const resetSearch = (val) => {
    page.value.pageNo = 1;
    page.value.pageSize = 10;
    handleSearch(val);
};
// 获取表格数据
const getTableData = async (val) => {
    dataList.value = [
        {id:1}
    ]
    try {
        let data = {
            pageNo: page.value.pageNo,
            pageSize: page.value.pageSize,
            ...val,
            cityCode: val.areaCode ? val.areaCode[val.areaCode?.length - 1] : '',
        };
        data.modeType = ''
        data.areaCode = ''
        // const res = await getGridList(removeEmpty(data))
        // if (res.code === 200) {
        //     dataList.value = res.data.list?.map((item) => {
        //         return {
        //             ...item,
        //             'statusName': handleStatus(item.status).label,
        //             'isDisabledName': handleStatus(item.isDisable).label,
        //             'statusClassName': handleStatus(item.status).class,
        //             'disabledClassName': handleStatus(item.isDisable).class,
        //             'createTime':dayjs(item.createTime).format('YYYY-MM-DD HH:mm:ss'),
        //         };
        //     });
        //     page.value.total = res.data.total;
        //     console.log('----',dataList.value);
        // }else {
        //     dataList.value = []
        //     page.value.total = 0
        // }
    } catch (err) {
        console.log('err', err);
    }

};
// 表格
const getRowData = (row) => {
    router.push({
        path: '/hucang/environment/detail', // 已改为新路由前缀
        query: {
            id: row.id,
        },
    });
    console.log('点击行', row);
};
// 获取页面分页
const changePage = (val) => {
    page.value.pageNo = val.page;
    page.value.pageSize = val.pageSize;
    getTableData(searchKey.value);
};
const openTipsPowerModal = ref(false);
const tipTitle = ref('');
// 核对、编辑
const editFile = (val) => {
    router.push({
        path: '/hucang/environment/add', // 已改为新路由前缀
        query: {
            id: val.id,
        },
    });
};
// 删除
const deleteFile = (val) => {
    chooseFileDetail.value = val;
    openTipsPowerModal.value = !openTipsPowerModal.value;
    console.log('删除');
    
};
// 当前选中的
const chooseFileDetail = ref({});
// 禁用
const disableFile = (val) => {
    chooseFileDetail.value = val;
    contentTip.value = '确定将该数据置为禁用状态么？';
    openTipsOpenModal.value = !openTipsOpenModal.value;
    tipModalType.value = 'disable';
    tipTitle.value = '禁用提示';
    console.log('禁用', val);
};
// 置为开放
const openFile = (val) => {
    chooseFileDetail.value = val;
    contentTip.value = '确定将该数据置为开放状态么？';
    openTipsOpenModal.value = !openTipsOpenModal.value;
    tipModalType.value = 'open';
    tipTitle.value = '开放提示';
    console.log('置为开放', val);
};
// 关闭
const handleChangeOpenModal = (val) => {
    if (val) {
        openFormRef.value.validateFields().then(() => {
            submitOpenFile(tipModalType.value)
            console.log('检验成功', openFormRef.value);
        }).catch((error) => {
            console.log('错误', error);
        })
    } else {
        openFormRef.value.resetFields()
        openTipsOpenModal.value = !openTipsOpenModal.value;
    }
    // submitOpenFile(tipModalType.value);
    console.log('handleChangeOpenModal', val);
}
// 提交状态修改
const submitOpenFile = async(type) => {
    let data = {
        id: chooseFileDetail.value.id,
    }
    switch (type) {
        case 'open':
            data.isDisable = 0;
            data.reason = openFormData.value.reason;
            break;
        case 'disable':
            data.isDisable = 1;
            data.reason = openFormData.value.reason;
            break;
        case 'delete':
            data.isDelete = 1;
            break;
    }
    try {
        // let res = await disableGrid(data)
        // console.log('res', res);
        // if(res.code == 200) {
        //    if(type !=='delete') {
        //     openFormRef.value.resetFields()
        //    }
        //     type == 'delete' ? openTipsPowerModal.value = !openTipsPowerModal.value : openTipsOpenModal.value = !openTipsOpenModal.value;
        //     getTableData(searchKey.value);
        // }
    } catch (err) {
        console.log('err', err);
    }

    console.log('submitOpenFile', type);
};
// 关闭弹窗
const handleChangeClose = (val) => {
    if (val) {
        submitOpenFile('delete');
    } else {
        openTipsPowerModal.value = !openTipsPowerModal.value
    }
};

// 初始化兄弟组件通讯
const initMitt = () => {
    mitt.on('handleSearch', (val) => {
        searchKey.value = val
        handleSearch(val);
    });
    mitt.on('resetSearch', (val) => {
        searchKey.value = val
        resetSearch(val);
    });
}
const deletMitt = () => {
    mitt.off('handleSearch');
    mitt.off('resetSearch');
    // mitt.off('getAreaInfo');
}
onMounted(() => {
    initMitt()
});
onActivated(() => {    
    initMitt()
})
onDeactivated(() => {
    deletMitt()
})
onBeforeUnmount(() => {
    deletMitt()
})
</script>
<style scoped lang="scss">
@import '@/assets/css/tabs.scss';

/* ========== 新版样式 ========== */
.water-conservation-list {
    height: 100%;
    min-height: 0;
}

/* 状态标签：胶囊样式 */
.water-conservation-list .status-tag {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: auto;
    height: 24px;
    padding: 0 10px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
    line-height: 24px;
}
.water-conservation-list .status-tag.pending-icon {
    color: #00A63E;
    background: #E8F7EE;
    box-shadow: inset 0 0 0 1px #B7E4C7;
}
.water-conservation-list .status-tag.finish-icon {
    color: #D9363E;
    background: #FEECEC;
    box-shadow: inset 0 0 0 1px #FFC9C9;
}
.water-conservation-list .status-tag.bind-icon {
    color: #D97706;
    background: #FFF3E0;
    box-shadow: inset 0 0 0 1px #FFD8A8;
}
.water-conservation-list .status-tag.has-bind-icon {
    color: #0050B5;
    background: #DDF0FF;
    box-shadow: inset 0 0 0 1px #ABD1FF;
}
.water-conservation-list .status-tag.stop-icon {
    color: #667383;
    background: #EEF1F5;
    box-shadow: inset 0 0 0 1px #DFE5EC;
}

/* 操作列：按钮排成一行，放不下自动换行 */
.water-conservation-list .operation-btn {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 4px 12px;
}
.water-conservation-list .operation-btn-item {
    font-size: 13px;
    color: #667383;
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

/* ========== 以下为原有样式（未改动） ========== */
.tuning-tip {
    display: flex;
    padding: 8px 0 5px 0;
    background: #FEF1DF;
    border-radius: 4px;
    margin-bottom: 20px;

    .success {
        color: #FE830F;
        margin: 0 9px 0 12px;
    }

    .tuning-tip-title {
        font-size: 14px;
        color: #21263F;
        line-height: 22px;
    }
}
</style>