<template>
    <div class="edit-table-component">
        <a-table
            :pagination="false"
            :columns="props.columns"
            :data-source="props.showMoreTemplate ? (showMoreKey ? dataList : dataList.filter((ele) => filterTypes.includes(ele.type))) : dataList"
            bordered
        >
            <template #bodyCell="{ column, text, record }">
                <template v-if="column && column.isEdit">
                    <a-input-number
                        v-if="column.type"
                        :min="record.min"
                        :max="record.max"
                        v-model:value="record[column.dataIndex]"
                        :controls="false"
                        style="margin: -5px 0"
                        @blur="checkRangeType(column, record)"
                    />
                    <a-input
                        v-else
                        v-model:value="record[column.dataIndex]"
                        style="margin: -5px 0"
                    />
                </template>
                <template v-if="column && typeof record[column.dataIndex] == 'string' && column.isDesc">
                    <span style="display: inline-block; margin-right: 8px">{{
                        record[column.dataIndex]
                    }}</span>
                    <a-popover placement="right" v-if="record.desc">
                        <template #content>
                            <p style="max-width: 200px">{{ record.desc }}</p>
                        </template>
                        <!-- <template #title>
                        <span>Title</span>
                        </template> -->
                        <question-circle-outlined />
                    </a-popover>
                </template>
            </template>
        </a-table>
        <template v-if="props.showMoreTemplate">
            <div class="show-more" v-show="!showMoreKey" @click="showMoreKey = true">
                <span>高级参数设置</span>
                <iconpark-icon :size="10" class="retract-icon" name="shuangjiantoushouqi"></iconpark-icon>
                <div class="show-more-illustrate">
                    <i>!</i>
                    <span>点击这里可进行更详细数据参数设置</span>
                </div>
            </div>
            <div class="retract-more" v-show="showMoreKey" @click="showMoreKey = false">
                <span>收起</span>
                <iconpark-icon
                    :size="10"
                    name="shuangjiantoushouqi"
                ></iconpark-icon>
            </div>
        </template>
    </div>
</template>
<style scoped lang="scss">
    @import './EditTable.scss';
</style>
<script setup>
    import { ref, watch } from 'vue';
    import { useRoute } from 'vue-router';
    import { QuestionCircleOutlined } from '@ant-design/icons-vue';
    const emits = defineEmits(['updateRangeYear']);
    const route = useRoute();
    const showMoreKey = ref(false);
    const filterTypes = ['设备相关', '资金及费率', '预备费', '发电上网']; // 只适用于一键风电可研
    const props = defineProps({
        columns: {
            type: Array,
            default: () => {
                return [];
            },
        },
        dataSource: {
            type: Array,
            default: () => {
                return [];
            },
        },
        showMoreTemplate: {
            type: Boolean,
            default: false,
        },
    });
    const dataList = ref([]);
    const checkRangeType = (type, value) => {
        console.log(value);
        // 如果不是数字，则不更新数据
        if (isNaN(value.price * 1) || value.price == null) {
            value.price = null;
            return false;
        }
        // 如果是光伏组件质保期，需要更新
        if (value.dataIndex == 'deviceWarranty') {
            emits('updateRangeYear', value.price);
        }
        // 如果要求整数类型
        if (value.isParseInt) {
            value.price = parseInt(value.price);
        }
        // 如果要求小数类型
        if (value.isParseFloat) {
            const formatResult = (value.price * 1).toFixed(value.isParseFloat);
            // 用于用户删除调整值操作
            if (formatResult * 1 < value.min) {
                value.price = null;
            } else {
                value.price = formatResult;
            }
        }
    };
    watch(
        () => props.dataSource.length,
        (newValue, oldValue) => {
            const arrs = [];
            const formatData =
                route.query.type == 'edit'
                    ? props.dataSource
                    : props.dataSource.filter((ele) => !ele.isEdit);
            formatData &&
                formatData.forEach((ele) => {
                    // if (ele.default || ele.default == 0) {
                    //     arrs.push(ele);
                    // }
                    arrs.push(ele);
                });
            dataList.value = arrs;
            // debugger
        },
        {
            deep: true,
            immediate: true,
        },
    );
    watch(
        () => props.isShowMore,
        (newValue, oldValue) => {
            // console.log(dataList.value);
            // debugger
        },
        {
            deep: true,
            immediate: true,
        },
    );
    defineExpose({
        dataList,
    });
</script>
