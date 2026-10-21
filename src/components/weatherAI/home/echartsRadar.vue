<template>
    <div id="echartsRadar"></div>
</template>
<script setup>
    import { onMounted } from 'vue';
    import * as echarts from 'echarts';
    const onInitEcharts = () => {
        var chartDom = document.getElementById('echartsRadar');
        var myChart = echarts.init(chartDom);
        var option;
        const datas = [
            2.12, // N
            2.21, // NNE
            2.2, // NE
            2.98, // ENE
            3.62, // E
            3.37, // ESE
            6.31, // SE
            6.95, // SSE
            5.43, // S
            5.33, // SSW
            8.04, // SW
            14.17, // WSW
            17.32, // W
            12.39, // WNW
            4.93, // NW
            2.63, // NNW
        ];
        // const datas = [20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20];
        const formatData = (data) => {
            const nameArr = [
                { name: 'N' }, // 0°
                { name: 'NNE' }, // 22.5°
                { name: 'NE' }, // 45°
                { name: 'ENE' }, // 67.5°
                { name: 'E' }, // 90°
                { name: 'ESE' }, // 112.5°
                { name: 'SE' }, // 135°
                { name: 'SSE' }, // 157.5°
                { name: 'S' }, // 180°
                { name: 'SSW' }, // 202.5°
                { name: 'SW' }, // 225°
                { name: 'WSW' }, // 247.5°
                { name: 'W' }, // 270°
                { name: 'WNW' }, // 292.5°
                { name: 'NW' }, // 315°
                { name: 'NNW' }, // 337.5°
            ];
            for (let i = 0; i < nameArr.length; i++) {
                nameArr[i]['value'] = data[i];
                nameArr[i]['itemStyle'] = {
                    color: {
                        colorStops: [
                            { offset: 0, color: 'rgba(181, 220, 241, 1)' },
                            { offset: 1, color: 'rgba(255, 255, 255, 1)' },
                        ],
                        x: 0.5,
                        y: 0.5,
                        r: 2,
                        type: 'radial',
                        global: false,
                    },
                };
            }
            return nameArr;
        };
        option = {
            radar: {
                // shape: 'circle',
                // splitLine: {
                //     show: true,
                //     lineStyle: {
                //         color: 'red'
                //     },
                // },
                axisLine: {
                    show: true, //是否显示坐标轴轴线
                    lineStyle: {
                        color: 'rgba(228, 230, 238, 1)',
                    },
                },
                axisName: {
                    color: 'rgba(124, 130, 148, 1)',
                    padding: 0,
                    lineHeight: 0,
                },
                splitArea: {
                    show: false,
                },
                axisLabel: {
                    show: false,
                },
                indicator: [
                    { name: 'N', max: 20 },
                    { name: 'NNW', max: 20 },
                    { name: 'NW', max: 20 },
                    { name: 'WNW', max: 20 },
                    { name: 'W', max: 20 },
                    { name: 'WSW', max: 20 },
                    { name: 'SW', max: 20 },
                    { name: 'SSW', max: 20 },
                    { name: 'S', max: 20 },
                    { name: 'SSE', max: 20 },
                    { name: 'SE', max: 20 },
                    { name: 'ESE', max: 20 },
                    { name: 'E', max: 20 },
                    { name: 'ENE', max: 20 },
                    { name: 'NE', max: 20 },
                    { name: 'NNE', max: 20 },
                ],
            },
            angleAxis: {
                show: false,
                type: 'category',
                startAngle: 90 + 11.25,
            },
            radiusAxis: {
                min: 0,
                max: Math.max(...datas) + 0.3, // 保证数据不遮盖边界线
                axisLabel: {
                    show: false,
                },
                axisTick: {
                    show: false, //是否显示坐标轴刻度
                },
                axisLine: {
                    show: false, //是否显示坐标轴轴线
                },
                splitLine: {
                    show: false,
                },
            },
            polar: {
                radius: '75%', // 半径
                center: ['50%', '50%'], // 中心位置
            },
            tooltip: {
                show: true,
                valueFormatter: function (value) {
                    return value + 'm/s';
                },
            },
            series: [
                {
                    type: 'bar',
                    // data: formatData(datas),
                    data: formatData(datas),
                    coordinateSystem: 'polar',
                },
            ],
        };

        option && myChart.setOption(option);
    };
    onMounted(() => {
        onInitEcharts();
    });
</script>
<style>
    #echartsRadar {
        width: 300px;
        height: 200px;
    }
</style>
