<template>
    <!-- 数据长期订正 -->
    <h4 class="table-title"> 测风塔数据与中尺度数据相关关系图 </h4>
    <scatter style="width: 500px" :id="'scatter'"></scatter>
    <h4 class="table-title"> 测风塔订正前后风速（按30年风速水平订正） </h4>
    <a-table :columns="columns1" :pagination="false" :data-source="data">
        <template #bodyCell="{ column, text }">
            <template v-if="column.dataIndex === 'file'"> 文件名称 </template>
        </template>
    </a-table>
    <h4 class="table-title"> 测风塔订正后各高度风速及风功率（m/s,W/m²） </h4>
    <a-table :columns="columns" :pagination="false" :data-source="data">
        <template #bodyCell="{ column, text }">
            <template v-if="column.dataIndex === 'file'"> 文件名称 </template>
        </template>
    </a-table>
</template>
<script setup>
    import scatter from '@/components/echarts/scatter.vue';
    const columns = [
        {
            title: '高度m',
            dataIndex: 'name',
        },
        {
            title: '风速',
            dataIndex: 'money',
        },
        {
            title: '风功率密度',
            dataIndex: 'address',
        },
        {
            title: '风速',
            dataIndex: 'file',
        },
    ];
    const columns1 = [
        {
            title: '订正高度m',
            dataIndex: 'name',
        },
        {
            title: '订正前年平均风速（m/s）',
            dataIndex: 'money',
        },
        {
            title: '订正后年平均风速（m/s）',
            dataIndex: 'address',
        },
    ];
    const data = [
        {
            key: '1',
            name: 'John Brown',
            money: '￥300,000.00',
            address: 'New York No. 1 Lake Park',
        },
        {
            key: '2',
            name: 'Jim Green',
            money: '￥1,256,000.00',
            address: 'London No. 1 Lake Park',
        },
        {
            key: '3',
            name: 'Joe Black',
            money: '￥120,000.00',
            address: 'Sidney No. 1 Lake Park',
        },
    ];
</script>
<style scoped lang="scss">
  @import '../../css/title.scss';
</style>
