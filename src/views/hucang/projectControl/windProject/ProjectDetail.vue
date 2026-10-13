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
                                <span>场区地形</span>
                                <p>--</p>
                                <!-- <p>山地</p> -->
                                <div class="file-list">
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
                            </a-col>
                            <a-col :span="24">
                                <span>储能系统</span>
                                <p>{{ projectBaseInfo.energyStorageSystem || '暂无' }}</p>
                                <!-- <p>租借（配置容量占本期比例：占10%，2小时储电，租借单价：20万元MWH/年）</p> -->
                            </a-col>
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
                                <span>倾向使用风机</span>
                                <!-- <p>金风 JF-903294 6.25MW、明阳 7MW（手动填写）</p> -->
                                <p v-html="formatPreferDeviceCodes(projectBaseInfo)"></p>
                            </a-col>
                            <a-col :span="24">
                                <span>倾向轮毂高度</span>
                                <p>
                                    {{
                                        projectBaseInfo.preferHubHeight
                                            ? projectBaseInfo.preferHubHeight +
                                              projectBaseInfo.hubTypeStr
                                            : '--'
                                    }}</p
                                >
                            </a-col>
                            <a-col :span="24">
                                <span>风机点位坐标</span>
                                <template v-if="projectBuildCondition.windTurbineFile?.objectKey">
                                    <p
                                        ><a
                                            href="javascript:;"
                                            @click="
                                                downLoadFile(
                                                    projectBuildCondition.windTurbineFile.objectKey,
                                                )
                                            "
                                            >{{ projectBuildCondition.windTurbineFile.filename }}</a
                                        >
                                    </p>
                                </template>
                                <p
                                    v-html="formatCoordinate(projectBaseInfo.devicePoints)"
                                    v-else
                                ></p>
                                <!-- <p v-html="formatCoordinate( projectBaseInfo.devicePoints )"></p> -->
                            </a-col>
                            <a-col :span="24">
                                <span>升压站坐标</span>
                                <template v-if="isBoosterStationPointFile">
                                    <div>{{
                                        projectBaseInfo.userBoosterStationAreaPoint.length > 0
                                            ? '【封闭区域】'
                                            : '【中心点】'
                                    }}</div>
                                    {{
                                        projectBaseInfo.userBoosterStationAreaPoint.length > 0
                                            ? '封闭区域'
                                            : '中心点'
                                    }}
                                    （<p
                                        style="display: inline-block"
                                        v-for="(
                                            item, index
                                        ) in projectBuildCondition.boosterStationPointFile"
                                        :key="index"
                                    >
                                        <a
                                            href="javascript:;"
                                            style="display: inline-block; margin-right: 10px"
                                            @click="downLoadFile(item.objectKey)"
                                            >点位{{ index + 1 }}：{{ item.filename
                                            }}{{ item.isBest == true ? '，最优' : '，非最优' }}</a
                                        > </p
                                    >）
                                </template>
                                <template v-else>
                                    <p
                                        v-html="
                                            formatBoosterStationLocations(
                                                projectBaseInfo.boosterStationLocations,
                                            )
                                        "
                                    >
                                    </p>
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
                                <p>{{ projectBuildCondition.substationRatedVoltage }}kV</p>
                            </a-col>
                            <a-col :span="24">
                                <span>测风塔数据</span>
                                <div class="file-list">
                                    <template
                                        v-if="
                                            projectBuildCondition.windTowerDataFiles &&
                                            projectBuildCondition.windTowerDataFiles.length
                                        "
                                    >
                                        <!-- <div v-for="item in projectBuildCondition.windTowerDataFiles">
                                    <h4 @click="downLoadFile(JSON.parse(item.filePath)[0]['filePath'])">{{item.fileName}}</h4>
                                    <span v-for="ele in JSON.parse(item.filePath)[0]['children']">
                                        <a-image :src="ele" alt="" />
                                    </span>
                                </div> -->
                                        <div
                                            v-for="item in projectBuildCondition.windTowerDataFiles"
                                        >
                                            <h4 @click="downLoadFile(item.objectKey)">{{
                                                item.filename
                                            }}</h4>
                                            <div class="file-list-imgs">
                                                <a-image
                                                    style="
                                                        width: 50px;
                                                        height: 50px;
                                                        font-size: 12px;
                                                    "
                                                    v-for="(m, childIndex) in item.attachments"
                                                    :src="m.obsPath"
                                                    :key="childIndex"
                                                ></a-image>
                                            </div>
                                        </div>
                                    </template>
                                    <template v-else>
                                        <p>未上传数据</p>
                                    </template>
                                </div>
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
                                <span>可布机区域</span>
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
                            <a-col :span="8">
                                <span>送出工程接入方式</span>
                                <p>{{
                                    projectBuildCondition.sendOutType
                                        ? projectBuildCondition.sendOutType
                                        : '--'
                                }}</p>
                            </a-col>
                            <a-col :span="8">
                                <span>送出工程单价/万元</span>
                                <p>{{
                                    projectBaseInfo.sendOutUnitPrice
                                        ? projectBaseInfo.sendOutUnitPrice
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
                                <span>征地类型</span>
                                <p>{{
                                    projectBaseInfo.landAcquisitionType == 1
                                        ? '长期征地'
                                        : '永久征地'
                                }}</p>
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
                            <a-col :span="24">
                                <span>中尺度</span>
                                <template
                                    v-if="
                                        projectBuildCondition.mesoscaleFile?.objectKey
                                    "
                                >
                                    <p
                                        ><a
                                            href="javascript:;"
                                            @click="
                                                downLoadFile(
                                                    projectBuildCondition
                                                        .mesoscaleFile.objectKey,
                                                )
                                            "
                                            >{{
                                                projectBuildCondition.mesoscaleFile
                                                    .filename
                                            }}</a
                                        >
                                    </p>
                                    <p>点位坐标：{{ projectBuildCondition.mesoscalePoint }}</p>
                                </template>
                                <template v-else>
                                    <p>未上传数据</p>
                                </template>
                            </a-col>
                        </a-row>
                    </div>
                </a-tab-pane>
                <a-tab-pane key="3" tab="项目投资设置">
                    <EditTable
                        :columns="columns"
                        :dataSource="dataSource.filter((ele) => ele.show == null || ele.show)"
                    ></EditTable>
                </a-tab-pane>
                <a-tab-pane :key="4" tab="计算设置">
                    <calculation-settings
                        :activeModel="projectBaseInfo.powerRunWay"
                    ></calculation-settings>
                </a-tab-pane>
            </a-tabs>

            <!-- <ProjectLog></ProjectLog> -->
        </div>
    </div>
</template>
<style scoped lang="scss">
    @import '../ProjectDetail.scss';
</style>
<script setup>
    import { reactive, ref, onMounted } from 'vue';
    import { useRoute } from 'vue-router';
    import Information from '../../userList/detail/components/Information.vue';
    import EditTable from '../components/editTable/EditTable.vue';
    import CalculationSettings from '../components/CalculationSettings.vue';
    import ProjectLog from '../components/Log/Log.vue';
    import { getProjectDetail } from '@/api/modules/projectManage';
    import { getTempDownloadUrl } from '@/api/modules/public';
    import { getTowerImg } from '../projectList';
    const route = useRoute();
    const activeKey = ref('1');

    // 数据源常量
    const dataSource = ref([
        {
            name: '风机单价',
            dataIndex: 'windTurbineUnitPrice',
            unit: '元/kW',
            default: 1300,
            price: null,
            min: 1000,
            max: 2000,
            type: '设备相关',
        },
        {
            name: '塔筒单价',
            dataIndex: 'towerBarrelUnitPrice',
            unit: '元/t',
            default: 8500,
            price: null,
            min: 5000,
            max: 15000,
            type: '设备相关',
        },
        {
            name: '主变单价',
            dataIndex: 'mainTransformerUnitPrice',
            unit: '元/MVA',
            default: 50000,
            price: null,
            min: 47000,
            max: 55000,
            type: '设备相关',
        },
        {
            name: '箱变单价',
            dataIndex: 'boxTransformerUnitPrice',
            unit: '元/kVA',
            default: 95,
            price: null,
            min: 90,
            max: 110,
            type: '设备相关',
        },
        {
            name: '无功率补偿装置SVG单价',
            dataIndex: 'svgUnitPrice',
            unit: '元/Mvar',
            default: 70000,
            price: null,
            min: 66000,
            max: 77000,
            type: '设备相关',
        },
        {
            name: '送出工程总费用',
            dataIndex: 'sendOutTotalPrice',
            unit: '万元',
            default: 0,
            price: null,
            min: 100,
            max: 10000,
            type: '设备相关',
            desc: '说明：系统确认升压站位置后自动计算。若调整价格，则以您调整的价格为准',
        },
        {
            name: '储能设备费',
            dataIndex: 'energyStorageDeviceFee',
            unit: '万元/MWh',
            default: 70,
            price: null,
            min: 60,
            max: 80,
            type: '设备相关',
            show: false, // 只有储能系统为自建情况下才显示
        },
        {
            name: '项目资金比例',
            dataIndex: 'fundingRatio',
            unit: '%',
            default: 20,
            price: null,
            min: 20,
            max: 100,
            type: '资金及费率',
        },
        {
            name: '长期贷款利率',
            dataIndex: 'longLoanRate',
            unit: '%',
            default: 3.95,
            price: null,
            min: 0,
            max: 20,
            type: '资金及费率',
        },
        {
            name: '短期贷款利率',
            dataIndex: 'shortLoanRate',
            unit: '%',
            default: 3.55,
            price: null,
            min: 0,
            max: 20,
            type: '资金及费率',
        },
        {
            name: '基本预备费费率',
            dataIndex: 'basicContingencyRate',
            unit: '%',
            default: 3,
            price: null,
            min: 1,
            max: 3,
            type: '预备费',
        },
        {
            name: '上网电价',
            dataIndex: 'feedInTariff',
            unit: '元/kWh',
            default: '系统自动取费',
            price: null,
            min: 1,
            max: 3,
            type: '发电上网',
        },
        {
            name: '限电比例',
            dataIndex: 'powerRationingRatio',
            unit: '%',
            default: 0,
            price: null,
            min: 1,
            max: 3,
            type: '发电上网',
        },
        {
            name: '工程前期费',
            dataIndex: 'preConstructionFee',
            unit: '万元',
            default: 80,
            price: null,
            min: 0,
            max: 10000,
            type: '其他',
        },
        {
            name: '勘查费',
            dataIndex: 'surveyFee',
            unit: '万元',
            default: '系统自动计算',
            price: null,
            min: 0,
            max: 10000,
            type: '其他',
            desc: '说明：系统会根据实际项目容量自动计算。若调整价格，则以您调整的价格为准',
        },
        {
            name: '设计费',
            dataIndex: 'designFee',
            unit: '万元',
            default: '系统自动计算',
            price: null,
            min: 0,
            max: 10000,
            type: '其他',
            desc: '说明：系统会根据实际项目容量自动计算。若调整价格，则以您调整的价格为准',
        },
        {
            name: '环境保护工程',
            dataIndex: 'environmentalProtectionFee',
            unit: '万元',
            default: '系统自动计算',
            price: null,
            min: 0,
            max: 10000,
            type: '其他',
            desc: '说明：系统会根据实际项目容量自动计算。若调整价格，则以您调整的价格为准',
        },
        {
            name: '水土保持工程',
            dataIndex: 'waterSoilConservationFee',
            unit: '万元',
            default: '系统自动计算',
            price: null,
            min: 0,
            max: 10000,
            type: '其他',
            desc: '说明：系统会根据实际项目容量自动计算。若调整价格，则以您调整的价格为准',
        },
        {
            name: '劳动安全与职业卫生工程',
            dataIndex: 'laborSafetyOccupationalHygieneFee',
            unit: '万元',
            default: '系统自动计算',
            price: null,
            min: 0,
            max: 10000,
            type: '其他',
            desc: '说明：系统会根据实际项目容量自动计算。若调整价格，则以您调整的价格为准',
        },
        {
            name: '水土保持补偿费',
            dataIndex: 'waterSoilConservationCompensationFee',
            unit: '万元',
            default: '系统自动计算',
            price: null,
            min: 0,
            max: 10000,
            type: '其他',
            desc: '说明：系统会根据实际项目容量自动计算。若调整价格，则以您调整的价格为准',
        },
        {
            name: '定员人数',
            dataIndex: 'fixNumPerson',
            unit: '人',
            default: 12,
            price: null,
            min: 1,
            max: 100,
            type: '运维',
        },
        {
            name: '人工工资（不含福利）',
            dataIndex: 'wages',
            unit: '元/人/年',
            default: 80000,
            price: null,
            min: 50000,
            max: 1000000,
            type: '运维',
        },
        {
            name: '风机质保期',
            dataIndex: 'deviceWarranty',
            unit: '年',
            default: 5,
            price: null,
            min: 1,
            max: 50,
            type: '运维',
        },
        {
            name: '材料费（质保期内）',
            dataIndex: 'warrantyInMaterial',
            unit: '元/kW',
            default: 20,
            price: null,
            min: 0,
            max: 100,
            type: '运维',
        },
        {
            name: '材料费（质保期外）',
            dataIndex: 'warrantyOutMaterial',
            unit: '元/kW',
            default: 30,
            price: null,
            min: 0,
            max: 100,
            type: '运维',
        },
        {
            name: '其他费',
            dataIndex: 'otherFee',
            unit: '元/kW',
            default: 50,
            price: null,
            min: 0,
            max: 100,
            type: '运维',
        },
        {
            name: '保险费率',
            dataIndex: 'safeRate',
            unit: '%',
            default: 0.25,
            price: null,
            min: 0,
            max: 1,
            type: '运维',
        },
        {
            name: '修理费（质保期内）',
            dataIndex: 'warrantyInFix',
            unit: '元/kW',
            default: 25,
            price: null,
            min: 0,
            max: 100,
            type: '运维',
        },
        {
            name: '修理费（质保期外）',
            dataIndex: 'warrantyOutFix',
            unit: '元/kM',
            default: 30,
            price: null,
            min: 0,
            max: 100,
            type: '运维',
        },
        {
            name: '折旧年限',
            dataIndex: 'depreciationPeriod',
            unit: '年',
            default: 20,
            price: null,
            min: 5,
            max: 20,
            type: '运维',
        },
        {
            name: '折旧残值',
            dataIndex: 'depreciationResidual',
            unit: '%',
            default: 5,
            price: null,
            min: 0,
            max: 5,
            type: '运维',
        },
        {
            name: '永久征地费',
            dataIndex: 'landAcquisitionFee',
            unit: '元/亩',
            default: 246790,
            price: null,
            min: 25000,
            max: 800000,
            type: '用地',
        },
        {
            name: '长期征地费',
            dataIndex: 'longLandAcquisitionFee',
            unit: '元/亩',
            default: 113390,
            price: null,
            min: 10500,
            max: 200000,
            type: '用地',
        },
        {
            name: '永久征地补偿费',
            dataIndex: 'landCompensation',
            unit: '元/亩',
            default: 213440,
            price: null,
            min: 105000,
            max: 300000,
            type: '用地',
        },
        {
            name: '临时用地租用费',
            dataIndex: 'tempLandRentalFee',
            unit: '元/亩',
            default: 6670,
            price: null,
            min: 500,
            max: 8000,
            type: '用地',
        },
        {
            name: '土地使用税',
            dataIndex: 'landUseTax',
            unit: '元/亩',
            default: 10000,
            price: null,
            min: 3000,
            max: 15000,
            type: '用地',
        },
        {
            name: '土地复垦费',
            dataIndex: 'landReclamationFee',
            unit: '元/亩',
            default: 150000,
            price: null,
            min: 40000,
            max: 180000,
            type: '用地',
        },
        {
            name: '青苗补偿费',
            dataIndex: 'youngCropCompensationFee',
            unit: '元/亩',
            default: 30000,
            price: null,
            min: 12000,
            max: 35000,
            type: '用地',
        },
        {
            name: '青苗补偿占用面积',
            dataIndex: 'youngCropCompensationOccupiedArea',
            unit: '亩',
            default: '系统自动计算',
            price: null,
            min: 0,
            max: 10000000,
            type: '用地',
            desc: '说明：系统会根据实际占用的相关土地面积自动计算。若调整则以您调整的面积为准',
        },
        {
            name: '林地林木补偿费',
            dataIndex: 'forestLandCompensationFee',
            unit: '元/亩',
            default: 13340,
            price: null,
            min: 8000,
            max: 20000,
            type: '用地',
        },
        {
            name: '林地林木占用面积',
            dataIndex: 'forestLandOccupiedArea',
            unit: '亩',
            default: '系统自动计算',
            price: null,
            min: 0,
            max: 10000000,
            type: '用地',
            desc: '说明：系统会根据实际占用的相关土地面积自动计算。若调整则以您调整的面积为准',
        },
        {
            name: '耕地占用税',
            dataIndex: 'farmlandOccupiedTax',
            unit: '元/亩',
            default: 10000,
            price: null,
            min: 2500,
            max: 66700,
            type: '用地',
        },
        {
            name: '耕地占用面积',
            dataIndex: 'farmlandOccupiedArea',
            unit: '亩',
            default: '系统自动计算',
            price: null,
            min: 0,
            max: 10000000,
            type: '用地',
            desc: '说明：系统会根据实际占用的相关土地面积自动计算。若调整则以您调整的面积为准',
        },
        // {
        //     name: '风电机组5MW',
        //     dataIndex: 'windGroupJson',
        //     unit: '元/kW',
        //     default: '--',
        //     price: null,
        //     min: 1300,
        //     max: 1800,
        //     isEdit: true,
        // },
        // {
        //     name: '塔筒387.21t',
        //     dataIndex: 'towerJson',
        //     unit: '元/t',
        //     default: '--',
        //     price: null,
        //     min: 9800,
        //     max: 10800,
        //     isEdit: true,
        // },
        // {
        //     name: '主变压器SZ18-100000/110',
        //     dataIndex: 'boosterJson',
        //     unit: '元/台',
        //     default: '--',
        //     price: null,
        //     min: 20,
        //     max: 100,
        //     isEdit: true,
        // },
        // {
        //     name: '110kV GIS组合电器',
        //     dataIndex: 'fundingRatio',
        //     unit: '元/套',
        //     default: 20,
        //     price: null,
        //     min: 20,
        //     max: 100,
        //     isEdit: true,
        // },
        // {
        //     name: `无功补偿装置SVG（±20Mvar，35kV）`,
        //     dataIndex: 'svgGroupJson',
        //     unit: '元/套',
        //     default: '--',
        //     price: null,
        //     min: 20,
        //     max: 100,
        //     isEdit: true,
        // },

        //  {
        //     name: '送出工程总费用',
        //     dataIndex: 'sendOutTotalPrice',
        //     unit: '万元',
        //     default: '系统确认升压站位置后自动计算',
        //     // 填写升压站并且输入接入站位置，后台根据公式算出来一个默认值；未填写升压站但填写了接入站位置，默认值换成“系统确认升压站位置后自动计算”；未填写接入站位置，默认值换成0。用户调整值以调整值为准
        //     price: null,
        //     min: 100,
        //     max: 10000,
        // },
    ]);
    // 倾向轮毂高度>140m时，dataSource中删掉塔筒单价，替换混塔塔筒单价
    const hunTower = {
        name: '混塔塔筒单价',
        dataIndex: 'mixTowerBarrelUnitPrice',
        unit: '元/kW',
        default: 800,
        price: null,
        min: 800,
        max: 1200,
        type: '设备相关',
    };
    const computedRowSpan = (data, key) => {
        // console.log(data);
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
    const nameRowSpan = ref([]);
    nameRowSpan.value = computedRowSpan(
        dataSource.value.filter((ele) => ele.show == null || ele.show),
        'type',
    );
    const isBoosterStationPointFile = ref(false);
    // 表头常量
    const columns = ref([
        {
            title: '类型',
            dataIndex: 'type',
            width: '17%',
            align: 'center',
            customCell: (_, index) => {
                return {
                    rowSpan: nameRowSpan.value[index],
                };
            },
        },
        {
            title: '费用项',
            dataIndex: 'name',
            width: '28%',
            align: 'center',
        },
        {
            title: '单位',
            dataIndex: 'unit',
            width: '15%',
            align: 'center',
        },
        // {
        //     title: '默认值',
        //     dataIndex: 'default',
        //     width: '20%',
        //     isDesc: true,
        //     align: 'center',
        // },
        {
            title: '调整值',
            dataIndex: 'price',
            width: '20%',
            align: 'center',
            // isEdit: true,
            type: 1,
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
        itemTypeStr: '', //项目类型,
        userBoosterStationAreaPoint: [], //封闭区域
        hubTypeStr: '',
        hubType: '',
        powerRunWay: null, // 模型切换
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
        boosterStationPointFile: [], //升压站
        mesoscaleFile: [], // 中尺度文件
        mesoscalePoint: [], // 中尺度坐标
    });
    // 当前项目
    const currentProject = ref();
    // 操作日志数据
    const operationLogs = ref([]);
    onMounted(() => {
        if (sessionStorage.getItem('currentProject')) {
            currentProject.value = JSON.parse(sessionStorage.getItem('currentProject'));
        }
        if (route.query.id) {
            getDetailInfo();
        }
    });
    const getDetailInfo = () => {
        getProjectDetail(route.query.id).then((res) => {
            console.log(res);
            if (res.code == 200 && res.data) {
                const projectDetail = res.data.projectInvestmentSetup || {};
                currentProject.value = res.data.companyDetailInfo;
                projectBaseInfo.value = Object.assign(
                    projectBaseInfo.value,
                    res.data.projectBaseInfo,
                    {},
                );
                projectBaseInfo.value.hubTypeStr = projectBaseInfo.value.hubType
                    ? '【指定】'
                    : '【倾向】';
                projectBuildCondition.value = Object.assign(
                    projectBuildCondition.value,
                    res.data.projectBuildCondition,
                    {},
                );
                // 大于140m，
                
                if (projectBaseInfo.value.preferHubHeight > 140) {
                    dataSource.value.splice(1, 1, hunTower);
                }
                // 新增的升压站转换
                projectBaseInfo.value.userBoosterStationAreaPoint = projectBaseInfo.value
                    .userBoosterStationAreaPoint
                    ? JSON.parse(projectBaseInfo.value.userBoosterStationAreaPoint)
                    : [];
                isBoosterStationPointFile.value =
                    projectBuildCondition.value.boosterStationPointFile?.length > 0 ? true : false;
                // 项目投资设置
                for (let index = 0; index < dataSource.value.length; index++) {
                    const ele = dataSource.value[index];
                    ele.price =
                        res.data.projectInvestmentSetup[ele.dataIndex] == null
                            ? ele.default
                            : res.data.projectInvestmentSetup[ele.dataIndex];
                    if (ele.dataIndex == 'energyStorageDeviceFee') {
                        // 储能设备费，如果不是自建不需要展示
                        ele.show =
                            res.data.projectBaseInfo.energyStorageSystem.indexOf('自建') > -1;
                    }
                }

                operationLogs.value = res.data.operationLogs;
                projectBuildCondition.value.terrainFiles &&
                    projectBuildCondition.value.terrainFiles.forEach(async (item) => {
                        let path = await getTowerImg(item.objectKey);
                        item.obsPath = path;
                    });
                projectBuildCondition.value.windTowerDataFiles &&
                    projectBuildCondition.value.windTowerDataFiles.forEach((item) => {
                        item.attachments.forEach(async (m) => {
                            let path = await getTowerImg(m.objectKey);
                            m.obsPath = path;
                        });
                    });
                nameRowSpan.value = computedRowSpan(
                    dataSource.value.filter((ele) => ele.show == null || ele.show),
                    'type',
                );
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
                    '<span style="margin: 10px">' +
                    `点位${itemIndex + 1}：${item.lng},${item.lat}——${item.isBest == true ? '最优' : '非最优'}` +
                    '</span>';
            });
            return `<div >【中心点】</div><p>中心点（${str}）</p>`;
        } else {
            return '暂无';
        }
    };
    // 倾向使用风机
    const formatPreferDeviceCodes = (data) => {
        let str = '';
        if (data.preferDeviceCodes && data.preferDeviceCodes.split(';').length > 0) {
            const datas = data.preferDeviceCodes.split(';');
            datas.forEach((item, itemIndex) => {
                let dataTypeStr = item.split(',')[2] == 1 ? '【平台库】' : '【用户库】';
                str +=
                    dataTypeStr +
                    item.split(',')[0] +
                    ' ' +
                    item.split(',')[1] +
                    (itemIndex == datas.length - 1 ? '' : '、');
            });
            return str + '（手动填写）';
        } else {
            return '暂无';
        }
    };
    // 下载文件
    const downLoadFile = async (path) => {
        let data = `objectKey=${path}`;
        try {
            let res = await getTempDownloadUrl(data);
            if (res.code === 200 && res.data) {
                window.open(res.data, '_blank');
            }
        } catch (err) {}
    };
</script>
