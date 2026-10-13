<template>
    <div class="road-data-template">
        <p class="desc-message">说明：未调整的数据，将按照元数据进行使用计算</p>
        <header class="resource-management-header">新建道路</header>
        <TableList
            :tableData="newRoadDataList"
            :bordered="true"
            :isShowPage="false"
            :tableColumn="ENGINEERING_CLOUMN"
            style="margin-bottom: 12px;"
        >
            <template #quantity="{ record }">
                <a-input-number
                    placeholder="请输入"
                    v-model:value="record['quantity']"
                    :controls="false"
                    style="width: 100%; font-size: 12px"
                    @input="isNewRoadChange = 1"
                ></a-input-number>
            </template>
            <template #remark="{ record }">
                <a-input
                    placeholder="请输入"
                    v-model:value="record['remark']"
                    style="width: 100%; font-size: 12px"
                    @input="isNewRoadChange = 1"
                ></a-input>
            </template>
        </TableList>
        <header class="resource-management-header">场内道路</header>
        <TableList
            :tableData="siteRoadDataList"
            :bordered="true"
            :isShowPage="false"
            :tableColumn="ENGINEERING_CLOUMN"
            style="margin-bottom: 12px;"
        >
            <template #quantity="{ record }">
                <a-input-number
                    placeholder="请输入"
                    v-model:value="record['quantity']"
                    :controls="false"
                    style="width: 100%; font-size: 12px"
                    @input="isSiteRoadChange = 1"
                ></a-input-number>
            </template>
            <template #remark="{ record }">
                <a-input
                    placeholder="请输入"
                    v-model:value="record['remark']"
                    style="width: 100%; font-size: 12px"
                    @input="isSiteRoadChange = 1"
                ></a-input>
            </template>
        </TableList>
        <header class="resource-management-header">扩建道路</header>
        <TableList
            :tableData="expansionRoadDataList"
            :bordered="true"
            :isShowPage="false"
            :tableColumn="ENGINEERING_CLOUMN"
            style="margin-bottom: 12px;"
        >
        <template #quantity="{ record }">
                <a-input-number
                    placeholder="请输入"
                    v-model:value="record['quantity']"
                    :controls="false"
                    style="width: 100%; font-size: 12px"
                    @input="isExpansionRoadChange = 1"
                ></a-input-number>
            </template>
            <template #remark="{ record }">
                <a-input
                    placeholder="请输入"
                    v-model:value="record['remark']"
                    style="width: 100%; font-size: 12px"
                    @input="isExpansionRoadChange = 1"
                ></a-input>
            </template>
        </TableList>
    </div>
</template>
<script setup>
    import { ref, watch } from 'vue';
    import TableList from '@/components/tableList/TableList.vue';
    import { ENGINEERING_CLOUMN } from './RoadData.js';
    const props = defineProps({
        resourceData: {
            type: Array,
            default: () => [],
        },
        projectId: {
            type: String,
            default: '',
        }
    })
    const newRoadDataList = ref([]);
    const siteRoadDataList = ref([]);
    const expansionRoadDataList = ref([]);
    const isNewRoadChange = ref(0);
    const isSiteRoadChange = ref(0);
    const isExpansionRoadChange = ref(0);
    watch(() => props.resourceData, (val) => { 
        if (props.resourceData.length > 0) {
            const data = props.resourceData;
            console.log('道路原始数据',data)
            // 处理新建道路数据
            const newRoadDataOriginList = val.filter((item) => item.dataType == 7);
            if (newRoadDataOriginList.length && newRoadDataOriginList[0]['jsonList']) {
                newRoadDataList.value = JSON.parse(newRoadDataOriginList[0]['jsonList']) || [];
                if (newRoadDataList.value.length) {
                    // 删除第一条表头数据
                    newRoadDataList.value.shift();
                }
            }
            // 处理场内道路数据
            const siteRoadDataOriginList = val.filter((item) => item.dataType == 8);
            if (siteRoadDataOriginList.length && siteRoadDataOriginList[0]['jsonList']) {
                siteRoadDataList.value = JSON.parse(siteRoadDataOriginList[0]['jsonList']) || [];
                if (siteRoadDataList.value.length) {
                    // 删除第一条表头数据
                    siteRoadDataList.value.shift();
                }
            }
            // 处理扩建道路数据
            const expansionRoadDataOriginList = val.filter((item) => item.dataType == 9);
            if (expansionRoadDataOriginList.length && expansionRoadDataOriginList[0]['jsonList']) {
                expansionRoadDataList.value = JSON.parse(expansionRoadDataOriginList[0]['jsonList']) || [];
                if (expansionRoadDataList.value.length) {
                    // 删除第一条表头数据
                    expansionRoadDataList.value.shift();
                }
            }
        }
    })
    const postData = () => {
        // 处理新建、场内、扩建道路数据
        const tableColumnData = {"project":"项目","unit":"单位","quantity":"数量","remark":"备注"}
        const newRoadData = JSON.parse(JSON.stringify(newRoadDataList.value));
        newRoadData.unshift(tableColumnData);
        const siteRoadData = JSON.parse(JSON.stringify(siteRoadDataList.value));
        siteRoadData.unshift(tableColumnData);
        const expansionRoadData = JSON.parse(JSON.stringify(expansionRoadDataList.value));
        expansionRoadData.unshift(tableColumnData);
        const newRoadObj = {
            isChange: isNewRoadChange.value,
            dataClassify: 2,
            dataType: 7,
            dataJson: JSON.stringify(newRoadData),
            projectId: props.projectId
        }
        const siteRoadObj = {
            isChange: isSiteRoadChange.value,
            dataClassify: 2,
            dataType: 8,
            dataJson: JSON.stringify(siteRoadData),
            projectId: props.projectId
        }
        const expansionRoadObj = {
            isChange: isExpansionRoadChange.value,
            dataClassify: 2,
            dataType: 9,
            dataJson: JSON.stringify(expansionRoadData),
            projectId: props.projectId
        }
        console.log('道路数据',[newRoadObj, siteRoadObj, expansionRoadObj])
        return [newRoadObj, siteRoadObj, expansionRoadObj];
    }
    defineExpose({
        postData
    })
</script>
<style scoped lang="scss">
    @import './ResourceManage.scss';
</style>
