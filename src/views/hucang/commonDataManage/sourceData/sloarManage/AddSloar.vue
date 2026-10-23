<template>
    <div class="add-current-power">
        <linkage v-if="!route.query.id" :interfaceType="12" @selectAddress="getSelectAddress" class="linkage" ref="currentPowerLink"></linkage>
        <div class="add-power-right">
            <CommonAddDataHeader :selectData="selectData"></CommonAddDataHeader>
            <div class="add-power-right-content">
                <h4 class="content-title">
                    <img src="@/assets/img/user/detail-title.png" alt="" />
                    项目基本信息
                </h4>
                <a-form
                    ref="sloarFormRef"
                    :hideRequiredMark="true"
                    name="advanced_search"
                    class="ant-advanced-search-form"
                    layout="vertical"
                    :model="formState"
                >
                    <h4 class="content-second-title require-item"><span>太阳能资源数据</span></h4>
                    <a-form-item
                        name="resourceData"
                        :rules="[
                            {
                                required: true,
                                ElMessage: '请输入太阳能资源数据',
                                trigger: 'blur',
                                validator: validatorPower,
                            },
                        ]"
                    >
                        <ckeditor
                            @blur="(val) => checkRequire(val, 'resourceData')"
                            v-model:dataHtml="formState.resourceData"
                        >
                        </ckeditor>
                    </a-form-item>
                    <h4 class="content-second-title">太阳能资源分布图</h4>
                    <a-form-item
                        name="filePath"
                        :rules="[
                            { required: false, ElMessage: '请上传电网报告附件', trigger: ['change'] },
                        ]"
                    >
                        <Upload
                            name="pic"
                            v-model:defaultFiles="formState.filePath"
                            :fileTypes="fileTypes"
                            :fileSize="50"
                            :maxCount="1"
                            fileTypeMessage="目前支持 JPG、PNG格式"
                            fileSizeMessage="文件最大5M"
                            @upFileList="(e) => getUploadFile(e, 'filePath')"
                        >
                            <template #tip>
                                <div class="tip"
                                    >说明：资料支持格式为
                                    JPG、PNG等类型，上限1个，文件最大5M</div
                                >
                            </template>
                        </Upload>
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
    import { ref, reactive, toRefs, onBeforeMount, onMounted,onUnmounted, watchEffect, computed, nextTick } from 'vue';
    import { useRoute, useRouter } from 'vue-router';
    import linkage from '@/components/linkage/linkage.vue';
    import CommonAddDataHeader from '@/components/linkage/CommonAddDataHeader.vue';
    import Upload from '@/components/upload/Upload.vue';
    import Ckeditor from '@/components/editor/Editor.vue';
    import { addSolarEnergy,getSolarEnergyDetail,updateSolarEnergy } from '@/api/modules/sourceData/sloarManage';
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
    const rangeType = ref(1)
    const fileTypes = 'jpg,jpeg,png';
    const sloarFormRef = ref(null);
    let formState = reactive({
        filePath: [],
        resourceData: '',

    });
    // 获取文件
    const getUploadFile = async (file, type) => {
        formState[type] = [
            {
                fileName: file.fileName,
                filePath: file.filePath,
                suffix:  file.suffix,
                fileType: 1
            },
        ];
        sloarFormRef.value.validateFields([type]);
    };
    const validatorPower = (rule, value, callback) => {
        if (formState.resourceData || value) {
            return Promise.resolve();
        } else {
            return Promise.reject('请输入太阳能资源数据');
        }
    };
    // 重置表单
    const resetForm = () => {
        sloarFormRef.value.resetFields();
        // powerEditor.value.editorRef.clear()
        router.push({
            path: '/sourceData/sloarList',
        });
    };
    // 新增保存
    const saveData = async() => {
        sloarFormRef.value
            .validate()
            .then(async () => {
                let data = {
                    resourceData: formState.resourceData,
                    img: {
                        fileName:'',
                        filePath:'',
                        objectKey:'source/sloar/'
                    }
                };
                if(route.query.id) {
                    data.id = formState.id;
                }else {
                    data.affiliationCode = selectData.value.code[selectData.value.code.length - 1]
                }
                if( formState.filePath&&formState.filePath.length) {
                    data.img.fileName = formState.filePath[0]['fileName']
                    data.img.filePath = formState.filePath[0]['filePath']
                }else {
                    data.img = null
                }
                try {
                    let res = route.query.id ? await updateSolarEnergy(data): await addSolarEnergy(data);
                    if (res.code == 200) {
                        let msg = route.query.id ? '修改成功' : '新增成功';
                        ElMessage.success(msg);
                        router.push({
                            path: '/sourceData/sloarList',
                        });
                    }
                } catch (err) {
                    console.log('err', err);
                }
            })
            .catch((err) => {
                // 表单验证没通过
                // sloarFormRef.value.scrollToField(err.errorFields[0].name);
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
        sloarFormRef.value.validateFields([name]);
    };
    // 初始化详情
    const initDetail = async () => {
        const res = await getSolarEnergyDetail(route.query.id)
        if (res.code == 200) {
            let allKey = [
                'id',
                'resourceData',
            ]
                allKey.forEach(key => {  
                    formState[key] = res.data[key]; 
                });
            formState.filePath = res.data.img?.filePath?[{...res.data.img}] :[]
            selectData.value.provice = res.data.areaNameStr
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
                nextTick(() => {
                    getSelectAddress({
                        data: linkAreaCode,
                        type: res.data.rangeType - 1
                    })
                })
                
            }
        }

    };
    onBeforeMount(() => {
        sessionStorage.setItem('obsPath', 'source/sloar/');
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
