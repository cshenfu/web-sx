<template>
    <div class="project-detail-component">
        <Information :dataInfo="currentProject || {}" :showMore="false"></Information>
        <div class="detail-component">
            <a-tabs v-model:activeKey="activeKey">
                <a-tab-pane key="1" tab="项目基本信息">
                    <div class="content-body">
                        <a-row>
                            <a-col :span="8">
                                <span>项目编号</span>
                                <p>{{ projectBaseInfo.projectCode || '--' }}</p>
                            </a-col>
                            <a-col :span="8">
                                <span>项目名称</span>
                                <p style="padding-right: 24px">{{
                                    projectBaseInfo.projectName || '--'
                                }}</p>
                            </a-col>
                            <a-col :span="8">
                                <span>状态</span>
                                <p>{{ projectBaseInfo.projectStatusStr || '--' }}</p>
                            </a-col>
                            <a-col :span="8">
                                <span>项目区域</span>
                                <p>
                                    <span style="color: #363b4d">{{
                                        projectBaseInfo.provinceName
                                            ? projectBaseInfo.provinceName
                                            : '--'
                                    }}</span>
                                    <span style="color: #363b4d" v-if="projectBaseInfo.cityName">{{
                                        '/' + projectBaseInfo.cityName
                                    }}</span>
                                    <span
                                        style="color: #363b4d"
                                        v-if="projectBaseInfo.districtName"
                                        >{{ '/' + projectBaseInfo.districtName }}</span
                                    >
                                </p>
                            </a-col>
                            <a-col :span="8">
                                <span>规划总容量/本期容量</span>
                                <p>{{
                                    (projectBaseInfo.totalProjectCapacity || '--') +
                                    ' / ' +
                                    (projectBaseInfo.currentProjectCapacity || '--')
                                }}</p>
                            </a-col>
                            <a-col :span="8">
                                <span>项目类型</span>
                                <p>{{ projectBaseInfo.itemTypeStr || '--' }}</p>
                            </a-col>
                        </a-row>
                        <a-row>
                            <a-col :span="24">
                                <span>场区坐标</span>
                                <template v-if="projectBuildCondition.coordinateFile?.objectKey">
                                    <p
                                        ><a
                                            href="javascript:;"
                                            @click="
                                                downLoadFile(
                                                    projectBuildCondition.coordinateFile.objectKey,
                                                )
                                            "
                                            >{{ projectBuildCondition.coordinateFile.filename }}</a
                                        >
                                    </p>
                                </template>
                                <p v-html="formatCoordinate(projectBaseInfo.coordinate)" v-else></p>
                            </a-col>
                            <a-col :span="24">
                                <span>主要山体植被</span>
                                <p>{{
                                    projectBaseInfo.surfaceVegetationStr
                                        ? projectBaseInfo.surfaceVegetationStr
                                        : '无'
                                }}</p>
                            </a-col>
                            <a-col :span="24">
                                <span>倾向使用光伏组件</span>
                                <p>{{
                                    projectBaseInfo.preferPvModule?.length > 0
                                        ? projectBaseInfo.preferPvModule
                                        : '无'
                                }}</p>
                            </a-col>
                            <a-col :span="24">
                                <span>倾向使用逆变器</span>
                                <p>{{
                                    projectBaseInfo.preferTendInverter?.length > 0
                                        ? projectBaseInfo.preferTendInverter
                                        : '无'
                                }}</p>
                            </a-col>
                            <a-col :span="24">
                                <span>升压站坐标</span>
                                <p
                                    v-html="
                                        formatBoosterStationLocations(
                                            projectBaseInfo.boosterStationLocations,
                                        )
                                    "
                                >
                                </p>
                            </a-col>
                            <a-col :span="24">
                                <span>地形现场照片</span>
                                <div
                                    class="file-list"
                                    v-if="
                                        projectBuildCondition.terrainFiles &&
                                        projectBuildCondition.terrainFiles.length > 0
                                    "
                                >
                                    <div class="file-list-imgs">
                                        <a-image
                                            style="width: 50px; height: 50px; font-size: 12px"
                                            v-for="(
                                                m, childIndex
                                            ) in projectBuildCondition.terrainFiles"
                                            :src="m.obsPath"
                                            :key="childIndex"
                                        ></a-image>
                                    </div>
                                </div>
                                <template v-else>
                                    <p>未上传数据</p>
                                </template>
                            </a-col>
                        </a-row>
                    </div>
                </a-tab-pane>
                <a-tab-pane key="2" tab="项目建设条件" force-render>
                    <div class="content-body">
                        <a-row>
                            <a-col :span="24">
                                <span>拟接入变电站额定电压</span>
                                <!-- <p>{{projectBuildCondition.substationRatedVoltage == 1 ? '110kV' :projectBuildCondition.substationRatedVoltage == 2 ? '220kV' : '--'}}</p> -->
                                <p>{{ projectBuildCondition.substationRatedVoltage }}kV</p>
                            </a-col>
                            <a-col :span="24">
                                <span>地质勘查报告</span>
                                <template
                                    v-if="
                                        projectBuildCondition.geologicalSurveyReportFile?.objectKey
                                    "
                                >
                                    <p
                                        >{{ '(' + projectBuildCondition.geologicalReportType + ') '
                                        }}<a
                                            href="javascript:;"
                                            @click="
                                                downLoadFile(
                                                    projectBuildCondition.geologicalSurveyReportFile
                                                        .objectKey,
                                                )
                                            "
                                            >{{
                                                projectBuildCondition.geologicalSurveyReportFile
                                                    .filename
                                            }}</a
                                        >
                                    </p>
                                </template>
                                <template v-else>
                                    <p>未上传数据</p>
                                </template>
                            </a-col>
                            <a-col :span="24">
                                <span>地形图</span>
                                <template
                                    v-if="projectBuildCondition.topographicMapFile?.objectKey"
                                >
                                    <p
                                        ><a
                                            href="javascript:;"
                                            @click="
                                                downLoadFile(
                                                    projectBuildCondition.topographicMapFile
                                                        .objectKey,
                                                )
                                            "
                                            >{{
                                                projectBuildCondition.topographicMapFile.filename
                                            }}</a
                                        >
                                    </p>
                                </template>
                                <template v-else>
                                    <p>未上传数据</p>
                                </template>
                            </a-col>
                            <a-col :span="24">
                                <span>避让区域</span>
                                <template
                                    v-if="
                                        projectBuildCondition.avoidAreasFiles &&
                                        projectBuildCondition.avoidAreasFiles.length
                                    "
                                >
                                    <p>
                                        <span
                                            class="area-name"
                                            v-for="item in projectBuildCondition.avoidAreasFiles"
                                            @click="downLoadFile(item.objectKey)"
                                            >{{ item.filename }}</span
                                        >
                                    </p>
                                </template>
                                <template v-else>
                                    <p>未上传数据</p>
                                </template>
                            </a-col>
                            <a-col :span="24">
                                <span>可布置区域</span>
                                <template
                                    v-if="
                                        projectBuildCondition.canDeployableAreaFiles &&
                                        projectBuildCondition.canDeployableAreaFiles.length
                                    "
                                >
                                    <p>
                                        <span
                                            class="area-name"
                                            v-for="item in projectBuildCondition.canDeployableAreaFiles"
                                            @click="downLoadFile(item.objectKey)"
                                            >{{ item.filename }}</span
                                        >
                                    </p>
                                </template>
                                <template v-else>
                                    <p>未上传数据</p>
                                </template>
                            </a-col>
                            <a-col :span="8">
                                <span>线路铺设方式</span>
                                <template v-if="projectBuildCondition.cableLayingMethodDesc">
                                    <p>{{ projectBuildCondition.cableLayingMethodDesc }}</p>
                                </template>
                                <template v-else>
                                    <p>--</p>
                                </template>
                            </a-col>
                            <a-col :span="8">
                                <span>覆冰厚度</span>
                                <template v-if="projectBuildCondition.iceThicknessDesc">
                                    <p>{{ projectBuildCondition.iceThicknessDesc }}</p>
                                </template>
                                <template v-else>
                                    <p>--</p>
                                </template>
                            </a-col>
                            <a-col :span="8">
                                <span>电网污秽等级</span>
                                <template v-if="projectBuildCondition.powerGridDirtLevelDesc">
                                    <p>{{ projectBuildCondition.powerGridDirtLevelDesc }}</p>
                                </template>
                                <template v-else>
                                    <p>--</p>
                                </template>
                            </a-col>
                            <a-col :span="8">
                                <span>接入系统报告</span>
                                <template v-if="projectBuildCondition.systemReportFile?.objectKey">
                                    <p
                                        ><a
                                            href="javascript:;"
                                            @click="
                                                downLoadFile(
                                                    projectBuildCondition.systemReportFile
                                                        .objectKey,
                                                )
                                            "
                                            >{{
                                                projectBuildCondition.systemReportFile.filename
                                            }}</a
                                        >
                                    </p>
                                </template>
                                <template v-else>
                                    <p>未上传数据</p>
                                </template>
                            </a-col>
                            <a-col :span="8">
                                <span>拟接入变电站名称</span>
                                <p>{{
                                    projectBuildCondition.accessSubstationName
                                        ? projectBuildCondition.accessSubstationName
                                        : '--'
                                }}</p>
                            </a-col>
                            <a-col :span="8">
                                <span>拟接入变电站位置</span>
                                <p>{{
                                    projectBuildCondition.accessSubstationPoints
                                        ? projectBuildCondition.accessSubstationPoints
                                        : '--'
                                }}</p>
                            </a-col>
                            <a-col :span="24">
                                <span>气象站相关数据</span>
                                <template
                                    v-if="projectBuildCondition.weatherStationDataFile?.objectKey"
                                >
                                    <p
                                        ><a
                                            href="javascript:;"
                                            @click="
                                                downLoadFile(
                                                    projectBuildCondition.weatherStationDataFile
                                                        .objectKey,
                                                )
                                            "
                                            >{{
                                                projectBuildCondition.weatherStationDataFile
                                                    .filename
                                            }}</a
                                        >
                                    </p>
                                </template>
                                <template v-else>
                                    <p>未上传数据</p>
                                </template>
                            </a-col>
                            <a-col :span="24">
                                <span>环评报告</span>
                                <template v-if="projectBuildCondition.eiaReportFile?.objectKey">
                                    <p
                                        ><a
                                            href="javascript:;"
                                            @click="
                                                downLoadFile(
                                                    projectBuildCondition.eiaReportFile.objectKey,
                                                )
                                            "
                                            >{{ projectBuildCondition.eiaReportFile.filename }}</a
                                        >
                                    </p>
                                </template>
                                <template v-else>
                                    <p>未上传数据</p>
                                </template>
                            </a-col>
                            <a-col :span="24">
                                <span>水保报告</span>
                                <template
                                    v-if="
                                        projectBuildCondition.waterConservationReportFile?.objectKey
                                    "
                                >
                                    <p
                                        ><a
                                            href="javascript:;"
                                            @click="
                                                downLoadFile(
                                                    projectBuildCondition
                                                        .waterConservationReportFile.objectKey,
                                                )
                                            "
                                            >{{
                                                projectBuildCondition.waterConservationReportFile
                                                    .filename
                                            }}</a
                                        >
                                    </p>
                                </template>
                                <template v-else>
                                    <p>未上传数据</p>
                                </template>
                            </a-col>
                        </a-row>
                    </div>
                </a-tab-pane>
                <a-tab-pane key="3" tab="项目投资设置">
                    <EditTable :columns="columns" :dataSource="dataSource">
                        <!-- <template #name="{record}">
                            {{record.}}
                        </template> -->
                    </EditTable>
                </a-tab-pane>
            </a-tabs>
            <!-- <a-table :dataSource="tableData" :columns="columns2"></a-table> -->
            <!-- <h4 class="content-title">
                <img src="../../assets/img/user/detail-title.png" alt="" />
                主要操作日志
            </h4>
            <ProjectLog></ProjectLog> -->
        </div>
    </div>
</template>
<style scoped lang="scss">
    @import '../ProjectDetail.scss';
</style>
<script setup>
    import { reactive, ref, onMounted, computed } from 'vue';
    import { useRoute } from 'vue-router';
    import Information from '../../userList/detail/components/Information.vue';
    import EditTable from '../components/editTable/EditTable.vue';
    import ProjectLog from '../components/Log/Log.vue';
    import { getLightProjectDetail } from '@/api/modules/lightProject/project';
    import { getTempDownloadUrl } from '@/api/modules/public';
    import { getTowerImg } from '../projectList';
    const route = useRoute();
    const tableData = ref([]);
    const activeKey = ref('1');
    const computedRowSpan = (data, key) => {
        const rowSpanData = Array(data.length).fill(1);
        let i = 0;

        while (i < data.length) {
            let count = 1;
            while (i + count < data.length && data[i][key] === data[i + count][key]) {
                rowSpanData[i + count] = 0;
                count++;
            }
            rowSpanData[i] = count;
            i += count;
        }

        return rowSpanData;
    };
    const rangYear = ref(1);
    const warrantyOutFixX1Y1 = () => {
        return `修理费（质保期外${rangYear.value + 1}-${
            Math.ceil((25 - rangYear.value) / 2) + rangYear.value
        }年）`;
    };
    const warrantyOutFixX2X25 = () => {
        return `修理费（质保期外${
            Math.ceil((25 - rangYear.value) / 2) + rangYear.value + 1
        }-25年）`;
    };
    // 数据源常量
    const dataSource = ref([
        {
            name: '光伏组件单价',
            dataIndex: 'pvMondule',
            unit: '元/kW',
            default: 700,
            price: null,
            min: 100,
            max: 10000,
            type: '设备单价',
        },
        {
            name: '逆变器单价',
            dataIndex: 'tendInverter',
            unit: '元/kW',
            default: 8,
            price: null,
            min: 1,
            max: 100,
            type: '设备单价',
        },
        {
            name: '主变压器单价',
            dataIndex: 'mainTransformer',
            unit: '元/MVA',
            default: 50000,
            price: null,
            min: 10000,
            max: 100000,
            type: '设备单价',
        },
        {
            name: '箱变单价',
            dataIndex: 'boxTransformer',
            unit: '元/kVA',
            default: 95,
            price: null,
            min: 10,
            max: 1000,
            type: '设备单价',
        },
        {
            name: '光伏支架单价',
            dataIndex: 'pvBracket',
            unit: '元/t',
            default: 7500,
            price: null,
            min: 1000,
            max: 100000,
            type: '设备单价',
        },
        {
            name: `项目资本金比例`,
            dataIndex: 'fundingRatio',
            unit: '%',
            default: 20,
            price: null,
            min: 20,
            max: 100,
            type: '融资金额',
        },
        {
            name: `长期贷款利率`,
            dataIndex: 'longLoanRate',
            unit: '%',
            default: 3.85,
            price: null,
            min: 0,
            max: 20,
            type: '融资金额',
        },
        {
            name: `短期贷款利率`,
            dataIndex: 'shortLoanRate',
            unit: '%',
            default: 3.35,
            price: null,
            min: 0,
            max: 20,
            type: '融资金额',
        },
        {
            name: `流动资金贷款利率`,
            dataIndex: 'workingCapitalLoanRate',
            unit: '%',
            default: 3.35,
            price: null,
            min: 0,
            max: 20,
            type: '融资金额',
        },
        {
            name: '定员人数',
            dataIndex: 'fixNumPerson',
            unit: '人',
            default: 8,
            price: null,
            min: 1,
            max: 100,
            type: '运维费用',
        },
        {
            name: '人工工资（不含福利）',
            dataIndex: 'wages',
            unit: '人/年',
            default: 80000,
            price: null,
            min: 50000,
            max: 1000000,
            type: '运维费用',
        },
        {
            name: '保险费率',
            dataIndex: 'safeRate',
            unit: '%',
            default: 0.25,
            price: null,
            min: 0,
            max: 1,
            type: '运维费用',
        },
        {
            name: '光伏组件质保期',
            dataIndex: 'deviceWarranty',
            unit: '年',
            default: 3,
            price: null,
            min: 1,
            max: 50,
            type: '运维费用',
        },
        {
            name: '设备折旧年限',
            dataIndex: 'equipmentDepreciationPeriod',
            unit: '年',
            default: 20,
            price: null,
            min: 5,
            max: 20,
            type: '运维费用',
        },
        {
            name: '设备折旧残值',
            dataIndex: 'equipmentDepreciationResidual',
            unit: '%',
            default: 5,
            price: null,
            min: 0,
            max: 5,
            type: '运维费用',
        },
        {
            name: '修理费（质保期内）',
            dataIndex: 'warrantyInFix',
            unit: '固定资产原值%',
            default: 16,
            price: null,
            min: 0,
            max: 1000,
            type: '运维费用',
        },
        {
            name: warrantyOutFixX1Y1(),
            dataIndex: 'warrantyOutFixX1Y1',
            unit: '固定资产原值%',
            default: 0.3,
            price: null,
            min: 0.01,
            max: 1,
            type: '运维费用',
        },
        {
            name: warrantyOutFixX2X25(),
            dataIndex: 'warrantyOutFixX2X25',
            unit: '固定资产原值%',
            default: 0.5,
            price: null,
            min: 0.01,
            max: 1,
            type: '运维费用',
        },
        {
            name: '材料费',
            dataIndex: 'warrantyMaterial',
            unit: '元/kW',
            default: 8,
            price: null,
            min: 0,
            max: 100,
            type: '运维费用',
        },
        {
            name: '其他费',
            dataIndex: 'otherFee',
            unit: '元/kW',
            default: 30,
            price: null,
            min: 0,
            max: 100,
            type: '运维费用',
        },
        {
            name: '长期租地费用',
            dataIndex: 'longTermLandRentalCosts',
            unit: '元/亩/年',
            default: 600,
            price: null,
            min: 0,
            max: 10000,
            type: '用地费用',
        },
        {
            name: '永久征地费',
            dataIndex: 'permanentLandTaxCollection',
            unit: '元/亩',
            default: 150000,
            price: null,
            min: 100000,
            max: 1000000,
            type: '用地费用',
        },
        {
            name: '耕地占用税',
            dataIndex: 'farmlandOccupationTax',
            unit: '元/亩',
            default: 330,
            price: null,
            min: 100,
            max: 1000,
            type: '用地费用',
        },
        {
            name: '耕地占用面积',
            dataIndex: 'farmlandOccupationTax',
            unit: '亩',
            default: 0,
            price: null,
            min: 0,
            max: 1000000,
            type: '用地费用',
            isEdit: true,
        },
        {
            name: '青苗补偿费',
            dataIndex: 'compensationFeeYoungCrops',
            unit: '元/亩',
            default: 30000,
            price: null,
            min: 10000,
            max: 100000,
            type: '用地费用',
        },
        {
            name: '青苗补偿面积',
            dataIndex: 'compensationAreaYoungCrops',
            unit: '亩',
            default: 0,
            price: null,
            min: 0,
            max: 1000000,
            type: '用地费用',
            isEdit: true,
        },
        {
            name: '林地补偿费',
            dataIndex: 'forestCompensationFee',
            unit: '元/亩',
            default: 12000,
            price: null,
            min: 1000,
            max: 100000,
            type: '用地费用',
        },
        {
            name: '林地补偿面积',
            dataIndex: 'compensationAreaForestLand',
            unit: '亩',
            default: 0,
            price: null,
            min: 0,
            max: 1000000,
            type: '用地费用',
            isEdit: true,
        },
        {
            name: '基本预备费费率',
            dataIndex: 'basicContingencyRate',
            unit: '%',
            default: 0,
            price: null,
            min: 0,
            max: 100,
            type: '预备费用',
        },
    ]);
    const nameRowSpan = computedRowSpan(dataSource.value, 'type');
    // 表头常量
    const columns = ref([
        {
            title: '类型',
            dataIndex: 'type',
            width: '17%',
            align: 'center',
            customCell: (_, index) => {
                return {
                    rowSpan: nameRowSpan[index],
                };
            },
        },
        {
            title: '费用项',
            dataIndex: 'name',
            width: '15%',
            align: 'center',
        },
        {
            title: '单位',
            dataIndex: 'unit',
            width: '15%',
            align: 'center',
        },
        {
            title: '调整值',
            dataIndex: 'price',
            width: '20%',
            align: 'center',
            type: 1,
            isEdit: true,
        },
    ]);
    // 项目基本信息
    const projectBaseInfo = ref({
        projectCode: '',
        projectName: '',
        projectStatus: '',
        projectStatusStr: '',
        totalProjectCapacity: '',
        currentProjectCapacity: '',
        projectType: '',
        provinceName: '',
        cityName: '',
        districtName: '',
        terrainType: '',
        energyStorageSystem: '', // 储能系统
        coordinate: '', // 场区坐标
        preferDeviceCodes: '', // 倾向使用风机
        devicePoints: '', // 风机设备点位
        boosterStationLocations: '', // 升压站点位坐标
        itemTypeStr: '', //项目类型
    });
    // 项目建设条件
    const projectBuildCondition = ref({
        substationRatedVoltage: '', // 拟接入变电站额定电压
        windTowerDataFiles: [], // 测风塔数据
        geologicalSurveyReportFile: '', // 地质勘查报告
        geologicalReportType: '', // 1本场区2临近场区
        topographicMapFile: '', // 地形图地址
        systemReportFile: '', // 接入系统报告
        accessSubstationName: '', // 拟接入变电站名称
        accessSubstationPoints: '', // 拟接入变电站位置经纬度
        weatherStationDataFile: '', // 气象站相关数据
        eiaReportFile: '', // 环评
        waterConservationReportFile: '', // 水保
        cableLayingMethodDesc: '', //线路铺设方式
        iceThicknessDesc: '', // 覆冰厚度
        powerGridDirtLevelDesc: '', //电网污秽等级
        avoidAreasFiles: [], // 避让区域
        canDeployableAreaFiles: [], // 可布机区域
        terrainFiles: [], // 地形现场图片
        coordinateFile: [], // 场区坐标
        windTurbineFile: [], // 风机点位
    });
    // 当前项目
    const currentProject = ref();
    // 操作日志数据
    const operationLogs = ref([]);
    onMounted(() => {
        // if (sessionStorage.getItem('currentProject')){
        //     currentProject.value = JSON.parse(sessionStorage.getItem('currentProject'))
        // }
        if (route.query.id) {
            getDetailInfo();
        }
    });
    // 根据字段名称查找对应的index
    const getIndex = (dataIndex) => {
        const index = dataSource.value.findIndex((ele) => ele.dataIndex == dataIndex);
        return index;
    };
    const getDetailInfo = () => {
        getLightProjectDetail(route.query.id).then((res) => {
            console.log(res);
            if (res.code == 200) {
                const projectDetail = res.data.projectInvestmentSetup || {};
                currentProject.value = res.data.companyDetailInfo;
                projectBaseInfo.value = Object.assign(
                    projectBaseInfo.value,
                    res.data.projectBaseInfo,
                    res.data.info,
                    {},
                );
                projectBaseInfo.value.preferPvModule = JSON.parse(
                    projectBaseInfo.value.preferPvModule,
                );
                projectBaseInfo.value.preferTendInverter = JSON.parse(
                    projectBaseInfo.value.preferTendInverter,
                );
                projectBuildCondition.value = Object.assign(
                    projectBuildCondition.value,
                    res.data.projectBuildCondition,
                    {},
                );
                // 处理图片路径问题
                projectBuildCondition.value.terrainFiles &&
                    projectBuildCondition.value.terrainFiles.forEach(async (item) => {
                        let path = await getTowerImg(item.objectKey);
                        item.obsPath = path;
                    });

                rangYear.value = res.data.projectInvestmentSetup?.deviceWarranty;
                // 项目投资设置
                dataSource.value.forEach((ele) => {
                    if (ele.dataIndex == 'warrantyOutFixX1Y1') {
                        ele.name = warrantyOutFixX1Y1();
                    }
                    if (ele.dataIndex == 'warrantyOutFixX2X25') {
                        ele.name = warrantyOutFixX1Y1();
                    }
                    if (res.data.projectInvestmentSetup) {
                        ele.price = res.data.projectInvestmentSetup[ele.dataIndex];
                    }
                });
                // console.log(dataSource.value,'--数据呢---',rangYear.value);

                operationLogs.value = res.data.operationLogs;
                // console.log('数据呢', projectBuildCondition.value);
            }
        });
    };
    // 场区坐标、风机坐标格式转换
    const formatCoordinate = (data) => {
        if (data && JSON.parse(data).length > 0) {
            const regionCode = {};
            let str = '';
            JSON.parse(data).forEach((item) => {
                if (item.regionCode && !regionCode[item.regionCode]) {
                    regionCode[item.regionCode] = 1;
                    let lastIndex = str.lastIndexOf('、');
                    if (lastIndex !== -1) {
                        str = lastIndex === str.length - 1 ? str.slice(0, -1) : str;
                    }
                    str +=
                        '<span style="display:block;margin: 10px 0">第 ' +
                        item.regionCode +
                        ' 场区</span>';
                }
                str += `${item.longitude}，${item.latitude}、`;
            });
            let lastIndex = str.lastIndexOf('、');
            if (lastIndex !== -1) {
                str = lastIndex === str.length - 1 ? str.slice(0, -1) : str;
            }
            return str;
        } else {
            return '暂无';
        }
    };
    // 升压站点位转换
    const formatBoosterStationLocations = (data) => {
        let str = '';
        if (data && JSON.parse(data).length > 0) {
            JSON.parse(data).forEach((item, itemIndex) => {
                str +=
                    '<span style="display:block;margin: 10px 0">' +
                    `点位${itemIndex + 1}：${item.lng},${item.lat}——${item.isBest == true ? '最优' : '非最优'}` +
                    '</span>';
            });
            return str;
        } else {
            return '暂无';
        }
    };
    // 下载文件
    const downLoadFile = async (path) => {
        let data = `objectKey=${path}`;
        console.log('下载文件', data);
        try {
            let res = await getTempDownloadUrl(data);
            if (res.code === 200 && res.data) {
                window.open(res.data, '_blank');
            }
        } catch (err) {}
    };
</script>
