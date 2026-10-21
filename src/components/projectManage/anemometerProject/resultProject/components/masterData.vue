<template>
    <div class="master-data-template">
        <ul class="flex-column" v-if="props.masterData.length">
            <li v-for="(item, index) in props.masterData">
                <span v-html="item.name" style="display: flex; align-items: center"></span>
                <span
                    v-if="item.isDownLoad"
                    style="cursor: pointer; display: flex; align-items: center; color: #0389ea"
                    ><i @click="handleDownload(item)">
                        <iconpark-icon
                            name="xiazai"
                            style="color: #0389ea; margin-right: 8px"
                        ></iconpark-icon
                        >点击下载</i
                    >
                    <i v-if="item.dataIndex == 'wordReportPath'" @click="wordPreview(item)"
                        ><eye-outlined style="margin-right: 8px;" />点击预览</i
                    >
                </span>
                <span v-else v-html="item.data"></span>
            </li>
        </ul>
    </div>
</template>
<script setup>
    import { message } from 'ant-design-vue';
    import { useProjectHandle } from '../../../windProject/useProject.js';
    import { PACKAGE_TYPE_TT } from '@/assets/js/static.js';
    import { useOssUpload } from '@/components/ossClient/modifytUpload.js';
    import { EyeOutlined } from '@ant-design/icons-vue';
    const ossUpload = useOssUpload();
    const props = defineProps({
        masterData: {
            type: Array,
            default: () => [],
        },
    });
    // 下载报告
    const handleDownload = async (item) => {
        console.log(item.data, '下载链接');
        if (item.data) {
            let { checkPackage } = await useProjectHandle();
            // 试用用户无法使用下载功能
            checkPackage(PACKAGE_TYPE_TT['anemometer'], true).then((res) => {
                console.log(res, 'res');
                if (res.isEffective || !res.isTry) {
                    item &&
                        ossUpload.getFileUrl(item.data).then((res) => {
                            window.open(res);
                        });
                }
            });
        } else {
            message.error('暂无生成报告');
        }
    };
    // 预览报告
    const wordPreview = (item) => {
        console.log(item);
        if (item.data) {
            sessionStorage.setItem('wordReportObjectKey', item.data || '');
            window.open(location.origin + '/wordPreview');
        } else {
            message.error('暂无生成报告');
        }
    };
</script>
<style scoped lang="scss">
    $primary-color: var(--theme);
    $primary-light-color: var(--themeLight);
    .master-data-template {
        width: 584px;
        max-height: calc(100vh - 240px);
        overflow: auto;
        background: rgba(255, 255, 255, 0.94);
        box-shadow: 0px 0px 14px 0px rgba(255, 255, 255, 0.16);
        border-radius: 0px 0px 4px 4px;
        border-top: 2px solid $primary-color;
        pointer-events: all;
        ul {
            overflow: auto;
            li {
                display: flex;
                align-items: stretch;
                border-bottom: 1px solid rgba(0, 0, 0, 0.2);
                >span {
                    // color: $primary-color;
                    line-height: 16px;
                    font-size: 14px;
                    flex: 1;
                    padding: 16px;
                    color: #333;
                    font-weight: normal;
                    &:nth-child(2n + 1) {
                        flex: none;
                        width: 200px;
                        border-right: 1px solid rgba(0, 0, 0, 0.2);
                    }
                    i {
                        font-style: normal;
                        margin-right: 24px;
                    }
                }
            }
        }
    }
</style>
