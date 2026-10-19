<template>
  <div class="page-container">
    <!-- 顶部标题 & 操作栏 -->
    <div class="page-header">
      <h2 class="page-title">企业介绍</h2>
      <div class="action-area">
        <el-button link type="primary" class="edit-btn">编辑基本信息</el-button>
      </div>
    </div>

    <!-- 主体内容：左右分栏 -->
    <div class="intro-body">
      <!-- 左侧：企业树形导航 -->
      <div class="left-tree">
        <el-tree
          :data="treeData"
          :props="defaultProps"
          default-expand-all
          highlight-current
          :expand-on-click-node="false"
          node-key="id"
          @node-click="handleNodeClick"
        >
          <template #default="{ node, data }">
            <span class="custom-tree-node" :class="{ 'is-active': currentNodeId === data.id }">
              {{ node.label }}
            </span>
          </template>
        </el-tree>
      </div>

      <!-- 右侧：企业详情 -->
      <div class="right-content">
        <!-- 顶部 Tabs -->
        <el-tabs v-model="activeTab" class="detail-tabs">
          <el-tab-pane label="基本信息" name="basic" />
          <el-tab-pane label="项目业绩" name="performance" />
          <el-tab-pane label="技术能力" name="tech" />
          <el-tab-pane label="财务审计" name="finance" />
          <el-tab-pane label="申报情况" name="apply" />
        </el-tabs>

        <!-- Tab 内容区 -->
        <div class="tab-content">
          <!-- 基本信息表单区 -->
          <div v-if="activeTab === 'basic'" class="basic-info">
            <!-- 小标题 -->
            <div class="section-title">
              <span class="blue-bar"></span>
              基本信息
            </div>

            <el-form label-width="180px" label-position="left" class="read-only-form">
              <el-form-item label="企业名称">
                <el-input v-model="companyInfo.name" readonly class="readonly-input" />
              </el-form-item>
              <el-form-item label="统一社会信用代码">
                <el-input v-model="companyInfo.creditCode" readonly class="readonly-input" />
              </el-form-item>
              <el-form-item label="法定代表人姓名">
                <el-input v-model="companyInfo.legalPerson" readonly class="readonly-input" />
              </el-form-item>
              <el-form-item label="注册地址">
                <el-input v-model="companyInfo.address" readonly class="readonly-input" />
              </el-form-item>
              <el-form-item label="成立和/或注册日期">
                <el-input v-model="companyInfo.regDate" readonly class="readonly-input" />
              </el-form-item>
              
              <!-- 带单位的输入框 -->
              <el-form-item label="实收注册资本">
                <div class="input-with-unit">
                  <el-input v-model="companyInfo.registeredCapital" readonly class="readonly-input" />
                  <span class="unit">亿元</span>
                </div>
              </el-form-item>

              <el-form-item label="所属最高级母公司名称">
                <el-input v-model="companyInfo.parentCompany" readonly class="readonly-input" />
              </el-form-item>

              <!-- 多行文本框展示 -->
              <el-form-item label="最高级母公司占申报公司股权比例">
                <el-input 
                  v-model="companyInfo.parentShareRatio" 
                  type="textarea" 
                  :rows="2" 
                  readonly 
                  class="readonly-input" 
                />
              </el-form-item>

              <el-form-item label="申报企业股东构成">
                <el-input 
                  v-model="companyInfo.shareholders" 
                  type="textarea" 
                  :rows="6" 
                  readonly 
                  class="readonly-input" 
                />
              </el-form-item>

              <el-form-item label="资产负债情况">
                <div class="asset-box">
                  <div class="asset-row">
                    <span class="asset-label">截止日期</span>
                    <el-input v-model="companyInfo.assetDate" readonly class="readonly-input" style="width: 200px" />
                  </div>
                  <div class="asset-row">
                    <span class="asset-label">国家资产</span>
                    <div class="input-with-unit">
                      <el-input v-model="companyInfo.stateAsset" readonly class="readonly-input" style="width: 200px" />
                      <span class="unit">亿元</span>
                    </div>
                  </div>
                  <div class="asset-row">
                    <span class="asset-label">总资产</span>
                    <div class="input-with-unit">
                      <el-input v-model="companyInfo.totalAsset" readonly class="readonly-input" style="width: 200px" />
                      <span class="unit">亿元</span>
                    </div>
                  </div>
                  <div class="asset-row">
                    <span class="asset-label">净资产</span>
                    <div class="input-with-unit">
                      <el-input v-model="companyInfo.netAsset" readonly class="readonly-input" style="width: 200px" />
                      <span class="unit">亿元</span>
                    </div>
                  </div>
                </div>
              </el-form-item>

              <el-form-item label="企业简介">
                <el-input 
                  v-model="companyInfo.intro" 
                  type="textarea" 
                  :rows="6" 
                  readonly 
                  class="readonly-input" 
                />
              </el-form-item>
            </el-form>
          </div>

          <!-- 其他 Tab 占位 -->
          <div v-else class="empty-placeholder">
            {{ activeTab }} 内容待开发
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

// 顶部 Tabs
const activeTab = ref('basic')

// 左侧树形数据（完全复刻效果图）
const treeData = ref([
  {
    id: '1',
    label: '中国华电集团',
    children: [
      {
        id: '1-1',
        label: '华电国际电力股份有限公司',
        children: [
          { id: '1-1-1', label: '陕西华电新能源发电有限公司西安分公司' },
          { id: '1-1-2', label: '榆林横榆新能源有限公司' },
          { id: '1-1-3', label: '陕西华电材料新能源有限公司' },
          { id: '1-1-4', label: '陕西华电新能源发电有限公司' },
          { id: '1-1-5', label: '陕西华电榆横煤电有限责任公司' }
        ]
      },
      {
        id: '1-2',
        label: '华电陕西能源有限公司',
        children: [
          { id: '1-2-1', label: '陕西华电新能源发电有限公司' },
          { id: '1-2-2', label: '定边华电新能源有限公司' },
          { id: '1-2-3', label: '湖南华电秦新能源有限公司' },
          { id: '1-2-4', label: '陕西华电旬邑风电有限公司' },
          { id: '1-2-5', label: '陕西华电榆林新能源有限公司' },
          { id: '1-2-6', label: '靖边华电能源有限公司' },
          { id: '1-2-7', label: '陕西华电定边风力发电有限公司' },
          { id: '1-2-8', label: '陕西华电神木新能源有限公司' },
          { id: '1-2-9', label: '陕西华电旬邑新能源有限公司' }
        ]
      }
    ]
  }
])

const defaultProps = {
  children: 'children',
  label: 'label'
}

// 当前选中的节点 ID（用于高亮）
const currentNodeId = ref('1-2-9') // 默认选中图里蓝色的那个

const handleNodeClick = (data) => {
  currentNodeId.value = data.id
  // 真实业务中，这里应该调接口根据 data.id 获取右侧企业信息
}

// 右侧详情假数据（完全复刻效果图）
const companyInfo = reactive({
  name: '陕西华电新能源发电有限公司',
  creditCode: '916108245777821241J',
  legalPerson: '倪军',
  address: '陕西省榆林市靖边县王渠则镇王渠则村刘光沙小组',
  regDate: '2011-07-05',
  registeredCapital: '48.87837784',
  parentCompany: '中国华能集团有限公司',
  parentShareRatio: '中国华电集团有限公司通过福建华电福瑞能源发展有限公司、华电国际电力股份有限公司间接持有华电新能源集团股份有限公司 83.43%股权。',
  shareholders: '陕西华能新能源发电有限公司：\n华电新能源集团股份有限公司持股 100%。\n\n华电新能源集团股份有限公司：\n福建华电福瑞能源发展有限公司（持股 52.48%）、华电国际电力股份有限公司（持股 31.03%）、中国人寿保险股份有限公司（持股 2.21%）、国新建信股权投资基金（成都）合伙企业（有限合伙）（持股 1.77%）、国开中泰股权投资基金（青岛）合伙企业（有限合伙）（持股 1.77%）、山东发展投资控股集团有限公司（持股 1.77%）、影泰方源产业基金（北京）合伙企业（有限合伙）（持股 1.68%）、南网双碳绿能（广州）股权投资基金合伙企业（有限合伙）（持股 1.16%）、国新远海发展基金有限公司（持股 1.10%）、福建海丝新能源发展合伙企业（有限合伙）（持股 0.93%）、浙江浙能能源服务基金合伙企业（有限合伙）（持股 0.85%）、中国平安人寿保险股份有限公司（持股 0.81%）、北京望建工股权投资基金（有限合伙）（持股 0.85%）。',
  assetDate: '2025-12-31',
  stateAsset: '67.28',
  totalAsset: '34.93',
  netAsset: '35.19',
  intro: '陕西华能新能源发电有限公司：\n华电新能源集团股份有限公司持股 100%。\n\n华电新能源集团股份有限公司：\n福建华电福瑞能源发展有限公司（持股 52.48%）、华电国际电力股份有限公司（持股 31.03%）、中国人寿保险股份有限公司（持股 2.21%）、国新建信股权投资基金（成都）合伙企业（有限合伙）（持股 1.77%）、国开中泰股权投资基金（青岛）合伙企业（有限合伙）（持股 1.77%）、山东发展投资控股集团有限公司（持股 1.77%）、影泰方源产业基金（北京）合伙企业（有限合伙）（持股 1.68%）、南网双碳绿能（广州）股权投资基金合伙企业（有限合伙）（持股 1.16%）、国新远海发展基金有限公司（持股 1.10%）、福建海丝新能源发展合伙企业（有限合伙）（持股 0.93%）、浙江浙能能源服务基金合伙企业（有限合伙）（持股 0.85%）、中国平安人寿保险股份有限公司（持股 0.81%）。'
})
</script>

<style scoped>
.page-container {
  padding: 24px;
  background-color: #fff;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

/* 顶部 Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.page-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
}
.edit-btn {
  font-size: 14px;
}

/* 主体左右布局 */
.intro-body {
  display: flex;
  flex: 1;
  gap: 24px;
  min-height: 0;
}

/* 左侧树形导航 */
.left-tree {
  width: 240px;
  background: #fafafa;
  border-radius: 8px;
  padding: 16px 8px;
  overflow-y: auto;
}
:deep(.el-tree) {
  background: transparent;
}
:deep(.el-tree-node__content) {
  height: 36px;
  border-radius: 4px;
}
:deep(.el-tree-node__content:hover) {
  background-color: #f0f2f5;
}
:deep(.el-tree-node.is-current > .el-tree-node__content) {
  background-color: transparent; /* 取消自带背景，使用自定义 */
}
.custom-tree-node {
  font-size: 14px;
  color: #606266;
  flex: 1;
  display: flex;
  align-items: center;
}
.custom-tree-node.is-active {
  color: #409EFF;
  font-weight: 600;
}

/* 右侧内容区 */
.right-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

/* Tabs */
.detail-tabs {
  margin-bottom: 20px;
}
:deep(.el-tabs__nav-wrap::after) {
  height: 1px;
}
:deep(.el-tabs__item) {
  font-size: 14px;
  font-weight: 500;
}

/* 详情滚动区 */
.tab-content {
  flex: 1;
  overflow-y: auto;
  padding-right: 10px;
}

/* 基本信息表单 */
.basic-info {
  padding-top: 10px;
}
.section-title {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 24px;
}
.blue-bar {
  width: 4px;
  height: 16px;
  background-color: #409EFF;
  margin-right: 8px;
  border-radius: 2px;
}

/* 只读输入框样式定制 */
.readonly-input {
  width: 100%;
  max-width: 600px;
}
:deep(.readonly-input .el-input__wrapper),
:deep(.readonly-input .el-textarea__inner) {
  background-color: #fff;
  box-shadow: 0 0 0 1px #dcdfe6 inset;
  color: #333;
}
:deep(.readonly-input .el-input__wrapper.is-focus),
:deep(.readonly-input .el-textarea__inner:focus) {
  box-shadow: 0 0 0 1px #dcdfe6 inset !important;
}
/* 多行文本框调整 */
:deep(.readonly-input .el-textarea__inner) {
  padding: 8px 12px;
  line-height: 1.6;
}

/* 带单位的输入框 */
.input-with-unit {
  display: flex;
  align-items: center;
}
.unit {
  margin-left: 12px;
  font-size: 14px;
  color: #606266;
}

/* 资产负债情况 */
.asset-box {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  max-width: 400px;
}
.asset-row {
  display: flex;
  align-items: center;
}
.asset-label {
  width: 80px;
  font-size: 14px;
  color: #606266;
  text-align: right;
  margin-right: 16px;
}

.empty-placeholder {
  padding: 40px;
  text-align: center;
  color: #999;
}
</style>