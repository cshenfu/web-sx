<template>
    <div class="add-power-right">
        <CommonAddDataHeader :selectData="selectData.provice? selectData : editSelectData"></CommonAddDataHeader>
        <div class="add-power-right-content">
            <h4 class="content-title">
                <img src="@/assets/img/user/detail-title.png" alt="" />
                项目基本信息
            </h4>
            <a-form
                ref="acidFormRef"
                name="advanced_search"
                :rules="rules"
                class="ant-advanced-search-form"
                layout="vertical"
                :model="formState"
            >
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
                            <a-form-item label="降水样本数" name="precipitationSamplesNum">
                                <a-input-number
                                    style="width: 424px"
                                    :controls="false"
                                    placeholder="请输入降水样本数"
                                    class="right-input"
                                    v-model:value="formState.precipitationSamplesNum"
                                    addon-after="个"
                                ></a-input-number>
                            </a-form-item>
                        </a-col>
                        <a-col :span="12">
                            <a-form-item label="pH<5.6样本数" name="ph56SamplesNum">
                                <a-input-number
                                    style="width: 424px"
                                    :controls="false"
                                    placeholder="请输入pH<5.6样本数"
                                    class="right-input"
                                    v-model:value="formState.ph56SamplesNum"
                                    addon-after="个"
                                ></a-input-number>
                            </a-form-item>
                        </a-col>
                        <a-col :span="12">
                            <a-form-item
                                label="pH均值范围"
                                class="custom-range-number"
                                :name="['number']"
                                :rules="[
                                    {
                                        required: true,
                                        ElMessage: '请输入合理数值范围!',
                                        trigger: 'blur',
                                        validator: validatorNumber,
                                    },
                                ]"
                            >
                                <div
                                    class="range-number-cont"
                                    :class="isError ? 'error' : isActive ? 'active' : 'unActive'"
                                >
                                    <a-form-item class="range-number-input">
                                        <a-input-number
                                            style="width: 100%"
                                            :precision="2"
                                            @mouseover="mouseover"
                                            @mouseout="mouseout"
                                            @focus="(isActive = true), (isFocus = true)"
                                            @blur="blur"
                                            :controls="false"
                                            placeholder="最小值"
                                            v-model:value="formState.number.minAcidRainValue"
                                        ></a-input-number>
                                    </a-form-item>
                                    <span class="custom-icon">~</span>
                                    <a-form-item class="range-number-input">
                                        <a-input-number
                                            style="width: 100%"
                                            :precision="2"
                                            @mouseover="mouseover"
                                            @mouseout="mouseout"
                                            @focus="(isActive = true), (isFocus = true)"
                                            @blur="blur"
                                            :controls="false"
                                            placeholder="最大值"
                                            v-model:value="formState.number.maxAcidRainValue"
                                        ></a-input-number>
                                    </a-form-item>
                                </div>
                            </a-form-item>
                        </a-col>
                    </template>
                    <a-col :span="12">
                        <a-row>
                            <a-col :span="24">
                                <div v-for="(item, index) in formState.thunderMap" :key="index">
                                    <a-form-item
                                        :name="['thunderMap', index]"
                                        :label="index == 0 ? labelTitile : ''"
                                        :rules="[
                                            {
                                                required: vectorRequired,
                                                trigger: 'blur',
                                                index: index,
                                                selfMessage: placeholderTip,
                                                validator: validateFileName,
                                            },
                                        ]"
                                    >
                                        <div class="add-upload-file">
                                            <Upload
                                                :name="'pic'"
                                                v-model:defaultFiles="item.data"
                                                :fileTypes="fileTypes"
                                                :fileSize="upFileSize"
                                                :maxCount="1"
                                                :fileTypeMessage="fileTypeMessage"
                                                :fileSizeMessage="`文件最大${upFileSize}M`"
                                                @upFileList="
                                                    (val) => getUploadFile(val, index, 'thunder')
                                                "
                                            >
                                                <template #tip>
                                                    <div class="tip-content">
                                                        <div class="tip-content-add">
                                                            <a-form-item
                                                                :name="['thunderMap', index]"
                                                            >
                                                                <a-input
                                                                    :placeholder="placeholderTip"
                                                                    @blur="
                                                                        (e) =>
                                                                            saveIndex(
                                                                                e,
                                                                                index,
                                                                                'thunder',
                                                                            )
                                                                    "
                                                                    v-model:value.trim="
                                                                        item.fileName
                                                                    "
                                                                    style="width: 356px"
                                                                ></a-input>
                                                            </a-form-item>
                                                            <template
                                                                v-if="formState.dataType == 0"
                                                            >
                                                                <iconpark-icon
                                                                    class="add-icon"
                                                                    name="shanjian"
                                                                    size="16"
                                                                    @click="
                                                                        deleteMap(index, 'thunder')
                                                                    "
                                                                    v-show="
                                                                        formState.thunderMap
                                                                            .length > 1
                                                                    "
                                                                ></iconpark-icon>
                                                                <iconpark-icon
                                                                    class="add-icon"
                                                                    name="tianjia"
                                                                    size="16"
                                                                    @click="addMap('thunder')"
                                                                    v-show="
                                                                        index ==
                                                                        formState.thunderMap
                                                                            .length -
                                                                            1
                                                                    "
                                                                ></iconpark-icon>
                                                            </template>
                                                        </div>

                                                        <div class="tip-title">{{
                                                            uploadFileTip
                                                        }}</div>
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
                                    <a-form-item
                                        :name="['dataSources', index]"
                                        :label="index == 0 ? '数据来源' : ''"
                                        :rules="[
                                            {
                                                required: false,
                                                trigger: 'blur',
                                                index: index,
                                                selfMessage: '请输入数据来源的文档名称',
                                                validator: validateFileName,
                                            },
                                        ]"
                                    >
                                        <div class="add-upload-file">
                                            <Upload
                                                v-model:defaultFiles="item.data"
                                                :fileTypes="DATA_SOURCE_FILE_TYPES"
                                                :fileSize="50"
                                                :maxCount="1"
                                                fileTypeMessage="目前支持 JPG、PNG、doc、docx、pdf格式"
                                                fileSizeMessage="文件最大50M"
                                                @upFileList="
                                                    (val) => getUploadFile(val, index, 'source')
                                                "
                                            >
                                                <template #tip>
                                                    <div class="tip-content">
                                                        <div class="tip-content-add">
                                                            <a-form-item
                                                                :name="['dataSources', index]"
                                                            >
                                                                <a-input
                                                                    placeholder="请输入图片名称"
                                                                    @blur="
                                                                        (e) =>
                                                                            saveIndex(
                                                                                e,
                                                                                index,
                                                                                'source',
                                                                            )
                                                                    "
                                                                    v-model:value="item.fileName"
                                                                    style="width: 356px"
                                                                ></a-input>
                                                            </a-form-item>
                                                            <iconpark-icon
                                                                class="add-icon"
                                                                name="shanjian"
                                                                size="16"
                                                                @click="deleteMap(index, 'source')"
                                                                v-show="
                                                                    formState.dataSources.length > 1
                                                                "
                                                            ></iconpark-icon>
                                                            <iconpark-icon
                                                                class="add-icon"
                                                                name="tianjia"
                                                                size="16"
                                                                @click="addMap('source')"
                                                                v-show="
                                                                    index ==
                                                                    formState.dataSources.length - 1
                                                                "
                                                            ></iconpark-icon>
                                                        </div>

                                                        <div class="tip-title"
                                                            >说明：支持
                                                            JPG、PNG、doc、docx、pdf等，上限1个，上限50M</div
                                                        >
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
    import { addDryRain,getDryRainDetail,updateDryRain } from '@/api/modules/climate';
    import { DATA_SOURCE_FILE_TYPES, MAP_FILE_TYPES, VECTOR_MAP_FILE_TYPES } from './add';
    import { ElMessage } from 'element-plus'
    const props = defineProps({
        selectData: {
            type: Object,
        },
    });
    const editSelectData= ref({
        provice:''
    })
    const route = useRoute();
    const router = useRouter();
    const isAddOrEdit = ref(route.query.id ? true : false);
    const acidFormRef = ref(null);
    const isActive = ref(false);
    const isError = ref(false);
    const isFocus = ref(false);
    const mouseover = () => {
        isActive.value = true;
    };
    const mouseout = () => {
        isActive.value = isFocus.value;
    };
    const blur = () => {
        isActive.value = false;
        isFocus.value = false;
        acidFormRef.value.validateFields(['number']);
    };
    const validatorNumber = (rule, value) => {
        if (
            value.maxAcidRainValue != '' &&
            value.minAcidRainValue != '' &&
            value.maxAcidRainValue >= value.minAcidRainValue
        ) {
            isError.value = false;
            return Promise.resolve();
        } else {
            isError.value = true;
            return Promise.reject('请输入正确数值范围！');
        }
    };
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
        precipitationSamplesNum: '',
        ph56SamplesNum: '',
        number: {
            minAcidRainValue: '',
            maxAcidRainValue: '',
        },
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
        ],
    });
    // 矢量图
    const vectorRequired = ref(false);
    const labelTitile = ref('酸雨分布图');
    const uploadFileTip = ref('说明：文件格式需为JPG、PNG，上限1个，文件最大5M');
    const upFileSize = ref(5);
    const fileTypeMessage = ref('目前支持 JPG、PNG 格式');
    const fileTypes = ref(MAP_FILE_TYPES);
    const placeholderTip = ref('请输入图片名称');
    const getModeType = (val) => {
        acidFormRef.value.resetFields();
        formState.value.dataType = val.target.value;
        formState.value.thunderMap = [
            {
                data: [],
                fileName: '',
            },
        ];
        formState.value.dataSources = [
            {
                data: [],
                fileName: '',
            },
        ];
        val.target.value == 0 ? (vectorRequired.value = false) : (vectorRequired.value = true);
        val.target.value == 0
            ? (labelTitile.value = '酸雨分布图')
            : (labelTitile.value = '数据文件');
        val.target.value == 0
            ? (uploadFileTip.value = '说明：文件格式需为JPG、PNG，上限1个，文件最大5M')
            : (uploadFileTip.value = '说明：格式需为tif、shp 矢量数据格式，上限1个，最大500M');
        val.target.value == 0 ? (upFileSize.value = 5) : (upFileSize.value = 500);
        val.target.value == 0
            ? (fileTypeMessage.value = '目前支持 JPG、PNG 格式')
            : (fileTypeMessage.value = '目前支持 tif、shp矢量数据格式');
        val.target.value == 0
            ? (fileTypes.value = MAP_FILE_TYPES)
            : (fileTypes.value = VECTOR_MAP_FILE_TYPES);
        val.target.value == 0
            ? (placeholderTip.value = '请输入图片名称')
            : (placeholderTip.value = '请输入数据文件名称');
    };
    const saveIndex = (e, index, type) => {
        if (type == 'thunder') {
            acidFormRef.value.validateFields([['thunderMap', index]]);
        } else {
            acidFormRef.value.validateFields([['dataSources', index]]);
        }
    };
    const rules = {
        dataType: [{ required: true, ElMessage: '请选择', trigger: 'change' }],
    };

    // 新增分布图
    const addMap = (type) => {
        if (type == 'thunder') {
            formState.value.thunderMap.push({
                data: [],
                fileName: '',
            });
        } else {
            formState.value.dataSources.push({
                data: [],
                fileName: '',
            });
        }
    };
    // 删除分布图
    const deleteMap = (index, type) => {
        if (type == 'thunder') {
            formState.value.thunderMap.splice(index, 1);
        } else {
            formState.value.dataSources.splice(index, 1);
        }
    };
    // 获取文件
    const getUploadFile = (val, index, type) => {
        if (type == 'thunder') {
            formState.value.thunderMap[index]['data'] = [val];
            acidFormRef.value.validateFields([['thunderMap', index]]);
        } else {
            formState.value.dataSources[index]['data'] = [val];
            acidFormRef.value.validateFields([['dataSources', index]]);
        }
    };

    // 重置表单
    const resetForm = () => {
        acidFormRef.value.resetFields();
        router.go(-1);
    };
    onMounted(() => {
        if (route.query.id) {
            getAcidRainDetail(route.query.id);
        }
    });
    const saveData = () => {
        acidFormRef.value
            .validateFields()
            .then(() => {
                // console.log('保存数据', formState.value);
                submitData();
            })
            .catch((err) => {
                console.log('err', err);
            });
    };
    // 提交数据
    const submitData = async () => {
        try {
            let {
                dataType,
                ph56SamplesNum,
                precipitationSamplesNum,
                maxAcidRainValue,
                minAcidRainValue,
            } = { ...formState.value, ...formState.value.number };
            let mapImage = {
                fileName: '',
                filePath: '',
            };
            formState.value.thunderMap.forEach((item) => {
                mapImage.fileName = item.fileName;
                mapImage.filePath = item.data.length > 0? item.data[0].filePath : '';
            });
            let params = {
                dataType,
                ph56SamplesNum,
                precipitationSamplesNum,
                maxAcidRainValue,
                minAcidRainValue,
                areaCode: isAddOrEdit.value
                    ? formState.value.areaCode
                    : props.selectData.code[props.selectData.code.length - 1],
                remark: '',
                mapImage,
            };
            if (isAddOrEdit.value) {
                params.id = formState.value.id;
            }
            let res = isAddOrEdit.value ? await updateDryRain(params) : await addDryRain(params);
            if (res.code == 200 && res.data) {
                ElMessage.success('提交成功');
                acidFormRef.value.resetFields();
                router.go(-1);
            } else {
                // ElMessage.error(res.msg);
            }
        } catch (error) {
            console.log('报错', error);
        }
    };
    // 获取详情
    const getAcidRainDetail = async () => {
        try {
            let id = route.query.id;
            let res = await getDryRainDetail(id);
            if (res.code == 200 && res.data) {
                let {
                    dataType,
                    minAcidRainValue,
                    maxAcidRainValue,
                    ph56SamplesNum,
                    precipitationSamplesNum,
                    remark,
                    id,
                    areaCode,
                } = res.data;
                formState.value.id = id;
                formState.value.dataType = dataType;
                formState.value.remark = remark;
                formState.value.number.minAcidRainValue = minAcidRainValue;
                formState.value.number.maxAcidRainValue = maxAcidRainValue;
                formState.value.ph56SamplesNum = ph56SamplesNum;
                formState.value.precipitationSamplesNum = precipitationSamplesNum;
                formState.value.areaCode = areaCode;
                formState.value.thunderMap = [
                    {
                        data: [res.data.mapImage],
                        fileName: res.data.mapImage.fileName,
                    },
                ];
                editSelectData.value.provice = res.data.areaName;
            }
        } catch (error) {}
    };
</script>
<style scoped lang="scss">
  @import './add.scss';
</style>
