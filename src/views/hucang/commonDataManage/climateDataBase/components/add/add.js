const  DATA_SOURCE_FILE_TYPES ='jpg,jpeg,png,pdf,doc,docx';
const  MAP_FILE_TYPES = 'jpg,jpeg,png';
const  VECTOR_MAP_FILE_TYPES = 'shp,tif';
const   temperaturePattern = (val) => {
    // 温度正则表达式
    const reg = /^(\-|\+)?\d+(\.\d+)?$/;
    return reg.test(val);
};
// 正整数正则表达式
const  positiveIntegerPattern = (val) => {
    const reg = /^[0-9]\d*$/;
    return reg.test(val);
};
export {
    DATA_SOURCE_FILE_TYPES,
    MAP_FILE_TYPES,
    VECTOR_MAP_FILE_TYPES,
    temperaturePattern,
    positiveIntegerPattern
}