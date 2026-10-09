<template>
    <!-- 全年风速/风功率密度月变化 -->
    <h4 class="table-title"> 各月平均风速风功率密度 </h4>
    <a-table :columns="columns" :data-source="data" :pagination="false" bordered size="middle" />
</template>
<style scoped lang="scss">
  @import '../../css/title.scss';
</style>
<script setup>
    const columns = [
        {
            title: '',
            dataIndex: 'name',
            key: 'name',
            align: 'center',
            children: [
                {
                    title: '',
                    dataIndex: 'age',
                    key: 'age',
                    align: 'center',
                },
            ],
        },
        {
            title: '风速 m/s',
            align: 'center',
            children: [
                {
                    title: '80m',
                    dataIndex: 'age',
                    key: 'age',
                    align: 'center',
                },
                {
                    title: '70m',
                    dataIndex: 'age',
                    key: 'age',
                    align: 'center',
                },
                {
                    title: '80m',
                    dataIndex: 'age',
                    key: 'age',
                    align: 'center',
                },
                // {
                //     title: '70m',
                //     dataIndex: 'age',
                //     key: 'age',
                //     align: 'center',
                // },
            ],
        },
        {
            title: '风功率密度 W/m²',
            children: [
                {
                    title: '80m',
                    dataIndex: 'age',
                    key: 'age',
                    align: 'center',
                },
                {
                    title: '70m',
                    dataIndex: 'street',
                    key: 'age',
                    align: 'center',
                },
                {
                    title: '60m',
                    dataIndex: 'age',
                    key: 'age',
                    align: 'center',
                },
                {
                    title: '50m',
                    dataIndex: 'age',
                    key: 'age',
                    align: 'center',
                },
            ],
        },
    ];
    const data = [...Array(12)].map((_, i) => ({
        key: i,
        name: i + 1 + '月',
        age: i + 1,
        street: 'Lake Park' + i,
        building: 'C',
        number: 2035,
        companyAddress: 'Lake Street 42',
        companyName: 'SoftLake Co',
        gender: 'M',
    }));
</script>
