<template>
    <div class="add-current-geology">
        <linkage
            v-if="!route.query.id"
            ref="linkageRef"
            @selectAddress="getSelectAddress"
            class="linkage"
        ></linkage>
        <!-- <linkage ref="linkageRef" @selectAddress="getSelectAddress" class="linkage"></linkage> -->
        <div class="add-geology-right">
            <CommonAddDataHeader :selectData="selectData"></CommonAddDataHeader>
            <div class="add-geology-right-content">
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
                    @finish="onFinish"
                >
                    <a-form-item
                        name="suitRange"
                        :rules="[{ required: true, ElMessage: '请选择范围指定' }]"
                    >
                        <template #label>
                            <span class="self-label">范围指定</span>
                        </template>
                        <a-radio-group v-model:value="formState.suitRange" name="radioGroup">
                            <a-radio :value="1">全城通用</a-radio>
                            <a-radio :value="2">拐点坐标</a-radio>
                        </a-radio-group>
                    </a-form-item>
                    <!-- <a-form-item
                        name="rangeFile"
                        :rules="[
                            {
                                required: true,
                                ElMessage: '请上传已填写的模板数据',
                                trigger: ['blur'],
                            },
                        ]"
                        v-if="formState.suitRange == 2"
                        style="margin-top: -20px"
                    > -->
                    <a-form-item
                        name="rangeFile"
                        v-if="formState.suitRange == 2"
                        style="margin-top: -20px"
                        :rules="[
                            {
                                required: true,
                                ElMessage: '请上传拐点坐标文件附件',
                                trigger: ['blur'],
                            },
                        ]"
                    >
                        <p class="tip-download"
                            >点击这里先
                            <a
                                href="javascript:;"
                                @click.stop="
                                    downLoadFile(
                                        templatePath['geologyRegion']
                                    )
                                "
                                >下载导入模板.xlsx</a
                            ></p
                        >
                        <Upload
                            ref="pointLocationRef"
                            :isImmediatelyUpload="false"
                            v-model:defaultFiles="formState.rangeFile"
                            :fileTypes="'xlsx'"
                            :maxCount="1"
                            fileTypeMessage="目前仅支持 xlsx 格式"
                            @upFileList="(val) => getUploadRangeFile(val)"
                        >
                            <template #tip>
                                <div class="tip">上传已填写模板数据</div>
                            </template>
                        </Upload>
                    </a-form-item>
                    <ul v-if="pointErrorInfos.length" class="pointErrorInfosBox">
                        <span>
                            <iconpark-icon name="jinggao"></iconpark-icon>
                            导入数据存在以下异常，请修正后重新上传
                        </span>
                        <li v-for="item in pointErrorInfos">
                            {{ item }}
                        </li>
                    </ul>
                    <a-form-item
                        name="geologyFileCondition"
                        :rules="[
                            { required: true, ElMessage: '请上传地勘报告附件', trigger: ['blur'] },
                        ]"
                    >
                        <template #label>
                            <span class="self-label">地勘报告附件</span>
                        </template>
                        <Upload
                            v-model:defaultFiles="formState.geologyFileCondition"
                            :fileTypes="fileTypes"
                            :fileSize="200"
                            :maxCount="1"
                            fileTypeMessage="目前仅支持 doc、docx、pdf 格式"
                            fileSizeMessage="文件最大200M"
                            @upFileList="(val) => getUploadFile(val, 3)"
                        >
                            <template #tip>
                                <div class="tip"
                                    >目前支持doc、docx、pdf格式<br />
                                    pdf需非拍摄、扫描的纯照片/图片格式，最多上传1个文件，文件最大200M</div
                                >
                            </template>
                        </Upload>
                    </a-form-item>
                    <h4 class="content-title">
                        <img src="@/assets/img/user/detail-title.png" alt="" />
                        <span>岩土层厚度及承载力特征【承载力特征值fak（kPa）不能为0】</span>
                    </h4>
                    <SoilProperty
                        ref="soilPropertyRef"
                        :detailData="geologyRockSoilRespList"
                    ></SoilProperty>
                    <h4 class="content-title">
                        <img src="@/assets/img/user/detail-title.png" alt="" />
                        <span>地震参数信息</span>
                    </h4>
                    <a-row>
                        <a-col :span="11">
                            <a-form-item
                                name="epa"
                                :rules="[
                                    {
                                        required: true,
                                        ElMessage: '请输入场址地震动峰值加速度',
                                    },
                                ]"
                            >
                                <template #label>
                                    <span class="self-label">场址地震动峰值加速度</span>
                                </template>
                                <a-input
                                    placeholder="请输入"
                                    v-model:value="formState.epa"
                                    suffix="g"
                                ></a-input>
                            </a-form-item>
                        </a-col>
                        <a-col :span="11" :offset="2"
                            ><a-form-item
                                name="ld"
                                :rules="[
                                    {
                                        required: true,
                                        ElMessage: '请输入场址地震基本烈度',
                                        trigger: 'blur',
                                    },
                                ]"
                            >
                                <template #label>
                                    <span class="self-label">场址地震基本烈度</span>
                                </template>
                                <select-search
                                    :width="'100%'"
                                    placeholder="请选择"
                                    v-model:selectValue="formState.ld"
                                    :options="[
                                        {
                                            value: 1,
                                            label: 'Ⅰ',
                                        },
                                        {
                                            value: 2,
                                            label: 'Ⅱ',
                                        },
                                        {
                                            value: 3,
                                            label: 'Ⅲ',
                                        },
                                        {
                                            value: 4,
                                            label: 'Ⅳ',
                                        },
                                        {
                                            value: 5,
                                            label: 'Ⅴ',
                                        },
                                        {
                                            value: 6,
                                            label: 'Ⅵ',
                                        },
                                        {
                                            value: 7,
                                            label: 'Ⅶ',
                                        },
                                        {
                                            value: 8,
                                            label: 'Ⅷ',
                                        },
                                        {
                                            value: 9,
                                            label: 'Ⅸ',
                                        },
                                        {
                                            value: 10,
                                            label: 'Ⅹ',
                                        },
                                        {
                                            value: 11,
                                            label: 'Ⅺ',
                                        },
                                        {
                                            value: 12,
                                            label: 'Ⅻ',
                                        },
                                    ]"
                                ></select-search>
                            </a-form-item>
                        </a-col>
                    </a-row>
                    <a-row>
                        <a-col :span="11">
                            <a-form-item
                                name="tg"
                                :rules="[
                                    {
                                        required: true,
                                        ElMessage: '请输入地震动反应谱特征周期',
                                        trigger: 'blur',
                                    },
                                ]"
                            >
                                <template #label>
                                    <span class="self-label">地震动反应谱特征周期</span>
                                </template>
                                <a-input
                                    placeholder="请输入"
                                    v-model:value="formState.tg"
                                    suffix="s"
                                ></a-input>
                            </a-form-item>
                        </a-col>
                        <a-col :span="11" :offset="2">
                            <a-form-item
                                name="siteClassification"
                                :rules="[
                                    {
                                        required: true,
                                        ElMessage: '请选择场地类别',
                                        trigger: 'blur',
                                    },
                                ]"
                            >
                                <template #label>
                                    <span class="self-label">场地类别</span>
                                </template>
                                <select-search
                                    :width="'100%'"
                                    placeholder="请选择"
                                    v-model:selectValue="formState.siteClassification"
                                    :options="siteClassificationOption"
                                ></select-search>
                            </a-form-item>
                        </a-col>
                    </a-row>
                    <a-row>
                        <a-col :span="11">
                            <a-form-item
                                name="earthquakeGroup"
                                :rules="[
                                    {
                                        required: true,
                                        ElMessage: '请选择设置地震分组',
                                        trigger: 'blur',
                                    },
                                ]"
                            >
                                <template #label>
                                    <span class="self-label">设置地震分组</span>
                                </template>
                                <select-search
                                    :width="'100%'"
                                    placeholder="请选择"
                                    v-model:selectValue="formState.earthquakeGroup"
                                    :options="earthquakeOptions"
                                ></select-search>
                            </a-form-item>
                        </a-col>
                    </a-row>
                    <h4 class="content-title">
                        <img src="@/assets/img/user/detail-title.png" alt="" />
                        <span>关键提取信息</span>
                    </h4>
                    <a-row>
                        <a-col :span="11"
                            ><a-form-item
                                name="waterSoilErosion"
                                :rules="[
                                    {
                                        required: true,
                                        trigger: 'blur',
                                        validator: validatorWaterSoilErosion,
                                    },
                                ]"
                            >
                                <template #label>
                                    <span class="self-label">水土腐蚀性</span>
                                </template>
                                <select-search
                                    :width="'100%'"
                                    placeholder="请选择"
                                    v-model:selectValue="formState.waterSoilErosion"
                                    :options="waterSoilErosionOption"
                                ></select-search>
                            </a-form-item>
                        </a-col>
                        <a-col :span="11" :offset="2"
                            ><a-form-item
                                name="handleKeyword"
                                class="noRequiredFormItem"
                                :rules="[
                                    {
                                        required: false,
                                        ElMessage: '请选择地基处理关键字',
                                        trigger: 'blur',
                                    },
                                ]"
                            >
                                <template #label>
                                    <span class="self-label">地基处理关键字</span>
                                </template>
                                <select-search
                                    :width="'100%'"
                                    placeholder="请选择"
                                    v-model:selectValue="formState.handleKeyword"
                                    :options="[
                                        {
                                            label: '岩溶',
                                            value: 1,
                                        },
                                        {
                                            label: '湿陷性黄土',
                                            value: 2,
                                        },
                                    ]"
                                ></select-search>
                            </a-form-item>
                        </a-col>
                    </a-row>
                    <a-row>
                        <a-col :span="11"
                            ><a-form-item
                                name="groundwaterDepth"
                                :rules="[
                                    {
                                        required: true,
                                        ElMessage: '请输入地下水埋深',
                                        trigger: 'blur',
                                    },
                                ]"
                            >
                                <template #label>
                                    <span class="self-label">地下水埋深</span>
                                </template>
                                <a-input
                                    placeholder="请输入"
                                    v-model:value="formState.groundwaterDepth"
                                    suffix="m"
                                ></a-input>
                            </a-form-item>
                        </a-col>
                        <a-col :span="11" :offset="2"
                            ><a-form-item name="permafrostDepth" class="noRequiredFormItem">
                                <template #label>
                                    <span class="self-label">冻土深度</span>
                                </template>
                                <a-input
                                    placeholder="请输入"
                                    v-model:value="formState.permafrostDepth"
                                    suffix="m"
                                ></a-input>
                            </a-form-item>
                        </a-col>
                        <a-col :span="11"
                            ><a-form-item
                                name="floodWaterLevel"
                                class="noRequiredFormItem"
                                :rules="[
                                    {
                                        required: false,
                                        ElMessage: '请输入洪水水位',
                                        trigger: 'blur',
                                    },
                                ]"
                            >
                                <template #label>
                                    <span class="self-label">洪水水位</span>
                                </template>
                                <a-input
                                    placeholder="请输入"
                                    v-model:value="formState.floodWaterLevel"
                                    suffix="m"
                                ></a-input>
                            </a-form-item>
                        </a-col>
                    </a-row>
                    <a-row>
                        <h4 class="content-title require-item">
                            <img src="@/assets/img/user/detail-title.png" alt="" />
                            <span>持力层描述</span>
                        </h4>
                        <a-col :span="24">
                            <a-form-item
                                name="bearingStratumInfo"
                                :rules="[
                                    { required: true, ElMessage: '请输入描述', trigger: 'blur' },
                                ]"
                            >
                                <ckeditor
                                    @blur="getHtml"
                                    ref="powerEditors"
                                    v-model:dataHtml="formState.bearingStratumInfo"
                                ></ckeditor>
                            </a-form-item>
                        </a-col>
                    </a-row>
                    <h4 class="content-title require-item">
                        <img src="@/assets/img/user/detail-title.png" alt="" />
                        <span
                            >场地条件信息（${3.1}${3.1.1}）${场区区域范围}
                            改为${project_township_areas} ${风电场地形类型}改为
                            ${project_farm_terrain}
                            ${场区海拔高度}改为${project_field_elevation_range}
                        </span>
                    </h4>
                    <a-form-item
                        name="regionalHydrologyInfo"
                        :rules="[{ required: false, ElMessage: '请输入描述' }]"
                    >
                        <ckeditor v-model:dataHtml="formState.regionalHydrologyInfo"></ckeditor>
                    </a-form-item>
                    <h4 class="content-title require-item">
                        <img src="@/assets/img/user/detail-title.png" alt="" />
                        <span>场区地质条件与评价（${3.2}${3.2.1}）</span>
                    </h4>
                    <a-form-item
                        name="regionalGeologyConditionEvaluation"
                        :rules="[{ required: true, ElMessage: '请输入描述' }]"
                    >
                        <ckeditor
                            v-model:dataHtml="formState.regionalGeologyConditionEvaluation"
                        ></ckeditor>
                    </a-form-item>
                    <h4 class="content-title require-item">
                        <img src="@/assets/img/user/detail-title.png" alt="" />
                        <span>区域地质信息（${3.3}${3.3.1}）</span>
                    </h4>
                    <a-form-item
                        name="regionalGeologyInfo"
                        :rules="[{ required: true, ElMessage: '请输入描述', trigger: 'blur' }]"
                    >
                        <ckeditor
                            @blur="getHtml"
                            ref="powerEditors"
                            v-model:dataHtml="formState.regionalGeologyInfo"
                        ></ckeditor>
                    </a-form-item>

                    <h4 class="content-title require-item">
                        <img src="@/assets/img/user/detail-title.png" alt="" />
                        <span>结论（无标题）</span>
                    </h4>
                    <a-form-item
                        name="conclusion"
                        :rules="[{ required: true, ElMessage: '请输入描述' }]"
                    >
                        <ckeditor v-model:dataHtml="formState.conclusion"></ckeditor>
                    </a-form-item>
                    <h4 class="content-title">
                        <img src="@/assets/img/user/detail-title.png" alt="" />
                        <span>评价（无标题）</span>
                    </h4>
                    <a-form-item
                        name="evaluation"
                        :rules="[{ required: false, ElMessage: '请输入描述' }]"
                    >
                        <ckeditor v-model:dataHtml="formState.evaluation"></ckeditor>
                    </a-form-item>

                    <a-form-item style="text-align: center">
                        <a-button class="handle-button" @click="resetForm"> 取消 </a-button>
                        <a-button class="handle-button" type="primary" @click="submitForm"
                            >保存</a-button
                        >
                    </a-form-item>
                </a-form>
            </div>
        </div>
    </div>
</template>

<script setup>
    import { ref, onMounted, onUnmounted, nextTick } from 'vue';
    import SelectSearch from '@/components/selectSearch/SelectSearch.vue';
    import { useRoute, useRouter } from 'vue-router';
    import linkage from '@/components/linkage/linkage.vue';
    import CommonAddDataHeader from '@/components/linkage/CommonAddDataHeader.vue';
    import Upload from '@/components/upload/Upload.vue';
    import ckeditor from '@/components/editor/Editor.vue';
    import SoilProperty from './components/soilProperty.vue';
    import { createGeology, getGeologyDetail, updateGeology } from '@/api/modules/geology.js';
    import { useOssUpload } from '@/components/ossClient/index';
    import { ElMessage } from 'element-plus'
    import { checkPointsExcel } from '@/api/modules/commonDataManage';
    import { ossClientInfo, templatePath } from '@/assets/js/static';
    const obsUpload = useOssUpload();
    const route = useRoute();
    const router = useRouter();
    const pointLocationRef = ref(null);
    const soilPropertyRef = ref(null);
    const siteClassificationOption = [
        {
            value: 'I0',
            label: 'I0',
        },
        {
            value: 'I1',
            label: 'I1',
        },
        {
            value: 'II',
            label: 'II',
        },
        {
            value: 'III',
            label: 'III',
        },
        {
            value: 'IV',
            label: 'IV',
        },
    ];
    const waterSoilErosionOption = [
        {
            value: 0,
            label: '微腐蚀',
        },
        {
            value: 1,
            label: '弱腐蚀',
        },
        // {
        //     value: 2,
        //     label: '一般腐蚀',
        // },
        {
            value: 2,
            label: '强腐蚀',
        },
    ];
    // 岩土层厚度表格数据
    const geologyRockSoilRespList = ref([{}]);
    // 拐点坐标解析出来的数据
    const pointFileData = ref([]);
    // 拐点坐标解析错误的数据
    const pointErrorInfos = ref([]);
    // 验证水土腐蚀性
    const validatorWaterSoilErosion = async (_rule, value) => {
        if (!value && value !== 0) {
            return Promise.reject('请选择水土腐蚀性');
        } else {
            return Promise.resolve();
        }
    };
    const earthquakeOptions = [
        {
            value: '1',
            label: '第一组',
        },
        {
            value: '2',
            label: '第二组',
        },
        {
            value: '3',
            label: '第三组',
        },
    ];
    const selectData = ref({
        provice: '',
        code: [],
        num: 12,
        noNum: 0,
    });
    const rangeFileId = ref(''); // 用于修改时候拐点坐标文件ID存储
    const geologyFileId = ref(''); // 用于修改时候地勘报告文件ID存储
    // 省市区联动元素
    const linkageRef = ref(null);
    onMounted(() => {
        // 设置obs文件上传路径
        sessionStorage.setItem('obsPath', 'dz/');
        // editorFormatPath();
        // editorFormatFullPath('99');
        if (!route.query.id) {
            // uniqueIdentificationVal.value = uniqueIdentification();
            // console.log(uniqueIdentificationVal.value);
        } else {
            // 编辑逻辑，先请求详情接口回显
            getGeologyDetail(route.query.id).then((res) => {
                console.log(res);
                if (res && res.code == 200) {
                    // 省市区左侧回显
                    const addressCode = [];
                    // if (res.data.addressCode) {
                    //     res.data.addressCode.provinceCode &&
                    //         addressCode.push(res.data.addressCode.provinceCode);
                    //     res.data.addressCode.cityCode &&
                    //         addressCode.push(res.data.addressCode.cityCode);
                    //     res.data.addressCode.districtCode &&
                    //         addressCode.push(res.data.addressCode.districtCode);
                    //     console.log(addressCode, '----地址code');
                    //     linkageRef.value.echo(addressCode);
                    // } else {
                    //     // 省数据没有addressCode情况
                    //     linkageRef.value.echo([res.data.affiliationCode]);
                    // }
                    if (res.data.addressCode) {
                        let {
                            provinceCode,
                            provinceName,
                            cityCode,
                            cityName,
                            districtCode,
                            districtName,
                        } = res.data?.addressCode || {};
                        let provinceObj = {
                            areaCode: provinceCode,
                            areaName: provinceName,
                        };
                        let cityObj = {
                            areaCode: cityCode,
                            areaName: cityName,
                        };
                        let districtObj = {
                            areaCode: districtCode,
                            areaName: districtName,
                        };

                        let linkAreaCode;

                        switch (res.data.areaLevel) {
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
                        // linkageRef.value.echo(linkAreaCode);
                        nextTick(() => {
                            getSelectAddress({
                                data: linkAreaCode,
                                type: res.data.areaLevel - 1,
                            });
                        });
                        console.log(linkAreaCode);
                    }

                    // 回显数据
                    const originResData = { ...res.data };
                    // 处理富文本字段后台返回null，前端会报错情况
                    originResData.regionalGeologyConditionEvaluation = '';
                    originResData.regionalGeologyInfo = '';
                    originResData.regionalHydrologyInfo = '';
                    originResData.conclusion = '';
                    originResData.evaluation = '';
                    originResData.bearingStratumInfo = '';

                    formState.value = { ...originResData };
                    // 拐点数据json格式转换
                    res.data.suitRange == 2 &&
                        (formState.value.locations = JSON.parse(
                            res.data.locations ? res.data.locations : '[]',
                        ));
                    geologyRockSoilRespList.value = res.data.geologyRockSoilRespList || [];
                    // 文件过滤函数
                    const filterFile = (fileType) => {
                        if (
                            res.data.geologyFileRespList &&
                            res.data.geologyFileRespList.length > 0
                        ) {
                            return res.data.geologyFileRespList.filter(
                                (ele) => ele.fileType == fileType,
                            );
                        } else {
                            return [];
                        }
                    };
                    // 回显拐点文件
                    formState.value.rangeFile = filterFile(6);
                    // 回显地勘报告
                    formState.value.geologyFileCondition = filterFile(3);

                    if (formState.value.rangeFile.length) {
                        rangeFileId.value = formState.value.rangeFile[0].id;
                    }
                    if (formState.value.geologyFileCondition.length) {
                        geologyFileId.value = formState.value.geologyFileCondition[0].id;
                        console.log(geologyFileId.value);
                    }
                    if (formState.value.handleKeyword == 0) {
                        formState.value.handleKeyword = null;
                    }
                    formState.value.regionalGeologyConditionEvaluation = res.data
                        .regionalGeologyConditionEvaluation
                        ? res.data.regionalGeologyConditionEvaluation
                        : '';
                    formState.value.regionalGeologyInfo = res.data.regionalGeologyInfo
                        ? res.data.regionalGeologyInfo
                        : '';
                    formState.value.regionalHydrologyInfo = res.data.regionalHydrologyInfo
                        ? res.data.regionalHydrologyInfo
                        : '';
                    formState.value.conclusion = res.data.conclusion ? res.data.conclusion : '';
                    formState.value.evaluation = res.data.evaluation ? res.data.evaluation : '';
                    formState.value.bearingStratumInfo =  res.data.bearingStratumInfo ? res.data.bearingStratumInfo : '';

                    // console.log(formState.value);
                }
            });
        }
    });
    onUnmounted(() => {
        // 设置obs文件上传路径
        sessionStorage.removeItem('obsPath');
    });

    const powerEditors = ref(null);
    const getHtml = (value) => {
        // console.log(value);
        // const text = powerEditors.value.editorRef.value.getText();
        // console.log(text);
    };
    const fileTypes = 'pdf,doc,docx';
    const currentPowerFormRef = ref(null);
    const formState = ref({
        suitRange: 1,
        rangeFile: [],
        geologyFileCondition: [],

        regionalGeologyInfo: '', // 区域地址信息
        conclusion: '', // 结论
        evaluation: '', // 评价
        regionalGeologyConditionEvaluation: '', // 场区地质条件与评价
        regionalHydrologyInfo: '', // 区域水文情况
        // conclusionEvaluation: '', // 结论评价

        epa: '', // 场址地震动峰值加速度 epa
        ld: '', // 场址地震基本烈度
        tg: '', // 地震动反应谱特征周期
        siteClassification: null, // 场地类别
        earthquakeGroup: null, // 地震分组

        bearingStratumInfo: '', // 持力层描述
        waterSoilErosion: null, // 水土腐蚀 0,1,2,3
        handleKeyword: 0, // 地基处理关键字
        groundwaterDepth: '', // 地下水埋深
        locations: [], // 拐点坐标文件解析出来的数据
    });
    // 获取文件
    const getUploadFile = async (val, type) => {
        // console.log(val);
        if (type == 3) {
            formState.value.geologyFileCondition = [val];
            currentPowerFormRef.value.validateFields(['geologyFileCondition']);
        }

        console.log('--或缺文件--', val);

        const formData = new FormData();
        formData.append('fileType', type);
        formData.append('fileName', val.fileName || val.name);
        formData.append('filePath', val.filePath || '');
        formData.append('suffix', val.suffix || 'xlsx');
        formData.append('geologyId', '');
    };
    // 上传拐点坐标文件
    const getUploadRangeFile = async (val) => {
        const file = val;
        // 拿给后台验证格式
        const formData = new FormData();
        formData.append('file', val);
        try {
            const data = await checkPointsExcel(formData);
            if (data && data.code === 200) {
                pointErrorInfos.value = [];
                if (data.data && data.data.length) {
                    pointFileData.value = data.data;
                    // 上传至华为云获取文件线上路径
                    let uploadResult = await obsUpload.uploadFile(file, 'dz/');
                    const fileInfos = {
                        fileName: file.name,
                        filePath: uploadResult.obsPath,
                        suffix: file.name.split('.')[file.name.split('.').length - 1],
                        fileType: 6,
                    };
                    formState.value.locations = data.data;
                    formState.value.rangeFile = [fileInfos];
                    currentPowerFormRef.value.validateFields(['rangeFile']);
                }
            } else {
                // 接口失败情况下
                pointLocationRef.value.deleteItem();
                // 存在校验信息情况下
                if (data.msg) {
                    pointErrorInfos.value = data.msg.split('/n');
                }
                currentPowerFormRef.value.validateFields(['rangeFile']);
            }
        } catch (error) {
            // pointAreaLoading.value = false;
        }
    };
    const powerEditor = ref(null);

    // 重置表单
    const resetForm = () => {
        currentPowerFormRef.value.resetFields();
        // powerEditor.value.editorRef.clear()
        router.go(-1);
        console.log('--重置表单--', formState.value);
    };
    const scrollToFirstError = () => {
        document
            .querySelector('.ant-form-item-has-error')
            ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };
    // 提交表单
    const submitForm = () => {
        // console.log('--提交表单--', formState.value);
        const geologyFileCondition = { ...formState.value.geologyFileCondition[0] };
        geologyFileCondition.fileType = 3;
        if (route.query.id) {
            geologyFileCondition.id = geologyFileId.value;
        }
        const filesData = [geologyFileCondition];
        if (formState.value.suitRange == 2) {
            if (route.query.id) {
                console.log(formState.value.rangeFile);
                if (!formState.value.rangeFile.length) {
                    ElMessage.error('请上传拐点坐标文件');
                    return false;
                }
                formState.value.rangeFile[0].id = rangeFileId.value;
            }
            filesData.push(...formState.value.rangeFile);
        } else {
            formState.value.locations = [];
        }
        currentPowerFormRef.value
            .validateFields()
            .then((values) => {
                if (
                    soilPropertyRef.value.formatGetData().length &&
                    !soilPropertyRef.value.errorMsg
                ) {
                    const soilPropertyData = soilPropertyRef.value.formatGetData();
                    const soilProperty = soilPropertyData.map((item) => {
                        const objs = {
                            ...item,
                            geologyId: route.query.id,
                        };
                        delete objs.id;
                        return objs;
                    });
                    const params = {
                        affiliationCode: selectData.value.code[selectData.value.code.length - 1], // 所属区域code
                        areaLevel: selectData.value.code.length, // 1省2市3区
                        bearingStratumInfo: formState.value.bearingStratumInfo, // 持力层描述
                        centerPoint: '', // 中心点经纬度
                        // conclusionEvaluation: editorFormatPath(
                        //     formState.value.conclusionEvaluation,
                        // ), // 结论评价
                        // conclusionEvaluation:
                        //     formState.value.conclusionEvaluation
                        // , // 结论评价
                        evaluation: formState.value.evaluation, // 评价
                        conclusion: formState.value.conclusion, // 建议
                        districtCode:
                            selectData.value.code.length == 1
                                ? 0
                                : selectData.value.code[selectData.value.code.length - 2], // 上级城市机构code 省级填写0
                        earthquakeGroup: formState.value.earthquakeGroup, // 地震分组 第一组第二组第三组
                        epa: formState.value.epa, // 场址地震动峰值加速度 epa
                        geologyCode: route.query.id ? formState.value.geologyCode : '', // 地质数据标号
                        geologyFileCondition: JSON.stringify(filesData),
                        geologyRockSoilsReq: JSON.stringify(
                            route.query.id ? soilProperty : soilPropertyRef.value.formatGetData(),
                        ), // 岩土层特征表格数据
                        groundwaterDepth: formState.value.groundwaterDepth, // 地下水埋深
                        floodWaterLevel:
                            formState.value.floodWaterLevel || formState.value.floodWaterLevel == 0
                                ? formState.value.floodWaterLevel
                                : '', // 洪水水位
                        permafrostDepth:
                            formState.value.permafrostDepth || formState.value.permafrostDepth == 0
                                ? formState.value.permafrostDepth
                                : '', // 冻土深度
                        handleKeyword: formState.value.handleKeyword
                            ? formState.value.handleKeyword
                            : 0, // 地基处理关键字
                        ld: formState.value.ld, // 场址地震基本烈
                        id: route.query.id ? route.query.id : '', // 主键id
                        locations:
                            typeof formState.value.locations == 'string'
                                ? formState.value.locations
                                : JSON.stringify(formState.value.locations), // 拐点坐标
                        regionalGeologyConditionEvaluation:
                            formState.value.regionalGeologyConditionEvaluation, // 地质条件评价
                        // regionalGeologyConditionEvaluation: editorFormatPath(
                        //     formState.value.regionalGeologyConditionEvaluation,
                        // ), // 地质条件评价
                        // regionalGeologyInfo: editorFormatPath(formState.value.regionalGeologyInfo), // 区域地址信息
                        // regionalHydrologyInfo: editorFormatPath(
                        //     formState.value.regionalHydrologyInfo,
                        // ), // 区域水文情况
                        regionalGeologyInfo: formState.value.regionalGeologyInfo, // 区域地址信息
                        regionalHydrologyInfo: formState.value.regionalHydrologyInfo, // 区域水文情况
                        siteClassification: formState.value.siteClassification, // 场地类别
                        source: formState.value.source ? formState.value.source : 1, // 数据来源 1后台数据2用户数据(运营端新增的只能是后台数据)
                        status:
                            route.query.sourceType == 2
                                ? route.query.status == 4
                                    ? 5
                                    : route.query.status
                                : 2, // 数据状态 1系统解析2已经核对 5待核对(列表过来的核对操作需要改状态为5，编辑操作需要改状态为2)
                        suitRange: formState.value.suitRange, // 范围指定 1全域通用 2拐点坐标
                        tg: formState.value.tg, // 地��动反应��特征周期
                        waterSoilErosion: formState.value.waterSoilErosion, // 水土腐蚀 0,1,2,3
                    };
                    console.log('参数----', params);
                    // debugger;
                    if (route.query.id) {
                        // 更新编辑操作
                        updateGeology(params).then((res) => {
                            if (res && res.code == 200) {
                                ElMessage.success('操作成功!');
                                resetForm();
                                geologyRockSoilRespList.value = [{}];
                                if (route.query.status == 4) {
                                    sessionStorage.setItem('reGetListData', true);
                                }
                                router.push({
                                    path: '/geology/list',
                                });
                            }
                        });
                    } else {
                        // 新增操作
                        createGeology(params)
                            .then((res) => {
                                if (res && res.code === 200) {
                                    ElMessage.success('操作成功!');
                                    resetForm();
                                    geologyRockSoilRespList.value = [{}];
                                }
                            })
                            .catch((e) => {});
                    }
                } else {
                    ElMessage.error('请完整输入岩土层厚度及承载力特征');
                }
            })
            .catch((e) => {
                console.log(e);
                scrollToFirstError();
                // currentPowerFormRef.value.scrollToField(e.errorFields[0]['name'])
            });
    };
    const onFinish = () => {
        console.log('表单', formState.value);
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
    };
    // 下载文件
    const downLoadFile = (path) => {
        window.open(path, '_blank');
    };
</script>
<style scoped lang="scss">
  @import './css/geologyEdit.scss';
    .noRequiredFormItem {
        :deep(.self-label) {
            &::before {
                content: '' !important;
            }
        }
    }
</style>
