<template>
    <div class="user-list">
        <table-list id="allCadDrawingTable" class="user-table" :loading="loading" :tableData="dataList"
            :tableColumn="clomun" :page="page" @getRowData="getRowData" @changePage="changePage">
            <template #areaData="{ record }">
                <span>{{ record.provinceName }}{{ record.cityName?`/${record.cityName}`:'' }}{{ record.districtName?`/${record.districtName}`:'' }}</span>
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
                    <span class="operation-btn-item" @click.stop="editCad(record,'edit')">编辑</span>
                    <span class="operation-btn-item" @click.stop="editCad(record,'update')">更新</span>
                </div>
            </template>
        </table-list>

    </div>
</template>

<script setup>
import { ref, reactive, toRefs, onUnmounted, onMounted, watch, onDeactivated, onActivated, onBeforeUnmount, onBeforeMount, nextTick } from 'vue';
import TableList from '@/components/tableList/TableList.vue';
import mitt from '@/utils/eventBus';
import { CAD_TABLE_LIST_CLOUMN } from '../designSpecification.js';
import { useRouter } from 'vue-router';
import _ from 'lodash';
import { getGridList, } from '@/api/modules/commonDataManage.js'
import { removeEmpty } from '../../commonData.js'
import dayjs from 'dayjs';
const searchKey = ref({
})
const loading = ref(false);
const router = useRouter();
const clomun = ref(_.cloneDeep(CAD_TABLE_LIST_CLOUMN));
const dataList = ref([
    {
        id:1
    }
])

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
            cityCode: val.areaCode ? val.areaCode[val.areaCode?.length - 1] : '',
        };
        data.modeType = ''
        data.areaCode = ''
        const res = await getGridList(removeEmpty(data))
        if (res.code === 200) {
            dataList.value = res.data.list
            page.value.total = res.data.total;
            console.log('----',dataList.value);
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
        path: '/design/detail',
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
// 编辑-更新
const editCad = (val,type) => {
    router.push({
        path: '/design/add',
        query: {
            id: val.id,
            type:type
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
