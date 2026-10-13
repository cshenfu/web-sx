<template>
    <tips-modal
        class="adjust-data-modal"
        :width="'1200px'" 
        :tipType="'success'" 
        :okText="'保存调整'"
        :openTipsModal.sync="openTipsProjectModal" 
        @handleChangeFileModal="handleAdjustDataModal"
        :getContainer="getContainer"
    >
        <template #customTitle>调整</template>
        <template #contentBody>
            <div class="adjust-data-content">
                <a-descriptions :column="1" :colon="false">
                    <a-descriptions-item>
                        <template #label>
                            <span class="adjust-data-content-label">所选项目:</span>
                        </template>
                        {{ adjustData.projectName }}
                    </a-descriptions-item>
                    <a-descriptions-item>
                        <template #label>
                            <span class="adjust-data-content-label">调整类型:</span>
                        </template>
                        <a-radio-group v-model:value="type" name="radioGroup">
                            <a-radio :disabled="item.disabled" :value="item.value" v-for="item in adjustTypeOptions " :key="item.value" @change="changeType(item)">{{item.label}}</a-radio>
                        </a-radio-group>
                    </a-descriptions-item>
                    <template v-if="type ==1">
                        <a-descriptions-item>
                            <template #label>
                                <span class="adjust-data-content-label">当前满发小时数/h:</span>
                            </template>
                             {{ adjustData.fullHour +  `（${adjustData.hubHeight || ''}m、${adjustData.deviceModel}）` }}
                        </a-descriptions-item>
                        <a-descriptions-item>
                            <template #label>
                                <span class="adjust-data-content-label">调整满发小时数/h:</span>
                            </template>
                            <a-input 
                                v-model:value="adjustData.expectFullHour"
                                style="width: 230px"
                                placeholder="请输入满发小时数">
                            </a-input>
                        </a-descriptions-item>
                        <a-descriptions-item>
                            <template #label>
                                <span class="adjust-data-content-label">折减比例值:</span>
                            </template>
                            <a-input 
                                :disabled="true"
                                v-model:value="computedReduction"
                                style="width: 230px"
                                placeholder="折减比例值">
                            </a-input>
                        </a-descriptions-item>
                        <a-descriptions-item>
                            <span class="adjust-data-content-tip">说明：系统按照折减比例值统一调整机型比选、轮毂高度比选、发电量表中的相关发电量、平均风速等值</span>
                        </a-descriptions-item>
                    </template>
                    <template v-if="type ==2">
                        <a-descriptions-item>
                            <span class="adjust-data-content-tip">中尺度和风机坐标两项中至少有1项调整</span>
                        </a-descriptions-item>
                        <a-descriptions-item>
                            <template #label>
                                <span class="adjust-data-content-label">中尺度信息:</span>
                            </template>
                            <table-list
                                class="user-table"
                                :isShowPage="false"
                                :loading="loading"
                                :tableData="tableData"
                                :tableColumn="ADJUST_PROCESS_TABLE_LIST_CLOUMN"
                            >
                                <template #adjustValue="{record}">
                                    <a-input-number
                                        style="margin: -5px 0;width: 120px"
                                        v-model:value="record.value3"
                                    />
                                </template>
                            </table-list>
                        </a-descriptions-item>
                        <a-descriptions-item>
                            <template #label>
                                <span class="adjust-data-content-label">风机坐标</span>
                            </template>
                            <div class="adjust-data-content-uoload">
                                <p class="export-data" @click="exportDataTemplate">下载数据模版</p>
                                <div>
                                    <a-upload class="content-add-upload export-data" name="file" :maxCount="1" :showUploadList="false"
                                        v-model:file-list="fileList" :customRequest="customRequestTemplate"
                                        :before-upload="beforeUpload">
                                        <!-- list-type="picture-card" -->
                                        <div>
                                            <div style="font-size: 14px">上传数据</div>
                                        </div>
                                    </a-upload>
                                </div>
                            </div>
                        </a-descriptions-item>
                    </template>
                    <template v-if="type ==3">
                        <a-descriptions-item>
                            <template #label>
                                <span class="adjust-data-content-label">调整数据:</span>
                            </template>
                            <div class="adjust-data-content-uoload">
                                <p class="export-data" @click="exportDataPower()">下载数据模版</p>
                                <div>
                                    <a-upload class="content-add-upload export-data" name="file" :maxCount="1" :showUploadList="false"
                                        v-model:file-list="fileList" :customRequest="customRequest"
                                        :before-upload="beforeUpload">
                                        <!-- list-type="picture-card" -->
                                        <div>
                                            <!-- <iconpark-icon :size="30" name="shangchuanshuju"></iconpark-icon> -->
                                            <div style="font-size: 14px">上传修改后数据</div>
                                        </div>
                                    </a-upload>
                                </div>
                            </div>
                        </a-descriptions-item>
                    </template>
                    <template v-if="type ==2 || type ==3">
                        <a-descriptions-item v-if="fileList.length">
                            <template #label>
                                <span class="adjust-data-content-label special-item">文件列表:</span>
                            </template>
                            <span v-show="isShowRequire" class="content-add-tip">请上传导入文件</span>
                            <ul v-if="fileList.length">
                                <li v-for="(file, fileIndex) in fileList" :key="fileIndex" class="file-list">
                                    <iconpark-icon name="exc"></iconpark-icon>
                                    <span>{{ file['name'] }}</span>
                                    <iconpark-icon @click="delFile(fileIndex)" class="file-del-icon"name="shanchu"></iconpark-icon>
                                    <template v-if="fileMsg">
                                        <iconpark-icon
                                            name="jinggao"
                                            size="14px"
                                            class="upload-error-icon"
                                        ></iconpark-icon
                                        >{{ fileMsg }}
                                    </template>
                                </li>
                            </ul>
                        </a-descriptions-item>
                        <template v-if="type==2">
                            <a-descriptions-item>
                                <template #label>
                                    <span class="adjust-data-content-label">调整满发小时数/h:</span>
                                </template>
                                <a-input 
                                    v-model:value="adjustData.expectFullHour"
                                    style="width: 230px"
                                    placeholder="请输入满发小时数">
                                </a-input>
                            </a-descriptions-item>
                            <a-descriptions-item>
                                <span class="adjust-data-content-tip">
                                    说明：<br/>
                                    1、如果调整中尺度坐标，系统重新下载中尺度数据进行分析，计算基准机型发电量，其他比选机型会参照基准机型进行折减<br/>
                                    2、如果仅调整高度风速，系统会重新修正虚拟塔数据（不会成重新下载中尺度数据），计算基准机型发电量，其他比选机型会参照基准机型进行折减<br/>
                                    3、如果调整风机坐标则会重新进行机型比选之之后的所有流程<br/>
                                    4、设置期望满发小时数，计算完基准机型后会与期望满发小时做对比，若在±100 以内，则使用原计算结果，超过则按照期望满发小时数值进行折减所有机型<br/>
                                </span>
                            </a-descriptions-item>
                        </template>
                        <template v-if="type ==3">
                            <a-descriptions-item>
                                <div class="user-tabs">
                                    <ul class="user-tabs-ul">
                                        <li class="user-tabs-li" @click="chooseTabs(1)" :class="activeKey == 1 ? 'active' : ''">原始数据</li>
                                        <li class="user-tabs-li" @click="chooseTabs(2)" :class="activeKey == 2 ? 'active' : ''">调整后数据</li>
                                    </ul>
                                </div>
                            </a-descriptions-item>
                            <a-descriptions-item class="table-lists">
                                <table-list
                                    :height="400"
                                    :isShowPage="false"
                                    :loading="loading"
                                    :tableData="powerData"
                                    :tableColumn="ADJUST_DATA_TABLE_LIST_CLOUMN"
                                >
                                </table-list>
                            </a-descriptions-item>
                        </template>
                    </template>
                </a-descriptions>
            </div>
        </template>

    </tips-modal>
</template>

<script setup>
import { ref, reactive, toRefs, onBeforeMount, onMounted, watchEffect, computed } from 'vue';
import { message, Upload } from 'ant-design-vue';
import TipsModal from '@/components/tipsDialog/TipsModal.vue';
import { exportExcel } from '@/utils/exportExcel';
import { readExcelFile } from '@/utils/readExcel';
import {isExcelEncrypted} from '@/utils/checkFileIsEncryption';
import { getPowerList,adjustPower } from '@/api/modules/autoResult.js';
import { getReviseDetail,updateRevise} from '@/api/modules/projectManage';
import {ADJUST_DATA_TABLE_LIST_CLOUMN,ADJUST_TYPE_OPTIONS,ADJUST_PROCESS_TABLE_LIST_CLOUMN} from '../projectList'
import TableList from '@/components/tableList/TableList.vue';

const props = defineProps({
    openTipsProjectModal: {
        type: Boolean,
        default: false,
    },
    currentData: {
        type: Object,
        default: () => { }
    },
    adjustModalType: {
        type: Number,
    }
})
const emit = defineEmits(['update:openTipsProjectModal'])
// 默认数据
const adjustData = ref({})
//  调整类型
const type = ref(0)
const database =ref([
    {
        name:'经度',
        unit:'度',
        currentValue:'',
        value3:'',
        valueName:'zcdLng'
    },
    {
        name:'纬度',
        unit:'度',
        currentValue:'',
        value3:'',
        valueName:'zcdLat'
        
    },
    {
        name:'海拔',
        unit:'m',
        currentValue:'',
        value3:'',
        valueName:'zcdAlt'
    }
])
// 过程数据别个数据
const tableData = ref([])
// 计算调整类型
const adjustTypeOptions = computed(()=> {
    let result = []
    result = props.adjustModalType == 1? ADJUST_TYPE_OPTIONS.filter(item=>item.type=='public') : ADJUST_TYPE_OPTIONS.filter(item=>item.type=='auto');
    type.value = result[0]['value']
    return  result
})
// 调整类型
const changeType = (val)=> {
    adjustData.value.expectFullHour = ''
    if(val.value ==3) {
        getPowerListEvent(1)
    }
}
const activeKey = ref(1)
const chooseTabs = (index) => {
    activeKey.value = index
    getPowerListEvent(index)
}
const powerData = computed(() => {
    let result = [];
    result = activeKey.value ==1? oldPowerData.value : newPowerData.value;
    return result;
})
const isUpload = ref(false)
const fileMsg = ref('')
const oldPowerData = ref([])
const newPowerData = ref([])
const exportData = ref([])
const loading = ref(false)
// 风机点位坐标
const devicePointList= ref([])
// 折减比例值
const computedReduction = computed(() => {
    let result =  0;
    result = Number(adjustData.value.expectFullHour) / Number(adjustData.value.fullHour);
    return result ?result.toFixed(2) : '';

})
const handleAdjustDataModal = async(value) => {   
    // oldPowerData.value = [];
    // newPowerData.value = [];
    // emit('update:openTipsProjectModal', false)
    console.log('当前值:', value);
    if (value) {
        const isDataComplete = await validateDataBeforeSave(tableData.value);
        if (isDataComplete) {
            resetData();
            emit('update:openTipsProjectModal', false); // 关闭弹窗
            emit('updateList' ); // 更新列表
        }
    } else {
        resetData();
        emit('update:openTipsProjectModal', value); // 更新状态
    }
};
// 校验需要保存的数据是否完整并提交数据
const validateDataBeforeSave = async(data) => {
    // 检查是否为调整类型 2
    if (type.value == 2) {
        const isTableValid = data.some(item => item.value3 !== ''); // 检查表格中是否有非空数据
        const hasFiles = devicePointList.value.length > 0; // 检查文件列表是否非空
        if (!isTableValid && !hasFiles) {
            message.warning('中尺度和风机坐标两项中至少有1项调整，请完善数据');
            return false;
        }
    }
    if(type.value ==3){
        return true
    }
    // 检查满发小时数是否填写
    if (!adjustData.value.expectFullHour) {
        message.warning('请输入满发小时数');
        return false;
    }
    let falg = await submitReviseData()
    return falg; 
};
// 提交数据
const submitReviseData = async()=> {
    let {expectFullHour,} = adjustData.value
    let zcdWsList = tableData.value.filter((val)=>!val.valueName).map((m)=> {
        return {
            height: m.name,
            speed: m.value3? m.value3 : m.currentValue
        }
    })
    let data = {
        id: props.currentData.id,
        type:type.value,
        expectFullHour,
        zcdAlt:tableData.value[2]['value3']? `${tableData.value[2]['value3']}`:`${tableData.value[2]['currentValue']}`,
        zcdLat:tableData.value[1]['value3']? `${tableData.value[1]['value3']}`:`${tableData.value[1]['currentValue']}`,
        zcdLng:tableData.value[0]['value3']? `${tableData.value[0]['value3']}`:`${tableData.value[0]['currentValue']}`,
        zcdWsList,
        devicePointList:devicePointList.value
    }
    if(type.value ==1) {
        delete data.devicePointList
        delete data.zcdWsList
    }
    console.log('提交的总数据',data);
    try {
        let res = await updateRevise(data)
        if(res.code ==200 && res.data){
            message.success('发电量调整提交成功！')
            return true
        }
    } catch (error) {
        return false
    }
}
// 重置数据函数
const resetData = () => {
    oldPowerData.value = [];
    newPowerData.value = [];
    devicePointList.value =[];
    fileList.value =[]
};

// 获取发电量详情
const getReviseDetailData = async()=> {
    try {
        let res =  await getReviseDetail(props.currentData.id)
        if(res.code ==200){
            adjustData.value = {...res.data}
            console.log('数据呢',adjustData.value);
            database.value[0]['currentValue'] = res.data.zcdLng
            database.value[1]['currentValue'] = res.data.zcdLat
            database.value[2]['currentValue'] = res.data.zcdAlt
            tableData.value = [...database.value]
            res.data?.zcdWsList.forEach((val)=> {
                let obj =  {
                    name:val.height,
                    unit:'m/s',
                    currentValue:val.speed,
                    value3:''
                }
                tableData.value.push(obj)
            })
        }
    }catch(err) {
        console.log('-发电量详情--',err);
        
    }
}
// 请求原始的发电量数据
const getPowerListEvent = async (type,val) => {
    let data = `${props.currentData.id}/${type}`
    try {
        let res = await getPowerList(data)
        if ( res.data && res.data.length >0) {
            loading.value = false;
            if(val){
                exportData.value = res.data;
                return 
            }
            oldPowerData.value = [];
            newPowerData.value = [];
            type == 1 ?  oldPowerData.value = res.data : newPowerData.value = res.data;
        }else {
            loading.value = false;
            type == 1 ?  oldPowerData.value = [] : newPowerData.value = [];
        }
    } catch (error) {
        
    }
};
// 导出发电量Excel
const exportDataPower = async() => {
    await getPowerListEvent(1,'down')
    const fields = [
        'label',
        'x',
        'y',
        'z',
        'energyDensity',
        'theoryPower',
        'powerWithWake',
        'avgWindSpeed',
        'rateWithWake',
        'airDensity',
        'capacityCoefficient',
    ];
    const headers = [
        '标签',
        'X',
        'Y',
        'Z',
        '能量密度（W/m²）',
        '理论发电量（MWh/a）',
        '考虑尾流发电量（MWh/a）',
        // '年上网电量（万kW·h）',
        // '满发小时数（h）',
        '平均风速（m/s）',
        '尾流折减率（%）',
        '空气密度（kg/m³）',
        '容量系数'
    ];
    
    exportExcel(
        exportData.value,
        fields,
        headers,
        `${props.currentData.projectName}发电量表.xlsx`,
        '发电量表',
    );
};
// 上传文件
const fileList = ref([]);
const isShowRequire = ref(false);
// 上传前拦截
const beforeUpload = async(file) => {
    const type = file.name.substring(file.name.lastIndexOf('.') + 1).toLowerCase();
    if (type == 'xlsx' || type == 'xls') {
        if (file.size / 1024 / 1024 > 100000) {
            message.error('文件最大限制为100M');
            return false || Upload.LIST_IGNORE;
        } else {
            // console.log(fileList);
        }
    } else {
        message.error('请上传xlsx、xls格式文件');
        return false || Upload.LIST_IGNORE;
    }
    const isEncrypted = await isExcelEncrypted(file);
    if (isEncrypted) {
        message.error('文件已加密，请先解密后再导入');
        return false || Upload.LIST_IGNORE;
    }
    isShowRequire.value = false;
};
// 自定义上传逻辑
const customRequest = async (file) => {
    try {
        const formData = new FormData();
        formData.append('file', file.file);
        formData.append('projectId', props.currentData.id)
        let res = await adjustPower(formData)
        if(res.code ==200 && res.data) {
            activeKey.value = 2
            getPowerListEvent(2)
            fileMsg.value = ''
            isShowRequire.value = false
        }else{
            fileMsg.value = res.msg
        }
        
    }catch(err) {
        // console.log('上传出错',err);
    }
};

// 删除文件
const delFile = (index) => {
    fileList.value.splice(index, 1);
    fileMsg.value = '';
    isShowRequire.value = true;
};
const  getContainer = ()=> {
    return document.querySelector(".project-control-list");
}
// 过程数据下载当前数据
const exportDataTemplate = ()=> {
    const fields = [
        'x',
        'y',
    ];
    const headers = [
        'x',
        'y',
    ];
    
    exportExcel(
        adjustData.value.devicePointList,
        fields,
        headers,
        `${adjustData.value.projectName}风机点位表.xlsx`,
        '发电量表',
    );
}
// 过程数据自定义上传文件
const customRequestTemplate = async(file)=> {
    try {
        let content = await readExcelFile(file.file);
        if(content.length > 1){
            content.shift()
            devicePointList.value = content
        }else {
            devicePointList.value = []
        }
        console.log('');
        
    } catch (error) {
        console.error('Error reading file:', error);
    }
}
onBeforeMount(() => {
    // 最初版本
    if(props.adjustModalType == 1) {
        getReviseDetailData()
    }else {
        getPowerListEvent(1)
    }
})
onMounted(() => {
})

</script>
<style scoped lang='scss'>
@import '@/assets/css/tabs.scss';
.adjust-data-content{
    margin: 20px;
    .user-tabs {
        width:100%;
    }
    :deep(.table-lists){
        width:90%;
        overflow: hidden;
        overflow-x: auto;
    }
    .adjust-data-content-label {
        width:120px;
        font-size: 14px;
        font-weight: bold;
        span {
            color:red;
        }
    }
    .adjust-data-content-tip{
        font-size: 12px;
        color: #A8ADBE;
    }
    .special-item{
        visibility: hidden
    }
    .adjust-data-content-uoload {
        display: flex;
    }
    .export-data {
        color: #036b64;
        cursor: pointer;
        // margin-bottom: 10px;
        margin-right: 20px;
        font-size: 14px;
    }

    .content-add-upload {
        :deep(.ant-upload.ant-upload-select) {
            width:  100%;
            height: 20px !important;
            :deep(.ant-upload) {
                height: 100% !important;
            }
        }
    }

    .tuning-tip {
        display: flex;
        padding: 8px 0 5px 0;
        background: #FEF1DF;
        border-radius: 4px;
        margin-bottom: 20px;

        .success {
            color: #FE830F;
            margin: 0 9px 0 12px;
        }

        .tuning-tip-title {
            font-size: 14px;
            color: #21263F;
            line-height: 22px;
        }
    }

    .tuning-example {

        font-size: 14px;
        color: #363B4D;
        line-height: 12px;
        margin-top: 20px;

        span {
            color: #036B64;
            cursor: pointer;
        }
    }

    .file-list {
        display: flex;
        align-items: center;

        span {
            margin: 0 5px;
        }

        .file-del-icon {
            cursor: pointer;
            visibility: hidden;
        }

        &:hover {
            .file-del-icon {
                visibility: visible;
            }
        }

    }

    .content-add-tip {
        color: #FF3E3E;
        font-size: 12PX;
    }

    .problem-list {
        margin-top: 20px;

        li {
            width: 409px;
            // height: 40px;
            background: #FFFFFF;
            border-radius: 4px;
            border: 1px solid #E5E5E5;
            padding: 10px 16px;
            font-size: 12px;
            color: #363B4D;
            line-height: 14px;
        }
    }

    .data-type {
        span {
            font-size: 14px;
            font-family: PingFangSC, PingFang SC;
            color: #5C6170;
            margin-right: 16px;
        }
    }
}
</style>