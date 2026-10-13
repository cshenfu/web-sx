const isAltitude = (str) => {  
    const pattern = /^(-)?\d+(\.\d+)?$/;  
    return pattern.test(str);  
}
// 手机号码
const isPhone = (str) => {
    const phone = /^1[3456789]\d{9}$/;
    return phone.test(str);  
}
// 邮箱验证
const isEamil = (str) => {  
    const emial = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emial.test(str);  
} 
// 华为云路径验证
const regexObsPath = /https?:\/\/[^/]+(.*)/;
//  纯数字校验
const regexNumber = (str) => {
    const num =/^\d+$/
    return num.test(str);

}
export {
    isAltitude,
    isPhone,
    isEamil,
    regexObsPath,
    regexNumber
}
