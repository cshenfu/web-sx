<template>
    <div>
        <queue-list-search-bar ref="queueListRef" @handleSearch="handleSearch" @resetSearch="resetSearch" />
        <table-list class="user-table" :loading="loading" :tableData="tableData" :tableColumn="QUEUE_MANAGE_LIST"
            :page="page" @changePage="changePage">
            <template #status="{ record }">
                <template v-for="item in QUEUE_MANAGE_STATUS">
                    <div class="status-tag" :class="item.classNames" v-if="record.status == item.value">{{ item.label }}
                    </div>
                </template>
            </template>
            <template #operation="{ record }">
                <div class="operation-btn">
                    <span class="operation-btn-item" @click.stop="cancelFn(record)" v-if="record.status == 1">取消</span>
                    <span class="operation-btn-item" @click.stop="handleOpertion(record, 'top')"
                        v-if="record.status == 2">置顶</span>
                    <span class="operation-btn-item" @click.stop="cancelProjectQueueFn(record)"
                        v-if="record.status == 2">取消</span>
                    <span class="operation-btn-item" @click.stop="handleOpertion(record, 'repeat')"
                        v-if="record.status == 3">重发</span>
                </div>
            </template>
        </table-list>
        <!-- 弹窗处理 -->
        <tips-modal :width="'490px'" class="tip-content-modal" :okText="okText" :showCancel="showCancel"
            :openTipsModal.sync="openQueueModal" @handleChangeFileModal="handleQueueModal">
            <template #customTitle>{{ tipTitle }}</template>
            <template #contentBody>
                <div class="tip-content-list">{{ modalContent }}</div>
            </template>
        </tips-modal>
    </div>
</template>

<script setup>
import { ref, reactive, toRefs, watch, onMounted, watchEffect, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import QueueListSearchBar from './QueueListSearchBar.vue';
import { QUEUE_MANAGE_LIST, QUEUE_MANAGE_STATUS } from '../projectList'
import TableList from '@/components/tableList/TableList.vue';
import TipsModal from '@/components/tipsDialog/TipsModal.vue';
import { getQueueList, resendTask, topUpQueue, deleteTask, cancelProjectQueue } from '@/api/modules/projectManage';
import { message, Upload } from 'ant-design-vue';
import dayjs from 'dayjs';
import { Reel } from '@icon-park/vue-next';
const props = defineProps({
    activeKey: {
        type: Number,
        default: 1,
    },
});

const loading = ref(false);
const queueListRef = ref(null);
const tableData = ref([
])
const page = ref({
    pageNo: 1,
    pageSize: 10,
    total: 0,
});
const tipTitle = ref("提示");
const modalContent = ref("");
const openQueueModal = ref(false);
const opertionType = ref('')
const showCancel = ref(true)
const okText = ref("确定取消")
const chooseData = ref()
// 搜索
const handleSearch = (val) => {
    page.value.pageNo = 1;
    getTableData(val);
};
// 重置
const resetSearch = (val) => {
    handleSearch(val);
};
// 获取表格数据
const getTableData = (val) => {
    loading.value = true
    tableData.value = []
    let { status, projectCode, projectId } = { ...val };
    let { pageNo, pageSize } = page.value;
    getQueueList({
        reverseAppCode: props.activeKey,
        status, projectCode, projectId,
        pageNo, pageSize
    }).then((res) => {
        if (res.code == 200) {
            // Todo暂时没有分页
            // page.value.total = res.data.total ? res.data.total : 0;
            let result = res.data || [];
            result.forEach((item) => {
                item.envSelf = item.env == 2 ? '测试' : '正式';
                item.createTimeSelf = item.createTime ? dayjs(item.createTime).format('YYYY-MM-DD HH:mm:ss') : '--';
            })
            tableData.value = sortArray(result)
        }
    }).catch((err) => {
        console.log('失败', err);
        tableData.value = []
    }).finally(() => {
        loading.value = false
    })
};
// 获取页面分页
const changePage = (val) => {
    page.value.pageNo = val.page;
    page.value.pageSize = val.pageSize;
    getTableData(queueListRef.value.searchKey);
};
// 取消
const cancelFn = (record) => {
    chooseData.value = record;
    opertionType.value = 'cancel'
    openQueueModal.value = true;
    showCancel.value = true;
    modalContent.value = `取消该任务前，请先确认该软件当前任务的计算已终止/关闭，再将需要提前计算的项目做置顶！`;
}
// 
const handleOpertion = async (record, type) => {
    chooseData.value = record;
    opertionType.value = type;
    let res = await submitOperation()
    if (res.code == 200 && res.data) {
        const msg = type == 'repeat' ? '重发成功' : '置顶成功'
        message.success(msg)
        getTableData(queueListRef.value.searchKey);
    }
}
// 排队中-取消
const cancelProjectQueueFn = (record) => {
    chooseData.value = record;
    opertionType.value = 'cancelProjectQueue'
    openQueueModal.value = true;
    showCancel.value = true;
    modalContent.value = `确定取消该排队任务？`;
}
// 提交取消
const submitOperation = async () => {
    let res
    try {
        let data = {
            projectId: chooseData.value.projectId,
            reverseAppCode: props.activeKey
        }
        if (!data.projectId) {
            message.error('该项目ID不存在，请核查数据')
            openQueueModal.value = false;
            return false
        }
        switch (opertionType.value) {
            case 'cancel':
                res = await deleteTask(data)
                break;
            case 'top':
                res = await topUpQueue(data)
                break;
            case 'repeat':
                res = await resendTask(data);
                break;
            case 'cancelProjectQueue':
                res = await cancelProjectQueue(data);
                break
            default:
                break;
        }

    } catch (err) {
        console.log('失败', err);
    }
    return res
}
// 获取调整队列
const handleQueueModal = async (val) => {
    if (val) {
        let res
        res = await submitOperation()
        if (res.code == 200 && res.data) {
            message.success('取消成功')
            openQueueModal.value = !openQueueModal.value;
            getTableData(queueListRef.value.searchKey);
        }

    } else {
        openQueueModal.value = !openQueueModal.value;
    }
};
const sortArray = (arr) => {
    arr.sort((a, b) => {
        if (a.status !== b.status) {
            return a.status - b.status;
        }
        const timeA = a.creatime !== null ? a.creatime : -Infinity;
        const timeB = b.creatime !== null ? b.creatime : -Infinity;
        return timeB - timeA;
    });

    return arr;
}
watch(
    () => props.activeKey,
    (val, oldVal) => {
        // if(val){
        page.value.pageNo = 1;
        getTableData(queueListRef.value.searchKey);
    },
    {},
);
onMounted(() => {
    getTableData(queueListRef.value.searchKey);


})
watchEffect(() => {
})

</script>
<style scoped lang='scss'>
.status-tag {
    // min-width: 52px;
    width: 80px;
    padding: 0 8px;
    height: 22px;
    background: #f1f1f1;
    color: #7c8294;
    border-radius: 2px;
    text-align: center;
    line-height: 22px;
    font-size: 12px;
}

.pending-icon {
    background: #e8f7e3;
    color: #50b72a;
}

.finish-icon {
    background: #fee9e9;
    color: #ff3e3e;
}

.stop-icon {
    background: #eeeff2;
    color: #7c8294;
}

.bind-icon {
    background: #fef1df;
    color: #ff8411;
}

.has-bind-icon {
    background: #dfecff;
    color: #4b74fe;
    cursor: pointer;
}

.tip-content-list {
    margin-top: 20px;
    // text-indent: 2em;
}
</style>