<template>
    <div class="inverter-list">
        <div class="user-tabs">
            <div class="add-btn" @click="goPath"><iconpark-icon name="xinzeng" size="12" class="add-icon"></iconpark-icon>导入数据</div>
        </div>
        <inverter-list-search-bar @handleSearch="handleSearch" ref="inverterSearchRef"></inverter-list-search-bar>
        <table-list id="inverterListTable" class="user-table" :loading="loading" :tableData="dataList"
            :tableColumn="INVERTER_TABLE_LIST_CLOUMN" :page="page" @getRowData="getRowData" @changePage="changePage">
            <template #gridVoltageRange="{record}">
                <div class="operation-btn">
                    <!-- <span class="operation-btn-item" @click.stop="deleteFile(record)"> 删除 </span> -->
                </div>
            </template>
            <template #operation="{record}">
                <div class="operation-btn">
                    <span class="operation-btn-item" @click.stop="deleteFile(record)"> 删除 </span>
                </div>
            </template>
        </table-list>
        <!-- 导入数据 -->
        <import-file-modal v-model:importFileFlg="importFileFlg" v-if="importFileFlg" @updateList="handleSearch"></import-file-modal>
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
import { ref, reactive, toRefs, onBeforeMount, onMounted, watchEffect, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import InverterListSearchBar from './components/InverterListSearchBar.vue'
import TableList from '@/components/tableList/TableList.vue';
import {INVERTER_TABLE_LIST_CLOUMN} from './inverter';
import ImportFileModal from './components/ImportFileModal.vue';
import TipsModal from '@/components/tipsDialog/TipsModal.vue';
import {getInverterList,deleteInverter} from '@/api/modules/commonDataManage'
import dayjs from 'dayjs';
import { ElMessage } from 'element-plus';
const route = useRoute();
const router = useRouter();
const importFileFlg = ref(false);
const tipTitle =ref('')
const inverterSearchRef = ref(null)
const dataList = ref([]);
const loading = ref(false);
const page = ref({
    pageNo: 1,
    pageSize: 10,
    total: 0,
});
// 表格
const getRowData = (row) => {
    router.push({
        path: '/inverter/detail',
        query: {
            id: row.id,
        },
    });
    console.log('点击行', row);
};
// 搜索
const handleSearch= (e) => {
    let val = e?e:inverterSearchRef.value.searchKey;
    page.value.pageNo = 1;
    getTableData(val)
}
// 获取页面分页
const changePage = (val) => {
    page.value.pageNo = val.page;
    page.value.pageSize = val.pageSize;
    getTableData(inverterSearchRef.value.searchKey);
};
const getTableData = async(val)=> {
    let data = {
        ...val,
        pageNo: page.value.pageNo,
        pageSize: page.value.pageSize,
    }
    try {
        let res = await getInverterList(data)
        if(res.code ==200 && res.data.list?.length ) {
            dataList.value = res.data?.list.map((item,index)=> {
               return {
                    ...item,
                    'createTime': item.createTime? dayjs(item.createTime).format('YYYY-MM-DD HH:mm:ss') : '',
                    'updateTime': item.createTime? dayjs(item.updateTime).format('YYYY-MM-DD HH:mm:ss') : '',
               }
            })
            page.value.total = res.data?.total;
        }else {
            dataList.value = []
            page.value.total = 0
        }
        loading.value = false
        
    } catch (error) {
        
    }
}
const chooseSelectData = ref(null);
const openTipsClimateModal = ref(false);
// 删除数据
const deleteFile = (val) => {
    chooseSelectData.value = val
    openTipsClimateModal.value = !openTipsClimateModal.value;
    tipTitle.value = '删除提示';
};
// 关闭弹窗
const handleChangeClose = async (val) => {
    if (val) {
        try {
            let res = await deleteInverter(chooseSelectData.value.id)
            if(res.code ==200 && res.data ){
                ElMessage.success('删除成功！')
                page.value.pageNo = 1;
                getTableData(inverterSearchRef.value.searchKey);
                openTipsClimateModal.value = !openTipsClimateModal.value;
            }
        } catch (error) {
            
        }
        
    } else {
        openTipsClimateModal.value = !openTipsClimateModal.value;
    }
};
const goPath = () => {
    importFileFlg.value = true;
}
onBeforeMount(() => {
})
onMounted(() => {
})
</script>
<style scoped lang='scss'>
.inverter-list{
    background-color: #fff;
    padding: 16px 24px  16px 24px;
    position: relative;
    min-height: calc(100vh - 120px);
    .user-tabs {
        margin-bottom: 12px
    }
}
</style>