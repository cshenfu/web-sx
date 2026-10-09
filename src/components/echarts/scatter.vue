<template>
    <div :id="id" class="echarts-components"></div>
</template>
<script setup>
    import * as echarts from 'echarts';
    import { onMounted, reactive, ref } from 'vue';
    const props = defineProps({
        id: {
            type: String,
            default: 'id',
        },
        color: {
            type: Array,
            default: function () {
                return  ['#036B64', '#FF8411']
            }
        }
    });
    onMounted(() => {
        const chartDom = document.getElementById(props.id);
        const myChart = echarts.init(chartDom);
        let option = ref();
        const markLineOpt = {
            animation: false,
            // label: {
            //     formatter: 'y = 0.5 * x + 3',
            //     align: 'right',
            // },
            lineStyle: {
                type: 'solid',
            },
            tooltip: {
                formatter: 'y = 0.5 * x + 3',
            },
            data: [
                [
                    {
                        coord: [0, 3],
                        symbol: 'none',
                    },
                    {
                        coord: [15, 9],
                        symbol: 'none',
                    },
                ],
            ],
        };
        option = {
            legend: {
                show: false,
                data: [
                    {
                        name: 'a',
                    },
                    {
                        name: 'b',
                    },
                ],
            },
            color: props.color,
            xAxis: {
                name: '横向名称',
                nameLocation: 'center',
            },
            yAxis: {
                name: '纵向名称',
                nameLocation: 'center',
                nameTextStyle: {
                    padding: [0, 0, 15, 0],
                },
            },
            grid: {
                left: 45,
                top: 35,
                bottom: 30,
            },
            series: [
                {
                    data: [
                        [0, 3],
                        [14, 9],
                    ],
                    symbol: 'none',
                    name: 'b',
                    type: 'line',
                },
                {
                    symbolSize: 10,
                    name: 'a',
                    data: [
                        [10.0, 8.04],
                        [8.07, 6.95],
                        [13.0, 7.58],
                        [9.05, 8.81],
                        [11.0, 8.33],
                        [14.0, 7.66],
                        [13.4, 6.81],
                        [10.0, 6.33],
                        [14.0, 8.96],
                        [12.5, 6.82],
                        [9.15, 7.2],
                        [11.5, 7.2],
                        [3.03, 4.23],
                        [12.2, 7.83],
                        [2.02, 4.47],
                        [1.05, 3.33],
                        [4.05, 4.96],
                        [6.03, 7.24],
                        [12.0, 6.26],
                        [12.0, 8.84],
                        [7.08, 5.82],
                        [5.02, 5.68],
                    ],
                    type: 'scatter',
                    // markLine: markLineOpt,
                },
            ],
        };

        option && myChart.setOption(option);
    });
</script>
<style scoped lang="scss">
    .echarts-components {
        min-width: 500px;
        height: 300px;
    }
</style>
