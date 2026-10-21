<template>
    <div class="master-data-template">
        <ul class="flex-column" v-if="props.masterData.length">
            <li class="title-li">
                <span>道路类型</span>
                <span>项目</span>
                <span>单位</span>
                <span>数量</span>
                <span>备注</span>
            </li>
            <div class="scroll-container">
                <li v-for="(value, key) in newListData">
                    <span>{{ key }}</span>
                    <div class="container-item">
                        <p v-for="subItem in value">
                            <i>{{ subItem['name'] }}</i>
                            <i>{{ subItem['unit'] }}</i>
                            <i>{{ subItem['quality'] }}</i>
                            <i>{{ subItem['remark'] }}</i>
                        </p>
                    </div>
                </li>
            </div>
            <!-- <EditTable :columns="columns" :dataSource="dataSource"></EditTable> -->
            <!-- <li v-for="(item, index) in props.masterData">
                <span v-html="item.name" style="display: flex;align-items: center"></span>
                <span
                    v-if="item.isDownLoad"
                    style="cursor: pointer; display: flex; align-items: center;color: #0389EA;"
                    @click="handleDownload(item)"
                >
                    <iconpark-icon
                        name="xiazai"
                        style="color: #0389EA; margin-right: 8px"
                    ></iconpark-icon
                    >点击下载</span
                >
                <span v-else v-html="item.data"></span>
            </li> -->
        </ul>
    </div>
</template>
<script setup>
    import { onBeforeMount, ref } from 'vue';
    import EditTable from '@/components/editTable/EditTable.vue';
    const props = defineProps({
        masterData: {
            type: Array,
            default: () => [],
        },
    });
    const columns = ref([]);
    const dataSource = ref([]);
    const newListData = ref({});
    const listData = ref([
        {
            type: 'newRoad',
            name: '新建进站道路长度',
            unit: 'km',
            quality: 0.06,
            remark: '备注',
        },
        {
            type: 'newRoad',
            name: '土方开挖',
            unit: 'm',
            quality: 0.06,
            remark: '',
        },
        {
            type: 'newRoad',
            name: '石方开挖',
            unit: 'm',
            quality: 0.06,
            remark: '',
        },
        {
            type: 'inRoad',
            name: '土方开挖',
            unit: 'm',
            quality: 0.06,
            remark: '',
        },
    ]);
    const computedRowSpan = (data, key) => {
        const rowSpanData = Array(data.length).fill(1);
        let i = 0;
        while (i < data.length) {
            let count = 1;
            while (i + count < data.length && data[i][key] === data[i + count][key]) {
                rowSpanData[i + count] = 0;
                ++count;
            }
            rowSpanData[i] = count;
            i += count;
        }
        return rowSpanData;
    };
    const formatListData = () => {
        listData.value.length &&
            listData.value.map((ele) => {
                if (!newListData.value[ele.type]) {
                    newListData.value[ele.type] = [];
                }
                newListData.value[ele.type].push(ele);
            });
        console.log(newListData.value);
    };
    onBeforeMount(() => {
        const rowSpanData = computedRowSpan(
            dataSource.value.filter((ele) => ele.show == null || ele.show),
            'type',
        );
        columns.value = [
            {
                title: '道路类型',
                dataIndex: 'type',
                width: '17%',
                align: 'center',
                customCell: (_, index) => {
                    return {
                        rowSpan: rowSpanData[index],
                    };
                },
            },
            {
                title: '项目',
                dataIndex: 'name',
                width: '28%',
                align: 'center',
            },
            {
                title: '单位',
                dataIndex: 'unit',
                width: '15%',
                align: 'center',
            },
            {
                title: '数量',
                dataIndex: 'default',
                width: '15%',
                isDesc: true,
                align: 'center',
            },
            {
                title: '备注',
                dataIndex: 'price',
                width: '20%',
                align: 'center',
                type: 1,
            },
        ];

        formatListData();
    });
</script>
<style scoped lang="scss">
    $primary-color: var(--theme);
    $primary-light-color: var(--themeLight);
    .master-data-template {
        width: 584px;
        max-height: calc(100vh - 240px);
        overflow: auto;
        background: rgba(255, 255, 255, 0.94);
        box-shadow: 0px 0px 14px 0px rgba(255, 255, 255, 0.16);
        border-radius: 0px 0px 4px 4px;
        border-top: 2px solid $primary-color;
        pointer-events: all;
        ul {
            overflow: auto;
            li {
                display: flex;
                align-items: stretch;
                border-bottom: 1px solid rgba(0, 0, 0, 0.2);
                span {
                    // color: $primary-color;
                    line-height: 16px;
                    font-size: 14px;
                    flex: 1;
                    padding: 16px;
                    color: #333;
                    font-weight: normal;
                    border-right: 1px solid rgba(0, 0, 0, 0.2);
                    &:last-child {
                        border-right: none;
                    }
                    &:nth-child(1) {
                        flex: none;
                        width: 120px;
                    }
                    &:nth-child(2) {
                        flex: none;
                        width: 180px;
                    }
                }
                &.title-li {
                    background: #ffffff;
                    box-shadow: 0px 0px 8px 0px rgba(0, 0, 0, 0.15);
                    span {
                        font-weight: 600;
                        color: #333;
                    }
                    padding-right: 6px;
                }
            }
        }
    }
    .scroll-container {
        max-height: calc(100vh - 300px);
        overflow-y: auto;
        span {
            display: flex;
            align-items: center;
        }
        .container-item {
            flex: 1;
            color: #333;
            p {
                display: flex;
                padding-right: 6px;
                border-bottom: 1px solid rgba(0, 0, 0, 0.2);
                &:last-child {
                    border-bottom: none;
                }
            }
            i {
                font-style: normal;
                flex: 1;
                display: flex;
                align-items: center;
                padding: 16px;
                border-right: 1px solid rgba(0, 0, 0, 0.2);
                
                &:nth-child(1) {
                    flex: none;
                    width: 180px;
                }
                &:last-child {
                    border-right: none;

                }
            }
        }
    }
</style>
