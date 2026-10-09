<template>
    <div class="electrical-handle-template">
        <a-form
            ref="formRef"
            name="advanced_search"
            class="ant-advanced-search-form"
            :model="formState"
            autocomplete="off"
            :rules="rules"
            :labelCol="{
                style: {
                    width: '130px',
                    textAlign: 'left',
                },
            }"
            @finish="onFinish"
        >
            <h4 class="content-title">
                <img src="@/assets/img/user/detail-title.png" alt="" />
                类型
            </h4>
            <a-row :gutter="24">
                <a-col :span="24">
                    <a-form-item
                        :name="`useType`"
                        label="类型"
                        :rules="[{ required: true, ElMessage: 'input something' }]"
                    >
                        <a-radio-group
                            v-model:value="formState['useType']"
                            :options="customerUseOptions"
                        />
                    </a-form-item>
                </a-col>
            </a-row>
            <h4 class="content-title">
                <img src="@/assets/img/user/detail-title.png" alt="" />
                基本信息
            </h4>
            <a-row :gutter="24">
                <a-col :span="10">
                    <a-form-item
                        :name="`companyName`"
                        label="设备型号"
                        :rules="[{ required: true, ElMessage: '请输入设备型号' }]"
                    >
                        <a-input
                            v-model:value="formState['companyName']"
                            placeholder="请输入设备型号"
                        ></a-input>
                    </a-form-item>
                </a-col>
            <!-- </a-row>
            <a-row :gutter="24"> -->
                <a-col :span="10" v-if="formState['useType'] == 1">
                    <a-form-item
                        :name="`companyType`"
                        label="设备类型"
                        :rules="[{ required: true, trigger: 'change', ElMessage: '请选择客户类型' }]"
                    >
                        <a-select
                            ref="select"
                            v-model:value="formState['companyType']"
                            style="width: 100%; box-shadow: none !important"
                            placeholder="请选择设备类型"
                        >
                            <a-select-option v-for="item in []" :value="item.value">{{
                                item.label
                            }}</a-select-option>
                        </a-select>
                    </a-form-item>
                </a-col>
                <a-col :span="10" v-else>
                    <a-form-item
                        :name="`companyType`"
                        label="额定电压"
                        :rules="[{ required: true, trigger: 'change', ElMessage: '请选择客户类型' }]"
                    >
                        <a-input-number
                            style="width: 100%;"
                            v-model:value="formState['companyName']"
                            placeholder="请输入额定电压"
                            :step="0.001"
                            string-mode
                            :controls="false"
                            addon-after="kV"
                        ></a-input-number>
                    </a-form-item>
                </a-col>
            <!-- </a-row>
            <a-row :gutter="24"> -->
                <a-col :span="8" v-if="formState['useType'] == 1">
                    <a-form-item
                        :name="`companyName`"
                        label="箱变容量"
                        :rules="[{ required: true, ElMessage: '请输入设备型号' }]"
                    >
                    <a-input-number
                            style="width: 100%;"
                            v-model:value="formState['companyName']"
                            placeholder="请输入额定电压"
                            :step="0.001"
                            string-mode
                            :controls="false"
                            addon-after="kW"
                        ></a-input-number>
                    </a-form-item>
                </a-col>
                <a-col :span="8" v-else>
                    <a-form-item
                        :name="`companyName`"
                        label="额定容量"
                        :rules="[{ required: true, ElMessage: '请输入额定容量' }]"
                    >
                    <a-input-number
                            style="width: 100%;"
                            v-model:value="formState['companyName']"
                            placeholder="请输入额定电压"
                            :step="0.001"
                            string-mode
                            :controls="false"
                            addon-after="kW"
                        ></a-input-number>
                    </a-form-item>
                </a-col>
            </a-row>
            <a-row :gutter="24">
                <a-col :span="8">
                    <a-form-item
                        :name="`companyName`"
                        label="高压侧额定电压"
                        :rules="[{ required: true, ElMessage: '请输入设备型号' }]"
                    >
                    <a-input-number
                            style="width: 100%;"
                            v-model:value="formState['companyName']"
                            placeholder="请输入额定电压"
                            :step="0.001"
                            string-mode
                            :controls="false"
                            addon-after="kV"
                        ></a-input-number>
                    </a-form-item>
                </a-col>
            </a-row>
            <a-row :gutter="24">
                <a-col :span="8">
                    <a-form-item
                        :name="`companyName`"
                        label="低压侧额定电压"
                        :rules="[{ required: true, ElMessage: '请输入设备型号' }]"
                    >
                    <a-input-number
                            style="width: 100%;"
                            v-model:value="formState['companyName']"
                            placeholder="请输入额定电压"
                            :step="0.001"
                            string-mode
                            :controls="false"
                            addon-after="kV"
                        ></a-input-number>
                    </a-form-item>
                </a-col>
            </a-row>
            <a-row :gutter="24">
                <a-col :span="8">
                    <a-form-item
                        :name="`companyName`"
                        label="短路阻抗"
                        :rules="[{ required: true, ElMessage: '请输入设备型号' }]"
                    >
                    <a-input-number
                            style="width: 100%;"
                            v-model:value="formState['companyName']"
                            placeholder="请输入额定电压"
                            :step="0.001"
                            string-mode
                            :controls="false"
                            addon-after="%"
                        ></a-input-number>
                    </a-form-item>
                </a-col>
            </a-row>
            <a-row :gutter="24" v-if="formState['useType'] == 1">
                <a-col :span="8">
                    <a-form-item
                        :name="`companyName`"
                        label="连接组标号"
                        :rules="[{ required: true, ElMessage: '请输入连接组标号' }]"
                    >
                        <a-input
                            v-model:value="formState['companyName']"
                            placeholder="请输入连接组标号"
                        ></a-input>
                    </a-form-item>
                </a-col>
            </a-row>
            <template v-else>
                <a-row :gutter="24">
                    <a-col :span="8">
                        <a-form-item
                            :name="`companyName`"
                            label="冷却组别号"
                            :rules="[{ required: true, ElMessage: '请输入冷却组别号' }]"
                        >
                            <a-input
                                v-model:value="formState['companyName']"
                                placeholder="请输入冷却组别号"
                            ></a-input>
                        </a-form-item>
                    </a-col>
                </a-row>
                <a-row :gutter="24">
                    <a-col :span="8">
                        <a-form-item
                            :name="`companyName`"
                            label="冷却方式"
                            :rules="[{ required: true, ElMessage: '请输入冷却方式' }]"
                        >
                            <a-input
                                v-model:value="formState['companyName']"
                                placeholder="请输入冷却方式"
                            ></a-input>
                        </a-form-item>
                    </a-col>
                </a-row>
            </template>
            <h4 class="content-title">
                <img src="@/assets/img/user/detail-title.png" alt="" />
                其他信息
            </h4>
            <a-row :gutter="24">
                <a-col :span="8" v-if="formState['useType'] == 1">
                    <a-form-item
                        :name="`companyName`"
                        label="高低压侧配置"
                        :rules="[{ required: true, ElMessage: '请输入高低压侧配置' }]"
                    >
                        <a-textarea
                            :rows="4"
                            v-model:value="formState['companyName']"
                            placeholder="请输入高低压侧配置"
                            allow-clear
                            show-count
                            :maxlength="100"
                        />
                    </a-form-item>
                </a-col>
                <a-col :span="8" v-else>
                    <a-form-item
                        :name="`companyName`"
                        label="接地配套装置"
                        :rules="[{ required: true, ElMessage: '请输入接地配套装置' }]"
                    >
                        <a-textarea
                            :rows="4"
                            v-model:value="formState['companyName']"
                            placeholder="请输入接地配套装置"
                            allow-clear
                            show-count
                            :maxlength="100"
                        />
                    </a-form-item>
                </a-col>
            </a-row>
            <a-row>
                <a-col :span="18" :offset="2" style="text-align: center">
                    <a-button class="form-button" style="margin-right: 24px" @click="cancel"
                        >取消</a-button
                    >
                    <a-button
                        class="form-button form-button-submit"
                        type="primary"
                        html-type="submit"
                        >保存</a-button
                    >
                </a-col>
            </a-row>
        </a-form>
    </div>
</template>
<script setup>
    import { useRouter, useRoute } from 'vue-router';
    import { onMounted, onBeforeMount, onUnmounted } from 'vue';
    import { getProvince } from '@/api/modules/public';
    import { reactive, ref } from 'vue';
    import uploadImg from '@/components/uploadImg/uploadImg.vue';
    import {
        createUser,
        getCompanyDetail,
        getCompanySimpleList,
        updateCompany,
    } from '@/api/modules/user';
    import { ElMessage } from 'element-plus'
    const router = useRouter();
    const route = useRoute();
    const uploadImgEle = ref();
    onBeforeMount(async () => {
        sessionStorage.setItem('obsPath', 'company/user/');
        await getProvince()
            .then((res) => {
                if (res.code === 200) {
                    customerAddressOptions.value = res.data?.subList;
                }
            })
            .catch((err) => {});
        await getCompanySimpleList()
            .then((res) => {
                if (res.code === 200) {
                    parentCompanyOptions.value = res.data;
                } else {
                    parentCompanyOptions.value = [];
                }
            })
            .catch((err) => {});
        if (route.query.id) {
            await getCompanyDetail(route.query.id)
                .then((res) => {
                    if (res.code === 200) {
                        formState.value = res.data;
                        formState.value.customer = {
                            accountManagerName: res.data.accountManagerName,
                            accountManagerTel: res.data.accountManagerTel,
                        };
                        formState.value.address = {
                            areaCode: [
                                res.data.provinceCode,
                                res.data.cityCode,
                                res.data.districtCode,
                            ],
                            companyAddress: res.data.companyAddress,
                        };
                        formState.value.id = res.data.companyId;
                        formState.value.systemContact = res.data.administrator
                            ? res.data.administrator
                            : { contactName: '', contactPhone: '', type: 1 };
                        uploadImgEle.value.updateFileData([res.data.logo]);
                        formState.value.companyContactList = res.data.contactList.length
                            ? res.data.contactList
                            : [{ contactName: '', contactPhone: '', type: 2 }];
                        console.log('详情', formState.value);
                    }
                })
                .catch((err) => {});
        }
    }),
        onMounted(async () => {});
    onUnmounted(() => {
        sessionStorage.removeItem('obsPath');
    });
    // 正则
    // 1.只包含英文字母和中划线
    const reg1 = /^[a-zA-Z-]+$/;
    // 2.只包含英文字母
    const reg2 = /^[a-zA-Z]+$/;
    // 3.手机号验证
    const reg3 = /^1[3456789]\d{9}$/;
    // 4.固定电话验证
    // const reg4 = /^(\+\d{1,3}[-. ]?)?\d{1,3}[-. ]?\d{4,5}[-. ]?\d{3}[-. ]?\d{4}$/;
    // 验证logo文件是否上传
    const validateLogo = async (_rult, value) => {
        // console.log(uploadImgEle.value.getData());
        if (uploadImgEle.value.getData().length) {
            return Promise.resolve();
        } else {
            return Promise.reject('请选择要上传的公司logo');
        }
    };
    // 验证客户地址
    const validateAddress = async (_rult, value) => {
        if (value['areaCode'] && value['companyAddress']) {
            return Promise.resolve();
        } else {
            return Promise.reject('请完整填写客户地址');
        }
    };
    // 验证英文简称
    const validateAbbreviation = async (_rult, value) => {
        if (value) {
            if (reg1.test(value)) {
                return Promise.resolve();
            } else {
                return Promise.reject('请输入正确格式的英文简称');
            }
        } else {
            return Promise.reject('请输入英文简称');
        }
    };
    // 验证用户账号
    const validateAccount = async (_rult, value) => {
        if (value) {
            if (reg2.test(value)) {
                return Promise.resolve();
            } else {
                return Promise.reject('请输入正确格式的用户账号');
            }
        } else {
            return Promise.reject('请输入用户账号');
        }
    };
    // 客户经理信息、管理员信息
    const validateCommonInfo = async (_rult, value) => {
        if (formState.value[_rult.field][_rult.mappingData.name]) {
            if (formState.value[_rult.field][_rult.mappingData.tel]) {
                if (reg3.test(formState.value[_rult.field][_rult.mappingData.tel])) {
                    return Promise.resolve();
                } else {
                    return Promise.reject('请输入正确格式的联系电话');
                }
            } else {
                return Promise.reject('请输入联系电话');
            }
        } else {
            return Promise.reject('请输入姓名');
        }
    };
    // 验证企业联系人信息
    const validateContact = async (_rult, value) => {
        if (value.contactName) {
            if (value.contactPhone) {
                if (reg3.test(value.contactPhone)) {
                    return Promise.resolve();
                } else {
                    return Promise.reject('请输入正确格式的联系电话');
                }
            } else {
                return Promise.reject('请输入联系电话');
            }
        } else {
            return Promise.reject('请输入姓名');
        }
    };

    // 验证企业联系人手机号
    const validateContactTel = async (_rult, value) => {
        if (value) {
            if (reg3.test(value)) {
                return Promise.resolve();
            } else {
                return Promise.reject('请输入正确格式的联系电话');
            }
        } else {
            return Promise.reject('请输入联系电话');
        }
    };

    // 表单验证规格
    const rules = {
        logo: [
            {
                required: true,
                validator: validateLogo,
                trigger: 'change',
            },
        ],
        systemContact: [
            {
                required: true,
                validator: validateCommonInfo,
                // 映射字段
                mappingData: {
                    name: 'contactName',
                    tel: 'contactPhone',
                },
                trigger: ['change', 'blur'],
            },
        ],
        address: [
            {
                required: true,
                validator: validateAddress,
                trigger: 'change',
            },
        ],
        companyEnName: [
            {
                required: true,
                validator: validateAbbreviation,
                trigger: 'blur',
            },
        ],
        companyAccount: [
            {
                required: true,
                validator: validateAccount,
                trigger: 'blur',
            },
        ],
        companyContactList: [
            {
                required: true,
                validator: validateContact,
                trigger: 'blur',
            },
        ],
        contactTel: [
            {
                required: true,
                validator: validateContactTel,
                trigger: 'blur',
            },
        ],
        customer: [
            {
                required: true,
                validator: validateCommonInfo,
                mappingData: {
                    name: 'accountManagerName',
                    tel: 'accountManagerTel',
                },
                trigger: 'blur',
            },
        ],
    };
    // 客户类型选项常量
    // 客户使用方式选项常量
    const customerUseOptions = reactive([
        {
            label: '箱式变压器',
            value: 1,
        },
        {
            label: '主变压器',
            value: 2,
        },
    ]);
    // 所属上级公司
    const parentCompanyOptions = ref([]);
    // 客户地址省级联动常量
    const customerAddressOptions = ref([]);
    // 公司类别选项常量
    const enterpriseTypeOptions = reactive([
        {
            label: '总公司',
            value: 1,
        },
        {
            label: '二级公司',
            value: 2,
        },
        {
            label: '三级公司',
            value: 3,
        },
        {
            label: '四级公司',
            value: 4,
        },
    ]);
    // 企业联系人数据常量
    const enterpriseContact = reactive([
        {
            name: '',
            tel: '',
        },
    ]);
    // 上级企业查询常量

    // 添加企业联系人
    const addContact = () => {
        formState.value.companyContactList.push({
            contactName: '',
            contactPhone: '',
            type: 2,
        });
    };
    // 删除企业联系人
    const delContact = (index) => {
        formState.value.companyContactList.splice(index, 1);
    };
    // 表单元素
    const formRef = ref();
    // 表单初始化
    const formState = ref({
        companyName: '', // 公司名称
        useType: 1, // 客户类型
        systemContact: {
            contactName: '',
            contactPhone: '',
            type: 1,
        },
        address: {
            areaCode: '',
            companyAddress: '',
        },
        companyProfile: '', // 公司简介
        companyEnName: '', // 公司英文简称
        companyAccount: '', // 公司账号
        companyType: 1, // 公司类型
        companyLevel: 1, // 公司级别
        parentId: null, // 上级公司
        companyContactList: [
            {
                contactName: '',
                contactPhone: '',
                type: 2,
            },
        ],
        // contactTel: [{ name: '', tel: '' }],
        customer: {
            customerName: '',
            customerTel: '',
        },
    });
    const onFinish = async (values) => {
        // console.log(uploadImgEle.value.fileList);
        // console.log('Received values of form: ', values);
        // console.log('formState: ', formState);
        let [provinceCode, cityCode, districtCode] = [...formState.value.address.areaCode];
        let {
            accountManagerName,
            accountManagerTel,
            companyAccount,
            companyContactList,
            companyEnName,
            companyLevel,
            companyType,
            parentId,
            companyName,
            companyProfile,
            useType,
            systemContact,
        } = { ...formState.value.customer, ...formState.value };
        let data = {
            provinceCode,
            cityCode,
            districtCode,
            accountManagerName,
            accountManagerTel,
            companyAddress: formState.value.address.companyAddress,
            companyAccount,
            companyContactList,
            companyEnName,
            companyLevel,
            companyType,
            parentId,
            companyName,
            companyProfile,
            useType,
            systemContact,
        };
        if (route.query.id) {
            data.id = formState.value.companyId;
        }
        try {
            const res = route.query.id ? await updateCompany(data) : await createUser(data);
            if (res.code === 200) {
                let msg = route.query.id ? '修改成功' : '添加成功';
                ElMessage.success(msg);
                router.go(-1);
            }
        } catch (err) {
            // console.log(err);
        }
    };
    // 取消表单操作
    const cancel = () => {
        formRef.value.resetFields();
        router.go(-1);
    };
    // 校验部分字段
    const validateContent = (e, type) => {
        formRef.value.validateFields([`${type}`]);
    };
</script>
<style scoped lang="scss">
    .electrical-handle-template {
        background-color: #fff;
        padding: 20px;
        :deep(.ant-input-number-group-addon) {
            background-color: transparent;
            min-width: 45px;
        }
        .content-title {
            display: flex;
            align-items: center;
            margin-bottom: 16px;
            img {
                height: 16px;
                margin-right: 8px;
            }
        }
    }
</style>
