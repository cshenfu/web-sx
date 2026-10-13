<template>
    <div class="equipment-detail">
        <h4 class="content-title">
            
            基本信息
        </h4>
        <div class="content-body">
            <a-row>
                <a-col :span="8">
                    <span>设备编号</span>
                    <p>{{devicePowerInfo?.deviceCode}}</p>
                </a-col>
                <a-col :span="8">
                    <span>风机型号/名称</span>
                    <p>{{devicePowerInfo?.deviceModel}}</p>
                </a-col>
                <a-col :span="8">
                    <span>制造商</span>
                    <p>{{devicePowerInfo?.manufacturer}}</p>
                </a-col>
            </a-row>
            <a-row>
                <a-col :span="8">
                    <span>MW类别</span>
                    <p>{{devicePowerInfo?.deviceCapacity}}</p>
                </a-col>
                <a-col :span="8">
                    <span>风机类型</span>
                    <p v-if="devicePowerInfo">
                        {{ getDeviceType[devicePowerInfo.deviceType] }}
                    </p>
                </a-col>
                <a-col :span="8">
                    <span>功率调节类型</span>
                    <p v-if="devicePowerInfo">
                        <!-- {{devicePowerInfo.powerType}} -->
                        {{ getPowerStr(devicePowerInfo.powerType) }}
                    </p>
                </a-col>
            </a-row>
            <a-row>
                <a-col :span="8">
                    <span>认证级别</span>
                    <p>
                        {{devicePowerInfo?.authLevel}}
                    </p>
                </a-col>
                <a-col :span="8">
                    <span>最大工作电流</span>
                    <p>
                        {{devicePowerInfo?.maxElectricity?devicePowerInfo?.maxElectricity:'--'}}
                    </p>
                </a-col>
                <a-col :span="8">
                    <span>单价</span>
                    <p>
                        {{devicePowerInfo?.powerUnitPrice?devicePowerInfo?.powerUnitPrice:'--'}}
                    </p>
                </a-col>
                <a-col :span="8">
                    <span>发电机额定功率（kW）</span>
                    <p>
                        {{devicePowerInfo?.ratedPowerOfGenerator?devicePowerInfo?.ratedPowerOfGenerator:'--'}}
                    </p>
                </a-col>
                <a-col :span="8">
                    <span>空气密度（kg/m³）</span>
                    <p>
                        {{devicePowerInfo?.airDensity?devicePowerInfo?.airDensity:'--'}}
                    </p>
                </a-col>
            </a-row>
        </div>
        <h4 class="content-title" id="powerThrustCurveRef">
            
            功率曲线（功率P/kW）
        </h4>
        <template v-if="devicePowerInfo?.powerThrustCurveList">
            <a-row class="self-table-list" v-if="devicePowerInfo?.powerThrustCurveList.length > 0">
                <a-col :span="2">
                    <div class="self-table-column has-bg">风速</div>
                    <div class="self-table-column has-bg">功率KW</div>
                    <div class="self-table-column has-bg">Ct</div>
                </a-col>
                <a-col :span="2"  v-for="(item, index) in devicePowerInfo.powerThrustCurveList || []" :key="index" class="list-item-content">
                    <div class="self-table-column">{{ item.speed }}</div>
                    <div class="self-table-column">{{ item.power }}</div>
                    <div class="self-table-column">{{ item.thrust }}</div>
                </a-col>
            </a-row>
            <div v-else class="empty-title"> 暂无录入数据</div>
        </template>
        <a-row>
            <a-col :span="9">
                <lineCharts
                    id="powerFirst"
                    :colorRange="['#036B64']"
                    :isSHowLegend="false"
                    :xAxis="xAxis"
                    :yAxis="yAxis"
                    :series="[
                        {
                            type: 'line',
                            symbol: 'rect',
                            name: '功率',
                            emphasis: {
                                focus: 'series',
                            },
                            encode: {
                                y: 'power',
                            },
                        },
                    ]"
                    :title="title"
                    :dataset="{
                        source: devicePowerInfo ? devicePowerInfo.powerThrustCurveList : [],
                        dimensions: ['speed', 'power'],
                    }"
                ></lineCharts>
            </a-col>
            <a-col :span="12">
                <lineCharts
                    id="powerSecond"
                    :colorRange="['#4B74FE']"
                    :isSHowLegend="false"
                    :xAxis="xAxis"
                    :yAxis="yAxisCt"
                    :series="[
                        {
                            type: 'line',
                            symbol: 'rect',
                            name: '推力',
                            emphasis: {
                                focus: 'series',
                            },
                            encode: {
                                y: 'thrust',
                            },
                        },
                    ]"
                    :title="titleCt"
                    :dataset="{
                        source: devicePowerInfo ? devicePowerInfo.powerThrustCurveList : [],
                        dimensions: ['speed', 'thrust'],
                    }"
                ></lineCharts>
            </a-col>
        </a-row>
        <div class="impeller-content">
            <h4 class="content-title">
                
                叶轮信息
            </h4>
            <table-list
                :isShowPage="false"
                bordered
                class="user-table"
                :loading="loading"
                :tableData="impellerData"
                :tableColumn="IMPELLER_INFORMATION_TABLE_LIST_CLOUMN"
            >
            </table-list>
        </div>
        <div class="impeller-content">
            <h4 class="content-title">
                
                发电机信息
            </h4>
            <table-list
                :isShowPage="false"
                bordered
                :width="'640px'"
                class="user-table"
                :loading="loading"
                :tableData="generatorData"
                :tableColumn="GENERATOR_INFORMATION_TABLE_LIST_CLOUMN"
            >
            </table-list>
        </div>
        <div class="impeller-content">
            <h4 class="content-title">
                
                温度信息
            </h4>
            <table-list
                :isShowPage="false"
                bordered
                class="user-table"
                :loading="loading"
                :width="'330px'"
                :tableData="devicePowerInfo ? [{
                    maxLiveEnvTemperature: devicePowerInfo.maxLiveEnvTemperature,
                    maxOperateTemperature: devicePowerInfo.maxOperateTemperature,
                    minLiveEnvTemperature: devicePowerInfo.minLiveEnvTemperature,
                    minOperateTemperature: devicePowerInfo.minOperateTemperature,
                }] : []"
                :tableColumn="TEMPERATURE_TABLE_LIST_CLOUMN"
            >
            <template #maxLiveEnvTemperature="{record}">
                {{ record.minLiveEnvTemperature }} ~ {{ record.maxLiveEnvTemperature }}
            </template>
            <template #maxOperateTemperature="{record}">
                {{ record.minOperateTemperature }} ~ {{ record.maxOperateTemperature }}
            </template>
            </table-list>
        </div>
        <!-- <div class="impeller-content">
            <h4 class="content-title">
                
                重量信息
            </h4>
            <table-list
                :isShowPage="false"
                bordered
                class="user-table"
                :loading="loading"
                :tableData="weightData"
                :tableColumn="WEIGHT_INFORMATION_TABLE_LIST_CLOUMN"
            >
            </table-list>
        </div> -->
        <div class="impeller-content" id="towerBarrelRef">
            <h4 class="content-title">
                
                塔筒信息
            </h4>
            <div class="user-tabs" style="margin-bottom: 12px;">
                <ul class="user-tabs-ul" v-if="devicePowerInfo">
                    <li
                        class="user-tabs-li"
                        @click="chooseTabs(towerBarrelIndex,'towerInfo')"
                        :class="activeKeyTowerInfo == towerBarrelIndex ? 'active' : ''"
                        v-for="(towerBarrel,towerBarrelIndex) in devicePowerInfo.towerBarrelList"
                        :key="towerBarrelIndex"
                        >
                        {{ towerBarrel.hubHeight }}m
                        <span v-if="!devicePowerInfo.towerBarrelList[activeKeyTowerInfo]['dataInfo'].length">（空）</span>
                        </li>
                </ul>
            </div>
            <template v-if="devicePowerInfo">
                <div class="toer-info">塔筒重量：{{ devicePowerInfo.towerBarrelList[activeKeyTowerInfo]?.totalWeight ? devicePowerInfo.towerBarrelList[activeKeyTowerInfo]['totalWeight'] + 't'  : '暂无' }}</div>
                <!-- <div class="toer-info" v-if="devicePowerInfo.towerBarrelList[activeKeyTowerInfo]&&devicePowerInfo.towerBarrelList[activeKeyTowerInfo].refDeviceCode !== '0'">引用 {{ devicePowerInfo.towerBarrelList[activeKeyTowerInfo]?.refDeviceCode }}</div> -->
                <table-list
                    :isShowPage="false"
                    bordered
                    class="user-table"
                    :loading="loading"
                    :tableData="devicePowerInfo.towerBarrelList[activeKeyTowerInfo]?.dataInfo"
                    :tableColumn="TOWER_INFORMATION_TABLE_LIST_CLOUMN"
                >
                <template #barrelSeq="{record}">
                    <template v-if="record.barrelSeq == 0">
                        风机机舱叶轮
                    </template>
                    <template v-else>
                        第{{ record.barrelSeq }}节塔筒
                    </template>
                </template>
                </table-list>
            </template>
        </div>
        <div class="impeller-content" id="towerBottomRef" v-if="devicePowerInfo">
            <h4 class="content-title">
                
                塔架底部荷载标准值
            </h4>
            <div class="user-tabs" style="margin-bottom: 12px;">
                <ul class="user-tabs-ul">
                    <li
                        class="user-tabs-li"
                        @click="chooseTabs(towerBottomLoadIndex)"
                        v-for="(towerBottomLoad,towerBottomLoadIndex) in devicePowerInfo.towerBottomLoadList"
                        :class="activeKey == towerBottomLoadIndex ? 'active' : ''"
                        >
                         {{ towerBottomLoad.hubHeight }}m
                         <span v-if="!devicePowerInfo.towerBottomLoadList[activeKey]['dataInfo'].length">（空）</span>
                        </li>
                </ul>
            </div>
            <!-- <div class="toer-info" v-if="devicePowerInfo.towerBottomLoadList[activeKey]&&devicePowerInfo.towerBottomLoadList[activeKey]?.refDeviceCode">引用：{{ devicePowerInfo.towerBottomLoadList[activeKey]?.refDeviceCode }}</div> -->
            <a-row class="self-table-list">
                <a-col :span="3">
                    <div class="self-table-column has-bg">工况名称</div>
                    <div class="self-table-column has-bg">正常运行荷载工况</div>
                    <div class="self-table-column has-bg">极端荷载工况</div>
                    <!-- <div class="self-table-column has-bg">多遇地震工况</div>
                    <div class="self-table-column has-bg">罕遇地震工况</div> -->
                    <div class="self-table-column has-bg">疲劳荷载工况(上限)</div>
                    <div class="self-table-column has-bg">疲劳荷载工况(下限)</div>
                </a-col>
                <template v-for="(m,mIndex) in towerBottomLoad(devicePowerInfo.towerBottomLoadList[activeKey]?.dataInfo) || []" :key="mIndex">
                    <a-col :span="3" class="list-item-content">
                        <div class="self-table-column">{{ m.name }}</div>
                        <div class="self-table-column">{{ m[1] }}</div>
                        <div class="self-table-column">{{ m[2] }}</div>
                        <!-- <div class="self-table-column">{{ m[3] }}</div>
                        <div class="self-table-column">{{ m[4] }}</div> -->
                        <div class="self-table-column">{{ m[5] }}</div>
                        <div class="self-table-column">{{ m[6] }}</div>
                    </a-col>
                </template>
            </a-row>
        </div>
        <!-- <div class="impeller-content">
            <h4 class="content-title">
                
                主要日志
            </h4>
            <LogEle></LogEle>
        </div> -->
    </div>
</template>

<script setup>
    import { ref, reactive, toRefs, onBeforeMount, onMounted, watchEffect, computed } from 'vue';
    import { useRoute, useRouter } from 'vue-router';
    import lineCharts from '@/components/echarts/line.vue';
    import TableList from '@/components/tableList/TableList.vue';
    import LogEle from './Log/Log.vue';
    import {
        IMPELLER_INFORMATION_TABLE_LIST_CLOUMN,
        GENERATOR_INFORMATION_TABLE_LIST_CLOUMN,
        TEMPERATURE_TABLE_LIST_CLOUMN,
        WEIGHT_INFORMATION_TABLE_LIST_CLOUMN,
        TOWER_INFORMATION_TABLE_LIST_CLOUMN,
        POWER_REGULATION,
    } from '../windPowerEquipment';
    import {getwindPowerDetail} from '@/api/modules/windPower.js';
    const route = useRoute();
    const powerDynamicsheader = ref([]);
    const loading = ref(false);
    const activeKeyTowerInfo = ref(0);
    const activeKey = ref(0);
    const devicePowerInfo = ref(null);
    const chooseTabs = (index,type) => {
        type == 'towerInfo' ? activeKeyTowerInfo.value = index :
        activeKey.value = index;
    }
    const getDeviceType = {
        1: '直驱',
        2: '双馈',
        3: '中速永磁',
        4: '半直驱',
    }
    const data = ref([
        {
            name: '2m/s',
            value: '3',
            Ct: 3,
        },
        {
            name: '2.5m/s',
            value: '4',
            Ct: 4,
        },
        {
            name: '3m/s',
            value: '5',
            Ct: 5,
        },
        // {
        //     name: '3.5m/s',
        //     value: '6',
        //     Ct: 6
        // },
        // {
        //     name: '4m/s',
        //     value: '7',
        //     Ct: 7
        // },
        // {
        //     name: '4.5m/s',
        //     value: '7',
        //     Ct: 7
        // },
        // {
        //     name: '4.5m/s',
        //     value: '8',
        //     Ct: 8
        // },
        // {
        //     name: '5m/s',
        //     value: '9',
        //     Ct: 9
        // }, {
        //     name: '5.5m/s',
        //     value: '10',
        //     Ct: 10
        // }, {
        //     name: '6m/s',
        //     value: '11',
        //     Ct: 11
        // },
        // {
        //     name: '6.5m/s',
        //     value: '12',
        //     Ct: 12
        // },

        // {
        //     name: '7m/s',
        //     value: '13',
        //     Ct: 13
        // },
        // {
        //     name: '7.5m/s',
        //     value: '14',
        //     Ct: 14
        // },
        // {
        //     name: '8m/s',
        //     value: '15',
        //     Ct: 15
        // },
        // {
        //     name: '9m/s',
        //     value: '116',
        //     Ct: 17
        // },
        // {
        //     name: '9m/s',
        //     value: '116',
        //     Ct: 17
        // } ,{
        //     name: '9m/s',
        //     value: '116',
        //     Ct: 17
        // } ,{
        //     name: '9m/s',
        //     value: '116',
        //     Ct: 17
        // } ,{
        //     name: '9m/s',
        //     value: '116',
        //     Ct: 17
        // } ,{
        //     name: '9m/s',
        //     value: '116',
        //     Ct: 17
        // } ,{
        //     name: '9m/s',
        //     value: '116',
        //     Ct: 17
        // },
        // {
        //     name: '9m/s',
        //     value: '116',
        //     Ct: 17
        // },
        // {
        //     name: '9m/s',
        //     value: '116',
        //     Ct: 17
        // }
    ]);
    const powerData = ref([]);
    const chunkArray = (arr, chunkSize) => {
        return arr.reduce((acc, _, i) => {
            if (i % chunkSize === 0) acc.push([]);
            acc[acc.length - 1].push(_);
            return acc;
        }, []);
    };
    powerData.value = chunkArray(data.value, 11);
    const title = ref({
        show: true,
        text: '功率曲线',
        left: 'center', // 或者 'right'
        bottom: '0', // 设置一个较大的值，确保标题出现在图表的上边界之
        textStyle: {
            fontSize: 12,
            fontWeight: 'bolder',
            color: '#363B4D',
        },
    });
    const titleCt = ref({
        show: true,
        text: '推力曲线',
        left: 'center', // 或者 'right'
        bottom: '0', // 设置一个较大的值，确保标题出现在图表的上边界之
        textStyle: {
            fontSize: 12,
            fontWeight: 'bolder',
            color: '#363B4D',
        },
    });
    const xAxis = ref([
        {
            type: 'category',
            name: '风速（m/s）',
            nameLocation: 'center',
            nameTextStyle: {
                fontSize: '12px',
                fontWeight: 500,
                color: ' #7C8294',
                padding: [20, 0, 0, 340],
            },
        },
    ]);
    const yAxis = ref([
        {
            type: 'value',
            name: '功率（动态）KW',
            nameLocation: 'end',
            nameGap: 30,
            nameTextStyle: {
                fontSize: '12px',
                fontWeight: 500,
                color: ' #7C8294',
            },
            splitLine: {
                lineStyle: {
                    width: 1,
                    type: 'solid',
                    color: '#7C8294',
                },
            },
        },
    ]);

    const yAxisCt = ref([
        {
            type: 'value',
            name: 'Ct',
            nameLocation: 'end',
            nameGap: 30,
            nameTextStyle: {
                fontSize: '12px',
                fontWeight: 500,
                color: ' #7C8294',
            },
            splitLine: {
                lineStyle: {
                    width: 1,
                    type: 'solid',
                    color: '',
                },
            },
        },
    ]);
    const series = ref([
        {
            type: 'line',
            symbol: 'rect',
            name: '风速',
            emphasis: {
                focus: 'series',
            },
            encode: {
                y: 'reportDataNum',
            },
        },
    ]);
    const dataset = ref({
        first: {
            source: [
                {
                    reportDataNum: '150',
                    reportOrgNum: '10',
                    a: 2,
                },
                {
                    reportDataNum: '239',
                    reportOrgNum: '20',
                    a: 4,
                },
                {
                    reportDataNum: '220',
                    reportOrgNum: '100',
                    a: 6,
                },
                {
                    reportDataNum: '120',
                    reportOrgNum: '5',
                    a: 8,
                },
                {
                    reportDataNum: '90',
                    reportOrgNum: '30',
                    a: 10,
                },
                {
                    reportDataNum: '190',
                    reportOrgNum: '100',
                    a: 12,
                },
                {
                    reportDataNum: '100',
                    reportOrgNum: '50',
                    a: 14,
                },
                {
                    reportDataNum: '230',
                    reportOrgNum: '60',
                    a: 16,
                },
                {
                    reportDataNum: '100',
                    reportOrgNum: '100',
                    a: 18,
                },
                {
                    reportDataNum: '160',
                    reportOrgNum: '40',
                    a: 20,
                },
                {
                    reportDataNum: '220',
                    reportOrgNum: '60',
                    a: 22,
                },
                {
                    reportDataNum: '250',
                    reportOrgNum: '30',
                    a: 24,
                },
            ],
            dimensions: ['a', 'reportDataNum', 'reportOrgNum'],
        },
        second: {
            source: [
                {
                    reportDataNum: '100',
                    reportOrgNum: '100',
                    a: 2,
                },
                {
                    reportDataNum: '120',
                    reportOrgNum: '20',
                    a: 4,
                },
                {
                    reportDataNum: '140',
                    reportOrgNum: '60',
                    a: 6,
                },
                {
                    reportDataNum: '120',
                    reportOrgNum: '5',
                    a: 8,
                },
                {
                    reportDataNum: '90',
                    reportOrgNum: '30',
                    a: 10,
                },
                {
                    reportDataNum: '190',
                    reportOrgNum: '100',
                    a: 12,
                },
                {
                    reportDataNum: '100',
                    reportOrgNum: '50',
                    a: 14,
                },
                {
                    reportDataNum: '230',
                    reportOrgNum: '60',
                    a: 16,
                },
                {
                    reportDataNum: '100',
                    reportOrgNum: '100',
                    a: 18,
                },
                {
                    reportDataNum: '160',
                    reportOrgNum: '40',
                    a: 20,
                },
                {
                    reportDataNum: '220',
                    reportOrgNum: '60',
                    a: 22,
                },
                {
                    reportDataNum: '250',
                    reportOrgNum: '30',
                    a: 24,
                },
            ],
            dimensions: ['a', 'reportDataNum', 'reportOrgNum'],
        },
    });
    // 叶轮
    const impellerData = ref([
        {
            key: 1,
        },
    ]);
    // 发电机信息
    const generatorData = ref([]);
    // 温度信息
    const temperatureData = ref([]);
    // 重量信息
    const weightData = ref([]);
    // 塔筒信息
    const towerData = ref({
        quote: '【引用 FJ3456789567】',
        data: [],
    });
    // 塔架底部荷载标准值
    const standardObjData = {
        quote: '【引用 FJ3456789567】',
    }
    const standardData = ref([
        {
            name: 'Fx或Fr(kN)',
            value: '699.2',
            value2: '1016.2',
            value3: '748.3',
            value4: '748.3',
            value5: '658.4',
            value6: '235.2',
        },
        {
            name: 'Mx(kNm)',
            value: '699.2',
            value2: '1016.2',
            value3: '748.3',
            value4: '748.3',
            value5: '658.4',
            value6: '235.2',
        },
    ]);
    // 塔架底部荷载信息数据处理
    const towerBottomLoad = (data) => {
        const formatArr = [];
        const nameArr = ['Fx或Fr(kN)','Fy(kN)','Fz(kN)','Mx或Mr(kNm)','My(kNm)','Mz(kNm)']
        const argumentArr = ['fxFr', 'fy', 'fz', 'mxMr', 'my', 'mz'];
        data && data.length && data.map(ele => {
            formatArr[ele.towerLoadType - 1] = ele;
        })
        const resultArr = [];
        argumentArr.map((ele, eleIndex) => {
            const obj = {
                name: nameArr[eleIndex],
            }
            formatArr.length && formatArr.map((item,itemIndex) => {
                obj[itemIndex + 1] = item[ele] || item[ele] == 0 ?  item[ele] : ''
            })
            resultArr.push(obj);
        });
        // 塔架荷载类型 1-正常运行载荷工况 2-极端载荷工况 3-多遇地震工况 4-罕遇地震工况 5-疲劳载荷工况（上限） 6-疲劳荷载工况（下限）
        return resultArr;
    }
    
    const getPowerStr = (val) => {
        let str = POWER_REGULATION.filter((n) => n.value == val);
        return str.length ? str[0]['label'] : '--';
    };

    onBeforeMount(() => {
        //console.log('2.组件挂载页面之前执行----onBeforeMount')
    });
    onMounted(() => {
        if (route.query.id) {
            getDetailInfo();     
        }
        //console.log('3.-组件挂载到页面之后执行-------onMounted')
    });
    const getDetailInfo = () => {
        getwindPowerDetail(route.query.id).then(res => {
            if (res.code == 200) {
                devicePowerInfo.value = res.data;
                // [
                //     {
                //         title: '发电机型式',
                //         dataIndex: 'deviceModel',
                //     },
                //     {
                //         title: '额定功率(kW)',
                //         dataIndex: 'ratedPower',
                //     },
                //     {
                //         title: '额定电压(V)',
                //         dataIndex: 'ratedVoltage',
                //     },
                //     {
                //         title: '额定频率(Hz)',
                //         dataIndex: 'ratedFrequency',
                //     }
                // ]
                generatorData.value = [{
                    deviceModel: res.data.deviceModel,
                    ratedPower: res.data.ratedPower,
                    ratedVoltage: res.data.ratedVoltage,
                    ratedFrequency: res.data.ratedFrequency,
                }];
                impellerData.value = [{
                    bladeLength: res.data.bladeLength,
                    wheelDiameter: res.data.wheelDiameter,
                    hubHeight: res.data.hubHeight,
                    cutInWindSpeed: res.data.cutInWindSpeed,
                    ratedWindSpeed: res.data.ratedWindSpeed,
                    cutoutWindSpeed: res.data.cutoutWindSpeed,
                    safeWindSpeed: res.data.safeWindSpeed,
                }];
                if (sessionStorage.getItem('detailType')) {
                    setTimeout(() => {
                        switch (sessionStorage.getItem('detailType')) {
                            case '1':
                                document.getElementsByClassName('equipment-detail')[0].scrollTo({top:document.getElementById('powerThrustCurveRef').offsetTop - 120, 'behavior': 'auto'})
                                break;
                            case '2':
                                document.getElementsByClassName('equipment-detail')[0].scrollTo({top:document.getElementById('towerBarrelRef').offsetTop - 120, 'behavior': 'auto'})
                                break;
                            case '3':
                                document.getElementsByClassName('equipment-detail')[0].scrollTo({top:document.getElementById('towerBottomRef').offsetTop - 120, 'behavior': 'auto'})
                                break;
                            default:
                                break;
                        }
                        sessionStorage.removeItem('detailType');
                    }, 200);
                }
            }
        })
    }

    // 使用toRefs解构
    defineExpose({});
</script>
<style scoped lang="scss">
  @import '@/assets/css/detail.scss';
  @import '@/assets/css/tabs.scss';

    .equipment-detail {
        height: calc(100vh - 105px);
        overflow-y: auto;
        background: #fff;
        padding: 24px;

        .self-table-list {
            margin-bottom: 20px;

            .self-table-column {
                // width: 109px;
                height: 40px;
                text-align: center;
                line-height: 40px;
                border: 1px solid #e4e6ee;
                font-size: 12px;
                // font-weight: bold;
                color: #363b4d;

                &:nth-child(2n) {
                    border-top: none;
                    border-bottom: none;
                }
            }

            .list-item-content {
                .self-table-column {
                    // border-left:none ;
                    border-right: none;

                    &:first-child,
                    &:nth-child(n) {
                        border-left: none;
                        border-right: 1px solid #e4e6ee;
                    }

                    &:first-child {
                        background: #fafafa;
                        font-weight: bold;
                    }
                }
            }
        }
        .empty-title {
                color: #7C8294;
                margin-left: 10px;
            }
        .toer-info{
            margin-bottom: 12px;
        }

        .impeller-content {
            margin-top: 24px;
        }

        .has-bg {
            background: #fafafa;
            font-weight: bold;
        }
    }
</style>
