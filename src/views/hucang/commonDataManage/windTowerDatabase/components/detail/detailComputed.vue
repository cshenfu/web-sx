<template>
    <!-- 计算后数据情况 -->
    <div class="detail-computed-components">
        <a-button @click="repeatComputed" type="primary" ghost class="reset-computed-button"
            >重新计算</a-button
        >
        <a-table :columns="columns" :pagination="false" :data-source="data">
            <template #bodyCell="{ column, text }">
                <template v-if="column.dataIndex === 'file'"> 文件名称 </template>
            </template>
        </a-table>
        <swiper
            :modules="modules"
            :loop="false"
            :slides-per-view="'auto'"
            :slide-to-clicked-slide="true"
            :space-between="16"
            :updateOnWindowResize="true"
            :observer="true"
            :slidesPerGroupAuto="2"
            :navigation="navigation"
            :scrollbar="{ draggable: false }"
            class="swiperBox"
            @slideChange="onSlideChange"
        >
            <swiper-slide
                @click="getSlideActive(itemIndex)"
                :class="itemIndex == activeIndex ? 'slide-custom-active' : ''"
                v-for="(item, itemIndex) in slideData"
                >{{ item.title }}</swiper-slide
            >
            <div
                class="swiper-button-prev"
                v-show="!showKey.isBeginning"
                @click.stop="prevEl(item, index)"
            >
                <iconpark-icon class="slide-icon" name="heizuojiantou"></iconpark-icon>
            </div>
            <!--左箭头。如果放置在swiper外面，需要自定义样式。-->
            <div class="swiper-button-next" v-show="!showKey.isEnd" @click.stop="nextEl">
                <iconpark-icon class="slide-icon" name="heiyoujiantou"></iconpark-icon>
            </div>
            <!--右箭头。如果放置在swiper外面，需要自定义样式。-->
        </swiper>
        <component :is="slideData[activeIndex]['components']"></component>
        <!-- 重新计算 -->
        <tips-modal
            :width="'490px'"
            :tipType="'success'"
            class="tip-content-modal"
            :okText="'确定'"
            :openTipsModal.sync="recalculateTipsOpenModal"
            @handleChangeFileModal="handleChangeRecalculateModal"
        >
            <template #customTitle>重新计算</template>
            <template #contentBody>
                <a-form
                    :colon="false"
                    class="sort-form"
                    ref="recalculateFormRef"
                    :rules="rules"
                    :model="recalculateFormData"
                    :labelCol="labelCol"
                    labelAlign="left"
                >
                    <a-form-item label="关联项目" name="project">
                        <a-select
                            style="width: 318px"
                            class="select-address"
                            v-model:value="recalculateFormData.project"
                            placeholder="请选择关联项目"
                        >
                            <a-select-option :value="0">全部状态</a-select-option>
                            <a-select-option :value="1">已配置</a-select-option>
                            <a-select-option :value="2">未配置</a-select-option>
                        </a-select>
                    </a-form-item>
                    <a-form-item name="windTowerData">
                        <template #label>
                            <span class="special-label">关联测风塔数据</span>
                        </template>
                        <a-select
                            v-model:value="recalculateFormData.windTowerData"
                            mode="multiple"
                            label-in-value
                            placeholder="选择关联测风塔数据"
                            style="width: 318px"
                            :filter-option="false"
                            :not-found-content="state.fetching ? undefined : null"
                            :options="state.data"
                            @search="fetchUser"
                        >
                            <template v-if="state.fetching" #notFoundContent>
                                <a-spin size="small" />
                            </template>
                        </a-select>
                    </a-form-item>
                    <a-form-item name="mesoscaleData">
                        <template #label>
                            <span class="special-label">关联中尺度数据</span>
                        </template>
                        <a-input
                            style="width: 318px"
                            v-model:value="recalculateFormData.mesoscaleData"
                            placeholder="请输入关联中尺度数据"
                        />
                    </a-form-item>
                </a-form>
            </template>
        </tips-modal>
    </div>
</template>
<script setup>
    import { reactive, ref } from 'vue';
    import { Swiper, SwiperSlide } from 'swiper/vue';
    // 引入swiper样式（按需导入）
    import 'swiper/css/pagination'; // 轮播图底面的小圆点
    import 'swiper/css/navigation'; // 轮播图两边的左右箭头
    // 引入swiper核心和所需模块
    import { Autoplay, Pagination, Navigation, Scrollbar } from 'swiper/modules';

    // 订正
    import detailCorrect from './detailCorrect.vue';
    // 全年风速/风功率密度月变化
    import detailDensityForMonth from './detailDensityForMonth.vue';
    // 相关关系图
    import detailRelation from './detailRelation.vue';
    // 风切变指数
    import detailExponent from './detailExponent.vue';
    // 威布尔分布
    import detailWeibull from './detailWeibull.vue';
    // 湍流强度
    import detailTurbulence from './detailTurbulence.vue';
    // 风速/风功率密度日变化
    import detailDensityForDay from './detailDensityForDay.vue';
    // 各月平均风速和平均风功率密度日变化
    import detailAverageDensityForDay from './detailAverageDensityForDay.vue';
    // 风速和风功率密度频率分布
    import detailDensityDistribution from './detailDensityDistribution.vue';
    // 风向风能方向统计及玫瑰图
    import detailStatistics from './detailStatistics.vue';
    // 风速和风功率密度频率分布
    import detailDensity from './detailDensity.vue';
    // 50年一遇最大风速
    import detailMaximumSpeed from './detailMaximumSpeed.vue';
    // 模态框
    import TipsModal from '@/components/tipsDialog/TipsModal.vue';

    const emits = defineEmits(['changeActive']);
    let activeIndex = ref(0);
    let showKey = ref({
        isEnd: false,
        isBeginning: true,
    });
    const navigation = ref({
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
    });
    // 在modules加入要使用的模块
    const modules = [Autoplay, Pagination, Navigation, Scrollbar];
    const prevEl = (item, index) => {
        // console.log('上一张' + index + item)
    };
    const nextEl = () => {
        // console.log('下一张')
    };
    // 更改当前活动swiper
    const onSlideChange = (swiper) => {
        // swiper是当前轮播的对象，里面可以获取到当前swiper的所有信息，当前索引是activeIndex
        showKey.value.isBeginning = swiper.isBeginning;
        showKey.value.isEnd = swiper.isEnd;
    };

    const slideData = reactive([
        {
            title: '数据长期订正',
            components: detailCorrect,
        },
        {
            title: '全年风速/风功率密度月变化',
            components: detailDensityForMonth,
        },
        {
            title: '测风塔各高度之间相关关系图',
            components: detailRelation,
        },
        {
            title: '风切变指数',
            components: detailExponent,
        },
        {
            title: '威布尔分布',
            components: detailWeibull,
        },
        {
            title: '湍流强度',
            components: detailTurbulence,
        },
        {
            title: '风速/风功率密度日变化',
            components: detailDensity,
        },
        {
            title: '各月平均风速和平均风功率密度日变化',
            components: detailAverageDensityForDay,
        },
        {
            title: '风速和风功率密度频率分布',
            components: detailDensityDistribution,
        },
        {
            title: '风向风能方向统计及玫瑰图',
            components: detailStatistics,
        },
        {
            title: '全年风速/风功率密度日变化',
            components: detailDensityForDay,
        },
        {
            title: '50年一遇最大风速',
            components: detailMaximumSpeed,
        },
    ]);

    const getSlideActive = (index) => {
        activeIndex.value = index;
    };

    const columns = [
        {
            title: '关联数据类型',
            dataIndex: 'name',
        },
        {
            title: '数据编号',
            dataIndex: 'money',
        },
        {
            title: '数据经纬度',
            dataIndex: 'address',
        },
        {
            title: '数据文件',
            dataIndex: 'file',
        },
    ];
    const data = [
        {
            key: '1',
            name: 'John Brown',
            money: '￥300,000.00',
            address: 'New York No. 1 Lake Park',
        },
        {
            key: '2',
            name: 'Jim Green',
            money: '￥1,256,000.00',
            address: 'London No. 1 Lake Park',
        },
        {
            key: '3',
            name: 'Joe Black',
            money: '￥120,000.00',
            address: 'Sidney No. 1 Lake Park',
        },
    ];

    // 重新计算
    const recalculateTipsOpenModal = ref(false);
    const recalculateFormData = reactive({});
    const recalculateFormRef = ref(null);
    const repeatComputed = () => {
        recalculateTipsOpenModal.value = true;
    };
    const labelCol = {
        style: {
            width: '90px',
            lineHeight: 1.2,
            whiteSpace: 'normal'
        },
    };
    // 下拉框实时搜索
    const state = reactive({
        data: [],
        value: [],
        fetching: false,
    });
    const rules = {
        project: [{ required: true, ElMessage: '请选择关联项目', trigger: 'blur' }],
        windTowerData: [{ required: true, ElMessage: '请输入关联测风塔数据', trigger: 'blur' }],
        mesoscaleData: [{ required: true, ElMessage: '请输入关联中尺度数据', trigger: 'blur' }],
    };
    // 远程搜索
    const fetchUser = (value) => {
        console.log(value);
    }
    const handleChangeRecalculateModal = (value) => {
        if (value) {
            recalculateFormRef.value.validateFields().then(() => {
                // 重新计算逻辑
            }).catch(error => {
                console.log(error);
            });
        } else {
            recalculateFormRef.value.resetFields();
            recalculateTipsOpenModal.value = false;
        }
    };
</script>
<style scoped lang="scss">
    .detail-computed-components {
        .reset-computed-button {
            margin-top: -20px;
            margin-bottom: 20px;
            float: right;
        }
        .slide-components {
            display: flex;
            flex-wrap: nowrap;
            > span {
                flex: none;
                margin-right: 16px;
                width: 116px;
                height: 78px;
                background: #f2f7f7;
                border-radius: 4px;
            }
        }
        .swiper-slide {
            margin-top: 20px;
            width: 116px;
            height: 78px;
            background: #f2f7f7;
            padding: 8px 12px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #363b4d;
            border-radius: 4px;
        }
        .slide-custom-active {
            background: #036b64;
            color: #ffffff;
        }
        .swiper-button-next.swiper-button-disabled {
            opacity: 0;
        }
        .swiper-button-prev {
            left: 0;
            background: red;
            top: 41px;
            background: linear-gradient(270deg, rgba(242, 247, 247, 0) 0%, #ffffff 100%);
            height: calc(100% - 16px);
        }
        .swiper-button-next {
            right: 0;
            top: 42px;
            height: calc(100% - 18px);
            background: red;
            iconpark-icon {
                margin-left: 10px;
            }
            background: linear-gradient(270deg, #ffffff 0%, rgba(242, 247, 247, 0) 100%);
        }
        .slide-icon {
            color: #036b64;
        }
    }
</style>
