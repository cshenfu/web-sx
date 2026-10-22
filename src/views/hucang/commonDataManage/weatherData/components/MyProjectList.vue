<template>
    <div class="my-project-list">
        <h3>我的下载</h3>
        <project-search-bar ref="projectSearchBarRef" @search="handleSearch"></project-search-bar>
        <table-list
            class="project-table"
            id="projectTable"
            :loading="loading"
            :tableData="dataList"
            :tableColumn="MY_TABLE_LIST_CLOUMN"
            :page="page"
            @changePage="changePage"
        >
            <!-- DRAFT(1, "草稿", List.of(1)),
        QUEUE(2, "排队中", List.of(2，3，8)),
        ING(3, "计算中", List.of(4, 7)),
        STOP(4, "计算终止", List.of(5, 6)),
        FINISH(5, "已完成", List.of(9)); -->
            <template #projectStatus="record">
                <template v-if="record.status == 1 && record.pending">
                    <div class="progress-bar">
                        <div
                            class="progress-fill pulse"
                            :style="{ width: (record.status == 1 ? record.pending : 100) + '%' }"
                        ></div>
                    </div>
                    <!-- <div class="progress-bar">
                        <div class="progress-fill pulse" :style="{'width': record.penging + '%'}"></div>
                    </div> -->
                </template>
                <template v-else-if="record.status == 2">
                    <a-progress
                        :strokeColor="{
                            '0%': '#108ee9',
                            '80%': '#11C2E3',
                        }"
                        :percent="100"
                        :show-info="false"
                    />
                    <!-- #0389EA, #11C2E3 -->
                </template>
                <template v-else-if="record.status == 3">
                    <a-progress strokeColor="#d9d9d9" :percent="100" :show-info="false" />
                </template>
            </template>
            <template #longitude="record">
                {{ record.longitude + '，' + record.latitude }}
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
            <template #fileName="record">
                {{
                    record.objectKey
                        ? record.objectKey.split('/')[record.objectKey.split('/').length - 1]
                        : '--'
                }}
            </template>
            <template #operation="record">
                <!-- 只有审核计算完成、计算终止状态才显示按钮 -->
                <div class="operation-btn">
                    <template v-if="record.status == 2">
                        <span class="operation-btn-item" @click="downFileEvent(record.id)"
                            >下载</span
                        >
                    </template>
                    <template v-else-if="record.status == 3">
                        <span style="color: #999">下载失败</span>
                    </template>
                </div>
                <div
                    class="operation-btn"
                    v-if="record.projectStatus == 5 || record.projectStatus == 4"
                >
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
        <!-- 删除项目 -->
        <delete-modal-project
            ref="openDeleteModalRef"
            msg="确定删除此项目及所有历史版本么？删除后不可恢复"
            @updateList="getUpdateList"
            v-if="openDeleteModal"
        >
        </delete-modal-project>
        <!-- 一键优化 -->
        <optimization-modal
            ref="openTuningModalRef"
            v-if="openTuningModal"
            @updateList="getUpdateList"
        ></optimization-modal>
        <projectPackage
            :TipsDialogVisible="TipsDialogVisible"
            :messageType="messageType"
            @changeShowKey="TipsDialogVisible = false"
        ></projectPackage>
    </div>
</template>

<script setup>
    import { ref, reactive, nextTick, onBeforeMount, onMounted, watch, computed, h, onUnmounted } from 'vue';
    import ProjectSearchBar from './ProjectSearchBar.vue';
    import TableList from '@/components/tableList/TableList.vue';
    import DropDownList from '@/components/tableList/components/DropDownList.vue';
    import DeleteModalProject from '../../components/DeleteModalProject.vue';
    import OptimizationModal from '../../components/OptimizationModal.vue';
    import { MY_TABLE_LIST_CLOUMN, applyConditionalStatus } from '../project';
    import { message, Modal } from 'ant-design-vue';
    import { useRouter } from 'vue-router';
    import { PACKAGE_TYPE, PACKAGE_TYPE_TT } from '@/assets/js/static.js';
    import { checkPackageEffective } from '@/api/modules/reportIndex.js';
    import dayjs from 'dayjs';
    import { useProjectHandle } from '../useProject.js';
    import projectPackage from '@/components/projectPackage/projectPackage.vue';
    import { useOssUpload } from '@/components/ossClient/modifytUpload.js';
    import { postLog } from '@/api/modules/userLog.js';
    import { getProjectListIsCheck } from '@/api/modules/home1.js';
    import usePublicDataStore from '@/pinia/modules/public';

    import { getDownloadFile } from '@/api/modules/weather.js';

    const publicDataStore = usePublicDataStore();
    const ossUpload = useOssUpload();
    const props = defineProps({
        activeKey: {
            type: Number,
        },
        itemType: {
            type: Number,
            default: 101,
        },
    });
    const projectSearchBarRef = ref(null);
    const emits = defineEmits([]);
    const router = useRouter();
    const TipsDialogVisible = ref(false);
    const messageType = ref(4);
    // 一键优化参数变量
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
    const hasPendingTime = ref(null);
    const animateTime = ref(null);
    const hasPending = ref(false);
    const dataList = ref([]);
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
        hasPending.value = false;
        // dataList.value = [];
        // searchCont.value.itemType = PACKAGE_TYPE_TT['weather'];
        console.log(searchCont.value, '搜索格式处理');
        searchCont.value.userId = sessionStorage.getItem('userId');
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
            'itemType',
        ];
        await initDataList(searchCont.value, page).then((res) => {
            dataList.value =
                res.dataLists.value.map((item, itemIndex) => {
                    if (item.status == 1) {
                        item.pending = 35;
                    }
                    return applyConditionalStatus(item, fieldsToCheck, item.projectStatus == 5);
                }) || [];
            hasPending.value = dataList.value.some((item) => item.status == 1);
            if (hasPending.value) {
                // 为所有状态为1的项目启动进度更新
                dataList.value.forEach((item) => {
                    if (item.status == 1) {
                        addPendingEvent(item);
                    }
                });
            } else {
                if (hasPendingTime.value) {
                    clearTimeout(hasPendingTime.value);
                }
                if (animateTime.value) {
                    clearInterval(animateTime.value);
                }
            }
            console.log(hasPending.value, '是否有待处理项目');
            page.value.totalNum = res.total.value;
            loading.value = res.loading.value;
        });
    };

    // 下载文件
    const downFileEvent = (id) => {
        getDownloadFile(id).then((res) => {
            if (res.code === 200) {
                window.open(res.data);
            }
        });
    };
    // 查看项目
    const goToProjectDetail = (record) => {
        router.push({
            path: '/anemometer/project/result',
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
        openTuningModal.value = false;
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
            path:
                publicDataStore.headActiveKey == 'light'
                    ? '/light/reportResult'
                    : '/weatherAI/reportResult',
            query: {
                projectType: 1,
            },
        });
    };
    const addPendingEvent = (record) => {
        const index = dataList.value.findIndex((item) => item.id == record.id);
        if (index > -1) {
            const currentData = dataList.value[index];
            if (currentData.status == 1 && currentData.pending) {
                clearInterval(animateTime.value);
                animateTime.value = setInterval(() => {
                    if (dataList.value[index] && dataList.value[index].status == 1) {
                        dataList.value[index].pending = Math.min(dataList.value[index].pending + 1, 80);
                        if (dataList.value[index].pending >= 80) {
                            clearInterval(animateTime.value);
                        }
                    } else {
                        clearInterval(animateTime.value);
                    }
                }, 1000);
            } else {
                clearInterval(animateTime.value);
                dataList.value[index].status = 2;
                dataList.value[index].pending = null;
            }
        }
    };

    const refreshDataEvent = () => {
        console.log('进入函数');
        hasPendingTime.value = setTimeout(() => {
            console.log('开始刷新数据');
            initData();
        }, 30000);
    };

    onBeforeMount(() => {});
    onMounted(async () => {});
    onUnmounted(() => {
        if (hasPendingTime.value) {
            clearTimeout(hasPendingTime.value);
        }
        if (animateTime.value) {
            clearInterval(animateTime.value);
        }
    });
    watch(
        () => props.itemType,
        () => {
            projectSearchBarRef.value.resetSearch();
        },
    );
    watch(
        () => hasPending.value,
        () => {
            if (hasPending.value) {
                refreshDataEvent();
            }
        },
        {
            deep: true,
        },
    );
</script>
<style scoped lang="scss">
    @import '../../project.scss';
    $primary-color: var(--theme);

    .my-project-list {
        >h3 {
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

    .progress-bar {
        position: relative;
        height: 8px;
        background-color: rgba(255, 255, 255, 0.15);
        border-radius: 15px;
        overflow: hidden;
        box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.2);
    }

    .progress-fill {
        position: absolute;
        height: 100%;
        transition: all 0.5s ease-in-out;
        // width: 35%; /* 进度百分比 */
        border-radius: 15px;
        background: linear-gradient(90deg, #0389ea, #11c2e3);
        background-size: 300% 100%;
        animation:
            gradientShift 3s ease infinite,
            waveEffect 2s ease-in-out infinite;
        box-shadow: 0 0 20px rgba(255, 140, 0, 0.5);
    }

    .progress-fill::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
        animation: shimmer 2s infinite;
    }
    @keyframes gradientShift {
        0% {
            background-position: 0% 50%;
        }
        50% {
            background-position: 100% 50%;
        }
        100% {
            background-position: 0% 50%;
        }
    }

    @keyframes waveEffect {
        0%,
        100% {
            transform: scaleY(1);
        }
        50% {
            transform: scaleY(1.05);
        }
    }

    @keyframes shimmer {
        0% {
            left: -100%;
        }
        100% {
            left: 100%;
        }
    }
    .pulse {
        animation: pulse 1.5s infinite;
    }
    @keyframes pulse {
        0% {
            box-shadow: 0 0 0 0 rgba(0, 136, 255, 0.4);
        }
        70% {
            box-shadow: 0 0 0 10px rgba(255, 140, 0, 0);
        }
        100% {
            box-shadow: 0 0 0 0 rgba(255, 140, 0, 0);
        }
    }
</style>
