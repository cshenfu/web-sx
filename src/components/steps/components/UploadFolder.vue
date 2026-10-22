<template>
    <div class="upload-folder">
        <div class="folder-upload">
            <a-upload
                :disabled="isHasUploading"
                :file-list="fileList"
                :before-upload="beforeUpload"
                :custom-request="customRequest"
                :on-remove="handleRemove"
                multiple
                :show-upload-list="false"
            >
                <div class="up-load-file">
                    <iconpark-icon
                        name="shangchuanwenjian"
                        size="20"
                        class="up-load-file-icon"
                        style="color: #bbb"
                    ></iconpark-icon>
                </div>
            </a-upload>
            <div class="tip">
                {{ props.descTip }}
            </div>
        </div>
        <div v-if="fileGroups.length > 0" class="up-list">
            <ul>
                <li
                    v-for="(group, groupIndex) in fileGroups"
                    :key="groupIndex"
                    class="up-load-list"
                >
                    <div v-for="(file, index) in group.files" :key="index">
                        <iconpark-icon
                            name="guanbi"
                            size="14"
                            class="upload-shanchu"
                            @click="removeGroup(groupIndex)"
                        ></iconpark-icon>
                        <div class="upload-name">
                            <iconpark-icon
                                name="tongyongwenjian"
                                size="18"
                                class="file-icon"
                            ></iconpark-icon>
                            <div class="file-progress">
                                <span
                                    class="file-name"
                                    :class="group.errorMessage ? 'err-msg' : ''"
                                >
                                    {{ file.file.name }}
                                </span>
                                <div class="loader-check">
                                    <a-progress
                                        v-if="
                                            file.uploadProgress.percent &&
                                            file.uploadProgress.percent !== 100
                                        "
                                        :showInfo="false"
                                        size="small"
                                        class="loading-progress"
                                        :stroke-color="{
                                            '0%': '#108ee9',
                                            '100%': '#87d068',
                                        }"
                                        :strokeWidth="2"
                                        :percent="file.uploadProgress.percent"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="upload-error" v-if="group.errorMessage">
                        <iconpark-icon
                            name="jinggao"
                            size="14px"
                            class="upload-error-icon"
                        ></iconpark-icon
                        >{{ group.errorMessage }}
                    </div>
                    <div class="road-width-input" v-if="props.isForRoadWidth">
                       <span>路宽</span>
                       <a-input-number @blur="changeRoadWidth" v-model:value="group.roadWidth" placeholder="请输入" style="width: 120px" :controls="false" addon-after="m"></a-input-number>
                    </div>
                </li>
            </ul>
        </div>
    </div>
</template>

<script setup>
    import { ref, reactive, onMounted, computed, nextTick } from 'vue';
    import { message } from 'ant-design-vue';
    import { useOssUpload } from '../../ossClient/modifytUpload';
    import eventBus from '@/utils/eventBus';
import { file } from 'jszip';
    const props = defineProps({
        maxGroupNum: {
            type: Number,
            default: 5,
        },
        descTip: {
            type: String,
            default:
                '支持shp文件，一个shp通常有.shp/.shx/.prj/.dbf（这4个格式必须有）等文件格式组成。最多上传5个shp文件，最大支持50M。场区范围不能包含在避让区域内',
        },
        otherFileType: {
            type: String,
            default: '',
        },
        isNeedRenderToMap: {
            type: Boolean,
            default: false,
        },
        isForRoadWidth: {
            type: Boolean,
            default: false,
        },
    });
    const emits = defineEmits(['getCheckData', 'renderDataToMap']);
    // 文件list与展示的数据
    const fileList = ref([]);
    const fileGroups = ref([]);

    // 必须得文件类型以及部分文件类型
    const requiredTypes = ['shp', 'shx', 'dbf', 'prj'];
    const optionalTypes = ['xml', 'sbx', 'cpg', 'sbn'];
    const isHasUploading = computed(() => {
        let flag = false;
        let result = fileGroups.value.filter((m) => m.errorMessage);
        if (result.length > 0) return flag;
        fileGroups.value.forEach((group) => {
            group.files.forEach((file) => {
                if (file.uploadProgress.percent !== 100) {
                    flag = true;
                }
            });
        });
        flag = fileGroups.value.length == 5;
        return flag;
    });
    // 临时文件存储，用于分组数据
    const tempFileGroups = reactive({});

    // 上传前文件校验
    const beforeUpload = (file) => {
        const fileNameParts = file.name.split('.');
        let baseName = fileNameParts[0]; // Take the first part before the first '.'
        const ext = fileNameParts[fileNameParts.length - 1];
        if (props.otherFileType && props.otherFileType.includes(ext)) {
            baseName = baseName + '.' + ext;
        }

        // 初始化分组
        if (!tempFileGroups[baseName]) {
            tempFileGroups[baseName] = [];
        }

        // 文件类型校验
        const isValidFileType = [...requiredTypes, ...optionalTypes].includes(ext);
        if (!isValidFileType) {
            if (props.otherFileType) {
                const otherFilsTypsList = props.otherFileType.split(',');
                if (!otherFilsTypsList.includes(ext)) {
                    message.error(`文件类型 ${ext} 不被支持`);
                    delete tempFileGroups[baseName];
                    return false;
                }
            } else {
                message.error(`文件类型 ${ext} 不被支持`);
                delete tempFileGroups[baseName];
                return false;
            }
        }

        const isLt50M = file.size / 1024 / 1024 < 500;
        if (!isLt50M) {
            delete tempFileGroups[baseName];
            message.warning('文件大小不能超过 50MB');
            return false;
        }
        const tempFileGroupsKeys = Object.keys(tempFileGroups);
        if (tempFileGroupsKeys.length > props.maxGroupNum) {
            message.warning(`最多上传${props.maxGroupNum}组数据`);
            return false;
        }
        // 将文件添加到对应的组中
        tempFileGroups[baseName].push({
            file,
            ext, // 文件类型
            uploadProgress: { percent: 0, status: 'active' }, //上传进度条
            filePath: null, // obs 文件存储路径
            roadWidth: null
        });
        organizeFiles();

        return validateGroups();
    };

    // 分组数据校验必须文件以及名称是否重复，分组数量
    const validateGroups = () => {
        let allValid = true;
        console.log(fileGroups.value, '所有文件集合');
        fileGroups.value.forEach((group) => {
            const extList = group.files.map((file) => file.file.name.split('.').pop());
            let hasAllRequiredTypes;
            if (props.otherFileType) {
                const otherFileTypes = props.otherFileType.split(',');
                hasAllRequiredTypes = otherFileTypes.some((type) => extList.includes(type)) || requiredTypes.every((type) => extList.includes(type));
            } else {
                hasAllRequiredTypes = requiredTypes.every((type) => extList.includes(type));
            }
            
            const fileNames = group.files.map((file) => file.file.name);
            const nameCounts = fileNames.reduce((acc, name) => {
                acc[name] = (acc[name] || 0) + 1;
                return acc;
            }, {});

            const duplicates = Object.entries(nameCounts)
                .filter(([name, count]) => count > 1)
                .map(([name]) => {
                    const exts = [
                        ...new Set(
                            group.files
                                .filter((file) => file.file.name === name)
                                .map((file) => file.ext),
                        ),
                    ];
                    return { name, exts: exts.length ? exts[0] : '' };
                });
            if (!hasAllRequiredTypes) {
                const missingFiles = requiredTypes.filter((type) => !extList.includes(type));
                if (missingFiles.includes('prj') && missingFiles.includes('shp')) {
                    group.errorMessage =
                        '缺少.prj 和 .shp 文件，请上传对应的文件，或删除该 .shp 文件';
                } else if (missingFiles.includes('prj')) {
                    group.errorMessage = '缺少.prj 文件，请上传对应的文件，或删除该 .shp 文件';
                } else if (missingFiles.includes('shp')) {
                    group.errorMessage = '缺少.shp 文件，请上传对应的文件';
                } else {
                    group.errorMessage = '该组文件不完整，必须包含 .shp, .shx, .dbf, .prj 文件';
                }
                allValid = false;
            } else if (duplicates.length > 0) {
                group.errorMessage =
                    duplicates.map((d) => `.${d.exts}`).join('、') + '文件重复，请删除重复文件';
                allValid = false;
            } else {
                group.errorMessage = null;
            }
        });

        return allValid;
    };

    // 删除每组的数据
    const handleRemove = (file) => {
        console.log(file);
        const baseName = file.name.split('.')[0];
        delete tempFileGroups[baseName];
        organizeFiles();
    };

    // 将分组数据组装成数组
    const organizeFiles = () => {
        console.log(tempFileGroups);
        // fileGroups.value = [];
        Object.keys(tempFileGroups).forEach((baseName) => {
            const findIndex = fileGroups.value.findIndex((group) => group.baseName === baseName);
            console.log(findIndex);
            const groupFiles = tempFileGroups[baseName];
            console.log(groupFiles);
            if (findIndex == -1) {
                fileGroups.value.push({
                    baseName,
                    files: groupFiles,
                    errorMessage: null,
                    roadWidth: null
                });
            }
        });
        // console.log('分组之后',fileGroups.value);
    };

    // 准备自定义上传
    const customRequest = ({ file, onSuccess, onError }) => {
        uploadAllFiles();
    };

    //  将所有文件上传到obs
    const uploadAllFiles = async () => {
        // const uploadPromises = await collectAllUploads();
        collectAllUploads().then(async (res) => {
            try {
                await Promise.all(res);
                // console.log(res,'所有文件上传成功', fileGroups.value);
                emits('getCheckData', fileGroups.value);
            } catch (err) {
                // console.error('上传失败', err);
            }
        });
        // console.log('这是什么',uploadPromises);
    };
    // 收集所有的上传
    const collectAllUploads = () => {
        const uploadPromises = [];
        return new Promise((resolve, reject) => {
            fileGroups.value.forEach((group) => {
                group.files.forEach(async (fileObj) => {
                    if (!fileObj.filePath) {
                        const uploadPromise = await uploadAllFile(fileObj.file, group.baseName);
                        uploadPromises.push(uploadPromise);
                    }
                });
            });
            resolve(uploadPromises);
        });
    };
    // 初始化上传oss方法
    const uploadAllFile = async (file, baseName) => {
        let ossUpload = useOssUpload();
        return new Promise(async (resolve, reject) => {
            updateUploadProgress(file.name, { percent: ossUpload.processSize });
            try {
                let uploadResult = await ossUpload.uploadFile(
                    file,
                    sessionStorage.getItem('obsFilePath') || '',
                );
                if (uploadResult.obsPath) {
                    updateFilePath(file.name, uploadResult.obsPath);
                    updateUploadProgress(file.name, { percent: 100, status: 'success' });
                    resolve(uploadResult);
                } else {
                    throw new Error('上传失败');
                }
            } catch (error) {
                updateFilePath(file.name, '');
                updateUploadProgress(file.name, { percent: 0, status: 'exception' });
                reject(error);
            }
        });
    };

    // 更新进度条到相对应的文件中
    const updateUploadProgress = (fileName, progress) => {
        fileGroups.value.forEach((group) => {
            const file = group.files.find((file) => file.file.name === fileName);
            if (file) {
                file.uploadProgress = progress;
            }
        });
    };

    // 更新路径条到相对应的文件中
    const updateFilePath = (fileName, filePath) => {
        fileGroups.value.forEach((group) => {
            const file = group.files.find((file) => file.file.name === fileName);
            if (file) {
                file.filePath = filePath;
            }
        });
    };

    // 更新路宽
    const changeRoadWidth = () => {
        console.log(fileGroups.value);
    }

    // 删除组中的数据
    const removeGroup = (index) => {
        const baseName = fileGroups.value[index].baseName;
        delete tempFileGroups[baseName];
        fileGroups.value.splice(index, 1);
        console.log(tempFileGroups);
        for (const key in tempFileGroups) {
            if (Object.hasOwnProperty.call(tempFileGroups, key)) {
                const element = tempFileGroups[key];
                if (!element || element.length === 0) {
                    delete tempFileGroups[key];
                }
            }
        }
        if (props.isNeedRenderToMap) {
            // 如果需要渲染地图，需要把已经渲染到地图上的数据从地图上删除
            eventBus.emit('uploadLine', {data: [], name: baseName})
        }
        // organizeFiles();
        emits('getCheckData', fileGroups.value, props.isNeedRenderToMap);
    };

    // 回显数据
    const loadExistingData = (existingData) => {
        console.log(existingData, '避让过来的回显数据');
        fileGroups.value = existingData.map((data) => ({
            baseName: data.fileName ? data.fileName : data.baseName,
            files: data.files.map((file) => ({
                file: { name: file.fileName ? file.fileName : file.name, file: file.file },
                ext: file.fileSuffix ? file.fileSuffix : file.ext,
                filePath: file.filePath,
                uploadProgress: { percent: 100, status: 'success' },
            })),
            errorMessage: null,
        }));

        // 更新 tempFileGroups
        existingData.forEach((data) => {
            tempFileGroups[data.fileName ? data.fileName : data.baseName] = data.files.map(
                (file) => {
                    return {
                        file: { name: file.fileName ? file.fileName : file.file.name, file: file.file },
                        ext: file.fileSuffix ? file.fileSuffix : file.ext,
                        filePath: file.filePath,
                        uploadProgress: { percent: 100, status: 'success' },
                    };
                },
            );
        });
        // console.log(fileGroups.value,'数据处理完成',tempFileGroups);
        organizeFiles();
        emits('getCheckData', fileGroups.value, props.isNeedRenderToMap);
    };
    defineExpose({
        loadExistingData,
        removeGroup
    });
</script>

<style scoped lang="scss">
    .upload-folder {
        margin-top: 20px;
        :deep(.ant-upload-disabled) {
            .up-load-file {
                cursor: not-allowed !important;
            }
        }
        .folder-upload {
            display: flex;
            align-items: center;

            .tip {
                font-size: 12px;
                font-family:
                    PingFangSC,
                    PingFang SC;
                color: #7c8294;
                line-height: 20px;
                margin-left: 16px;
            }
        }

        .up-load-file {
            width: 52px;
            height: 52px;
            background: #f5f6f9;
            border-radius: 4px;
            border: 1px dashed #d2d5e1;
            display: flex;
            justify-content: center;
            align-items: center;
            cursor: pointer;
            transition: border-color linear 0.2s;

            &:hover {
                border-color: #036b64;
            }
        }

        .up-list {
            ul {
                .up-load-list {
                    max-width: 532px;
                    padding: 14px 16px 11px 16px;
                    background: #fafafa;
                    border-radius: 4px;
                    font-size: 12px;
                    font-family:
                        PingFangSC,
                        PingFang SC;
                    color: #363b4d;
                    line-height: 12px;
                    margin: 0 0 12px 0;
                    position: relative;
                    .road-width-input {
                        position: absolute;
                        right: 10px;
                        top: 10px;
                        display: flex;
                        align-items: center;
                        >span {
                            margin-right: 8px;
                        }
                    }
                    &:hover {
                        .upload-shanchu {
                            display: block;
                        }
                    }

                    &:first-child {
                        margin-top: 12px;
                    }

                    cursor: pointer;
                    position: relative;

                    // display: flex;
                    // align-items: center;
                    .upload-name {
                        height: 20px;
                        display: flex;
                        align-items: center;
                        margin-bottom: 13px;
                        position: relative;

                        .file-icon {
                            margin-right: 8px;
                        }

                        .file-name {
                            font-size: 12px;
                            color: #363b4d;
                            line-height: 12px;
                        }

                        .err-msg {
                            color: #ff3e3e;
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

                    .upload-shanchu {
                        display: none;
                        position: absolute;
                        top: -10px;
                        right: -3px;
                        cursor: pointer;
                        color: #bbb;
                    }

                    .upload-error {
                        display: flex;

                        .upload-error-icon {
                            margin-right: 6px;
                            color: #fe830f;
                        }
                    }

                    .upload-success {
                        .upload-success-tip {
                            font-size: 12px;
                            font-family:
                                PingFangSC,
                                PingFang SC;
                            color: #7c8294;
                            line-height: 12px;
                            margin-bottom: 15px;
                        }
                    }

                    .error-font-color {
                        color: red;
                    }

                    .upload-img {
                        font-size: 12px;

                        span {
                            color: #036b64;
                        }
                    }
                }
            }
        }
    }
    :deep(.road-width-input .ant-input-number-input) {
        font-size: 12px;
    }

    /* Add any component-specific styles here */
</style>
