<template>
    <div class="add-current-power">
        <linkage v-show="!route.query.id" :interfaceType="2" @selectAddress="getSelectAddress" class="linkage" ref="currentPowerLink"></linkage>
        <div class="add-power-right">
            <CommonAddDataHeader :selectData="selectData"></CommonAddDataHeader>
            <div class="add-power-right-content">
                <h4 class="content-title">
                    <img src="@/assets/img/user/detail-title.png" alt="" />
                    项目基本信息
                </h4>
                <a-form
                    ref="currentPowerFormRef"
                    :hideRequiredMark="true"
                    name="advanced_search"
                    class="ant-advanced-search-form"
                    layout="vertical"
                    :model="formState"
                >
                    <a-form-item
                        name="suitRange"
                        :rules="[{ required: true, ElMessage: '请选择范围指定' }]"
                    >
                        <template #label>
                            <span class="self-label">范围指定</span>
                        </template>
                        <a-radio-group v-model:value="formState.suitRange" name="radioGroup" @change="changeAreaPoint">
                            <a-radio :value="1">全城通用</a-radio>
                            <a-radio :value="2">拐点坐标</a-radio>
                        </a-radio-group>
                    </a-form-item>
                    <a-form-item
                        name="rangeFile"
                        :rules="[
                            {
                                required: formState.suitRange ==2? true: false,
                                ElMessage: '请上传已填写的模板数据',
                                trigger: ['change'],
                            },
                        ]"
                        v-show="formState.suitRange == 2"
                        style="margin-top: -20px"
                    >
                        <p class="tip-download"
                            >点击这里先
                            <a
                                href="https://test-dt.obs.cn-east-3.myhuaweicloud.com/c1/Final-%E5%8D%97%E5%B1%B1%E5%BE%AE%E8%AF%BE%E9%A1%B9%E7%9B%AE%E6%96%B0%E9%97%BB%E7%A8%BF-1211.pdf"
                                download
                                >下载导入模板.xlsx</a
                            ></p
                        >
                        <Upload
                            :isImmediatelyUpload="false"
                            :defaultFiles="formState.rangeFile"
                            :fileTypes="'xlsx'"
                            :maxCount="1"
                            fileTypeMessage="目前仅支持 xlsx 格式"
                            @upFileList="(e) => getUploadFile(e, 'rangeFile')"
                            >>
                            <template #tip>
                                <div class="tip">上传已填写模板数据</div>
                            </template>
                        </Upload>
                    </a-form-item>
                    <a-form-item
                        name="filePath"
                        :rules="[
                            { required: false, ElMessage: '请上传环保报告附件', trigger: ['change'] },
                        ]"
                    >
                        <template #label>
                            <span class="self-label-no-require">环保报告附件</span>
                        </template>
                        <Upload
                            v-model:defaultFiles="formState.filePath"
                            :fileTypes="fileTypes"
                            :fileSize="50"
                            :maxCount="1"
                            fileTypeMessage="目前支持 JPG、PNG、PDF、doc、docx 格式"
                            fileSizeMessage="文件最大50M"
                            @upFileList="(e) => getUploadFile(e, 'filePath')"
                        >
                            <template #tip>
                                <div class="tip"
                                    >说明：资料支持格式为
                                    JPG、PNG、doc、docx、pdf等类型，上限1个，文件最大50M</div
                                >
                            </template>
                        </Upload>
                    </a-form-item>
                    <h4 class="content-title">
                        <img src="@/assets/img/user/detail-title.png" alt="" />
                        <h4 class="content-second-title require-item"><span>自然环境</span></h4>
                    </h4>
                    <a-form-item
                        name="currentPowerGrid"
                        :rules="[
                            {
                                required: true,
                                ElMessage: '请输入自然环境描述',
                                trigger: 'blur',
                            },
                        ]"
                    >
                        <ckeditor
                            @blur="(val) => checkRequire(val, 'currentPowerGrid')"
                            v-model:dataHtml="formState.currentPowerGrid"
                        >
                        </ckeditor>
                    </a-form-item>
                    <h4 class="content-title">
                        <img src="@/assets/img/user/detail-title.png" alt="" />
                        <h4 class="content-second-title require-item"><span>水环境</span></h4>
                    </h4>
                    <a-form-item 
                        name="needPrediction"
                        :rules="[
                            {
                                required: true,
                                ElMessage: '请输入水环境描述',
                                trigger: 'blur',
                            },
                        ]"
                    >
                        <ckeditor v-model:dataHtml="formState.needPrediction"></ckeditor>
                    </a-form-item>
                    <h4 class="content-title">
                        <img src="@/assets/img/user/detail-title.png" alt="" />
                        <h4 class="content-second-title require-item"><span>环境空气、声环境</span></h4>
                    </h4>
                    <a-form-item 
                        name="needPrediction1"  
                        :rules="[
                            {
                                required: true,
                                ElMessage: '请输入环境空气、声环境描述',
                                trigger: 'blur',
                            },
                        ]"
                    >
                        <ckeditor v-model:dataHtml="formState.needPrediction1"></ckeditor>
                    </a-form-item>
                    <h4 class="content-title">
                        <img src="@/assets/img/user/detail-title.png" alt="" />
                        <h4 class="content-second-title require-item"><span>社会环境</span></h4>
                    </h4>
                    <a-form-item 
                        name="needPrediction2"  
                        :rules="[
                            {
                                required: true,
                                ElMessage: '请输入社会环境描述',
                                trigger: 'blur',
                            },
                        ]"
                    >
                        <ckeditor v-model:dataHtml="formState.needPrediction2"></ckeditor>
                    </a-form-item>
                    <h4 class="content-title">
                        <img src="@/assets/img/user/detail-title.png" alt="" />
                        <h4 class="content-second-title require-item"><span>生态环境</span></h4>
                    </h4>
                    <a-form-item 
                        name="needPrediction3"  
                        :rules="[
                            {
                                required: true,
                                ElMessage: '请输入生态环境描述',
                                trigger: 'blur',
                            },
                        ]"
                    >
                        <ckeditor v-model:dataHtml="formState.needPrediction3"></ckeditor>
                    </a-form-item>
                    <a-form-item style="text-align: center">
                        <a-button class="handle-button" @click="resetForm"> 取消 </a-button>
                        <a-button class="handle-button" type="primary" @click="saveData"
                            >保存</a-button
                        >
                    </a-form-item>
                </a-form>
            </div>
        </div>
    </div>
</template>

<script setup>
    import { ref, reactive, toRefs, onBeforeMount, onMounted,onUnmounted, watchEffect, computed } from 'vue';
    import { useRoute, useRouter } from 'vue-router';
    import linkage from '@/components/linkage/linkage.vue';
    import CommonAddDataHeader from '@/components/linkage/CommonAddDataHeader.vue';
    import Upload from '@/components/upload/Upload';
    import Ckeditor from '@/components/editor/Editor.vue';
    import { addGrid, checkPointsExcel,getGridDetail,updateGrid } from '@/api/modules/commonDataManage';
    import { ElMessage } from 'element-plus'
    import { useOssUpload } from '@/components/ossClient/index';
    const currentPowerLink = ref(null)
    const obsUpload = useOssUpload();
    const route = useRoute();

    const router = useRouter();

    const selectData = ref({
        provice: '',
        code: [],
        num: 12,
        noNum: 0,
    });
    const fileTypes = 'jpg,jpeg,png,pdf,doc,docx';
    const currentPowerFormRef = ref(null);
    let formState = reactive({
        suitRange: 1,
        rangeFile: [],
        locations: '',
        filePath: [],
        currentPowerGrid: '',
        needPrediction: '',
        needPrediction1:'',
        needPrediction2:'',
        needPrediction3:'',
    });
    const needHandleField = ['currentPowerGrid','needPrediction', 'needPrediction1', 'needPrediction2', 'needPrediction3'];
    const changeAreaPoint = (e)=> {
        console.log('changeAreaPoint', e.target.value);
        if(e.target.value == 1){
            formState.locations = '';
            formState.rangeFile = [];
        }else {
            currentPowerFormRef.value.validateFields(['rangeFile']);
        }
    } 
    // 获取文件
    const getUploadFile = async (file, type) => {
        if (type == 'rangeFile') {
            const formData = new FormData();
            formData.append('file', file);
            const res = await checkPointsExcel(formData);
            if (res.code == 200) {
                formState.locations = JSON.stringify(res.data);
                let uploadResult = await obsUpload.uploadFile(file);
                formState[type] = [
                    {
                        fileName: file.name,
                        filePath: uploadResult.obsPath,
                        suffix: file.name.split('.')[file.name.split('.').length - 1],
                        fileType:2
                    },
                ];
            } else {
                ElMessage.error(res.msg);
            }
        } else {
            formState[type] = [
                    {
                        fileName: file.fileName,
                        filePath: file.filePath,
                        suffix:  file.suffix,
                        fileType: 1
                    },
                ];
        }
        currentPowerFormRef.value.validateFields([type]);
    };
    // 重置表单
    const resetForm = () => {
        currentPowerFormRef.value.resetFields();
        router.push({
            path: '/environment/list',
        });
    };
    // 新增保存
    const saveData = async() => {
        currentPowerFormRef.value
            .validate()
            .then(async () => {
                let data = {
                    rangeType: selectData.value.code.length, // 选择地址范围
                    status: 2,
                    source:1,
                    isDisable: 0,
                    // ...handleData,
                    ...formState,
                    cityCode: selectData.value.code[selectData.value.code.length - 1],
                    parentId: selectData.value.code.length >=2 ?selectData.value.code[selectData.value.code.length - 2]:0,
                    powerGridCurrentFiles: []
                };
                if(data.suitRange == 2) {
                    data.powerGridCurrentFiles.push(...formState.rangeFile)
                }
                console.log('formState.filePath', formState.filePath);
                if( formState.filePath&&formState.filePath.length) {
                    data.powerGridCurrentFiles.push(...formState.filePath)
                }
                // Todo 将数据中的url处理成相对路径
                // data.powerGridCurrentFiles.forEach(item => {                    
                //     let matchResult = item.filePath.match(regex);
                //     item.filePath = matchResult && matchResult[1] || item.filePath;
                // });
                delete data.rangeFile;
                delete data.filePath;
                console.log('data', data);
                try {
                    let res = route.query.id ? await updateGrid(data): await addGrid(data);
                    console.log('新增数据', res);
                    if (res.code == 200) {
                        let msg = route.query.id ? '修改成功' : '新增成功';
                        ElMessage.success(msg);
                        router.push({
                            path: '/currentPower',
                        });
                    }
                } catch (err) {
                    console.log('err', err);
                }
            })
            .catch((err) => {
                // 表单验证没通过
                // currentPowerFormRef.value.scrollToField(err.errorFields[0].name);
                console.log('错误', err);
            });
    };
    // 获取左侧省市区选中数据
    const getSelectAddress = (value) => {
        console.log(value);
        const data = value.data;
        let str = '';
        selectData.value.code = [];
        for (let index = 0; index <= value.type; index++) {
            str +=
                (index == 0 || !data[index]['regionName'] ? '' : '/') +
                (data[index]['regionName'] ? data[index]['regionName'] : '');
            selectData.value.code.push(data[index]['regionCode']);
        }
        selectData.value.provice = str;
    };
    const checkRequire = (vla, name) => {
        currentPowerFormRef.value.validateFields([name]);
    };
    // 初始化详情
    const initDetail = async () => {
        const res = await getGridDetail(route.query.id)
        console.log('res', res);
        if (res.code == 200) {
            let allKey = [
                'id',
                'suitRange',
                'locations',
                'currentPowerGrid',
                'currentPowerSupply',
                'electricityConsumptionDevLevel',
                'powerGridSurroundRela',
                'v500PowerGridProblem',
                'needPrediction',
                'developPlan',
                'powerPlan'
            ]
                allKey.forEach(key => {  
                    formState[key] = res.data[key]; 
                });  
            formState.rangeFile = res.data.powerGridCurrentFiles?.filter(item => item.fileType == 2)
            formState.filePath = res.data.powerGridCurrentFiles?.filter(item => item.fileType == 1)
        }
        console.log('详情', formState)

    };
    onBeforeMount(() => {
        sessionStorage.setItem('obsPath', 'dw/');
    });
    onMounted(() => {
        if(route.query.id) {
            initDetail()
        }
    });
    onUnmounted(() => {
        sessionStorage.removeItem('obsPath');
    });
</script>
<style scoped lang="scss">
    .add-current-power {
        background-color: #fff;
        padding: 24px 0 24px 24px;
        display: flex;
        .linkage{
            margin-right: 26px;
        }

        .add-power-right {
            width: 95%;
            // margin-left: 26px;
            flex: 1;
            .add-power-right-content {
                height: calc(100vh - 190px);
                overflow: auto;

                .content-title {
                    color: #3d435d;
                    display: flex;
                    align-items: center;
                    margin: 24px 0 20px 0;

                    img {
                        height: 14px;
                        margin-right: 8px;
                    }

                    button {
                        margin-left: auto;
                        display: flex;
                        align-items: center;

                        iconpark-icon {
                            margin-right: 5px;
                        }
                    }
                }

                .require-item {
                    span {
                        &::before {
                            display: inline-block;
                            margin-inline-end: 4px;
                            color: #ff4d4f;
                            font-size: 14px;
                            font-family: SimSun, sans-serif;
                            line-height: 1;
                            content: '*';
                        }
                    }
                }

                .content-second-title {
                    margin-bottom: 5px;
                    color: #3d435d;
                }

                .no-require-label {
                    margin-left: 10px;
                }

                .self-label {
                    font-size: 14px;
                    color: #5c6170;
                    line-height: 12px;

                    &::before {
                        display: inline-block;
                        margin-inline-end: 4px;
                        color: #ff4d4f;
                        font-size: 14px;
                        font-family: SimSun, sans-serif;
                        line-height: 1;
                        content: '*';
                    }
                }
                .self-label-no-require {
                    font-size: 14px;
                    color: #5c6170;
                    line-height: 12px;
                    margin-left: 10px;
                }
            }

            .handle-button {
                margin: 0 16px;
                width: 80px;
            }
        }

        .tip {
            color: #7c8294;
            font-size: 12px;
        }

        .tip-download {
            font-size: 12px;
            margin: 6px 0 16px 0;

            a {
                color: '#036B64';
            }
        }
    }
</style>
