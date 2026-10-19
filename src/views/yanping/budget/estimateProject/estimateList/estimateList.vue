<template>
    <div class="template-list">
        <div class="fixed-group">
            <a-button type="primary" @click="setSetting" ghost>
                可研概算调整
            </a-button>
            <a-button type="primary" @click="createFn">
                创建项目
            </a-button>
        </div>
        <table-list
            :loading="loading"
            :tableData="dataList"
            :tableColumn="tableColumn"
            :page="page"
            @changePage="changePage"
        >
            <template #updateTime="{ record }">
                {{
                    record.updateTime
                        ? dayjs(record.updateTime).format('YYYY-MM-DD HH:mm:ss')
                        : '--'
                }}
            </template>
            <template #projectType="{ record }">
                {{ record.projectType ? getProjectTypeName[record.projectType] : '--' }}
            </template>
            <template #operation="{ record }">
                <div class="operation-btn">
                    <span class="operation-btn-item" @click.stop="editFn(record)">预览</span>
                    <span class="operation-btn-item" @click.stop="editTemplateFn(record)"
                        >编辑</span
                    >
                </div>
                <div class="operation-btn">
                    <span class="operation-btn-item" @click.stop="deleteBtn(record)">删除</span>
                </div>
            </template>
        </table-list>

        <!-- 编辑名称弹窗 -->
        <modify-public
            v-if="modifyPublicFlag"
            v-model:modifyPublicFlag="modifyPublicFlag"
            :formItems="formItemsPublic"
            :initialValues="publicData"
            :title="modifyTitle"
            @getModifyPublicData="getModifyPublicData"
        ></modify-public>

        <!-- 删除确认弹窗 -->
        <tips-modal
            v-if="deleteClassModal"
            :width="'490px'"
            title="删除提示"
            :tipType="'danger'"
            class="tip-content-modal"
            :okText="'确定删除'"
            v-model:openTipsModal="deleteClassModal"
            @handleChangeFileModal="handleChangeClose"
        >
            <template #contentBody>
                <span class="modalTip">确定删除该模版么？</span>
            </template>
        </tips-modal>

        <!-- 可研概算调整弹窗 -->
        <AdjustBudgetModal
            v-model:visible="adjustModalVisible"
            adjust-type="budget"
            :projectType="1"
            portal-type="customer"
            @confirm="handleAdjustConfirm"
            @create="handleAdjustCreate"
            />
    </div>
</template>

<script setup>
    import { ref, reactive, onBeforeMount, onMounted } from 'vue';
    import { useRoute, useRouter } from 'vue-router';
    import {
        TEMPLATE_LIST_HEADER,
        EDIT_TEMPLATE_LIST_FORM,
        COPY_TEMPLATE_LIST_FORM,
    } from '../budget';
    import tableList from '@/components/tableList2/TableList.vue';
    import TipsModal from '@/components/tipsDialog/TipsModal.vue';
    import ModifyPublic from '../components/ModifyPublic.vue';
    import AdjustBudgetModal from '@/components/AdjustBudgetModal/index.vue';
    import {
        getEstimateProjectList,
        createEstimateProject,
        deleteEstimateProject,
    } from '@/api/modules/sourceData/estimateProject.js';
    import {
        getQuotaCatalogList,
        getTakeFeeList,
    } from '@/api/modules/sourceData/budgetManagement.js';
    import dayjs from 'dayjs';
    import { message } from 'ant-design-vue';

    const route = useRoute();
    const router = useRouter();

    const loading = ref(false);
    const dataList = ref([]);
    const page = ref({
        pageNo: 1,
        pageSize: 10,
        total: 0,
    });
    const getProjectTypeName = reactive({
        1: '风电',
        2: '光伏',
    });
    const tableColumn = reactive([...TEMPLATE_LIST_HEADER]);

    // 编辑弹窗
    const modifyPublicFlag = ref(false);
    const publicData = ref({});
    const modifyType = ref('');
    const modifyTitle = ref('');
    const formItemsPublic = ref([]);

    const quotaCatalogData = ref([]);
    const feeVersionManageData = ref([]);

    // 删除
    const deleteClassModal = ref(false);

    // 可研概算调整弹窗
    const adjustModalVisible = ref(false);

    const changePage = (val) => {
        page.value.pageNo = val.page;
        page.value.pageSize = val.pageSize;
        getData();
    };

    // 获取列表
    const getData = async () => {
        loading.value = true;
        const { pageNo, pageSize } = page.value;
        try {
            const res = await getEstimateProjectList({ pageNo, pageSize, platformType: 2 });
            if (res.code == 200 && res.data?.list) {
                dataList.value = res.data.list;
                page.value.total = res.data.total;
            } else {
                dataList.value = [];
                page.value.total = 0;
            }
        } catch (err) {
            console.log('报错', err);
        } finally {
            loading.value = false;
        }
    };

    const cloneFormItems = (source) => JSON.parse(JSON.stringify(source));

    const editTemplateFn = (record) => {
        router.push({
            path: '/costEstimate/set',
            query: {
                id: record.id,
                quotaCatalogId: record.quotaCatalogId,
                fromType: "costEstimate"
            },
        });
    };

    const createFn = () => {
        router.push({
            path: '/costEstimate/estimateList',
            query: {
                fromType: "costEstimate"
            },
        });
    };

    // 可研概算调整 - 打开弹窗
    const setSetting = () => {
        adjustModalVisible.value = true;
    };

    // 弹窗确认回调 - 使用接口返回的 newProjectId 跳转
    const handleAdjustConfirm = ({ project, newProjectId }) => {
        router.push({
            path: '/costEstimate/set',
            query: {
                id: newProjectId, // 使用接口返回的 data 作为 id
                quotaCatalogId: project.quotaCatalogId,
                fromType: "costEstimate",
                projectId:project.id
            },
        });
    };

    // 弹窗"创建"按钮回调
    const handleAdjustCreate = () => {
        createFn();
    };

    const editFn = (record) => {
        router.push({
            path: '/costEstimate/newTemplatePreview',
            query: {
                id: record.id,
                quotaCatalogId: record.quotaCatalogId,
                fromType: "costEstimate"
            },
        });
    };

    const getModifyPublicData = async (val) => {
        const { id, projectName, feeManageId, projectType, quotaCatalogId, tag } = val;
        const params = {
            id,
            projectName,
            projectType,
            quotaCatalogId,
            feeManageId,
            tag,
        };
        if (modifyType.value === 'edit') {
            params.operateType = 2;
        } else if (modifyType.value === 'add') {
            params.operateType = 1;
        } else {
            params.operateType = 3;
        }
        const res = await createEstimateProject(params);
        if (res.code == 200) {
            message.success('操作成功！');
            getData();
        }
    };

    const deleteBtn = (val) => {
        publicData.value = { ...val };
        deleteClassModal.value = true;
    };

    const handleChangeClose = (val) => {
        if (val) {
            submitDeleteData();
        }
        deleteClassModal.value = false;
    };

    const submitDeleteData = async () => {
        try {
            const res = await deleteEstimateProject(publicData.value.id);
            if (res.code == 200) {
                message.success('操作成功！');
                getData();
            }
        } catch (err) {}
    };

    const getQuotaLibData = async () => {
        try {
            const [res, rew] = await Promise.all([
                getQuotaCatalogList({ quotaProjectType: 1, pageNo: 1, pageSize: 1000 }),
                getTakeFeeList({ quotaProjectType: 1, pageNo: 1, pageSize: 1000 }),
            ]);
            if (res.code == 200) {
                quotaCatalogData.value = res.data.list || [];
                const index = EDIT_TEMPLATE_LIST_FORM.findIndex(
                    (m) => m.dataIndex == 'quotaCatalogId',
                );
                if (index > -1) {
                    EDIT_TEMPLATE_LIST_FORM[index]['options'] = res.data.list.map((m) => ({
                        label: m.quotaCatalog,
                        value: m.id,
                    }));
                }
            }
            if (rew.code == 200) {
                feeVersionManageData.value = rew.data.list || [];
                const index = EDIT_TEMPLATE_LIST_FORM.findIndex(
                    (m) => m.dataIndex == 'feeManageId',
                );
                if (index > -1) {
                    EDIT_TEMPLATE_LIST_FORM[index]['options'] = rew.data.list.map((m) => ({
                        label: m.feeVersion,
                        value: m.id,
                    }));
                }
            }
        } catch (err) {}
    };

    onBeforeMount(() => {
        getQuotaLibData();
    });

    onMounted(() => {
        getData();
    });
</script>

<style scoped lang="scss">
@import '@/assets/css/fixedGroup.scss';
    .template-list {
        border-radius: 12px 0 0 0;
        margin: 8px 0 0 16px;
        background-color: #fff;
        padding: 24px 24px 16px 24px;
        min-height: calc(100vh - 120px);
    }
    :deep(.table-list){
        margin-top: 40px;
    }
</style>