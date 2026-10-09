// src/views/dashboard/shared/useProvinceAreaData.js
import { ref } from 'vue'
import * as api from '@/api/modules/gisLayer.js'
import { computeBBox } from './geoUtils'
import { AREA_SELECT_LAYER_KEY } from './mapConfig'

/**
 * 分页拉取指定边界范围内的全部区域数据，转换为 GeoJSON FeatureCollection。
 * 首页（可编辑）与智能选址页（只读展示）共用同一份数据获取逻辑。
 */
export function useProvinceAreaData(boundaryGeojson, layerKey = AREA_SELECT_LAYER_KEY) {
  const provinceAreaGeoJSON = ref(null)
  const provinceAreaLoading = ref(false)
  const areaSelectResult = ref(null)

  async function fetchAllProvinceAreaData() {
    const bbox = computeBBox(boundaryGeojson.features)
    if (!bbox) {
      console.warn('无法计算边界 bbox，跳过区域数据请求')
      return null
    }

    provinceAreaLoading.value = true

    try {
      const pageSize = 50
      const firstRes = await api.areaSelectByKey(layerKey, { bbox, page: 1, size: pageSize })

      const firstPage = firstRes.data || {}
      const total = Number(firstPage.total || 0)
      const actualPageSize = Number(firstPage.size || pageSize) || pageSize
      const allItems = [...(firstPage.list || [])]
      const totalPages = Math.ceil(total / actualPageSize)

      if (totalPages > 1) {
        const pageRequests = []
        for (let page = 2; page <= totalPages; page += 1) {
          pageRequests.push(api.areaSelectByKey(layerKey, { bbox, page, size: actualPageSize }))
        }
        const pageResults = await Promise.all(pageRequests)
        pageResults.forEach((res) => allItems.push(...(res.data?.list || [])))
      }

      const features = allItems
        .filter((item) => item?.geometry)
        .map((item) => ({
          type: 'Feature',
          id: item.guid,
          properties: { ...(item.attributes || {}), guid: item.guid },
          geometry: item.geometry,
        }))

      provinceAreaGeoJSON.value = { type: 'FeatureCollection', features }
      areaSelectResult.value = { ...firstPage, total, list: allItems }

      return provinceAreaGeoJSON.value
    } catch (error) {
      console.error('获取区域数据失败:', error)
      throw error
    } finally {
      provinceAreaLoading.value = false
    }
  }

  return {
    provinceAreaGeoJSON,
    provinceAreaLoading,
    areaSelectResult,
    fetchAllProvinceAreaData,
  }
}