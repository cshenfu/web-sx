<template>
    <!-- 风速和风功率密度频率分布 -->
    <lineCharts
        style="width: 550px;"
        :id="'sdjflkdsjfldkf'"
        :xAxis="xAxis"
        :yAxis="yAxis"
        :series="series"
        :dataset="dataset['januaryData']"
    ></lineCharts>
</template>
<script setup>
    import {ref, onMounted} from 'vue';
    import lineCharts from '@/components/echarts/line.vue';
    const monthArr = ref([
        {
            name: '一月',
            id: 'januarySpeed',
            data: 'januaryData',
        },
        {
            name: '二月',
            id: 'februarySpeed',
            data: 'februaryData',
        },
        {
            name: '三月',
            id: 'MarchSpeed',
            data: 'februaryData',
        },
        {
            name: '四月',
            id: 'aprilSpeed',
            data: 'februaryData',
        },
        {
            name: '五月',
            id: 'maySpeed',
            data: 'februaryData',
            data: 'februaryData',
        },
        {
            name: '六月',
            id: 'juneSpeed',
            data: 'februaryData',
        },
        {
            name: '七月',
            id: 'julySpeed',
            data: 'februaryData',
        },
        {
            name: '八月',
            id: 'augustSpeed',
            data: 'februaryData',
        },
        {
            name: '九月',
            id: 'septemberSpeed',
            data: 'februaryData',
        },
        {
            name: '十月',
            id: 'octoberSpeed',
            data: 'februaryData',
        },
        {
            name: '十一月',
            id: 'novemberSpeed',
            data: 'februaryData',
        },
        {
            name: '十二月',
            id: 'decemberSpeed',
            data: 'februaryData',
        },
    ]);
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
        {
            type: 'value',
            name: '风功率密度(W/M²)',
            nameLocation: 'end',
            nameTextStyle: {
                fontSize: '12px',
                fontWeight: 500,
                color: ' #7C8294',
                padding: [0, 10, 0, 0],
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
            yAxisIndex: 0,
        },
        {
            type: 'line',
            symbol: 'rect',
            name: '风功率密度',
            emphasis: {
                focus: 'series',
            },
            lineStyle: {
                width: 2,
                color: '#4B74FE',
            },
            encode: {
                y: 'reportOrgNum',
            },
            yAxisIndex: 1,
        },
    ]);
    const dataset = ref({
        januaryData: {
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
    onMounted(() => {
        setTimeout(() => {
            dataset.value['januaryData'].source = [
                {
                    reportDataNum: '20',
                    reportOrgNum: '10',
                    a: 2,
                },
                {
                    reportDataNum: '100',
                    reportOrgNum: '20',
                    a: 4,
                },
                {
                    reportDataNum: '220',
                    reportOrgNum: '100',
                    a: 6,
                },
            ];
        }, 5000);
    });
</script>
