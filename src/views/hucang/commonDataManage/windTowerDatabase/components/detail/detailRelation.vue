<template>
    <!-- 测风塔各高度之间相关关系图 -->
    <h4 class="table-title"> 测风塔各高度之间相关关系图</h4>
    <div class="flex-content">
        <a-row>
            <template v-for="item,itemIndex in chartsData">
            <a-col :span="12">
                <scatter :color="item" :id="itemIndex"></scatter>
                <p class="formula">Reference Wind Speed (m/s)</p>
                <p class="formula formunla-bold">y=0.779x+1.491 R2 0.57</p>
            </a-col>
        </template>
        </a-row>
    </div>
</template>
<style scoped lang="scss">
  @import '../../css/title.scss';
    .flex-content {
        display: flex;
        flex-wrap: wrap;
    }
    .formula{
        text-align: center;
        color: #7C8294;
        font-size: 12px;
        margin: 5px;
    }
    .formunla-bold{
        font-size: 14px;
        font-weight: 500;
    }
</style>
<script setup>
    import scatter from '@/components/echarts/scatter.vue';
    const chartsData = [
        ['#036B64', '#FF8411'],
        ['#036B64', '#FF3E3E'],
        ['#036B64', '#9C76F6'],
        ['#036B64', '#FCBA5F'],
    ]
</script>
