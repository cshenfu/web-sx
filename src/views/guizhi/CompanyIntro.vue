<template>
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
            <!-- 基本信息 Tab 按钮 -->
            <template v-if="activeTab === 'basic'">
              <template v-if="!isBasicEditing">
                <el-button link type="primary" class="btn-edit" @click="handleStartEditBasic">
                  <el-icon class="mr-1"><Edit /></el-icon>
                  编辑基本信息
                </el-button>
              </template>
              <template v-else>
                <el-button @click="handleCancelEditBasic">取消</el-button>
                <el-button type="primary" :loading="saveLoading" @click="handleSaveBasic">保存</el-button>
              </template>
            </template>
            
            <!-- 项目业绩 Tab 按钮 -->
            <template v-else-if="activeTab === 'performance'">
              <el-button plain>导入业绩</el-button>
              <el-button type="primary" @click="handleAddPerformance">添加业绩</el-button>
            </template>
            
            <!-- 技术能力 Tab 按钮 -->
            <template v-else-if="activeTab === 'tech'">
              <el-button plain>导入能力</el-button>
              <el-button type="primary" @click="handleAddTech">添加能力</el-button>
            </template>
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
            <el-tabs v-model="activeTab" class="detail-tabs" @tab-change="handleTabChange">
              <el-tab-pane label="基本信息" name="basic" />
              <el-tab-pane label="项目业绩" name="performance" />
              <el-tab-pane label="技术能力" name="tech" />
              <el-tab-pane label="财务审计" name="finance" />
              <el-tab-pane label="申报情况" name="apply" />
            </el-tabs>

            <!-- Tab 内容区 -->
            <div class="tab-content">
              <!-- ==================== 基本信息 ==================== -->
              <div v-if="activeTab === 'basic'" class="basic-info">
                <div class="section-title">
                  <span class="blue-bar"></span>
                  基本信息
                </div>

                <el-form label-width="180px" label-position="left" class="read-only-form">
                  <el-form-item label="企业名称">
                    <el-input v-model="editForm.enterpriseName" :readonly="!isBasicEditing" :class="!isBasicEditing ? 'readonly-input' : 'editing-input'" />
                  </el-form-item>
                  <el-form-item label="统一社会信用代码">
                    <el-input v-model="editForm.unifiedSocialCreditCode" :readonly="!isBasicEditing" :class="!isBasicEditing ? 'readonly-input' : 'editing-input'" />
                  </el-form-item>
                  <el-form-item label="法定代表人姓名">
                    <el-input v-model="editForm.legalRepresentative" :readonly="!isBasicEditing" :class="!isBasicEditing ? 'readonly-input' : 'editing-input'" />
                  </el-form-item>
                  <el-form-item label="注册地址">
                    <el-input v-model="editForm.registeredAddress" :readonly="!isBasicEditing" :class="!isBasicEditing ? 'readonly-input' : 'editing-input'" />
                  </el-form-item>
                  
                  <el-form-item label="成立和/或注册日期">
                    <el-input v-if="!isBasicEditing" v-model="editForm.registrationDate" readonly class="readonly-input" />
                    <el-date-picker v-else v-model="editForm.registrationDate" type="date" value-format="YYYY-MM-DD" placeholder="选择日期" class="editing-input" />
                  </el-form-item>
                  
                  <el-form-item label="实收注册资本">
                    <div class="input-with-unit" style="max-width: 800px;">
                      <el-input v-model="editForm.paidUpCapital" :readonly="!isBasicEditing" :class="!isBasicEditing ? 'readonly-input' : 'editing-input'" />
                      <span class="unit">{{ editForm.paidUpCapitalUnit }}</span>
                    </div>
                  </el-form-item>

                  <el-form-item label="所属最高级母公司名称">
                    <el-input v-model="editForm.ultimateParentCompanyName" :readonly="!isBasicEditing" :class="!isBasicEditing ? 'readonly-input' : 'editing-input'" />
                  </el-form-item>

                  <el-form-item label="最高级母公司占申报公司股权比例">
                    <el-input v-model="editForm.ultimateParentEquityRatio" type="textarea" :rows="2" :readonly="!isBasicEditing" :class="!isBasicEditing ? 'readonly-input' : 'editing-input'" />
                  </el-form-item>

                  <el-form-item label="申报企业股东构成">
                    <el-input v-model="editForm.shareholderStructure" type="textarea" :rows="6" :readonly="!isBasicEditing" :class="!isBasicEditing ? 'readonly-input' : 'editing-input'" />
                  </el-form-item>

                  <el-form-item label="资产负债情况">
                    <div class="asset-box">
                      <div class="asset-row">
                        <span class="asset-label">截止日期</span>
                        <el-input v-if="!isBasicEditing" v-model="editForm.financialDate" readonly class="readonly-input" style="width: 200px" />
                        <el-date-picker v-else v-model="editForm.financialDate" type="date" value-format="YYYY-MM-DD" placeholder="选择日期" style="width: 200px" />
                      </div>
                      <div class="asset-row">
                        <span class="asset-label">固定资产</span>
                        <div class="input-with-unit">
                          <el-input v-model="editForm.fixedAssets" :readonly="!isBasicEditing" :class="!isBasicEditing ? 'readonly-input' : 'editing-input'" style="width: 200px" />
                          <span class="unit">{{ editForm.fixedAssetsUnit }}</span>
                        </div>
                      </div>
                      <div class="asset-row">
                        <span class="asset-label">总资产</span>
                        <div class="input-with-unit">
                          <el-input v-model="editForm.totalAssets" :readonly="!isBasicEditing" :class="!isBasicEditing ? 'readonly-input' : 'editing-input'" style="width: 200px" />
                          <span class="unit">{{ editForm.totalAssetsUnit }}</span>
                        </div>
                      </div>
                      <div class="asset-row">
                        <span class="asset-label">净资产</span>
                        <div class="input-with-unit">
                          <el-input v-model="editForm.netAssets" :readonly="!isBasicEditing" :class="!isBasicEditing ? 'readonly-input' : 'editing-input'" style="width: 200px" />
                          <span class="unit">{{ editForm.netAssetsUnit }}</span>
                        </div>
                      </div>
                    </div>
                  </el-form-item>

                  <el-form-item label="企业简介">
                    <el-input v-model="editForm.companyProfile" type="textarea" :rows="6" :readonly="!isBasicEditing" :class="!isBasicEditing ? 'readonly-input' : 'editing-input'" />
                  </el-form-item>
                </el-form>

                <!-- 营业执照副本原件的复印件 -->
                <div class="license-section">
                  <div class="section-title" style="margin-top: 32px; margin-bottom: 16px;">
                    <span class="blue-bar"></span>营业执照副本原件的复印件
                  </div>
                  <div class="license-content" style="padding-left: 20px;">
                    <div v-if="isBasicEditing" style="margin-bottom: 12px;">
                      <el-button type="primary" plain @click="triggerLicenseUpload" :loading="licenseUploading">上传数据</el-button>
                      <input type="file" ref="licenseInputRef" style="display: none;" accept=".jpg,.jpeg,.png" @change="handleLicenseFileChange" />
                    </div>
                    <div class="upload-tip">说明：支持 jpg、png 格式图片</div>
                    <div v-if="editForm.licensePreviewUrl" class="license-preview">
                      <el-image
                        style="max-width: 400px; max-height: 250px; border: 1px solid #E2E9F0; cursor: pointer; padding: 4px; border-radius: 4px;"
                        :src="editForm.licensePreviewUrl"
                        :preview-src-list="[editForm.licensePreviewUrl]"
                        preview-teleported
                        fit="contain"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <!-- ==================== 项目业绩 ==================== -->
              <div v-else-if="activeTab === 'performance'" class="data-panel">
                <div class="section-title">
                  <span class="blue-bar"></span>项目业绩
                </div>
                
                <el-table v-loading="performanceLoading" :data="performanceList" border stripe empty-text="暂无项目业绩数据">
                  <el-table-column type="index" label="序号" width="60" align="center" />
                  <el-table-column prop="projectName" label="项目名称" min-width="180" show-overflow-tooltip />
                  <el-table-column prop="projectType" label="类型" min-width="100" />
                  <el-table-column label="装机容量(万kW)" min-width="120" align="center">
                    <template #default="{ row }">{{ row.installedCapacity ?? '-' }}</template>
                  </el-table-column>
                  <el-table-column prop="electricityBusinessLicenseNo" label="电力业务许可证编号" min-width="150" show-overflow-tooltip />
                  <el-table-column prop="gridConnectionAgreementNo" label="并网协议编号" min-width="150" show-overflow-tooltip />
                  <el-table-column prop="purchaseSalesContractNo" label="购售合同编号" min-width="150" show-overflow-tooltip />
                  
                  <el-table-column label="营业执照/附件" min-width="200" align="left">
                    <template #default="{ row }">
                      <div v-if="row.fileList && row.fileList.length > 0" class="list-attachments">
                        <template v-for="(file, index) in row.fileList" :key="index">
                          <el-image
                            v-if="!isPdf(file)"
                            style="width: 40px; height: 40px; border-radius: 4px; flex-shrink: 0; margin-right: 8px; cursor: pointer; border: 1px solid #ebeef5;"
                            :src="file.previewUrl"
                            :preview-src-list="row.fileList.filter(f => !isPdf(f)).map(f => f.previewUrl)"
                            :initial-index="index"
                            preview-teleported
                            fit="cover"
                          />
                          <el-button v-else link type="primary" style="flex-shrink: 0;" @click="window.open(file.previewUrl, '_blank')">
                            <el-icon><Document /></el-icon> PDF
                          </el-button>
                        </template>
                      </div>
                      <span v-else class="text-gray-400">-</span>
                    </template>
                  </el-table-column>

                  <el-table-column label="操作" width="120" fixed="right" align="center">
                    <template #default="{ row }">
                      <el-button link type="primary" @click="handleEditPerformance(row)">编辑</el-button>
                      <el-button link type="danger" @click="handleDeletePerformance(row)">删除</el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </div>

              <!-- ==================== 技术能力 ==================== -->
              <div v-else-if="activeTab === 'tech'" class="data-panel">
                <div class="section-title">
                  <span class="blue-bar"></span>技术能力
                </div>

                <div class="tech-filter-bar">
                  <span class="filter-label">更新日期</span>
                  <el-date-picker v-model="techUpdateDate" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" style="width: 200px" />
                </div>
                
                <el-table v-loading="techLoading" :data="techList" border stripe empty-text="暂无技术能力数据">
                  <el-table-column type="index" label="序号" width="60" align="center" />
                  <el-table-column prop="projectName" label="项目名称" min-width="180" show-overflow-tooltip />
                  <el-table-column prop="projectType" label="类型" min-width="120" />
                  <el-table-column prop="researchUnit" label="研究单位" min-width="160" show-overflow-tooltip />
                  <el-table-column label="可研时间" min-width="200">
                    <template #default="{ row }">
                      {{ row.researchStartDate || '-' }} 至 {{ row.researchEndDate || '-' }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="acceptanceOpinionDate" label="结题验收意见出具时间" min-width="160" />
                  <el-table-column prop="achievementRelation" label="成果完成单位与竞配申报单位的关系" min-width="200" show-overflow-tooltip />
                  
                  <el-table-column label="证明材料" min-width="200" align="left">
                    <template #default="{ row }">
                      <div v-if="row.fileList && row.fileList.length > 0" class="list-attachments">
                        <template v-for="(file, index) in row.fileList" :key="index">
                          <el-image
                            v-if="!isPdf(file)"
                            style="width: 40px; height: 40px; border-radius: 4px; flex-shrink: 0; margin-right: 8px; cursor: pointer; border: 1px solid #ebeef5;"
                            :src="file.previewUrl"
                            :preview-src-list="row.fileList.filter(f => !isPdf(f)).map(f => f.previewUrl)"
                            :initial-index="index"
                            preview-teleported
                            fit="cover"
                          />
                          <el-button v-else link type="primary" style="flex-shrink: 0;" @click="window.open(file.previewUrl, '_blank')">
                            <el-icon><Document /></el-icon> PDF
                          </el-button>
                        </template>
                      </div>
                      <span v-else class="text-gray-400">-</span>
                    </template>
                  </el-table-column>

                  <el-table-column prop="achievementDate" label="取得日期" min-width="120" />
                  <el-table-column prop="projectDescription" label="项目简介/备注" min-width="150" show-overflow-tooltip />
                  
                  <el-table-column label="操作" width="120" fixed="right" align="center">
                    <template #default="{ row }">
                      <el-button link type="primary" @click="handleEditTech(row)">编辑</el-button>
                      <el-button link type="danger" @click="handleDeleteTech(row)">删除</el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </div>

              <!-- ==================== 财务审计 / 申报情况 ==================== -->
              <div v-else class="data-panel">
                <div class="section-title">
                  <span class="blue-bar"></span>
                  {{ tabTitleMap[activeTab] }}
                </div>
                <el-table v-loading="fileLoading" :data="fileList" border stripe empty-text="暂无文件数据">
                  <el-table-column prop="fileName" label="文件名称" min-width="220" show-overflow-tooltip />
                  <el-table-column prop="fileSuffix" label="文件格式" width="100" />
                  <el-table-column prop="remark" label="备注" min-width="180" show-overflow-tooltip />
                  <el-table-column label="操作" width="100" fixed="right">
                    <template #default="{ row }">
                      <el-button link type="primary" @click="viewFile(row)">查看</el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ==================== 项目业绩 添加/编辑 抽屉 ==================== -->
      <el-drawer
        v-model="perfDialogVisible"
        :title="isBatchAdd ? '添加业绩' : '编辑业绩'"
        direction="rtl"
        size="50%"
        destroy-on-close
        class="custom-drawer"
      >
        <div class="drawer-body">
          <el-table :data="editPerfList" border max-height="calc(100vh - 200px)" class="edit-table">
            <el-table-column label="项目名称 *" min-width="160">
              <template #default="{ row }">
                <el-input v-model="row.projectName" placeholder="请输入名称" class="no-border-input" />
              </template>
            </el-table-column>
            <el-table-column label="类型" width="100">
              <template #default="{ row }">
                <el-input v-model="row.projectType" placeholder="如：风电" class="no-border-input" />
              </template>
            </el-table-column>
            <el-table-column label="装机容量(万kW)" width="130">
              <template #default="{ row }">
                <el-input-number v-model="row.installedCapacity" :min="0" :precision="2" controls-position="right" class="no-border-input" style="width: 100%" />
              </template>
            </el-table-column>
            <el-table-column label="电力业务许可证编号 *" min-width="150">
              <template #default="{ row }">
                <el-input v-model="row.electricityBusinessLicenseNo" placeholder="请输入" class="no-border-input" />
              </template>
            </el-table-column>
            <el-table-column label="并网协议编号" min-width="150">
              <template #default="{ row }">
                <el-input v-model="row.gridConnectionAgreementNo" placeholder="请输入" class="no-border-input" />
              </template>
            </el-table-column>
            <el-table-column label="购售合同编号 *" min-width="150">
              <template #default="{ row }">
                <el-input v-model="row.purchaseSalesContractNo" placeholder="请输入" class="no-border-input" />
              </template>
            </el-table-column>
            
            <el-table-column label="营业执照/附件(最多20)" min-width="200" align="left">
              <template #default="{ row }">
                <div class="upload-scroll-container">
                  <el-upload
                    v-model:file-list="row.fileList"
                    action="#" 
                    :http-request="(options) => customUpload(options, row)"
                    list-type="picture-card"
                    :limit="20"
                    accept=".png,.jpg,.jpeg,.pdf"
                    class="perf-uploader"
                    :before-upload="beforeUpload"
                  >
                    <el-icon><Plus /></el-icon>
                  </el-upload>
                </div>
              </template>
            </el-table-column>

            <el-table-column label="操作" width="60" align="center" fixed="right">
              <template #default="{ $index }">
                <el-button link type="danger" @click="handleRemovePerfRow($index)" :disabled="!isBatchAdd && editPerfList.length === 1">
                  <el-icon style="font-size: 18px;"><Remove /></el-icon>
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          
          <div class="add-row-btn" v-if="isBatchAdd">
            <el-button link type="primary" @click="handleAddPerfRow">
              <el-icon><Plus /></el-icon> 添加行
            </el-button>
          </div>
        </div>

        <template #footer>
          <div class="drawer-footer">
            <el-button @click="perfDialogVisible = false">取消</el-button>
            <el-button type="primary" :loading="perfSaveLoading" @click="handleSavePerformance">保存</el-button>
          </div>
        </template>
      </el-drawer>

      <!-- ==================== 技术能力 添加/编辑 抽屉 ==================== -->
      <el-drawer
        v-model="techDrawerVisible"
        :title="isTechBatchAdd ? '添加能力' : '编辑能力'"
        direction="rtl"
        size="60%"
        destroy-on-close
        class="custom-drawer"
      >
        <div class="drawer-body">
          <el-table :data="editTechList" border max-height="calc(100vh - 200px)" class="edit-table">
            <el-table-column label="项目名称*" min-width="160">
              <template #default="{ row }">
                <el-input v-model="row.projectName" placeholder="请输入" class="no-border-input" />
              </template>
            </el-table-column>
            <el-table-column label="类型*" min-width="120">
              <template #default="{ row }">
                <el-input v-model="row.projectType" placeholder="请输入" class="no-border-input" />
              </template>
            </el-table-column>
            <el-table-column label="研究单位" min-width="150">
              <template #default="{ row }">
                <el-input v-model="row.researchUnit" placeholder="请输入" class="no-border-input" />
              </template>
            </el-table-column>
            <el-table-column label="可研时间*" min-width="200">
              <template #default="{ row }">
                <el-date-picker
                  v-model="row.researchTimeRange"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  value-format="YYYY-MM-DD"
                  class="no-border-date-picker"
                  style="width: 100%"
                />
              </template>
            </el-table-column>
            <el-table-column label="并网协议编号*" min-width="140">
              <template #default="{ row }">
                <el-input v-model="row.gridConnectionAgreementNo" placeholder="请输入" class="no-border-input" />
              </template>
            </el-table-column>
            <el-table-column label="购售电合同编号*" min-width="140">
              <template #default="{ row }">
                <el-input v-model="row.purchaseSalesContractNo" placeholder="请输入" class="no-border-input" />
              </template>
            </el-table-column>
            <el-table-column label="业绩凭证*" min-width="180" align="left">
              <template #default="{ row }">
                <div class="upload-scroll-container">
                  <el-upload
                    v-model:file-list="row.fileList"
                    action="#" 
                    :http-request="(options) => customUpload(options, row)"
                    list-type="picture-card"
                    :limit="20"
                    accept=".png,.jpg,.jpeg,.pdf"
                    class="perf-uploader"
                    :before-upload="beforeUpload"
                  >
                    <el-icon><Plus /></el-icon>
                  </el-upload>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="60" align="center" fixed="right">
              <template #default="{ $index }">
                <el-button link type="danger" @click="handleRemoveTechRow($index)" :disabled="!isTechBatchAdd && editTechList.length === 1">
                  <el-icon style="font-size: 18px;"><Remove /></el-icon>
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          
          <div class="add-row-btn" v-if="isTechBatchAdd">
            <el-button link type="primary" @click="handleAddTechRow">
              <el-icon><Plus /></el-icon> 添加行
            </el-button>
          </div>
        </div>

        <template #footer>
          <div class="drawer-footer">
            <el-button @click="techDrawerVisible = false">取消</el-button>
            <el-button type="primary" :loading="techSaveLoading" @click="handleSaveTech">保存</el-button>
          </div>
        </template>
      </el-drawer>

    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Edit, Plus, Delete, Document, Remove } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// ================= 引入真实的 API 和 OSS =================
import * as api from '@/api/modules/company'
import { useOssUpload } from '@/components/ossClient/index'

const obsUpload = useOssUpload()
// ============================================================

const COMPANY_ID = 1

const activeTab = ref('basic')
const currentNodeId = ref('1-2-9')
const treeData = ref([
  {
    id: '1', label: '中国华电集团',
    children: [
      {
        id: '1-1', label: '华电国际电力股份有限公司',
        children: [{ id: '1-1-1', label: '陕西华电新能源发电有限公司西安分公司' }]
      },
      {
        id: '1-2', label: '华电陕西能源有限公司',
        children: [
          { id: '1-2-1', label: '陕西华电新能源发电有限公司' },
          { id: '1-2-9', label: '陕西华电旬邑新能源有限公司' }
        ]
      }
    ]
  }
])
const defaultProps = { children: 'children', label: 'label' }

// --- 基本信息 ---
const isBasicEditing = ref(false)
const saveLoading = ref(false)
const originalEditForm = ref(null)
const licenseInputRef = ref(null)
const licenseUploading = ref(false)

const createEmptyForm = () => ({
  id: null, 
  companyId: COMPANY_ID, 
  enterpriseName: '', 
  unifiedSocialCreditCode: '', 
  legalRepresentative: '',
  registeredAddress: '', 
  registrationDate: '', 
  paidUpCapital: null, 
  paidUpCapitalUnit: '亿元',
  ultimateParentCompanyName: '', 
  ultimateParentEquityRatio: '', 
  shareholderStructure: '', 
  financialDate: '',
  fixedAssets: null, 
  fixedAssetsUnit: '亿元', 
  totalAssets: null, 
  totalAssetsUnit: '亿元', 
  netAssets: null, 
  netAssetsUnit: '亿元', 
  companyProfile: '',
  companyFileReqDTO: null,
  licensePreviewUrl: ''
})
const editForm = reactive(createEmptyForm())

// --- 文件通用 ---
const fileLoading = ref(false)
const fileList = ref([])
const tabTitleMap = { tech: '技术能力', finance: '财务审计', apply: '申报情况' }
const fileCategoryMap = { tech: 'TECHNICAL_CAPABILITY', finance: 'FINANCIAL_AUDIT', apply: 'DECLARATION_STATUS' }

// --- 项目业绩 ---
const performanceLoading = ref(false)
const performanceList = ref([])
const perfDialogVisible = ref(false)
const perfSaveLoading = ref(false)
const isBatchAdd = ref(false)
const editPerfList = ref([])
const editingPerfId = ref(null)

// --- 技术能力 ---
const techLoading = ref(false)
const techList = ref([])
const techUpdateDate = ref('')
const techDrawerVisible = ref(false)
const techSaveLoading = ref(false)
const isTechBatchAdd = ref(false)
const editTechList = ref([])
const editingTechId = ref(null)


// ================= 公共方法 =================
function unwrapResponse(response) {
  let result = response
  if (result && Object.prototype.hasOwnProperty.call(result, 'data') && (result.status || result.config || result.headers)) {
    result = result.data
  }
  if (result && typeof result === 'object' && Object.prototype.hasOwnProperty.call(result, 'code')) {
    if (result.code !== 0 && result.code !== 200) throw new Error(result.msg || '接口请求失败')
    return result.data
  }
  return result
}

function formatDate(value) {
  if (!value) return ''
  return String(value).slice(0, 10)
}

function isPdf(file) {
  const suffix = file.fileSuffix || file.suffix || ''
  return suffix.toLowerCase() === '.pdf' || (file.filePath && file.filePath.toLowerCase().endsWith('.pdf'))
}

// ================= 基本信息逻辑 =================
async function fillEditForm(data = {}) {
  const empty = createEmptyForm()
  const filled = { 
    ...empty, 
    ...data, 
    companyId: COMPANY_ID, 
    registrationDate: formatDate(data.registrationDate), 
    financialDate: formatDate(data.financialDate) 
  }
  
  if (data.fileRespDTO && data.fileRespDTO.filePath) {
    filled.companyFileReqDTO = { ...data.fileRespDTO }
    if (data.fileRespDTO.filePath.startsWith('http')) {
      filled.licensePreviewUrl = data.fileRespDTO.filePath
    } else {
      filled.licensePreviewUrl = await obsUpload.getFileUrl(data.fileRespDTO.filePath)
    }
  } else {
    filled.companyFileReqDTO = null
    filled.licensePreviewUrl = ''
  }
  
  Object.assign(editForm, filled)
}

async function getCompanyInfo(showMessage = false) {
  try {
    const response = await api.getCompanyBasicInfoByCompanyId(COMPANY_ID)
    const data = unwrapResponse(response)
    await fillEditForm(data || {})
  } catch (error) {
    await fillEditForm({})
    if (showMessage) ElMessage.error(error.message || '获取企业基本信息失败')
  }
}

function handleNodeClick(data) {
  currentNodeId.value = data.id
  isBasicEditing.value = false
  getCompanyInfo(true)
  if (activeTab.value !== 'basic') handleTabChange(activeTab.value)
}

function handleStartEditBasic() {
  originalEditForm.value = JSON.parse(JSON.stringify(editForm))
  isBasicEditing.value = true
}

function handleCancelEditBasic() {
  Object.assign(editForm, originalEditForm.value)
  isBasicEditing.value = false
}

async function handleSaveBasic() {
  if (!editForm.enterpriseName?.trim()) return ElMessage.warning('请填写企业名称')
  
  saveLoading.value = true
  try {
    const payload = JSON.parse(JSON.stringify(editForm))
    delete payload.licensePreviewUrl
    
    let response
    if (editForm.id) {
      response = await api.updateCompanyBasicInfo(payload)
    } else {
      response = await api.createCompanyBasicInfo(payload)
    }
    unwrapResponse(response)
    ElMessage.success(editForm.id ? '更新成功' : '新增成功')
    isBasicEditing.value = false
    await getCompanyInfo(true)
  } catch (error) {
    ElMessage.error(error.message || '保存失败')
  } finally {
    saveLoading.value = false
  }
}

function triggerLicenseUpload() {
  licenseInputRef.value.click()
}

async function handleLicenseFileChange(e) {
  const file = e.target.files[0]
  if (!file) return
  if (!['.jpg', '.jpeg', '.png'].some(ext => file.name.toLowerCase().endsWith(ext))) {
    ElMessage.warning('仅支持 jpg、png 格式图片')
    e.target.value = ''
    return
  }
  
  licenseUploading.value = true
  try {
    const uploadResult = await obsUpload.uploadFile(file)
    const realPath = uploadResult.obsPath
    const previewUrl = await obsUpload.getFileUrl(realPath)
    
    editForm.companyFileReqDTO = {
      companyId: COMPANY_ID,
      fileCategoryCode: 'BASIC_INFO',
      fileName: file.name,
      filePath: realPath,
      fileSuffix: '.' + file.name.split('.').pop().toLowerCase(),
      fileType: 0
    }
    editForm.licensePreviewUrl = previewUrl
  } catch (error) {
    ElMessage.error(error.message || '上传失败')
  } finally {
    licenseUploading.value = false
    e.target.value = ''
  }
}

// ================= 项目业绩逻辑 =================
async function getPerformanceList() {
  performanceLoading.value = true
  try {
    const response = await api.getProjectPerformanceList(COMPANY_ID)
    const data = unwrapResponse(response)
    let list = Array.isArray(data) ? data : (data?.records || data?.list || [])
    
    const promises = list.map(async (item) => {
      if (item.fileList && item.fileList.length > 0) {
        const filePromises = item.fileList.map(async (file) => {
          if (file.filePath && !file.filePath.startsWith('http')) {
            try { file.previewUrl = await obsUpload.getFileUrl(file.filePath) } catch (e) { file.previewUrl = '' }
          } else {
            file.previewUrl = file.filePath || ''
          }
          return file
        })
        await Promise.all(filePromises)
      }
      return item
    })
    await Promise.all(promises)
    performanceList.value = list
  } catch (error) {
    performanceList.value = []
    ElMessage.error(error.message || '获取项目业绩失败')
  } finally {
    performanceLoading.value = false
  }
}

function createEmptyPerfRow() {
  return {
    projectName: '', projectType: '', installedCapacity: undefined, installedCapacityUnit: '万kW',
    electricityBusinessLicenseNo: '', gridConnectionAgreementNo: '', purchaseSalesContractNo: '', fileList: []
  }
}

function handleAddPerformance() {
  isBatchAdd.value = true
  editingPerfId.value = null
  editPerfList.value = [createEmptyPerfRow()]
  perfDialogVisible.value = true
}

function handleEditPerformance(row) {
  isBatchAdd.value = false
  editingPerfId.value = row.id
  const clonedRow = JSON.parse(JSON.stringify(row))
  if (!clonedRow.fileList) clonedRow.fileList = []
  
  clonedRow.fileList = clonedRow.fileList.map(file => {
    const displayUrl = file.previewUrl || (file.filePath && file.filePath.startsWith('http') ? file.filePath : '')
    return {
      name: file.fileName,
      url: displayUrl,
      previewUrl: displayUrl,
      filePath: file.filePath,
      fileSuffix: file.fileSuffix,
      status: 'success',
      uid: file.id || Date.now() + Math.random()
    }
  })
  
  editPerfList.value = [clonedRow]
  perfDialogVisible.value = true
}

function handleAddPerfRow() {
  editPerfList.value.push(createEmptyPerfRow())
}

function handleRemovePerfRow(index) {
  if (editPerfList.value.length === 1 && isBatchAdd.value) return ElMessage.warning('至少保留一行')
  editPerfList.value.splice(index, 1)
}

const beforeUpload = (file) => {
  const isAllowed = ['.png', '.jpg', '.jpeg', '.pdf'].some(ext => file.name.toLowerCase().endsWith(ext))
  if (!isAllowed) return ElMessage.warning('只允许上传图片或 PDF 文件'), false
  if (file.size / 1024 / 1024 > 10) return ElMessage.warning('文件大小不能超过 10MB'), false
  return true
}

async function customUpload(options, row) {
  const { file, onSuccess, onError } = options
  try {
    const uploadResult = await obsUpload.uploadFile(file)
    const realFilePath = uploadResult.obsPath
    if (!realFilePath) throw new Error('上传成功但未返回文件路径')

    const previewUrl = await obsUpload.getFileUrl(realFilePath)

    const targetFile = row.fileList.find(f => f.uid === file.uid)
    if (targetFile) {
      targetFile.url = previewUrl
      targetFile.previewUrl = previewUrl
      targetFile.filePath = realFilePath
      targetFile.fileSuffix = '.' + file.name.split('.').pop().toLowerCase()
      targetFile.name = file.name
      targetFile.status = 'success'
    }
    onSuccess(uploadResult, file)
  } catch (error) {
    ElMessage.error(error.message || '图片上传失败')
    onError(error, file)
    row.fileList = row.fileList.filter(f => f.uid !== file.uid)
  }
}

async function handleSavePerformance() {
  const currentNames = new Set()
  const existingNames = performanceList.value.filter(item => item.id !== editingPerfId.value).map(item => item.projectName)

  for (let i = 0; i < editPerfList.value.length; i++) {
    const row = editPerfList.value[i]
    if (!row.projectName?.trim()) return ElMessage.warning(`第 ${i + 1} 行：项目名称不能为空`)
    if (existingNames.includes(row.projectName.trim())) return ElMessage.warning(`项目名称 "${row.projectName}" 已存在`)
    if (currentNames.has(row.projectName.trim())) return ElMessage.warning(`当前批次项目名称 "${row.projectName}" 重复`)
    currentNames.add(row.projectName.trim())
    if (!row.electricityBusinessLicenseNo?.trim()) return ElMessage.warning(`第 ${i + 1} 行：许可证编号不能为空`)
    if (!row.purchaseSalesContractNo?.trim()) return ElMessage.warning(`第 ${i + 1} 行：合同编号不能为空`)
  }

  perfSaveLoading.value = true
  try {
    const promises = editPerfList.value.map(async (row) => {
      const reqFileList = (row.fileList || []).filter(f => f.filePath).map(f => ({
        companyId: COMPANY_ID, fileCategoryCode: 'PROJECT_PERFORMANCE',
        fileName: f.fileName || f.name, filePath: f.filePath,
        fileSuffix: f.fileSuffix, fileType: 0
      }))
      const payload = {
        companyId: COMPANY_ID, projectName: row.projectName.trim(), projectType: row.projectType,
        installedCapacity: row.installedCapacity, installedCapacityUnit: row.installedCapacityUnit,
        electricityBusinessLicenseNo: row.electricityBusinessLicenseNo,
        gridConnectionAgreementNo: row.gridConnectionAgreementNo,
        purchaseSalesContractNo: row.purchaseSalesContractNo,
        fileList: reqFileList
      }
      if (isBatchAdd.value) return api.createProjectPerformance(payload)
      else { payload.id = editingPerfId.value; return api.updateProjectPerformance(payload) }
    })

    await Promise.all(promises)
    ElMessage.success('保存成功')
    perfDialogVisible.value = false
    getPerformanceList()
  } catch (error) {
    ElMessage.error(error.message || '保存失败')
  } finally {
    perfSaveLoading.value = false
  }
}

async function handleDeletePerformance(row) {
  try {
    await ElMessageBox.confirm(`确定删除项目 "${row.projectName}" 吗？`, '提示', { type: 'warning' })
    const response = await api.deleteProjectPerformance(row.id)
    unwrapResponse(response)
    ElMessage.success('删除成功')
    getPerformanceList()
  } catch (error) {
    if (error !== 'cancel') ElMessage.error(error.message || '删除失败')
  }
}

// ================= 技术能力逻辑 =================
async function getTechList() {
  techLoading.value = true
  try {
    const response = await api.getTechResearchList(COMPANY_ID)
    const data = unwrapResponse(response)
    let list = Array.isArray(data) ? data : (data?.records || data?.list || [])
    
    const promises = list.map(async (item) => {
      if (item.fileList && item.fileList.length > 0) {
        await Promise.all(item.fileList.map(async (file) => {
          if (file.filePath && !file.filePath.startsWith('http')) {
            try { file.previewUrl = await obsUpload.getFileUrl(file.filePath) } catch (e) { file.previewUrl = '' }
          } else {
            file.previewUrl = file.filePath || ''
          }
        }))
      }
      return item
    })
    await Promise.all(promises)
    techList.value = list
  } catch (error) {
    techList.value = []
    ElMessage.error(error.message || '获取技术能力失败')
  } finally {
    techLoading.value = false
  }
}

function createEmptyTechRow() {
  return {
    projectName: '', projectType: '', researchUnit: '', 
    researchTimeRange: [], // 对应截图里的可研时间，提交时拆分为开始结束日期
    gridConnectionAgreementNo: '', purchaseSalesContractNo: '', // 接口里没有，但截图有，保留前端展示
    fileList: []
  }
}

function handleAddTech() {
  isTechBatchAdd.value = true
  editingTechId.value = null
  editTechList.value = [createEmptyTechRow()]
  techDrawerVisible.value = true
}

function handleEditTech(row) {
  isTechBatchAdd.value = false
  editingTechId.value = row.id
  const clonedRow = JSON.parse(JSON.stringify(row))
  if (!clonedRow.fileList) clonedRow.fileList = []
  
  clonedRow.fileList = clonedRow.fileList.map(file => {
    const displayUrl = file.previewUrl || (file.filePath && file.filePath.startsWith('http') ? file.filePath : '')
    return { name: file.fileName, url: displayUrl, previewUrl: displayUrl, filePath: file.filePath, fileSuffix: file.fileSuffix, status: 'success', uid: file.id || Date.now() + Math.random() }
  })
  
  // 处理回显的可研时间
  if (row.researchStartDate && row.researchEndDate) {
    clonedRow.researchTimeRange = [row.researchStartDate, row.researchEndDate]
  } else {
    clonedRow.researchTimeRange = []
  }
  
  editTechList.value = [clonedRow]
  techDrawerVisible.value = true
}

function handleAddTechRow() {
  editTechList.value.push(createEmptyTechRow())
}

function handleRemoveTechRow(index) {
  if (editTechList.value.length === 1 && isTechBatchAdd.value) return ElMessage.warning('至少保留一行')
  editTechList.value.splice(index, 1)
}

async function handleSaveTech() {
  const currentNames = new Set()
  const existingNames = techList.value.filter(item => item.id !== editingTechId.value).map(item => item.projectName)

  for (let i = 0; i < editTechList.value.length; i++) {
    const row = editTechList.value[i]
    if (!row.projectName?.trim()) return ElMessage.warning(`第 ${i + 1} 行：项目名称不能为空`)
    if (existingNames.includes(row.projectName.trim())) return ElMessage.warning(`项目名称 "${row.projectName}" 已存在`)
    if (currentNames.has(row.projectName.trim())) return ElMessage.warning(`当前批次项目名称 "${row.projectName}" 重复`)
    currentNames.add(row.projectName.trim())
    if (!row.projectType?.trim()) return ElMessage.warning(`第 ${i + 1} 行：类型不能为空`)
    if (!row.researchTimeRange || row.researchTimeRange.length !== 2) return ElMessage.warning(`第 ${i + 1} 行：可研时间不能为空`)
    if (!row.fileList || row.fileList.length === 0) return ElMessage.warning(`第 ${i + 1} 行：业绩凭证不能为空`)
  }

  techSaveLoading.value = true
  try {
    const payloadList = editTechList.value.map((row) => {
      const reqFileList = (row.fileList || []).filter(f => f.filePath).map(f => ({
        companyId: COMPANY_ID, fileCategoryCode: 'TECHNICAL_CAPABILITY',
        fileName: f.fileName || f.name, filePath: f.filePath,
        fileSuffix: f.fileSuffix, fileType: 0
      }))
      
      // 接口真实字段映射，接口里没有的如 gridConnectionAgreementNo, purchaseSalesContractNo 就丢弃不传
      return {
        companyId: COMPANY_ID, 
        projectName: row.projectName.trim(), 
        projectType: row.projectType,
        researchUnit: row.researchUnit,
        researchStartDate: row.researchTimeRange[0],
        researchEndDate: row.researchTimeRange[1],
        fileList: reqFileList
      }
    })

    if (isTechBatchAdd.value) {
      await api.batchCreateTechResearch(payloadList)
    } else {
      payloadList[0].id = editingTechId.value
      await api.updateTechResearch(payloadList[0])
    }
    
    ElMessage.success('保存成功')
    techDrawerVisible.value = false
    getTechList()
  } catch (error) {
    ElMessage.error(error.message || '保存失败')
  } finally {
    techSaveLoading.value = false
  }
}

async function handleDeleteTech(row) {
  try {
    await ElMessageBox.confirm(`确定删除项目 "${row.projectName}" 吗？`, '提示', { type: 'warning' })
    await api.deleteTechResearch(row.id)
    ElMessage.success('删除成功')
    getTechList()
  } catch (error) {
    if (error !== 'cancel') ElMessage.error(error.message || '删除失败')
  }
}

// ================= 其他 Tabs 逻辑 =================
async function getCompanyFiles(tabName) {
  const fileCategoryCode = fileCategoryMap[tabName]
  if (!fileCategoryCode) return
  fileLoading.value = true
  try {
    const response = await api.getCompanyFileList({ companyId: COMPANY_ID, fileCategoryCode })
    const data = unwrapResponse(response)
    fileList.value = Array.isArray(data) ? data : (data?.records || data?.list || [])
  } catch (error) {
    fileList.value = []
    ElMessage.error(error.message || `获取${tabTitleMap[tabName]}文件失败`)
  } finally {
    fileLoading.value = false
  }
}

function handleTabChange(tabName) {
  if (tabName !== 'basic') isBasicEditing.value = false
  if (tabName === 'performance') getPerformanceList()
  else if (tabName === 'tech') getTechList()
  else if (fileCategoryMap[tabName]) getCompanyFiles(tabName)
}

async function viewFile(row) {
  if (!row?.id) return
  try {
    const data = unwrapResponse(await api.getCompanyFile(row.id))
    if (data?.filePath) {
      let finalUrl = data.filePath
      if (!finalUrl.startsWith('http')) finalUrl = await obsUpload.getFileUrl(data.filePath)
      if (finalUrl) window.open(finalUrl, '_blank')
      else ElMessage.error('获取文件预览地址失败')
    } else {
      ElMessage.info(data?.fileName || '已获取文件详情')
    }
  } catch (error) {
    ElMessage.error(error.message || '获取文件详情失败')
  }
}

onMounted(() => {
  getCompanyInfo()
})
</script>

<style scoped lang="scss">
.enterprise-root { width: 100%; height: 100%; }

/* ========== 外层容器与背景 ========== */
.enterprise-page-bg {
  position: relative; width: 100%; height: 100%; display: flex; flex-direction: column;
  background: linear-gradient(122.01deg, #E6EEF8 0%, #D2E0F4 100%), #FFFFFF; overflow: hidden;
}
.bg-glow-top-left {
  position: absolute; left: -1.61%; top: -18.52%; width: 350px; height: 350px;
  background: linear-gradient(135deg, #FFCCD5 0%, #FECFEF 100%); opacity: 0.49; filter: blur(129.5px); border-radius: 50%; pointer-events: none; z-index: 1;
}
.bg-glow-bottom-right {
  position: absolute; right: 4.64%; bottom: -18.13%; width: 450px; height: 450px;
  background: linear-gradient(120deg, #A1C4FD 0%, #C2E9FB 100%); opacity: 0.7; filter: blur(123px); border-radius: 50%; pointer-events: none; z-index: 1;
}
.bg-glow-top-right {
  position: absolute; right: 19.01%; top: -37.04%; width: 300px; height: 300px;
  background: linear-gradient(120deg, #A1C4FD 0%, #C2E9FB 100%); opacity: 0.7; filter: blur(123px); border-radius: 50%; pointer-events: none; z-index: 1;
}

/* ========== 顶部 Header ========== */
.page-header {
  position: relative; z-index: 2; display: flex; align-items: center; height: 67px; padding: 15px 20px;
  box-sizing: border-box; flex-shrink: 0; border-bottom: 1px solid #E2E9F0;
}
.page-title { font-family: 'PingFang SC'; font-weight: 500; font-size: 16px; color: #0B1C2C; }

/* ========== 主卡片 ========== */
.main-card {
  position: relative; z-index: 2; flex: 1; min-height: 0; display: flex; flex-direction: column; margin: 16px 12px 30px;
  background: #FFFFFF; border: 1px solid #DFE5EC; border-radius: 12px; box-shadow: 0 4px 16px rgba(11, 28, 44, 0.04); overflow: hidden;
}

/* ========== 卡片头部操作栏 ========== */
.card-header {
  display: flex; align-items: center; justify-content: space-between; height: 56px; padding: 0 20px;
  border-bottom: 1px solid #E2E9F0; flex-shrink: 0;
}
.btn-edit { font-size: 14px; color: #0278E7 !important; display: inline-flex; align-items: center; &:hover { color: #0267C7 !important; } }
.mr-1 { margin-right: 4px; }

/* ========== 左右分栏主体 ========== */
.content-body { flex: 1; min-height: 0; display: flex; }

/* 左侧树形导航 */
.left-tree { width: 260px; flex-shrink: 0; background: #FAFBFC; border-right: 1px solid #E2E9F0; padding: 16px 8px; overflow-y: auto; }
:deep(.el-tree) { background: transparent; }
:deep(.el-tree-node__content) { height: 36px; border-radius: 6px; margin-bottom: 2px; }
:deep(.el-tree-node__content:hover) { background-color: #F0F4F8; }
:deep(.el-tree-node.is-current > .el-tree-node__content) { background-color: transparent; }
.custom-tree-node { font-size: 14px; color: #667383; flex: 1; display: flex; align-items: center; padding: 0 8px; border-radius: 6px; transition: all 0.15s ease; }
.custom-tree-node.is-active {
  color: #0278E7; font-weight: 500; background: #E6F2FF; position: relative;
  &::before { content: ''; position: absolute; left: 0; top: 50%; transform: translateY(-50%); width: 3px; height: 14px; border-radius: 0 2px 2px 0; background: #0278E7; }
}

/* 右侧内容区 */
.right-content { flex: 1; min-width: 0; display: flex; flex-direction: column; }

/* Tabs 样式 */
.detail-tabs {
  padding: 0 20px; margin-bottom: 0 !important; flex-shrink: 0; border-bottom: 1px solid #E2E9F0;
  :deep(.el-tabs__nav-wrap::after) { display: none; }
  :deep(.el-tabs__item) { height: 48px; font-size: 14px; color: #667383; &.is-active { color: #0278E7; font-weight: 500; } }
  :deep(.el-tabs__active-bar) { background-color: #0278E7; }
}

/* 详情滚动区 */
.tab-content { flex: 1; min-height: 0; overflow-y: auto; padding: 20px; }

/* ========== 表单及详情样式 ========== */
.basic-info { padding-top: 4px; }
.section-title { display: flex; align-items: center; font-size: 15px; font-weight: 600; color: #0B1C2C; margin-bottom: 24px; }
.blue-bar { width: 3px; height: 14px; background-color: #0278E7; margin-right: 8px; border-radius: 2px; }

/* 技术能力筛选栏 */
.tech-filter-bar { display: flex; align-items: center; margin-bottom: 16px; }
.filter-label { font-size: 14px; font-weight: 500; color: #333; margin-right: 12px; }

:deep(.el-form-item__label) { font-size: 14px; color: #667383; }

/* 只读输入框样式 */
.readonly-input { width: 100%; max-width: 800px; }
:deep(.readonly-input .el-input__wrapper), :deep(.readonly-input .el-textarea__inner) {
  background-color: #F8FAFC !important; box-shadow: none !important; border-radius: 6px; color: #0B1C2C; font-size: 14px; padding: 4px 12px;
}
:deep(.readonly-input .el-textarea__inner) { padding: 8px 12px; line-height: 1.6; }

/* 编辑输入框样式 */
.editing-input { width: 100%; max-width: 800px; }

/* 带单位的输入框 */
.input-with-unit { display: flex; align-items: center; }
.unit { margin-left: 12px; font-size: 14px; color: #667383; }

/* 资产负债情况框 */
.asset-box {
  border: 1px solid #E2E9F0; border-radius: 8px; padding: 16px; display: flex; flex-direction: column;
  gap: 16px; width: 100%; max-width: 400px; background: #FAFBFC;
}
.asset-row { display: flex; align-items: center; }
.asset-label { width: 80px; font-size: 14px; color: #667383; text-align: right; margin-right: 16px; }

/* 营业执照 */
.upload-tip {
  font-size: 14px;
  color: #8D9AAF;
  margin: 12px 0;
}
.license-preview {
  margin-top: 12px;
}

/* 接口数据表格与编辑弹窗 */
.data-panel { padding-top: 4px; }
.data-panel :deep(.el-table) { width: 100%; border-radius: 8px; }

/* ========== 附件列表横向滚动 ========== */
.list-attachments {
  display: flex;
  flex-wrap: nowrap;
  overflow-x: auto;
  align-items: center;
  padding-bottom: 4px;
  
  &::-webkit-scrollbar { height: 6px; }
  &::-webkit-scrollbar-thumb { background: #dcdfe6; border-radius: 3px; }
  &::-webkit-scrollbar-track { background: transparent; }
}

/* 编辑抽屉内上传组件横向滚动 */
.upload-scroll-container {
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  padding-bottom: 6px;
  
  &::-webkit-scrollbar { height: 6px; }
  &::-webkit-scrollbar-thumb { background: #dcdfe6; border-radius: 3px; }
}

/* 覆盖 element-plus 的上传列表样式，强制不换行 */
.perf-uploader {
  :deep(.el-upload-list--picture-card) {
    display: flex;
    flex-wrap: nowrap;
    overflow: visible;
  }
  :deep(.el-upload--picture-card) {
    width: 60px;
    height: 60px;
    line-height: 60px;
    flex-shrink: 0;
    margin-right: 8px;
    border: none !important;
    background-color: transparent !important;
  }
  :deep(.el-upload-list--picture-card .el-upload-list__item) {
    width: 60px;
    height: 60px;
    margin: 0 8px 0 0;
    flex-shrink: 0;
  }
  :deep(.el-upload-list--picture-card .el-upload-list__item-thumbnail) {
    object-fit: cover;
  }
}

.add-row-btn {
  margin-top: 12px; text-align: center; border: 1px dashed #E2E9F0; border-radius: 4px; padding: 8px 0; cursor: pointer;
  &:hover { background-color: #F8FAFC; }
}

/* ========== 统一抽屉样式 ========== */
.custom-drawer {
  :deep(.el-drawer) {
    height: 100%;
  }
  :deep(.el-drawer__body) {
    padding: 0;
    display: flex;
    flex-direction: column;
    height: calc(100% - 55px); /* 减去 header 高度 */
  }
  .drawer-body {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
  }
  .drawer-footer {
    padding: 16px 20px;
    border-top: 1px solid #E2E9F0;
    text-align: right;
    background: #fff;
  }
}

/* ========== 无感输入框及表格样式重写 ========== */
.edit-table {
  /* 隐藏表格内部输入框自带的边框、阴影，让它和表格融为一体 */
  :deep(.no-border-input .el-input__wrapper),
  :deep(.no-border-input .el-textarea__inner) {
    box-shadow: none !important;
    background-color: transparent !important;
    padding: 0 4px;
  }
  :deep(.no-border-input .el-input__wrapper.is-focus) {
    box-shadow: 0 0 0 1px #0278E7 inset !important;
    background-color: #fff !important;
    border-radius: 2px;
  }
  
  :deep(.no-border-input .el-input-number) {
    width: 100%;
  }

  /* 日期选择器无感化 */
  :deep(.no-border-date-picker .el-input__wrapper) {
    box-shadow: none !important;
    background-color: transparent !important;
    padding: 0 4px;
  }
  :deep(.no-border-date-picker .el-input__wrapper.is-focus) {
    box-shadow: 0 0 0 1px #0278E7 inset !important;
    background-color: #fff !important;
    border-radius: 2px;
  }
  
  /* 覆盖 upload 卡片的默认样式，贴合原型图 */
  :deep(.el-upload--picture-card) {
    width: 40px !important;
    height: 40px !important;
    line-height: 40px !important;
  }
  :deep(.el-upload-list--picture-card .el-upload-list__item) {
    width: 40px !important;
    height: 40px !important;
  }
}
</style>