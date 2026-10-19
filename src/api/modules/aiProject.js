import { publicService4 } from '@/api/base';

// ==================== 报告中心 ====================

// 上传报告并提交三方解析
export async function uploadReport(data) {
  return await publicService4.post('/ai/ai-project/report/upload', data);
}

// 报告统一分页
export async function pageReport(data) {
  return await publicService4.post('/ai/ai-project/report/page', data);
}

// 报告统一详情
export async function getReportDetail(id) {
  return await publicService4.get(`/ai/ai-project/report/detail?id=${id}`);
}

// 编辑生成详情
export async function updateGenerateDetail(data) {
  return await publicService4.put('/ai/ai-project/report/generate-detail', data);
}

// 编辑上传解析详情
export async function updateUploadDetail(data) {
  return await publicService4.put('/ai/ai-project/report/upload-detail', data);
}

// 定稿（仅可研报告）
export async function finalizeReport(id) {
  return await publicService4.post(`/ai/ai-project/report/finalize?id=${id}`);
}

// 终止计算
export async function terminateCalculation(id) {
  return await publicService4.post(`/ai/ai-project/report/terminate-calculation?id=${id}`);
}

// 新增报告
export async function createReport(data) {
  return await publicService4.post('/ai/ai-project/report/create', data);
}

// 更新报告
export async function updateReport(data) {
  return await publicService4.put('/ai/ai-project/report/update', data);
}

// 删除报告
export async function deleteReport(id) {
  return await publicService4.post(`/ai/ai-project/report/delete?id=${id}`);
}

// 查询报告
export async function getReport(id) {
  return await publicService4.get(`/ai/ai-project/report/get?id=${id}`);
}

// 报告类型元数据
export async function getReportTypeMeta() {
  return await publicService4.get('/ai/ai-project/report/type-meta');
}

// 生成前表单 Schema
export async function getGenerateFormSchema(reportType) {
  return await publicService4.get(
    `/ai/ai-project/report/generate-form-schema?reportType=${encodeURIComponent(reportType)}`
  );
}

// 参数源候选列表
export async function getParamSourceCandidates(aiProjectId) {
  return await publicService4.get(
    `/ai/ai-project/report/param-source-candidates?aiProjectId=${aiProjectId}`
  );
}

// 获取公共参数
export async function getCommonParams(data) {
  return await publicService4.post('/ai/ai-project/report/common-params', data);
}

// 触发生成
export async function generateReport(data) {
  return await publicService4.post('/ai/ai-project/report/generate', data);
}

// 参数重处理
export async function reprocessReportParams(id) {
  return await publicService4.post(`/ai/ai-project/report/${id}/reprocess-params`);
}

// 获取调整后参数
export async function getReportParams(id) {
  return await publicService4.get(`/ai/ai-project/report/${id}/params`);
}

// 编辑小参数
export async function editReportParams(id, data) {
  return await publicService4.put(`/ai/ai-project/report/${id}/edit-params`, data);
}

// ==================== 生成任务 ====================

// 创建通用生成任务
export async function createFileGenerateTask(data) {
  return await publicService4.post('/api/fileGenerateTask/create', data);
}

// 按任务编号查询
export async function getFileGenerateTaskByTaskNo(taskNo) {
  return await publicService4.get(
    `/api/fileGenerateTask/getByTaskNo?taskNo=${encodeURIComponent(taskNo)}`
  );
}

// 重试失败任务
export async function retryFileGenerateTask(taskNo) {
  return await publicService4.post(
    `/api/fileGenerateTask/retry?taskNo=${encodeURIComponent(taskNo)}`
  );
}

// 生成任务分页
export async function pageFileGenerateTask(params = {}) {
  const query = new URLSearchParams();

  if (params.aiProjectId != null) query.append('aiProjectId', params.aiProjectId);
  if (params.projectFileId != null) query.append('projectFileId', params.projectFileId);
  if (params.generateType) query.append('generateType', params.generateType);
  if (params.status) query.append('status', params.status);
  if (params.pageNo != null) query.append('pageNo', params.pageNo);
  if (params.pageSize != null) query.append('pageSize', params.pageSize);

  const qs = query.toString();
  return await publicService4.get(`/api/fileGenerateTask/page${qs ? `?${qs}` : ''}`);
}

// 按项目文件 ID 查询任务列表
export async function listFileGenerateTaskByProjectFile(projectFileId) {
  return await publicService4.get(
    `/api/fileGenerateTask/list-by-project-file?projectFileId=${projectFileId}`
  );
}