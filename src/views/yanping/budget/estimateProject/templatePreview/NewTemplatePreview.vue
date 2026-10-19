<template>
    <div class="estimate-preview">
        <p class="title-tree">
            <span class="fspan" @click="goCost()">计经概算</span>
            <span>/</span>
            <span class="sspan">预览</span>
        </p>

        <!-- 顶部工具栏：Tab 切换 + 下载按钮 -->
        <div class="estimate-toolbar">
            <div class="estimate-tab-list">
                <span
                    v-for="tab in ESTIMATE_TABS"
                    :key="tab.key"
                    class="estimate-tab-item"
                    :class="{ active: activeTab === tab.key }"
                    @click="activeTab = tab.key"
                >{{ tab.label }}</span>
            </div>
            <!-- <div class="estimate-actions">
                <a-button
                    type="primary"
                    :loading="downloadLoading"
                    @click="handleDownloadExcel"
                >↓ 下载Excel</a-button>
            </div> -->
        </div>

        <!-- 内容区 -->
        <div class="estimate-content">
            <!-- 全屏 loading -->
            <div class="loading-mask" v-if="pageLoading">
                <a-spin size="large" tip="加载中…" />
            </div>

            <!-- 工程总概算表 -->
            <template v-if="activeTab === 'total'">
                <a-table
                    v-if="estimateTableData.length"
                    :dataSource="estimateTableData"
                    :columns="ESTIMATE_COLUMNS"
                    bordered size="small"
                    :pagination="false"
                    :scroll="{ x: 1100, y: scrollHeight }"
                    :rowKey="'code'"
                    :row-class-name="(_r, i) => (i % 2 === 1 ? 'table-striped' : null)"
                >
                    <template #headerCell="{ column }">
                        <p class="col-title">{{ column.title }}</p>
                    </template>
                </a-table>
                <div class="no-result" v-else-if="!pageLoading">
                    <p>暂无数据</p>
                </div>
            </template>

            <!-- 施工辅助工程概算表 -->
            <template v-else-if="activeTab === 'construction'">
                <a-table
                    v-if="constructionAuxData.length"
                    :dataSource="constructionAuxData"
                    :columns="CONSTRUCTION_AUX_COLUMNS"
                    bordered size="small"
                    :pagination="false"
                    :scroll="{ x: 900, y: scrollHeight }"
                    :rowKey="(_, i) => i"
                    :row-class-name="(_r, i) => (i % 2 === 1 ? 'table-striped' : null)"
                >
                    <template #headerCell="{ column }">
                        <p class="col-title">{{ column.title }}</p>
                    </template>
                </a-table>
                <div class="no-result" v-else-if="!pageLoading">
                    <p>暂无数据</p>
                </div>
            </template>

            <!-- 建筑工程概算表 -->
            <template v-else-if="activeTab === 'build'">
                <a-table
                    v-if="estimateBuildData.length"
                    :dataSource="estimateBuildData"
                    :columns="ESTIMATE_BUILD_COLUMNS"
                    bordered size="small"
                    :pagination="false"
                    :scroll="{ x: 900, y: scrollHeight }"
                    :rowKey="(_, i) => i"
                    :row-class-name="(_r, i) => (i % 2 === 1 ? 'table-striped' : null)"
                >
                    <template #headerCell="{ column }">
                        <p class="col-title">{{ column.title }}</p>
                    </template>
                </a-table>
                <div class="no-result" v-else-if="!pageLoading">
                    <p>暂无数据</p>
                </div>
            </template>

            <!-- 设备及安装工程概算表 -->
            <template v-else-if="activeTab === 'install'">
                <a-table
                    v-if="installEngData.length"
                    :dataSource="installEngData"
                    :columns="INSTALL_ENG_COLUMNS"
                    bordered size="small"
                    :pagination="false"
                    :scroll="{ x: 1400, y: scrollHeight }"
                    :rowKey="(_, i) => i"
                    :row-class-name="(_r, i) => (i % 2 === 1 ? 'table-striped' : null)"
                >
                    <template #headerCell="{ column }">
                        <p class="col-title">{{ column.title }}</p>
                    </template>
                </a-table>
                <div class="no-result" v-else-if="!pageLoading">
                    <p>暂无数据</p>
                </div>
            </template>

            <!-- 主要材料预算价格计算表 -->
            <template v-else-if="activeTab === 'material'">
                <a-table
                    v-if="materialBudgetData.length"
                    :dataSource="materialBudgetData"
                    :columns="MATERIAL_BUDGET_COLUMNS"
                    bordered size="small"
                    :pagination="false"
                    :scroll="{ x: 700, y: scrollHeight }"
                    :rowKey="(_, i) => i"
                    :row-class-name="(_r, i) => (i % 2 === 1 ? 'table-striped' : null)"
                >
                    <template #headerCell="{ column }">
                        <p class="col-title">{{ column.title }}</p>
                    </template>
                </a-table>
                <div class="no-result" v-else-if="!pageLoading">
                    <p>暂无数据</p>
                </div>
            </template>

            <!-- 其他费用概算表 -->
            <template v-else-if="activeTab === 'other'">
                <a-table
                    v-if="otherCostData.length"
                    :dataSource="otherCostData"
                    :columns="OTHER_COST_COLUMNS"
                    bordered size="small"
                    :pagination="false"
                    :scroll="{ x: 900, y: scrollHeight }"
                    :rowKey="(_, i) => i"
                    :row-class-name="(_r, i) => (i % 2 === 1 ? 'table-striped' : null)"
                >
                    <template #headerCell="{ column }">
                        <p class="col-title">{{ column.title }}</p>
                    </template>
                </a-table>
                <div class="no-result" v-else-if="!pageLoading">
                    <p>暂无数据</p>
                </div>
            </template>
        </div>

    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import * as XLSX from 'xlsx';
import { useRoute, useRouter } from 'vue-router';
import { getProjectDetailById } from '@/api/modules/sourceData/estimateProject.js';
const router = useRouter();
// ── 路由参数 ──────────────────────────────────────────────────────────────────
const route = useRoute();

// ── 状态 ──────────────────────────────────────────────────────────────────────
const pageLoading    = ref(false);
const downloadLoading = ref(false);
const activeTab      = ref('total');
const scrollHeight   = ref(window.innerHeight - 120);  // 工具栏高度约 56px，再留余量

// ── 各子表数据 ────────────────────────────────────────────────────────────────
const estimateTableData   = ref([]);   // 工程总概算
const constructionAuxData = ref([]);   // 施工辅助工程概算
const estimateBuildData   = ref([]);   // 建筑工程概算
const installEngData      = ref([]);   // 设备及安装工程概算
const materialBudgetData  = ref([]);   // 主要材料预算价格
const otherCostData       = ref([]);   // 其他费用概算

// ── Tab 列表 ──────────────────────────────────────────────────────────────────
const ESTIMATE_TABS = [
    { key: 'total',        label: '工程总概算表' },
    { key: 'construction', label: '施工辅助工程概算表' },
    { key: 'build',        label: '建筑工程概算表' },
    { key: 'install',      label: '设备及安装工程概算表' },
    { key: 'material',     label: '主要材料预算价格计算表' },
    { key: 'other',        label: '其他费用概算表' },
];

// ── 列定义 ────────────────────────────────────────────────────────────────────
const ESTIMATE_COLUMNS = [
    { title: '编号',            dataIndex: 'code',                        width: 140, fixed: 'left' },
    { title: '工程或费用名称',    dataIndex: 'projectName',                 width: 260, fixed: 'left' },
    { title: '设备购置费（万元）', dataIndex: 'equipment_purchase_cost',     width: 160 },
    { title: '建安工程费（万元）', dataIndex: 'construction_install_cost',   width: 160 },
    { title: '其他费用（万元）',   dataIndex: 'other_cost',                  width: 140 },
    { title: '合计（万元）',      dataIndex: 'total_cost',                   width: 140 },
    { title: '占总投资比例（%）',  dataIndex: 'proportion_total_investment',  width: 150 },
];

const CONSTRUCTION_AUX_COLUMNS = [
    { title: '序号',          dataIndex: 'serialNumber', width: 100, fixed: 'left' },
    { title: '工程或费用名称', dataIndex: 'projectName',  width: 260, fixed: 'left' },
    { title: '单位',          dataIndex: 'unit',         width: 120 },
    { title: '数量',          dataIndex: 'number',       width: 120 },
    { title: '单价（万元）',   dataIndex: 'unitPrice',    width: 140 },
    { title: '合计（万元）',   dataIndex: 'totalCost',    width: 140 },
];

const ESTIMATE_BUILD_COLUMNS = [
    { title: '序号',          dataIndex: 'serialNumber', width: 100, fixed: 'left' },
    { title: '工程或费用名称', dataIndex: 'projectName',  width: 260, fixed: 'left' },
    { title: '单位',          dataIndex: 'unit',         width: 120 },
    { title: '数量',          dataIndex: 'number',       width: 120 },
    { title: '单价（万元）',   dataIndex: 'unitPrice',    width: 140 },
    { title: '合计（万元）',   dataIndex: 'totalCost',    width: 140 },
];

const INSTALL_ENG_COLUMNS = [
    { title: '编号',       dataIndex: 'code',        width: 100, fixed: 'left' },
    { title: '名称及规格', dataIndex: 'projectName', width: 220, fixed: 'left' },
    { title: '单位',       dataIndex: 'unit',        width: 100 },
    { title: '数量',       dataIndex: 'number',      width: 100 },
    {
        title: '设备费',
        children: [
            { title: '单个（万元）', dataIndex: 'deviceFee',      width: 130 },
            { title: '合计（万元）', dataIndex: 'deviceFeeTotal', width: 130 },
        ],
    },
    {
        title: '安装费',
        children: [
            { title: '单个（万元）', dataIndex: 'installFee',      width: 130 },
            { title: '合计（万元）', dataIndex: 'installFeeTotal', width: 130 },
        ],
    },
    {
        title: '装置性材料费',
        children: [
            { title: '单个（万元）', dataIndex: 'installationMaterialFee',      width: 140 },
            { title: '合计（万元）', dataIndex: 'installationMaterialFeeTotal', width: 140 },
        ],
    },
    {
        title: '小计',
        children: [
            { title: '单个（万元）', dataIndex: 'subtotal',      width: 130 },
            { title: '合计（万元）', dataIndex: 'subtotalTotal', width: 130 },
        ],
    },
    { title: '合计（万元）', dataIndex: 'totalFee', width: 130 },
];

const MATERIAL_BUDGET_COLUMNS = [
    { title: '编号',          dataIndex: 'serialNumber', width: 120, fixed: 'left' },
    { title: '材料名称及规格', dataIndex: 'projectName', width: 280, fixed: 'left' },
    { title: '单位',          dataIndex: 'unit',         width: 120 },
    { title: '价格（元）',    dataIndex: 'price',        width: 150 },
];

const OTHER_COST_COLUMNS = [
    { title: '编号',         dataIndex: 'code',           width: 100, fixed: 'left' },
    { title: '名称及规格',   dataIndex: 'projectName',    width: 240, fixed: 'left' },
    { title: '单位',         dataIndex: 'unit',           width: 120 },
    { title: '费率/数量',    dataIndex: 'rateOrQuantity', width: 130 },
    { title: '单价（万元）', dataIndex: 'unitPrice',      width: 140 },
    { title: '合计（万元）', dataIndex: 'amount',         width: 140 },
];

// ── Excel 导出配置 ────────────────────────────────────────────────────────────
const REPORT_SHEETS = [
    {
        key: 'engineeringTotalEstimateRespList',
        name: '工程总概算',
        headers: {
            code:                        '编号',
            projectName:                 '工程或费用名称',
            equipment_purchase_cost:     '设备购置费（万元）',
            construction_install_cost:   '建安工程费（万元）',
            other_cost:                  '其他费用（万元）',
            total_cost:                  '合计（万元）',
            proportion_total_investment: '占总投资比例（%）',
        },
    },
    {
        key: 'constructionAuxiliaryRespList',
        name: '施工辅助工程概算',
        headers: {
            serialNumber: '序号',
            projectName:  '工程名称',
            unit:         '单位',
            number:       '数量',
            unitPrice:    '单价（元）',
            totalCost:    '合计（万元）',
        },
    },
    {
        key: 'installationEngineeringBudgetRespList',
        name: '设备及安装工程概算',
        headers: {
            code:                         '编号',
            projectName:                  '工程名称',
            unit:                         '单位',
            number:                       '数量',
            deviceFeeTotal:               '设备费（万元）',
            installFeeTotal:              '安装费（万元）',
            installationMaterialFeeTotal: '安装材料费（万元）',
            totalFee:                     '合计（万元）',
        },
    },
    {
        key: 'estimateBuildRespList',
        name: '建筑工程概算',
        headers: {
            serialNumber: '序号',
            projectName:  '工程名称',
            unit:         '单位',
            number:       '数量',
            unitPrice:    '单价（元）',
            totalCost:    '合计（万元）',
        },
    },
    {
        key: 'otherCostEstimateRespList',
        name: '其他费用概算',
        headers: {
            code:           '编号',
            projectName:    '费用名称',
            unit:           '单位',
            rateOrQuantity: '费率或数量',
            unitPrice:      '单价（元）',
            amount:         '金额（万元）',
        },
    },
    {
        key: 'materialBudgetRespList',
        name: '主要材料预算价格',
        headers: {
            serialNumber: '编号',
            projectName:  '材料名称',
            unit:         '单位',
            price:        '预算价格（元）',
        },
    },
];

// ── 填充各子表数据 ─────────────────────────────────────────────────────────────
const fillEstimateData = (data) => {
    estimateTableData.value   = data?.engineeringTotalEstimateRespList      || [];
    constructionAuxData.value = data?.constructionAuxiliaryRespList         || [];
    estimateBuildData.value   = data?.estimateBuildRespList                 || [];
    installEngData.value      = data?.installationEngineeringBudgetRespList || [];
    materialBudgetData.value  = data?.materialBudgetRespList                || [];
    otherCostData.value       = data?.otherCostEstimateRespList             || [];
};

// ── 加载数据 ──────────────────────────────────────────────────────────────────
const loadData = async () => {
    const projectId = route.query.id;
    if (!projectId) {
        message.warning('缺少项目 ID，无法加载数据');
        return;
    }
    pageLoading.value = true;
    try {
        const res = await getProjectDetailById(projectId);
        if (res && res.code === 200) {
            const { resultParam } = res.data;
            if (!resultParam) {
                message.warning('暂无概算结果，请先完成计算');
                return;
            }
            try {
                fillEstimateData(JSON.parse(resultParam));
            } catch {
                message.error('概算数据格式异常，无法解析');
            }
        } else {
            message.error(res?.msg || '数据加载失败');
        }
    } catch (err) {
        message.error('数据加载失败，请刷新重试');
    } finally {
        pageLoading.value = false;
    }
};

// ── 下载 Excel ────────────────────────────────────────────────────────────────
const handleDownloadExcel = async () => {
    const projectId = route.query.id;
    downloadLoading.value = true;
    try {
        const res = await getProjectDetailById(projectId);
        if (!res || res.code !== 200) {
            message.error(res?.msg || '获取数据失败');
            return;
        }
        const { resultParam, projectName } = res.data;
        if (!resultParam) {
            message.warning('请先进行计算，再下载报告');
            return;
        }
        let parsed;
        try {
            parsed = JSON.parse(resultParam);
        } catch {
            message.warning('数据格式异常，无法导出');
            return;
        }

        const wb = XLSX.utils.book_new();
        for (const sheet of REPORT_SHEETS) {
            const rows = parsed[sheet.key];
            if (!rows || rows.length === 0) continue;
            const fieldKeys = Object.keys(sheet.headers);
            const headerRow = fieldKeys.map(k => sheet.headers[k]);
            const dataRows  = rows.map(row => fieldKeys.map(k => row[k] ?? ''));
            const ws        = XLSX.utils.aoa_to_sheet([headerRow, ...dataRows]);
            ws['!cols']     = fieldKeys.map(k => ({ wch: Math.max(sheet.headers[k].length * 2.2, 12) }));
            XLSX.utils.book_append_sheet(wb, ws, sheet.name);
        }

        if (wb.SheetNames.length === 0) {
            message.warning('暂无可导出的数据');
            return;
        }

        XLSX.writeFile(wb, `${projectName || '工程概算'}_报告.xlsx`);
    } catch (err) {
        message.error('下载失败，请重试');
    } finally {
        downloadLoading.value = false;
    }
};

// 回到计经概算列表
const goCost = () => {
    router.push({
        path: '/costEstimate/windProject',
    });
}

// ── 初始化 ────────────────────────────────────────────────────────────────────
onMounted(loadData);
</script>

<style scoped lang="scss">
.estimate-preview {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background: #fff;
    overflow: hidden;
    margin: 8px 0 0 16px;
    padding: 24px 24px 16px 24px;
    border-radius: 12px 0 0 0;
}

.title-tree{
    font-size: 14px;
}

.title-tree span{
    cursor: pointer;
    margin-right: 5px;
}

.fspan{
    color: #999;
}

.sspan{
    color: #0389ea;
}
/* ── 工具栏 ── */
.estimate-toolbar {
    flex: none;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 16px;
    border-bottom: 1px solid #e8e8e8;
    background: #fff;
    margin-top: 10px;
    .estimate-tab-list {
        display: flex;
        flex-wrap: wrap;

        .estimate-tab-item {
            padding: 12px 16px;
            font-size: 13px;
            color: #666;
            cursor: pointer;
            border-bottom: 2px solid transparent;
            transition: color 0.2s, border-color 0.2s;
            white-space: nowrap;
            user-select: none;

            &:hover { color: #0389ea; }

            &.active {
                color: #0389ea;
                font-weight: 600;
                border-bottom-color: #0389ea;
            }
        }
    }

    .estimate-actions {
        flex: none;
        padding: 8px 0;
    }
}

/* ── 内容区 ── */
.estimate-content {
    flex: 1;
    overflow: hidden;
    position: relative;
    padding: 16px;
}

/* ── 全屏 loading 遮罩 ── */
.loading-mask {
    position: absolute;
    inset: 0;
    background: rgba(255, 255, 255, 0.75);
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: center;
}

/* ── 空状态 ── */
.no-result {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    color: #999;
    font-size: 13px;
}

/* ── 表头文字 ── */
.col-title {
    margin: 0;
    font-size: 12px;
    font-weight: 500;
    white-space: nowrap;
}

/* ── 斑马纹 ── */
:deep(.table-striped td) {
    background-color: #fafafa;
}
</style>
