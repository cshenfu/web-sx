import { ref } from 'vue'

/**
 * 页面级报告流程控制器。
 * 报告入口统一收敛在这里，调用方只描述“要打开什么”，
 * 不再分别维护报告面板的开关和参数拼装。
 */
const REPORT_CONFIG = {
  PROJECT_PROPOSAL: { packageType: 'default', maxStep: 1, title: '一键生成项目建议书' },
  FEASIBILITY_STUDY: { packageType: 'default', maxStep: 2, title: '一键生成风电场可行性研究报告' },
  COMPETITIVE_ALLOCATION: { packageType: 'default', maxStep: 2, title: '一键生成竞配申报报告' },
  PROJECT_INITIATION: { packageType: 'default', maxStep: 2, title: '一键生成请示文件' },
  POST_EVALUATION: { packageType: 'default', maxStep: 2, title: '一键生成后评价报告' },
}

const WIZARD_KEYS = new Set(['PROJECT_PROPOSAL', 'POST_EVALUATION'])

function getReportConfig(subTab) {
  return REPORT_CONFIG[subTab] || REPORT_CONFIG.FEASIBILITY_STUDY
}

export function useReportPanelController(packageType) {
  const showGeneratePanel = ref(false)
  const generatePanelProject = ref(null)
  const generatePanelActionKey = ref('')
  const generatePanelSubCode = ref('')
  const generatePanelSource = ref('')
  const generatePanelFirstBusinessTitle = ref('')
  const generatePanelSecondaryBusinessTitle = ref('')
  const generatePanelFileTypeTag = ref('')

  const showAddReportPanel = ref(false)
  const showConfirmPanel = ref(false)
  const confirmReportId = ref(null)

  const wizardVisible = ref(false)
  const wizardMode = ref(packageType.default)
  const wizardTitleLabel = ref('')
  const wizardMaxStep = ref(2)
  const wizardReportSubTab = ref('')

  function openGeneratePanel(options = {}) {
    generatePanelProject.value = options.project || null
    generatePanelActionKey.value = options.actionKey || ''
    generatePanelSubCode.value = options.subCode || ''
    generatePanelSource.value = options.source || 'sitemap-detail'
    generatePanelFirstBusinessTitle.value = options.firstBusinessTitle || ''
    generatePanelSecondaryBusinessTitle.value = options.secondaryBusinessTitle || ''
    generatePanelFileTypeTag.value = options.fileTypeTag || ''
    showGeneratePanel.value = true
  }

  function openGenerateFromReportTab(payload, options = {}, fallbackProject = null) {
    openGeneratePanel({
      project: payload?.project || fallbackProject,
      actionKey: options.actionKey,
      source: 'report-tab',
      firstBusinessTitle: options.firstBusinessTitle,
      fileTypeTag: options.fileTypeTag,
    })
  }

  function openCompetitivePanel(project, fallbackProject = null) {
    openGeneratePanel({
      project: project || fallbackProject,
      actionKey: 'bidding',
      source: 'competitive-modal',
    })
  }

  function openAddReport() {
    showAddReportPanel.value = true
  }

  function openConfirm(reportId) {
    confirmReportId.value = reportId
    showConfirmPanel.value = true
  }

  function openWizard(subTab) {
    const config = getReportConfig(subTab)
    wizardMode.value = packageType[config.packageType] || packageType.default
    wizardTitleLabel.value = config.title
    wizardMaxStep.value = config.maxStep
    wizardReportSubTab.value = subTab
    wizardVisible.value = true
  }

  function dispatchCreateReport(payload, fallbackProject = null, beforeOpen) {
    if (!payload?.subTab) return
    const subTab = payload.subTab
    const project = payload.project || fallbackProject
    const stage = project?.projectStage || project?.stage || ''

    if (subTab === 'COMPETITIVE_ALLOCATION') {
      beforeOpen?.('generate')
      return openGenerateFromReportTab(payload, { actionKey: 'bidding' }, fallbackProject)
    }
    if (subTab === 'FEASIBILITY_STUDY') {
      beforeOpen?.('generate')
      return openGenerateFromReportTab(payload, {
        actionKey: 'gen-report',
        fileTypeTag: '可研审查报告',
        firstBusinessTitle: 'PROJECT_FEASIBILITY_MATERIALS',
      }, fallbackProject)
    }
    if (subTab === 'PROJECT_INITIATION') {
      beforeOpen?.('generate')
      return openGenerateFromReportTab(payload, stage === 'INVESTMENT_DECISION'
        ? {
            actionKey: 'gen-invest-letter',
            fileTypeTag: '投资决策请示函',
            firstBusinessTitle: 'INVESTMENT_DECISION_MATERIALS',
          }
        : {
            actionKey: 'gen-letter',
            fileTypeTag: '立项请示函',
            firstBusinessTitle: 'PROJECT_INITIATION_MATERIALS',
          }, fallbackProject)
    }

    if (WIZARD_KEYS.has(subTab)) {
      beforeOpen?.('wizard')
      return openWizard(subTab)
    }
    beforeOpen?.('wizard')
    return openWizard(subTab)
  }

  function closeWizard() {
    wizardVisible.value = false
    wizardTitleLabel.value = ''
    wizardMaxStep.value = 2
    wizardReportSubTab.value = ''
  }

  return {
    showGeneratePanel,
    generatePanelProject,
    generatePanelActionKey,
    generatePanelSubCode,
    generatePanelSource,
    generatePanelFirstBusinessTitle,
    generatePanelSecondaryBusinessTitle,
    generatePanelFileTypeTag,
    showAddReportPanel,
    showConfirmPanel,
    confirmReportId,
    wizardVisible,
    wizardMode,
    wizardTitleLabel,
    wizardMaxStep,
    wizardReportSubTab,
    openGeneratePanel,
    openGenerateFromReportTab,
    openCompetitivePanel,
    openAddReport,
    openConfirm,
    openWizard,
    dispatchCreateReport,
    closeWizard,
  }
}
