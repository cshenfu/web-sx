<template>
    <!-- 威布尔分布 -->
    <h4 class="table-title"> 测风塔xxx处Weibull形状参数图 </h4>
    <commonCharts
        :id="'weibull'"
        :width="'500px'"
        :xAxis="xAxis"
        :yAxis="yAxis"
        :series="series"
        :legend="legend"
        :dataset="dataset['januaryData']"
    ></commonCharts>
</template>
<script setup>
    import {ref} from 'vue';
    import commonCharts from '@/components/echarts/commonCharts.vue';
    const legend = ref({
        show: true,
        itemWidth: 12,
        itemHeight: 12,
        bottom: 10,
        icon: 'rect'
    });
    const xAxis = ref([
        {
            type: 'category',
        },
    ]);
    const yAxis = ref([
        {
            type: 'value',
            name: '风速(m/s)',
            nameLocation: 'end',
            nameGap: 30,
            nameTextStyle: {
                fontSize: '12px',
                fontWeight: 500,
                color: '#7C8294',
            },
            splitLine: {
                lineStyle: {
                    width: 1,
                    type: 'solid',
                    color: '#eaeaea',
                },
            },
        },
        {
            type: 'value',
            name: '',
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
                    color: '#eaeaea',
                },
            },
        },
        {
            type: 'value',
            name: '风功率密度(W/M²)',
            nameLocation: 'end',
            nameTextStyle: {
                fontSize: '12px',
                fontWeight: 500,
                color: '#7C8294',
                align: 'right',
                overflow: 'break'
            },
            nameGap: 30,
            splitLine: {
                lineStyle: {
                    width: 1,
                    type: 'solid',
                    color: '#eaeaea',
                },
            },
        },
    ]);
    const series = ref([
        {
            type: 'bar',
            barCategoryGap: '0%',
            name: '风速柱状图',
            emphasis: {
                focus: 'series',
            },
            encode: {
                y: 'reportDataNum',
            },
            yAxisIndex: 0,
            itemStyle: {
                color: '#E5F0EF',
                borderColor: '#ADCFCC'
            }
        },
        {
            type: 'line',
            symbol: 'none',
            name: '风功率密度',
            emphasis: {
                focus: 'series',
            },
            smooth: true,
            lineStyle: {
                width: 2,
                color: '#036B64',
            },
            color: '#036B64',
            encode: {
                y: 'reportOrgNum',
            },
            yAxisIndex: 1,
        },
        {
            type: 'line',
            symbol: 'none',
            name: '风速',
            emphasis: {
                focus: 'series',
            },
            smooth: true,
            itemStyle: {
                color: '#FF8411'
            },
            lineStyle: {
                width: 2,
                color: '#FF8411'
            },
            encode: {
                y: 'reportData',
            },
            yAxisIndex: 0,
        },
    ]);
    const dataset = ref({
        januaryData: {
            source: [
                {
                    reportDataNum: '150',
                    reportData: '150',
                    reportOrgNum: '10',
                    a: 2,
                },
                {
                    reportDataNum: '239',
                    reportData: '239',
                    reportOrgNum: '20',
                    a: 4,
                },
                {
                    reportDataNum: '220',
                    reportData: '220',
                    reportOrgNum: '100',
                    a: 6,
                },
                {
                    reportDataNum: '120',
                    reportData: '120',
                    reportOrgNum: '5',
                    a: 8,
                },
                {
                    reportDataNum: '90',
                    reportData: '90',
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
            dimensions: ['a', 'reportDataNum', 'reportData', 'reportOrgNum'],
        },
        februaryData: {
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
</script>
<style scoped lang="scss">
  @import '../../css/title.scss';
</style>
