<template>
    <div class="import-file-modal">
        <tips-modal
            :width="'490px'"
            :showCancel="false"
            title="导入文件"
            :tipType="'success'"
            class="tip-content-modal"
            :okText="'确定上传数据'"
            v-model:openTipsModal="openTipsImportFileModal"
            @handleChangeFileModal="handleChangeClose"
        >
            <template #customTitle>{{ tipTitle }}</template>
            <template #contentBody>
                <!-- <div class="tuning-tip">
                    <iconpark-icon name="jinggao" size="18" class="success"></iconpark-icon>
                    <span class="tuning-tip-title">{{ contentTip }}</span>
                </div> -->
                <div>
                    <div class="tuning-example"
                        >导入前请先下载数据模版，<span @click="downloadFile()">下载模版</span></div
                    >
                    <a-upload
                        class="content-add-upload"
                        name="file"
                        :maxCount="1"
                        :showUploadList="false"
                        v-model:file-list="fileList"
                        :customRequest="customRequest"
                        :before-upload="beforeUpload"
                        @change="handleChange"
                        list-type="picture-card"
                    >
                        <div>
                            <iconpark-icon :size="30" name="shangchuanshuju"></iconpark-icon>
                            <div style="margin-top: 8px"
                                >说明:导入基于分类及型号编号，相同会进行数据覆盖</div
                            >
                        </div>
                    </a-upload>
                    <span v-show="isShowRequire" class="content-add-tip">请上传导入文件</span>
                    <ul v-if="fileList.length">
                        <li
                            v-for="(file, fileIndex) in fileList"
                            :key="fileIndex"
                            class="file-list"
                        >
                            <iconpark-icon name="xlsl"></iconpark-icon>
                            <span>{{ file['name'] }}</span>
                            <iconpark-icon
                                @click="delFile(fileIndex)"
                                class="file-del-icon"
                                name="shanchu"
                            ></iconpark-icon>
                        </li>
                    </ul>
                </div>
                <ul class="problem-list" v-if="computedProblemList.length">
                    <li v-for="(item, index) in computedProblemList" :key="index">
                        <a-popover overlay-class-name="name-popover-self name-popover-self-large">
                            <template #content>
                                {{ item.lines }}
                            </template>
                            <div class="ellipsis-text-name">{{ item.problem }}</div>
                        </a-popover>
                    </li>
                </ul>
            </template>
        </tips-modal>
    </div>
</template>

<script setup>
    import { ref, reactive, toRefs, onBeforeMount, onMounted, watch, computed } from 'vue';

    import { useRoute, useRouter } from 'vue-router';
    import TipsModal from '../../../../components/tipsDialog/TipsModal.vue';
    import { message, Upload } from 'ant-design-vue';
    const props = defineProps({
        importFileFlg: {
            type: Boolean,
            default: false,
        },
        problemList: {
            type: [Array, Object],
            default: ()=>[] || {}
        }
    });
    const emits = defineEmits(['updateFiles','downPath','update:problemList',"update:importFileFlg"]);
    const openTipsImportFileModal = ref(props.importFileFlg);
    watch(
       [ () => props.importFileFlg],
        ([valFlg,oldFlg]) => {
            openTipsImportFileModal.value = valFlg;
            
        }
    );
    const computedProblemList= computed(()=> {
        if (Array.isArray(props.problemList) && props.problemList.length > 0) {
            return props.problemList
        }else {
            return showFileErrorInfo(props.problemList)
        }
    })
    const fileList = ref([]);
    const isShowRequire = ref(false);
    // 上传前拦截
    const beforeUpload = (file) => {
        const type = file.name.substring(file.name.lastIndexOf('.') + 1).toLowerCase();
        console.log(file, type);
        if (type == 'xlsx' || type == 'xls') {
            if (file.size / 1024 / 1024 > 100000) {
                message.error('文件最大限制为100M');
                return false || Upload.LIST_IGNORE;
            } else {
                console.log(fileList);
            }
        } else {
            message.error('请上传xlsx、xls格式文件');
            return false || Upload.LIST_IGNORE;
        }
        emits('update:problemList',[]);
        isShowRequire.value = false;
    };
    // 删除文件
    const delFile = (index) => {
        fileList.value.splice(index, 1);
    };
    const handleChange = (info) => {
        if (info.file.status == 'uploading') {
            // fileList.value.push({
            //     name: info.file.name,
            //     file: info.file,
            // });
        }
    };
    // 自定义上传逻辑
    const customRequest = () => {
        console.log('自定义上传');
    };
    const tipTitle = '导入数据';
    const contentTip = ref('导入基于设备型号，相同设备型号会进行数据覆盖');
    const handleChangeClose = (val) => {
        if (val) {
            if (fileList.value.length > 0) {
                const formData = new FormData();
                formData.append('file', fileList.value[0].originFileObj);
                emits('updateFiles',formData)
                isShowRequire.value = false;
            } else {
                isShowRequire.value = true;
                return;
            }
            console.log(fileList.value);
        } else {
            fileList.value = [];
            isShowRequire.value = false;
            emits('update:problemList',[]);
            emits('update:importFileFlg',false);
        }
    };
    const showFileErrorInfo = (obj) => {
        let countMap = {};
        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                let value = obj[key];
                if (countMap[value]) {
                    countMap[value].count++;
                    countMap[value].lines.push(key);
                } else {
                    countMap[value] = { problem: value, count: 1, lines: [key] };
                }
            }
        }
        let result = Object.values(countMap);
        return result
    };
    const downloadFile = () => {
        emits('downPath')
    };

    defineExpose({});
</script>
<style scoped lang="scss">
    .content-add-upload {
        :deep(.ant-upload.ant-upload-select) {
            width: 100% !important;
            margin-top: 20px;
        }
    }

    .tuning-tip {
        display: flex;
        padding: 8px 0 5px 0;
        background: #fef1df;
        border-radius: 4px;
        margin-bottom: 20px;

        .success {
            color: #fe830f;
            margin: 0 9px 0 12px;
        }

        .tuning-tip-title {
            font-size: 14px;
            color: #21263f;
            line-height: 22px;
        }
    }

    .tuning-example {
        font-size: 14px;
        color: #363b4d;
        line-height: 12px;
        margin-top: 20px;

        span {
            color: #036b64;
            cursor: pointer;
        }
    }

    .file-list {
        display: flex;
        align-items: center;

        span {
            margin: 0 5px;
        }

        .file-del-icon {
            cursor: pointer;
            visibility: hidden;
        }

        &:hover {
            .file-del-icon {
                visibility: visible;
            }
        }
    }

    .content-add-tip {
        color: #ff3e3e;
        font-size: 12px;
    }

    .problem-list {
        max-height: 50vh;
        overflow-y: auto;
        margin-top: 20px;

        li {
            width: 409px;
            // height: 40px;
            background: #ffffff;
            border-radius: 4px;
            border: 1px solid #e5e5e5;
            padding: 10px 16px;
            font-size: 12px;
            color: #363b4d;
            line-height: 14px;
        }
    }
</style>
