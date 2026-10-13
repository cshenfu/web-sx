<template>
    <div class="user-list">
        <table-list
            class="user-table"
            :loading="loading"
            :tableData="tableData"
            :tableColumn="PENDING_PROJECT_TABLE_LIST_CLOUMN"
            :page="page"
            @changePage="changePage"
        >
            <template #projectCode="{ record }">
                <a-popover overlay-class-name="name-popover-self">
                    <template #content>
                        {{ activeKey == 7 ? record.id : record.projectId }}
                    </template>
                    <div class="ellipsis-text-name">{{ record.projectCode }}</div>
                </a-popover>
            </template>
            <template #provinceName="{ record }">
                <span v-if="record.provinceName">{{ record.provinceName }}</span>
                <span v-if="record.cityName">{{ '/' + record.cityName }}</span>
                <span v-if="record.districtName">{{ '/' + record.districtName }}</span>
            </template>
            <template #createTime="{ record }">
                <div
                    >{{
                        record.createTime
                            ? dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss')
                            : '--'
                    }}
                </div>
            </template>
            <template #operation="{ record }">
                <div class="operation-btn">
                    <template v-if="activeKey == 7">
                        <span class="operation-btn-item" @click.stop="checkFile(record)"
                            >审核通过</span
                        >
                        <template v-if="record.itemType !== 2">
                            <span class="operation-btn-item" @click.stop="download(record, 3)"
                                >资源管理</span
                            >
                        </template>
                        <template v-if="record.itemType == 2">
                            <span class="operation-btn-item" @click.stop="previewDataBtn(record)"
                                >数据预览</span
                            >
                        </template>
                    </template>
                    <template v-if="record.itemType == 2 || activeKey == 1">
                        <span class="operation-btn-item" @click.stop="adjustDataBtn(record)"
                            >调整</span
                        >
                        <span
                            v-if="activeKey == 1"
                            class="operation-btn-item"
                            @click.stop="continueComputedBtn(record)"
                            >继续计算</span
                        >
                    </template>
                </div>
            </template>
        </table-list>
        <!-- 调整队列 -->
        <tips-modal
            :width="'490px'"
            class="tip-content-modal"
            :okText="okText"
            :openTipsModal.sync="openTipsProjectModal"
            @handleChangeFileModal="handleChangeSortModal"
        >
            <template #customTitle>{{ tipTitle }}</template>
            <template #contentBody>
                <a-form
                    :colon="false"
                    class="sort-form"
                    ref="changeSortFormRef"
                    :model="currentSelectData"
                    :labelCol="labelCol"
                    labelAlign="left"
                >
                    <a-form-item label="所选项目" name="name">
                        <div class="name-detail manage-detail">
                            <p>{{ currentSelectData.projectName }}</p>
                            <p>{{ currentSelectData.companyName }}</p>
                        </div>
                    </a-form-item>
                    <template v-if="tipModalType == 'sortChange'">
                        <a-form-item label="当前队列" name="operationType">
                            <div class="operation-type">
                                <p>第{{ currentSelectData.queueIndex }}位</p>
                            </div>
                        </a-form-item>
                        <a-form-item
                            label="调整位数"
                            name="sort"
                            :rules="[{ required: true, message: '请输入调整到第几位，如：' }]"
                        >
                            <a-input
                                style="width: 358px"
                                v-model:value="currentSelectData.sort"
                                placeholder="请输入调整到第几位，如：1"
                            />
                        </a-form-item>
                    </template>
                    <template v-if="showContent">
                        <div class="tuning-tip">
                            <iconpark-icon name="jinggao" size="18" class="success"></iconpark-icon>
                            <span class="tuning-tip-title">{{
                                `确定${tipModalContent}该项目计算么？`
                            }}</span>
                        </div>
                    </template>
                    <a-form-item
                        label="原因"
                        name="reason"
                        :rules="[{ required: true, message: '请输入原因' }]"
                    >
                        <a-textarea
                            style="width: 358px"
                            :auto-size="{ minRows: 2, maxRows: 5 }"
                            v-model:value="currentSelectData.reason"
                            placeholder="请输入原因"
                        />
                    </a-form-item>
                </a-form>
            </template>
        </tips-modal>
        <!-- 资源下载显示弹窗 -->
        <down-resource-management
            v-if="visibleDownloadModal"
            v-model:visibleDownloadModal="visibleDownloadModal"
            :downloadModalList="downloadModalList"
            :isReplaceFinally="isReplaceFinally"
            @customRequest="customRequest"
            @replaceAllFileFn="replaceAllFileFn"
        >
        </down-resource-management>
        <!-- AI找风资源调整 -->
        <adjust-data-modal
            :adjustModalType="activeKey"
            v-if="openAdjustDataModal"
            v-model:openTipsProjectModal="openAdjustDataModal"
            @updateList="getTableData"
            :currentData="currentSelectData"
        >
        </adjust-data-modal>
    </div>
</template>

<script setup>
    import {
        ref,
        reactive,
        toRefs,
        onBeforeMount,
        onMounted,
        watch,
        computed,
        onActivated,
    } from 'vue';
    import TableList from '@/components/tableList/TableList.vue';
    import TipsModal from '@/components/tipsDialog/TipsModal.vue';
    import { PENDING_PROJECT_TABLE_LIST_CLOUMN } from '../projectList.js';
    import DownResourceManagement from './DownResourceManagement.vue';
    import { message, Upload } from 'ant-design-vue';
    import { useRouter } from 'vue-router';
    import dayjs from 'dayjs';
    import {
        getProjectList,
        againProject,
        restartProject,
        stopProject,
        updateQueue,
        downloadReportFile,
        updateStatus,
        deleteProject,
        replaceReport,
        getReviseListPage,
        continueProject,
        replaceReportFileAgain,
    } from '@/api/modules/projectManage';
    import AdjustDataModal from './AdjustDataModal.vue';
    import { FILE_MAP_TYPE } from '../projectList.js';
    import * as pdfjsLib from 'pdfjs-dist';
    // import pdfWorker from "/js/pdf.worker.mjs";
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/js/pdf.worker.js';
    import mammoth from 'mammoth';
    const props = defineProps({
        activeKey: {
            type: Number,
            default: 1,
        },
    });

    const loading = ref(false);
    const router = useRouter();
    const projectListRef = ref();
    const visibleDownloadModal = ref(false);
    const downloadModalList = ref({});
    const page = ref({
        pageNo: 1,
        pageSize: 10,
        total: 0,
    });
    let tableData = ref([]);

    // 按钮操作
    const currentClickData = ref({});
    // 获取表格数据
    const getTableData = () => {
        props.activeKey == 1 ? getReviseList() : getPendingList();
    };
    // 获取发电量审核列表
    const getReviseList = () => {
        getReviseListPage({
            pageNo: page.value.pageNo,
            pageSize: page.value.pageSize,
            status: 0,
        }).then((res) => {
            if (res.code == 200) {
                page.value.total = res.data.total ? res.data.total : 0;
                tableData.value = res.data.list || [];
            }
        });
    };
    // 获取待审核数据
    const getPendingList = () => {
        getProjectList({
            pageNo: page.value.pageNo,
            pageSize: page.value.pageSize,
            projectStatus: props.activeKey,
        }).then((res) => {
            if (res.code == 200) {
                page.value.total = res.data.total ? res.data.total : 0;
                tableData.value = res.data.list || [];
            }
        });
    };
    watch(
        () => props.activeKey,
        (val, oldVal) => {
            // if(val){
            page.value.pageNo = 1;
            getTableData();
        },
        {},
    );

    // 获取页面分页
    const changePage = (val) => {
        page.value.pageNo = val.page;
        page.value.pageSize = val.pageSize;
        getTableData();
    };
    const showContent = computed(() => {
        return (
            tipModalType.value == 'terminate' ||
            tipModalType.value == 'pause' ||
            tipModalType.value == 'del'
        );
    });
    const openTipsProjectModal = ref(false);
    const okText = ref('确定调整');
    const tipModalContent = ref('');
    const tipTitle = ref('');
    const changeSortFormRef = ref(null);
    const labelCol = {
        style: {
            width: '70px',
            marginRight: '6px',
        },
    };
    const tipModalType = ref('');
    const currentSelectData = ref(null);
    // 调整队列
    const changeSort = (val) => {
        currentSelectData.value = { ...val };
        currentSelectData.value.reason = '';
        tipModalType.value = 'sortChange';
        tipTitle.value = '调整队列';
        okText.value = '确定调整';
        openTipsProjectModal.value = !openTipsProjectModal.value;
    };
    // 暂停计算
    const stop = (val) => {
        console.log('暂停计算', val);
    };
    // 重启计算
    const restart = (val) => {
        restartProject(val.id).then((res) => {
            if (res.code == 200) {
                message.success('重启成功');
                getTableData();
            }
        });
    };
    // 终止计算
    const terminate = (val) => {
        currentSelectData.value = { ...val };
        currentSelectData.value.reason = '';
        tipModalType.value = 'terminate';
        tipModalContent.value = '终止';
        tipTitle.value = '终止计算';
        okText.value = '确定终止';
        openTipsProjectModal.value = !openTipsProjectModal.value;
    };
    // 暂停计算
    const pauseFn = (val) => {
        currentSelectData.value = { ...val };
        currentSelectData.value.reason = '';
        tipModalType.value = 'pause';
        tipModalContent.value = '暂停';
        tipTitle.value = '暂停计算';
        okText.value = '确定暂停';
        openTipsProjectModal.value = !openTipsProjectModal.value;
    };
    // 重新计算
    const reCalculate = (val) => {
        againProject(val.id).then((res) => {
            if (res.code == 200) {
                message.success('重新计算成功');
                getTableData();
            }
        });
    };
    // word下载
    const download = (val, type) => {
      if (type == 3) {
            // 资源下载显示弹窗
            currentSelectData.value = val;
            downloadReportEvent(val);
        }
    };
    const formatReportFiles = (data) => {
        if (!data || data.length == 0) {
            return {};
        } else {
            const formatJson = {};
            data.forEach((item) => {
                item.fileSuffix = updateSuffix(item, FILE_MAP_TYPE);
                if (formatJson[item.fileClassify]) {
                    formatJson[item.fileClassify]['list'].push(item);
                } else {
                    formatJson[item.fileClassify] = {
                        fileClassify: item.fileClassify,
                        fileClassifyDesc: item.fileClassifyDesc,
                        list: [item],
                    };
                }
            });
            return formatJson;
        }
    };
    const updateSuffix = (item, arr) => {
        let result = [];
        if (item.fileClassify == 0) {
            if (item.fileName == 'word报告') {
                result = arr[0]['word报告'];
                return result;
            } else {
                result = arr[0]['PDF报告'];
                return result;
            }
        }
        if (item.fileClassify == 4) {
            if (item.fileName == '财务评价xlsx') {
                result = arr[item.fileClassify]['财务评价xlsx'];
                return result;
            } else {
                result = arr[item.fileClassify]['财务评价doc'];
                return result;
            }
        }

        result = arr[item.fileClassify] ? arr[item.fileClassify] : [];
        return result;
    };
    const downloadReportEvent = (val) => {
        downloadReportFile(val.id).then((res) => {
            // downloadReportFile(158).then((res) => {
            if (res.code == 200 && res.data.length) {
                visibleDownloadModal.value = true;
                downloadModalList.value = formatReportFiles(res.data);
            } else {
                message.error('暂无可下载的资源！');
            }
        });
    };
    // 提交调整队列
    const submitSortChange = (val) => {
        // currentSelectData.value = val;
        updateQueue({
            projectId: currentSelectData.value.id,
            reason: currentSelectData.value.reason,
            queueIndex: currentSelectData.value.sort,
        }).then((res) => {
            if (res.code == 200) {
                message.success('调整队列成功！');
                getTableData();
            }
        });
    };
    // 提交终止计算
    const submitTerminate = () => {
        stopProject({
            projectId: currentSelectData.value.id,
            reason: currentSelectData.value.reason,
        }).then((res) => {
            if (res.code == 200) {
                getTableData();
            }
        });
    };
    // 提交暂停计算
    const submitPauseFn = () => {
        console.log('暂停计算');
    };
    // 提交删除项目
    const submitDelProject = () => {
        let data = {
            projectId: currentSelectData.value.id,
            reason: currentSelectData.value.reason,
        };
        deleteProject(data).then((res) => {
            if (res.code == 200) {
                message.success('删除成功');
                getTableData();
            }
        });
    };
    // 获取调整队列
    const handleChangeSortModal = (val) => {
        if (val) {
            changeSortFormRef.value
                .validateFields()
                .then(() => {
                    switch (tipModalType.value) {
                        case 'sortChange':
                            submitSortChange();
                            break;
                        case 'terminate':
                            submitTerminate();
                            break;
                        case 'pause':
                            submitPauseFn();
                            break;
                        case 'del':
                            submitDelProject();
                            break;
                    }
                    changeSortFormRef.value.resetFields();
                    openTipsProjectModal.value = !openTipsProjectModal.value;
                })
                .catch((error) => {
                    console.log('错误', error);
                });
        } else {
            openTipsProjectModal.value = !openTipsProjectModal.value;
            changeSortFormRef.value.resetFields();
        }
    };
    // 审核完成
    const checkFile = async (record) => {
        try {
            let res = await updateStatus(record.id);
            if (res.data) {
                message.success('审核通过');
                getTableData();
            }
        } catch (err) {
            console.log('----', err);
        }
    };
    // 显示项目计算进度
    const showProjectProcess = (record) => {
        router.push({
            path: '/projectContro/progress',
        });
    };
    // 预览数据
    const previewDataBtn = (record) => {
        sessionStorage.setItem('projectName', record.projectName);
        sessionStorage.setItem('projectID', record.id);
        sessionStorage.setItem('currentProjectCapacity', record.currentProjectCapacity);
        router.push({
            path: '/projectContro/tdMapResult',
            id: record.id,
        });
    };
    // 删除项目
    const del = (val) => {
        currentSelectData.value = { ...val };
        currentSelectData.value.reason = '';
        tipModalType.value = 'del';
        tipModalContent.value = '删除';
        tipTitle.value = '删除提示';
        okText.value = '确定删除';
        openTipsProjectModal.value = !openTipsProjectModal.value;
    };
    // 调整--AI找风资源以及一键风电
    const openAdjustDataModal = ref(false);
    const adjustDataBtn = (record) => {
        console.log('调整', record);
        currentSelectData.value = { ...record };
        openAdjustDataModal.value = true;
    };
    // 替换报告
    const fileList = ref([]);
    const replaceReportType = ref('');
    const isReplaceFinally = ref(false);
    // 自定义上传逻辑
    const customRequest = async (file, val) => {
        try {
            const formData = new FormData();
            formData.append('file', file.file);
            formData.append('projectId', val.projectId);
            formData.append('type', val.fileType);
            isReplaceFinally.value = true;
            let res = await replaceReport(formData);

            if (res.code == 200 && res.data) {
                let data = {
                    id: val.projectId,
                };
                message.success('报告替换完成');
                downloadReportEvent(data);
                fileList.value = [];
                isReplaceFinally.value = false;
            }
        } catch (err) {
            console.log('上传出错', err);
        } finally {
            isReplaceFinally.value = false;
        }
    };

    // 替换所有报告
    const replaceAllFileFn = async () => {
        try {
            let res = await replaceReportFileAgain(currentSelectData.value.id);
            if (res.code == 200 && res.data) {
                let data = {
                    id: currentSelectData.value.id,
                };
                message.success('报告生成中，请关注飞书消息报告生成通知');
                downloadReportEvent(data);
                isReplaceFinally.value = false;
            }
        } catch (err) {
            console.log('报错', err);
        }
    };
    // 校验上传文件的限制类型
    const checkUploadFileLimit = (val) => {
        let result = [];
        switch (val.fileName) {
            case 'word报告':
                replaceReportType.value = 1;
                result = ['doc', 'docx'];

                break;
            case 'PDF报告':
                replaceReportType.value = 2;
                result = ['pdf'];
                break;
        }
        return result;
    };
    // 校验pdf文件
    const checkPdfEncryption = async (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const arrayBuffer = e.target.result;
                try {
                    const pdfDocument = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                    console.log('--pdfDocument--', pdfDocument);
                    resolve(false);
                } catch (error) {
                    resolve(true);
                }
            };
            reader.readAsArrayBuffer(file);
        });
    };
    // 校验word文件
    const checkDocxEncryption = async (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const arrayBuffer = e.target.result;
                try {
                    await mammoth.extractRawText({ arrayBuffer });
                    resolve(false);
                } catch (error) {
                    resolve(true);
                }
            };
            reader.readAsArrayBuffer(file);
        });
    };
    // 继续计算
    const continueComputedBtn = (val) => {
        continueProject(val.id).then((res) => {
            if (res.code == 200) {
                message.success('继续计算开启成功');
                getTableData();
            }
        });
    };
    onBeforeMount(() => {});
    onMounted(() => {
        getTableData();
    });
    onActivated(() => {
        // getTableData();
    });
</script>
<style scoped lang="scss">
    .user-list {
        // padding: 0px 0px 48px 0 !important;
        .status-tag {
            // min-width: 52px;
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
        .long-time {
            font-size: 12px;
            line-height: 12px;
            color: #7c8294;
            margin-top: 5px;
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

        .tuning-tip {
            display: flex;
            height: 42px;
            align-items: center;
            padding: 8px 0 5px 0;
            background: #fef1df;
            border-radius: 4px;
            margin-bottom: 20px;
            .success {
                color: #fe830f;
                margin: 0 9px 0 12px;
            }
            .tuning-tip-title {
                font-size: 14px;
                color: #21263f;
                line-height: 18px;
            }
        }
        .history-num {
            display: flex;
            align-items: center;
            cursor: pointer;
            color: #036b64;
            .num-icon {
                margin-left: 5px;
            }
        }
        .name-detail {
            width: 358px;
            background: #ffffff;
            border-radius: 4px;
            padding: 5px 0;
            font-size: 12px;
            line-height: 12px;
            p {
                color: #363b4d;
                &:last-child {
                    color: #7c8294;
                    margin-top: 12px;
                }
            }
        }
        .name-tip {
            font-size: 12px;
            color: #7c8294;
            line-height: 12px;
            margin-top: 8px;
        }
        .has-bind-clor {
            color: #036b64;
        }
        .operation-type {
            font-size: 12px;
            color: #363b4d;
            line-height: 12px;
        }
        .manage-detail {
            border: none;
        }
    }
    .flex-ul {
        display: flex;
        padding-left: 10px;
        border: 1px solid #ddd;
        li {
            flex: 1;
            &:nth-child(1) {
                flex: none;
                padding-top: 10px;
                width: 180px;
                border-right: 1px solid #ddd;
            }
            &:last-child {
                border: none;
            }
        }
    }
    .loading-spin {
        width: 100%;
        height: 100%;
        position: absolute;
        top: 0;
        left: 0;
        background-color: rgba(0, 0, 0, 0.25);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10;
    }
    .flex-ul-title {
        background-color: #f2f7f7;
        font-weight: bold;
    }
    .flex-ul-content {
        overflow: auto;
        max-height: calc(100vh - 300px);
        overflow: auto;
        .flex-ul {
            display: flex;
            padding-left: 10px;
            border: 1px solid #ddd;
            border-top: none;
            li {
                border-right: 1px solid #ddd;

                flex: 1;
                &:nth-child(1) {
                    flex: none;
                    padding-top: 10px;
                    width: 180px;
                }
                &:last-child {
                    border: none;
                }
            }
        }
    }

    .flex-ul-li {
        display: flex;
        align-items: stretch;
        p {
            flex: 1;
            border-bottom: 1px solid #ddd;
            padding: 10px 10px;
            &:nth-child(1) {
                border-right: 1px solid #ddd;
            }
            &:last-child {
                flex: none;
                width: 100px;
            }
            &.flex-link,
            span {
                color: #036b64;
                cursor: pointer;

                .repalce-btn {
                    margin-left: 10px;
                }
            }
        }
        &:last-child {
            p {
                border-bottom: none;
            }
        }
    }
</style>
