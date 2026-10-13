<template>
    <div class="tdmap-result-template">
        <!-- <header class="pdf-header">
            <div class="head-logo">
                <img src="@/assets/img/login/login-logo-dark.png" alt="" />
            </div>
        </header> -->
        <tdMapNew :showWinInfo="true" ref="tdMapNewRef" class="tdmap-result-map">
            <div class="result-content-header">
                <header>
                    <span>
                        <iconpark-icon name="xiangmutubiao" size="20"></iconpark-icon>
                        {{ projectName }}</span
                    >
                    <div class="group-button">
                        <a-button @click="exportDataFan">
                            <iconpark-icon name="daochu"></iconpark-icon>
                            导出风机点位</a-button
                        >
                        <a-button @click="exportDataPower">
                            <iconpark-icon name="daochu"></iconpark-icon>
                            导出发电量表</a-button
                        >
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
                <a-tabs v-model:activeKey="activeKey">
                    <a-tab-pane key="1" tab="主要数据">
                        <masterDataEle :masterData="masterData"></masterDataEle>
                    </a-tab-pane>
                    <a-tab-pane key="2" tab="发电量表" force-render>
                        <generatorMeter
                            :powerData="powerData"
                            class="generator-meter"
                        ></generatorMeter>
                    </a-tab-pane>
                </a-tabs>
            </div>
            <div class="result-content-footer">
                <span @click="checkShowHidden('tower')" :class="pointShowKey['tower'] ? '': 'disabledSpan'">
                    <iconpark-icon size="13" name="cefengta"></iconpark-icon>
                    测风塔
                </span>
                <a-divider type="vertical" />
                <span @click="checkShowHidden('fan')" :class="pointShowKey['fan'] ? '': 'disabledSpan'">
                    <iconpark-icon size="14" name="fengji" style="color: #ffd72b"></iconpark-icon>
                    推荐风机
                </span>
                <a-divider type="vertical" />
                <span @click="checkShowHidden('fan1')" :class="pointShowKey['fan1'] ? '': 'disabledSpan'">
                    <iconpark-icon size="14" name="fengji" style="color: #7df9ff"></iconpark-icon>
                    备选风机
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
    import { getDeviceData, getPowerList, getDevicePoint } from '@/api/modules/autoResult.js';
    import { exportExcel } from '@/utils/exportExcel';
    const activeKey = ref('1');
    const tdMapNewRef = ref(null);
    const projectId = ref(null);
    const projectName = ref('--');
    const masterData = ref([
        {
            name: '推荐风机/台',
            dataIndex: 'deviceNum',
            data: '--',
        },
        {
            name: '建议风机/MW',
            dataIndex: 'deviceCapacity',
            data: '--',
        },
        {
            name: '装机容量/MW',
            dataIndex: 'installedCapacity',
            data: '--',
        },
        {
            name: '等效满负荷小时',
            dataIndex: 'fullLoadHours',
            data: '--',
        },
        {
            name: '年上网电量/万kW·h<br/>(综合折减)',
            dataIndex: 'yearPower',
            data: '--',
        },
        {
            name: '年上网电量/万kW·h<br/>(尾流折减)',
            dataIndex: 'totalWakePower',
            data: '--',
        },
        {
            name: '综合折减系数',
            dataIndex: 'correctionCoefficient',
            data: '--',
        },
        {
            name: '轮毂高度/m',
            dataIndex: 'deviceHubHeight',
            data: '--',
        },
        {
            name: '风机轮毂高度处<br/>平均风速m/s',
            dataIndex: 'hubHeightWindSpeed',
            data: '--',
        },
        {
            name: '主/次风向',
            dataIndex: 'mainWindDir/secondWindDir',
            data: '--/--',
        },
    ]);
    const pointShowKey = ref({
        'fan': true,
        'fan1': true,
        'tower': true,
    });
    const powerData = ref([]);
    const fanExcelData = ref([]);
    // 请求主要数据
    const getDeviceDataEvent = () => {
        getDeviceData(projectId.value).then((res) => {
            if (res.code === 200) {
                if (res.data) {
                    masterData.value.map((ele) => {
                        if (ele.dataIndex == 'mainWindDir/secondWindDir') {
                            ele['data'] = `${
                                res.data['mainWindDir'] ? res.data['mainWindDir'] : '--'
                            }/${res.data['secondWindDir'] ? res.data['secondWindDir'] : '--'}`;
                        } else if (ele.dataIndex == 'correctionCoefficient') {
                            ele['data'] =
                                res.data[ele.dataIndex] || res.data[ele.dataIndex] === 0
                                    ? `${res.data[ele.dataIndex] * 100}%`
                                    : '--';
                        } else {
                            ele['data'] =
                                res.data[ele.dataIndex] || res.data[ele.dataIndex] === 0
                                    ? res.data[ele.dataIndex]
                                    : '--';
                        }
                    });
                }
            }
        });
    };
    // 请求发电量数据
    const getPowerListEvent = () => {
        let data = `${projectId.value}/0`
        getPowerList(data).then((res) => {
            if (res.code === 200) {
                powerData.value = res.data || [];
            }
        });
    };
    const formatDevicePoint = (pointData, cftData, fanData, fan1Data) => {
        if (pointData && pointData.length > 0) {
            const pointResult = {};
            pointData.map((ele) => {
                if (!pointResult[ele.regionCode]) {
                    pointResult[ele.regionCode] = [];
                }
                pointResult[ele.regionCode].push([ele.latitude * 1, ele.longitude * 1]);
            });
            eventBus.emit('uploadPoint', Object.values(pointResult));
        }
        if (cftData && cftData.length > 0) {
            eventBus.emit('uploadTower', cftData);
        }
        if (fanData && fanData.length > 0) {
            const fanResult = [];
            fanData.map((ele) => {
                fanResult.push({
                    longitude: ele.lng,
                    latitude: ele.lat,
                    info: ele.label,
                });
            });
            eventBus.emit('uploadFan', fanResult);
        }
        if (fan1Data && fan1Data.length > 0) {
            const fanResult = [];
            fan1Data.map((ele) => {
                fanResult.push({
                    longitude: ele.lng,
                    latitude: ele.lat,
                    info: ele.label,
                });
            });
            eventBus.emit('uploadFan1', fanResult);
        }
        // 场区、测风塔、推荐风机、备选风机
        // [
        //     [
        //         [
        //             "25.593016",
        //             "108.445378"
        //         ],
        //         [
        //             "25.600457",
        //             "108.494999"
        //         ],
        //         [
        //             "25.573169",
        //             "108.510950"
        //         ],
        //         [
        //             "25.533492",
        //             "108.443068"
        //         ],
        //         [
        //             "25.565868",
        //             "108.416308"
        //         ]
        //     ]
        // ]

        // [{
        //     longitude: '118.2233',
        //     latitude: '24.4533',
        // }]
    };
    // 请求设备点位数据
    const getDevicePointEvent = () => {
        getDevicePoint(projectId.value).then((res) => {
            if (res.code === 200) {
                if (res.data) {
                    const pointData = res.data.coordinateList;
                    const cftData = res.data.cftList;
                    let fanData = [];
                    let fan1Data = [];
                    if (res.data.windTurbineList) {
                        fanData = res.data.windTurbineList.filter((ele) => ele.type == 1);
                        fan1Data = res.data.windTurbineList.filter((ele) => ele.type == 2);
                        if (res.data.windTurbineList.length) {
                            const windTurbineList = JSON.parse(
                                JSON.stringify(res.data.windTurbineList),
                            );
                            windTurbineList.map((ele) => {
                                if (ele.type == 1) {
                                    ele.label = `${ele.label}（推荐风机）`;
                                } else {
                                    ele.label = `${ele.label}（备选风机）`;
                                }
                                fanExcelData.value.push(ele);
                            });
                        }
                    }
                    nextTick(() => {
                        formatDevicePoint(pointData, cftData, fanData, fan1Data);
                    });
                }
            }
        });
    };
    // 导出风机点位Excel
    const exportDataFan = () => {
        const fields = ['label', 'lng', 'lat'];
        const headers = ['标签', 'X', 'Y'];
        exportExcel(
            fanExcelData.value,
            fields,
            headers,
            `${projectName.value}风机点位.xlsx`,
            '风机点位',
        );
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
            'capacityCoefficient',
        ];
        const headers = [
            '标签',
            'X',
            'Y',
            'Z',
            '能量密度（W/m²）',
            '理论发电量（MWh/a）',
            '考虑尾流发电量（MWh/a）',
            '年上网电量（万kW·h）',
            '满发小时数（h）',
            '平均风速（m/s）',
            '尾流折减率（%）',
            '空气密度（kg/m³）',
            '容量系数'
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
        projectId.value = sessionStorage.getItem('projectID');
        projectName.value = sessionStorage.getItem('projectName');
        if (projectId.value) {
            // 请求主要数据
            getDeviceDataEvent();
            // 请求发电量数据
            getPowerListEvent();
            // 请求设备点位数据
            getDevicePointEvent();
        }
    });
    // 控制地图点位显示隐藏
    const checkShowHidden = (type) => {
        pointShowKey.value[type] = !pointShowKey.value[type];
        eventBus.emit('updateShowHidden', {
            type: type,
            isShow: pointShowKey.value[type]
        });
    }
</script>
<style scoped lang="scss">
    .tdmap-result-template {
        position: relative;
        :deep(.ant-tabs .ant-tabs-tab) {
            &:hover {
                color: #fff;
            }
        }
        .tdmap-result-map {
            height: calc(100vh - 116px);
            margin-right: 16px
            // position: fixed;
            // top: 50px;
            // bottom: 0;
            // left: 0;
            // right: 0;
        }
        .result-content-header {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            padding: 24px 32px;
            background: linear-gradient(180deg, rgba(0, 0, 0, 0.31) 0%, rgba(0, 0, 0, 0) 100%);
            z-index: 999;
            color: #fff;
            header {
                display: flex;
                justify-content: space-between;
                position: relative;
                span {
                    display: flex;
                    align-items: center;
                    font-size: 24px;
                    iconpark-icon {
                        margin-right: 16px;
                    }
                }
                button {
                    border: 1px solid #036b64;
                    margin-left: 16px;
                    color: #036b64;
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
                    bottom: -90px;
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
                &.disabledSpan{
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
            height: calc(100vh - 260px);
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
