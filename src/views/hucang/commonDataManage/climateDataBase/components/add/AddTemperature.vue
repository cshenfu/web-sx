<template>
    <div class="add-power-right">
        <CommonAddDataHeader :selectData="selectData.provice? selectData : editSelectData"></CommonAddDataHeader>
        <div class="add-power-right-content">
            <h4 class="content-title">
                <img src="@/assets/img/user/detail-title.png" alt="" />
                项目基本信息
            </h4>
            <a-form ref="temperatureFormRef" name="advanced_search" :rules="rules" layout="vertical" :model="formState">
                <a-row>
                    <!-- <a-col :span="12">
                        <a-form-item name="dataType" label="数据格式">
                            <a-radio-group v-model:value="formState.dataType" name="radioGroup" @change="getModeType">
                                <a-radio :value="0">标准数据</a-radio>
                                <a-radio :value="1">矢量地图类数据</a-radio>
                            </a-radio-group>
                        </a-form-item>
                    </a-col> -->
                    <template v-if="formState.dataType == 0">
                        <a-col :span="12">
                            <a-form-item label="冬季通风室外计算温度" name="winterOutdoorTemperature">
                                <a-input style="width: 380px" suffix="℃" :controls="false"
                                    v-model:value.trim="formState.winterOutdoorTemperature" placeholder="请输入冬季通风室外计算温度">
                                </a-input>
                            </a-form-item>
                        </a-col>
                        <a-col :span="12">
                            <a-form-item label="冬季采暖室外计算温度" name="winterIndoorTemperature">
                                <a-input style="width: 380px" suffix="℃" v-model:value.trim="formState.winterIndoorTemperature"
                                    placeholder="请输入冬季采暖室外计算温度">
                                </a-input>
                            </a-form-item>
                        </a-col>
                        <a-col :span="12">
                            <a-form-item label="夏季通风室外计算温度" name="summerOutdoorTemperature">
                                <a-input style="width: 380px" suffix="℃" v-model:value.trim="formState.summerOutdoorTemperature"
                                    placeholder="请输入夏季通风室外计算温度"></a-input>
                            </a-form-item>
                        </a-col>
                        <a-col :span="12">
                            <a-form-item label="夏季空调室外计算干球温度" name="summerIndoorTemperature">
                                <a-input style="width: 380px" suffix="℃" v-model:value.trim="formState.summerIndoorTemperature"
                                    placeholder="请输入夏季空调室外计算干球温度"></a-input>
                            </a-form-item>
                        </a-col>
                        <a-col :span="12">
                            <a-form-item label="历年极端最高气温" name="highExtremeTemperature">
                                <a-input style="width: 380px" suffix="℃" v-model:value.trim="formState.highExtremeTemperature"
                                    placeholder="请输入历年极端最高气温"></a-input>
                            </a-form-item>
                        </a-col>
                        <a-col :span="12">
                            <a-form-item label="极端最低气温" name="lowExtremeTemperature">
                                <a-input style="width: 380px" suffix="℃" v-model:value.trim="formState.lowExtremeTemperature"
                                    placeholder="请输入极端最低气温"></a-input>
                            </a-form-item>
                        </a-col>
                        <a-col :span="12">
                            <a-form-item label="多年平均气温" name="avgTemperature">
                                <a-input style="width: 380px" suffix="℃" v-model:value.trim="formState.avgTemperature"
                                    placeholder="请输入多年平均气温"></a-input>
                            </a-form-item>
                        </a-col>
                    </template>
                    <a-col :span="12">
                        <a-row>
                            <a-col :span="24">
                                <div v-for="(item, index) in formState.thunderMap" :key="index">
                                    <a-form-item :name="['thunderMap', index]" :label="index == 0 ? labelTitile : ''"
                                        :rules="[
                                            {
                                                required: vectorRequired,
                                                trigger: 'blur',
                                                index: index,
                                                selfMessage:placeholderTip,
                                                validator: validateFileName,
                                            },
                                        ]">
                                        <div class="add-upload-file ">
                                            <Upload 
                                                name="pic"
                                                v-model:defaultFiles="item.data" 
                                                :fileTypes="fileTypes" 
                                                :fileSize="upFileSize" 
                                                :maxCount="1"
                                                :fileTypeMessage="fileTypeMessage" 
                                                :fileSizeMessage="`文件最大${upFileSize}M`"
                                                @upFileList="(val) => getUploadFile(val, index, 'thunder')">
                                                <template #tip>
                                                    <div class="tip-content">
                                                        <div class="tip-content-add">
                                                            <a-form-item :name="['thunderMap', index]">
                                                                <a-input :placeholder="placeholderTip"
                                                                    @blur="(e) => saveIndex(e, index, 'thunder')"
                                                                    v-model:value.trim="item.fileName"
                                                                    style="width: 312px"></a-input>
                                                            </a-form-item>
                                                            <template v-if="formState.dataType == 0">
                                                                <iconpark-icon class="add-icon" name="shanjian" size="16"
                                                                    @click="deleteMap(index, 'thunder')"
                                                                    v-show="formState.thunderMap.length > 1"></iconpark-icon>
                                                                <iconpark-icon class="add-icon" name="tianjia" size="16"
                                                                    @click="addMap('thunder')"
                                                                    v-show="index == formState.thunderMap.length - 1"></iconpark-icon>
                                                            </template>
                                                        </div>

                                                        <div class="tip-title">{{ uploadFileTip }}</div>
                                                    </div>
                                                </template>
                                            </Upload>

                                        </div>
                                    </a-form-item>
                                </div>

                            </a-col>
                        </a-row>
                    </a-col>
                    <a-col :span="12">
                        <a-row>
                            <a-form-item name="remark" label="来源">
                                <a-input style="width: 424px"  v-model:value.trim="formState.remark"
                                placeholder="请输入来源"></a-input>
                        </a-form-item>
                            <!-- <a-col :span="24">
                                <div v-for="(item, index) in formState.dataSources" :key="index">
                                    <a-form-item :name="['dataSources', index]" :label="index == 0 ? '数据来源' : ''" :rules="[
                                        {
                                            required: false,
                                            trigger: 'blur',
                                            index: index,
                                            selfMessage: '请输入数据来源的文档名称',
                                            validator: validateFileName,
                                        },
                                    ]">
                                        <div class="add-upload-file ">
                                            <Upload 
                                                v-model:defaultFiles="item.data" 
                                                :fileTypes="DATA_SOURCE_FILE_TYPES" 
                                                :fileSize="50" 
                                                :maxCount="1"
                                                fileTypeMessage="目前支持 JPG、PNG、doc、docx、pdf格式" 
                                                fileSizeMessage="文件最大50M"
                                                @upFileList="(val) => getUploadFile(val, index, 'source')">
                                                <template #tip>
                                                    <div class="tip-content">
                                                        <div class="tip-content-add">
                                                            <a-form-item :name="['dataSources', index]">
                                                                <a-input placeholder="请输入数据来源的文档名称"
                                                                    @blur="(e) => saveIndex(e, index, 'source')"
                                                                    v-model:value.trim="item.fileName"
                                                                    style="width: 312px"></a-input>
                                                            </a-form-item>
                                                            <iconpark-icon class="add-icon" name="shanjian" size="16"
                                                                @click="deleteMap(index, 'source')"
                                                                v-show="formState.dataSources.length > 1"></iconpark-icon>
                                                            <iconpark-icon class="add-icon" name="tianjia" size="16"
                                                                @click="addMap('source')"
                                                                v-show="index == formState.dataSources.length - 1"></iconpark-icon>
                                                        </div>

                                                        <div class="tip-title">说明：支持 JPG、PNG、doc、docx、pdf等，上限1个，上限50M
                                                        </div>
                                                    </div>
                                                </template>
                                            </Upload>

                                        </div>
                                    </a-form-item>
                                </div>

                            </a-col> -->
                        </a-row>
                    </a-col>
                </a-row>

                <a-form-item style="text-align: center" class="footer-list">
                    <a-button class="handle-button" @click="resetForm"> 取消 </a-button>
                    <a-button class="handle-button" type="primary" @click="saveData">保存</a-button>
                </a-form-item>
            </a-form>
        </div>
    </div>
</template>
  
<script setup>
import { ref, reactive, toRefs, onBeforeMount, onMounted, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import linkage from '@/components/linkage/linkage.vue';
import CommonAddDataHeader from '@/components/linkage/CommonAddDataHeader.vue';
import Upload from '@/components/upload/Upload.vue';

import {temperaturePattern, DATA_SOURCE_FILE_TYPES, MAP_FILE_TYPES,VECTOR_MAP_FILE_TYPES } from './add'
import {addTemperature,updateTemperature,getTemperatureDetail} from '@/api/modules/climate'
import { ElMessage } from 'element-plus'
const props = defineProps({
    selectData: {
        type: Object,
    }
})
const editSelectData= ref({
    provice:''
})
const route = useRoute();
const router = useRouter();
const isAddOrEdit = ref(route.query.id ? true : false);
const temperatureFormRef = ref(null);
const checkReuqired = (mes)=> {
    return (rule, value, callback) => {
        if(!value) return Promise.reject(mes);
        if(temperaturePattern(value)) {
            return Promise.resolve();
        }else {
            return Promise.reject('请输入数字');
        }
    }
}
const validateFileName = (rule, value, callback) => {
    if(!rule.required) {
        if (value.fileName && value.data.length || (!value.fileName && !value.data.length)) return Promise.resolve();
        if (value.fileName) {
            if (!value.length) {
                return Promise.reject('请上传文件');
            } else {
                return Promise.resolve();
            }
        }
        if (value.data.length) {
            if (!value.fileName) {
                return Promise.reject(rule.selfMessage);
            } else {
                return Promise.resolve();
            }
        }
    }else {
        if (!value.fileName && !value.data.length) return Promise.reject('请上传文件并且输入数据文件名称');
        if(!value.fileName) {
            return Promise.reject('请输入数据文件名称');
        }
        if(!value.data.length) {
            return Promise.reject('请上传文件');
        }
        if(value.fileName && value.data.length) {
            return Promise.resolve();
        }
    }
}
const formState = ref({
    dataType: 0,
    winterOutdoorTemperature: '',
    winterIndoorTemperature: '',
    summerOutdoorTemperature: '',
    summerIndoorTemperature: '',
    highExtremeTemperature: '',
    lowExtremeTemperature: '',
    avgTemperature: '',
    remark:'',
    thunderMap: [
        {
            data: [],
            fileName: '',
        },
    ],
    dataSources: [
        {
            data: [],
            fileName: '',
        },
    ]
});
// 矢量图
const vectorRequired = ref(false);
const labelTitile = ref('温度分布图') 
const uploadFileTip = ref('说明：文件格式需为JPG、PNG，上限1个，文件最大5M');
const upFileSize = ref(5)
const fileTypeMessage = ref('目前支持 JPG、PNG 格式');
const fileTypes = ref(MAP_FILE_TYPES);
const placeholderTip = ref('请输入图片名称');
const getModeType = (val) => {
    temperatureFormRef.value.resetFields();
    formState.value.dataType = val.target.value;
    formState.value.thunderMap =  [
        {
            data: [],
            fileName: '',
        },
    ]
    formState.value.dataSources =  [
        {
            data: [],
            fileName: '',
        },
    ]
    val.target.value == '1' ? vectorRequired.value = false : vectorRequired.value = true;
    val.target.value == '1' ? labelTitile.value = '温度分布图' : labelTitile.value = '数据文件'
    val.target.value == '1' ? uploadFileTip.value = '说明：文件格式需为JPG、PNG，上限1个，文件最大5M' : 
    uploadFileTip.value = '说明：格式需为tif、shp 矢量数据格式，上限1个，最大500M'
    val.target.value == '1' ? upFileSize.value = 5 : upFileSize.value = 500
    val.target.value == '1' ? fileTypeMessage.value = '目前支持 JPG、PNG 格式' : fileTypeMessage.value = '目前支持 tif、shp矢量数据格式'
    val.target.value == '1' ? fileTypes.value = MAP_FILE_TYPES : fileTypes.value = VECTOR_MAP_FILE_TYPES
    val.target.value == '1' ? placeholderTip.value = '请输入图片名称' : placeholderTip.value = '请输入数据文件名称'

}
const saveIndex = (e, index, type) => {
    if (type == 'thunder') {
        temperatureFormRef.value.validateFields([['thunderMap', index]]);
    } else {
        temperatureFormRef.value.validateFields([['dataSources', index]]);
    }
}
const rules = {
    dataType: [{ required: true, ElMessage: '请选择', trigger: 'change' }],
    winterOutdoorTemperature: [{ required: true,  trigger: 'blur',validator:checkReuqired('请输入冬季通风室外计算温度')}],
    winterIndoorTemperature: [{ required: true,  trigger: 'blur',validator:checkReuqired('请输入冬季采暖室外计算温度') }],
    summerOutdoorTemperature: [{ required: true,trigger: 'blur',validator:checkReuqired('请输入夏季通风室外计算温度') }],
    summerIndoorTemperature: [{ required: true,trigger: 'blur',validator:checkReuqired('请输入夏季采暖室外计算温度') }],
    highExtremeTemperature: [{ required: true, trigger: 'blur',validator:checkReuqired('请输入历年极端最高气温') }],
    lowExtremeTemperature: [{ required: true,trigger: 'blur', validator:checkReuqired('请输入极端最低气温') }],
    avgTemperature: [{ required: true, trigger: 'blur',validator:checkReuqired('请输入多年平均气温') }],
}

// 新增分布图
const addMap = (type) => {
    if (type == 'thunder') {
        formState.value.thunderMap.push({
            data: [],
            fileName: '',
        })
    } else {
        formState.value.dataSources.push({
            data: [],
            fileName: '',
        })
    }

}
// 删除分布图
const deleteMap = (index, type) => {
    if (type == 'thunder') {
        formState.value.thunderMap.splice(index, 1)
    } else {
        formState.value.dataSources.splice(index, 1)
    }
}
// 获取文件
const getUploadFile = (val, index, type) => {
    if (type == 'thunder') {
        formState.value.thunderMap[index]['data'] = [val];

        temperatureFormRef.value.validateFields([['thunderMap', index,]]);
    } else {
        formState.value.dataSources[index]['data'] = [val];
        temperatureFormRef.value.validateFields([['dataSources', index,]]);
    }
    console.log('--或缺文件--', val);
};

// 重置表单
const resetForm = () => {
    temperatureFormRef.value.resetFields();
    router.go(-1);
};
onMounted(() => { 
    if(isAddOrEdit.value) {
        getTemperatureDetailData()
    }
});
const saveData = () => {
    temperatureFormRef.value.validateFields().then(() => {
        submitData()
    }).catch((err) => {
        console.log('err', err);

    })
}
// 提交数据
const submitData = async () => {
    try {
        let { 
            dataType,
            avgTemperature,
            highExtremeTemperature,
            lowExtremeTemperature,
            summerIndoorTemperature,
            summerOutdoorTemperature,
            winterIndoorTemperature,
            winterOutdoorTemperature,
            remark
        } = formState.value;
        let mapImage = {
            fileName: '',
            filePath: '',
        }
        formState.value.thunderMap.forEach(item => {
            mapImage.fileName = item.fileName
            mapImage.filePath = item.data.length && item.data[0].filePath
        })
        // Todo 来源需要联调
        let params = {
            dataType,
            avgTemperature,
            highExtremeTemperature,
            lowExtremeTemperature,
            summerIndoorTemperature,
            summerOutdoorTemperature,
            winterIndoorTemperature,
            winterOutdoorTemperature,
            areaCode: props.selectData.code[props.selectData.code.length - 1],
            remark,
            mapImage
        }
        if (isAddOrEdit.value) {
            params.id = formState.value.id
            delete params.areaCode
        }
        let res = isAddOrEdit.value ? await updateTemperature(params) : await addTemperature(params)
        if (res.code == 200 && res.data) {
            ElMessage.success('提交成功');
            temperatureFormRef.value.resetFields();
            router.go(-1)
        }
    } catch (error) {
        console.log('报错', error);
    }
}
// 获取详情
const getTemperatureDetailData = async (id) => {
    try {
        let id =route.query.id;
        let res = await getTemperatureDetail(id)
        if(res.code ==200 && res.data) {
            let {
                dataType,
                avgTemperature,
                highExtremeTemperature,
                lowExtremeTemperature,
                summerIndoorTemperature,
                summerOutdoorTemperature,
                winterIndoorTemperature,
                winterOutdoorTemperature,
                remark,
                id,
                areaCode
            } = res.data;
            // Todo 需要联调
            formState.value = {
                dataType,
                avgTemperature,
                highExtremeTemperature,
                lowExtremeTemperature,
                summerIndoorTemperature,
                summerOutdoorTemperature,
                winterIndoorTemperature,
                winterOutdoorTemperature,
                remark,
                id,
                areaCode
            } 
            formState.value.thunderMap = [{
                data: [res.data.mapImage],
                fileName: res.data.mapImage.fileName
            }]
            editSelectData.value.provice = res.data.areaName;
        }
    } catch (error) {
        
    }
}
</script>
<style scoped lang="scss">
@import './add.scss'
</style>
  