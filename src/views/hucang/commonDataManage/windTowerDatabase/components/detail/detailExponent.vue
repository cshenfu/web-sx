<template>
    <!-- 风切变指数 -->
    <h4 class="table-title"> 测风塔各高度风切变指数 </h4>
    <a-table
        class="exponent-table"
        :columns="columns"
        :data-source="data"
        :pagination="false"
        bordered
        size="middle"
    >
        <template v-slot="nameHeader"> slkjfdldskjfd </template>
    </a-table>
    <h4 class="table-title"> 测风塔综合风切变指数图 </h4>
    <commonCharts
        :id="'exponent'"
        :width="'500px'"
        :xAxis="xAxis"
        :yAxis="yAxis"
        :series="series"
        :legend="legend"
        :dataset="dataset['januaryData']"
    ></commonCharts>
</template>
<script setup>
    import { ref } from 'vue';
    import commonCharts from '@/components/echarts/commonCharts.vue';
    const legend = ref({
        show: true,
        itemWidth: 12,
        itemHeight: 12,
        bottom: 10,
        icon: 'rect',
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
    ]);
    const series = ref([
        {
            type: 'line',
            symbol: 'none',
            name: '风速',
            emphasis: {
                focus: 'series',
            },
            smooth: true,
            itemStyle: {
                color: '#FF8411',
            },
            lineStyle: {
                width: 2,
                color: '#FF8411',
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
            dimensions: ['a', 'reportData'],
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
    const columns = [
        {
            title: '',
            dataIndex: 'name',
            key: 'name',
            align: 'center',
            customHeaderCell: () => {
                return {
                    style: {
                        background: '#ffffff',
                    },
                };
            },
            children: [
                {
                    title: '',
                    dataIndex: 'age',
                    key: 'age',
                    align: 'center',
                    customHeaderCell: () => {
                        return {
                            style: {
                                background: '#ffffff',
                            },
                        };
                    },
                    children: [
                        {
                            title: '高度',
                            dataIndex: 'age',
                            key: 'age',
                            align: 'center',
                        },
                    ],
                },
            ],
        },
        {
            title: '理论个数',
            align: 'center',
            children: [
                {
                    title: 300,
                    dataIndex: 'age',
                    key: 'age',
                    align: 'center',
                    customHeaderCell: () => {
                        return {
                            style: {
                                background: '#ffffff',
                            },
                        };
                    },
                    children: [
                        {
                            title: '80',
                            dataIndex: 'age',
                            key: 'age',
                            align: 'center',
                        },
                    ],
                },
            ],
        },
        {
            title: '实测个数',
            align: 'center',
            children: [
                {
                    title: 300,
                    dataIndex: 'age',
                    key: 'age',
                    align: 'center',
                    customHeaderCell: () => {
                        return {
                            style: {
                                background: '#ffffff',
                            },
                        };
                    },
                    children: [
                        {
                            title: '80',
                            dataIndex: 'age',
                            key: 'age',
                            align: 'center',
                        },
                    ],
                },
            ],
        },
        {
            title: '缺测数据',
            align: 'center',
            children: [
                {
                    title: 300,
                    dataIndex: 'age',
                    key: 'age',
                    align: 'center',
                    customHeaderCell: () => {
                        return {
                            style: {
                                background: '#ffffff',
                            },
                        };
                    },
                    children: [
                        {
                            title: '80',
                            dataIndex: 'age',
                            key: 'age',
                            align: 'center',
                        },
                    ],
                },
            ],
        },
        {
            title: '不合理个数',
            align: 'center',
            children: [
                {
                    title: 300,
                    dataIndex: 'age',
                    key: 'age',
                    align: 'center',
                    customHeaderCell: () => {
                        return {
                            style: {
                                background: '#ffffff',
                            },
                        };
                    },
                    children: [
                        {
                            title: '80',
                            dataIndex: 'age',
                            key: 'age',
                            align: 'center',
                        },
                    ],
                },
            ],
        },
        {
            title: '有效数据完整率（%）',
            align: 'center',
            children: [
                {
                    title: 300,
                    dataIndex: 'age',
                    key: 'age',
                    align: 'center',
                    width: 200,
                    customHeaderCell: () => {
                        return {
                            style: {
                                background: '#ffffff',
                            },
                        };
                    },
                    children: [
                        {
                            title: '综合风切变',
                            dataIndex: 'custom',
                            key: 'custom',
                            align: 'center',
                            width: 200,
                            colSpan: 1,
                            customCell: (_, index) => {
                                // console.log(index);
                                // console.log(_);
                                if (index === 0) {
                                    return {
                                        rowSpan: data.length,
                                    };
                                } else {
                                    return {
                                        rowSpan: 0,
                                    };
                                }
                            },
                        },
                    ],
                },
            ],
        },
    ];
    const data = [...Array(12)].map((_, i) => ({
        key: i,
        name: i + 1 + '月',
        age: i + 1,
        street: 'Lake Park',
        building: 'C',
        number: 2035,
        companyAddress: 'Lake Street 42',
        companyName: 'SoftLake Co',
        gender: 'M',
        custom: 111,
    }));
</script>
<style scoped lang="scss">
  @import '../../css/title.scss';
</style>
