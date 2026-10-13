<template>
    <div class="land-area-template">
        <!-- <header class="resource-management-header">永久用地</header> -->
        <TableList
            :tableData="landAreaDataList"
            :bordered="true"
            :isShowPage="false"
            :tableColumn="LAND_AREA_CLOUMN"
            style="margin-bottom: 12px;"
        >
            <template #areaSquareMeters="{ record, index }">
                <a-input-number
                    v-if="!(record['project'] == '永久用地' || record['project'] == '长期租地' || record['project'] == '临时用地')"
                    placeholder="请输入"
                    v-model:value="record['areaSquareMeters']"
                    :controls="false"
                    :disabled="record['project'] == '合计'"
                    style="width: 100%; font-size: 12px"
                    @input="isLandAreaChange = 1"
                    @blur="computedMuData(record, index)"
                ></a-input-number>
            </template>
            <template #areaMu="{ record }">
                <a-input-number
                    v-if="!(record['project'] == '永久用地' || record['project'] == '长期租地' || record['project'] == '临时用地')"
                    disabled
                    placeholder="请输入"
                    v-model:value="record['areaMu']"
                    :controls="false"
                    style="width: 100%; font-size: 12px"
                    @input="isLandAreaChange = 1"
                ></a-input-number>
            </template>
            <template #remark="{ record }">
                <a-input
                    v-if="!(record['project'] == '永久用地' || record['project'] == '长期租地' || record['project'] == '临时用地')"
                    placeholder="请输入"
                    :disabled="record['project'] == '合计'"
                    v-model:value="record['remark']"
                    style="width: 100%; font-size: 12px"
                ></a-input>
            </template>
        </TableList>
    </div>
</template>
<style scoped lang="scss">
    @import './ResourceManage.scss';
</style>
<script setup>

    import { ref, watch } from 'vue';
    import TableList from '@/components/tableList/TableList.vue';
    import {
        LAND_AREA_CLOUMN
    } from './LandArea.js';
    const props = defineProps({
        resourceData: {
            type: Array,
            default: () => [],
        },
        projectId: {
            type: String,
            default: '',
        },
    });
    const isLandAreaChange = ref(0);
    const landAreaDataList = ref([]);
    const landAreaDataForDataType15 = ref([]);
    const totalIndexArray = ref([]);
    const computedMuData = (record, index) => {
        console.log(record, index);
        record['areaMu'] = parseFloat(record['areaSquareMeters'] * 0.0015).toFixed(3);
        console.log(totalIndexArray.value.length);
        for (let i = 0; i < totalIndexArray.value.length; i++) {
            const totalIndex = totalIndexArray.value[i];
            if (totalIndex > index) {
                console.log(totalIndex, '合计的index值')
                landAreaDataList.value[totalIndex]['areaSquareMeters'] = 0;
                for (let j = totalIndexArray.value[i - 1] ? totalIndexArray.value[i - 1] + 1 : 0; j < totalIndex; j++) {
                    console.log(j, 'j的index值', landAreaDataList.value[j]['areaSquareMeters'] * 1);
                    landAreaDataList.value[totalIndex]['areaSquareMeters'] += landAreaDataList.value[j]['areaSquareMeters'] * 1;
                }
                landAreaDataList.value[totalIndex]['areaMu'] = parseFloat(landAreaDataList.value[totalIndex]['areaSquareMeters'] * 0.0015).toFixed(3);
                break;
            }
        }
    };
    watch(
        () => props.resourceData,
        (val) => {
            const landAreaDataForDataType15Origin = val.filter((item) => item.dataType == 15);
            if (landAreaDataForDataType15Origin.length && landAreaDataForDataType15Origin[0]['jsonList']) {
                landAreaDataForDataType15.value = JSON.parse(landAreaDataForDataType15Origin[0]['jsonList']) || [];
                console.log(landAreaDataForDataType15.value);
                const type = typeof(landAreaDataForDataType15.value)
                console.log(type)
            }

            const landAreaOriginList = val.filter((item) => item.dataType == 16);
                if (landAreaOriginList.length && landAreaOriginList[0]['jsonList']) {
                    landAreaDataList.value = JSON.parse(landAreaOriginList[0]['jsonList']) || [];
                    if (landAreaDataList.value.length) {
                        // 去除第一条数据（假表头）
                        landAreaDataList.value.shift();
                        if (landAreaDataList.value.length) {
                            // 获取所有合计行索引
                            totalIndexArray.value = landAreaDataList.value.reduce((pre, cur, index) => {
                                if (cur['project'] == '合计') {
                                    pre.push(index);
                                }
                                return pre;
                            }, []);
                            console.log(totalIndexArray.value)
                            // 获取所有合计行数据
                        }
                    }
                }
        },
        { immediate: true, deep: true }
    );
    const postData = () => {
        const landAreaData = JSON.parse(JSON.stringify(landAreaDataList.value));
        const landAreaTableColumnsData = {"serialNumber":"序号","project":"项目","areaSquareMeters":"占地面积（m²）","areaMu":"占地面积(亩)","remark":"备注"};
        landAreaData.unshift(landAreaTableColumnsData);
        const landAreaObj = {
            projectId: props.projectId,
            dataType: 16,
            dataClassify: 4,
            isChange: isLandAreaChange.value,
            dataJson: JSON.stringify(landAreaData)
        };
        if (isLandAreaChange.value && landAreaDataForDataType15.value.length) {
            // 变更数据需要单独处理dataType15的数据
            for (let i = 0; i < landAreaDataForDataType15.value.length; i++) {
                const item = landAreaDataForDataType15.value[i];
                if (item['code'] == '1.1.1' || item['code'] == '1.1.5' || item['code'] == '1.1.6') {
                    item['num'] = landAreaDataList.value[totalIndexArray.value[0]]['areaMu']
                } else if (item['code'] == '1.1.2') {
                    item['num'] = landAreaDataList.value[totalIndexArray.value[1]]['areaMu']
                } else if (item['code'] == '1.1.3' || item['code'] == '1.1.9') {
                    item['num'] = landAreaDataList.value[totalIndexArray.value[2]]['areaMu']
                } else if (item['code'] == '5.1') {
                    // 等于永久占地面积+长期租地占地面积
                    item['num'] = landAreaDataList.value[totalIndexArray.value[0]]['areaSquareMeters'] * 1 + landAreaDataList.value[totalIndexArray.value[1]]['areaSquareMeters'] * 1
                }
            }
            const landAreaDataForDataType15Obj = {
                projectId: props.projectId,
                dataType: 15,
                dataClassify: 4,
                isChange: isLandAreaChange.value,
                dataJson: JSON.stringify(landAreaDataForDataType15.value)
            };
            return [landAreaObj, landAreaDataForDataType15Obj];
        }
        return [landAreaObj];
    }
    defineExpose({
        postData
    })
</script>
