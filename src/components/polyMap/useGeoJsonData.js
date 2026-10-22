/**
 * 处理geoJson格式数据并能回显至天地图上
 **/
 
 export const useGeoJsonData = () => {
	let geoJsonData = null // 定义geoJsonData保存geoJson格式数据
	// geoJson数据处理为天地图可展示的图形结构，点/线/面分别渲染
	const geoJsonMapFormat = {
		point: [], // 点数据
		line: [], // 线数据
		polygon: [] // 面数据
	}
	// 处理geoJson方法合集
	const geoJsonFunList = {
		GeometryCollection: {
			fun: handleGeometryCollection, // 对应类型处理方法
			paramName: 'geometries' // 方法传参
		},
		MultiPoint: {
			fun: handleMultiPoint,
			paramName: 'coordinates'
		},
		Point: {
			fun: handlePoint,
			paramName: 'coordinates'
		},
		FeatureCollection: {
			fun: handleFeatureCollection,
			paramName: 'features'
		},
		Feature: {
			fun: handleFeature,
			paramName: undefined
		},
		MultiLineString: {
			fun: handleMultiLineString,
			paramName: 'coordinates'
		},
		LineString: {
			fun: handleLineString,
			paramName: 'coordinates'
		},
		MultiPolygon: {
			fun: handleMultiPolygon,
			paramName: 'coordinates'
		},
		Polygon: {
			fun: handlePolygon,
			paramName: 'coordinates'
		}
	}
	// 位置信息
	const geoJsonSiteInfo = {
		minLng: undefined, // 最小经度
		maxLng: undefined, // 最大经度
		minLat: undefined, // 最小纬度
		maxLat: undefined // 最大纬度
	}
	// 自定义获取赋予geoJson数据
	async function customGetGeoJsonData(data) {
		geoJsonData = JSON.parse(JSON.stringify(data))
		await handleGeoJsonData(geoJsonData)
		return Promise.resolve()
	}
	// 处理geoJson数据
	function handleGeoJsonData(data) {
		let typeName = data.type
		geoJsonFunList[typeName] && (geoJsonFunList[typeName].paramName ? geoJsonFunList[typeName].fun(data[geoJsonFunList[typeName].paramName]) : geoJsonFunList[typeName].fun(data))
	}
	// 处理GeometryCollection类型数据
	function handleGeometryCollection(data) {
		data?.forEach((item) => {
			handleGeoJsonData(item)
		})
	}
	// 处理Point类型数据
	function handlePoint(data) {
		handleSiteInfo(data)
		const coordinate = data.join()
		geoJsonMapFormat.point.push(coordinate)
	}
	// 处理FeatureCollection类型数据
	function handleFeatureCollection(data) {
		data?.forEach((item) => {
			handleGeoJsonData(item)
		})
	}
	// 处理MultiPoint类型数据
	function handleMultiPoint(data) {
		data?.forEach((item) => {
			handlePoint(item)
		})
	}
	// 处理Feature类型数据
	function handleFeature(data) {
		handleGeoJsonData(data.geometry)
	}
	// 处理MultiLineString类型数据
	function handleMultiLineString(data) {
		data?.forEach((item) => handleLineString(item))
	}
	// 处理LineString类型数据
	function handleLineString(data) {
		// 处理数据格式
		const coordinateList = data?.map((item) => {
			handleSiteInfo(item)
			return {
				lng: item[0],
				lat: item[1]
			}
		})
		// 添加线
		geoJsonMapFormat.line.push(coordinateList)
	}
	// 处理MultiPolygon类型数据
	function handleMultiPolygon(data) {
		data?.forEach((item) => {
			handlePolygon(item)
		})
	}
	// 处理Polygon类型数据
	function handlePolygon(data) {
		// 处理数据格式
		const coordinateList = data.map((item) => {
			return item.map((pointItem) => {
				handleSiteInfo(pointItem)
				return {
					lng: pointItem[0],
					lat: pointItem[1]
				}
			})
		})
		geoJsonMapFormat.polygon.push(coordinateList)
	}
	// 处理经纬度最大值及最小值
	function handleSiteInfo(site) {
		geoJsonSiteInfo.minLng =
			geoJsonSiteInfo.minLng != undefined && geoJsonSiteInfo.minLng < site[0] ? geoJsonSiteInfo.minLng : site[0]
		geoJsonSiteInfo.maxLng =
			geoJsonSiteInfo.maxLng != undefined && geoJsonSiteInfo.maxLng > site[0] ? geoJsonSiteInfo.maxLng : site[0]
		geoJsonSiteInfo.minLat =
			geoJsonSiteInfo.minLat != undefined && geoJsonSiteInfo.minLat < site[1] ? geoJsonSiteInfo.minLat : site[1]
		geoJsonSiteInfo.maxLat =
			geoJsonSiteInfo.maxLat != undefined && geoJsonSiteInfo.maxLat > site[1] ? geoJsonSiteInfo.maxLat : site[1]
	}
	// 图形回显天地图自适应视角算法
	function geoJsonToMapAdaptiveAlgorithm() {
		return new Promise((resolve, reject) => {
			if (
				![geoJsonSiteInfo.minLng, geoJsonSiteInfo.maxLng, geoJsonSiteInfo.minLat, geoJsonSiteInfo.maxLat].includes(
					undefined
				)
			) {
				// 处理可视化范围及层级
				let coordinate = `${(geoJsonSiteInfo.minLng + geoJsonSiteInfo.maxLng) / 2},${(geoJsonSiteInfo.minLat + geoJsonSiteInfo.maxLat) / 2}` // 中心点
				const diffArr = [180, 90, 45, 22, 11, 5.5, 2.75, 1.37, 0.68, 0.34, 0.17, 0.08, 0.04]
				const diffLng = geoJsonSiteInfo.maxLng - geoJsonSiteInfo.minLng // 经度差
				const diffLat = geoJsonSiteInfo.maxLat - geoJsonSiteInfo.minLat // 纬度差
				const standardValue =
					diffLng < diffLat * 2.1 ? parseInt(10000 * diffLat * 2.1) / 10000 : parseInt(10000 * diffLng) / 10000 // 设立标准值
				let index = diffArr.findIndex((item) => {
					return standardValue - item >= 0
				})
				let zoom = index != -1 ? index + 3 : 14 // 获得缩放级别
				resolve({
					coordinate,
					zoom
				})
			}
			reject(false)
		})
	}
	// 重置数据
	function resetGeoJsonData() {
		geoJsonData = null
		for (let key in geoJsonSiteInfo) {
			geoJsonSiteInfo[key] = undefined
		}
		for (let key in geoJsonMapFormat) {
			geoJsonMapFormat[key] = []
		}
	}
 
	return {
		geoJsonMapFormat,
		customGetGeoJsonData,
		geoJsonToMapAdaptiveAlgorithm,
		resetGeoJsonData
	}
}