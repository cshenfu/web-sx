// js/useTiandituGeocode.js
//
// 功能：
// 1. 经纬度逆地理编码
// 2. 获取省、市、区行政区划 code
// 3. 获取天地图返回的详细 address
// 4. 地名搜索
// 5. 场区范围 25km 半径校验

/**
 * 建议在 .env 文件中配置：
 *
 * VITE_TIANDITU_KEY=你的天地图Key
 *
 * 不建议把 Key 直接写死在代码中。
 */
 const TIANDITU_KEY =
 import.meta.env.VITE_TIANDITU_KEY || '429657aadca28e2e467243852a0b388d'

const TIANDITU_GEOCODER_URL =
 'https://api.tianditu.gov.cn/geocoder'

/**
* 计算一组经纬度的质心
*
* @param {Array<{lng:number|string, lat:number|string}>} points
* @returns {{lng:number, lat:number}|null}
*/
export function computeCentroid(points) {
 if (!Array.isArray(points) || points.length === 0) {
   return null
 }

 const validPoints = points
   .map((point) => ({
     lng: Number(point.lng),
     lat: Number(point.lat)
   }))
   .filter((point) => {
     return (
       Number.isFinite(point.lng) &&
       Number.isFinite(point.lat)
     )
   })

 if (validPoints.length === 0) {
   return null
 }

 const total = validPoints.reduce(
   (acc, point) => {
     acc.lng += point.lng
     acc.lat += point.lat

     return acc
   },
   {
     lng: 0,
     lat: 0
   }
 )

 return {
   lng: total.lng / validPoints.length,
   lat: total.lat / validPoints.length
 }
}

/**
* 从天地图地址组成对象中生成地址兜底值。
*
* 正常情况下优先使用：
*
* result.formatted_address
*
* 只有 formatted_address 不存在时，
* 才使用这里的字段进行拼接。
*
* @param {Object} addressComponent
* @returns {string}
*/
function buildAddressFallback(addressComponent = {}) {
 const parts = [
   // 省、市、区县名称
   addressComponent.province,
   addressComponent.city,
   addressComponent.county ||
     addressComponent.district,

   // 乡镇、街道、村
   addressComponent.town,
   addressComponent.township,
   addressComponent.village,

   // 道路及门牌信息
   addressComponent.road,
   addressComponent.road_name,
   addressComponent.roadno,
   addressComponent.road_number,

   // 天地图附近地点信息
   addressComponent.address,
   addressComponent.poi
 ]

 return parts
   .filter((item) => {
     return item !== undefined &&
       item !== null &&
       String(item).trim() !== ''
   })
   .map((item) => String(item).trim())
   .join('')
}

function firstNonEmpty(...values) {
 for (const value of values) {
   if (
     value !== undefined &&
     value !== null &&
     String(value).trim() !== ''
   ) {
     return String(value).trim()
   }
 }

 return ''
}

/**
* 天地图部分接口会返回：
*
*   156520000
*   156522600
*   156522633
*
* 其中 156 是中国 ISO 3166-1 numeric 国家码，
* 后面的 6 位才是传统行政区划 code。
*/
function normalizeChinaAdminCode(code) {
 const value = String(code || '').trim()

 if (/^156\d{6}$/.test(value)) {
   return value.slice(3)
 }

 return value
}

function buildDetailedAddress(result = {}, addressComponent = {}) {
 const formattedAddress = firstNonEmpty(
   result.formatted_address,
   result.formattedAddress
 )

 if (formattedAddress) {
   return formattedAddress
 }

 return buildAddressFallback(addressComponent)
}

/**
* 获取天地图 Key。
*
* @returns {string}
*/
function getTiandituKey() {
 if (!TIANDITU_KEY) {
   throw new Error(
     '未配置天地图 Key，请在 .env 中配置 VITE_TIANDITU_KEY'
   )
 }

 return TIANDITU_KEY
}

async function fetchWithTimeout(
 url,
 options = {},
 timeoutMs = 15000
) {
 const controller = new AbortController()
 const timer = setTimeout(() => {
   controller.abort()
 }, timeoutMs)

 try {
   return await fetch(url, {
     ...options,
     signal: controller.signal
   })
 } catch (error) {
   if (error?.name === 'AbortError') {
     throw new Error(
       `天地图请求超过${timeoutMs / 1000}秒未返回，请检查网络、域名白名单或 Key`
     )
   }

   throw new Error(
     `天地图请求异常：${error?.message || '网络连接失败'}`
   )
 } finally {
   clearTimeout(timer)
 }
}

/**
* 调用天地图逆地理编码接口。
*
* 根据经纬度获取：
* - provinceCode：省 code
* - cityCode：市 code
* - districtCode：区县 code
* - provinceName：省名称
* - cityName：市名称
* - districtName：区县名称
* - regionCode：优先区县，其次市，最后省
* - address：详细地址
*
* @param {number|string} lng 经度
* @param {number|string} lat 纬度
*
* @returns {Promise<{
*   provinceCode: string,
*   cityCode: string,
*   districtCode: string,
*   provinceName: string,
*   cityName: string,
*   districtName: string,
*   regionCode: string,
*   address: string
* }>}
*/
export async function reverseGeocode(lng, lat) {
 const key = getTiandituKey()

 const longitude = Number(lng)
 const latitude = Number(lat)

 if (
   !Number.isFinite(longitude) ||
   !Number.isFinite(latitude)
 ) {
   throw new Error('经纬度参数无效')
 }

 const postStr = JSON.stringify({
   lon: longitude,
   lat: latitude,
   ver: 1
 })

 const url =
   `${TIANDITU_GEOCODER_URL}` +
   `?postStr=${encodeURIComponent(postStr)}` +
   `&type=geocode` +
   `&tk=${encodeURIComponent(key)}`

 console.warn(
   '[TIANDITU] reverseGeocode request:',
   {
     lng: longitude,
     lat: latitude
   }
 )

 const response = await fetchWithTimeout(url)

 console.warn(
   '[TIANDITU] reverseGeocode response:',
   response.status
 )

 if (!response.ok) {
   throw new Error(
     `天地图逆地理编码请求失败：${response.status}`
   )
 }

 const data = await response.json()

 console.warn(
   '[TIANDITU] reverseGeocode data:',
   data
 )

 // 天地图 status 为 0 表示成功
 if (
   data.status !== '0' &&
   data.status !== 0
 ) {
   throw new Error(
     `天地图逆地理编码失败：${data.msg || '未知错误'}`
   )
 }

 const result = data.result || {}
 const addressComponent =
   result.addressComponent ||
   result.address_component ||
   {}

 /*
  * 天地图返回的行政区划编码。
  *
  * province_code：省编码
  * city_code：市编码
  * county_code：区县编码
  */
 const provinceCode = normalizeChinaAdminCode(
   firstNonEmpty(
     addressComponent.province_code,
     addressComponent.provinceCode
   )
 )

 const cityCode = normalizeChinaAdminCode(
   firstNonEmpty(
     addressComponent.city_code,
     addressComponent.cityCode
   )
 )

 const districtCode = normalizeChinaAdminCode(
   firstNonEmpty(
     addressComponent.county_code,
     addressComponent.countyCode,
     addressComponent.district_code,
     addressComponent.districtCode
   )
 )

 const provinceName = firstNonEmpty(
   addressComponent.province
 )

 const cityName = firstNonEmpty(
   addressComponent.city
 )

 const districtName = firstNonEmpty(
   addressComponent.county,
   addressComponent.district
 )

 /*
  * 区域编码优先使用区县级，
  * 没有区县时退回市级，
  * 没有市级时退回省级。
  */
 const regionCode =
   districtCode ||
   cityCode ||
   provinceCode ||
   ''

 /*
  * formatted_address 是天地图返回的完整格式化地址，
  * 通常是最详细的地址，优先使用。
  *
  * 如果没有 formatted_address，
  * 再使用 addressComponent 拼接。
  */
 const address = buildDetailedAddress(
   result,
   addressComponent
 )

 console.warn(
   '[TIANDITU] reverseGeocode return:',
   {
     provinceCode,
     cityCode,
     districtCode,
     provinceName,
     cityName,
     districtName,
     regionCode,
     address
   }
 )

 return {
   // 省、市、区都返回 code，不返回名称
   provinceCode,
   cityCode,
   districtCode,
   provinceName,
   cityName,
   districtName,

   // 后端 coordinate.regionCode 使用此字段
   regionCode: String(regionCode),

   // 后端 address 使用此字段
   address
 }
}

/**
* 根据场区范围坐标点获取区域信息。
*
* 会先计算所有点的质心，
* 再使用质心调用天地图逆地理编码。
*
* @param {Array<{lng:number|string, lat:number|string}>} points
*
* @returns {Promise<{
*   provinceCode: string,
*   cityCode: string,
*   districtCode: string,
*   regionCode: string,
*   address: string
* }>}
*/
export async function resolveRegionByPoints(points) {
 const centroid = computeCentroid(points)

 if (!centroid) {
   throw new Error('没有可用于定位的坐标点')
 }
 console.log(centroid)

 const region = await reverseGeocode(
   centroid.lng,
   centroid.lat
 )

 console.warn(
   '[CREATE-PROJECT-V2] resolveRegionByPoints result:',
   region
 )

 return region
}

/**
* 地名地址搜索。
*
* 例如：
* 榆林市榆阳区
*
* @param {string} keyword
*
* @returns {Promise<{
*   lng: number,
*   lat: number
* }>}
*/
export async function searchPlaceName(keyword) {
 const key = getTiandituKey()

 const searchKeyword = String(
   keyword || ''
 ).trim()

 if (!searchKeyword) {
   throw new Error('请输入要搜索的地名')
 }

 const ds = JSON.stringify({
   keyWord: searchKeyword
 })

 const url =
   `${TIANDITU_GEOCODER_URL}` +
   `?ds=${encodeURIComponent(ds)}` +
   `&tk=${encodeURIComponent(key)}`

 const response = await fetch(url)

 if (!response.ok) {
   throw new Error(
     `地名搜索请求失败：${response.status}`
   )
 }

 const data = await response.json()
 const location = data?.location

 if (!location) {
   throw new Error('未找到匹配的地名')
 }

 const lng = Number(location.lon)
 const lat = Number(location.lat)

 if (
   !Number.isFinite(lng) ||
   !Number.isFinite(lat)
 ) {
   throw new Error('地名搜索返回的坐标无效')
 }

 return {
   lng,
   lat
 }
}

/**
* 计算两点之间的球面距离。
*
* @param {{lng:number|string, lat:number|string}} a
* @param {{lng:number|string, lat:number|string}} b
*
* @returns {number} 距离，单位 km
*/
export function haversineDistanceKm(a, b) {
 const lng1 = Number(a.lng)
 const lat1 = Number(a.lat)
 const lng2 = Number(b.lng)
 const lat2 = Number(b.lat)

 if (
   !Number.isFinite(lng1) ||
   !Number.isFinite(lat1) ||
   !Number.isFinite(lng2) ||
   !Number.isFinite(lat2)
 ) {
   return Infinity
 }

 const earthRadius = 6371

 const toRadians = (degree) => {
   return (degree * Math.PI) / 180
 }

 const dLat = toRadians(lat2 - lat1)
 const dLng = toRadians(lng2 - lng1)

 const radLat1 = toRadians(lat1)
 const radLat2 = toRadians(lat2)

 const h =
   Math.sin(dLat / 2) ** 2 +
   Math.cos(radLat1) *
     Math.cos(radLat2) *
     Math.sin(dLng / 2) ** 2

 // 防止浮点误差导致 asin 参数超过 1
 const safeH = Math.min(
   1,
   Math.max(0, h)
 )

 return (
   2 *
   earthRadius *
   Math.asin(Math.sqrt(safeH))
 )
}

/**
* 判断 Polygon 是否在指定半径内。
*
* 规则：
* 以 Polygon 点集合质心为圆心，
* 所有边界点到质心的距离都不能超过 maxRadiusKm。
*
* @param {GeoJSON.Feature} polygonFeature
* @param {number} maxRadiusKm
*
* @returns {boolean}
*/
export function isPolygonWithinRadius(
 polygonFeature,
 maxRadiusKm = 25
) {
 const ring =
   polygonFeature?.geometry?.coordinates?.[0]
console.log(ring)
 if (!Array.isArray(ring) || ring.length === 0) {
   return true
 }

 let points = ring
   .map(([lng, lat]) => ({
     lng: Number(lng),
     lat: Number(lat)
   }))
   .filter((point) => {
     return (
       Number.isFinite(point.lng) &&
       Number.isFinite(point.lat)
     )
   })

 if (points.length === 0) {
   return true
 }

 /*
  * GeoJSON Polygon 通常会把第一个点
  * 再放到最后作为闭合点。
  *
  * 计算质心时去掉最后一个重复点，
  * 避免重复计算。
  */
 if (points.length > 1) {
   const first = points[0]
   const last = points[points.length - 1]

   if (
     first.lng === last.lng &&
     first.lat === last.lat
   ) {
     points = points.slice(0, -1)
   }
 }

 const centroid = computeCentroid(points)

 if (!centroid) {
   return true
 }

 return points.every((point) => {
   const distance = haversineDistanceKm(
     centroid,
     point
   )

   return distance <= maxRadiusKm
 })
}