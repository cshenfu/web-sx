<template>
    <div class="my-project-list">
        <!-- 页面头部 -->
        <div class="finance-project-header">
            <span class="title">我的项目</span>
            <div class="header-actions">
                <a-button type="primary" ghost @click="openAdjustModal">
                    可研财评调整
                </a-button>
                <a-button type="primary" @click="goCreate">
                    创建项目
                </a-button>
            </div>
        </div>

        <!-- 搜索栏 -->
        <FinanceSearchBar @search="onSearch" />

        <table-list
            :loading="loading"
            :tableData="tableData"
            :tableColumn="columns"
            :page="page"
            :height="480"
            @changePage="changePage"
        >
            <!-- 项目区域 -->
            <template #region="{ record }">
                {{ [record.provinceName, record.cityName, record.districtName].filter(Boolean).join('/') || '-' }}
            </template>

            <!-- 状态 -->
            <template #status="{ record }">
                <div v-if="record.status === 0" class="status-tag default-icon">草稿</div>
                <div v-else-if="record.status === 1" class="status-tag compute-icon">计算中</div>
                <div v-else-if="record.status === 2" class="status-tag finish-icon">完成</div>
                <div v-else class="status-tag default-icon">-</div>
            </template>

            <!-- 来源 -->
            <template #source="{ record }">
                {{ SOURCE_MAP[record.platformType] ?? '-' }}
            </template>

            <!-- 创建时间 -->
            <template #createTime="{ record }">
                {{ formatTime(record.createTime) }}
            </template>

            <!-- 操作 -->
            <template #action="{ record }">
                <div class="operation-btn">
                    <span class="operation-btn-item" @click="goEdit(record)">编辑</span>
                    <span class="operation-btn-item danger" @click="showDeleteModal(record)">删除</span>
                </div>
                <div class="operation-btn">
                    <span class="operation-btn-item" @click="goPreview(record)">预览</span>
                </div>
            </template>
        </table-list>

        <!-- 删除确认弹窗 -->
        <a-modal
            v-model:open="deleteVisible"
            title="确认删除"
            :ok-button-props="{ danger: true, type: 'primary' }"
            ok-text="删除"
            cancel-text="取消"
            @ok="handleDelete"
        >
            <p>确认删除项目「{{ pendingRecord?.projectName }}」？此操作不可恢复。</p>
        </a-modal>

        <!-- 可研概算调整弹窗 -->
        <AdjustBudgetModal
            v-model:visible="adjustModalVisible"
            adjust-type="finance"
            portal-type="customer"
            @confirm="handleAdjustConfirm"
            @create="handleAdjustCreate"
            />
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { message } from 'ant-design-vue';
import FinanceSearchBar from './FinanceSearchBar.vue';
import AdjustBudgetModal from '@/components/AdjustBudgetModal/index.vue';
import tableList from '@/components/tableList2/TableList.vue';
import { getProjectList, deletProjectById } from '@/api/modules/pric.js';

const router = useRouter();
const route = useRoute();

const SOURCE_MAP = { 1: '系统', 2: '用户' };

function formatTime(ts) {
    if (!ts) return '-';
    const d = new Date(ts);
    const pad = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// 注意：table-list 组件用 scopedSlots 字段来对应具名插槽，不是 key
const columns = [
    { title: '项目编号', dataIndex: 'id', width: 130 },
    { title: '项目名称', dataIndex: 'projectName' },
    { title: '项目区域', dataIndex: 'region',     scopedSlots: 'region' },
    { title: '状态',     dataIndex: 'status',     scopedSlots: 'status' },
    { title: '来源',     dataIndex: 'source',     scopedSlots: 'source' },
    { title: '创建时间', dataIndex: 'createTime', scopedSlots: 'createTime' },
    { title: '操作',     dataIndex: 'action',     scopedSlots: 'action', width: 200, fixed: 'right' },
];

const loading = ref(false);
const tableData = ref([]);
// table-list 组件要求的分页字段格式：pageNo / pageSize / total
const page = ref({ pageNo: 1, pageSize: 10, total: 0 });
const currentSearchKey = ref({});

const adjustModalVisible = ref(false);

const fetchList = async () => {
    loading.value = true;
    try {
        const sk = currentSearchKey.value;
        const params = {
            pageNo: page.value.pageNo,
            pageSize: page.value.pageSize,
            platformType: 2,
            projectName: sk.projectName || undefined,
            projectType: sk.projectType ?? undefined,
            status: sk.status !== null && sk.status !== undefined ? sk.status : undefined,
            createTimeStart: sk.dataTime?.[0] || undefined,
            createTimeEnd: sk.dataTime?.[1] || undefined,
            provinceCode: sk.areaCode?.[0] || undefined,
            cityCode: sk.areaCode?.[1] || undefined,
            districtCode: sk.areaCode?.[2] || undefined,
        };
        const res = await getProjectList(params);
        if (res && res.code === 200) {
            tableData.value  = res.data?.list ?? [];
            page.value.total = res.data?.total ?? 0;
        } else {
            message.error(res?.msg || '获取项目列表失败');
        }
    } catch {
        message.error('获取项目列表失败，请稍后重试');
    } finally {
        loading.value = false;
    }
};

const onSearch = ({ searchKey }) => {
    currentSearchKey.value = searchKey;
    page.value.pageNo = 1;
    fetchList();
};

// table-list 分页回调，参数为 { page, pageSize }
const changePage = (val) => {
    page.value.pageNo   = val.page;
    page.value.pageSize = val.pageSize;
    fetchList();
};

const deleteVisible = ref(false);
const pendingRecord = ref(null);

function showDeleteModal(record) {
    pendingRecord.value = record;
    deleteVisible.value = true;
}

const handleDelete = async () => {
    try {
        const res = await deletProjectById(pendingRecord.value.id);
        if (res && res.code === 200) {
            message.success('删除成功');
            deleteVisible.value = false;
            const lastPage = Math.ceil((page.value.total - 1) / page.value.pageSize) || 1;
            page.value.pageNo = Math.min(page.value.pageNo, lastPage);
            fetchList();
        } else {
            message.error(res?.msg || '删除失败');
        }
    } catch {
        message.error('删除失败，请稍后重试');
    }
};

const goCreate = () => {
    router.push({ path: '/financeEval/create', query: route.query });
};

const goEdit = (record) => {
    router.push({ path: '/financeEval/create', query: { ...route.query, id: record.projectId, projectId: record.id, fromType: "financeEval" } });
};

const goPreview = (record) => {
    router.push({
        path: '/financeEval/preview',
        query: { ...route.query, id: record.projectId, projectId: record.id, fromType: "financeEval" },
    });
};

// 调整弹窗
const openAdjustModal = () => {
    adjustModalVisible.value = true;
};

// 弹窗确认回调 - 使用接口返回的 newProjectId 跳转
const handleAdjustConfirm = ({ project, newProjectId }) => {
    router.push({
        path: '/financeEval/create',
        query: {
            ...route.query,
            id: newProjectId.businessId,
            projectId: newProjectId.id, // 使用接口返回的 data 作为 projectId
            fromType: "financeEval"
        },
    });
};

const handleAdjustCreate = () => {
    goCreate();
};

onMounted(() => fetchList());
</script>

<style scoped lang="scss">
$primary-color: var(--theme);

.my-project-list {
    padding: 16px 24px 30px 24px;
    margin: 8px 0 0 16px;
    height: 100%;
    background-color: #fff;
    border-radius: 12px 0 0 0;

    .finance-project-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;

        .title {
            font-size: 16px;
            font-weight: 600;
            color: #363b4d;
        }

        .header-actions {
            display: flex;
            gap: 8px;
        }
    }
}

:deep(.table-list) {
    margin-top: 16px;
}

.status-tag {
    display: inline-block;
    padding: 0 8px;
    height: 22px;
    border-radius: 2px;
    text-align: center;
    font-size: 12px;
    line-height: 22px;
    min-width: 64px;
}
.default-icon {
    background: #f1f1f1;
    color: #999999;
}
.compute-icon {
    background-color: rgba(229, 240, 239, 1);
    color: rgba(3, 107, 100, 1);
}
.finish-icon {
    background: #e8f7e3;
    color: #50b72a;
}

.operation-btn {
    display: flex;
    align-items: center;
    line-height: 1.6;
    .operation-btn-item {
        font-size: 13px;
        color: $primary-color;
        cursor: pointer;
        padding: 0 4px;
        &:hover {
            opacity: 0.8;
        }
        & + .operation-btn-item {
            margin-left: 8px;
        }
        &.danger {
            color: #ff4d4f;
        }
    }
}
</style>