<template>
    <div class="my-project-list">
        <h3 v-if="fromTypeTitle">{{ fromTypeTitle }}项目</h3>
        <project-search-bar
            v-if="showTable"
            ref="projectSearchBarRef"
            @search="handleSearch"
        ></project-search-bar>
        <table-list
            v-if="showTable"
            class="project-table"
            id="projectTable"
            :loading="loading"
            :tableData="dataList"
            :tableColumn="tableColumn[route.query.fromType] || MY_TABLE_LIST_CLOUMN"
            :page="page"
            :height="windowHeight - 300"
            @changePage="changePage"
        >
            <!-- DRAFT(1, "草稿", List.of(1)),
        QUEUE(2, "排队中", List.of(2，3，8)),
        ING(3, "计算中", List.of(4, 7)),
        STOP(4, "计算终止", List.of(5, 6)),
        FINISH(5, "已完成", List.of(9)); -->
            <template #projectStatus="record">
                <!-- 状态为1的草稿数据 -->
                <div class="status-tag default-icon" v-if="record.projectStatus == 1">草稿</div>
                <!-- 计算中（包含： 初始化、计算中、文件待解析、计算完成） -->
                <div
                    v-if="record.projectStatus == 3"
                    class="status-content"
                    @click.stop="goToResult(record)"
                >
                    <div class="status-tag compute-icon">计算中</div>
                    <!-- <div class="long-time">( 预计还剩 {{ record.unDoneHours || 0.8 }} 个小时 )</div> -->
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
                <div style="display: flex; align-items: center" v-if="record.projectStatus == 4">
                    <div
                        class="status-content status-tag error-icon"
                        @click.stop="goToResult(record)"
                        style="margin-right: 8px"
                    >
                        计算终止
                    </div>
                    <a-popover placement="topRight" v-if="record.reason">
                        <template #content>
                            <p class="error-reason">{{ record.reason }}</p>
                        </template>
                        <iconpark-icon
                            name="bangzhu"
                            class="reason-icon"
                            style="cursor: pointer"
                        ></iconpark-icon>
                    </a-popover>
                </div>
                <!-- 审核计算已完成 -->
                <div
                    class="status-tag finish-icon status-content"
                    v-if="record.projectStatus == 5"
                    @click.stop="goToResult(record)"
                    >已完成</div
                >
            </template>
            <template #projectName="record">
                <a-popover overlay-class-name="name-popover-self">
                    <template #content>
                        {{ record.projectName }}
                    </template>
                    <div class="ellipsis-text-name">{{ record.projectName }}</div>
                </a-popover>
            </template>
            <template #itemType="record">
                {{ getProjectTypeLabel(record.itemType) }}
            </template>
            <template #areaCode="record">
                <template v-if="record.provinceName">{{ record.provinceName }}/</template>
                <template v-if="record.cityName">{{ record.cityName }}/</template>
                <template v-else>--</template>
                <template v-if="record.districtName">{{ record.districtName }}</template>
                <!-- <div>{{ record.areaName }}</div> -->
            </template>
            <template #createTime="record">
                <div>{{
                    record.createTime
                        ? dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss')
                        : '--'
                }}</div>
            </template>
            <template #operation="record">
                <!-- 只有审核计算完成、计算终止状态才显示按钮 -->
                <div
                    class="operation-btn"
                    v-if="record.projectStatus == 5 || record.projectStatus == 4"
                >
                    <span class="operation-btn-item" @click="goToProjectDetail(record)">
                        查看
                    </span>
                    <template v-if="route.query.fromType == 'roadPlan'">
                        <span
                            class="operation-btn-item"
                            @click="goToRoadPlanResult(record)"
                            v-if="record.projectStatus == 5"
                        >
                            查看结果
                        </span>
                        <span
                            class="operation-btn-item"
                            v-softDog="{
                                callback: goToAdjust,
                                params: record,
                                packageType: PACKAGE_TYPE_TT[route.query.fromType],
                            }"
                        >
                            调整
                        </span>
                    </template>
                    <span
                        class="operation-btn-item"
                        v-softDog="{
                            callback: handleDeleteFile,
                            params: record,
                            packageType: props.itemType,
                        }"
                        v-if="record.projectStatus !== 5"
                    >
                        删除
                    </span>
                </div>
            </template>
        </table-list>
        <div v-if="!showTable" class="empty-img-wrap">
            <img src="@/assets/img/index/empty-home.png" class="empty-img" alt="" />
            <p style="margin-bottom: 16px;">您最近暂无创建项目</p>
            <a-button type="primary" @click="goJumpCreate">前去创建</a-button>
        </div>
        <!-- 删除项目 -->
        <delete-modal-project
            ref="openDeleteModalRef"
            msg="确定删除此项目及所有历史版本么？删除后不可恢复"
            @updateList="getUpdateList"
            v-if="openDeleteModal"
        >
        </delete-modal-project>
        <projectPackage
            :TipsDialogVisible="TipsDialogVisible"
            :messageType="messageType"
            @changeShowKey="TipsDialogVisible = false"
        ></projectPackage>
    </div>
</template>

<script setup>
    import { ref, nextTick, onBeforeMount, onMounted, watch, computed, h } from 'vue';
    import ProjectSearchBar from './ProjectSearchBar.vue';
    import TableList from '@/components/tableList/TableList.vue';
    import DeleteModalProject from '../../components/DeleteModalProject.vue';
    import {
        MY_TABLE_LIST_CLOUMN,
        MY_TABLE_LIST_ROAD_CLOUMN,
        applyConditionalStatus,
    } from '../project';
    import { message, Modal } from 'ant-design-vue';
    import { useRouter, useRoute } from 'vue-router';
    import { PACKAGE_TYPE, PACKAGE_TYPE_TT, PACKAGE_TYPE_TT_LISTNAME } from '@/assets/js/static.js';
    import { checkPackageEffective } from '@/api/modules/reportIndex.js';
    import dayjs from 'dayjs';
    import { useProjectHandle } from '../useProject.js';
    import projectPackage from '@/components/projectPackage/projectPackage.vue';
    import { useOssUpload } from '@/components/ossClient/modifytUpload.js';
    import { postLog } from '@/api/modules/userLog.js';
    import { getProjectListIsCheck } from '@/api/modules/home.js';
    import usePublicDataStore from '@/pinia/modules/public';
    import { PROJECT_ITEMTYPE } from '../project';
    import { isWithinDateRange } from '@/utils/isWithinDateRange.js';
    const windowHeight = ref(window.innerHeight);
    const publicDataStore = usePublicDataStore();
    const ossUpload = useOssUpload();
    const props = defineProps({
        activeKey: {
            type: Number,
        },
        itemType: {
            type: Number,
            default: 0,
        },
    });
    const tableColumn = {
        roadPlan: MY_TABLE_LIST_ROAD_CLOUMN,
        anemometer: MY_TABLE_LIST_CLOUMN,
    };
    const projectSearchBarRef = ref(null);
    const emits = defineEmits([]);
    const router = useRouter();
    const route = useRoute();
    const fromTypeTitle = ref('');
    const TipsDialogVisible = ref(false);
    const messageType = ref(4);
    // 一键优化参数变量
    const tuningTips = ref(null);
    // 获取项目类型
    const getProjectTypeLabel = (type) => {
        const index = PROJECT_ITEMTYPE.findIndex((item) => item.value === type);
        if (index !== -1) {
            return PROJECT_ITEMTYPE[index].label;
        } else {
            return '--';
        }
    };
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
    const searchKey = ref({
        areaCode: [],
        projectStatus: null,
        minCurrentProjectCapacity: '',
        maxCurrentProjectCapacity: '',
        dataTime: [],
        projectName: '',
    });
    const searchCont = ref({});
    const chooseListDetil = ref({});
    const dataList = ref([]);
    const showTable = ref(false);
    const page = ref({
        pageNo: 1,
        pageSize: 10,
        totalNum: 0,
    });
    const loading = ref(true);
    // 搜索
    const handleSearch = (e) => {
        console.log(e, '搜索内容');
        searchCont.value = { ...e.searchKey };
        page.value.pageNo = e.page || 1;
        initData();
    };
    // 初始化数据
    const initData = async () => {
        dataList.value = [];
        let { initDataList } = await useProjectHandle();
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
            'internalRateReturnBeforeTax',
        ];
        await initDataList(searchCont.value, page, PACKAGE_TYPE_TT[route.query.fromType]).then(
            (res) => {
                dataList.value = res.dataLists.value.map((item) => {
                    return applyConditionalStatus(item, fieldsToCheck, item.projectStatus == 5);
                });
                page.value.totalNum = res.total.value;
                showTable.value = !!res.total.value;
                loading.value = res.loading.value;
            },
        );
    };
    // 查看项目
    const goToProjectDetail = (record) => {
        console.log(record, '查看项目');
        sessionStorage.setItem('projectId', record.id);
        sessionStorage.setItem('projectName', record.projectName);
        router.push({
            path: '/anemometer/project/result',
            query: {
                id: record.id,
            },
        });
    };
    // 道路规划查看结果
    const goToRoadPlanResult = (record) => {
        sessionStorage.setItem('projectId', record.id);
        sessionStorage.setItem('projectName', record.projectName);
        router.push({
            path: '/roadPlan/project/result',
            query: {
                id: record.id,
            },
        });
    };
    // 前去创建项目
    const goJumpCreate = async () => {
        if (await isWithinDateRange()) {
            return;
        }
        // 进入前验证用户服务是否失效，失效给出相应提示
        const params = {
            companyId: sessionStorage.getItem('userId'),
            itemType: PACKAGE_TYPE_TT[route.query.fromType] || 101, // 字符串类型 1风电可研 2AI找风资源
        };
        const data = await checkPackageEffective(
            params,
            PACKAGE_TYPE_TT[route.query.fromType] || 101,
        );
        if (data && data.code == 200) {
            sessionStorage.setItem('isInitiate', data.data.isInitiate);
            if (data.data.isInitiate) {
                router.push({
                    path: '/anemometer/home',
                    query: {
                        fromType: route.query.fromType,
                    },
                });
            } else {
                if (data.data.notInitiateType) {
                    messageType.value = data.data.notInitiateType;
                    TipsDialogVisible.value = true;
                }
            }
        }
    };
    // 调整
    const goToAdjust = async (record) => {
        if (await isWithinDateRange()) {
            return;
        }
        let { checkPackage } = await useProjectHandle();
        // 验证此项目是否可以调整
        const res = await getProjectListIsCheck(record.id);
        if (res.code !== 200 || !res.data) {
            message.warning('目前存在该项目其他版本计算，暂不能调整！');
            return false;
        }
        checkPackage(PACKAGE_TYPE_TT[route.query.fromType], true).then((res) => {
            if (res.isEffective) {
                sessionStorage.setItem('projectId', record.id);
                if (route.query.fromType === 'roadPlan') {
                    router.push({
                        path: '/roadPlan/home',
                        query: {
                            fromType: 'roadPlan',
                            type: 'edit',
                        },
                    });
                }
            }
        });
    };

    // 删除
    const openDeleteModal = ref(false);
    const openDeleteModalRef = ref(null);
    const handleDeleteFile = (file) => {
        // 用户行为日志--项目删除
        gtag('event', 'delete_project', {
            user_info_id: sessionStorage.getItem('userId'),
            project_info_id: file.id,
        });
        openDeleteModal.value = true;
        nextTick(() => {
            openDeleteModalRef.value.openDeleteModalFn(file);
        });
    };
    // 弹窗操作之后更新列表
    const getUpdateList = (val) => {
        openDeleteModal.value = false;
        if (val) {
            initData();
        }
    };
    // 获取页面分页
    const changePage = (val) => {
        let { pageNo, pageSize } = val;
        page.value.pageNo = pageNo;
        page.value.pageSize = pageSize;
        handleSearch({ searchKey: searchCont.value, page: pageNo });
    };

    // 查看报告结果生成页
    const goToResult = (record) => {
        sessionStorage.setItem('projectID', record.id);
        router.push({
            path: '/platform/reportResult',
            query: {
                projectType: 1,
                projectStatus: record.projectStatus,
            },
        });
    };

    watch(
        () => route,
        () => {
            if (route.query.fromType) {
                fromTypeTitle.value = PACKAGE_TYPE_TT_LISTNAME[route.query.fromType] || '';
                initData();
            }
        },
        {
            immediate: true,
            deep: true,
        },
    );

    onBeforeMount(() => {});
    onMounted(async () => {});
</script>
<style scoped lang="scss">
    @import '../../project.scss';
    $primary-color: var(--theme);

    .my-project-list {
        height: 100%;
        h3 {
            font-weight: bold;
            margin-top: 8px;
            margin-bottom: 20px;
        }
        .history-num {
            display: flex;
            align-items: center;
            cursor: pointer;
            color: $primary-color;

            .num-icon {
                margin-left: 5px;
                color: $primary-color;
            }
        }

        .green {
            color: $primary-color;
        }
    }
    .reason-icon {
        color: $primary-color;
    }

    .error-reason {
        display: inline-block;
        max-width: 200px;
        word-break: break-all;
    }
</style>
