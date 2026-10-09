<template>
    <div :id="id" class="echarts-components" :style="{width: props.width, height: props.height }"></div>
</template>
<script setup>
    import * as echarts from 'echarts';
    import { onMounted, reactive, ref, watch } from 'vue';
    let myChart;
    const props = defineProps({
        id: {
            type: String,
            default: 'id',
        },
        width: {
            type: String,
            default: 'auto'
        },
        height: {
            type: String,
            default: '300px',
        },
        xAxis: {
            type: Array,
            default: () => [],
        },
        yAxis: {
            type: Array,
            default: () => [],
        },
        series: {
            type: Array,
            default: function () {
                return [];
            },
        },
        dataset: {
            type: Object,
        },
        colorRange: {
            type: Array,
            default: function () {
                return [];
            },
        },
        legend: {
            type: Object,
            default: function () {
                return {
                    show: true,
                    center: true,
                    bottom: 0,
                    itemWidth: 10,
                    textStyle: {
                        color: '#363B4D',
                        lineHeight: 10,
                    },
                };
            },
        },
    });

    const onInitChart = () => {
        const chartDom = document.getElementById(props.id);
        myChart = echarts.init(chartDom);
        let option = ref();
        option = {
            // backgroundColor: '#0E1327',
            color: props.colorRange,
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow',
                },
            },
            grid: {
                top: 50,
                left: 30,
                right: 30,
                bottom: 50
            },
            legend: props.legend,
            xAxis: props.xAxis,
            yAxis: props.yAxis,
            series: props.series,
            dataset: props.dataset,
        };

        if (!myChart) {
            myChart = echarts.init(chartDom);
        } else {
            myChart.clear();
        }
        option && myChart.setOption(option);
        myChart.resize();
    };
    onMounted(() => {
        onInitChart();
    });
    watch(
        () => props.dataset,
        () => {
            if (props.dataset && props.dataset.source.length) {
                onInitChart();
            } else {
                const chartDom = document.getElementById(props.id);
                myChart = echarts.getInstanceByDom(chartDom);
                if (myChart) {
                    myChart.clear();
                }
            }
        },
        { deep: true },
    );
</script>
