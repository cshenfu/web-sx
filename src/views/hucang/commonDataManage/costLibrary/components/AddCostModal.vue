<template>
    <div>
        <tips-modal
            :width="'490px'"
            tipType="success"
            class="tip-content-modal"
            :okText="'保存'"
            :openTipsModal.sync="openTipsManageModal"
            @handleChangeFileModal="handleBindDeviceModal"
        >
            <template #customTitle>{{ modalTitle }}</template>
            <template #contentBody>
                <a-form
                    :colon="false"
                    class="agent-form"
                    ref="addCostFormRef"
                    :model="addCostForm"
                    :labelCol="labelCol"
                    :rules="rules"
                    labelAlign="left"
                >
                    <a-form-item  
                        label="类型"
                        name="type">
                        <a-radio-group v-if="!costDefaultData?.id"  v-model:value="addCostForm['type']" :options="typeOptions" />
                        <span v-else>{{ addCostForm['type'] }}</span>
                    </a-form-item>
                    <a-form-item
                        label="费用名称"
                        name="name"
                    >
                        <a-input
                            :disabled="costDefaultData?.id?true:false"
                            @blur="(e)=>checkCostName(e,'name')"
                            v-model:value="addCostForm['name']"
                            placeholder="请输入费用名称"
                        ></a-input>
                    </a-form-item>
                    <a-form-item
                        label="编码"
                        name="code"
                    >
                        <a-input
                            :disabled="costDefaultData?.id?true:false"
                            v-model:value="addCostForm['code']"
                            placeholder="请输入编码"
                        ></a-input>
                    </a-form-item>
                    <a-form-item
                        label="单位"
                        name="unit"
                    >
                        <a-input
                            :disabled="costDefaultData?.id?true:false"
                            v-model:value="addCostForm['unit']"
                            placeholder="请选择计量单位"
                        ></a-input>
                    </a-form-item>
                    <a-form-item
                        label="默认值"
                        name="defaultValue"
                    >
                        <a-input
                            v-model:value="addCostForm['defaultValue']"
                            placeholder="请输入默认值"
                        ></a-input>
                    </a-form-item>
                    <a-form-item
                        label="最大值"
                        name="maxValue"
                    >
                        <a-input
                            v-model:value="addCostForm['maxValue']"
                            placeholder="请输入最大值"
                        ></a-input>
                    </a-form-item>
                    <a-form-item
                        label="最小值"
                        name="minValue"
                    >
                        <a-input
                            v-model:value="addCostForm['minValue']"
                            placeholder="请输入最小值"
                        ></a-input>
                    </a-form-item>
                </a-form>
            </template>
        </tips-modal>
    </div>
</template>

<script setup>
    import {
        ref,
        reactive,
        toRefs,
        onBeforeMount,
        onMounted,
        watch,
        computed,
        nextTick,
    } from 'vue';
    import { useRoute, useRouter } from 'vue-router';
    import { ElMessage } from 'element-plus'
    import dayjs from 'dayjs';
    import TipsModal from '@/components/tipsDialog/TipsModal.vue';
    import {addProjectCost,updateProjectCost,getProjectCostDetail} from '@/api/modules/sourceData/costLibraryManage'
    import {TYPE_OPTIONS} from '../costLibrary'
    import {regexNumber} from '@/utils/regular'
    const props = defineProps({
        openTipsManageModal: {
            type: Boolean,
            default: false,
        },
        selectData: {
            type: Object,
        },
        itemTypeActiveName: {
            type: String,
        }
    });
    const emits = defineEmits(['update:openTipsManageModal','updateCostList']);
    // 校验code
    const validateCode= async (_rult, value) => {
        if (value) {
            if (regexNumber(value)) {
                return Promise.resolve();
            } else {
                return Promise.reject('请输入纯数字code');
            }
        } else {
            return Promise.reject('请输入编码');
        }
    };
    // 类型选项
    const typeOptions = TYPE_OPTIONS
    const modalTitle = ref('新增')
    const addCostFormRef = ref(null);
    const costDefaultData = ref(null);
    const rules = {
        type: [{ required: true, ElMessage: '请选择类型', trigger: 'change' }],
        name: [{ required: true, ElMessage: '请输入费用名称', trigger: 'blur' }],
        code: [{ required: true, trigger: 'blur', validator: validateCode, }],
        unit: [{ required: true, ElMessage: '请输入单位', trigger: 'blur' }],
        defaultValue: [{ required: true, ElMessage: '请输入默认值', trigger: 'blur' }],
        maxValue: [{ required: true, ElMessage: '请输入最大值',  trigger: 'blur' }],
        minValue: [{ required: true,ElMessage: '请输入最小值',trigger: 'blur' }],
    }
    // 添加造价
    const addCostForm = ref({
        type:'',
        code:'',
        name:'',
        unit:'',
        defaultValue:'',
        maxValue:'',
        minValue:''
    });
    const labelCol = {
        style: {
            width: '70px',
            marginRight: '6px',
        },
    };
    // 校验费用名称
    const checkCostName = (e,type)=> {
        console.log('校验名称',e.target.value,'类型',type);
        
    }
    // 提交校验数据
    const handleBindDeviceModal = (val) => {
        console.log('滚波',val, addCostForm.value);
        
        if (val) {
            addCostFormRef.value
                .validateFields()
                .then(async() => {
                    // 保证最大值>=默认值>=最小值
                    if ((addCostForm.value.maxValue * 1 < addCostForm.value.defaultValue * 1) || (addCostForm.value.defaultValue * 1 < addCostForm.value.minValue * 1) || (addCostForm.value.maxValue * 1 < addCostForm.value.minValue * 1)) {
                        ElMessage.error('请保证最大值>=默认值>=最小值');
                        return false;
                    }
                    let data = {
                        ...addCostForm.value,
                        parentType: props.itemTypeActiveName
                    }
                    let messageStr= '添加数据成功',res

                    if (costDefaultData.value?.id) {
                        data.id = costDefaultData.value.id;
                        messageStr = '编辑数据成功'
                        res = await updateProjectCost(data)
                    }else {
                        res = await addProjectCost(data)
                    }
                    if(res.data) {
                        ElMessage.success(messageStr)
                        emits('update:openTipsManageModal', false);
                        emits('updateCostList')
                        addCostFormRef.value.resetFields();
                    }
                })
                .catch((error) => {
                    console.log('错误', error);
                });
        } else {
            costDefaultData.value = null
            emits('update:openTipsManageModal', val);
            addCostFormRef.value.resetFields();
        }
    };
    // 获取代理详情
    const getData = async() => {
        try {
            let res = await getProjectCostDetail(props.selectData.id)
            if(res.code ==200 && res.data) {
                addCostForm.value = {...res.data}
            }
        } catch (error) {
            
        }
    }
    onBeforeMount(() => {
        costDefaultData.value = props.selectData;   
        if(costDefaultData.value) {
            let { type,name,unit,defaultValue,maxValue,minValue,code }  = props.selectData;
            addCostForm.value = {type,name,unit,defaultValue,maxValue,minValue,code}
            modalTitle.value=   "更新"
            // getData()
        }else {
            modalTitle.value= "新增"
        }
    });
    onMounted(() => {
        //console.log('3.-组件挂载到页面之后执行-------onMounted')
    });
</script>
<style scoped lang="scss">
    .name-detail {
        width: 358px;
        background: #ffffff;
        border-radius: 4px;
        padding: 5px 12px;
        border: 1px solid #d2d5e1;
        p {
            font-size: 12px;
            color: #363b4d;
            line-height: 20px;
        }
    }
    .name-tip {
        font-size: 12px;
        color: #7c8294;
        line-height: 12px;
        margin-top: 8px;
    }
    .has-bind-clor {
        color: #036b64;
    }
    .operation-type {
        font-size: 12px;
        color: #363b4d;
        line-height: 12px;
    }
    .manage-detail {
        border: none;
    }
</style>
