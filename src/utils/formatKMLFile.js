// kml文件内容数据解析
export function formatKMLFileEvent(kmlText) {
    const parser = new DOMParser();
    const kmlDom = parser.parseFromString(kmlText, 'text/xml');
    console.log('kmlDom', kmlDom);
    const pointMarks = kmlDom.getElementsByTagName('Point');
    let pointData = [];
    const lineMarks = kmlDom.getElementsByTagName('LineString');
    let lineData = [];
    const polygonMarks = kmlDom.getElementsByTagName('Polygon');
    let polygonData = [];
    if (pointMarks.length) {
        // 代表点位数据
        for (let i = 0; i < pointMarks.length; i++) {
            const pointMark = pointMarks[i];
            const coordinates = pointMark.getElementsByTagName('coordinates')[0].textContent;
            const [longitude, latitude] = coordinates.split(',');
            pointData.push({
                longitude,
                latitude,
            });
        }
        console.log(pointData);
    } else if (polygonMarks.length) {
        // 代表面数据
        for (let i = 0; i < polygonMarks.length; i++) {
            const polygonMark = polygonMarks[i];
            let coordinates = polygonMark.getElementsByTagName('coordinates')[0].textContent;
            const polygonDataArr = coordinates.split(' ').filter((ele) => ele && ele !== '\n');
            const subPolygonDataArr = [];
            if (polygonDataArr.length) {
                for (let index = 0; index < polygonDataArr.length; index++) {
                    let element = polygonDataArr[index];
                    element = element.split(',').filter((ele) => ele && ele !== '\n');
                    subPolygonDataArr.push([element[1],element[0]]);
                }
            }
            console.log(subPolygonDataArr, '子-----处理完的面数据')
            polygonData.push(subPolygonDataArr);
        }
        console.log(polygonData, '处理完的面数据');
    } else if (lineMarks.length) {
        // 代表线位数据
        for (let i = 0; i < lineMarks.length; i++) {
            const lineMark = lineMarks[i];
            const parentEleDescTag = lineMark.parentNode.getElementsByTagName('description')[0];
            // 需要过滤掉横向纵向参考线数据
            if (
                (parentEleDescTag &&
                parentEleDescTag.textContent !== 'Grid Line' &&
                parentEleDescTag.textContent !== 'Grid Line - Minor') || !parentEleDescTag
            ) {
                const coordinates = lineMark.getElementsByTagName('coordinates')[0].textContent;
                const lineDataArr = coordinates.split(' ').filter((ele) => ele && ele !== '\n');
                lineData.push(lineDataArr);
            }
        }
        // 分面和线两种情况
        const formatLineData = [];
        const formatAreaData = [];
        for (let index = 0; index < lineData.length; index++) {
            const subFormatLineData = [];
            const element = lineData[index];
            for (let i = 0; i < element.length; i++) {
                const element1 = element[i];
                const [longitude, latitude] = element1.split(',');
                if (longitude * 1 > 0 && latitude * 1 > 0) {
                    subFormatLineData.push([longitude * 1, latitude*1]);
                }
            }
            if (subFormatLineData.length) {
                if (subFormatLineData[0][0] == subFormatLineData.at(-1)[0] && subFormatLineData[0][1] == subFormatLineData.at(-1)[1]) {
                    // 最开始的经纬度和最后的经纬度一致，代表是一个封闭面，可以渲染成多边形，要求把数据的经纬度位置调换，方便天地图渲染
                    subFormatLineData.forEach(subArray => {
                        [subArray[0], subArray[1]] = [subArray[1], subArray[0]];
                    })
                    formatAreaData.push(subFormatLineData);
                } else {
                    // 代表线段数据
                    formatLineData.push(subFormatLineData);
                }
            }
        }
        console.log(formatAreaData, '处理完的面数据');
        formatAreaData.length && (polygonData = formatAreaData) && (lineData = []);
        console.log(formatLineData, '处理完的线数据');
        formatLineData.length && (lineData = formatLineData);
    }
    return {
        pointData,
        lineData,
        polygonData
    };
}