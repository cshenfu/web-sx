<template>
    <div class="box-content">
        <div class="file-handle">
            <a-upload
                name="file"
                :showUploadList="false"
                v-model:file-list="fileList"
                :customRequest="customRequest"
                :before-upload="beforeUpload"
                list-type="picture-card"
                :accept="props.acceptFileType"
                :maxCount="props.maxNum"
                multiple
            >
                <div class="file-handle-desc">
                    <iconpark-icon :size="20" name="shangchuanwenjian"></iconpark-icon>
                </div>
            </a-upload>
            <span class="file-limit-desc">{{ props.fileUpDesc }}</span>
        </div>
        <div class="file-handle-list">
            <a-row :gutter="16" justify="start" v-if="formatFileData">
                <a-col :span="props.simple ? 3 : 6" v-for="item in formatFileData">
                    <div
                        :class="
                            props.simple
                                ? 'handle-list-item handle-list-item-simple'
                                : 'handle-list-item'
                        "
                    >
                        <p v-for="(subItem, subIndex) in item['fileList']" @click.stop="downLoadFileEvent(item['filePath'][subIndex])">
                            <iconpark-icon size="18" name="qitawenjian"></iconpark-icon>
                            <span>{{ subItem.name }}</span> 
                        </p>
                        <p v-if="item['lackfileTypes'].length">
                            <iconpark-icon
                                name="jinggao"
                                size="14"
                                style="color: orange"
                            ></iconpark-icon>
                            缺少{{
                                `${item['lackfileTypes']}`
                            }}文件，请上传对应的文件，或删除该shp文件
                        </p>
                        <!-- 用于可用道路 -->
                        <div class="list-item-select" v-if="props.showRoadType">
                            <a-dropdown :trigger="['click']">
                                <a class="ant-dropdown-link" @click.prevent>
                                    道路类型：{{
                                        roadTypeData[item.name]
                                            ? computedRoadType(roadTypeData[item.name]['type'])
                                            : ' '
                                    }}
                                    <iconpark-icon size="10" name="youjianxia"></iconpark-icon>
                                </a>
                                <template #overlay>
                                    <a-menu @click="roadTypeClickEvent">
                                        <a-menu-item v-for="types in roadType" :key="types.value">
                                            <a
                                                href="javascript:;"
                                                @click="changeRoadType(types.value, item)"
                                                >{{ types.label }}</a
                                            >
                                        </a-menu-item>
                                    </a-menu>
                                </template>
                            </a-dropdown>
                        </div>
                        <!-- 用于避让区域 -->
                        <div class="list-item-select" v-if="props.showAvoidanceType">
                            <a-dropdown :trigger="['click']">
                                <a class="ant-dropdown-link" @click.prevent>
                                    区域类型：{{
                                        avoidanceTypeData[item.name]
                                            ? computedAvoidanceType(avoidanceTypeData[item.name]['type'])
                                            : ' '
                                    }}
                                    <iconpark-icon size="10" name="youjianxia"></iconpark-icon>
                                </a>
                                <template #overlay>
                                    <a-menu @click="avoidanceTypeClickEvent">
                                        <a-menu-item v-for="types in avoidanceType" :key="types.value">
                                            <a
                                                href="javascript:;"
                                                @click="changeAvoidanceType(types.value, item)"
                                                >{{ types.label }}</a
                                            >
                                        </a-menu-item>
                                    </a-menu>
                                </template>
                            </a-dropdown>
                            <!-- <br />
                            <br />
                            <br />
                            <a-dropdown :trigger="['click']">
                                <a class="ant-dropdown-link" @click.prevent>
                                    是否计算：{{
                                        isCalculateTypeData[item.name]
                                            ? computedisCalculateType(isCalculateTypeData[item.name]['isCalculate'])
                                            : ' '
                                    }}
                                    <iconpark-icon size="10" name="youjianxia"></iconpark-icon>
                                </a>
                                <template #overlay>
                                    <a-menu>
                                        <a-menu-item v-for="types in isCalculateType" :key="types.value">
                                            <a
                                                href="javascript:;"
                                                @click="changeAvoidanceisCalculateType(types.value, item)"
                                                >{{ types.label }}</a
                                            >
                                        </a-menu-item>
                                    </a-menu>
                                </template>
                            </a-dropdown> -->
                        </div>
                        <div class="close" @click="delFile(item)">
                            <iconpark-icon name="quxiao"></iconpark-icon>
                        </div>
                    </div>
                </a-col>
            </a-row>
        </div>
    </div>
</template>
<style scoped lang="scss">
    .flex-box {
        > p {
            margin-right: 16px;
            color: #363b4d;
            margin-bottom: 12px;
        }
    }
    .file-handle {
        // width: 52px;
        // height: 52px;
        display: flex;
        align-items: center;
        justify-content: flex-start;
        :deep(.ant-upload.ant-upload-select) {
            flex: none;
            width: 52px;
            height: 52px;
        }
        :deep(.ant-upload-wrapper.ant-upload-picture-card-wrapper) {
            height: 52px;
            flex: none;
            width: 52px;
        }
        .file-handle-desc {
            font-size: 12px;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }
    }
    .file-limit-desc {
        font-size: 12px;
        color: #999;
        margin-left: 16px;
    }
    .file-handle-list {
        margin-top: 12px;
        .handle-list-item {
            background-color: #fafafa;
            padding: 10px 16px;
            font-size: 12px;
            position: relative;
            border-radius: 4px;
            margin-bottom: 24px;
            p {
                margin-bottom: 12px;
                display: flex;
                align-items: center;
                font-size: 12px;
                color: #21263f;
                iconpark-icon {
                    margin-right: 8px;
                }
            }
            .close {
                position: absolute;
                width: 14px;
                height: 14px;
                right: -7px;
                top: -6px;
                opacity: 0.5;
                cursor: pointer;
            }
        }
        .list-item-select {
            position: absolute;
            top: 14px;
            right: 16px;
            iconpark-icon {
                margin-left: 5px;
            }
            a {
                color: #7c8294;
            }
        }
        .handle-list-item-simple {
            background-color: transparent;
            padding: 10px 0;
            margin-top: -4px;
            p {
                position: absolute;
                margin: 0;
                .close {
                    width: 14px;
                    height: 14px;
                    position: absolute;
                    width: 14px;
                    height: 14px;
                    right: -20px;
                    top: -6px;
                    opacity: 0.5;
                    cursor: pointer;
                    // display: none;
                }
                &:hover {
                    .close {
                        display: block;
                    }
                }
            }
        }
    }
</style>
<script setup>
    import { ElMessage } from 'element-plus'
    import { ref, watch } from 'vue';
    import {downLoadFile} from '../../../commonData';
    const geologyId = ref(0); // 地质ID
    const currentFileType = ref(0); // 数据类型
    const fileList = ref([]);
    const overFileLengths = ref(false);
    const props = defineProps({
        // 是否是简易模式，文件不用分组（分成1组）
        simple: {
            type: Boolean,
            default: false,
        },
        // 文件上传描述
        fileUpDesc: {
            type: String,
            default:
                '支持shp文件(1个shp通常有.shp/.shx/.prj/.dbf（这4个格式必须有）.xml/.sbx/.cpg/.sbn文件格式组成) ，最多上传5个shp文件，最大支持50M',
        },
        // 文件最大上传数量
        maxNum: {
            type: Number,
            default: 0,
        },
        // 文件组上限
        maxGroupNum: {
            type: Number,
            default: 1,
        },
        // 文件最大上传大小
        maxFileSize: {
            type: Number,
            default: 50,
        },
        // 是否显示道路类型
        showRoadType: {
            type: Boolean,
            default: false,
        },
        showAvoidanceType: {
            type: Boolean,
            default: false,
        },
        // 接受文件上传类型
        acceptFileType: {
            type: String,
            default: '',
        },
        // 必上传文件格式
        essentialFileType: {
            type: Array,
            default: () => {
                return [];
            },
        },
    });
    // 上传的文件验证是否不缺少必要文件
    const fileAllCheckKey = ref(true);
    const formatFileData = ref(null);
    const isCalculateType = ref([
        {
            label: '是',
            value: 1,
        },
        {
            label: '否',
            value: 0,
        },
    ]);
    const avoidanceType = ref([
        {
            label: '不可用',
            value: 1,
        },
        {
            label: '房屋',
            value: 2,
        },
        {
            label: '电线杆',
            value: 3,
        },
        {
            label: '水系',
            value: 4,
        },
        {
            label: '独立地物',
            value: 5,
        },
        {
            label: '林地',
            value: 6,
        },
        {
            label: '耕地',
            value: 7,
        },
        // {
        //     label: '地貌',
        //     value: 8,
        // },
        // {
        //     label: '植被',
        //     value: 9,
        // },
        // {
        //     label: '风机设施',
        //     value: 10,
        // },
        // {
        //     label: '光伏设施',
        //     value: 11,
        // },
    ]);
    const avoidanceTypeData = ref({});
    const isCalculateTypeData = ref({});
    const roadType = ref([
        {
            label: '高速',
            value: 1,
        },
        {
            label: '国道',
            value: 2,
        },
        {
            label: '省道',
            value: 3,
        },
        {
            label: '县道',
            value: 4,
        },
        {
            label: '乡道',
            value: 5,
        },
        {
            label: '村道',
            value: 6,
        },
        {
            label: '小路',
            value: 7,
        },
        {
            label: '铁路',
            value: 8,
        },
    ]);
    const roadTypeData = ref({});
    // 文件上传前验证
    const beforeUpload = (file) => {
        if (file.size > props.maxFileSize * 1024 * 1024) {
            ElMessage.error('文件大小超过限制，请重新上传！');
            return false;
        }
        const index = fileList.value.findIndex((item) => {
            return item.name === file.name;
        });
        if (index !== -1) {
            ElMessage.error('文件名重复，请勿重复上传！');
            return false;
        }
        if (props.maxNum == 1) {
            fileList.value = [file];
        } else {
            fileList.value.push(file);
        }
        formatFileEvent();
    };
    const customRequest = () => {
        // console.log('自定义上传');
    }
    // 检测上传的文件中是否缺少必传格式文件
    const checkFileAllCheckKey = () => {
        fileAllCheckKey.value = true;
        if (!formatFileData.value) {
            fileAllCheckKey.value = true;
            return false;
        }
        // 重新组合文件数据放到fileList中,去除文件名重复数据和不合格的数据
        fileList.value = [];
        for (const key in formatFileData.value) {
            if (Object.hasOwnProperty.call(formatFileData.value, key)) {
                const element = formatFileData.value[key];
                fileList.value = fileList.value.concat(element.fileList);
                if (element.lackfileTypes.length > 0) {
                    fileAllCheckKey.value = false;
                }
            }
        }
    };
    const formatFileEvent = () => {
        const originFormatFileData = JSON.parse(JSON.stringify(formatFileData.value));
        formatFileData.value = {};
        if (fileList.value.length > 0) {
            for (let index = 0; index < fileList.value.length; index++) {
                const ele = fileList.value[index];
                const fileNameFormat = ele.name.split('.')[0];
                const fileTypeFormat = '.' + ele.name.split('.')[ele.name.split('.').length - 1];
                console.log(fileNameFormat,fileTypeFormat);
                if (formatFileData.value[fileNameFormat]) {
                    const index = formatFileData.value[fileNameFormat]['fileList'].findIndex(
                        (item) => {
                            return item.name === ele.name;
                        },
                    );
                    if (index === -1) {
                        formatFileData.value[fileNameFormat]['fileList'].push(
                            ele.originFileObj ? ele.originFileObj : ele,
                        );
                        formatFileData.value[fileNameFormat]['fileTypes'].push(fileTypeFormat);
                        // 防止回显的文件重复上传OBS
                        if (ele.filePath) {
                            formatFileData.value[fileNameFormat]['filePath'].push(ele.filePath)
                        }
                    }
                } else {
                    // 如果上传文件组类超过规定数量进行相应拦截
                    if (Object.keys(formatFileData.value).length >= props.maxGroupNum) {
                        overFileLengths.value = true;
                        ElMessage.error('最多上传' + props.maxGroupNum + '个文件组');
                        return false;
                    } else {
                        overFileLengths.value = false;
                    }
                    formatFileData.value[fileNameFormat] = {
                        name: fileNameFormat,
                        fileList: [],
                        fileTypes: [],
                        filePath: [],
                        geologyId: geologyId.value,
                        fileType: currentFileType.value,
                        // type: originFormatFileData[fileNameFormat] ? originFormatFileData[fileNameFormat]['type'] : 1
                    };
                    if (props.showRoadType) {
                        // 在不存在文件组路型数据时进行初始化
                        if (!roadTypeData.value[fileNameFormat] || !roadTypeData.value[fileNameFormat]['type']) {
                            roadTypeData.value[fileNameFormat] = {};
                            roadTypeData.value[fileNameFormat]['type'] = 1;
                            formatFileData.value[fileNameFormat]['type'] = originFormatFileData[fileNameFormat] ? originFormatFileData[fileNameFormat]['type'] : 1;
                        }
                    }
                    if (props.showAvoidanceType) {
                        // 在不存在文件组路型数据时进行初始化
                        if (!avoidanceTypeData.value[fileNameFormat] || !avoidanceTypeData.value[fileNameFormat]['type']) {
                            avoidanceTypeData.value[fileNameFormat] = {};
                            avoidanceTypeData.value[fileNameFormat]['type'] = 1;
                            formatFileData.value[fileNameFormat]['type'] = originFormatFileData[fileNameFormat] ? originFormatFileData[fileNameFormat]['type'] : 1;
                        }
                    }
                    formatFileData.value[fileNameFormat]['fileList'].push(
                        ele.originFileObj ? ele.originFileObj : ele,
                    );
                    formatFileData.value[fileNameFormat]['fileTypes'].push(fileTypeFormat);
                    // 防止回显的文件重复上传OBS
                    if (ele.filePath) {
                        formatFileData.value[fileNameFormat]['filePath'].push(ele.filePath)
                    }
                }
                // 验证缺少的文件类型
                const checkFilesType = () => {
                    if (props.essentialFileType.length > 0) {
                        formatFileData.value[fileNameFormat]['lackfileTypes'] = [];
                        props.essentialFileType.map((ele) => {
                            if (
                                formatFileData.value[fileNameFormat]['fileTypes'].indexOf(ele) ===
                                -1
                            ) {
                                formatFileData.value[fileNameFormat]['lackfileTypes'].push(ele);
                            }
                        });
                    } else {
                        formatFileData.value[fileNameFormat]['lackfileTypes'] = [];
                    }
                };
                checkFilesType();
            }
        } else {
            formatFileData.value = null;
        }
        checkFileAllCheckKey();
    };
    const roadTypeClickEvent = ({ key }) => {
        // console.log(key);
    };
    const avoidanceTypeClickEvent = ({ key }) => {
        // console.log(key);
    };
    const changeRoadType = (key, item) => {
        if (!roadTypeData.value[item.name]) {
            roadTypeData.value[item.name] = {};
        }
        roadTypeData.value[item.name]['type'] = key;
        formatFileData.value[item.name]['type'] = key;
        
        for (const key in formatFileData.value) {
            if (Object.hasOwnProperty.call(formatFileData.value, key)) {
                const element = formatFileData.value[key];
                if (!element.type) {
                    // 默认道路类型高速
                    element.type = 1;
                }
            }
        }
    };
    const changeAvoidanceType = (key, item) => {
        if (!avoidanceTypeData.value[item.name]) {
            avoidanceTypeData.value[item.name] = {};
        }
        avoidanceTypeData.value[item.name]['type'] = key;        
        for (const key in formatFileData.value) {
            formatFileData.value[key]['type'] = avoidanceTypeData.value[key]['type'] ? avoidanceTypeData.value[key]['type'] : 1;
        }
    };
    const changeAvoidanceisCalculateType = (key, item) => {
        if (!isCalculateTypeData.value[item.name]) {
            isCalculateTypeData.value[item.name] = {};
        }
        if ('isCalculate' in isCalculateTypeData.value[item.name]) {
            isCalculateTypeData.value[item.name]['isCalculate'] = null;
        }
        isCalculateTypeData.value[item.name]['isCalculate'] = key;
        for (const key in formatFileData.value) {
            console.log('formatFileData[key]',formatFileData.value[key]);
            formatFileData.value[key]['isCalculate'] = (isCalculateTypeData.value[key]['isCalculate'] == 0 || isCalculateTypeData.value[key]['isCalculate'] == 1) ? isCalculateTypeData.value[key]['isCalculate'] : 0;
        }
    }
    const computedRoadType = (value) => {
        const index = roadType.value.findIndex((ele) => ele.value === value);
        return index !== -1 ? roadType.value[index].label : ' ';
    };
    const computedAvoidanceType = (value) => {
        const index = avoidanceType.value.findIndex((ele) => ele.value === value);
        return index !== -1 ? avoidanceType.value[index].label : ' ';
    };
    const computedisCalculateType = (value) => {
        const index = isCalculateType.value.findIndex((ele) => ele.value === value);
        return index !== -1 ? isCalculateType.value[index].label : ' ';
    };
    const delFile = (item) => {
        // console.log(formatFileData, roadTypeData);
        // debugger;
        if (formatFileData.value[item.name]['fileList'].length) {
            formatFileData.value[item.name]['type'] = 1;
            formatFileData.value[item.name]['isCalculate'] = 0;
            formatFileData.value[item.name]['fileList'].map((ele) => {
                fileList.value.map((item, index) => {
                    if (item.uid === ele.uid) {
                        fileList.value.splice(index, 1);
                    }
                });
            });
        }
        delete avoidanceTypeData.value[item.name];
        delete isCalculateTypeData.value[item.name];
        delete formatFileData.value[item.name];
        delete roadTypeData.value[item.name];
        console.log(formatFileData, roadTypeData);
        checkFileAllCheckKey();
    };
    // 编辑详情情况下进行文件回显
    const echoFileListData = (data, id, type) => {
        console.log('echoFileListData', data, id, type);
        geologyId.value = id;
        currentFileType.value = type;
        formatFileData.value = data || null;
        fileList.value = [];
        roadTypeData.value = {};
        avoidanceTypeData.value = {};
        isCalculateTypeData.value = {};
        if (data && Object.keys(data).length) {
            for (const key in data) {
                if (Object.hasOwnProperty.call(data, key)) {
                    const element = data[key];
                    fileList.value = fileList.value.concat(element.fileList);
                    roadTypeData.value[key] = {};
                    avoidanceTypeData.value[key] = {};
                    isCalculateTypeData.value[key] = {};
                    roadTypeData.value[key]['type'] = element.type;
                    avoidanceTypeData.value[key]['type'] = element.type;
                    isCalculateTypeData.value[key]['isCalculate'] = element.isCalculate;
                }
            }
        }
        // 重新梳理文件组合
        // formatFileEvent();
        // formatFileData.value = data || {};
    };
    // 手动清空文件数据
    const clearAllFilesData = () => {
        fileList.value = [];
        roadTypeData.value = {};
        formatFileData.value = null;
    };
    // 下载文件
    const downLoadFileEvent = (file) => {
        console.log('下载文件', file);
        if (file && file.indexOf('.com') > -1) {
            window.open(file);
        } else if (file && file.filePath) {
            if (file.filePath.indexOf('.com') > -1) {
                window.open(file.filePath)
            } else {
                downLoadFile(file.path);
            }
        }
    }
    defineExpose({
        formatFileData,
        roadTypeData,
        fileAllCheckKey,
        echoFileListData,
        clearAllFilesData,
    });
</script>
