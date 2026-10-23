<template>
    <div class="flex-horizontal">
        <a-spin :spinning="spinning">
            <a-upload
                class="uploadImg"
                list-type="picture-card"
                :accept="props.fileType"
                :disabled="maxFileLength <= fileList.length"
                :showUploadList="false"
                :customRequest="customRequest"
                :before-upload="beforeUpload"
            >
                <slot name="selfContent" v-if="$slots.selfContent"></slot>
                <div style="margin-top: 8px" v-if="!$slots.selfContent">
                    <iconpark-icon :size="20" name="shangchuantupian"></iconpark-icon>
                </div>
            </a-upload>
        </a-spin>
        <ul class="file-components">
            <template v-for="(file, fileIndex) in fileList">
                <li class="file-item" v-if="fileListInfo[fileIndex]['suffix'] !== '.pdf'">
                    <iconpark-icon
                        class="close-file-item"
                        name="guanbi"
                        @click="delFileItem(fileIndex)"
                    ></iconpark-icon>
                    <!-- <img :src="file.url" alt="" /> -->
                    <a-image
                        style="width: 50px; height: 50px; font-size: 12px"
                        :src="file.url"
                    ></a-image>
                </li>
                <p
                    class="filePDF"
                    v-if="
                        fileListInfo &&
                        fileListInfo.length &&
                        fileListInfo[fileIndex]['suffix'] == '.pdf'
                    "
                >
                    <iconpark-icon
                        class="close-file-item"
                        name="guanbi"
                        @click="delFileItem(fileIndex)"
                    ></iconpark-icon>
                    <iconpark-icon size="20" name="pdf" style="margin-right: 8px"></iconpark-icon>
                    <span>{{ fileListInfo[fileIndex]['fileName'] }}</span>
                </p>
            </template>
        </ul>
    </div>
</template>
<style scoped lang="scss">
    @import './uploadImg.scss';
</style>
<script setup>
    // import { toUnicode } from 'punycode';
    import { ref, onMounted } from 'vue';
    import { useOssUpload } from '../ossClient/index';
    let obsUpload = useOssUpload();
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
        isImgOrPdf: {
            type: Boolean,
            default: false,
        },
    });
    const spinning = ref(false);
    const fileList = ref([]);
    const fileListInfo = ref([]);
    // 上传前验证
    const beforeUpload = async (file) => {
        spinning.value = true;
        console.log(file, '-----', obsUpload);
        let uploadResult = await obsUpload.uploadFile(file);
        console.log(uploadResult);
        fileList.value.push({
            url: uploadResult.obsPath,
            file: file,
        });
        fileListInfo.value.push({
            fileName: file.name,
            filePath: uploadResult.obsPath,
            suffix: '.' + file.name.split('.')[file.name.split('.').length - 1],
        });
        spinning.value = false;
        console.log(fileListInfo.value);
    };
    // 删除图片
    const delFileItem = (index) => {
        fileList.value.splice(index, 1);
        fileListInfo.value.splice(index, 1);
    };
    // 自定义上传文件
    const customRequest = (file) => {
        console.log(file);
    };
    // 获取上传图片的文件信息
    const getData = () => {
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
                const ele = props.isImgOrPdf ? isImgOrPdf(data[index]) : data[index];
                const path = ele.filePath;
                // await obsUpload.getFileUrl(data);
                infos.value.push({
                    suffix: ele.suff || ele.suffix,
                    fileName: ele.fileName,
                    // filePath: obsUpload.urlPath,
                    // 使用的长路径
                    filePath: data[index],
                });
                files.value.push({
                    file: null,
                    // url: obsUpload.urlPath,
                    // 使用的长路径
                    url: data[index],
                });
                if (index === data.length - 1) {
                    fileList.value = files.value;
                    fileListInfo.value = infos.value;
                }
            }
        }
    };
    // 回显图片路径逻辑处理
    const isImgOrPdf = (url) => {
        const filename = url.split('/clue/follow/').pop();
        const extension = filename.split('.').pop().toLowerCase();
        let result = {
            fileName: filename,
            suffix: `.${extension}`,
        };
        return result;
    };

    defineExpose({
        getData,
        updateFileData,
        isImgOrPdf,
        spinning,
    });
</script>
