<template>
    <div class="template-set">

        <!-- ── 新增：标题行 ── -->
        <div class="ts-header">
            <div class="ts-header-spacer"></div>
            <span class="ts-title">技经概算</span>
            <div class="ts-actions">
                <a-button
                    v-if="hasProjectId"
                    type="primary"
                    @click="agaiGeneReport"
                >重新生成报告</a-button>
                <a-button
                    v-if="leftActive === 0"
                    type="primary"
                    @click="saveTemplate"
                >保存项目</a-button>
                <!-- <a-button
                    v-if="leftActive >= 1 && leftActive <= 4"
                    type="primary"
                    @click="saveTemplate"
                >保存表格</a-button> -->
            </div>
        </div>

        <!-- ── 主体区（左 + 右） ── -->
        <div class="ts-body">
            <div class="template-set-left">
                <ul class="template-set-left-ul">
                    <li
                        v-for="item in visibleLeftMenu"
                        :key="item.value"
                        :class="['menu-item', leftActive === item.value ? 'active' : '']"
                        @click="changeMenu(item)"
                    >
                        <!-- 图标区（含状态徽标） -->
                        <div class="menu-icon-area">
                            <span class="menu-icon" v-html="getMenuIcon(item.value)"></span>
                            <!-- 已完成徽标 -->
                            <span
                                v-if="completedTabs.has(item.value)"
                                class="status-dot"
                                v-html="STATUS_DONE_SVG"
                            ></span>
                            <!-- 正在填写徽标（当前激活且未完成） -->
                            <span
                                v-else-if="leftActive === item.value"
                                class="status-dot"
                                v-html="STATUS_ACTIVE_SVG"
                            ></span>
                        </div>
                        <!-- 文字区 -->
                        <div class="menu-text">
                            <span class="step-num">步骤{{ item.value + 1 }}</span>
                            <span class="step-name">{{ item.label }}</span>
                        </div>
                    </li>
                </ul>

                <!-- 计算项目按钮 -->
                <div class="calc-btn-wrap" :class="{ 'calc-btn-wrap--loading': calculateLoading }">
                    <a-button
                        class="calc-btn"
                        :loading="calculateLoading"
                        :disabled="!route.query.id"
                        @click="handleCalculate"
                    >
                        <template #icon>
                            <span v-if="!calculateLoading" class="calc-btn-icon" v-html="MENU_ICON_SVGS['calc']"></span>
                        </template>
                        计算项目
                    </a-button>
                </div>
            </div>

            <div class="template-set-right">
                <div class="loading-box" v-if="isLoading || otherFeeLoading || expandAllLoading">
                    <a-spin></a-spin>
                </div>
                <div class="loading-box loading-box--calc" v-if="calculateLoading">
                    <a-spin tip="计算中，请稍候…" size="large"></a-spin>
                </div>

            <!-- 基本信息面板 -->
            <div v-if="leftActive === 0" class="basic-info-panel">

                <!-- 基本信息 -->
                <div class="bi-section">
                    <div class="bi-section-title">基本信息</div>
                    <div class="bi-form-grid">
                        <!-- row1 -->
                        <div class="bi-form-item">
                            <label class="bi-label">项目名称<span class="bi-required">*</span></label>
                            <a-input
                                class="bi-input"
                                :class="{ 'bi-field-error': isFieldError('projectName') }"
                                v-model:value="basicInfoForm.projectName"
                                placeholder="请输入您的项目名称"
                            />
                        </div>
                        <div class="bi-form-item">
                            <label class="bi-label">装机容量<span class="bi-required">*</span></label>
                            <a-input
                                class="bi-input"
                                :class="{ 'bi-field-error': isFieldError('installedCapacity') }"
                                v-model:value="basicInfoForm.installedCapacity"
                                placeholder="请输入"
                            >
                                <template #suffix><span class="bi-unit-inner">MW</span></template>
                            </a-input>
                        </div>
                        <!-- row2 -->
                        <div class="bi-form-item">
                            <label class="bi-label">项目所属区域<span class="bi-required">*</span></label>
                            <a-cascader
                                v-model:value="basicInfoForm.region"
                                placeholder="请选择省/市/区"
                                allow-clear
                                class="bi-select"
                                :class="{ 'bi-field-error': isFieldError('region') }"
                                :field-names="{
                                    label: 'regionName',
                                    value: 'regionCode',
                                    children: 'subList',
                                }"
                                :options="areaCodeOptions"
                            />
                        </div>
                        <div class="bi-form-item">
                            <label class="bi-label">地区分类</label>
                            <a-select
                                v-model:value="basicInfoForm.regionCategory"
                                placeholder="请选择"
                                allow-clear
                                class="bi-select"
                                :class="{ 'bi-field-error': isFieldError('regionCategory') }"
                            >
                                <a-select-option value="1">一类</a-select-option>
                                <a-select-option value="2">二类</a-select-option>
                                <a-select-option value="3">三类</a-select-option>
                                <a-select-option value="4">四类</a-select-option>
                                <a-select-option value="5">五类</a-select-option>
                            </a-select>
                        </div>
                        <!-- row3 -->
                        <div class="bi-form-item">
                            <label class="bi-label">项目海拔高度<span class="bi-required">*</span></label>
                            <a-input
                                class="bi-input"
                                :class="{ 'bi-field-error': isFieldError('altitude') }"
                                v-model:value="basicInfoForm.altitude"
                                placeholder="请输入"
                            >
                                <template #suffix><span class="bi-unit-inner">m</span></template>
                            </a-input>
                        </div>
                        <div class="bi-form-item">
                            <label class="bi-label">风机轮毂高度<span class="bi-required">*</span></label>
                            <a-input
                                class="bi-input"
                                :class="{ 'bi-field-error': isFieldError('hubHeight') }"
                                v-model:value="basicInfoForm.hubHeight"
                                placeholder="请输入"
                            >
                                <template #suffix><span class="bi-unit-inner">m</span></template>
                            </a-input>
                        </div>
                        <!-- row4 -->
                        <div class="bi-form-item">
                            <label class="bi-label">集电线路铺设方式<span class="bi-required">*</span></label>
                            <a-select
                                v-model:value="basicInfoForm.cableLayingMethod"
                                placeholder="请选择"
                                allow-clear
                                class="bi-select"
                                :class="{ 'bi-field-error': isFieldError('cableLayingMethod') }"
                            >
                                <a-select-option :value="1">架空线路</a-select-option>
                                <a-select-option :value="2">电缆铺设</a-select-option>
                            </a-select>
                        </div>
                        <div class="bi-form-item">
                            <label class="bi-label">升压站电压等级<span class="bi-required">*</span></label>
                            <a-select
                                v-model:value="basicInfoForm.voltageLevel"
                                placeholder="请选择"
                                allow-clear
                                class="bi-select"
                                :class="{ 'bi-field-error': isFieldError('voltageLevel') }"
                            >
                                <a-select-option :value="330">330 kV</a-select-option>
                                <a-select-option :value="220">220 kV</a-select-option>
                                <a-select-option :value="110">110 kV</a-select-option>
                                <a-select-option :value="66">66 kV</a-select-option>
                                <a-select-option :value="35">35 kV</a-select-option>
                                <a-select-option :value="10">10 kV</a-select-option>
                            </a-select>
                        </div>
                        <!-- row5: 编制日期 + 建设期 在左列，右列留空 -->
                        <div class="bi-form-item bi-date-item">
                            <label class="bi-label">编制日期</label>
                            <div class="bi-date-compound">
                                <a-date-picker
                                    v-model:value="basicInfoForm.compilationDate"
                                    placeholder="请选择年/月/日"
                                    style="flex: 1; min-width: 0"
                                />
                                <span class="bi-date-sep">建设期</span>
                                <a-input
                                    v-model:value="basicInfoForm.constructionPeriod"
                                    class="bi-input bi-construction-input"
                                    placeholder="1"
                                >
                                    <template #suffix><span class="bi-unit-inner">年</span></template>
                                </a-input>
                            </div>
                        </div>
                        <div></div>
                    </div>
                </div>

                <!-- 投资设置 -->
                <div class="bi-section">
                    <div class="bi-section-title">投资设置</div>
                    <div class="bi-form-grid">
                        <div class="bi-form-item">
                            <label class="bi-label">资本金比例<span class="bi-required">*</span></label>
                            <a-input
                                class="bi-input"
                                :class="{ 'bi-field-error': isFieldError('capitalRatio') }"
                                v-model:value="basicInfoForm.capitalRatio"
                                placeholder="请输入"
                            >
                                <template #suffix><span class="bi-unit-inner">%</span></template>
                            </a-input>
                        </div>
                        <div class="bi-form-item">
                            <label class="bi-label">长期贷款利率<span class="bi-required">*</span></label>
                            <a-input
                                class="bi-input"
                                :class="{ 'bi-field-error': isFieldError('loanRate') }"
                                v-model:value="basicInfoForm.loanRate"
                                placeholder="请输入"
                            >
                                <template #suffix><span class="bi-unit-inner">%</span></template>
                            </a-input>
                        </div>
                        <div class="bi-form-item">
                            <label class="bi-label">价格库<span class="bi-required">*</span></label>
                            <a-select
                                v-model:value="basicInfoForm.priceLibrary"
                                placeholder="请选择"
                                allow-clear
                                class="bi-select"
                                :class="{ 'bi-field-error': isFieldError('priceLibrary') }"
                                :options="priceLibraryOptions"
                            />
                        </div>
                        <div></div>
                    </div>
                </div>

                <!-- 系数设置 -->
                <div class="bi-section">
                    <div class="bi-section-title">系数设置</div>
                    <div class="bi-form-grid">
                        <div class="bi-form-item">
                            <label class="bi-label">海拔调整系数（人工）</label>
                            <a-input class="bi-input" v-model:value="basicInfoForm.altitudeCoeffManual" placeholder="请输入" />
                        </div>
                        <div class="bi-form-item">
                            <label class="bi-label">海拔调整系数（机械）</label>
                            <a-input class="bi-input" v-model:value="basicInfoForm.altitudeCoeffMachine" placeholder="1.0" />
                        </div>
                        <div class="bi-form-item">
                            <label class="bi-label">人工总体系数</label>
                            <a-input class="bi-input" v-model:value="basicInfoForm.overallManualCoeff" placeholder="1.0" />
                        </div>
                        <div class="bi-form-item">
                            <label class="bi-label">机械总体系数</label>
                            <a-input class="bi-input" v-model:value="basicInfoForm.overallMachineCoeff" placeholder="1.0" />
                        </div>
                    </div>
                </div>

            </div>

            <!-- 原有表格（其他 tab） -->
            <div v-else-if="leftActive !== 5" class="template-set-table">
                <a-table
                    v-if="tableData.length > 0"
                    :dataSource="tableData"
                    :columns="computedColumns['columns']"
                    bordered
                    size="small"
                    style="width: 100%; height: 100%"
                    :pagination="false"
                    :expandedRowKeys="expandedRowKeys"
                    :scroll="{ x: 800, y: scrollHeight }"
                    :rowKey="'id'"
                    @expandedRowsChange="expandedRowsChangeEvent"
                    @expand="handleRowExpand"
                    :row-class-name="(_record, index) => (index % 2 === 1 ? 'table-striped' : null)"
                >
                    <template #title>
                        <div style="display:flex; align-items:center; justify-content:space-between;">
                            <span style="color: #036b64; font-weight: 500; line-height: 2">{{ computedColumns['title'] }}</span>
                            <a-button
                                size="small"
                                :loading="expandAllLoading"
                                @click="handleExpandAll"
                            >{{ isAllExpanded ? '全部收起' : '全部展开' }}</a-button>
                        </div>
                    </template>
                    <template #headerCell="{ column }">
                        <p class="self_table_title">{{ column.title }}</p>
                    </template>
                    <template #bodyCell="{ column, record, index }">
                        <div class="cell-wrapper">
                            <template v-if="column.dataIndex == 'itemNumber'">
                                <a-dropdown :trigger="['contextmenu']">
                                    <div class="serial-number serial-number-line">
                                        <a-tooltip title="右键进行相关操作">
                                            {{ record[column.dataIndex] }}
                                        </a-tooltip>
                                        <template v-for="item in record['tier']">
                                            <i
                                                v-if="item !== record['tier']"
                                                class="serial-number-dot"
                                                :style="{ left: (item + 1) * 18 + 'px' }"
                                            ></i>
                                        </template>
                                    </div>
                                    <template #overlay>
                                        <a-menu>
                                            <a-menu-item
                                                key="delItem"
                                                style="color: red"
                                                @click="handleMenuClick('delete', record, index)"
                                            >
                                                <span class="warning-item">删除</span>
                                            </a-menu-item>
                                            <template v-if="leftActive !== 4 && !record.children">
                                                <a-menu-divider />
                                                <a-menu-item
                                                    key="addPrice"
                                                    @click="handleAddPrice(record, index)"
                                                >
                                                    <span>添加定额</span>
                                                </a-menu-item>
                                                <a-menu-item
                                                    key="delPrice"
                                                    style="color: red"
                                                    @click="handleDelPrice(record)"
                                                >
                                                    <span class="warning-item">删除定额</span>
                                                </a-menu-item>
                                            </template>
                                        </a-menu>
                                    </template>
                                </a-dropdown>
                            </template>
                            <template
                                v-else-if="
                                    (column.dataIndex == 'unitPrice' && leftActive !== 2 ||
                                        column.dataIndex == 'installUnitFee' && leftActive === 2) &&
                                    leftActive !== 4 &&
                                    !record.children
                                "
                            >
                                <template v-if="leftActive == 2">
                                    <a-input
                                        v-model:value.trim="record.installUnitFee"
                                        style="width: 100%"
                                        @focus="handlePriceInputFocus(record, 'installUnitFee', $event)"
                                        @input="handleRowInputChange(record, 'installUnitFee')"
                                    ></a-input>
                                </template>
                                <a-input
                                    v-else
                                    v-model:value.trim="record.unitPrice"
                                    style="width: 100%"
                                    @focus="handlePriceInputFocus(record, 'unitPrice', $event)"
                                    @input="handleRowInputChange(record, 'unitPrice')"
                                ></a-input>
                            </template>
                            <template v-else-if="column.dataIndex == 'itemQuotaReqList'">
                                <a-dropdown :trigger="['contextmenu']">
                                    <div
                                        v-if="!record.children"
                                        @dblclick.prevent="handleAddPrice(record, index)"
                                        style="
                                            position: absolute;
                                            top: 0;
                                            width: 100%;
                                            height: 100%;
                                            display: flex;
                                            align-items: center;
                                            flex-wrap: wrap;
                                        "
                                    >
                                        <div
                                            v-if="
                                                record.itemQuotaReqList &&
                                                Array.isArray(record.itemQuotaReqList)
                                            "
                                            style="cursor: pointer"
                                            @click.stop="openPriceModal(record)"
                                        >
                                            <i v-for="(item, itemIndex) in record.itemQuotaReqList">
                                                {{ item['quotaCode']
                                                }}{{
                                                    itemIndex < record.itemQuotaReqList.length - 1
                                                        ? '，'
                                                        : ''
                                                }}
                                            </i>
                                        </div>
                                    </div>
                                    <template #overlay>
                                        <a-menu>
                                            <a-menu-item
                                                key="copy"
                                                @click.stop="handleCopyEvent(record, index)"
                                                >复制</a-menu-item
                                            >
                                            <a-menu-item
                                                key="paste"
                                                @click.stop="handlePasteEvent(record, index)"
                                                >粘贴</a-menu-item
                                            >
                                        </a-menu>
                                    </template>
                                </a-dropdown>
                            </template>
                            <template v-else>
                                <template v-if="column.type === 'input'">
                                    <template
                                        v-if="!record.children || column.dataIndex == 'itemName'"
                                    >
                                        <template
                                            v-if="
                                                leftActive === 4 &&
                                                (column.dataIndex === 'unitPrice' ||
                                                    column.dataIndex == 'quantity')
                                            "
                                        >
                                            <span
                                                v-if="
                                                    record.autoCalculate ||
                                                    (record.calculateWay == '基数X费率' &&
                                                        column.dataIndex == 'unitPrice')
                                                "
                                                >自动计算</span
                                            >
                                            <a-input
                                                v-else
                                                @blur="calculateTotalPriceEvent(record)"
                                                @input="handleRowInputChange(record, column.dataIndex)"
                                                :placeholder="column.placeholder"
                                                v-model:value="record[column.dataIndex]"
                                            />
                                        </template>
                                        <template v-else>
                                            <a-input
                                                @blur="calculateTotalPriceEvent(record)"
                                                @input="handleRowInputChange(record, column.dataIndex)"
                                                :placeholder="column.placeholder"
                                                v-model:value="record[column.dataIndex]"
                                            />
                                        </template>
                                    </template>
                                </template>
                                <template v-else-if="column.type === 'select' && !record.children">
                                    <template v-if="leftActive == 4">
                                        <a-select
                                            :disabled="record.autoCalculate"
                                            @change="handleChangeCalculateWayEvent(record)"
                                            allowClear
                                            style="width: 100%"
                                            v-model:value="record[column.dataIndex]"
                                            :options="column.options"
                                        ></a-select>
                                    </template>
                                    <a-select
                                        v-else
                                        allowClear
                                        style="width: 100%"
                                        v-model:value="record[column.dataIndex]"
                                        :options="column.options"
                                    ></a-select>
                                </template>
                                <a-checkbox
                                    v-else-if="column.type === 'checkbox' && !record.children"
                                    @change="handleChangeSelectEvent(record)"
                                    v-model:checked="record[column.dataIndex]"
                                ></a-checkbox>
                                <span v-else-if="column.type === 'text'">{{
                                    record[column.dataIndex]
                                }}</span>
                                <span v-else-if="!record.children">{{
                                    record[column.dataIndex]
                                }}</span>
                            </template>
                        </div>
                    </template>
                </a-table>
                <div class="no-result" v-else>
                    <img src="@/assets/img/no-result-bg.png" alt="" />
                    <p>暂无数据</p>
                </div>
            </div>

            <!-- 工程总概算 -->
            <div v-else-if="leftActive === 5" class="template-set-table estimate-tabs-panel">

                <!-- 顶部 tab 切换 + 下载按钮 -->
                <div class="estimate-toolbar">
                    <div class="estimate-actions"></div>
                    <div class="estimate-tab-list">
                        <span
                            v-for="tab in ESTIMATE_TABS"
                            :key="tab.key"
                            class="estimate-tab-item"
                            :class="{ active: estimateActiveTab === tab.key }"
                            @click="estimateActiveTab = tab.key"
                        >{{ tab.label }}</span>
                    </div>
                    <div class="estimate-actions">
                        <a-button
                            type="primary"
                            :loading="downloadExcelLoading"
                            @click="handleDownloadExcel"
                        >↓ 下载Excel</a-button>
                    </div>
                </div>

                <!-- 工程总概算表 -->
                <template v-if="estimateActiveTab === 'total'">
                    <a-table
                        v-if="estimateTableData.length > 0"
                        :dataSource="estimateTableData"
                        :columns="ESTIMATE_COLUMNS"
                        bordered size="small"
                        style="width:100%"
                        :pagination="false"
                        :scroll="{ x: 1100, y: scrollHeight }"
                        :rowKey="'code'"
                        :row-class-name="(_r, i) => (i % 2 === 1 ? 'table-striped' : null)"
                    >
                        <template #headerCell="{ column }">
                            <p class="self_table_title">{{ column.title }}</p>
                        </template>
                        <template #bodyCell="{ text }">
                            {{ hideIfZero(text) }}
                        </template>
                    </a-table>
                    <div class="no-result" v-else>
                        <img src="@/assets/img/no-result-bg.png" alt="" /><p>暂无数据</p>
                    </div>
                </template>

                <!-- 施工辅助工程概算表 -->
                <template v-else-if="estimateActiveTab === 'construction'">
                    <a-table
                        v-if="constructionAuxData.length > 0"
                        :dataSource="constructionAuxData"
                        :columns="CONSTRUCTION_AUX_COLUMNS"
                        bordered size="small"
                        style="width:100%"
                        :pagination="false"
                        :scroll="{ x: 900, y: scrollHeight }"
                        :rowKey="(_, i) => i"
                        :row-class-name="(_r, i) => (i % 2 === 1 ? 'table-striped' : null)"
                    >
                        <template #headerCell="{ column }">
                            <p class="self_table_title">{{ column.title }}</p>
                        </template>
                        <template #bodyCell="{ text }">
                            {{ hideIfZero(text) }}
                        </template>
                    </a-table>
                    <div class="no-result" v-else>
                        <img src="@/assets/img/no-result-bg.png" alt="" /><p>暂无数据</p>
                    </div>
                </template>

                <!-- 建筑工程概算表 -->
                <template v-else-if="estimateActiveTab === 'build'">
                    <a-table
                        v-if="estimateBuildData.length > 0"
                        :dataSource="estimateBuildData"
                        :columns="ESTIMATE_BUILD_COLUMNS"
                        bordered size="small"
                        style="width:100%"
                        :pagination="false"
                        :scroll="{ x: 900, y: scrollHeight }"
                        :rowKey="(_, i) => i"
                        :row-class-name="(_r, i) => (i % 2 === 1 ? 'table-striped' : null)"
                    >
                        <template #headerCell="{ column }">
                            <p class="self_table_title">{{ column.title }}</p>
                        </template>
                        <template #bodyCell="{ text }">
                            {{ hideIfZero(text) }}
                        </template>
                    </a-table>
                    <div class="no-result" v-else>
                        <img src="@/assets/img/no-result-bg.png" alt="" /><p>暂无数据</p>
                    </div>
                </template>

                <!-- 设备及安装工程概算表 -->
                <template v-else-if="estimateActiveTab === 'install'">
                    <a-table
                        v-if="installEngData.length > 0"
                        :dataSource="installEngData"
                        :columns="INSTALL_ENG_COLUMNS"
                        bordered size="small"
                        style="width:100%"
                        :pagination="false"
                        :scroll="{ x: 1400, y: scrollHeight }"
                        :rowKey="(_, i) => i"
                        :row-class-name="(_r, i) => (i % 2 === 1 ? 'table-striped' : null)"
                    >
                        <template #headerCell="{ column }">
                            <p class="self_table_title">{{ column.title }}</p>
                        </template>
                        <template #bodyCell="{ text }">
                            {{ hideIfZero(text) }}
                        </template>
                    </a-table>
                    <div class="no-result" v-else>
                        <img src="@/assets/img/no-result-bg.png" alt="" /><p>暂无数据</p>
                    </div>
                </template>

                <!-- 主要材料预算价格计算表 -->
                <template v-else-if="estimateActiveTab === 'material'">
                    <a-table
                        v-if="materialBudgetData.length > 0"
                        :dataSource="materialBudgetData"
                        :columns="MATERIAL_BUDGET_COLUMNS"
                        bordered size="small"
                        style="width:100%"
                        :pagination="false"
                        :scroll="{ x: 700, y: scrollHeight }"
                        :rowKey="(_, i) => i"
                        :row-class-name="(_r, i) => (i % 2 === 1 ? 'table-striped' : null)"
                    >
                        <template #headerCell="{ column }">
                            <p class="self_table_title">{{ column.title }}</p>
                        </template>
                        <template #bodyCell="{ text }">
                            {{ hideIfZero(text) }}
                        </template>
                    </a-table>
                    <div class="no-result" v-else>
                        <img src="@/assets/img/no-result-bg.png" alt="" /><p>暂无数据</p>
                    </div>
                </template>

                <!-- 其他费用概算表 -->
                <template v-else-if="estimateActiveTab === 'other'">
                    <a-table
                        v-if="otherCostData.length > 0"
                        :dataSource="otherCostData"
                        :columns="OTHER_COST_COLUMNS"
                        bordered size="small"
                        style="width:100%"
                        :pagination="false"
                        :scroll="{ x: 900, y: scrollHeight }"
                        :rowKey="(_, i) => i"
                        :row-class-name="(_r, i) => (i % 2 === 1 ? 'table-striped' : null)"
                    >
                        <template #headerCell="{ column }">
                            <p class="self_table_title">{{ column.title }}</p>
                        </template>
                        <template #bodyCell="{ text }">
                            {{ hideIfZero(text) }}
                        </template>
                    </a-table>
                    <div class="no-result" v-else>
                        <img src="@/assets/img/no-result-bg.png" alt="" /><p>暂无数据</p>
                    </div>
                </template>

            </div>

            <!-- 关联定额模块 -->
            <a-drawer
                :placement="'bottom'"
                :visible="visible"
                :get-container="false"
                :style="{ position: 'absolute' }"
                @close="
                    visible = false;
                    selectedData = null;
                "
            >
                <template #title>
                    关联定额
                    <a-tooltip title="点击定额项可查看定额费用项" placement="bottom"
                        ><question-circle-outlined
                    /></a-tooltip>
                </template>
                <template #extra>
                    <a-button type="primary" @click="handleAddPrice(selectedData)"
                        >添加关联定额</a-button
                    >
                </template>
                <div class="a-drawer-content">
                    <a-table
                        :customRow="customRow"
                        :scroll="{ y: 550 }"
                        :columns="PRICECOLUMNS"
                        :dataSource="
                            selectedData && selectedData.itemQuotaReqList
                                ? JSON.parse(JSON.stringify(selectedData.itemQuotaReqList))
                                : []
                        "
                        :pagination="false"
                        :row-class-name="
                            (_record, index) => (_record['selected'] ? 'table-selected' : null)
                        "
                    >
                        <template #bodyCell="{ column, record, index }">
                            <template
                                v-if="
                                    column.dataIndex == 'manualFactor' ||
                                    column.dataIndex == 'materialFactor' ||
                                    column.dataIndex == 'machineryFactor'
                                "
                            >
                                <a-input-number
                                    :controls="false"
                                    :step="0.001"
                                    style="color: #036b64; width: 100%"
                                    @click="(e) => { e.stopPropagation(); }"
                                    @blur.stop="changeValue(record, index, column.dataIndex)"
                                    v-model:value="record[column.dataIndex]"
                                ></a-input-number>
                            </template>
                            <template v-else-if="column.dataIndex == 'quantity'">
                                <a-input-number
                                    :controls="false"
                                    :step="0.001"
                                    style="color: #036b64; width: 100%"
                                    @blur.stop="changeValue(record, index, column.dataIndex)"
                                    @click="(e) => { e.stopPropagation(); }"
                                    v-model:value="record[column.dataIndex]"
                                ></a-input-number>
                            </template>
                            <template v-else>
                                <div
                                    class="warning-item"
                                    @click.stop="handleDelPriceItem(record, index)"
                                    v-if="column.dataIndex == 'operation'"
                                >
                                    <span class="warning-item-span-del">移除</span>
                                </div>
                                <span v-else>{{ record[column.dataIndex] }}</span>
                            </template>
                        </template>
                        <template #footer v-if="quotaPriceTableData.length">
                            <h4 style="margin-bottom: 12px; font-weight: bolder">定额费用项</h4>
                            <a-table
                                :dataSource="quotaPriceTableData.filter(ele => ele.quantity)"
                                :pagination="false"
                                :columns="[
                                    { title: '费用编码', dataIndex: 'unitPriceCode' },
                                    { title: '费用名称', dataIndex: 'unitPriceName' },
                                    { title: '类型', dataIndex: 'unitPriceFirstCategory' },
                                    { title: '型号', dataIndex: 'model' },
                                    { title: '单位', dataIndex: 'unit' },
                                    { title: '单价/元', dataIndex: 'unitPrice' },
                                    { title: '数量', dataIndex: 'quantity' },
                                ]"
                            >
                                <template #bodyCell="{ column, record, index }">
                                    <div
                                        v-if="column.dataIndex == 'unitPriceFirstCategory'"
                                        style="padding: 8px 0"
                                    >
                                        {{ getFirstCategoryName[record['unitPriceFirstCategory']] }}
                                    </div>
                                    <span v-else>{{ record[column.dataIndex] }}</span>
                                </template>
                            </a-table>
                        </template>
                    </a-table>
                </div>
            </a-drawer>
        </div>

        <!-- 定额模块 -->
        <a-modal
            :maskClosable="false"
            v-model:open="addPriceVisible"
            :width="1000"
            :wrap-style="{ overflow: 'hidden' }"
        >
            <template #title>
                <div ref="modalTitleRef" style="width: 100%; cursor: move">添加定额</div>
            </template>
            <template #footer>
                <a-button key="back" @click="addPriceVisible = false">取消</a-button>
                <a-button key="submit" type="primary" @click="replacehandleOk">确定</a-button>
            </template>
            <template #modalRender="{ originVNode }">
                <div :style="transformStyle">
                    <component :is="originVNode"></component>
                </div>
            </template>
            <addPriceVue ref="addPriceRef"></addPriceVue>
        </a-modal>

        <!-- 替换项模块 -->
        <a-modal
            :maskClosable="false"
            v-model:open="replacePriceVisible"
            title="选择替换项"
            :width="1000"
            @ok="handleReplaceOk"
        >
            <replacePrice ref="replacePriceRef" :resourceData="replacePriceData"></replacePrice>
        </a-modal>
        </div><!-- end ts-body -->
    </div>
</template>

<script setup>
    import {
        ref,
        onBeforeMount,
        onMounted,
        onUnmounted,
        computed,
        createVNode,
        watch,
        nextTick,
        watchEffect,
        toRef,
        reactive,
    } from 'vue';
    import { useRoute, useRouter } from 'vue-router';
    import { message, Modal } from 'ant-design-vue';
    import { treeDataOperator } from '@/utils/handleTreeNodeData';
    import addPriceVue from './addPrice.vue';
    import replacePrice from './replacePrice.vue';
    import dayjs from 'dayjs';
    import {
        getConstructionServiceTree,
        saveConstructionServiceTree,
        getDeviceInstallTree,
        saveDeviceInstallTree,
        getConstructionTree,
        saveConstructionTree,
        getOtherCostTree,
        saveOtherCostTree,
        getReplaceItem,
        getQuotaPriceByCode,
        getQuotaPriceByQuotaCode,
        createProject,
        updateProject,
        editBuildEngineer,
        editConAuxiliary,
        editEquipInstall,
        editOtherFee,
        addBuildEngineerQuota,
        removeBuildEngineerQuota,
        addConAuxiliaryQuota,
        removeConAuxiliaryQuota,
        addEquipInstallQuota,
        removeEquipInstallQuota,
        getMaterialPrice,
        getProjectDetailById,
        getProjectDetailByIdEdit,
        comprehensiveEstimateData,
        getOtherPrice,
        editQuota,
        clearQuota,
        againGeneReport
    } from '@/api/modules/sourceData/estimateProject.js';
    import { getDefaultPricValue } from '@/api/modules/pric.js';
    import { getProvince } from '@/api/modules/base';
    import { flattenTree, arrayToTree } from '@/utils/treeFormateArray.js';
    import { getManualCoefficient, getMechanicalCoefficient } from '@/utils/altitudeCoefficient';
    import * as XLSX from 'xlsx';
    import useAreaDataStore from '@/pinia/modules/areaData';
    import { QuestionCircleOutlined } from '@ant-design/icons-vue';
    import { useDraggable } from '@vueuse/core';
    import { MENU_ICON_SVGS, STATUS_ACTIVE_SVG, STATUS_DONE_SVG } from './menuIcons.js';

    const scrollHeight = ref(500);
    const route = useRoute();
    const router = useRouter();
    // 编辑模式下缓存 getProjectDetailByIdEdit 的返回数据（4 个树 + 基本信息）
    const projectEditDetail = ref(null);
    const addPriceVisible = ref(false);
    const replacePriceVisible = ref(false);
    const visible = ref(false);
    const addPriceRef = ref(null);
    const replacePriceRef = ref(null);
    const replacePriceData = ref(null);
    const modalTitleRef = ref(null);
    const { x, y, isDragging } = useDraggable(modalTitleRef);
    const startX = ref(0);
    const startY = ref(0);
    const startedDrag = ref(false);
    const transformX = ref(0);
    const transformY = ref(0);
    const preTransformX = ref(0);
    const preTransformY = ref(0);
    const dragRect = ref({ left: 0, right: 0, top: 0, bottom: 0 });
    const calculateLoading = ref(false);
    const completedTabs = ref(new Set());

    // 判断是否有科研项目id
    const hasProjectId = ref(false)

    const getMenuIcon = (value) => {
        return MENU_ICON_SVGS[value] || '';
    };

    const getFirstCategoryName = {
        P0001: '人工',
        P0002: '材料',
        P0005: '机械',
    };

    const priceLibraryOptions = ref([]);

    // ─── 左侧菜单 ─────────────────────────────────────────────
    const LEFT_MENU = [
        {
            label: '基本信息',
            value: 0,
        },
        {
            label: '施工辅助工程',
            value: 1,
            title: '一、施工辅助工程',
            columns: [
                { title: '编号', dataIndex: 'itemNumber', width: 180, fixed: 'left', resizable: true },
                { title: '名称', dataIndex: 'itemName', type: 'input', width: 320, fixed: 'left', resizable: true },
                { title: '单位', dataIndex: 'unit', type: 'input', width: 160, resizable: true },
                { title: '数量', dataIndex: 'quantity', type: 'input', width: '160px' },
                { title: '单价/元', dataIndex: 'unitPrice', width: '160px' },
                { title: '合计/万元', dataIndex: 'totalPrice', width: '160px' },
                { title: '定额编号', dataIndex: 'itemQuotaReqList', width: '160px' },
                { title: '备注', dataIndex: 'remarks', type: 'input', width: '160px' },
                { title: '标记', dataIndex: 'tag', type: 'input', width: '120px' },
            ],
        },
        {
            label: '设备及安装工程',
            value: 2,
            title: '二、设备及安装工程',
            columns: [
                { title: '编号', dataIndex: 'itemNumber', width: 180, fixed: 'left' },
                { title: '名称', dataIndex: 'itemName', type: 'input', width: 320, fixed: 'left' },
                { title: '单位', dataIndex: 'unit', type: 'input', width: 160 },
                { title: '数量', dataIndex: 'quantity', type: 'input', width: 160 },
                {
                    title: '单价/元',
                    dataIndex: 'unitPrice',
                    children: [
                        { title: '设备费', dataIndex: 'equipmentUnitFee', width: 160, type: 'input' },
                        { title: '安装费', dataIndex: 'installUnitFee', width: 160, type: 'input' },
                        { title: '装置性材料费', dataIndex: 'materialsUnitFee', width: 160, type: 'input' },
                        { title: '甲供装置性材料费', dataIndex: 'supplyMaterialsUnitFee', width: 160, type: 'input' },
                        { title: '定额编号', dataIndex: 'itemQuotaReqList', width: 160 },
                    ],
                },
                {
                    title: '合计/万元',
                    dataIndex: 'age',
                    children: [
                        { title: '设备费', dataIndex: 'equipmentTotalFee', width: 160 },
                        { title: '安装费', dataIndex: 'installTotalFee', width: 160 },
                        { title: '装置性材料费', dataIndex: 'materialsTotalFee', width: 160 },
                        { title: '甲供装置性材料费', dataIndex: 'supplyMaterialsTotalFee', width: 160 },
                    ],
                },
                { title: '合计/万元', dataIndex: 'totalPrice', width: 160 },
                { title: '备注', dataIndex: 'remarks', width: 160, type: 'input' },
                { title: '标记', dataIndex: 'tag', width: 160, type: 'input' },
            ],
        },
        {
            label: '建筑工程',
            value: 3,
            title: '三、建筑工程',
            columns: [
                { title: '编号', dataIndex: 'itemNumber', width: 180, fixed: 'left' },
                { title: '名称', dataIndex: 'itemName', width: 320, type: 'input', fixed: 'left' },
                { title: '单位', dataIndex: 'unit', width: 120, type: 'input' },
                { title: '数量', dataIndex: 'quantity', width: 120, type: 'input' },
                { title: '单价/元', dataIndex: 'unitPrice', width: 120 },
                { title: '合计/万元', dataIndex: 'totalPrice', width: 120 },
                { title: '定额编号', dataIndex: 'itemQuotaReqList', width: 160 },
                { title: '备注', dataIndex: 'remarks', width: 160, type: 'input' },
                { title: '标记', dataIndex: 'tag', width: 160, type: 'input' },
            ],
        },
        {
            label: '其他费用',
            value: 4,
            title: '四、其他费用',
            columns: [
                { title: '编号', dataIndex: 'itemNumber', width: 180 },
                { title: '工程或费用名称', dataIndex: 'itemName', type: 'input', width: 320 },
                { title: '单位', dataIndex: 'unit', type: 'input', width: 120 },
                {
                    title: '计算方式',
                    dataIndex: 'calculateWay',
                    type: 'select',
                    width: 140,
                    options: [
                        { label: '数量×单价', value: '数量X单价' },
                        { label: '基数×费率', value: '基数X费率' },
                    ],
                },
                { title: '费率（%）/数量', dataIndex: 'quantity', type: 'input', width: 120 },
                { title: '计算基础（万元）/单价（元）', dataIndex: 'unitPrice', type: 'input', width: 140 },
                { title: '合计/万元', dataIndex: 'totalPrice', width: 140 },
                { title: '自动计算', dataIndex: 'autoCalculate', type: 'checkbox', width: 100 },
                { title: '增值税率（%）', dataIndex: 'vatRate', type: 'input', width: 120 },
                { title: '备注', dataIndex: 'remarks', type: 'input', width: 120 },
                { title: '标记', dataIndex: 'tag', type: 'input', width: 120 },
            ],
        },
        {
            label: '工程总概算',
            value: 5,
        },
    ];

    // ─── 工程总概算子 tab 列表 ────────────────────────────────
    const ESTIMATE_TABS = [
        { key: 'total',        label: '工程总概算表' },
        { key: 'construction', label: '施工辅助工程概算表' },
        { key: 'build',        label: '建筑工程概算表' },
        { key: 'install',      label: '设备及安装工程概算表' },
        { key: 'material',     label: '主要材料预算价格计算表' },
        { key: 'other',        label: '其他费用概算表' },
    ];

    // 工程总概算表头
    const ESTIMATE_COLUMNS = [
        { title: '编号',            dataIndex: 'code',                        width: 140, fixed: 'left' },
        { title: '工程或费用名称',    dataIndex: 'projectName',                 width: 260, fixed: 'left' },
        { title: '设备购置费（万元）', dataIndex: 'equipment_purchase_cost',     width: 160 },
        { title: '建安工程费（万元）', dataIndex: 'construction_install_cost',   width: 160 },
        { title: '其他费用（万元）',   dataIndex: 'other_cost',                  width: 140 },
        { title: '合计（万元）',      dataIndex: 'total_cost',                   width: 140 },
        { title: '占总投资比例（%）',  dataIndex: 'proportion_total_investment',  width: 150 },
    ];

    // ── 施工辅助工程概算表列 ─────────────────────────────────────
    const CONSTRUCTION_AUX_COLUMNS = [
        { title: '序号',          dataIndex: 'serialNumber', width: 100, fixed: 'left' },
        { title: '工程或费用名称', dataIndex: 'projectName',  width: 260, fixed: 'left' },
        { title: '单位',          dataIndex: 'unit',         width: 120 },
        { title: '数量',          dataIndex: 'number',       width: 120 },
        { title: '单价（万元）',   dataIndex: 'unitPrice',    width: 140 },
        { title: '合计（万元）',   dataIndex: 'totalCost',    width: 140 },
    ];

    // ── 建筑工程概算表列 ─────────────────────────────────────────
    const ESTIMATE_BUILD_COLUMNS = [
        { title: '序号',          dataIndex: 'serialNumber', width: 100, fixed: 'left' },
        { title: '工程或费用名称', dataIndex: 'projectName',  width: 260, fixed: 'left' },
        { title: '单位',          dataIndex: 'unit',         width: 120 },
        { title: '数量',          dataIndex: 'number',       width: 120 },
        { title: '单价（万元）',   dataIndex: 'unitPrice',    width: 140 },
        { title: '合计（万元）',   dataIndex: 'totalCost',    width: 140 },
    ];

    // ── 设备及安装工程概算表列 ───────────────────────────────────
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

    // ── 主要材料预算价格计算表列 ─────────────────────────────────
    const MATERIAL_BUDGET_COLUMNS = [
        { title: '编号',          dataIndex: 'serialNumber', width: 120, fixed: 'left' },
        { title: '材料名称及规格', dataIndex: 'projectName', width: 280, fixed: 'left' },
        { title: '单位',          dataIndex: 'unit',         width: 120 },
        { title: '价格（元）',    dataIndex: 'price',        width: 150 },
    ];

    // ── 其他费用概算表列 ─────────────────────────────────────────
    const OTHER_COST_COLUMNS = [
        { title: '编号',       dataIndex: 'code',           width: 100, fixed: 'left' },
        { title: '名称及规格', dataIndex: 'projectName',     width: 240, fixed: 'left' },
        { title: '单位',       dataIndex: 'unit',            width: 120 },
        { title: '费率/数量',  dataIndex: 'rateOrQuantity',  width: 130 },
        { title: '单价（万元）', dataIndex: 'unitPrice',     width: 140 },
        { title: '合计（万元）', dataIndex: 'amount',        width: 140 },
    ];

    // 关联定额表头
    const PRICECOLUMNS = [
        { title: '定额编码', dataIndex: 'quotaCode', width: 100, fixed: 'left' },
        { title: '定额名称', dataIndex: 'quotaName', width: 200, fixed: 'left' },
        { title: '单位', dataIndex: 'unit', width: 120 },
        { title: '数量', dataIndex: 'quantity', width: 120 },
        { title: '人工系数', dataIndex: 'manualFactor', width: 120 },
        { title: '材料系数', dataIndex: 'materialFactor', width: 120 },
        { title: '机械系数', dataIndex: 'machineryFactor', width: 120 },
        { title: '操作', dataIndex: 'operation', width: 110 },
    ];

    const defaultExpandedRowKeys = ref([]);
    const expandedRowKeys = ref([]);       // controlled expand keys
    const expandAllLoading = ref(false);   // loading state for expand-all
    const isAllExpanded = ref(false);      // whether all rows are expanded

    /** 递归收集所有有子节点的行 id */
    const getAllIds = (nodes) => {
        const ids = [];
        if (!nodes || !nodes.length) return ids;
        for (const node of nodes) {
            if (node.children && node.children.length) {
                ids.push(node.id);
                ids.push(...getAllIds(node.children));
            }
        }
        return ids;
    };


    // 单元格为0替换成空
    // ─── 单元格值精确等于 0（数字0 或 字符串"0"）时不显示 ─────────────
const hideIfZero = (text) => (text === 0 || text === '0') ? '' : text;

/**
 * 等待五环平台发送登录态
 *
 * 只有 URL 中带 origin=wh 时才执行跨平台登录态同步。
 * 普通从天同平台内部进入时，直接继续执行。
 * 
 * 增加 5 秒超时机制：如果父窗口没有响应，自动放行，避免页面卡死
 */
 const waitForSessionStorage = () => {
    // 普通进入概算页面，不需要跨平台同步
    if (route.query.origin !== 'wh') {
        return Promise.resolve();
    }

    // 没有 opener，无法向五环平台请求数据
    if (!window.opener) {
        console.warn('概算页面没有找到来源窗口，跳过登录态同步');
        return Promise.resolve();
    }

    return new Promise((resolve) => {
        let finished = false;

        // 结束函数：清理监听器并 resolve
        const finish = () => {
            if (finished) return;
            finished = true;
            window.removeEventListener('message', handleSessionMessage);
            resolve();
        };

        // ✅ 超时机制：5秒后如果还没收到消息，自动放行
        const timeoutId = setTimeout(() => {
            console.warn('等待登录态超时（5s），继续执行');
            finish();
        }, 5000);

        // 消息处理函数
        const handleSessionMessage = (e) => {
            // 只接收打开当前页面的窗口发来的消息
            if (e.source !== window.opener) {
                return;
            }

            // 'weather' / 'wh' 是握手消息，不是真正的数据
            if (e.data === 'weather' || e.data === 'wh') {
                return;
            }

            // 尝试解析 JSON 数据
            let sessionStorageData;
            try {
                sessionStorageData = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
            } catch (error) {
                console.warn('概算页面收到的消息不是有效 JSON：', e.data);
                return;
            }

            // 校验数据格式
            if (!sessionStorageData || typeof sessionStorageData !== 'object') {
                return;
            }

            // 将收到的数据写入 sessionStorage
            Object.keys(sessionStorageData).forEach((key) => {
                sessionStorage.setItem(key, sessionStorageData[key] ?? '');
            });

            console.log('✅ 概算页面登录态同步完成');

            // 清除超时定时器
            clearTimeout(timeoutId);

            // 删除 URL 中的 origin 参数，避免重复触发
            const query = { ...route.query };
            delete query.origin;
            router.replace({
                path: route.path,
                query,
            });

            finish();
        };

        // 监听消息事件
        window.addEventListener('message', handleSessionMessage);

        // 向父窗口发起登录态请求
        window.opener.postMessage('weather', '*');
    });
};

    /** 全部展开 / 全部收起 */
    const handleExpandAll = async () => {
        console.log("dddddddddddddddddd")
        expandAllLoading.value = true;
        console.log("eeeeeeeeeeeeeeeeeeeeeeee")
        // setTimeout(宏任务) 确保浏览器彻底完成当前帧的绘制（含 overlay 出现）
        // 比 rAF 更可靠：rAF 可能与 Vue 微任务在同一帧合并，导致 loading 和操作同帧出现
        await new Promise(resolve => setTimeout(resolve, 32)); // ~2帧，足够 overlay 渲染
        if (isAllExpanded.value) {
            expandedRowKeys.value = [];
            isAllExpanded.value = false;
        } else {
            expandedRowKeys.value = getAllIds(tableData.value);
            isAllExpanded.value = true;
        }
        // nextTick 等 Vue 把 expand/collapse 刷入 DOM
        await nextTick();
        // 再给浏览器一帧完成绘制，之后关掉 loading
        await new Promise(resolve => requestAnimationFrame(resolve));
        expandAllLoading.value = false;
    };

    const leftActive = ref(0);

    // ─── 省市区级联数据 ────────────────────────────────────────
    const areaDataStore = useAreaDataStore();
    const areaCodeOptions = computed(() => areaDataStore.areaArr);

    // ─── 根据级联 code 数组取出各级 name ──────────────────────
    const getRegionLabels = (codes, options) => {
        const labels = [];
        let currentOptions = options;
        for (const code of codes) {
            const found = currentOptions?.find(o => o.regionCode === code);
            if (!found) break;
            labels.push(found.regionName);
            currentOptions = found.subList;
        }
        return labels;
    };

    // 获取省市区数据
    const getAllAreaData = async () => {
        return await getProvince().then((res) => {
            if (res.code === 200) {
                areaDataStore.areaArr = res.data?.subList;
            } else {
                areaDataStore.areaArr = [];
            }
        });
    };

    // ─── 省/市 → 地区分类（1-5）映射规则 ────────────────────
    const getRegionCategory = (labels) => {
        if (!labels || labels.length === 0) return undefined;
        const province = labels[0];
        const city    = labels[1] || '';

        if (['上海市','江苏省','安徽省','福建省','湖北省','湖南省',
             '广东省','广西壮族自治区','海南省','江西省','浙江省'].includes(province)) return '1';

        if (['北京市','天津市','山东省','河南省','重庆市','贵州省'].includes(province)) return '2';

        if (province === '四川省') {
            return ['阿坝藏族羌族自治州','甘孜藏族自治州'].includes(city) ? '4' : '2';
        }
        if (province === '云南省') {
            return city === '迪庆藏族自治州' ? '4' : '2';
        }

        if (province === '河北省') {
            return ['张家口市','承德市','廊坊市','秦皇岛市','唐山市'].includes(city) ? '3' : '2';
        }

        if (province === '山西省') return '3';

        if (province === '辽宁省') {
            return ['营口市','丹东市','大连市'].includes(city) ? '3' : '4';
        }

        if (province === '陕西省') {
            return city === '榆林市' ? '4' : '3';
        }

        if (['吉林省','甘肃省','宁夏回族自治区'].includes(province)) return '4';

        if (province === '内蒙古自治区') {
            return ['通辽市','赤峰市','兴安盟','呼伦贝尔市','阿拉善盟'].includes(city) ? '5' : '4';
        }

        if (province === '新疆维吾尔自治区') {
            return ['乌鲁木齐市','克拉玛依市','吐鲁番市','哈密市',
                    '昌吉回族自治州','塔城地区','伊犁哈萨克自治州','阿勒泰地区'].includes(city) ? '5' : '4';
        }

        if (['黑龙江省','青海省'].includes(province)) return '5';

        return undefined;
    };

    // ─── 基本信息表单数据 ─────────────────────────────────────
    const basicInfoForm = reactive({
        projectName:          '',
        installedCapacity:    '',
        region:               [],
        regionCategory:       undefined,
        altitude:             '',
        hubHeight:            '',
        cableLayingMethod:    undefined,
        voltageLevel:         undefined,
        compilationDate:      null,
        constructionPeriod:   '1',
        capitalRatio:         '',
        loanRate:             '',
        priceLibrary:         undefined,
        altitudeCoeffManual:  '',
        altitudeCoeffMachine: '1.0',
        overallManualCoeff:   '1.0',
        overallMachineCoeff:  '1.0',
    });

    // 必填字段定义
    const BASIC_INFO_REQUIRED = [
        { key: 'projectName',       label: '项目名称' },
        { key: 'installedCapacity', label: '装机容量' },
        { key: 'region',            label: '项目所属区域' },
        { key: 'altitude',          label: '项目海拔高度' },
        { key: 'hubHeight',         label: '风机轮毂高度' },
        { key: 'cableLayingMethod', label: '集电线路铺设方式' },
        { key: 'voltageLevel',      label: '升压站电压等级' },
        { key: 'capitalRatio',      label: '资本金比例' },
        { key: 'loanRate',          label: '长期贷款利率' },
        { key: 'priceLibrary',      label: '价格库' },
    ];

    const basicInfoTouched = ref(false);

    const isEmptyValue = (v) => {
        if (Array.isArray(v)) return v.length === 0;
        return v === '' || v === null || v === undefined;
    };

    const getMissingBasicFields = () => {
        return BASIC_INFO_REQUIRED.filter(({ key }) => isEmptyValue(basicInfoForm[key]));
    };

    const isFieldError = (key) => {
        if (!basicInfoTouched.value) return false;
        const required = BASIC_INFO_REQUIRED.some(f => f.key === key);
        if (!required) return false;
        return isEmptyValue(basicInfoForm[key]);
    };

    const changeMenu = async (val) => {
        if (val.value !== 0) {
            const missing = getMissingBasicFields();
            if (missing.length > 0) {
                basicInfoTouched.value = true;
                message.warning(`请先填写完必填项：${missing.map(f => f.label).join('、')}`);
                return;
            }
        }
        leftActive.value = val.value;
        visible.value = false;

        // 点击"其他费用"时请求价格数据
        if (val.value === 4) {
            const projectId = route.query.id;
            // ✅ 已有数据则不重复请求
            if (projectId && otherFeeRate.value === null) {
                otherFeeLoading.value = true;
                try {
                    const res = await getOtherPrice(projectId);
                    if (res && res.code === 200) {
                        otherFeeRate.value   = res.data?.otherFeeRate ?? null;
                        otherCalAmount.value = res.data?.calAmount    ?? null;
                    }
                } catch (err) {
                    console.error('getOtherPrice 调用失败：', err);
                } finally {
                    otherFeeLoading.value = false;
                }
            }
        }
    };

    const tableHeadData = ref([]);
    const tableData = ref([]);
    const estimateTableData   = ref([]);   // 工程总概算表
    // ── 新增：各子概算表数据 ────────────────────────────────────
    const estimateActiveTab   = ref('total');
    const constructionAuxData = ref([]);   // 施工辅助工程概算表
    const estimateBuildData   = ref([]);   // 建筑工程概算表
    const installEngData      = ref([]);   // 设备及安装工程概算表
    const materialBudgetData  = ref([]);   // 主要材料预算价格计算表
    const otherCostData       = ref([]);   // 其他费用概算表
    const otherFeeRate     = ref(null); // getOtherPrice 返回的费率对象
    const otherCalAmount   = ref(null); // getOtherPrice 返回的前置合计值
    const otherFeeLoading  = ref(false);// 其他费用表格 loading
    const downloadExcelLoading = ref(false);
    const selectedData = ref(null);
    const copyData = ref(null);

    const computedColumns = computed(() => {
        let result = LEFT_MENU.filter((m) => m.value === leftActive.value);
        return result[0];
    });

    const isLoading = ref(false);
    const hasEstimateResult = ref(false); // resultParam 是否有数据
    const cachedResultData = ref(null);   // 解析后的 resultParam 缓存

    /** 过滤掉工程总概算菜单项（tab 5）直到 resultParam 有数据或计算完成 */
    const visibleLeftMenu = computed(() =>
        LEFT_MENU.filter(item => item.value !== 5 || hasEstimateResult.value)
    );
    const quotaPriceTableData = ref([]);

    // ─── 统一填充工程总概算各子表数据 ────────────────────────
    const fillEstimateData = (data) => {
        estimateTableData.value   = data?.engineeringTotalEstimateRespList      || [];
        constructionAuxData.value = data?.constructionAuxiliaryRespList         || [];
        estimateBuildData.value   = data?.estimateBuildRespList                 || [];
        installEngData.value      = data?.installationEngineeringBudgetRespList || [];
        materialBudgetData.value  = data?.materialBudgetRespList                || [];
        otherCostData.value       = data?.otherCostEstimateRespList             || [];
    };

    const dblClickEvent = (record, index) => {
        selectedData.value = record;
        if (selectedData.value.itemQuotaReqList && selectedData.value.itemQuotaReqList.length) {
            Modal.confirm({
                title: '提示',
                content: createVNode(
                    'div',
                    { style: '' },
                    `手动调整${leftActive.value == 2 ? '安装费' : '单价'}将清除该费用项所有的定额，确定改为手动调整么`,
                ),
                onOk() {
                    selectedData.value.isEdit = true;
                    selectedData.value.itemQuotaReqList = [];
                    selectedData.value.quotaSwapPriceReqList = [];
                },
                onCancel() {},
                class: 'test',
            });
        } else {
            selectedData.value.isEdit = true;
            selectedData.value.itemQuotaReqList = [];
        }
    };

    const handlePriceInputFocus = (record, field, event) => {
        console.log(record,field,event)
        if (record.itemQuotaReqList && record.itemQuotaReqList.length) {
            console.log("jinlail")
            const inputEl = event.target;
            const prevValue = record[field];
            // 先 blur，阻止用户在确认前直接输入
            inputEl.blur();
            Modal.confirm({
                title: '提示',
                content: createVNode(
                    'div',
                    { style: '' },
                    `手动调整${leftActive.value == 2 ? '安装费' : '单价'}将清除该费用项所有的定额，确定改为手动调整么`,
                ),
                async onOk() {
                    try {
                        await clearQuota({
                            itemId:   record.id,
                            itemType: leftActive.value,
                        });
                        record.itemQuotaReqList = [];
                        record.quotaSwapPriceReqList = [];
                        // 同步调用 edit 接口保存当前行
                        handleRowInputChange(record, field);
                        // 确认后重新聚焦输入框
                        await nextTick();
                        inputEl.focus();
                    } catch (err) {
                        console.error('[clearQuota] 失败', err);
                        record[field] = prevValue;
                    }
                },
                onCancel() {
                    record[field] = prevValue;
                },
            });
        }
    };

    const handleCopyEvent = (record) => {
        if (record.children && record.children.length) {
            message.warning('请选择最后一级数据进行相关操作！');
            return false;
        }
        if (record.itemQuotaReqList && record.itemQuotaReqList.length > 0) {
            copyData.value = JSON.parse(JSON.stringify(record));
            message.success('复制成功！');
        } else {
            message.warning('暂无可复制的定额数据');
        }
    };

    const handlePasteEvent = (record) => {
        if (record.children && record.children.length) {
            message.warning('请选择最后一级数据进行相关操作！');
            return false;
        }
        if (copyData.value) {
            selectedData.value = record;
            selectedData.value.itemQuotaReqList = JSON.parse(
                JSON.stringify(copyData.value.itemQuotaReqList),
            );
            selectedData.value.quotaSwapPriceReqList = JSON.parse(
                JSON.stringify(copyData.value.quotaSwapPriceReqList),
            );
            selectedData.value.unitPrice = null;
            selectedData.value.isPaste = copyData.value;
            message.success('粘贴成功！');
        } else {
            message.warning('暂无可粘贴的定额数据');
        }
    };

    const handleEmptyFieldsValue = (notProcessedFields) => {
        const notProcessedFieldsList = notProcessedFields || [];
        const handleData = { ...selectedData.value };
        for (const key in handleData) {
            if (Object.hasOwnProperty.call(handleData, key)) {
                if (!notProcessedFieldsList.includes(key)) {
                    handleData[key] = null;
                }
            }
        }
        handleData['itemQuotaReqList'] = [];
        handleData['quotaSwapPriceReqList'] = [];
        const arrList = flattenTree(tableData.value);
        const findIndex = arrList.findIndex((item) => item.itemNumber == handleData['itemNumber']);
        if (findIndex > -1) {
            arrList[findIndex] = handleData;
            tableData.value = arrayToTree(arrList);
        }
        console.log(tableData.value);
    };

    const changeValue = (record, index, key) => {
    // 同步更新表格显示
        selectedData.value.itemQuotaReqList[index][key] = record[key];

        // 1 秒防抖调用 editQuota
        const timerKey = `quota:${selectedData.value.id}:${record.quotaCode}`;
        if (_quotaEditTimers.has(timerKey)) clearTimeout(_quotaEditTimers.get(timerKey));

        const timer = setTimeout(async () => {
            _quotaEditTimers.delete(timerKey);
            const row = selectedData.value.itemQuotaReqList[index];
            try {
                const editRes = await editQuota({
                itemId:          selectedData.value.id,
                quotaCode:       row.quotaCode,
                itemType:        leftActive.value,
                manualFactor:    row.manualFactor    ?? null,
                materialFactor:  row.materialFactor  ?? null,
                machineryFactor: row.machineryFactor ?? null,
                quantity:        row.quantity        ?? null,
            });
            // 返回结构是 { "1": {...} } / { "2": {...} }，key 是 itemType 字符串
            if (editRes?.code === 200 && editRes.data) {
                const rowData = editRes.data[String(leftActive.value)];
                if (rowData) applyRowPatch(rowData);
            }
            } catch (err) {
                console.error('[changeValue] editQuota 调用失败', err);
            }
        }, 1000);

        _quotaEditTimers.set(timerKey, timer);
    };

    const handleMenuClick = (key, data, index) => {
        selectedData.value = data;
        console.log(key, data, index);
        let newNode = null;
        if (key === 'addChild' || key === 'addSibling') {
            newNode = {
                itemName: '新的费用项',
                estimateTemplateId: data.estimateTemplateId,
                parentId: key === 'addChild' ? data.id : data.parentId,
                parentItemNumber: key === 'addChild' ? data.itemNumber : data.parentItemNumber,
            };
        }
        if (key === 'delete') {
            Modal.confirm({
                title: '提示',
                content: '确定删除该分类及其所属的费用项么',
                okText: '确定',
                cancelText: '取消',
                onOk: () => {
                    tableData.value = treeDataOperator(tableData.value, data['itemNumber'], key);
                    addSerialNumbers(tableData.value);
                },
            });
            return;
        }
        if (key === 'addChild') {
            handleEmptyFieldsValue([
                'id',
                'level',
                'parentId',
                'parentItemNumber',
                'itemName',
                'itemNumber',
                'itemQuotaReqList',
                'quotaSwapPriceReqList',
                'tier',
                'estimateTemplateId',
            ]);
        }
        tableData.value = treeDataOperator(tableData.value, data['itemNumber'], key, newNode);
        console.log('tableData.value', tableData.value);
        addSerialNumbers(tableData.value);
    };

    const addSerialNumbers = (nodes, parentSerial = '', parentNodes) => {
        if (!nodes || !nodes.length) return;
        for (let i = 0; i < nodes.length; i++) {
            if (i == 0 && defaultExpandedRowKeys.value.length == 0) {
                defaultExpandedRowKeys.value = [nodes[i].id];
            }
            const itemNumber = parentSerial ? `${parentSerial}.${i + 1}` : `${i + 1}`;
            nodes[i].itemNumber = itemNumber;
            nodes[i].tier = itemNumber.split('.').length;
            parentNodes && (nodes[i].parentItemNumber = parentNodes['itemNumber']);
            if (nodes[i].children && nodes[i].children.length) {
                addSerialNumbers(nodes[i].children, itemNumber, nodes[i]);
            } else {
                nodes[i].children && delete nodes[i].children;
            }
            if (i == 0) {
                defaultExpandedRowKeys.value.push(nodes[i].id);
            }
        }
    };

    const handleAddPrice = (record) => {
        selectedData.value = record;
        addPriceVisible.value = true;
        addPriceRef.value && addPriceRef.value.resetEvent();
    };

    // ── 各 tab 定额增删 API 映射 ──────────────────────────────────────────────
    const QUOTA_APIS = {
        1: { add: addConAuxiliaryQuota,  remove: removeConAuxiliaryQuota  },
        2: { add: addEquipInstallQuota,  remove: removeEquipInstallQuota  },
        3: { add: addBuildEngineerQuota, remove: removeBuildEngineerQuota },
    };

    const handleDelPrice = async (record, index) => {
        selectedData.value = record;
        const quotaApi = QUOTA_APIS[leftActive.value];
        if (index || index == 0) {
            if (quotaApi) {
                const deletedCode = selectedData.value.itemQuotaReqList[index]?.quotaCode;
                if (deletedCode) {
                    await quotaApi.remove({
                        itemId:    selectedData.value.id,
                        quotaCode: deletedCode,
                    });
                }
            }
            selectedData.value.itemQuotaReqList.splice(index, 1);
        } else {
            Modal.confirm({
                title: '提示',
                content: '确定清除该费用项所有的定额么',
                okText: '确定',
                cancelText: '取消',
                async onOk() {
                    if (quotaApi) {
                        for (const q of (selectedData.value.itemQuotaReqList || [])) {
                            await quotaApi.remove({
                                itemId:    selectedData.value.id,
                                quotaCode: q.quotaCode,
                            });
                        }
                    }
                    selectedData.value.itemQuotaReqList = [];
                    selectedData.value.quotaSwapPriceReqList = [];
                },
            });
        }
    };

    const handleDelPriceItem = async (record, index) => {
        const currentQuotaCode = selectedData.value.itemQuotaReqList[index].quotaCode;
        const quotaApi = QUOTA_APIS[leftActive.value];
        if (quotaApi) {
            const removeRes = await quotaApi.remove({
                itemId:    selectedData.value.id,
                quotaCode: currentQuotaCode,
            });
            if (removeRes?.code === 200 && removeRes.data) {
                applyRowPatch(removeRes.data);
            }
        }
        if (
            selectedData.value.quotaSwapPriceReqList &&
            selectedData.value.quotaSwapPriceReqList.length
        ) {
            for (
                let quotaCodeIndex = 0;
                quotaCodeIndex < selectedData.value.quotaSwapPriceReqList.length;
                quotaCodeIndex++
            ) {
                if (
                    selectedData.value.quotaSwapPriceReqList[quotaCodeIndex].quotaCode ===
                    currentQuotaCode
                ) {
                    selectedData.value.quotaSwapPriceReqList.splice(quotaCodeIndex, 1);
                }
            }
        }
        quotaPriceTableData.value = [];
        if (selectedData.value.itemQuotaReqList && selectedData.value.itemQuotaReqList.length) {
            selectedData.value.itemQuotaReqList = selectedData.value.itemQuotaReqList.filter(
                (item) => item.quotaCode !== currentQuotaCode,
            );
        }
        console.log('selectedData.value', selectedData.value);
    };

    const openPriceModal = (record) => {
        console.log(record)
        quotaPriceTableData.value = [];
        selectedData.value = record;
        console.log(selectedData.value);
        visible.value = true;
    };

    const replacehandleOk = async (value, datas) => {
        console.log(datas, 'datas', value);
        const quotaData = datas ? datas : addPriceRef.value.getSelectionData();
        console.log(quotaData, '新的定额');
        if (quotaData.length) {
            const res = await getReplaceItem(
                quotaData[0]['quotaCatalogId'],
                quotaData[0]['quotaCode'],
            );
            if (res.code == 200 && res.data) {
                if (
                    (res.data.quotaPriceList && res.data.quotaPriceList.length) ||
                    (res.data.priceMap && Object.keys(res.data.priceMap).length)
                ) {
                    replacePriceData.value = res.data;
                    replacePriceVisible.value = true;
                } else {
                    console.log('不存在替换项');
                    replacePriceData.value = null;
                    quotaData.forEach((item) => {
                        item['manualFactor'] = 1.0;
                        item['materialFactor'] = 1.0;
                        item['machineryFactor'] = 1.0;
                        item['quantity'] = 1.0;
                    });
                    if (!selectedData.value.itemQuotaReqList) {
                        selectedData.value.itemQuotaReqList = [];
                    }
                    console.log('我要添加的定额：', quotaData);
                    const findQuotaCodeIndex = selectedData.value.itemQuotaReqList.findIndex(
                        (item) => item.quotaCode === quotaData[0].quotaCode,
                    );
                    if (findQuotaCodeIndex == -1) {
                        selectedData.value.itemQuotaReqList = [
                            ...new Set([...selectedData.value.itemQuotaReqList, ...quotaData]),
                        ];
                    } else {
                        message.warning('请勿重复添加定额');
                    }
                    console.log(selectedData.value);
                    addPriceVisible.value = false;
                    const _addApi = QUOTA_APIS[leftActive.value]?.add;
                    if (_addApi) {
                        let lastAddRes = null;
                        for (const q of quotaData) {
                            const addRes = await _addApi({
                                itemId: selectedData.value.id,
                                itemQuotaReq: {
                                    quotaCode:       q.quotaCode,
                                    quotaName:       q.quotaName,
                                    unit:            q.unit,
                                    quantity:        q.quantity,
                                    manualFactor:    q.manualFactor,
                                    materialFactor:  q.materialFactor,
                                    machineryFactor: q.machineryFactor,
                                },
                            });
                            if (addRes?.code === 200 && addRes.data) lastAddRes = addRes.data;
                        }
                        if (lastAddRes) applyRowPatch(lastAddRes);
                        await refreshAndSyncSelectedData();
                    }
                    // if (leftActive.value == 2) {
                    //     selectedData.value['installUnitFee'] = null;
                    // } else {
                    //     selectedData.value['unitPrice'] = null;
                    // }
                }
            }
        }
    };

    const handleReplaceOk = async () => {
        console.log(replacePriceData.value, '----1212---');
        console.log(selectedData.value);
        const getReplacePriceData = replacePriceRef.value.getSelectionData();
        if (getReplacePriceData && getReplacePriceData.length) {
            console.log('getReplacePriceData', getReplacePriceData);
            const quotaData = addPriceRef.value.getSelectionData();
            getReplacePriceData.forEach(async (item) => {
                if (item['isNeedAddQuota']) {
                    console.log('需要添加定额:', item);
                    console.log(selectedData.value.itemQuotaReqList);
                    if (!selectedData.value.itemQuotaReqList) {
                        quotaData.push(item['selectedRowData'][0]);
                    } else {
                        const findQuotaCodeIndex = selectedData.value.itemQuotaReqList.findIndex(
                            (ele) => ele.quotaCode === item['selectedRowData'][0]['quotaCode'],
                        );
                        if (findQuotaCodeIndex == -1) {
                            console.log(item['selectedRowData'][0]);
                            const res = await getReplaceItem(
                                item['selectedRowData'][0]['quotaCatalogId'],
                                item['selectedRowData'][0]['quotaCode'],
                            );
                            if (res.code == 200 && res.data) {
                                console.log(selectedData.value, '---1236---');
                                if (
                                    (res.data.quotaPriceList && res.data.quotaPriceList.length) ||
                                    (res.data.priceMap && Object.keys(res.data.priceMap).length)
                                ) {
                                    replacePriceVisible.value = true;
                                    replacePriceData.value = res.data;
                                }
                            }
                        }
                        quotaData.push(item['selectedRowData'][0]);
                    }
                }
            });
            quotaData.forEach((item) => {
                item['manualFactor'] = 1.0;
                item['materialFactor'] = 1.0;
                item['machineryFactor'] = 1.0;
                item['quantity'] = 1.0;
            });
            console.log('最后要添加定额的数据', quotaData);
            console.log(selectedData.value.itemQuotaReqList);
            quotaData[quotaData.length - 1]['replaceQuotaList'] = getReplacePriceData;
            if (!selectedData.value.itemQuotaReqList) {
                selectedData.value.itemQuotaReqList = [];
            }
            selectedData.value.itemQuotaReqList = [
                ...new Set([...selectedData.value.itemQuotaReqList, ...quotaData]),
            ];
            addPriceVisible.value = false;
            replacePriceVisible.value = false;
            const _addApiR = QUOTA_APIS[leftActive.value]?.add;
            if (_addApiR) {
                let lastAddResR = null;
                for (const q of quotaData) {
                    const swapList = q.replaceQuotaList || [];
                    const addRes = await _addApiR({
                        itemId: selectedData.value.id,
                        itemQuotaReq: {
                            quotaCode:       q.quotaCode,
                            quotaName:       q.quotaName,
                            unit:            q.unit,
                            quantity:        q.quantity,
                            manualFactor:    q.manualFactor,
                            materialFactor:  q.materialFactor,
                            machineryFactor: q.machineryFactor,
                        },
                        ...(swapList.length ? {
                            quotaSwapPriceReq: {
                                quotaCode:              q.quotaCode,
                                unitPriceFirstCategory: swapList[0].unitPriceFirstCategory,
                                unitPriceNewCode:       swapList[0].selectedRowKeys[0],
                                unitPriceOldCode:
                                    swapList[0].unitPriceFirstCategory == 'P0002'
                                        ? swapList[0].oldUnitPriceCode
                                        : swapList[0].selectedRowKeys[0],
                            },
                        } : {}),
                    });
                    if (addRes?.code === 200 && addRes.data) lastAddResR = addRes.data;
                }
                if (lastAddResR) applyRowPatch(lastAddResR);
                await refreshAndSyncSelectedData();
            }
            // if (leftActive.value == 2) {
            //     selectedData.value['installUnitFee'] = null;
            // } else {
            //     selectedData.value['unitPrice'] = null;
            // }
        }
    };

    const getQuotaPrice = async (quotaCatalogId, quotaCode, record) => {
        if (record && record.replaceQuotaList && record.replaceQuotaList.length) {
            const res = await getQuotaPriceByCode(quotaCatalogId, quotaCode);
            if (res.code == 200 && res.data) {
                const specialQuotaList = [];
                const specialModel = [];
                for (let index = 0; index < record.replaceQuotaList.length; index++) {
                    const element = record.replaceQuotaList[index];
                    if (element['unitPriceFirstCategory'] === 'P0005') {
                        if (element['isNeedDelete']) {
                            for (let j = res.data.length - 1; j >= 0; j--) {
                                if (
                                    element['label'] == res.data[j]['unitPriceName'] &&
                                    element['selectedRowKeys'][0] !==
                                        res.data[j]['unitPriceCode']
                                ) {
                                    if (specialQuotaList.includes(quotaCode) && specialModel.includes(res.data[j]['model']) || !specialQuotaList.includes(quotaCode)) {
                                        res.data.splice(j, 1);
                                    }
                                }
                            }
                        } else if (element['isNeedAddQuota']) {
                            for (let j = res.data.length - 1; j >= 0; j--) {
                                if (element['label'] == res.data[j]['unitPriceName']) {
                                    if (specialQuotaList.includes(quotaCode) && specialModel.includes(res.data[j]['model']) || !specialQuotaList.includes(quotaCode)) {
                                        res.data.splice(j, 1);
                                    }
                                }
                            }
                        } else if (selectedData.value) {
                            console.log(selectedData.value, '代码1318行');
                        }
                    } else if (element['unitPriceFirstCategory'] === 'P0002') {
                        const index = res.data.findIndex(
                            (item) => item['unitPriceName'] == element['label'],
                        );
                        console.log(index, '找到索引值')
                        if (index > -1) {
                            res.data[index] = {
                                unitPriceName: element['selectedRowData'][0]['unitPriceName']
                                    ? element['selectedRowData'][0]['unitPriceName']
                                    : element['selectedRowData'][0]['quotaName'],
                                unitPriceCode: element['selectedRowData'][0]['unitPriceCode']
                                    ? element['selectedRowData'][0]['unitPriceCode']
                                    : element['selectedRowData'][0]['quotaCode'],
                                unit: element['selectedRowData'][0]['unit'],
                                modal: element['selectedRowData'][0]['modal'],
                                unitPrice: element['selectedRowData'][0]['unitPrice'],
                                unitQuantity: element['selectedRowData'][0]['unitQuantity'],
                                quotaQuantity: element['selectedRowData'][0]['quotaQuantity']
                                    ? element['selectedRowData'][0]['quotaQuantity']
                                    : element['selectedRowData'][0]['quantity'],
                                quantity: element['selectedRowData'][0]['quotaQuantity']
                                    ? element['selectedRowData'][0]['quotaQuantity']
                                    : element['selectedRowData'][0]['quantity'],
                                unitPriceFirstCategory: element['unitPriceFirstCategory'],
                            };
                        } else {
                            console.log(element, '代码1337行')
                        }
                    }
                }
                quotaPriceTableData.value = res.data || [];
            }
        } else if (!selectedData.value.quotaCodes) {
            const res = await getQuotaPriceByCode(quotaCatalogId, quotaCode);
            if (res.code == 200 && res.data) {
                quotaPriceTableData.value = res.data || [];
            }
        } else {
            console.log(selectedData.value, '代码1349行');
            const res = await getQuotaPriceByQuotaCode(
                quotaCatalogId,
                selectedData.value.id,
                leftActive.value,
                quotaCode,
            );
            if (res.code == 200 && res.data) {
                quotaPriceTableData.value = res.data || [];
            }
        }
    };

    const customRow = (record) => {
        console.log('走进表格点击事件');
        return {
            onClick: () => {
                quotaPriceTableData.value = [];
                console.log(record);
                selectedData.value?.itemQuotaReqList.forEach((item) => {
                    item.selected = false;
                });
                record.selected = true;
                getQuotaPrice(
                    record.quotaCatalogId || route.query.quotaCatalogId,
                    record.quotaCode,
                    record,
                );
            },
        };
    };

    const checkDataValidate = async () => {
        isLoading.value = true;
        try {
            const submitTableData = JSON.parse(JSON.stringify(tableHeadData.value));
            submitTableData.children = [...tableData.value];
            const formatData = flattenTree([submitTableData]);
            const emptyItemNameData = formatData.filter(
                (item) => item.itemName && item.itemName.trim() === '',
            );
            if (emptyItemNameData.length) {
                message.error('请填写所有费用项名称');
                return false;
            }
            const getQuotaCodes = (element) => {
                let quotaCodes = '';
                if (element.itemQuotaReqList && element.itemQuotaReqList.length) {
                    element.itemQuotaReqList.forEach((item, itemIndex) => {
                        quotaCodes +=
                            item.quotaCode +
                            (itemIndex === element.itemQuotaReqList.length - 1 ? '' : ',');
                    });
                }
                return quotaCodes;
            };
            const getItemQuotaReqList = (element) => {
                const itemQuotaReqList = [];
                if (element.itemQuotaReqList && element.itemQuotaReqList.length) {
                    element.itemQuotaReqList.forEach((item) => {
                        const itemObj = {
                            machineryFactor: item.machineryFactor,
                            manualFactor: item.manualFactor,
                            materialFactor: item.materialFactor,
                            quantity: item.quantity,
                            quotaName: item.quotaName,
                            quotaCode: item.quotaCode,
                            unit: item.unit,
                        };
                        itemQuotaReqList.push(itemObj);
                    });
                }
                return itemQuotaReqList;
            };
            const getQuotaSwapPriceReqList = (element) => {
                console.log('司府寺', element)
                const itemQuotaSwapPriceReqList = element.quotaSwapPriceReqList && element.quotaSwapPriceReqList.length ? [
                    ...element.quotaSwapPriceReqList.filter((ele) => !ele.label),
                ] : [];
                if (element.itemQuotaReqList && element.itemQuotaReqList.length) {
                    for (let index = 0; index < element.itemQuotaReqList.length; index++) {
                        const item = element.itemQuotaReqList[index];
                        if (item.replaceQuotaList && item.replaceQuotaList.length) {
                            for (let key = 0; key < item.replaceQuotaList.length; key++) {
                                const replaceQuotaItem = item.replaceQuotaList[key];
                                const replaceQuotaItemObj = {
                                    quotaCode: item.quotaCode,
                                    unitPriceFirstCategory: replaceQuotaItem.unitPriceFirstCategory,
                                    unitPriceNewCode: replaceQuotaItem.selectedRowKeys[0],
                                    unitPriceOldCode:
                                        replaceQuotaItem.unitPriceFirstCategory == 'P0002'
                                            ? replaceQuotaItem.oldUnitPriceCode
                                            : replaceQuotaItem.selectedRowKeys[0],
                                };
                                itemQuotaSwapPriceReqList.push(replaceQuotaItemObj);
                            }
                        }
                    }
                }
                return itemQuotaSwapPriceReqList;
            };

            const submitFormatData = [];
            for (const element of formatData) {
                let obj = null;
                switch (leftActive.value) {
                    case 1:
                        obj = {
                            estimateTemplateId: element.estimateTemplateId,
                            id: element.id,
                            itemName: element.itemName,
                            itemNumber: element.itemNumber,
                            parentItemNumber: element.parentItemNumber,
                            priceCode: element.priceCode,
                            quantity: element.quantity,
                            remarks: element.remarks,
                            tag: element.tag,
                            totalPrice: element.totalPrice,
                            unit: element.unit,
                            unitPrice: element.unitPrice,
                            quotaCodes: getQuotaCodes(element),
                            itemQuotaReqList: getItemQuotaReqList(element),
                            quotaSwapPriceReqList: getQuotaSwapPriceReqList(element),
                        };
                        break;
                    case 2:
                        obj = {
                            estimateTemplateId: element.estimateTemplateId,
                            equipmentTotalFee: element.equipmentTotalFee,
                            equipmentUnitFee: element.equipmentUnitFee,
                            id: element.id,
                            installTotalFee: element.installTotalFee,
                            installUnitFee: element.installUnitFee,
                            itemName: element.itemName,
                            itemNumber: element.itemNumber,
                            materialsTotalFee: element.materialsTotalFee,
                            materialsUnitFee: element.materialsUnitFee,
                            parentItemNumber: element.parentItemNumber,
                            priceCode: element.priceCode,
                            quantity: element.quantity,
                            supplyMaterialsTotalFee: element.supplyMaterialsTotalFee,
                            supplyMaterialsUnitFee: element.supplyMaterialsUnitFee,
                            remarks: element.remarks,
                            tag: element.tag,
                            totalPrice: element.totalPrice,
                            unit: element.unit,
                            quotaCodes: getQuotaCodes(element),
                            itemQuotaReqList: getItemQuotaReqList(element),
                            quotaSwapPriceReqList: getQuotaSwapPriceReqList(element),
                        };
                        break;
                    case 3:
                        obj = {
                            estimateTemplateId: element.estimateTemplateId,
                            itemName: element.itemName,
                            itemNumber: element.itemNumber,
                            parentItemNumber: element.parentItemNumber,
                            priceCode: element.priceCode,
                            quantity: element.quantity,
                            remarks: element.remarks,
                            tag: element.tag,
                            totalPrice: element.totalPrice,
                            unit: element.unit,
                            unitPrice: element.unitPrice,
                            quotaCodes: getQuotaCodes(element),
                            itemQuotaReqList: getItemQuotaReqList(element),
                            quotaSwapPriceReqList: getQuotaSwapPriceReqList(element),
                        };
                        break;
                    case 4:
                        obj = {
                            autoCalculate: element.autoCalculate,
                            calculateWay: element.calculateWay,
                            estimateTemplateId: element.estimateTemplateId,
                            itemName: element.itemName,
                            itemNumber: element.itemNumber,
                            parentItemNumber: element.parentItemNumber,
                            quantity: element.quantity,
                            remarks: element.remarks,
                            tag: element.tag,
                            totalPrice: element.totalPrice,
                            unit: element.unit,
                            unitPrice: element.unitPrice,
                            vatRate: element.vatRate,
                        };
                        break;
                    default:
                        break;
                }
                submitFormatData.push(obj);
            }
            console.log(submitFormatData);
            visible.value = false;
            let res = null;
            switch (leftActive.value) {
                case 1:
                    res = await saveConstructionServiceTree(submitFormatData);
                    break;
                case 2:
                    res = await saveDeviceInstallTree(submitFormatData);
                    break;
                case 3:
                    res = await saveConstructionTree(submitFormatData);
                    break;
                case 4:
                    res = await saveOtherCostTree(submitFormatData);
                    // ─── 调用其他费用价格接口，打印返回值供调试 ───
                    try {
                        const otherPriceRes = await getOtherPrice(projectId);
                        console.log('getOtherPrice 返回参数：', otherPriceRes);
                    } catch (err) {
                        console.error('getOtherPrice 调用失败：', err);
                    }
                    break;
            }
            if (res && res.code == 200) {
                completedTabs.value = new Set([...completedTabs.value, leftActive.value]);
                message.success('操作成功！');
                onInitTableData();
            }
        } catch (error) {
            message.error(error.message);
            isLoading.value = false;
        }
    };

    // 单行展开时暂存待应用的 keys，由 handleRowExpand 在 loading 渲染后再更新
    let pendingExpandRows = null;

    const expandedRowsChangeEvent = (rows) => {
        if (expandAllLoading.value) {
            // 全部展开/收起时由 handleExpandAll 统一控制，这里忽略
            return;
        }
        // 单行展开/收起：直接同步应用，不需要 loading
        expandedRowKeys.value = rows;
        const allIds = getAllIds(tableData.value);
        isAllExpanded.value = allIds.length > 0 && allIds.every(id => rows.includes(id));
    };

    /** 单行展开/收起 loading 控制 */
    const handleRowExpand = async (expanded) => {
        return
    };

    // ─── 计算项目（触发工程总概算）──────────────────────────────
    const handleCalculate = async () => {
        const projectId = route.query.id;
        if (!projectId) {
            message.warning('请先保存模板后再进行计算');
            return;
        }
        calculateLoading.value = true;
        try {
            const res = await comprehensiveEstimateData(projectId);
            if (res && res.code === 200) {
                cachedResultData.value = res.data;  // 更新缓存，下次切换 tab 直接用
                // hasEstimateResult.value = true;     // 显示工程总概算菜单项
                fillEstimateData(res.data);
                message.success('计算完成');
                leftActive.value = 5;
                estimateActiveTab.value = 'total';
            } else {
                message.error(res?.msg || '计算失败，请稍后重试');
            }
        } catch (err) {
            message.error('计算失败，请稍后重试');
        } finally {
            calculateLoading.value = false;
        }
    };

    const validateBasicForm = () => {
  const errors = [];

  // 1. 必填项检查（只检查 BASIC_INFO_REQUIRED 列表中的）
  const missing = getMissingBasicFields();
  if (missing.length) {
    errors.push(`请填写必填项：${missing.map(f => f.label).join('、')}`);
  }

  // 2. 装机容量：>0, <10000, 最多三位小数
  const capacity = parseFloat(basicInfoForm.installedCapacity);
  if (isNaN(capacity) || capacity <= 0 || capacity >= 10000) {
    errors.push('装机容量必须为大于0且小于10000的数字');
  } else if (!/^\d+(\.\d{1,3})?$/.test(basicInfoForm.installedCapacity)) {
    errors.push('装机容量最多保留三位小数');
  }

  // 3. 轮毂高度：80~300（根据实际需求，最大为300）
  const hub = parseFloat(basicInfoForm.hubHeight);
  if (isNaN(hub) || hub < 80 || hub > 300) {
    errors.push('风机轮毂高度必须在80~300之间');
  }

  // 4. 资本金比例：20~100
  const capital = parseFloat(basicInfoForm.capitalRatio);
  if (isNaN(capital) || capital < 20 || capital > 100) {
    errors.push('资本金比例必须在20~100之间');
  }

  // 5. 长期贷款利率：0~20
  const loan = parseFloat(basicInfoForm.loanRate);
  if (isNaN(loan) || loan < 0 || loan > 20) {
    errors.push('长期贷款利率必须在0~20之间');
  }

  // 6. 人工总体系数：0.001~10
  const manual = parseFloat(basicInfoForm.overallManualCoeff);
  if (isNaN(manual) || manual < 0.001 || manual > 10) {
    errors.push('人工总体系数必须在0.001~10之间');
  }

  // 7. 机械总体系数：0.001~10
  const machine = parseFloat(basicInfoForm.overallMachineCoeff);
  if (isNaN(machine) || machine < 0.001 || machine > 10) {
    errors.push('机械总体系数必须在0.001~10之间');
  }

  return errors;
};

    // ─── 保存模板 ──────────────────────────────────────────────
    const saveTemplate = async () => {
        if (leftActive.value === 0) {
            basicInfoTouched.value = true;
            const validationErrors = validateBasicForm();
            if (validationErrors.length) {
                // 可仅显示第一条错误，或全部列出
                message.error(validationErrors[0]);
                // 如果希望显示所有错误，可以用 message.error 逐条或合并
                return;
            }
            const missing = getMissingBasicFields();
            if (missing.length > 0) {
                message.error(`请填写必填项：${missing.map(f => f.label).join('、')}`);
                return;
            }

            isLoading.value = true;
            try {
                const [yearStr, quarterStr] = (basicInfoForm.priceLibrary || '').split('-');
                const [provinceCode, cityCode, districtCode] = basicInfoForm.region;
                const labels = getRegionLabels(basicInfoForm.region, areaCodeOptions.value);

                const params = {
                    estProjectName:               basicInfoForm.projectName || undefined,
                    currentProjectCapacity:       Number(basicInfoForm.installedCapacity),
                    provinceRegion:               basicInfoForm.region[basicInfoForm.region.length - 1],
                    areaType:                     Number(basicInfoForm.regionCategory),
                    alt:                          Number(basicInfoForm.altitude),
                    windHubHeight:                Number(basicInfoForm.hubHeight),
                    cableLayingMethod:            Number(basicInfoForm.cableLayingMethod),
                    substationRatedVoltage:       Number(basicInfoForm.voltageLevel),
                    constructPeriod:              Number(basicInfoForm.constructionPeriod),
                    fundingRatio:                 Number(basicInfoForm.capitalRatio),
                    longLoanRate:                 Number(basicInfoForm.loanRate),
                    year:    Number(yearStr),
                    quarter: Number(quarterStr),
                    manualAllFactor:              Number(basicInfoForm.overallManualCoeff),
                    machineryAllFactor:           Number(basicInfoForm.overallMachineCoeff),
                    preparedDate:                 basicInfoForm.compilationDate
                                                    ? basicInfoForm.compilationDate.format('YYYY-MM-DD')
                                                    : undefined,
                    altitudeAdjustmentLabor:      basicInfoForm.altitudeCoeffManual !== ''
                                                    ? Number(basicInfoForm.altitudeCoeffManual)
                                                    : undefined,
                    altitudeAdjustmentMechanical: basicInfoForm.altitudeCoeffMachine !== ''
                                                    ? Number(basicInfoForm.altitudeCoeffMachine)
                                                    : undefined,
                    provinceCode:  provinceCode  || undefined,
                    cityCode:      cityCode      || undefined,
                    districtCode:  districtCode  || undefined,
                    province:      labels[0]     || undefined,
                };

                const projectId = route.query.id;
                let res;
                if (projectId) {
                    res = await updateProject({ ...params, estProjectId: Number(projectId) });
                } else {
                    res = await createProject(params);
                }
                if (res && res.code === 200) {
                    completedTabs.value = new Set([...completedTabs.value, 0]);
                    message.success('保存成功！');
                } else {
                    message.error(res?.message || '保存失败，请稍后重试');
                }
            } catch (error) {
                message.error(error?.message || '保存失败，请稍后重试');
            } finally {
                isLoading.value = false;
            }
            return;
        }
        checkDataValidate();
    };

    // 重新生成报告
    const agaiGeneReport = async() => {
        try{
            const id = route.query.id
            const res = await againGeneReport(id)
            console.log(res)
        }catch(err){
            console.log(err)
        }
    }

    // ─── 从树数组中提取并渲染表格 ──────────────────────────────
    const renderTreeData = (treeArr) => {
        defaultExpandedRowKeys.value = [];
        if (treeArr && treeArr.length) {
            tableData.value = treeArr[0]['children'] || [];
            tableHeadData.value = treeArr[0];
        } else {
            tableData.value = [];
        }
        try {
            addSerialNumbers(tableData.value);
            // sync controlled expandedRowKeys from the freshly built defaultExpandedRowKeys
            expandedRowKeys.value = [...defaultExpandedRowKeys.value];
            isAllExpanded.value = false;
            nextTick(() => {
                let tableHeadHeight = 40;
                switch (leftActive.value) {
                    case 2: tableHeadHeight = 80; break;
                    case 4: tableHeadHeight = 60; break;
                }
                scrollHeight.value = window.innerHeight - tableHeadHeight - 50 - 52 - 40 - 50;
            });
        } catch (error) {}
    };

    const onInitTableData = async () => {
        isLoading.value = true;
        const projectId = route.query.id;

        // ── 工程总概算（tab 5）独立处理，不走树形逻辑 ──────────────────────
        if (leftActive.value === 5) {
            // 如果 onMounted 已解析过 resultParam，直接用缓存，无需再调接口
            if (cachedResultData.value) {
                fillEstimateData(cachedResultData.value);
                isLoading.value = false;
                return;
            }
            fillEstimateData({});  // 先清空
            try {
                const res = await comprehensiveEstimateData(projectId);
                if (res && res.code === 200) {
                    fillEstimateData(res.data);
                } else {
                    message.error(res?.message || '工程总概算数据加载失败');
                }
            } catch {
                message.error('工程总概算数据加载失败');
            } finally {
                isLoading.value = false;
            }
            return;
        }

        tableData.value = [];

        // ── 编辑模式：优先使用 getProjectDetailByIdEdit 的缓存数据 ──
        if (projectId && projectEditDetail.value) {
            const treeMap = {
                1: projectEditDetail.value.constructionAuxiliaryTree,
                2: projectEditDetail.value.equipmentInstallTree,
                3: projectEditDetail.value.buildEngineerTree,
                4: projectEditDetail.value.otherFeeTree,
            };
            renderTreeData(treeMap[leftActive.value] || []);
            isLoading.value = false;
            return;
        }

        // ── 新建模式（或详情尚未缓存）：调各自独立接口 ──
        let res = null;
        switch (leftActive.value) {
            case 1: res = await getConstructionServiceTree(projectId || 3); break;
            case 2: res = await getDeviceInstallTree(projectId || 3); break;
            case 3: res = await getConstructionTree(projectId || 3); break;
            case 4: res = await getOtherCostTree(projectId || 3); break;
        }
        if (res && res.code == 200) {
            renderTreeData(res.data);
        }
        isLoading.value = false;
        console.log(tableData.value);
    };
    // 重新拉树并把 selectedData 的 itemQuotaReqList 同步为最新（含 factorId）
    const refreshAndSyncSelectedData = async () => {
        await onInitTableData();
        if (!selectedData.value) return;

        // 从刷新后的 tableData 里找到同一行，回写 itemQuotaReqList
        const findNode = (nodes, id) => {
            for (const node of nodes) {
                if (node.id === id) return node;
                if (node.children?.length) {
                    const found = findNode(node.children, id);
                    if (found) return found;
                }
            }
            return null;
        };
        const fresh = findNode(tableData.value, selectedData.value.id);
        if (fresh?.itemQuotaReqList) {
            selectedData.value.itemQuotaReqList = fresh.itemQuotaReqList;
        }
    };
    const handleChangeSelectEvent = (record) => {
        console.log(record);
        if (leftActive.value == 4) {
            if (record.autoCalculate) {
                record.calculateWay = '基数X费率';
                record.quantity = null;
                record.unitPrice = null;
            }
        }
    };

    const handleChangeCalculateWayEvent = (record) => {
        console.log(record);
        if (record.calculateWay == '基数X费率') {
            record.unitPrice = null;
        }
    };

    const calculateTotalPriceEvent = (record) => {};

    // ─── 各 tab 单元格按行保存（输入框修改后 1 秒防抖触发） ────────────────────
    const _rowEditTimers = new Map();
    const _quotaEditTimers = new Map();
    const ROW_EDIT_FIELDS = {
        1: new Set(['itemName', 'unit', 'quantity', 'unitPrice', 'remarks', 'tag']),
        2: new Set(['itemName', 'unit', 'quantity', 'equipmentUnitFee', 'installUnitFee',
                    'installTotalFee', 'materialsUnitFee', 'supplyMaterialsUnitFee', 'remarks', 'tag']),
        3: new Set(['itemName', 'unit', 'quantity', 'unitPrice', 'remarks', 'tag']),
        4: new Set(['itemName', 'unit', 'quantity', 'unitPrice', 'vatRate', 'remarks', 'tag']),
    };

    const handleRowInputChange = (record, dataIndex) => {
        const tab = leftActive.value;
        const fields = ROW_EDIT_FIELDS[tab];
        if (!fields || !fields.has(dataIndex)) return;

        const timerKey = `${tab}:${record.id ?? record.itemNumber}`;
        if (_rowEditTimers.has(timerKey)) clearTimeout(_rowEditTimers.get(timerKey));

        const timer = setTimeout(async () => {
            _rowEditTimers.delete(timerKey);
            const e = (v) => v ?? '';
            try {
                let res;

                if (tab === 1) {
                    // 施工辅助工程 → ConstructionAuxiliaryPO
                    res = await editConAuxiliary({
                        itemId:    record.id,
                        itemName:  e(record.itemName),
                        unit:      e(record.unit),
                        quantity:  e(record.quantity),
                        unitPrice: e(record.unitPrice),
                        remarks:   e(record.remarks),
                        tag:       e(record.tag),
                    });

                } else if (tab === 2) {
                    // 设备及安装工程 → EquipmentInstallPO
                    res = await editEquipInstall({
                        itemId:                 record.id,
                        itemName:               e(record.itemName),
                        unit:                   e(record.unit),
                        quantity:               e(record.quantity),
                        equipmentUnitFee:       e(record.equipmentUnitFee),
                        installUnitFee:         e(record.installUnitFee),
                        installTotalFee:        e(record.installTotalFee),
                        materialsUnitFee:       e(record.materialsUnitFee),
                        supplyMaterialsUnitFee: e(record.supplyMaterialsUnitFee),
                        remarks:                e(record.remarks),
                        tag:                    e(record.tag),
                    });

                } else if (tab === 3) {
                    // 建筑工程 → BuildEngineerPO
                    res = await editBuildEngineer({
                        itemId:    record.id,
                        itemName:  e(record.itemName),
                        unit:      e(record.unit),
                        quantity:  e(record.quantity),
                        unitPrice: e(record.unitPrice),
                        remarks:   e(record.remarks),
                        tag:       e(record.tag),
                    });

                } else if (tab === 4) {
                    // 其他费用 → OtherFeePO
                    res = await editOtherFee({
                        itemId:        record.id,
                        itemName:      e(record.itemName),
                        unit:          e(record.unit),
                        quantity:      e(record.quantity),
                        unitPrice:     e(record.unitPrice),
                        vatRate:       e(record.vatRate),
                        calculateWay:  e(record.calculateWay),
                        autoCalculate: record.autoCalculate,
                        remarks:       e(record.remarks),
                        tag:           e(record.tag),
                        calAmount:     otherCalAmount.value,
                        otherFeeRate:  otherFeeRate.value,
                    });
                }

                // 接口返回 code=200 且有数据时，把计算结果（totalPrice 等）写回对应行
                if (res?.code === 200 && res.data) {
                    patchTableRow(res.data);
                }

            } catch (err) {
                console.error('[handleRowInputChange] 保存失败', err);
            }
        }, 1000);

        _rowEditTimers.set(timerKey, timer);
    };

    const PRICE_PATCH_FIELDS = [
    'unitPrice', 'totalPrice', 'quotaCodes',
    'installUnitFee', 'installTotalFee',
    'equipmentUnitFee', 'equipmentTotalFee',
    'materialsUnitFee', 'materialsTotalFee',
    'supplyMaterialsUnitFee', 'supplyMaterialsTotalFee',
];

const applyRowPatch = (rowData) => {
    console.log(rowData,selectedData.value)
    if (!rowData || !selectedData.value) return;
    console.log("eeeeee")
    PRICE_PATCH_FIELDS.forEach(field => {
        if (field in rowData) selectedData.value[field] = rowData[field];
    });
    const patchNode = (nodes) => {
        for (const node of nodes) {
            if (node.id === rowData.id) {
                PRICE_PATCH_FIELDS.forEach(field => {
                    if (field in rowData) node[field] = rowData[field];
                });
                return true;
            }
            if (node.children?.length && patchNode(node.children)) return true;
        }
        return false;
    };
    patchNode(tableData.value);
};
// 按行更新
const patchTableRow = (rowData) => {
    if (!rowData?.id) return;
    const patch = (nodes) => {
        for (const node of nodes) {
            if (node.id === rowData.id) {
                PRICE_PATCH_FIELDS.forEach((field) => {
                    if (field in rowData) node[field] = rowData[field];
                });
                return true;
            }
            if (node.children?.length && patch(node.children)) return true;
        }
        return false;
    };
    patch(tableData.value);
    // 抽屉选中行同一行时同步更新
    if (selectedData.value?.id === rowData.id) {
        PRICE_PATCH_FIELDS.forEach((field) => {
            if (field in rowData) selectedData.value[field] = rowData[field];
        });
    }
};

    const getPriceData = async () => {
        try {
            const res = await getMaterialPrice();
            if (res.code === 0 && res.data) {
                const options = [];
                res.data.forEach(({ year, quarters }) => {
                    quarters.forEach(q => {
                        options.push({
                            label: `${year}年第${q}季度`,
                            value: `${year}-${q}`,
                        });
                    });
                });
                priceLibraryOptions.value = options;
            }
        } catch (err) {
            console.log(err);
        }
    };

    watch(
        () => leftActive.value,
        () => {
            if (leftActive.value !== 0) {
                onInitTableData();
            }
        },
        { deep: true, immediate: true },
    );

    watch(
        () => basicInfoForm.region,
        (newVal) => {
            if (newVal && newVal.length > 0) {
                const labels = getRegionLabels(newVal, areaCodeOptions.value);
                const category = getRegionCategory(labels);
                basicInfoForm.regionCategory = category;
            } else {
                basicInfoForm.regionCategory = undefined;
            }
        },
        { deep: true },
    );

    watch([x, y], () => {
        if (!startedDrag.value) {
            startX.value = x.value;
            startY.value = y.value;
            const bodyRect = document.body.getBoundingClientRect();
            const titleRect = modalTitleRef.value.getBoundingClientRect();
            dragRect.value.right = bodyRect.width - titleRect.width;
            dragRect.value.bottom = bodyRect.height - titleRect.height;
            preTransformX.value = transformX.value;
            preTransformY.value = transformY.value;
        }
        startedDrag.value = true;
    });

    watch(isDragging, () => {
        if (!isDragging) {
            startedDrag.value = false;
        }
    });

    watch(
        () => basicInfoForm.altitude,
        (newAlt) => {
            const alt = parseFloat(newAlt);
            if (!isNaN(alt) && alt > 0) {
            basicInfoForm.altitudeCoeffManual = getManualCoefficient(alt).toFixed(4);
            basicInfoForm.altitudeCoeffMachine = getMechanicalCoefficient(alt).toFixed(4);
            } else {
            // 如果海拔为空或无效，可以清空（或保留原值，按需处理）
            // basicInfoForm.altitudeCoeffManual = '';
            // basicInfoForm.altitudeCoeffMachine = '';
            }
        },
        { immediate: false }
        );

    watchEffect(() => {
        if (startedDrag.value) {
            transformX.value =
                preTransformX.value +
                Math.min(Math.max(dragRect.value.left, x.value), dragRect.value.right) -
                startX.value;
            transformY.value =
                preTransformY.value +
                Math.min(Math.max(dragRect.value.top, y.value), dragRect.value.bottom) -
                startY.value;
        }
    });

    const transformStyle = computed(() => ({
        transform: `translate(${transformX.value}px, ${transformY.value}px)`,
    }));

    // ─── 将接口返回的详情字段回填到 basicInfoForm ─────────────
    const fillFormFromDetail = (data) => {
        if (!data) return;
        basicInfoForm.projectName          = data.projectName ?? '';
        basicInfoForm.installedCapacity    = data.currentProjectCapacity != null ? String(data.currentProjectCapacity) : '';
        basicInfoForm.altitude             = data.alt != null ? String(data.alt) : '';
        basicInfoForm.hubHeight            = data.windHubHeight != null ? String(data.windHubHeight) : '';
        basicInfoForm.cableLayingMethod    = data.cableLayingMethod != null ? data.cableLayingMethod : undefined;
        basicInfoForm.voltageLevel         = data.substationRatedVoltage != null ? data.substationRatedVoltage : undefined;
        basicInfoForm.constructionPeriod   = data.constructPeriod != null ? String(data.constructPeriod) : '1';
        basicInfoForm.capitalRatio         = data.fundingRatio != null ? String(data.fundingRatio) : '';
        basicInfoForm.loanRate             = data.longLoanRate != null ? String(data.longLoanRate) : '';
        basicInfoForm.overallManualCoeff   = data.manualAllFactor != null ? String(data.manualAllFactor) : '1.0';
        basicInfoForm.overallMachineCoeff  = data.machineryAllFactor != null ? String(data.machineryAllFactor) : '1.0';
        basicInfoForm.altitudeCoeffManual  = data.altitudeAdjustmentLabor != null ? String(data.altitudeAdjustmentLabor) : '';
        basicInfoForm.altitudeCoeffMachine = data.altitudeAdjustmentMechanical != null ? String(data.altitudeAdjustmentMechanical) : '1.0';
        basicInfoForm.regionCategory       = data.areaType != null ? String(data.areaType) : undefined;
        if (data.year != null && data.quarter != null) {
            basicInfoForm.priceLibrary = `${data.year}-${data.quarter}`;
        }
        basicInfoForm.compilationDate = data.preparedDate ? dayjs(data.preparedDate) : null;
        const regionCodes = [data.provinceCode, data.cityCode, data.districtCode].filter(Boolean);
        basicInfoForm.region = regionCodes;
    };

    // ─── 工程总概算报告下载 ──────────────────────────────────────────────────────
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
                code:                          '编号',
                projectName:                   '工程名称',
                unit:                          '单位',
                number:                        '数量',
                deviceFeeTotal:                '设备费（万元）',
                installFeeTotal:               '安装费（万元）',
                installationMaterialFeeTotal:  '安装材料费（万元）',
                totalFee:                      '合计（万元）',
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
                code:            '编号',
                projectName:     '费用名称',
                unit:            '单位',
                rateOrQuantity:  '费率或数量',
                unitPrice:       '单价（元）',
                amount:          '金额（万元）',
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

    const handleDownloadExcel = async () => {
        const projectId = route.query.id;
        downloadExcelLoading.value = true;
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
                console.log(parsed)
            } catch {
                message.warning('请先进行计算，再下载报告');
                return;
            }

            const wb = XLSX.utils.book_new();
            for (const sheet of REPORT_SHEETS) {
                const rows = parsed[sheet.key];
                if (!rows || rows.length === 0) continue;
                const fieldKeys   = Object.keys(sheet.headers);
                const headerRow   = fieldKeys.map(k => sheet.headers[k]);
                const dataRows    = rows.map(row => fieldKeys.map(k => row[k] ?? ''));
                const ws          = XLSX.utils.aoa_to_sheet([headerRow, ...dataRows]);
                ws['!cols'] = fieldKeys.map(k => ({ wch: Math.max(sheet.headers[k].length * 2.2, 12) }));
                XLSX.utils.book_append_sheet(wb, ws, sheet.name);
            }

            if (wb.SheetNames.length === 0) {
                message.warning('请先进行计算，再下载报告');
                return;
            }

            const fileName = `${projectName || '工程概算'}_报告.xlsx`;
            XLSX.writeFile(wb, fileName);
        } catch (err) {
            message.error('下载失败，请重试');
        } finally {
            downloadExcelLoading.value = false;
        }
    };

    const handleDownloadWord = () => {
        message.info('Word报告功能即将上线，敬请期待');
    };

    onBeforeMount(async() => {
        leftActive.value = 0;
        // await getAllAreaData();
    });

    

    onMounted(async () => {
    try {
        // 先同步五环平台登录态
        await waitForSessionStorage();

        // 登录态同步完成后，再调用业务接口
        await getAllAreaData();
        await getPriceData();

        const projectId = route.query.id;
        const kyProjectId = route.query.projectId

        

        if (!projectId) {
            message.warning('缺少概算项目ID');
            return;
        }

        const [detailRes, editDetailRes] = await Promise.all([
            getProjectDetailById(projectId),
            getProjectDetailByIdEdit(projectId),
        ]);


        if (detailRes && detailRes.code === 200) {
            fillFormFromDetail(detailRes.data);

            if (detailRes.data.channel == 0) {
                hasProjectId.value = false
            }else{
                hasProjectId.value = true
            }

            if (detailRes.data.resultParam) {
                try {
                    cachedResultData.value = JSON.parse(
                        detailRes.data.resultParam,
                    );

                    fillEstimateData(
                        cachedResultData.value,
                    );
                } catch (error) {
                    console.warn(
                        '概算结果数据解析失败：',
                        error,
                    );

                    hasEstimateResult.value = false;
                }
            }
        } else {
            message.error(
                detailRes?.message || '获取项目详情失败',
            );
        }

        if (editDetailRes && editDetailRes.code === 200) {
            projectEditDetail.value = editDetailRes.data;
        } else {
            message.error(
                editDetailRes?.message || '获取树形数据失败',
            );
        }
    } catch (error) {
        console.error('概算页面初始化失败：', error);
        message.error('获取概算项目详情失败');
    }
});
onUnmounted(() => {
    window.removeEventListener(
        'message',
        () => {},
    );
});
</script>

<style scoped lang="scss">
    .template-set {
        border-radius: 12px 0 0 0;
        margin: 8px 0 0 16px;
        display: flex;
        flex-direction: column;
        user-select: none;
        overflow: hidden;
        height: calc(100vh - 8px);

        .ts-header {
            flex: none;
            height: 60px;
            display: flex;
            align-items: center;
            background: #fff;
            padding-right: 24px;
            border-bottom: 1px solid #f0f0f0;

            .ts-header-spacer {
                flex: none;
                width: 20px;
            }

            .ts-title {
                font-size: 16px;
                font-weight: 600;
                color: #1a1a1a;
                letter-spacing: 0.5px;
            }

            .ts-actions {
                margin-left: auto;
                display: flex;
                align-items: center;
                gap: 8px;
            }
        }

        .ts-body {
            flex: 1;
            display: flex;
            overflow: hidden;
        }

        .template-set-left {
            flex: none;
            width: 170px;
            background-color: #ffffff;
            padding: 16px 10px 0 20px;
            display: flex;
            flex-direction: column;

            .template-set-left-ul {
                display: flex;
                flex-direction: column;
                gap: 24px;
                margin: 0;
                padding: 0;
                list-style: none;

                .menu-item {
                    height: 60px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 9px 10px;
                    border-radius: 10px;
                    cursor: pointer;
                    background: #F4F6FA;
                    transition: background 0.2s, box-shadow 0.2s;

                    &:hover:not(.active) {
                        background: #EBF2FF;
                    }

                    &.active {
                        background: linear-gradient(to right, #2883FF, #2BB7FF);
                        box-shadow: 0 4px 14px rgba(40, 131, 255, 0.28);

                        .menu-icon {
                            filter: brightness(0) invert(1) !important;
                        }
                        .step-num  { color: rgba(255, 255, 255, 0.72); }
                        .step-name { color: #ffffff; }
                    }

                    .menu-icon-area {
                        position: relative;
                        flex: none;
                        width: 32px;
                        height: 32px;
                        display: flex;
                        align-items: center;
                        justify-content: center;

                        .menu-icon {
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            :deep(svg) {
                                width: 22px;
                                height: 22px;
                                display: block;
                            }
                        }

                        .status-dot {
                            position: absolute;
                            top: -3px;
                            right: -3px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            :deep(svg) {
                                width: 14px;
                                height: 14px;
                                display: block;
                            }
                        }
                    }

                    .menu-text {
                        display: flex;
                        flex-direction: column;
                        gap: 1px;
                        min-width: 0;
                    }

                    .step-num {
                        font-size: 10px;
                        color: #aab0bf;
                        line-height: 1.2;
                        transition: color 0.2s;
                        white-space: nowrap;
                    }

                    .step-name {
                        font-size: 12px;
                        color: #333;
                        font-weight: 500;
                        line-height: 1.35;
                        transition: color 0.2s;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                    }
                }
            }

            .calc-btn-wrap {
                margin-top: 24px;

                .calc-btn {
                    width: 100%;
                    border: none;
                    background: linear-gradient(to right, #0389EA, #11C2E3);
                    color: #fff;
                    font-weight: 600;
                    font-size: 13px;
                    border-radius: 10px;
                    height: 60px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    box-shadow: 0 3px 10px rgba(3, 137, 234, 0.3);
                    transition: opacity 0.2s, box-shadow 0.2s;

                    &:not(:disabled):hover {
                        opacity: 0.88;
                        box-shadow: 0 4px 14px rgba(3, 137, 234, 0.4);
                    }

                    &:disabled {
                        background: #d9d9d9;
                        color: #aaa;
                        box-shadow: none;
                    }

                    :deep(.ant-btn-loading-icon) {
                        color: #fff;
                    }

                    .calc-btn-icon {
                        display: flex;
                        align-items: center;
                        justify-content: center;

                        :deep(svg) {
                            width: 16px;
                            height: 16px;
                            display: block;
                        }
                    }
                }

                &.calc-btn-wrap--loading .calc-btn {
                    opacity: 0.75;
                }
            }
        }

        .template-set-right {
            height: calc(100vh - 60px - 60px);
            background-color: #fff;
            padding: 24px;
            flex: 1;
            overflow: hidden;
            position: relative;
        }

        .loading-box {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba($color: #ffffff, $alpha: 0.6);
            z-index: 9;
            display: flex;
            justify-content: center;
            align-items: center;

            &--calc {
                background: rgba($color: #ffffff, $alpha: 0.82);
                z-index: 10;
                flex-direction: column;
                gap: 12px;
            }
        }

        :deep(.ant-table-row-expand-icon) {
            margin-top: 9px;
            &::before { height: 0; }
        }

        :deep(.template-set-right .ant-table-row-expand-icon-expanded) {
            border: none;
            background: none;
            &::after {
                content: '';
                background: url(@/assets/img/right-icon.png) no-repeat;
                background-size: 100%;
                width: 10px;
                height: 10px;
                top: 2px;
                inset-inline-start: 3px;
            }
        }

        :deep(.template-set-right .ant-table-row-expand-icon-collapsed) {
            border: none;
            &::after {
                content: '';
                background: url(@/assets/img/right-icon.png) no-repeat;
                background-size: 100%;
                background-position: center;
                width: 10px;
                height: 10px;
                transform-origin: center;
                transform: rotate(0deg);
                inset-inline-start: 3px;
            }
        }

        .template-set-table { height: 100%; }

        .serial-number {
            height: 32px;
            line-height: 32px;
            cursor: pointer;
        }

        /* ── 基本信息面板 ── */
        .basic-info-panel {
            overflow-y: auto;
            height: 100%;
            padding-right: 8px;
        }

        .bi-section {
            margin-bottom: 24px;
        }

        .bi-section-title {
            font-size: 14px;
            font-weight: 600;
            color: #036b64;
            margin-bottom: 16px;
            padding-left: 8px;
            border-left: 3px solid #036b64;
        }

        .bi-form-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 16px 32px;
        }

        .bi-form-item {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .bi-label {
            flex: none;
            width: 8em;
            font-size: 13px;
            color: #333;
            line-height: 1.4;
            text-align: right;
            word-break: break-all;
            padding-right: 4px;
        }

        .bi-required {
            color: #ff4d4f;
            white-space: nowrap;
            &::before { content: "\2060"; }
        }

        .bi-field-error {
            &.bi-input,
            &:deep(.ant-input) { border-color: #ff4d4f !important; }
            &.bi-select,
            &:deep(.ant-select-selector) { border-color: #ff4d4f !important; }
        }
        .bi-select.bi-field-error {
            :deep(.ant-select-selector) {
                border-color: #ff4d4f !important;
                box-shadow: 0 0 0 2px rgba(255, 77, 79, 0.1);
            }
        }

        .bi-input {
            flex: 1;
            min-width: 0;
        }

        .bi-select {
            flex: 1;
            min-width: 0;
            width: 0 !important;

            :deep(.ant-select-selector) {
                height: 34px !important;
            }
            :deep(.ant-select-selection-item),
            :deep(.ant-select-selection-placeholder) {
                line-height: 32px !important;
            }
        }

        .bi-unit-inner {
            font-size: 12px;
            color: #aaa;
            padding-left: 2px;
        }

        .bi-date-item {
            align-items: flex-start;
        }

        .bi-date-compound {
            display: flex;
            align-items: center;
            gap: 6px;
            flex: 1;
            min-width: 0;
        }

        .bi-date-sep {
            font-size: 13px;
            color: #555;
            white-space: nowrap;
        }

        .bi-construction-input {
            width: 90px !important;
            flex: none !important;
        }

        /* ── 工程总概算 tab 切换 ── */
        .estimate-tabs-panel {
            display: flex;
            flex-direction: column;

            .estimate-toolbar {
                flex: none;
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 12px;
                // border-bottom: 1px solid #e8e8e8;
                padding-bottom: 0;

                .estimate-tab-list {
                    display: flex;
                    flex-wrap: wrap;

                    .estimate-tab-item {
                        padding: 8px 16px;
                        font-size: 13px;
                        color: #666;
                        cursor: pointer;
                        border-bottom: 2px solid transparent;
                        transition: color 0.2s, border-color 0.2s;
                        white-space: nowrap;

                        &:hover { color: #1677ff; }

                        &.active {
                            color: #1677ff;
                            font-weight: 600;
                            border-bottom-color: #1677ff;
                        }
                    }
                }

                .estimate-actions {
                    flex: none;
                    margin-left: 16px;
                    padding-bottom: 8px;
                }
            }
        }
    }

    :deep(.template-set-right .ant-input) {
        background: rgba($color: #c9c9c9, $alpha: 0.1);
    }

    :deep(.template-set-right .ant-input-affix-wrapper) {
        height: 34px;
        padding-top: 0;
        padding-bottom: 0;
        background: rgba($color: #a8dad3, $alpha: 0.1);
    }

    :deep(.basic-info-panel .ant-input) {
        background: #ffffff;
    }

    :deep(.basic-info-panel .ant-input-affix-wrapper) {
        height: 34px;
        padding-top: 0;
        padding-bottom: 0;
        background: #ffffff;
    }

    :deep(.ant-input-number) {
        font-size: 12px;
        border-color: #eee;
        background: rgba($color: #a8dad3, $alpha: 0.1);
    }

    :deep(.ant-input-number-input) {
        color: #036b64;
        font-weight: 500;
        height: 34px;
        line-height: 34px;
    }

    :deep(.ant-dropdown-menu-title-content) {
        font-size: 12px;
    }

    :deep(.table-selected td) {
        background-color: #eaefef;
    }

    .no-result {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        text-align: center;
        color: #999;
        font-size: 12px;
        img {
            height: 100px;
            margin-bottom: 16px;
        }
    }
</style>

<style>
    .ant-tooltip {
        font-size: 12px;
    }
</style>
