<template>
    <div class="current-power-detail project-detail-component">
        <div class="detail-component">
            <h4 class="content-title">
                <!-- <img src="../../../assets/img/user/detail-title.png" alt="" /> -->
                基本信息
            </h4>
            <div class="content-body">
                <a-row>
                    <a-col :span="8">
                        <span>数据编号</span>
                        <p>{{ dataDetail.powerGridCode }}</p>
                    </a-col>
                    <a-col :span="8">
                        <span>所属区域</span>
                        <p>{{ dataDetail.cityCode}}</p>
                    </a-col>
                    <a-col :span="8">
                        <span>数据范围</span>
                        <p>{{ dataDetail.rangeType }}</p>
                    </a-col>
                </a-row>
                <a-row>
                    <a-col :span="24">
                        <span>地勘报告</span>
                        <p class="active-item">{{dataDetail.fileName}}</p>
                    </a-col>
                </a-row>
            </div>
        </div>
        <div class="content-list first-item ">
            <div class="list-header">
                <h4 class="content-title first-item">
                    <!-- <img src="../../../assets/img/user/detail-title.png" alt="" /> -->
                    自然环境
                </h4>
            </div>
        </div>
        <div class="content-list">
            <div class="list-content">
                <Editor ref="powerEditorRef" :height="'400px'" :readOnly="!isEditPower"
                    v-model:dataHtml="dataDetail.currentPowerGrid"></Editor>
            </div>
        </div>
        <div class="content-list">
            <div class="list-header">
                <h4 class="content-title  first-item">
                    <!-- <img src="../../../assets/img/user/detail-title.png" alt="" /> -->
                    水环境
                </h4>
            </div>
        </div>
        <div class="content-list">
            <div class="list-content">
                <Editor ref="needPredictionRef" :height="'400px'" :readOnly="!isEditNeedPrediction"
                    v-model:dataHtml="dataDetail.needPrediction"></Editor>
            </div>
        </div>
        <div class="content-list">
            <div class="list-header">
                <h4 class="content-title  first-item">
                    <!-- <img src="../../../assets/img/user/detail-title.png" alt="" /> -->
                    环境空气、声环境
                </h4>
            </div>
        </div>
        <div class="content-list">
            <div class="list-content">
                <Editor ref="needPredictionRef" :height="'400px'" :readOnly="!isEditNeedPrediction"
                    v-model:dataHtml="dataDetail.needPrediction"></Editor>
            </div>
        </div>
        <div class="content-list">
            <div class="list-header">
                <h4 class="content-title  first-item">
                    <!-- <img src="../../../assets/img/user/detail-title.png" alt="" /> -->
                    社会环境
                </h4>
            </div>
        </div>
        <div class="content-list">
            <div class="list-content">
                <Editor ref="needPredictionRef" :height="'400px'" :readOnly="!isEditNeedPrediction"
                    v-model:dataHtml="dataDetail.needPrediction"></Editor>
            </div>
        </div>
        <div class="content-list">
            <div class="list-header">
                <h4 class="content-title  first-item">
                    <!-- <img src="../../../assets/img/user/detail-title.png" alt="" /> -->
                    生态环境
                </h4>
            </div>
        </div>
        <div class="content-list">
            <div class="list-content">
                <Editor ref="needPredictionRef" :height="'400px'" :readOnly="!isEditNeedPrediction"
                    v-model:dataHtml="dataDetail.needPrediction"></Editor>
            </div>
        </div>
        <div class="content-list">
            <h4 class="content-title">
                <!-- <img src="../../../assets/img/user/detail-title.png" alt="" /> -->
                主要操作日志
            </h4>
            <TableList @changePage="tableLogChangePage" class="table-common table-account" :page="tablePageLog"
                :tableData="tableDataLog" :tableColumn="USER_DETAIL_LOG">
                <template #handleType="record">
                    <span>{{ handleTypeData[record['handleType']] }}</span>
                </template>
                <template #attachments="record">
                    <span v-for="file in record['attachments']">{{ file['fileName'] }}</span>
                </template>
            </TableList>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, toRefs, onBeforeMount, onMounted, watchEffect, computed } from 'vue';
import Editor from '@/components/editor/Editor.vue';
import { useRoute, useRouter } from 'vue-router';
import { USER_DETAIL_LOG } from './environmental';
import TableList from '@/components/tableList/TableList.vue';
import { getGridDetail } from '@/api/modules/commonDataManage'
import {RANGE_TYPE_PROVINCE} from '../commonData'
const route = useRoute();

const router = useRouter();
const dataDetail = ref({
    currentPowerGrid: '',
    currentPowerSupply: '',
    electricityConsumptionDevLevel: '',
    powerGridSurroundRela: '',
    v500PowerGridProblem: '',
    needPrediction: ''
});
// 编辑详情信息
const powerEditorRef = ref(null); // 电网现状ref
const isEditPower = ref(false); // 电网现状
const supplyEditorRef = ref(null); // 供配电现状ref
const isEditSupply = ref(false); // 供配电现状
const electricityRef = ref(null); // 用电量及负荷发展水平ref
const isElectricity = ref(false); // 用电量及负荷发展水平
const powerGridRef = ref(null); // 电网现状ref
const isEditPowerGrid = ref(false); // 电网现状
const powerProblemRef = ref(null); // 电网安全运行问题ref
const isEditV500PowerGridProblem = ref(false); // 电网安全运行问题
const isEditNeedPrediction = ref(false)//电力需求预测
const needPredictionRef = ref(null)//电力需求预测ref
const isEditDevelopPlan = ref(false)//相关电网发展规划
const developPlanRef = ref(null)//相关电网发展规划ref
const isEditPowerPlanRefn = ref(false)//电源规划
const powerPlanRef = ref(null)//电源规划ref
const editorDetial = (val) => {
    console.log('val', val);
    switch (val) {
        case 'isEditPower':
            isEditPower.value = !isEditPower.value;
            powerEditorRef.value.editorRef.enable();
            break;
        case 'isEditSupply':
            isEditSupply.value = !isEditSupply.value;
            supplyEditorRef.value.editorRef.enable();
            break;
        case 'isElectricity':
            isElectricity.value = true;
            electricityRef.value.editorRef.enable();
            break;
        case 'isEditPowerGrid':
            isEditPowerGrid.value = true;
            powerGridRef.value.editorRef.enable();
            break;
        case 'isEditV500PowerGridProblem':
            isEditV500PowerGridProblem.value = true;
            powerProblemRef.value.editorRef.enable();
            break;
    }
};
// 保存
const submitEdit = (val, type) => {
    switch (val) {
        case 'isEditPower':
            isEditPower.value = false;
            if (type == 'save') {
                powerEditorRef.value.editorRef.disable();
                // 调更新接口
            } else {
                powerEditorRef.value.editorRef.disable();
            }
            break;
        case 'isEditSupply':
            isEditSupply.value = false;
            if (type == 'save') {
                supplyEditorRef.value.editorRef.disable();
                // 调更新接口
            } else {
                supplyEditorRef.value.editorRef.disable();
            }
            break;
        case 'isElectricity':
            isElectricity.value = false;
            if (type == 'save') {
                electricityRef.value.editorRef.disable();
                // 调更新接口
            } else {
                electricityRef.value.editorRef.disable();
            }
            break;
        case 'isEditPowerGrid':
            isEditPowerGrid.value = false;
            if (type == 'save') {
                powerGridRef.value.editorRef.disable();
                // 调更新接口
            } else {
                powerGridRef.value.editorRef.disable();
            }
            break;
        case 'isEditV500PowerGridProblem':
            isEditV500PowerGridProblem.value = false;
            if (type == 'save') {
                powerProblemRef.value.editorRef.disable();
                // 调更新接口
            } else {
                powerProblemRef.value.editorRef.disable();
            }
            break;
    }
    console.log('---保存--', dataDetail);
};
// 初始化详情接口
const initDetail = async () => {
    const res = await getGridDetail(route.query.id)
    console.log('res', res);
    if (res.code == 200) {
        dataDetail.value = { ...res.data }
        // Todo 确认是否需要自己匹配数据范围
        // RANGE_TYPE_PROVINCE
        dataDetail.value.rangeType = RANGE_TYPE_PROVINCE.filter(item => item.value == dataDetail.value.rangeType)[0].label
    }
    console.log('详情', dataDetail.value)

};
// 操作日志表格表头
const tableDataLog = reactive([
    {
        handleTime: '2020-09-09 18:00:00',
        handleUser: '张开',
        handleType: 1,
        handleCont: '账号状态【正常】-->【停用】',
        remark: '这是一个备注信息',
        attachments: [
            {
                fileName: '文件名称',
                fileUrl: '文件链接',
            },
            {
                fileName: '文件名称',
                fileUrl: '文件链接',
            },
        ],
    },
    {
        handleTime: '2020-09-09 18:00:00',
        handleUser: '张开',
        handleType: 1,
        handleCont: '账号状态【正常】-->【停用】',
        remark: '这是一个备注信息',
        attachments: [
            {
                fileName: '文件名称',
                fileUrl: '文件链接',
            },
            {
                fileName: '文件名称',
                fileUrl: '文件链接',
            },
        ],
    },
    {
        handleTime: '2020-09-09 18:00:00',
        handleUser: '张开',
        handleType: 1,
        handleCont: '新增服务【按次付费，20次，2023-09-09~2024-01-01】',
        remark: '这是一个备注信息',
        attachments: [
            {
                fileName: '文件名称',
                fileUrl: '文件链接',
            },
            {
                fileName: '文件名称',
                fileUrl: '文件链接',
            },
        ],
    },
]);
// 操作日志表格页码信息
const tablePageLog = reactive({
    pageNo: 1,
    size: 10,
    total: 0,
});
// 操作类型常量
const handleTypeData = reactive({
    1: '新增',
    2: '编辑',
});
// 操作表格切换页码信息
const tableLogChangePage = (page, pageSize) => {
    console.log(page);
    console.log(pageSize);
};
onBeforeMount(() => {
    initDetail()
});
onMounted(() => {
})
</script>
<style scoped lang="scss">
@import '../../projectControl/ProjectDetail.scss';
@import '@/assets//css/detail.scss';

.current-power-detail {
    .active-item {
        color: #036b64 !important;
        cursor: pointer;
    }

    .content-list {
        background-color: #fff;
        padding: 24px 24px 0 24px;

        .list-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .list-header-right {
            font-size: 14px;
            color: #036b64;
            line-height: 14px;
            cursor: pointer;

            .edit-icon {
                margin-right: 5px;
            }
        }

        .content-title-circle {
            display: flex;
            align-items: center;
            margin-bottom: 16px;
            &::before {
                content: '';
                display: inline-block;
                width: 4px;
                height: 4px;
                border-radius: 50%;
                background-color: #036B64;
                margin-right: 5px;
            }
        }
    }

    .first-item {
        padding-top: 0;
        margin-bottom: 0;
        font-weight: bold;
    }
}
</style>
