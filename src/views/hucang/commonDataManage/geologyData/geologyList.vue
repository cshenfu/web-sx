<template>
    <div class="geology-list">
        <table-list
            class="geology-table"
            :loading="loading"
            :tableData="dataSource"
            :tableColumn="thArr"
            :page="page"
            @getRowData="getRowData"
            @changePage="changePage"
        >
            <template #provinceName="{ record }">
                {{ record.provinceName }}
                <span v-if="record.cityName">/ {{ record.cityName }}</span>
                <span v-if="record.districtName"> / {{ record.districtName }}</span>
            </template>

            <template #progressNumber="{ record }">
                <div
                    style="cursor: pointer; color: #036b64; font-weight: bold"
                    @click.stop="correlationProgress(record)"
                    v-if="record.progressNumber"
                >
                    <p> FD738393943 </p>
                    <span> ...共几个 </span>
                    {{ record.progressNumber }}
                </div>
            </template>
            <template #status="{ record }">
                <template v-if="props.activeKey == 2">
                    <el-tag v-if="record.status == 5" type="warning">已核对，待计算</el-tag>
                    <el-tag v-if="record.status == 4" type="warning">待核对</el-tag>
                    <el-tag v-if="record.status == 3" type="danger">解析错误</el-tag>
                    <el-tag v-if="record.status == 2" type="success">已核对</el-tag>
                    <el-tag v-if="record.status == 1" type="info">待解析</el-tag>
                </template>
                <template v-else>
                    <el-tag v-if="record.isDisable" type="danger">已禁用</el-tag>
                    <el-tag v-else type="success">已开放</el-tag>
                </template>
            </template>
            <template #isHaveLocationFile="{ record }">
                <iconpark-icon
                    :name="Boolean(record.isHaveLocationFile) ? 'you' : 'wu'"
                ></iconpark-icon>
            </template>
            <template #isHaveTopographicFile="{ record }">
                <iconpark-icon
                    :name="Boolean(record.isHaveTopographicFile) ? 'you' : 'wu'"
                ></iconpark-icon>
            </template>
            <template #isHaveRoughnessFile="{ record }">
                <iconpark-icon
                    :name="Boolean(record.isHaveRoughnessFile) ? 'you' : 'wu'"
                ></iconpark-icon>
            </template>
            <template #isHaveGeologyRockSoils="{ record }">
                <iconpark-icon
                    :name="Boolean(record.isHaveGeologyRockSoils) ? 'you' : 'wu'"
                ></iconpark-icon>
            </template>
            <template #isHaveRegionalGeologyConditionEvaluation="{ record }">
                <iconpark-icon
                    :name="Boolean(record.isHaveRegionalGeologyConditionEvaluation) ? 'you' : 'wu'"
                ></iconpark-icon>
            </template>
            <template #isHaveRegionalGeologyInfo="{ record }">
                <iconpark-icon
                    :name="Boolean(record.isHaveRegionalGeologyInfo) ? 'you' : 'wu'"
                ></iconpark-icon>
            </template>
            <template #isHaveSeismicInfo="{ record }">
                <iconpark-icon
                    :name="Boolean(record.isHaveSeismicInfo) ? 'you' : 'wu'"
                ></iconpark-icon>
            </template>
            <template #isHaveRegionalHydrologyInfo="{ record }">
                <iconpark-icon
                    :name="Boolean(record.isHaveRegionalHydrologyInfo) ? 'you' : 'wu'"
                ></iconpark-icon>
            </template>
            <template #isHaveConclusionEvaluation="{ record }">
                <iconpark-icon
                    :name="Boolean(record.isHaveConclusionEvaluation) ? 'you' : 'wu'"
                ></iconpark-icon>
            </template>
            <template #isHaveExplorationFile="{ record }">
                <iconpark-icon
                    :name="Boolean(record.isHaveExplorationFile) ? 'you' : 'wu'"
                ></iconpark-icon>
            </template>
            <template #geologicalSurveyCite="{ record }">
                <iconpark-icon
                    :name="Boolean(record.geologicalSurveyCite) ? 'you' : 'wu'"
                ></iconpark-icon>
            </template>
            <template #terrainCite="{ record }">
                <iconpark-icon
                    :name="Boolean(record.terrainCite) ? 'you' : 'wu'"
                ></iconpark-icon>
            </template>
            <template #updateTime="{ record }">
                {{ dayjs(record.updateTime).format('YYYY-MM-DD HH:mm:ss') }}
            </template>
            <template #operation="{ record }">
                <div class="operation-btn">
                    <span
                        v-if="record.status !== 5"
                        class="operation-btn-item"
                        @click.stop="edit(record)"
                        >{{
                            record.status == 4
                                ? '核对'
                                : props.activeKey == 1 || record.status == 2
                                  ? '编辑'
                                  : ''
                        }}
                        </span>
                    <!-- 针对已核对待计算状态数据 -->
                    <span v-else class="operation-btn-item" @click.stop="edit(record)">编辑</span>
                    <span
                        class="operation-btn-item"
                        v-if="props.activeKey == 1"
                        :class="record.isDisable ? '' : 'operation-btn-item-error'"
                        @click.stop="updateStatus(record, false, record.isDisable ? 0 : 1)"
                    >
                        {{ record.isDisable ? '置为开放' : '禁用' }}
                    </span>
                    <span
                        class="operation-btn-item"
                        v-if="props.activeKey == 2 && record.status == 5"
                        @click.stop="toCalculation(record)"
                        >发送计算</span
                    >
                    <span v-if="props.activeKey == 1" class="operation-btn-item" @click.stop="copy(record)">复制</span>
                    <span class="operation-btn-item" @click.stop="updateStatus(record, true)"
                        >删除</span
                    >
                    <span class="operation-btn-item" @click.stop="goGeography(record)"
                        >地形数据</span
                    >
                    <span class="operation-btn-item" @click.stop="updateGeologyVite(record)"
                        >引用设置</span
                    >
                </div>
            </template>
        </table-list>
        <tips-modal
            :width="'490px'"
            class="tip-content-modal"
            :okText="'确定'"
            v-model:openTipsModal="openTipsUpdateStatus"
            @handleChangeFileModal="handleChangeDelete"
        >
            <template #customTitle>
                <div class="openTitle">
                    <iconpark-icon name="jinggao" size="18" class="success"></iconpark-icon>
                    提示
                </div>
            </template>
            <template #contentBody>
                <div class="openTitle">
                    {{ openTipsTitle }}
                </div>
                <el-form
                    class="sort-form"
                    ref="openFormRef"
                    :model="openFormData"
                    label-width="70px"
                    label-position="left"
                >
                    <el-form-item
                        label="原因"
                        prop="reason"
                        :rules="[{ required: true, message: '请输入原因', trigger: 'blur' }]"
                    >
                        <el-input
                            type="textarea"
                            style="width: 358px"
                            :autosize="{ minRows: 2, maxRows: 5 }"
                            v-model="openFormData.reason"
                            placeholder="请输入原因"
                        />
                    </el-form-item>
                </el-form>
            </template>
        </tips-modal>
        <!-- 引用设置弹窗 -->
        <tips-modal
            :width="'490px'"
            class="tip-content-modal"
            :tipType="'success'"
            :okText="'保存'"
            v-model:openTipsModal="openCiteUpdateStatus"
            @handleChangeFileModal="handleChangeCite"
        >
            <template #customTitle>
                <div class="openTitle"> 引用设置 </div>
            </template>
            <template #contentBody>
                <el-form
                    class="sort-form"
                    ref="openFormCiteRef"
                    :model="openCiteFormData"
                    label-width="100px"
                    label-position="left"
                >
                    <el-form-item
                        label="地勘数据"
                        prop="geologicalSurveyCite"
                        :rules="[{ required: true, message: '请选择是否地勘数据', trigger: 'change' }]"
                    >
                        <el-radio-group
                            v-model="openCiteFormData.geologicalSurveyCite"
                            :disabled="!currentData?.isHaveExplorationFile"
                        >
                            <el-radio :label="1">引用</el-radio>
                            <el-radio :label="0">不引用</el-radio>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item
                        label="地形数据"
                        prop="terrainCite"
                        :rules="[{ required: true, message: '请选择是否地形数据', trigger: 'change' }]"
                    >
                        <el-radio-group
                            v-model="openCiteFormData.terrainCite"
                            :disabled="!currentData?.isHaveTopographicFile"
                        >
                            <el-radio :label="1">引用</el-radio>
                            <el-radio :label="0">不引用</el-radio>
                        </el-radio-group>
                    </el-form-item>
                </el-form>
            </template>
        </tips-modal>
        <!-- 复制弹窗 -->
        <tips-modal
            :width="'400px'"
            class="tip-content-modal"
            :tipType="'success'"
            :okText="'保存'"
            v-model:openTipsModal="openCopyModel"
            @handleChangeFileModal="handleChangeCopy"
        >
            <template #customTitle>
                <div class="openTitle"> 数据复制 </div>
            </template>
            <template #contentBody>
                <div style="margin-bottom: 16px;">
                    <span style="margin: 0 16px 0 10px;">数据源</span>
                    {{ currentData.provinceName }}
                    <span v-if="currentData.cityName">/ {{ currentData.cityName }}</span>
                    <span v-if="currentData.districtName"> / {{ currentData.districtName }}</span>
                </div>
                <el-form
                    class="sort-form"
                    ref="openFormCopyRef"
                    :model="openCopyFormData"
                    label-width="70px"
                    label-position="left"
                >
                    <el-form-item
                        label="复制到"
                        prop="cityCode"
                        :rules="[{ required: true, message: '请选择要复制到的城市', trigger: 'change' }]"
                    >
                    <el-cascader
                        class="search-item-box"
                        v-model="openCopyFormData.cityCode"
                        :options="areaCodeOptions"
                        :props="{ label: 'regionName', value: 'regionCode', children: 'subList', checkStrictly: true }"
                        placeholder="省市区"
                    />
                    </el-form-item>
                </el-form>
            </template>
        </tips-modal>
    </div>
</template>

<script setup>
    import { ref, onMounted, watch } from 'vue';
    import TableList from '@/components/tableList/TableList.vue';
    import TipsModal from '@/components/tipsDialog/TipsModal.vue';
    import { GEOLOGY_TABLE_LIST_CLOUMN } from './components/tableList.js';
    import { ElMessage } from 'element-plus';
    import { useRouter } from 'vue-router';
    import { useOssUpload } from '@/components/ossClient/index';
    import {
        submitFileGeology,
        getGeologyDetail,
        deleteGeology,
        updateGeologyDisable,
        calculateGeologyStatus,
        updateGeologyCite,
        copyGeologyData
    } from '@/api/modules/geology.js';
    import dayjs from 'dayjs';
    import { getProvince } from '@/api/modules/public';
    const thArr = ref(GEOLOGY_TABLE_LIST_CLOUMN);
    const props = defineProps({
        activeKey: {
            type: Number,
            default: 1,
        },
        dataSource: {
            type: Array,
            default: () => {
                return [];
            },
        },
        totalNum: {
            type: Number,
            default: 0,
        },
    });
    const openFormCiteRef = ref(null);
    const openFormRef = ref(null);
    const openFormCopyRef = ref(null);
    const openFormData = ref({
        reason: '',
    });
    const emits = defineEmits(['reGetListData']);
    const loading = ref(false);
    const openCiteUpdateStatus = ref(false);
    const openCiteFormData = ref({
        geologicalSurveyCite: 0, // 地勘数据引用
        terrainCite: 0, // 地形数据引用
    });
    const router = useRouter();
    const page = ref({
        current: 1,
        pageSize: 10,
        total: 0,
    });
    const openCopyModel = ref(false);
    const openCopyFormData = ref({
        cityCode: []
    })
    const areaCodeOptions = ref([]);
    watch(
        [() => props.activeKey, () => props.totalNum],
        ([val, oldVal], [totalVal, oldTotalVal]) => {
            if (val) {
                console.log(props.activeKey);
                page.value.current = 1;
            }
            page.value.total = props.totalNum;
        },
        {
            deep: true,
            immediate: true,
        },
    );

    // 表格
    const getRowData = (row) => {
        router.push({
            path: '/geology/detail',
            query: {
                id: row.id,
            },
        });
    };
    // 获取页面分页
    const changePage = (val) => {
        page.value.current = val.page;
        page.value.pageSize = val.pageSize;
        emits('reGetListData');
    };
    // 弹窗内容会在首次渲染时执行表达式，因此不能初始化为 null。
    const currentData = ref({});
    const updateGeologyVite = (row) => {
        openCiteUpdateStatus.value = true;
        currentData.value = row;
        openCiteFormData.value.geologicalSurveyCite = currentData.value.geologicalSurveyCite;
        openCiteFormData.value.terrainCite = currentData.value.terrainCite;
    }
    const handleChangeCite = (isOk) => {
        console.log(isOk);
        if (isOk) {
            // 提交数据请求接口
            const params = {
                    id: currentData.value.id,
                    geologicalSurveyCite: openCiteFormData.value.geologicalSurveyCite,
                    terrainCite: openCiteFormData.value.terrainCite,
            }
            console.log(params);
            // debugger
            try {
                updateGeologyCite(params).then(res => {
                    if (res.code == 200) {
                        ElMessage.success('操作成功');
                        emits('reGetListData');
                        openFormCiteRef.value.resetFields();
                        openCiteUpdateStatus.value = false;
                    }
                })
            } catch (error) {
                console.log(error);
            }
        } else {
            openFormCiteRef.value.resetFields();
            openCiteUpdateStatus.value = false;
        }
    };

    // 操作部分
    const edit = (row) => {
        console.log(row);
        if (row.status == 4) {
            // 核对状态下
            // 判断有无地勘数据引用，有：跳转到地勘数据编辑；无：跳转到地形数据页面
            if (row.geologicalSurveyCite) {
                router.push({
                    path: '/hucang/geology/edit',
                    query: {
                        sourceType: props.activeKey,
                        id: row.id,
                        status: row.status,
                    },
                });
            } else {
                router.push({
                    path: '/geology/geography',
                    query: {
                        sourceType: props.activeKey,
                        id: row.id,
                        status: row.status,
                    },
                });
            }
        } else {
            router.push({
                path: '/hucang/geology/edit',
                query: {
                    sourceType: props.activeKey,
                    id: row.id,
                    status: row.status,
                },
            });
        }
    };
    const copy = (row) => {
        currentData.value = row;
        openCopyModel.value = true;
        openCopyFormData.value.cityCode = [];
    }
    // 删除、禁用操作提示窗
    const openTipsUpdateStatus = ref(false);
    const openTipsTitle = ref('');
    const openTipsType = ref(0);
    const handleChangeDelete = (value) => {
        if (value) {
            if (openTipsType.value < 0) {
                // 删除操作
                deleteGeology({ geologyId: currentData.value.id })
                    .then((res) => {
                        if (res && res.code == 200) {
                            openFormData.value.reason = '';
                            ElMessage.success('删除成功');
                            emits('reGetListData');
                            openTipsUpdateStatus.value = false;
                        } else {
                            ElMessage.error(res.msg);
                            openTipsUpdateStatus.value = false;
                        }
                    })
                    .catch((err) => {
                        ElMessage.error(res.msg);
                        openTipsUpdateStatus.value = false;
                    });
            } else {
                openFormRef.value
                    .validate()
                    .then(() => {
                        // 置为开放、禁用
                        updateGeologyDisable({
                            id: currentData.value.id,
                            isDisable: openTipsType.value,
                            reason: openFormData.value.reason,
                        })
                            .then((res) => {
                                if (res && res.code == 200) {
                                    openFormData.value.reason = '';
                                    ElMessage.success('操作成功');
                                    emits('reGetListData');
                                    openFormRef.value.resetFields();
                                    openTipsUpdateStatus.value = false;
                                }
                            })
                            .catch((err) => {
                                ElMessage.error(err);
                                openFormRef.value.resetFields();
                                openTipsUpdateStatus.value = false;
                            });
                    })
                    .catch((error) => {
                        console.log('错误', error);
                    });
            }
        } else {
            openTipsUpdateStatus.value = false;
        }
    };
    const updateStatus = (row, isDel, type) => {
        currentData.value = row;
        openTipsUpdateStatus.value = true;
        if (isDel) {
            openTipsTitle.value = '是否要删除该数据？';
            openTipsType.value = -1;
        } else {
            openTipsType.value = type;
            if (type) {
                openTipsTitle.value = '是否要禁用该数据？';
            } else {
                openTipsTitle.value = '是否要将该数据置为开放？';
            }
        }
    };
    // 复制地勘数据
    const handleChangeCopy = (value) => {
        console.log(value);
        if (value) {
            openFormCopyRef.value
            .validate()
            .then(() => {
                console.log('验证通过');
                console.log(openCopyFormData.value.cityCode, openCopyFormData.value.cityCode[- 1]);
                copyGeologyData({
                    sourceGeologyId: currentData.value.id,
                    targetCityCode: openCopyFormData.value.cityCode[openCopyFormData.value.cityCode.length - 1],
                    targetParentCityCode:openCopyFormData.value.cityCode.length > 1 ? openCopyFormData.value.cityCode[openCopyFormData.value.cityCode.length - 2] : '0',
                }).then((res) => {
                    if (res && res.code == 200) {
                        ElMessage.success('复制成功');
                        emits('reGetListData');
                        openCopyModel.value = false;
                    }
                })
            })
        } else {
            openCopyModel.value = false;
        }
    }
    // 关联项目
    const correlationProgress = (row) => {
        sessionStorage.setItem('linkProgressInfo', JSON.stringify(row));
        router.push({
            path: '/geology/linkage',
        });
    };
    // 发送计算  
    const toCalculation = (row) => {
        calculateGeologyStatus({
            geologyId: row.id,
        }).then((res) => {
            if (res.code == 200) {
                ElMessage.success('发送成功！');
                emits('reGetListData');
            }
        });
    };
    // 跳转地形管理链接
    const goGeography = (row) => {
        router.push({
            path: '/geology/geography',
            query: {
                id: row.id,
                sourceType: props.activeKey,
                status: row.status
            },
        });
    };

    onMounted(() => {
        getProvince().then((res) => {
            if (res.code == 200) {
                areaCodeOptions.value = res.data.subList;
                // console.log(areaCodeOptions.value);
            }
        });
        //console.log('3.-组件挂载到页面之后执行-------onMounted')
    });
    const getPageInfo = () => {
        return page.value;
    };
    defineExpose({
        page,
        getPageInfo,
    });
</script>
<style scoped lang="scss">
  @import './css/tableList.scss';
    .openTitle {
        display: flex;
        align-items: center;
        margin-bottom: 16px;
        iconpark-icon {
            color: #ff8411;
            margin-right: 6px;
        }
    }
    .operation-btn-item-error {
        color: #ff3e3e;
        &:hover {
            color: #fa7e7e;
        }
    }
    .content-body-title {
        background: url(@/assets/img/user/detail-title.png) no-repeat;
        background-position: center left;
        background-size: auto 16px;
        text-indent: 12px;
        margin: 8px 0;
        &:first-child {
            margin-top: 16px;
        }
    }
    .content-body-desc {
        color: #999;
        font-size: 12px;
        text-indent: 12px;
    }
    .content-body-text {
        text-indent: 12px;
        margin: 8px 0;
        span {
            cursor: pointer;
            color: #036b64;
        }
    }
    .content-body-link {
        // text-indent: 12px;
        font-size: 12px;
        color: #036b64;
        text-decoration: underline;
        text-underline-offset: 3px;
        cursor: pointer;
    }
</style>