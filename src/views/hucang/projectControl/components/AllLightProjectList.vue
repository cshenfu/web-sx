<template>
    <div class="user-list">
        <project-list-search-bar
            :componentType="'light'"
            ref="lightProjectListRef"
            @handleSearch="handleSearch"
            @resetSearch="resetSearch"
        />
        <table-list
            class="user-table"
            :loading="loading"
            :tableData="tableData"
            :tableColumn="LIGHT_TABLE_LIST_CLOUMN"
            :page="page"
            @changePage="changePage"
        >
            <template #projectCode="{ record }">
                <a-popover overlay-class-name="name-popover-self">
                    <template #content>
                        {{ record.id }}
                    </template>
                    <div class="ellipsis-text-name">{{ record.projectCode }}</div>
                </a-popover>
            </template>
            <template #provinceName="{ record }">
                <span v-if="record.provinceName">{{ record.provinceName }}</span>
                <span v-if="record.cityName">{{ '/' + record.cityName }}</span>
                <span v-if="record.districtName">{{ '/' + record.districtName }}</span>
            </template>
            <template #projectStatus="{ record }">
                <div v-if="record.projectStatus == 7" class="status-content">
                    <div class="status-tag pending-icon">完成待审核</div>
                </div>
                <div class="status-tag finish-icon" v-if="record.projectStatus == 5">异常暂停</div>
                <div class="status-tag stop-icon" v-if="record.projectStatus == 6">已终止</div>
                <div class="status-tag bind-icon" v-if="record.projectStatus == 3">排队中</div>
                <div class="status-tag bind-icon" v-if="record.projectStatus == 2">初始化</div>
                <div class="status-tag bind-icon" v-if="record.projectStatus == 8">文件待解析</div>
                <div class="status-tag" v-if="record.projectStatus == 1">草稿</div>
                <div
                    class="status-tag has-bind-icon"
                    @click.stop="showProjectProcess(record)"
                    v-if="record.projectStatus == 4"
                    >计算中</div
                >
                <div v-if="record.projectStatus == 9" class="status-content">
                    <div class="status-tag pending-icon">计算完成</div>
                </div>
            </template>
            <template #projectNode="{ record }">
                <div>{{ record.projectNode }}</div>
                <span v-if="!record.projectNode">--</span>
            </template>
            <template #totalProjectCapacity="{ record }">
                <div
                    >{{ record.totalProjectCapacity ? record.totalProjectCapacity : '--' }} /
                    {{ record.currentProjectCapacity ? record.currentProjectCapacity : '--' }}</div
                >
            </template>
            <template #reason="{ record }">
                <a-popover overlay-class-name="name-popover-self">
                    <template #content>
                        {{ record.reason }}
                    </template>
                    <div class="ellipsis-text-name">{{ record.reason }}</div>
                </a-popover>
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
            <template #finishTime="{ record }">
                <div
                    >{{
                        record.finishTime
                            ? dayjs(record.finishTime).format('YYYY-MM-DD HH:mm:ss')
                            : '--'
                    }}
                </div>
            </template>
            <template #operation="{ record }">
                <div class="operation-btn">
                    <template
                        v-if="
                            record.projectStatus == 3 ||
                            record.projectStatus == 4 ||
                            record.projectStatus == 8
                        "
                    >
                        <!-- <span class="operation-btn-item" @click.stop="terminate(record)">终止计算</span>
                        <span class="operation-btn-item" @click.stop="pauseFn(record)">暂停计算</span>
                        <span class="operation-btn-item" v-if="record.projectStatus == 3" @click.stop="changeSort(record)">调整队列</span> -->
                    </template>
                    <template v-if="record.projectStatus == 5">
                        <!-- <span class="operation-btn-item" @click.stop="terminate(record)">终止计算</span>
                        <span class="operation-btn-item" @click.stop="restart(record)">重启计算</span> -->
                    </template>
                    <template v-if="record.projectStatus == 6">
                        <span class="operation-btn-item" @click.stop="del(record)">项目删除</span>
                    </template>
                    <template v-if="record.projectStatus == 7 || record.projectStatus == 9">
                        <span
                            class="operation-btn-item"
                            v-if="record.projectStatus == 7"
                            @click.stop="checkFile(record)"
                            >审核通过</span
                        >
                        <span class="operation-btn-item" @click.stop="download(record, 1)"
                            >word下载</span
                        >
                        <span class="operation-btn-item" @click.stop="download(record, 2)"
                            >PDF下载</span
                        >
                        <span class="operation-btn-item" @click.stop="del(record)">项目删除</span>
                    </template>
                    <span class="operation-btn-item" @click.stop="getRowData(record)"
                        >查看详情</span
                    >
                    <span
                        v-if="record.itemType == 11"
                        class="operation-btn-item"
                        @click.stop="uploadGeoFile(record)"
                        >上传地形图</span
                    >
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
        <a-modal
            ref="modalRef"
            v-model:open="visibleDownloadModal"
            :wrap-style="{ overflow: 'hidden' }"
            width="800px"
            :footer="null"
        >
            <template #title>
                <div ref="modalTitleRef" style="width: 100%">资源下载</div>
            </template>
            <ul class="flex-ul flex-ul-title">
                <li>文件类型</li>
                <li class="flex-ul-li">
                    <p>文件名称</p>
                    <p>操作</p>
                </li>
            </ul>
            <div class="flex-ul-content">
                <ul class="flex-ul" v-for="list in downloadModalList">
                    <li>{{ list.fileClassifyDesc }}</li>
                    <li>
                        <div class="flex-ul-li" v-for="listItem in list.list">
                            <p>{{ listItem.fileName }}</p>
                            <p class="flex-link" @click="downLoadFile(listItem.filePath)">下载</p>
                        </div>
                    </li>
                </ul>
            </div>
        </a-modal>
        <!-- 上传地形图 -->
        <a-modal
            ref="modalRef"
            v-model:open="visibleUploadModal"
            :wrap-style="{ overflow: 'hidden' }"
            width="500px"
            :footer="null"
        >
            <template #title>
                <div ref="modalTitleRef" style="width: 100%">地形图</div>
            </template>
            <Upload
                :defaultFiles="uploadGeoFiles"
                :fileTypes="'dwg,dxf'"
                :fileSize="500"
                :maxCount="1"
                fileTypeMessage="目前支持 JPG、PNG、PDF格式"
                fileSizeMessage="文件最大50M"
                @upFileList="getUploadGeoFile"
                :isImmediatelyUpload="false"
            >
                <template #tip>
                    <div class="tip"
                        >DWG、DXF格式<br />
                        上限1个，单个文件最大500M
                    </div>
                </template>
            </Upload>
        </a-modal>
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
        createVNode,
    } from 'vue';
    import ProjectListSearchBar from './LightProjectListSearchBar.vue';
    import TableList from '@/components/tableList/TableList.vue';
    import TipsModal from '@/components/tipsDialog/TipsModal.vue';
    import { LIGHT_TABLE_LIST_CLOUMN } from '../projectList.js';
    import { message, Modal } from 'ant-design-vue';
    import { useRouter } from 'vue-router';
    import dayjs from 'dayjs';
    import {
        restartProject,
        continueProject,
        stopProject,
        updateQueue,
        downloadReportFile,
    } from '@/api/modules/projectManage';
    import {
        getLightProject,
        auditLightProject,
        deleteLightProject,
        uploadPvProjectGeoFile,
    } from '@/api/modules/lightProject/project';
    import { getTempDownloadUrl } from '@/api/modules/public';
    import Upload from '@/components/upload/Upload.vue';
    const props = defineProps({
        activeKey: {
            type: Number,
            default: 1,
        },
    });

    const loading = ref(false);
    const router = useRouter();
    const lightProjectListRef = ref();
    const visibleDownloadModal = ref(false);
    const visibleUploadModal = ref(false);
    const uploadGeoFiles = ref([]);

    const downloadModalList = ref({});
    const page = ref({
        pageNo: 1,
        pageSize: 10,
        total: 0,
    });
    let tableData = ref([]);

    // 按钮操作
    const currentClickData = ref({});
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
        let { node, companyName, projectName, itemType, projectCode, selectDraft } = { ...val };
        getLightProject({
            itemType,
            node,
            companyName,
            projectName,
            projectCode,
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
            page.value.pageNo = 1;
            getTableData(lightProjectListRef.value.searchKey);
        },
        {},
    );
    // 表格
    const getRowData = (row) => {
        sessionStorage.setItem('currentProject', JSON.stringify(row));
        router.push({
            path: '/projectControl/light/detail',
            query: {
                id: row.id,
            },
        });
    };
    // 获取页面分页
    const changePage = (val) => {
        page.value.pageNo = val.page;
        page.value.pageSize = val.pageSize;
        getTableData(lightProjectListRef.value.searchKey);
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
                getTableData(lightProjectListRef.value.searchKey);
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
    // word下载
    const download = (val, type) => {
        if (type == 1) {
            // val.reportObjectKey && window.open(val.reportObjectKey);
            val.reportObjectKey && downLoadOrigin(val.reportObjectKey);
        } else if (type == 2) {
            // val.pdfReportObjectKey && window.open(val.pdfReportObjectKey);
            val.pdfReportObjectKey && downLoadOrigin(val.pdfReportObjectKey);
        } else if (type == 3) {
            // 资源下载显示弹窗
            downloadReportEvent(val);
        }
    };
    const formatReportFiles = (data) => {
        if (!data || data.length == 0) {
            return {};
        } else {
            const formatJson = {};
            data.forEach((item) => {
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
                getTableData(lightProjectListRef.value.searchKey);
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
                getTableData(lightProjectListRef.value.searchKey);
            }
        });
    };
    // 提交暂停计算
    const submitPauseFn = () => {
        console.log('暂停计算');
    };
    // 提交删除项目
    const submitDelProject = () => {
        deleteLightProject(currentSelectData.value.id).then((res) => {
            if (res.code == 200) {
                message.success('删除成功');
                getTableData(lightProjectListRef.value.searchKey);
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
                    // console.log('错误', error);
                });
        } else {
            openTipsProjectModal.value = !openTipsProjectModal.value;
            changeSortFormRef.value.resetFields();
        }
    };
    // 审核完成
    const checkFile = async (record) => {
        try {
            let res = await auditLightProject(record.id);
            if (res.data) {
                message.success('审核通过');
                getTableData(lightProjectListRef.value.searchKey);
            }
        } catch (err) {
            // console.log('----',err);
        }
    };
    // 显示项目计算进度
    const showProjectProcess = (record) => {
        router.push({
            path: '/projectContro/progress',
        });
    };
    const downLoadOrigin = async (path) => {
        if (!path) {
            return;
        }
        let data = `objectKey=${path}`;
        try {
            let res = await getTempDownloadUrl(data);
            if (res.code === 200 && res.data) {
                window.open(res.data, '_blank');
            }
        } catch (err) {}
    };
    // 下载文件
    const downLoadFile = async (path) => {
        window.open(path);
    };
    // 上传地形图显示弹窗
    const uploadGeoFile = (row) => {
        uploadGeoFiles.value = [];
        currentSelectData.value = row;
        visibleUploadModal.value = true;
    };
    // 获取上传完的地形图文件
    const getUploadGeoFile = async (file) => {
        console.log(file, '文件', file.file);
        uploadGeoFiles.value = [file];
        console.log(uploadGeoFiles.value);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('projectId', currentSelectData.value['id']);
        const result = await uploadPvProjectGeoFile(formData);
        if (result.code == 200) {
            message.success('上传成功');
            cancelGeoFileModal();
        } else {
            message.error('上传失败');
        }
    };
    const cancelGeoFileModal = () => {
        uploadGeoFiles.value = [];
        visibleUploadModal.value = false;
    };
    const submitGeoFileModal = async () => {
        const formData = new FormData();
        formData.append('file', uploadGeoFiles.value[0]);
        formData.append('projectId', currentSelectData.value['id']);
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
        // Modal.confirm({
        //     title: '操作提示',
        //     icon: createVNode(ExclamationCircleOutlined),
        //     content: '是否要删除当前项目?',
        //     okText: '确定',
        //     okType: 'danger',
        //     cancelText: '取消',
        //     onOk() {
        //         deleteLightProject(val.id).then(res => {
        //             if (res.code == 200) {
        //                 message.success('删除成功');
        //                 getTableData(lightProjectListRef.value.searchKey);
        //             }
        //         })
        //     },
        //     onCancel() {
        //         console.log('Cancel');
        //     },
        // });
    };
    onBeforeMount(() => {});
    onMounted(() => {
        getTableData(lightProjectListRef.value.searchKey);
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
            &.flex-link {
                color: #036b64;
                cursor: pointer;
            }
        }
        &:last-child {
            p {
                border-bottom: none;
            }
        }
    }
    .tip {
        font-size: 12px;
    }
</style>
