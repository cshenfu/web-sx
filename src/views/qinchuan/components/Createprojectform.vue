<template>
    <aside class="create-project-form">
      <div class="cp-header">
        <span class="cp-title">创建项目</span>
  
        <div class="cp-header-actions">
          <el-button size="small" @click="handleCancel">
            取消
          </el-button>
  
          <el-button
            type="primary"
            size="small"
            :loading="submitting"
            @click="handleSave"
          >
            保存
          </el-button>
        </div>
      </div>
  
      <div class="cp-body">
        <el-form
          label-position="top"
          size="default"
          class="cp-form"
        >
          <!-- 项目类型 -->
          <el-form-item label="项目类型" required>
            <el-radio-group v-model="form.itemType">
              <el-radio label="FD">
                风电
              </el-radio>
  
              <el-radio label="GF">
                光伏
              </el-radio>
            </el-radio-group>
          </el-form-item>
  
          <!-- 项目编号 -->
          <el-form-item label="项目编号" required>
            <el-input
              v-model="form.projectCode"
              placeholder="请输入"
            />
          </el-form-item>
  
          <!-- 项目名称 -->
          <el-form-item label="项目名称" required>
            <el-input
              v-model="form.projectName"
              placeholder="请输入"
            />
          </el-form-item>
  
          <!-- 项目阶段 -->
          <el-form-item label="项目阶段" required>
            <el-select
              v-model="form.projectStage"
              placeholder="请选择"
              :loading="stageLoading"
              style="width: 100%"
            >
              <el-option
                v-for="opt in projectStageOptions"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </el-select>
          </el-form-item>
  
          <!-- 场区范围 -->
          <el-form-item label="场区范围" required>
            <el-radio-group v-model="form.siteRangeMode">
              <el-radio label="upload">
                上传坐标
              </el-radio>
  
              <el-radio label="draw">
                在线绘制
              </el-radio>
            </el-radio-group>
  
            <template v-if="form.siteRangeMode === 'draw'">
              <p class="cp-tip">
                说明：请在左侧地图进行绘制场区范围，目前最大支持半径25km的范围。
              </p>
  
              <p
                v-if="siteRangePoints.length"
                class="cp-tip cp-tip-success"
              >
                已获取场区范围坐标（{{ siteRangePoints.length }} 个点），可点击地图左上角“保存”确认。
              </p>
            </template>
  
            <template v-else>
              <OmniUploader
                v-model="siteRangeFileModel"
                accept=".xlsx,.kmz,.kml,.ovkml"
                biz-type="场区范围"
                button-text="上传数据"
                :user-name="userName"
                :show-progress="true"
                @success="handleSiteRangeUploadSuccess"
                @remove="handleSiteRangeUploadRemove"
                @error="handleUploadError"
              />
  
              <p class="cp-tip">
                说明：支持xlsx/kmz/kml/ovkml格式数据，xlsx数据需
                <span
                  class="cp-link"
                  @click="downloadTemplate('siteRange')"
                >
                  下载数据模板
                </span>
              </p>
            </template>
          </el-form-item>
  
          <!-- 风机点位 -->
          <el-form-item label="风机点位">
            <el-radio-group v-model="form.windTurbineMode">
              <el-radio label="has">
                有
              </el-radio>
  
              <el-radio label="none">
                暂无
              </el-radio>
            </el-radio-group>
  
            <template v-if="form.windTurbineMode === 'has'">
              <OmniUploader
                v-model="windTurbineFileModel"
                accept=".xlsx,.kmz,.kml,.ovkml"
                biz-type="风机点位"
                button-text="上传数据"
                :user-name="userName"
                :show-progress="true"
                @success="handleWindTurbineUploadSuccess"
                @remove="handleWindTurbineUploadRemove"
                @error="handleUploadError"
              />
  
              <p class="cp-tip">
                说明：支持xlsx/kmz/kml/ovkml格式数据，xlsx数据需
                <span
                  class="cp-link"
                  @click="downloadTemplate('windTurbine')"
                >
                  下载数据模板
                </span>
              </p>
            </template>
          </el-form-item>
  
          <!-- 升压站位置 -->
          <el-form-item label="升压站位置">
            <el-radio-group v-model="form.boosterMode">
              <el-radio label="has">
                有
              </el-radio>
  
              <el-radio label="none">
                暂无
              </el-radio>
            </el-radio-group>
  
            <template v-if="form.boosterMode === 'has'">
              <div class="booster-toolbar">
                <el-select
                  v-model="boosterEntryMode"
                  size="small"
                  style="width: 96px"
                >
                  <el-option
                    label="手动录入"
                    value="manual"
                  />
                </el-select>
  
                <div class="booster-tabs">
                  <span
                    v-for="(point, idx) in boosterPoints"
                    :key="idx"
                    class="booster-tab"
                    :class="{ active: idx === activeBoosterIndex }"
                    @click="activeBoosterIndex = idx"
                  >
                    {{ idx + 1 }}
                  </span>
  
                  <span
                    class="booster-tab booster-tab-add"
                    title="添加升压站点位"
                    @click="addBoosterPoint"
                  >
                    +
                  </span>
                </div>
  
                <span class="booster-caption">
                  个升压站点位
                </span>
  
                <el-radio-group
                  v-model="activeBoosterPoint.placement"
                  size="small"
                  class="booster-placement"
                >
                  <el-radio-button label="center">
                    中心点
                  </el-radio-button>
  
                  <el-radio-button label="closure">
                    封闭区域
                  </el-radio-button>
                </el-radio-group>
  
                <el-select
                  v-model="activeBoosterPoint.isBest"
                  size="small"
                  style="width: 84px"
                >
                  <el-option
                    label="最优"
                    :value="1"
                  />
  
                  <el-option
                    label="非最优"
                    :value="0"
                  />
                </el-select>
              </div>
  
              <div class="booster-coord-row">
                <el-input
                  v-model="activeBoosterPoint.lng"
                  placeholder="请输入经度"
                />
  
                <el-input
                  v-model="activeBoosterPoint.lat"
                  placeholder="请输入纬度"
                />
  
                <el-icon
                  v-if="boosterPoints.length > 1"
                  class="booster-remove"
                  title="删除该点位"
                  @click="removeBoosterPoint(activeBoosterIndex)"
                >
                  <Close />
                </el-icon>
              </div>
            </template>
          </el-form-item>
  
          <!-- 接入站位置 -->
          <el-form-item label="接入站位置">
            <el-radio-group v-model="form.accessMode">
              <el-radio label="has">
                有
              </el-radio>
  
              <el-radio label="none">
                暂无
              </el-radio>
            </el-radio-group>
  
            <template v-if="form.accessMode === 'has'">
              <div class="cp-subfield">
                <span class="cp-subfield-label">
                  拟接入变电站名称
                </span>
  
                <el-input
                  v-model="form.accessName"
                  placeholder="请输入拟接入的变电站名称"
                />
              </div>
  
              <div class="cp-subfield">
                <span class="cp-subfield-label">
                  拟接入变电站位置
                </span>
  
                <div class="cp-inline-row">
                  <el-input
                    v-model="form.accessLng"
                    placeholder="请输入经度"
                  />
  
                  <el-input
                    v-model="form.accessLat"
                    placeholder="请输入纬度"
                  />
                </div>
              </div>
  
              <div class="cp-subfield">
                <span class="cp-subfield-label">
                  送出工程接入方式
                </span>
  
                <el-radio-group v-model="form.sendOutType">
                  <el-radio :label="1">
                    架空线路
                  </el-radio>
  
                  <el-radio :label="2">
                    电缆铺设
                  </el-radio>
                </el-radio-group>
              </div>
            </template>
          </el-form-item>
  
          <!-- 项目备注 -->
          <el-form-item label="项目备注">
            <el-input
              v-model="form.notes"
              type="textarea"
              :rows="3"
              placeholder="请输入"
            />
          </el-form-item>
        </el-form>
      </div>
    </aside>
  </template>
  
  <script setup>
  import {
    reactive,
    ref,
    computed,
    watch,
    onMounted,
    onUnmounted
  } from 'vue'
  import { ElMessage } from 'element-plus'
  import { Close } from '@element-plus/icons-vue'
  
  import OmniUploader from '@/components/upload/Upload2.vue'
  import * as api from '@/api/modules/project'
  
  import {
    parseSiteRangeFile,
    parseWindTurbineFile
  } from '../js/parseCoordinateFile'
  
  import {
    resolveRegionByPoints,
    isPolygonWithinRadius
  } from '../js/useTiandituGeocode'
  
  const MAX_SITE_RANGE_RADIUS_KM = 25
  
  const props = defineProps({
    // 父组件中的 MapGL ref 对象本身，不是 mapRef.value
    mapRef: {
      type: Object,
      required: true
    }
  })
  
  const emit = defineEmits([
    'cancel',
    'saved'
  ])
  
  const userName = sessionStorage.getItem('userName') || ''
  const submitting = ref(false)
  const stageLoading = ref(false)
  
  const projectStageOptions = ref([])
  
  const form = reactive({
    itemType: 'FD',
    projectCode: '',
    projectName: '',
    projectStage: '',
  
    siteRangeMode: 'draw',
  
    windTurbineMode: 'none',
  
    boosterMode: 'none',
  
    accessMode: 'none',
    accessName: '',
    accessLng: '',
    accessLat: '',
    sendOutType: 1,
  
    notes: ''
  })

  async function loadProjectStages() {
    stageLoading.value = true

    try {
      // getStageList 不需要传参数。
      const response = await api.getStageList()

      /*
       * 同时兼容两种请求封装：
       *
       * 1. 直接返回：{ code: 200, data: [...] }
       * 2. 返回 AxiosResponse：
       *    { data: { code: 200, data: [...] } }
       */
      const body =
        response?.data &&
        !Array.isArray(response.data) &&
        Array.isArray(response.data.data)
          ? response.data
          : response

      if (
        body?.code !== undefined &&
        Number(body.code) !== 200
      ) {
        throw new Error(
          body.msg || '获取项目阶段失败'
        )
      }

      const list = Array.isArray(body?.data)
        ? body.data
        : []

      projectStageOptions.value = list
        .map((item) => ({
          value: String(item.code || '').trim(),
          label: String(item.desc || item.code || '').trim()
        }))
        .filter((item) => item.value && item.label)
    } catch (err) {
      projectStageOptions.value = []

      ElMessage.error(
        err?.message || '获取项目阶段失败，请稍后重试'
      )
    } finally {
      stageLoading.value = false
    }
  }
  
  /* 场区范围 */
  const siteRangePoints = ref([])
  const siteRangeFileModel = ref(null)
  const siteRangeFileDto = ref(null)
  
  /* 风机点位 */
  const windTurbineFileModel = ref(null)
  const windTurbineFileDto = ref(null)
  const windTurbinePoints = ref([])
  
  /* 升压站位置 */
  const boosterEntryMode = ref('manual')
  
  const createBoosterPoint = () => ({
    lng: '',
    lat: '',
    isBest: 0,
    placement: 'center'
  })
  
  const boosterPoints = ref([
    createBoosterPoint()
  ])
  
  const activeBoosterIndex = ref(0)
  
  const activeBoosterPoint = computed(() => {
    return boosterPoints.value[activeBoosterIndex.value]
  })
  
  function addBoosterPoint() {
    boosterPoints.value.push(createBoosterPoint())
    activeBoosterIndex.value = boosterPoints.value.length - 1
  }
  
  function removeBoosterPoint(idx) {
    if (boosterPoints.value.length <= 1) {
      return
    }
  
    boosterPoints.value.splice(idx, 1)
  
    activeBoosterIndex.value = Math.min(
      activeBoosterIndex.value,
      boosterPoints.value.length - 1
    )
  }
  
  /* 地图绘制 */
  let unbindDrawCreate = null
  let boundDrawMap = null
  let currentDrawFeatureId = null
  const isDrawing = ref(false)
  
  function bindDrawEvents() {
    const map = props.mapRef?.value?.getMap?.()
    const draw = props.mapRef?.value?.getDraw?.()
  
    if (!map || !draw || boundDrawMap === map) {
      return
    }

    if (boundDrawMap && unbindDrawCreate) {
      unbindDrawCreate()
      unbindDrawCreate = null
    }
  
    const handleDrawCreate = (event) => {
      const feature = event?.features?.[0]
  
      if (!feature || feature.geometry?.type !== 'Polygon') {
        return
      }
  
      if (!isPolygonWithinRadius(feature, MAX_SITE_RANGE_RADIUS_KM)) {
        draw.delete(feature.id)
        currentDrawFeatureId = null
        isDrawing.value = false
  
        ElMessage.warning(
          `绘制范围超出限制，目前最大支持半径${MAX_SITE_RANGE_RADIUS_KM}km的范围`
        )
  
        return
      }
  
      // 一次只允许一个场区范围面
      const all = draw.getAll()
      const others = all.features.filter((item) => {
        return item.id !== feature.id
      })
  
      others.forEach((item) => {
        draw.delete(item.id)
      })

      currentDrawFeatureId = feature.id
      isDrawing.value = false
    }
  
    map.on('draw.create', handleDrawCreate)
    boundDrawMap = map
  
    unbindDrawCreate = () => {
      map.off('draw.create', handleDrawCreate)
      boundDrawMap = null
    }
  }
  
  function startPolygonDrawing() {
    bindDrawEvents()

    const draw = props.mapRef?.value?.getDraw?.()

    if (!draw) {
      ElMessage.warning('地图尚未加载完成')
      return
    }

    props.mapRef?.value?.clearEditableAreas?.()
    siteRangePoints.value = []
    currentDrawFeatureId = null
    isDrawing.value = true
    draw?.changeMode('draw_polygon')
  }

  function enterDrawMode() {
    startPolygonDrawing()
  }
  
  function handleMapDrawSave() {
    const result = props.mapRef?.value?.getEditableAreas?.()
  
    const feature = result?.features?.find((item) => {
      return item.id === currentDrawFeatureId &&
        item.geometry?.type === 'Polygon'
    }) || result?.features?.find((item) => {
      return item.geometry?.type === 'Polygon'
    })
  
    if (!feature) {
      ElMessage.warning('请先在地图上绘制场区范围')
      return
    }
  
    const ring = feature.geometry?.coordinates?.[0] || []
  
    siteRangePoints.value = ring
      .map(([lng, lat]) => ({
        lng,
        lat
      }))
      .filter((point) => {
        return Number.isFinite(Number(point.lng)) &&
          Number.isFinite(Number(point.lat))
      })
  
    isDrawing.value = false
    currentDrawFeatureId = feature.id || currentDrawFeatureId
    ElMessage.success('场区范围已保存')
  }
  
  function handleMapDrawClear() {
    props.mapRef?.value?.clearEditableAreas?.()
    siteRangePoints.value = []
    currentDrawFeatureId = null
    isDrawing.value = false
  }
  
  watch(
    () => form.siteRangeMode,
    (mode) => {
      if (mode === 'draw') {
        props.mapRef?.value?.clearEditableAreas?.()
        siteRangePoints.value = []
        currentDrawFeatureId = null
        startPolygonDrawing()
      } else {
        props.mapRef?.value?.clearEditableAreas?.()
        siteRangePoints.value = []
        currentDrawFeatureId = null
        isDrawing.value = false
      }
    }
  )
  
  watch(
    () => props.mapRef?.value,
    (mapInstance) => {
      if (mapInstance) {
        bindDrawEvents()
      }
    },
    { immediate: true }
  )

  onMounted(() => {
    bindDrawEvents()
    loadProjectStages()
  })
  
  onUnmounted(() => {
    unbindDrawCreate?.()
  })
  
  /* 场区范围上传 */
  async function handleSiteRangeUploadSuccess(dto, file) {
    siteRangeFileDto.value = {
      ...dto
    }
  
    try {
      const points = await parseSiteRangeFile(file)
  
      siteRangePoints.value = points
  
      // 回显到地图上
      props.mapRef?.value?.loadEditableAreas?.({
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'Polygon',
              coordinates: [
                points.map((point) => [
                  Number(point.lng),
                  Number(point.lat)
                ])
              ]
            }
          }
        ]
      })
  
      ElMessage.success('场区范围文件解析成功')
    } catch (err) {
      ElMessage.error(
        `场区范围文件解析失败：${err?.message || '文件内容无法解析'}`
      )
  
      siteRangePoints.value = []
    }
  }
  
  function handleSiteRangeUploadRemove() {
    siteRangeFileDto.value = null
    siteRangePoints.value = []
    currentDrawFeatureId = null
  
    props.mapRef?.value?.clearEditableAreas?.()
  }
  
  /* 风机点位上传 */
  async function handleWindTurbineUploadSuccess(dto, file) {
    windTurbineFileDto.value = {
      ...dto
    }
  
    try {
      const points = await parseWindTurbineFile(file)
  
      windTurbinePoints.value = points.map((point) => ({
        lng: Number(point.lng),
        lat: Number(point.lat),
        isAlternative: Number(point.isAlternative || 0)
      }))
  
      ElMessage.success('风机点位文件解析成功')
    } catch (err) {
      ElMessage.error(
        `风机点位文件解析失败：${err?.message || '文件内容无法解析'}`
      )
  
      windTurbinePoints.value = []
    }
  }
  
  function handleWindTurbineUploadRemove() {
    windTurbineFileDto.value = null
    windTurbinePoints.value = []
  }
  
  function handleUploadError(err) {
    ElMessage.error(
      `上传失败：${err?.message || '请稍后重试'}`
    )
  }
  
  function downloadTemplate(type) {
    // TODO：替换为实际的模板下载接口
    ElMessage.info(`下载 ${type} 数据模板`)
  }
  
  /* 表单校验 */
  function validate() {
    if (!form.projectCode.trim()) {
      return '请输入项目编号'
    }
  
    if (!form.projectName.trim()) {
      return '请输入项目名称'
    }
  
    if (!form.projectStage) {
      return '请选择项目阶段'
    }
  
    if (form.siteRangeMode === 'draw' && !siteRangePoints.value.length) {
      return '请在地图上绘制场区范围，并点击“保存”'
    }
  
    if (form.siteRangeMode === 'upload' && !siteRangePoints.value.length) {
      return '请上传场区范围数据'
    }
  
    if (
      form.windTurbineMode === 'has' &&
      !windTurbinePoints.value.length
    ) {
      return '请上传风机点位数据'
    }
  
    if (form.boosterMode === 'has') {
      const invalid = boosterPoints.value.some((point) => {
        return (
          !point.lng ||
          !point.lat ||
          !Number.isFinite(Number(point.lng)) ||
          !Number.isFinite(Number(point.lat))
        )
      })
  
      if (invalid) {
        return '请完整填写升压站点位经纬度'
      }
    }
  
    if (form.accessMode === 'has') {
      if (!form.accessName.trim()) {
        return '请输入拟接入变电站名称'
      }
  
      if (
        !form.accessLng ||
        !form.accessLat ||
        !Number.isFinite(Number(form.accessLng)) ||
        !Number.isFinite(Number(form.accessLat))
      ) {
        return '请输入拟接入变电站位置经纬度'
      }
    }
  
    return ''
  }
  
  /* 组装文件集合 */
  function buildFileCollection() {
    const list = []
  
    if (siteRangeFileDto.value) {
      list.push({
        fileBusinessType: '场区范围',
  
        // 接口文档要求：手动上传文件使用前端 UUID
        fileId: crypto.randomUUID(),
  
        fileName: siteRangeFileDto.value.fileName,
  
        filePath:
          siteRangeFileDto.value.filePath ||
          siteRangeFileDto.value.objectKey,
  
        fileSuffix: siteRangeFileDto.value.fileSuffix
      })
    }
  
    if (windTurbineFileDto.value) {
      list.push({
        fileBusinessType: '风机点位',
        fileId: crypto.randomUUID(),
  
        fileName: windTurbineFileDto.value.fileName,
  
        filePath:
          windTurbineFileDto.value.filePath ||
          windTurbineFileDto.value.objectKey,
  
        fileSuffix: windTurbineFileDto.value.fileSuffix
      })
    }
  
    return list
  }
  
  /* 提交 */
  async function handleSave() {
    console.warn('[CREATE-PROJECT-V2] handleSave entered')

    const errorMsg = validate()
  
    if (errorMsg) {
      ElMessage.warning(errorMsg)
      return
    }
  
    submitting.value = true
  
    try {
      // 根据场区范围质心获取省、市、区编码和详细地址
      const region = await resolveRegionByPoints(
        siteRangePoints.value
      )
  
      console.warn(
        '[CREATE-PROJECT-V2] region returned:',
        region
      )

      const regionPayload = {
        province: String(region.provinceCode || '').trim(),
        city: String(region.cityCode || '').trim(),
        district: String(region.districtCode || '').trim(),
        provinceName: String(region.provinceName || '').trim(),
        cityName: String(region.cityName || '').trim(),
        districtName: String(region.districtName || '').trim(),
        address: String(region.address || '').trim()
      }

      if (!regionPayload.province || !regionPayload.city) {
        throw new Error('无法根据场区坐标识别省、市行政区划编码')
      }

      if (!region.regionCode) {
        throw new Error('无法根据场区坐标识别行政区编码')
      }
  
      const payload = {
        itemType: form.itemType,
        projectCode: form.projectCode.trim(),
        projectName: form.projectName.trim(),
        projectStage: form.projectStage,
  
        // 字段名仍然是 province/city/district，
        // 这里传行政区划 code，不传名称。
        province: regionPayload.province,
        city: regionPayload.city,
        district: regionPayload.district,
  
        // 省、市、区名称
        province_name: regionPayload.provinceName,
        city_name: regionPayload.cityName,
        district_name: regionPayload.districtName,

        // 天地图返回的最详细地址
        address: regionPayload.address,
  
        coordinate: siteRangePoints.value.map((point) => ({
          longitude: String(point.lng),
          latitude: String(point.lat),
          regionCode: Number(region.regionCode)
        })),
  
        windTurbinePoints:
          form.windTurbineMode === 'has'
            ? windTurbinePoints.value.map((point) => ({
                longitude: Number(point.lng),
                latitude: Number(point.lat),
                isAlternative: Number(point.isAlternative || 0)
              }))
            : [],
  
        boosterStationLocations:
          form.boosterMode === 'has'
            ? boosterPoints.value.map((point) => ({
                lng: Number(point.lng),
                lat: Number(point.lat),
                isBest: Number(point.isBest || 0)
              }))
            : [],
  
        accessSubstationName:
          form.accessMode === 'has'
            ? form.accessName.trim()
            : undefined,
  
        accessSubstationPoints:
          form.accessMode === 'has'
            ? [
                {
                  lng: Number(form.accessLng),
                  lat: Number(form.accessLat)
                }
              ]
            : [],
  
        sendOutType:
          form.accessMode === 'has'
            ? Number(form.sendOutType)
            : undefined,
  
        fileCollection: buildFileCollection(),
  
        notes: form.notes
      }
  
      console.warn(
        '[CREATE-PROJECT-V2] final payload:',
        JSON.stringify(payload, null, 2)
      )

      await api.createProject(payload)
  
      ElMessage.success('项目创建成功')
  
      emit('saved', payload)
    } catch (err) {
      ElMessage.error(
        err?.message || '保存失败，请稍后重试'
      )
    } finally {
      submitting.value = false
    }
  }
  
  function handleCancel() {
    props.mapRef?.value?.clearEditableAreas?.()
    emit('cancel')
  }
  
  defineExpose({
    startPolygonDrawing,
    handleMapDrawSave,
    handleMapDrawClear,
    isDrawing
  })
  </script>
  
  <style scoped>
  .create-project-form {
    display: flex;
    flex-direction: column;
    flex: 0 0 380px;
    width: 380px;
    height: 100%;
    background: #fff;
    border-left: 1px solid #ebeef5;
    box-shadow: -4px 0 16px rgba(0, 0, 0, 0.06);
  }
  
  .cp-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 48px;
    padding: 0 18px;
    border-bottom: 1px solid #ebeef5;
    flex-shrink: 0;
  }
  
  .cp-title {
    color: #303133;
    font-size: 14px;
    font-weight: 600;
  }
  
  .cp-header-actions {
    display: flex;
    gap: 8px;
  }
  
  .cp-body {
    flex: 1;
    overflow-y: auto;
    padding: 16px 18px 24px;
  }
  
  .cp-tip {
    margin-top: 6px;
    color: #a0a5ad;
    font-size: 11px;
    line-height: 1.6;
  }
  
  .cp-tip-success {
    color: #24b26b;
  }
  
  .cp-link {
    color: #1677ff;
    cursor: pointer;
  }
  
  .cp-subfield {
    margin-top: 12px;
  }
  
  .cp-subfield-label {
    display: block;
    margin-bottom: 6px;
    color: #606266;
    font-size: 12px;
  }
  
  .cp-inline-row {
    display: flex;
    gap: 8px;
  }
  
  .booster-toolbar {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    margin-top: 4px;
  }
  
  .booster-tabs {
    display: flex;
    gap: 4px;
  }
  
  .booster-tab {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    color: #606266;
    font-size: 12px;
    background: #f5f7fa;
    border: 1px solid #dcdfe6;
    border-radius: 3px;
    cursor: pointer;
  }
  
  .booster-tab.active {
    color: #fff;
    background: #1677ff;
    border-color: #1677ff;
  }
  
  .booster-tab-add {
    color: #1677ff;
    font-weight: 600;
  }
  
  .booster-caption {
    color: #909399;
    font-size: 12px;
  }
  
  .booster-coord-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 10px;
  }
  
  .booster-remove {
    color: #c0c4cc;
    cursor: pointer;
    flex-shrink: 0;
  }
  
  .booster-remove:hover {
    color: #f56c6c;
  }
  
  :deep(.el-form-item) {
    margin-bottom: 18px;
  }
  
  :deep(.el-form-item__label) {
    padding-bottom: 4px;
    color: #303133;
    font-size: 12px;
  }
  </style>