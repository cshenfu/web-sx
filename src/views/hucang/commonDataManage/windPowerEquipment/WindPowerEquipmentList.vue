<template>
    <div class="wind-power-equipment">
        <div class="btn-list">
            <!-- <div class="btn-list-item" @click="exoprtFile()"><iconpark-icon name="daochu" size="12"
          class="add-icon"></iconpark-icon>
        导出适用wt6</div> -->
            <!-- <div class="btn-list-item" @click="exoprtFile()"
                ><iconpark-icon name="daochu" size="12" class="add-icon"></iconpark-icon> 导出</div
            > -->
            <div class="btn-list-item" @click="importFile()"
                ><iconpark-icon name="daoru" size="12" class="add-icon"></iconpark-icon>
                导入数据</div
            >
            <div class="btn-list-item" @click="goPath"
                ><iconpark-icon name="xinzeng" size="12" class="add-icon"></iconpark-icon>
                新增数据</div
            >
        </div>
        <div class="user-tabs">
            <ul class="user-tabs-ul">
                <li
                    class="user-tabs-li"
                    @click="chooseTabs(2)"
                    :class="windSource == 2 ? 'active' : ''"
                    >用户数据</li
                >
                <li
                    class="user-tabs-li"
                    @click="chooseTabs(1)"
                    :class="windSource == 1 ? 'active' : ''"
                    >公共数据</li
                >
            </ul>
        </div>
        <!-- 搜索 -->
        <wind-power-equipment-list-search-bar
            ref="equipmentListRef"
            @handleSearch="handleSearch"
            @resetSearch="resetSearch"
        ></wind-power-equipment-list-search-bar>
        <!--列表  -->
        <table-list
            class="user-table"
            :loading="loading"
            :tableData="data"
            :tableColumn="computedColumn"
            :page="page"
            @getRowData="getRowData"
            @changePage="changePage"
        >
            <template #value10="record">
                <iconpark-icon :name="record.value10 == 1 ? 'you' : 'wu'"></iconpark-icon>
            </template>
            <template #deviceType="{ record }">
                {{ record.deviceType ? getDeviceType[record.deviceType] : '--' }}
            </template>
            <template #devicePowerThrustCurveId="{ record }">
                <span
                    class="check-name"
                    v-if="!record.devicePowerThrustCurveId"
                    @click.stop="goDetail(record.id, 1)"
                    >查看</span
                >
                <span class="check-name" v-if="record.devicePowerThrustCurveId"
                    >引用<br />{{ record.devicePowerThrustCurveId }}</span
                >
            </template>
            <template #deviceTowerBarrelId="{ record }">
                <span
                    class="check-name"
                    v-if="!record.deviceTowerBarrelId"
                    @click.stop="goDetail(record.id, 2)"
                    >查看</span
                >
                <span class="check-name" v-if="record.deviceTowerBarrelId"
                    >引用<br />{{ record.deviceTowerBarrelId }}</span
                >
            </template>
            <template #deviceTowerBottomLoadId="{ record }">
                <span
                    class="check-name"
                    v-if="!record.deviceTowerBottomLoadId"
                    @click.stop="goDetail(record.id, 3)"
                    >查看</span
                >
                <span class="check-name" v-if="record.deviceTowerBottomLoadId"
                    >引用<br />{{ record.deviceTowerBottomLoadId }}</span
                >
            </template>
            <template #maxLiveEnvTemperature="{ record }">
                {{ record.minLiveEnvTemperature }} ~ {{ record.maxLiveEnvTemperature }}
            </template>
            <template #maxOperateTemperature="{ record }">
                {{ record.minOperateTemperature }} ~ {{ record.maxOperateTemperature }}
            </template>
            <template #createTime="{ record }">
                {{
                    record.createTime
                        ? dayjs(record.createTime).format('YYYY-MM-DD hh:mm:ss')
                        : '--'
                }}
            </template>
            <template #operation="{ record }">
                <div class="operation-btn">
                    <template v-if="windSource == 1">
                        <span class="operation-btn-item" @click.stop="editFile(record)">编辑</span>
                        <span class="operation-btn-item" @click.stop="deleteFile(record)"
                            >删除</span
                        >
                    </template>
                    <template v-if="windSource == 2">
                        <span class="operation-btn-item" @click.stop="copyFile(record)">复制</span>
                    </template>
                    <span class="operation-btn-item" @click.stop="exportWtgFileFn(record)"
                            >导出wtg</span
                        >
                </div>
            </template>
        </table-list>
        <!-- 删除 -->
        <tips-modal
            :width="'490px'"
            title="删除提示"
            :tipType="'danger'"
            class="tip-content-modal"
            :okText="'确定删除'"
            :openTipsModal.sync="openTipsPowerModal"
            @handleChangeFileModal="handleChangeClose"
        >
            <template #contentBody>
                <div v-if="!isDeleteSucessMemo">
                    <p class="modalTip">确定删除该设备信息么？</p>
                    <span class="modalTip-memo">设备编号：{{ currentData?.deviceCode }}</span>
                    <span class="modalTip-memo">设备型号：{{ currentData?.deviceModel }}</span>
                </div>
                <div v-else>
                    <p class="modalTip">存在项目草稿或计算中项目引用该机型，暂时无法删除</p>
                    <span class="modalTip-memo">{{ isDeleteSucessMemo }}</span>
                </div>
            </template>
            <template #footerSlot v-if="isDeleteSucessMemo">
                <a-button type="primary" @click="() => handleChangeClose(fasle)"> 知道了</a-button>
            </template>
        </tips-modal>
        <!-- 导入数据 -->
        <import-file-modal
            importFileMemo="目前支持excel、wtg格式导入"
            :fileTypes="['xlsx', 'xls', 'wtg']"
            v-model:importFileFlg="importFileFlg"
            v-model:problemList="problemList"
            v-if="importFileFlg"
            @updateFIleData="updateFIleData"
        >
            <template #contentBodyHead>
                <div class="tuning-tip">
                    <iconpark-icon name="jinggao" size="18" class="success"></iconpark-icon>
                    <span class="tuning-tip-title">说明：导入相同名称的数据，会进行数据覆盖</span>
                </div>
                <div class="tuning-example"
                    >导入前请先下载excel导入模板，
                    <span
                        @click="
                            downloadFile(
                                `https://whln-prod-public.${ossClientInfo.endPointShort}/template/%E9%A3%8E%E6%9C%BA%E8%AE%BE%E5%A4%87%E5%BD%95%E5%85%A5%E6%A8%A1%E6%9D%BF-2025-05-26.xlsx`,
                            )
                        "
                        >下载模板
                    </span>
                </div>
            </template>
        </import-file-modal>
        <!-- 复制弹窗 -->
        <tips-modal
            v-if="openCopyModel"
            :width="'400px'"
            class="tip-content-modal"
            :tipType="'success'"
            :okText="'保存'"
            :openTipsModal.sync="openCopyModel"
            @handleChangeFileModal="handleChangeCopy"
        >
            <template #customTitle>
                <div class="openTitle"> 复制到公共库 </div>
            </template>
            <template #contentBody>
                <div class="copy-modal-content" style="margin-bottom: 16px">
                    <p>数据源</p>
                    <p> 所属用户: {{ currentData.userName }}</p>
                    <p> 风机编号： {{ currentData.deviceCode }}</p>
                    <p> 风机型号： {{ currentData.deviceModel }}</p>
                </div>
                <div class="openTitle">复制到公共库编号及型号</div>
                <a-form
                    :colon="false"
                    class="sort-form"
                    ref="openFormCopyRef"
                    :model="openCopyFormData"
                    :labelCol="{
                        style: {
                            width: '70px',
                            marginRight: '0',
                        },
                    }"
                    labelAlign="left"
                >
                    <a-form-item
                        label="新编号"
                        name="deviceCode"
                        :rules="[{ required: true, ElMessage: '请输入新编号' }]"
                    >
                        <a-input
                            v-model:value="openCopyFormData.deviceCode"
                            placeholder="请输入新编号"
                        />
                    </a-form-item>
                    <a-form-item
                        label="新型号"
                        name="deviceModel"
                        :rules="[{ required: true, ElMessage: '请输入新型号' }]"
                    >
                        <a-input
                            v-model:value="openCopyFormData.deviceModel"
                            placeholder="请输入新型号"
                        />
                    </a-form-item>
                </a-form>
            </template>
        </tips-modal>
    </div>
</template>

<script setup>
    import { ref, reactive, toRefs, onBeforeMount, onMounted, watchEffect, computed } from 'vue';
    import { useRoute, useRouter } from 'vue-router';
    import ImportFileModal from './components/ImportFileModal.vue';
    import WindPowerEquipmentListSearchBar from './components/WindPowerEquipmentListSearchBar.vue';
    import TableList from '@/components/tableList/TableList.vue';
    import TipsModal from '@/components/tipsDialog/TipsModal.vue';
    import { ossClientInfo } from '@/assets/js/static';
    import {
        EQUIPMENT_TABLE_LIST_CLOUMN,
        USER_EQUIPMENT_TABLE_LIST_CLOUMN,
        POWER_REGULATION,
    } from './windPowerEquipment';
    import {
        getwindPowerList,
        delwindPower,
        copyUserWindData,
        importwindPower,
        exportWtgFile,
    } from '@/api/modules/windPower.js';
    import dayjs from 'dayjs';
    import { ElMessage } from 'element-plus'
    import { removeEmptyValues } from '@/utils/removeEmptyValues.js';
    import { exportData } from '@/utils/exportXlsx.js';
    import { parseWTGXML, readFileAsText } from '@/utils/readWtgFile';
    import { getEnvUrl } from '@/api/config';
    import axios from 'axios';

    const router = useRouter();
    const importFileFlg = ref(false);
    const isDeleteSucessMemo = ref('');
    // 上传文件报错
    const problemList = ref([]);
    const windSource = ref(1); // 来源 1:公共数据 2:用户数据
    const getDeviceType = {
        1: '直驱',
        2: '双馈',
        3: '中速永磁',
        4: '半直驱'
    };
    // 赋值数据的弹窗
    const openCopyModel = ref(false);
    const openFormCopyRef = ref(null);
    const openCopyFormData = ref({
        deviceModel: '',
        deviceCode: '',
    });
    const computedColumn = computed(() => {
        let arr =
            windSource.value == 1
                ? [...EQUIPMENT_TABLE_LIST_CLOUMN]
                : [...USER_EQUIPMENT_TABLE_LIST_CLOUMN, ...EQUIPMENT_TABLE_LIST_CLOUMN];
        return arr;
    });
    const currentData = ref(null);
    // 导出wtg文件
    const exportWtgFileFn = async (val) => {
        try {
            let res = await exportWtgFile(val.id);
            const url = window.URL.createObjectURL(new Blob([res]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${val.deviceModel}.wtg`);
            document.body.appendChild(link);
            link.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(link);
        } catch (err) {}
    };
    // 导入文件
    const importFile = () => {
        importFileFlg.value = true;
    };
    // 读取文件数据，
    const handleFileUpload = async (file) => {
        if (!file) return;
        try {
            const text = await readFileAsText(file);
            const result = parseWTGXML(text);
            sessionStorage.setItem('wtgFileResult', JSON.stringify(result));
            // console.log('解析数据', result);
        } catch (error) {
            ElMessage.error('文件解析失败');
        }
    };
    // 获取上传文件
    const updateFIleData = async (file) => {
        if (file.fileType === 'wtg') {
            await handleFileUpload(file.fileList[0].originFileObj);
            router.push({
                path: '/windEquipment/add',
                query: {
                    type: 'wtg',
                },
            });
        } else {
            // 上传文件
            updateFile(file.fileList[0].originFileObj);
        }
    };
    // 上传文件
    const updateFile = async (val) => {
        try {
            let formData = new FormData();
            formData.append('file', val);
            let res = await importwindPower(formData);
            if (res.code == 200) {
                const failureNames = Object.keys(res.data.failureNames);
                let flag =
                    failureNames.length === 0 && res.data.failureNames.constructor === Object;
                if (flag) {
                    getTableData(equipmentListRef.value.searchKey);
                    problemList.value = [];
                    ElMessage.success('操作成功！');
                    importFileFlg.value = false;
                } else {
                    problemList.value = res.data.failureNames;
                    console.log('提交失败', problemList.value);
                }
            }
        } catch (error) {}
    };
    const equipmentListRef = ref();

    const loading = ref(false);
    const page = ref({
        current: 1,
        size: 10,
        total: 10000,
    });
    const data = ref([]);
    // 导出文件
    const exoprtFile = () => {
        exportData(data.value, {
            deviceCode: '设备编号',
            deviceModel: '风机型号/名称',
            manufacturer: '制造商',
            deviceCapacity: '类别',
            powerUnitPrice: '单价',
            deviceType: '风机类型',
            authLevel: '认证级别',
            powerType: '功率调节类型',
            airDensity: '空气密度(kg/m³)',
            devicePowerThrustCurveId: '功率曲线',
            wheelDiameter: '叶轮直径',
            // hubHeight: '轮毂高度',
            cutInWindSpeed: '切入风速',
            ratedWindSpeed: '额定风速',
            cutoutWindSpeed: '切出风速',
            safeWindSpeed: '安全风速',
            maxLiveEnvTemperature: '生存环境温度',
            maxOperateTemperature: '运行环境温度',
            ratedPower: '额定功率',
            ratedVoltage: '额定电压',
            ratedFrequency: '额定频率',
            deviceTowerBarrelId: '塔筒参数',
            deviceTowerBottomLoadId: '塔架底部荷载标准值',
            createTime: '创建时间',
        });
    };
    const goPath = () => {
        router.push({
            path: '/windEquipment/add',
        });
    };
    // 搜索
    const handleSearch = (val) => {
        page.value.current = 1;
        // 搜索条件
        console.log('搜索', val, page.value);
        getTableData(val);
    };
    // 重置
    const resetSearch = (val) => {
        console.log(val);
        page.value.current = 1;
        page.value.size = 10;
        handleSearch(val);
    };
    // 获取表格数据
    const getTableData = (val) => {
        console.log('请求是数据', val);
        const params = removeEmptyValues({ ...val });
        console.log(params);
        getwindPowerList({
            source: windSource.value,
            pageNo: page.value.current,
            pageSize: page.value.size,
            ...params,
        }).then((res) => {
            console.log(res);
            if (res.code == 200) {
                data.value = res.data?.list.map((m) => {
                    let str = POWER_REGULATION.filter((n) => n.value == m.powerType);
                    return {
                        ...m,
                        powerType: str.length ? str[0]['label'] : m.powerType,
                    };
                });
                page.value.total = res.data.total;
            } else {
                data.value = [];
                page.value.total = 0;
            }
        });
    };
    // 表格进详情
    const getRowData = (row) => {
        router.push({
            path: '/windEquipment/detail',
            query: {
                id: row.id,
            },
        });
        console.log('点击行', row);
    };
    // 查看详情到指定位置
    const goDetail = (id, type) => {
        console.log(id);
        sessionStorage.setItem('detailType', type);
        router.push({
            path: '/windEquipment/detail',
            query: {
                id: id,
            },
        });
    };
    // 获取页面分页
    const changePage = (val) => {
        page.value.current = val.page;
        page.value.size = val.pageSize;
        getTableData(equipmentListRef.value.searchKey);
    };
    const openTipsPowerModal = ref(false);
    // 关闭弹窗
    const handleChangeClose = (val) => {
        if (val) {
            confirmDelete();
        }
        openTipsPowerModal.value = !openTipsPowerModal.value;
        isDeleteSucessMemo.value = '';
    };
    // 编辑
    const editFile = (val) => {
        console.log('编辑', val);
        router.push({
            path: '/windEquipment/add',
            query: {
                id: val.id,
                type: 'edit',
            },
        });
    };
    // 删除
    const deleteFile = (val) => {
        currentData.value = val;
        openTipsPowerModal.value = !openTipsPowerModal.value;
    };
    // 确认删除
    const confirmDelete = () => {
        delwindPower(currentData.value.id).then((res) => {
            if (res.code == 200 && res.data) {
                ElMessage.success('操作成功！');
                handleSearch(equipmentListRef.value.searchKey);
                isDeleteSucessMemo.value = '';
            } else {
                isDeleteSucessMemo.value = res.data;
            }
        });
    };
    const chooseTabs = (val) => {
        windSource.value = val;
        page.value.current = 1;
        getTableData(equipmentListRef.value.searchKey);
    };
    // 拷贝文件
    const copyFile = (val) => {
        console.log('拷贝文件', val);

        currentData.value = val;
        openCopyModel.value = true;
        openCopyFormData.value.deviceCode = val.deviceCode;
        openCopyFormData.value.deviceModel = val.deviceModel;
    };
    const handleChangeCopy = (val) => {
        if (val) {
            openFormCopyRef.value.validate().then(() => {
                copyUserWindData({
                    deviceCode: openCopyFormData.value.deviceCode,
                    deviceModel: openCopyFormData.value.deviceModel,
                }).then((res) => {
                    if (res && res.code == 200) {
                        ElMessage.success('复制成功');
                        handleSearch(equipmentListRef.value.searchKey);
                        openCopyModel.value = false;
                    }
                });
            });
        }
    };
    const downloadFile = (path) => {
        path && window.open(path);
    };
    onBeforeMount(() => {
        //console.log('2.组件挂载页面之前执行----onBeforeMount')
    });
    onMounted(() => {
        handleSearch(equipmentListRef.value.searchKey);
        //console.log('3.-组件挂载到页面之后执行-------onMounted')
    });

    watchEffect(() => {});
</script>
<style scoped lang="scss">
  @import '@/assets/css/tabs.scss';
    .wind-power-equipment {
        position: relative;
        background-color: #fff;
        padding: 24px;
        min-height: calc(100vh - 120px);

        .btn-list {
            display: flex;
            position: absolute;
            top: -43px;
            right: 0px;

            .btn-list-item {
                height: 32px;
                border-radius: 4px;
                border: 1px solid #036b64;
                padding: 0 12px;
                font-size: 14px;
                font-weight: bold;
                color: #036b64;
                line-height: 32px;
                text-align: center;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-right: 12px;
                cursor: pointer;

                .add-icon {
                    margin-right: 5px;
                }
            }
        }
        .check-name {
            font-size: 12px;
            color: #036b64;
            cursor: pointer;
        }
        .openTitle {
            display: flex;
            align-items: center;
            margin-bottom: 16px;
            font-weight: bold;
            iconpark-icon {
                color: #ff8411;
                margin-right: 6px;
            }
        }
        .copy-modal-content {
            p {
                &:first-child {
                    font-weight: bold;
                }
                margin: 10px 0;
            }
        }
    }
    .tuning-tip {
        display: flex;
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
            line-height: 22px;
        }
    }
    .tuning-example {
        font-size: 14px;
        color: #363b4d;
        line-height: 12px;
        margin-top: 20px;

        span {
            color: #036b64;
            cursor: pointer;
        }
    }
</style>
