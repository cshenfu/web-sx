import {ref,onBeforeMount} from 'vue';
import {removeEmpty,getAreaName,getAreaData} from './project'
import {getProjectList} from '@/api/modules/wind/anemometer/project'
import useAreaDataStore from '@/pinia/modules/areaData'
import { checkPackageEffective } from '@/api/modules/reportIndex.js';
import { message, Modal } from 'ant-design-vue';
export async  function  useProjectHandle() {
    const dataLists = ref([]);
    const loading = ref(false);
    const areaCodeOptions = ref([]);
    const total = ref(0);
    let areaDataStore = useAreaDataStore();
    const initDataList = async(searchKey,page,itemType)=>{
        loading.value = true;
        let searchData = {
            provinceCode:searchKey.areaCode?.length > 0? searchKey.areaCode[0]:'',
            cityCode:searchKey.areaCode?.length > 0? searchKey.areaCode[1]:'',
            countyCode:searchKey.areaCode?.length > 0? searchKey.areaCode[2]:'',
            projectStatus:searchKey.projectStatus,
            minCurrentProjectCapacity:searchKey.minCurrentProjectCapacity,
            maxCurrentProjectCapacity:searchKey.maxCurrentProjectCapacity,
            startTime:  searchKey.dataTime?.length > 0 ? searchKey.dataTime[0]: '',
            endTime:  searchKey.dataTime?.length > 0 ? searchKey.dataTime[1]: '',
            projectName: searchKey.projectName,
            pageNo: page.value.pageNo,
            pageSize: page.value.pageSize,
            itemType: searchKey.itemType, // 项目类型
            userId: sessionStorage.getItem('userId'),
        };
        if (itemType) {
            searchData.itemType = itemType;
        }
        let data = removeEmpty(searchData);
        await getProjectList(data).then((res) => {
            dataLists.value = res.data?.list?.map((item) => {
                item.areaName = item.provinceName? `${item.provinceName}/${item.cityName}/${item.districtName}` : '--'
                return item;
            })
            total.value = res.data?.total;
            loading.value = false;
        });
        return new Promise((resolve, reject) => {
            resolve({ dataLists, loading, total})
        })
    }
    // 验证服务的有效性
const checkPackage = async (val) => {
    let obj = {
        isEffective: true,
        messageType:4,
        TipsDialogVisible:false,
        isTry: 1
    };
    await checkPackageEffective({
        companyId: sessionStorage.getItem('userId'),
        itemType: val, // 字符串类型 1风电可研 2光伏可研
    }).then((res) => {
        console.log(res);
        if (res.code == 200) {
            sessionStorage.setItem('isInitiate', res.data.isInitiate);
            obj.isTry = res.data.isTry;
            if (res.data.isInitiate) {
                // 可以去创建模板
                obj.isEffective = true;
                // 试用服务不允许使用特定功能
                if (res.data.isTry) {
                    Modal.warning({
                        title: '操作提示',
                        content: '该功能暂未对试用服务用户开放，如需使用可联系客服：155-6259-8617',
                    });
                    obj.isEffective = false;
                }
            } else {
                if (res.data.notInitiateType) {
                    obj.messageType = res.data.notInitiateType;
                    obj.TipsDialogVisible = true;
                }
                obj.isEffective = false;
            }
        } else {
            // isShowLoading.value = false;
        }
    });
    console.log(obj);
    return obj;
};
    return {
        initDataList,
        checkPackage,
    }
}