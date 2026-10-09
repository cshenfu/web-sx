import {ref} from 'vue';
import * as XLSX from "xlsx";
import { saveAs } from 'file-saver';
import dayjs from 'dayjs';

const formatDate = (value, str) => {
    let date = new Date(value);
    if (str) {
        date = dayjs(date).format('YYYY年MM月DD日 HH:mm:ss')
    } else {
        date = dayjs(date).format('YYYY-MM-DD HH:mm:ss')
    }
}

const exportDataMethods = (head, tableData, timeConversion, timeCel, fileName, headers) => {
    let timecel = timeCel ? timeCel : '';
    let filename = fileName ? fileName : '';
    let cols = [];
    // 表头数据切换
    let list = tableData.map(item => {
        cols.push({wch: 20})
        const obj = {};
        for (const key in item) {
            if (head[key]) {
                obj[head[key]] = item[key];
            }
        }
        return obj;
    })
    console.log(list);
    // 创建一个工作表
    const ws = XLSX.utils.json_to_sheet(list, {header: headers});
    const range = XLSX.utils.decode_range(ws['!ref']);
    if (timeConversion) {
        // 将时间戳转换为日期字符串
        ws['!cols'] = cols;
        console.log(range.e.r);
        // 将时间戳转换成日期格式
        for (let i = 1; i <= range.e.r; i++) {
            const cell = XLSX.utils.encode_cell({r: i, c: timecel}); // 时间戳所在的列
            console.log(cell);
            console.log(ws);
            console.log(ws[cell]);
            ws[cell].t = 's';
            ws[cell].v = formatDate(ws[cell].v * 1);
        }
    }
    // // 创建一个工作薄
    const wb = XLSX.utils.book_new();
    // // 向工作薄中添加工作表
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    // // 将工作薄导出为Excel文件
    const wbData = XLSX.write(wb, {bookType: 'xlsx', type: 'array'});
    // // 下载文件
    saveAs(new Blob([wbData], {type: "application/octet-stream"}), filename + '.xlsx');
}

// 导出查询的所有数据
const queryAllData = async(data, column) => {
    console.log(data);
    console.log(column);
    console.log(Object.values(column)); 
    // 定义表头
    if (data.length) {
        exportDataMethods(column, data, true, 7, '自定义文件名称', Object.values(column))
    }
}

const exportData = (data, column) => {
    queryAllData(data, column);
}

export {
    exportData
}