<template>
    <div class="add-power-right">
        <CommonAddDataHeader :selectData="selectData"></CommonAddDataHeader>
        <div class="add-power-right-content">
            <h4 class="content-title">
                <img src="@/assets/img/user/detail-title.png" alt="" />
                项目基本信息
            </h4>
            <a-form
                ref="currentPowerFormRef"
                name="advanced_search"
                :rules="rules"
                class="ant-advanced-search-form"
                layout="vertical"
                :model="formState"
            >
                <a-row>
                    <a-col :span="12">
                        <a-form-item name="range" label="数据格式" @change="getModeType">
                            <a-radio-group v-model:value="formState.range" name="radioGroup">
                                <a-radio value="1">标准数据</a-radio>
                                <a-radio value="2">矢量地图类数据</a-radio>
                            </a-radio-group>
                        </a-form-item>
                    </a-col>
                    <template v-if="formState.range == 1">
                        <a-col :span="12">
                            <a-form-item
                                label="数值范围"
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
                                            @mouseover="mouseover"
                                            @mouseout="mouseout"
                                            @focus="(isActive = true), (isFocus = true)"
                                            @blur="blur"
                                            :controls="false"
                                            placeholder="最小值"
                                            :min="0"
                                            v-model:value="formState.number.min"
                                        ></a-input-number>
                                    </a-form-item>
                                    <span class="custom-icon">~</span>
                                    <a-form-item class="range-number-input">
                                        <a-input-number
                                            style="width: 100%"
                                            @mouseover="mouseover"
                                            @mouseout="mouseout"
                                            @focus="(isActive = true), (isFocus = true)"
                                            @blur="blur"
                                            :controls="false"
                                            placeholder="最大值"
                                            v-model:value="formState.number.max"
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
                                                            <template v-if="formState.range == 1">
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
                            <a-col :span="24">
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
                                                                    v-model:value.trim="
                                                                        item.fileName
                                                                    "
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
                            </a-col>
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
    import {
        temperaturePattern,
        DATA_SOURCE_FILE_TYPES,
        MAP_FILE_TYPES,
        VECTOR_MAP_FILE_TYPES,
    } from './add';

    const route = useRoute();

    const router = useRouter();

    const selectData = ref({
        provice: '天津',
        num: 12,
        noNum: 10,
    });

    const currentPowerFormRef = ref(null);

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
        currentPowerFormRef.value.validateFields(['number']);
    };
    const validatorNumber = (rule, value) => {
        if (value.max != '' && value.min != '' && value.max >= value.min) {
            isError.value = false;
            return Promise.resolve();
        } else {
            isError.value = true;
            return Promise.reject('请输入正确数值范围！');
        }
    };
    const validateFileName = (rule, value, callback) => {
        console.log('rule', rule);
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
        range: '1',
        number: {
            min: '',
            max: '',
        },
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
    const labelTitile = ref('温度分布图');
    const uploadFileTip = ref('说明：文件格式需为JPG、PNG，上限1个，文件最大5M');
    const upFileSize = ref(5);
    const fileTypeMessage = ref('目前支持 JPG、PNG 格式');
    const fileTypes = ref(MAP_FILE_TYPES);
    const placeholderTip = ref('请输入图片名称');
    const getModeType = (val) => {
        currentPowerFormRef.value.resetFields();
        formState.value.range = val.target.value;
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
        val.target.value == '1' ? (vectorRequired.value = false) : (vectorRequired.value = true);
        val.target.value == '1'
            ? (labelTitile.value = '温度分布图')
            : (labelTitile.value = '数据文件');
        val.target.value == '1'
            ? (uploadFileTip.value = '说明：文件格式需为JPG、PNG，上限1个，文件最大5M')
            : (uploadFileTip.value = '说明：格式需为tif、shp 矢量数据格式，上限1个，最大500M');
        val.target.value == '1' ? (upFileSize.value = 5) : (upFileSize.value = 500);
        val.target.value == '1'
            ? (fileTypeMessage.value = '目前支持 JPG、PNG 格式')
            : (fileTypeMessage.value = '目前支持 tif、shp矢量数据格式');
        val.target.value == '1'
            ? (fileTypes.value = MAP_FILE_TYPES)
            : (fileTypes.value = VECTOR_MAP_FILE_TYPES);
        val.target.value == '1'
            ? (placeholderTip.value = '请输入图片名称')
            : (placeholderTip.value = '请输入数据文件名称');
    };
    const saveIndex = (e, index, type) => {
        if (type == 'thunder') {
            currentPowerFormRef.value.validateFields([['thunderMap', index]]);
        } else {
            currentPowerFormRef.value.validateFields([['dataSources', index]]);
        }
    };
    const rules = {
        range: [{ required: true, ElMessage: '请选择', trigger: 'change' }],
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
            formState.value.thunderMap[index]['data'] = val;

            currentPowerFormRef.value.validateFields([['thunderMap', index]]);
        } else {
            formState.value.dataSources[index]['data'] = val;
            currentPowerFormRef.value.validateFields([['dataSources', index]]);
        }
    };

    // 重置表单
    const resetForm = () => {
        currentPowerFormRef.value.resetFields();
        router.go(-1);
    };
    onMounted(() => {});
    const checkRequire = (vla, name) => {
        currentPowerFormRef.value.validateFields([name]);
    };
    const saveData = () => {
        currentPowerFormRef.value
            .validateFields()
            .then(() => {
                // console.log('保存数据', formState.value);
            })
            .catch((err) => {
                console.log('err', err);
            });
    };
</script>
<style scoped lang="scss">
  @import './add.scss';
</style>
