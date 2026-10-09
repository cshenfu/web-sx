<!-- components/area-panel/ProjectDetailPanel.vue -->
<!-- 选中某个区域/项目后展示的详情面板：标题栏 + 5 个主 tab + 对应内容。
     通过 @back 让父组件把面板切回 AreaListPanel/ProjectListPanel 的列表态。
     「勘测信息」板块的数据由本组件内部通过 getDataById 拉取。 -->
     <template>
      <section class="detail-panel">
        <button type="button" class="collapse-btn" title="返回列表" @click="$emit('back')">
          <svg viewBox="0 0 16 16" class="chevron"><path d="M10 3l-5 5 5 5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
    
        <header class="detail-header">
          <div class="header-left">
            <div class="project-name">{{ project.name }}</div>
            <div class="project-company">
              <svg viewBox="0 0 16 16" class="company-icon"><path d="M3 13.5V4l5-2 5 2v9.5M6 13.5v-3h4v3" fill="none" stroke="currentColor" stroke-width="1.1"/></svg>
              所属公司：{{ project.company || '-' }}
            </div>
          </div>
          <button type="button" class="report-btn" @click="$emit('generate-report')">
            <svg viewBox="0 0 16 16" class="report-icon"><rect x="3" y="2" width="10" height="12" rx="1" fill="none" stroke="currentColor" stroke-width="1.2"/><path d="M5.5 5.5h5M5.5 8h5M5.5 10.5h3" stroke="currentColor" stroke-width="1" stroke-linecap="round"/></svg>
            报告/函件生成
          </button>
        </header>
    
        <nav class="main-tabs">
          <button
            v-for="tab in mainTabs"
            :key="tab.key"
            type="button"
            class="main-tab"
            :class="{ active: activeTab === tab.key }"
            @click="activeTab = tab.key"
          >
            {{ tab.label }}
          </button>
        </nav>
    
        <div class="tab-content">
          <MainInfoTab v-if="activeTab === 'main'" :data="project.mainInfo" />
          <SurveyInfoTab
            v-else-if="activeTab === 'survey'"
            v-loading="surveyLoading"
            :data="surveyData"
            @add-data="handleSurveyAddData"
            @file-action="handleSurveyFileAction"
            @file-click="handleSurveyFileClick"
          />
          <SupportDocsTab
            v-else-if="activeTab === 'support'"
            :data="project.supportDocs"
            @add-data="$emit('support-add-data')"
            @file-action="(...args) => $emit('support-file-action', ...args)"
          />
          <ProjectReportTab
            v-else-if="activeTab === 'report'"
            :data="project.projectReport"
            @row-action="(row) => $emit('report-row-action', row)"
          />
          <ReviewInfoTab v-else-if="activeTab === 'review'" :data="project.reviewInfo" />
        </div>

        <AddDataDialog
          v-model:visible="addDialogVisible"
          :ai-project-id="project.id"
          :data-category="addDialogCategory"
          :section-title="addDialogTitle"
          :coordinate-list="dialogCoordinateList"
          :cft-point-list="dialogCftPointList"
          @success="refreshSurveyData"
        />
    
    
        <AddImageDialog
          v-model:visible="addImageDialogVisible"
          :tower-file-id="addImageTowerFileId"
          :tower-file-name="addImageTowerFileName"
          @success="refreshSurveyData"
        />
      </section>
    </template>
    
    <script setup>
    import { ref, watch, onMounted,computed } from 'vue'
    import { ElMessage, ElMessageBox } from 'element-plus'
    import MainInfoTab from './tabs/MainInfoTab.vue'
    import SurveyInfoTab from './tabs/SurveyInfoTab.vue'
    import SupportDocsTab from './tabs/SupportDocsTab.vue'
    import ProjectReportTab from './tabs/ProjectReportTab.vue'
    import ReviewInfoTab from './tabs/ReviewInfoTab.vue'
    import AddDataDialog from './AddDataDialog.vue'
    import AddImageDialog from './AddImageDialog.vue'
    import { getDataById, delItem } from '@/api/modules/newAPI'
    import { useRouter } from 'vue-router'
    
    const props = defineProps({
      project: { type: Object, required: true },
    })

    const router = useRouter()
    
    defineEmits([
      'back', 'generate-report',
      'survey-add-data', 'survey-file-action',
      'support-add-data', 'support-file-action',
      'report-row-action',
    ])
    
    const mainTabs = [
      { key: 'main', label: '主要信息' },
      { key: 'survey', label: '勘测信息' },
      { key: 'support', label: '支持性文件' },
      { key: 'report', label: '项目报告' },
      { key: 'review', label: '审查信息' },
    ]
    
    const activeTab = ref('main')
    
    // 5 个固定勘测板块（ACCESS_REPORT_INFO 目前无数据，跳过）
    const SURVEY_SECTIONS = [
      { key: 'terrain', title: '地形信息', dataCategory: 'TERRAIN' },
      { key: 'wind', title: '测风信息', dataCategory: 'WIND' },
      { key: 'environment', title: '环保数据', dataCategory: 'ENVIRONMENT' },
      { key: 'waterConservancy', title: '水保数据', dataCategory: 'WATER_CONSERVANCY' },
      { key: 'verification', title: '核查信息', dataCategory: 'VERIFICATION' },
    ]


    // fileTypeTag → 详情页 path
// 未列出的 tag（ERA5_DATA / WEATHER_STATION / VERIFICATION_FIlE / ACCESS_REPORT 等）先不跳转，后续补充
  const FILE_TAG_TO_PATH = {
    GEOLOGY_REPORT: '/hucang/geology/detail',
    SITE_TERRAIN_MAP: '/hucang/geology/detail',
    WIND_TOWER: '/hucang/windTower/detail',
    WIND_TOWER_IMAGE: '/hucang/windTower/detail',
    EIA_REPORT: '/hucang/environment/detail',
    SOIL_WATER_REPORT: '/hucang/waterConservayion/detail',
      // 后续补充：
    // ERA5_DATA: '/xxx/detail',
    // WEATHER_STATION: '/xxx/detail',
    // VERIFICATION_FIlE: '/xxx/detail',
    // VERIFICATION_FIlE: '/xxx/detail
    // ACCESS_REPORT: '/xxx/detail',
  }

  function handleSurveyFileClick(file) {
    const raw = file?._raw || file || {}
    const parseStatus = raw.parseStatus ?? file?.parseStatus

    // 非解析类（parseStatus 为 null/undefined/''）直接放行
    // 解析类：只有 SUCCESS 才允许跳转，其余状态提示等待
    const isParseType = parseStatus !== null && parseStatus !== undefined && parseStatus !== ''
    if (isParseType && parseStatus !== 'SUCCESS') {
      ElMessage.warning('请等待解析成功')
      return
    }

    const tag = raw.fileTypeTag || file?.tag
    const path = FILE_TAG_TO_PATH[tag]

    if (!path) {
      console.warn('[ProjectDetailPanel] 未配置跳转 path 的 fileTypeTag:', tag)
      return
    }

    router.push({
      path,
      query: { id: props.project.id },
    })
  }
    
    const surveyData = ref({ sections: [] })
    const surveyLoading = ref(false)
    
    const addDialogVisible = ref(false)
    const addDialogCategory = ref('')
    const addDialogTitle = ref('')
    
    const addImageDialogVisible = ref(false)
    const addImageTowerFileId = ref(null)
    const addImageTowerFileName = ref('')
    
    // parseStatus → 展示文案与配色
    const PARSE_STATUS_MAP = {
      UPLOADED: { text: '待解析', type: 'pending' },
      PARSING: { text: '解析中', type: 'running' },
      SUCCESS: { text: '解析成功', type: 'success' },
      FAILED: { text: '解析失败', type: 'failed' },
    }


    // 传给 AddDataDialog 用于测风塔校验的两个数组
    // - coordinateList：当前项目/场区的边界坐标
    // - cftPointList：当前已有的测风塔点位
    // 如果你能从 project 里拿到就填，否则留空数组，仅做项目级校验
    const dialogCoordinateList = computed(() => {
      // TODO：按你数据源填写，比如从 map / store / project.coordinate 解析
      return []
    })
    const dialogCftPointList = computed(() => {
      // TODO：按你数据源填写
      return []
    })
    
    // getDataById 返回 → SurveyInfoTab 需要的 sections
    function mapSurveyResponseToSections(raw) {
      const groups = Array.isArray(raw) ? raw : []
    
      // dataCategory → fileList
      const grouped = {}
      groups.forEach((g) => {
        grouped[g.dataCategory] = g.fileList || []
      })
    
      return SURVEY_SECTIONS.map((s) => ({
        key: s.key,
        title: s.title,
        files: (grouped[s.dataCategory] || []).map((item) => mapFileItem(item)),
        emptyText: '暂无数据~',
      }))
    }
    
    function mapFileItem(item) {
      const isWindTower =
        item.fileTypeTag === '测风塔' || item.fileTypeTag === 'WIND_TOWER'

      const actions = ['download']
      if (isWindTower) actions.push('addImage')
      actions.push('delete')

      const parse = PARSE_STATUS_MAP[item.parseStatus]

      return {
        id: item.id,
        name: item.fileName || '',
        tag: item.fileTypeTag || '',
        tag2: parse?.text || '',
        description: item.notes || '',
        updatedAt: item.createTime || item.updateTime || '',
        operator: item.creator || item.updater || '',
        filePath: item.filePath || '',
        fileSuffix: item.fileSuffix || '',
        parseStatus: item.parseStatus,
        // ⭐ 规范化 imageList：{fileName, filePath, fileSuffix}
        imageList: (item.imageList || [])
          .map((img) => ({
            id: img.id,
            fileName: img.fileName || '',
            filePath: img.filePath || '',
            fileSuffix: img.fileSuffix || '',
          }))
          .filter((img) => img.filePath),
        actions,
        _raw: item,
      }
    }
    
    async function refreshSurveyData() {
      if (!props.project?.id) return
      surveyLoading.value = true
      try {
        const res = await getDataById(props.project.id)
        surveyData.value = {
          sections: mapSurveyResponseToSections(res?.data ?? []),
        }
      } catch (err) {
        console.error('获取勘测数据失败:', err)
        // 兜底：至少渲染 5 个空板块，避免 SurveyInfoTab 崩
        surveyData.value = {
          sections: SURVEY_SECTIONS.map((s) => ({
            key: s.key,
            title: s.title,
            files: [],
            emptyText: '暂无数据~',
          })),
        }
      } finally {
        surveyLoading.value = false
      }
    }
    
    function handleSurveyAddData(sectionKey) {
      const section = SURVEY_SECTIONS.find((s) => s.key === sectionKey)
      if (!section) return
      addDialogCategory.value = section.dataCategory
      addDialogTitle.value = section.title
      addDialogVisible.value = true
    }
    
    function handleSurveyFileAction(action, file, sectionKey) {
      const raw = file?._raw || file || {}
      const fileId = raw.id ?? file?.id
      const filePath = raw.filePath || file?.filePath
    
      if (action === 'download') {
        if (!filePath) {
          ElMessage.warning('该文件缺少下载路径')
          return
        }
        window.open(filePath, '_blank')
        return
      }
    
      if (action === 'addImage') {
        if (!fileId) return
        addImageTowerFileId.value = fileId
        addImageTowerFileName.value = raw.fileName || file?.name || ''
        addImageDialogVisible.value = true
        return
      }
    
      if (action === 'delete') {
        if (!fileId) return
        ElMessageBox.confirm('确认删除该文件吗？', '提示', {
          type: 'warning',
          confirmButtonText: '确定',
          cancelButtonText: '取消',
        })
          .then(async () => {
            await delItem(fileId)
            ElMessage.success('删除成功')
            refreshSurveyData()
          })
          .catch(() => {})
        return
      }
    
      if (action === 'edit') {
        ElMessage.info('编辑功能待接入')
      }
    }
    
    onMounted(refreshSurveyData)
    watch(
      () => props.project?.id,
      (id) => { if (id) refreshSurveyData() }
    )
    </script>
    
    <style scoped>
    .detail-panel {
      position: relative;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      width: clamp(420px, 34vw, 620px);
      max-height: 100%;
      border: 1px solid rgba(90, 201, 255, 0.7);
      border-radius: 6px;
      color: #d9f5ff;
      background:
        linear-gradient(180deg, rgba(7, 44, 78, 0.96), rgba(3, 22, 48, 0.97)),
        rgba(3, 22, 48, 0.95);
      box-shadow:
        0 0 0 1px rgba(42, 159, 255, 0.15) inset,
        0 10px 28px rgba(0, 0, 0, 0.35);
    }
    
    .collapse-btn {
      position: absolute;
      top: 50%;
      left: -14px;
      z-index: 5;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 44px;
      border: 1px solid rgba(90, 201, 255, 0.7);
      border-radius: 4px;
      cursor: pointer;
      color: #9bdfff;
      background: rgba(3, 22, 48, 0.9);
      transform: translateY(-50%);
    }
    
    .chevron {
      width: 14px;
      height: 14px;
    }
    
    .detail-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      padding: 16px 20px 12px;
      border-bottom: 1px solid rgba(118, 213, 255, 0.18);
    }
    
    .project-name {
      color: #fff;
      font-size: 17px;
      font-weight: 600;
    }
    
    .project-company {
      display: flex;
      align-items: center;
      gap: 5px;
      margin-top: 6px;
      color: #52c1ff;
      font-size: 12px;
    }
    
    .company-icon {
      width: 12px;
      height: 12px;
    }
    
    .report-btn {
      display: inline-flex;
      flex-shrink: 0;
      align-items: center;
      gap: 5px;
      padding: 7px 12px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      color: #fff;
      background: #2f8dff;
      font-size: 12px;
      white-space: nowrap;
    }
    
    .report-icon {
      width: 12px;
      height: 12px;
    }
    
    .main-tabs {
      display: flex;
      padding: 0 20px;
      border-bottom: 1px solid rgba(118, 213, 255, 0.18);
    }
    
    .main-tab {
      padding: 12px 14px;
      border: none;
      background: none;
      color: #9bdfff;
      font-size: 13px;
      cursor: pointer;
      border-bottom: 2px solid transparent;
      white-space: nowrap;
    }
    
    .main-tab.active {
      color: #52c1ff;
      border-bottom-color: #52c1ff;
      font-weight: 600;
    }
    
    .tab-content {
      flex: 1;
      min-height: 0;
      overflow-y: auto;
    }
    </style>