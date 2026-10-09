<template>
    <!-- 50年一遇最大风速 -->
    <h4 class="table-title">5 倍平均风速法</h4>
    <a-table :columns="columns" :pagination="false" :data-source="data">
        <template #bodyCell="{ column, text }">
            <template v-if="column.dataIndex === 'file'"> 文件名称 </template>
        </template>
    </a-table>
    <h4 class="table-title">5 日雷暴法</h4>
    <p class="des">V50-max = 21.56m/s</p>
</template>
<style scoped lang="scss">
  @import '../../css/title.scss';
    .des{
        padding: 12px 15px;
        background: #FAFAFA;
        border: 1px solid #E4E6EE;
    }
</style>
<script setup>
    const columns = [
        {
            title: '高度（m）',
            dataIndex: 'name',
        },
        {
            title: '年平均风速 m/s',
            dataIndex: 'money',
        },
        {
            title: '50年一遇最大风速 m/s',
            dataIndex: 'address',
        },
        {
            title: '推算到标准空气密度下 m/s',
            dataIndex: 'file',
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
