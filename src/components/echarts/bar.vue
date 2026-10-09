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
    });
    onMounted(() => {
        const chartDom = document.getElementById(props.id);
        const myChart = echarts.init(chartDom);
        let option = ref();
        option = {
            color: ['#036b64', '#FF8411'],
            grid: {
                bottom: 30
            },
            xAxis: {
                type: 'category',
                data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            },
            yAxis: {
                type: 'value',
            },
            series: [
                {
                    data: [150, 230, 224, 218, 135, 147, 260],
                    type: 'bar',
                    barMaxWidth: 10,
                    itemStyle : {
                        borderRadius: [2, 2, 0, 0],
                    }
                },
                {
                    data: [100, 20, 124, 118, 35, 247, 200],
                    type: 'bar',
                    barMaxWidth: 10,
                    itemStyle : {
                        borderRadius: [2, 2, 0, 0],
                    }
                },
            ],
        };

        option && myChart.setOption(option);
    });
</script>
<style scoped lang="scss">
    .echarts-components {
        width: 500px;
        height: 300px;
    }
</style>
