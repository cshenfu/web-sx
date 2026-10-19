import { publicService2 } from '@/api/base';
// 定额目录列表
export function getQuotaCatalogList(params) {
    return publicService2.post('/admin-api/est/quota-catalog/list/page', params);
}
// 导入定额
export function importQuota(params) {
    return publicService2.post('/admin-api/est/quota/import', params,{__isModifyHeader:true});
}
// 查询定额分类树
export function getQuotaCategoryTree (quotaCatalogId) {
    return publicService2.get(`/admin-api/est/quota/getQuotaTree/${quotaCatalogId}`)
}
// 查询定额信息列表
export function getQuotaList(params) {
    return publicService2.post('/admin-api/est/quota/list/page', params);
}
// 查询定额详情
export function getQuotaDetail(quotaCatalogId,quotaCode) {
    return publicService2.get(`/admin-api/est/quota/getQuotaInfoById/${quotaCatalogId}/${quotaCode}`)
}
// 查询定额清单信息
export function getQuotaPriceByCode (quotaCatalogId,quotaCode,platformType) {
    return publicService2.get(`/admin-api/est/quota-price/getQuotaPriceByCode/${quotaCatalogId}/${quotaCode}/${platformType?platformType:2}`)
}
// 定额库分类新增
export function createQuotaCategory(data) {
    return publicService2.post('/admin-api/est/quota/create',data)
}
// 定额分类编辑
export function editQuotaCategory(params) {
    return publicService2.post('/admin-api/est/quota/update', params);
}
// 定额库分类删除
export function deleteQuotaCategory(id,platformType=2) {
    return publicService2.post(`/admin-api/est/quota/delete/${id}/${platformType}`)
}
// 删除定额
export function deleteQuota(id,platformType=2) {
    return publicService2.post(`/admin-api/est/quota/deleteQuota/${id}/${platformType}`)
}
// 定额新增
export function createQuota(data) {
    return publicService2.post('/admin-api/est/quota/createQuota',data)
}
// 定额详情
export function getQuotaInfo(id,platformType=2) {
    return publicService2.get(`/admin-api/est/quota/updateQuotaDetail/${id}/${platformType}`)
}
// 编辑定额
export function updateQuota(data) {
    return publicService2.post('/admin-api/est/quota/updateQuota',data)
}
// 定额编码查询定额系数
export function getQuotaCoefficient(quotaCatalogId,quotaCode) {
    return publicService2.get(`/admin-api/est/quota-factor/getQuotaFactorVOByCode/${quotaCatalogId}/${quotaCode}`)
}

// 查询基础单价列表
export function getBasePriceList(params) { 
    return publicService2.post('/admin-api/est/basic-unit-price/list/page', params);
}
// 导入基础单价数据
export function importBasePrice(params) {
    return publicService2.post ('/admin-api/est/basic-unit-price/import', params,{__isModifyHeader:true});
}
// 查询基础单价分类树
export function getBasicUnitPriceTree (quotaCatalogId,itemTypeCode) {
    return publicService2.get(`/admin-api/est/basic-unit-price/getBasicUnitPriceTree/${quotaCatalogId?quotaCatalogId:1}/${itemTypeCode?itemTypeCode:2}`)
}
// 查询基础单价列表
export function getBasicUnitPriceDetail (quotaCatalogId,unitPriceCode,platformType) {
    return publicService2.get(`/admin-api/est/basic-unit-price/detail/${quotaCatalogId}/${unitPriceCode}/${platformType?platformType:2}`)
}
// 查询定额编码查询单价清单
export function getBasicPriceInfoByCode(quotaCatalogId,unitPriceCode) {
    return publicService2.get(`/admin-api/est/price/getBasicPriceInfoByCode/${quotaCatalogId}/${unitPriceCode}`);
}
// 单价库分类编辑
export function editBasicPriceCategory(params) {
    return publicService2.post('/admin-api/est/basic-unit-price/update', params);
}
// 单价库分类新增
export function createPriceCategory(data) {
    return publicService2.post('/admin-api/est/basic-unit-price/create',data)
}
// 单价库分类删除
export function deletePriceCategory(id) {
    return publicService2.post(`/admin-api/est/basic-unit-price/delete/${id}`)
}
// 末级分类下新增基础单价
export function createUnitPrice(data) {
    return publicService2.post('/admin-api/est/basic-unit-price/createUnitPrice',data)
}
// 获取单价编辑详情
export function getUpdateDetail(id) {
    return publicService2.get(`/admin-api/est/basic-unit-price/updateDetail/${id}`)
}
// 编辑单价
export function updateUnitPrice(data) {
    return publicService2.post('/admin-api/est/basic-unit-price/updateUnitPrice',data)
}
// 删除基础单价
export function deleteUnitPrice(id){
    return publicService2.post(`/admin-api/est/basic-unit-price/deleteUnitPrice/${id}`)
}
// 查询基础单价分类树
export function getBasicPriceCategoryTree (quotaCatalogId,itemTypeCode,platformType) {
    return publicService2.get(`/admin-api/est/basic-unit-price/getBasicUnitPriceTree/${quotaCatalogId}/${itemTypeCode}/${platformType?platformType:2}`)
}

// 查询全国材料单价
export function getNationalMaterialPriceList(params) {
    return publicService2.post('/admin-api/est/nationalUnitMaterialPrice/getList', params);
}

// 取费管理分页列表
export function getTakeFeeList(params) { 
    return publicService2.post('/admin-api/est/feeManage/list/page', params);
}
// 获取取费管理下的所有数据
export function getTakeFeeItemAllList(feeManageId) { 
    return publicService2.get(`/admin-api/est/feeData/list/${feeManageId}`);
}
// 获取取费下详情树结构数据
export function getTakeFeeDetailTree(feeDataId) { 
    return publicService2.get(`/admin-api/est/feeDetail/list/tree/${feeDataId}`);
}


// 获取计算完成的可研项目列表
export function getDoneProject(params) { 
    return publicService2.post('/admin-api/wind/project/doneProject/page', params);
}


// 可研概算调整创建项目
export function reportEstAdjust(params) { 
    return publicService2.post('/admin-api/est/estimate-project/reportEstAdjust', params);
}