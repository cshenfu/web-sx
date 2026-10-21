<template>
    <div class="tdmap-result-template">
        <tdMapNew :showWinInfo="true" ref="tdMapNewRef" class="tdmap-result-map">
            <div class="result-content-header">
                <header>
                    <span @click="goBack" style="cursor: pointer">
                        <iconpark-icon
                            :size="24"
                            name="fanhui"
                            style="color: #0389ea"
                        ></iconpark-icon>
                    </span>
                    <span style="margin-right: auto"> 项目名称：{{ projectName }}</span>
                    <div class="group-button">
                        <a-button style="padding: 8px 32px" @click="pdfPreview"> 报告预览</a-button>
                    </div>
                    <div class="tdmap-control">
                        <span @click="tdMapNewRef.zoomMap(1)">
                            <iconpark-icon size="14" name="jia"></iconpark-icon>
                        </span>
                        <span @click="tdMapNewRef.zoomMap(-1)">
                            <iconpark-icon size="14" name="jian"></iconpark-icon>
                        </span>
                        <span @click="tdMapNewRef.zoomMap()">
                            <iconpark-icon size="14" name="huidaoyuandian"></iconpark-icon>
                        </span>
                    </div>
                </header>
                <div class="result-content-body">
                    本项目地形为{{ projectSummary.terrainTypeStr }}地形，测风塔共{{
                        projectSummary.towerNum
                    }}个，海拔分布在{{ projectSummary.elevationRange }}m，{{
                        projectSummary.windTowerTimeRepresentativeAnalysis
                    }}
                    测风塔主要分析信息如下：
                </div>
                <masterDataEle :masterData="masterData"></masterDataEle>
            </div>
            <div class="result-content-footer">
                <span
                    @click="checkShowHidden('tower')"
                    :class="pointShowKey['tower'] ? '' : 'disabledSpan'"
                >
                    <iconpark-icon size="13" name="cefengta" style="color: #66E64A;"></iconpark-icon>
                    测风塔
                </span>
            </div>
        </tdMapNew>
    </div>
</template>
<script setup>
    import tdMapNew from '@/components/polyMap/tdMapNew.vue';
    import masterDataEle from './components/masterData.vue';
    import generatorMeter from './components/generatorMeter.vue';
    import { ref, nextTick, onBeforeMount } from 'vue';
    import eventBus from '@/utils/eventBus.js';
    import { getDeviceData, getPowerList, getDevicePoint } from '@/api/modules/wind/autoResult.js';
    import { getProjectDetail } from '@/api/modules/wind/anemometer/project.js';
    import { exportExcel } from '@/utils/exportExcel';
    import { useRouter } from 'vue-router';
    import { message } from 'ant-design-vue';
    const router = useRouter();
    const tdMapNewRef = ref(null);
    const projectId = ref(null);
    const projectName = ref('--');
    const projectSummary = ref({
        terrainTypeStr: '--',
        towerNum: '--',
        elevationRange: '--',
        windTowerTimeRepresentativeAnalysis: '--',
    });
    const masterData = ref([
        {
            name: '风功率密度等级',
            dataIndex: 'wpLevel',
            data: '--',
        },
        {
            name: '盛行风向',
            dataIndex: 'prevailWindDir',
            data: '--',
        },
        {
            name: '大/小风月',
            dataIndex: 'windMonth',
            data: '--',
        },
        {
            name: '综合风切变',
            dataIndex: 'combinedWindShear',
            data: '--',
        },
        {
            name: '115m轮毂高度处平均风速',
            dataIndex: 'hubHeightAvgWindSpeed',
            data: '--',
        },
        {
            name: '115m轮毂高度处空气密度',
            dataIndex: 'hubHeightAirDensity',
            data: '--',
        },
        {
            name: '湍流强度',
            dataIndex: 'turbulenceIntensity',
            data: '--',
        },
        {
            name: '测风塔详细分析报告',
            dataIndex: 'wordReportPath',
            data: '',
            isDownLoad: true,
        },
        {
            name: '测风塔插补订正后数据',
            dataIndex: 'revisedObjectKey',
            data: '',
            isDownLoad: true,
        },
        {
            name: '测风塔推算轮毂高度数据',
            dataIndex: 'hubObjectKey',
            data: '',
            isDownLoad: true,
        },
    ]);
    const pointShowKey = ref({
        fan: true,
        fan1: true,
        tower: true,
    });
    const powerData = ref([]);
    // 请求主要数据
    const getDeviceDataEvent = () => {
        getProjectDetail(projectId.value).then((res) => {
            if (res.code === 200) {
                if (res.data) {
                    const cftInfos = [];
                    // 处理主要数据
                    if (res.data.cftList?.length) {
                        let hubHeightData = '--';
                        const keys = Object.keys(res.data.cftList[0]);
                        const arrayToObjectKeys = (keys, defaultValue = '') => {
                            return keys.reduce((acc, key) => {
                                acc[key] = defaultValue;
                                return acc;
                            }, {});
                        };
                        const newKeys = arrayToObjectKeys(keys);
                        const dataIndexSpecialFields = ['combinedWindShear', 'hubHeightAvgWindSpeed', 'hubHeightAirDensity'];
                        res.data.cftList.map((ele, eleIndex) => {
                            cftInfos.push(ele['windTowerSeq']);
                            keys.map((key) => {
                                newKeys[key] =
                                    newKeys[key] + (dataIndexSpecialFields.includes(key) ? ele['windTowerSeq'] + '：' : '') + 
                                    ele[key] +
                                    (eleIndex == res.data.cftList.length - 1 ? '' : '<br/><br/>');
                                if (key == 'hubHeight') {
                                    hubHeightData = ele[key];
                                }
                            });
                        });
                        console.log(newKeys, '最后整理出来的结果');
                        
                        masterData.value.map((ele) => {
                            if (ele.dataIndex == 'hubHeightAvgWindSpeed') {
                                ele.name = hubHeightData + 'm轮毂高度处平均风速';
                            } else if (ele.dataIndex == 'hubHeightAirDensity') {
                                ele.name = hubHeightData + 'm轮毂高度处空气密度';
                            }
                            ele.data =
                                newKeys[ele.dataIndex] || newKeys[ele.dataIndex] === 0
                                    ? newKeys[ele.dataIndex]
                                    : '--';
                            const specialFields = [
                                'wpLevel',
                                'turbulenceIntensity',
                                'pdfReportPath',
                                'hubObjectKey',
                                'repairObjectKey',
                                'revisedObjectKey',
                                'wordReportPath',
                            ];
                            if (specialFields.includes(ele.dataIndex)) {
                                ele.data = res.data[ele.dataIndex] || '';
                            }
                        });
                        for (const key in projectSummary.value) {
                            if (Object.hasOwnProperty.call(projectSummary.value, key)) {
                                projectSummary.value[key] = res.data[key] || '--';
                            }
                        }
                    }
                    // 回显测风塔坐标
                    if (res.data.cftPointList) {
                        const cftData = JSON.parse(res.data.cftPointList);
                        for (let index = 0; index < cftData.length; index++) {
                            const element = cftData[index];
                            element['info'] = cftInfos[index];
                        }
                        // console.log(cftData)
                        formatDevicePoint(cftData);
                    }
                }
            }
        });
    };
    const formatDevicePoint = (cftData) => {
        if (cftData && cftData.length > 0) {
            eventBus.emit('uploadTower', cftData);
        }
    };
    // 报告在线预览pdf
    const pdfPreview = () => {
        const index = masterData.value.findIndex((ele) => ele.dataIndex == 'pdfReportPath');
        const wordIndex = masterData.value.findIndex((ele) => ele.dataIndex == 'wordReportPath');
        if (index > -1 && masterData.value[index].data || wordIndex > -1 && masterData.value[wordIndex].data) {
            if (index > -1) {
                sessionStorage.setItem('pdfReportObjectKey', masterData.value[index].data || '');
                window.open(location.origin + '/pdfPreview');
            } else {
                sessionStorage.setItem('wordReportObjectKey', masterData.value[wordIndex].data || '');
                window.open(location.origin + '/wordPreview');
            }
        } else {
            message.error('暂无报告可预览！');
        }
        // const fields = ['label', 'lng', 'lat'];
        // const headers = ['标签', 'X', 'Y'];
        // exportExcel(
        //     fanExcelData.value,
        //     fields,
        //     headers,
        //     `${projectName.value}风机点位.xlsx`,
        //     '风机点位',
        // );
    };
    // 导出发电量Excel
    const exportDataPower = () => {
        const fields = [
            'label',
            'x',
            'y',
            'z',
            'energyDensity',
            'theoryPower',
            'powerWithWake',
            'yearPower',
            'fullPowerHours',
            'avgWindSpeed',
            'rateWithWake',
            'airDensity',
        ];
        const headers = [
            '标签',
            'X',
            'Y',
            'Z',
            '能量密度（W/m²）',
            '理论发电量（MWh/a）',
            '考虑尾流发电量（MWh/a）',
            '年上网电量（万kWh）',
            '满发小时数（h）',
            '平均风速（m/s）',
            '尾流折减率（%）',
            '空气密度（kg/m³）',
        ];
        exportExcel(
            powerData.value,
            fields,
            headers,
            `${projectName.value}发电量表.xlsx`,
            '发电量表',
        );
    };
    onBeforeMount(() => {
        projectId.value = sessionStorage.getItem('projectId');
        projectName.value = sessionStorage.getItem('projectName');
        if (projectId.value) {
            // 请求主要数据
            getDeviceDataEvent();
            // 请求发电量数据
            // getPowerListEvent();
            // 请求设备点位数据
            // getDevicePointEvent();
        }
    });
    // 控制地图点位显示隐藏
    const checkShowHidden = (type) => {
        pointShowKey.value[type] = !pointShowKey.value[type];
        eventBus.emit('updateShowHidden', {
            type: type,
            isShow: pointShowKey.value[type],
        });
    };
    const goBack = () => {
        router.go(-1);
    };
</script>
<style scoped lang="scss">
    $primary-color: var(--theme);
    .pdf-header {
        position: fixed;
        left: 0;
        right: 0;
        height: 50px;
        z-index: 999999;
        box-shadow: 0px 2px 8px 0px rgba(201, 201, 201, 0.5);
        background-color: #fff;
        display: flex;
        align-items: center;
        .head-logo {
            display: flex;
            align-items: center;
            margin-left: 24px;
            img {
                height: 34px;
            }
            span {
                color: #293462;
                font-size: 14px;
                font-weight: 600;
                position: relative;
                flex: none;
                max-width: 180px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                padding-left: 18px;
                &::after {
                    content: '';
                    position: absolute;
                    width: 4px;
                    height: 4px;
                    border-radius: 100%;
                    top: 0;
                    bottom: 0;
                    margin: auto;
                    left: 8px;
                    background: #293462;
                }
            }
        }
    }
    .tdmap-result-template {
        position: relative;
        :deep(.ant-tabs .ant-tabs-tab) {
            &:hover {
                color: #fff;
            }
        }
        .tdmap-result-map {
            height: calc(100vh - 50px);
            position: fixed;
            top: 50px;
            bottom: 0;
            left: 0;
            right: 0;
        }
        .result-content-header {
            position: fixed;
            top: 50px;
            left: 0;
            right: 0;
            padding: 24px 32px;
            background: linear-gradient(180deg, rgba(0, 0, 0, 0.31) 0%, rgba(0, 0, 0, 0) 100%);
            z-index: 999;
            color: #fff;
            pointer-events: none;
            header {
                display: flex;
                justify-content: space-between;
                position: relative;
                margin-bottom: 16px;
                pointer-events: all;
                span {
                    display: flex;
                    align-items: center;
                    font-size: 20px;
                    iconpark-icon {
                        margin-right: 16px;
                    }
                }
                button {
                    border: 1px solid $primary-color;
                    margin-left: 16px;
                    color: $primary-color;
                    border-radius: 0;
                    display: flex;
                    float: left;
                    align-items: center;
                    iconpark-icon {
                        margin-right: 8px;
                    }
                }
                .tdmap-control {
                    position: absolute;
                    right: 0;
                    bottom: -60px;
                    display: flex;
                    span {
                        flex: none;
                        width: 36px;
                        height: 32px;
                        background: rgba(0, 0, 0, 0.24);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        cursor: pointer;
                        iconpark-icon {
                            margin-right: 0;
                        }
                        &:last-child {
                            width: 32px;
                            margin-left: 16px;
                            border-radius: 4px;
                        }
                        &:first-child {
                            border-right: 1px solid rgba(255, 255, 255, 0.28);
                            border-radius: 4px 0 0 4px;
                        }
                        &:nth-child(2) {
                            border-radius: 0 4px 4px 0;
                        }
                        &:hover {
                            background: #4f4f4f;
                        }
                    }
                }
            }
            :deep(.ant-tabs-nav) {
                color: #fff;
                margin-bottom: 24px;
                &::before {
                    border-bottom: 1px solid #fff;
                }
            }

            :deep(.ant-tabs .ant-tabs-tab .ant-tabs-tab-btn) {
                &:hover {
                    color: #fff;
                }
                &:visited {
                    color: #fff;
                }
                &:active {
                    color: #fff;
                }
                &:focus {
                    color: #fff;
                }
            }

            :deep(.ant-tabs) {
                display: block;
            }
            :deep(.ant-tabs-content-holder) {
                display: inline-block;
                width: auto;
                position: absolute;
            }
            :deep(.ant-tabs .ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn) {
                color: #fff;
                font-weight: bold;
            }
            :deep(.ant-tabs .ant-tabs-ink-bar) {
                background: linear-gradient(90deg, #0f9b90 0%, #34b280 100%);
            }
            :deep(.ant-tabs .ant-tabs-tabpane) {
                width: auto;
                display: inline-block;
            }
            :deep(.ant-tabs .ant-tabs-content) {
                width: auto;
                display: inline-block;
            }
        }
        .result-content-body {
            width: 584px;
            margin-bottom: 24px;
            line-height: 1.5;
        }
        .result-content-footer {
            position: fixed;
            right: 24px;
            bottom: 24px;
            background: rgba(0, 0, 0, 0.24);
            z-index: 999;
            color: #fff;
            display: flex;
            align-items: center;
            border-radius: 4px;
            box-shadow: 0px 0px 14px 0px rgba(255, 255, 255, 0.16);
            span {
                display: flex;
                align-items: center;
                padding: 8px 16px;
                cursor: pointer;
                iconpark-icon {
                    margin-right: 8px;
                }
                &.disabledSpan {
                    color: rgba(255, 255, 255, 0.54);
                }
            }
            :deep(.ant-divider-vertical) {
                border-inline-start-color: rgba(255, 255, 255, 0.3);
                top: 0;
                height: 18px;
            }
        }
        .generator-meter {
            background: #fff;
            height: calc(100vh - 200px);
        }
        :deep(.tdt-infowindow-content-wrapper) {
            border-radius: 4px;
            color: #fff;
            background: #363b4d;
            box-shadow: 0px 0px 25px 0px #dddddd;
        }
        :deep(.tdt-infowindow-tip) {
            background-color: #363b4d;
        }
        :deep(.tdt-infowindow-content) {
            margin: 7px 14px;
        }
        :deep(.tdt-infowindow-content p) {
            margin: 0;
            text-align: center;
        }
    }
</style>
