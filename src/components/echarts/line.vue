<template>
    <div :id="id" class="echarts-components" :style="{ height: height }"></div>
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
        isSHowLegend: {
            type: Boolean,
            default: true,
        },
        title: {
            type: Object,
            default: () => {},
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
                return ['#036B64', '#4B74FE'];
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
            title: props.title,
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow',
                },
            },
            grid: {
                bottom: 50
            },
            legend: {
                show: props.isSHowLegend,
                center: true,
                bottom: 0,
                itemWidth: 10,
                textStyle: {
                    color: '#363B4D',
                    lineHeight: 10,
                },
            },
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
        window.addEventListener('resize', () => {
            myChart.resize();
        })
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
                let chartDom = document.getElementById(props.id);
                myChart = echarts.getInstanceByDom(chartDom);
                if (myChart) {
                    myChart.clear();
                }
            }
        },
        { deep: true },
    );
</script>
<style scoped lang="scss">
    .echarts-components {
        width: 100%;
        height: 300px;
    }
</style>
