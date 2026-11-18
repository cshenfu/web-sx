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
            <template v-for="(file, fileIndex) in fileList" :key="fileIndex">
                <li
                    class="file-item"
                    v-if="fileListInfo[fileIndex] && fileListInfo[fileIndex]['suffix'] !== '.pdf'"
                >
                    <iconpark-icon
                        class="close-file-item"
                        name="guanbi"
                        @click="delFileItem(fileIndex)"
                    ></iconpark-icon>
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
                        fileListInfo[fileIndex] &&
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
    import { ref } from 'vue';
    import { useOssUpload } from '../ossClient/index';
    import { getTempUrl } from '@/api/modules/upload'; // 新增：通过 objectKey 获取可访问 url

    let obsUpload = useOssUpload();

    const props = defineProps({
        fileType: {
            deep: true,
            type: String,
            default: '.png,.jpg,.jpeg',
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
        projectId: {
            type: [String, Number],
            default: null,
        },
    });

    const spinning = ref(false);
    const fileList = ref([]);
    const fileListInfo = ref([]);

    // 判断是否为完整 http(s) 地址
    const isFullUrl = (path) => /^https?:\/\//i.test(path || '');

    // 完整 url -> objectKey（去掉协议+域名部分）
    const toObjectKey = (path) => {
        if (!path) return '';
        return isFullUrl(path) ? path.replace(/^https?:\/\/[^/]+/, '') : path;
    };

    // 上传前验证 + 手动上传
    const beforeUpload = async (file) => {
        spinning.value = true;
        try {
            const uploadResult = await obsUpload.uploadFile(file, '', { projectId: props.projectId });
            const obsPath = uploadResult.obsPath; // objectKey

            // 关键修复：通过路径换取可访问的 url 用于预览
            let previewUrl = obsPath;
            try {
                const urlRes = await getTempUrl(obsPath);
                previewUrl = urlRes?.data || obsPath;
            } catch (urlError) {
                console.error('获取图片访问地址失败', urlError);
            }

            fileList.value.push({
                url: previewUrl, // 预览用完整 url
                file: file,
            });
            fileListInfo.value.push({
                fileName: file.name,
                filePath: obsPath, // 提交给后端 / 正则解析用 objectKey
                suffix: '.' + file.name.split('.').pop(),
            });
        } catch (error) {
            console.error('上传文件失败', error);
        } finally {
            spinning.value = false;
        }
        // 已手动完成上传，返回 false 阻止 a-upload 默认行为
        return false;
    };

    // 删除图片
    const delFileItem = (index) => {
        fileList.value.splice(index, 1);
        fileListInfo.value.splice(index, 1);
    };

    // 自定义上传文件（保留占位，实际未使用）
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
        if (!data || !data.length) return;

        const files = [];
        const infos = [];

        for (let index = 0; index < data.length; index++) {
            const item = data[index];
            // isImgOrPdf 模式下 item 可能为 url 字符串
            const ele = props.isImgOrPdf ? isImgOrPdf(item) : item;
            // 统一存 objectKey；兼容传入完整 url 或 objectKey 两种情况
            const objectKey = toObjectKey(isFullUrl(item) ? item : ele.filePath || item);

            // 预览 url：完整 url 直接用；objectKey 则换取临时 url
            let previewUrl = isFullUrl(item) ? item : '';
            if (!previewUrl) {
                try {
                    const urlRes = await getTempUrl(objectKey);
                    previewUrl = urlRes?.data || objectKey;
                } catch (urlError) {
                    console.error('回显获取图片访问地址失败', urlError);
                    previewUrl = objectKey;
                }
            }

            infos.push({
                suffix: ele.suff || ele.suffix,
                fileName: ele.fileName,
                filePath: objectKey, // 统一为 objectKey，与 beforeUpload 保持一致
            });
            files.push({
                file: null,
                url: previewUrl,
            });
        }

        fileList.value = files;
        fileListInfo.value = infos;
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