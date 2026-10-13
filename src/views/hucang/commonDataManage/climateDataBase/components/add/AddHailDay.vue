<template>
    <div class="add-power-right">
        <CommonAddDataHeader :selectData="selectData.provice? selectData : editSelectData"></CommonAddDataHeader>
        <div class="add-power-right-content">
            <h4 class="content-title">
                <img src="@/assets/img/user/detail-title.png" alt="" />
                项目基本信息
            </h4>
            <a-form ref="fogRef" name="advanced_search" :rules="rules" class="ant-advanced-search-form"
                layout="vertical" :model="formState">
                <a-row>
                    <a-col :span="12">
                            <a-form-item label="冰雹日" name="day">
                                <a-input-number style="width: 424px" :controls="false" placeholder="请输入冰雹日"
                                    class="right-input" v-model:value="formState.day"></a-input-number>
                            </a-form-item>
                        </a-col>
                    <a-col :span="12">
                        <a-form-item name="remarks" label="来源">
                            <a-input style="width: 424px"  v-model:value.trim="formState.remarks"
                            placeholder="请输入来源"></a-input>
                        </a-form-item>
                        <!-- <a-row>
                            <a-col :span="24">
                                <div v-for="(item, index) in formState.remarks" :key="index">
                                    <a-form-item :name="['remarks', index]" :label="index == 0 ? '数据来源' : ''" :rules="[
                                        {
                                            required: false,
                                            trigger: 'blur',
                                            index: index,
                                            selfMessage: '请输入数据来源的文档名称',
                                            validator: validateFileName,
                                        },
                                    ]">
                                        <div class="add-upload-file">
                                            <Upload v-model:defaultFiles="item.data" :fileTypes="DATA_SOURCE_FILE_TYPES"
                                                :fileSize="50" :maxCount="1" fileTypeMessage="目前支持 JPG、PNG、doc、docx、pdf格式"
                                                fileSizeMessage="文件最大50M" @upFileList="(val) => getUploadFile(val, index, 'source')
                                                    ">
                                                <template #tip>
                                                    <div class="tip-content">
                                                        <div class="tip-content-add">
                                                            <a-form-item :name="['remarks', index]">
                                                                <a-input placeholder="请输入图片名称" @blur="(e) =>
                                                                        saveIndex(
                                                                            e,
                                                                            index,
                                                                            'source',
                                                                        )
                                                                    " v-model:value="item.fileName"
                                                                    style="width: 356px"></a-input>
                                                            </a-form-item>
                                                            <iconpark-icon class="add-icon" name="shanjian" size="16"
                                                                @click="deleteMap(index, 'source')" v-show="formState.remarks.length > 1
                                                                    "></iconpark-icon>
                                                            <iconpark-icon class="add-icon" name="tianjia" size="16"
                                                                @click="addMap('source')" v-show="index ==
                                                                    formState.remarks.length - 1
                                                                    "></iconpark-icon>
                                                        </div>

                                                        <div class="tip-title">说明：支持
                                                            JPG、PNG、doc、docx、pdf等，上限1个，上限50M</div>
                                                    </div>
                                                </template>
                                            </Upload>
                                        </div>
                                    </a-form-item>
                                </div>
                            </a-col>
                        </a-row> -->
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
import CommonAddDataHeader from '@/components/linkage/CommonAddDataHeader.vue';
import Upload from '@/components/upload/Upload.vue';
import {addHail,getHailDetail,updateHail} from "@/api/modules/climate";
import { ElMessage } from 'element-plus'
const props = defineProps({
    selectData:{
        type: Object,
    }
})
const editSelectData= ref({
    provice:''
})
const route = useRoute();
const router = useRouter();
const isAddOrEdit = ref(route.query.id? true : false)
const fogRef = ref(null);
const validateFileName = (rule, value, callback) => {
    if (!rule.required) {
        if ((value.fileName && value.data.length) || (!value.fileName && !value.data.length))
            return Promise.resolve();
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
    } else {
        if (!value.fileName && !value.data.length)
            return Promise.reject('请上传文件并且输入数据文件名称');
        if (!value.fileName) {
            return Promise.reject('请输入数据文件名称');
        }
        if (!value.data.length) {
            return Promise.reject('请上传文件');
        }
        if (value.fileName && value.data.length) {
            return Promise.resolve();
        }
    }
};
const formState = ref({
    dataType: 0,
    day:'',
    remarks:'',
});
const saveIndex = (e, index, type) => {
    fogRef.value.validateFields([['remarks', index]]);
};
const rules = {
    day: [{ required: true, ElMessage: '请输入冰雹日数', trigger: 'blur' }],
    remarks:[{required: false, ElMessage: '请输入来源', trigger: 'blur'}]
};

// 新增分布图
const addMap = (type) => {
    formState.value.remarks.push({
        data: [],
        fileName: '',
    });
};
// 删除分布图
const deleteMap = (index, type) => {
    formState.value.remarks.splice(index, 1);
};
// 获取文件
const getUploadFile = (val, index, type) => {
    formState.value.remarks[index]['data'] = val;
    fogRef.value.validateFields([['remarks', index]]);
};

// 重置表单
const resetForm = () => {
    fogRef.value.resetFields();
    router.go(-1);
};

onMounted(() => { 
    if(isAddOrEdit.value){
        getWindPressureDetailData()
    }
});
const saveData = () => {
    fogRef.value
        .validateFields()
        .then(() => {
            submitData()
        })
        .catch((err) => {
            console.log('err', err);
        });
};
// 提交数据
const submitData = async()=> {
    try{
        let {dataType,day,remarks} = formState.value;
        let params = {
            affiliationCode: props.selectData.code[props.selectData.code.length - 1],
            dataType,
            day,
            remarks
        }
        if(route.query.id){
            params.id = formState.value.id
            delete params.affiliationCode
        }
        let res = isAddOrEdit.value ? await updateHail(params) : await addHail(params)
        if(res.code ==200 && res.data) {
            ElMessage.success('提交成功');
            fogRef.value.resetFields();
            router.go(-1)
        }else {
            // ElMessage.error(res.msg);
        }
    }catch(error){

    }
}
// 获取详情
const getWindPressureDetailData = async()=> {
    try{
        let res = await getHailDetail(route.query.id)
        if(res.code ==200 && res.data) {
            let {dataType,day, remarks} = res.data;
            // Todo 需要联调字段回显
            formState.value = {
                id: res.data.id,
                dataType,
                day,
                remarks
            }
            editSelectData.value.provice = res.data.areaNameStr;
        }
    }catch(error){

    }
}
</script>
<style scoped lang="scss">
@import './add.scss';
</style>
