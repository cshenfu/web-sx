<template>
    <div class="project-list history-list">
        <div class="my-project-header">
            <span class="static-title" @click="goBackList">AI找风资源 / </span>
            <span class="auto-title">{{ projectTitle }}</span>
        </div>
        <table-list
            class="project-table"
            id="projectTable"
            :loading="loading"
            :tableData="dataList"
            :tableColumn="MY_AUTO_HISTORY_TABLE_LIST_CLOUMN"
            :page="page"
            @changePage="changePage"
        >
            <template #projectStatus="record">
                <!-- 状态为1的草稿数据 -->
                <div
                    class="status-tag default-icon"
                    v-if="record.projectStatus == 1"
                    >草稿</div
                >
                <!-- 计算中（包含： 初始化、计算中、文件待解析、计算完成） -->
                <div
                    v-if="
                        record.projectStatus == 3 
                    "
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
                        <iconpark-icon name="bangzhu" class="reason-icon" style="cursor: pointer;"></iconpark-icon>
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
            <template #areaCode="record">
                <template v-if="record.provinceName">{{ record.provinceName }}/</template>
                    <template v-if="record.cityName">{{ record.cityName }}/</template>
                    <template v-else>--</template>
                    <template v-if="record.districtName">{{ record.districtName }}</template>
                <!-- <div>{{ record.areaName }}</div> -->
            </template>
            <template #capacity="record">
                <div> {{ record.currentProjectCapacity }}</div>
            </template>
            <template #installedCapacity="record">
                <div>{{ record.installedCapacity ? record.installedCapacity : '--' }}</div>
            </template>
            <template #yieldRate="record">
                <div
                    >{{ record.yieldRate }}
                    <span v-if="!record.yieldRate">--</span>
                    <span v-else>%</span>
                </div>
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
                            <span> {{ record.version.slice(0, 10) }}...</span>
                        </a-popover>
                    </div>
                </div>
            </template>
            <template #reportFinishTime="record">
                <div>{{
                    record.reportFinishTime
                        ? dayjs(record.reportFinishTime).format('YYYY-MM-DD HH:mm:ss')
                        : '--'
                }}</div>
            </template>
            <template #createTime="record">
                <div>{{
                    record.createTime
                        ? dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss')
                        : '--'
                }}</div>
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
            <template #operation="record">
                <!-- 只有审核计算完成、计算终止状态才显示按钮 -->
                <div class="operation-btn" v-if="record.projectStatus == 5 || record.projectStatus == 4">
                    <span
                        class="operation-btn-item"
                        v-softDog="{ callback: previewResult, params: record, packageType:PACKAGE_TYPE.auto}"
                        v-if="record.projectStatus == 5"
                        >预览</span
                    >
                    <span
                        class="operation-btn-item"
                        v-softDog="{ callback: handleChangeFile, params: record, packageType:PACKAGE_TYPE.auto }"
                        >调整</span
                    >
                    <span
                        class="operation-btn-item"
                        v-softDog="{ callback: handleDeleteFile, params: record, packageType:PACKAGE_TYPE.auto}"
                        v-if="record.projectStatus !== 5"
                    >
                        删除
                    </span>
                </div>
            </template>
        </table-list>
        <!-- 删除项目 -->
        <delete-modal-project ref="openDeleteModalRef" msg="确定删除此项目及所有历史版本么？删除后不可恢复" @updateList="getUpdateList"
            v-if="openDeleteModal">
        </delete-modal-project>
        <projectPackage
            :TipsDialogVisible="TipsDialogVisible"
            :messageType="messageType"
            @changeShowKey="TipsDialogVisible = false"
        ></projectPackage>
    </div>
</template>

<script setup>
    import { ref, reactive, toRefs, onBeforeMount, onMounted, watch, computed } from 'vue';
    import TableList from '@/components/tableList/TableList.vue';
    import DeleteModalProject from '../../components/DeleteModalProject.vue';
    import {
        MY_AUTO_HISTORY_TABLE_LIST_CLOUMN,
        getAreaData,
        removeEmpty,
        applyConditionalStatus
    } from '../project';
    import { message, Modal } from 'ant-design-vue';
    import { useRouter,useRoute } from 'vue-router';
    import {} from '@/api/modules/project';
    import dayjs from 'dayjs';
    import eventBus from '@/utils/eventBus';
    import projectPackage from '@/components/projectPackage/projectPackage.vue';
    import {PACKAGE_TYPE,} from '@/assets/js/static.js';
    import {getProjectListIsCheck} from '@/api/modules/home.js';
    import {
        getHistoryList,
    } from '@/api/modules/project';
    const props = defineProps({
        automaticTotal: {
            type: Number,
            default: 0,
        },
    });

    const emits = defineEmits(['update:automaticTotal']);
    const router = useRouter();
    const route = useRoute();
    const TipsDialogVisible = ref(false);
    const messageType = ref(4);
    const areaCodeOptions = ref([]);
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
    const isSelectOpen = ref({
        first: false,
        second: false,
    });
    const isActive = ref(false);
    const isFocus = ref(false);
    const dataList = ref([]);
    const page = ref({
        pageNo: 1,
        pageSize: 10,
        totalNum: 0,
    });
    const dateFormat = 'YYYY-MM-DD HH:mm:ss';
    const loading = ref(true);
    const projectTitle = route.query.projectTitle;
    // 搜索
    const handleSearch = (e, val) => {
        searchCont.value = { ...e };
        page.value.pageNo = val || 1;
        initData();
    };
    // 初始化数据
       // 初始化数据
       const initData = async() => {
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
        searchData.itemType = PACKAGE_TYPE.auto
        let data = removeEmpty(searchData);
        const fieldsToCheck = [
            'installedCapacity',
            'deviceCapacity',
            'deviceNum',
            'yearPower',
            'fullLoadHours',
            'correctionCoefficient',
        ];
        getHistoryList(data).then((res) => {
            dataList.value = res.data?.list?.map((item) => {
                item.areaName = item.provinceName? `${item.provinceName}/${item.cityName}/${item.districtName}` : '--'
                return applyConditionalStatus(item, fieldsToCheck, item.projectStatus == 5)
            });
            page.value.totalNum = res.data?.total;
            loading.value = false;
        });
    };
    // 预览文件
    const checkFile = (data) => {
        // 用户行为日志--预览报告
        gtag('event', 'report_preview', {
            user_info_id: sessionStorage.getItem('userId'),
            project_info_id: data.id
        });
        chooseListDetil.value = data;
        if (!data.pdfReportObjectKey) {
            message.error('暂无生成报告');
            return;
        }
        sessionStorage.setItem('pdfReportObjectKey', data.pdfReportObjectKey || '');
        window.open(location.origin + '/pdfPreview');
    };
    // 预览文件
    const previewResult = (file) => {
        // 用户行为日志--预览报告
        gtag('event', 'report_preview', {
            user_info_id: sessionStorage.getItem('userId'),
            project_info_id: file.id,
        });
        // 用户行为日志———预览报告（给后端用）
        postLog({type: 1});
        sessionStorage.setItem('projectName', file.projectName);
        sessionStorage.setItem('projectID', file.id);
        // router.push({
        //     path: '/autoMapResult'
        // })
        window.open(location.origin + '/autoMapResult');
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
        checkPackage(2).then((res) => {
            if (res.isEffective) {
                sessionStorage.setItem('projectID', file.id);
                router.push({
                    path: '/weatherAI/createAuto',
                    query: {
                        type: 'edit',
                    },
                });
            }
        });
        // sessionStorage.setItem('projectID', file.id);
        // router.push({
        //     path: '/weatherAI/createAuto',
        //     query: {
        //         type: 'edit',
        //     },
        // });
    };
    // 删除
    const openDeleteModal = ref(false);
    const openDeleteModalRef = ref(null)
    const handleDeleteFile = (file) => {
        openDeleteModal.value = true;
        nextTick(() => {
            openDeleteModalRef.value.openDeleteModalFn(file)
        })
    };
    // 弹窗操作之后更新列表
    const getUpdateList = (val) => {
        openDeleteModal.value = false;
        if (val) {
            initData()
        }
    }
    // 获取页面分页
    const changePage = (val) => {
        let { pageNo, pageSize } = val;
        page.value.pageNo = pageNo;
        page.value.pageSize = pageSize;
        handleSearch(searchKey.value, pageNo);
    };
    // 查看报告结果生成页
    const goToResult = (record) => {
        sessionStorage.setItem('projectID', record.id);
        router.push({
            path: '/autoResult',
        });
    };
    const goBackList = () => {
        // 为了回到列表时，默认选中“AI找风资源”项
        sessionStorage.setItem('activeHistoryIndex', 2);
        router.go(-1);
    };
    onBeforeMount(() => {
        getAreaData().then((res) => {
            areaCodeOptions.value = res.subList;
            initData();
        });
    });
    onMounted(async () => {
        
    });
</script>
<style scoped lang="scss">
    @import '../../project.scss';
    @import './historyList.scss';
    $primary-color: var(--theme);
    .my-project-list {
        .my-project-list-search {
            display: flex;
            align-items: flex-start;
        }
        .history-num {
            display: flex;
            align-items: center;
            cursor: pointer;
            color: $primary-color;

            .num-icon {
                margin-left: 5px;
            }
        }
        .green {
            color: $primary-color;
        }
    }
    .reason-icon{
        color: $primary-color;
    }
    .error-reason{
        display: inline-block;
        width: 200px;
    }
</style>
