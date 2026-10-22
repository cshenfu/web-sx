/**
 * 完整的中国边界判断（包含港澳台）
 */
import chinaBoundary from '@/assets/js/china.json'

function pointInPolygon(point, polygon) {
    const [x, y] = point; // 经度, 纬度
    let inside = false;
    
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const [xi, yi] = polygon[i];
      const [xj, yj] = polygon[j];
      
      const intersect = ((yi > y) !== (yj > y)) 
        && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      
      if (intersect) inside = !inside;
    }
    return inside;
  }
   
  // 处理GeoJSON多边形（需遍历所有环）
  function isInChina(longitude, latitude) {
    const point = [longitude, latitude];
    
    for (const feature of chinaBoundary.features) {
      const geometry = feature.geometry;
      
      // 处理MultiPolygon
      if (geometry.type === 'MultiPolygon') {
        for (const polygon of geometry.coordinates) {
          for (const ring of polygon) { // 每个环（外环/内环）
            if (pointInPolygon(point, ring)) {
              // 关键：内环（洞）需要反转逻辑
              const isHole = ring[0][0] < polygon[0][0][0]; 
              return !isHole;
            }
          }
        }
      } 
      // 处理Polygon
      else if (geometry.type === 'Polygon') {
        for (const ring of geometry.coordinates) {
          if (pointInPolygon(point, ring)) {
            const isHole = ring[0][0] < geometry.coordinates[0][0][0];
            return !isHole;
          }
        }
      }
    }
    return false;
  }

export default isInChina;