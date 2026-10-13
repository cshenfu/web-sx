<template>
    <div class="project-detail-component">
        <Information :dataInfo="currentProject || {}" :showMore="false"></Information>
        <div class="detail-component">
            <a-tabs v-model:activeKey="activeKey">
                <a-tab-pane :key="1" tab="基本信息">
                    <h4 class="content-title">
                        <img src="@/assets/img/user/detail-title.png" alt="" />
                        项目基本信息
                    </h4>
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
                                <span>规划总容量</span>
                                <template v-if="projectBaseInfo.capacityMode == 1">
                                    <p v-if="projectBaseInfo.spareDeviceNum">
                                        {{
                                            `${projectBaseInfo.currentProjectCapacity}(备选${projectBaseInfo.spareDeviceNum}台)`
                                        }}
                                    </p>
                                    <p v-else>{{
                                        projectBaseInfo.currentProjectCapacity || '--'
                                    }}</p>
                                </template>
                                <p v-else>--</p>
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
                                <span>倾向使用风机</span>
                                <p
                                    v-html="
                                        formatPreferDeviceCodes(projectBaseInfo.preferDeviceCodes)
                                    "
                                ></p>
                            </a-col>
                            <a-col :span="24">
                                <span>倾向轮毂高度</span>
                                <p>
                                    {{
                                        projectBaseInfo.preferHubHeight
                                            ? projectBaseInfo.preferHubHeight
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
                        </a-row>
                        <a-col :span="24">
                            <span>中尺度</span>
                            <template v-if="projectBuildCondition.mesoscaleFile?.objectKey">
                                <p
                                    ><a
                                        href="javascript:;"
                                        @click="
                                            downLoadFile(
                                                projectBuildCondition.mesoscaleFile.objectKey,
                                            )
                                        "
                                        >{{ projectBuildCondition.mesoscaleFile.filename }}</a
                                    >
                                </p>
                                <p>点位坐标：{{ projectBuildCondition.mesoscalePoint }}</p>
                            </template>
                            <template v-else>
                                <p>未上传数据</p>
                            </template>
                        </a-col>
                    </div>
                </a-tab-pane>
                <a-tab-pane :key="2" tab="计算设置">
                    <calculation-settings
                        :activeModel="projectBaseInfo.powerRunWay"
                    ></calculation-settings>
                </a-tab-pane>
            </a-tabs>
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
    import CalculationSettings from '../components/CalculationSettings.vue';
    import ProjectLog from '../components/Log/Log.vue';
    import { getProjectDetail } from '@/api/modules/projectManage';
    import { getTempDownloadUrl } from '@/api/modules/public';
    import { getTowerImg } from '../projectList';
    const route = useRoute();
    // 项目状态常量
    const state = {
        2: '开始计算',
        3: '排队中',
        4: '计算中',
        5: '异常暂停',
        6: '计算终止',
        7: '计算完成',
    };
    // 卡片选中状态
    const activeKey = ref(1);
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
        powerRunWay: null, // 模型类型
    });
    // 项目建设条件
    const projectBuildCondition = ref({
        windTowerDataFiles: [], // 测风塔数据
        topographicMapFile: '', // 地形图地址
        avoidAreasFiles: [], // 避让区域
        canDeployableAreaFiles: [], // 可布机区域
        coordinateFile: [], // 场区坐标
        windTurbineFile: [], // 风机点位
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
                operationLogs.value = res.data.operationLogs;
                projectBuildCondition.value.windTowerDataFiles.forEach((item) => {
                    item.attachments.forEach(async (m) => {
                        let path = await getTowerImg(m.objectKey);
                        m.obsPath = path;
                    });
                });
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
    // 倾向使用风机
    const formatPreferDeviceCodes = (data) => {
        let str = '';
        if (data && data.split(';').length > 0) {
            const datas = data.split(';');
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
        console.log('下载文件', data);
        try {
            let res = await getTempDownloadUrl(data);
            if (res.code === 200 && res.data) {
                window.open(res.data, '_blank');
            }
        } catch (err) {}
    };
</script>
