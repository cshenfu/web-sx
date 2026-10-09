<template>
    <div class="add-current-power">
        <div class="add-power-right">
            <CommonAddDataHeader :selectData="selectData"></CommonAddDataHeader>
            <div class="add-power-right-content">
                <h4 class="content-title">
                    <img src="@/assets/img/user/detail-title.png" alt="" />
                    项目基本信息
                </h4>
                <h4 class="content-second-title require-item"><span>太阳能资源数据</span></h4>
                <div class="list-content">
                    <Editor ref="powerEditorRef" :height="'400px'"
                        v-model:dataHtml="dataDetail.resourceData">
                    </Editor>
                </div>
                <h4 class="content-second-title">太阳能资源分布图</h4>
                <div class="list-content" >
                    <a-image style="width: 50px;font-size: 12px;" :src="dataDetail.filePath" alt="" v-if="dataDetail.filePath"></a-image>
                    <span v-else class="empty-content">未上传数据</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
    import { ref, reactive, onBeforeMount, onMounted,onUnmounted, nextTick } from 'vue';
    import { useRoute, useRouter } from 'vue-router';
    import CommonAddDataHeader from '@/components/linkage/CommonAddDataHeader';
    import {getSolarEnergyDetail } from '@/api/modules/sourceData/sloarManage';
    import { ElMessage } from 'element-plus'
    import Editor from '@/components/editor/Editor.vue';
    const route = useRoute();

    const router = useRouter();

    const selectData = ref({
        provice: '',
        code: [],
        num: 12,
        noNum: 0,
    });
    const dataDetail = reactive({
        resourceData: '',
        filePath:''

    });
    // 获取左侧省市区选中数据
    const getSelectAddress = (value) => {
        const data = value.data;
        let str = '';
        selectData.value.code = [];
        for (let index = 0; index <= value.type; index++) {
            str +=
                (index == 0 || !data[index]['areaName'] ? '' : '/') +
                (data[index]['areaName'] ? data[index]['areaName'] : '');
            selectData.value.code.push(data[index]['areaCode']);
        }
        selectData.value.provice = str;
    };
    // 初始化详情
    const initDetail = async () => {
        const res = await getSolarEnergyDetail(route.query.id)
        if (res.code == 200) { 
            dataDetail.resourceData = res.data.resourceData
            selectData.value.provice = res.data.areaNameStr
            dataDetail.filePath = res.data.img.filePath
            if(res.data.addressCode){
                let { provinceCode, provinceName, cityCode, cityName, districtCode, districtName } = res.data?.addressCode || {};
                let provinceObj = {
                    'areaCode': provinceCode,
                    'areaName': provinceName,
                };
                let cityObj = {
                    'areaCode': cityCode,
                    'areaName': cityName,
                };
                let districtObj = {
                    'areaCode': districtCode,
                    'areaName': districtName,
                };

                let linkAreaCode;

                switch (res.data.rangeType) {
                    case 1:
                        linkAreaCode = [provinceObj];
                        break;
                    case 2:
                        linkAreaCode = [provinceObj, cityObj];
                        break;
                    default:
                        linkAreaCode = [provinceObj, cityObj, districtObj];
                        break;
                }
                nextTick(() => {
                    getSelectAddress({
                        data: linkAreaCode,
                        type: res.data.rangeType - 1
                    })
                })
                
            }
        }

    };
    onBeforeMount(() => {
    });
    onMounted(() => {
        if(route.query.id) {
            initDetail()
        }
    });
    onUnmounted(() => {

    });
</script>
<style scoped lang="scss">
    .add-current-power {
        background-color: #fff;
        padding: 24px 0 24px 24px;
        display: flex;

        .add-power-right {
            width: 95%;
            // margin-left: 26px;
            flex: 1;
            .add-power-right-content {
                height: calc(100vh - 190px);
                overflow: auto;

                .content-title {
                    color: #3d435d;
                    display: flex;
                    align-items: center;
                    margin: 24px 0 20px 0;

                    img {
                        height: 14px;
                        margin-right: 8px;
                    }

                    button {
                        margin-left: auto;
                        display: flex;
                        align-items: center;

                        iconpark-icon {
                            margin-right: 5px;
                        }
                    }
                }

                .require-item {
                    span {
                        &::before {
                            display: inline-block;
                            margin-inline-end: 4px;
                            color: #ff4d4f;
                            font-size: 14px;
                            font-family: SimSun, sans-serif;
                            line-height: 1;
                            content: '*';
                        }
                    }
                }

                .content-second-title {
                    margin-bottom: 5px;
                    color: #3d435d;
                }

                .no-require-label {
                    margin-left: 10px;
                }

                .self-label {
                    font-size: 14px;
                    color: #5c6170;
                    line-height: 12px;

                    &::before {
                        display: inline-block;
                        margin-inline-end: 4px;
                        color: #ff4d4f;
                        font-size: 14px;
                        font-family: SimSun, sans-serif;
                        line-height: 1;
                        content: '*';
                    }
                }
                .self-label-no-require {
                    font-size: 14px;
                    color: #5c6170;
                    line-height: 12px;
                    margin-left: 10px;
                }
            }
        }
        .list-content {
            margin: 14px 0;
            .empty-content {
                color: #363B4D;
                font-weight: 500;
                margin-bottom: 24px
            }
        }
    }
</style>
