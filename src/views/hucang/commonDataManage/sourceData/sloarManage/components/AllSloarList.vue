<template>
    <div class="user-list">
        <table-list id="currentPowerTable" class="user-table" :loading="loading" :tableData="dataList"
            :tableColumn="clomun" :page="page" @getRowData="getRowData" @changePage="changePage">
            <template #hasResourceData="{ record }">
                <iconpark-icon :name="record.hasResourceData? 'you' : 'wu'"></iconpark-icon>
            </template>
            <template #hasImg="{ record }">
                <iconpark-icon :name="record.hasImg? 'you' : 'wu'"></iconpark-icon>
            </template>
            <template #operation="{ record }">
                <div class="operation-btn">
                    <span class="operation-btn-item" @click.stop="editFile(record)">编辑</span>
                    <span class="operation-btn-item" @click.stop="deleteFile(record)">删除</span>
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
    </div>
</template>

<script setup>
import { ref, reactive, toRefs, onUnmounted, onMounted, watch, onDeactivated, onActivated, onBeforeUnmount, onBeforeMount, nextTick } from 'vue';
import TableList from '@/components/tableList/TableList.vue';
import TipsModal from '@/components/tipsDialog/TipsModal.vue';
import mitt from '@/utils/eventBus';
import { SLOAR_TABLE_LIST_CLOUMN } from '../sloar.js';
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router';
import _ from 'lodash';
import { getSolarEnergyList, deleteSolarEnergy } from '@/api/modules/sourceData/sloarManage.js'
import { removeEmpty } from '../../../commonData.js'
import dayjs from 'dayjs';
const props = defineProps({
});
const searchKey = ref({
})
const loading = ref(false);
const router = useRouter();
const clomun = ref(_.cloneDeep(SLOAR_TABLE_LIST_CLOUMN));
const dataList = ref([])

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
    dataList.value = []
    try {
        let data = {
            pageNo: page.value.pageNo,
            pageSize: page.value.pageSize,
            ...val,
            affiliationCode: val.affiliationCode ? val.affiliationCode[val.affiliationCode?.length - 1] : '',
        };
        data.modeType = ''        
        const res = await getSolarEnergyList(removeEmpty(data))
        if (res.code === 200) {
            dataList.value = res.data.list?.map((item) => {
                return {
                    ...item,
                    'updateTime':item.createTime?dayjs(item.updateTime).format('YYYY-MM-DD HH:mm:ss'):'--',
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
        path: '/sourceData/sloarDetail',
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
        path: '/sourceData/sloarAdd',
        query: {
            id: val.id,
        },
    });
};
const chooseFileDetail = ref({});
// 删除
const deleteFile = (val) => {
    chooseFileDetail.value = val;
    openTipsPowerModal.value = !openTipsPowerModal.value;
    
};
// 提交状态修改
const submitOpenFile = async(type) => {
    try {
        let res = await deleteSolarEnergy(chooseFileDetail.value.id)
        if(res.code == 200) {
            openTipsPowerModal.value = !openTipsPowerModal.value
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

.user-list {
    padding: 0 0px 52px 0;
}

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
