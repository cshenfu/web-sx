<template>
    <div class="add-current-power">
        <linkage v-if="!route.query.id" :interfaceType="2" @selectAddress="getSelectAddress" class="linkage" ref="currentPowerLink"></linkage>
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
                                :href="templatePath['geologyRegion']"
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
                            { required: false, ElMessage: '请上传电网报告附件', trigger: ['change'] },
                        ]"
                    >
                        <template #label>
                            <span class="self-label-no-require">电网报告附件</span>
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
                        <span>电网现状</span>
                    </h4>
                    <h4 class="content-second-title require-item"><span>电网现状【标题使用{{ computedNumber('current') }}】</span></h4>
                    <a-form-item
                        name="currentPowerGrid"
                        :rules="[
                            {
                                required: true,
                                ElMessage: '请输入电网现状描述',
                                trigger: 'blur',
                                validator: validatorPower,
                            },
                        ]"
                    >
                        <ckeditor
                            @blur="(val) => checkRequire(val, 'currentPowerGrid')"
                            v-model:dataHtml="formState.currentPowerGrid"
                        >
                        </ckeditor>
                    </a-form-item>
                    <!-- <h4 class="content-title require-item">
                        <span>电源现状</span>
                    </h4>
                    <a-form-item
                        name="currentPowerSupply"
                        :rules="[
                            {
                                required: true,
                                ElMessage: '请输入电源现状描述',
                                validator: validatorSupply,
                            },
                        ]"
                    >
                        <ckeditor
                            @blur="(val) => checkRequire(val, 'currentPowerSupply')"
                            v-model:dataHtml="formState.currentPowerSupply"
                        >
                        </ckeditor>
                    </a-form-item> -->
                    <!-- <h4 class="content-title no-require-label">
                        <span>用电量及负荷发展水平</span>
                    </h4>
                    <a-form-item
                        name="electricityConsumptionDevLevel"
                        :rules="[{ required: false, ElMessage: '请输入用电量及负荷发展水平描述' }]"
                    >
                        <ckeditor
                            v-model:dataHtml="formState.electricityConsumptionDevLevel"
                        ></ckeditor>
                    </a-form-item> -->
                    <!-- <h4 class="content-title no-require-label">
                        <span>与周边电网联系</span>
                    </h4>
                    <a-form-item
                        name="powerGridSurroundRela"
                        :rules="[{ required: false, ElMessage: '请输入与周边电网联系描述' }]"
                    >
                        <ckeditor
                            :id="'three'"
                            v-model:dataHtml="formState.powerGridSurroundRela"
                        ></ckeditor>
                    </a-form-item>
                    <h4 class="content-title no-require-label">
                        <span>500kV电网存在问题</span>
                    </h4>
                    <a-form-item name="v500PowerGridProblem">
                        <ckeditor v-model:dataHtml="formState.v500PowerGridProblem"></ckeditor>
                    </a-form-item> -->
                    <h4 class="content-title">
                        <img src="@/assets/img/user/detail-title.png" alt="" />
                        <!-- <span>电力发展【省级${4.4.1}市级${4.4.2}县区级${4.4.3}】</span> -->
                        <span>电力发展【标题使用{{ computedNumber('development')  }}】</span>
                    </h4>
                    <!-- <h4 class="content-title no-require-label">
                        <span>电力需求预测</span>
                    </h4> -->
                    <a-form-item name="needPrediction">
                        <ckeditor v-model:dataHtml="formState.needPrediction"></ckeditor>
                    </a-form-item>
                    <!-- <h4 class="content-title no-require-label">
                        <span>相关电网发展规划</span>
                    </h4>
                    <a-form-item name="developPlan">
                        <ckeditor v-model:dataHtml="formState.developPlan"></ckeditor>
                    </a-form-item>
                    <h4 class="content-title no-require-label">
                        <span>电源规划</span>
                    </h4>
                    <a-form-item name="powerPlan">
                        <ckeditor v-model:dataHtml="formState.powerPlan"></ckeditor>
                    </a-form-item> -->
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
    import { ref, reactive, toRefs, onBeforeMount, onMounted,onUnmounted, watchEffect, computed, nextTick } from 'vue';
    import { useRoute, useRouter } from 'vue-router';
    import linkage from '@/components/linkage/linkage.vue';
    import CommonAddDataHeader from '@/components/linkage/CommonAddDataHeader';
    import Upload from '@/components/upload/Upload';
    import Ckeditor from '@/components/editor/Editor.vue';
    import { addGrid, checkPointsExcel,getGridDetail,updateGrid } from '@/api/modules/commonDataManage';
    import { ElMessage } from 'element-plus'
    import { useOssUpload } from '@/components/ossClient/index';
    import {AREA_NUMBER} from  './currentPower';
    import { templatePath } from '@/assets/js/static';
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
    const rangeType = ref(1)
    const fileTypes = 'jpg,jpeg,png,pdf,doc,docx';
    const currentPowerFormRef = ref(null);
    let formState = reactive({
        suitRange: 1,
        rangeFile: [],
        locations: '',
        filePath: [],
        currentPowerGrid: '',
        currentPowerSupply: '',
        electricityConsumptionDevLevel: '',
        powerGridSurroundRela: '',
        v500PowerGridProblem: '',
        needPrediction: '',
        developPlan: '',
        powerPlan: '',
    });
    const needHandleField = ['currentPowerGrid', 'currentPowerSupply', 'electricityConsumptionDevLevel', 'powerGridSurroundRela', 'v500PowerGridProblem', 'needPrediction', 'developPlan', 'powerPlan'];
    const changeAreaPoint = (e)=> {
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
    const validatorSupply = (rule, value, callback) => {
        console.log(formState.currentPowerGrid, 'rule', value);
        if (formState.currentPowerGrid || value) {
            return Promise.resolve();
        } else {
            return Promise.reject('请填写电源现状');
        }
    };
    const validatorPower = (rule, value, callback) => {
        if (formState.currentPowerSupply || value) {
            return Promise.resolve();
        } else {
            return Promise.reject('请填写电网现状');
        }
    };
    // 重置表单
    const resetForm = () => {
        currentPowerFormRef.value.resetFields();
        // powerEditor.value.editorRef.clear()
        router.push({
            path: '/currentPower',
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
                try {
                    let res = route.query.id ? await updateGrid(data): await addGrid(data);
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
        const data = value.data;
        let str = '';
        selectData.value.code = [];
        for (let index = 0; index <= value.type; index++) {
            str +=
                (index == 0 || !data[index]['areaName'] ? '' : '/') +
                (data[index]['areaName'] ? data[index]['areaName'] : '');
            selectData.value.code.push(data[index]['areaCode']);
        }
        selectData.value.provice = str;
        rangeType.value =  selectData.value.code.length
    };
    const checkRequire = (vla, name) => {
        currentPowerFormRef.value.validateFields([name]);
    };
    // 初始化详情
    const initDetail = async () => {
        const res = await getGridDetail(route.query.id)
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
            if(res.data.addressCode){
                let { provinceCode, provinceName, cityCode, cityName, districtCode, districtName } = res.data?.addressCode || {};
                let provinceObj = {
                    'areaCode': provinceCode,
                    'areaName': provinceName,
                };
                let cityObj = {
                    'areaCode': cityCode,
                    'areaName': cityName,
                };
                let districtObj = {
                    'areaCode': districtCode,
                    'areaName': districtName,
                };

                let linkAreaCode;

                switch (res.data.rangeType) {
                    case 1:
                        linkAreaCode = [provinceObj];
                        break;
                    case 2:
                        linkAreaCode = [provinceObj, cityObj];
                        break;
                    default:
                        linkAreaCode = [provinceObj, cityObj, districtObj];
                        break;
                }
                // currentPowerLink.value.echo(linkAreaCode);
                nextTick(() => {
                    getSelectAddress({
                        data: linkAreaCode,
                        type: res.data.rangeType - 1
                    })
                })
                
            }
            // rangeType.value = res.data.rangeType;
        }
        console.log('详情', formState)

    };
    const computedNumber = (type)=> {
        let str = '省级${4.4.1}市级${4.4.2}县区级${4.4.3}'
        str = AREA_NUMBER[type][rangeType.value]
        return str 
    }
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
