export function getPolygonCenterPoint (polygonData) {
    let point = {};
    let maxLongitude, maxLatitude, minLongitude, minLatitude;
    maxLongitude = polygonData[0][1];
    maxLatitude = polygonData[0][0];
    minLongitude = polygonData[0][1];
    minLatitude = polygonData[0][0];
    for (let index = 0; index < polygonData.length; index++) {
        const ele = polygonData[index];
        if (ele[1] > maxLongitude) {
            maxLongitude = ele[1];
        }
        if (ele[1] < minLongitude) {
            minLongitude = ele[1];
        }
        if (ele[0] > maxLatitude) {
            maxLatitude = ele[0];
        }
        if (ele[0] < minLatitude) {
            minLatitude = ele[0];
        }
    }
    point.longitude = (maxLongitude * 1 + minLongitude * 1) / 2;
    point.latitude = (maxLatitude * 1 + minLatitude * 1) / 2;
    return point;
}