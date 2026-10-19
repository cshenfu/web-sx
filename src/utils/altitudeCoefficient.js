/**
 * 线性插值计算
 */
 function interpolate(x, xArr, yArr) {
    if (x <= xArr[0]) return yArr[0];
    if (x >= xArr[xArr.length - 1]) return yArr[yArr.length - 1];
    for (let i = 0; i < xArr.length - 1; i++) {
      if (x >= xArr[i] && x <= xArr[i + 1]) {
        return yArr[i] + (x - xArr[i]) * (yArr[i + 1] - yArr[i]) / (xArr[i + 1] - xArr[i]);
      }
    }
    return yArr[0];
  }
  
  /**
   * 根据海拔计算人工系数
   */
  export function getManualCoefficient(altitude) {
    return interpolate(altitude, [2000, 3000, 4000, 5000], [1.0, 1.15, 1.25, 1.35]);
  }
  
  /**
   * 根据海拔计算机械系数
   */
  export function getMechanicalCoefficient(altitude) {
    return interpolate(altitude, [2000, 3000, 4000, 5000], [1.0, 1.13, 1.26, 1.42]);
  }



