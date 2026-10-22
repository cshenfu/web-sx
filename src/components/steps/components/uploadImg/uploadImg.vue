<template>
    <div class="flex-horizontal" v-loading="[checkUpLoading, true]">
        <a-upload
            class="uploadImg"
            list-type="picture-card"
            :accept="props.fileType"
            :disabled="maxFileLength <= fileList.length"
            :showUploadList="false"
            :customRequest="customRequest"
            :before-upload="beforeUpload"
        >
            <div style="margin-top: 8px">
                <iconpark-icon :size="20" name="shangchuantupian"></iconpark-icon>
            </div>
        </a-upload>
        <ul class="file-components">
            <li class="file-item" v-for="(file, fileIndex) in fileList">
                <iconpark-icon
                    class="close-file-item"
                    name="guanbi"
                    @click="delFileItem(fileIndex)"
                ></iconpark-icon>
                <a-image :src="file.url" />
                <!-- <img :src="file.url" alt="" /> -->
            </li>
        </ul>
    </div>
</template>
<style scoped lang="scss">
    @import './uploadImg.scss';
</style>
<script setup>
    import { ref, onMounted } from 'vue';
    import { useOssUpload } from '@/components/ossClient/modifytUpload';
    import { getCertificate } from '@/api/modules/base.js';

    import { extractOssPath } from '@/utils/utils';
    const checkUpLoading = ref(false);
    onMounted(() => {});
    let ossUpload = useOssUpload();
    const props = defineProps({
        fileType: {
            deep: true,
            type: String,
            default: '.png,.jpg,.jpge',
        },
        maxFileLength: {
            deep: true,
            type: Number,
            default: 2,
        },
        obsFilePath: {
            deep: true,
            type: String,
            default: '',
        },
    });
    const fileList = ref([]);
    const fileListInfo = ref([]);
    // 上传前验证
    const beforeUpload = async (file) => {
        checkUpLoading.value = true;
        let uploadResult = await ossUpload.uploadFile(file, props.obsFilePath);
        fileList.value.push({
            url: uploadResult.obsPath,
            file: file,
        });
        fileListInfo.value.push({
            fileName: file.name,
            filePath: uploadResult.obsPath,
            suffix: '.' + file.name.split('.')[file.name.split('.').length - 1],
        });
        checkUpLoading.value = false;
    };
    // 删除图片
    const delFileItem = (index) => {
        fileList.value.splice(index, 1);
        fileListInfo.value.splice(index, 1);
    };
    // 自定义上传文件
    const customRequest = (file) => {
        fileListInfo.value.length && resetFileUrl(fileListInfo.value);
    };
    // 获取上传图片的文件信息
    const getData = () => {
        fileListInfo.value.length &&
            fileListInfo.value.map((ele) => {
                const name = decodeURIComponent(ele.filePath.split('?')[0].split('od/')[1]);
                if (ele.filePath) {
                    ele.fileName = name;
                    ele.suffix = name.split('.')[1];
                }
                const path = extractOssPath(ele.filePath);
                path && (ele.filePath = path);
            });
        // debugger;
        return fileListInfo.value;
    };
    // 根据项目ID回显图片信息
    const updateFileData = async (data) => {
        fileList.value = [];
        fileListInfo.value = [];
        if (data && data.length) {
            const files = ref([]);
            const infos = ref([]);
            for (let index = 0; index < data.length; index++) {
                const ele = data[index];
                const path = ele.filePath;
                const formatPath = decodeURIComponent(path.split('?')[0]);
                files.value[index] = {
                    file: null,
                    url: await ossUpload.getFileUrl(decodeURIComponent(formatPath ? formatPath : path)),
                };
                infos.value[index] = {
                    fileName: ele.fileName,
                    filePath: ele.filePath,
                    suffix: '.' + ele.fileName.split('.')[ele.fileName.split('.').length - 1],
                };
                if (index === data.length - 1) {
                    fileList.value = files.value;
                    fileListInfo.value = infos.value;
                }
            }
        }
    };
    // 回显图片路径逻辑处理
    const resetFileUrl = async (fileInfos) => {
        fileListInfo.value = [];
        fileList.value = [];
        if (fileInfos.length) {
            for (let index = 0; index < fileInfos.length; index++) {
                const ele = fileInfos[index];
                const path = ele.filePath;
                const formatPath = decodeURIComponent(path.split('?')[0]);
                const filePath = extractOssPath(formatPath);
                await ossUpload.getFileUrl(decodeURIComponent(filePath ? filePath : path));
                const resultPath = ossUpload.urlPath;
                fileListInfo.value[index] = {};
                fileListInfo.value[index]['filePath'] = extractOssPath(
                    resultPath.value,
                    null,
                    true,
                );

                fileList.value[index] = {};
                fileList.value[index]['url'] = resultPath.value;
            }
        }
    };
    defineExpose({
        getData,
        updateFileData,
    });
</script>
