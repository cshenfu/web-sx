<template>
    <div class="user-list">
        <table-list id="currentPowerTable" class="user-table" :loading="loading" :tableData="dataList"
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
                        <span class="operation-btn-item" @click.stop="deleteFile(record)">删除</span>
                    </template>
                    <template v-if="searchKey.source == 1">
                        <span class="operation-btn-item" @click.stop="editFile(record)">编辑</span>
                        <span class="operation-btn-item" @click.stop="deleteFile(record)">删除</span>
                        <span class="operation-btn-item" v-if="record.isDisable == 0" @click.stop="disableFile(record)">禁用</span>
                        <span class="operation-btn-item" v-if="record.isDisable == 1" @click.stop="openFile(record)">置为开放</span>
                    </template>
                </div>
            </template>
        </table-list>
        <!-- 删除 -->
        <tips-modal :width="'490px'" title="删除提示" :tipType="'danger'" class="tip-content-modal" :okText="'确定删除'"
            :openTipsModal.sync="openTipsPowerModal" @handleChangeFileModal="handleChangeClose">
            <template #contentBody>
                <span class="modalTip">确定删除该数据么？</span>
            </template>
        </tips-modal>
        <!-- 开放、禁用 -->
        <tips-modal :width="'490px'" :tipType="'danger'" class="tip-content-modal"
            :okText="tipModalType == 'open' ? '确定开放' : '确定禁用'" :openTipsModal.sync="openTipsOpenModal"
            @handleChangeFileModal="handleChangeOpenModal">
            <template #customTitle>{{ tipTitle }}</template>
            <template #contentBody>
                <div class="tuning-tip">
                    <iconpark-icon name="jinggao" size="18" class="success"></iconpark-icon>
                    <span class="tuning-tip-title">{{ contentTip }}</span>
                </div>
                <a-form :colon="false" class="sort-form" ref="openFormRef" :model="openFormData" :labelCol="labelCol"
                    labelAlign="left">
                    <a-form-item label="原因" name="reason" :rules="[{ required: true, ElMessage: '请输入原因' }]">
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
import { POWER_TABLE_LIST_CLOUMN } from '../currentPower.js';
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router';
import _ from 'lodash';
import { cityClomun, USER_COMMON_DATA_STATUS,PUBLIC_COMMON_STATUS } from '../../commonData';
import { getGridList, disableGrid } from '@/api/modules/commonDataManage.js'
import { removeEmpty } from '../../commonData.js'
import dayjs from 'dayjs';
const props = defineProps({
});
const searchKey = ref({
})
const loading = ref(false);
const router = useRouter();
const clomun = ref(_.cloneDeep(POWER_TABLE_LIST_CLOUMN));
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
    // val.rangeType = val.rangeType + '';
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
    console.log(val);
    dataList.value = []
    try {
        let data = {
            pageNo: page.value.pageNo,
            pageSize: page.value.pageSize,
            ...val,
            cityCode: val.areaCode ? val.areaCode[val.areaCode?.length - 1] : '',
        };
        data.modeType = ''
        data.areaCode = ''
        const res = await getGridList(removeEmpty(data))
        if (res.code === 200) {
            dataList.value = res.data.list?.map((item) => {
                return {
                    ...item,
                    'statusName': handleStatus(item.status).label,
                    'isDisabledName': handleStatus(item.isDisable).label,
                    'statusClassName': handleStatus(item.status).class,
                    'disabledClassName': handleStatus(item.isDisable).class,
                    'createTime':item.createTime?dayjs(item.createTime).format('YYYY-MM-DD HH:mm:ss'):'--',
                };
            });
            page.value.total = res.data.total;
        }else {
            dataList.value = []
            page.value.total = 0
        }
    } catch (err) {
        console.log('err', err);
    }

};
// 表格
const getRowData = (row) => {
    router.push({
        path: '/currentPower/detail',
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
        path: '/currentPower/add',
        query: {
            id: val.id,
        },
    });
};
// 删除
const deleteFile = (val) => {
    chooseFileDetail.value = val;
    openTipsPowerModal.value = !openTipsPowerModal.value;
    
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
};
// 置为开放
const openFile = (val) => {
    chooseFileDetail.value = val;
    contentTip.value = '确定将该数据置为开放状态么？';
    openTipsOpenModal.value = !openTipsOpenModal.value;
    tipModalType.value = 'open';
    tipTitle.value = '开放提示';
};
// 关闭
const handleChangeOpenModal = (val) => {
    if (val) {
        openFormRef.value.validateFields().then(() => {
            submitOpenFile(tipModalType.value)
        }).catch((error) => {
            console.log('错误', error);
        })
    } else {
        openFormRef.value.resetFields()
        openTipsOpenModal.value = !openTipsOpenModal.value;
    }
    // submitOpenFile(tipModalType.value);
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
        let res = await disableGrid(data)
        if(res.code == 200) {
           if(type !=='delete') {
            openFormRef.value.resetFields()
           }
            type == 'delete' ? openTipsPowerModal.value = !openTipsPowerModal.value : openTipsOpenModal.value = !openTipsOpenModal.value;
            getTableData(searchKey.value);
        }
    } catch (err) {
        console.log('err', err);
    }
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
    // mitt.on('getAreaInfo', (val) => {
    //     if (val == 1) {
    //         clomun.value = [...POWER_TABLE_LIST_CLOUMN];
    //     } else {
    //         clomun.value.splice(2, 1, cityClomun);
    //     }
    // });

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
