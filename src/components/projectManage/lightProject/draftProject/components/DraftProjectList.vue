<template>
    <div class="my-draft-list">
        <draft-project-search-bar @search="handleSearch"></draft-project-search-bar>
        <table-list
            class="project-table"
            :loading="loading"
            :tableData="dataList"
            :tableColumn="DRAFT_TABLE_LIST_CLOUMN"
            :page="page"
            @changePage="changePage"
        >
            <template #value2="record">
                <a-popover overlay-class-name="name-popover-self">
                    <template #content>
                        {{ record.value2 }}
                    </template>
                    <div class="ellipsis-text-name">{{ record.value2 }}</div>
                </a-popover>
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
                <!-- <div>{{record.areaName}}</div> -->
            </template>
            <template #capacity="record">
                <div>{{ record.totalProjectCapacity }} / {{ record.currentProjectCapacity }}</div>
            </template>
            <template #createTime="record">
                <div>{{
                    record.createTime ? dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss') : ''
                }}</div>
            </template>
            <template #operation="record">
                <div class="operation-btn">
                    <span
                        class="operation-btn-item"
                        v-softDog="{
                            callback: editFile,
                            params: record,
                            packageType: PACKAGE_TYPE.lightDefault,
                        }"
                        >编辑</span
                    >
                    <span
                        class="operation-btn-item"
                        v-softDog="{
                            callback: handleDeleteFile,
                            params: record,
                            packageType: PACKAGE_TYPE.lightDefault,
                        }"
                        >删除</span
                    >
                </div>
            </template>
        </table-list>
        <delete-modal-project
            ref="openDeleteModalRef"
            msg=" 确定删除此草稿内容吗?"
            @updateList="getUpdateList"
            v-if="openDraftDeleteModal"
            :chooseListDetil="chooseListDetil"
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
    import { ref, nextTick, onBeforeMount, onMounted, watch, computed } from 'vue';
    import DraftProjectSearchBar from './DraftProjectSearchBar.vue';
    import TableList from '@/components/tableList/TableList.vue';
    import DeleteModalProject from '../../../components/DeleteModalProject.vue';
    import {
        DRAFT_TABLE_LIST_CLOUMN
    } from '../../project';
    import dayjs from 'dayjs';
    import { useRouter } from 'vue-router';
    import {useProjectHandle} from '../../useProject.js';
    import {PACKAGE_TYPE,} from '@/assets/js/static.js';
    import projectPackage from '@/components/projectPackage/projectPackage.vue';
    import usePublicDataStore from '@/pinia/modules/public';
    const publicDataStore = usePublicDataStore()
    const props = defineProps({
        draftListTotal: {
            type: Number,
            default: 0,
        },
    });
    const emits = defineEmits([]);
    const router = useRouter();
    const messageType = ref(4);
    const TipsDialogVisible = ref(false);
    const searchCont = ref({});
    const dataList = ref([]);
    const page = ref({
        pageNo: 1,
        pageSize: 10,
        totalNum: 0,
    });
    const loading = ref(true);
    // 搜索
    const handleSearch = (e) => {
        searchCont.value = { ...e.searchKey };
        page.value.pageNo = e.page || 1;
        initData();
    };
    // 初始化数据
    const initData = async () => {
        dataList.value = [];
        searchCont.value.projectStatus = 1;
        searchCont.value.itemType = PACKAGE_TYPE.lightDefault;
        let { initDataList } = await useProjectHandle();
        await initDataList(searchCont.value, page, searchCont.value.itemType, true).then((res) => {
            dataList.value = res.dataLists.value;
            page.value.totalNum = res.total.value;
            loading.value = res.loading.value;
        });
    };
    // 编辑
    const editFile = (file) => {
        sessionStorage.setItem('projectID', file.id);
        router.push({
            path: publicDataStore.headActiveKey=='light' ? '/light/create' : '/weatherAI/create',
            query: {
                type: 'draft',
            },
        });
    };
    const chooseListDetil = ref({});
    const openDeleteModalRef = ref(null);
    const openDraftDeleteModal = ref(false);
    // 删除
    const handleDeleteFile = (file) => {
        openDraftDeleteModal.value = !openDraftDeleteModal.value;
        nextTick(() => {
            openDeleteModalRef.value.openDeleteModalFn(file);
        });
    };
    const getUpdateList = (val) => {
        openDraftDeleteModal.value = !openDraftDeleteModal.value;
        if (val) {
            initData();
        }
    };
    // 获取页面分页
    const changePage = (val) => {
        let { pageNo, pageSize } = val;
        page.value.pageNo = pageNo;
        page.value.pageSize = pageSize;
        handleSearch({searchKey:searchCont.value, page:pageNo});
    };
    onBeforeMount(async() => {
    });
    onMounted(() => {
    });
    onMounted(() => {});
</script>
<style scoped lang="scss">
    @import '../../../project.scss';
    $primary-color: var(--theme);
    .my-draft-list {
        .my-project-list-search {
            display: flex;
            align-items: flex-start;
        }
        .search-item {
            // height: 40px;
            display: flex;
            justify-content: space-around;
            align-items: center;
            margin-right: 12px;
            margin-bottom: 12px;

            &:last-child {
                margin-right: 0;
            }

            .search-label-self {
                flex: 0 0 auto;
                // padding: 0 12px;
                // min-width: 60px;
                margin-right: 12px;
                font-size: 12px;
                color: #363b4d;
            }

            .site-input-split {
                background-color: #fff;
            }

            .site-input-right {
                border-left-width: 0;

                &:hover {
                    border-left-width: 1px;
                    border-right-width: 1px;
                }
            }

            // 联合输入框
            .range-number-cont {
                height: 30px;
                border: 1px solid red;
                display: flex;
                justify-content: space-between;
                z-index: 1;
                white-space: nowrap;
                border: 1px solid #ccc;
                box-sizing: border-box;
                border-radius: 6px;
                align-items: center;
                background-color: #fff;
                transition: all linear 0.1s;

                .custom-icon {
                    flex: none;
                    width: 12px;
                    text-align: center;
                }

                &.unActive {
                    border-color: #ccc;
                }

                &.active {
                    border-color: $primary-color;
                }

                &.error {
                    border-color: red;
                }

                :deep(.ant-input-number) {
                    flex: 1;
                    position: relative;
                    z-index: 11;
                    border-color: transparent;
                    background-color: transparent;
                    box-shadow: none;

                    &:first-child {
                        border-radius: 6px 0 0 6px;
                        border-right: none;
                    }

                    &:last-child {
                        border-radius: 0 6px 6px 0;
                        border-left: none;
                    }
                }

                :deep(
                        .ant-input-number-status-error:not(.ant-input-number-disabled):not(
                                .ant-input-number-borderless
                            ).ant-input-number:hover
                    ) {
                    border-color: transparent;
                    box-shadow: none;
                }

                :deep(
                        .ant-input-number-status-error:not(.ant-input-number-disabled):not(
                                .ant-input-number-borderless
                            ).ant-input-number:focus
                    ) {
                    border-color: transparent;
                    box-shadow: none;
                }
            }
        }

        .status-tag {
            width: 52px;
            height: 22px;
            background: #fef1df;
            border-radius: 2px;
            text-align: center;
            font-size: 12px;
        }

        .pending-icon {
            line-height: 22px;
            color: #ff8411;
        }

        .long-time {
            font-size: 12px;
            line-height: 12px;
            color: #7c8294;
            margin-top: 5px;
        }

        .finish-icon {
            background: #e8f7e3;
            color: #50b72a;
        }

        .green {
            color: $primary-color;
        }
    }
</style>
