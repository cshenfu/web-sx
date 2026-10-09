<template>
    <div class="geology-detail-component">
        <h4 class="content-title">
            <!-- <img src="../../../assets/img/user/detail-title.png" alt="" /> -->
            项目基本信息
        </h4>
        <div class="content-body">
            <a-row>
                <a-col :span="8">
                    <span>数据编号</span>
                    <p>{{ params.geologyCode }}</p>
                </a-col>
                <a-col :span="8">
                    <span>所属区域</span>
                    <p>
                        <template v-if="params.addressCode">
                            {{ params.addressCode.provinceName }}
                            <template v-if="params.addressCode.cityName">
                                / {{ params.addressCode.cityName }}</template
                            >
                            <template v-if="params.addressCode.districtName">
                                / {{ params.addressCode.districtName }}</template
                            >
                        </template>
                        <template v-else>
                            {{ params.affiliationCodeName }}
                        </template>
                    </p>
                </a-col>
                <a-col :span="8">
                    <span>数据范围</span>
                    <p>{{
                        params.suitRange == 1
                            ? '全域通用'
                            : params.suitRange == 2
                              ? '拐点坐标'
                              : '--'
                    }}</p>
                </a-col>
            </a-row>
            <!-- <a-row>
                <a-col :span="8">
                    <span>省数据</span>
                    <p>sd23429847</p>
                </a-col>
                <a-col :span="8">
                    <span>市总量/覆盖量/覆盖率</span>
                    <p>sldkjfsljf</p>
                </a-col>
                <a-col :span="8">
                    <span>区总量/覆盖量/覆盖率</span>
                    <p>sldkjfsljf</p>
                </a-col>
            </a-row> -->
            <a-row>
                <a-col :span="24">
                    <span>地勘报告</span>
                    <p>
                        <a
                            @click="goJump(item.filePath)"
                            href="javascript:;"
                            v-for="item in filterFile(3, params.geologyFileRespList)"
                            >{{ item.fileName }}</a
                        >
                    </p>
                </a-col>
            </a-row>
            <a-row>
                <a-col :span="24">
                    <span>地形图</span>
                    <p>
                        <template v-if="filterFile(1, params.geologyFileRespList).length > 0">
                            <a
                                @click="goJump(item.filePath)"
                                href="javascript:;"
                                v-for="item in filterFile(1, params.geologyFileRespList)"
                                >{{ item.fileName }}</a
                            >
                        </template>
                        <span v-else>--</span>
                    </p>
                </a-col>
            </a-row>
            <a-row>
                <a-col :span="24">
                    <span>粗糙度</span>
                    <p>
                        <template v-if="filterFile(2, params.geologyFileRespList).length > 0">
                            <a
                                @click="goJump(item.filePath)"
                                href="javascript:;"
                                v-for="item in filterFile(2, params.geologyFileRespList)"
                                >{{ item.fileName }}</a
                            >
                        </template>
                        <span v-else>--</span>
                    </p>
                </a-col>
            </a-row>
        </div>
        <h4 class="content-title">
            <!-- <img src="../../../assets/img/user/detail-title.png" alt="" /> -->
            岩土层厚度及承载力特征
        </h4>
        <soilProperty
            :detailData="params.geologyRockSoilRespList"
            style="margin-bottom: 20px"
            :isEdit="false"
        ></soilProperty>
        <h4 class="content-title" style="margin-top: 20px">
            <!-- <img src="../../../assets/img/user/detail-title.png" alt="" /> -->
            地震参数信息
        </h4>
        <div class="content-body">
            <a-row>
                <a-col :span="8">
                    <span>场址地震动峰值加速度(g)</span>
                    <p>{{ params.epa }}</p>
                </a-col>
                <a-col :span="8">
                    <span>场址地震基本烈度(级)</span>
                    <p>{{ params.ld ? lieObj[params.ld] : '--' }}</p>
                </a-col>
                <a-col :span="8">
                    <span>地震动反应谱特征周期(s)</span>
                    <p>{{ params.tg }}</p>
                </a-col>
                <a-col :span="8">
                    <span>场地类别</span>
                    <p>{{ params.siteClassification }}</p>
                </a-col>
                <a-col :span="8">
                    <span>设计地震分组</span>
                    <p>{{ params.earthquakeGroup }}</p>
                </a-col>
            </a-row>
        </div>
        <h4 class="content-title">
            <!-- <img src="../../../assets/img/user/detail-title.png" alt="" /> -->
            关键提取信息
        </h4>
        <div class="content-body">
            <a-row>
                <a-col :span="8">
                    <span>水土腐蚀性</span>
                    <p>{{
                        params.waterSoilErosion == 0
                            ? '微腐蚀'
                            : params.waterSoilErosion == 1
                              ? '弱腐蚀'
                              : params.waterSoilErosion == 2
                                ? '强腐蚀'
                                : ''
                    }}</p>
                </a-col>
                <a-col :span="8">
                    <span>地基处理关键字</span>
                    <p>{{ params.handleKeyword == 1 ? '岩溶' : '湿陷性黄土' }}</p>
                </a-col>
                <a-col :span="8">
                    <span>地下水埋深(m)</span>
                    <p>{{ params.groundwaterDepth ? params.groundwaterDepth : '--' }}</p>
                </a-col>
                <a-col :span="8">
                    <span>冻土深度(m)</span>
                    <p>{{ params.permafrostDepth ? params.permafrostDepth : '--' }}</p>
                </a-col>
                <a-col :span="8">
                    <span>洪水水位(m)</span>
                    <p>{{ params.floodWaterLevel ? params.floodWaterLevel : '--' }}</p>
                </a-col>
                <a-col :span="24">
                    <span>持力层描述</span>
                    <div style="line-height: 1.8" v-html="params.bearingStratumInfo"></div>
                </a-col>
            </a-row>
        </div>

        <h4 class="content-title">
            <!-- <img src="../../../assets/img/user/detail-title.png" alt="" /> -->
            场地条件信息
        </h4>
        <editorEle
            :dataHtml="params.regionalHydrologyInfo"
            class="text-field"
            :readOnly="true"
        ></editorEle>

        <h4 class="content-title">
            <!-- <img src="../../../assets/img/user/detail-title.png" alt="" /> -->
            场区地质条件与评价
        </h4>
        <editorEle
            :dataHtml="params.regionalGeologyConditionEvaluation"
            class="text-field"
            :readOnly="true"
        ></editorEle>
        <h4 class="content-title">
            <!-- <img src="../../../assets/img/user/detail-title.png" alt="" /> -->
            区域地质信息
        </h4>
        <editorEle
            :dataHtml="params.regionalGeologyInfo"
            class="text-field"
            :readOnly="true"
        ></editorEle>
        <h4 class="content-title">
            <!-- <img src="../../../assets/img/user/detail-title.png" alt="" /> -->
            结论
        </h4>
        <editorEle :dataHtml="params.conclusion" class="text-field" :readOnly="true"></editorEle>
        <h4 class="content-title">
            <!-- <img src="../../../assets/img/user/detail-title.png" alt="" /> -->
            评价
        </h4>
        <editorEle :dataHtml="params.evaluation" class="text-field" :readOnly="true"></editorEle>
        <h4 class="content-title">
            <!-- <img src="../../../assets/img/user/detail-title.png" alt="" /> -->
            主要日志
        </h4>
        <LogEle></LogEle>
    </div>
</template>
<script setup>
    import soilProperty from './components/soilProperty.vue';
    import editorEle from '@/components/editor/Editor.vue';
    import LogEle from './components/Log/Log.vue';
    import { onMounted, ref } from 'vue';
    import { useRoute } from 'vue-router';
    import { getGeologyDetail } from '@/api/modules/geology.js';
    import { editorFormatPath, editorFormatFullPath } from '@/utils/editorFormatPath';
    import { downLoadFile } from '../commonData';
    const route = useRoute();
    const params = ref({
        affiliationCodeName: '', // 所属区域name
        affiliationCode: '', // 所属区域code
        geologyCode: '', // 地质数据编号
        suitRange: '', // 数据范围， 1全域通用， 2拐点坐标
        locations: '', // 拐点坐标
        geologyRockSoilRespList: [
            {
                name: '', // 岩土名称
                thickness: '', // 厚度
                // 重力密度
                dynamicCompression: '', // 压缩模量
                cohesion: '', // 凝聚力（内聚力）
                internalFrictionAngle: '', // 摩擦角
                poisson: '', //泊松比
                bearingCapacity: '', // 承载力特征值
            },
        ],
        epa: '', // 场址地震动峰值加速度
        ld: '', // 场址地震基本烈度
        tg: '', // 地震动反应谱特征周期
        siteClassification: '', // 场地类别
        earthquakeGroup: '', // 设计地震分组
        waterSoilErosion: '', // 水土腐蚀性
        handleKeyword: '', // 地基处理关键字 1 岩溶 2 湿陷性黄土
        groundwaterDepth: '', // 地下水埋深
        permafrostDepth: '', // 冻土深度
        floodWaterLevel: '', // 洪水水位
        bearingStratumInfo: '', // 持力层描述
        regionalGeologyInfo: '', // 区域地质信息
        regionalGeologyConditionEvaluation: '', // 场区地质条件与评价
        regionalHydrologyInfo: '', // 区域水文情况
        // conclusionEvaluation: '', // 结论评价
        evaluation: '', // 评价
        conclusion: '', // 结论
        geologyFileRespList: [], // 文件对象
    });
    const lieObj = {
        1: 'Ⅰ',
        2: 'Ⅱ',
        3: 'Ⅲ',
        4: 'Ⅳ',
        5: 'Ⅴ',
        6: 'Ⅵ',
        7: 'Ⅶ',
        8: 'Ⅷ',
        9: 'Ⅸ',
        10: 'Ⅹ',
        11: 'Ⅺ',
        12: 'Ⅻ',
    };
    onMounted(() => {
        onInitGeologyDetail();
    });
    // 初始化地质详情数据
    const onInitGeologyDetail = () => {
        if (route.query.id) {
            getGeologyDetail(route.query.id).then((res) => {
                if (res.code == 200) {
                    // 回显数据
                    const originResData = { ...res.data };
                    // 处理富文本字段后台返回null，前端会报错情况
                    originResData.regionalGeologyConditionEvaluation = '';
                    originResData.regionalGeologyInfo = '';
                    originResData.regionalHydrologyInfo = '';
                    originResData.conclusion = '';
                    originResData.evaluation = '';
                    originResData.bearingStratumInfo = '';

                    params.value = Object.assign(params.value, originResData);
                    params.value.regionalGeologyConditionEvaluation = res.data
                        .regionalGeologyConditionEvaluation
                        ? res.data.regionalGeologyConditionEvaluation
                        : '';
                    params.value.regionalGeologyInfo = res.data.regionalGeologyInfo
                        ? res.data.regionalGeologyInfo
                        : '';
                    params.value.regionalHydrologyInfo = res.data.regionalHydrologyInfo
                        ? res.data.regionalHydrologyInfo
                        : '';
                    params.value.conclusion = res.data.conclusion ? res.data.conclusion : '';
                    params.value.evaluation = res.data.evaluation ? res.data.evaluation : '';
                    params.value.bearingStratumInfo = res.data.bearingStratumInfo
                        ? res.data.bearingStratumInfo
                        : '';
                }
            });
            console.log('数据详情', params.value);
        }
    };
    // 过滤文件
    const filterFile = (fileType, fileData) => {
        // fileType // 1 地形图  2 粗糙度  3 地勘报告  4 拐点坐标
        return fileData.filter((ele) => ele.fileType == fileType);
    };
    // 跳转链接
    const goJump = (path) => {
        if (path) downLoadFile(path);
    };
</script>
<style scoped lang="scss">
  @import './css/geologyDetail.scss';
</style>
