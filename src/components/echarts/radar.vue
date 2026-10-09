<template>
    <div :id="id" :style="{'width': props.width + 'px', 'height': props.height + 'px'}" class="echarts-components"></div>
</template>
<script setup>
    import * as echarts from 'echarts';
    import { onMounted, reactive, ref } from 'vue';
    const props = defineProps({
        id: {
            type: String,
            default: 'id',
        },
        width: {
            type: Number,
            default: 336
        },
        height: {
            type: Number,
            default: 368
        },
        isLegend: {
            type: Boolean,
            default: false
        }
    });
    onMounted(() => {
        const chartDom = document.getElementById(props.id);
        const myChart = echarts.init(chartDom);
        let option = ref();
        var max = 35;
        var min = 0;
        option = {
            color: ['#036B64', '#FF8411'],
            legend: {
                itemWidth: 16,
                itemHeight: 16,
                left: 'center',
                bottom: 0,
                show: props.isLegend
            },
            grid: {
                top: 40,
                left: 50,
                bottom: 20,
                right: 50
            },
            radar: {
                name: {
                    textStyle: {
                        color: '#333',
                    },
                    fontSize: 14,
                },
                axisName: {
                    fontSize: 12,
                    color: '#7C8294'
                },
                shape: 'circle',
                center: ['50%', '50%'],
                radius: '80%',
                scale: true,
                axisLine: {
                    lineStyle: {
                        opacity: 0.2
                    }
                },
                indicator: [
                    {
                        name: 'N',
                        max: max,
                        min: min,
                    },
                    {
                        name: 'NNW',
                        max: max,
                        min: min,
                    },
                    {
                        name: 'NW',
                        max: max,
                        min: min,
                    },
                    {
                        name: 'WNW',
                        max: max,
                        min: min,
                    },
                    {
                        name: 'W',
                        max: max,
                        min: min,
                    },
                    {
                        name: 'WSW',
                        max: max,
                        min: min,
                    },
                    {
                        name: 'SW',
                        max: max,
                        min: min,
                    },
                    {
                        name: 'SSW',
                        max: max,
                        min: min,
                    },
                    {
                        name: 'S',
                        max: max,
                        min: min,
                    },
                    {
                        name: 'SSE',
                        max: max,
                        min: min,
                    },
                    {
                        name: 'SE',
                        max: max,
                        min: min,
                    },
                    {
                        name: 'ESE',
                        max: max,
                        min: min,
                    },
                    {
                        name: 'E',
                        max: max,
                        min: min,
                    },
                    {
                        name: 'ENE',
                        max: max,
                        min: min,
                    },
                    {
                        name: 'NE',
                        max: max,
                        min: min,
                    },
                    {
                        name: 'NNE',
                        max: max,
                        min: min,
                    },
                ],
                splitArea: {
                    show: false,
                },
                splitLine: {
                    show: false,
                },
            },
            polar: {},
            angleAxis: {
                min: 0,
                max: 360,
                interval: 5,
                clockwise: false,
                axisTick: {
                    show: false,
                },
                axisLabel: {
                    show: false,
                },
                axisLine: {
                    show: false,
                },
                splitLine: {
                    show: false,
                },
            },
            radiusAxis: {
                min: 0,
                max: 35,
                interval: 5,
                axisLabel: {
                    textStyle: {
                        color: '#7C8294'
                    }
                },
                axisTick: {
                    show: false,
                },
                axisLine: {
                    lineStyle: {
                        opacity: 0.3
                    }
                },
                splitLine: {
                    lineStyle: {
                        opacity: 1
                    }
                },
                splitArea: {
                    show: true,
                    areaStyle: {
                        opacity: 0.5
                    }
                },
            },
            series: [
                {
                    name: '预算',
                    type: 'radar',
                    areaStyle: {
                        opacity: 0.1,
                    },
                    lineStyle: {
                        width: 1,
                    },
                    data: [
                        {
                            value: [24, 14, 13, 11, 0],
                            name: '90m风向',
                            symbol: 'none'
                        },
                        {
                            value: [-14, -14, -13, -11, 0],
                            name: '90m风能',
                            symbol: 'none'
                        },
                    ],
                },
            ],
        };

        option && myChart.setOption(option);
    });
</script>
