<template>
    <!-- 风向风能方向统计及玫瑰图 -->
    <h4 class="table-title"> 测风塔插补后风向、风能方向统计 </h4>
    <a-table :columns="columns1" :pagination="false" :data-source="data">
        <template #bodyCell="{ column, text }">
            <template v-if="column.dataIndex === 'file'"> 文件名称 </template>
        </template>
    </a-table>
    <h4 class="table-title"> 测风塔风向、风能玫瑰图 </h4>
    <a-row>
        <template v-for="item in 3">
            <a-col :span="8" class="flex-center">
                <radar :width="400" :height="380" :isLegend="true" :id="item + 'radar1'"></radar>
            </a-col>
        </template>
    </a-row>
    <h4 class="table-title"> 测风塔各月风向玫瑰图 </h4>
    <a-row>
        <template v-for="item,itemIndex in 12">
            <a-col :span="8">
                <div class="flex-content">
                    <p>{{monthText[itemIndex]}}</p>
                    <radar :width="328" :height="288" :id="item + 'radar'"></radar>
                </div>
            </a-col>
        </template>
    </a-row>
</template>
<script setup>
    import radar from '@/components/echarts/radar.vue';
    const monthText = {
        0: '一月',
        1: '二月',
        2: '三月',
        3: '四月',
        4: '五月',
        5: '六月',
        6: '七月',
        7: '八月',
        8: '九月',
        9: '十月',
        10: '十一月',
        11: '十二月',
    }
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
    .ant-col{
        &:nth-child(3n+1) {
            .flex-content{
                border-left: 1px solid #ccc;
            }
        }
        &:nth-child(1) {
            .flex-content{
                border-top: 1px solid #ccc;
            }
        }
        &:nth-child(2) {
            .flex-content{
                border-top: 1px solid #ccc;
            }
        }
        &:nth-child(3) {
            .flex-content{
                border-top: 1px solid #ccc;
            }
        }
    }
    .flex-content{
        padding-bottom: 20px;
        border: 1px solid #ccc;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: url(@/assets/img/month-bg.png) no-repeat;
        background-size: auto 32px;
        background-position: top center;
        border-left: none;
        border-top: none;
        >p{
            height: 32px;
            line-height: 32px;
            margin-bottom: 20px;
        }
    }
    .flex-center{
        display: flex;
        justify-content: center;
    }
</style>
