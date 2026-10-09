<template>
    <div class="import-file-modal">
        <tips-modal :width="'490px'" :showCancel="false" title="导入文件" :tipType="'success'" class="tip-content-modal"
            :okText="'确定上传数据'" v-model:openTipsModal="openTipsImportFileModal" @handleChangeFileModal="handleChangeClose">
            <template #customTitle>{{ tipTitle }}</template>
            <template #contentBody>
                <div class="tuning-tip">
                    <iconpark-icon name="jinggao" size="18" class="success"></iconpark-icon>
                    <span class="tuning-tip-title">{{ contentTip }}</span>
                </div>
                <div class="data-type">
                    <span>数据类型</span>
                    <el-radio-group v-model="dataType">
                        <el-radio
                            v-for="opt in plainOptions"
                            :key="opt.value"
                            :label="opt.value"
                        >{{ opt.label }}</el-radio>
                    </el-radio-group>
                </div>
                <div >
                    <div class="tuning-example"  @click="downTemplate">导入前请先下载数据模版，<span>下载模版</span></div>
                    <el-upload
                        action=""
                        class="content-add-upload"
                        name="file"
                        :limit="1"
                        :show-file-list="false"
                        v-model:file-list="fileList"
                        :http-request="customRequest"
                        :before-upload="beforeUpload"
                        :on-exceed="handleExceed"
                        :on-change="handleChange"
                        list-type="picture-card"
                    >
                        <div>
                            <iconpark-icon :size="30" name="shangchuanshuju"></iconpark-icon>
                            <div style="margin-top: 8px">目前支持 xlsx、xls格式，最多上传1个文件，文件最大500M</div>
                        </div>
                    </el-upload>
                    <span v-show="isShowRequire" class="content-add-tip">请上传导入文件</span>
                    <div class="tips-memo content-add-tip"> 说明：导入相同省市区数据会进行数据覆盖</div>
                    <ul v-if="fileList.length">
                        <li v-for="(file, fileIndex) in fileList" :key="fileIndex" class="file-list">
                            <iconpark-icon name="qitawenjian"></iconpark-icon>
                            <span>{{ file['name'] }}</span>
                            <iconpark-icon @click="delFile(fileIndex)" class="file-del-icon" name="shanchu"></iconpark-icon>
                        </li>
                    </ul>
                </div>
                <!-- <ul class="problem-list" v-if="problemList.length">
                    <li v-for="(item, index) in problemList" :key="index">{{ item.problem }}</li>
                </ul> -->
            </template>
        </tips-modal>
    </div>
</template>

<script setup>
import { ref, reactive, toRefs, onBeforeMount, onMounted, watch, computed } from 'vue';

import { useRoute, useRouter } from 'vue-router';
import TipsModal from '@/components/tipsDialog/TipsModal.vue';
import { ElMessage, genFileId } from 'element-plus';
import mitt from '@/utils/eventBus';
import  {importClimateData} from '@/api/modules/commonDataManage'
import { ossClientInfo } from '@/assets/js/static';
import {
    batchImportDryRain,
    batchImportTemperature,
    batchImportSnow,
    batchImportRainFall,
    batchImportDustStorm,
    batchImportWindSpeed,
    batchImportHail
} from '@/api/modules/climate'
import {PLAIN_OPTIONS} from '../climateDataBase'
const props = defineProps({
    importFileFlg: {
        type: Boolean,
        default: false
    }
});
const emit = defineEmits(['update:importFileFlg']);
const openTipsImportFileModal = ref(props.importFileFlg);
watch(() => props.importFileFlg, (val) => {
    openTipsImportFileModal.value = val;
});
const dataType = ref(1);
const plainOptions = PLAIN_OPTIONS;
const templateUrl = {
    1: `https://whln-prod-public.${ossClientInfo.endPointShort}/template/气候数据-雷暴模版.xlsx`,
    2: `https://whln-prod-public.${ossClientInfo.endPointShort}/template/气候数据-酸雨模版.xlsx`,
    3: `https://whln-prod-public.${ossClientInfo.endPointShort}/template/气候数据-温度模版.xlsx`,
    4: `https://whln-prod-public.${ossClientInfo.endPointShort}/template/气候数据-风压模版.xlsx`,
    5: `https://whln-prod-public.${ossClientInfo.endPointShort}/template/气候数据-雪压模版.xlsx`,
    6: `https://whln-prod-public.${ossClientInfo.endPointShort}/template/气候数据-降水量模版.xlsx`,
    7: `https://whln-prod-public.${ossClientInfo.endPointShort}/template/气候数据-沙尘模版.xlsx`,
    8: `https://whln-prod-public.${ossClientInfo.endPointShort}/template/气候数据-风速模版.xlsx`,
    9: `https://whln-prod-public.${ossClientInfo.endPointShort}/template/气候数据-冰雹模版.xlsx`,
}
const fileList = ref([]);
const isShowRequire = ref(false);
// 上传前拦截
// 注意：el-upload 的 before-upload 返回 false 时会自动把该文件从 file-list 中移除，
// 效果等同于 antd 的 Upload.LIST_IGNORE，不需要再额外处理
const beforeUpload = (file) => {
    const type = file.name.substring(file.name.lastIndexOf('.') + 1).toLowerCase();
    console.log(file, type);
    if (type == 'xlsx' || type == 'xls') {
        if (file.size / 1024 / 1024 > 100000) {
            ElMessage.error('文件最大限制为100M');
            return false;
        } else {
            console.log(fileList);
        }
    } else {
        ElMessage.error('请上传xlsx、xls格式文件');
        return false;
    }
    isShowRequire.value = false;
};
// 删除文件
const delFile = (index) => {
    fileList.value.splice(index, 1);
};
const handleChange = (file) => {
    if (file.status == 'uploading') {
        // fileList.value.push({
        //     name: file.name,
        //     file: file,
        // });
    }
};
// 超出数量限制时替换为最新选择的文件（对应 antd maxCount=1 的静默替换行为）
const handleExceed = (files) => {
    const file = files[0];
    file.uid = genFileId();
    fileList.value = [];
};
// 自定义上传逻辑
const customRequest = async(options) => {
    console.log('自定义上传', options.file);
};
const tipTitle = '导入数据';
const contentTip = ref('导入相同省市区数据会进行数据覆盖');
const problemList = ref([]); // 上传之后问题了列表
const handleChangeClose = (val) => {
    if (val) {
        if (fileList.value.length > 0) {
            isShowRequire.value = false;
        } else {
            isShowRequire.value = true;
            return
        }
        console.log(fileList.value);
        submitFile()

    } else {
        dataType.value = 1
        fileList.value = [];
        isShowRequire.value = false;
        emit('update:importFileFlg', false)
    }
};
const submitFile = async() => {
    const formData = new FormData();
    // 注意：antd 包装文件对象的原生 File 字段叫 originFileObj，
    // Element Plus 对应字段叫 raw
    formData.append('file', fileList.value[0].raw);
    try {
        // let res = await importClimateData(formData)
        let res = await baseStaticFn(formData,dataType.value)
        if(res.code ==200){
            const failureNames = Object.keys(res.data.failureNames)
            let flag = failureNames.length === 0 && res.data.failureNames.constructor === Object;
            if (flag) {
                dataType.value = 1
                fileList.value = [];
                isShowRequire.value = false;
                ElMessage.success('操作成功！');
                mitt.emit('updateListData',dataType.value);
                emit('update:importFileFlg', false)
            } else {
                problemList.value = showFileErrorInfo(res.data.failureNames)
                console.log('提交失败', problemList.value);
            }
        }

    }catch(err){
        console.log('报错');
        
    }
}
const showFileErrorInfo = (obj) => {
    let countMap = {};
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            let value = obj[key];
            if (countMap[value]) {
                countMap[value].count++;
                countMap[value].lines.push(key);
            } else {
                countMap[value] = { problem: value, count: 1, lines: [key] };
            }
        }
    }
    let result = Object.values(countMap);
    return result
};
// 区分导入类型
const  baseStaticFn = async(params,type)=> {
    let res 
    try {
        switch (type) {
            // Todo 后端没有给接口
            // case 1:
            //     res = await getThunderstormList(params)
            //     break;
            case 2:
                res = await batchImportDryRain(params)
                break;
            case 3:
                res = await batchImportTemperature(params)
                break;
            // case 4:
            //     res = await getWindPressureList(params)
            //     break;
            case 5:
                res = await batchImportSnow(params)
                break;
            case 6:
                res = await batchImportRainFall(params)
                break;
            case 7:
                res = await batchImportDustStorm(params)
                break;
            case 8:
                res = await batchImportWindSpeed(params)
                break;
            case 9:
                res = await batchImportHail(params)
                break;
        }
    } catch (error) {
    }
    return res
}
// 下载模版
const downTemplate = ()=> {
    window.open(templateUrl[dataType.value])
}
onBeforeMount(() => {
});
onMounted(() => {
});

defineExpose({});
</script>
<style scoped lang="scss">
.content-add-upload {
    :deep(.el-upload--picture-card) {
        width: 100% !important;
        margin-top: 20px;
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
</style>