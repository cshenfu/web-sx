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
                            <a-col :span="8">
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
                            <a-col :span="8">
                                <span>风机机型</span>
                                <p> {{ formatDeviceCodes( projectBaseInfo.preferDeviceCodes ) }}</p>
                            </a-col>
                            <a-col :span="8">
                                <span>轮毂高度</span>
                                <p v-if="projectBaseInfo.preferHubHeight">{{ projectBaseInfo.hubType ? '倾向' : '指定' }} {{ projectBaseInfo.preferHubHeight + 'm' }}</p>
                                <p v-else>--</p>
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
                                <span>储能系统</span>
                                <p>{{ projectBaseInfo.energyStorageSystem || '暂无' }}</p>
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
                <a-tab-pane key="2" tab="项目投资设置" force-render>
                    <EditTable :columns="columns" :dataSource="dataSource"></EditTable>
                </a-tab-pane>
            </a-tabs>
            <!-- <h4 class="content-title">
                <img src="@/assets/img/user/detail-title.png" alt="" />
                项目基本信息
            </h4>
            
            <h4 class="content-title">
                <img src="@/assets/img/user/detail-title.png" alt="" />
                项目投资设置
            </h4> -->

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
    import { reactive, ref, onMounted } from 'vue';
    import { useRoute } from 'vue-router';
    import Information from '../../userList/detail/components/Information.vue';
    import EditTable from '../components/editTable/EditTable.vue';
    import ProjectLog from '../components/Log/Log.vue';
    import { getProjectDetail } from '@/api/modules/projectManage';
    import { getTempDownloadUrl } from '@/api/modules/public';
    import { getTowerImg } from '../projectList';
    const route = useRoute();
    const activeKey = ref('1');

    // 数据源常量
    const dataSource = ref([
        {
            name: '项目资金比例',
            dataIndex: 'fundingRatio',
            unit: '%',
            default: 20,
            price: null,
        },
        {
            name: `单位静态投资(不含储能)`,
            dataIndex: 'unitStaticInvestment',
            unit: '元/kW',
            default: 5000,
            price: null,
        },
        {
            name: '储能单位静态投资',
            dataIndex: 'investmentEnergyStorageUnits',
            unit: '元/kW·h',
            default: 10,
            price: null,
        },
        {
            name: '定员人数 ',
            dataIndex: 'fixNumPerson',
            unit: '人',
            default: 12,
            price: null,
        },
        {
            name: '人工工资（不含福利）',
            dataIndex: 'wages',
            unit: '人/年',
            default: 80000,
            price: null,
        },
        {
            name: '长期贷款利率',
            dataIndex: 'longLoanRate',
            unit: '%',
            default: 3.95,
            price: null,
        },
        {
            name: '短期贷款利率',
            dataIndex: 'shortLoanRate',
            unit: '%',
            default: 3.55,
            price: null,
        },
        {
            name: '风机质保期',
            dataIndex: 'deviceWarranty',
            unit: '年',
            default: 5,
            price: null,
        },
        {
            name: '材料费（质保期内）',
            dataIndex: 'warrantyInMaterial',
            unit: '元/kW',
            default: 20,
            price: null,
        },
        {
            name: '材料费（质保期外）',
            dataIndex: 'warrantyOutMaterial',
            unit: '元/kW',
            default: 30,
            price: null,
        },
        {
            name: '其他费',
            dataIndex: 'otherFee',
            unit: '元/kW',
            default: 50,
            price: null,
        },
        {
            name: '保险费率',
            dataIndex: 'safeRate',
            unit: '%',
            default: 0.25,
            price: null,
            min: 0,
            max: 1,
        },
        {
            name: '修理费（质保期内）',
            dataIndex: 'warrantyInFix',
            unit: '元/kW',
            default: 25,
            price: null,
        },
        {
            name: '修理费（质保期外）',
            dataIndex: 'warrantyOutFix',
            unit: '元/kW',
            default: 30,
            price: null,
        },
        {
            name: '折旧年限',
            dataIndex: 'depreciationPeriod',
            unit: '年',
            default: 20,
            price: null,
        },
        {
            name: '折旧残值',
            dataIndex: 'depreciationResidual',
            unit: '%',
            default: 5,
            price: null,
        },
    ]);
    // 表头常量
    const columns = reactive([
        {
            title: '费用项',
            dataIndex: 'name',
            width: '25%',
            align: 'center',
        },
        {
            title: '单位',
            dataIndex: 'unit',
            width: '25%',
            align: 'center',
        },
        {
            title: '调整值/单价(元)',
            dataIndex: 'price',
            width: '25%',
            align: 'center',
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
        itemTypeStr: '', //项目类型
        hubType: 0, // 0倾向 1指定
        preferHubHeight: '', // 倾向轮毂高度
    });
    // 项目建设条件
    const projectBuildCondition = ref({
        terrainFiles: [], // 地形现场图片
        coordinateFile: [], // 场区坐标
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
    // 根据字段名称查找对应的index
    const getIndex = (dataIndex) => {
        const index = dataSource.value.findIndex((ele) => ele.dataIndex == dataIndex);
        return index;
    };
    // 风机机型格式化处理
    const formatDeviceCodes = (deviceCodes) => {
        if (!deviceCodes) {
            return '--';
        } else {
            const codesInfo = deviceCodes.split(',');
            return codesInfo.length == 3 ? `${codesInfo[2] == 1 ? '平台机型库': '用户机型库'}： ${codesInfo[0]} ${codesInfo[1]}MW` : deviceCodes;
        }
    }
    const getDetailInfo = () => {
        getProjectDetail(route.query.id).then((res) => {
            // console.log(res);
            if (res.code == 200) {
                currentProject.value = res.data.companyDetailInfo;
                projectBaseInfo.value = Object.assign(
                    projectBaseInfo.value,
                    res.data.projectBaseInfo,
                    {},
                );
                projectBuildCondition.value = Object.assign(
                    projectBuildCondition.value,
                    res.data.projectBuildCondition,
                    {},
                );
                // 项目投资设置
                dataSource.value.map((ele) => {
                    let result = res.data.projectInvestmentSetup[ele.dataIndex];
                    ele.price = result || result == 0 ? result : 0;
                });
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
                // console.log('数据呢',projectBuildCondition.value.terrainFiles);
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
    // 下载文件
    const downLoadFile = async (path) => {
        let data = `objectKey=${path}`;
        // console.log('下载文件',data);
        try {
            let res = await getTempDownloadUrl(data);
            if (res.code === 200 && res.data) {
                window.open(res.data,'_blank')
            }
        } catch (err) {}
    };
</script>
