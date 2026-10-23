<template>
  <!-- 唯一根节点 -->
  <div class="enterprise-root">
    <div class="enterprise-page-bg">
      <!-- 背景光晕层 -->
      <div class="bg-glow-top-left"></div>
      <div class="bg-glow-bottom-right"></div>
      <div class="bg-glow-top-right"></div>

      <!-- 顶部 Header -->
      <div class="page-header">
        <span class="page-title">企业介绍</span>
      </div>

      <!-- 主卡片 -->
      <div class="main-card">
        <!-- 卡片头部操作栏 -->
        <div class="card-header">
          <div class="header-left"></div>
          <div class="header-actions">
            <el-button link type="primary" class="btn-edit" @click="handleEdit">
              <el-icon class="mr-1"><Edit /></el-icon>
              编辑基本信息
            </el-button>
          </div>
        </div>

        <!-- 左右分栏主体 -->
        <div class="content-body">
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
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { Edit } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// 顶部 Tabs
const activeTab = ref('basic')

// 左侧树形数据
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

// 当前选中的节点 ID
const currentNodeId = ref('1-2-9')

const handleNodeClick = (data) => {
  currentNodeId.value = data.id
  // 真实业务中，这里调接口获取右侧信息
}

const handleEdit = () => {
  ElMessage.info('触发编辑基本信息')
}

// 右侧详情假数据
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

<style scoped lang="scss">
.enterprise-root {
  width: 100%;
  height: 100%;
}

/* ========== 外层容器与背景 ========== */
.enterprise-page-bg {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: linear-gradient(122.01deg, #E6EEF8 0%, #D2E0F4 100%), #FFFFFF;
  overflow: hidden;
}

.bg-glow-top-left {
  position: absolute;
  left: -1.61%;
  top: -18.52%;
  width: 350px;
  height: 350px;
  background: linear-gradient(135deg, #FFCCD5 0%, #FECFEF 100%);
  opacity: 0.49;
  filter: blur(129.5px);
  border-radius: 50%;
  pointer-events: none;
  z-index: 1;
}
.bg-glow-bottom-right {
  position: absolute;
  right: 4.64%;
  bottom: -18.13%;
  width: 450px;
  height: 450px;
  background: linear-gradient(120deg, #A1C4FD 0%, #C2E9FB 100%);
  opacity: 0.7;
  filter: blur(123px);
  border-radius: 50%;
  pointer-events: none;
  z-index: 1;
}
.bg-glow-top-right {
  position: absolute;
  right: 19.01%;
  top: -37.04%;
  width: 300px;
  height: 300px;
  background: linear-gradient(120deg, #A1C4FD 0%, #C2E9FB 100%);
  opacity: 0.7;
  filter: blur(123px);
  border-radius: 50%;
  pointer-events: none;
  z-index: 1;
}

/* ========== 顶部 Header ========== */
.page-header {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  height: 67px;
  padding: 15px 20px;
  box-sizing: border-box;
  flex-shrink: 0;
  border-bottom: 1px solid #E2E9F0;
}
.page-title {
  font-family: 'PingFang SC';
  font-weight: 500;
  font-size: 16px;
  color: #0B1C2C;
}

/* ========== 主卡片 ========== */
.main-card {
  position: relative;
  z-index: 2;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  margin: 16px 12px 30px;
  background: #FFFFFF;
  border: 1px solid #DFE5EC;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(11, 28, 44, 0.04);
  overflow: hidden;
}

/* ========== 卡片头部操作栏 ========== */
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  padding: 0 20px;
  border-bottom: 1px solid #E2E9F0;
  flex-shrink: 0;
}
.btn-edit {
  font-size: 14px;
  color: #0278E7 !important;
  display: inline-flex;
  align-items: center;
  &:hover { color: #0267C7 !important; }
}
.mr-1 { margin-right: 4px; }

/* ========== 左右分栏主体 ========== */
.content-body {
  flex: 1;
  min-height: 0;
  display: flex;
}

/* 左侧树形导航 */
.left-tree {
  width: 260px;
  flex-shrink: 0;
  background: #FAFBFC;
  border-right: 1px solid #E2E9F0;
  padding: 16px 8px;
  overflow-y: auto;
}
:deep(.el-tree) {
  background: transparent;
}
:deep(.el-tree-node__content) {
  height: 36px;
  border-radius: 6px;
  margin-bottom: 2px;
}
:deep(.el-tree-node__content:hover) {
  background-color: #F0F4F8;
}
:deep(.el-tree-node.is-current > .el-tree-node__content) {
  background-color: transparent; 
}
.custom-tree-node {
  font-size: 14px;
  color: #667383;
  flex: 1;
  display: flex;
  align-items: center;
  padding: 0 8px;
  border-radius: 6px;
  transition: all 0.15s ease;
}
/* 树节点选中态 */
.custom-tree-node.is-active {
  color: #0278E7;
  font-weight: 500;
  background: #E6F2FF;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 3px;
    height: 14px;
    border-radius: 0 2px 2px 0;
    background: #0278E7;
  }
}

/* 右侧内容区 */
.right-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

/* Tabs 样式 */
.detail-tabs {
  padding: 0 20px;
  margin-bottom: 0 !important;
  flex-shrink: 0;
  border-bottom: 1px solid #E2E9F0;

  :deep(.el-tabs__nav-wrap::after) {
    display: none; /* 移除自带下划线，使用外层 border */
  }
  :deep(.el-tabs__item) {
    height: 48px;
    font-size: 14px;
    color: #667383;
    &.is-active {
      color: #0278E7;
      font-weight: 500;
    }
  }
  :deep(.el-tabs__active-bar) {
    background-color: #0278E7;
  }
}

/* 详情滚动区 */
.tab-content {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 20px;
}

/* ========== 表单及详情样式 ========== */
.basic-info {
  padding-top: 4px;
}
.section-title {
  display: flex;
  align-items: center;
  font-size: 15px;
  font-weight: 600;
  color: #0B1C2C;
  margin-bottom: 24px;
}
.blue-bar {
  width: 3px;
  height: 14px;
  background-color: #0278E7;
  margin-right: 8px;
  border-radius: 2px;
}

/* Element 表单文字标签 */
:deep(.el-form-item__label) {
  font-size: 14px;
  color: #667383;
}

/* 只读输入框样式定制 (去边框，浅底色) */
.readonly-input {
  width: 100%;
  max-width: 800px; /* 加宽一点便于阅读 */
}
:deep(.readonly-input .el-input__wrapper),
:deep(.readonly-input .el-textarea__inner) {
  background-color: #F8FAFC !important; /* 浅灰底 */
  box-shadow: none !important; /* 去除边框 */
  border-radius: 6px;
  color: #0B1C2C;
  font-size: 14px;
  padding: 4px 12px;
}
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
  color: #667383;
}

/* 资产负债情况框 */
.asset-box {
  border: 1px solid #E2E9F0;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  max-width: 400px;
  background: #FAFBFC;
}
.asset-row {
  display: flex;
  align-items: center;
}
.asset-label {
  width: 80px;
  font-size: 14px;
  color: #667383;
  text-align: right;
  margin-right: 16px;
}

/* 空状态 */
.empty-placeholder {
  padding: 80px 40px;
  text-align: center;
  color: #8D9AAF;
  font-size: 14px;
}
</style>