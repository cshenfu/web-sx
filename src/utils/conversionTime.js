import dayjs from "dayjs";
const conversionTime = (time,type='YYYY-MM-DD HH:mm:ss') => {
    return dayjs(time).format(type);
}
export{
    conversionTime
}