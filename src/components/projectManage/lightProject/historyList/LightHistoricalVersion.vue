<template>
    <div class="project-list history-list">
        <div class="my-project-header">
            <span class="static-title" @click="goBackList">一键光伏可研 / </span>
            <span class="auto-title">{{ projectTitle }}</span>
        </div>
        <table-list
            class="project-table"
            :loading="loading"
            :tableData="dataList"
            :tableColumn="HISTORY_TABLE_LIST_CLOUMN"
            :page="page"
            @changePage="changePage"
        >
            <template #areaCode="record">
                <template v-if="record.provinceName">{{ record.provinceName }}/</template>
                    <template v-if="record.cityName">{{ record.cityName }}/</template>
                    <template v-else>--</template>
                    <template v-if="record.districtName">{{ record.districtName }}</template>
                <!-- <div>{{ record.areaName }}</div> -->
            </template>
            <template #projectStatus="record">
                <!-- 状态为1的草稿数据 -->
                <div class="status-tag default-icon" v-if="record.projectStatus == 1">{{
                    getProjectState(record.projectStatus)
                }}</div>
                <!-- 计算中（包含： 初始化、计算中、文件待解析、计算完成） -->
                <div
                    v-if="record.projectStatus == 3"
                    class="status-content"
                    @click.stop="goToResult(record)"
                >
                    <div class="status-tag compute-icon">计算中</div>
                    <div class="long-time">( 预计还剩 {{ record.unDoneHours }} 个小时 )</div>
                </div>
                <!-- 排队中 -->
                <div
                    v-if="record.projectStatus == 2"
                    class="status-tag pending-icon status-content"
                    @click.stop="goToResult(record)"
                >
                    排队中
                </div>
                <!-- 计算终止（包含：异常暂停、计算终止） -->
                <div style="display: flex;align-items:center" v-if="record.projectStatus == 4">
                    <div class="status-content status-tag error-icon" @click.stop="goToResult(record)" style="margin-right: 8px;">
                        计算终止
                    </div>
                    <a-popover placement="topRight" v-if="record.reason">
                        <template #content>
                            <p class="error-reason">{{ record.reason }}</p>
                        </template>
                        <iconpark-icon name="bangzhu" style="color: #0389EA;"></iconpark-icon>
                    </a-popover>
                </div>
                <!-- 审核计算已完成 -->
                <div
                    class="status-tag finish-icon status-content"
                    v-if="record.projectStatus == 5"
                    @click.stop="goToResult(record)"
                    >{{ getProjectState(record.projectStatus) }}</div
                >
            </template>
            <template #capacity="record">
                <div>{{ record.totalProjectCapacity }} / {{ record.currentProjectCapacity }}</div>
            </template>
            <template #totalInvestmentAmount="record">
                <div>{{ record.totalInvestmentAmount }}</div>
                <span v-if="!record.totalInvestmentAmount">--</span>
            </template>
            <template #fundingRatio="record">
                <div>{{ record.fundingRatio }}</div>
                <span v-if="!record.fundingRatio">--</span>
            </template>
            <template #internalRateReturnAfterTax="record">
                <!-- <div>{{ record.internalRateReturnAfterTax }}</div>
                <span v-if="!record.internalRateReturnAfterTax">--</span> -->
                <div>{{ record.internalRateReturnBeforeTax }}</div>
                <span v-if="!record.internalRateReturnBeforeTax">--</span>
            </template>
            <template #internalRateReturnBeforeTax="record">
                <!-- <div>{{ record.internalRateReturnBeforeTax }}</div>
                <span v-if="!record.internalRateReturnBeforeTax">--</span> -->
                <div>{{ record.internalRateReturnAfterTax }}</div>
                <span v-if="!record.internalRateReturnAfterTax">--</span>
            </template>
            <template #yieldRate="record">
                <div>{{ record.yieldRate }}</div>
                <span v-if="!record.yieldRate">--</span>
            </template>
            <template #version="record">
                <div>
                    <span v-if="!record.version">--</span>
                    <div v-else>
                        <span v-if="record.version.length <= 10"> {{ record.version }}</span>
                        <a-popover title="" v-else>
                            <template #content>
                                <p>{{ record.version }}</p>
                            </template>
                            <span> {{ record.version.slice(0, 10) }} …</span>
                        </a-popover>
                    </div>
                </div>
            </template>
            <template #createTime="record">
                <div>{{
                    record.createTime ? dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss') : ''
                }}</div>
            </template>
            <template #installedCapacity="record">
                <div>{{record.installedCapacity? record.installedCapacity: '--'}}</div>
            </template>
            <template #deviceCapacity="record">
                <div>{{record.deviceCapacity? record.deviceCapacity: '--'}} / {{ record.deviceNum?record.deviceNum: '--' }}</div>
            </template>
            <template #yearPower="record">
                <div>{{record.yearPower? record.yearPower: '--'}}</div>
            </template>
            <template #fullLoadHours="record">
                <div>{{record.fullLoadHours? record.fullLoadHours: '--'}}</div>
            </template>
            <template #correctionCoefficient="record">
                <div>{{record.correctionCoefficient? record.correctionCoefficient: '--'}}</div>
            </template>
            <template #firstYearPower="record">
                <div>{{ record.firstYearPower ? record.firstYearPower : '--' }}</div>
            </template>
            <template #operation="record">
                <div
                    class="operation-btn"
                    v-if="record.projectStatus == 4 || record.projectStatus == 5"
                >
                    <span
                        class="operation-btn-item"
                        v-softDog="{ callback: checkFile, params: record, packageType:PACKAGE_TYPE.default}"
                        v-if="record.projectStatus == 5"
                        >预览</span
                    >
                    <span
                        class="operation-btn-item"
                        v-softDog="{ callback: downloadFile, params: record, packageType:PACKAGE_TYPE.default}"
                        v-if="record.projectStatus == 5"
                        >下载</span
                    >
                    <span
                        class="operation-btn-item"
                        v-softDog="{ callback: handleChangeFile, params: record, packageType:PACKAGE_TYPE.default}"
                        >调整</span
                    >
                    <span
                        class="operation-btn-item"
                        v-softDog="{ callback: handleDeleteFile, params: record, packageType:PACKAGE_TYPE.default}"
                        v-if="record.projectStatus !== 5"
                    >
                        删除
                    </span>
                    <DropDownList class="operation-btn-item" v-if="record.projectStatus == 5">
                        <template #dropDownContent>
                            <ul class="operation-btn-more">
                                <li class="operation-btn-more-li" @click="showModalEvent">
                                    资质盖章
                                </li>
                                <li
                                    class="operation-btn-more-li"
                                    v-softDog="{ callback: handleChangeAllFile, params: record, packageType:PACKAGE_TYPE.default}"
                                    >一键优化</li
                                >
                                <li
                                    class="operation-btn-more-li"
                                    v-softDog="{ callback: printFile, params: record, packageType:PACKAGE_TYPE.default }"
                                    >打印</li
                                >
                                <li
                                    class="operation-btn-more-li"
                                    v-softDog="{ callback: handleDeleteFile, params: record }"
                                    >删除</li
                                >
                            </ul>
                        </template>
                    </DropDownList>
                </div>
            </template>
        </table-list>
        <!-- 删除项目 -->
        <delete-modal-project ref="openDeleteModalRef" msg="确定删除此项目及所有历史版本么？删除后不可恢复" @updateList="getUpdateList"
            v-if="openDeleteModal">
        </delete-modal-project>
        <!-- 一键优化 -->
        <optimization-modal ref="openTuningModalRef" v-if="openTuningModal" @updateList="getUpdateList"></optimization-modal>
        <projectPackage
            :TipsDialogVisible="TipsDialogVisible"
            :messageType="messageType"
            @changeShowKey="TipsDialogVisible = false"
        ></projectPackage>
    </div>
</template>

<script setup>
    import { ref, reactive, toRefs, onBeforeMount, onMounted, watchEffect, computed, h, nextTick } from 'vue';
    import TableList from '@/components/tableList/TableList.vue';
    import DropDownList from '@/components/tableList/components/DropDownList.vue';
    import DeleteModalProject from '../../components/DeleteModalProject.vue';
    import OptimizationModal from  '../../components/OptimizationModal.vue';
    import {
        HISTORY_TABLE_LIST_CLOUMN,
        getAreaData,
        removeEmpty,
        getProjectState,
        applyConditionalStatus,
    } from '../project';
    import { checkPackageEffective } from '@/api/modules/reportIndex.js';
    import { message, Modal } from 'ant-design-vue';
    import { useRouter, useRoute } from 'vue-router';
    import printJS from 'print-js';
    import {
        getHistoryList,
        detaleProject,
        optimize,
        getYieldByProjectId,
        saveYieldByProjectId,
    } from '@/api/modules/project';
    import dayjs from 'dayjs';
    import {PACKAGE_TYPE,} from '@/assets/js/static.js';
    import projectPackage from '@/components/projectPackage/projectPackage.vue';
    import {useOssUpload} from '@/components/ossClient/modifytUpload.js';
    import { useProjectHandle } from '../useProject.js';
    import {postLog} from '@/api/modules/userLog.js';
    import {getProjectListIsCheck} from '@/api/modules/home.js';
    import usePublicDataStore from '@/pinia/modules/public';
    const publicDataStore = usePublicDataStore()
    const ossUpload = useOssUpload();
    const router = useRouter();
    const route = useRoute();
    const messageType = ref(4);
    const TipsDialogVisible = ref(false);
    const projectTitle = route.query.projectTitle;
    // 一键优化变量
    const tuningTips = ref(null);
    let validateCheckAdjusting = async (_rule, value) => {
        if (!value && value !== 0) {
            return Promise.reject('请输入项目收益');
        } else {
            // 检查
            if (tuningTips.value) {
                if (
                    Number(value) > tuningTips.value.maxYield ||
                    Number(value) < tuningTips.value.minYield
                ) {
                    return Promise.reject(
                        `收益率值需在${tuningTips.value.minYield}%~${tuningTips.value.maxYield}%范围内，请重新合理调整～`,
                    );
                } else if (Number(value) == tuningTips.value.nowYield) {
                    return Promise.reject('输入收益率值与原收益率值相同，请重新合理调整～');
                } else {
                    return Promise.resolve();
                }
            } else {
                return Promise.resolve();
            }
        }
    };
    const rules = {
        optimizeIncome: [
            { required: true, max: 100, trigger: ['blur'], validator: validateCheckAdjusting },
        ],
    };
    let areaCodeOptions = ref([]);
    const searchKey = reactive({
        areaCode: [],
        projectStatus: null,
        minCurrentProjectCapacity: '',
        maxCurrentProjectCapacity: '',
        dataTime: [],
        projectName: '',
    });
    const chooseListDetil = ref({});
    const isSelectOpen = ref({
        first: false,
        second: false,
    });
    const isActive = ref(false);
    const isFocus = ref(false);
    const blur = () => {
        isActive.value = false;
        isFocus.value = false;
    };
    const dataList = ref([]);
    const page = ref({
        pageNo: 1,
        pageSize: 10,
        totalNum: 0,
    });
    const dateFormat = 'YYYY-MM-DD HH:mm:ss';
    const loading = ref(false);
    // 搜索
    const handleSearchData = (val) => {
        page.value.pageNo = 1;
        initData();
    };
    const handleSearch = (val) => {
        page.value.pageNo = val;
        initData();
    };
    // 初始化数据
    const initData = () => {
        dataList.value = [];
        loading.value = true;
        let searchData = {
            projectId: route.query.id,
            provinceCode: searchKey.areaCode?.length > 0 ? searchKey.areaCode[0] : '',
            cityCode: searchKey.areaCode?.length > 0 ? searchKey.areaCode[1] : '',
            countyCode: searchKey.areaCode?.length > 0 ? searchKey.areaCode[2] : '',
            projectStatus: searchKey.projectStatus,
            minCurrentProjectCapacity: searchKey.minCurrentProjectCapacity,
            maxCurrentProjectCapacity: searchKey.maxCurrentProjectCapacity,
            startTime: searchKey.dataTime?.length > 0 ? searchKey.dataTime[0] : '',
            endTime: searchKey.dataTime?.length > 0 ? searchKey.dataTime[1] : '',
            projectName: searchKey.projectName,
            pageNo: page.value.pageNo,
            pageSize: page.value.pageSize,
            
        };
        searchData.itemType = PACKAGE_TYPE.default
        let data = removeEmpty(searchData);
        const fieldsToCheck = [
            'installedCapacity',
            'deviceCapacity',
            'deviceNum',
            'yearPower',
            'fullLoadHours',
            'correctionCoefficient',
            'totalInvestmentAmount',
            'fundingRatio',
            'internalRateReturnAfterTax',
            'internalRateReturnBeforeTax'
        ];
        getHistoryList(data).then((res) => {
            dataList.value = res.data?.list?.map((item) => {
                item.areaName = item.provinceName? `${item.provinceName}/${item.cityName}/${item.districtName}` : '--';
                return applyConditionalStatus(item, fieldsToCheck, item.projectStatus == 5)
            });
            page.value.totalNum = res.data?.total;
            loading.value = false;
        });
    };
    // 预览文件
    const checkFile = (file) => {
        chooseListDetil.value = file;
        // 用户行为日志--预览报告
        gtag('event', 'report_preview', {
            user_info_id: sessionStorage.getItem('userId'),
            project_info_id: file.id,
        });
        // 用户行为日志--预览报告（给后端记录）
        postLog({type: 1});
        if (!file.pdfReportObjectKey) {
            message.error('暂无生成报告');
            return;
        }
        sessionStorage.setItem('pdfReportObjectKey', file.pdfReportObjectKey || '');
        window.open(location.origin + '/pdfPreview');
    };
    // 下载
    const downloadFile = async(file) => {
        let { checkPackage } = await useProjectHandle();
        // 用户行为日志--下载报告
        gtag('event', 'report_download', {
            user_info_id: sessionStorage.getItem('userId'),
            project_info_id: file.id
        });
        // 用户行为日志--下载报告（给后端记录）
        postLog({type: 3});
        if (!file.pdfReportObjectKey) {
            message.error('暂无生成报告');
            return;
        }
        // 试用用户无法使用下载功能
        checkPackage(1).then((res) => {
            if (res.isEffective) {
                file.pdfReportObjectKey &&
                ossUpload.getFileUrl(file.pdfReportObjectKey).then((res) => {
                    window.open(res);
                });
            }
        })
    }
    // 资质盖章
    const showModalEvent = () => {
        // 资质盖章服务弹出提示
        Modal.info({
                width: 400,
                title: '资质盖章',
                icon: null,
                autoFocusButton: null,
                content: h(
                    'div',
                    {
                        class: 'softdog-modal-content',
                    },
                    [
                        h('p', '如需资质盖章服务可联系平台客服'),
                        h(
                            'p',
                            {
                                class: 'softdog-modal-description',
                            },
                            [
                                '',
                                h('div', [
                                    '平台客服：',
                                    h(
                                        'span',
                                        {
                                            class: 'self-bar',
                                        },
                                        '155-6259-8617',
                                    ),
                                ]),
                            ],
                        ),
                    ],
                ),
            });
    }
    // 打印
    const printFile = async (file) => {
        let { checkPackage } = await useProjectHandle();
        chooseListDetil.value = file;
        // 用户行为日志--打印报告
        gtag('event', 'report_print', {
            user_info_id: sessionStorage.getItem('userId'),
            project_info_id: file.id,
        });
        // 用户行为日志--打印报告（给后端记录）
        postLog({type: 2});
        if (!file.pdfReportObjectKey) {
            message.error('暂无生成报告');
            return;
        }
        // 试用用户无法使用下载功能
        checkPackage(1).then((res) => {
            if (res.isEffective) {
                ossUpload.getFileUrl(file.pdfReportObjectKey).then((res) => {
                printJS({
                    // printable:
                    //     'https://test-dt.obs.cn-east-3.myhuaweicloud.com/c1/Final-%E5%8D%97%E5%B1%B1%E5%BE%AE%E8%AF%BE%E9%A1%B9%E7%9B%AE%E6%96%B0%E9%97%BB%E7%A8%BF-1211.pdf',
                    printable: res,
                    type: 'pdf',
                    header: null,
                    showModal: true,
                    modalMessage: '打印加载中，请稍后...',
                    targetStyles: ['*'],
                    style: '@page {margin:0 10mm}',
                    onLoadingEnd: function () {
                        console.log('打印加载完成');
                    },
                });
            });
            }
        })  
    };
    // 调整
    const handleChangeFile = async(file) => {
        // 用户行为日志--调整
        gtag('event', 'adjust_project', {
            user_info_id: sessionStorage.getItem('userId'),
            project_info_id: file.id,
        });
        // 验证此项目是否可以调整
        const res = await getProjectListIsCheck(file.id);
        if (res.code !== 200 || !res.data) {
            message.warning('目前存在该项目其他版本计算，暂不能调整');
            return false;
        }
        let { checkPackage } = await useProjectHandle();
        checkPackage(1).then((res) => {
            if (res.isEffective) {
                sessionStorage.setItem('projectID', file.id);
                router.push({
                    path: publicDataStore.headActiveKey == 'light' ? '/light/create' : '/weatherAI/create',
                    query: {
                        type: 'edit',
                    },
                });
            }
        });
    };
    // 一键优化--打开弹窗
    const openTuningModal = ref(false);
    const openTuningModalRef = ref(null)
    const handleChangeAllFile = (file) => {
        // 用户行为日志--项目一键优化
        gtag('event', 'optimize_project', {
            user_info_id: sessionStorage.getItem('userId'),
            project_info_id: file.id,
        });
        openTuningModal.value = true;
        nextTick(()=> {
            openTuningModalRef.value.openTuningModalFn(file)
        })
    };
    // 删除
    const openDeleteModal = ref(false)
    const openDeleteModalRef = ref(null)
    const handleDeleteFile = (file) => {
        // 用户行为日志--项目删除
        gtag('event', 'delete_project', {
            user_info_id: sessionStorage.getItem('userId'),
            project_info_id: file.id,
        });
        openDeleteModal.value = true;
        nextTick(() => {
            openDeleteModalRef.value.openDeleteModalFn(file)
        })
    };
    // 弹窗操作之后更新列表
    const getUpdateList = (val) => {
        openDeleteModal.value = false;
        openTuningModal.value = false;
        if (val) {
            initData()
        }
    }
    // 获取页面分页
    const changePage = (val) => {
        let { pageNo, pageSize } = val;
        page.value.pageNo = pageNo;
        page.value.pageSize = pageSize;
        handleSearch(pageNo);
    };
    const goToResult = (record) => {
        sessionStorage.setItem('projectID', record.id);
        router.push({
            path: '/reportResult',
        });
    };
    const goBackList = () => {
        router.go(-1);
    };

    onBeforeMount(() => {
        getAreaData().then((res) => {
            areaCodeOptions.value = res.subList;
            initData();
        });
    });
    onMounted(() => {
        //console.log('3.-组件挂载到页面之后执行-------onMounted')
    });
</script>
<style scoped lang="scss">
    @import '../../project.scss';
    @import './historyList.scss';
    .project-table {
        margin-top: 0;
    }
    .my-project-list {
        .my-project-list-search {
            display: flex;
            align-items: flex-start;
        }
        padding: 0 25px;
    }
    .error-reason {
        display: inline-block;
        max-width: 200px;
        word-break: break-all;
    }
</style>
