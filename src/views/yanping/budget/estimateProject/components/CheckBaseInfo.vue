<template>
    <a-drawer v-model:open="open" :width="900" class="custom-class" root-class-name="root-class-name"
        :root-style="{ color: 'blue' }" title="信息详情" placement="right">
        <div class="quota-detail">
            <div class="header">
                <div class="title">
                    <p class="name">{{ quotaData?.parentNameSelf }}</p>
                    <p class="code">{{ quotaData?.parentCodeSelf }}</p>
                </div>
                <a-tabs v-model:activeKey="activeTab" @change="emit('tab-change', $event)">

                    <!-- 固定基本信息标签 -->
                    <a-tab-pane key="basic" tab="基本信息">
                    </a-tab-pane>
                    <!-- 动态渲染清单标签 -->
                    <a-tab-pane v-if="visibleTabs.some((t) => t.key === 'list')" key="list" tab="清单信息">
                    </a-tab-pane>

                    <a-tab-pane v-if="visibleTabs.some((t) => t.key === 'setting')" key="setting" tab="系数设置">
                    </a-tab-pane>
                </a-tabs>
            </div>
            <!--清单信息  -->
            <table-list v-if="activeTab == 'list'" class="user-table" :loading="loading" :tableData="tableData"
                :tableColumn="tableColumn" :isShowPage="false">
            </table-list>
            <template bordered size="small" v-if="activeTab == 'basic'">
                <a-descriptions>
                    <a-descriptions-item v-for="(item, index) in descriptionItems" :key="index" :label="item.label"
                        :span="getItemSpan(item)">
                        <template v-if="item.isLongText">
                            <div class="long-text">{{ formatContent(item) }}</div>
                        </template>
                        <template v-else>
                            {{ formatContent(item) }}
                        </template>
                    </a-descriptions-item>
                </a-descriptions>
            </template>
            <div v-if="activeTab == 'setting'">
                <table-list v-if="activeTab == 'setting'" class="user-table" :loading="loading" :tableData="settingTableData"
                    :tableColumn="settingTableColumn" :isShowPage="false">
                </table-list>
            </div>
        </div>
    </a-drawer>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { SETTINGS_TABLE_COLUMN } from '../budget';
import tableList from '@/components/tableList2/TableList.vue';
const props = defineProps({
    baseType: {
        type: String
    },
    showListTab: {
        type: Boolean,
        default: false,
    },
    // 初始激活标签
    initialTab: {
        type: String,
        default: 'basic',
    },
    quotaData: {
        type: Object,
        default: () => { },
    },
    descriptionItems: {
        type: Array,
        default: () => [],
    },
    tableData: {
        type: Array,
        default: () => [],
    },
    tableColumn: {
        type: Array,
        default: () => [],
    },
    settingTableData: {
        type: Array,
        default: () => [],
    },
    settingTableColumn: {
        type: Array,
        default: () => [],
    },
});
const emit = defineEmits(['tab-change']);
const loading = ref(false);
const open = ref(true);
// 当前激活的标签页
const activeTab = ref(props.initialTab);
// 标签页配置
const tabConfigs = computed(() => {
    let arr = []
    if (props.baseType === 'price') {
        arr = [
            {
                key: 'list',
                label: '清单信息',
                visible: props.showListTab,
                required: () => props.showListTab, // 动态显示条件
            },
            {
                key: 'basic',
                label: '基本信息',
                visible: true, // 始终显示
                required: () => true,
            },
        ]
    } else {
        arr = [
            {
                key: 'setting',
                label: '系数设置',
                visible: true,
                required: () => true, // 动态显示条件
            },
            {
                key: 'list',
                label: '清单信息',
                visible: props.showListTab,
                required: () => props.showListTab, // 动态显示条件
            },
            {
                key: 'basic',
                label: '基本信息',
                visible: true, // 始终显示
                required: () => true,
            },
        ]
    }
    return arr
});

// 可见标签页计算
const visibleTabs = computed(() => {
    return tabConfigs.value.filter((tab) => tab.visible && tab.required());
});

// 自动切换激活标签
const validateActiveTab = () => {
    if (!visibleTabs.value.some((tab) => tab.key === activeTab.value)) {
        const validTab = visibleTabs.value[0]?.key || '';
        activeTab.value = validTab;
        emit('tab-change', validTab);
    }
};

// 监听显示状态变化
watch(
    () => props.showListTab,
    () => {
        validateActiveTab();
    },
);

// 内容格式化方法
const formatContent = (item) => {
    const value = props.quotaData?.[item.field];

    if (item.format) {
        return item.format(value);
    }

    return value || item.placeholder || '-';
};
// 动态计算span值
const getItemSpan = (item) => {
    if (typeof item.fullRow === 'function') {
        return item.fullRow(props.data[item.field]) ? LAYOUT_CONFIG.column : item.span;
    }
    return item.span;
};
</script>

<style scoped lang="scss">
.quota-detail {
    // margin: 60px 0;
    // background: #fff;
    // border-top: 1px solid #ccc;
}

.header {
    display: flex;
    margin-bottom: 20px;
    align-items: center;
    justify-content: space-between;
}

.title {
    margin-bottom: 16px;
}

.code {
    font-size: 14px;
    margin-right: 12px;
    color: #999;
    line-height: 2.4;
}

.name {
    font-size: 16px;
    color: #333;
    font-weight: 600;
}

.info-table {
    background: #fff;
}

.long-text {
    white-space: pre-wrap;
    word-break: break-all;
    line-height: 1.5;
}

:deep(.ant-descriptions-item-label) {
    min-width: 100px;
    // background: #fafafa;
    font-weight: 500;
}

:deep(.ant-card-body) {
    padding: 24px;
}

.long-text {
    max-width: 400px;
    white-space: pre-wrap;
    word-break: break-all;
}
</style>
