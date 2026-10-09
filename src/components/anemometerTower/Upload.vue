<template>
    <div class="upload-content">
        <!-- {{ fileList }} -->
        <div class="upload-item">
            <!-- 进度： {{ process }} -->
            <a-spin :indicator="indicator" :spinning="loading">
                <a-upload
                    :accept="accept"
                    :showUploadList="false"
                    v-model:file-list="fileList"
                    :percent="90"
                    :name="name"
                    :listType="listType"
                    :multiple="multiple"
                    :max-count="maxCount"
                    :disabled="props.disabled"
                    class="avatar-uploader"
                    :customRequest="customRequest"
                    :before-upload="beforeUpload"
                    @change="handleChange"
                    v-bind="$attrs"
                >
                    <slot name="customBtn"></slot>
                    <div class="up-load-file" v-if="!$slots.customBtn">
                        <iconpark-icon
                            name="shangchuanwenjian"
                            v-if="name === 'file'"
                            size="20"
                            class="up-load-file-icon"
                        ></iconpark-icon>
                        <iconpark-icon
                            name="shangchuantupian"
                            v-else
                            size="20"
                            class="up-load-file-icon"
                        ></iconpark-icon>
                    </div>
                </a-upload>
            </a-spin>
            <div class="tip-content">
                <slot name="tip" />
            </div>
        </div>
        <div class="up-list" v-if="showUploadList">
            <ul>
                <li v-for="(item, index) in fileList" :key="item.name">
                    <div
                        class="name-icon"
                        @mouseover="showDelteBtn(index)"
                        @mouseleave="hideDelteBtn()"
                    >
                        <iconpark-icon
                            :name="
                                fileIconList[fileType] ||
                                fileIconList[item.fileSuffix] ||
                                fileIconList[item.suffix] ||
                                'txt'
                            "
                            size="18"
                            class="file-icon"
                        >
                        </iconpark-icon>
                        <div class="file-progress">
                            <div class="up-load-file-title">
                                {{ item.fileName || item.name }}
                                <iconpark-icon
                                    v-show="showDelteBtnIndex == index"
                                    name="shanchu"
                                    size="14"
                                    class="upload-shanchu"
                                    @click="deleteItem(index)"
                                ></iconpark-icon>
                            </div>
                            <div
                                v-if="item.processSelf && item.processSelf !== 100"
                                class="loader-check"
                            >
                                <!-- <div class="loader"></div> -->
                                <!-- <span class="is-check-data">文件上传中…</span> -->
                                <a-progress
                                    :showInfo="false"
                                    size="small"
                                    class="loading-progress"
                                    :stroke-color="{
                                        '0%': '#108ee9',
                                        '100%': '#87d068',
                                    }"
                                    :strokeWidth="2"
                                    :percent="item.processSelf"
                                />
                            </div>
                        </div>
                    </div>
                    <div class="upload-error" v-if="item.msg">
                        <iconpark-icon
                            name="jinggao"
                            size="14px"
                            class="upload-error-icon"
                        ></iconpark-icon
                        >{{ item.msg }}
                    </div>
                </li>
            </ul>
        </div>
    </div>
</template>
<script setup>
    import { h, ref, watch, computed, nextTick } from 'vue';

    import { message, Upload } from 'ant-design-vue';
    import { LoadingOutlined } from '@ant-design/icons-vue';
    import { fileIconList } from '@/assets/js/static.js';
    import { useOssUpload } from '@/components/ossClient/index';
    const props = defineProps({
        multiple: {
            type: Boolean,
            default: false,
        },
        // 上传参数
        dataObj: {
            type: Object,
            default: () => {},
        },
        // 类型
        name: {
            type: String,
            default: 'file',
        },
        //
        listType: {
            type: String,
            default: 'text',
        },
        fileTypes: String,
        defaultFiles: {
            type: Array,
            default: () => [],
        },
        maxCount: {
            type: Number,
            default: 1,
        },
        fileSize: Number,
        fileTypeMessage: String,
        fileSizeMessage: String,
        isNeedCheckFileNames: {
            type: Boolean,
            default: false,
        },
        showUploadList: {
            type: Boolean,
            default: true,
        },
        disabled: {
            type: Boolean,
            default: false,
        },
        isImmediatelyUpload: {
            type: Boolean,
            default: true,
        },
    });
    const emit = defineEmits(['upFileList', 'update:defaultFiles', 'deleteFile']);
    const indicator = h(LoadingOutlined, {
        style: {
            fontSize: '18px',
        },
    });
    const fileList = ref(props.defaultFiles);
    const uploadedFiles = new Set(); // 已上传文件集合
    const loading = ref(false);
    // 文件名称
    const fileName = ref('');
    // 文件类型
    const fileType = ref('');
    const showDelteBtnIndex = ref(null);
    let processSelf = ref(0);
    let ossUpload = useOssUpload();

    // watch(
    //     () => props.defaultFiles,
    //     (nl) => {
    //         console.log('观察',nl);
    //         fileList.value = nl;
    //     },
    //     { deep: true, immediate: true },
    // );
    const accept = computed(() => {
        let arr = props.fileTypes.split(',');
        let str = '';
        arr.forEach((item) => {
            str += `.${item},`;
        });
        str = str.slice(0, -1);
        return str;
    });
    // 文件校验
    const beforeUpload = (file, fileLists) => {
        const isFileUploaded = uploadedFiles.has(file.name);
        let flag = true;
        fileName.value = file.name;
        const type = file.name.substring(file.name.lastIndexOf('.') + 1).toLowerCase();
        const fileTypeResult = props.fileTypes.split(',');
        const isFileType = fileTypeResult.includes(type);
        if (isFileUploaded && props.isNeedCheckFileNames) {
            flag = false;
            message.error('文件已上传');
            return flag || Upload.LIST_IGNORE;
        }
        if (!isFileType) {
            flag = false;
            message.error(props.fileTypeMessage);
            return flag || Upload.LIST_IGNORE;
        }
        fileType.value = type;
        if (props.fileSize) {
            const isFileSize = (file.size / 1024 / 1024).toFixed(2) < props.fileSize;
            if (!isFileSize) {
                message.error(props.fileSizeMessage);
                return (flag = false || Upload.LIST_IGNORE);
            }
        }
        fileList.value.push(file);
        if (fileList.value.length > props.maxCount) {
            // 删除数组最后一项
            if (props.maxCount > 1) {
                fileList.value.pop();
                message.error('最多上传' + props.maxCount + '个文件');
                return (flag = false || Upload.LIST_IGNORE);
            } else {
                fileList.value.shift();
            }
        }
        console.log('数据呢', fileList.value);
        uploadedFiles.add(file.name);
        return flag || Upload.LIST_IGNORE;
    };
    // 上传文件
    const customRequest = async (file) => {
        console.log(fileList, 'file-customRequest', file);
        // const formData = new FormData();
        // formData.append('file', file.file);
        // for (const key in props.dataObj) {
        //     if (props.dataObj.hasOwnProperty(key)) {
        //         formData.append(key, props.dataObj[key]);
        //     }
        // }
        // for (var pair of formData.entries()) {
        //     console.log(pair[0] + ', ' + pair[1]);
        // }
        fileList.value.forEach((item) => {
            if (item.uid) {
                item.processSelf = 0;
            }
        });
        if (props.isImmediatelyUpload) {
            loading.value = true;
            processSelf.value = ossUpload.processSize;
            fileList.value.forEach((item) => {
                if (item.uid === file.file.uid) {
                    item.processSelf = processSelf.value;
                }
            });
            let uploadResult = await ossUpload.uploadFile(
                file.file,
                sessionStorage.getItem('obsFilePath') || '',
            );
            loading.value = false;
            if (fileList.value.length > 0) {
                emit('upFileList', {
                    filePath: uploadResult.obsPath,
                    fileName: fileName.value,
                    suffix: fileType.value,
                });
            }
        } else {
            emit('upFileList', file.file);
        }
    };
    const handleChange = (info) => {
        if (info.file.status !== 'uploading') {
        }
        if (info.file.status === 'done') {
            message.success(`${info.file.name} file uploaded successfully`);
        } else if (info.file.status === 'error') {
            message.error(`${info.file.name} file upload failed.`);
        }
    };
    // 显示隐藏文件删除按钮
    const showDelteBtn = (val) => {
        showDelteBtnIndex.value = val;
    };
    const hideDelteBtn = () => {
        showDelteBtnIndex.value = null;
    };
    // 删除文件
    const deleteItem = (index) => {
        console.log(88888)
        if (index == null) {
            fileList.value = [];
        } else {
            fileList.value.splice(index, 1);
            // 删除文件自动触发取消上传任务
            // ossUpload.abortUpload();
        }
        emit('update:defaultFiles', fileList.value);
        emit('deleteFile');
    };
    // 回显图片
    const updateImgData = (index) => {
        console.log(77777)
        fileList.value.splice(index, 1);
    };
    // 回显文件
    const updateFileData = (data) => {
        nextTick(() => {
            fileList.value = [];
            // console.log(data);
            // data && data.length && data.map(ele => {
            //     fileList.value.push({
            //         ...ele,
            //         name: ele.fileName,
            //     })
            //     fileName.value = ele.fileName;
            //     fileType.value = ele.fileSuffix ? ele.fileSuffix.split('.')[1] : ele.fileName.split('.')[1];
            // })
            if (data && data.length) {
                for (let index = 0; index < data.length; index++) {
                    const ele = data[index];
                    // console.log(ele, {
                    //     ...ele,
                    //     name: ele.fileName,
                    // });
                    fileList.value.push({
                        ...ele,
                        name: ele.fileName,
                    });
                    fileName.value = ele.fileName;
                    fileType.value = ele.fileSuffix
                        ? ele.fileSuffix.split('.')[1]
                        : ele.fileName.split('.')[1];
                    // console.log(fileList.value);
                }
            }
        });
    };
    defineExpose({
        deleteItem,
        updateFileData,
        updateImgData,
    });
</script>
<style scoped lang="scss">
    $primary-color: var(--theme);
    .upload-content {
        margin-top: 20px;
        :deep(.ant-upload-disabled) {
            .up-load-file {
                cursor: not-allowed !important;
            }
        }
    }
    .upload-item {
        display: flex;
        align-items: center;
        .avatar-uploader {
            .up-load-file {
                width: 52px;
                height: 52px;
                background: #f5f6f9;
                border-radius: 4px;
                border: 1px dashed #d2d5e1;
                // margin-right: 16px;
                display: flex;
                justify-content: center;
                align-items: center;
                cursor: pointer;
                transition: border-color linear 0.2s;
                &:hover {
                    border-color: $primary-color;
                }
            }
        }
        .tip-content {
            margin-left: 16px;
        }
    }
    .up-list {
        ul {
            li {
                height: 18px;
                font-size: 12px;
                color: #363b4d;
                line-height: 12px;
                margin: 10px 0 0 0;
                position: relative;
                cursor: pointer;
                // display: flex;
                // align-items: center;
                .name-icon {
                    display: flex;
                    align-items: center;
                    margin-bottom: 5px;
                }
                .upload-shanchu {
                    margin-left: 14px;
                    cursor: pointer;
                }
                .up-load-file-title {
                    display: flex;
                    line-height: 18px;
                }
                .file-icon {
                    margin-right: 8px;
                }
                .file-progress {
                    display: flex;
                    flex-direction: column;
                    flex: 1;
                }
                .loader-check {
                    width: 60%;
                    display: flex;
                    align-items: center;
                    .loading-progress {
                        margin-bottom: 0;
                    }
                }
                .loading-mark {
                    width: 100%;
                    // width: 18px;
                    // height:18px;
                    // background-color: rgba(#000,0.2);
                    // position: absolute;
                    // text-align: center;
                    line-height: 18px;
                    color: #fff;
                }
            }
        }
    }
</style>
