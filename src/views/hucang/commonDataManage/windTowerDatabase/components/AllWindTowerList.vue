<template>
    <div class="wind-tower-list">
        <table-list class="user-table" :loading="loading" :tableData="dataList" :tableColumn="clomun"
            :page="page" @getRowData="getRowData" @changePage="changePage">
            <template #areaData="{record}">
                <span>{{ record.provinceName }}/{{ record.cityName}}/{{record.districtName  }}</span>
            </template>
            <template #projectCode="{record}">
                <div class="associated-num has-bind-clor">
                    <span v-if="record.projectCode && record.projectCode.length <= 1">{{ record.projectCode[0] }}</span>
                    <template v-if="record.projectCode && record.projectCode.length > 1">
                        <a-popover title="">
                            <template #content>
                                <p v-for="(item, index) in record.projectCode" :key="index">{{
                                    item
                                }}</p>
                            </template>
                            <span>{{ record.projectCode[0] }}...共{{ record.projectCode.length }}个</span>
                        </a-popover>
                    </template>
                </div>
            </template>
            <template #analysisStatus="{record}">
                <template v-if="searchKey.source == 2">
                    <div  class="status-tag pending-icon" v-if="record.analysisStatus == 1">已核对</div>
                    <div  class="status-tag finish-icon" v-if="record.analysisStatus == 2">解析失败</div>
                    <div  class="status-tag bind-icon" v-if="record.analysisStatus == 4">系统解析</div>
                </template>
                <template v-if="searchKey.source == 1">
                    <!-- Todo需要更改 0：已禁用 1:已开放 -->
                    <div  class="status-tag pending-icon" v-if="record.analysisStatus == 0">已开放</div>
                    <div  class="status-tag finish-icon" v-if="record.analysisStatus == 1">已禁用</div>
                </template>
            </template>
            <template #latOrLng="{record}">
                <span v-if="record.lng">{{ record.lng}},{{ record.lat }}</span>
                <span v-else> -</span>
            </template>
            <template #elevation="{record}">
                <span v-if="record.elevation">{{ record.elevation }}</span>
                <span v-else> -</span>
            </template>
            <template #rawTime="{record}">
                <span>{{ record.rawTime }}</span>
            </template>
            <template #tierOrTopHeight="{record}">
                <span>{{ record.tier }}/{{ record.topHeight }}</span>
            </template>
            <template #isRepair="{record}">
                <iconpark-icon :name="record.isRepair == 1 ? 'you' : 'wu'"></iconpark-icon>
            </template>
            <template #value12="{record}">
                <iconpark-icon :name="record.value12 == 1 ? 'you' : 'wu'"></iconpark-icon>
            </template>
            <template #isSd="{record}">
                <iconpark-icon :name="record.isSd == 1 ? 'you' : 'wu'"></iconpark-icon>
            </template>
            <template #isTemperatureTier="{record}">
                <iconpark-icon :name="record.isTemperatureTier == 1 ? 'you' : 'wu'"></iconpark-icon>
            </template>
            <template #isPressureTier="{record}">
                <iconpark-icon :name="record.isPressureTier == 1 ? 'you' : 'wu'"></iconpark-icon>
            </template>
            <template #isDirectionTier="{record}">
                <iconpark-icon :name="record.isDirectionTier == 1 ? 'you' : 'wu'"></iconpark-icon>
            </template>
            <template #value17="{record}">
                <iconpark-icon :name="record.value17 == 1 ? 'you' : 'wu'"></iconpark-icon>
            </template>
            <template #operation="{record}">
                <div class="operation-btn-column">
                    <template v-if="searchKey.source == 2">
                        <div class="cloumn-btn">
                            <span class="operation-btn-item" @click.stop="editFile(record)">核对</span>
                            <span class="operation-btn-item" @click.stop="getCommon(record)">转换公共</span>
                        </div>
                        <div class="cloumn-btn">
                            <span class="operation-btn-item" @click.stop="deleteFile(record)">删除</span>
                            <span class="operation-btn-item" @click.stop="recalculate(record, 'user')">重新计算</span>
                        </div>
                    </template>
                    <template v-if="searchKey.source == 1">
                        <div class="cloumn-btn">
                            <span class="operation-btn-item" @click.stop="editFile(record)">编辑</span>
                            <span class="operation-btn-item" @click.stop="deleteFile(record)">删除</span>
                            <!-- <span class="operation-btn-item" @click.stop="recalculate(record, 'public')">重新计算</span> -->
                        </div>
                        <div class="cloumn-btn">
                            <span class="operation-btn-item" v-if="record.analysisStatus == 1"
                                @click.stop="disableFile(record)">禁用</span>
                            <span class="operation-btn-item" v-if="record.analysisStatus == 0"
                                @click.stop="openFile(record)">置为开放</span>
                        </div>
                    </template>
                </div>
            </template>
        </table-list>
        <!-- 删除 -->
        <tips-modal :width="'490px'" title="删除提示" :tipType="'danger'" class="tip-content-modal" :okText="'确定删除'"
            :openTipsModal.sync="openTipsPowerModal" @handleChangeFileModal="handleChangeClose">
            <template #contentBody>
                <span class="modalTip">确定删除该数据么？</span>
            </template>
        </tips-modal>
        <!-- 禁用、开放、转换公共 -->
        <tips-modal :width="'490px'" :tipType="tipModalType == 'common' ? 'success' : 'danger'" class="tip-content-modal"
            :okText="tipModalType == 'open' ? '确定开放' : tipModalType == 'common' ? '确定' : '确定禁用'"
            :openTipsModal.sync="openTipsOpenModal" @handleChangeFileModal="handleChangeOpenModal">
            <template #customTitle>{{ tipTitle }}</template>
            <template #contentBody>
                <div class="tuning-tip">
                    <iconpark-icon name="jinggao" size="18" class="success"></iconpark-icon>
                    <span class="tuning-tip-title">{{ contentTip }}</span>
                </div>
                <a-form :colon="false" class="sort-form" ref="openFormRef" :model="openFormData" :labelCol="labelCol"
                    labelAlign="left">
                    <a-form-item v-if="tipModalType !== 'common'" label="原因" name="reason"
                        :rules="[{ required: true, ElMessage: '请输入原因' }]">
                        <a-textarea style="width: 362px" :auto-size="{ minRows: 2, maxRows: 5 }"
                            v-model:value="openFormData.reason" placeholder="请输入原因" />
                    </a-form-item>
                    <template v-if="tipModalType == 'common'">
                        <div class="current-tower-no">当前塔号: <span>{{ openFormData.currentTowerNo }}</span></div>
                        <a-form-item label="塔号" name="windTowerSeq" :rules="[{ required: true, ElMessage: '请输入更高为公共的测风塔号' }]">
                            <a-input style="width: 386px" v-model:value="openFormData.windTowerSeq"
                                placeholder="请输入更高为公共的测风塔号" />
                        </a-form-item>
                    </template>
                </a-form>
                <span class="memo-tip" v-if="tipModalType == 'common'">说明：原数据不会做变更调整</span>
            </template>
        </tips-modal>
        <!-- 核对数据 -->
        <tips-modal :width="'490px'" :tipType="'success'" class="tip-content-modal" :okText="'确定'"
            :openTipsModal.sync="checkTipsOpenModal" @handleChangeFileModal="handleChangeCheckModal">
            <template #customTitle>{{ tipTitle }}</template>
            <template #contentBody>
                <a-form :colon="false" class="sort-form" ref="checkFormRef" :rules="rules" :model="checkFormData"
                    :labelCol="checkLabelCol" labelAlign="left">
                    <a-form-item label="测风塔编号" name="windTowerCode">
                        <a-input style="width: 344px" disabled v-model:value="checkFormData.windTowerCode"
                            placeholder="请输入测风塔编号" />
                    </a-form-item>
                    <a-form-item label="测风塔号" name="windTowerSeq">
                        <a-input style="width: 344px" v-model:value.trim="checkFormData.windTowerSeq" placeholder="请输入测风塔编号" />
                    </a-form-item>
                    <a-row>
                        <a-col :span="15">
                            <a-form-item label="经纬度" name="lat">
                                <a-input-number style="width: 162px;margin-right: 14px;" max="135.05" min="73.33"
                                    :controls="false" v-model:value.trim="checkFormData.lat" placeholder="请输入经度" />
                            </a-form-item></a-col>
                        <a-col :span="9">
                            <a-form-item label="" name="lng">
                                <a-input-number style="width: 162px" max="53.33" min="3.51" :controls="false"
                                    v-model:value.trim="checkFormData.lng" placeholder="请输入纬度" />
                            </a-form-item></a-col>
                    </a-row>
                    <a-form-item label="海拔" name="elevation">
                        <a-input style="width: 344px" :controls="false" v-model:value.trim="checkFormData.elevation"
                            placeholder="请输入海拔" suffix="m">
                        </a-input>
                    </a-form-item>
                    <a-form-item label="原始文件" name="rawFile	">
                        <Upload :defaultFiles="checkFormData.rawFile || []" :fileTypes="'txt'" :fileSize="500" :maxCount="1"
                            fileTypeMessage="请选择正确的文件类型" fileSizeMessage="请选择大小限制的"
                            @upFileList="(val) => getUploadFile(val, 'rawFile')">
                            <template #tip>
                                <div class="tip">目前支持 txt格式，<br />
                                    最多上传一个文件，单文件最大100M。</div>
                            </template>
                        </Upload>
                    </a-form-item>
                    <a-form-item label="插补后文件" name="repairFile">
                        <Upload :defaultFiles="checkFormData.repairFile" :fileTypes="'txt'" :fileSize="500"
                            :maxCount="1" fileTypeMessage="请选择正确的文件类型" fileSizeMessage="请选择大小限制的"
                            @upFileList="(val) => getUploadFile(val, 'repairFile')">
                            <template #tip>
                                <div class="tip">目前支持 txt格式，<br />
                                    最多上传一个文件，单文件最大100M。</div>
                            </template>
                        </Upload>
                    </a-form-item>
                </a-form>
            </template>
        </tips-modal>
        <!-- 重新计算 -->
        <tips-modal :width="'490px'" :tipType="'success'" class="tip-content-modal" :okText="'确定'"
            :openTipsModal.sync="recalculateTipsOpenModal" @handleChangeFileModal="handleChangeRecalculateModal">
            <template #customTitle>{{ tipTitle }}</template>
            <template #contentBody>
                <a-form :colon="false" class="sort-form" ref="recalculateFormRef" :rules="rules"
                    :model="recalculateFormData" :labelCol="checkLabelCol" labelAlign="left">
                    <a-form-item label="关联项目" name="project">
                        <a-select style="width: 344px" class="select-address" v-model:value="recalculateFormData.project"
                            placeholder="请选择关联项目">
                            <a-select-option :value="0">全部状态</a-select-option>
                            <a-select-option :value="1">已配置</a-select-option>
                            <a-select-option :value="2">未配置</a-select-option>
                        </a-select>
                    </a-form-item>
                    <a-form-item name="windTowerData">
                        <template #label>
                            <span class="special-label">关联测风塔<br />数据</span>
                        </template>
                        <a-select v-model:value="recalculateFormData.windTowerData" mode="multiple" label-in-value
                            placeholder="选择关联测风塔数据" style="width: 344px" :filter-option="false"
                            :not-found-content="state.fetching ? undefined : null" :options="state.data"
                            @search="fetchUser">
                            <template v-if="state.fetching" #notFoundContent>
                                <a-spin size="small" />
                            </template>
                        </a-select>
                    </a-form-item>
                    <a-form-item name="mesoscaleData">
                        <template #label>
                            <span class="special-label">关联中尺度<br />数据</span>
                        </template>
                        <a-input style="width: 344px" v-model:value="recalculateFormData.mesoscaleData"
                            placeholder="请输入关联中尺度数据" />
                    </a-form-item>
                </a-form>
            </template>
        </tips-modal>

    </div>
</template>

<script setup>
import { debounce } from 'lodash-es';
import { ref, reactive, watch, onMounted, onBeforeUnmount, computed, onActivated, onDeactivated} from 'vue';
import { useRoute, useRouter } from 'vue-router';
import TableList from '@/components/tableList/TableList.vue';
import { WIND_TOWER_TABLE_LIST_CLOUMN } from '../windTower';
import TipsModal from '@/components/tipsDialog/TipsModal.vue';
import Upload from '@/components/upload/Upload.vue';
import {isAltitude } from '@/utils/regular'
import mitt from '@/utils/eventBus';
import _ from 'lodash';
import {getWindTowerList,checkWindTowerDetail,submitCheckWindTower} from '@/api/modules/commonDataManage'
import  {removeEmpty} from '../../commonData'
import {conversionTime} from '@/utils/conversionTime.js'
const props = defineProps({

});

const router = useRouter();

const clomun = ref(_.cloneDeep(WIND_TOWER_TABLE_LIST_CLOUMN));
const searchKey = ref({});
const loading = ref(false);
const dataList  = ref([])

onMounted(async()=> {
    initMitt()
})
onActivated(()=> {
    initMitt()
})
onBeforeUnmount(() => {
    deletMitt()
}),
onDeactivated(()=> {
    deletMitt()
})
const initMitt =()=> {
    mitt.on('handleSearch',(val)=>{
        searchKey.value = val
        handleSearch(val);
    });
    mitt.on('resetSearch', (val) => {
        searchKey.value = val
       resetSearch(val);
    });
    mitt.on('uploadList',()=>{
        handleSearch(searchKey.value);
    });
}
const deletMitt =()=> {
    mitt.off('handleSearch');
    mitt.off('resetSearch');
    mitt.off('uploadList');
}
const page = ref({
    pageNo: 1,
    pageSize: 10,
    total: 0,
});
const checkTipsOpenModal = ref(false);
const checkFormRef = ref(null);
const checkFormData = ref({
    windTowerCode: '',
    windTowerSeq: '',
    lat: '',
    lng: '',
    elevation: '',
    rawFile	: [],
    repairFile: []
});
const checkLabelCol = {
    style: {
        width: '90px',
        marginRight: '6px',
    },
};

// 搜索
const handleSearch = (val) => {
    console.log(val);
    page.value.pageNo = 1;
    page.value.pageSize = 10;
    getTableData(val);
};
// 重置
const resetSearch = (val) => {
    page.value.pageNo = 1;
    page.value.pageSize = 10;
    handleSearch(val);
};
// 获取表格数据
const getTableData = async (val) => {
    loading.value = true;
    let searchData = {
        ...val,
        provinceCode: val.areaCode?.length > 0 ? val.areaCode[0] : '',
        cityCode: val.areaCode?.length > 1 ? val.areaCode[1] : '',
        districtCode: val.areaCode?.length > 2 ? val.areaCode[2] : '',
        pageNo: page.value.pageNo,
        pageSize: page.value.pageSize,
    }
    searchData.modeType = ''
    searchData.areaCode = ''
    let data = removeEmpty(searchData)
    try {
        loading.value = false;
        let res = await getWindTowerList(data)
        console.log('测风塔列表',res);
        if(res?.code === 200){
            dataList.value = res.data.list.map((item, index) => {
                return {
                    ...item,
                    rawTime: conversionTime(item.rawFirstTime) + '~' + conversionTime(item.rawLastTime),
                    updateTime: conversionTime(item.updateTime),
                    projectCode: item.projectCode?.split(','),
                }
            });
            page.value.total = res.data.total
        }
    }
    catch (error) {
        loading.value = false;
        dataList.value = [];
        page.value.total = 0;
    }
    console.log('page',page.value);
    
};
// 表格
const getRowData = (row) => {
    router.push({
        path: '/windTower/detail',
        query: {
            id: row.windTowerId,
        },
    });
    console.log('点击行', row);
};
// 获取页面分页
const changePage = (val) => {
    page.value.pageNo = val.page;
    page.value.pageSize = val.pageSize;
    getTableData(searchKey.value);
};
// 核对、编辑
const editFile = (val) => {
    tipTitle.value = '核对数据';
    checkTipsOpenModal.value = true;
    getCheckDetail(val.windTowerId)
};

// 获取核对详情数据
const getCheckDetail = async (val) => {
    let res = await checkWindTowerDetail(val);
    if (res?.code === 200) {
        // 转换 rawFile：如果是对象且有 objectKey，转为数组；否则空数组
        const rawFile = res.data.rawFile && typeof res.data.rawFile === 'object' && !Array.isArray(res.data.rawFile) 
            ? [{ filePath: res.data.rawFile.objectKey, fileName: res.data.rawFile.filename }] 
            : [];
        // 类似处理 repairFile（如果后端返回的是对象，同样处理；目前看是数组）
        const repairFile = Array.isArray(res.data.repairFile) ? res.data.repairFile : [];
        checkFormData.value = {
            ...res.data,
            rawFile: rawFile,
            repairFile: repairFile
        };
    }
}
// 校验海拔高度
const checkAltitude = (rule, value, callback) => {
    if (!value) {
        return  Promise.reject('请输入海拔');
    }
    if(isAltitude(value)){
        return Promise.resolve();
    }else{
        return Promise.reject('请输入正确的海拔');
    }
}
const rules = {
    windTowerCode: [{ required: true, ElMessage: '请输入测风塔编号', trigger: 'blur' }],
    windTowerSeq: [{ required: true, ElMessage: '请输入测风塔号', trigger: 'blur' }],
    lat: [{ required: true, ElMessage: '请输入经度', trigger: 'blur' }],
    lng: [{ required: true, ElMessage: '请输入纬度', trigger: 'blur' }],
    elevation: [{ required: true, trigger: 'blur',validator: checkAltitude }],
    rawFile	: [{ required: true, ElMessage: '请上传原始文件', trigger: 'blur' }],
    repairFile: [{ required: false, ElMessage: '请上传插补后文件', trigger: 'blur' }],
    project: [{ required: true, ElMessage: '请选择关联项目', trigger: 'blur' }],
    windTowerData: [{ required: true, ElMessage: '请输入关联测风塔数据', trigger: 'blur' }],
    mesoscaleData: [{ required: true, ElMessage: '请输入关联中尺度数据', trigger: 'blur' }],
};
// 获取原始文件
const getUploadFile = (val, type) => {
    type === 'rawFile' ? checkFormData.value.rawFile	 =[val]
        : checkFormData.value.repairFile = [val];
    checkFormRef.value.validateFields([type])
}
// 校验数据的格式


const handleChangeCheckModal = (val) => {
  if (val) {
    checkFormRef.value
      .validateFields()
      .then(() => {
        submitCheckFile();
      })
      .catch((error) => {
        console.log('错误', error);
      });
  } else {
    // 安全重置，防止表单未渲染报错
    if (checkFormRef.value) {
      checkFormRef.value.resetFields();
    }
    checkTipsOpenModal.value = false; // ✅ 直接关闭
  }
};



const submitCheckFile = async () => {
    let data  = {
        ...checkFormData.value,
        rawFile: checkFormData.value.rawFile.length > 0 ? checkFormData.value.rawFile[0]['filePath']:'',
        repairFile: checkFormData.value.repairFile.length > 0 ? checkFormData.value.repairFile[0]['filePath']: ''
    }  
    let res = await submitCheckWindTower(data); // 注意加上 await
  if (res?.code === 200) {
    if (checkFormRef.value) {
      checkFormRef.value.resetFields();
    }
    checkTipsOpenModal.value = false; // ✅ 直接关闭
    // 可能还需要刷新列表，您可自行添加
    handleSearch(searchKey.value);
  }
};
// 转化公共
const getCommon = (val) => {
    tipModalType.value = 'common';
    tipTitle.value = '转化公共';
    contentTip.value = '确定将该测风塔数据复制一份到公共数据中么';
    openTipsOpenModal.value = !openTipsOpenModal.value;
    console.log('转化公共', val);
};

// 重新计算
const recalculate = (val, type) => {
    tipTitle.value = '重新计算';
    recalculateTipsOpenModal.value = !recalculateTipsOpenModal.value;
    console.log(type, '重新计算', val);
};
const recalculateTipsOpenModal = ref(false);
const recalculateFormRef = ref(null);
const recalculateFormData = ref({
    project:null,
    windTowerData: [],
    mesoscaleData: ''
})
// 下拉框实时搜索
const state = reactive({
    data: [],
    value: [],
    fetching: false,
});
let lastFetchId = 0;
watch(() => recalculateFormData.value, () => {
    state.data = [];
    state.fetching = false;
});
const fetchUser = debounce(value => {
    console.log('fetching user', value);
    lastFetchId += 1;
    const fetchId = lastFetchId;
    state.data = [];
    state.fetching = true;
    fetch('https://randomuser.me/api/?results=5')
        .then(response => response.json())
        .then(body => {
            if (fetchId !== lastFetchId) {
                // for fetch callback order
                return;
            }
            const data = body.results.map(user => ({
                label: `${user.name.first} ${user.name.last}`,
                value: user.login.username,
            }));
            state.data = data;
            state.fetching = false;
        });
}, 300);
const handleChangeRecalculateModal = (val) => {
  if (val) {
    recalculateFormRef.value
      .validateFields()
      .then(() => {
        submitRecalculateFile();
        // 在 submitRecalculateFile 内关闭
      })
      .catch((error) => {
        console.log('错误', error);
      });
  } else {
    // 取消
    if (recalculateFormRef.value) {
      recalculateFormRef.value.resetFields();
    }
    recalculateTipsOpenModal.value = false;
  }
};
const submitRecalculateFile = () => {
    console.log('提交', recalculateFormData.value);
    recalculateFormRef.value.resetFields();
    recalculateTipsOpenModal.value = !recalculateTipsOpenModal.value;
}
// 删除
const openTipsPowerModal = ref(false);
const tipTitle = ref('');
const deleteFile = (val) => {
    console.log('删除', val);
    openTipsPowerModal.value = !openTipsPowerModal.value;
    tipTitle.value = '删除提示';
};
// 关闭弹窗
const handleChangeClose = (val) => {
  if (val) {
    confirmDelete(); // 执行删除操作
  }
  openTipsPowerModal.value = false; // ✅ 直接关闭
};
// 确认删除
const confirmDelete = () => {
    console.log('确认删除');
};
// 开放、禁用
const tipModalType = ref('');
const contentTip = ref('');
const openTipsOpenModal = ref(false);
const openFormRef = ref(null);
const openFormData = ref({
    currentTowerNo: '0047#',
    windTowerSeq: '',
    reason: '',
});
const labelCol = {
    style: {
        width: '50px',
        marginRight: '6px',
    },
};
// 禁用
const disableFile = (val) => {
    contentTip.value = '确定将该数据置为禁用状态么？';
    openTipsOpenModal.value = !openTipsOpenModal.value;
    tipModalType.value = 'disable';
    tipTitle.value = '禁用提示';
    console.log('禁用', val);
};
// 置为开放
const openFile = (val) => {
    contentTip.value = '确定将该数据置为开放状态么？';
    openTipsOpenModal.value = !openTipsOpenModal.value;
    tipModalType.value = 'open';
    tipTitle.value = '开放提示';
    console.log('置为开放', val);
};
// 关闭
const handleChangeOpenModal = (val) => {
  if (val) {
    openFormRef.value
      .validateFields()
      .then(() => {
        submitOpenFile(tipModalType.value);
      })
      .catch((error) => {
        console.log('错误', error);
      });
  } else {
    if (openFormRef.value) {
      openFormRef.value.resetFields();
    }
    openTipsOpenModal.value = false; // ✅
  }
};
// 提交状态修改

const submitOpenFile = (type) => {
  // 执行提交逻辑（这里只是模拟）
  console.log('submitOpenFile', type);
  // 成功后关闭
  if (openFormRef.value) {
    openFormRef.value.resetFields();
  }
  openTipsOpenModal.value = false; // ✅
};
defineExpose({
})
</script>
<style scoped lang="scss">
@import '@/assets/css/tabs.scss';

.tip {
    font-size: 12px;
    font-family: PingFangSC, PingFang SC;
    color: #7C8294;
    line-height: 20px;
}
.current-tower-no{
    height: 12px;
    font-size: 14px;
    color: #363B4D;
    margin-bottom: 20px;
    line-height: 12px;
    span: {
        margin-left: 10px
    };
}

.special-label {
    font-size: 14px;
    line-height: 16px;
    color: #5C6170;
}

.wind-tower-list {
    :deep(.ant-form-item .ant-form-item-label >label) {
        color: #5C6170
    }
}

.tuning-tip {
    display: flex;
    padding: 8px 0 5px 0;
    background: #FEF1DF;
    border-radius: 4px;
    margin-bottom: 20px;

    .success {
        color: #FE830F;
        margin: 0 9px 0 12px;
    }

    .tuning-tip-title {
        font-size: 14px;
        color: #21263F;
        line-height: 22px;
    }

    .memo-tip {
        font-size: 12px;
        font-family: PingFangSC, PingFang SC;
        font-weight: 400;
        color: #7C8294;
        line-height: 12px;
    }
}
</style>
